<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>合同管理</h1>
        <button v-if="hasPermission('add_contract')" class="add-btn" @click="openAddModal">
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
                @click="openDetailModal(contract)"
              >详情</button>
              <button
                v-if="contract.status === 0"
                class="delete-btn"
                @click="handleRevoke(contract)"
              >撤销</button>
              <button
                v-if="contract.signature_form == 1 && contract.status === 50"
                class="disable-btn"
                @click="openTerminateModal(contract)"
              >中止合作</button>
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

      <!-- 新增合同弹窗 -->
      <Modal
        :show="showAddModal"
        title="新增合同"
        @close="closeAddModal"
        @confirm="handleSubmit"
      >
        <div class="form-group">
          <label for="contractStudent">学生姓名 <span class="required">*</span></label>
          <select id="contractStudent" v-model="formData.student_id" @change="handleStudentChange">
            <option value="">请选择学生</option>
            <option v-for="student in activeStudents" :key="student.id" :value="student.id">
              {{ student.student_name }}
            </option>
          </select>
        </div>
        <div class="form-group" v-if="formData.student_id">
          <label>UID</label>
          <input type="text" :value="formData.student_id" disabled>
        </div>
        <div class="form-group">
          <label for="contractType">合同类型 <span class="required">*</span></label>
          <select id="contractType" v-model="formData.type" @change="handleFormChange">
            <option value="">请选择合同类型</option>
            <option value="0">首报</option>
            <option value="1">续报</option>
          </select>
        </div>
        <div class="form-group">
          <label for="contractSignatureForm">签署形式 <span class="required">*</span></label>
          <select id="contractSignatureForm" v-model="formData.signature_form" @change="handleSignatureFormChange">
            <option value="">请选择签署形式</option>
            <option value="0">线上签署</option>
            <option value="1">线下签署</option>
          </select>
        </div>
        <div class="form-group">
          <label for="contractName">合同名称 <span class="required" v-if="formData.signature_form == 1">*</span></label>
          <input
            type="text"
            id="contractName"
            v-model="formData.name"
            placeholder="请输入合同名称"
            :disabled="formData.signature_form == 0"
          >
        </div>
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
        <div class="form-group">
          <label for="contractSignatory">签署方 <span class="required">*</span></label>
          <input
            type="text"
            id="contractSignatory"
            v-model="formData.signatory"
            placeholder="请输入签署方"
            :readonly="formData.signature_form == 0"
          >
        </div>
      </Modal>

      <!-- 详情弹窗 -->
      <Modal
        :show="showDetailModal"
        title="合同详情"
        @close="closeDetailModal"
        :show-confirm="false"
      >
        <div class="detail-group">
          <label>ID:</label>
          <span>{{ detailData.id }}</span>
        </div>
        <div class="detail-group">
          <label>UID:</label>
          <span>{{ detailData.student_id }}</span>
        </div>
        <div class="detail-group">
          <label>学生姓名:</label>
          <span>{{ detailData.student_name }}</span>
        </div>
        <div class="detail-group">
          <label>合同类型:</label>
          <span>{{ getTypeText(detailData.type) }}</span>
        </div>
        <div class="detail-group">
          <label>签署形式:</label>
          <span>{{ getSignatureFormText(detailData.signature_form) }}</span>
        </div>
        <div class="detail-group">
          <label>合同名称:</label>
          <span>{{ detailData.name }}</span>
        </div>
        <div class="detail-group">
          <label>合同金额:</label>
          <span>{{ detailData.contract_amount }}</span>
        </div>
        <div class="detail-group">
          <label>签署方:</label>
          <span>{{ detailData.signatory }}</span>
        </div>
        <div class="detail-group">
          <label>发起方:</label>
          <span>{{ detailData.initiating_party }}</span>
        </div>
        <div class="detail-group">
          <label>发起人:</label>
          <span>{{ detailData.initiator }}</span>
        </div>
        <div class="detail-group">
          <label>合同状态:</label>
          <span>{{ getStatusText(detailData.status) }}</span>
        </div>
        <div class="detail-group">
          <label>付款状态:</label>
          <span>{{ getPaymentStatusText(detailData.payment_status) }}</span>
        </div>
        <div class="detail-group">
          <label>创建时间:</label>
          <span>{{ formatDate(detailData.create_time) }}</span>
        </div>
      </Modal>

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
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'

