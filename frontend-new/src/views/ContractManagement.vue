<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>合同管理</h1>
        <button v-if="hasPermission('add_contract')" class="add-btn" @click="openAddDrawer">
          新增合同
        </button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="contractIdFilter">ID</label>
            <input type="number" id="contractIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="contractStudentIdFilter">UID</label>
            <input type="number" id="contractStudentIdFilter" v-model="filters.student_id" placeholder="请输入UID">
          </div>
          <div class="filter-item">
            <label for="contractStudentNameFilter">学生姓名</label>
            <input type="text" id="contractStudentNameFilter" v-model="filters.student_name" placeholder="请输入学生姓名">
          </div>
          <div class="filter-item">
            <label for="contractTypeFilter">合同类型</label>
            <select id="contractTypeFilter" v-model="filters.type">
              <option value="">全部</option>
              <option value="0">首报</option>
              <option value="1">续报</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="contractStatusFilter">合同状态</label>
            <select id="contractStatusFilter" v-model="filters.status">
              <option value="">全部</option>
              <option value="0">待审核</option>
              <option value="50">已通过</option>
              <option value="98">已作废</option>
              <option value="99">协议中止</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="contractPaymentStatusFilter">付款状态</label>
            <select id="contractPaymentStatusFilter" v-model="filters.payment_status">
              <option value="">全部</option>
              <option value="0">未付款</option>
              <option value="10">部分付款</option>
              <option value="30">已付款</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="search-btn" @click="handleFilter">搜索</button>
          <button class="reset-btn" @click="handleReset">重置</button>
        </div>
      </div>

      <!-- 合同列表 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>UID</th>
            <th>学生姓名</th>
            <th>合同类型</th>
            <th>签署形式</th>
            <th>合同名称</th>
            <th>合同金额</th>
            <th>发起方</th>
            <th>签署方</th>
            <th>发起人</th>
            <th>合同状态</th>
            <th>付款状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedContracts || paginatedContracts.length === 0">
            <td colspan="14" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="contract in paginatedContracts" :key="contract.id" v-else>
            <td>{{ contract.id }}</td>
            <td>{{ contract.student_id }}</td>
            <td>{{ contract.student_name }}</td>
            <td>{{ getTypeText(contract.type) }}</td>
            <td>{{ getSignatureFormText(contract.signature_form) }}</td>
            <td>{{ contract.name }}</td>
            <td>{{ contract.contract_amount }}</td>
            <td>{{ contract.initiating_party }}</td>
            <td>{{ contract.signatory }}</td>
            <td>{{ contract.initiator }}</td>
            <td>{{ getStatusText(contract.status) }}</td>
            <td>{{ getPaymentStatusText(contract.payment_status) }}</td>
            <td>{{ formatDate(contract.create_time) }}</td>
            <td class="action-column">
              <button
                v-if="contract.signature_form == 1"
                class="view-btn"
                @click="openDetailDrawer(contract)"
              >详情</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />

      <!-- 新增合同抽屉 -->
      <Drawer
        :show="showAddDrawer"
        title="新增合同"
        @close="closeAddDrawer"
        @confirm="handleSubmit"
      >
        <!-- 第一行：两列布局 - 学生姓名 + UID -->
        <div class="form-group-row">
          <div class="form-group-col">
            <label for="contractStudent">学生姓名 <span class="required">*</span></label>
            <select id="contractStudent" v-model="formData.student_id" @change="handleStudentChange">
              <option value="">请选择学生</option>
              <option v-for="student in activeStudents" :key="student.id" :value="student.id">
                {{ student.student_name }}
              </option>
            </select>
          </div>
          <div class="form-group-col">
            <label>UID</label>
            <input type="text" :value="formData.student_id || '选择学生后自动显示'" readonly class="readonly-input">
          </div>
        </div>

        <!-- 第二行：两列布局 - 合同类型 + 签署形式 -->
        <div class="form-group-row">
          <div class="form-group-col">
            <label for="contractType">合同类型 <span class="required">*</span></label>
            <select id="contractType" v-model="formData.type" @change="handleFormChange">
              <option value="">请选择合同类型</option>
              <option value="0">首报</option>
              <option value="1">续报</option>
            </select>
          </div>
          <div class="form-group-col">
            <label for="contractSignatureForm">签署形式 <span class="required">*</span></label>
            <select id="contractSignatureForm" v-model="formData.signature_form" @change="handleSignatureFormChange">
              <option value="">请选择签署形式</option>
              <option value="0">线上签署</option>
              <option value="1">线下签署</option>
            </select>
          </div>
        </div>

        <!-- 第三行：单列 - 合同名称 -->
        <div class="form-group">
          <label for="contractName">合同名称 <span class="required" v-if="formData.signature_form == 1">*</span></label>
          <input
            type="text"
            id="contractName"
            v-model="formData.name"
            placeholder="请输入合同名称"
            :disabled="formData.signature_form == 0"
            :class="{'readonly-input': formData.signature_form == 0}"
          >
        </div>

        <!-- 第四行：单列 - 合同金额 -->
        <div class="form-group">
          <label for="contractAmount">合同金额 <span class="required">*</span></label>
          <input
            type="number"
            id="contractAmount"
            v-model="formData.contract_amount"
            placeholder="请输入合同金额"
            min="0"
            step="0.01"
            @change="handleFormChange"
          >
        </div>

        <!-- 第五行：单列 - 签署方 -->
        <div class="form-group">
          <label for="contractSignatory">签署方 <span class="required">*</span></label>
          <input
            type="text"
            id="contractSignatory"
            v-model="formData.signatory"
            placeholder="请输入签署方"
            :readonly="formData.signature_form == 0"
            :class="{'readonly-input': formData.signature_form == 0}"
          >
        </div>
      </Drawer>

      <!-- 详情抽屉 -->
      <Drawer
        :show="showDetailDrawer"
        title="合同详情"
        :show-footer="true"
        :show-confirm="false"
        cancel-text="关闭"
        @close="closeDetailDrawer"
      >
        <!-- 第一行：两列 - 学生信息 -->
        <div class="form-group-row">
          <div class="form-group-col">
            <label>学生姓名</label>
            <input type="text" :value="detailData.student_name" readonly class="readonly-input">
          </div>
          <div class="form-group-col">
            <label>UID</label>
            <input type="text" :value="detailData.student_id" readonly class="readonly-input">
          </div>
        </div>

        <!-- 第二行：两列 - 合同分类 -->
        <div class="form-group-row">
          <div class="form-group-col">
            <label>合同类型</label>
            <input type="text" :value="getTypeText(detailData.type)" readonly class="readonly-input">
          </div>
          <div class="form-group-col">
            <label>签署形式</label>
            <input type="text" :value="getSignatureFormText(detailData.signature_form)" readonly class="readonly-input">
          </div>
        </div>

        <!-- 单列 - 合同名称 -->
        <div class="form-group">
          <label>合同名称</label>
          <input type="text" :value="detailData.name" readonly class="readonly-input">
        </div>

        <!-- 单列 - 合同金额 -->
        <div class="form-group">
          <label>合同金额</label>
          <input type="text" :value="detailData.contract_amount" readonly class="readonly-input">
        </div>

        <!-- 单列 - 签署方 -->
        <div class="form-group">
          <label>签署方</label>
          <input type="text" :value="detailData.signatory" readonly class="readonly-input">
        </div>

        <!-- 两列 - 发起方信息 -->
        <div class="form-group-row">
          <div class="form-group-col">
            <label>发起方</label>
            <input type="text" :value="detailData.initiating_party || '-'" readonly class="readonly-input">
          </div>
          <div class="form-group-col">
            <label>发起人</label>
            <input type="text" :value="detailData.initiator" readonly class="readonly-input">
          </div>
        </div>

        <!-- 两列 - 状态 -->
        <div class="form-group-row">
          <div class="form-group-col">
            <label>合同状态</label>
            <input type="text" :value="getStatusText(detailData.status)" readonly class="readonly-input">
          </div>
          <div class="form-group-col">
            <label>付款状态</label>
            <input type="text" :value="getPaymentStatusText(detailData.payment_status)" readonly class="readonly-input">
          </div>
        </div>

        <!-- 单列 - 创建时间 -->
        <div class="form-group">
          <label>创建时间</label>
          <input type="text" :value="formatDate(detailData.create_time)" readonly class="readonly-input">
        </div>

        <!-- 操作按钮区域 -->
        <div class="detail-actions">
          <button
            v-if="detailData.status === 0"
            class="delete-btn"
            @click="handleRevoke"
          >撤销</button>
          <button
            v-if="detailData.signature_form == 1 && detailData.status === 50"
            class="disable-btn"
            @click="openTerminateModal"
          >中止合作</button>
        </div>
      </Drawer>

      <!-- 中止合作弹窗 -->
      <Modal
        :show="showTerminateModal"
        title="中止合作"
        @close="closeTerminateModal"
        @confirm="handleTerminate"
      >
        <div class="form-group">
          <label for="terminationAgreement">中止协议 <span class="required">*</span></label>
          <input
            type="text"
            id="terminationAgreement"
            v-model="terminateData.termination_agreement"
            placeholder="请输入中止协议文件路径或编号"
          >
          <p style="font-size: 12px; color: #999; margin-top: 5px;">
            提示：请输入中止协议的文件路径或协议编号
          </p>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import { calculatePagination } from '@/utils/helpers'
