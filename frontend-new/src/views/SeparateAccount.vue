<template>
  <div style="position: relative;">
    <!-- Loading遮罩层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div class="page-header">
      <h1>分账明细</h1>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <div class="filter-row">
        <div class="filter-item">
          <label for="separateAccountIdFilter">ID</label>
          <input type="number" id="separateAccountIdFilter" v-model="filters.id" placeholder="请输入ID">
        </div>
        <div class="filter-item">
          <label for="separateAccountUidFilter">UID</label>
          <input type="number" id="separateAccountUidFilter" v-model="filters.uid" placeholder="请输入UID">
        </div>
        <div class="filter-item">
          <label for="separateAccountOrdersIdFilter">订单ID</label>
          <input type="number" id="separateAccountOrdersIdFilter" v-model="filters.orders_id" placeholder="请输入订单ID">
        </div>
        <div class="filter-item">
          <label for="separateAccountChildordersIdFilter">子订单ID</label>
          <input type="number" id="separateAccountChildordersIdFilter" v-model="filters.childorders_id" placeholder="请输入子订单ID">
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-item">
          <label for="separateAccountGoodsIdFilter">商品ID</label>
          <input type="number" id="separateAccountGoodsIdFilter" v-model="filters.goods_id" placeholder="请输入商品ID">
        </div>
        <div class="filter-item">
          <label for="separateAccountPaymentIdFilter">收款ID</label>
          <input type="number" id="separateAccountPaymentIdFilter" v-model="filters.payment_id" placeholder="请输入收款ID">
        </div>
        <div class="filter-item">
          <label for="separateAccountPaymentTypeFilter">收款类型</label>
          <select id="separateAccountPaymentTypeFilter" v-model="filters.payment_type">
            <option value="">全部</option>
            <option value="0">常规收款</option>
            <option value="1">淘宝收款</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="separateAccountTypeFilter">类型</label>
          <select id="separateAccountTypeFilter" v-model="filters.type">
            <option value="">全部</option>
            <option value="0">售卖</option>
            <option value="1">冲回</option>
            <option value="2">退费</option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button class="search-btn" @click="handleSearch">搜索</button>
        <button class="reset-btn" @click="handleReset">重置</button>
      </div>
    </div>

    <!-- 数据表格 -->
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>UID</th>
          <th>订单ID</th>
          <th>子订单ID</th>
          <th>收款ID</th>
          <th>收款类型</th>
          <th>商品ID</th>
          <th>商品名称</th>
          <th>分账金额</th>
          <th>类型</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sa in paginatedData" :key="sa.id">
          <td>{{ sa.id }}</td>
          <td>{{ sa.uid }}</td>
          <td>{{ sa.orders_id }}</td>
          <td>{{ sa.childorders_id }}</td>
          <td>{{ sa.payment_id }}</td>
          <td>{{ getPaymentTypeText(sa.payment_type) }}</td>
          <td>{{ sa.goods_id }}</td>
          <td>{{ sa.goods_name }}</td>
          <td>{{ sa.separate_amount }}</td>
          <td>{{ getSeparateAccountTypeText(sa.type) }}</td>
        </tr>
        <tr v-if="paginatedData.length === 0">
          <td colspan="10" style="text-align: center; padding: 20px;">暂无数据</td>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSeparateAccounts } from '@/api/finance'

// 数据状态
const loading = ref(false)
const separateAccounts = ref([])
const filters = ref({
  id: '',
  uid: '',
  orders_id: '',
  childorders_id: '',
  goods_id: '',
  payment_id: '',
  payment_type: '',
  type: ''
})

// 已应用的筛选条件（只有点击搜索后才更新）
const appliedFilters = ref({
  id: '',
  uid: '',
  orders_id: '',
  childorders_id: '',
  goods_id: '',
  payment_id: '',
  payment_type: '',
  type: ''
})

// 分页状态
const currentPage = ref(1)
const pageSize = 10

// 计算属性
const filteredData = computed(() => {
  return separateAccounts.value.filter(sa => {
    let match = true
    if (appliedFilters.value.id && sa.id !== parseInt(appliedFilters.value.id)) {
      match = false
    }
    if (appliedFilters.value.uid && sa.uid !== parseInt(appliedFilters.value.uid)) {
      match = false
    }
    if (appliedFilters.value.orders_id && sa.orders_id !== parseInt(appliedFilters.value.orders_id)) {
      match = false
    }
    if (appliedFilters.value.childorders_id && sa.childorders_id !== parseInt(appliedFilters.value.childorders_id)) {
      match = false
    }
    if (appliedFilters.value.goods_id && sa.goods_id !== parseInt(appliedFilters.value.goods_id)) {
      match = false
    }
    if (appliedFilters.value.payment_id && sa.payment_id !== parseInt(appliedFilters.value.payment_id)) {
      match = false
    }
    if (appliedFilters.value.payment_type !== '' && sa.payment_type !== parseInt(appliedFilters.value.payment_type)) {
      match = false
    }
    if (appliedFilters.value.type !== '' && sa.type !== parseInt(appliedFilters.value.type)) {
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
    const response = await getSeparateAccounts()
    // 后端返回格式: { code: 0, message: 'success', data: { separate_accounts: [...], total: 20, page: 1, page_size: 20 } }
    if (response.data.code === 0 && response.data.data) {
      separateAccounts.value = response.data.data.separate_accounts || []
    } else {
      separateAccounts.value = []
      console.error('API返回错误:', response.data.message)
    }
  } catch (error) {
    console.error('获取分账明细数据失败:', error)
    alert('获取分账明细数据失败')
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
    orders_id: '',
    childorders_id: '',
    goods_id: '',
    payment_id: '',
    payment_type: '',
    type: ''
  }
  appliedFilters.value = {
    id: '',
    uid: '',
    orders_id: '',
    childorders_id: '',
    goods_id: '',
    payment_id: '',
    payment_type: '',
    type: ''
  }
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const getPaymentTypeText = (type) => {
  const typeMap = {
    0: '常规收款',
    1: '淘宝收款'
  }
  return typeMap[type] || '未知'
}

const getSeparateAccountTypeText = (type) => {
  const typeMap = {
    0: '售卖',
    1: '冲回',
    2: '退费'
  }
  return typeMap[type] || '未知'
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style>
/* 使用全局样式，不使用scoped */
</style>
