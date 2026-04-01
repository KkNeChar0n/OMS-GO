<template>
  <div style="position: relative;">
    <!-- Loading遮罩层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div class="page-header">
      <h1>退费订单</h1>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <div class="filter-row">
        <div class="filter-item">
          <label for="refundOrderIdFilter">ID</label>
          <input type="number" id="refundOrderIdFilter" v-model="filters.id" placeholder="请输入ID">
        </div>
        <div class="filter-item">
          <label for="refundOrderUidFilter">UID</label>
          <input type="number" id="refundOrderUidFilter" v-model="filters.uid" placeholder="请输入UID">
        </div>
        <div class="filter-item">
          <label for="refundOrderOrderIdFilter">订单ID</label>
          <input type="number" id="refundOrderOrderIdFilter" v-model="filters.order_id" placeholder="请输入订单ID">
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
          <th>UID</th>
          <th>订单ID</th>
          <th>退费金额</th>
          <th>提交人</th>
          <th>提交时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="refundOrder in paginatedData" :key="refundOrder.id">
          <td>{{ refundOrder.id }}</td>
          <td>{{ refundOrder.uid }}</td>
          <td>{{ refundOrder.order_id }}</td>
          <td style="font-weight: bold; color: #e74c3c;">{{ refundOrder.refund_amount }}</td>
          <td>{{ refundOrder.submitter }}</td>
          <td>{{ refundOrder.submit_time }}</td>
          <td>{{ getStatusText(refundOrder.status) }}</td>
          <td class="action-column">
            <button class="edit-btn" @click="openDetail(refundOrder.id)">详情</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 退费订单分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" @click="changePage(1)" :disabled="currentPage === 1">首页</button>
      <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
      <button class="page-btn" @click="changePage(totalPages)" :disabled="currentPage === totalPages">末页</button>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>退费订单详情</h2>
          <button class="close-btn" @click="closeDetail">×</button>
        </div>
        <div class="modal-body" v-if="currentDetail">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">{{ currentDetail.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">UID:</span>
            <span class="detail-value">{{ currentDetail.uid }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">订单ID:</span>
            <span class="detail-value">{{ currentDetail.order_id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">退费金额:</span>
            <span class="detail-value" style="font-weight: bold; color: #e74c3c;">{{ currentDetail.refund_amount }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">提交人:</span>
            <span class="detail-value">{{ currentDetail.submitter }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">提交时间:</span>
            <span class="detail-value">{{ currentDetail.submit_time }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">状态:</span>
            <span class="detail-value">{{ getStatusText(currentDetail.status) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">退费原因:</span>
            <span class="detail-value">{{ currentDetail.reason || '无' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRefundOrders, getRefundOrderDetail } from '@/api/finance'

// 数据状态
const loading = ref(false)
const refundOrders = ref([])
const filters = ref({
  id: '',
  uid: '',
  order_id: ''
})

// 已应用的筛选条件（只有点击搜索后才更新）
const appliedFilters = ref({
  id: '',
  uid: '',
  order_id: ''
})

// 分页状态
const currentPage = ref(1)
const pageSize = 10

// 详情弹窗状态
const showDetailModal = ref(false)
const currentDetail = ref(null)

// 计算属性
const filteredData = computed(() => {
  return refundOrders.value.filter(order => {
    let match = true
    if (appliedFilters.value.id && order.id !== parseInt(appliedFilters.value.id)) {
      match = false
    }
    if (appliedFilters.value.uid && order.uid !== parseInt(appliedFilters.value.uid)) {
      match = false
    }
    if (appliedFilters.value.order_id && order.order_id !== parseInt(appliedFilters.value.order_id)) {
      match = false
    }
    return match
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / pageSize)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredData.value.slice(start, end)
})

// 方法
const fetchData = async () => {
  loading.value = true
  try {
    const response = await getRefundOrders()
    refundOrders.value = response.data.refund_orders || []
  } catch (error) {
    console.error('获取退费订单数据失败:', error)
    alert('获取退费订单数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 应用筛选条件
  appliedFilters.value = { ...filters.value }
  currentPage.value = 1
}

const handleReset = () => {
  filters.value = {
    id: '',
    uid: '',
    order_id: ''
  }
  appliedFilters.value = {
    id: '',
    uid: '',
    order_id: ''
  }
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const getStatusText = (status) => {
  const statusMap = {
    0: '待审批',
    10: '已通过',
    20: '已驳回'
  }
  return statusMap[status] || '未知'
}

const openDetail = async (id) => {
  try {
    const response = await getRefundOrderDetail(id)
    currentDetail.value = response.data.refund_order
    showDetailModal.value = true
  } catch (error) {
    console.error('获取退费订单详情失败:', error)
    alert('获取退费订单详情失败')
  }
}

const closeDetail = () => {
  showDetailModal.value = false
  currentDetail.value = null
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style>
/* 使用全局样式，不使用scoped */
</style>
