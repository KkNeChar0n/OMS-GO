<template>
  <div class="page-container" style="position: relative;">
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>品牌管理</h1>
        <button v-if="hasPermission('add_brand')" class="add-btn" @click="openAddModal">新增</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="brandIdFilter">ID</label>
            <input type="number" id="brandIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="brandNameFilter">名称</label>
            <input type="text" id="brandNameFilter" v-model="filters.name" placeholder="请输入名称">
          </div>
          <div class="filter-item">
            <label for="brandStatusFilter">状态</label>
            <select id="brandStatusFilter" v-model="filters.status">
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
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedBrands || paginatedBrands.length === 0">
            <td colspan="4" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="brand in paginatedBrands" :key="brand.id" v-else>
            <td>{{ brand.id }}</td>
            <td>{{ brand.name }}</td>
            <td>{{ getStatusText(brand.status) }}</td>
            <td class="action-column">
              <button v-if="hasPermission('edit_brand')" class="edit-btn" @click="openEditModal(brand)">编辑</button>
              <button v-if="hasPermission('enable_brand') && brand.status === 1" class="enable-btn" @click="enableBrand(brand.id)">启用</button>
              <button v-if="hasPermission('disable_brand') && brand.status === 0" class="disable-btn" @click="disableBrand(brand.id)">禁用</button>
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

    <!-- 新增品牌弹窗 -->
    <Modal :show="showAddModal" @close="closeAddModal" title="新增品牌" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="brandName">品牌名称 <span class="required">*</span></label>
        <input type="text" id="brandName" v-model="addForm.name" required placeholder="请输入品牌名称">
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeAddModal">取消</button>
        <button type="button" class="save-btn" @click="submitAddForm">确定</button>
      </template>
    </Modal>

    <!-- 编辑品牌弹窗 -->
    <Modal :show="showEditModal" @close="closeEditModal" title="编辑品牌" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="editBrandName">品牌名称 <span class="required">*</span></label>
        <input type="text" id="editBrandName" v-model="editForm.name" required placeholder="请输入品牌名称">
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
import { getBrands, createBrand, updateBrand, updateBrandStatus } from '@/api/goods'

export default {
  name: 'BrandManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    const brandList = ref([])
    const displayBrands = ref([])
    const filters = ref({
      id: '',
      name: '',
      status: ''
    })

    const currentPage = ref(1)
    const pageSize = ref(10)

    const showAddModal = ref(false)
    const showEditModal = ref(false)

    const addForm = ref({
      name: ''
    })

    const editForm = ref({
      id: null,
      name: ''
    })

    const totalPages = computed(() => {
      return Math.ceil(displayBrands.value.length / pageSize.value) || 1
    })

    const paginatedBrands = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return displayBrands.value.slice(start, end)
    })

    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    const fetchBrands = async () => {
      loading.value = true
      try {
        const response = await getBrands()
        brandList.value = response.brands || response.data?.brands || response.data || []
        displayBrands.value = brandList.value
      } catch (error) {
        console.error('获取品牌列表失败:', error)
        brandList.value = []
        displayBrands.value = []
        alert('获取品牌列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleFilter = () => {
      displayBrands.value = brandList.value.filter(brand => {
        if (filters.value.id && brand.id != filters.value.id) {
          return false
        }
        if (filters.value.name && !brand.name.includes(filters.value.name)) {
          return false
        }
        if (filters.value.status !== '' && brand.status != filters.value.status) {
          return false
        }
        return true
      })
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        id: '',
        name: '',
        status: ''
      }
      displayBrands.value = brandList.value
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const openAddModal = () => {
      addForm.value = {
        name: ''
      }
      showAddModal.value = true
    }

    const closeAddModal = () => {
      showAddModal.value = false
    }

    const submitAddForm = async () => {
      loading.value = true
      try {
        await createBrand({
          name: addForm.value.name
        })
        alert('品牌创建成功')
        closeAddModal()
        await fetchBrands()
      } catch (error) {
        console.error('创建品牌失败:', error)
        alert('创建品牌失败')
      } finally {
        loading.value = false
      }
    }

    const openEditModal = (brand) => {
      editForm.value = {
        id: brand.id,
        name: brand.name
      }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const submitEditForm = async () => {
      loading.value = true
      try {
        await updateBrand(editForm.value.id, {
          name: editForm.value.name
        })
        alert('品牌更新成功')
        closeEditModal()
        await fetchBrands()
      } catch (error) {
        console.error('更新品牌失败:', error)
        alert('更新品牌失败')
      } finally {
        loading.value = false
      }
    }

    const enableBrand = async (brandId) => {
      if (!confirm('确定要启用该品牌吗？')) {
        return
      }
      loading.value = true
      try {
        await updateBrandStatus(brandId, 0)
        alert('品牌启用成功')
        await fetchBrands()
      } catch (error) {
        console.error('启用品牌失败:', error)
        alert('启用品牌失败')
      } finally {
        loading.value = false
      }
    }

    const disableBrand = async (brandId) => {
      if (!confirm('确定要禁用该品牌吗？')) {
        return
      }
      loading.value = true
      try {
        await updateBrandStatus(brandId, 1)
        alert('品牌禁用成功')
        await fetchBrands()
      } catch (error) {
        console.error('禁用品牌失败:', error)
        alert('禁用品牌失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      loading.value = true
      try {
        await fetchBrands()
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      displayBrands,
      filters,
      currentPage,
      totalPages,
      paginatedBrands,
      hasPermission,
      getStatusText,
      handleFilter,
      handleReset,
      handlePageChange,
      showAddModal,
      showEditModal,
      addForm,
      editForm,
      openAddModal,
      closeAddModal,
      submitAddForm,
      openEditModal,
      closeEditModal,
      submitEditForm,
      enableBrand,
      disableBrand
    }
  }
}
</script>

<style scoped>
.required {
  color: #ff4d4f;
}
</style>
