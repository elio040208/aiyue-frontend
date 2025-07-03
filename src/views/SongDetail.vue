<template>
  <div class="song-detail">
    <div class="left">
      <div class="cover-container">
        <img v-if="song.cover_url" :src="song.cover_url" class="cover" />
        <div class="cover-overlay">
          <div class="vinyl-effect"></div>
        </div>
      </div>

      <div v-if="vocalUrl || accompanimentUrl" class="separate-select-bar">
        <AudioSelector
          v-model="selectedAudioType"
          :options="audioOptions"
          @change="onAudioTypeChange"
        />
      </div>

      <div class="audio-container">
        <audio
          v-if="audioUrl"
          controls
          :src="audioUrl"
          class="audio-player"
          ref="audioRef"
          @timeupdate="onTimeUpdate"
          @play="handlePlay('origin')"
        ></audio>
      </div>

      <el-button
        type="success"
        class="ai-separate-btn"
        size="large"
        :loading="separateLoading"
        @click="handleSeparate"
      >
        <i class="el-icon-headset"></i>
        <span>AI 智能分离</span>
        <div class="btn-glow"></div>
      </el-button>
    </div>

    <div class="right">
      <!-- 歌曲信息栏 -->
      <div class="song-info-section">
        <div class="song-info-card">
          <div class="info-content">
            <h1 class="song-title">{{ song.title }}</h1>
            <p class="song-meta">
              <span class="artist">{{ song.artist }}</span>
              <span v-if="song.album" class="album">{{ song.album }}</span>
            </p>
          </div>
          <el-button
            type="primary"
            class="ai-rewrite-btn"
            size="large"
            @click="showRewriteDialog = true"
            title="AI重写歌词"
          >
            <i class="el-icon-magic-stick"></i>
            <span>AI 重写</span>
            <div class="btn-glow"></div>
          </el-button>
        </div>
      </div>

      <!-- 歌词区域 -->
      <div class="lyrics-section">
        <div class="lyric-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              <i class="el-icon-document"></i>
              原始歌词
            </h3>
          </div>
          <div class="lyric-content">
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
                @click="seekToLine(idx)"
              >
                <span class="lyric-text">{{ line.text }}</span>
                <div class="lyric-indicator"></div>
              </div>
            </div>
            <div v-else class="empty-lyric">
              <i class="el-icon-document-remove"></i>
              <p>暂无歌词</p>
            </div>
          </div>
        </div>

        <div class="lyric-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              <i class="el-icon-magic-stick"></i>
              AI 重写歌词
            </h3>
          </div>
          <div class="lyric-content">
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
                <span class="lyric-text">{{ line.text }}</span>
                <div class="lyric-indicator"></div>
              </div>
            </div>
            <div v-else class="empty-lyric">
              <i class="el-icon-magic-stick"></i>
              <p>暂无重写歌词</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 重写对话框 -->
      <el-dialog
        v-model="showRewriteDialog"
        title="AI 歌词重写"
        width="420px"
        :close-on-click-modal="false"
        class="rewrite-dialog"
      >
        <div class="dialog-content">
          <div class="input-label">
            <i class="el-icon-edit"></i>
            <span>重写指令</span>
          </div>
          <el-input
            v-model="instruction"
            placeholder="例如：用更诗意的方式重写歌词..."
            clearable
            type="textarea"
            :rows="3"
            class="instruction-input"
          />
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showRewriteDialog = false" class="cancel-btn"
              >取消</el-button
            >
            <el-button
              type="primary"
              @click="handleRewrite"
              :loading="rewriteLoading"
              class="confirm-btn"
            >
              <i class="el-icon-check"></i>
              <span>开始重写</span>
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import AudioSelector from "../components/SelectorIcon.vue";
import { ref, onMounted, nextTick, watch, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { BASE_URL } from "../config";

const route = useRoute();
const song = ref({});
const audioUrl = ref("");
const originAudioUrl = ref("");
const vocalUrl = ref("");
const accompanimentUrl = ref("");
const selectedAudioType = ref("origin");
const audioRef = ref(null);
const separateLoading = ref(false);

const showRewriteDialog = ref(false);
const rewriteLoading = ref(false);
const instruction = ref("");

const originLyrics = ref([]);
const rewriteLyrics = ref([]);
const currentLine = ref(0);
const currentRewriteLine = ref(0);
const originLyricContainer = ref(null);
const rewriteLyricContainer = ref(null);

const audioOptions = computed(() => [
  {
    value: "origin",
    label: "原曲",
    icon: "music",
    disabled: false,
  },
  {
    value: "vocal",
    label: "人声",
    icon: "microphone",
    disabled: !vocalUrl.value,
  },
  {
    value: "acc",
    label: "伴奏",
    icon: "instrument",
    disabled: !accompanimentUrl.value,
  },
]);

onMounted(async () => {
  const id = route.params.id;
  // 获取歌曲基本信息
  const res = await axios.get(`${BASE_URL}/songs/${id}`);
  song.value = res.data;

  // 获取原曲音频
  try {
    const audioRes = await axios.get(
      `${BASE_URL}/audio_url/${song.value.source_id}`
    );
    originAudioUrl.value = audioRes.data.audio_url;
    audioUrl.value = originAudioUrl.value;
  } catch (e) {
    originAudioUrl.value = "";
    audioUrl.value = "";
  }

  // 获取人声和伴奏音频地址
  try {
    const audioRes = await axios.get(
      `${BASE_URL}/separate_audio/${song.value.source_id}`
    );
    vocalUrl.value = audioRes.data.vocal_path;
    accompanimentUrl.value = audioRes.data.accompaniment_path;
  } catch (e) {
    vocalUrl.value = "";
    accompanimentUrl.value = "";
  }

  // 获取原歌词
  try {
    const lyricRes = await axios.get(
      `${BASE_URL}/lyric/${song.value.source_id}`
    );
    originLyrics.value = (lyricRes.data.lyric || []).map((l) => ({
      ...l,
      time: l.time ? toSeconds(l.time) : 0,
      timeStr: l.time,
    }));
  } catch (e) {
    originLyrics.value = [];
  }
});

// 工具函数：将 "mm:ss.xx" 转为秒
function toSeconds(str) {
  if (!str) return 0;
  const match = str.match(/(\d{2}):(\d{2}\.\d{2})/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseFloat(match[2]);
}

// 工具函数：将秒转为 "mm:ss.xx"
function toTimeStr(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = (sec % 60).toFixed(2).padStart(5, "0");
  return `${m}:${s}`;
}

// 点击歌词跳转
function seekToLine(idx) {
  if (audioRef.value && originLyrics.value[idx]) {
    audioRef.value.currentTime = originLyrics.value[idx].time;
  }
}

// 歌词同步
function onTimeUpdate() {
  if (!originLyrics.value.length) return;
  const current = audioRef.value.currentTime;
  // 原歌词同步
  for (let i = 0; i < originLyrics.value.length; i++) {
    if (
      current >= originLyrics.value[i].time &&
      (i === originLyrics.value.length - 1 ||
        current < originLyrics.value[i + 1].time)
    ) {
      currentLine.value = i;
      nextTick(() => {
        const el = document.getElementById("origin-lyric-line-" + i);
        if (el && originLyricContainer.value) {
          originLyricContainer.value.scrollTop =
            el.offsetTop - originLyricContainer.value.offsetTop - 100;
        }
      });
      break;
    }
  }
  // 重写歌词同步（假设时间戳与原歌词一致）
  for (let i = 0; i < rewriteLyrics.value.length; i++) {
    if (
      current >= rewriteLyrics.value[i].time &&
      (i === rewriteLyrics.value.length - 1 ||
        current < rewriteLyrics.value[i + 1].time)
    ) {
      currentRewriteLine.value = i;
      nextTick(() => {
        const el = document.getElementById("rewrite-lyric-line-" + i);
        if (el && rewriteLyricContainer.value) {
          rewriteLyricContainer.value.scrollTop =
            el.offsetTop - rewriteLyricContainer.value.offsetTop - 100;
        }
      });
      break;
    }
  }
}

// 重写歌词
async function rewriteLyric() {
  rewriteLoading.value = true;
  try {
    const payload = {
      lyric: originLyrics.value.map((l) => ({
        time: l.timeStr || toTimeStr(l.time),
        text: l.text,
      })),
      instruction: instruction.value,
    };
    const rewriteRes = await axios.post(`${BASE_URL}/rewrite_lyric`, payload);
    rewriteLyrics.value = (rewriteRes.data.result || []).map((l) => ({
      ...l,
      time: l.time ? toSeconds(l.time) : 0,
    }));
  } catch (e) {
    rewriteLyrics.value = [];
  }
  rewriteLoading.value = false;
}

// 弹窗确定按钮
async function handleRewrite() {
  await rewriteLyric();
  showRewriteDialog.value = false;
}

// 切换音源
function onAudioTypeChange(val) {
  if (val === "origin") audioUrl.value = originAudioUrl.value;
  if (val === "vocal") audioUrl.value = vocalUrl.value;
  if (val === "acc") audioUrl.value = accompanimentUrl.value;
  // 切换时暂停并重置进度
  nextTick(() => {
    if (audioRef.value) {
      audioRef.value.pause();
      audioRef.value.currentTime = 0;
    }
  });
}

// 只允许一个音频播放
function handlePlay(type) {
  if (type !== "origin" && audioRef.value) audioRef.value.pause();
}

// AI分离人声和伴奏
async function handleSeparate() {
  if (!song.value.source_id) return;
  separateLoading.value = true;
  vocalUrl.value = "";
  accompanimentUrl.value = "";
  try {
    const res = await axios.post(
      `${BASE_URL}/separate_audio/${song.value.source_id}`
    );
    vocalUrl.value = res.data.vocal_path;
    accompanimentUrl.value = res.data.accompaniment_path;
  } catch (e) {
    vocalUrl.value = "";
    accompanimentUrl.value = "";
  }
  separateLoading.value = false;
}
</script>

<style scoped>
/* 主容器 */
.song-detail {
  display: flex;
  gap: 40px;
  padding: 40px;
  min-height: 100vh;

  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 左侧区域 */
.left {
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* 封面容器 */
.cover-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.cover-container:hover .cover {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-container:hover .cover-overlay {
  opacity: 1;
}

.vinyl-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.1) 40%);
}

/* 音频类型选择器 */
.separate-select-bar {
  width: 100%;
  margin: 8px 0;
}

.radio-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);
}

