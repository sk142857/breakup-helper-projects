import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { authGuard } from '@/lib/authGuard'
import { ErrorCode } from '@app/shared/constants'
import type { DictItem } from '@app/shared'

/**
 * GET /api/v1/dict?types=rel_type,rel_status,rec_mood,rec_bk_status
 * 获取数据字典条目（按类型分组）
 *
 * 参数：
 *   types: 逗号分隔的字典类型列表，不传则返回全部
 */
export async function GET(req: NextRequest) {
  const guard = await authGuard(req)
  if ('error' in guard) return guard.error

  const { searchParams } = req.nextUrl
  const typesParam = searchParams.get('types')

  const where: Record<string, unknown> = { dictStatus: 'active' }
  if (typesParam) {
    const types = typesParam.split(',').map(t => t.trim()).filter(Boolean)
    if (types.length > 0) {
      where.dictType = { in: types }
    }
  }

  const list = await prisma.dict.findMany({
    where,
    select: {
      dictId: true,
      dictType: true,
      dictCode: true,
      dictLabel: true,
      dictEmoji: true,
      dictDesc: true,
      sortOrder: true,
    },
    orderBy: [{ dictType: 'asc' }, { sortOrder: 'asc' }],
  })

  // 按类型分组
  const grouped: Record<string, DictItem[]> = {}
  for (const item of list) {
    if (!grouped[item.dictType]) {
      grouped[item.dictType] = []
    }
    grouped[item.dictType].push({
      dictId: item.dictId,
      dictType: item.dictType,
      dictCode: item.dictCode,
      dictLabel: item.dictLabel,
      dictEmoji: item.dictEmoji,
      dictDesc: item.dictDesc,
      sortOrder: item.sortOrder ?? 0,
    })
  }

  return ok(grouped)
}
