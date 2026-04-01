<template>
  <div class="page-container" style="position: relative;">
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>类型管理</h1>
        <button v-if="hasPermission('add_classify')" class="add-btn" @click="openAddModal">新增</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="classifyIdFilter">ID</label>
            <input type="number" id="classifyIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="classifyLevelFilter">级别</label>
            <select id="classifyLevelFilter" v-model="filters.level">
              <option value="">全部</option>
              <option value="0">一级</option>
              <option value="1">二级</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="classifyStatusFilter">状态</label>
            <select id="classifyStatusFilter" v-model="filters.status">
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

      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>级别</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedClassifies || paginatedClassifies.length === 0">
            <td colspan="5" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="classify in paginatedClassifies" :key="classify.id" v-else>
            <td>{{ classify.id }}</td>
            <td>{{ classify.name }}</td>
            <td>{{ getLevelText(classify.level) }}</td>
            <td>{{ getStatusText(classify.status) }}</td>
            <td class="action-column">
              <button v-if="hasPermission('edit_classify')" class="edit-btn" @click="openEditModal(classify)">编辑</button>
              <button v-if="hasPermission('enable_classify') && classify.status === 1" class="enable-btn" @click="enableClassify(classify.id)">启用</button>
              <button v-if="hasPermission('disable_classify') && classify.status === 0" class="disable-btn" @click="disableClassify(classify.id)">禁用</button>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 新增类型弹窗 -->
    <Modal :show="showAddModal" @close="closeAddModal" title="新增类型" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="classifyName">类型名称 <span class="required">*</span></label>
        <input type="text" id="classifyName" v-model="addForm.name" required placeholder="请输入类型名称">
      </div>
      <div class="form-group">
        <label for="classifyLevel">级别 <span class="required">*</span></label>
        <select id="classifyLevel" v-model="addForm.level" @change="onAddLevelChange" required>
          <option value="">请选择</option>
          <option value="0">一级</option>
          <option value="1">二级</option>
        </select>
      </div>
      <div class="form-group" v-if="addForm.level === '1'">
        <label for="classifyParent">父级类型 <span class="required">*</span></label>
        <select id="classifyParent" v-model="addForm.parent_id" required>
          <option value="">请选择父级类型</option>
          <option v-for="parent in parentClassifies" :key="parent.id" :value="parent.id">{{ parent.name }}</option>
        </select>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeAddModal">取消</button>
        <button type="button" class="save-btn" @click="submitAddForm">确定</button>
      </template>
    </Modal>

    <!-- 编辑类型弹窗 -->
    <Modal :show="showEditModal" @close="closeEditModal" title="编辑类型" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="editClassifyName">类型名称 <span class="required">*</span></label>
        <input type="text" id="editClassifyName" v-model="editForm.name" required placeholder="请输入类型名称">
      </div>
      <div class="form-group">
        <label for="editClassifyLevel">级别 <span class="required">*</span></label>
        <select id="editClassifyLevel" v-model="editForm.level" @change="onEditLevelChange" required>
          <option value="">请选择</option>
          <option value="0">一级</option>
          <option value="1">二级</option>
        </select>
      </div>
      <div class="form-group" v-if="editForm.level === 1 || editForm.level === '1'">
        <label for="editClassifyParent">父级类型 <span class="required">*</span></label>
        <select id="editClassifyParent" v-model="editForm.parent_id" required>
          <option value="">请选择父级类型</option>
          <option v-for="parent in parentClassifies" :key="parent.id" :value="parent.id">{{ parent.name }}</option>
        </select>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeEditModal">取消</button>
        <button type="button" class="save-btn" @click="submitEditForm">确定</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import { getClassifies, createClassify, updateClassify, updateClassifyStatus, getParentClassifies } from '@/api/goods'

