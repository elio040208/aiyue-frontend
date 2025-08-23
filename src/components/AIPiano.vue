<template>
  <div class="performance-rnn-container">
    <div class="header-section">
      <h1 class="main-title">AI钢琴演奏</h1>
      <div class="description">
        <p>使用Magenta模型</p>
      </div>
    </div>

    <div class="control-panel">
      <div class="control-group">
        <h3>生成音乐</h3>
        <div class="controls-row">
          <button 
            @click="toggleGeneration" 
            :class="['btn', 'btn-primary', { 'generating': isGenerating }]"
            :disabled="isLoading || !modelLoaded"
          >
            {{ isGenerating ? '停止生成' : '开始生成' }}
          </button>
          <button @click="clearSequence" class="btn btn-secondary" :disabled="isLoading">
            清除
          </button>
          <button @click="resetModel" class="btn btn-secondary" :disabled="isLoading || isGenerating">
            重置模型
          </button>
        </div>
        <div class="model-status">
          <div v-if="isLoading" class="status loading">Loading</div>
          <div v-else-if="!modelLoaded" class="status error">加载模型失败</div>
          <div v-else class="status ready">模型已加载 - {{ modelInfo }}</div>
        </div>
      </div>

      <div class="control-group">
        <h3>RNN参数设置</h3>
        <div class="rnn-controls">
          <div class="param-item">
            <label>随机性Temperature: {{ temperature.toFixed(1) }}</label>
            <input 
              type="range" 
              v-model.number="temperature" 
              min="0.1" 
              max="2.0" 
              step="0.1"
              class="slider"
            />
          </div>
          <div class="param-item">
            <label>间隔精度Steps per Quarter: {{ stepsPerQuarter }}</label>
            <input 
              type="range" 
              v-model.number="stepsPerQuarter" 
              min="4" 
              max="16" 
              step="4"
              class="slider"
            />
          </div>
          <div class="param-item">
            <label>音符密度Note Density: {{ noteDensity.toFixed(1) }}</label>
            <input 
              type="range" 
              v-model.number="noteDensity" 
              min="0.1" 
              max="2.0" 
              step="0.1"
              class="slider"
            />
          </div>
        </div>
      </div>

      <div class="control-group">
        <h3>音频设置</h3>
        <div class="audio-controls">
          <div class="audio-row">
            <div class="param-item">
              <label>总音量: {{ (audioSettings.masterVolume * 100).toFixed(0) }}%</label>
              <input 
                type="range" 
                v-model.number="audioSettings.masterVolume" 
                min="0" 
                max="0.8" 
                step="0.05"
                class="slider"
                @input="updateMasterVolume"
              />
            </div>
            <div class="param-item">
              <label>混响强度: {{ (audioSettings.reverbAmount * 100).toFixed(0) }}%</label>
              <input 
                type="range" 
                v-model.number="audioSettings.reverbAmount" 
                min="0" 
                max="0.6" 
                step="0.05"
                class="slider"
                @input="updateReverbAmount"
              />
            </div>
          </div>
          
          <div class="audio-row">
            <div class="param-item">
              <label>音色亮度: {{ (audioSettings.brightness * 100).toFixed(0) }}%</label>
              <input 
                type="range" 
                v-model.number="audioSettings.brightness" 
                min="0" 
                max="1" 
                step="0.1"
                class="slider"
              />
            </div>
            <div class="param-item">
              <label>音色冷暖: {{ (audioSettings.warmth * 100).toFixed(0) }}%</label>
              <input 
                type="range" 
                v-model.number="audioSettings.warmth" 
                min="0" 
                max="1" 
                step="0.1"
                class="slider"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="control-group">
        <h3>钢琴音色类型</h3>
        <div class="piano-type-buttons">
          <button 
            v-for="(type, key) in pianoTypes" 
            :key="key"
            @click="audioSettings.pianoType = key"
            :class="['btn', 'btn-piano-type', { 'active': audioSettings.pianoType === key }]"
          >
            {{ type.icon }} {{ type.name }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <h3>ADSR包络</h3>
        <div class="adsr-controls">
          <div class="param-item">
            <label>音量上升时间: {{ (audioSettings.attack * 1000).toFixed(0) }}ms</label>
            <input 
              type="range" 
              v-model.number="audioSettings.attack" 
              min="0.001" 
              max="0.1" 
              step="0.005"
              class="slider"
            />
          </div>
          <div class="param-item">
            <label>衰减时间: {{ audioSettings.decay.toFixed(2) }}s</label>
            <input 
              type="range" 
              v-model.number="audioSettings.decay" 
              min="0.1" 
              max="2.0" 
              step="0.1"
              class="slider"
            />
          </div>
          <div class="param-item">
            <label>持续音量比例: {{ (audioSettings.sustain * 100).toFixed(0) }}%</label>
            <input 
              type="range" 
              v-model.number="audioSettings.sustain" 
              min="0" 
              max="1" 
              step="0.05"
              class="slider"
            />
          </div>
          <div class="param-item">
            <label>音量下降时间: {{ audioSettings.release.toFixed(1) }}s</label>
            <input 
              type="range" 
              v-model.number="audioSettings.release" 
              min="0.1" 
              max="3.0" 
              step="0.1"
              class="slider"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="piano-section">
      <h3>钢琴模拟 (点击弹奏)</h3>
      <div class="piano-container">
        <div class="piano-keys">
          <div 
            v-for="(key, index) in pianoKeys" 
            :key="index"
            :class="['piano-key', key.type, { 'active': activeKeys.includes(index) }]"
            @mousedown="playKey(index)"
            @mouseup="releaseKey(index)"
            @mouseleave="releaseKey(index)"
            @touchstart="playKey(index)"
            @touchend="releaseKey(index)"
          >
          </div>
        </div>
      </div>
      <p class="piano-hint">按键弹奏不同音符</p>
    </div>

    <div class="sequence-section">
      <h3>音符生成列表</h3>
      <div class="sequence-display">
        <div v-if="generatedNotes.length === 0" class="no-notes">
          还未生成音乐
        </div>
        <div v-else class="notes-container">
          <div 
            v-for="(note, index) in generatedNotes.slice(-50)" 
            :key="index"
            :class="['note-item', { 'recent': index >= generatedNotes.length - 10 }]"
          >
            🎵 {{ note.pitch }} (vel: {{ note.velocity }}) - {{ note.velocity?.toFixed(2) }}ms
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'

let audioContext = null
let masterGain = null
let reverbGain = null
let dryGain = null
const activeOscillators = new Map()

let performanceRNN = null
let currentSequence = null

const isGenerating = ref(false)
const isLoading = ref(true)
const modelLoaded = ref(false)
const modelInfo = ref('')
const temperature = ref(1.0)
const stepsPerQuarter = ref(4)
const noteDensity = ref(1.0)
const activeKeys = ref([])
const generatedNotes = ref([])

const audioSettings = reactive({
  masterVolume: 0.4,
  reverbAmount: 0.2,
  brightness: 0.5,
  warmth: 0.5,
  attack: 0.005,
  decay: 0.4,
  sustain: 0.2,
  release: 1.0,
  pianoType: 'grand'
})

const pianoTypes = {
  grand: { name: 'Grand Piano', icon: '' },
  upright: { name: 'Upright Piano', icon: '' },
  electric: { name: 'Electric Piano', icon: '' },
  bell: { name: 'Bell Piano', icon: '' }
}

// 钢琴键88
const pianoKeys = reactive([])
for (let i = 0; i < 88; i++) {
  const noteNumber = i + 21 
  const octave = Math.floor((noteNumber - 12) / 12)
  const semitone = noteNumber % 12
  const isBlack = [1, 3, 6, 8, 10].includes(semitone)
  
  pianoKeys.push({
    type: isBlack ? 'black' : 'white',
    note: noteNumber,
    octave: octave
  })
}

let generationInterval = null

const loadPerformanceRNN = async () => {
  try {
    if (!window.mm) {
      await loadMagentaScript()
    }
    
    performanceRNN = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn')
    await performanceRNN.initialize()
    
    modelLoaded.value = true
    modelInfo.value = 'Magenta Performance RNN Loaded'
  } catch (error) {
    console.error('Failed to load Performance RNN:', error)
    modelInfo.value = ''
    modelLoaded.value = false
    
    setTimeout(() => {
      modelLoaded.value = true
      modelInfo.value = 'Demo Mode (Simulated RNN)'
    }, 1000)
  }
}

const loadMagentaScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/es6/core.js'
    script.onload = () => {
      const rnnScript = document.createElement('script')
      rnnScript.src = 'https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/es6/music_rnn.js'
      rnnScript.onload = resolve
      rnnScript.onerror = reject
      document.head.appendChild(rnnScript)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const initAudioContext = async () => {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    masterGain = audioContext.createGain()
    
    const convolver = audioContext.createConvolver()
    reverbGain = audioContext.createGain()
    dryGain = audioContext.createGain()
    
    const sampleRate = audioContext.sampleRate
    const length = sampleRate * 1.5
    const impulse = audioContext.createBuffer(2, length, sampleRate)
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2)
        channelData[i] = (Math.random() * 2 - 1) * decay * 0.3
      }
    }
    
    convolver.buffer = impulse
    
    updateReverbAmount()
    updateMasterVolume()
    
    masterGain.connect(dryGain)
    masterGain.connect(convolver)
    convolver.connect(reverbGain)
    
    dryGain.connect(audioContext.destination)
    reverbGain.connect(audioContext.destination)
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
  } catch (error) {
    console.error('Failed to initialize audio context:', error)
  }
}

