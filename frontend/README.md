# OMS-GO 前端项目

基于 Vue 3 + Vite + Pinia + Vue Router 的订单管理系统前端。

## 技术栈

- **框架**: Vue 3
- **构建工具**: Vite 5
- **状态管理**: Pinia 2
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **模块规范**: ES Modules

## 项目结构

```
frontend/
├── public/                    # 静态资源
│   └── styles.css            # 全局样式
├── src/                       # 源代码
│   ├── main.js               # 应用入口
│   ├── App.vue               # 根组件
│   ├── api/                  # API 接口层
│   │   ├── auth.js           # 认证接口
│   │   └── rbac.js           # 权限接口
│   ├── components/           # 公共组件（待开发）
│   │   ├── common/           # 通用组件
│   │   └── layout/           # 布局组件
│   ├── views/                # 页面视图
│   │   ├── Login.vue         # 登录页
│   │   ├── Home.vue          # 主页面（包含布局）
│   │   ├── StudentManagement.vue    # 学生管理
│   │   ├── CoachManagement.vue      # 教练管理（占位）
│   │   ├── OrderManagement.vue      # 订单管理（占位）
│   │   ├── GoodsManagement.vue      # 商品管理（占位）
│   │   ├── AccountManagement.vue    # 账号管理（占位）
│   │   └── RBACManagement.vue       # 权限管理（占位）
│   ├── store/                # 状态管理
│   │   ├── index.js          # Store 入口
│   │   └── modules/
│   │       ├── auth.js       # 认证状态
│   │       └── permission.js # 权限状态
│   ├── utils/                # 工具函数
│   │   ├── request.js        # Axios 封装
│   │   ├── auth.js           # 认证工具
│   │   └── helpers.js        # 辅助函数
│   └── router/               # 路由配置
│       └── index.js          # 路由定义
├── index.html                # HTML 入口
├── package.json              # 项目配置
├── vite.config.js            # Vite 构建配置
└── README.md                 # 项目说明
```

## 安装依赖

```bash
npm install
```

## 开发

启动开发服务器（默认端口 5173）：

```bash
npm run dev
```

开发服务器会自动将 `/api` 请求代理到后端服务器（http://localhost:5001）。

## 构建

构建生产版本：

```bash
npm run build
```

构建产物会输出到 `../frontend-dist` 目录。

## 预览生产构建

```bash
npm run preview
```

## 开发规范

### 文件命名

- **组件文件**: PascalCase（如 `StudentManagement.vue`）
- **JS 文件**: camelCase（如 `request.js`、`auth.js`）

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 复杂逻辑添加注释
- API 函数使用 JSDoc 注释

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
```

## API 接口

所有 API 接口统一通过 `/api` 前缀访问后端服务器。

### 认证接口

- `POST /api/login` - 用户登录
- `POST /api/logout` - 用户登出
- `GET /api/profile` - 获取用户信息
- `GET /api/sync-role` - 同步角色信息

### 权限接口

- `GET /api/enabled-permissions` - 获取启用的权限列表
- `GET /api/menu-tree` - 获取菜单树

更多接口请参考后端 API 文档。

## 状态管理

使用 Pinia 进行状态管理，主要包含：

- **auth**: 认证状态（登录状态、用户名、是否超级管理员）
- **permission**: 权限状态（权限列表、菜单树、当前激活菜单）

## 路由

使用 Vue Router 4 的 Hash 模式：

- `/` - 登录页
- `/home` - 主应用（包含嵌套路由）
  - `/home/students` - 学生管理
  - `/home/coaches` - 教练管理
  - `/home/orders` - 订单管理
  - `/home/goods` - 商品管理
  - `/home/accounts` - 账号管理
  - `/home/rbac` - 权限管理

## 当前进度

### 已完成

✅ 项目基础设施搭建
✅ Vite + Vue 3 配置
✅ Axios 请求封装（含拦截器）
✅ Pinia 状态管理（认证和权限模块）
✅ Vue Router 路由配置
✅ 登录页面
✅ 主页面布局（顶部导航 + 侧边栏菜单）
✅ 学生管理页面（基础版）

### 待开发

- [ ] 公共组件（Modal、Table、Pagination、Loading）
- [ ] 其他业务模块的完整实现
- [ ] API 接口层补全
- [ ] 完整的 CRUD 功能
- [ ] 权限控制细化
- [ ] 样式优化

## 注意事项

1. **后端兼容性**: 所有 API 调用必须与现有后端完全兼容
2. **认证流程**: 使用 JWT Token，存储在 localStorage
3. **权限控制**: 通过 `permissionStore.hasPermission()` 检查权限
4. **路由守卫**: 自动检查登录状态，未登录跳转到登录页

## 与原项目对比

| 特性 | 原项目 | 新项目 |
|------|--------|--------|
| 架构 | 单文件（6038行 HTML + 8210行 JS） | 模块化多文件 |
| 构建工具 | 无（CDN 引入） | Vite |
| 状态管理 | Vue data() | Pinia |
| 路由 | 条件渲染 | Vue Router |
| 协作 | 困难（文件冲突） | 支持并行开发 |

## 许可证

MIT License
