// ============ 数据字典类型 ============

/** 字典条目 */
export interface DictItem {
  dictId: number
  dictType: string
  dictCode: string
  dictLabel: string
  dictEmoji: string | null
  dictDesc: string | null
  sortOrder: number
}

/** 按类型分组的字典数据 */
export type DictMap = Record<string, DictItem[]>
