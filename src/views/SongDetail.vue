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
    <div class="right">
      <h2>{{ song.title }}</h2>
      <p>{{ song.artist }} - {{ song.album }}</p>
      <div
        class="lyric-scroll"
        ref="lyricContainer"
        v-if="parsedLyrics.length"
      >
        <div
          v-for="(line, idx) in parsedLyrics"
          :key="idx"
          :id="'lyric-line-' + idx"
          :class="['lyric-line', { active: idx === currentLine }]"
        >
          {{ line.text }}
        </div>
      </div>
      <pre class="lyric" v-else>{{ lyric || '歌词加载中...' }}</pre>
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
const lyric = ref('')
const parsedLyrics = ref([])
const currentLine = ref(0)
const audioRef = ref(null)
const lyricContainer = ref(null)

function parseLyric(lrc) {
  const lines = lrc.split('\n')
  const result = []
  const timeReg = /\[(\d{2}):(\d{2}\.\d{2})\]/
  for (const line of lines) {
    const match = line.match(timeReg)
    if (match) {
      const min = parseInt(match[1])
      const sec = parseFloat(match[2])
      const time = min * 60 + sec
      const text = line.replace(timeReg, '').trim()
      result.push({ time, text })
    }
  }
  return result
}

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

  // 获取歌词
  try {
    const lyricRes = await axios.get(`${BASE_URL}/lyric/${song.value.source_id}`)
    lyric.value = lyricRes.data.lyric
    parsedLyrics.value = parseLyric(lyric.value)
  } catch (e) {
    lyric.value = '暂无歌词'
    parsedLyrics.value = []
  }
})

// 歌词同步
function onTimeUpdate() {
  if (!parsedLyrics.value.length) return
  const current = audioRef.value.currentTime
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (
      current >= parsedLyrics.value[i].time &&
      (i === parsedLyrics.value.length - 1 || current < parsedLyrics.value[i + 1].time)
    ) {
      currentLine.value = i
      // 滚动到当前歌词
      nextTick(() => {
        const el = document.getElementById('lyric-line-' + i)
        if (el && lyricContainer.value) {
          lyricContainer.value.scrollTop = el.offsetTop - lyricContainer.value.offsetTop - 100
        }
      })
      break
    }
  }
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
.right {
  flex: 1;
}
.lyric-scroll {
  max-height: 400px;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
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