<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>账号管理</h1>
        <button v-if="hasPermission('add_account')" class="add-btn" @click="openAddModal">+ 新增账号</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="accountIdFilter">ID</label>
            <input type="number" id="accountIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="accountPhoneFilter">手机号</label>
            <input type="text" id="accountPhoneFilter" v-model="filters.phone" placeholder="请输入手机号">
          </div>
          <div class="filter-item">
            <label for="accountRoleFilter">角色</label>
            <select id="accountRoleFilter" v-model="filters.role_id">
              <option value="">全部</option>
              <option v-for="role in allRoles" :key="role.id" :value="role.id">{{ role.name }}</option>
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
            <th>姓名</th>
            <th>手机号</th>
            <th>角色</th>
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
            <td>{{ account.name || '-' }}</td>
            <td>{{ account.phone || '-' }}</td>
            <td>{{ getRoleName(account.role_id) }}</td>
            <td>{{ getStatusText(account.status) }}</td>
            <td class="action-column">
              <button v-if="hasPermission('edit_account')" class="edit-btn" @click="openEditModal(account)">编辑</button>
              <button v-if="hasPermission('enable_account') && account.status === 1" class="enable-btn" @click="enableAccount(account.id)">启用</button>
              <button v-if="hasPermission('disable_account') && account.status === 0" class="disable-btn" @click="disableAccount(account.id)">禁用</button>
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

    <!-- 新增账号弹窗 -->
    <Modal :show="showModal && !isEditMode" @close="closeModal" title="新增账号" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="username">账号 <span class="required">*</span></label>
        <input
          type="text"
          id="username"
          v-model="form.username"
          required
          placeholder="请输入账号"
        >
      </div>

      <div class="form-group">
        <label for="password">密码 <span class="required">*</span></label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          required
          placeholder="请输入密码"
        >
      </div>

      <div class="form-group">
        <label for="name">姓名 <span class="required">*</span></label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          required
          placeholder="请输入姓名"
        >
      </div>

      <div class="form-group">
        <label for="phone">手机号 <span class="required">*</span></label>
        <input
          type="text"
          id="phone"
          v-model="form.phone"
          required
          placeholder="请输入手机号"
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

      <template #footer>
        <button type="button" class="cancel-btn" @click="closeModal">取消</button>
        <button type="button" class="save-btn" @click="submitForm">确定</button>
      </template>
    </Modal>

    <!-- 编辑账号弹窗 -->
    <Modal :show="showModal && isEditMode" @close="closeModal" title="编辑账号" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="editPassword">密码 <span class="required">*</span></label>
        <input
          type="password"
          id="editPassword"
          v-model="form.password"
          required
          placeholder="请输入新密码"
        >
      </div>

      <div class="form-group">
        <label for="editName">姓名 <span class="required">*</span></label>
        <input
          type="text"
          id="editName"
          v-model="form.name"
          required
          placeholder="请输入姓名"
        >
      </div>

      <div class="form-group">
        <label for="editPhone">手机号 <span class="required">*</span></label>
        <input
          type="text"
          id="editPhone"
          v-model="form.phone"
          required
          placeholder="请输入手机号"
        >
      </div>

      <div class="form-group">
        <label for="editRoleId">角色 <span class="required">*</span></label>
        <select id="editRoleId" v-model="form.role_id" required>
          <option value="">请选择角色</option>
          <option v-for="role in activeRoles" :key="role.id" :value="role.id">
            {{ role.name }}
          </option>
        </select>
      </div>

      <template #footer>
        <button type="button" class="cancel-btn" @click="closeModal">取消</button>
        <button type="button" class="save-btn" @click="submitForm">确定</button>
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
    const displayAccounts = ref([])
    const filters = ref({
      id: '',
      phone: '',
      role_id: ''
    })

    // 分页
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 模态框
    const showModal = ref(false)
    const isEditMode = ref(false)
    const editingAccountId = ref(null)

    // 表单
    const form = ref({
      username: '',
      password: '',
      name: '',
      phone: '',
      role_id: ''
    })

    // 角色列表
    const roleList = ref([])
    const allRoles = ref([])
    const activeRoles = ref([])

    // 计算属性
    const modalTitle = computed(() => isEditMode.value ? '编辑账号' : '新增账号')

    const totalPages = computed(() => {
      return Math.ceil(displayAccounts.value.length / pageSize.value) || 1
    })

    const paginatedAccounts = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return displayAccounts.value.slice(start, end)
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
        accountList.value = response.data?.accounts || response.data || []
        displayAccounts.value = accountList.value
      } catch (error) {
        console.error('获取账号列表失败:', error)
        accountList.value = []
        displayAccounts.value = []
        alert('获取账号列表失败')
      } finally {
        loading.value = false
      }
    }

    const fetchRoles = async () => {
      try {
        const response = await getRoles()
        roleList.value = response.data?.roles || response.data || []
        allRoles.value = roleList.value
        activeRoles.value = roleList.value.filter(r => r.status === 0)
      } catch (error) {
        console.error('获取角色列表失败:', error)
        roleList.value = []
        allRoles.value = []
        activeRoles.value = []
      }
    }

    // 筛选和分页
    const handleFilter = () => {
      displayAccounts.value = accountList.value.filter(account => {
        if (filters.value.id && account.id != filters.value.id) {
          return false
        }
        if (filters.value.phone && !account.phone?.includes(filters.value.phone)) {
          return false
        }
        if (filters.value.role_id && account.role_id != filters.value.role_id) {
          return false
        }
        return true
      })
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        id: '',
        phone: '',
        role_id: ''
      }
      displayAccounts.value = accountList.value
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
        name: '',
        phone: '',
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
        name: account.name,
        phone: account.phone,
        role_id: account.role_id
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      form.value = {
        username: '',
        password: '',
        name: '',
        phone: '',
        role_id: ''
      }
    }

    const submitForm = async () => {
      loading.value = true
      try {
        const data = {
          username: form.value.username,
          password: form.value.password,
          name: form.value.name,
          phone: form.value.phone,
          role_id: parseInt(form.value.role_id)
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

    const enableAccount = async (accountId) => {
      loading.value = true
      try {
        await updateAccountStatus(accountId, 0)
        alert('账号启用成功')
        await fetchAccounts()
      } catch (error) {
        console.error('启用账号失败:', error)
        alert('启用账号失败')
      } finally {
        loading.value = false
      }
    }

    const disableAccount = async (accountId) => {
      loading.value = true
      try {
        await updateAccountStatus(accountId, 1)
        alert('账号禁用成功')
        await fetchAccounts()
      } catch (error) {
        console.error('禁用账号失败:', error)
        alert('禁用账号失败')
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
      isEditMode,
      modalTitle,
      form,
      roleList,
      allRoles,
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
      enableAccount,
      disableAccount
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