const updateMasterVolume = () => {
  if (masterGain) {
    masterGain.gain.setValueAtTime(audioSettings.masterVolume, audioContext.currentTime)
  }
}

const updateReverbAmount = () => {
  if (reverbGain && dryGain) {
    const wetAmount = audioSettings.reverbAmount
    const dryAmount = 1 - wetAmount
    
    reverbGain.gain.setValueAtTime(wetAmount, audioContext.currentTime)
    dryGain.gain.setValueAtTime(dryAmount, audioContext.currentTime)
  }
}

const midiToFreq = (midiNote) => {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

const getHarmonicConfig = (pianoType) => {
  const configs = {
    grand: [
      { type: 'sine', ratio: 1, volume: 0.8 },
      { type: 'sine', ratio: 2, volume: 0.3 },
      { type: 'triangle', ratio: 3, volume: 0.15 },
      { type: 'sine', ratio: 5, volume: 0.1 },
      { type: 'sine', ratio: 7, volume: 0.05 }
    ],
    upright: [
      { type: 'triangle', ratio: 1, volume: 0.7 },
      { type: 'sawtooth', ratio: 2, volume: 0.4 },
      { type: 'triangle', ratio: 3, volume: 0.2 },
      { type: 'sine', ratio: 4, volume: 0.1 }
    ],
    electric: [
      { type: 'sine', ratio: 1, volume: 0.9 },
      { type: 'sine', ratio: 2, volume: 0.4 },
      { type: 'sine', ratio: 4, volume: 0.2 },
      { type: 'sine', ratio: 8, volume: 0.1 }
    ],
    bell: [
      { type: 'sine', ratio: 1, volume: 0.6 },
      { type: 'sine', ratio: 2.76, volume: 0.4 },
      { type: 'sine', ratio: 5.4, volume: 0.25 },
      { type: 'sine', ratio: 8.93, volume: 0.15 },
      { type: 'sine', ratio: 13.34, volume: 0.1 }
    ]
  }
  return configs[pianoType] || configs.grand
}

const createPianoSound = (frequency, velocity, duration) => {
  const now = audioContext.currentTime
  const normalizedVelocity = velocity / 127
  
  const oscillators = []
  const gainNodes = []
  
  const harmonicConfig = getHarmonicConfig(audioSettings.pianoType)
  
  harmonicConfig.forEach((config) => {
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    
    osc.type = config.type
    osc.frequency.setValueAtTime(frequency * config.ratio, now)
    
    oscillators.push(osc)
    gainNodes.push(gain)
  })
  
  const baseVolumes = harmonicConfig.map(config => config.volume)
  const brightnessMultiplier = 0.5 + audioSettings.brightness
  const warmthMultiplier = 0.5 + audioSettings.warmth
  
  const volumes = baseVolumes.map((vol, index) => {
    let adjustedVol = vol * normalizedVelocity
    if (index > 0) adjustedVol *= brightnessMultiplier
    if (index <= 1) adjustedVol *= warmthMultiplier
    return adjustedVol
  })
  
  const attackTime = audioSettings.attack
  const decayTime = audioSettings.decay
  const sustainLevel = audioSettings.sustain
  const releaseTime = Math.min(duration / 1000, audioSettings.release * 2)
  
  oscillators.forEach((osc, index) => {
    const gain = gainNodes[index]
    const volume = volumes[index]
    
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + attackTime)
    gain.gain.exponentialRampToValueAtTime(volume * sustainLevel, now + attackTime + decayTime)
    gain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime)
    
    osc.connect(gain)
    gain.connect(masterGain)
    
    osc.start(now)
    osc.stop(now + releaseTime)
  })
  
  return { oscillators, gainNodes, releaseTime }
}

