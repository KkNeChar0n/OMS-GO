<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>活动模板</h1>
        <button class="add-btn" @click="openAddTemplateDrawer">新增模板</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="templateIdFilter">ID</label>
            <input type="number" id="templateIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="templateNameFilter">模板名称</label>
            <input type="text" id="templateNameFilter" v-model="filters.name" placeholder="请输入模板名称">
          </div>
          <div class="filter-item">
            <label for="templateTypeFilter">活动类型</label>
            <select id="templateTypeFilter" v-model="filters.type">
              <option value="">全部</option>
              <option value="1">满减</option>
              <option value="2">满折</option>
              <option value="3">满赠</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="templateStatusFilter">状态</label>
            <select id="templateStatusFilter" v-model="filters.status">
              <option value="">全部</option>
              <option value="0">启用</option>
              <option value="1">禁用</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="search-btn" @click="searchTemplates">搜索</button>
          <button class="reset-btn" @click="resetFilters">重置</button>
        </div>
      </div>

      <!-- 活动模板列表 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>模板名称</th>
            <th>活动类型</th>
            <th>选择方式</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedTemplates || paginatedTemplates.length === 0">
            <td colspan="6" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="template in paginatedTemplates" :key="template.id" v-else>
            <td>{{ template.id }}</td>
            <td>{{ template.name }}</td>
            <td>{{ getActivityTypeText(template.type) }}</td>
            <td>{{ template.select_type === 1 ? '按类型' : '按商品' }}</td>
            <td>{{ template.status === 0 ? '启用' : '禁用' }}</td>
            <td class="action-column">
              <button class="edit-btn" @click="openDetailDrawer(template)">详情</button>
              <button v-if="template.status === 1" class="enable-btn" @click="updateTemplateStatus(template.id, 0)">启用</button>
              <button v-if="template.status === 0" class="disable-btn" @click="updateTemplateStatus(template.id, 1)">禁用</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 新增模板抽屉 -->
    <Drawer
      :show="showAddDrawer"
      title="新增活动模板"
      @close="closeAddDrawer"
      @confirm="saveTemplate"
    >
      <div class="form-group">
        <label for="templateName">模板名称 <span class="required">*</span></label>
        <input type="text" id="templateName" v-model="templateForm.name" placeholder="请输入模板名称" required>
      </div>
      <div class="form-group-row">
        <div class="form-group-col">
          <label for="templateType">活动类型 <span class="required">*</span></label>
          <select id="templateType" v-model="templateForm.type" required>
            <option value="">请选择活动类型</option>
            <option value="1">满减</option>
            <option value="2">满折</option>
            <option value="3">满赠</option>
          </select>
        </div>
        <div class="form-group-col">
          <label for="templateSelectType">选择方式 <span class="required">*</span></label>
          <select id="templateSelectType" v-model="templateForm.select_type" @change="onSelectTypeChange" required>
            <option value="">请选择方式</option>
            <option value="1">按类型</option>
            <option value="2">按商品</option>
          </select>
        </div>
        <div class="form-group-col" v-if="templateForm.select_type == 1">
          <label for="templateClassify">选择类型 <span class="required">*</span></label>
          <select id="templateClassify" v-model="selectedClassifyId" @change="onClassifyChange" multiple size="5">
            <option v-for="classify in activeClassifies" :key="classify.id" :value="classify.id">{{ classify.name }}</option>
          </select>
        </div>
      </div>
      <!-- 按商品选择 -->
      <div class="form-group" v-if="templateForm.select_type == 2">
        <label>选择商品 <span class="required">*</span></label>
        <table class="included-goods-table" v-if="selectedGoods.length > 0">
          <thead>
            <tr>
              <th>商品ID</th>
              <th>商品名称</th>
              <th>标准售价</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(goods, index) in selectedGoods" :key="goods.id">
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ goods.price }}</td>
              <td>
                <button type="button" class="delete-btn" @click="removeGoods(index)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="add-included-btn" @click="openAddGoodsModal">+ 新增商品</button>
      </div>
      <!-- 类型关联的商品展示（只读） -->
      <div class="form-group" v-if="templateForm.select_type == 1 && classifyGoods.length > 0">
        <label>类型关联商品（共 {{ classifyGoods.length }} 条）</label>
        <table class="included-goods-table">
          <thead>
            <tr>
              <th>商品ID</th>
              <th>商品名称</th>
              <th>标准售价</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="goods in paginatedClassifyGoods" :key="goods.id">
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ goods.price }}</td>
            </tr>
          </tbody>
        </table>
        <Pagination
          v-if="classifyGoodsTotalPages > 1"
          :current-page="classifyGoodsCurrentPage"
          :total-pages="classifyGoodsTotalPages"
          @page-change="handleClassifyGoodsPageChange"
        />
      </div>
      <div class="form-group">
        <label for="templateStatus">状态</label>
        <select id="templateStatus" v-model="templateForm.status">
          <option value="1">禁用</option>
          <option value="0">启用</option>
        </select>
      </div>
    </Drawer>

    <!-- 模板详情抽屉 -->
    <Drawer
      :show="showDetailDrawer"
      title="活动模板详情"
      :showConfirm="false"
      cancelText="关闭"
      @close="closeDetailDrawer"
    >
      <div class="form-group">
        <label>模板ID</label>
        <input type="text" :value="detailData.id" readonly class="readonly-input">
      </div>
      <div class="form-group">
        <label>模板名称</label>
        <input type="text" :value="detailData.name" readonly class="readonly-input">
      </div>
      <div class="form-group-row">
        <div class="form-group-col">
          <label>活动类型</label>
          <input type="text" :value="getActivityTypeText(detailData.type)" readonly class="readonly-input">
        </div>
        <div class="form-group-col">
          <label>选择方式</label>
          <input type="text" :value="detailData.select_type == 1 ? '按类型' : '按商品'" readonly class="readonly-input">
        </div>
        <div class="form-group-col">
          <label>状态</label>
          <input type="text" :value="detailData.status === 0 ? '启用' : '禁用'" readonly class="readonly-input">
        </div>
      </div>
      <!-- 类型列表 -->
      <div class="form-group" v-if="detailData.select_type == 1 && detailData.classifies && detailData.classifies.length > 0">
        <label>关联类型</label>
        <div class="classify-tags">
          <span v-for="(c, index) in detailData.classifies" :key="c.classify_id">
            {{ c.classify_name }}<span v-if="index < detailData.classifies.length - 1">、</span>
          </span>
        </div>
      </div>
      <!-- 商品列表 -->
      <div class="form-group" v-if="detailData.goods && detailData.goods.length > 0">
        <label>关联商品（共 {{ detailData.goods.length }} 条）</label>
        <table class="included-goods-table">
          <thead>
            <tr>
              <th>商品ID</th>
              <th>商品名称</th>
              <th>标准售价</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="goods in paginatedDetailGoods" :key="goods.id">
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ goods.price }}</td>
            </tr>
          </tbody>
        </table>
        <Pagination
          v-if="detailGoodsTotalPages > 1"
          :current-page="detailGoodsCurrentPage"
          :total-pages="detailGoodsTotalPages"
          @page-change="handleDetailGoodsPageChange"
        />
      </div>
    </Drawer>

    <!-- 新增商品弹窗 -->
    <Modal :show="showAddGoodsModal" @close="closeAddGoodsModal" title="选择商品" :showCancel="false" :showConfirm="false">
      <div class="form-group">
        <label for="goodsSearch">搜索商品</label>
        <input type="text" id="goodsSearch" v-model="goodsSearchKeyword" placeholder="请输入商品名称">
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>商品ID</th>
            <th>商品名称</th>
            <th>价格</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="goods in filteredAvailableGoods" :key="goods.id">
            <td>{{ goods.id }}</td>
            <td>{{ goods.name }}</td>
            <td>{{ goods.price }}</td>
            <td>
              <button type="button" class="add-btn" @click="addGoods(goods)">添加</button>
            </td>
          </tr>
        </tbody>
      </table>
      <template #footer>
        <button type="button" class="cancel-btn" @click="closeAddGoodsModal">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Drawer from '@/components/common/Drawer.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import Modal from '@/components/common/Modal.vue'
