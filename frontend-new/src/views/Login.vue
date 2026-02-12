<template>
  <div class="container">
    <h1>用户登录</h1>
    <div class="login-form">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="请输入用户名"
          @keyup.enter="handleLogin"
          required
        >
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
          required
        >
      </div>
      <div class="error-message" v-if="error">{{ error }}</div>
      <button class="login-btn" @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const username = ref('')
    const password = ref('')
    const error = ref(null)
    const isLoading = ref(false)

    const handleLogin = async () => {
      if (!username.value || !password.value) {
        error.value = '请输入用户名和密码'
        return
      }

      error.value = null
      isLoading.value = true

      try {
        const result = await authStore.login(username.value, password.value)
        if (result.success) {
          router.push('/home')
        } else {
          error.value = result.error || '登录失败'
        }
      } catch (err) {
        error.value = err.message || '登录失败'
      } finally {
        isLoading.value = false
      }
    }

    return {
      username,
      password,
      error,
      isLoading,
      handleLogin
    }
  }
}
</script>
