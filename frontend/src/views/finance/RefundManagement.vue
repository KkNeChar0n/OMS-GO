<template>
  <div class="refund-management-container">
    <Loading v-if="loading" />

    <div class="page-header">
      <h1>退费管理</h1>
    </div>

    <!-- Tab导航 -->
    <div class="tab-container">
      <div class="tab-navigation">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'regular' }"
          @click="switchTab('regular')"
        >
          常规退费
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'taobao' }"
          @click="switchTab('taobao')"
        >
          淘宝退费
        </button>
      </div>

      <!-- 常规退费 Tab -->
      <div v-if="activeTab === 'regular'" class="tab-content">
        <!-- 筛选表单 -->
        <div class="filter-form">
          <div class="filter-row">
            <div class="filter-item">
              <label for="regularIdFilter">ID</label>
              <input
                type="number"
                id="regularIdFilter"
                v-model="regularFilters.id"
                placeholder="请输入ID"
              >
            </div>
            <div class="filter-item">
              <label for="regularUidFilter">UID</label>
              <input
                type="number"
                id="regularUidFilter"
                v-model="regularFilters.student_id"
                placeholder="请输入UID"
              >
            </div>
            <div class="filter-item">
              <label for="regularRefundOrderIdFilter">退费ID</label>
              <input
                type="number"
                id="regularRefundOrderIdFilter"
                v-model="regularFilters.refund_order_id"
                placeholder="请输入退费ID"
              >
            </div>
            <div class="filter-item">
              <label for="regularPayerFilter">付款方</label>
              <input
                type="text"
                id="regularPayerFilter"
                v-model="regularFilters.payer"
                placeholder="请输入付款方"
              >
            </div>
            <div class="filter-item">
              <label for="regularStatusFilter">状态</label>
              <select id="regularStatusFilter" v-model="regularFilters.status">
                <option value="">全部</option>
                <option value="0">退费中</option>
                <option value="10">已通过</option>
                <option value="20">已驳回</option>
              </select>
            </div>
          </div>
          <div class="filter-actions">
            <button class="search-btn" @click="searchRegularRefunds">搜索</button>
            <button class="reset-btn" @click="resetRegularFilters">重置</button>
          </div>
        </div>

        <!-- 数据表格 -->
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>UID</th>
              <th>退费ID</th>
              <th>付款方</th>
              <th>银行账户</th>
              <th>退费金额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedRegularRefunds" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.uid }}</td>
              <td>{{ item.refund_order_id }}</td>
              <td>{{ item.payer || '-' }}</td>
              <td>{{ item.bank_account || '-' }}</td>
              <td style="font-weight: bold; color: #e74c3c;">{{ item.refund_amount }}</td>
              <td>{{ getStatusText(item.status) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 分页组件 -->
        <Pagination
          v-if="regularTotalPages > 1"
          :current-page="regularCurrentPage"
          :total-pages="regularTotalPages"
          @change-page="changeRegularPage"
        />
      </div>

      <!-- 淘宝退费 Tab -->
      <div v-if="activeTab === 'taobao'" class="tab-content">
        <!-- 筛选表单 -->
        <div class="filter-form">
          <div class="filter-row">
            <div class="filter-item">
              <label for="taobaoIdFilter">ID</label>
              <input
                type="number"
                id="taobaoIdFilter"
                v-model="taobaoFilters.id"
                placeholder="请输入ID"
              >
            </div>
            <div class="filter-item">
              <label for="taobaoUidFilter">UID</label>
              <input
                type="number"
                id="taobaoUidFilter"
                v-model="taobaoFilters.student_id"
                placeholder="请输入UID"
              >
            </div>
            <div class="filter-item">
              <label for="taobaoRefundOrderIdFilter">退费ID</label>
              <input
                type="number"
                id="taobaoRefundOrderIdFilter"
                v-model="taobaoFilters.refund_order_id"
                placeholder="请输入退费ID"
              >
            </div>
            <div class="filter-item">
              <label for="taobaoStatusFilter">状态</label>
              <select id="taobaoStatusFilter" v-model="taobaoFilters.status">
                <option value="">全部</option>
                <option value="0">退费中</option>
                <option value="10">已通过</option>
                <option value="20">已驳回</option>
              </select>
            </div>
          </div>
          <div class="filter-actions">
            <button class="search-btn" @click="searchTaobaoRefunds">搜索</button>
            <button class="reset-btn" @click="resetTaobaoFilters">重置</button>
          </div>
        </div>

        <!-- 数据表格 -->
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>UID</th>
              <th>退费ID</th>
              <th>支付宝账号</th>
              <th>支付宝名称</th>
              <th>退费金额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedTaobaoRefunds" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.uid }}</td>
              <td>{{ item.refund_order_id }}</td>
              <td>{{ item.alipay_account }}</td>
              <td>{{ item.alipay_name }}</td>
              <td style="font-weight: bold; color: #e74c3c;">{{ item.refund_amount }}</td>
              <td>{{ getStatusText(item.status) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 分页组件 -->
        <Pagination
          v-if="taobaoTotalPages > 1"
          :current-page="taobaoCurrentPage"
          :total-pages="taobaoTotalPages"
          @change-page="changeTaobaoPage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getRegularRefunds, getTaobaoRefunds } from '@/api/finance';
import Loading from '@/components/common/Loading.vue';
import Pagination from '@/components/common/Pagination.vue';

export default {
  name: 'RefundManagement',
  components: {
    Loading,
    Pagination
  },
  setup() {
    const loading = ref(false);
    const activeTab = ref('regular');

    // 常规退费数据
    const regularRefunds = ref([]);
    const regularCurrentPage = ref(1);
    const regularFilters = ref({
      id: '',
      student_id: '',
      refund_order_id: '',
      payer: '',
      status: ''
    });

    // 淘宝退费数据
    const taobaoRefunds = ref([]);
    const taobaoCurrentPage = ref(1);
    const taobaoFilters = ref({
      id: '',
      student_id: '',
      refund_order_id: '',
      status: ''
    });

    // 切换Tab
    const switchTab = (tab) => {
      activeTab.value = tab;
      if (tab === 'regular') {
        fetchRegularRefunds();
      } else {
        fetchTaobaoRefunds();
      }
    };

    // 获取常规退费列表
    const fetchRegularRefunds = async () => {
      loading.value = true;
      try {
        const params = {};
        if (regularFilters.value.id) params.id = regularFilters.value.id;
        if (regularFilters.value.student_id) params.student_id = regularFilters.value.student_id;
        if (regularFilters.value.refund_order_id) params.refund_order_id = regularFilters.value.refund_order_id;
        if (regularFilters.value.payer) params.payer = regularFilters.value.payer;
        if (regularFilters.value.status !== '') params.status = regularFilters.value.status;

        const response = await getRegularRefunds(params);
        regularRefunds.value = response.data.regular_supplements || [];
      } catch (error) {
        console.error('获取常规退费列表失败:', error);
        alert(error.response?.data?.error || '获取列表失败');
      } finally {
        loading.value = false;
      }
    };

    // 搜索常规退费
    const searchRegularRefunds = () => {
      regularCurrentPage.value = 1;
      fetchRegularRefunds();
    };

    // 重置常规退费筛选条件
    const resetRegularFilters = () => {
      regularFilters.value = {
        id: '',
        student_id: '',
        refund_order_id: '',
        payer: '',
        status: ''
      };
      fetchRegularRefunds();
    };

    // 常规退费分页数据
    const paginatedRegularRefunds = computed(() => {
      const start = (regularCurrentPage.value - 1) * 10;
      const end = start + 10;
      return regularRefunds.value.slice(start, end);
    });

    // 常规退费总页数
    const regularTotalPages = computed(() => {
      return Math.ceil(regularRefunds.value.length / 10);
    });

    // 切换常规退费页码
    const changeRegularPage = (page) => {
      if (page >= 1 && page <= regularTotalPages.value) {
        regularCurrentPage.value = page;
      }
    };

    // 获取淘宝退费列表
    const fetchTaobaoRefunds = async () => {
      loading.value = true;
      try {
        const params = {};
        if (taobaoFilters.value.id) params.id = taobaoFilters.value.id;
        if (taobaoFilters.value.student_id) params.student_id = taobaoFilters.value.student_id;
        if (taobaoFilters.value.refund_order_id) params.refund_order_id = taobaoFilters.value.refund_order_id;
        if (taobaoFilters.value.status !== '') params.status = taobaoFilters.value.status;

        const response = await getTaobaoRefunds(params);
        taobaoRefunds.value = response.data.taobao_supplements || [];
      } catch (error) {
        console.error('获取淘宝退费列表失败:', error);
        alert(error.response?.data?.error || '获取列表失败');
      } finally {
        loading.value = false;
      }
    };

    // 搜索淘宝退费
    const searchTaobaoRefunds = () => {
      taobaoCurrentPage.value = 1;
      fetchTaobaoRefunds();
    };

    // 重置淘宝退费筛选条件
    const resetTaobaoFilters = () => {
      taobaoFilters.value = {
        id: '',
        student_id: '',
        refund_order_id: '',
        status: ''
      };
      fetchTaobaoRefunds();
    };

    // 淘宝退费分页数据
    const paginatedTaobaoRefunds = computed(() => {
      const start = (taobaoCurrentPage.value - 1) * 10;
      const end = start + 10;
      return taobaoRefunds.value.slice(start, end);
    });

    // 淘宝退费总页数
    const taobaoTotalPages = computed(() => {
      return Math.ceil(taobaoRefunds.value.length / 10);
    });

    // 切换淘宝退费页码
    const changeTaobaoPage = (page) => {
      if (page >= 1 && page <= taobaoTotalPages.value) {
        taobaoCurrentPage.value = page;
      }
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
      fetchRegularRefunds();
    });

    return {
      loading,
      activeTab,
      regularFilters,
      taobaoFilters,
      paginatedRegularRefunds,
      paginatedTaobaoRefunds,
      regularCurrentPage,
      taobaoCurrentPage,
      regularTotalPages,
      taobaoTotalPages,
      switchTab,
      searchRegularRefunds,
      resetRegularFilters,
      changeRegularPage,
      searchTaobaoRefunds,
      resetTaobaoFilters,
      changeTaobaoPage,
      getStatusText
    };
  }
};
</script>

<style scoped>
.refund-management-container {
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

/* Tab 样式 */
.tab-container {
  margin-top: 20px;
}

.tab-navigation {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #3498db;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-content {
  padding: 10px 0;
  overflow-x: auto;
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
