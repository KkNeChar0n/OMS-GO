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
          <label for="pendingFlowIdFilter">ID</label>
          <input type="number" id="pendingFlowIdFilter" v-model="filters.id" placeholder="请输入ID">
        </div>
        <div class="filter-item">
          <label for="pendingFlowFlowIdFilter">审批流ID</label>
          <input type="number" id="pendingFlowFlowIdFilter" v-model="filters.approval_flow_id" placeholder="请输入审批流ID">
        </div>
        <div class="filter-item">
          <label for="pendingFlowTypeFilter">审批流类型</label>
          <select id="pendingFlowTypeFilter" v-model="filters.approval_flow_type_id">
            <option value="">全部</option>
            <option v-for="type in approvalFlowTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
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
          <th>审批流ID</th>
          <th>审批流类型</th>
          <th>节点类型</th>
          <th>节点排序</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="flow in paginatedData" :key="flow.id">
          <td>{{ flow.id }}</td>
          <td>{{ flow.approval_flow_management_id }}</td>
          <td>{{ flow.flow_type_name }}</td>
          <td>{{ flow.node_type === 0 ? '会签' : '或签' }}</td>
          <td>{{ flow.node_sort }}</td>
          <td>{{ flow.create_time }}</td>
          <td class="action-column">
            <button class="view-btn" @click="openApprovalDetail(flow)">详情</button>
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

    <!-- 审批详情抽屉 -->
    <ApprovalDetailDrawer
      v-if="showDetailDrawer"
      :detail="currentDetail"
      @close="closeApprovalDetail"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getPendingFlows, getApprovalFlowDetail, approveFlow, rejectFlow } from '../../api/approval'
import ApprovalDetailDrawer from './ApprovalDetailDrawer.vue'

export default {
  name: 'PendingFlows',
  components: {
    ApprovalDetailDrawer
  },
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
      approval_flow_id: '',
      approval_flow_type_id: ''
    })
    const currentPage = ref(1)
    const pageSize = 10
    const showDetailDrawer = ref(false)
    const currentDetail = ref(null)

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
        if (filters.value.approval_flow_id) params.approval_flow_id = filters.value.approval_flow_id
        if (filters.value.approval_flow_type_id) params.approval_flow_type_id = filters.value.approval_flow_type_id

        const response = await getPendingFlows(params)
        flows.value = response.data.data.pending_flows || []
      } catch (error) {
        console.error('获取待我审批列表失败:', error)
        alert(error.response?.data?.error || '获取列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchData()
    }

    const handleReset = () => {
      filters.value = { id: '', approval_flow_id: '', approval_flow_type_id: '' }
      fetchData()
    }

    const changePage = (page) => {
      currentPage.value = page
    }

    const openApprovalDetail = async (flow) => {
      try {
        const response = await getApprovalFlowDetail(flow.approval_flow_management_id)
        const detailData = response.data.data
        currentDetail.value = {
          ...flow,
          ...detailData.user_approval,
          flow_info: detailData.flow_info,
          all_nodes: detailData.all_nodes,
          refund_order_info: detailData.refund_order_info
        }
        showDetailDrawer.value = true
      } catch (error) {
        console.error('获取审批详情失败:', error)
        alert(error.response?.data?.error || '获取审批详情失败')
      }
    }

    const closeApprovalDetail = () => {
      showDetailDrawer.value = false
      currentDetail.value = null
    }

    const handleApprove = async () => {
      try {
        await approveFlow({ node_case_user_id: currentDetail.value.id })
        alert('审批通过')
        closeApprovalDetail()
        fetchData()
      } catch (error) {
        console.error('审批失败:', error)
        alert(error.response?.data?.error || '审批失败')
      }
    }

    const handleReject = async () => {
      try {
        await rejectFlow({ node_case_user_id: currentDetail.value.id })
        alert('审批已驳回')
        closeApprovalDetail()
        fetchData()
      } catch (error) {
        console.error('驳回失败:', error)
        alert(error.response?.data?.error || '驳回失败')
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
      showDetailDrawer,
      currentDetail,
      handleSearch,
      handleReset,
      changePage,
      openApprovalDetail,
      closeApprovalDetail,
      handleApprove,
      handleReject
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
