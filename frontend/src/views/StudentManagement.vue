<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>学生管理</h1>
        <button v-if="hasPermission('add_student')" class="add-btn" @click="openAddModal">
          新增学生
        </button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
      <div class="filter-row">
        <div class="filter-item">
          <label for="studentIdFilter">ID</label>
          <input type="number" id="studentIdFilter" v-model="filters.id" placeholder="请输入ID">
        </div>
        <div class="filter-item">
          <label for="studentNameFilter">姓名</label>
          <input type="text" id="studentNameFilter" v-model="filters.name" placeholder="请输入姓名">
        </div>
        <div class="filter-item">
          <label for="studentGradeFilter">年级</label>
          <select id="studentGradeFilter" v-model="filters.grade">
            <option value="">全部</option>
            <option value="1">一年级</option>
            <option value="2">二年级</option>
            <option value="3">三年级</option>
            <option value="4">四年级</option>
            <option value="5">五年级</option>
            <option value="6">六年级</option>
            <option value="7">初一</option>
            <option value="8">初二</option>
            <option value="9">初三</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="studentStatusFilter">状态</label>
          <select id="studentStatusFilter" v-model="filters.status">
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

      <!-- 学生列表 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>学生姓名</th>
            <th>性别</th>
            <th>年级</th>
            <th>电话</th>
            <th>教练姓名</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedStudents || paginatedStudents.length === 0">
            <td colspan="8" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="student in paginatedStudents" :key="student.id" v-else>
            <td>{{ student.id }}</td>
            <td>{{ student.name }}</td>
            <td>{{ getSexText(student.sex_id) }}</td>
            <td>{{ getGradeText(student.grade) }}</td>
            <td>{{ student.phone }}</td>
            <td>{{ student.coach_names || '-' }}</td>
            <td>{{ getStatusText(student.status) }}</td>
            <td class="action-column">
              <button
                v-if="hasPermission('edit_student')"
                class="edit-btn"
                @click="openEditModal(student)"
              >编辑</button>
              <button
                v-if="hasPermission('delete_student')"
                class="delete-btn"
                @click="handleDelete(student)"
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

      <!-- 新增/编辑学生弹窗 -->
      <Modal
        :show="showModal"
        :title="modalTitle"
        @close="closeModal"
        @confirm="handleSubmit"
      >
        <div class="form-group">
          <label for="studentName">姓名 *</label>
          <input
            type="text"
            id="studentName"
            v-model="formData.name"
            placeholder="请输入学生姓名"
          >
        </div>
        <div class="form-group">
          <label for="studentSex">性别 *</label>
          <select id="studentSex" v-model="formData.sex_id">
            <option value="">请选择性别</option>
            <option value="1">男</option>
            <option value="2">女</option>
          </select>
        </div>
        <div class="form-group">
          <label for="studentGrade">年级 *</label>
          <select id="studentGrade" v-model="formData.grade">
            <option value="">请选择年级</option>
            <option value="1">一年级</option>
            <option value="2">二年级</option>
            <option value="3">三年级</option>
            <option value="4">四年级</option>
            <option value="5">五年级</option>
            <option value="6">六年级</option>
            <option value="7">初一</option>
            <option value="8">初二</option>
            <option value="9">初三</option>
          </select>
        </div>
        <div class="form-group">
          <label for="studentPhone">电话 *</label>
          <input
            type="text"
            id="studentPhone"
            v-model="formData.phone"
            placeholder="请输入联系电话"
          >
        </div>
        <div class="form-group">
          <label for="studentCoaches">教练</label>
          <div class="multi-select">
            <div v-for="coach in activeCoaches" :key="coach.id" class="checkbox-item">
              <input
                type="checkbox"
                :id="'coach-' + coach.id"
                :value="coach.id"
                v-model="formData.coach_ids"
              >
              <label :for="'coach-' + coach.id">{{ coach.coach_name }}</label>
            </div>
            <div v-if="!activeCoaches || activeCoaches.length === 0" style="text-align: center; padding: 20px; color: #999;">
              暂无可选教练
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="studentStatus">状态</label>
          <select id="studentStatus" v-model="formData.status">
            <option value="0">启用</option>
            <option value="1">禁用</option>
          </select>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import { calculatePagination } from '@/utils/helpers'
import { getStudents, createStudent, updateStudent, deleteStudent } from '@/api/student'
import { getActiveCoaches } from '@/api/coach'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'

