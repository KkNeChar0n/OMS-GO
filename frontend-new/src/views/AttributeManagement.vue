<template>
  <div class="page-container" style="position: relative;">
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>属性管理</h1>
        <button v-if="hasPermission('add_attribute')" class="add-btn" @click="openAddModal">新增属性</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="attributeIdFilter">ID</label>
            <input type="number" id="attributeIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="attributeClassifyFilter">分类</label>
            <select id="attributeClassifyFilter" v-model="filters.classify">
              <option value="">全部</option>
              <option value="0">属性</option>
              <option value="1">规格</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="attributeStatusFilter">状态</label>
            <select id="attributeStatusFilter" v-model="filters.status">
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
            <th>名字</th>
            <th>分类</th>
            <th>属性值</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedAttributes || paginatedAttributes.length === 0">
            <td colspan="6" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="attribute in paginatedAttributes" :key="attribute.id" v-else>
            <td>{{ attribute.id }}</td>
            <td>{{ attribute.name }}</td>
            <td>{{ getClassifyText(attribute.classify) }}</td>
            <td>{{ attribute.value_count || 0 }}</td>
            <td>{{ getStatusText(attribute.status) }}</td>
            <td class="action-column">
              <button v-if="hasPermission('edit_attribute')" class="edit-btn" @click="openEditModal(attribute)">编辑</button>
              <button v-if="hasPermission('edit_attribute_value')" class="edit-btn" @click="openAttributeValuesModal(attribute)">属性值</button>
              <button v-if="hasPermission('enable_attribute') && attribute.status === 1" class="enable-btn" @click="enableAttribute(attribute.id)">启用</button>
              <button v-if="hasPermission('disable_attribute') && attribute.status === 0" class="disable-btn" @click="disableAttribute(attribute.id)">禁用</button>
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

    <!-- 新增属性弹窗 -->
    <Modal :show="showAddModal" @close="closeAddModal" title="新增属性" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="attributeName">属性名称 <span class="required">*</span></label>
        <input type="text" id="attributeName" v-model="addForm.name" required placeholder="请输入属性名称">
      </div>
      <div class="form-group">
        <label for="attributeClassify">分类 <span class="required">*</span></label>
        <select id="attributeClassify" v-model="addForm.classify" required>
          <option value="">请选择</option>
          <option value="0">属性</option>
          <option value="1">规格</option>
        </select>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeAddModal">取消</button>
        <button type="button" class="save-btn" @click="submitAddForm">确定</button>
      </template>
    </Modal>

    <!-- 编辑属性弹窗 -->
    <Modal :show="showEditModal" @close="closeEditModal" title="编辑属性" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="editAttributeName">属性名称 <span class="required">*</span></label>
        <input type="text" id="editAttributeName" v-model="editForm.name" required placeholder="请输入属性名称">
      </div>
      <div class="form-group">
        <label for="editAttributeClassify">分类 <span class="required">*</span></label>
        <select id="editAttributeClassify" v-model="editForm.classify" required>
          <option value="">请选择</option>
          <option value="0">属性</option>
          <option value="1">规格</option>
        </select>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeEditModal">取消</button>
        <button type="button" class="save-btn" @click="submitEditForm">确定</button>
      </template>
    </Modal>

    <!-- 属性值管理弹窗 -->
    <Modal :show="showValuesModal" @close="closeValuesModal" title="属性值管理" :showCancel="false" :showConfirm="false" width="600px">
      <div class="values-management">
        <div class="form-group">
          <label>属性名称</label>
          <input type="text" :value="currentAttribute.name" readonly style="background-color: #f5f5f5; cursor: not-allowed;">
        </div>
        <div class="form-group">
          <label>属性值 <span class="required">*</span></label>
          <div v-for="(value, index) in attributeValueInputs" :key="index" class="value-input-row">
            <input
              type="text"
              v-model="attributeValueInputs[index]"
              placeholder="请输入属性值"
              class="value-input">
            <button
              v-if="attributeValueInputs.length > 1"
              class="remove-btn"
              @click="removeAttributeValueInput(index)">-</button>
            <button
              v-else
              class="clear-btn"
              @click="clearAttributeValueInput(index)">-</button>
            <button
              class="add-btn"
              @click="addAttributeValueInput"
              v-if="index === attributeValueInputs.length - 1">+</button>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeValuesModal">取消</button>
        <button type="button" class="save-btn" @click="handleSaveAttributeValues">保存</button>
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
import { getAttributes, createAttribute, updateAttribute, updateAttributeStatus, getAttributeValues, saveAttributeValues } from '@/api/goods'

