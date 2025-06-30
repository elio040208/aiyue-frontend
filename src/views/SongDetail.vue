<template>
  <div class="song-detail">
    <div class="left">
      <img v-if="song.cover_url" :src="song.cover_url" class="cover" />
      <audio
        v-if="audioUrl"
        controls
        :src="audioUrl"
        class="audio-player"
        ref="audioRef"
        @timeupdate="onTimeUpdate"
      ></audio>
    </div>
    <div class="right double-lyric">
      <!-- 歌曲基本信息，横跨两列 -->
      <div class="song-info-bar lyric-info-bar">
        <div class="info-meta">
          <div class="info-title">{{ song.title }}</div>
          <div class="info-artist">{{ song.artist }} <span v-if="song.album">- {{ song.album }}</span></div>
        </div>
        <el-button
          type="primary"
          class="ai-rewrite-btn-short"
          size="large"
          @click="showRewriteDialog = true"
          title="AI重写歌词"
        >
          <i class="el-icon-magic-stick" style="margin-right:6px;font-size:20px;"></i>
          AI重写
        </el-button>
      </div>
      <div class="lyric-cols">
        <div class="lyric-col">
          <div
            class="lyric-scroll"
            ref="originLyricContainer"
            v-if="originLyrics.length"
          >
            <div
              v-for="(line, idx) in originLyrics"
              :key="idx"
              :id="'origin-lyric-line-' + idx"
              :class="['lyric-line', { active: idx === currentLine }]"
            >
              {{ line.text }}
            </div>
          </div>
          <div v-else class="lyric">暂无歌词</div>
        </div>
        <div class="lyric-col">
          <div
            class="lyric-scroll"
            ref="rewriteLyricContainer"
            v-if="rewriteLyrics.length"
          >
            <div
              v-for="(line, idx) in rewriteLyrics"
              :key="idx"
              :id="'rewrite-lyric-line-' + idx"
              :class="['lyric-line', { active: idx === currentRewriteLine }]"
            >
              {{ line.text }}
            </div>
          </div>
          <div v-else class="lyric">暂无重写歌词</div>
        </div>
      </div>
      <el-dialog
        v-model="showRewriteDialog"
        title="重写歌词"
        width="350px"
        :close-on-click-modal="false"
      >
        <el-input
          v-model="instruction"
          placeholder="用更诗意的方式重写歌词"
          clearable
        />
        <template #footer>
          <el-button @click="showRewriteDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleRewrite"
            :loading="rewriteLoading"
          >确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { BASE_URL } from '../config'

const route = useRoute()
const song = ref({})
const audioUrl = ref('')
const originLyrics = ref([])
const rewriteLyrics = ref([])
const currentLine = ref(0)
const currentRewriteLine = ref(0)
const audioRef = ref(null)
const originLyricContainer = ref(null)
const rewriteLyricContainer = ref(null)
const instruction = ref('')
const showRewriteDialog = ref(false)
const rewriteLoading = ref(false)

onMounted(async () => {
  const id = route.params.id
  // 获取歌曲基本信息
  const res = await axios.get(`${BASE_URL}/songs/${id}`)
  song.value = res.data

  // 获取音频地址
  try {
    const audioRes = await axios.get(`${BASE_URL}/audio_url/${song.value.source_id}`)
    audioUrl.value = audioRes.data.audio_url
  } catch (e) {
    audioUrl.value = ''
  }

  // 获取原歌词（JSON），并将time转为秒
  try {
    const lyricRes = await axios.get(`${BASE_URL}/lyric/${song.value.source_id}`)
    originLyrics.value = (lyricRes.data.lyric || []).map(l => ({
      ...l,
      time: l.time ? toSeconds(l.time) : 0,
      timeStr: l.time // 保留原始字符串
    }))
  } catch (e) {
    originLyrics.value = []
  }
})

