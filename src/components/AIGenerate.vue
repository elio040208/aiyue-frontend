<template>
  <div class="music-generator">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <div class="header-container">
        <h1 class="page-title">AI音乐生成器</h1>
        <p class="page-subtitle">用AI创造属于你的独特旋律</p>
        <div class="title-decoration">
          <div class="music-note">♪</div>
          <div class="music-note">♫</div>
          <div class="music-note">♪</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-container">
        <!-- 左侧表单区域 -->
        <div class="form-section">
          <el-card class="form-card">
            <template #header>
              <div class="card-header">
                <h3>音乐参数设置</h3>
                <div class="header-icon">🎵</div>
              </div>
            </template>
            
            <el-form :model="form" label-width="130px" class="music-form">
              <div class="form-group">
                <h4 class="group-title">起始设置</h4>
                <el-form-item label="起始提示词">
                  <el-input
                    v-model="form.start.prompt"
                    placeholder="描述起始音乐风格，如 church bells on sunday"
                    class="styled-input"
                  >
                    <template #prefix>
                      <span class="input-icon">✨</span>
                    </template>
                  </el-input>
                </el-form-item>
                
                <div class="inline-inputs">
                  <el-form-item label="起始 Seed">
                    <el-input-number v-model="form.start.seed" :min="0" class="number-input" />
                  </el-form-item>
                  <el-form-item label="Denoising">
                    <el-input-number
                      v-model="form.start.denoising"
                      :min="0"
                      :max="1"
                      :step="0.01"
                      class="number-input"
                    />
                  </el-form-item>
                </div>
                
                <el-form-item label="Guidance">
                  <el-input-number
                    v-model="form.start.guidance"
                    :min="0"
                    :max="20"
                    :step="0.1"
                    class="number-input"
                  />
                </el-form-item>
              </div>

              <div class="form-group">
                <h4 class="group-title">结束设置</h4>
                <el-form-item label="结束提示词">
                  <el-input
                    v-model="form.end.prompt"
                    placeholder="描述结束音乐风格，如 jazz with piano"
                    class="styled-input"
                  >
                    <template #prefix>
                      <span class="input-icon">🎭</span>
                    </template>
                  </el-input>
                </el-form-item>
                
                <div class="inline-inputs">
                  <el-form-item label="结束 Seed">
                    <el-input-number v-model="form.end.seed" :min="0" class="number-input" />
                  </el-form-item>
                  <el-form-item label="Denoising">
                    <el-input-number
                      v-model="form.end.denoising"
                      :min="0"
                      :max="1"
                      :step="0.01"
                      class="number-input"
                    />
                  </el-form-item>
                </div>
                
                <el-form-item label="Guidance">
                  <el-input-number
                    v-model="form.end.guidance"
                    :min="0"
                    :max="20"
                    :step="0.1"
                    class="number-input"
                  />
                </el-form-item>
              </div>

              <div class="form-group">
                <h4 class="group-title">高级设置</h4>
                <el-form-item label="Alpha 混合比例">
                  <el-slider
                    v-model="form.alpha"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    show-input
                    class="alpha-slider"
                  />
                </el-form-item>
                
                <el-form-item label="推理步数">
                  <el-input-number
                    v-model="form.num_inference_steps"
                    :min="1"
                    :max="100"
                    class="number-input"
                  />
                </el-form-item>
                
                <el-form-item label="Seed Image ID">
                  <el-input
                    v-model="form.seed_image_id"
                    placeholder="如 og_beat"
                    class="styled-input"
                  >
                    <template #prefix>
                      <span class="input-icon">🖼️</span>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <div class="form-actions">
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="runInference"
                  class="generate-btn"
                  size="large"
                >
                  <span v-if="!loading">🎵 开始生成音乐</span>
                  <span v-else>🎵 正在生成中...</span>
                </el-button>
              </div>
            </el-form>
          </el-card>
        </div>

        <!-- 右侧结果展示区域 -->
        <div class="result-section">
          <!-- 生成状态卡片 -->
          <el-card class="status-card" v-if="loading">
            <div class="loading-content">
              <div class="loading-animation">
                <div class="music-waves">
                  <div class="wave"></div>
                  <div class="wave"></div>
                  <div class="wave"></div>
                  <div class="wave"></div>
                  <div class="wave"></div>
                </div>
              </div>
              <h3>AI正在为你创作音乐...</h3>
              <p>请稍候，这可能需要几分钟时间</p>
            </div>
          </el-card>

          <!-- 结果展示卡片 -->
          <el-card v-if="audioUrl || imageUrl" class="result-card">
            <template #header>
              <div class="result-header">
                <h3>生成结果</h3>
                <div class="result-badge">✨ 新作品</div>
              </div>
            </template>

            <!-- 音频可视化图片 -->
            <div v-if="imageUrl" class="image-section">
              <div class="image-container">
                <img
                  :src="imageUrl"
                  alt="音频可视化"
                  class="result-image"
                />
                <div class="image-overlay">
                  <div class="overlay-content">
                    <div class="spectrum-icon">📊</div>
                    <span>音频频谱图</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 音频播放器 -->
            <div v-if="audioUrl" class="audio-section">
              <div class="audio-player">
                <div class="player-header">
                  <div class="track-info">
                    <h4>{{ getTrackTitle() }}</h4>
                    <p>AI Generated Music</p>
                  </div>
                </div>
                <audio
                  :src="audioUrl"
                  controls
                  preload="metadata"
                  class="audio-control"
                />
              </div>

              <!-- 下载按钮 -->
              <div class="download-section">
                <el-button type="success" @click="downloadAudio" class="download-btn">
                  📥 下载音乐
                </el-button>
                <el-button type="info" @click="shareAudio" class="share-btn">
                  🔗 分享作品
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 空状态 -->
          <el-card v-if="!loading && !audioUrl && !imageUrl" class="empty-card">
            <div class="empty-content">
              <div class="empty-icon">🎼</div>
              <h3>开始创作你的音乐</h3>
              <p>填写左侧的参数设置，然后点击生成按钮开始创作</p>
              <div class="inspiration-tips">
                <h5>💡 创作提示：</h5>
                <ul>
                  <li>尝试不同的音乐风格描述</li>
                  <li>调整Alpha值来控制风格过渡</li>
                  <li>增加推理步数获得更好质量</li>
                </ul>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const form = ref({
  alpha: 0.75,
  num_inference_steps: 50,
  seed_image_id: 'og_beat',
  start: {
    prompt: 'church bells on sunday',
    seed: 42,
    denoising: 0.75,
    guidance: 7.0
  },
  end: {
    prompt: 'jazz with piano',
    seed: 123,
    denoising: 0.75,
    guidance: 7.0
  }
})

