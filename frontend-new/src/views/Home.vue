<template>
  <div class="app-container">
    <!-- 全局角色同步Loading遮罩层 -->
    <div v-if="authStore.syncingRole" class="global-loading-overlay">
      <div class="global-loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在更新角色权限...</div>
      </div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="username-display">欢迎，<strong>{{ authStore.username }}</strong></div>
      <button class="logout-btn" @click="handleLogout">登出</button>
    </header>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧菜单栏 -->
      <aside class="sidebar">
        <h2>菜单管理</h2>
        <ul class="menu-list">
          <li
            v-for="parentMenu in permissionStore.menuTree"
            :key="parentMenu.id"
            class="menu-item parent-menu"
          >
            <div class="menu-title" @click="toggleMenu(parentMenu)">
              <span>{{ parentMenu.name }}</span>
              <span
                class="arrow"
                :class="{ expanded: isMenuExpanded(parentMenu) }"
              >▼</span>
            </div>
            <ul class="submenu" v-show="isMenuExpanded(parentMenu)">
              <li
                v-for="childMenu in parentMenu.children"
                :key="childMenu.id"
                class="submenu-item"
                :class="{ active: isActiveMenu(childMenu.route) }"
                @click="navigateToMenu(childMenu.route)"
              >
                {{ childMenu.name }}
              </li>
            </ul>
          </li>
        </ul>
      </aside>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { usePermissionStore } from '@/store/modules/permission'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()

    onMounted(async () => {
      // 获取用户信息
      await authStore.getProfile()
      // 获取权限列表
      await permissionStore.fetchPermissions()
      // 获取菜单树
      await permissionStore.fetchMenuTree()
    })

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/')
    }

    const toggleMenu = (menu) => {
      const menuKey = `menu-${menu.id}`
      permissionStore.toggleMenu(menuKey)
    }

    const isMenuExpanded = (menu) => {
      const menuKey = `menu-${menu.id}`
      return permissionStore.expandedMenus.includes(menuKey)
    }

    const isActiveMenu = (menuRoute) => {
      return route.path.includes(menuRoute)
    }

    const navigateToMenu = (menuRoute) => {
      // 确保路由以斜杠开头
      const normalizedRoute = menuRoute.startsWith('/') ? menuRoute : `/${menuRoute}`
      router.push(`/home${normalizedRoute}`)
    }

    return {
      authStore,
      permissionStore,
      handleLogout,
      toggleMenu,
      isMenuExpanded,
      isActiveMenu,
      navigateToMenu
    }
  }
}
</script>
