<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>商品管理</h1>
        <button v-if="hasPermission('add_goods')" class="add-btn" @click="openAddGoodsDrawer">新增</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="goodsIdFilter">ID</label>
            <input type="number" id="goodsIdFilter" v-model="goodsFilters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="goodsNameFilter">名称</label>
            <input type="text" id="goodsNameFilter" v-model="goodsFilters.name" placeholder="请输入名称">
          </div>
          <div class="filter-item">
            <label for="goodsBrandFilter">品牌</label>
            <select id="goodsBrandFilter" v-model="goodsFilters.brandid">
              <option value="">全部</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="goodsClassifyFilter">类型</label>
            <select id="goodsClassifyFilter" v-model="goodsFilters.classifyid">
              <option value="">全部</option>
              <option v-for="classify in classifies" :key="classify.id" :value="classify.id">{{ classify.name }}</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="goodsStatusFilter">状态</label>
            <select id="goodsStatusFilter" v-model="goodsFilters.status">
              <option value="">全部</option>
              <option value="0">启用</option>
              <option value="1">禁用</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="search-btn" @click="searchGoods">搜索</button>
          <button class="reset-btn" @click="resetGoodsFilters">重置</button>
        </div>
      </div>

      <!-- 商品列表 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>价格</th>
            <th>品牌</th>
            <th>类型</th>
            <th>属性</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedGoods || paginatedGoods.length === 0">
            <td colspan="8" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="goods in paginatedGoods" :key="goods.id" v-else>
            <td>{{ goods.id }}</td>
            <td>{{ goods.name }}</td>
            <td>{{ goods.price }}</td>
            <td>{{ goods.brand_name }}</td>
            <td>{{ goods.classify_name }}</td>
            <td :title="getFullAttributes(goods)" class="goods-attributes-cell">
              {{ formatGoodsAttributes(goods) || '无' }}
            </td>
            <td>{{ goods.status === 0 ? '启用' : '禁用' }}</td>
            <td class="action-column">
              <button v-if="hasPermission('edit_goods')" class="edit-btn" @click="openEditGoodsDrawer(goods.id)">编辑</button>
              <button v-if="hasPermission('enable_goods') && goods.status === 1" class="enable-btn" @click="enableGoods(goods.id)">启用</button>
              <button v-if="hasPermission('disable_goods') && goods.status === 0" class="disable-btn" @click="disableGoods(goods.id)">禁用</button>
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

    <!-- 新增商品 Drawer -->
    <Drawer
      :show="showAddGoodsDrawer"
      @close="closeAddGoodsDrawer"
      @confirm="saveAddGoods"
      title="新增商品"
      cancelText="取消"
      confirmText="确定"
    >
      <div class="form-group">
        <label for="addGoodsName">名称 <span class="required">*</span></label>
        <input type="text" id="addGoodsName" v-model="addGoodsData.name" placeholder="请输入商品名称" required>
      </div>

      <div class="form-group-row">
        <div class="form-group-col">
          <label for="addGoodsBrand">品牌 <span class="required">*</span></label>
          <select id="addGoodsBrand" v-model="addGoodsData.brandid" required>
            <option value="">请选择品牌</option>
            <option v-for="brand in activeBrands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
          </select>
        </div>
        <div class="form-group-col">
          <label for="addGoodsClassify">类型 <span class="required">*</span></label>
          <select id="addGoodsClassify" v-model="addGoodsData.classifyid" required>
            <option value="">请选择类型</option>
            <option v-for="classify in activeClassifies" :key="classify.id" :value="classify.id">{{ classify.name }}</option>
          </select>
        </div>
        <div class="form-group-col">
          <label for="addGoodsIsGroup">组合售卖 <span class="required">*</span></label>
          <select id="addGoodsIsGroup" v-model.number="addGoodsData.isgroup" @change="onIsGroupChange" required>
            <option :value="1">否（单独售卖）</option>
            <option :value="0">是（套餐）</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="addGoodsPrice">标准售价 <span class="required">*</span></label>
        <input type="number" step="0.01" id="addGoodsPrice" v-model="addGoodsData.price" placeholder="请输入标准售价" required>
      </div>

      <div class="form-group" v-if="addGoodsData.isgroup == 0">
        <label>商品总价（仅供参考）</label>
        <input type="text" :value="totalGoodsPrice" readonly class="readonly-input">
      </div>

      <div class="form-group" v-if="addGoodsData.isgroup == 0">
        <label>包含商品 <span class="required">*</span></label>
        <table class="included-goods-table" v-if="selectedIncludedGoods.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>商品名称</th>
              <th>标准售价</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(goods, index) in selectedIncludedGoods" :key="goods.id">
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ goods.price }}</td>
              <td>
                <button type="button" class="delete-btn" @click="removeIncludedGoods(index)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="add-included-btn" @click="openAddIncludedGoodsModal">+ 新增包含商品</button>
      </div>

      <div class="form-group">
        <label>属性</label>
        <div v-for="(row, index) in goodsAttributeRows" :key="index" class="attribute-row">
          <select v-model="row.attributeId" @change="onRowAttributeChange(index)" class="attr-select">
            <option value="">请选择属性</option>
            <option v-for="attr in getAvailableAttributes(index)" :key="attr.id" :value="attr.id">{{ attr.name }}</option>
          </select>
          <select v-model="row.valueId" class="value-select">
            <option value="">请选择属性值</option>
            <option v-for="value in getAttributeValues(row.attributeId)" :key="value.id" :value="value.id">{{ value.name }}</option>
          </select>
          <div class="row-buttons">
            <button type="button" class="row-add-btn" @click="addAttributeRow" v-if="index === goodsAttributeRows.length - 1">+</button>
            <button type="button" class="row-remove-btn" @click="removeAttributeRow(index)" v-if="goodsAttributeRows.length > 1">-</button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>规格</label>
        <div v-for="(row, index) in goodsSpecRows" :key="index" class="attribute-row">
          <select v-model="row.attributeId" @change="onRowSpecChange(index)" class="attr-select">
            <option value="">请选择规格</option>
            <option v-for="spec in getAvailableSpecs(index)" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
          </select>
          <select v-model="row.valueId" class="value-select">
            <option value="">请选择规格值</option>
            <option v-for="value in getAttributeValues(row.attributeId)" :key="value.id" :value="value.id">{{ value.name }}</option>
          </select>
          <div class="row-buttons">
            <button type="button" class="row-add-btn" @click="addSpecRow" v-if="index === goodsSpecRows.length - 1">+</button>
            <button type="button" class="row-remove-btn" @click="removeSpecRow(index)" v-if="goodsSpecRows.length > 1">-</button>
          </div>
        </div>
      </div>
    </Drawer>

    <!-- 编辑商品 Drawer -->
    <Drawer
      :show="showEditGoodsDrawer"
      @close="closeEditGoodsDrawer"
      @confirm="saveEditGoods"
      title="编辑商品"
      cancelText="取消"
      confirmText="确定"
    >
      <div class="form-group">
        <label for="editGoodsName">名称 <span class="required">*</span></label>
        <input type="text" id="editGoodsName" v-model="editGoodsData.name" placeholder="请输入商品名称" required>
      </div>

      <div class="form-group-row">
        <div class="form-group-col">
          <label for="editGoodsBrand">品牌 <span class="required">*</span></label>
          <select id="editGoodsBrand" v-model="editGoodsData.brandid" required>
            <option value="">请选择品牌</option>
            <option v-for="brand in activeBrands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
          </select>
        </div>
        <div class="form-group-col">
          <label for="editGoodsClassify">类型 <span class="required">*</span></label>
          <select id="editGoodsClassify" v-model="editGoodsData.classifyid" required>
            <option value="">请选择类型</option>
            <option v-for="classify in activeClassifies" :key="classify.id" :value="classify.id">{{ classify.name }}</option>
          </select>
        </div>
        <div class="form-group-col">
          <label>组合售卖</label>
          <select v-model.number="editGoodsData.isgroup" class="disabled-select" disabled>
            <option :value="1">否（单独售卖）</option>
            <option :value="0">是（套餐）</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="editGoodsPrice">标准售价 <span class="required">*</span></label>
        <input type="number" step="0.01" id="editGoodsPrice" v-model="editGoodsData.price" placeholder="请输入标准售价" required>
      </div>

      <div class="form-group" v-if="editGoodsData.isgroup == 0">
        <label>商品总价（仅供参考）</label>
        <input type="text" :value="totalGoodsPrice" readonly class="readonly-input">
      </div>

      <div class="form-group" v-if="editGoodsData.isgroup == 0">
        <label>包含商品 <span class="required">*</span></label>
        <table class="included-goods-table" v-if="selectedIncludedGoods.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>商品名称</th>
              <th>标准售价</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(goods, index) in selectedIncludedGoods" :key="goods.id">
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ goods.price }}</td>
              <td>
                <button type="button" class="delete-btn" @click="removeIncludedGoods(index)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="add-included-btn" @click="openAddIncludedGoodsModal">+ 新增包含商品</button>
      </div>

      <div class="form-group">
        <label>属性</label>
        <div v-for="(row, index) in goodsAttributeRows" :key="index" class="attribute-row">
          <select v-model="row.attributeId" @change="onRowAttributeChange(index)" class="attr-select">
            <option value="">请选择属性</option>
            <option v-for="attr in getAvailableAttributes(index)" :key="attr.id" :value="attr.id">{{ attr.name }}</option>
          </select>
          <select v-model="row.valueId" class="value-select">
            <option value="">请选择属性值</option>
            <option v-for="value in getAttributeValues(row.attributeId)" :key="value.id" :value="value.id">{{ value.name }}</option>
          </select>
          <div class="row-buttons">
            <button type="button" class="row-add-btn" @click="addAttributeRow" v-if="index === goodsAttributeRows.length - 1">+</button>
            <button type="button" class="row-remove-btn" @click="removeAttributeRow(index)" v-if="goodsAttributeRows.length > 1">-</button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>规格</label>
        <div v-for="(row, index) in goodsSpecRows" :key="index" class="attribute-row">
          <select v-model="row.attributeId" @change="onRowSpecChange(index)" class="attr-select">
            <option value="">请选择规格</option>
            <option v-for="spec in getAvailableSpecs(index)" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
          </select>
          <select v-model="row.valueId" class="value-select">
            <option value="">请选择规格值</option>
            <option v-for="value in getAttributeValues(row.attributeId)" :key="value.id" :value="value.id">{{ value.name }}</option>
          </select>
          <div class="row-buttons">
            <button type="button" class="row-add-btn" @click="addSpecRow" v-if="index === goodsSpecRows.length - 1">+</button>
            <button type="button" class="row-remove-btn" @click="removeSpecRow(index)" v-if="goodsSpecRows.length > 1">-</button>
          </div>
        </div>
      </div>
    </Drawer>

    <!-- 新增包含商品子弹窗 -->
    <Modal
      :show="showAddIncludedGoodsModal"
      @close="closeAddIncludedGoodsModal"
      title="新增包含商品"
      :showCancel="false"
      :showConfirm="false"
    >
      <div class="form-group">
        <label for="includedGoodsName">商品名称 <span class="required">*</span></label>
        <select id="includedGoodsName" v-model="addIncludedGoodsData.goods_id" @change="onIncludedGoodsChange" required>
          <option value="">请选择商品</option>
          <option v-for="goods in availableGoodsForSelection" :key="goods.id" :value="goods.id">
            {{ goods.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="includedGoodsBrand">品牌</label>
        <input type="text" id="includedGoodsBrand" v-model="addIncludedGoodsData.brand_name" readonly class="readonly-input">
      </div>
      <div class="form-group">
        <label for="includedGoodsClassify">类型</label>
        <input type="text" id="includedGoodsClassify" v-model="addIncludedGoodsData.classify_name" readonly class="readonly-input">
      </div>
      <div class="form-group">
        <label for="includedGoodsAttributes">属性+属性值</label>
        <input type="text" id="includedGoodsAttributes" v-model="addIncludedGoodsData.attributes" readonly class="readonly-input">
      </div>
      <div class="form-group">
        <label for="includedGoodsPrice">标准售价</label>
        <input type="text" id="includedGoodsPrice" v-model="addIncludedGoodsData.price" readonly class="readonly-input">
      </div>

      <template #footer>
        <button type="button" class="cancel-btn" @click="closeAddIncludedGoodsModal">取消</button>
        <button type="button" class="save-btn" @click="saveIncludedGoods">保存</button>
      </template>
    </Modal>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Modal from '@/components/common/Modal.vue'
import Drawer from '@/components/common/Drawer.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import {
  getGoods,
  createGoods,
  updateGoods,
  updateGoodsStatus,
  getBrands,
  getClassifies,
  getAttributes,
  getActiveBrands,
  getActiveClassifies,
  getActiveAttributes,
  getAvailableGoodsForCombo,
  getIncludedGoods,
  getGoodsItem
} from '@/api/goods'

export default {
  name: 'GoodsManagement',
  components: {
    Modal,
    Drawer,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    // 商品相关
    const goodsList = ref([])
    const displayGoods = ref([])
    const goodsFilters = ref({
      id: '',
      name: '',
      brandid: '',
      classifyid: '',
      status: ''
    })
    const goodsCurrentPage = ref(1)
    const goodsPageSize = ref(10)

    // 品牌和分类
    const brandList = ref([])
    const classifyList = ref([])
    const activeBrands = ref([])
    const activeClassifies = ref([])
    const activeAttributes = ref([])

    // 新增商品 Drawer
    const showAddGoodsDrawer = ref(false)
    const addGoodsData = ref({
      name: '',
      brandid: '',
      classifyid: '',
      isgroup: 1,
      price: '',
      attributevalue_ids: []
    })

    // 编辑商品 Drawer
    const showEditGoodsDrawer = ref(false)
    const editGoodsData = ref({
      id: '',
      name: '',
      brandid: '',
      classifyid: '',
      isgroup: 1,
      price: '',
      attributevalue_ids: []
    })

    // 属性和规格行
    const goodsAttributeRows = ref([{ attributeId: '', valueId: '' }])
    const goodsSpecRows = ref([{ attributeId: '', valueId: '' }])

    // 组合商品相关
    const selectedIncludedGoods = ref([])
    const availableGoodsForCombo = ref([])
    const showAddIncludedGoodsModal = ref(false)
    const addIncludedGoodsData = ref({
      goods_id: '',
      goods_name: '',
      brand_name: '',
      classify_name: '',
      attributes: '',
      price: ''
    })

    // 计算属性
    const brands = computed(() => brandList.value)
    const classifies = computed(() => classifyList.value)

    // 属性列表（classify=0）
    const attributesList = computed(() => {
      return activeAttributes.value.filter(attr => attr.classify === 0)
    })

    // 规格列表（classify=1）
    const specsList = computed(() => {
      return activeAttributes.value.filter(attr => attr.classify === 1)
    })

    const goodsTotalPages = computed(() => {
      return Math.ceil(displayGoods.value.length / goodsPageSize.value) || 1
    })

    const paginatedGoods = computed(() => {
      const start = (goodsCurrentPage.value - 1) * goodsPageSize.value
      const end = start + goodsPageSize.value
      return displayGoods.value.slice(start, end)
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
        goodsList.value = response.goods || response.data?.goods || response.data || []
        displayGoods.value = goodsList.value
      } catch (error) {
        console.error('获取商品列表失败:', error)
        goodsList.value = []
        displayGoods.value = []
        alert('获取商品列表失败')
      } finally {
        loading.value = false
      }
    }

    const searchGoods = () => {
      displayGoods.value = goodsList.value.filter(goods => {
        if (goodsFilters.value.id && goods.id != goodsFilters.value.id) {
          return false
        }
        if (goodsFilters.value.name && !goods.name.includes(goodsFilters.value.name)) {
          return false
        }
        if (goodsFilters.value.brandid && goods.brandid != goodsFilters.value.brandid) {
          return false
        }
        if (goodsFilters.value.classifyid && goods.classifyid != goodsFilters.value.classifyid) {
          return false
        }
        if (goodsFilters.value.status !== '' && goods.status != goodsFilters.value.status) {
          return false
        }
        return true
      })
      goodsCurrentPage.value = 1
    }

    const resetGoodsFilters = () => {
      goodsFilters.value = {
        id: '',
        name: '',
        brandid: '',
        classifyid: '',
        status: ''
      }
      displayGoods.value = goodsList.value
      goodsCurrentPage.value = 1
    }

    const handleGoodsPageChange = (page) => {
      goodsCurrentPage.value = page
    }

    // 计算商品总价
    const totalGoodsPrice = computed(() => {
      if (selectedIncludedGoods.value.length === 0) return '0.00'
      const total = selectedIncludedGoods.value.reduce((sum, goods) => {
        return sum + parseFloat(goods.price || 0)
      }, 0)
      return total.toFixed(2)
    })

    // 可选择的商品列表（排除已选择的）
    const availableGoodsForSelection = computed(() => {
      const selectedIds = selectedIncludedGoods.value.map(g => g.id)
      return availableGoodsForCombo.value.filter(g => !selectedIds.includes(g.id))
    })

    // 打开新增商品抽屉
    const openAddGoodsDrawer = async () => {
      try {
        const [brandsRes, classifiesRes, attributesRes] = await Promise.all([
          getActiveBrands(),
          getActiveClassifies(),
          getActiveAttributes()
        ])
        activeBrands.value = brandsRes.data?.brands || []
        activeClassifies.value = classifiesRes.data?.classifies || []
        activeAttributes.value = attributesRes.data?.attributes || []
      } catch (error) {
        console.error('获取数据失败:', error)
        alert('获取数据失败')
      }
      showAddGoodsDrawer.value = true
    }

    // 关闭新增商品抽屉
    const closeAddGoodsDrawer = () => {
      showAddGoodsDrawer.value = false
      addGoodsData.value = {
        name: '',
        brandid: '',
        classifyid: '',
        isgroup: 1,
        price: '',
        attributevalue_ids: []
      }
      selectedIncludedGoods.value = []
      goodsAttributeRows.value = [{ attributeId: '', valueId: '' }]
      goodsSpecRows.value = [{ attributeId: '', valueId: '' }]
    }

    // 获取某行可用的属性列表（排除已选择的属性，只返回classify=0的）
    const getAvailableAttributes = (currentIndex) => {
      const selectedAttrIds = goodsAttributeRows.value
        .map((row, index) => index !== currentIndex ? String(row.attributeId) : null)
        .filter(id => id && id !== '')
      return attributesList.value.filter(attr => !selectedAttrIds.includes(String(attr.id)))
    }

    // 获取某行可用的规格列表（排除已选择的规格，只返回classify=1的）
    const getAvailableSpecs = (currentIndex) => {
      const selectedSpecIds = goodsSpecRows.value
        .map((row, index) => index !== currentIndex ? String(row.attributeId) : null)
        .filter(id => id && id !== '')
      return specsList.value.filter(spec => !selectedSpecIds.includes(String(spec.id)))
    }

    // 获取某个属性的属性值列表
    const getAttributeValues = (attributeId) => {
      if (!attributeId) return []
      const attribute = activeAttributes.value.find(attr => attr.id === parseInt(attributeId))
      return attribute && attribute.values ? attribute.values : []
    }

    // 当某行的属性选择变化时，清空该行的属性值
    const onRowAttributeChange = (index) => {
      goodsAttributeRows.value[index].valueId = ''
    }

    // 添加新的属性行
    const addAttributeRow = () => {
      goodsAttributeRows.value.push({ attributeId: '', valueId: '' })
    }

    // 删除属性行
    const removeAttributeRow = (index) => {
      if (goodsAttributeRows.value.length > 1) {
        goodsAttributeRows.value.splice(index, 1)
      }
    }

    // 当某行的规格选择变化时，清空该行的规格值
    const onRowSpecChange = (index) => {
      goodsSpecRows.value[index].valueId = ''
    }

    // 添加新的规格行
    const addSpecRow = () => {
      goodsSpecRows.value.push({ attributeId: '', valueId: '' })
    }

    // 删除规格行
    const removeSpecRow = (index) => {
      if (goodsSpecRows.value.length > 1) {
        goodsSpecRows.value.splice(index, 1)
      }
    }

    // 组合售卖变化处理
    const onIsGroupChange = async () => {
      if (addGoodsData.value.isgroup == 0 || editGoodsData.value.isgroup == 0) {
        try {
          const excludeId = editGoodsData.value.id || null
          const response = await getAvailableGoodsForCombo(excludeId)
          availableGoodsForCombo.value = response.data?.goods || []
        } catch (error) {
          console.error('获取可用商品列表失败:', error)
          alert('获取可用商品列表失败')
        }
      } else {
        selectedIncludedGoods.value = []
      }
    }

    // 打开新增包含商品子弹窗
    const openAddIncludedGoodsModal = () => {
      addIncludedGoodsData.value = {
        goods_id: '',
        goods_name: '',
        brand_name: '',
        classify_name: '',
        attributes: '',
        price: ''
      }
      showAddIncludedGoodsModal.value = true
    }

    // 包含商品选择变化
    const onIncludedGoodsChange = () => {
      const selectedGoods = availableGoodsForCombo.value.find(
        g => g.id === parseInt(addIncludedGoodsData.value.goods_id)
      )

      if (selectedGoods) {
        addIncludedGoodsData.value.goods_name = selectedGoods.name
        addIncludedGoodsData.value.brand_name = selectedGoods.brand_name
        addIncludedGoodsData.value.classify_name = selectedGoods.classify_name
        addIncludedGoodsData.value.attributes = selectedGoods.attributes
        addIncludedGoodsData.value.price = selectedGoods.price
      }
    }

    // 保存包含商品
    const saveIncludedGoods = () => {
      if (!addIncludedGoodsData.value.goods_id) {
        alert('请选择商品')
        return
      }

      const exists = selectedIncludedGoods.value.find(
        g => g.id === parseInt(addIncludedGoodsData.value.goods_id)
      )
      if (exists) {
        alert('该商品已添加，请勿重复添加')
        return
      }

      const selectedGoods = availableGoodsForCombo.value.find(
        g => g.id === parseInt(addIncludedGoodsData.value.goods_id)
      )
      if (selectedGoods) {
        selectedIncludedGoods.value.push({
          id: selectedGoods.id,
          name: selectedGoods.name,
          brand_name: selectedGoods.brand_name,
          classify_name: selectedGoods.classify_name,
          attributes: selectedGoods.attributes,
          price: selectedGoods.price
        })
      }

      closeAddIncludedGoodsModal()
    }

    // 关闭包含商品子弹窗
    const closeAddIncludedGoodsModal = () => {
      showAddIncludedGoodsModal.value = false
      addIncludedGoodsData.value = {
        goods_id: '',
        goods_name: '',
        brand_name: '',
        classify_name: '',
        attributes: '',
        price: ''
      }
    }

    // 删除包含商品
    const removeIncludedGoods = (index) => {
      selectedIncludedGoods.value.splice(index, 1)
    }

    // 保存新增商品
    const saveAddGoods = async () => {
      if (!addGoodsData.value.name || !addGoodsData.value.brandid ||
          !addGoodsData.value.classifyid || !addGoodsData.value.price) {
        alert('请填写所有必填字段')
        return
      }

      if (addGoodsData.value.isgroup == 0 && selectedIncludedGoods.value.length === 0) {
        alert('组合商品必须至少包含一个子商品')
        return
      }

      const attributeValueIds = goodsAttributeRows.value
        .filter(row => row.attributeId && row.valueId)
        .map(row => parseInt(row.valueId))

      const specValueIds = goodsSpecRows.value
        .filter(row => row.attributeId && row.valueId)
        .map(row => parseInt(row.valueId))

      const attributevalue_ids = [...attributeValueIds, ...specValueIds]
      const included_goods_ids = selectedIncludedGoods.value.map(g => g.id)

      try {
        await createGoods({
          name: addGoodsData.value.name,
          brandid: parseInt(addGoodsData.value.brandid),
          classifyid: parseInt(addGoodsData.value.classifyid),
          isgroup: parseInt(addGoodsData.value.isgroup),
          price: parseFloat(addGoodsData.value.price),
          attributevalue_ids: attributevalue_ids,
          included_goods_ids: included_goods_ids
        })

        await fetchGoods()
        closeAddGoodsDrawer()
        alert('商品添加成功')
      } catch (error) {
        console.error('新增商品失败:', error)
        alert(error.response?.data?.error || '新增商品失败')
      }
    }

    // 打开编辑商品抽屉
    const openEditGoodsDrawer = async (goodsId) => {
      try {
        const [brandsRes, classifiesRes, attributesRes, goodsRes] = await Promise.all([
          getActiveBrands(),
          getActiveClassifies(),
          getActiveAttributes(),
          getGoodsItem(goodsId)
        ])

        activeBrands.value = brandsRes.data?.brands || []
        activeClassifies.value = classifiesRes.data?.classifies || []
        activeAttributes.value = attributesRes.data?.attributes || []

        const goods = goodsRes.data?.goods || goodsRes.data
        editGoodsData.value = {
          id: goods.id,
          name: goods.name,
          brandid: goods.brandid,
          classifyid: goods.classifyid,
          isgroup: goods.isgroup,
          price: goods.price,
          attributevalue_ids: goods.attributevalue_ids || []
        }

        // 根据商品的属性值ID重建goodsAttributeRows和goodsSpecRows数组
        goodsAttributeRows.value = []
        goodsSpecRows.value = []
        if (goods.attributevalue_ids && goods.attributevalue_ids.length > 0) {
          for (const valueId of goods.attributevalue_ids) {
            for (const attribute of activeAttributes.value) {
              const value = attribute.values.find(v => v.id === valueId)
              if (value) {
                const row = {
                  attributeId: attribute.id.toString(),
                  valueId: value.id.toString()
                }
                if (attribute.classify === 0) {
                  goodsAttributeRows.value.push(row)
                } else if (attribute.classify === 1) {
                  goodsSpecRows.value.push(row)
                }
                break
              }
            }
          }
        }

        if (goodsAttributeRows.value.length === 0) {
          goodsAttributeRows.value = [{ attributeId: '', valueId: '' }]
        }
        if (goodsSpecRows.value.length === 0) {
          goodsSpecRows.value = [{ attributeId: '', valueId: '' }]
        }

        // 如果是组合商品，加载包含商品数据
        if (goods.isgroup == 0) {
          const [availableRes, includedRes] = await Promise.all([
            getAvailableGoodsForCombo(goodsId),
            getIncludedGoods(goodsId)
          ])
          availableGoodsForCombo.value = availableRes.data?.goods || []
          selectedIncludedGoods.value = includedRes.data?.included_goods || []
        } else {
          selectedIncludedGoods.value = []
        }

        showEditGoodsDrawer.value = true
      } catch (error) {
        console.error('获取商品详情失败:', error)
        alert('获取商品详情失败')
      }
    }

    // 关闭编辑商品抽屉
    const closeEditGoodsDrawer = () => {
      showEditGoodsDrawer.value = false
      editGoodsData.value = {
        id: '',
        name: '',
        brandid: '',
        classifyid: '',
        isgroup: 1,
        price: '',
        attributevalue_ids: []
      }
      selectedIncludedGoods.value = []
      goodsAttributeRows.value = [{ attributeId: '', valueId: '' }]
      goodsSpecRows.value = [{ attributeId: '', valueId: '' }]
    }

    // 保存编辑商品
    const saveEditGoods = async () => {
      if (!editGoodsData.value.name || !editGoodsData.value.brandid ||
          !editGoodsData.value.classifyid || !editGoodsData.value.price) {
        alert('请填写所有必填字段')
        return
      }

      if (editGoodsData.value.isgroup == 0 && selectedIncludedGoods.value.length === 0) {
        alert('组合商品必须至少包含一个子商品')
        return
      }

      const attributeValueIds = goodsAttributeRows.value
        .filter(row => row.attributeId && row.valueId)
        .map(row => parseInt(row.valueId))

      const specValueIds = goodsSpecRows.value
        .filter(row => row.attributeId && row.valueId)
        .map(row => parseInt(row.valueId))

      const attributevalue_ids = [...attributeValueIds, ...specValueIds]
      const included_goods_ids = selectedIncludedGoods.value.map(g => g.id)

      try {
        await updateGoods(editGoodsData.value.id, {
          name: editGoodsData.value.name,
          brandid: parseInt(editGoodsData.value.brandid),
          classifyid: parseInt(editGoodsData.value.classifyid),
          price: parseFloat(editGoodsData.value.price),
          attributevalue_ids: attributevalue_ids,
          included_goods_ids: included_goods_ids
        })

        await fetchGoods()
        closeEditGoodsDrawer()
        alert('商品信息更新成功')
      } catch (error) {
        console.error('更新商品失败:', error)
        alert(error.response?.data?.error || '更新商品失败')
      }
    }

    const enableGoods = async (goodsId) => {
      loading.value = true
      try {
        await updateGoodsStatus(goodsId, 0)
        alert('商品启用成功')
        await fetchGoods()
      } catch (error) {
        console.error('启用商品失败:', error)
        alert('启用商品失败')
      } finally {
        loading.value = false
      }
    }

    const disableGoods = async (goodsId) => {
      loading.value = true
      try {
        await updateGoodsStatus(goodsId, 1)
        alert('商品禁用成功')
        await fetchGoods()
      } catch (error) {
        console.error('禁用商品失败:', error)
        alert('禁用商品失败')
      } finally {
        loading.value = false
      }
    }

    const formatGoodsAttributes = (goods) => {
      if (!goods.attributes) {
        return ''
      }
      if (typeof goods.attributes === 'string') {
        const str = goods.attributes
        return str.length > 50 ? str.substring(0, 50) + '...' : str
      }
      if (!Array.isArray(goods.attributes) || goods.attributes.length === 0) {
        return ''
      }
      const attrs = goods.attributes.slice(0, 2).map(attr => {
        return `${attr.attribute_name}:${attr.value_name}`
      }).join(', ')

      if (goods.attributes.length > 2) {
        return attrs + '...'
      }
      return attrs
    }

    const getFullAttributes = (goods) => {
      if (!goods.attributes) {
        return '无'
      }
      if (typeof goods.attributes === 'string') {
        return goods.attributes || '无'
      }
      if (Array.isArray(goods.attributes) && goods.attributes.length === 0) {
        return '无'
      }
      if (Array.isArray(goods.attributes)) {
        return goods.attributes.map(attr => {
          return `${attr.attribute_name}:${attr.value_name}`
        }).join(', ')
      }
      return '无'
    }

    // 品牌相关方法
    const fetchBrands = async () => {
      try {
        const response = await getBrands()
        brandList.value = response.brands || response.data?.brands || response.data || []
      } catch (error) {
        console.error('获取品牌列表失败:', error)
        brandList.value = []
      }
    }

    // 分类相关方法
    const fetchClassifies = async () => {
      try {
        const response = await getClassifies()
        classifyList.value = response.classifies || response.data?.classifies || response.data || []
      } catch (error) {
        console.error('获取分类列表失败:', error)
        classifyList.value = []
      }
    }

    // 初始化
    onMounted(async () => {
      mounted.value = true
      loading.value = true
      try {
        await Promise.all([
          fetchGoods(),
          fetchBrands(),
          fetchClassifies()
        ])
      } catch (error) {
        console.error('初始化失败:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      goodsList,
      displayGoods,
      goodsFilters,
      goodsCurrentPage,
      goodsTotalPages,
      paginatedGoods,
      brands,
      classifies,
      activeBrands,
      activeClassifies,
      showAddGoodsDrawer,
      showEditGoodsDrawer,
      addGoodsData,
      editGoodsData,
      goodsAttributeRows,
      goodsSpecRows,
      selectedIncludedGoods,
      showAddIncludedGoodsModal,
      addIncludedGoodsData,
      availableGoodsForSelection,
      totalGoodsPrice,
      fetchGoods,
      searchGoods,
      resetGoodsFilters,
      handleGoodsPageChange,
      openAddGoodsDrawer,
      closeAddGoodsDrawer,
      openEditGoodsDrawer,
      closeEditGoodsDrawer,
      saveAddGoods,
      saveEditGoods,
      enableGoods,
      disableGoods,
      formatGoodsAttributes,
      getFullAttributes,
      getAvailableAttributes,
      getAvailableSpecs,
      getAttributeValues,
      onRowAttributeChange,
      onRowSpecChange,
      addAttributeRow,
      removeAttributeRow,
      addSpecRow,
      removeSpecRow,
      onIsGroupChange,
      openAddIncludedGoodsModal,
      closeAddIncludedGoodsModal,
      onIncludedGoodsChange,
      saveIncludedGoods,
      removeIncludedGoods,
      hasPermission
    }
  }
}
</script>

<style scoped>
.goods-attributes-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}

.required {
  color: #ff4d4f;
}

/* 三列布局样式 */
.form-group-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group-col {
  flex: 1;
}

.form-group-col label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group-col select,
.form-group-col input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* 属性选择三列布局样式 */
.attribute-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.attribute-row .attr-select {
  flex: 1;
  min-width: 120px;
}

.attribute-row .value-select {
  flex: 1;
  min-width: 120px;
}

.attribute-row .row-buttons {
  display: flex;
  gap: 5px;
  min-width: 70px;
}

.row-add-btn,
.row-remove-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.row-add-btn {
  background-color: #4CAF50;
  color: white;
}

.row-add-btn:hover {
  background-color: #45a049;
}

.row-remove-btn {
  background-color: #f44336;
  color: white;
}

.row-remove-btn:hover {
  background-color: #da190b;
}

/* 包含商品表格样式 */
.included-goods-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.included-goods-table th,
.included-goods-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.included-goods-table th {
  background-color: #f8f9fa;
  font-weight: 500;
}

.add-included-btn {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-included-btn:hover {
  background-color: #45a049;
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.disabled-select {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>
