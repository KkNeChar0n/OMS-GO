<template>
  <div class="page-container" style="position: relative;">
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>角色管理</h1>
        <button class="add-btn" @click="openAddRoleModal">+ 新增角色</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="roleIdFilter">ID</label>
            <input type="number" id="roleIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="roleNameFilter">角色名称</label>
            <select id="roleNameFilter" v-model="filters.name">
              <option value="">全部</option>
              <option v-for="role in allRoles" :key="role.id" :value="role.name">{{ role.name }}</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="roleStatusFilter">状态</label>
            <select id="roleStatusFilter" v-model="filters.status">
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
            <th>角色名称</th>
            <th>角色描述</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedRoles || paginatedRoles.length === 0">
            <td colspan="6" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="role in paginatedRoles" :key="role.id" v-else>
            <td>{{ role.id }}</td>
            <td>{{ role.name }}</td>
            <td>{{ role.description || role.comment || '-' }}</td>
            <td>{{ getStatusText(role.status) }}</td>
            <td>{{ formatDate(role.created_at || role.create_time) }}</td>
            <td class="action-column">
              <button v-if="!role.is_super_admin" class="edit-btn" @click="openRolePermissionsModal(role)">权限</button>
              <button v-if="!role.is_super_admin && role.status === 1" class="edit-btn" @click="openEditRoleModal(role)">编辑</button>
              <button v-if="!role.is_super_admin && role.status === 0" class="disable-btn" @click="disableRole(role)">禁用</button>
              <button v-if="!role.is_super_admin && role.status === 1" class="enable-btn" @click="enableRole(role)">启用</button>
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

    <!-- 新增角色弹窗 -->
    <Modal :show="showAddModal" @close="closeAddModal" title="新增角色" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="roleName">角色名称 <span class="required">*</span></label>
        <input type="text" id="roleName" v-model="addForm.name" required placeholder="请输入角色名称">
      </div>
      <div class="form-group">
        <label for="roleDescription">角色描述</label>
        <textarea id="roleDescription" v-model="addForm.description" placeholder="请输入角色描述"></textarea>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeAddModal">取消</button>
        <button type="button" class="save-btn" @click="submitAddForm">确定</button>
      </template>
    </Modal>

    <!-- 编辑角色弹窗 -->
    <Modal :show="showEditModal" @close="closeEditModal" title="编辑角色" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="editRoleName">角色名称 <span class="required">*</span></label>
        <input type="text" id="editRoleName" v-model="editForm.name" required placeholder="请输入角色名称">
      </div>
      <div class="form-group">
        <label for="editRoleDescription">角色描述</label>
        <textarea id="editRoleDescription" v-model="editForm.description" placeholder="请输入角色描述"></textarea>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeEditModal">取消</button>
        <button type="button" class="save-btn" @click="submitEditForm">确定</button>
      </template>
    </Modal>

    <!-- 角色权限配置弹窗 -->
    <Modal :show="showPermissionsModal" @close="closePermissionsModal" :title="`配置角色权限 - ${currentRole.name}`" :showCancel="false" :showConfirm="false" width="800px">
      <div class="permissions-config">
        <div class="dual-selection-container">
          <!-- 可用权限列表 -->
          <div class="selection-box">
            <div class="selection-header">可用权限</div>
            <div class="selection-list">
              <div v-for="perm in availablePermissions" :key="perm.id" class="selection-item">
                <span>{{ perm.menu_name || perm.name }} - {{ perm.name }}</span>
                <button type="button" class="add-selection-btn" @click="selectPermission(perm.id)">+</button>
              </div>
              <div v-if="availablePermissions.length === 0" class="empty-message">
                无可用权限
              </div>
            </div>
          </div>

          <!-- 中间箭头 -->
          <div class="selection-arrows">
            <div style="font-size: 24px; color: #ccc;">⇄</div>
          </div>

          <!-- 已选权限列表 -->
          <div class="selection-box">
            <div class="selection-header">已选权限</div>
            <div class="selection-list">
              <div v-for="perm in selectedPermissionsList" :key="perm.id" class="selection-item">
                <span>{{ perm.menu_name || perm.name }} - {{ perm.name }}</span>
                <button type="button" class="remove-selection-btn" @click="deselectPermission(perm.id)">-</button>
              </div>
              <div v-if="selectedPermissionsList.length === 0" class="empty-message">
                未选择任何权限
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closePermissionsModal">取消</button>
        <button type="button" class="save-btn" @click="submitRolePermissions">保存</button>
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
import { getRoles, getPermissions, getRolePermissions, setRolePermissions, createRole, updateRole, updateRoleStatus } from '@/api/rbac'

