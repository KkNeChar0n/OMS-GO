<template>
  <div class="page-container" style="position: relative;">
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>权限管理</h1>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="permissionIdFilter">ID</label>
            <input type="number" id="permissionIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="permissionMenuFilter">所在菜单</label>
            <select id="permissionMenuFilter" v-model="filters.menu_id">
              <option value="">全部</option>
              <option v-for="menu in secondLevelMenus" :key="menu.id" :value="menu.id">{{ menu.name }}</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="search-btn" @click="searchPermissions">搜索</button>
          <button class="reset-btn" @click="resetPermissionFilters">重置</button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>权限名称</th>
            <th>所在菜单</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedPermissions || paginatedPermissions.length === 0">
            <td colspan="5" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="permission in paginatedPermissions" :key="permission.id" v-else>
            <td>{{ permission.id }}</td>
            <td>{{ permission.name }}</td>
            <td>{{ permission.menu_name }}</td>
            <td>{{ permission.status === 0 ? '启用' : '禁用' }}</td>
            <td class="action-column">
              <button v-if="permission.status === 1" class="enable-btn" @click="openEnablePermissionConfirm(permission)">启用</button>
              <button v-if="permission.status === 0" class="disable-btn" @click="openDisablePermissionConfirm(permission)">禁用</button>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import { getPermissions, getMenuTree, updatePermissionStatus } from '@/api/rbac'

export default {
  name: 'PermissionManagement',
  components: {
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    const permissionList = ref([])
    const filters = ref({
      id: '',
      menu_id: ''
    })
    const currentPage = ref(1)
    const pageSize = ref(10)
    const menuTree = ref([])

    const secondLevelMenus = computed(() => {
      const menus = []
      if (!Array.isArray(menuTree.value)) {
        return menus
      }
      menuTree.value.forEach(parent => {
        if (parent.children && parent.children.length > 0) {
          menus.push(...parent.children)
        }
      })
      return menus
    })

    const filteredPermissions = computed(() => {
      if (!permissionList.value) return []

      return permissionList.value.filter(permission => {
        if (filters.value.id && permission.id != filters.value.id) {
          return false
        }
        if (filters.value.menu_id && permission.menu_id != filters.value.menu_id) {
          return false
        }
        return true
      })
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredPermissions.value.length / pageSize.value) || 1
    })

    const paginatedPermissions = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredPermissions.value.slice(start, end)
    })

    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    const fetchPermissions = async () => {
      loading.value = true
      try {
        const response = await getPermissions()
        permissionList.value = response.data?.permissions || response.data || []
      } catch (error) {
        console.error('获取权限列表失败:', error)
        permissionList.value = []
        alert('获取权限列表失败')
      } finally {
        loading.value = false
      }
    }

    const fetchMenuTree = async () => {
      try {
        const response = await getMenuTree()
        menuTree.value = response.data?.menu_tree || response.data?.menus || response.data || []
      } catch (error) {
        console.error('获取菜单树失败:', error)
        menuTree.value = []
      }
    }

    const searchPermissions = () => {
      currentPage.value = 1
    }

    const resetPermissionFilters = () => {
      filters.value = {
        id: '',
        menu_id: ''
      }
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const openEnablePermissionConfirm = (permission) => {
      if (!confirm('是否启用该权限？\n启用后该权限绑定的按钮将展示于对应页面。')) {
        return
      }
      doEnablePermission(permission.id)
    }

    const openDisablePermissionConfirm = (permission) => {
      if (!confirm('是否禁用该权限？\n禁用后该权限绑定的按钮将隐藏于对应页面。')) {
        return
      }
      doDisablePermission(permission.id)
    }

    const doEnablePermission = async (permissionId) => {
      loading.value = true
      try {
        await updatePermissionStatus(permissionId, 0)
        alert('权限启用成功')
        await fetchPermissions()
        await permissionStore.fetchEnabledPermissions()
      } catch (error) {
        console.error('启用权限失败:', error)
        alert('启用权限失败')
      } finally {
        loading.value = false
      }
    }

    const doDisablePermission = async (permissionId) => {
      loading.value = true
      try {
        await updatePermissionStatus(permissionId, 1)
        alert('权限禁用成功')
        await fetchPermissions()
        await permissionStore.fetchEnabledPermissions()
      } catch (error) {
        console.error('禁用权限失败:', error)
        alert('禁用权限失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchPermissions(),
          fetchMenuTree()
        ])
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      permissionList,
      filters,
      currentPage,
      totalPages,
      paginatedPermissions,
      secondLevelMenus,
      hasPermission,
      searchPermissions,
      resetPermissionFilters,
      handlePageChange,
      openEnablePermissionConfirm,
      openDisablePermissionConfirm
    }
  }
}
</script>
