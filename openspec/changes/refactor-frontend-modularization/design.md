# 前端模块化重构技术设计文档

## 上下文

### 背景
CharonOMS 是一个订单管理系统，原项目采用传统的单文件前端架构：
- `index.html`：6038 行，包含所有 HTML 模板和 Vue 组件定义
- `app.js`：8210 行，包含所有业务逻辑、状态管理、API 调用
- `styles.css`：1794 行，全局样式

这种架构在单人开发时可行，但在多人协作场景下会导致频繁的合并冲突和维护困难。

### 约束条件
1. **后端不可变**：所有后端代码（Go + Gin + GORM）保持不变
2. **数据库不可变**：MySQL 数据库表结构和字段定义不变
3. **API 接口不可变**：所有 HTTP 接口的路径、请求格式、响应格式必须保持一致
4. **功能等价性**：重构后的前端必须提供与原版完全一致的功能
5. **UI/UX 一致性**：用户界面和交互体验保持一致

### 利益相关者
- **开发团队**：需要支持多人并行开发，减少代码冲突
- **用户**：期望在重构过程中系统功能和体验不受影响
- **项目负责人**：要求保持后端稳定性，降低重构风险

## 目标 / 非目标

### 目标
1. **模块化架构**：将单文件拆分为按功能域组织的多文件模块
2. **并行开发支持**：不同开发者可以同时开发不同模块而不产生冲突
3. **代码可维护性**：提高代码可读性、可测试性和可扩展性
4. **现代化工具链**：引入构建工具（Vite）和现代化开发工具
5. **完全兼容**：与现有后端 API 100% 兼容

### 非目标
1. **不改变后端**：不修改任何后端 handler、service、repository 代码
2. **不改变数据库**：不修改数据库表结构、字段、索引
3. **不新增功能**：不添加原系统不存在的业务功能
4. **不改变 UI**：不重新设计用户界面（除非是组件化导致的必要调整）
5. **不引入复杂框架**：避免过度工程化，保持简单实用

## 决策

### 决策 1：选择 Vite 作为构建工具

**理由**：
- **快速冷启动**：Vite 使用原生 ES 模块，开发服务器启动极快
- **热模块替换**：HMR 响应速度快，开发体验好
- **简单配置**：开箱即用，配置简洁
- **Vue 官方推荐**：与 Vue 3 集成度高，是 Vue 团队推荐的构建工具
- **生产优化**：使用 Rollup 进行生产构建，性能优秀

**替代方案**：
- **Webpack**：配置复杂，构建速度较慢，适合大型复杂项目
- **Parcel**：零配置，但生态和文档不如 Vite 完善
- **不使用构建工具**：手动模块化管理，但缺乏现代化开发体验和优化

**选择原因**：Vite 在简单性、性能和 Vue 生态集成度上最优。

### 决策 2：选择 Pinia 作为状态管理工具

**理由**：
- **Vue 3 官方推荐**：Pinia 是 Vuex 的继任者，Vue 官方状态管理库
- **TypeScript 支持**：更好的类型推断（虽然本项目使用 JavaScript，但为未来留有余地）
- **模块化设计**：天然支持模块化 Store，无需命名空间
- **DevTools 支持**：完善的开发工具集成
- **轻量简洁**：API 设计简洁，学习成本低

**替代方案**：
- **Vuex 4**：传统方案，但 API 相对繁琐，需要命名空间
- **Composition API + Reactive**：简单场景可用，但缺乏 DevTools 和时间旅行调试
- **不使用状态管理**：依赖组件间通信，但会导致状态分散和逻辑重复

**选择原因**：Pinia 是 Vue 3 的官方推荐，API 简洁，适合项目规模。

### 决策 3：选择 Vue Router 4 作为路由管理工具

**理由**：
- **Vue 官方路由**：与 Vue 3 完美集成
- **嵌套路由支持**：支持复杂的布局和嵌套视图
- **路由守卫**：方便实现权限控制和登录检查
- **懒加载支持**：支持按需加载页面组件，优化性能
- **历史记录管理**：支持 Hash 和 History 模式

**替代方案**：
- **不使用路由**：通过条件渲染切换视图，但缺乏 URL 管理和浏览器历史记录
- **自定义路由**：可控性高，但需要自行实现导航守卫、懒加载等功能

