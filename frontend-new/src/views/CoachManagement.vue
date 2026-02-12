<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>教练管理</h1>
        <button v-if="hasPermission('add_coach')" class="add-btn" @click="openAddModal">
          新增教练
        </button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="coachIdFilter">ID</label>
            <input type="number" id="coachIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="coachNameFilter">姓名</label>
            <input type="text" id="coachNameFilter" v-model="filters.name" placeholder="请输入姓名">
          </div>
          <div class="filter-item">
            <label for="coachSexFilter">性别</label>
            <select id="coachSexFilter" v-model="filters.sex">
              <option value="">全部</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="coachSubjectFilter">学科</label>
            <select id="coachSubjectFilter" v-model="filters.subject">
              <option value="">全部</option>
              <option value="语文">语文</option>
              <option value="数学">数学</option>
              <option value="英语">英语</option>
              <option value="物理">物理</option>
              <option value="化学">化学</option>
              <option value="生物">生物</option>
              <option value="历史">历史</option>
              <option value="地理">地理</option>
              <option value="政治">政治</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="coachStatusFilter">状态</label>
            <select id="coachStatusFilter" v-model="filters.status">
              <option value="">全部</option>
              <option value="0">启用</option>
              <option value="1">禁用</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="search-btn" @click="handleFilter">搜索</button>
          <button class="reset-btn" @click="handleReset">重置</button>
        </div>
      </div>

      <!-- 教练列表 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>教练姓名</th>
            <th>性别</th>
            <th>学科</th>
            <th>电话</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedCoaches || paginatedCoaches.length === 0">
            <td colspan="7" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="coach in paginatedCoaches" :key="coach.id" v-else>
            <td>{{ coach.id }}</td>
            <td>{{ coach.name }}</td>
            <td>{{ coach.sex }}</td>
            <td>{{ coach.subject }}</td>
            <td>{{ coach.phone }}</td>
            <td>{{ getStatusText(coach.status) }}</td>
            <td class="action-column">
              <button
                v-if="hasPermission('edit_coach')"
                class="edit-btn"
                @click="openEditModal(coach)"
              >编辑</button>
              <button
                v-if="hasPermission('enable_coach') && coach.status === 1"
                class="enable-btn"
                @click="handleUpdateStatus(coach.id, 0)"
              >启用</button>
              <button
                v-if="hasPermission('disable_coach') && coach.status === 0"
                class="disable-btn"
                @click="handleUpdateStatus(coach.id, 1)"
              >禁用</button>
              <button
                v-if="hasPermission('delete_coach')"
                class="delete-btn"
                @click="handleDelete(coach)"
              >删除</button>
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

      <!-- 新增/编辑教练弹窗 -->
      <Modal
        :show="showModal"
        :title="modalTitle"
        @close="closeModal"
        @confirm="handleSubmit"
      >
        <div class="form-group">
          <label for="coachName">姓名 <span class="required">*</span></label>
          <input
            type="text"
            id="coachName"
            v-model="formData.name"
            placeholder="请输入教练姓名"
          >
        </div>
        <div class="form-group">
          <label for="coachSex">性别 <span class="required">*</span></label>
          <select id="coachSex" v-model="formData.sex_id">
            <option value="">请选择性别</option>
            <option v-for="sex in sexes" :key="sex.id" :value="sex.id">{{ sex.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="coachPhone">电话 <span class="required">*</span></label>
          <input
            type="text"
            id="coachPhone"
            v-model="formData.phone"
            placeholder="请输入联系电话"
          >
        </div>
        <div class="form-group">
          <label for="coachSubject">学科 <span class="required">*</span></label>
          <select id="coachSubject" v-model="formData.subject_id">
            <option value="">请选择学科</option>
            <option v-for="subject in activeSubjects" :key="subject.id" :value="subject.id">{{ subject.subject }}</option>
          </select>
        </div>
        <div class="form-group" v-if="!isEditing">
          <label for="coachStudents">学生</label>
          <div class="multi-select">
            <div v-for="student in activeStudents" :key="student.id" class="checkbox-item">
              <input
                type="checkbox"
                :id="'student-' + student.id"
                :value="student.id"
                v-model="formData.student_ids"
              >
              <label :for="'student-' + student.id">{{ student.student_name }}</label>
            </div>
            <div v-if="!activeStudents || activeStudents.length === 0" style="text-align: center; padding: 20px; color: #999;">
              暂无可选学生
            </div>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import { calculatePagination } from '@/utils/helpers'
import { getCoaches, createCoach, updateCoach, deleteCoach, updateCoachStatus } from '@/api/coach'
import { getActiveStudents } from '@/api/student'
import { getAllSexes, getActiveSubjects } from '@/api/basic'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'

export default {
  name: 'CoachManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()

    const coaches = ref([])
    const filteredCoaches = ref([])
    const loading = ref(false)
    const mounted = ref(false)
    const sexes = ref([])
    const activeSubjects = ref([])
    const activeStudents = ref([])
    const filters = ref({
      id: '',
      name: '',
      sex: '',
      subject: '',
      status: ''
    })
    const currentPage = ref(1)
    const pageSize = 10

    // 弹窗相关
    const showModal = ref(false)
    const isEditing = ref(false)
    const formData = ref({
      id: null,
      name: '',
      sex_id: '',
      subject_id: '',
      phone: '',
      student_ids: []
    })

    const modalTitle = computed(() => {
      return isEditing.value ? '编辑教练' : '新增教练'
    })

    const paginatedCoaches = computed(() => {
      if (!filteredCoaches.value || !Array.isArray(filteredCoaches.value)) {
        return []
      }
      const { items } = calculatePagination(filteredCoaches.value, currentPage.value, pageSize)
      return items || []
    })

    const totalPages = computed(() => {
      if (!filteredCoaches.value || !Array.isArray(filteredCoaches.value)) {
        return 1
      }
      return Math.ceil(filteredCoaches.value.length / pageSize) || 1
    })

    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    const fetchCoaches = async () => {
      loading.value = true
      try {
        const response = await getCoaches()
        if (response.data && response.data.coaches) {
          coaches.value = response.data.coaches.map(c => ({
            id: c.id,
            name: c.coach_name,
            sex: c.sex,
            subject: c.subject,
            phone: c.phone,
            status: c.status
          }))
          filteredCoaches.value = coaches.value
        }
      } catch (error) {
        console.error('Fetch coaches error:', error)
        alert('获取教练列表失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const handleFilter = () => {
      let result = coaches.value || []

      if (filters.value.id) {
        result = result.filter(c => c && c.id == filters.value.id)
      }
      if (filters.value.name) {
        result = result.filter(c => c && c.name && c.name.toLowerCase().includes(filters.value.name.toLowerCase()))
      }
      if (filters.value.sex) {
        result = result.filter(c => c && c.sex === filters.value.sex)
      }
      if (filters.value.subject) {
        result = result.filter(c => c && c.subject === filters.value.subject)
      }
      if (filters.value.status !== '') {
        result = result.filter(c => c && c.status == filters.value.status)
      }

      filteredCoaches.value = result
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        id: '',
        name: '',
        sex: '',
        subject: '',
        status: ''
      }
      filteredCoaches.value = coaches.value
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const openAddModal = async () => {
      isEditing.value = false
      formData.value = {
        id: null,
        name: '',
        sex_id: '',
        subject_id: '',
        phone: '',
        student_ids: []
      }

      // 获取性别、学科、学生列表
      try {
        const [sexesRes, subjectsRes, studentsRes] = await Promise.all([
          getAllSexes(),
          getActiveSubjects(),
          getActiveStudents()
        ])

        if (sexesRes.data && sexesRes.data.code === 0) {
          sexes.value = sexesRes.data.data.sexes || []
        }
        if (subjectsRes.data && subjectsRes.data.code === 0) {
          activeSubjects.value = subjectsRes.data.data.subjects || []
        }
        if (studentsRes.data && studentsRes.data.students) {
          activeStudents.value = studentsRes.data.students || []
        }
      } catch (error) {
        console.error('获取下拉选项失败:', error)
      }

      showModal.value = true
    }

    const openEditModal = async (coach) => {
      isEditing.value = true
      formData.value = {
        id: coach.id,
        name: coach.name,
        sex_id: coach.sex === '男' ? 1 : 2,
        subject_id: coach.subject_id || '',
        phone: coach.phone,
        student_ids: []
      }

      // 获取性别和学科列表
      try {
        const [sexesRes, subjectsRes] = await Promise.all([
          getAllSexes(),
          getActiveSubjects()
        ])

        if (sexesRes.data && sexesRes.data.code === 0) {
          sexes.value = sexesRes.data.data.sexes || []
        }
        if (subjectsRes.data && subjectsRes.data.code === 0) {
          activeSubjects.value = subjectsRes.data.data.subjects || []
          // 根据学科名称找到subject_id
          const subjectObj = activeSubjects.value.find(s => s.subject === coach.subject)
          if (subjectObj) {
            formData.value.subject_id = subjectObj.id
          }
        }
      } catch (error) {
        console.error('获取下拉选项失败:', error)
      }

      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }

    const handleSubmit = async () => {
      if (!formData.value.name || !formData.value.sex_id || !formData.value.phone || !formData.value.subject_id) {
        alert('请填写所有必填字段')
        return
      }

      loading.value = true
      try {
        const data = {
          coach_name: formData.value.name,
          sex_id: parseInt(formData.value.sex_id),
          subject_id: parseInt(formData.value.subject_id),
          phone: formData.value.phone
        }

        if (isEditing.value) {
          const response = await updateCoach(formData.value.id, data)
          if (response.status === 200) {
            alert('编辑教练成功')
            await fetchCoaches()
            closeModal()
          } else {
            alert('编辑教练失败：' + (response.data.message || response.data.error))
          }
        } else {
          data.student_ids = formData.value.student_ids || []
          const response = await createCoach(data)
          if (response.status === 201 || response.data.message === '教练添加成功') {
            alert('新增教练成功')
            await fetchCoaches()
            closeModal()
          } else {
            alert('新增教练失败：' + (response.data.message || response.data.error))
          }
        }
      } catch (error) {
        console.error('Submit coach error:', error)
        alert('操作失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const handleUpdateStatus = async (coachId, status) => {
      const confirmText = status === 0 ? '启用' : '禁用'
      if (!confirm(`确定要${confirmText}该教练吗？`)) {
        return
      }

      loading.value = true
      try {
        const response = await updateCoachStatus(coachId, status)
        if (response.status === 200) {
          alert('操作成功')
          await fetchCoaches()
        } else {
          alert('操作失败：' + (response.data.message || response.data.error))
        }
      } catch (error) {
        console.error('Update coach status error:', error)
        alert('操作失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const handleDelete = async (coach) => {
      if (!confirm(`确定要删除教练 ${coach.name} 吗？`)) {
        return
      }

      loading.value = true
      try {
        const response = await deleteCoach(coach.id)
        if (response.status === 200) {
          alert('删除教练成功')
          await fetchCoaches()
        } else {
          alert('删除教练失败：' + (response.data.message || response.data.error))
        }
      } catch (error) {
        console.error('Delete coach error:', error)
        alert('删除失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    onMounted(async () => {
      await fetchCoaches()
      mounted.value = true
    })

    return {
      coaches,
      filteredCoaches,
      loading,
      mounted,
      sexes,
      activeSubjects,
      activeStudents,
      filters,
      currentPage,
      paginatedCoaches,
      totalPages,
      showModal,
      modalTitle,
      isEditing,
      formData,
      hasPermission,
      handleFilter,
      handleReset,
      handlePageChange,
      openAddModal,
      openEditModal,
      closeModal,
      handleSubmit,
      handleUpdateStatus,
      handleDelete,
      getStatusText
    }
  }
}
</script>

<style scoped>
/* 使用全局样式 */
</style>
