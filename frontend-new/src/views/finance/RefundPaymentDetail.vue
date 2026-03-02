<template>
  <div class="refund-payment-detail-container">
    <Loading v-if="loading" />

    <div class="page-header">
      <h1>退费明细</h1>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <div class="filter-row">
        <div class="filter-item">
          <label for="idFilter">ID</label>
          <input
            type="number"
            id="idFilter"
            v-model="filters.id"
            placeholder="请输入ID"
          >
        </div>
        <div class="filter-item">
          <label for="uidFilter">UID</label>
          <input
            type="number"
            id="uidFilter"
            v-model="filters.student_id"
            placeholder="请输入UID"
          >
        </div>
        <div class="filter-item">
          <label for="orderIdFilter">订单ID</label>
          <input
            type="number"
            id="orderIdFilter"
            v-model="filters.order_id"
            placeholder="请输入订单ID"
          >
        </div>
        <div class="filter-item">
          <label for="refundOrderIdFilter">退款ID</label>
          <input
            type="number"
            id="refundOrderIdFilter"
            v-model="filters.refund_order_id"
            placeholder="请输入退款ID"
          >
        </div>
        <div class="filter-item">
          <label for="paymentIdFilter">收款ID</label>
          <input
            type="number"
            id="paymentIdFilter"
            v-model="filters.payment_id"
            placeholder="请输入收款ID"
          >
        </div>
        <div class="filter-item">
          <label for="paymentTypeFilter">收款类型</label>
          <select id="paymentTypeFilter" v-model="filters.payment_type">
            <option value="">全部</option>
            <option value="0">常规收款</option>
            <option value="1">淘宝收款</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="statusFilter">状态</label>
          <select id="statusFilter" v-model="filters.status">
            <option value="">全部</option>
            <option value="0">退费中</option>
            <option value="10">已通过</option>
            <option value="20">已驳回</option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button class="search-btn" @click="searchRefundPaymentDetails">搜索</button>
        <button class="reset-btn" @click="resetFilters">重置</button>
      </div>
    </div>

    <!-- 数据表格 -->
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>UID</th>
          <th>订单ID</th>
          <th>退款ID</th>
          <th>收款ID</th>
          <th>收款类型</th>
          <th>收款主体</th>
          <th>退费金额</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedData" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.uid }}</td>
          <td>{{ item.order_id }}</td>
          <td>{{ item.refund_order_id }}</td>
          <td>{{ item.payment_id }}</td>
          <td>{{ getPaymentTypeText(item.payment_type) }}</td>
          <td>{{ getPayeeEntityText(item.payee_entity) }}</td>
          <td style="font-weight: bold; color: #e74c3c;">{{ item.refund_amount }}</td>
          <td>{{ getStatusText(item.status) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 分页组件 -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @change-page="changePage"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getRefundPaymentDetails } from '@/api/finance';
import Loading from '@/components/common/Loading.vue';
import Pagination from '@/components/common/Pagination.vue';

export default {
  name: 'RefundPaymentDetail',
  components: {
    Loading,
    Pagination
  },
  setup() {
    const loading = ref(false);
    const refundPaymentDetails = ref([]);
    const currentPage = ref(1);
    const filters = ref({
      id: '',
      student_id: '',
      order_id: '',
      refund_order_id: '',
      payment_id: '',
      payment_type: '',
      status: ''
    });

    // 获取退费明细列表
    const fetchRefundPaymentDetails = async () => {
      loading.value = true;
      try {
        const params = {};
        if (filters.value.id) params.id = filters.value.id;
        if (filters.value.student_id) params.student_id = filters.value.student_id;
        if (filters.value.order_id) params.order_id = filters.value.order_id;
        if (filters.value.refund_order_id) params.refund_order_id = filters.value.refund_order_id;
        if (filters.value.payment_id) params.payment_id = filters.value.payment_id;
        if (filters.value.payment_type !== '') params.payment_type = filters.value.payment_type;
        if (filters.value.status !== '') params.status = filters.value.status;

        const response = await getRefundPaymentDetails(params);
        refundPaymentDetails.value = response.data.refund_payment_details || [];
      } catch (error) {
        console.error('获取退费明细列表失败:', error);
        alert(error.response?.data?.error || '获取列表失败');
      } finally {
        loading.value = false;
      }
    };

    // 搜索
    const searchRefundPaymentDetails = () => {
      currentPage.value = 1;
      fetchRefundPaymentDetails();
    };

    // 重置筛选条件
    const resetFilters = () => {
      filters.value = {
        id: '',
        student_id: '',
        order_id: '',
        refund_order_id: '',
        payment_id: '',
        payment_type: '',
        status: ''
      };
      fetchRefundPaymentDetails();
    };

    // 分页数据
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * 10;
      const end = start + 10;
      return refundPaymentDetails.value.slice(start, end);
    });

    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(refundPaymentDetails.value.length / 10);
    });

    // 切换页码
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    // 获取收款类型文本
    const getPaymentTypeText = (type) => {
      const typeMap = {
        0: '常规收款',
        1: '淘宝收款'
      };
      return typeMap[type] || '-';
    };

    // 获取收款主体文本
    const getPayeeEntityText = (entity) => {
      const entityMap = {
        0: '北京',
        1: '西安'
      };
      return entityMap[entity] || '-';
    };

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        0: '退费中',
        10: '已通过',
        20: '已驳回'
      };
      return statusMap[status] || '未知';
    };

    onMounted(() => {
      fetchRefundPaymentDetails();
    });

    return {
      loading,
      filters,
      paginatedData,
      currentPage,
      totalPages,
      searchRefundPaymentDetails,
      resetFilters,
      changePage,
      getPaymentTypeText,
      getPayeeEntityText,
      getStatusText
    };
  }
};
</script>

<style scoped>
.refund-payment-detail-container {
  position: relative;
}

/* 页面标题栏 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin-bottom: 0;
  color: #2c3e50;
  font-size: 24px;
}

/* 筛选表单样式 */
.filter-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex: 1;
}

.filter-item label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
  font-size: 14px;
}

.filter-item input,
.filter-item select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.filter-item input:focus,
.filter-item select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.search-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn {
  background-color: #3498db;
  color: #fff;
}

.search-btn:hover {
  background-color: #2980b9;
}

.reset-btn {
  background-color: #95a5a6;
  color: #fff;
}

.reset-btn:hover {
  background-color: #7f8c8d;
}

/* 数据表格样式 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
  height: 60px;
  vertical-align: middle;
}

.data-table th {
  background-color: #34495e;
  color: white;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tr:hover {
  background-color: #f8f9fa;
}

.data-table tr:last-child td {
  border-bottom: none;
}
</style>