**选择原因**：Vue Router 是标准方案，功能完善，无需重复造轮子。

### 决策 4：保留 Axios 作为 HTTP 客户端

**理由**：
- **原项目一致性**：原前端使用 Axios，迁移时无需修改 API 调用逻辑
- **拦截器支持**：可以统一处理 JWT Token 和 401 错误
- **广泛使用**：生态成熟，文档完善
- **浏览器兼容性**：兼容性好，支持请求取消、超时等高级功能

**替代方案**：
- **Fetch API**：原生 API，但缺乏拦截器和请求取消功能
- **其他库（ky, got）**：功能类似，但 Axios 生态更成熟

**选择原因**：保持与原项目一致，减少迁移成本。

### 决策 5：目录结构采用分层架构

**目录结构**：
```
src/
├── api/          # API 接口层（按业务模块拆分）
├── components/   # 组件层（公共组件和布局组件）
├── views/        # 页面视图层（对应路由页面）
├── store/        # 状态管理层（Pinia Stores）
├── utils/        # 工具层（通用工具函数）
└── router/       # 路由配置层
```

**理由**：
- **职责分离**：每层有明确的职责，代码组织清晰
- **易于查找**：开发者可以快速定位代码位置
- **便于协作**：不同开发者负责不同层或模块，减少冲突
- **可扩展性**：新增功能时可按相同模式添加文件

**替代方案**：
- **按功能模块划分**（feature-based）：每个业务模块包含自己的 API、组件、Store
  - 优点：功能内聚性高
  - 缺点：公共组件和工具难以共享，本项目业务模块较多时会导致重复
- **扁平化结构**：所有文件放在少数几个目录
  - 缺点：文件过多时难以管理

**选择原因**：分层架构在清晰度和灵活性之间取得平衡，适合本项目规模（7-8 个业务模块）。

### 决策 6：API 接口层按业务模块拆分

**拆分方式**：
- `api/auth.js`：认证相关接口（登录、登出、同步角色）
- `api/student.js`：学生管理接口
- `api/coach.js`：教练管理接口
- `api/order.js`：订单管理接口
- `api/goods.js`：商品管理接口（包括品牌、分类、属性）
- `api/account.js`：账号管理接口
- `api/rbac.js`：RBAC 权限管理接口（角色、权限、菜单）

**理由**：
- **对应后端结构**：与后端 handler 目录结构一致，便于对照
- **并行开发**：不同开发者可以同时开发不同模块的接口调用
- **代码隔离**：修改一个模块的接口不影响其他模块
- **便于测试**：可以针对每个模块独立编写测试

### 决策 7：组件拆分策略

**拆分原则**：
1. **通用组件**（`components/common/`）：可复用的 UI 组件
   - Modal.vue：模态框
   - Table.vue：表格
   - Pagination.vue：分页
   - Loading.vue：加载动画

2. **布局组件**（`components/layout/`）：页面结构组件
   - Header.vue：顶部导航（用户名、登出按钮）
   - Sidebar.vue：侧边栏菜单（动态菜单树）
   - MainContent.vue：主内容区容器

3. **页面组件**（`views/`）：完整的业务页面
   - Login.vue：登录页
   - StudentManagement.vue：学生管理页
   - 其他业务页面...

**理由**：
- **复用性**：通用组件可在多个页面中复用，减少代码重复
- **关注点分离**：布局组件负责页面结构，业务组件负责业务逻辑
- **易于维护**：组件职责单一，修改时影响范围小

**注意事项**：
- 原项目中很多功能是通过 `v-if` 在单一 HTML 中切换的，需要将这些拆分为独立组件
- 原项目中的弹窗（Modal）逻辑需要提取为可复用的 Modal 组件

### 决策 8：样式处理策略

**策略**：
1. **全局样式**：保留原 `styles.css`，放在 `public/styles.css`
2. **组件样式**：使用 Vue 的 Scoped CSS，避免样式冲突
3. **CSS 变量**：提取公共颜色、间距等为 CSS 变量，便于维护

**理由**：
- **向后兼容**：保留全局样式，确保样式与原版一致
- **样式隔离**：Scoped CSS 避免组件间样式冲突
- **可维护性**：CSS 变量便于统一调整主题色、间距等

**替代方案**：
- **CSS-in-JS**：增加复杂度，本项目无需
- **CSS 预处理器（Sass/Less）**：原项目未使用，引入会增加学习成本