const playNote = (midiNote, velocity = 127, duration = 500) => {
  if (!audioContext) return
  
  const frequency = midiToFreq(midiNote)
  const soundData = createPianoSound(frequency, velocity, duration)
  
  activeOscillators.set(midiNote, soundData)
  
  setTimeout(() => {
    activeOscillators.delete(midiNote)
  }, soundData.releaseTime * 1000)
}

const stopNote = (midiNote) => {
  const soundData = activeOscillators.get(midiNote)
  if (soundData) {
    const { oscillators, gainNodes } = soundData
    const now = audioContext.currentTime
    
    gainNodes.forEach(gainNode => {
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    })
    
    oscillators.forEach(oscillator => {
      try {
        oscillator.stop(now + 0.1)
      } catch (e) {
      }
    })
    
    activeOscillators.delete(midiNote)
  }
}

const generateNote = async () => {
  try {
    if (performanceRNN && modelLoaded.value) {
      if (!currentSequence) {
        currentSequence = {
          notes: [],
          totalTime: 0,
          ticks: 0
        }
      }
      
      const continueSequence = await performanceRNN.continueSequence(
        currentSequence,
        stepsPerQuarter.value,
        temperature.value
      )
      
      if (continueSequence.notes && continueSequence.notes.length > 0) {
        const newNotes = continueSequence.notes.slice(currentSequence.notes.length)
        newNotes.forEach(note => {
          playNote(note.pitch, note.velocity || 80, (note.endTime - note.startTime) * 1000)
          
          const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
          const octave = Math.floor((note.pitch - 12) / 12)
          const noteName = noteNames[note.pitch % 12]
          
          generatedNotes.value.push({
            pitch: `${noteName}${octave}`,
            velocity: note.velocity || 80,
            startTime: note.startTime,
            endTime: note.endTime,
            midiNote: note.pitch
          })
          
          const keyIndex = note.pitch - 21
          if (keyIndex >= 0 && keyIndex < 88) {
            activeKeys.value.push(keyIndex)
            setTimeout(() => {
              const index = activeKeys.value.indexOf(keyIndex)
              if (index > -1) {
                activeKeys.value.splice(index, 1)
              }
            }, (note.endTime - note.startTime) * 1000)
          }
        })
        
        currentSequence = continueSequence
      }
    } else {
      const pitch = Math.floor(Math.random() * 60) + 36
      const velocity = Math.floor(Math.random() * 100) + 27
      const duration = Math.floor(Math.random() * 800) + 200
      
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      const octave = Math.floor((pitch - 12) / 12)
      const noteName = noteNames[pitch % 12]
      
      const note = {
        pitch: `${noteName}${octave}`,
        velocity,
        duration,
        midiNote: pitch,
        startTime: Date.now() / 1000
      }
      
      generatedNotes.value.push(note)
      playNote(pitch, velocity, duration)
      
      const keyIndex = pitch - 21
      if (keyIndex >= 0 && keyIndex < 88) {
        activeKeys.value.push(keyIndex)
        setTimeout(() => {
          const index = activeKeys.value.indexOf(keyIndex)
          if (index > -1) {
            activeKeys.value.splice(index, 1)
          }
        }, duration)
      }
    }
  } catch (error) {
    console.error('Error generating note:', error)
  }
  
  if (generatedNotes.value.length > 1000) {
    generatedNotes.value = generatedNotes.value.slice(-500)
  }
}

