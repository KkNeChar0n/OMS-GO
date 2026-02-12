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
        path: 'accounts',
        name: 'Accounts',
        component: () => import('@/views/AccountManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'rbac',
        name: 'RBAC',
        component: () => import('@/views/RBACManagement.vue'),
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
