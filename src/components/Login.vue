<template>
  <div class="auth-page">
    <div class="background-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <el-card class="auth-card">
      <template #header>
        <div class="header-section">
          <div class="logo">
            <i class="el-icon-user" style="font-size: 24px; color: #7472fe;"></i>
          </div>
          <h2 class="title">欢迎回来</h2>
          <p class="subtitle">请登录您的账户</p>
        </div>
      </template>
       
      <el-form :model="loginForm" label-position="top" class="login-form">
        <el-form-item label="用户名" class="form-item">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            size="large"
            prefix-icon="el-icon-user"
            class="custom-input"
          />
        </el-form-item>
         
        <el-form-item label="密码" class="form-item">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="el-icon-lock"
            show-password
            class="custom-input"
          />
        </el-form-item>
         
        <div class="form-actions">
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="loading"
            size="large"
            class="login-btn"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
          
          <div class="register-link">
            <span>还没有账号？</span>
            <el-button type="text" @click="$router.push('/register')" class="register-btn">
              立即注册
            </el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const loginForm = ref({
  username: '',
  password: ''
})
const loading = ref(false)

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
   
  loading.value = true
  try {
    const res = await fetch('http://localhost:8000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value)
    })
     
    if (!res.ok) throw new Error('登录失败')
     
    const data = await res.json()
    ElMessage.success('登录成功')
    // 注意：在实际部署中建议使用内存存储或其他方案
    localStorage.setItem('token', data.access_token || data.token)
    localStorage.setItem('username', loginForm.value.username)
     
    window.location.href = '/app/home'
  } catch (e) {
    ElMessage.error('登录失败: ' + e.message)
  }
  loading.value = false
}
</script>

<style scoped>
.auth-page {
  min-height: 93vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #A2B1FB 0%, #7472FE 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 30%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.auth-card {
  width: 450px;
  max-width: 90vw;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: none;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  z-index: 1;
  position: relative;
}

.auth-card :deep(.el-card__header) {
  padding: 30px 30px 20px;
  border-bottom: none;
}

.auth-card :deep(.el-card__body) {
  padding: 0 30px 30px;
}

.header-section {
  text-align: center;
}

.logo {
  margin-bottom: 15px;
}

.title {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0 0 20px;
  color: #7f8c8d;
  font-size: 16px;
  font-weight: 400;
}

.login-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 24px;
}

.form-item :deep(.el-form-item__label) {
  color: #34495e;
  font-weight: 600;
  font-size: 15px;
  padding-bottom: 8px;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  padding: 12px 16px;
}

.custom-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 4px 12px rgba(116, 114, 254, 0.15);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #7472fe;
  box-shadow: 0 4px 12px rgba(116, 114, 254, 0.2);
}

.custom-input :deep(.el-input__inner) {
  font-size: 16px;
  color: #2c3e50;
}

.forgot-password {
  text-align: right;
  margin-bottom: 30px;
}

.forgot-btn {
  color: #7472fe;
  font-size: 14px;
  padding: 0;
}

.forgot-btn:hover {
  color: #5a54d8;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7472fe, #a2b1fb);
  border: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(116, 114, 254, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(116, 114, 254, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.register-link {
  text-align: center;
  color: #7f8c8d;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.register-btn {
  color: #7472fe;
  font-weight: 600;
  padding: 0;
  font-size: 14px;
}

.register-btn:hover {
  color: #5a54d8;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-card {
    width: 100%;
    margin: 0 16px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .auth-card :deep(.el-card__header),
  .auth-card :deep(.el-card__body) {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>