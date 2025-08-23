<template>
  <div class="neural-drum-machine">
    <div class="drum-machine-header">
      <h3>🎯 神经网络鼓机</h3>
      <p>AI 驱动的智能鼓机，创造独特的节拍模式</p>
    </div>
    
    <div class="drum-machine-container">
      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="control-group">
          <label>密度控制</label>
          <el-slider
            v-model="density"
            :min="0"
            :max="1"
            :step="0.01"
            show-input
            class="density-slider"
            @change="updatePattern"
          />
        </div>
        
        <div class="control-group">
          <label>速度 (BPM)</label>
          <el-slider
            v-model="tempo"
            :min="60"
            :max="200"
            :step="1"
            show-input
            class="tempo-slider"
            @change="updateTempo"
          />
        </div>
        
        <div class="control-group">
          <label>随机种子</label>
          <el-input-number
            v-model="seed"
            :min="1"
            :max="1000"
            @change="regeneratePattern"
            class="seed-input"
          />
        </div>
        
        <div class="control-buttons">
          <el-button
            type="primary"
            @click="togglePlayback"
            :class="{ 'playing': isPlaying }"
            class="play-btn"
          >
            {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
          </el-button>
          
          <el-button
            type="success"
            @click="regeneratePattern"
            class="regenerate-btn"
          >
            🔄 重新生成
          </el-button>
          
          <el-button
            type="warning"
            @click="clearPattern"
            class="clear-btn"
          >
            🗑️ 清除
          </el-button>
        </div>
      </div>
      
      <!-- 鼓机网格 -->
      <div class="drum-grid">
        <div class="grid-header">
          <div class="track-labels">
            <div class="track-label" v-for="track in tracks" :key="track.name">
              {{ track.name }}
            </div>
          </div>
        </div>
        
        <div class="grid-content">
          <div class="track" v-for="track in tracks" :key="track.name">
            <div class="track-name">{{ track.name }}</div>
            <div class="beat-cells">
              <div
                v-for="(beat, index) in track.beats"
                :key="index"
                :class="['beat-cell', { active: beat.active, current: currentBeat === index }]"
                @click="toggleBeat(track.name, index)"
              >
                <div class="beat-indicator"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 节拍指示器 -->
        <div class="beat-indicators">
          <div
            v-for="i in 16"
            :key="i"
            :class="['beat-marker', { current: currentBeat === i - 1 }]"
          >
            {{ i }}
          </div>
        </div>
      </div>
      
      <!-- 音频可视化 -->
      <div class="audio-visualization">
        <canvas ref="visualizationCanvas" class="visualization-canvas"></canvas>
      </div>
    </div>
    
    <!-- 状态信息 -->
    <div class="status-info">
      <div class="status-item">
        <span class="label">当前模式:</span>
        <span class="value">{{ currentPattern }}</span>
      </div>
      <div class="status-item">
        <span class="label">密度:</span>
        <span class="value">{{ Math.round(density * 100) }}%</span>
      </div>
      <div class="status-item">
        <span class="label">种子:</span>
        <span class="value">{{ seed }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式状态
const density = ref(0.5)
const tempo = ref(120)
const seed = ref(42)
const isPlaying = ref(false)
const currentBeat = ref(0)
const currentPattern = ref('标准节拍')

// 鼓机轨道
const tracks = ref([
  { name: '底鼓', beats: Array(16).fill().map(() => ({ active: false })) },
  { name: '军鼓', beats: Array(16).fill().map(() => ({ active: false })) },
  { name: '踩镲', beats: Array(16).fill().map(() => ({ active: false })) },
  { name: '开镲', beats: Array(16).fill().map(() => ({ active: false })) },
  { name: '高音鼓', beats: Array(16).fill().map(() => ({ active: false })) }
])

// 音频上下文和定时器
let audioContext = null
let playInterval = null
let audioNodes = new Map()

// 初始化
onMounted(() => {
  initAudioContext()
  generateInitialPattern()
})

onUnmounted(() => {
  cleanupAudio()
})

// 初始化音频上下文
function initAudioContext() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    createAudioNodes()
  } catch (error) {
    ElMessage.error('浏览器不支持音频API')
  }
}

// 创建音频节点
function createAudioNodes() {
  const frequencies = {
    '底鼓': 60,
    '军鼓': 200,
    '踩镲': 800,
    '开镲': 1000,
    '高音鼓': 150
  }
  
  tracks.value.forEach(track => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(frequencies[track.name], audioContext.currentTime)
    oscillator.type = track.name.includes('鼓') ? 'sine' : 'square'
    
    oscillator.start()
    
    audioNodes.set(track.name, { oscillator, gainNode })
  })
}

// 生成初始模式
function generateInitialPattern() {
  tracks.value.forEach(track => {
    track.beats.forEach((beat, index) => {
      // 基于密度和种子生成模式
      const randomValue = Math.random() * (1 + seed.value * 0.1)
      beat.active = randomValue < density.value
    })
  })
  updateCurrentPattern()
}

// 更新模式
function updatePattern() {
  tracks.value.forEach(track => {
    track.beats.forEach((beat, index) => {
      const randomValue = Math.random() * (1 + seed.value * 0.1)
      beat.active = randomValue < density.value
    })
  })
  updateCurrentPattern()
}

