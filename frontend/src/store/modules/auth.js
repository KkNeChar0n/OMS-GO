import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import request from '@/utils/request'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: !!getToken(),
    username: '',
    isSuperAdmin: false,
    syncingRole: false
  }),

  actions: {
    async login(username, password) {
      try {
        const response = await request.post('/login', { username, password })

        if (response.data.code === 0) {
          this.isLoggedIn = true
          this.username = response.data.data.username
          this.isSuperAdmin = response.data.data.is_super_admin
          setToken(response.data.data.token)
          return { success: true }
        } else {
          return { success: false, error: response.data.message }
        }
      } catch (error) {
        return { success: false, error: error.message || '登录失败' }
      }
    },

    async logout() {
      try {
        await request.post('/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.isLoggedIn = false
        this.username = ''
        this.isSuperAdmin = false
        removeToken()
      }
    },

    async syncRole() {
      this.syncingRole = true
      try {
        const response = await request.get('/sync-role')
        if (response.data.code === 0) {
          if (response.data.data.role_changed) {
            this.isSuperAdmin = response.data.data.is_super_admin
            // 重新获取权限和菜单
            return true
          }
        }
        return false
      } catch (error) {
        console.error('Sync role error:', error)
        return false
      } finally {
        this.syncingRole = false
      }
    },

    async getProfile() {
      try {
        const response = await request.get('/profile')
        if (response.data.code === 0) {
          this.username = response.data.data.username
        }
      } catch (error) {
        console.error('Get profile error:', error)
      }
    }
  }
})
