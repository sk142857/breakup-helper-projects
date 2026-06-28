/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : aliyun_breakup_helper

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 27/06/2026 13:32:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_staff
-- ----------------------------
DROP TABLE IF EXISTS `t_staff`;
CREATE TABLE `t_staff`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录账号',
  `password_hash` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码(bcrypt)',
  `display_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '显示名称',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '状态: active|disabled',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '后台员工表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_staff
-- ----------------------------
INSERT INTO `t_staff` VALUES (1, 'root', '$2a$10$E7vdJL/.y8NNGn3S4q9jGeWrHGbPQpf9Eyvr..AU6t5jEALNop2n6', '超级管理员', 'active', '2026-06-27 00:00:00', '2026-06-27 00:00:00');

-- ----------------------------
-- Table structure for t_dict
-- ----------------------------
DROP TABLE IF EXISTS `t_dict`;
CREATE TABLE `t_dict`  (
  `dict_id` int NOT NULL AUTO_INCREMENT,
  `dict_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型: rel_type|rel_status|rec_mood|rec_bk_status|user_status',
  `dict_code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典编码 (存储值)',
  `dict_label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典标签 (展示名)',
  `dict_emoji` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'emoji 图标',
  `dict_desc` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '描述说明',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `dict_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态: active|disabled',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`dict_id`) USING BTREE,
  UNIQUE INDEX `uk_dict_type_code`(`dict_type` ASC, `dict_code` ASC) USING BTREE,
  INDEX `idx_dict_type`(`dict_type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '数据字典表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_dict