// 工具函数：将 "mm:ss.xx" 转为秒
function toSeconds(str) {
  if (!str) return 0
  const match = str.match(/(\d{2}):(\d{2}\.\d{2})/)
  if (!match) return 0
  return parseInt(match[1]) * 60 + parseFloat(match[2])
}

// 工具函数：将秒转为 "mm:ss.xx"
function toTimeStr(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = (sec % 60).toFixed(2).padStart(5, '0')
  return `${m}:${s}`
}

// 歌词同步
function onTimeUpdate() {
  if (!originLyrics.value.length) return
  const current = audioRef.value.currentTime
  // 原歌词同步
  for (let i = 0; i < originLyrics.value.length; i++) {
    if (
      current >= originLyrics.value[i].time &&
      (i === originLyrics.value.length - 1 || current < originLyrics.value[i + 1].time)
    ) {
      currentLine.value = i
      nextTick(() => {
        const el = document.getElementById('origin-lyric-line-' + i)
        if (el && originLyricContainer.value) {
          originLyricContainer.value.scrollTop = el.offsetTop - originLyricContainer.value.offsetTop - 100
        }
      })
      break
    }
  }
  // 重写歌词同步（假设时间戳与原歌词一致）
  for (let i = 0; i < rewriteLyrics.value.length; i++) {
    if (
      current >= rewriteLyrics.value[i].time &&
      (i === rewriteLyrics.value.length - 1 || current < rewriteLyrics.value[i + 1].time)
    ) {
      currentRewriteLine.value = i
      nextTick(() => {
        const el = document.getElementById('rewrite-lyric-line-' + i)
        if (el && rewriteLyricContainer.value) {
          rewriteLyricContainer.value.scrollTop = el.offsetTop - rewriteLyricContainer.value.offsetTop - 100
        }
      })
      break
    }
  }
}

// 重写歌词
async function rewriteLyric() {
  rewriteLoading.value = true
  try {
    const payload = {
      lyric: originLyrics.value.map(l => ({
        time: l.timeStr || toTimeStr(l.time),
        text: l.text
      })),
      instruction: instruction.value
    }
    const rewriteRes = await axios.post(`${BASE_URL}/rewrite_lyric`, payload)
    rewriteLyrics.value = (rewriteRes.data.result || []).map(l => ({
      ...l,
      time: l.time ? toSeconds(l.time) : 0
    }))
  } catch (e) {
    rewriteLyrics.value = []
  }
  rewriteLoading.value = false
}

// 弹窗确定按钮
async function handleRewrite() {
  await rewriteLyric()
  showRewriteDialog.value = false
}
</script>

<style scoped>
.song-detail {
  display: flex;
  gap: 32px;
  padding: 32px;
}
.left {
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cover {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 24px;
}
.audio-player {
  width: 100%;
}
.right.double-lyric {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}
.lyric-info-bar {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 20px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.06);
  /* 横跨两列 */
  width: 100%;
}
.lyric-cols {
  display: flex;
  flex-direction: row;
  gap: 24px;
  width: 100%;
}
.info-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 18px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
}
.info-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.info-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #222;
}
.info-artist {
  font-size: 1rem;
  color: #666;
  margin-top: 4px;
}
.ai-rewrite-btn-short {
  font-size: 16px;
  font-weight: bold;
  padding: 10px 22px;
  margin-left: 24px;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(64,158,255,0.16);
  display: flex;
  align-items: center;
  transition: background 0.3s;
}
.ai-rewrite-btn-short:hover {
  background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
  color: #fff;
}
.lyric-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.lyric-scroll {
  max-height: 400px;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  flex: 1;
}
.lyric-line {
  font-size: 1rem;
  color: #333;
  padding: 4px 0;
  transition: color 0.2s, font-weight 0.2s;
}
.lyric-line.active {
  color: #409eff;
  font-weight: bold;
  font-size: 1.1rem;
  background: #e6f7ff;
  border-radius: 4px;
}
.lyric {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  font-size: 1rem;
  color: #333;
}
</style>