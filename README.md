# OMS-GO - 订单管理系统

OMS-GO 是一个全栈订单管理系统，采用 Go + Vue 3 前后端分离架构，基于 DDD（领域驱动设计）分层设计，涵盖学生、教练、商品、订单、财务、审批流、权限管理等核心业务模块。

## 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Go | 1.24 | 编程语言 |
| Gin | 1.9 | Web 框架 |
| GORM | 1.30 | ORM |
| MySQL | 5.7+ | 数据库 |
| JWT | 5.2 | 身份认证 |
| Zap | 1.26 | 结构化日志 |
| Viper | 1.18 | 配置管理 |
| Excelize | 2.10 | Excel 导入导出 |

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4 | 前端框架 |
| Vite | 5.0 | 构建工具 |
| Vue Router | 4.2 | 路由管理 |
| Pinia | 2.1 | 状态管理 |
| Axios | 1.6 | HTTP 客户端 |

## 项目结构

```
OMS-GO/
├── cmd/server/                 # 应用入口
│   └── main.go
├── internal/                   # 内部模块
│   ├── domain/                 # 领域层（实体、仓储接口、领域服务）
│   │   ├── account/            # 账户
│   │   ├── activity/           # 活动
│   │   ├── activity_template/  # 活动模板
│   │   ├── approval/           # 审批流
│   │   ├── attribute/          # 商品属性
│   │   ├── auth/               # 认证
│   │   ├── basic/              # 基础数据（性别、年级、科目）
│   │   ├── brand/              # 品牌
│   │   ├── classify/           # 分类
│   │   ├── coach/              # 教练
│   │   ├── contract/           # 合同
│   │   ├── financial/          # 财务（支付、退款、分账）
│   │   ├── goods/              # 商品
│   │   ├── order/              # 订单
│   │   ├── rbac/               # 权限管理
│   │   └── student/            # 学生
│   ├── application/            # 应用服务层（业务编排）
│   ├── infrastructure/         # 基础设施层
│   │   ├── config/             # 配置加载
│   │   ├── logger/             # 日志初始化
│   │   └── persistence/        # 数据持久化（MySQL 仓储实现）
│   └── interfaces/http/        # 接口层
│       ├── router/             # 路由 & 依赖注入
│       ├── handler/            # HTTP Handler
│       ├── middleware/         # 中间件（JWT、CORS、权限、日志）
│       ├── financial/          # 财务 Handler
│       └── dto/                # 数据传输对象
├── pkg/                        # 公共包
│   ├── jwt/                    # JWT 工具
│   ├── errors/                 # 错误处理
│   └── response/               # 统一响应格式
├── frontend/               # 前端源代码（Vue 3）
│   └── src/
│       ├── api/                # API 接口层（13 个模块）
│       ├── views/              # 页面视图（58 个）
│       ├── components/         # 公共组件
│       ├── store/              # Pinia 状态管理
│       ├── router/             # 路由配置
│       └── utils/              # 工具函数
├── frontend-dist/              # 前端构建产物
├── scripts/
│   └── init.sql                # 数据库初始化脚本
├── config/
│   └── config.yaml             # 应用配置
├── go.mod
└── go.sum
```

## 业务模块

| 模块 | 说明 |
|------|------|
| 学生管理 | 学生信息 CRUD、状态管理、教练关联 |
| 教练管理 | 教练信息 CRUD、科目关联 |
| 商品管理 | 商品、品牌、分类、属性管理，支持组合商品 |
| 订单管理 | 订单创建、折扣计算、子订单、状态流转 |
| 财务管理 | 支付收集、退款、分账、淘宝支付、未领取支付 |
| 合同管理 | 合同创建、撤销、终止 |
| 审批流 | 审批类型、模板、流程实例、审批操作 |
| 活动管理 | 教学活动与模板管理 |
| 账户管理 | 用户账户 CRUD |
| 权限管理 | RBAC 模型：角色、权限、菜单管理与分配 |
| 基础数据 | 性别、年级、科目等字典数据 |

## 快速开始

### 环境要求

- Go 1.21+
- MySQL 5.7+
- Node.js 18+（前端开发）

### 1. 初始化数据库

执行初始化脚本，自动创建数据库、表结构和预置数据（菜单、权限、管理员账户）：