.radio-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.radio-btn.is-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 音频播放器容器 */
.audio-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.audio-player {
  width: 100%;
  height: 48px;
  filter: hue-rotate(200deg) saturate(1.2);
}

/* AI按钮 */
.ai-separate-btn {
  position: relative;
  width: 100%;
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 16px;
  background: linear-gradient(135deg, #a2b1fb 0%, #7472fe 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
}

.ai-separate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
}

.ai-separate-btn:active {
  transform: translateY(0);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s ease;
}

.ai-separate-btn:hover .btn-glow {
  left: 100%;
}

/* 右侧区域 */
.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 歌曲信息区域 */
.song-info-section {
  width: 100%;
}

.song-info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-content {
  flex: 1;
}

.song-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.song-meta {
  font-size: 1.2rem;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.artist {
  font-weight: 600;
  color: #475569;
}

.album {
  position: relative;
  padding-left: 20px;
}

.album::before {
  content: "•";
  position: absolute;
  left: 8px;
  color: #cbd5e0;
}

.ai-rewrite-btn {
  position: relative;
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 16px;
  background: linear-gradient(135deg, #a2b1fb 0%, #7472fe 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  box-shadow: 0 8px 32px rgba(79, 70, 229, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
}

.ai-rewrite-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(79, 70, 229, 0.6);
}

/* 歌词区域 */
.lyrics-section {
  display: flex;
  gap: 24px;
  flex: 1;
}

.lyric-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.panel-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lyric-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.lyric-scroll {
  flex: 1;
  max-height: 500px;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
}

.lyric-scroll::-webkit-scrollbar {
  width: 6px;
}

.lyric-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.lyric-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 3px;
}

