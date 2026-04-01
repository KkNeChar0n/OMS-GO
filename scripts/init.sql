-- ============================================================
-- CharonOMS 数据库初始化脚本
-- 使用方法: mysql -u root < scripts/init.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS omsgo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE omsgo;

-- ============================================================
-- 基础数据表
-- ============================================================

CREATE TABLE IF NOT EXISTS sex (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS grade (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subject (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(50) NOT NULL,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- RBAC 权限表
-- ============================================================

CREATE TABLE IF NOT EXISTS menu (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    route VARCHAR(100),
    parent_id INT UNSIGNED,
    sort_order INT DEFAULT 0,
    status INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    comment VARCHAR(255),
    is_super_admin TINYINT DEFAULT 0,
    status TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    action_id VARCHAR(100) UNIQUE,
    menu_id INT UNSIGNED DEFAULT 0,
    status TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL,
    permissions_id INT UNSIGNED NOT NULL,
    INDEX idx_role_permission (role_id, permissions_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 用户账户表
-- ============================================================

CREATE TABLE IF NOT EXISTS useraccount (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(20) UNIQUE,
    role_id INT UNSIGNED NOT NULL,
    status TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 业务表
-- ============================================================

CREATE TABLE IF NOT EXISTS student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sex_id INT NOT NULL,
    grade_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coach (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sex_id INT NOT NULL,
    subject_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_coach (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    coach_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS brand (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS classify (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    parentid INT,
    status INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attribute (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    classify INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attribute_value (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    attributeid INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS goods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brandid INT NOT NULL,
    classifyid INT NOT NULL,
    isgroup INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS goods_attributevalue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goodsid INT NOT NULL,
    attributevalueid INT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS goods_goods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goodsid INT NOT NULL,
    parentsid INT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    expected_payment_time DATETIME,
    amount_receivable DECIMAL(10,2) DEFAULT 0,
    amount_received DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    status INT DEFAULT 10,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS childorders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parentsid INT NOT NULL,
    goodsid INT NOT NULL,
    amount_receivable DECIMAL(10,2) DEFAULT 0,
    amount_received DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contract (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    student_id INT NOT NULL,
    type INT NOT NULL,
    signature_form INT NOT NULL,
    contract_amount DECIMAL(10,2) NOT NULL,
    signatory VARCHAR(100),
    initiating_party VARCHAR(100),
    initiator VARCHAR(50),
    status INT DEFAULT 0,
    payment_status INT DEFAULT 0,
    termination_agreement VARCHAR(255),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 财务表
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_collection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    student_id INT NOT NULL,
    payment_scenario INT NOT NULL,
    payment_method INT NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payer VARCHAR(100),
    payee_entity INT NOT NULL,
    trading_hours DATETIME,
    arrival_time DATETIME,
    merchant_order VARCHAR(100),
    status INT DEFAULT 10,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS taobao_payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    student_id INT,
    payer VARCHAR(100),
    zhifubao_account VARCHAR(100),
    payment_amount DECIMAL(10,2),
    order_time DATETIME,
    arrival_time DATETIME,
    merchant_order VARCHAR(100),
    status INT DEFAULT 0,
    claimer INT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS unclaimed (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_method TINYINT COMMENT '付款方式：0-微信、1-支付宝、2-优利支付、3-零零购支付、9-对公转账',
    payment_amount DECIMAL(10,2) COMMENT '付款金额',
    payer VARCHAR(100) COMMENT '付款方',
    payee_entity TINYINT COMMENT '收款主体：0-北京、1-西安',
    merchant_order VARCHAR(100) COMMENT '商户订单号',
    arrival_time DATETIME COMMENT '到账时间',
    claimer INT COMMENT '认领人ID',
    payment_id INT COMMENT '关联的payment_collection记录ID',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待认领、1-已认领',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS separate_account (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    orders_id INT NOT NULL,
    childorders_id INT NOT NULL,
    payment_id INT NOT NULL,
    payment_type INT NOT NULL,
    goods_id INT NOT NULL,
    goods_name VARCHAR(100) NOT NULL,
    separate_amount DECIMAL(10,2) NOT NULL,
    type INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refund_order (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT '关联的主订单ID',
    student_id INT NOT NULL COMMENT '学生ID',
    refund_amount DECIMAL(10,2) NOT NULL COMMENT '总退费金额',
    submitter VARCHAR(100) COMMENT '提交人用户名',
    submit_time DATETIME COMMENT '提交时间',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审批、10-已通过、20-已驳回',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refund_order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refund_order_id INT NOT NULL COMMENT '所属退费订单ID',
    childorder_id INT NOT NULL COMMENT '子订单ID',
    goods_id INT NOT NULL COMMENT '商品ID',
    goods_name VARCHAR(100) COMMENT '商品名称',
    refund_amount DECIMAL(10,2) NOT NULL COMMENT '退费金额',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审批、10-已通过、20-已驳回',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refund_payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refund_order_id INT NOT NULL COMMENT '所属退费订单ID',
    payment_id INT NOT NULL COMMENT '收款记录ID',
    payment_type TINYINT NOT NULL COMMENT '收款类型：0-常规收款、1-淘宝收款',
    refund_amount DECIMAL(10,2) NOT NULL COMMENT '从该收款退费的金额',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refund_taobao_supplement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refund_order_id INT NOT NULL COMMENT '所属退费订单ID',
    student_id INT NOT NULL COMMENT '学生ID',
    alipay_account VARCHAR(100) COMMENT '支付宝账号',
    alipay_name VARCHAR(100) COMMENT '支付宝账户名',
    refund_amount DECIMAL(10,2) NOT NULL COMMENT '淘宝退费金额',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审批、10-已通过、20-已驳回',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refund_regular_supplement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refund_order_id INT NOT NULL COMMENT '所属退费订单ID',
    student_id INT NOT NULL COMMENT '学生ID',
    payee_entity TINYINT COMMENT '收款实体',
    is_corporate_transfer TINYINT COMMENT '是否企业转账',
    payer VARCHAR(100) COMMENT '付款人名称',
    bank_account VARCHAR(100) COMMENT '银行账户',
    payer_readonly TINYINT COMMENT '付款人是否只读',
    refund_amount DECIMAL(10,2) NOT NULL COMMENT '常规退费金额',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审批、10-已通过、20-已驳回',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 活动表
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type INT NOT NULL,
    select_type INT NOT NULL,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_template_goods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    goods_id INT,
    classify_id INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    template_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    threshold_amount DECIMAL(10,2) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 审批流表
-- ============================================================

CREATE TABLE IF NOT EXISTS approval_flow_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS approval_flow_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    approval_flow_type_id INT NOT NULL,
    creator VARCHAR(100),
    status TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS approval_flow_template_node (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort INT NOT NULL,
    type TINYINT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS approval_node_useraccount (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_id INT NOT NULL,
    useraccount_id INT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS approval_copy_useraccount (
    id INT AUTO_INCREMENT PRIMARY KEY,
    approval_flow_template_id INT NOT NULL,
    useraccount_id INT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS approval_flow_management (
    id INT AUTO_INCREMENT PRIMARY KEY,
    approval_flow_template_id INT NOT NULL,
    approval_flow_type_id INT NOT NULL,
    step INT NOT NULL DEFAULT 0,
    create_user INT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TINYINT NOT NULL DEFAULT 0,
    complete_time DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS approval_node_case (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_id INT NOT NULL,
    approval_flow_management_id INT NOT NULL,
    type TINYINT NOT NULL,
    sort INT NOT NULL,
    result TINYINT,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    complete_time DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS approval_node_case_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    approval_node_case_id INT NOT NULL,
    useraccount_id INT NOT NULL,
    result TINYINT,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    handle_time DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS approval_copy_useraccount_case (
    id INT AUTO_INCREMENT PRIMARY KEY,
    approval_flow_management_id INT NOT NULL,
    useraccount_id INT NOT NULL,
    copy_info VARCHAR(500) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 预置数据：基础字典
-- ============================================================

INSERT INTO sex (name) VALUES ('男'), ('女');

INSERT INTO grade (name, status) VALUES
('一年级', 0), ('二年级', 0), ('三年级', 0), ('四年级', 0), ('五年级', 0), ('六年级', 0),
('初一', 0), ('初二', 0), ('初三', 0),
('高一', 0), ('高二', 0), ('高三', 0);

INSERT INTO subject (subject, status) VALUES
('语文', 0), ('数学', 0), ('英语', 0), ('物理', 0), ('化学', 0), ('生物', 0);

-- ============================================================
-- 预置数据：菜单
-- ============================================================

-- 一级菜单
INSERT INTO menu (id, name, route, parent_id, sort_order, status) VALUES
(1, '学生管理', '', NULL, 1, 0),
(2, '教练管理', '', NULL, 2, 0),
(3, '订单管理', '', NULL, 3, 0),
(4, '合同管理', '', NULL, 4, 0),
(5, '商品管理', '', NULL, 5, 0),
(6, '活动管理', '', NULL, 6, 0),
(7, '财务管理', '', NULL, 7, 0),
(8, '审批流管理', '', NULL, 8, 0),
(9, '系统设置', '', NULL, 9, 0);

-- 二级菜单
INSERT INTO menu (id, name, route, parent_id, sort_order, status) VALUES
(10, '学生管理', '/students', 1, 1, 0),
(11, '教练管理', '/coaches', 2, 1, 0),
(20, '订单管理', '/orders', 3, 1, 0),
(21, '子订单管理', '/childorders', 3, 2, 0),
(22, '退费订单', '/refund_orders', 3, 3, 0),
(23, '退费子订单', '/refund_childorders', 3, 4, 0),
(30, '合同管理', '/contract_management', 4, 1, 0),
(40, '商品管理', '/goods', 5, 1, 0),
(41, '品牌管理', '/brands', 5, 2, 0),
(42, '分类管理', '/classifies', 5, 3, 0),
(43, '属性管理', '/attributes', 5, 4, 0),
(50, '活动管理', '/activity_management', 6, 1, 0),
(51, '活动模版', '/activity_template', 6, 2, 0),
(60, '收款管理', '/payment_collection', 7, 1, 0),
(61, '分账明细', '/separate_account', 7, 2, 0),
(62, '退费管理', '/refund_management', 7, 3, 0),
(63, '退费明细', '/refund_payment_detail', 7, 4, 0),
(70, '审批类型', '/approval_flow_type', 8, 1, 0),
(71, '审批模版', '/approval_flow_template', 8, 2, 0),
(72, '审批流管理', '/approval_flow_management', 8, 3, 0),
(80, '账户管理', '/accounts', 9, 1, 0),
(81, '角色管理', '/roles', 9, 2, 0),
(82, '权限管理', '/permissions', 9, 3, 0),
(83, '菜单管理', '/menu_management', 9, 4, 0);

-- ============================================================
-- 预置数据：权限
-- ============================================================

INSERT INTO permissions (name, action_id, menu_id, status) VALUES
-- 学生管理
('查看学生', 'view_student', 10, 0),
('新增学生', 'add_student', 10, 0),
('编辑学生', 'edit_student', 10, 0),
('删除学生', 'delete_student', 10, 0),
-- 教练管理
('查看教练', 'view_coach', 11, 0),
('新增教练', 'add_coach', 11, 0),
('编辑教练', 'edit_coach', 11, 0),
('删除教练', 'delete_coach', 11, 0),
-- 订单管理
('查看订单', 'view_order', 20, 0),
('新增订单', 'add_order', 20, 0),
('编辑订单', 'edit_order', 20, 0),
('删除订单', 'delete_order', 20, 0),
('查看子订单', 'view_childorder', 21, 0),
('查看退费订单', 'view_refund_order', 22, 0),
('新增退费订单', 'add_refund_order', 22, 0),
('查看退费子订单', 'view_refund_childorder', 23, 0),
-- 合同管理
('查看合同', 'view_contract', 30, 0),
('新增合同', 'add_contract', 30, 0),
('编辑合同', 'edit_contract', 30, 0),
('删除合同', 'delete_contract', 30, 0),
-- 商品管理
('查看商品', 'view_goods', 40, 0),
('新增商品', 'add_goods', 40, 0),
('编辑商品', 'edit_goods', 40, 0),
('删除商品', 'delete_goods', 40, 0),
('查看品牌', 'view_brand', 41, 0),
('新增品牌', 'add_brand', 41, 0),
('编辑品牌', 'edit_brand', 41, 0),
('删除品牌', 'delete_brand', 41, 0),
('查看分类', 'view_classify', 42, 0),
('新增分类', 'add_classify', 42, 0),
('编辑分类', 'edit_classify', 42, 0),
('删除分类', 'delete_classify', 42, 0),
('查看属性', 'view_attribute', 43, 0),
('新增属性', 'add_attribute', 43, 0),
('编辑属性', 'edit_attribute', 43, 0),
('删除属性', 'delete_attribute', 43, 0),
-- 活动管理
('查看活动', 'view_activity', 50, 0),
('新增活动', 'add_activity', 50, 0),
('编辑活动', 'edit_activity', 50, 0),
('删除活动', 'delete_activity', 50, 0),
('查看活动模版', 'view_activity_template', 51, 0),
('新增活动模版', 'add_activity_template', 51, 0),
('编辑活动模版', 'edit_activity_template', 51, 0),
('删除活动模版', 'delete_activity_template', 51, 0),
-- 财务管理
('查看收款', 'view_payment_collection', 60, 0),
('新增收款', 'add_payment_collection', 60, 0),
('编辑收款', 'edit_payment_collection', 60, 0),
('删除收款', 'delete_payment_collection', 60, 0),
('查看分账', 'view_separate_account', 61, 0),
('编辑分账', 'edit_separate_account', 61, 0),
('查看退费', 'view_refund', 62, 0),
('新增退费', 'add_refund', 62, 0),
('查看退费明细', 'view_refund_payment_detail', 63, 0),
-- 审批流管理
('查看审批类型', 'view_approval_flow_type', 70, 0),
('新增审批类型', 'add_approval_flow_type', 70, 0),
('编辑审批类型', 'edit_approval_flow_type', 70, 0),
('查看审批模版', 'view_approval_flow_template', 71, 0),
('新增审批模版', 'add_approval_flow_template', 71, 0),
('编辑审批模版', 'edit_approval_flow_template', 71, 0),
('查看审批流', 'view_approval_flow_management', 72, 0),
('新增审批流', 'add_approval_flow_management', 72, 0),
('编辑审批流', 'edit_approval_flow_management', 72, 0),
-- 系统设置
('查看账户', 'view_account', 80, 0),
('新增账户', 'add_account', 80, 0),
('编辑账户', 'edit_account', 80, 0),
('删除账户', 'delete_account', 80, 0),
('查看角色', 'view_role', 81, 0),
('新增角色', 'add_role', 81, 0),
('编辑角色', 'edit_role', 81, 0),
('删除角色', 'delete_role', 81, 0),
('查看权限', 'view_permission', 82, 0),
('编辑权限', 'edit_permission', 82, 0),
('查看菜单', 'view_menu', 83, 0),
('编辑菜单', 'edit_menu', 83, 0);

-- ============================================================
-- 预置数据：超级管理员角色和账户
-- ============================================================

INSERT INTO role (name, comment, is_super_admin, status) VALUES
('超级管理员', '系统超级管理员，拥有所有权限', 1, 0);

-- 将所有权限分配给超级管理员
INSERT INTO role_permissions (role_id, permissions_id)
SELECT 1, id FROM permissions;

-- 默认管理员账户，密码: admin123
INSERT INTO useraccount (username, password, name, phone, role_id, status) VALUES
('admin', '$2a$10$VDQO3zXNgvoSw.R8yFJYx.r6SmybNm75vv7VayyDMStVkcF0cpMaC', '管理员', '13800000000', 1, 0);