### 决策 9：开发和生产环境配置

**开发环境**：
- Vite Dev Server 运行在 `localhost:5173`（默认端口）
- 配置 Proxy，代理 `/api` 请求到 `localhost:5001`（后端服务器）
- 热模块替换（HMR）自动刷新

**生产环境**：
- Vite 构建输出到 `dist/` 目录
- 后端 Gin 服务器提供静态文件服务（`dist/` 目录）
- 后端继续处理 `/api/*` 请求

**vite.config.js 示例**：
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../frontend-dist'  // 输出到项目根目录
  }
}
```

**后端静态文件配置**（Go Gin）：
```go
// 提供前端静态文件
router.Static("/", "./frontend-dist")
```

### 决策 10：迁移策略（渐进式迁移）

**迁移步骤**：
1. **Phase 1：基础设施**
   - 搭建 Vite 项目脚手架
   - 配置 Axios、Router、Store
   - 创建目录结构

2. **Phase 2：认证模块**
   - 迁移登录页
   - 迁移认证逻辑
   - 验证 JWT Token 流程

3. **Phase 3：布局和菜单**
   - 迁移 Header、Sidebar 组件
   - 实现动态菜单树
   - 实现路由切换

4. **Phase 4：业务模块（按优先级）**
   - 学生管理 → 教练管理 → 订单管理 → 商品管理 → 账号管理 → 权限管理
   - 每个模块包括：API 接口、页面组件、CRUD 功能

5. **Phase 5：测试和优化**
   - 功能测试
   - 性能优化
   - 部署上线

**理由**：
- **降低风险**：逐步迁移，每个阶段都可以验证功能
- **并行开发**：Phase 4 中不同开发者可以同时开发不同业务模块
- **易于回滚**：每个阶段完成后可以独立验证，出现问题易于定位

## 风险 / 权衡

### 风险 1：API 接口不匹配

**风险描述**：
前端重构后，API 调用的请求格式、参数名、响应处理可能与后端不匹配。

**缓解措施**：
1. **对照原代码**：在实现每个 API 接口时，对照原 `app.js` 中的 `fetch` 调用
2. **文档对照**：参考后端 handler 代码和 README 中的 API 文档
3. **充分测试**：每个接口实现后立即测试，确保请求和响应正确
4. **保留原前端**：在完全验证通过前，保留原前端代码作为参考和回滚方案

### 风险 2：状态管理迁移问题

**风险描述**：
原项目使用 Vue 2 的 `data()` 和 `methods` 管理状态，迁移到 Pinia 时可能遗漏状态或逻辑。

**缓解措施**：
1. **逐项对照**：将原 `app.js` 中的 `data()` 逐个字段迁移到对应的 Store
2. **清单检查**：创建状态迁移清单，确保每个状态都有对应的 Store
3. **功能测试**：每个功能迁移后进行手动测试，验证状态变化正确

### 风险 3：权限控制逻辑迁移

**风险描述**：
原项目使用 `hasPermission()` 方法控制按钮和菜单显示，迁移时可能遗漏权限检查。

**缓解措施**：
1. **统一权限工具**：在 `utils/auth.js` 中实现 `hasPermission()` 函数
2. **全局混入或 Composable**：提供全局可用的权限检查方法
3. **权限测试**：针对不同角色进行权限测试，验证按钮和菜单的显示/隐藏

### 风险 4：样式一致性

**风险描述**：
组件化后，样式可能与原版不一致，导致 UI 显示异常。

**缓解措施**：
1. **保留全局样式**：不修改原 `styles.css`，在组件中复用全局样式类
2. **Scoped CSS 谨慎使用**：仅在必要时使用 Scoped CSS，避免覆盖全局样式
3. **UI 对比测试**：在开发环境中对比新旧版本的 UI，确保一致性

### 风险 5：构建和部署问题

**风险描述**：
Vite 构建输出可能与后端静态文件服务配置不匹配，导致部署后无法访问。

**缓解措施**：
1. **测试生产构建**：在开发阶段定期执行 `npm run build` 并测试构建产物
2. **配置验证**：确保 Vite 输出目录与后端静态文件配置一致
3. **部署文档**：编写详细的构建和部署文档，包括环境变量配置

## 迁移计划

### 阶段 1：基础设施搭建（2-3 天）
- 初始化 Vite 项目
- 配置 package.json、vite.config.js
- 创建目录结构
- 配置 Axios 拦截器
- 创建基础 Store 和 Router

### 阶段 2：认证和布局（2-3 天）
- 迁移登录页
- 迁移 Header、Sidebar 组件
- 实现登录/登出逻辑
- 实现动态菜单树
- 验证 JWT 流程

### 阶段 3：业务模块迁移（10-15 天）
每个模块约 1.5-2.5 天：
- 学生管理（2 天）
- 教练管理（2 天）
- 订单管理（3 天）
- 商品管理（3 天）
- 账号管理（2 天）
- 权限管理（3 天）

### 阶段 4：测试和优化（3-5 天）
- 功能测试（2 天）
- 兼容性测试（1 天）
- 性能优化（1 天）
- 文档编写（1 天）

### 总计：约 17-26 天

### 回滚方案
1. **保留原代码**：在 `frontend-legacy/` 目录备份原前端代码
2. **Git 分支管理**：在独立分支开发，主分支保持稳定
3. **快速切换**：如果出现问题，可以快速切换回原前端

## 待决问题

### 问题 1：是否需要 TypeScript？
**现状**：原项目使用 JavaScript，重构是否引入 TypeScript？

**分析**：
- **优点**：类型安全，减少运行时错误，IDE 支持更好
- **缺点**：增加学习成本，配置复杂度提高，迁移工作量增加

**建议**：暂不引入，保持与原项目一致。未来可逐步迁移。

### 问题 2：是否需要单元测试？
**现状**：原项目没有前端测试，是否在重构时引入？

**分析**：
- **优点**：提高代码质量，便于重构和维护
- **缺点**：增加开发时间

**建议**：优先完成功能迁移，后续逐步添加关键模块的测试。

### 问题 3：是否需要 CSS 预处理器（Sass/Less）？
**现状**：原项目使用原生 CSS。

**分析**：
- **优点**：支持嵌套、变量、混入，提高样式可维护性
- **缺点**：增加构建复杂度，学习成本

**建议**：暂不引入，使用 CSS 变量满足需求。

### 问题 4：路由模式选择（Hash vs History）？
**现状**：原项目无路由。

**分析**：
- **Hash 模式**：兼容性好，无需后端配置，URL 中有 `#`
- **History 模式**：URL 美观，但需要后端配置 fallback

