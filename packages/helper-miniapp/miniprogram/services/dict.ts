import { get } from '../utils/request'

// ============ 类型定义 ============

export interface DictItem {
  dictId: number
  dictType: string
  dictCode: string
  dictLabel: string
  dictEmoji: string | null
  dictDesc: string | null
  sortOrder: number
}

export type DictMap = Record<string, DictItem[]>

// ============ API 方法 ============

/**
 * 获取数据字典（按类型分组）
 * @param types 逗号分隔的字典类型，如 'rel_type,rel_status,rec_mood,rec_bk_status'
 */
export function getDict(types?: string) {
  return get<DictMap>('/api/v1/dict', types ? { types } : undefined)
}
