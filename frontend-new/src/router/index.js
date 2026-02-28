import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '@/utils/auth'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true },
    redirect: '/home/students',
    children: [
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/StudentManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'coaches',
        name: 'Coaches',
        component: () => import('@/views/CoachManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/OrderManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'goods',
        name: 'Goods',
        component: () => import('@/views/GoodsManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'brands',
        name: 'Brands',
        component: () => import('@/views/BrandManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'classifies',
        name: 'Classifies',
        component: () => import('@/views/ClassifyManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'attributes',
        name: 'Attributes',
        component: () => import('@/views/AttributeManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: () => import('@/views/AccountManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: () => import('@/views/PermissionManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/RoleManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'menu_management',
        name: 'MenuManagement',
        component: () => import('@/views/MenuManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'contract_management',
        name: 'Contracts',
        component: () => import('@/views/ContractManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'activity_management',
        name: 'Activities',
        component: () => import('@/views/ActivityManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'activity_template',
        name: 'ActivityTemplates',
        component: () => import('@/views/ActivityTemplateManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'approval_flow_type',
        name: 'ApprovalFlowType',
        component: () => import('@/views/ApprovalFlowType.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'approval_flow_template',
        name: 'ApprovalFlowTemplate',
        component: () => import('@/views/ApprovalFlowTemplate.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'approval_flow_management',
        name: 'ApprovalFlowManagement',
        component: () => import('@/views/ApprovalFlowManagement.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/')
  } else if (to.path === '/' && isLoggedIn()) {
    next('/home')
  } else {
    next()
  }
})

export default router