**建议**：使用 Hash 模式，避免修改后端路由配置。

## 附录：关键代码示例

### Axios 封装（utils/request.js）

```javascript
import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 请求拦截器：添加 Token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器：处理 401
request.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default request;
```

### Pinia Store 示例（store/modules/auth.js）

```javascript
import { defineStore } from 'pinia';
import { login, logout, syncRole } from '@/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    username: '',
    isSuperAdmin: false,
    syncingRole: false
  }),

  actions: {
    async login(username, password) {
      const response = await login(username, password);
      if (response.code === 0) {
        this.isLoggedIn = true;
        this.username = response.data.username;
        this.isSuperAdmin = response.data.is_super_admin;
        localStorage.setItem('token', response.data.token);
      }
      return response;
    },

    async logout() {
      await logout();
      this.isLoggedIn = false;
      this.username = '';
      this.isSuperAdmin = false;
      localStorage.removeItem('token');
    },

    async syncRole() {
      this.syncingRole = true;
      try {
        const response = await syncRole();
        if (response.data.role_changed) {
          this.isSuperAdmin = response.data.is_super_admin;
        }
      } finally {
        this.syncingRole = false;
      }
    }
  }
});
```

### Router 配置示例（router/index.js）

```javascript
import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/StudentManagement.vue')
      },
      // 其他子路由...
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/');
  } else {
    next();
  }
});

export default router;
```

## 总结

本设计文档基于以下核心原则：
1. **保守重构**：不改变后端和数据库，仅重构前端代码组织
2. **功能等价**：重构后的系统功能与原版完全一致
3. **简单实用**：避免过度工程化，选择成熟稳定的技术栈
4. **并行开发**：支持多人协作，减少代码冲突
5. **可回滚**：渐进式迁移，每个阶段都可验证和回滚

通过本设计方案，可以在保持系统稳定性的前提下，实现前端代码的模块化，为后续的功能扩展和团队协作打下良好基础。
