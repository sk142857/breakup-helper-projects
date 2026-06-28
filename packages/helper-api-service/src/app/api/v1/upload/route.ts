import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { authGuard } from '@/lib/authGuard'
import { ErrorCode } from '@app/shared/constants'

/** 上传文件存储根目录 */
const UPLOADS_ROOT = path.join(process.cwd(), 'uploads')

/** 允许的图片 MIME 类型 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
]

/** 最大文件大小：10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * POST /api/v1/upload
 * 文件统一上传接口（multipart/form-data）
 *
 * 参数（FormData）：
 *   file: File              — 上传的文件
 *   mode: 'original' | 'thumbnail' | 'both'  — 上传模式（默认 both）
 *
 * 响应：
 *   { fileId, fileName, fileSize, mimeType, origUrl, thumbUrl }
 */
export async function POST(req: NextRequest) {
  // ---- 鉴权 ----
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  // ---- 解析 FormData ----
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return fail(ErrorCode.BAD_REQUEST, '请求格式错误，请使用 multipart/form-data')
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return fail(ErrorCode.BAD_REQUEST, '请选择要上传的文件')
  }

  const mode = (formData.get('mode') as string) || 'both'
  if (!['original', 'thumbnail', 'both'].includes(mode)) {
    return fail(ErrorCode.BAD_REQUEST, 'mode 参数无效，可选: original | thumbnail | both')
  }

  // ---- 校验文件 ----
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return fail(ErrorCode.INVALID_FILE_TYPE, `不支持的文件类型: ${file.type}，仅支持图片文件`)
  }

  if (file.size > MAX_FILE_SIZE) {
    return fail(ErrorCode.FILE_TOO_LARGE, `文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // ---- 生成存储信息 ----
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name) || '.jpg'
  const hash = crypto.createHash('md5').update(buffer).digest('hex')
  const timestamp = Date.now()
  const randomStr = crypto.randomBytes(4).toString('hex')
  const baseName = `${timestamp}_${randomStr}_${hash.slice(0, 8)}`

  const origFileName = `${baseName}${ext}`
  const thumbFileName = `${baseName}_thumb${ext}`

  const origPath = path.join(UPLOADS_ROOT, 'images', origFileName)
  const thumbPath = path.join(UPLOADS_ROOT, 'thumbs', thumbFileName)

  // ---- 确保目录存在 ----
  if (!existsSync(path.join(UPLOADS_ROOT, 'images'))) {
    await mkdir(path.join(UPLOADS_ROOT, 'images'), { recursive: true })
  }
  if (!existsSync(path.join(UPLOADS_ROOT, 'thumbs'))) {
    await mkdir(path.join(UPLOADS_ROOT, 'thumbs'), { recursive: true })
  }

  // ---- 写入原图 ----
  await writeFile(origPath, buffer)

  // ---- 生成缩略图（需要 sharp） ----
  let origUrl = `/uploads/images/${origFileName}`
  let thumbUrl: string | null = null

  if (mode === 'thumbnail' || mode === 'both') {
    try {
      const sharp = (await import('sharp')).default
      const thumbBuffer = await sharp(buffer)
        .resize(300, 300, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80 })
        .toBuffer()
      await writeFile(thumbPath, thumbBuffer)
      thumbUrl = `/uploads/thumbs/${thumbFileName}`
    } catch (e) {
      console.warn('[Upload] 缩略图生成失败（sharp 可能未安装）:', (e as Error).message)
      // sharp 不可用时，缩略图回退到原图
      if (mode === 'thumbnail') {
        thumbUrl = origUrl
        origUrl = `/uploads/images/${origFileName}`
      }
    }
  }

  if (mode === 'thumbnail') {
    // 只返回缩略图路径
    thumbUrl = thumbUrl || origUrl
    origUrl = ''
  }

  // ---- 入库 ----
  try {
    const record = await prisma.fileUpload.create({
      data: {
        fileId: crypto.randomBytes(8).toString('hex'),
        userId: BigInt(userId),
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileType: 'image',
        storage: 'local',
        origUrl,
        thumbUrl,
        md5Hash: hash,
      },
    })

    return ok({
      fileId: record.fileId,
      fileName: record.fileName,
      fileSize: record.fileSize,
      mimeType: record.mimeType,
      origUrl: record.origUrl,
      thumbUrl: record.thumbUrl,
    }, '上传成功')
  } catch (e) {
    console.error('[Upload] 入库失败:', e)
    return fail(ErrorCode.UPLOAD_FAILED, '上传记录保存失败')
  }
}