export default {
  name: 'StudentManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()

    const students = ref([])
    const filteredStudents = ref([])
    const loading = ref(false)
    const mounted = ref(false)
    const activeCoaches = ref([])
    const filters = ref({
      id: '',
      name: '',
      grade: '',
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
      grade: '',
      phone: '',
      coach_ids: [],
      status: '0'
    })

    const modalTitle = computed(() => {
      return isEditing.value ? '编辑学生' : '新增学生'
    })

    const paginatedStudents = computed(() => {
      if (!filteredStudents.value || !Array.isArray(filteredStudents.value)) {
        return []
      }
      const { items } = calculatePagination(filteredStudents.value, currentPage.value, pageSize)
      return items || []
    })

    const totalPages = computed(() => {
      if (!filteredStudents.value || !Array.isArray(filteredStudents.value)) {
        return 1
      }
      return Math.ceil(filteredStudents.value.length / pageSize) || 1
    })

    const hasPermission = (permissionId) => {
      return permissionStore.hasPermission(permissionId)
    }

    const fetchStudents = async () => {
      loading.value = true
      try {
        const response = await getStudents()
        if (response.data.code === 0) {
          // 映射后端字段名到前端期望的格式
          const rawStudents = response.data.data.students || []
          students.value = rawStudents.map(s => ({
            id: s.id,
            name: s.student_name,      // 后端返回 student_name
            sex_id: s.sex_id,          // 保留 sex_id
            grade: s.grade_id,         // 后端返回 grade_id (数字)
            phone: s.phone,            // 保留 phone
            coach_names: s.coach_names,// 教练姓名
            status: s.status
          }))
          // 初始化时显示所有学生
          filteredStudents.value = students.value
        }
      } catch (error) {
        console.error('Fetch students error:', error)
        alert('获取学生列表失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const handleFilter = () => {
      // 根据筛选条件过滤学生列表
      let result = students.value || []

      // ID 精确匹配
      if (filters.value.id) {
        result = result.filter(s => s && s.id == filters.value.id)
      }
      // 姓名模糊匹配
      if (filters.value.name) {
        result = result.filter(s => s && s.name && s.name.toLowerCase().includes(filters.value.name.toLowerCase()))
      }
      // 年级精确匹配
      if (filters.value.grade !== '') {
        result = result.filter(s => s && s.grade == filters.value.grade)
      }
      // 状态精确匹配
      if (filters.value.status !== '') {
        result = result.filter(s => s && s.status == filters.value.status)
      }

      filteredStudents.value = result
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        id: '',
        name: '',
        grade: '',
        status: ''
      }
      // 恢复为显示所有学生
      filteredStudents.value = students.value
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
        grade: '',
        phone: '',
        coach_ids: [],
        status: '0'
      }

      // 获取启用的教练列表
      try {
        const response = await getActiveCoaches()
        if (response.data && response.data.coaches) {
          activeCoaches.value = response.data.coaches
        }
      } catch (error) {
        console.error('获取教练列表失败:', error)
      }

      showModal.value = true
    }

    const openEditModal = async (student) => {
      isEditing.value = true
      formData.value = {
        id: student.id,
        name: student.name,
        sex_id: student.sex_id,
        grade: student.grade,
        phone: student.phone,
        coach_ids: student.coach_ids || [],
        status: student.status
      }

      // 获取启用的教练列表
      try {
        const response = await getActiveCoaches()
        if (response.data && response.data.coaches) {
          activeCoaches.value = response.data.coaches
        }
      } catch (error) {
        console.error('获取教练列表失败:', error)
      }

      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }

    const handleSubmit = async () => {
      // 表单验证
      if (!formData.value.name) {
        alert('请输入学生姓名')
        return
      }
      if (!formData.value.sex_id) {
        alert('请选择性别')
        return
      }
      if (!formData.value.grade) {
        alert('请选择年级')
        return
      }
      if (!formData.value.phone) {
        alert('请输入联系电话')
        return
      }

      loading.value = true
      try {
        // 映射字段名为后端期望的格式
        const data = {
          student_name: formData.value.name,     // name -> student_name
          sex_id: parseInt(formData.value.sex_id),
          grade_id: parseInt(formData.value.grade),  // grade -> grade_id
          phone: formData.value.phone,
          coach_ids: formData.value.coach_ids || []
        }

        if (isEditing.value) {
          // 编辑
          const response = await updateStudent(formData.value.id, data)
          if (response.data.code === 0) {
            alert('更新学生成功')
            closeModal()
            await fetchStudents()
          } else {
            alert('更新学生失败：' + response.data.message)
          }
        } else {
          // 新增
          const response = await createStudent(data)
          if (response.data.code === 0) {
            alert('新增学生成功')
            closeModal()
            await fetchStudents()
          } else {
            alert('新增学生失败：' + response.data.message)
          }
        }
      } catch (error) {
        console.error('Submit student error:', error)
        alert('操作失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const handleDelete = async (student) => {
      if (!confirm(`确定要删除学生 ${student.name} 吗？`)) {
        return
      }

      loading.value = true
      try {
        const response = await deleteStudent(student.id)
        // 后端删除成功返回 {"message": "学生删除成功"}，没有code字段
        // 需要检查 response.status === 200 或者 message 字段
        if (response.status === 200 || response.data.code === 0) {
          alert('删除学生成功')
          await fetchStudents()
        } else {
          alert('删除学生失败：' + (response.data.message || '未知错误'))
        }
      } catch (error) {
        console.error('Delete student error:', error)
        alert('删除失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const getSexText = (sexId) => {
      const sexMap = {
        1: '男',
        2: '女'
      }
      return sexMap[sexId] || '未知'
    }

    const getGradeText = (grade) => {
      const gradeMap = {
        1: '一年级',
        2: '二年级',
        3: '三年级',
        4: '四年级',
        5: '五年级',
        6: '六年级',
        7: '初一',
        8: '初二',
        9: '初三'
      }
      return gradeMap[grade] || '未知'
    }

    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    onMounted(async () => {
      await fetchStudents()
      mounted.value = true
    })

    return {
      students,
      filteredStudents,
      loading,
      mounted,
      activeCoaches,
      filters,
      currentPage,
      paginatedStudents,
      totalPages,
      showModal,
      modalTitle,
      formData,
      hasPermission,
      handleFilter,
      handleReset,
      handlePageChange,
      openAddModal,
      openEditModal,
      closeModal,
      handleSubmit,
      handleDelete,
      getSexText,
      getGradeText,
      getStatusText
    }
  }
}
</script>

<style scoped>
/* 使用全局样式，无需额外定义 */
</style>