import { getContracts, getContract, createContract, revokeContract, terminateContract } from '@/api/contract'
import { getActiveStudents } from '@/api/student'
import Drawer from '@/components/common/Drawer.vue'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'

export default {
  name: 'ContractManagement',
  components: {
    Drawer,
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()

    const contracts = ref([])
    const filteredContracts = ref([])
    const loading = ref(false)
    const mounted = ref(false)
    const activeStudents = ref([])
    const filters = ref({
      id: '',
      student_id: '',
      student_name: '',
      type: '',
      status: '',
      payment_status: ''
    })
    const currentPage = ref(1)
    const pageSize = 10

    // 抽屉和弹窗相关
    const showAddDrawer = ref(false)
    const showDetailDrawer = ref(false)
    const showTerminateModal = ref(false)
    const formData = ref({
      student_id: '',
      student_name: '',
      type: '',
      signature_form: '',
      name: '',
      contract_amount: '',
      signatory: ''
    })
    const detailData = ref({})
    const terminateData = ref({
      contract_id: null,
      termination_agreement: ''
    })

    const paginatedContracts = computed(() => {
      if (!filteredContracts.value || !Array.isArray(filteredContracts.value)) {
        return []
      }
      const { items } = calculatePagination(filteredContracts.value, currentPage.value, pageSize)
      return items || []
    })

    const totalPages = computed(() => {
      if (!filteredContracts.value || !Array.isArray(filteredContracts.value)) {
        return 1
      }
      return Math.ceil(filteredContracts.value.length / pageSize) || 1
    })

    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    const fetchContracts = async () => {
      loading.value = true
      try {
        const response = await getContracts()
        if (response.data && response.data.contracts) {
          contracts.value = response.data.contracts
          filteredContracts.value = contracts.value
        }
      } catch (error) {
        console.error('Fetch contracts error:', error)
        alert('获取合同列表失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const handleFilter = () => {
      let result = contracts.value

      if (filters.value.id) {
        result = result.filter(c => c.id === parseInt(filters.value.id))
      }
      if (filters.value.student_id) {
        result = result.filter(c => c.student_id === parseInt(filters.value.student_id))
      }
      if (filters.value.student_name) {
        result = result.filter(c => c.student_name && c.student_name.includes(filters.value.student_name))
      }
      if (filters.value.type !== '') {
        result = result.filter(c => c.type === parseInt(filters.value.type))
      }
      if (filters.value.status !== '') {
        result = result.filter(c => c.status === parseInt(filters.value.status))
      }
      if (filters.value.payment_status !== '') {
        result = result.filter(c => c.payment_status === parseInt(filters.value.payment_status))
      }

      filteredContracts.value = result
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        id: '',
        student_id: '',
        student_name: '',
        type: '',
        status: '',
        payment_status: ''
      }
      filteredContracts.value = contracts.value
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const openAddDrawer = async () => {
      formData.value = {
        student_id: '',
        student_name: '',
        type: '',
        signature_form: '',
        name: '',
        contract_amount: '',
        signatory: ''
      }

      try {
        const response = await getActiveStudents()
        if (response.data && response.data.students) {
          activeStudents.value = response.data.students
        }
      } catch (error) {
        console.error('Fetch students error:', error)
      }

      showAddDrawer.value = true
    }

    const closeAddDrawer = () => {
      showAddDrawer.value = false
    }

    const handleStudentChange = () => {
      const student = activeStudents.value.find(s => s.id === parseInt(formData.value.student_id))
      if (student) {
        formData.value.student_name = student.student_name
      }
      handleFormChange()
    }

    const handleSignatureFormChange = () => {
      if (formData.value.signature_form == 0) {
        formData.value.name = ''
        formData.value.signatory = '小牛编程'
      } else {
        formData.value.signatory = ''
        handleFormChange()
      }
    }

    const handleFormChange = () => {
      if (formData.value.signature_form == 1 && formData.value.student_id && formData.value.student_name && formData.value.type !== '') {
        const typeText = formData.value.type == 0 ? '首报' : '续报'
        formData.value.name = `${formData.value.student_id}${formData.value.student_name}${typeText}合同`
      }
    }

    const handleSubmit = async () => {
      if (!formData.value.student_id) {
        alert('请选择学生')
        return
      }
      if (formData.value.type === '') {
        alert('请选择合同类型')
        return
      }
      if (formData.value.signature_form === '') {
        alert('请选择签署形式')
        return
      }
      if (formData.value.signature_form == 1 && !formData.value.name) {
        alert('请输入合同名称')
        return
      }
      if (!formData.value.contract_amount) {
        alert('请输入合同金额')
        return
      }
      if (!formData.value.signatory) {
        alert('请输入签署方')
        return
      }

      loading.value = true
      try {
        const data = {
          student_id: parseInt(formData.value.student_id),
          type: parseInt(formData.value.type),
          signature_form: parseInt(formData.value.signature_form),
          contract_amount: parseFloat(formData.value.contract_amount),
          signatory: formData.value.signatory
        }

        if (formData.value.signature_form == 1) {
          data.name = formData.value.name
        }

        const response = await createContract(data)
        if (response.status === 201) {
          alert('新增合同成功')
          await fetchContracts()
          closeAddDrawer()
        } else {
          alert('新增合同失败：' + (response.data.message || response.data.error))
        }
      } catch (error) {
        console.error('Create contract error:', error)
        alert('新增合同失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const openDetailDrawer = async (contract) => {
      loading.value = true
      try {
        const response = await getContract(contract.id)
        if (response.data && response.data.contract) {
          detailData.value = response.data.contract
          showDetailDrawer.value = true
        } else {
          alert('获取合同详情失败')
        }
      } catch (error) {
        console.error('Get contract error:', error)
        alert('获取合同详情失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const closeDetailDrawer = () => {
      showDetailDrawer.value = false
    }

    const handleRevoke = async () => {
      if (!confirm('确定要撤销该合同吗？')) {
        return
      }

      loading.value = true
      try {
        const response = await revokeContract(detailData.value.id)
        if (response.status === 200) {
          alert('撤销成功')
          await fetchContracts()
          closeDetailDrawer()
        } else {
          alert('撤销失败：' + (response.data.message || response.data.error))
        }
      } catch (error) {
        console.error('Revoke contract error:', error)
        alert('撤销失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const openTerminateModal = () => {
      terminateData.value = {
        contract_id: detailData.value.id,
        termination_agreement: ''
      }
      showTerminateModal.value = true
    }

    const closeTerminateModal = () => {
      showTerminateModal.value = false
    }

    const handleTerminate = async () => {
      if (!terminateData.value.termination_agreement) {
        alert('请输入中止协议信息')
        return
      }

      loading.value = true
      try {
        const response = await terminateContract(terminateData.value.contract_id, {
          termination_agreement: terminateData.value.termination_agreement
        })
        if (response.status === 200) {
          alert('中止合作成功')
          await fetchContracts()
          closeDetailDrawer()
          closeTerminateModal()
        } else {
          alert('中止合作失败：' + (response.data.message || response.data.error))
        }
      } catch (error) {
        console.error('Terminate contract error:', error)
        alert('中止合作失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const getTypeText = (type) => {
      const map = { 0: '首报', 1: '续报' }
      return map[type] || '-'
    }

    const getSignatureFormText = (form) => {
      const map = { 0: '线上签署', 1: '线下签署' }
      return map[form] || '-'
    }

    const getStatusText = (status) => {
      const map = { 0: '待审核', 50: '已通过', 98: '已作废', 99: '协议中止' }
      return map[status] || '-'
    }

    const getPaymentStatusText = (status) => {
      const map = { 0: '未付款', 10: '部分付款', 30: '已付款' }
      return map[status] || '-'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    onMounted(async () => {
      await fetchContracts()
      mounted.value = true
    })

    return {
      contracts,
      filteredContracts,
      loading,
      mounted,
      activeStudents,
      filters,
      currentPage,
      paginatedContracts,
      totalPages,
      showAddDrawer,
      showDetailDrawer,
      showTerminateModal,
      formData,
      detailData,
      terminateData,
      hasPermission,
      handleFilter,
      handleReset,
      handlePageChange,
      openAddDrawer,
      closeAddDrawer,
      handleStudentChange,
      handleSignatureFormChange,
      handleFormChange,
      handleSubmit,
      openDetailDrawer,
      closeDetailDrawer,
      handleRevoke,
      openTerminateModal,
      closeTerminateModal,
      handleTerminate,
      getTypeText,
      getSignatureFormText,
      getStatusText,
      getPaymentStatusText,
      formatDate
    }
  }
}
</script>

<style scoped>
/* 两列布局 */
.form-group-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group-col {
  flex: 1;
  text-align: left;
}

.form-group-col label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group-col select,
.form-group-col input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

/* 只读输入框 */
.readonly-input {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

/* 操作按钮区域 */
.detail-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
}

.detail-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
</style>
