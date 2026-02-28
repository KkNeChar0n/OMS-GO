<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>权限管理</h1>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'roles' }]"
          @click="activeTab = 'roles'"
        >
          角色管理
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'permissions' }]"
          @click="activeTab = 'permissions'"
        >
          权限管理
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'menus' }]"
          @click="activeTab = 'menus'"
        >
          菜单管理
        </button>
      </div>

      <!-- 角色管理标签页 -->
      <div v-show="activeTab === 'roles'" class="tab-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>角色名称</th>
              <th>描述</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!roleList || roleList.length === 0">
              <td colspan="5" style="text-align: center; padding: 40px;">暂无数据</td>
            </tr>
            <tr v-for="role in roleList" :key="role.id" v-else>
              <td>{{ role.id }}</td>
              <td>{{ role.name }}</td>
              <td>{{ role.description || '-' }}</td>
              <td>{{ getStatusText(role.status) }}</td>
              <td class="action-column">
                <button
                  v-if="hasPermission('edit_role')"
                  class="edit-btn"
                  @click="openRolePermissionsModal(role)"
                >配置权限</button>
                <button
                  v-if="hasPermission('edit_role')"
                  :class="role.status === 0 ? 'disable-btn' : 'enable-btn'"
                  @click="toggleRoleStatus(role)"
                >{{ role.status === 0 ? '禁用' : '启用' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 权限管理标签页 -->
      <div v-show="activeTab === 'permissions'" class="tab-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>权限名称</th>
              <th>权限标识</th>
              <th>描述</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!permissionList || permissionList.length === 0">
              <td colspan="6" style="text-align: center; padding: 40px;">暂无数据</td>
            </tr>
            <tr v-for="permission in permissionList" :key="permission.id" v-else>
              <td>{{ permission.id }}</td>
              <td>{{ permission.name }}</td>
              <td>{{ permission.code }}</td>
              <td>{{ permission.description || '-' }}</td>
              <td>{{ getStatusText(permission.status) }}</td>
              <td class="action-column">
                <button
                  v-if="hasPermission('edit_permission')"
                  :class="permission.status === 0 ? 'disable-btn' : 'enable-btn'"
                  @click="togglePermissionStatus(permission)"
                >{{ permission.status === 0 ? '禁用' : '启用' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 菜单管理标签页 -->
      <div v-show="activeTab === 'menus'" class="tab-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>菜单名称</th>
              <th>路由路径</th>
              <th>图标</th>
              <th>排序</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!menuList || menuList.length === 0">
              <td colspan="7" style="text-align: center; padding: 40px;">暂无数据</td>
            </tr>
            <tr v-for="menu in menuList" :key="menu.id" v-else>
              <td>{{ menu.id }}</td>
              <td>{{ menu.name }}</td>
              <td>{{ menu.route || '-' }}</td>
              <td>{{ menu.icon || '-' }}</td>
              <td>{{ menu.sort || 0 }}</td>
              <td>{{ getStatusText(menu.status) }}</td>
              <td class="action-column">
                <button
                  v-if="hasPermission('edit_menu')"
                  class="edit-btn"
                  @click="openEditMenuModal(menu)"
                >编辑</button>
                <button
                  v-if="hasPermission('edit_menu')"
                  :class="menu.status === 0 ? 'disable-btn' : 'enable-btn'"
                  @click="toggleMenuStatus(menu)"
                >{{ menu.status === 0 ? '禁用' : '启用' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 角色权限配置弹窗 -->
    <Modal :show="showRolePermissionsModal" @close="closeRolePermissionsModal" :title="`配置角色权限 - ${currentRole.name}`" :showCancel="false" :showConfirm="false">
      <div class="permissions-config">
        <div class="permissions-list">
          <div v-for="permission in permissionList" :key="permission.id" class="permission-item">
            <label>
              <input
                type="checkbox"
                :value="permission.id"
                v-model="selectedPermissions"
                :disabled="permission.status !== 0"
              >
              <span :class="{ disabled: permission.status !== 0 }">
                {{ permission.name }}
                <small v-if="permission.description">({{ permission.description }})</small>
              </span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeRolePermissionsModal">取消</button>
        <button type="button" class="save-btn" @click="submitRolePermissions">确定</button>
      </template>
    </Modal>

    <!-- 菜单编辑弹窗 -->
    <Modal :show="showMenuModal" @close="closeMenuModal" title="编辑菜单" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="menuName">菜单名称</label>
        <input
          type="text"
          id="menuName"
          v-model="menuForm.name"
          disabled
          placeholder="菜单名称"
        >
        <small style="color: #666;">菜单名称不可修改</small>
      </div>

      <div class="form-group">
        <label for="menuRoute">路由路径</label>
        <input
          type="text"
          id="menuRoute"
          v-model="menuForm.route"
          placeholder="请输入路由路径"
        >
      </div>

      <div class="form-group">
        <label for="menuIcon">图标</label>
        <input
          type="text"
          id="menuIcon"
          v-model="menuForm.icon"
          placeholder="请输入图标名称"
        >
      </div>

      <div class="form-group">
        <label for="menuSort">排序</label>
        <input
          type="number"
          id="menuSort"
          v-model="menuForm.sort"
          placeholder="请输入排序值"
        >
      </div>

      <template #footer>
        <button type="button" class="cancel-btn" @click="closeMenuModal">取消</button>
        <button type="button" class="save-btn" @click="submitMenuForm">确定</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import {
  getRoles,
  getPermissions,
  getMenuManagement,
  updateMenu,
  getRolePermissions,
  updateRolePermissions
} from '@/api/rbac'
import request from '@/utils/request'

export default {
  name: 'RBACManagement',
  components: {
    Modal,
    Loading
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)
    const activeTab = ref('roles')

    // 角色相关
    const roleList = ref([])
    const showRolePermissionsModal = ref(false)
    const currentRole = ref({})
    const selectedPermissions = ref([])

    // 权限相关
    const permissionList = ref([])

    // 菜单相关
    const menuList = ref([])
    const showMenuModal = ref(false)
    const editingMenuId = ref(null)
    const menuForm = ref({
      name: '',
      route: '',
      icon: '',
      sort: ''
    })

    // 权限检查
    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    // 工具函数
    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    // 角色相关方法
    const fetchRoles = async () => {
      loading.value = true
      try {
        const response = await getRoles()
        roleList.value = response.roles || response.data || []
      } catch (error) {
        console.error('获取角色列表失败:', error)
        alert('获取角色列表失败')
      } finally {
        loading.value = false
      }
    }

    const openRolePermissionsModal = async (role) => {
      currentRole.value = role
      try {
        const response = await getRolePermissions(role.id)
        selectedPermissions.value = response.permission_ids || response.data?.permission_ids || []
        showRolePermissionsModal.value = true
      } catch (error) {
        console.error('获取角色权限失败:', error)
        alert('获取角色权限失败')
      }
    }

    const closeRolePermissionsModal = () => {
      showRolePermissionsModal.value = false
      currentRole.value = {}
      selectedPermissions.value = []
    }

    const submitRolePermissions = async () => {
      loading.value = true
      try {
        await updateRolePermissions(currentRole.value.id, {
          permission_ids: selectedPermissions.value
        })
        alert('角色权限配置成功')
        closeRolePermissionsModal()
      } catch (error) {
        console.error('配置角色权限失败:', error)
        alert('配置角色权限失败')
      } finally {
        loading.value = false
      }
    }

    const toggleRoleStatus = async (role) => {
      const newStatus = role.status === 0 ? 1 : 0
      const action = newStatus === 0 ? '启用' : '禁用'

      if (!confirm(`确定要${action}角色"${role.name}"吗？`)) {
        return
      }

      loading.value = true
      try {
        await request.put(`/roles/${role.id}/status`, { status: newStatus })
        alert(`角色${action}成功`)
        await fetchRoles()
      } catch (error) {
        console.error(`${action}角色失败:`, error)
        alert(`${action}角色失败`)
      } finally {
        loading.value = false
      }
    }

    // 权限相关方法
    const fetchPermissions = async () => {
      loading.value = true
      try {
        const response = await getPermissions()
        permissionList.value = response.permissions || response.data || []
      } catch (error) {
        console.error('获取权限列表失败:', error)
        alert('获取权限列表失败')
      } finally {
        loading.value = false
      }
    }

    const togglePermissionStatus = async (permission) => {
      const newStatus = permission.status === 0 ? 1 : 0
      const action = newStatus === 0 ? '启用' : '禁用'

      if (!confirm(`确定要${action}权限"${permission.name}"吗？`)) {
        return
      }

      loading.value = true
      try {
        await request.put(`/permissions/${permission.id}/status`, { status: newStatus })
        alert(`权限${action}成功`)
        await fetchPermissions()
      } catch (error) {
        console.error(`${action}权限失败:`, error)
        alert(`${action}权限失败`)
      } finally {
        loading.value = false
      }
    }

    // 菜单相关方法
    const fetchMenus = async () => {
      loading.value = true
      try {
        const response = await getMenuManagement()
        menuList.value = response.menus || response.data || []
      } catch (error) {
        console.error('获取菜单列表失败:', error)
        alert('获取菜单列表失败')
      } finally {
        loading.value = false
      }
    }

    const openEditMenuModal = (menu) => {
      editingMenuId.value = menu.id
      menuForm.value = {
        name: menu.name,
        route: menu.route || '',
        icon: menu.icon || '',
        sort: menu.sort || 0
      }
      showMenuModal.value = true
    }

    const closeMenuModal = () => {
      showMenuModal.value = false
      menuForm.value = {
        name: '',
        route: '',
        icon: '',
        sort: ''
      }
    }

    const submitMenuForm = async () => {
      loading.value = true
      try {
        await updateMenu(editingMenuId.value, {
          route: menuForm.value.route,
          icon: menuForm.value.icon,
          sort: parseInt(menuForm.value.sort) || 0
        })
        alert('菜单更新成功')
        closeMenuModal()
        await fetchMenus()
      } catch (error) {
        console.error('更新菜单失败:', error)
        alert('更新菜单失败')
      } finally {
        loading.value = false
      }
    }

    const toggleMenuStatus = async (menu) => {
      const newStatus = menu.status === 0 ? 1 : 0
      const action = newStatus === 0 ? '启用' : '禁用'

      if (!confirm(`确定要${action}菜单"${menu.name}"吗？`)) {
        return
      }

      loading.value = true
      try {
        await request.put(`/menu-management/${menu.id}/status`, { status: newStatus })
        alert(`菜单${action}成功`)
        await fetchMenus()
      } catch (error) {
        console.error(`${action}菜单失败:`, error)
        alert(`${action}菜单失败`)
      } finally {
        loading.value = false
      }
    }

    // 初始化
    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchRoles(),
          fetchPermissions(),
          fetchMenus()
        ])
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      activeTab,
      // 角色相关
      roleList,
      showRolePermissionsModal,
      currentRole,
      selectedPermissions,
      openRolePermissionsModal,
      closeRolePermissionsModal,
      submitRolePermissions,
      toggleRoleStatus,
      // 权限相关
      permissionList,
      togglePermissionStatus,
      // 菜单相关
      menuList,
      showMenuModal,
      menuForm,
      openEditMenuModal,
      closeMenuModal,
      submitMenuForm,
      toggleMenuStatus,
      // 工具函数
      hasPermission,
      getStatusText
    }
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: bold;
}

.tab-content {
  padding: 20px 0;
}

.permissions-config {
  padding: 10px 0;
}

.permissions-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.permission-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.permission-item:last-child {
  border-bottom: none;
}

.permission-item label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.permission-item input[type="checkbox"] {
  margin-right: 10px;
  cursor: pointer;
}

.permission-item span {
  flex: 1;
}

.permission-item span.disabled {
  color: #999;
}

.permission-item small {
  color: #666;
  margin-left: 10px;
}
</style>
