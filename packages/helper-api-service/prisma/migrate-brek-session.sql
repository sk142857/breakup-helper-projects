-- ========================================
-- 新增断联期中间表 t_break_sessions
-- 一段感情支持多段分手（断联期）
-- 每段断联期可多次打卡
-- ========================================

USE aliyun_breakup_helper;

-- 1. 新增断联期表
CREATE TABLE IF NOT EXISTS `t_break_sessions` (
  `session_id` VARCHAR(12) NOT NULL COMMENT '断联期ID（随机12位）',
  `rel_id` VARCHAR(6) NOT NULL COMMENT '关联感情ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `start_date` DATE NOT NULL COMMENT '断联开始日期',
  `end_date` DATE DEFAULT NULL COMMENT '断联结束日期（NULL表示进行中）',
  `target_days` INT NOT NULL DEFAULT 100 COMMENT '目标断联天数',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active-进行中 done-已结束',
  `note` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `idx_session_rel_id` (`rel_id`),
  KEY `idx_session_user_id` (`user_id`),
  CONSTRAINT `fk_session_rel_id` FOREIGN KEY (`rel_id`) REFERENCES `t_relationships` (`rel_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='断联期表：一段感情可有多段分手期';

-- 2. 给 t_records 新增 session_id 列（允许为空，兼容旧数据）
ALTER TABLE `t_records`
  ADD COLUMN `session_id` VARCHAR(12) DEFAULT NULL COMMENT '所属断联期ID' AFTER `rel_id`,
  ADD KEY `idx_record_session_id` (`session_id`),
  ADD CONSTRAINT `fk_record_session_id` FOREIGN KEY (`session_id`) REFERENCES `t_break_sessions` (`session_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. 为已有的记录创建默认断联期（每个 relId 创建一个，把旧记录归入）
--    为 t_relationships 中每条有记录的 relId 创建默认断联期
INSERT INTO `t_break_sessions` (`session_id`, `rel_id`, `user_id`, `start_date`, `end_date`, `target_days`, `status`, `note`, `created_at`, `updated_at`)
SELECT
  CONCAT('DF', SUBSTRING(MD5(RAND()), 1, 10)) AS `session_id`,
  r.`rel_id`,
  r.`user_id`,
  COALESCE(MIN(rec.`record_date`), r.`created_at`) AS `start_date`,
  NULL AS `end_date`,
  COALESCE(r.`break_target_days`, 100) AS `target_days`,
  CASE WHEN r.`rel_status` = 'done' THEN 'done' ELSE 'active' END AS `status`,
  '默认断联期（数据迁移）' AS `note`,
  NOW() AS `created_at`,
  NOW() AS `updated_at`
FROM `t_relationships` r
INNER JOIN `t_records` rec ON r.`rel_id` = rec.`rel_id`
GROUP BY r.`rel_id`, r.`user_id`, r.`break_target_days`, r.`rel_status`, r.`created_at`;

-- 4. 将已有记录的 session_id 更新为对应的默认断联期
UPDATE `t_records` rec
INNER JOIN `t_break_sessions` bs ON rec.`rel_id` = bs.`rel_id` AND bs.`note` = '默认断联期（数据迁移）'
SET rec.`session_id` = bs.`session_id`;

-- 5. 清理标记（把迁移标记去掉）
UPDATE `t_break_sessions` SET `note` = NULL WHERE `note` = '默认断联期（数据迁移）';

-- 6. 验证
SELECT 't_break_sessions' AS `table`, COUNT(*) AS `rows` FROM `t_break_sessions`
UNION ALL
SELECT 't_records (has session_id)' AS `table`, COUNT(*) AS `rows` FROM `t_records` WHERE `session_id` IS NOT NULL
UNION ALL
SELECT 't_records (no session_id)' AS `table`, COUNT(*) AS `rows` FROM `t_records` WHERE `session_id` IS NULL;
