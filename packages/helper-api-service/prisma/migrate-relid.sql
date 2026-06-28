-- ========================================
-- 将感情关系主键 relId 从 INT 改为 VARCHAR(6)
-- 步骤：先删外键 → 改列 → 重建外键
-- ========================================

USE aliyun_breakup_helper;

-- 1. 删除外键约束
ALTER TABLE `t_records`          DROP FOREIGN KEY `t_records_ibfk_1`;
ALTER TABLE `t_user_milestones`  DROP FOREIGN KEY `t_user_milestones_ibfk_1`;

-- 2. 更改 t_relationships 主键
ALTER TABLE `t_relationships`
  MODIFY COLUMN `rel_id` VARCHAR(6) NOT NULL,
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`rel_id`);

-- 3. 更改关联表的外键列类型
ALTER TABLE `t_records`
  MODIFY COLUMN `rel_id` VARCHAR(6) NOT NULL;

ALTER TABLE `t_user_milestones`
  MODIFY COLUMN `rel_id` VARCHAR(6) NOT NULL;

-- 4. 重建外键约束
ALTER TABLE `t_records`
  ADD CONSTRAINT `t_records_ibfk_1`
    FOREIGN KEY (`rel_id`) REFERENCES `t_relationships` (`rel_id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `t_user_milestones`
  ADD CONSTRAINT `t_user_milestones_ibfk_1`
    FOREIGN KEY (`rel_id`) REFERENCES `t_relationships` (`rel_id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. 验证
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'aliyun_breakup_helper'
  AND TABLE_NAME IN ('t_relationships', 't_records', 't_user_milestones')
  AND COLUMN_NAME = 'rel_id';
