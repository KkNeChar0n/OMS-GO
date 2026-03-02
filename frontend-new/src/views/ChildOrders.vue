<template>
  <div style="position: relative;">
    <!-- Loading遮罩层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div class="page-header">
      <h1>子订单</h1>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <div class="filter-row">
        <div class="filter-item">
          <label for="childOrderIdFilter">ID</label>
          <input type="number" id="childOrderIdFilter" v-model="filters.id" placeholder="请输入ID">
        </div>
        <div class="filter-item">
          <label for="childOrderParentIdFilter">订单ID</label>
          <input type="number" id="childOrderParentIdFilter" v-model="filters.parentsid" placeholder="请输入订单ID">
        </div>
        <div class="filter-item">
          <label for="childOrderGoodsIdFilter">商品ID</label>
          <input type="number" id="childOrderGoodsIdFilter" v-model="filters.goodsid" placeholder="请输入商品ID">
        </div>
        <div class="filter-item">
          <label for="childOrderStatusFilter">订单状态</label>
          <select id="childOrderStatusFilter" v-model="filters.status">
            <option value="">全部</option>
            <option value="0">草稿</option>
            <option value="10">未支付</option>
            <option value="20">部分支付</option>
            <option value="30">已支付</option>
            <option value="99">已作废</option>
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
          <th>订单ID</th>
          <th>商品ID</th>
          <th>商品名称</th>
          <th>应收金额</th>
          <th>优惠金额</th>
          <th>实收金额</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="childOrder in paginatedData" :key="childOrder.id">
          <td>{{ childOrder.id }}</td>
          <td>{{ childOrder.parentsid }}</td>
          <td>{{ childOrder.goodsid }}</td>
          <td>{{ childOrder.goods_name }}</td>
          <td>{{ childOrder.amount_receivable }}</td>
          <td style="color: #e74c3c;">{{ childOrder.discount_amount || '0.00' }}</td>
          <td style="font-weight: bold;">{{ childOrder.amount_received }}</td>
          <td>{{ getStatusText(childOrder.status) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 子订单分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" @click="changePage(1)" :disabled="currentPage === 1">首页</button>
      <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
      <button class="page-btn" @click="changePage(totalPages)" :disabled="currentPage === totalPages">末页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getChildOrders } from '@/api/finance'

// 数据状态
const loading = ref(false)
const childOrders = ref([])
const filters = ref({
  id: '',
  parentsid: '',
  goodsid: '',
  status: ''
})

// 已应用的筛选条件（只有点击搜索后才更新）
const appliedFilters = ref({
  id: '',
  parentsid: '',
  goodsid: '',
  status: ''
})

// 分页状态
const currentPage = ref(1)
const pageSize = 10

// 计算属性
const filteredData = computed(() => {
  return childOrders.value.filter(order => {
    let match = true
    if (appliedFilters.value.id && order.id !== parseInt(appliedFilters.value.id)) {
      match = false
    }
    if (appliedFilters.value.parentsid && order.parentsid !== parseInt(appliedFilters.value.parentsid)) {
      match = false
    }
    if (appliedFilters.value.goodsid && order.goodsid !== parseInt(appliedFilters.value.goodsid)) {
      match = false
    }
    if (appliedFilters.value.status && order.status !== parseInt(appliedFilters.value.status)) {
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
    const response = await getChildOrders()
    childOrders.value = response.data.childorders || []
  } catch (error) {
    console.error('获取子订单数据失败:', error)
    alert('获取子订单数据失败')
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
    parentsid: '',
    goodsid: '',
    status: ''
  }
  appliedFilters.value = {
    id: '',
    parentsid: '',
    goodsid: '',
    status: ''
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
    0: '草稿',
    10: '未支付',
    20: '部分支付',
    30: '已支付',
    99: '已作废'
  }
  return statusMap[status] || '未知'
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style>
/* 使用全局样式，不使用scoped */
</style>
