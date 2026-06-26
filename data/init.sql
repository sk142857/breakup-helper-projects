-- ============================================
-- 断联助手 (Breakup Helper) - 数据库初始化脚本
-- 适用: MySQL 8.0+
-- 使用: mysql -u root -p < data/init.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS `aliyun_breakup_helper`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `aliyun_breakup_helper`;

-- ============================================
-- 1. 数据字典表
-- 兼容多种字典类型，dict_type 区分业务域
-- ============================================
DROP TABLE IF EXISTS `t_dict`;
CREATE TABLE `t_dict` (
  `dict_id`     INT           NOT NULL AUTO_INCREMENT,
  `dict_type`   VARCHAR(30)   NOT NULL            COMMENT '字典类型: rel_type|rel_status|rec_mood|rec_bk_status|user_status',
  `dict_code`   VARCHAR(30)   NOT NULL            COMMENT '字典编码 (存储值)',
  `dict_label`  VARCHAR(50)   NOT NULL            COMMENT '字典标签 (展示名)',
  `dict_emoji`  VARCHAR(10)   DEFAULT NULL        COMMENT 'emoji 图标',
  `dict_desc`   VARCHAR(100)  DEFAULT NULL        COMMENT '描述说明',
  `sort_order`  INT           DEFAULT 0           COMMENT '排序',
  `dict_status` VARCHAR(20)   DEFAULT 'active'    COMMENT '状态: active|disabled',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`dict_id`),
  UNIQUE KEY `uk_dict_type_code` (`dict_type`, `dict_code`),
  KEY `idx_dict_type` (`dict_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据字典表';

-- ---- 字典初始化 ----

-- 关系类型
INSERT INTO `t_dict` (`dict_type`, `dict_code`, `dict_label`, `dict_emoji`, `dict_desc`, `sort_order`) VALUES
('rel_type', 'first_love',    '初恋',     '💕', '第一次恋爱', 1),
('rel_type', 'ex',            '前任',     '💔', '分手后的前任', 2),
('rel_type', 'crush',         '暗恋',     '💌', '单向暗恋', 3),
('rel_type', 'situationship', '暧昧对象', '🤔', '关系不明确', 4),
('rel_type', 'blind_date',    '相亲对象', '🍵', '相亲认识', 5),
('rel_type', 'other',         '其他',     '📌', '其他类型', 99);

-- 断联状态
INSERT INTO `t_dict` (`dict_type`, `dict_code`, `dict_label`, `dict_emoji`, `dict_desc`, `sort_order`) VALUES
('rel_status', 'active',  '进行中', '🔥', '断联进行中', 1),
('rel_status', 'done',    '已结束', '✅', '断联已结束', 2),
('rel_status', 'paused',  '暂停中', '⏸️', '暂时搁置', 3),
('rel_status', 'unknown', '不知道', '🤷', '不太确定', 4);

-- 打卡心情
INSERT INTO `t_dict` (`dict_type`, `dict_code`, `dict_label`, `dict_emoji`, `dict_desc`, `sort_order`) VALUES
('rec_mood', 'great',    '很好', '😄', '心情很好', 1),
('rec_mood', 'good',     '不错', '😊', '心情不错', 2),
('rec_mood', 'ok',       '一般', '😐', '心情一般', 3),
('rec_mood', 'bad',      '低落', '😔', '心情低落', 4),
('rec_mood', 'terrible', '难受', '😭', '心情难受', 5),
('rec_mood', 'cry',      '难过', '😭', '很难过', 6),
('rec_mood', 'sad',      '伤心', '😢', '伤心', 7),
('rec_mood', 'meh',      '一般', '😐', '没什么感觉', 3),
('rec_mood', 'happy',    '开心', '😊', '开心', 9),
('rec_mood', 'free',     '解放', '😄', '如释重负', 10),
('rec_mood', 'strong',   '坚定', '💪', '坚定不回头', 11),
('rec_mood', 'heartbreak','心碎', '💔', '心碎', 12);

-- 断联行为状态（记录用）
INSERT INTO `t_dict` (`dict_type`, `dict_code`, `dict_label`, `dict_desc`, `sort_order`) VALUES
('rec_bk_status', 'keeping',   '保持断联中',       '今天坚持住了', 1),
('rec_bk_status', 'almost',    '差点破功（忍住了）','差点联系但忍住了', 2),
('rec_bk_status', 'broken',    '破功了（已联系）',  '联系了对方', 3),
('rec_bk_status', 'contacted', '对方联系我了',      '对方主动联系', 4);

-- 用户状态
INSERT INTO `t_dict` (`dict_type`, `dict_code`, `dict_label`, `sort_order`) VALUES
('user_status', 'active',   '启用', 1),
('user_status', 'disabled', '禁用', 2);


-- ============================================
-- 2. 微信应用配置表
-- 支持多公众号 / 多小程序，统一管理 access_token
-- ============================================
DROP TABLE IF EXISTS `t_wechat_apps`;
CREATE TABLE `t_wechat_apps` (
  `app_id`     VARCHAR(32)  NOT NULL            COMMENT '微信 AppID (主键)',
  `app_type`   VARCHAR(20)  NOT NULL            COMMENT '应用类型: mp_oa(公众号) | mp_miniapp(小程序)',
  `app_secret` VARCHAR(64)  NOT NULL            COMMENT '微信 AppSecret',
  `app_name`   VARCHAR(50)  DEFAULT NULL        COMMENT '应用名称 (便于识别)',
  `app_status` VARCHAR(20)  DEFAULT 'active'    COMMENT '状态: active|disabled',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='微信应用配置表';


-- ============================================
-- 3. 用户表
-- user_id 由应用层生成随机 10 位数字 (1000000000 ~ 9999999999)
-- ============================================
DROP TABLE IF EXISTS `t_users`;
CREATE TABLE `t_users` (
  `user_id`     BIGINT        NOT NULL            COMMENT '随机10位数字ID',
  `open_id`     VARCHAR(64)   NOT NULL            COMMENT '微信 OpenID',
  `union_id`    VARCHAR(64)   DEFAULT NULL        COMMENT '微信 UnionID',
  `nickname`    VARCHAR(50)   DEFAULT '断联者'    COMMENT '用户昵称',
  `avatar_url`  VARCHAR(500)  DEFAULT NULL        COMMENT '头像 URL',
  `phone`       VARCHAR(20)   DEFAULT NULL        COMMENT '手机号',
  `user_status` VARCHAR(20)   DEFAULT 'active'    COMMENT '状态: active | disabled',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_open_id` (`open_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';


-- ============================================
-- 4. 感情关系表
-- 记录每一段感情的起止时间、类型及断联目标
-- ============================================
DROP TABLE IF EXISTS `t_relationships`;
CREATE TABLE `t_relationships` (
  `rel_id`            INT           NOT NULL AUTO_INCREMENT,
  `user_id`           BIGINT        NOT NULL            COMMENT '所属用户 ID',
  `nickname`          VARCHAR(50)   NOT NULL            COMMENT '对方昵称/代号',
  `avatar_url`        VARCHAR(500)  DEFAULT NULL        COMMENT '头像 URL',
  `rel_type`          VARCHAR(20)   NOT NULL            COMMENT '关系类型: first_love | ex | crush | situationship | blind_date | other',
  `start_date`        DATE          NOT NULL            COMMENT '感情开始日期',
  `end_date`          DATE          DEFAULT NULL        COMMENT '分手/结束日期 (同时也是断联起始日)',
  `break_target_days` INT           DEFAULT 100         COMMENT '断联目标天数',
  `rel_status`        VARCHAR(20)   DEFAULT 'active'    COMMENT '断联状态: active | done | paused | unknown',
  `note`              VARCHAR(500)  DEFAULT NULL        COMMENT '备注',
  `images`            JSON          DEFAULT NULL        COMMENT '图片 URL 数组 ["url1","url2"]',
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rel_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rel_status` (`rel_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='感情关系表';


-- ============================================
-- 5. 断联记录表
-- 每日打卡 / 详细记录 统一一张表
-- ============================================
DROP TABLE IF EXISTS `t_records`;
CREATE TABLE `t_records` (
  `record_id`       INT             NOT NULL AUTO_INCREMENT,
  `rel_id`          INT             NOT NULL            COMMENT '关联感情 ID',
  `user_id`         BIGINT          NOT NULL            COMMENT '所属用户 ID (冗余, 便于查询)',
  `record_date`     DATE            NOT NULL            COMMENT '记录日期',
  `rec_mood`        VARCHAR(20)     NOT NULL            COMMENT '心情: great|good|ok|bad|terrible (打卡) 或 cry|sad|meh|happy|free|strong|heartbreak (详细)',
  `rec_bk_status`   VARCHAR(20)     DEFAULT NULL        COMMENT '断联状态: keeping|almost|broken|contacted (打卡时可为 NULL)',
  `content`         TEXT            DEFAULT NULL        COMMENT '心情记录 / 感想',
  `images`          JSON            DEFAULT NULL        COMMENT '图片 URL 数组',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  UNIQUE KEY `uk_rel_date` (`rel_id`, `record_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rel_id` (`rel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='断联记录表 (打卡 + 详细记录)';


-- ============================================
-- 6. 里程碑定义表
-- 预置里程碑，如 7天、30天、100天 等
-- ============================================
DROP TABLE IF EXISTS `t_milestones`;
CREATE TABLE `t_milestones` (
  `ms_id`          INT           NOT NULL AUTO_INCREMENT,
  `days`        INT           NOT NULL            COMMENT '断联天数',
  `title`       VARCHAR(50)   NOT NULL            COMMENT '里程碑标题',
  `emoji`       VARCHAR(10)   DEFAULT NULL        COMMENT '图标 emoji',
  `sort_order`  INT           DEFAULT 0           COMMENT '排序',
  PRIMARY KEY (`ms_id`),
  UNIQUE KEY `uk_days` (`days`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑定义表';

-- 预置里程碑数据
INSERT INTO `t_milestones` (`days`, `title`, `emoji`, `sort_order`) VALUES
(1,   '第一天',       '🌱', 1),
(3,   '三天坚持',     '💪', 2),
(7,   '一周之痒',     '🎯', 3),
(14,  '两周蜕变',     '🦋', 4),
(21,  '习惯养成',     '🏃', 5),
(30,  '满月纪念',     '🌕', 6),
(50,  '半百里程',     '⛰️', 7),
(66,  '顺顺利利',     '🍀', 8),
(88,  '发发发',       '🎉', 9),
(100, '百天大关',     '💯', 10),
(150, '破茧成蝶',     '🌟', 11),
(200, '双百成就',     '🏆', 12),
(300, '三百天王者',   '👑', 13),
(365, '一周年重生',   '🔥', 14);


-- ============================================
-- 7. 用户里程碑达成记录
-- 关联感情 + 里程碑，追踪每条感情的里程碑达成情况
-- ============================================
DROP TABLE IF EXISTS `t_user_milestones`;
CREATE TABLE `t_user_milestones` (
  `um_id`        INT        NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT     NOT NULL,
  `rel_id`       INT        NOT NULL,
  `ms_id`        INT        NOT NULL,
  `achieved_at`  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '达成时间',
  PRIMARY KEY (`um_id`),
  UNIQUE KEY `uk_user_rel_ms` (`user_id`, `rel_id`, `ms_id`),
  KEY `idx_rel_id` (`rel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户里程碑达成记录';


-- ============================================
-- 8. 测试数据 (可选执行)
-- ============================================
-- INSERT INTO `t_users` (`user_id`, `open_id`, `nickname`, `avatar_url`) VALUES
-- (1000000001, 'test_openid_001', '断联者', NULL);
--
-- INSERT INTO `t_relationships` (`user_id`, `nickname`, `rel_type`, `start_date`, `end_date`, `break_target_days`, `rel_status`) VALUES
-- (1000000001, '张三', 'first_love', '2024-03-15', '2026-04-01', 100, 'active'),
-- (1000000001, '李四', 'ex',        '2025-05-01', '2026-05-18', 100, 'active'),
-- (1000000001, '王五', 'blind_date','2025-06-01', '2025-09-01', 120, 'done');
