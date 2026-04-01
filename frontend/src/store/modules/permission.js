import { defineStore } from 'pinia'
import request from '@/utils/request'
import { hasPermission } from '@/utils/auth'
import { useAuthStore } from './auth'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    enabledPermissions: [],
    menuTree: [],
    expandedMenus: [],
    activeMenu: 'students',
    loadingPermissions: false
  }),

  getters: {
    hasPermission: (state) => (permissionId) => {
      const authStore = useAuthStore()
      return hasPermission(permissionId, state.enabledPermissions, authStore.isSuperAdmin)
    }
  },

  actions: {
    async fetchPermissions() {
      this.loadingPermissions = true
      try {
        const response = await request.get('/enabled-permissions')
        if (response.data.code === 0) {
          this.enabledPermissions = response.data.data.permissions || []
        }
      } catch (error) {
        console.error('Fetch permissions error:', error)
      } finally {
        this.loadingPermissions = false
      }
    },

    async fetchMenuTree() {
      try {
        const response = await request.get('/menu-tree')
        if (response.data.code === 0) {
          this.menuTree = response.data.data.menus || []
        }
      } catch (error) {
        console.error('Fetch menu tree error:', error)
      }
    },

    toggleMenu(menuKey) {
      const index = this.expandedMenus.indexOf(menuKey)
      if (index > -1) {
        this.expandedMenus.splice(index, 1)
      } else {
        this.expandedMenus.push(menuKey)
      }
    },

    setActiveMenu(menu) {
      this.activeMenu = menu
    },

    getMenuKey(menu) {
      return `menu-${menu.id}`
    }
  }
})