export default {
  name: 'ClassifyManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    const classifyList = ref([])
    const displayClassifies = ref([])
    const filters = ref({
      id: '',
      level: '',
      status: ''
    })

    const currentPage = ref(1)
    const pageSize = ref(10)

    const showAddModal = ref(false)
    const showEditModal = ref(false)

    const addForm = ref({
      name: '',
      level: '',
      parent_id: ''
    })

    const editForm = ref({
      id: null,
      name: '',
      level: '',
      parent_id: ''
    })

    const parentClassifies = ref([])

    const totalPages = computed(() => {
      return Math.ceil(displayClassifies.value.length / pageSize.value) || 1
    })

    const paginatedClassifies = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return displayClassifies.value.slice(start, end)
    })

    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    const getLevelText = (level) => {
      return level === 0 ? '一级' : '二级'
    }

    const fetchClassifies = async () => {
      loading.value = true
      try {
        const response = await getClassifies()
        classifyList.value = response.classifies || response.data?.classifies || response.data || []
        displayClassifies.value = classifyList.value
      } catch (error) {
        console.error('获取类型列表失败:', error)
        classifyList.value = []
        displayClassifies.value = []
        alert('获取类型列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleFilter = () => {
      displayClassifies.value = classifyList.value.filter(classify => {
        if (filters.value.id && classify.id != filters.value.id) {
          return false
        }
        if (filters.value.level !== '' && classify.level != filters.value.level) {
          return false
        }
        if (filters.value.status !== '' && classify.status != filters.value.status) {
          return false
        }
        return true
      })
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        id: '',
        level: '',
        status: ''
      }
      displayClassifies.value = classifyList.value
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const fetchParentClassifies = async () => {
      try {
        const response = await getParentClassifies()
        parentClassifies.value = response.data?.parents || response.data || []
      } catch (error) {
        console.error('获取父级分类失败:', error)
        parentClassifies.value = []
      }
    }

    const openAddModal = async () => {
      await fetchParentClassifies()
      addForm.value = {
        name: '',
        level: '',
        parent_id: ''
      }
      showAddModal.value = true
    }

    const onAddLevelChange = () => {
      if (addForm.value.level === '0') {
        addForm.value.parent_id = ''
      }
    }

    const closeAddModal = () => {
      showAddModal.value = false
    }

    const submitAddForm = async () => {
      if (!addForm.value.name || addForm.value.level === '') {
        alert('请填写所有必填字段')
        return
      }

      if (addForm.value.level === '1' && !addForm.value.parent_id) {
        alert('请选择父级类型')
        return
      }

      loading.value = true
      try {
        await createClassify({
          name: addForm.value.name,
          level: parseInt(addForm.value.level),
          parent_id: addForm.value.level === '1' ? parseInt(addForm.value.parent_id) : null
        })
        alert('类型创建成功')
        closeAddModal()
        await fetchClassifies()
      } catch (error) {
        console.error('创建类型失败:', error)
        alert('创建类型失败')
      } finally {
        loading.value = false
      }
    }

    const openEditModal = async (classify) => {
      await fetchParentClassifies()
      editForm.value = {
        id: classify.id,
        name: classify.name,
        level: classify.level,
        parent_id: classify.parent_id ? String(classify.parent_id) : ''
      }
      showEditModal.value = true
    }

    const onEditLevelChange = () => {
      const level = typeof editForm.value.level === 'string'
        ? parseInt(editForm.value.level)
        : editForm.value.level
      if (level === 0) {
        editForm.value.parent_id = ''
      }
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const submitEditForm = async () => {
      const level = typeof editForm.value.level === 'string'
        ? parseInt(editForm.value.level)
        : editForm.value.level

      if (!editForm.value.name || editForm.value.level === '') {
        alert('请填写所有必填字段')
        return
      }

      if (level === 1 && !editForm.value.parent_id) {
        alert('请选择父级类型')
        return
      }

      loading.value = true
      try {
        await updateClassify(editForm.value.id, {
          name: editForm.value.name,
          level: level,
          parent_id: level === 1 ? parseInt(editForm.value.parent_id) : null
        })
        alert('类型更新成功')
        closeEditModal()
        await fetchClassifies()
      } catch (error) {
        console.error('更新类型失败:', error)
        alert('更新类型失败')
      } finally {
        loading.value = false
      }
    }

    const enableClassify = async (classifyId) => {
      if (!confirm('确定要启用该类型吗？')) {
        return
      }
      loading.value = true
      try {
        await updateClassifyStatus(classifyId, 0)
        alert('类型启用成功')
        await fetchClassifies()
      } catch (error) {
        console.error('启用类型失败:', error)
        alert('启用类型失败')
      } finally {
        loading.value = false
      }
    }

    const disableClassify = async (classifyId) => {
      if (!confirm('确定要禁用该类型吗？')) {
        return
      }
      loading.value = true
      try {
        await updateClassifyStatus(classifyId, 1)
        alert('类型禁用成功')
        await fetchClassifies()
      } catch (error) {
        console.error('禁用类型失败:', error)
        alert('禁用类型失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      loading.value = true
      try {
        await fetchClassifies()
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      displayClassifies,
      filters,
      currentPage,
      totalPages,
      paginatedClassifies,
      hasPermission,
      getStatusText,
      getLevelText,
      handleFilter,
      handleReset,
      handlePageChange,
      showAddModal,
      showEditModal,
      addForm,
      editForm,
      parentClassifies,
      openAddModal,
      closeAddModal,
      submitAddForm,
      onAddLevelChange,
      openEditModal,
      closeEditModal,
      submitEditForm,
      onEditLevelChange,
      enableClassify,
      disableClassify
    }
  }
}
</script>

<style scoped>
.required {
  color: #ff4d4f;
}
</style>