// 重新生成模式
function regeneratePattern() {
  seed.value = Math.floor(Math.random() * 1000) + 1
  updatePattern()
  ElMessage.success('模式已重新生成')
}

// 清除模式
function clearPattern() {
  tracks.value.forEach(track => {
    track.beats.forEach(beat => {
      beat.active = false
    })
  })
  currentPattern.value = '空白模式'
  ElMessage.info('模式已清除')
}

// 切换节拍
function toggleBeat(trackName, beatIndex) {
  const track = tracks.value.find(t => t.name === trackName)
  if (track) {
    track.beats[beatIndex].active = !track.beats[beatIndex].active
    updateCurrentPattern()
  }
}

// 切换播放状态
function togglePlayback() {
  if (isPlaying.value) {
    stopPlayback()
  } else {
    startPlayback()
  }
}

// 开始播放
function startPlayback() {
  if (!audioContext) return
  
  isPlaying.value = true
  currentBeat.value = 0
  
  const beatInterval = (60 / tempo.value) * 1000 / 4 // 16分音符
  
  playInterval = setInterval(() => {
    playCurrentBeat()
    currentBeat.value = (currentBeat.value + 1) % 16
  }, beatInterval)
  
  ElMessage.success('鼓机开始播放')
}

// 停止播放
function stopPlayback() {
  isPlaying.value = false
  currentBeat.value = 0
  
  if (playInterval) {
    clearInterval(playInterval)
    playInterval = null
  }
  
  ElMessage.info('鼓机已停止')
}

// 播放当前节拍
function playCurrentBeat() {
  tracks.value.forEach(track => {
    if (track.beats[currentBeat.value].active) {
      playSound(track.name)
    }
  })
}

// 播放声音
function playSound(trackName) {
  const audioNode = audioNodes.get(trackName)
  if (!audioNode) return
  
  const { gainNode } = audioNode
  
  // 设置音量包络
  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)
}

// 更新速度
function updateTempo() {
  if (isPlaying.value) {
    stopPlayback()
    startPlayback()
  }
}

// 更新当前模式名称
function updateCurrentPattern() {
  const activeBeats = tracks.value.reduce((total, track) => {
    return total + track.beats.filter(beat => beat.active).length
  }, 0)
  
  const totalBeats = tracks.value.length * 16
  const activePercentage = activeBeats / totalBeats
  
  if (activePercentage === 0) {
    currentPattern.value = '空白模式'
  } else if (activePercentage < 0.3) {
    currentPattern.value = '稀疏节拍'
  } else if (activePercentage < 0.6) {
    currentPattern.value = '中等密度'
  } else if (activePercentage < 0.8) {
    currentPattern.value = '密集节拍'
  } else {
    currentPattern.value = '极密集节拍'
  }
}

// 清理音频资源
function cleanupAudio() {
  if (playInterval) {
    clearInterval(playInterval)
  }
  
  audioNodes.forEach(({ oscillator, gainNode }) => {
    oscillator.stop()
  })
  
  if (audioContext) {
    audioContext.close()
  }
}

// 监听密度变化
watch(density, () => {
  updatePattern()
})
</script>

<style scoped>
.neural-drum-machine {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
}

.drum-machine-header {
  text-align: center;
  margin-bottom: 24px;
}

.drum-machine-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.4rem;
}

.drum-machine-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.drum-machine-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.density-slider,
.tempo-slider {
  width: 100%;
}

.seed-input {
  width: 100%;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.play-btn,
.regenerate-btn,
.clear-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
}

.play-btn.playing {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.drum-grid {
  position: relative;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.grid-header {
  margin-bottom: 16px;
}

.track-labels {
  display: flex;
  gap: 8px;
}

.track-label {
  width: 80px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
}

.grid-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.track {
  display: flex;
  align-items: center;
  gap: 12px;
}

.track-name {
  width: 80px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.beat-cells {
  display: flex;
  gap: 4px;
}

.beat-cell {
  width: 32px;
  height: 32px;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
  position: relative;
}

.beat-cell:hover {
  border-color: #007bff;
  transform: scale(1.05);
}

.beat-cell.active {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.beat-cell.current {
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.3);
}

.beat-cell.active.current {
  background: linear-gradient(135deg, #28a745, #20c997);
  border-color: #28a745;
}

.beat-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #007bff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.beat-cell.active .beat-indicator {
  opacity: 1;
  background: white;
}

.beat-indicators {
  display: flex;
  gap: 4px;
  margin-top: 16px;
  justify-content: center;
}

.beat-marker {
  width: 32px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.beat-marker.current {
  background: #28a745;
  color: white;
  transform: scale(1.1);
}

.audio-visualization {
  margin-top: 20px;
  height: 100px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.visualization-canvas {
  width: 100%;
  height: 100%;
}

.status-info {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.status-item .label {
  font-size: 0.8rem;
  color: #666;
}

.status-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .drum-machine-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .control-panel {
    order: 2;
  }
  
  .drum-grid {
    order: 1;
  }
  
  .beat-cell {
    width: 28px;
    height: 28px;
  }
  
  .track-name,
  .track-label {
    width: 70px;
    font-size: 0.8rem;
  }
}
</style>
