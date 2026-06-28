import { prisma } from '@/lib/prisma'
import type { ImageInfo } from '@app/shared'

/** fileId 的正则：16 位十六进制字符串 */
const FILE_ID_REGEX = /^[0-9a-f]{16}$/i

/**
 * 将 images 数组中混合的 fileId / URL 统一解析为 ImageInfo[]
 *
 * - fileId（16 位十六进制）→ 查 FileUpload 表获取 origUrl / thumbUrl
 * - URL 字符串 → 直接作为 origUrl，thumbUrl 留空（兼容旧数据）
 */
export async function resolveImageList(images: string[]): Promise<ImageInfo[]> {
  if (!images || images.length === 0) return []

  const fileIds = images.filter((v) => FILE_ID_REGEX.test(v))
  const urlItems = images.filter((v) => !FILE_ID_REGEX.test(v))

  // 批量查询 fileId
  const fileMap = new Map<string, { origUrl: string; thumbUrl: string | null }>()
  if (fileIds.length > 0) {
    const records = await prisma.fileUpload.findMany({
      where: { fileId: { in: fileIds } },
      select: { fileId: true, origUrl: true, thumbUrl: true },
    })
    for (const r of records) {
      fileMap.set(r.fileId, { origUrl: r.origUrl, thumbUrl: r.thumbUrl })
    }
  }

  const result: ImageInfo[] = []

  // fileId 按传入顺序输出
  for (const fid of fileIds) {
    const info = fileMap.get(fid)
    if (info) {
      result.push({ fileId: fid, origUrl: info.origUrl, thumbUrl: info.thumbUrl })
    } else {
      // fileId 在数据库中不存在 → 标记为无效
      result.push({ fileId: fid, origUrl: '', thumbUrl: null })
    }
  }

  // URL 直接作为 origUrl
  for (const url of urlItems) {
    if (url) {
      result.push({ fileId: '', origUrl: url, thumbUrl: null })
    }
  }

  return result
}