export default {
  name: 'RoleManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    const roleList = ref([])
    const displayRoles = ref([])
    const allRoles = ref([])
    const filters = ref({
      id: '',
      name: '',
      status: ''
    })

    const currentPage = ref(1)
    const pageSize = ref(10)

    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showPermissionsModal = ref(false)

    const addForm = ref({
      name: '',
      description: ''
    })

    const editForm = ref({
      id: null,
      name: '',
      description: ''
    })

    const currentRole = ref({})
    const selectedPermissions = ref([])
    const permissionList = ref([])

    const availablePermissions = computed(() => {
      return permissionList.value.filter(p =>
        p.status === 0 && !selectedPermissions.value.includes(p.id)
      )
    })

    const selectedPermissionsList = computed(() => {
      return permissionList.value.filter(p =>
        selectedPermissions.value.includes(p.id)
      )
    })

    const totalPages = computed(() => {
      return Math.ceil(displayRoles.value.length / pageSize.value) || 1
    })

    const paginatedRoles = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return displayRoles.value.slice(start, end)
    })

    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN')
    }

    const fetchRoles = async () => {
      loading.value = true
      try {
        const response = await getRoles()
        roleList.value = response.data?.roles || response.data || []
        allRoles.value = roleList.value
        displayRoles.value = roleList.value
      } catch (error) {
        console.error('获取角色列表失败:', error)
        roleList.value = []
        allRoles.value = []
        displayRoles.value = []
        alert('获取角色列表失败')
      } finally {
        loading.value = false
      }
    }

    const fetchPermissions = async () => {
      try {
        const response = await getPermissions()
        permissionList.value = response.data?.permissions || response.data || []
      } catch (error) {
        console.error('获取权限列表失败:', error)
        permissionList.value = []
      }
    }

    const handleFilter = () => {
      displayRoles.value = roleList.value.filter(role => {
        if (filters.value.id && role.id != filters.value.id) {
          return false
        }
        if (filters.value.name && role.name !== filters.value.name) {
          return false
        }
        if (filters.value.status !== '' && role.status != filters.value.status) {
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
      displayRoles.value = roleList.value
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const openAddRoleModal = () => {
      addForm.value = {
        name: '',
        description: ''
      }
      showAddModal.value = true
    }

    const closeAddModal = () => {
      showAddModal.value = false
    }

    const submitAddForm = async () => {
      loading.value = true
      try {
        await createRole({
          name: addForm.value.name,
          description: addForm.value.description
        })
        alert('角色创建成功')
        closeAddModal()
        await fetchRoles()
      } catch (error) {
        console.error('创建角色失败:', error)
        alert('创建角色失败')
      } finally {
        loading.value = false
      }
    }

    const openEditRoleModal = (role) => {
      editForm.value = {
        id: role.id,
        name: role.name,
        description: role.description || role.comment || ''
      }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const submitEditForm = async () => {
      loading.value = true
      try {
        await updateRole(editForm.value.id, {
          name: editForm.value.name,
          description: editForm.value.description
        })
        alert('角色更新成功')
        closeEditModal()
        await fetchRoles()
      } catch (error) {
        console.error('更新角色失败:', error)
        alert('更新角色失败')
      } finally {
        loading.value = false
      }
    }

    const enableRole = async (role) => {
      if (!confirm(`确定要启用角色"${role.name}"吗？`)) {
        return
      }
      loading.value = true
      try {
        await updateRoleStatus(role.id, 0)
        alert('角色启用成功')
        await fetchRoles()
      } catch (error) {
        console.error('启用角色失败:', error)
        alert('启用角色失败')
      } finally {
        loading.value = false
      }
    }

    const disableRole = async (role) => {
      if (!confirm(`确定要禁用角色"${role.name}"吗？`)) {
        return
      }
      loading.value = true
      try {
        await updateRoleStatus(role.id, 1)
        alert('角色禁用成功')
        await fetchRoles()
      } catch (error) {
        console.error('禁用角色失败:', error)
        alert('禁用角色失败')
      } finally {
        loading.value = false
      }
    }

    const openRolePermissionsModal = async (role) => {
      currentRole.value = role
      try {
        const response = await getRolePermissions(role.id)
        selectedPermissions.value = response.data?.permission_ids || []
        showPermissionsModal.value = true
      } catch (error) {
        console.error('获取角色权限失败:', error)
        alert('获取角色权限失败')
      }
    }

    const closePermissionsModal = () => {
      showPermissionsModal.value = false
      currentRole.value = {}
      selectedPermissions.value = []
    }

    const selectPermission = (permissionId) => {
      if (!selectedPermissions.value.includes(permissionId)) {
        selectedPermissions.value.push(permissionId)
      }
    }

    const deselectPermission = (permissionId) => {
      const index = selectedPermissions.value.indexOf(permissionId)
      if (index > -1) {
        selectedPermissions.value.splice(index, 1)
      }
    }

    const submitRolePermissions = async () => {
      loading.value = true
      try {
        await setRolePermissions(currentRole.value.id, selectedPermissions.value)
        alert('角色权限配置成功')
        closePermissionsModal()
      } catch (error) {
        console.error('配置角色权限失败:', error)
        alert('配置角色权限失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchRoles(),
          fetchPermissions()
        ])
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      displayRoles,
      allRoles,
      filters,
      currentPage,
      totalPages,
      paginatedRoles,
      hasPermission,
      getStatusText,
      formatDate,
      handleFilter,
      handleReset,
      handlePageChange,
      showAddModal,
      showEditModal,
      showPermissionsModal,
      addForm,
      editForm,
      currentRole,
      selectedPermissions,
      permissionList,
      availablePermissions,
      selectedPermissionsList,
      openAddRoleModal,
      closeAddModal,
      submitAddForm,
      openEditRoleModal,
      closeEditModal,
      submitEditForm,
      enableRole,
      disableRole,
      openRolePermissionsModal,
      closePermissionsModal,
      selectPermission,
      deselectPermission,
      submitRolePermissions
    }
  }
}
</script>

<style scoped>
.required {
  color: #ff4d4f;
}

textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
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

.dual-selection-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.selection-box {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f9f9f9;
}

.selection-header {
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
  font-size: 14px;
}

.selection-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.selection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
}

.selection-item span {
  flex: 1;
}

.add-selection-btn,
.remove-selection-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-selection-btn {
  background: #4CAF50;
  color: white;
}

.add-selection-btn:hover {
  background: #45a049;
}

.remove-selection-btn {
  background: #f44336;
  color: white;
}

.remove-selection-btn:hover {
  background: #da190b;
}

.selection-arrows {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}
</style>
