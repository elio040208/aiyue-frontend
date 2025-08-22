<template>
  <div class="auth-page">
    <el-card class="auth-card">
      <template #header>
        <h2>登录</h2>
      </template>

      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" @click="handleLogin" :loading="loading">
            登录
          </el-button>
          <el-button type="text" @click="$router.push('/register')">
            没有账号？去注册
          </el-button>
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
    // 这里替换成你的后端登录接口
    const res = await fetch('http://localhost:8000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value)
    })

    if (!res.ok) throw new Error('登录失败')

    const data = await res.json()
    ElMessage.success('登录成功')
    localStorage.setItem('token', data.access_token) // 存储登录凭证
    localStorage.setItem('token', data.token)
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
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #a2b1fb, #7472fe);
}
.auth-card {
  width: 400px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
