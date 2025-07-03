<template>
  <div class="under-development">
    <div class="container">
      <!-- 动画图标 -->
      <div class="icon-wrapper">
        <div class="construction-icon">
          <svg viewBox="0 0 100 100" class="construction-svg">
            <circle cx="50" cy="50" r="45" class="circle-bg"/>
            <path d="M30 70 L50 30 L70 70 Z" class="triangle"/>
            <circle cx="50" cy="60" r="3" class="dot"/>
            <path d="M50 45 L50 55" class="line" stroke-width="2"/>
          </svg>
        </div>
        <div class="sparkles">
          <div class="sparkle" v-for="i in 6" :key="i" :style="getSparkleStyle(i)"></div>
        </div>
      </div>

      <!-- 主要内容 -->
      <div class="content">
        <h1 class="title">{{ title }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
        
        <!-- 进度条 -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>

        <!-- 返回按钮 -->
        <button class="back-button" @click="goBack" v-if="showBackButton">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          返回首页
        </button>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="floating-shape" v-for="i in 8" :key="i" :style="getShapeStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '功能开发中'
  },
  subtitle: {
    type: String,
    default: 'Under Development'
  },
  progress: {
    type: Number,
    default: 65
  },
  showContact: {
    type: Boolean,
    default: true
  },
  email: {
    type: String,
    default: 'support@example.com'
  },
  showBackButton: {
    type: Boolean,
    default: true
  }
})

// Methods
const goBack = () => {
  // 可以根据需要修改返回逻辑
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = '/'
  }
}

const getSparkleStyle = (index) => {
  const angles = [0, 60, 120, 180, 240, 300]
  const angle = angles[index - 1]
  const radius = 80 + Math.random() * 20
  const x = Math.cos(angle * Math.PI / 180) * radius
  const y = Math.sin(angle * Math.PI / 180) * radius
  
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animationDelay: `${index * 0.2}s`
  }
}

const getShapeStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${index * 0.5}s`,
    animationDuration: `${8 + Math.random() * 4}s`
  }
}
</script>

<style scoped>

.under-development {
  min-height:100vh;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.icon-wrapper {
  position: relative;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}

.construction-icon {
  width: 80px;
  height: 80px;
  animation: bounce 2s infinite;
}

.construction-svg {
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: #fbbf24;
  stroke: #f59e0b;
  stroke-width: 2;
}

.triangle {
  fill: #ef4444;
  stroke: #dc2626;
  stroke-width: 1;
}

.dot {
  fill: white;
}

.line {
  stroke: white;
  stroke-linecap: round;
}

.sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fbbf24;
  border-radius: 50%;
  animation: sparkle 2s infinite;
}

.content {
  color: #374151;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #9ca3af;
  margin-bottom: 24px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
  color: #6b7280;
}

.progress-container {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: progress-shimmer 2s infinite;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  min-width: 40px;
}

.contact-info {
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.contact-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.contact-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #764ba2;
}

.back-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.back-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 10s infinite linear;
}

/* 动画 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes progress-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes float {
  from {
    transform: translateY(100vh) rotate(0deg);
  }
  to {
    transform: translateY(-100px) rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 40px 24px;
    margin: 20px;
  }
  
  .title {
    font-size: 28px;
  }
  
  .construction-icon {
    width: 60px;
    height: 60px;
  }
  
  .progress-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .progress-text {
    align-self: flex-end;
  }
}
</style>