const toggleGeneration = async () => {
  if (!audioContext) {
    await initAudioContext()
  }
  
  if (isGenerating.value) {
    stopGeneration()
  } else {
    startGeneration()
  }
}

const startGeneration = () => {
  isGenerating.value = true
  const interval = Math.max(100, 1000 / noteDensity.value)
  generationInterval = setInterval(generateNote, interval)
}

const stopGeneration = () => {
  isGenerating.value = false
  if (generationInterval) {
    clearInterval(generationInterval)
    generationInterval = null
  }
}

const clearSequence = () => {
  generatedNotes.value = []
  activeKeys.value = []
  currentSequence = null
}

const resetModel = () => {
  clearSequence()
  currentSequence = null
}

const playKey = async (keyIndex) => {
  if (!audioContext) {
    await initAudioContext()
  }
  
  const midiNote = keyIndex + 21
  const velocity = 100
  const duration = 1000
  
  if (!activeKeys.value.includes(keyIndex)) {
    activeKeys.value.push(keyIndex)
    playNote(midiNote, velocity, duration)
  }
}

const releaseKey = (keyIndex) => {
  const index = activeKeys.value.indexOf(keyIndex)
  if (index > -1) {
    activeKeys.value.splice(index, 1)
    const midiNote = keyIndex + 21
    stopNote(midiNote)
  }
}

