<template>
  <div class="page-container" style="position: relative;">
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>菜单管理</h1>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="menuIdFilter">ID</label>
            <input type="number" id="menuIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="menuNameFilter">菜单名称</label>
            <select id="menuNameFilter" v-model="filters.name">
              <option value="">全部</option>
              <option v-for="menu in allMenus" :key="menu.id" :value="menu.name">{{ menu.name }}</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="menuStatusFilter">状态</label>
            <select id="menuStatusFilter" v-model="filters.status">
              <option value="">全部</option>
              <option value="0">启用</option>
              <option value="1">禁用</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="search-btn" @click="handleFilter">搜索</button>
          <button class="reset-btn" @click="handleReset">重置</button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>菜单名称</th>
            <th>上级菜单</th>
            <th>排序</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedMenus || paginatedMenus.length === 0">
            <td colspan="6" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="menu in paginatedMenus" :key="menu.id" v-else>
            <td>{{ menu.id }}</td>
            <td>{{ menu.name }}</td>
            <td>{{ menu.parent_name || '-' }}</td>
            <td>{{ menu.sort_order || menu.sort || 0 }}</td>
            <td>{{ getStatusText(menu.status) }}</td>
            <td class="action-column">
              <button v-if="menu.status === 1" class="edit-btn" @click="openEditMenuModal(menu)">编辑</button>
              <button v-if="menu.status === 1" class="enable-btn" @click="enableMenu(menu)">启用</button>
              <button v-if="menu.status === 0" class="disable-btn" @click="disableMenu(menu)">禁用</button>
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

    <!-- 编辑菜单弹窗 -->
    <Modal :show="showEditModal" @close="closeEditModal" title="编辑菜单" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="menuName">菜单名称</label>
        <input type="text" id="menuName" v-model="editForm.name" disabled placeholder="菜单名称">
        <small style="color: #666;">菜单名称不可修改</small>
      </div>
      <div class="form-group">
        <label for="menuRoute">路由路径</label>
        <input type="text" id="menuRoute" v-model="editForm.route" placeholder="请输入路由路径">
      </div>
      <div class="form-group">
        <label for="menuIcon">图标</label>
        <input type="text" id="menuIcon" v-model="editForm.icon" placeholder="请输入图标名称">
      </div>
      <div class="form-group">
        <label for="menuSort">排序</label>
        <input type="number" id="menuSort" v-model="editForm.sort" placeholder="请输入排序值">
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeEditModal">取消</button>
        <button type="button" class="save-btn" @click="submitEditForm">确定</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import { getMenuManagement, updateMenu, updateMenuStatus } from '@/api/rbac'

export default {
  name: 'MenuManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    const menuList = ref([])
    const displayMenus = ref([])
    const allMenus = ref([])
    const filters = ref({
      id: '',
      name: '',
      status: ''
    })

    const currentPage = ref(1)
    const pageSize = ref(10)

    const showEditModal = ref(false)
    const editForm = ref({
      id: null,
      name: '',
      route: '',
      icon: '',
      sort: ''
    })

    const totalPages = computed(() => {
      return Math.ceil(displayMenus.value.length / pageSize.value) || 1
    })

    const paginatedMenus = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return displayMenus.value.slice(start, end)
    })

    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    const fetchMenus = async () => {
      loading.value = true
      try {
        const response = await getMenuManagement()
        menuList.value = response.data?.menus || response.data || []
        allMenus.value = menuList.value
        displayMenus.value = menuList.value
      } catch (error) {
        console.error('获取菜单列表失败:', error)
        menuList.value = []
        allMenus.value = []
        displayMenus.value = []
        alert('获取菜单列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleFilter = () => {
      displayMenus.value = menuList.value.filter(menu => {
        if (filters.value.id && menu.id != filters.value.id) {
          return false
        }
        if (filters.value.name && menu.name !== filters.value.name) {
          return false
        }
        if (filters.value.status !== '' && menu.status != filters.value.status) {
          return false
        }
        return true
      })
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        id: '',
        name: '',
        status: ''
      }
      displayMenus.value = menuList.value
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const openEditMenuModal = (menu) => {
      editForm.value = {
        id: menu.id,
        name: menu.name,
        route: menu.route || '',
        icon: menu.icon || '',
        sort: menu.sort_order || menu.sort || 0
      }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editForm.value = {
        id: null,
        name: '',
        route: '',
        icon: '',
        sort: ''
      }
    }

    const submitEditForm = async () => {
      loading.value = true
      try {
        await updateMenu(editForm.value.id, {
          route: editForm.value.route,
          icon: editForm.value.icon,
          sort: parseInt(editForm.value.sort) || 0
        })
        alert('菜单更新成功')
        closeEditModal()
        await fetchMenus()
      } catch (error) {
        console.error('更新菜单失败:', error)
        alert('更新菜单失败')
      } finally {
        loading.value = false
      }
    }

    const enableMenu = async (menu) => {
      if (!confirm(`确定要启用菜单"${menu.name}"吗？`)) {
        return
      }
      loading.value = true
      try {
        await updateMenuStatus(menu.id, 0)
        alert('菜单启用成功')
        await fetchMenus()
      } catch (error) {
        console.error('启用菜单失败:', error)
        alert('启用菜单失败')
      } finally {
        loading.value = false
      }
    }

    const disableMenu = async (menu) => {
      if (!confirm(`确定要禁用菜单"${menu.name}"吗？`)) {
        return
      }
      loading.value = true
      try {
        await updateMenuStatus(menu.id, 1)
        alert('菜单禁用成功')
        await fetchMenus()
      } catch (error) {
        console.error('禁用菜单失败:', error)
        alert('禁用菜单失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      loading.value = true
      try {
        await fetchMenus()
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      displayMenus,
      allMenus,
      filters,
      currentPage,
      totalPages,
      paginatedMenus,
      hasPermission,
      getStatusText,
      handleFilter,
      handleReset,
      handlePageChange,
      showEditModal,
      editForm,
      openEditMenuModal,
      closeEditModal,
      submitEditForm,
      enableMenu,
      disableMenu
    }
  }
}
</script>

<style scoped>
small {
  display: block;
  margin-top: 5px;
}
</style>