-- ----------------------------
INSERT INTO `t_dict` VALUES (1, 'rel_type', 'first_love', '初恋', '💕', '第一次恋爱', 1, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (2, 'rel_type', 'ex', '前任', '💔', '分手后的前任', 2, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (3, 'rel_type', 'crush', '暗恋', '💌', '单向暗恋', 3, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (4, 'rel_type', 'situationship', '暧昧对象', '🤔', '关系不明确', 4, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (5, 'rel_type', 'blind_date', '相亲对象', '🍵', '相亲认识', 5, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (6, 'rel_type', 'other', '其他', '📌', '其他类型', 99, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (7, 'rel_status', 'active', '进行中', '🔥', '断联进行中', 1, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (8, 'rel_status', 'done', '已结束', '✅', '断联已结束', 2, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (9, 'rel_status', 'paused', '暂停中', '⏸️', '暂时搁置', 3, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (10, 'rel_status', 'unknown', '不知道', '🤷', '不太确定', 4, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (11, 'rec_mood', 'great', '很好', '😄', '心情很好', 1, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (12, 'rec_mood', 'good', '不错', '😊', '心情不错', 2, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (13, 'rec_mood', 'ok', '一般', '😐', '心情一般', 3, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (14, 'rec_mood', 'bad', '低落', '😔', '心情低落', 4, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (15, 'rec_mood', 'terrible', '难受', '😭', '心情难受', 5, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (16, 'rec_mood', 'cry', '难过', '😭', '很难过', 6, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (17, 'rec_mood', 'sad', '伤心', '😢', '伤心', 7, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (18, 'rec_mood', 'meh', '一般', '😐', '没什么感觉', 3, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (19, 'rec_mood', 'happy', '开心', '😊', '开心', 9, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (20, 'rec_mood', 'free', '解放', '😄', '如释重负', 10, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (21, 'rec_mood', 'strong', '坚定', '💪', '坚定不回头', 11, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (22, 'rec_mood', 'heartbreak', '心碎', '💔', '心碎', 12, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (23, 'rec_bk_status', 'keeping', '保持断联中', NULL, '今天坚持住了', 1, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (24, 'rec_bk_status', 'almost', '差点破功（忍住了）', NULL, '差点联系但忍住了', 2, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (25, 'rec_bk_status', 'broken', '破功了（已联系）', NULL, '联系了对方', 3, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (26, 'rec_bk_status', 'contacted', '对方联系我了', NULL, '对方主动联系', 4, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (27, 'user_status', 'active', '启用', NULL, NULL, 1, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');
INSERT INTO `t_dict` VALUES (28, 'user_status', 'disabled', '禁用', NULL, NULL, 2, 'active', '2026-06-26 10:05:02', '2026-06-26 10:05:02');

-- ----------------------------
-- Table structure for t_milestones
-- ----------------------------
DROP TABLE IF EXISTS `t_milestones`;
CREATE TABLE `t_milestones`  (
  `ms_id` int NOT NULL AUTO_INCREMENT,
  `days` int NOT NULL COMMENT '断联天数',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '里程碑标题',
  `emoji` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图标 emoji',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`ms_id`) USING BTREE,
  UNIQUE INDEX `uk_days`(`days` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '里程碑定义表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_milestones
-- ----------------------------
INSERT INTO `t_milestones` VALUES (1, 1, '第一天', '🌱', 1);
INSERT INTO `t_milestones` VALUES (2, 3, '三天坚持', '💪', 2);
INSERT INTO `t_milestones` VALUES (3, 7, '一周之痒', '🎯', 3);
INSERT INTO `t_milestones` VALUES (4, 14, '两周蜕变', '🦋', 4);
INSERT INTO `t_milestones` VALUES (5, 21, '习惯养成', '🏃', 5);
INSERT INTO `t_milestones` VALUES (6, 30, '满月纪念', '🌕', 6);
INSERT INTO `t_milestones` VALUES (7, 50, '半百里程', '⛰️', 7);
INSERT INTO `t_milestones` VALUES (8, 66, '顺顺利利', '🍀', 8);
INSERT INTO `t_milestones` VALUES (9, 88, '发发发', '🎉', 9);
INSERT INTO `t_milestones` VALUES (10, 100, '百天大关', '💯', 10);
INSERT INTO `t_milestones` VALUES (11, 150, '破茧成蝶', '🌟', 11);
INSERT INTO `t_milestones` VALUES (12, 200, '双百成就', '🏆', 12);
INSERT INTO `t_milestones` VALUES (13, 300, '三百天王者', '👑', 13);
INSERT INTO `t_milestones` VALUES (14, 365, '一周年重生', '🔥', 14);

-- ----------------------------
-- Table structure for t_records
-- ----------------------------
DROP TABLE IF EXISTS `t_records`;
CREATE TABLE `t_records`  (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `rel_id` int NOT NULL COMMENT '关联感情 ID',
  `user_id` bigint NOT NULL COMMENT '所属用户 ID (冗余, 便于查询)',
  `record_date` date NOT NULL COMMENT '记录日期',
  `rec_mood` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '心情: great|good|ok|bad|terrible (打卡) 或 cry|sad|meh|happy|free|strong|heartbreak (详细)',
  `rec_bk_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '断联状态: keeping|almost|broken|contacted (打卡时可为 NULL)',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '心情记录 / 感想',
  `images` json NULL COMMENT '图片 URL 数组',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`) USING BTREE,
  UNIQUE INDEX `uk_rel_date`(`rel_id` ASC, `record_date` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_rel_id`(`rel_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '断联记录表 (打卡 + 详细记录)' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_records
-- ----------------------------

-- ----------------------------
-- Table structure for t_relationships
-- ----------------------------
DROP TABLE IF EXISTS `t_relationships`;
CREATE TABLE `t_relationships`  (
  `rel_id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '所属用户 ID',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '对方昵称/代号',
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像 URL',
  `rel_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关系类型: first_love | ex | crush | situationship | blind_date | other',
  `start_date` date NOT NULL COMMENT '感情开始日期',
  `end_date` date NULL DEFAULT NULL COMMENT '分手/结束日期 (同时也是断联起始日)',
  `break_target_days` int NULL DEFAULT 100 COMMENT '断联目标天数',
  `rel_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '断联状态: active | done | paused | unknown',
  `note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `images` json NULL COMMENT '图片 URL 数组 [\"url1\",\"url2\"]',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rel_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_rel_status`(`rel_status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '感情关系表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_relationships
-- ----------------------------

-- ----------------------------
-- Table structure for t_user_milestones
-- ----------------------------
DROP TABLE IF EXISTS `t_user_milestones`;
CREATE TABLE `t_user_milestones`  (
  `um_id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `rel_id` int NOT NULL,
  `ms_id` int NOT NULL,
  `achieved_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '达成时间',
  PRIMARY KEY (`um_id`) USING BTREE,
  UNIQUE INDEX `uk_user_rel_ms`(`user_id` ASC, `rel_id` ASC, `ms_id` ASC) USING BTREE,
  INDEX `idx_rel_id`(`rel_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户里程碑达成记录' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_user_milestones
-- ----------------------------

-- ----------------------------
-- Table structure for t_users
-- ----------------------------
DROP TABLE IF EXISTS `t_users`;
CREATE TABLE `t_users`  (
  `user_id` bigint NOT NULL COMMENT '随机10位数字ID',
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '微信 OpenID',
  `union_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信 UnionID',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '断联者' COMMENT '用户昵称',
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像 URL',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `user_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态: active | disabled',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE INDEX `uk_open_id`(`open_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_users
-- ----------------------------

-- ----------------------------
-- Table structure for t_file_uploads
-- ----------------------------
DROP TABLE IF EXISTS `t_file_uploads`;
CREATE TABLE `t_file_uploads`  (
  `file_id` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '随机16位字符串ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '上传用户 ID',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件名',
  `file_size` int NOT NULL COMMENT '文件大小（字节）',
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME 类型',
  `file_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image' COMMENT '文件分类: image|video|audio|file',
  `storage` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'local' COMMENT '存储方式: local|oss',
  `orig_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原文件 URL',
  `thumb_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '缩略图 URL',
  `md5_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '文件 MD5',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`file_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文件上传记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_file_uploads
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_apps
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_apps`;
CREATE TABLE `t_wechat_apps`  (
  `app_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '微信 AppID (主键)',
  `app_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '应用类型: mp_oa(公众号) | mp_miniapp(小程序)',
  `app_secret` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '微信 AppSecret',
  `app_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '应用名称 (便于识别)',
  `app_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`app_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '微信应用配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_apps
-- ----------------------------
INSERT INTO `t_wechat_apps` VALUES ('wx7c3dc180b9b9dc51', 'mp_miniapp', 'e30a0970250064a69afb917b5aad1410', '分手小助手', 'active', '2026-06-26 08:29:26.000', '2026-06-26 08:45:56.000');

-- ----------------------------
-- Table structure for t_wechat_miniprogram_app_base_info
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_app_base_info`;
CREATE TABLE `t_wechat_miniprogram_app_base_info`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '信息ID',
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户的唯一标识',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  `sdk_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '客户端基础库版本',
  `enable_debug` tinyint(1) NULL DEFAULT NULL COMMENT '是否已打开调试。可通过右上角菜单或 wx.setEnableDebug 打开调试。',
  `host_app_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '当前小程序运行的宿主环境',
  `language` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '微信设置的语言',
  `version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '微信版本号',
  `theme` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '系统当前主题，取值为light或dark，全局配置\"darkmode\":true时才能获取，否则为 undefined （不支持小游戏）',
  `font_size_scale_factor` decimal(5, 2) NULL DEFAULT NULL COMMENT '微信字体大小缩放比例',
  `font_size_setting` int NULL DEFAULT NULL COMMENT '微信字体大小，单位px',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `modified_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信App基本信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_app_base_info
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_battery_info
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_battery_info`;
CREATE TABLE `t_wechat_miniprogram_battery_info`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '信息ID',
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '用户唯一标识',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '开放平台标识',
  `battery_level` tinyint UNSIGNED NULL DEFAULT NULL COMMENT '设备电量，范围 1 - 100',
  `is_charging` tinyint(1) NULL DEFAULT NULL COMMENT '是否正在充电中',
  `is_low_power_mode_enabled` tinyint(1) NULL DEFAULT NULL COMMENT '是否处于省电模式，仅 iOS 端支持',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `modified_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信小程序设备状态及电量信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_battery_info
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_device_info
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_device_info`;
CREATE TABLE `t_wechat_miniprogram_device_info`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '信息ID',
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户的唯一标识',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  `abi` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '应用（微信APP）二进制接口类型（仅 Android 支持）',
  `device_abi` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备二进制接口类型（仅 Android 支持），2.25.1版本',
  `benchmark_level` int NULL DEFAULT NULL COMMENT '设备性能等级（仅 Android 支持）。取值为：-2 或 0（该设备无法运行小游戏），-1（性能未知），>=1（设备性能值，该值越高，设备性能越好，目前最高不到50）。注意：从基础库3.4.5开始，本返回值停止维护，请使用wx.getDeviceBenchmarkInfo获取设备性能等级',
  `model_level` int NULL DEFAULT NULL COMMENT '设备机型档位。0（档位未知），1（高档机），2（中档机），3（低档机）',
  `brand` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备品牌',
  `model` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备型号。新机型刚推出一段时间会显示unknown，微信会尽快进行适配',
  `system_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作系统及版本',
  `platform` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '客户端平台',
  `cpu_type` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备 CPU 型号（仅 Android 支持）（Tips: GPU 型号可通过 WebGLRenderingContext.getExtension(\"WEBGL_debug_renderer_info\") 来获取），2.29.0版本',
  `memory_size` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备内存大小，单位为 MB，2.30.0版本',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `modified_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '存储设备信息，包括设备和应用的二进制接口类型、设备性能等级、品牌、型号、操作系统等' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_device_info
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_event_log
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_event_log`;
CREATE TABLE `t_wechat_miniprogram_event_log`  (
  `log_id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT 'user_id 或 anonymous_id',
  `open_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '微信 openid（已登录用户）',
  `event_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '事件类型',
  `event_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '事件名称',
  `page_path` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `page_title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '页面标题',
  `page_query` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '页面参数（query string）',
  `timestamp` datetime(3) NOT NULL,
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '会话ID',
  `scene` int NULL DEFAULT NULL COMMENT '进入小程序的场景值',
  `device_brand` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备品牌',
  `device_model` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备型号',
  `os_version` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '系统版本',
  `platform` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '平台（ios/android/devtools）',
  `app_version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '小程序版本号',
  `wx_version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '微信版本号',
  `network_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '网络类型（wifi/4g/5g等）',
  `extra` json NULL COMMENT '扩展信息/自定义参数',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `duration` int UNSIGNED NULL DEFAULT NULL,
  `referrer_path` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`log_id`, `timestamp`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信小程序埋点/事件日志表' ROW_FORMAT = DYNAMIC PARTITION BY RANGE (((year(`timestamp`) * 100) + month(`timestamp`)))
PARTITIONS 8
(PARTITION `p202606` VALUES LESS THAN (202607) ENGINE = InnoDB MAX_ROWS = 0 MIN_ROWS = 0 ,
PARTITION `p202607` VALUES LESS THAN (202608) ENGINE = InnoDB MAX_ROWS = 0 MIN_ROWS = 0 ,
PARTITION `p202608` VALUES LESS THAN (202609) ENGINE = InnoDB MAX_ROWS = 0 MIN_ROWS = 0 ,
PARTITION `p202609` VALUES LESS THAN (202610) ENGINE = InnoDB MAX_ROWS = 0 MIN_ROWS = 0 ,
PARTITION `p202610` VALUES LESS THAN (202611) ENGINE = InnoDB MAX_ROWS = 0 MIN_ROWS = 0 ,
PARTITION `p202611` VALUES LESS THAN (202612) ENGINE = InnoDB MAX_ROWS = 0 MIN_ROWS = 0 ,
PARTITION `p202612` VALUES LESS THAN (202701) ENGINE = InnoDB MAX_ROWS = 0 MIN_ROWS = 0 ,
PARTITION `p_future` VALUES LESS THAN (MAXVALUE) ENGINE = InnoDB MAX_ROWS = 0 MIN_ROWS = 0 )
;

-- ----------------------------
-- Records of t_wechat_miniprogram_event_log
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_launch_options
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_launch_options`;
CREATE TABLE `t_wechat_miniprogram_launch_options`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '信息ID',
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户的唯一标识',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户 ID',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '启动小程序的路径 (代码包路径)',
  `scene` int NULL DEFAULT NULL COMMENT '启动小程序的场景值',
  `app_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '来源小程序、公众号或 App 的 appId',
  `query_obj` json NULL COMMENT '启动小程序的 query 参数，存储为 JSON 格式',
  `share_ticket` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分享票据，详见获取更多转发信息',
  `referrer_info` json NULL COMMENT '来源信息，从另一个小程序、公众号或 App 进入时返回',
  `forward_materials` json NULL COMMENT '打开的文件信息数组，只有从聊天素材场景打开（scene为1173）才携带该参数',
  `chat_type` int NULL DEFAULT NULL COMMENT '从微信群聊/单聊打开小程序时，表示具体的微信群聊/单聊类型',
  `api_category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'API 类别，版本 2.20.0',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `modified_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信小程序启动参数表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_launch_options
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_network_type
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_network_type`;
CREATE TABLE `t_wechat_miniprogram_network_type`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '信息ID',
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `network_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '网络类型',
  `signal_strength` int NULL DEFAULT NULL COMMENT '信号强弱，单位 dBm',
  `has_system_proxy` int NULL DEFAULT NULL COMMENT '设备是否使用了网络代理',
  `weak_net` int NULL DEFAULT NULL COMMENT '是否处于弱网环境',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `modified_at` datetime(3) NULL DEFAULT NULL,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户的唯一标识',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信小程序网络状态信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_network_type
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_performance_info
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_performance_info`;
CREATE TABLE `t_wechat_miniprogram_performance_info`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '日志信息唯一标识',
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '用户唯一标识',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '开放平台标识',
  `entry_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '事件类型，如 navigation',
  `start_time` bigint UNSIGNED NULL DEFAULT NULL COMMENT '事件开始时间的时间戳',
  `duration` int UNSIGNED NULL DEFAULT NULL COMMENT '事件持续时间，单位为毫秒',
  `navigation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '导航类型，如 appLaunch',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '页面路径，如 pages/login/index',
  `page_id` bigint NULL DEFAULT NULL COMMENT '页面标识',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `modified_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信小程序性能相关信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_performance_info
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_skyline_info
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_skyline_info`;
CREATE TABLE `t_wechat_miniprogram_skyline_info`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '信息ID',
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户的唯一标识',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  `is_supported` tinyint(1) NULL DEFAULT NULL COMMENT '当前运行环境是否支持 Skyline 渲染引擎',
  `version` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Skyline 渲染引擎的版本号',
  `app_version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '小程序版本号',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '不支持 Skyline 渲染引擎的原因，仅在 is_supported 为 false 时出现',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `modified_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信小程序Skyline渲染引擎表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_skyline_info
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_system_setting
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_system_setting`;
CREATE TABLE `t_wechat_miniprogram_system_setting`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '信息ID',
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '普通用户的标识，对当前公众号唯一',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  `bluetooth_enabled` tinyint(1) NULL DEFAULT NULL COMMENT '蓝牙的系统开关',
  `location_enabled` tinyint(1) NULL DEFAULT NULL COMMENT '地理位置的系统开关',
  `wifi_enabled` tinyint(1) NULL DEFAULT NULL COMMENT 'Wi-Fi 的系统开关',
  `device_orientation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备方向（注意：IOS客户端横屏游戏获取device_orientation可能不准，建议以屏幕宽高为准）',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `modified_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信小程序设备设置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_system_setting
-- ----------------------------

-- ----------------------------
-- Table structure for t_wechat_miniprogram_window_info
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat_miniprogram_window_info`;
CREATE TABLE `t_wechat_miniprogram_window_info`  (
  `info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '信息ID',
  `device_info_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '普通用户的标识，对当前公众号唯一',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `md5_str` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'md5字符串',
  `pixel_ratio` decimal(10, 2) NOT NULL COMMENT '设备像素比',
  `screen_width` int NOT NULL COMMENT '屏幕宽度，单位px',
  `screen_height` int NOT NULL COMMENT '屏幕高度，单位px',
  `window_width` int NOT NULL COMMENT '可使用窗口宽度，单位px',
  `window_height` int NOT NULL COMMENT '可使用窗口高度，单位px',
  `status_bar_height` int NOT NULL COMMENT '状态栏的高度，单位px',
  `safe_area` json NULL COMMENT '在竖屏正方向下的安全区域。部分机型没有安全区域概念，也不会返回safe_area字段，开发者需自行兼容。',
  `screen_top` int NOT NULL COMMENT '窗口上边缘的y值',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `modified_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '微信小程序窗口信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of t_wechat_miniprogram_window_info
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
