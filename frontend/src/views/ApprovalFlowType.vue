<template>
  <div class="approval-flow-type-page" style="position: relative;">
    <!-- Loading遮罩层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div class="page-header">
      <h1>审批流类型</h1>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <div class="filter-row">
        <div class="filter-item">
          <label for="flowTypeIdFilter">ID</label>
          <input type="number" id="flowTypeIdFilter" v-model="filters.id" placeholder="请输入ID">
        </div>
        <div class="filter-item">
          <label for="flowTypeNameFilter">类型名称</label>
          <select id="flowTypeNameFilter" v-model="filters.name">
            <option value="">全部</option>
            <option v-for="type in approvalFlowTypes" :key="type.id" :value="type.name">{{ type.name }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="flowTypeStatusFilter">状态</label>
          <select id="flowTypeStatusFilter" v-model="filters.status">
            <option value="">全部</option>
            <option value="0">启用</option>
            <option value="1">禁用</option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button class="search-btn" @click="handleSearch">搜索</button>
        <button class="reset-btn" @click="handleReset">重置</button>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="flowType in paginatedData" :key="flowType.id">
          <td>{{ flowType.id }}</td>
          <td>{{ flowType.name }}</td>
          <td>{{ flowType.status === 0 ? '启用' : '禁用' }}</td>
          <td class="action-column">
            <button v-if="flowType.status === 1" class="enable-btn" @click="openEnableConfirm(flowType)">启用</button>
            <button v-if="flowType.status === 0" class="disable-btn" @click="openDisableConfirm(flowType)">禁用</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" @click="changePage(1)" :disabled="currentPage === 1">首页</button>
      <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
      <button class="page-btn" @click="changePage(totalPages)" :disabled="currentPage === totalPages">末页</button>
    </div>

    <!-- 启用确认弹窗 -->
    <div class="modal-overlay" v-if="showEnableConfirm">
      <div class="modal">
        <div class="modal-header">
          <h2>确认启用</h2>
        </div>
        <div class="modal-body">
          <p>是否启用该审批流类型？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showEnableConfirm = false">取消</button>
          <button class="confirm-btn" @click="doEnable">确认</button>
        </div>
      </div>
    </div>

    <!-- 禁用确认弹窗 -->
    <div class="modal-overlay" v-if="showDisableConfirm">
      <div class="modal">
        <div class="modal-header">
          <h2>确认禁用</h2>
        </div>
        <div class="modal-body">
          <p>是否禁用该审批流类型？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDisableConfirm = false">取消</button>
          <button class="delete-btn" @click="doDisable">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getApprovalFlowTypes, updateApprovalFlowTypeStatus } from '../api/approval'
import { usePermissionStore } from '../store/modules/permission'

export default {
  name: 'ApprovalFlowType',
  data() {
    return {
      loading: false,
      approvalFlowTypes: [],
      filteredData: [],
      filters: {
        id: '',
        name: '',
        status: ''
      },
      currentPage: 1,
      pageSize: 10,
      showEnableConfirm: false,
      showDisableConfirm: false,
      currentFlowType: null
    }
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredData.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.pageSize)
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    hasPermission(actionId) {
      const permissionStore = usePermissionStore()
      return permissionStore.hasPermission(actionId)
    },
    async fetchData() {
      this.loading = true
      try {
        const params = {}
        if (this.filters.id) params.id = this.filters.id
        if (this.filters.name) params.name = this.filters.name
        if (this.filters.status !== '') params.status = this.filters.status

        const response = await getApprovalFlowTypes(params)
        this.approvalFlowTypes = response.data.data.approval_flow_types || []
        this.filteredData = this.approvalFlowTypes
      } catch (error) {
        console.error('获取审批流类型失败:', error)
        alert(error.response?.data?.error || '获取审批流类型失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.fetchData()
      this.currentPage = 1
    },
    handleReset() {
      this.filters = {
        id: '',
        name: '',
        status: ''
      }
      this.fetchData()
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    openEnableConfirm(flowType) {
      this.currentFlowType = flowType
      this.showEnableConfirm = true
    },
    openDisableConfirm(flowType) {
      this.currentFlowType = flowType
      this.showDisableConfirm = true
    },
    async doEnable() {
      try {
        await updateApprovalFlowTypeStatus(this.currentFlowType.id, { status: 0 })
        alert('审批流类型已启用')
        this.showEnableConfirm = false
        this.currentFlowType = null
        await this.fetchData()
      } catch (error) {
        console.error('启用审批流类型失败:', error)
        alert(error.response?.data?.error || '启用审批流类型失败')
      }
    },
    async doDisable() {
      try {
        await updateApprovalFlowTypeStatus(this.currentFlowType.id, { status: 1 })
        alert('审批流类型已禁用')
        this.showDisableConfirm = false
        this.currentFlowType = null
        await this.fetchData()
      } catch (error) {
        console.error('禁用审批流类型失败:', error)
        alert(error.response?.data?.error || '禁用审批流类型失败')
      }
    }
  }
}
</script>

<style scoped>
.approval-flow-type-page {
  padding: 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 10px;
  color: #666;
}
</style>