onMounted(async () => {
  await initAudioContext()
  await loadPerformanceRNN()
  isLoading.value = false
})

onUnmounted(() => {
  if (generationInterval) {
    clearInterval(generationInterval)
  }
  
  if (audioContext) {
    audioContext.close()
  }
  
  activeOscillators.forEach(({ oscillators }) => {
    oscillators.forEach(oscillator => {
      try {
        oscillator.stop()
      } catch (e) {
      }
    })
  })
  activeOscillators.clear()
})
</script>

<style scoped>
.performance-rnn-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #A2B1FB 0%, #7472FE 100%);
  min-height: 100vh;
  color: white;
  box-sizing: border-box;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.main-title {
  font-size: 3em;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.3em;
  margin-bottom: 20px;
  opacity: 0.9;
}

.description {
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.8;
  line-height: 1.6;
}

.control-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.control-group {
  margin-bottom: 25px;
}

.control-group h3 {
  margin-bottom: 15px;
  font-size: 1.2em;
}

.controls-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1em;
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

.btn-primary.generating {
  background: linear-gradient(45deg, #51cf66, #40c057);
  animation: pulse 1.5s infinite;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.audio-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.audio-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.piano-type-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.btn-piano-type {
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.btn-piano-type:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-piano-type.active {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.adsr-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item label {
  font-weight: 600;
  font-size: 0.9em;
}

.slider {
  -webkit-appearance: none;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  border-radius: 50%;
  cursor: pointer;
}

.piano-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.piano-container {
  overflow-x: auto;
  padding: 10px 0;
}

.piano-keys {
  display: flex;
  height: 120px;
  min-width: 800px;
  position: relative;
}

.piano-key {
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
}

.piano-key.white {
  background: white;
  border: 1px solid #ddd;
  width: 20px;
  height: 120px;
  z-index: 1;
}

.piano-key.black {
  background: #333;
  width: 12px;
  height: 80px;
  margin-left: -6px;
  margin-right: -6px;
  z-index: 2;
  position: relative;
}

.piano-key.active {
  background: #ff6b6b !important;
  transform: scale(0.95);
  box-shadow: 0 2px 10px rgba(255, 107, 107, 0.5);
}

.piano-hint {
  text-align: center;
  margin-top: 15px;
  opacity: 0.8;
  font-size: 0.9em;
  font-style: italic;
}

.sequence-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.sequence-display {
  max-height: 300px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
}

.no-notes {
  text-align: center;
  opacity: 0.6;
  font-style: italic;
}

.notes-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.note-item {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.note-item.recent {
  background: rgba(255, 107, 107, 0.3);
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.model-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
}

.info-content ul {
  list-style-type: none;
  padding-left: 0;
}

.info-content li {
  padding: 5px 0;
  position: relative;
  padding-left: 20px;
}

.info-content li::before {
  content: "♪";
  position: absolute;
  left: 0;
  color: #ff6b6b;
  font-weight: bold;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .performance-rnn-container {
    padding: 10px;
  }
  
  .main-title {
    font-size: 2em;
  }
  
  .adsr-controls,
  .audio-row {
    grid-template-columns: 1fr;
  }
  
  .piano-type-buttons {
    grid-template-columns: 1fr 1fr;
  }
  
  .controls-row {
    flex-direction: column;
  }
  
  .piano-keys {
    min-width: 600px;
  }
  
  .piano-key.white {
    width: 15px;
    height: 100px;
  }
  
  .piano-key.black {
    width: 10px;
    height: 65px;
    margin-left: -5px;
    margin-right: -5px;
  }
}

@media (max-width: 480px) {
  .performance-rnn-container {
    padding: 4px;
  }
  .main-title {
    font-size: 1.3em;
  }
  .header-section {
    margin-bottom: 20px;
  }
  .control-panel {
    padding: 10px;
  }
  .control-group h3 {
    font-size: 1em;
    margin-bottom: 8px;
  }
  .btn, .btn-primary, .btn-secondary, .btn-piano-type {
    font-size: 0.85em;
    padding: 8px 12px;
  }
  .adsr-controls,
  .audio-row,
  .piano-type-buttons {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .piano-keys {
    min-width: 350px;
    height: 60px;
  }
  .piano-key.white {
    width: 8px;
    height: 60px;
  }
  .piano-key.black {
    width: 5px;
    height: 35px;
    margin-left: -2px;
    margin-right: -2px;
  }
  .sequence-section,
  .piano-section {
    padding: 10px;
    margin-bottom: 15px;
  }
  .sequence-display {
    padding: 8px;
    font-size: 0.8em;
  }
  .note-item {
    padding: 5px 7px;
    font-size: 0.8em;
  }
}

@media (max-width: 350px) {
  .main-title {
    font-size: 1em;
  }
  .piano-keys {
    min-width: 220px;
    height: 40px;
  }
  .piano-key.white {
    width: 5px;
    height: 40px;
  }
  .piano-key.black {
    width: 3px;
    height: 22px;
    margin-left: -1px;
    margin-right: -1px;
  }
}


</style>