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
            <i class="el-icon-user-solid" style="font-size: 24px; color: #7472fe;"></i>
          </div>
          <h2 class="title">创建账户</h2>
          <p class="subtitle">开始您的精彩旅程</p>
        </div>
      </template>
       
      <el-form :model="registerForm" label-position="top" class="register-form">
        <el-form-item label="用户名" class="form-item">
          <el-input 
            v-model="registerForm.username" 
            placeholder="请输入用户名"
            size="large"
            prefix-icon="el-icon-user"
            class="custom-input"
          />
        </el-form-item>
         
        <el-form-item label="密码" class="form-item">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="el-icon-lock"
            show-password
            class="custom-input"
          />
        </el-form-item>
        
        <el-form-item label="确认密码" class="form-item">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            prefix-icon="el-icon-lock"
            show-password
            class="custom-input"
            :class="{ 'password-mismatch': passwordMismatch }"
          />
          <div v-if="passwordMismatch" class="error-tip">
            密码不一致
          </div>
        </el-form-item>
         
        <div class="form-actions">
          <el-button 
            type="primary" 
            @click="handleRegister" 
            :loading="loading"
            :disabled="!isFormValid"
            size="large"
            class="register-btn"
          >
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
          
          <div class="login-link">
            <span>已有账号？</span>
            <el-button type="text" @click="$router.push('/login')" class="login-btn">
              立即登录
            </el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)

// 计算密码不匹配状态
const passwordMismatch = computed(() => {
  return registerForm.value.confirmPassword && 
         registerForm.value.password !== registerForm.value.confirmPassword
})

// 表单验证
const isFormValid = computed(() => {
  return registerForm.value.username.trim() &&
         registerForm.value.password &&
         registerForm.value.confirmPassword &&
         registerForm.value.password === registerForm.value.confirmPassword
})

const handleRegister = async () => {
  if (!registerForm.value.username || !registerForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
   
  loading.value = true
  try {
    const res = await fetch('http://localhost:8000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: registerForm.value.username,
        password: registerForm.value.password
      })
    })
     
    if (!res.ok) throw new Error('注册失败')
     
    ElMessage.success('注册成功，请登录')
    window.location.href = '/login'
  } catch (e) {
    ElMessage.error('注册失败: ' + e.message)
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
  width: 480px;
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

.register-form {
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

.password-mismatch :deep(.el-input__wrapper) {
  border-color: #f56565 !important;
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.2) !important;
}

.custom-input :deep(.el-input__inner) {
  font-size: 16px;
  color: #2c3e50;
}

.error-tip {
  color: #f56565;
  font-size: 12px;
  margin-top: 5px;
  margin-left: 4px;
}

.password-strength {
  margin-bottom: 24px;
  padding: 0 4px;
}

.strength-label {
  font-size: 14px;
  color: #34495e;
  margin-bottom: 8px;
  font-weight: 600;
}

.strength-bar {
  width: 100%;
  height: 6px;
  background-color: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.strength-fill.weak {
  background-color: #e74c3c;
}

.strength-fill.fair {
  background-color: #f39c12;
}

.strength-fill.good {
  background-color: #3498db;
}

.strength-fill.strong {
  background-color: #27ae60;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
  text-align: right;
}

.strength-text.weak {
  color: #e74c3c;
}

.strength-text.fair {
  color: #f39c12;
}

.strength-text.good {
  color: #3498db;
}

.strength-text.strong {
  color: #27ae60;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(116, 114, 254, 0.4);
}

.register-btn:active {
  transform: translateY(0);
}

.register-btn:disabled {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  box-shadow: none;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  color: #7f8c8d;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.login-btn {
  color: #7472fe;
  font-weight: 600;
  padding: 0;
  font-size: 14px;
}

.login-btn:hover {
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