export default {
  name: 'ContractManagement',
  components: {
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

    // 弹窗相关
    const showAddModal = ref(false)
    const showDetailModal = ref(false)
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
      let result = contracts.value || []

      if (filters.value.id) {
        result = result.filter(c => c && c.id == filters.value.id)
      }
      if (filters.value.student_id) {
        result = result.filter(c => c && c.student_id == filters.value.student_id)
      }
      if (filters.value.student_name) {
        result = result.filter(c => c && c.student_name && c.student_name.toLowerCase().includes(filters.value.student_name.toLowerCase()))
      }
      if (filters.value.type !== '') {
        result = result.filter(c => c && c.type == filters.value.type)
      }
      if (filters.value.status !== '') {
        result = result.filter(c => c && c.status == filters.value.status)
      }
      if (filters.value.payment_status !== '') {
        result = result.filter(c => c && c.payment_status == filters.value.payment_status)
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

    const openAddModal = async () => {
      formData.value = {
        student_id: '',
        student_name: '',
        type: '',
        signature_form: '',
        name: '',
        contract_amount: '',
        signatory: ''
      }

      // 获取学生列表
      try {
        const response = await getActiveStudents()
        if (response.data && response.data.students) {
          activeStudents.value = response.data.students
        }
      } catch (error) {
        console.error('获取学生列表失败:', error)
      }

      showAddModal.value = true
    }

    const closeAddModal = () => {
      showAddModal.value = false
    }

    const handleStudentChange = () => {
      const student = activeStudents.value.find(s => s.id == formData.value.student_id)
      if (student) {
        formData.value.student_name = student.student_name
      }
      handleFormChange()
    }

    const handleSignatureFormChange = () => {
      // 线上签署时清空合同名称
      if (formData.value.signature_form == 0) {
        formData.value.name = ''
      } else {
        // 线下签署时尝试生成合同名称
        handleFormChange()
      }
    }

    const handleFormChange = () => {
      // 线下签署时自动生成合同名称
      if (formData.value.signature_form == 1 &&
          formData.value.student_id &&
          formData.value.student_name &&
          formData.value.type !== '') {
        const typeText = formData.value.type == 0 ? '首报' : '续报'
        formData.value.name = `${formData.value.student_id}${formData.value.student_name}${typeText}合同`
      }
    }

    const handleSubmit = async () => {
      // 验证必填字段
      if (!formData.value.student_id || formData.value.type === '' ||
          formData.value.signature_form === '' || !formData.value.contract_amount ||
          !formData.value.signatory) {
        alert('请填写所有必填字段')
        return
      }

      // 线下签署时合同名称也是必填
      if (formData.value.signature_form == 1 && !formData.value.name) {
        alert('请填写合同名称')
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

        // 线下签署时才发送合同名称
        if (formData.value.signature_form == 1) {
          data.name = formData.value.name
        }

        const response = await createContract(data)
        if (response.status === 201 || response.data.message === '合同新增成功') {
          alert('新增合同成功')
          await fetchContracts()
          closeAddModal()
        } else {
          alert('新增合同失败：' + (response.data.message || response.data.error))
        }
      } catch (error) {
        console.error('Submit contract error:', error)
        alert('操作失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const openDetailModal = async (contract) => {
      loading.value = true
      try {
        const response = await getContract(contract.id)
        if (response.data && response.data.contract) {
          detailData.value = response.data.contract
          showDetailModal.value = true
        }
      } catch (error) {
        console.error('获取合同详情失败:', error)
        alert('获取合同详情失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const closeDetailModal = () => {
      showDetailModal.value = false
    }

    const handleRevoke = async (contract) => {
      if (!confirm(`确定要撤销合同 ${contract.name} 吗？`)) {
        return
      }

      loading.value = true
      try {
        const response = await revokeContract(contract.id)
        if (response.status === 200) {
          alert('撤销成功')
          await fetchContracts()
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

    const openTerminateModal = (contract) => {
      terminateData.value = {
        contract_id: contract.id,
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
      showAddModal,
      showDetailModal,
      showTerminateModal,
      formData,
      detailData,
      terminateData,
      hasPermission,
      handleFilter,
      handleReset,
      handlePageChange,
      openAddModal,
      closeAddModal,
      handleStudentChange,
      handleSignatureFormChange,
      handleFormChange,
      handleSubmit,
      openDetailModal,
      closeDetailModal,
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
/* 使用全局样式 */
.detail-group {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.detail-group label {
  min-width: 100px;
  font-weight: bold;
  color: #333;
}

.detail-group span {
  flex: 1;
  color: #666;
}
</style>
