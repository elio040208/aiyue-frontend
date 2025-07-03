<template>
  <div class="sidebar">
    <!-- 用户头像区域 -->
    <div class="user-section">
      <div class="user-avatar">
        <img :src="userAvatar" :alt="userName" />
      </div>
      <div class="user-info">
        <div class="user-name">{{ userName }}</div>
        <div class="user-status">在线</div>
      </div>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="nav-menu">
      <div 
        v-for="item in menuItems" 
        :key="item.path"
        :class="['nav-item', { active: currentPath === item.path }]"
        @click="navigateTo(item.path)"
      >
        <i :class="item.icon"></i>
        <span class="nav-text">{{ item.title }}</span>
        <div class="nav-indicator" v-if="currentPath === item.path"></div>
      </div>
    </nav>
    
    <!-- 底部装饰 -->
    <div class="sidebar-footer">
      <div class="logo">
        <span class="logo-text">AI</span>
        <span class="logo-accent">Yue</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 用户信息
const userName = ref('音乐爱好者')
const userAvatar = ref('https://p3-search.byteimg.com/obj/labis/7d51fd6eb72b5ef7a902a5d95010d734')

// 菜单项
const menuItems = ref([
  {
    title: '音乐馆',
    path: '/',
    icon: 'el-icon-headset'
  },
  {
    title: 'AI音乐生成',
    path: '/generate',
    icon: 'el-icon-magic-stick'
  },
  {
    title: 'AI钢琴演奏',
    path: '/piano',
    icon: 'el-icon-video-play'
  }
])

// 当前路径
const currentPath = computed(() => route.path)

// 导航函数
const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #A2B1FB 0%, #7472FE 100%);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.03"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.03"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.03"/><circle cx="10" cy="60" r="1" fill="white" opacity="0.03"/><circle cx="90" cy="40" r="1" fill="white" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.user-section {
  padding: 32px 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  margin-right: 16px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.user-avatar::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #fff, transparent, #fff);
  border-radius: 18px;
  z-index: -1;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-status {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.user-status::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.nav-menu {
  flex: 1;
  padding: 24px 0;
  position: relative;
  z-index: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: 4px 12px;
  border-radius: 12px;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transform: translateX(4px);
}

.nav-item.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.nav-item i {
  font-size: 1.3rem;
  margin-right: 16px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav-indicator {
  position: absolute;
  right: 12px;
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #493bae, #493bae);
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.6);
}

.sidebar-footer {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.logo {
  text-align: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.logo-accent {
  font-size: 1.5rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }
  
  .user-section {
    padding: 24px 16px;
  }
  
  .nav-item {
    padding: 14px 16px;
    margin: 2px 8px;
  }
}
</style>