```bash
mysql -u root < scripts/init.sql
```

然后根据实际情况修改 `config/config.yaml` 中的数据库连接信息：

```yaml
database:
  host: "localhost"
  port: 3306
  user: "root"
  password: "你的数据库密码"
  database: "omsgo"
```

预置的管理员账户：用户名 `admin`，密码 `admin123`。

### 2. 启动后端

```bash
go run cmd/server/main.go
```

服务默认运行在 `http://localhost:5001`。

### 3. 启动前端（开发模式）

```bash
cd frontend
npm install
npm run dev
```

开发服务器运行在 `http://localhost:5173`，API 请求自动代理到后端。

### 4. 构建前端（生产部署）

```bash
cd frontend
npm run build
```

构建产物输出到 `frontend-dist/`，由后端静态文件服务提供。

## 架构设计

```
┌──────────────────────────────────────────┐
│           Frontend (Vue 3 + Vite)        │
│  Views → Components → Store → API Layer  │
└────────────────────┬─────────────────────┘
                     │ HTTP + JWT
                     ▼
┌──────────────────────────────────────────┐
│           Backend (Go + Gin)             │
│                                          │
│  Interface Layer (Handler + Middleware)   │
│          ↓                               │
│  Application Layer (Service)             │
│          ↓                               │
│  Domain Layer (Entity + Domain Service)  │
│          ↓                               │
│  Infrastructure Layer (MySQL + Logger)   │
└────────────────────┬─────────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │    MySQL     │
              └─────────────┘
```

## 菜单结构

```
学生管理
  └── 学生管理
教练管理
  └── 教练管理
订单管理
  ├── 订单管理
  ├── 子订单管理
  ├── 退费订单
  └── 退费子订单
合同管理
  └── 合同管理
商品管理
  ├── 商品管理
  ├── 品牌管理
  ├── 分类管理
  └── 属性管理
活动管理
  ├── 活动管理
  └── 活动模版
财务管理
  ├── 收款管理
  ├── 分账明细
  ├── 退费管理
  └── 退费明细
审批流管理
  ├── 审批类型
  ├── 审批模版
  └── 审批流管理
系统设置
  ├── 账户管理
  ├── 角色管理
  ├── 权限管理
  └── 菜单管理
```

## 认证与权限

- **认证方式**：JWT Token（HS256），有效期 24 小时
- **权限模型**：RBAC（基于角色的访问控制）
- **权限粒度**：`{action}_{resource}` 格式，如 `view_student`、`add_order`
- **中间件链**：Recovery → Logger → CORS → JWT Auth → Permission Check

## API 概览

所有 API 以 `/api` 为前缀，除登录接口外均需 JWT 认证。

| 分组 | 路径前缀 | 说明 |
|------|----------|------|
| 认证 | `/api/login`, `/api/logout` | 登录登出 |
| 学生 | `/api/students` | 学生 CRUD |
| 教练 | `/api/coaches` | 教练 CRUD |
| 订单 | `/api/orders` | 订单管理 |
| 商品 | `/api/goods` | 商品管理 |
| 品牌 | `/api/brands` | 品牌管理 |
| 分类 | `/api/classifies` | 分类管理 |
| 属性 | `/api/attributes` | 属性管理 |
| 账户 | `/api/accounts` | 账户管理 |
| 权限 | `/api/roles`, `/api/permissions`, `/api/menu` | RBAC 管理 |
| 审批 | `/api/approval-flow-*` | 审批流管理 |
| 财务 | `/api/payment-collections`, `/api/refund-orders` 等 | 财务管理 |
| 活动 | `/api/activities`, `/api/activity-templates` | 活动管理 |
| 合同 | `/api/contracts` | 合同管理 |
| 基础 | `/api/sexes`, `/api/grades`, `/api/subjects` | 字典数据 |

## 配置说明

配置文件位于 `config/config.yaml`，包含以下配置项：

| 配置项 | 说明 |
|--------|------|
| `server.port` | 服务端口，默认 5001 |
| `server.mode` | 运行模式：debug / release / test |
| `database.*` | 数据库连接与连接池配置 |
| `jwt.*` | JWT 密钥、过期时间、签发者 |
| `logger.*` | 日志级别、输出方式、文件轮转 |
| `cors.*` | 跨域允许的源、方法、头部 |

## License

Private
