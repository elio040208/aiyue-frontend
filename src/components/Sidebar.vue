<template>
  <div>
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && isExpanded" 
      class="sidebar-overlay" 
      @click="toggleSidebar"
    ></div>
    
    <!-- 移动端切换按钮 -->
    <button 
      v-if="isMobile" 
      class="sidebar-toggle" 
      @click="toggleSidebar"
      :class="{ active: isExpanded }"
    >
      <i class="el-icon-s-fold" v-if="!isExpanded"></i>
      <i class="el-icon-s-unfold" v-if="isExpanded"></i>
    </button>

    <div 
      class="sidebar" 
      :class="{ 
        'sidebar-collapsed': isMobile && !isExpanded,
        'sidebar-mobile': isMobile 
      }"
    >
      <!-- 用户头像区域 -->
      <div class="user-section">
        <div class="user-avatar">
          <img :src="userAvatar" :alt="userName" />
        </div>
        <div class="user-info" v-show="!isMobile || isExpanded">
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
          :title="(isMobile && !isExpanded) ? item.title : ''"
        >
          <i :class="item.icon"></i>
          <span class="nav-text" v-show="!isMobile || isExpanded">{{ item.title }}</span>
          <div class="nav-indicator" v-if="currentPath === item.path"></div>
        </div>
      </nav>
      
      <!-- 退出登录区域 -->
      <div class="logout-section">
        <div 
          class="logout-item" 
          @click="logout"
          :title="(isMobile && !isExpanded) ? '退出登录' : ''"
        >
          <i class="el-icon-switch-button"></i>
          <span class="logout-text" v-show="!isMobile || isExpanded">退出登录</span>
          <div class="logout-hover-bg"></div>
        </div>
      </div>
      
      <!-- 底部装饰 -->
      <div class="sidebar-footer" v-show="!isMobile || isExpanded">
        <div class="logo">
          <span class="logo-text">AI</span>
          <span class="logo-accent">Yue</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 响应式状态
const isMobile = ref(false)
const isExpanded = ref(false)

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 476
  if (!isMobile.value) {
    isExpanded.value = false
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value
}

// 退出登录
const logout = () => {
  localStorage.removeItem("token")
  router.push("/login")
  if (isMobile.value) {
    isExpanded.value = false
  }
}

// 用户信息
const userName = ref(localStorage.getItem('username') || '音乐爱好者')
const userAvatar = ref('https://p3-search.byteimg.com/obj/labis/7d51fd6eb72b5ef7a902a5d95010d734')

// 菜单项
const menuItems = ref([
  { title: '音乐馆', path: '/app/home', icon: 'el-icon-headset' },
  { title: 'AI音乐生成', path: '/app/generate', icon: 'el-icon-magic-stick' },
  { title: 'AI钢琴演奏', path: '/app/piano', icon: 'el-icon-video-play' }
])

// 当前路径
const currentPath = computed(() => route.path)

// 导航函数
const navigateTo = (path) => {
  router.push(path)
  // 移动端导航后自动收起
  if (isMobile.value) {
    isExpanded.value = false
  }
}

// 生命周期
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
/* 移动端切换按钮 */
.sidebar-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1002;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #A2B1FB 0%, #7472FE 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(116, 114, 254, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(116, 114, 254, 0.4);
}

.sidebar-toggle:active {
  transform: translateY(0);
}

.sidebar-toggle.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
}

/* 遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
  transition: opacity 0.3s ease;
}

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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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

/* 移动端样式 */
.sidebar-mobile {
  transform: translateX(-100%);
  box-shadow: 8px 0 30px rgba(0, 0, 0, 0.2);
}

.sidebar-mobile.sidebar-collapsed {
  transform: translateX(-100%);
}

.sidebar-mobile:not(.sidebar-collapsed) {
  transform: translateX(0);
}

.user-section {
  padding: 32px 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  transition: padding 0.3s ease;
}

.sidebar-mobile .user-section {
  padding: 80px 24px 32px 24px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  margin-right: 16px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: margin 0.3s ease;
}

.sidebar-collapsed .user-avatar {
  margin-right: 0;
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
  opacity: 1;
  transition: opacity 0.3s ease;
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

.sidebar-collapsed .nav-item {
  padding: 16px;
  margin: 4px 8px;
  justify-content: center;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transform: translateX(4px);
}

.sidebar-collapsed .nav-item:hover {
  transform: scale(1.1);
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
  transition: margin 0.3s ease;
}

.sidebar-collapsed .nav-item i {
  margin-right: 0;
}

.nav-text {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  opacity: 1;
  transition: opacity 0.3s ease;
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

.sidebar-collapsed .nav-indicator {
  right: 50%;
  bottom: 8px;
  top: auto;
  width: 24px;
  height: 4px;
  transform: translateX(50%);
}

/* 退出登录区域样式 */
.logout-section {
  padding: 16px 50px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 1;
}

.sidebar-collapsed .logout-section {
  padding: 16px 8px;
}

.logout-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.sidebar-collapsed .logout-item {
  padding: 14px;
  justify-content: center;
}

.logout-item:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.2);
}

.sidebar-collapsed .logout-item:hover {
  transform: scale(1.1);
}

.logout-item:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.sidebar-collapsed .logout-item:active {
  transform: scale(1.05);
}

.logout-item i {
  font-size: 1.2rem;
  margin-right: 12px;
  width: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.sidebar-collapsed .logout-item i {
  margin-right: 0;
}

.logout-item:hover i {
  transform: rotate(180deg);
}

.logout-text {
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: opacity 0.3s ease;
}

.logout-hover-bg {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.1), transparent);
  transition: left 0.6s ease;
  pointer-events: none;
}

.logout-item:hover .logout-hover-bg {
  left: 100%;
}

.sidebar-footer {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  transition: opacity 0.3s ease;
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

/* 桌面端响应式 */
@media (min-width: 769px) {
  .sidebar-toggle {
    display: none;
  }
  
  .sidebar-overlay {
    display: none;
  }
}

/* 中等屏幕适配 */
@media (max-width: 1024px) and (min-width: 769px) {
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
  
  .logout-section {
    padding: 12px 8px;
  }
  
  .logout-item {
    padding: 12px 16px;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .sidebar {
    width: 260px;
  }
  
  .sidebar-toggle {
    top: 16px;
    left: 16px;
    width: 44px;
    height: 44px;
    font-size: 1.3rem;
  }
}
</style>