export default {
  name: 'AttributeManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    const attributeList = ref([])
    const displayAttributes = ref([])
    const filters = ref({
      id: '',
      classify: '',
      status: ''
    })

    const currentPage = ref(1)
    const pageSize = ref(10)

    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showValuesModal = ref(false)

    const addForm = ref({
      name: '',
      classify: ''
    })

    const editForm = ref({
      id: null,
      name: '',
      classify: ''
    })

    const currentAttribute = ref({})
    const currentAttributeName = ref('')
    const attributeValueInputs = ref(['']) // 属性值输入框数组

    const totalPages = computed(() => {
      return Math.ceil(displayAttributes.value.length / pageSize.value) || 1
    })

    const paginatedAttributes = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return displayAttributes.value.slice(start, end)
    })

    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    const getClassifyText = (classify) => {
      return classify === 0 ? '属性' : '规格'
    }

    const fetchAttributes = async () => {
      loading.value = true
      try {
        const response = await getAttributes()
        attributeList.value = response.attributes || response.data?.attributes || response.data || []
        displayAttributes.value = attributeList.value
      } catch (error) {
        console.error('获取属性列表失败:', error)
        attributeList.value = []
        displayAttributes.value = []
        alert('获取属性列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleFilter = () => {
      displayAttributes.value = attributeList.value.filter(attribute => {
        if (filters.value.id && attribute.id != filters.value.id) {
          return false
        }
        if (filters.value.classify !== '' && attribute.classify != filters.value.classify) {
          return false
        }
        if (filters.value.status !== '' && attribute.status != filters.value.status) {
          return false
        }
        return true
      })
      currentPage.value = 1
    }

    const handleReset = () => {
      filters.value = {
        id: '',
        classify: '',
        status: ''
      }
      displayAttributes.value = attributeList.value
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const openAddModal = () => {
      addForm.value = {
        name: '',
        classify: ''
      }
      showAddModal.value = true
    }

    const closeAddModal = () => {
      showAddModal.value = false
    }

    const submitAddForm = async () => {
      loading.value = true
      try {
        await createAttribute({
          name: addForm.value.name,
          classify: parseInt(addForm.value.classify)
        })
        alert('属性创建成功')
        closeAddModal()
        await fetchAttributes()
      } catch (error) {
        console.error('创建属性失败:', error)
        alert('创建属性失败')
      } finally {
        loading.value = false
      }
    }

    const openEditModal = (attribute) => {
      editForm.value = {
        id: attribute.id,
        name: attribute.name,
        classify: attribute.classify
      }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const submitEditForm = async () => {
      loading.value = true
      try {
        await updateAttribute(editForm.value.id, {
          name: editForm.value.name,
          classify: parseInt(editForm.value.classify)
        })
        alert('属性更新成功')
        closeEditModal()
        await fetchAttributes()
      } catch (error) {
        console.error('更新属性失败:', error)
        alert('更新属性失败')
      } finally {
        loading.value = false
      }
    }

    const enableAttribute = async (attributeId) => {
      if (!confirm('确定要启用该属性吗？')) {
        return
      }
      loading.value = true
      try {
        await updateAttributeStatus(attributeId, 0)
        alert('属性启用成功')
        await fetchAttributes()
      } catch (error) {
        console.error('启用属性失败:', error)
        alert('启用属性失败')
      } finally {
        loading.value = false
      }
    }

    const disableAttribute = async (attributeId) => {
      if (!confirm('确定要禁用该属性吗？')) {
        return
      }
      loading.value = true
      try {
        await updateAttributeStatus(attributeId, 1)
        alert('属性禁用成功')
        await fetchAttributes()
      } catch (error) {
        console.error('禁用属性失败:', error)
        alert('禁用属性失败')
      } finally {
        loading.value = false
      }
    }

    const openAttributeValuesModal = async (attribute) => {
      currentAttribute.value = attribute
      currentAttributeName.value = attribute.name
      loading.value = true
      try {
        const response = await getAttributeValues(attribute.id)
        const values = response.data?.values || response.data || []
        // 将获取的属性值转换为字符串数组用于输入框
        if (values.length > 0) {
          attributeValueInputs.value = values.map(v => v.name)
        } else {
          attributeValueInputs.value = ['']
        }
        showValuesModal.value = true
      } catch (error) {
        console.error('获取属性值失败:', error)
        alert('获取属性值失败')
      } finally {
        loading.value = false
      }
    }

    const closeValuesModal = () => {
      showValuesModal.value = false
      currentAttribute.value = {}
      currentAttributeName.value = ''
      attributeValueInputs.value = ['']
    }

    const addAttributeValueInput = () => {
      attributeValueInputs.value.push('')
    }

    const removeAttributeValueInput = (index) => {
      attributeValueInputs.value.splice(index, 1)
    }

    const clearAttributeValueInput = (index) => {
      attributeValueInputs.value[index] = ''
    }

    const handleSaveAttributeValues = async () => {
      // 过滤掉空值
      const values = attributeValueInputs.value
        .map(v => v.trim())
        .filter(v => v !== '')

      if (values.length === 0) {
        alert('至少需要填入一条属性值')
        return
      }

      loading.value = true
      try {
        await saveAttributeValues(currentAttribute.value.id, values)
        alert('属性值保存成功')
        closeValuesModal()
        await fetchAttributes()
      } catch (error) {
        console.error('保存属性值失败:', error)
        alert('保存属性值失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      loading.value = true
      try {
        await fetchAttributes()
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      displayAttributes,
      filters,
      currentPage,
      totalPages,
      paginatedAttributes,
      hasPermission,
      getStatusText,
      getClassifyText,
      handleFilter,
      handleReset,
      handlePageChange,
      showAddModal,
      showEditModal,
      showValuesModal,
      addForm,
      editForm,
      currentAttribute,
      currentAttributeName,
      attributeValueInputs,
      openAddModal,
      closeAddModal,
      submitAddForm,
      openEditModal,
      closeEditModal,
      submitEditForm,
      enableAttribute,
      disableAttribute,
      openAttributeValuesModal,
      closeValuesModal,
      addAttributeValueInput,
      removeAttributeValueInput,
      clearAttributeValueInput,
      handleSaveAttributeValues
    }
  }
}
</script>

<style scoped>
.required {
  color: #e74c3c;
  margin-left: 2px;
}

.values-management {
  padding: 0;
}

.value-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.value-input-row .value-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.value-input-row .value-input:focus {
  outline: none;
  border-color: #3498db;
}

.value-input-row button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  min-width: 40px;
}

.value-input-row .add-btn {
  background-color: #27ae60;
  color: white;
}

.value-input-row .add-btn:hover {
  background-color: #229954;
}

.value-input-row .remove-btn,
.value-input-row .clear-btn {
  background-color: #e74c3c;
  color: white;
}

.value-input-row .remove-btn:hover,
.value-input-row .clear-btn:hover {
  background-color: #c0392b;
}

.save-btn {
  background-color: #3498db;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #2980b9;
}
</style>
