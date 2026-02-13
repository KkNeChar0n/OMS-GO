<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>商品管理</h1>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'goods' }]"
          @click="activeTab = 'goods'"
        >
          商品列表
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'brand' }]"
          @click="activeTab = 'brand'"
        >
          品牌管理
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'classify' }]"
          @click="activeTab = 'classify'"
        >
          分类管理
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'attribute' }]"
          @click="activeTab = 'attribute'"
        >
          属性管理
        </button>
      </div>

      <!-- 商品列表标签页 -->
      <div v-show="activeTab === 'goods'" class="tab-content">
        <div class="section-header">
          <button v-if="hasPermission('add_goods')" class="add-btn" @click="openAddGoodsModal">
            新增商品
          </button>
        </div>

        <!-- 筛选表单 -->
        <div class="filter-form">
          <div class="filter-row">
            <div class="filter-item">
              <label>商品名称</label>
              <input type="text" v-model="goodsFilters.name" placeholder="请输入商品名称">
            </div>
            <div class="filter-item">
              <label>品牌</label>
              <select v-model="goodsFilters.brandId">
                <option value="">全部</option>
                <option v-for="brand in activeBrands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label>分类</label>
              <select v-model="goodsFilters.classifyId">
                <option value="">全部</option>
                <option v-for="classify in activeClassifies" :key="classify.id" :value="classify.id">
                  {{ classify.name }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label>状态</label>
              <select v-model="goodsFilters.status">
                <option value="">全部</option>
                <option value="0">启用</option>
                <option value="1">禁用</option>
              </select>
            </div>
          </div>
          <div class="filter-actions">
            <button class="search-btn" @click="fetchGoods">搜索</button>
            <button class="reset-btn" @click="resetGoodsFilters">重置</button>
          </div>
        </div>

        <!-- 商品列表 -->
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>商品名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>价格</th>
              <th>库存</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!goodsList || goodsList.length === 0">
              <td colspan="8" style="text-align: center; padding: 40px;">暂无数据</td>
            </tr>
            <tr v-for="goods in paginatedGoods" :key="goods.id" v-else>
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ getBrandName(goods.brand_id) }}</td>
              <td>{{ getClassifyName(goods.classify_id) }}</td>
              <td>￥{{ goods.price }}</td>
              <td>{{ goods.stock || 0 }}</td>
              <td>{{ getStatusText(goods.status) }}</td>
              <td class="action-column">
                <button
                  v-if="hasPermission('edit_goods')"
                  class="edit-btn"
                  @click="openEditGoodsModal(goods)"
                >编辑</button>
                <button
                  v-if="hasPermission('edit_goods')"
                  :class="goods.status === 0 ? 'disable-btn' : 'enable-btn'"
                  @click="toggleGoodsStatus(goods)"
                >{{ goods.status === 0 ? '禁用' : '启用' }}</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <Pagination
          :current-page="goodsCurrentPage"
          :total-pages="goodsTotalPages"
          @page-change="handleGoodsPageChange"
        />
      </div>

      <!-- 品牌管理标签页 -->
      <div v-show="activeTab === 'brand'" class="tab-content">
        <div class="section-header">
          <button v-if="hasPermission('add_brand')" class="add-btn" @click="openAddBrandModal">
            新增品牌
          </button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>品牌名称</th>
              <th>描述</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!brandList || brandList.length === 0">
              <td colspan="5" style="text-align: center; padding: 40px;">暂无数据</td>
            </tr>
            <tr v-for="brand in brandList" :key="brand.id" v-else>
              <td>{{ brand.id }}</td>
              <td>{{ brand.name }}</td>
              <td>{{ brand.description || '-' }}</td>
              <td>{{ getStatusText(brand.status) }}</td>
              <td class="action-column">
                <button
                  v-if="hasPermission('edit_brand')"
                  class="edit-btn"
                  @click="openEditBrandModal(brand)"
                >编辑</button>
                <button
                  v-if="hasPermission('edit_brand')"
                  :class="brand.status === 0 ? 'disable-btn' : 'enable-btn'"
                  @click="toggleBrandStatus(brand)"
                >{{ brand.status === 0 ? '禁用' : '启用' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分类管理标签页 -->
      <div v-show="activeTab === 'classify'" class="tab-content">
        <div class="section-header">
          <button v-if="hasPermission('add_classify')" class="add-btn" @click="openAddClassifyModal">
            新增分类
          </button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>分类名称</th>
              <th>父级分类</th>
              <th>描述</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!classifyList || classifyList.length === 0">
              <td colspan="6" style="text-align: center; padding: 40px;">暂无数据</td>
            </tr>
            <tr v-for="classify in classifyList" :key="classify.id" v-else>
              <td>{{ classify.id }}</td>
              <td>{{ classify.name }}</td>
              <td>{{ getParentClassifyName(classify.parent_id) }}</td>
              <td>{{ classify.description || '-' }}</td>
              <td>{{ getStatusText(classify.status) }}</td>
              <td class="action-column">
                <button
                  v-if="hasPermission('edit_classify')"
                  class="edit-btn"
                  @click="openEditClassifyModal(classify)"
                >编辑</button>
                <button
                  v-if="hasPermission('edit_classify')"
                  :class="classify.status === 0 ? 'disable-btn' : 'enable-btn'"
                  @click="toggleClassifyStatus(classify)"
                >{{ classify.status === 0 ? '禁用' : '启用' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 属性管理标签页 -->
      <div v-show="activeTab === 'attribute'" class="tab-content">
        <div class="section-header">
          <button v-if="hasPermission('add_attribute')" class="add-btn" @click="openAddAttributeModal">
            新增属性
          </button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>属性名称</th>
              <th>描述</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!attributeList || attributeList.length === 0">
              <td colspan="5" style="text-align: center; padding: 40px;">暂无数据</td>
            </tr>
            <tr v-for="attr in attributeList" :key="attr.id" v-else>
              <td>{{ attr.id }}</td>
              <td>{{ attr.name }}</td>
              <td>{{ attr.description || '-' }}</td>
              <td>{{ getStatusText(attr.status) }}</td>
              <td class="action-column">
                <button
                  v-if="hasPermission('edit_attribute')"
                  class="edit-btn"
                  @click="openEditAttributeModal(attr)"
                >编辑</button>
                <button
                  v-if="hasPermission('edit_attribute')"
                  :class="attr.status === 0 ? 'disable-btn' : 'enable-btn'"
                  @click="toggleAttributeStatus(attr)"
                >{{ attr.status === 0 ? '禁用' : '启用' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 商品表单弹窗 -->
    <Modal :show="showGoodsModal" @close="closeGoodsModal" :title="goodsModalTitle">
      <form @submit.prevent="submitGoodsForm">
        <div class="form-group">
          <label for="goodsName">商品名称 <span class="required">*</span></label>
          <input
            type="text"
            id="goodsName"
            v-model="goodsForm.name"
            required
            placeholder="请输入商品名称"
          >
        </div>

        <div class="form-group">
          <label for="goodsBrand">品牌 <span class="required">*</span></label>
          <select id="goodsBrand" v-model="goodsForm.brand_id" required>
            <option value="">请选择品牌</option>
            <option v-for="brand in activeBrands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="goodsClassify">分类 <span class="required">*</span></label>
          <select id="goodsClassify" v-model="goodsForm.classify_id" required>
            <option value="">请选择分类</option>
            <option v-for="classify in activeClassifies" :key="classify.id" :value="classify.id">
              {{ classify.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="goodsPrice">价格 <span class="required">*</span></label>
          <input
            type="number"
            id="goodsPrice"
            v-model="goodsForm.price"
            required
            step="0.01"
            min="0"
            placeholder="请输入价格"
          >
        </div>

        <div class="form-group">
          <label for="goodsStock">库存</label>
          <input
            type="number"
            id="goodsStock"
            v-model="goodsForm.stock"
            min="0"
            placeholder="请输入库存数量"
          >
        </div>

        <div class="form-group">
          <label for="goodsDescription">商品描述</label>
          <textarea
            id="goodsDescription"
            v-model="goodsForm.description"
            rows="4"
            placeholder="请输入商品描述"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditMode ? '更新' : '创建' }}</button>
          <button type="button" class="cancel-btn" @click="closeGoodsModal">取消</button>
        </div>
      </form>
    </Modal>

    <!-- 品牌表单弹窗 -->
    <Modal :show="showBrandModal" @close="closeBrandModal" :title="brandModalTitle">
      <form @submit.prevent="submitBrandForm">
        <div class="form-group">
          <label for="brandName">品牌名称 <span class="required">*</span></label>
          <input
            type="text"
            id="brandName"
            v-model="brandForm.name"
            required
            placeholder="请输入品牌名称"
          >
        </div>

        <div class="form-group">
          <label for="brandDescription">品牌描述</label>
          <textarea
            id="brandDescription"
            v-model="brandForm.description"
            rows="4"
            placeholder="请输入品牌描述"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditMode ? '更新' : '创建' }}</button>
          <button type="button" class="cancel-btn" @click="closeBrandModal">取消</button>
        </div>
      </form>
    </Modal>

    <!-- 分类表单弹窗 -->
    <Modal :show="showClassifyModal" @close="closeClassifyModal" :title="classifyModalTitle">
      <form @submit.prevent="submitClassifyForm">
        <div class="form-group">
          <label for="classifyName">分类名称 <span class="required">*</span></label>
          <input
            type="text"
            id="classifyName"
            v-model="classifyForm.name"
            required
            placeholder="请输入分类名称"
          >
        </div>

        <div class="form-group">
          <label for="classifyParent">父级分类</label>
          <select id="classifyParent" v-model="classifyForm.parent_id">
            <option value="">无（顶级分类）</option>
            <option v-for="classify in parentClassifies" :key="classify.id" :value="classify.id">
              {{ classify.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="classifyDescription">分类描述</label>
          <textarea
            id="classifyDescription"
            v-model="classifyForm.description"
            rows="4"
            placeholder="请输入分类描述"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditMode ? '更新' : '创建' }}</button>
          <button type="button" class="cancel-btn" @click="closeClassifyModal">取消</button>
        </div>
      </form>
    </Modal>

    <!-- 属性表单弹窗 -->
    <Modal :show="showAttributeModal" @close="closeAttributeModal" :title="attributeModalTitle">
      <form @submit.prevent="submitAttributeForm">
        <div class="form-group">
          <label for="attributeName">属性名称 <span class="required">*</span></label>
          <input
            type="text"
            id="attributeName"
            v-model="attributeForm.name"
            required
            placeholder="请输入属性名称"
          >
        </div>

        <div class="form-group">
          <label for="attributeDescription">属性描述</label>
          <textarea
            id="attributeDescription"
            v-model="attributeForm.description"
            rows="4"
            placeholder="请输入属性描述"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditMode ? '更新' : '创建' }}</button>
          <button type="button" class="cancel-btn" @click="closeAttributeModal">取消</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import {
  getGoods,
  createGoods,
  updateGoods,
  updateGoodsStatus,
  getBrands,
  createBrand,
  updateBrand,
  getClassifies,
  createClassify,
  updateClassify,
  getAttributes,
  createAttribute,
  updateAttribute
} from '@/api/goods'

export default {
  name: 'GoodsManagement',
  components: {
    Modal,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)
    const activeTab = ref('goods')

    // 商品相关
    const goodsList = ref([])
    const goodsFilters = ref({
      name: '',
      brandId: '',
      classifyId: '',
      status: ''
    })
    const goodsCurrentPage = ref(1)
    const goodsPageSize = ref(10)
    const showGoodsModal = ref(false)
    const goodsForm = ref({
      name: '',
      brand_id: '',
      classify_id: '',
      price: '',
      stock: '',
      description: ''
    })
    const isEditMode = ref(false)
    const editingGoodsId = ref(null)

    // 品牌相关
    const brandList = ref([])
    const activeBrands = ref([])
    const showBrandModal = ref(false)
    const brandForm = ref({
      name: '',
      description: ''
    })
    const editingBrandId = ref(null)

    // 分类相关
    const classifyList = ref([])
    const activeClassifies = ref([])
    const parentClassifies = ref([])
    const showClassifyModal = ref(false)
    const classifyForm = ref({
      name: '',
      parent_id: '',
      description: ''
    })
    const editingClassifyId = ref(null)

    // 属性相关
    const attributeList = ref([])
    const showAttributeModal = ref(false)
    const attributeForm = ref({
      name: '',
      description: ''
    })
    const editingAttributeId = ref(null)

    // 计算属性
    const goodsModalTitle = computed(() => isEditMode.value ? '编辑商品' : '新增商品')
    const brandModalTitle = computed(() => isEditMode.value ? '编辑品牌' : '新增品牌')
    const classifyModalTitle = computed(() => isEditMode.value ? '编辑分类' : '新增分类')
    const attributeModalTitle = computed(() => isEditMode.value ? '编辑属性' : '新增属性')

    const filteredGoods = computed(() => {
      if (!goodsList.value) return []

      return goodsList.value.filter(goods => {
        if (goodsFilters.value.name && !goods.name.includes(goodsFilters.value.name)) {
          return false
        }
        if (goodsFilters.value.brandId && goods.brand_id != goodsFilters.value.brandId) {
          return false
        }
        if (goodsFilters.value.classifyId && goods.classify_id != goodsFilters.value.classifyId) {
          return false
        }
        if (goodsFilters.value.status !== '' && goods.status != goodsFilters.value.status) {
          return false
        }
        return true
      })
    })

    const goodsTotalPages = computed(() => {
      return Math.ceil(filteredGoods.value.length / goodsPageSize.value) || 1
    })

    const paginatedGoods = computed(() => {
      const start = (goodsCurrentPage.value - 1) * goodsPageSize.value
      const end = start + goodsPageSize.value
      return filteredGoods.value.slice(start, end)
    })

    // 权限检查
    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    // 工具函数
    const getStatusText = (status) => {
      return status === 0 ? '启用' : '禁用'
    }

    const getBrandName = (brandId) => {
      const brand = brandList.value.find(b => b.id === brandId)
      return brand ? brand.name : '-'
    }

    const getClassifyName = (classifyId) => {
      const classify = classifyList.value.find(c => c.id === classifyId)
      return classify ? classify.name : '-'
    }

    const getParentClassifyName = (parentId) => {
      if (!parentId) return '无'
      const classify = classifyList.value.find(c => c.id === parentId)
      return classify ? classify.name : '-'
    }

    // 商品相关方法
    const fetchGoods = async () => {
      loading.value = true
      try {
        const response = await getGoods()
        goodsList.value = response.data || []
      } catch (error) {
        console.error('获取商品列表失败:', error)
        alert('获取商品列表失败')
      } finally {
        loading.value = false
      }
    }

    const resetGoodsFilters = () => {
      goodsFilters.value = {
        name: '',
        brandId: '',
        classifyId: '',
        status: ''
      }
      goodsCurrentPage.value = 1
    }

    const handleGoodsPageChange = (page) => {
      goodsCurrentPage.value = page
    }

    const openAddGoodsModal = () => {
      isEditMode.value = false
      goodsForm.value = {
        name: '',
        brand_id: '',
        classify_id: '',
        price: '',
        stock: '',
        description: ''
      }
      showGoodsModal.value = true
    }

    const openEditGoodsModal = (goods) => {
      isEditMode.value = true
      editingGoodsId.value = goods.id
      goodsForm.value = {
        name: goods.name,
        brand_id: goods.brand_id,
        classify_id: goods.classify_id,
        price: goods.price,
        stock: goods.stock || '',
        description: goods.description || ''
      }
      showGoodsModal.value = true
    }

    const closeGoodsModal = () => {
      showGoodsModal.value = false
      goodsForm.value = {
        name: '',
        brand_id: '',
        classify_id: '',
        price: '',
        stock: '',
        description: ''
      }
    }

    const submitGoodsForm = async () => {
      loading.value = true
      try {
        const data = {
          ...goodsForm.value,
          price: parseFloat(goodsForm.value.price),
          stock: goodsForm.value.stock ? parseInt(goodsForm.value.stock) : 0
        }

        if (isEditMode.value) {
          await updateGoods(editingGoodsId.value, data)
          alert('商品更新成功')
        } else {
          await createGoods(data)
          alert('商品创建成功')
        }

        closeGoodsModal()
        await fetchGoods()
      } catch (error) {
        console.error('提交商品表单失败:', error)
        alert(isEditMode.value ? '商品更新失败' : '商品创建失败')
      } finally {
        loading.value = false
      }
    }

    const toggleGoodsStatus = async (goods) => {
      const newStatus = goods.status === 0 ? 1 : 0
      const action = newStatus === 0 ? '启用' : '禁用'

      if (!confirm(`确定要${action}商品"${goods.name}"吗？`)) {
        return
      }

      loading.value = true
      try {
        await updateGoodsStatus(goods.id, newStatus)
        alert(`商品${action}成功`)
        await fetchGoods()
      } catch (error) {
        console.error(`${action}商品失败:`, error)
        alert(`${action}商品失败`)
      } finally {
        loading.value = false
      }
    }

    // 品牌相关方法
    const fetchBrands = async () => {
      loading.value = true
      try {
        const response = await getBrands()
        brandList.value = response.data || []
        activeBrands.value = brandList.value.filter(b => b.status === 0)
      } catch (error) {
        console.error('获取品牌列表失败:', error)
        alert('获取品牌列表失败')
      } finally {
        loading.value = false
      }
    }

    const openAddBrandModal = () => {
      isEditMode.value = false
      brandForm.value = {
        name: '',
        description: ''
      }
      showBrandModal.value = true
    }

    const openEditBrandModal = (brand) => {
      isEditMode.value = true
      editingBrandId.value = brand.id
      brandForm.value = {
        name: brand.name,
        description: brand.description || ''
      }
      showBrandModal.value = true
    }

    const closeBrandModal = () => {
      showBrandModal.value = false
      brandForm.value = {
        name: '',
        description: ''
      }
    }

    const submitBrandForm = async () => {
      loading.value = true
      try {
        if (isEditMode.value) {
          await updateBrand(editingBrandId.value, brandForm.value)
          alert('品牌更新成功')
        } else {
          await createBrand(brandForm.value)
          alert('品牌创建成功')
        }

        closeBrandModal()
        await fetchBrands()
      } catch (error) {
        console.error('提交品牌表单失败:', error)
        alert(isEditMode.value ? '品牌更新失败' : '品牌创建失败')
      } finally {
        loading.value = false
      }
    }

    const toggleBrandStatus = async (brand) => {
      const newStatus = brand.status === 0 ? 1 : 0
      const action = newStatus === 0 ? '启用' : '禁用'

      if (!confirm(`确定要${action}品牌"${brand.name}"吗？`)) {
        return
      }

      loading.value = true
      try {
        await updateBrand(brand.id, { ...brand, status: newStatus })
        alert(`品牌${action}成功`)
        await fetchBrands()
      } catch (error) {
        console.error(`${action}品牌失败:`, error)
        alert(`${action}品牌失败`)
      } finally {
        loading.value = false
      }
    }

    // 分类相关方法
    const fetchClassifies = async () => {
      loading.value = true
      try {
        const response = await getClassifies()
        classifyList.value = response.data || []
        activeClassifies.value = classifyList.value.filter(c => c.status === 0)
        parentClassifies.value = classifyList.value.filter(c => !c.parent_id && c.status === 0)
      } catch (error) {
        console.error('获取分类列表失败:', error)
        alert('获取分类列表失败')
      } finally {
        loading.value = false
      }
    }

    const openAddClassifyModal = () => {
      isEditMode.value = false
      classifyForm.value = {
        name: '',
        parent_id: '',
        description: ''
      }
      showClassifyModal.value = true
    }

    const openEditClassifyModal = (classify) => {
      isEditMode.value = true
      editingClassifyId.value = classify.id
      classifyForm.value = {
        name: classify.name,
        parent_id: classify.parent_id || '',
        description: classify.description || ''
      }
      showClassifyModal.value = true
    }

    const closeClassifyModal = () => {
      showClassifyModal.value = false
      classifyForm.value = {
        name: '',
        parent_id: '',
        description: ''
      }
    }

    const submitClassifyForm = async () => {
      loading.value = true
      try {
        const data = {
          ...classifyForm.value,
          parent_id: classifyForm.value.parent_id || null
        }

        if (isEditMode.value) {
          await updateClassify(editingClassifyId.value, data)
          alert('分类更新成功')
        } else {
          await createClassify(data)
          alert('分类创建成功')
        }

        closeClassifyModal()
        await fetchClassifies()
      } catch (error) {
        console.error('提交分类表单失败:', error)
        alert(isEditMode.value ? '分类更新失败' : '分类创建失败')
      } finally {
        loading.value = false
      }
    }

    const toggleClassifyStatus = async (classify) => {
      const newStatus = classify.status === 0 ? 1 : 0
      const action = newStatus === 0 ? '启用' : '禁用'

      if (!confirm(`确定要${action}分类"${classify.name}"吗？`)) {
        return
      }

      loading.value = true
      try {
        await updateClassify(classify.id, { ...classify, status: newStatus })
        alert(`分类${action}成功`)
        await fetchClassifies()
      } catch (error) {
        console.error(`${action}分类失败:`, error)
        alert(`${action}分类失败`)
      } finally {
        loading.value = false
      }
    }

    // 属性相关方法
    const fetchAttributes = async () => {
      loading.value = true
      try {
        const response = await getAttributes()
        attributeList.value = response.data || []
      } catch (error) {
        console.error('获取属性列表失败:', error)
        alert('获取属性列表失败')
      } finally {
        loading.value = false
      }
    }

    const openAddAttributeModal = () => {
      isEditMode.value = false
      attributeForm.value = {
        name: '',
        description: ''
      }
      showAttributeModal.value = true
    }

    const openEditAttributeModal = (attr) => {
      isEditMode.value = true
      editingAttributeId.value = attr.id
      attributeForm.value = {
        name: attr.name,
        description: attr.description || ''
      }
      showAttributeModal.value = true
    }

    const closeAttributeModal = () => {
      showAttributeModal.value = false
      attributeForm.value = {
        name: '',
        description: ''
      }
    }

    const submitAttributeForm = async () => {
      loading.value = true
      try {
        if (isEditMode.value) {
          await updateAttribute(editingAttributeId.value, attributeForm.value)
          alert('属性更新成功')
        } else {
          await createAttribute(attributeForm.value)
          alert('属性创建成功')
        }

        closeAttributeModal()
        await fetchAttributes()
      } catch (error) {
        console.error('提交属性表单失败:', error)
        alert(isEditMode.value ? '属性更新失败' : '属性创建失败')
      } finally {
        loading.value = false
      }
    }

    const toggleAttributeStatus = async (attr) => {
      const newStatus = attr.status === 0 ? 1 : 0
      const action = newStatus === 0 ? '启用' : '禁用'

      if (!confirm(`确定要${action}属性"${attr.name}"吗？`)) {
        return
      }

      loading.value = true
      try {
        await updateAttribute(attr.id, { ...attr, status: newStatus })
        alert(`属性${action}成功`)
        await fetchAttributes()
      } catch (error) {
        console.error(`${action}属性失败:`, error)
        alert(`${action}属性失败`)
      } finally {
        loading.value = false
      }
    }

    // 初始化
    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchGoods(),
          fetchBrands(),
          fetchClassifies(),
          fetchAttributes()
        ])
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      activeTab,
      // 商品相关
      goodsList,
      goodsFilters,
      goodsCurrentPage,
      goodsTotalPages,
      paginatedGoods,
      showGoodsModal,
      goodsForm,
      goodsModalTitle,
      fetchGoods,
      resetGoodsFilters,
      handleGoodsPageChange,
      openAddGoodsModal,
      openEditGoodsModal,
      closeGoodsModal,
      submitGoodsForm,
      toggleGoodsStatus,
      // 品牌相关
      brandList,
      activeBrands,
      showBrandModal,
      brandForm,
      brandModalTitle,
      openAddBrandModal,
      openEditBrandModal,
      closeBrandModal,
      submitBrandForm,
      toggleBrandStatus,
      // 分类相关
      classifyList,
      activeClassifies,
      parentClassifies,
      showClassifyModal,
      classifyForm,
      classifyModalTitle,
      openAddClassifyModal,
      openEditClassifyModal,
      closeClassifyModal,
      submitClassifyForm,
      toggleClassifyStatus,
      // 属性相关
      attributeList,
      showAttributeModal,
      attributeForm,
      attributeModalTitle,
      openAddAttributeModal,
      openEditAttributeModal,
      closeAttributeModal,
      submitAttributeForm,
      toggleAttributeStatus,
      // 工具函数
      hasPermission,
      getStatusText,
      getBrandName,
      getClassifyName,
      getParentClassifyName,
      isEditMode
    }
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: bold;
}

.tab-content {
  padding: 20px 0;
}

.section-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.required {
  color: #ff4d4f;
}
</style>
