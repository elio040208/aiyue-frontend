<template>
    <div class="music-composer">
      <!-- 顶部标题区域 -->
      <div class="header-section">
        <div class="header-container">
                     <h1 class="page-title">古典音乐编曲创作</h1>
           <p class="page-subtitle">AI驱动的古典乐器合奏创作工具</p>
           <div class="title-decoration">
             <div class="music-note">🎹</div>
             <div class="music-note">🎻</div>
             <div class="music-note">🎵</div>
           </div>
        </div>
      </div>
  
      <!-- 主要创作区域 -->
      <div class="main-content">
        <div class="content-container">
          <!-- 左侧控制面板 -->
          <div class="control-panel">
            <el-card class="control-card">
              <template #header>
                                 <div class="card-header">
                   <h3>古典音乐控制</h3>
                   <div class="header-icon">🎼</div>
                 </div>
              </template>
              
              <!-- 节拍器设置 -->
              <div class="control-section">
                <h4 class="section-title">节拍器</h4>
                <div class="metronome-controls">
                  <div class="tempo-control">
                    <label>速度 (BPM)</label>
                                         <el-slider
                       v-model="tempo"
                       :min="40"
                       :max="160"
                       :step="1"
                       show-input
                       class="tempo-slider"
                     />
                  </div>
                  <div class="time-signature">
                    <label>拍号</label>
                    <div class="signature-inputs">
                      <el-input-number
                        v-model="timeSignature.beats"
                        :min="1"
                        :max="12"
                        size="small"
                      />
                      <span class="signature-divider">/</span>
                      <el-input-number
                        v-model="timeSignature.division"
                        :min="2"
                        :max="16"
                        size="small"
                      />
                    </div>
                  </div>
                  <el-button
                    :type="metronomeActive ? 'danger' : 'primary'"
                    @click="toggleMetronome"
                    class="metronome-btn"
                  >
                    {{ metronomeActive ? '停止节拍器' : '启动节拍器' }}
                  </el-button>
                </div>
              </div>
  
              <!-- 神经网络控制 -->
              <div class="control-section">
                <h4 class="section-title">AI 神经网络</h4>
                <div class="neural-controls">
                                     <div class="density-control">
                     <label>音符密度</label>
                     <el-slider
                       v-model="density"
                       :min="0"
                       :max="1"
                       :step="0.01"
                       show-input
                       class="density-slider"
                     />
                     <div class="density-info">
                       <span>稀疏音符</span>
                       <span>密集音符</span>
                     </div>
                   </div>
                  
                                     <div class="randomness-control">
                     <label>旋律变化</label>
                     <el-slider
                       v-model="randomness"
                       :min="0"
                       :max="1"
                       :step="0.01"
                       show-input
                       class="randomness-slider"
                     />
                     <div class="density-info">
                       <span>稳定旋律</span>
                       <span>变化旋律</span>
                     </div>
                   </div>
  
                                     <el-button
                     type="success"
                     @click="generatePattern"
                     :loading="generating"
                     class="generate-btn"
                   >
                     🎼 生成新旋律
                   </el-button>
                </div>
              </div>
  
              <!-- 录音控制 -->
              <div class="control-section">
                <h4 class="section-title">录音控制</h4>
                <div class="recording-controls">
                  <el-button
                    :type="isRecording ? 'danger' : 'success'"
                    @click="toggleRecording"
                    :loading="recordingLoading"
                    class="record-btn"
                  >
                    {{ isRecording ? '停止录音' : '开始录音' }}
                  </el-button>
                  <el-button
                    type="info"
                    @click="playRecording"
                    :disabled="!hasRecording"
                    class="play-btn"
                  >
                    播放录音
                  </el-button>
                  <el-button
                    type="warning"
                    @click="clearRecording"
                    :disabled="!hasRecording"
                    class="clear-btn"
                  >
                    清除录音
                  </el-button>
                </div>
              </div>
  
              <!-- 音色选择 -->
              <div class="control-section">
                <h4 class="section-title">音色选择</h4>
                <div class="instrument-selector">
                  <el-select v-model="selectedInstrument" class="instrument-select">
                    <el-option
                      v-for="instrument in instruments"
                      :key="instrument.value"
                      :label="instrument.label"
                      :value="instrument.value"
                    />
                  </el-select>
                </div>
              </div>
  
              <!-- 效果器 -->
              <div class="control-section">
                <h4 class="section-title">效果器</h4>
                <div class="effects-controls">
                  <div class="effect-item">
                    <label>混响</label>
                    <el-slider
                      v-model="effects.reverb"
                      :min="0"
                      :max="1"
                      :step="0.01"
                      class="effect-slider"
                    />
                  </div>
                  <div class="effect-item">
                    <label>延迟</label>
                    <el-slider
                      v-model="effects.delay"
                      :min="0"
                      :max="1"
                      :step="0.01"
                      class="effect-slider"
                    />
                  </div>
                  <div class="effect-item">
                    <label>失真</label>
                    <el-slider
                      v-model="effects.distortion"
                      :min="0"
                      :max="1"
                      :step="0.01"
                      class="effect-slider"
                    />
                  </div>
                </div>
              </div>
            </el-card>
          </div>
  
          <!-- 右侧鼓机网格区域 -->
          <div class="drum-machine-section">
            <el-card class="drum-machine-card">
              <template #header>
                                 <div class="card-header">
                   <h3>古典乐器网格</h3>
                   <div class="header-icon">🎹</div>
                 </div>
              </template>
              
              <div class="drum-machine-container">
                <!-- 鼓机网格 -->
                <div class="drum-grid">
                  <div class="grid-header">
                    <div class="track-labels">
                      <div class="track-label" v-for="track in drumTracks" :key="track.id">
                        {{ track.name }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid-content">
                    <div class="track-row" v-for="track in drumTracks" :key="track.id">
                      <div class="track-name">{{ track.name }}</div>
                      <div class="beat-cells">
                        <div
                          v-for="beat in totalBeats"
                          :key="beat"
                          :class="['beat-cell', { active: track.pattern[beat - 1] }]"
                          @click="toggleBeat(track.id, beat)"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 播放控制 -->
                <div class="playback-controls">
                  <div class="transport-controls">
                                         <el-button
                       type="primary"
                       size="large"
                       @click="playPattern"
                       :disabled="!hasPattern"
                       class="transport-btn"
                     >
                       ▶️ 播放音乐
                     </el-button>
                                         <el-button
                       type="warning"
                       size="large"
                       @click="pausePattern"
                       :disabled="!isPlaying"
                       class="transport-btn"
                     >
                       ⏸️ 暂停音乐
                     </el-button>
                     <el-button
                       type="info"
                       size="large"
                       @click="stopPattern"
                       :disabled="!isPlaying"
                       class="transport-btn"
                     >
                       ⏹️ 停止音乐
                     </el-button>
                  </div>
                  
                                     <div class="playback-info">
                     <div class="current-beat">当前拍: {{ currentBeat }}</div>
                     <div class="total-beats">总拍数: {{ totalBeats }}</div>
                     <div class="tempo-display">速度: {{ tempo }} BPM</div>
                   </div>
                  
                  <div class="volume-control">
                    <label>音量</label>
                    <el-slider
                      v-model="volume"
                      :min="0"
                      :max="1"
                      :step="0.01"
                      class="volume-slider"
                    />
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  
     // 响应式状态
   const tempo = ref(80) // 降低默认速度，让古典音乐更舒缓
  const timeSignature = ref({ beats: 4, division: 4 })
  const metronomeActive = ref(false)
  const isRecording = ref(false)
  const recordingLoading = ref(false)
  const hasRecording = ref(false)
  const isPlaying = ref(false)
  const currentBeat = ref(0)
  const volume = ref(0.8)
  const density = ref(0.5)
  const randomness = ref(0.3)
  const generating = ref(false)
  
  // 音色和效果器
  const selectedInstrument = ref('drums')
  const instruments = ref([
    { value: 'drums', label: '鼓组' },
    { value: 'electronic', label: '电子鼓' },
    { value: 'acoustic', label: '原声鼓' },
    { value: 'trap', label: '陷阱鼓' },
    { value: 'jazz', label: '爵士鼓' }
  ])
  
  const effects = ref({
    reverb: 0.3,
    delay: 0.2,
    distortion: 0
  })
  
  // 古典乐器轨道配置 - 使用更慢的节奏
  const drumTracks = ref([
    { id: 'piano', name: '钢琴', pattern: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], instrument: 'piano' },
    { id: 'violin', name: '小提琴', pattern: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], instrument: 'violin' },
    { id: 'flute', name: '长笛', pattern: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], instrument: 'flute' },
    { id: 'cello', name: '大提琴', pattern: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], instrument: 'cello' },
    { id: 'harp', name: '竖琴', pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], instrument: 'harp' },
    { id: 'clarinet', name: '单簧管', pattern: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], instrument: 'clarinet' }
  ])
  
  // 计算属性
  const totalBeats = computed(() => timeSignature.value.beats * 4)
  const hasPattern = computed(() => {
    return drumTracks.value.some(track => track.pattern.some(beat => beat === 1))
  })
  
  // 音频上下文和振荡器
  let audioContext = null
  let metronomeInterval = null
  let playbackInterval = null
  let recordingChunks = []
  let mediaRecorder = null
  
  // 初始化音频上下文
  onMounted(() => {
    initAudioContext()
    setupKeyboardListeners()
  })
  
  onUnmounted(() => {
    cleanupAudio()
    if (metronomeInterval) {
      clearInterval(metronomeInterval)
    }
    if (playbackInterval) {
      clearInterval(playbackInterval)
    }
  })
  
  // 初始化音频上下文
  function initAudioContext() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      ElMessage.error('浏览器不支持音频API')
    }
  }
  
  // 设置键盘监听器
  function setupKeyboardListeners() {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
  }
  
  // 处理键盘按下
  function handleKeyDown(event) {
    if (event.code === 'Space') {
      event.preventDefault()
      if (isPlaying.value) {
        pausePattern()
      } else {
        playPattern()
      }
    }
  }
  
  // 处理键盘释放
  function handleKeyUp(event) {
    // 键盘释放处理
  }
  
  // 切换节拍器
  function toggleMetronome() {
    if (metronomeActive.value) {
      stopMetronome()
    } else {
      startMetronome()
    }
  }
  
  // 启动节拍器
  function startMetronome() {
    metronomeActive.value = true
    const interval = (60 / tempo.value) * 1000
    
    metronomeInterval = setInterval(() => {
      playMetronomeClick()
    }, interval)
    
         ElMessage.success('节拍器已启动，保持稳定的音乐节奏')
  }
  
  // 停止节拍器
  function stopMetronome() {
    metronomeActive.value = false
    if (metronomeInterval) {
      clearInterval(metronomeInterval)
      metronomeInterval = null
    }
    ElMessage.info('节拍器已停止')
  }
  
  // 播放节拍器声音
  function playMetronomeClick() {
    if (!audioContext) return
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)
    
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.1)
  }
  
  // 生成新节奏 - 优化为古典音乐风格
  function generatePattern() {
    generating.value = true
    
    setTimeout(() => {
      drumTracks.value.forEach(track => {
        // 为不同乐器设置不同的密度
        let instrumentDensity = density.value
        if (track.instrument === 'harp') {
          instrumentDensity = density.value * 0.8 // 竖琴音符稍少
        } else if (track.instrument === 'cello') {
          instrumentDensity = density.value * 0.7 // 大提琴音符更少
        } else if (track.instrument === 'flute') {
          instrumentDensity = density.value * 0.6 // 长笛音符最少
        }
        
        track.pattern = track.pattern.map((beat, index) => {
          const random = Math.random()
          const densityThreshold = instrumentDensity
          const randomnessFactor = randomness.value
          
          // 避免连续音符，让旋律更自然
          if (index > 0 && track.pattern[index - 1] === 1) {
            if (random < 0.3) return 1 // 30%概率保持连续
            else return 0
          }
          
          if (random < densityThreshold * (1 - randomnessFactor)) {
            return 1
          } else if (random < densityThreshold) {
            return Math.random() > 0.5 ? 1 : 0
          } else {
            return 0
          }
        })
      })
      
      generating.value = false
      ElMessage.success('新的古典音乐节奏已生成！')
    }, 1000)
  }
  
  // 切换节拍
  function toggleBeat(trackId, beat) {
    const track = drumTracks.value.find(t => t.id === trackId)
    if (track) {
      track.pattern[beat - 1] = track.pattern[beat - 1] ? 0 : 1
    }
  }
  
  // 播放节奏 - 优化为古典音乐节奏
  function playPattern() {
    if (!hasPattern.value) return
    
    isPlaying.value = true
    currentBeat.value = 0
    
    // 使用8分音符间隔，让古典音乐听起来更舒缓
    const beatInterval = (60 / tempo.value) * 1000 / 2
    
    playbackInterval = setInterval(() => {
      currentBeat.value = (currentBeat.value % totalBeats.value) + 1
      
      // 播放当前拍的所有轨道
      drumTracks.value.forEach(track => {
        if (track.pattern[currentBeat.value - 1]) {
          playDrumSound(track.id)
        }
      })
    }, beatInterval)
    
    ElMessage.success('开始播放古典音乐')
  }
  
  // 暂停节奏
  function pausePattern() {
    isPlaying.value = false
    if (playbackInterval) {
      clearInterval(playbackInterval)
      playbackInterval = null
    }
         ElMessage.info('音乐已暂停')
  }
  
  // 停止节奏
  function stopPattern() {
    isPlaying.value = false
    currentBeat.value = 0
    if (playbackInterval) {
      clearInterval(playbackInterval)
      playbackInterval = null
    }
         ElMessage.info('音乐已停止')
  }
  
  // 播放古典乐器声音 - 优化音色
  function playDrumSound(trackId) {
    if (!audioContext) return
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()
    
    // 音频链: 振荡器 -> 滤波器 -> 增益 -> 输出
    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // 古典乐器配置 - 更柔和的音色
    const instrumentConfig = {
      piano: {
        frequency: 220, // A3
        type: 'triangle',
        filterType: 'lowpass',
        filterFreq: 800,
        attack: 0.02,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3
      },
      violin: {
        frequency: 440, // A4
        type: 'sine',
        filterType: 'lowpass',
        filterFreq: 1200,
        attack: 0.05,
        decay: 0.2,
        sustain: 0.8,
        release: 0.4
      },
      flute: {
        frequency: 880, // A5
        type: 'sine',
        filterType: 'lowpass',
        filterFreq: 2000,
        attack: 0.1,
        decay: 0.3,
        sustain: 0.9,
        release: 0.5
      },
      cello: {
        frequency: 110, // A2
        type: 'triangle',
        filterType: 'lowpass',
        filterFreq: 600,
        attack: 0.03,
        decay: 0.15,
        sustain: 0.75,
        release: 0.35
      },
      harp: {
        frequency: 330, // E4
        type: 'triangle',
        filterType: 'lowpass',
        filterFreq: 1000,
        attack: 0.01,
        decay: 0.05,
        sustain: 0.6,
        release: 0.2
      },
      clarinet: {
        frequency: 220, // A3
        type: 'sine',
        filterType: 'lowpass',
        filterFreq: 900,
        attack: 0.04,
        decay: 0.18,
        sustain: 0.8,
        release: 0.4
      }
    }
    
    const config = instrumentConfig[trackId] || instrumentConfig.piano
    
    // 设置振荡器
    oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime)
    oscillator.type = config.type
    
    // 设置滤波器 - 让声音更柔和
    filter.type = config.filterType
    filter.frequency.setValueAtTime(config.filterFreq, audioContext.currentTime)
    filter.Q.setValueAtTime(1, audioContext.currentTime)
    
    // 设置增益包络 - ADSR包络让声音更自然
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume.value * 0.4, now + config.attack)
    gainNode.gain.linearRampToValueAtTime(volume.value * 0.4 * config.sustain, now + config.attack + config.decay)
    gainNode.gain.linearRampToValueAtTime(0, now + config.attack + config.decay + config.release)
    
    oscillator.start()
    oscillator.stop(now + config.attack + config.decay + config.release)
  }
  
  // 切换录音
  async function toggleRecording() {
    if (isRecording.value) {
      stopRecording()
    } else {
      await startRecording()
    }
  }
  
  // 开始录音
  async function startRecording() {
    try {
      recordingLoading.value = true
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorder = new MediaRecorder(stream)
      recordingChunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        recordingChunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunks, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        localStorage.setItem('recording', url)
        hasRecording.value = true
        recordingLoading.value = false
        ElMessage.success('录音完成！')
      }
      
      mediaRecorder.start()
      isRecording.value = true
      recordingLoading.value = false
      ElMessage.info('开始录音...')
      
    } catch (error) {
      recordingLoading.value = false
      ElMessage.error('无法访问麦克风')
    }
  }
  
  // 停止录音
  function stopRecording() {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
      
      // 停止所有音轨
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
  }
  
  // 播放录音
  function playRecording() {
    const recordingUrl = localStorage.getItem('recording')
    if (recordingUrl) {
      const audio = new Audio(recordingUrl)
      audio.volume = volume.value
      audio.play()
      ElMessage.success('播放录音')
    }
  }
  
  // 清除录音
  function clearRecording() {
    const recordingUrl = localStorage.getItem('recording')
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl)
      localStorage.removeItem('recording')
      hasRecording.value = false
      ElMessage.info('录音已清除')
    }
  }
  
  // 清理音频资源
  function cleanupAudio() {
    if (audioContext) {
      audioContext.close()
    }
  }
  </script>
  
  <style scoped>
  .music-composer {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: white;
  }
  
  /* 头部样式 */
  .header-section {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .header-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .page-title {
    font-size: 3rem;
    font-weight: 700;
    color: white;
    margin: 0 0 16px 0;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }
  
  .page-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 24px 0;
  }
  
  .title-decoration {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  .music-note {
    font-size: 2rem;
    color: rgba(255, 255, 255, 0.8);
    animation: float 3s ease-in-out infinite;
  }
  
  .music-note:nth-child(2) {
    animation-delay: 1s;
  }
  
  .music-note:nth-child(3) {
    animation-delay: 2s;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  /* 主要内容区域 */
  .main-content {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .content-container {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 30px;
    margin-bottom: 30px;
  }
  
  /* 控制面板 */
  .control-panel {
    position: sticky;
    top: 20px;
    height: fit-content;
  }
  
  .control-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .card-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
  }
  
  .header-icon {
    font-size: 1.5rem;
  }
  
  .control-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .control-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .section-title {
    margin: 0 0 16px 0;
    color: #555;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  /* 节拍器控制 */
  .metronome-controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .tempo-control label,
  .time-signature label {
    display: block;
    margin-bottom: 8px;
    color: #666;
    font-weight: 500;
  }
  
  .tempo-slider {
    margin-top: 8px;
  }
  
  .signature-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .signature-divider {
    font-size: 1.2rem;
    color: #999;
    font-weight: bold;
  }
  
  .metronome-btn {
    width: 100%;
    height: 44px;
    font-weight: 600;
  }
  
  /* 录音控制 */
  .recording-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .record-btn,
  .play-btn,
  .clear-btn {
    width: 100%;
    height: 44px;
    font-weight: 600;
  }
  
  /* 音色选择 */
  .instrument-selector {
    margin-top: 12px;
  }
  
  .instrument-select {
    width: 100%;
  }
  
  /* 效果器控制 */
  .effects-controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .effect-item label {
    display: block;
    margin-bottom: 8px;
    color: #666;
    font-weight: 500;
  }
  
  .effect-slider {
    margin-top: 8px;
  }
  
  /* 钢琴区域 */
  .piano-section {
    min-height: 600px;
  }
  
  .piano-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    height: 100%;
  }
  
  .piano-container {
    padding: 20px 0;
  }
  
  /* 钢琴键盘 */
  .piano-keyboard {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 300px;
    margin-bottom: 30px;
    position: relative;
  }
  
  .piano-key {
    position: relative;
    cursor: pointer;
    transition: all 0.1s ease;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 20px;
    font-weight: 600;
    user-select: none;
  }
  
  .piano-key.white {
    width: 60px;
    height: 280px;
    background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%);
    border: 1px solid #ddd;
    border-radius: 0 0 8px 8px;
    color: #333;
    margin: 0 1px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .piano-key.black {
    width: 40px;
    height: 180px;
    background: linear-gradient(180deg, #333 0%, #000 100%);
    color: white;
    margin: 0 -20px;
    z-index: 2;
    border-radius: 0 0 6px 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .piano-key.white:hover {
    background: linear-gradient(180deg, #f0f0f0 0%, #e8e9ea 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  .piano-key.black:hover {
    background: linear-gradient(180deg, #444 0%, #222 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
  
  .piano-key.active {
    transform: translateY(2px);
  }
  
  .piano-key.white.active {
    background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .piano-key.black.active {
    background: linear-gradient(180deg, #555 0%, #333 100%);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .key-label {
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  /* 键盘帮助 */
  .keyboard-help {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
  }
  
  .keyboard-help p {
    margin: 0 0 16px 0;
  }
  
  .key-mappings {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  
  .key-mapping {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
  }
  
  kbd {
    background: #f1f3f4;
    border: 1px solid #dadce0;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.75rem;
    font-family: monospace;
    color: #5f6368;
  }
  
  /* 播放控制区域 */
  .playback-section {
    margin-top: 30px;
  }
  
  .playback-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .playback-controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }
  
  .control-group {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .control-label {
    font-weight: 600;
    color: #333;
    min-width: 80px;
  }
  
  .tempo-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .tempo-slider {
    width: 200px;
  }
  
  .tempo-display {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 600;
    color: #495057;
    min-width: 80px;
    text-align: center;
  }
  
  .playback-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .control-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }
  
  .play-btn {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  }
  
  .play-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
  }
  
  .stop-btn {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  }
  
  .stop-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
  }
  
  .record-btn {
    background: linear-gradient(135deg, #fd7e14, #e55a00);
    color: white;
    box-shadow: 0 4px 15px rgba(253, 126, 20, 0.3);
  }
  
  .record-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(253, 126, 20, 0.4);
  }
  
  .record-btn.recording {
    background: linear-gradient(135deg, #dc3545, #c82333);
    animation: pulse 1s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .clear-btn {
    background: linear-gradient(135deg, #6c757d, #495057);
    color: white;
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
  }
  
  .clear-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  }
  
  .control-btn:active {
    transform: translateY(0);
  }
  
  .control-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  /* 录音区域 */
  .recording-section {
    margin-top: 30px;
  }
  
  .recording-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .recording-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 0 24px;
  }
  
  .recording-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .recording-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #666;
  }
  
  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #6c757d;
  }
  
  .status-indicator.recording {
    background: #dc3545;
    animation: pulse 1s infinite;
  }
  
  .recording-controls {
    padding: 24px;
  }
  
  .recording-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
  }
  
  .recording-time {
    font-size: 1.1rem;
    font-weight: 600;
    color: #495057;
  }
  
  .recording-duration {
    font-size: 0.9rem;
    color: #6c757d;
  }
  
  .recording-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .action-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
  }
  
  .save-btn {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
  }
  
  .save-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }
  
  .delete-btn {
    background: linear-gradient(135deg, #6c757d, #495057);
    color: white;
  }
  
  .delete-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .composer-container {
      padding: 20px;
    }
    
    .composer-header h1 {
      font-size: 1.8rem;
    }
    
    .composer-header p {
      font-size: 1rem;
    }
    
    .piano-container {
      padding: 20px;
    }
    
    .piano-keyboard {
      gap: 2px;
    }
    
    .piano-key.white {
      width: 30px;
      height: 200px;
    }
    
    .piano-key.black {
      width: 24px;
      height: 120px;
      margin: 0 -12px;
    }
    
    .control-group {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .tempo-slider {
      width: 100%;
      max-width: 200px;
    }
    
    .playback-buttons {
      justify-content: center;
    }
    
    .recording-actions {
      justify-content: center;
    }
  }
  
  @media (max-width: 480px) {
    .composer-container {
      padding: 16px;
    }
    
    .composer-header h1 {
      font-size: 1.5rem;
    }
    
    .piano-container {
      padding: 16px;
    }
    
    .piano-key.white {
      width: 24px;
      height: 160px;
    }
    
    .piano-key.black {
      width: 18px;
      height: 100px;
      margin: 0 -9px;
    }
    
    .control-btn {
      padding: 10px 16px;
      font-size: 0.8rem;
    }
    
    .action-btn {
      padding: 8px 14px;
      font-size: 0.8rem;
    }
  }
  
  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* 加载动画 */
  .loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 工具提示 */
  .tooltip {
    position: relative;
    display: inline-block;
  }
  
  .tooltip .tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -100px;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.8rem;
  }
  
  .tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }
  
  /* 成功/错误消息 */
  .message {
    padding: 12px 20px;
    border-radius: 8px;
    margin: 16px 0;
    font-weight: 500;
  }
  
  .message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .message.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
  
  /* 鼓机样式 */
  .drum-machine-section {
    margin-top: 30px;
  }
  
  .drum-machine-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .drum-machine-container {
    padding: 20px;
  }
  
  .drum-grid {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e9ecef;
    margin-bottom: 20px;
  }
  
  .grid-header {
    margin-bottom: 16px;
  }
  
  .track-labels {
    display: flex;
    gap: 8px;
    margin-left: 80px;
  }
  
  .track-label {
    width: 32px;
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
  
  .track-row {
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
  
  .beat-cell.active::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
  }
  
  .playback-controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .transport-controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .transport-btn {
    min-width: 120px;
    height: 44px;
    font-weight: 600;
  }
  
  .playback-info {
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
  }
  
     .current-beat,
   .total-beats,
   .tempo-display {
     font-size: 1.1rem;
     font-weight: 600;
     color: #495057;
   }
  
  .volume-control {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  
  .volume-control label {
    font-weight: 600;
    color: #333;
  }
  
  .volume-slider {
    width: 200px;
  }
  
  /* 神经网络控制样式 */
  .neural-controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .density-control,
  .randomness-control {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .density-control label,
  .randomness-control label {
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
  }
  
  .density-slider,
  .randomness-slider {
    margin-top: 8px;
  }
  
  .density-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
    margin-top: 4px;
  }
  
  .generate-btn {
    width: 100%;
    height: 44px;
    font-weight: 600;
    margin-top: 16px;
  }
</style>