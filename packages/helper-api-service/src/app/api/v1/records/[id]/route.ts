import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { authGuard } from '@/lib/authGuard'
import { RecordUpdateSchema, MoodDict, BreakStatusDict, type RecordInfo, type ImageInfo } from '@app/shared'
import { resolveImageList } from '@/lib/image'
import { ErrorCode } from '@app/shared/constants'

/**
 * 序列化记录对象
 */
function serializeRecord(rec: Record<string, unknown>): RecordInfo {
  const mood = rec.recMood as string
  const moodInfo = (MoodDict as Record<string, { label: string; emoji: string }>)[mood]
  const bkStatus = (rec.recBkStatus as string) || null
  return {
    recordId: rec.recordId as number,
    relId: rec.relId as string,
    sessionId: (rec.sessionId as string) || null,
    userId: Number(rec.userId),
    recordDate: (rec.recordDate as Date).toISOString().split('T')[0],
    recMood: mood,
    recMoodLabel: moodInfo?.label || mood,
    recMoodEmoji: moodInfo?.emoji || '😶',
    recBkStatus: bkStatus,
    recBkStatusLabel: bkStatus ? (BreakStatusDict as Record<string, string>)[bkStatus] || bkStatus : null,
    content: (rec.content as string) || null,
    images: (rec.images as string[]) || [],
    imageList: [],
    createdAt: (rec.createdAt as Date).toISOString(),
    updatedAt: (rec.updatedAt as Date).toISOString(),
  }
}

/**
 * GET /api/v1/records/[id]
 * 获取记录详情
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const recordId = parseInt(params.id, 10)
  if (isNaN(recordId)) return fail(ErrorCode.BAD_REQUEST, '无效的记录 ID')

  const rec = await prisma.record.findFirst({
    where: { recordId, userId: BigInt(userId) },
  })
  if (!rec) return fail(ErrorCode.RECORD_NOT_FOUND)

  const serialized = serializeRecord(
    rec as unknown as Record<string, unknown>,
  )
  serialized.imageList = await resolveImageList(serialized.images)
  return ok(serialized)
}

/**
 * PUT /api/v1/records/[id]
 * 更新记录
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const recordId = parseInt(params.id, 10)
  if (isNaN(recordId)) return fail(ErrorCode.BAD_REQUEST, '无效的记录 ID')

  const existing = await prisma.record.findFirst({
    where: { recordId, userId: BigInt(userId) },
  })
  if (!existing) return fail(ErrorCode.RECORD_NOT_FOUND)

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(RecordUpdateSchema, body)
  if (!result.success) return result.error

  const data = result.data
  const updateData: Record<string, unknown> = {}

  if (data.recMood !== undefined) updateData.recMood = data.recMood
  if (data.recBkStatus !== undefined) updateData.recBkStatus = data.recBkStatus || null
  if (data.content !== undefined) updateData.content = data.content || null
  if (data.images !== undefined) updateData.images = data.images

  const updated = await prisma.record.update({
    where: { recordId },
    data: updateData,
  })

  const updatedRec = serializeRecord(
    updated as unknown as Record<string, unknown>,
  )
  updatedRec.imageList = await resolveImageList(updatedRec.images)

  return ok(updatedRec, '更新成功')
}

/**
 * DELETE /api/v1/records/[id]
 * 删除记录
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const recordId = parseInt(params.id, 10)
  if (isNaN(recordId)) return fail(ErrorCode.BAD_REQUEST, '无效的记录 ID')

  const existing = await prisma.record.findFirst({
    where: { recordId, userId: BigInt(userId) },
  })
  if (!existing) return fail(ErrorCode.RECORD_NOT_FOUND)

  await prisma.record.delete({ where: { recordId } })

  return ok(null, '删除成功')
}