const loading = ref(false)
const audioUrl = ref('')
const imageUrl = ref('')

// 生成音乐标题
const getTrackTitle = () => {
  const start = form.value.start.prompt
  const end = form.value.end.prompt
  return `From "${start}" to "${end}"`
}

// 下载音频
const downloadAudio = () => {
  if (audioUrl.value) {
    const link = document.createElement('a')
    link.href = audioUrl.value
    link.download = `ai-music-${Date.now()}.mp3`
    link.click()
  }
}

// 分享音频
const shareAudio = () => {
  if (navigator.share) {
    navigator.share({
      title: 'AI生成的音乐',
      text: '听听我用AI创作的音乐！',
      url: audioUrl.value
    })
  } else {
    navigator.clipboard.writeText(audioUrl.value)
    ElMessage.success('链接已复制到剪贴板')
  }
}

async function runInference() {
  loading.value = true
  audioUrl.value = ''
  imageUrl.value = ''
  
  try {
    const res = await fetch('http://8.149.130.118:8000/music/generate_audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    
    if (!res.ok) {
      throw new Error('请求失败')
    }
    
    const data = await res.json()
    
    if (data.audio) {
      audioUrl.value = data.audio
      ElMessage.success('🎵 音乐生成成功！')
    }
    if (data.image) {
      imageUrl.value = data.image
    }
    if (!data.audio && !data.image) {
      ElMessage.warning('未返回音频或图片')
    }
  } catch (e) {
    ElMessage.error('生成失败: ' + e.message)
  }
  
  loading.value = false
}
</script>

<style scoped>
.music-generator {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header-section {
  background: linear-gradient(135deg, #A2B1FB 0%, #7472FE 100%);
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="music-pattern" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M25 10 L25 35 Q25 40 30 40 Q35 40 35 35 L35 15 Q35 10 30 10 Z" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23music-pattern)"/></svg>');
  pointer-events: none;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
  font-weight: 300;
}

.title-decoration {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.music-note {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.6);
  animation: float 3s ease-in-out infinite;
}

.music-note:nth-child(2) {
  animation-delay: -1s;
}

.music-note:nth-child(3) {
  animation-delay: -2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.main-content {
  padding: 40px 20px;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.form-section {
  position: sticky;
  top: 20px;
}

.form-card {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0;
}

.card-header h3 {
  margin: 0;
  color: #334155;
  font-weight: 600;
}

.header-icon {
  font-size: 1.5rem;
}

.music-form {
  padding: 20px 0;
}

.form-group {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.group-title {
  margin: 0 0 20px 0;
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.styled-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.styled-input :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.input-icon {
  color: #667eea;
  margin-right: 8px;
}

.inline-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.number-input {
  width: 100%;
}

.alpha-slider {
  margin-top: 10px;
}

.alpha-slider :deep(.el-slider__runway) {
  background: linear-gradient(to right, #667eea, #764ba2);
  height: 8px;
}

.form-actions {
  text-align: center;
  margin-top: 30px;
}

.generate-btn {
  background: linear-gradient(135deg, #A2B1FB 0%, #7472FE 100%);
  border: none;
  border-radius: 25px;
  padding: 15px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card, .result-card, .empty-card {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
}

.loading-content {
  text-align: center;
  padding: 40px 20px;
}

.loading-animation {
  margin-bottom: 30px;
}

.music-waves {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 4px;
  height: 60px;
}

.wave {
  width: 6px;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 3px;
  animation: wave 1.5s infinite ease-in-out;
}

.wave:nth-child(2) { animation-delay: 0.1s; }
.wave:nth-child(3) { animation-delay: 0.2s; }
.wave:nth-child(4) { animation-delay: 0.3s; }
.wave:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { height: 20px; }
  50% { height: 60px; }
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0;
}

.result-header h3 {
  margin: 0;
  color: #334155;
  font-weight: 600;
}

.result-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.image-section {
  margin-bottom: 30px;
}

.image-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.result-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.image-container:hover .result-image {
  transform: scale(1.02);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  color: white;
  text-align: center;
  font-weight: 500;
}

.spectrum-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  display: block;
}

.audio-section {
  margin-top: 20px;
}

.audio-player {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.track-info h4 {
  margin: 0 0 5px 0;
  color: #334155;
  font-weight: 600;
  font-size: 1.1rem;
}

.track-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.volume-icon {
  font-size: 1.2rem;
  color: #667eea;
}

.audio-control {
  width: 100%;
  border-radius: 10px;
  outline: none;
}

.audio-control::-webkit-media-controls-panel {
  background: white;
  border-radius: 10px;
}

.download-section {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.download-btn, .share-btn {
  border-radius: 20px;
  padding: 12px 25px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.download-btn:hover, .share-btn:hover {
  transform: translateY(-2px);
}

.empty-content {
  text-align: center;
  padding: 60px 30px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  display: block;
}

.empty-content h3 {
  color: #334155;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.empty-content p {
  color: #64748b;
  margin: 0 0 30px 0;
  line-height: 1.6;
}

.inspiration-tips {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.inspiration-tips h5 {
  margin: 0 0 15px 0;
  color: #667eea;
  font-weight: 600;
}

.inspiration-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #64748b;
}

.inspiration-tips li {
  margin-bottom: 8px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .form-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 30px 15px;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .main-content {
    padding: 30px 15px;
  }

  .inline-inputs {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .download-section {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }

  .form-group {
    padding: 15px;
  }

  .audio-player {
    padding: 20px;
  }
}
</style>