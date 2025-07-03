<template>
  <div class="main-layout">
    <Sidebar />
    <div class="content-wrapper">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.content-wrapper {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.content-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="1" fill="%23e2e8f0" opacity="0.5"/></pattern></defs><rect width="60" height="60" fill="url(%23dots)"/></svg>');
  pointer-events: none;
  z-index: 0;
}

.content-wrapper > * {
  position: relative;
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 240px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    margin-left: 0;
  }
  
  .main-layout {
    flex-direction: column;
  }
}
</style>