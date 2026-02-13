<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>账号管理</h1>
        <button v-if="hasPermission('add_account')" class="add-btn" @click="openAddModal">
          新增账号
        </button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="usernameFilter">用户名</label>
            <input type="text" id="usernameFilter" v-model="filters.username" placeholder="请输入用户名">
          </div>
          <div class="filter-item">
            <label for="roleFilter">角色</label>
            <select id="roleFilter" v-model="filters.roleId">
              <option value="">全部</option>
              <option v-for="role in activeRoles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
          <div class="filter-item">
            <label for="statusFilter">状态</label>
            <select id="statusFilter" v-model="filters.status">
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

      <!-- 账号列表 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>角色</th>
            <th>创建时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedAccounts || paginatedAccounts.length === 0">
            <td colspan="6" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="account in paginatedAccounts" :key="account.id" v-else>
            <td>{{ account.id }}</td>
            <td>{{ account.username }}</td>
            <td>{{ getRoleName(account.role_id) }}</td>
            <td>{{ formatDate(account.created_at) }}</td>
            <td>{{ getStatusText(account.status) }}</td>
            <td class="action-column">
              <button
                v-if="hasPermission('edit_account')"
                class="edit-btn"
                @click="openEditModal(account)"
              >编辑</button>
              <button
                v-if="hasPermission('edit_account')"
                class="edit-btn"
                @click="openResetPasswordModal(account)"
              >重置密码</button>
              <button
                v-if="hasPermission('edit_account')"
                :class="account.status === 0 ? 'disable-btn' : 'enable-btn'"
                @click="toggleStatus(account)"
              >{{ account.status === 0 ? '禁用' : '启用' }}</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 账号表单弹窗 -->
    <Modal :show="showModal" @close="closeModal" :title="modalTitle">
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="username">用户名 <span class="required">*</span></label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            :disabled="isEditMode"
            placeholder="请输入用户名"
          >
          <small v-if="!isEditMode" style="color: #666;">用户名一旦创建不可修改</small>
        </div>

        <div class="form-group" v-if="!isEditMode">
          <label for="password">密码 <span class="required">*</span></label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            :required="!isEditMode"
            placeholder="请输入密码"
          >
        </div>

        <div class="form-group">
          <label for="roleId">角色 <span class="required">*</span></label>
          <select id="roleId" v-model="form.role_id" required>
            <option value="">请选择角色</option>
            <option v-for="role in activeRoles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditMode ? '更新' : '创建' }}</button>
          <button type="button" class="cancel-btn" @click="closeModal">取消</button>
        </div>
      </form>
    </Modal>

    <!-- 重置密码弹窗 -->
    <Modal :show="showResetPasswordModal" @close="closeResetPasswordModal" title="重置密码">
      <form @submit.prevent="submitResetPassword">
        <div class="form-group">
          <label for="newPassword">新密码 <span class="required">*</span></label>
          <input
            type="password"
            id="newPassword"
            v-model="resetPasswordForm.password"
            required
            placeholder="请输入新密码"
          >
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认密码 <span class="required">*</span></label>
          <input
            type="password"
            id="confirmPassword"
            v-model="resetPasswordForm.confirmPassword"
            required
            placeholder="请再次输入新密码"
          >
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">确认重置</button>
          <button type="button" class="cancel-btn" @click="closeResetPasswordModal">取消</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import {
  getAccounts,
  createAccount,
  updateAccount,
  updateAccountStatus,
  resetAccountPassword
} from '@/api/account'
import { getRoles } from '@/api/rbac'

