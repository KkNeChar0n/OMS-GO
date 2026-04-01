<template>
  <div style="position: relative;">
    <!-- Loading遮罩层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <div class="filter-row">
        <div class="filter-item">
          <label for="initiatedFlowIdFilter">ID</label>
          <input type="number" id="initiatedFlowIdFilter" v-model="filters.id" placeholder="请输入ID">
        </div>
        <div class="filter-item">
          <label for="initiatedFlowTypeFilter">审批流类型</label>
          <select id="initiatedFlowTypeFilter" v-model="filters.approval_flow_type_id">
            <option value="">全部</option>
            <option v-for="type in approvalFlowTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="initiatedFlowStatusFilter">状态</label>
          <select id="initiatedFlowStatusFilter" v-model="filters.status">
            <option value="">全部</option>
            <option value="0">待审批</option>
            <option value="10">已通过</option>
            <option value="20">已驳回</option>
            <option value="99">已撤销</option>
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
          <th>审批流类型</th>
          <th>当前节点步骤</th>
          <th>创建时间</th>
          <th>状态</th>
          <th>完成时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="flow in paginatedData" :key="flow.id">
          <td>{{ flow.id }}</td>
          <td>{{ flow.flow_type_name }}</td>
          <td>{{ flow.step }}</td>
          <td>{{ flow.create_time }}</td>
          <td>{{ getFlowStatusText(flow.status) }}</td>
          <td>{{ flow.complete_time || '-' }}</td>
          <td class="action-column">
            <button v-if="flow.status === 0" class="delete-btn" @click="openCancelConfirm(flow)">撤销</button>
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

    <!-- 撤销确认弹窗 -->
    <div class="modal-overlay" v-if="showCancelConfirm">
      <div class="modal">
        <div class="modal-header">
          <h3>确认撤销</h3>
          <button class="close-btn" @click="showCancelConfirm = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>是否确认撤销该审批流？撤销后将无法恢复。</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showCancelConfirm = false">取消</button>
          <button class="delete-btn" @click="doCancel">确认撤销</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getInitiatedFlows, cancelApprovalFlow } from '../../api/approval'

export default {
  name: 'InitiatedFlows',
  props: {
    approvalFlowTypes: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const loading = ref(false)
    const flows = ref([])
    const filters = ref({
      id: '',
      approval_flow_type_id: '',
      status: ''
    })
    const currentPage = ref(1)
    const pageSize = 10
    const showCancelConfirm = ref(false)
    const currentFlow = ref(null)

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return flows.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(flows.value.length / pageSize)
    })

    const fetchData = async () => {
      loading.value = true
      try {
        const params = {}
        if (filters.value.id) params.id = filters.value.id
        if (filters.value.approval_flow_type_id) params.approval_flow_type_id = filters.value.approval_flow_type_id
        if (filters.value.status !== '') params.status = filters.value.status

        const response = await getInitiatedFlows(params)
        flows.value = response.data.data.initiated_flows || []
      } catch (error) {
        console.error('获取我发起的审批流失败:', error)
        alert(error.response?.data?.error || '获取审批流列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchData()
    }

    const handleReset = () => {
      filters.value = { id: '', approval_flow_type_id: '', status: '' }
      fetchData()
    }

    const changePage = (page) => {
      currentPage.value = page
    }

    const getFlowStatusText = (status) => {
      const statusMap = {
        0: '待审批',
        10: '已通过',
        20: '已驳回',
        99: '已撤销'
      }
      return statusMap[status] || '未知'
    }

    const openCancelConfirm = (flow) => {
      currentFlow.value = flow
      showCancelConfirm.value = true
    }

    const doCancel = async () => {
      try {
        await cancelApprovalFlow(currentFlow.value.id)
        alert('撤销成功')
        showCancelConfirm.value = false
        currentFlow.value = null
        fetchData()
      } catch (error) {
        console.error('撤销失败:', error)
        alert(error.response?.data?.error || '撤销失败')
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      loading,
      filters,
      paginatedData,
      currentPage,
      totalPages,
      showCancelConfirm,
      handleSearch,
      handleReset,
      changePage,
      getFlowStatusText,
      openCancelConfirm,
      doCancel
    }
  }
}
</script>

<style scoped>
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