import {
  getActivityTemplates,
  getActivityTemplate,
  createActivityTemplate,
  updateActivityTemplateStatus
} from '@/api/activity_template'
import { getGoods } from '@/api/goods'
import { getClassifies } from '@/api/goods'

export default {
  name: 'ActivityTemplateManagement',
  components: {
    Drawer,
    Loading,
    Pagination,
    Modal
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    // 列表相关
    const templateList = ref([])
    const filteredTemplateList = ref([])
    const filters = ref({
      id: '',
      name: '',
      type: '',
      status: ''
    })
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 新增模板相关
    const showAddDrawer = ref(false)
    const templateForm = ref({
      name: '',
      type: '',
      select_type: '',
      status: '1'
    })
    const selectedClassifyId = ref([])
    const selectedGoods = ref([])
    const classifyGoods = ref([])
    const classifyGoodsCurrentPage = ref(1)
    const classifyGoodsPageSize = ref(10)

    // 详情相关
    const showDetailDrawer = ref(false)
    const detailData = ref({
      id: '',
      name: '',
      type: '',
      select_type: '',
      status: '',
      classifies: [],
      goods: []
    })
    const detailGoodsCurrentPage = ref(1)
    const detailGoodsPageSize = ref(10)

    // 商品选择相关
    const showAddGoodsModal = ref(false)
    const goodsList = ref([])
    const goodsSearchKeyword = ref('')

    // 分类列表
    const classifyList = ref([])
    const activeClassifies = computed(() => classifyList.value.filter(c => c.status === 0))

    // 计算属性
    const filteredTemplates = computed(() => {
      return filteredTemplateList.value
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredTemplates.value.length / pageSize.value) || 1
    })

    const paginatedTemplates = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredTemplates.value.slice(start, end)
    })

    const classifyGoodsTotalPages = computed(() => {
      return Math.ceil(classifyGoods.value.length / classifyGoodsPageSize.value) || 1
    })

    const paginatedClassifyGoods = computed(() => {
      const start = (classifyGoodsCurrentPage.value - 1) * classifyGoodsPageSize.value
      const end = start + classifyGoodsPageSize.value
      return classifyGoods.value.slice(start, end)
    })

    const detailGoodsTotalPages = computed(() => {
      if (!detailData.value.goods) return 1
      return Math.ceil(detailData.value.goods.length / detailGoodsPageSize.value) || 1
    })

    const paginatedDetailGoods = computed(() => {
      if (!detailData.value.goods) return []
      const start = (detailGoodsCurrentPage.value - 1) * detailGoodsPageSize.value
      const end = start + detailGoodsPageSize.value
      return detailData.value.goods.slice(start, end)
    })

    const filteredAvailableGoods = computed(() => {
      let goods = goodsList.value.filter(g => g.status === 0)
      if (goodsSearchKeyword.value) {
        goods = goods.filter(g => g.name.includes(goodsSearchKeyword.value))
      }
      // 过滤已选择的商品
      const selectedIds = selectedGoods.value.map(g => g.id)
      return goods.filter(g => !selectedIds.includes(g.id))
    })

    // 权限检查
    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    // 工具函数
    const getActivityTypeText = (type) => {
      const typeMap = {
        1: '满减',
        2: '满折',
        3: '满赠'
      }
      return typeMap[type] || '-'
    }

    // 列表相关方法
    const fetchTemplates = async () => {
      loading.value = true
      try {
        const response = await getActivityTemplates()
        const data = response.data?.activity_templates || response.data?.templates || response.data
        templateList.value = Array.isArray(data) ? data : []
        filteredTemplateList.value = templateList.value
      } catch (error) {
        console.error('获取活动模板列表失败:', error)
        templateList.value = []
        filteredTemplateList.value = []
        alert('获取活动模板列表失败')
      } finally {
        loading.value = false
      }
    }

    const searchTemplates = () => {
      filteredTemplateList.value = templateList.value.filter(template => {
        if (filters.value.id && template.id != filters.value.id) {
          return false
        }
        if (filters.value.name && !template.name.includes(filters.value.name)) {
          return false
        }
        if (filters.value.type !== '' && template.type != filters.value.type) {
          return false
        }
        if (filters.value.status !== '' && template.status != filters.value.status) {
          return false
        }
        return true
      })
      currentPage.value = 1
    }

    const resetFilters = () => {
      filters.value = {
        id: '',
        name: '',
        type: '',
        status: ''
      }
      filteredTemplateList.value = templateList.value
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const updateTemplateStatus = async (id, status) => {
      const action = status === 0 ? '启用' : '禁用'
      if (!confirm(`确定要${action}该模板吗？`)) {
        return
      }

      loading.value = true
      try {
        await updateActivityTemplateStatus(id, status)
        alert(`模板${action}成功`)
        await fetchTemplates()
      } catch (error) {
        console.error(`${action}模板失败:`, error)
        alert(`${action}模板失败`)
      } finally {
        loading.value = false
      }
    }

    // 新增模板相关方法
    const openAddTemplateDrawer = () => {
      templateForm.value = {
        name: '',
        type: '',
        select_type: '',
        status: '1'
      }
      selectedClassifyId.value = []
      selectedGoods.value = []
      classifyGoods.value = []
      showAddDrawer.value = true
    }

    const closeAddDrawer = () => {
      showAddDrawer.value = false
    }

    const onSelectTypeChange = () => {
      selectedClassifyId.value = []
      selectedGoods.value = []
      classifyGoods.value = []
    }

    const onClassifyChange = () => {
      // 获取选中类型的商品
      if (selectedClassifyId.value.length > 0) {
        const selectedClassifyIds = Array.isArray(selectedClassifyId.value)
          ? selectedClassifyId.value
          : [selectedClassifyId.value]
        classifyGoods.value = goodsList.value.filter(g =>
          selectedClassifyIds.includes(g.classify_id) && g.status === 0
        )
      } else {
        classifyGoods.value = []
      }
      classifyGoodsCurrentPage.value = 1
    }

    const handleClassifyGoodsPageChange = (page) => {
      classifyGoodsCurrentPage.value = page
    }

    const saveTemplate = async () => {
      // 验证表单
      if (!templateForm.value.name) {
        alert('请输入模板名称')
        return
      }
      if (!templateForm.value.type) {
        alert('请选择活动类型')
        return
      }
      if (!templateForm.value.select_type) {
        alert('请选择选择方式')
        return
      }
      if (templateForm.value.select_type == 1 && selectedClassifyId.value.length === 0) {
        alert('请选择类型')
        return
      }
      if (templateForm.value.select_type == 2 && selectedGoods.value.length === 0) {
        alert('请选择商品')
        return
      }

      loading.value = true
      try {
        const data = {
          name: templateForm.value.name,
          type: parseInt(templateForm.value.type),
          select_type: parseInt(templateForm.value.select_type),
          status: parseInt(templateForm.value.status)
        }

        if (templateForm.value.select_type == 1) {
          data.classify_ids = Array.isArray(selectedClassifyId.value)
            ? selectedClassifyId.value.map(id => parseInt(id))
            : [parseInt(selectedClassifyId.value)]
        } else {
          data.goods_ids = selectedGoods.value.map(g => g.id)
        }

        await createActivityTemplate(data)
        alert('活动模板创建成功')
        closeAddDrawer()
        await fetchTemplates()
      } catch (error) {
        console.error('创建活动模板失败:', error)
        alert('创建活动模板失败')
      } finally {
        loading.value = false
      }
    }

    // 商品选择相关方法
    const openAddGoodsModal = () => {
      goodsSearchKeyword.value = ''
      showAddGoodsModal.value = true
    }

    const closeAddGoodsModal = () => {
      showAddGoodsModal.value = false
    }

    const addGoods = (goods) => {
      if (!selectedGoods.value.find(g => g.id === goods.id)) {
        selectedGoods.value.push(goods)
      }
    }

    const removeGoods = (index) => {
      selectedGoods.value.splice(index, 1)
    }

    // 详情相关方法
    const openDetailDrawer = async (template) => {
      loading.value = true
      try {
        const response = await getActivityTemplate(template.id)
        const data = response.data.template || response.data

        let goods = []
        if (data.select_type == 1) {
          // 按类型选择，加载所有关联类型下的商品
          const classifyList = data.classify_list || []
          for (const classify of classifyList) {
            const goodsResponse = await getGoods({ classifyid: classify.classify_id, status: 0 })
            const classifyGoods = goodsResponse.data?.goods || goodsResponse.data || []
            goods = goods.concat(classifyGoods)
          }
        } else {
          // 按商品选择
          const goodsList = data.goods_list || []
          goods = goodsList.map(g => ({
            id: g.goods_id,
            name: g.goods_name,
            price: g.price
          }))
        }

        detailData.value = {
          id: data.id,
          name: data.name,
          type: data.type,
          select_type: data.select_type,
          status: data.status,
          classifies: data.classify_list || [],
          goods: goods
        }
        detailGoodsCurrentPage.value = 1
        showDetailDrawer.value = true
      } catch (error) {
        console.error('获取模板详情失败:', error)
        alert('获取模板详情失败')
      } finally {
        loading.value = false
      }
    }

    const closeDetailDrawer = () => {
      showDetailDrawer.value = false
    }

    const handleDetailGoodsPageChange = (page) => {
      detailGoodsCurrentPage.value = page
    }

    // 获取商品列表
    const fetchGoods = async () => {
      try {
        const response = await getGoods()
        goodsList.value = response.data?.goods || response.data || []
      } catch (error) {
        console.error('获取商品列表失败:', error)
        goodsList.value = []
      }
    }

    // 获取分类列表
    const fetchClassifies = async () => {
      try {
        const response = await getClassifies()
        classifyList.value = response.data?.classifies || response.classifies || []
      } catch (error) {
        console.error('获取分类列表失败:', error)
        classifyList.value = []
      }
    }

    // 初始化
    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchTemplates(),
          fetchGoods(),
          fetchClassifies()
        ])
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      // 列表相关
      templateList,
      filters,
      currentPage,
      totalPages,
      paginatedTemplates,
      searchTemplates,
      resetFilters,
      handlePageChange,
      updateTemplateStatus,
      // 新增模板相关
      showAddDrawer,
      templateForm,
      selectedClassifyId,
      selectedGoods,
      classifyGoods,
      classifyGoodsCurrentPage,
      classifyGoodsTotalPages,
      paginatedClassifyGoods,
      activeClassifies,
      openAddTemplateDrawer,
      closeAddDrawer,
      onSelectTypeChange,
      onClassifyChange,
      handleClassifyGoodsPageChange,
      saveTemplate,
      // 详情相关
      showDetailDrawer,
      detailData,
      detailGoodsCurrentPage,
      detailGoodsTotalPages,
      paginatedDetailGoods,
      openDetailDrawer,
      closeDetailDrawer,
      handleDetailGoodsPageChange,
      // 商品选择相关
      showAddGoodsModal,
      goodsSearchKeyword,
      filteredAvailableGoods,
      openAddGoodsModal,
      closeAddGoodsModal,
      addGoods,
      removeGoods,
      // 工具函数
      hasPermission,
      getActivityTypeText
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

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

.included-goods-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.included-goods-table th,
.included-goods-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.included-goods-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.add-included-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-included-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  padding: 4px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background-color: #da190b;
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.classify-tags {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.required {
  color: #ff4d4f;
}
</style>