.lyric-line {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.lyric-line:hover {
  background: rgba(102, 126, 234, 0.05);
  border-left-color: rgba(102, 126, 234, 0.3);
}

.lyric-line.active {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1),
    rgba(118, 75, 162, 0.1)
  );
  border-left-color: #667eea;
  color: #667eea;
  font-weight: 600;
  transform: translateX(8px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
}

.lyric-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
  color: #374151;
}

.lyric-line.active .lyric-text {
  color: #667eea;
  font-size: 1.1rem;
}

.lyric-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s ease;
  margin-left: 12px;
}

.lyric-line.active .lyric-indicator {
  background: #667eea;
  box-shadow: 0 0 12px rgba(102, 126, 234, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.empty-lyric {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #9ca3af;
  gap: 12px;
}

.empty-lyric i {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-lyric p {
  font-size: 1.1rem;
  margin: 0;
}

/* 对话框样式 */
.rewrite-dialog {
  border-radius: 20px;
  overflow: hidden;
}

.dialog-content {
  padding: 20px 0;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #374151;
}

.instruction-input {
  border-radius: 12px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
}

.cancel-btn {
  border-radius: 12px;
  padding: 12px 24px;
}

.confirm-btn {
  border-radius: 12px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .song-detail {
    flex-direction: column;
    gap: 32px;
  }

  .left {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .lyrics-section {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .song-detail {
    padding: 20px;
  }

  .song-title {
    font-size: 2rem;
  }

  .song-info-card {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>