export default {
  name: 'AccountManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    // 账号列表
    const accountList = ref([])
    const filters = ref({
      username: '',
      roleId: '',
      status: ''
    })

    // 分页
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 模态框
    const showModal = ref(false)
    const showResetPasswordModal = ref(false)
    const isEditMode = ref(false)
    const editingAccountId = ref(null)
    const resetPasswordAccountId = ref(null)

    // 表单
    const form = ref({
      username: '',
      password: '',
      role_id: ''
    })

    const resetPasswordForm = ref({
      password: '',
      confirmPassword: ''
    })

    // 角色列表
    const roleList = ref([])
    const activeRoles = ref([])

    // 计算属性
    const modalTitle = computed(() => isEditMode.value ? '编辑账号' : '新增账号')

    const filteredAccounts = computed(() => {
      if (!accountList.value) return []

      return accountList.value.filter(account => {
        if (filters.value.username && !account.username.includes(filters.value.username)) {
          return false
        }
        if (filters.value.roleId && account.role_id != filters.value.roleId) {
          return false
        }
        if (filters.value.status !== '' && account.status != filters.value.status) {
          return false
        }
        return true
      })
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredAccounts.value.length / pageSize.value) || 1
    })

    const paginatedAccounts = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredAccounts.value.slice(start, end)
    })

    // 权限检查
    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    // 工具函数
    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    const getRoleName = (roleId) => {
      const role = roleList.value.find(r => r.id === roleId)
      return role ? role.name : '-'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN')
    }

    // 数据获取
    const fetchAccounts = async () => {
      loading.value = true
      try {
        const response = await getAccounts()
        accountList.value = response.data || []
      } catch (error) {
        console.error('获取账号列表失败:', error)
        alert('获取账号列表失败')
      } finally {
        loading.value = false
      }
    }

    const fetchRoles = async () => {
      try {
        const response = await getRoles()
        roleList.value = response.data || []
        activeRoles.value = roleList.value.filter(r => r.status === 0)
      } catch (error) {
        console.error('获取角色列表失败:', error)
      }
    }

    // 筛选和分页
    const handleFilter = () => {
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        username: '',
        roleId: '',
        status: ''
      }
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    // 模态框操作
    const openAddModal = () => {
      isEditMode.value = false
      form.value = {
        username: '',
        password: '',
        role_id: ''
      }
      showModal.value = true
    }

    const openEditModal = (account) => {
      isEditMode.value = true
      editingAccountId.value = account.id
      form.value = {
        username: account.username,
        password: '',
        role_id: account.role_id
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      form.value = {
        username: '',
        password: '',
        role_id: ''
      }
    }

    const submitForm = async () => {
      loading.value = true
      try {
        const data = {
          username: form.value.username,
          role_id: parseInt(form.value.role_id)
        }

        if (!isEditMode.value) {
          data.password = form.value.password
        }

        if (isEditMode.value) {
          await updateAccount(editingAccountId.value, data)
          alert('账号更新成功')
        } else {
          await createAccount(data)
          alert('账号创建成功')
        }

        closeModal()
        await fetchAccounts()
      } catch (error) {
        console.error('提交账号表单失败:', error)
        alert(isEditMode.value ? '账号更新失败' : '账号创建失败')
      } finally {
        loading.value = false
      }
    }

    const toggleStatus = async (account) => {
      const newStatus = account.status === 0 ? 1 : 0
      const action = newStatus === 0 ? '启用' : '禁用'

      if (!confirm(`确定要${action}账号"${account.username}"吗？`)) {
        return
      }

      loading.value = true
      try {
        await updateAccountStatus(account.id, newStatus)
        alert(`账号${action}成功`)
        await fetchAccounts()
      } catch (error) {
        console.error(`${action}账号失败:`, error)
        alert(`${action}账号失败`)
      } finally {
        loading.value = false
      }
    }

    // 重置密码操作
    const openResetPasswordModal = (account) => {
      resetPasswordAccountId.value = account.id
      resetPasswordForm.value = {
        password: '',
        confirmPassword: ''
      }
      showResetPasswordModal.value = true
    }

    const closeResetPasswordModal = () => {
      showResetPasswordModal.value = false
      resetPasswordForm.value = {
        password: '',
        confirmPassword: ''
      }
    }

    const submitResetPassword = async () => {
      if (resetPasswordForm.value.password !== resetPasswordForm.value.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      loading.value = true
      try {
        await resetAccountPassword(resetPasswordAccountId.value, resetPasswordForm.value.password)
        alert('密码重置成功')
        closeResetPasswordModal()
      } catch (error) {
        console.error('重置密码失败:', error)
        alert('重置密码失败')
      } finally {
        loading.value = false
      }
    }

    // 初始化
    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchAccounts(),
          fetchRoles()
        ])
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      accountList,
      filters,
      currentPage,
      totalPages,
      paginatedAccounts,
      showModal,
      showResetPasswordModal,
      isEditMode,
      modalTitle,
      form,
      resetPasswordForm,
      roleList,
      activeRoles,
      hasPermission,
      getStatusText,
      getRoleName,
      formatDate,
      fetchAccounts,
      handleFilter,
      handleReset,
      handlePageChange,
      openAddModal,
      openEditModal,
      closeModal,
      submitForm,
      toggleStatus,
      openResetPasswordModal,
      closeResetPasswordModal,
      submitResetPassword
    }
  }
}
</script>

<style scoped>
.required {
  color: #ff4d4f;
}

small {
  display: block;
  margin-top: 5px;
}
</style>
