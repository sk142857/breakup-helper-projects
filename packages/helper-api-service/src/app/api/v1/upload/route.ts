import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { authGuard } from '@/lib/authGuard'
import { ErrorCode } from '@app/shared/constants'

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads')
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * POST /api/v1/upload
 * 上传图片，返回 fileId + origUrl + thumbUrl
 */
export async function POST(req: NextRequest) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return fail(ErrorCode.BAD_REQUEST, '请求格式错误')
  }

  const file = formData.get('file') as File | null
  if (!file) return fail(ErrorCode.BAD_REQUEST, '请选择文件')
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return fail(ErrorCode.INVALID_FILE_TYPE, '不支持的文件类型')
  if (file.size > MAX_FILE_SIZE) return fail(ErrorCode.FILE_TOO_LARGE, '文件超过10MB')

  const mode = (formData.get('mode') as string) || 'both'
  const bizType = (formData.get('bizType') as string) || 'common'
  const dateStr = new Date().toISOString().slice(0, 10) // yyyy-mm-dd
  const baseUrl = `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host') || 'localhost:3000'}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name) || '.jpg'
  const hash = crypto.createHash('md5').update(buffer).digest('hex')
  const baseName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${hash.slice(0, 8)}`
  const origFileName = `${baseName}${ext}`
  const thumbFileName = `${baseName}_thumb${ext}`
  const storeDir = path.join(UPLOADS_ROOT, 'images', bizType, dateStr)
  const origPath = path.join(storeDir, origFileName)
  const thumbPath = path.join(storeDir, thumbFileName)

  if (!existsSync(storeDir)) await mkdir(storeDir, { recursive: true })

  await writeFile(origPath, buffer)

  let origUrl = `${baseUrl}/uploads/images/${bizType}/${dateStr}/${origFileName}`
  let thumbUrl: string | null = null

  if (mode === 'thumbnail' || mode === 'both') {
    try {
      const sharp = (await import('sharp')).default
      const thumbBuffer = await sharp(buffer).resize(300, 300, { fit: 'cover', position: 'center' }).jpeg({ quality: 80 }).toBuffer()
      await writeFile(thumbPath, thumbBuffer)
      thumbUrl = `${baseUrl}/uploads/images/${bizType}/${dateStr}/${thumbFileName}`
    } catch {
      if (mode === 'thumbnail') { thumbUrl = origUrl; origUrl = `${baseUrl}/uploads/images/${bizType}/${dateStr}/${origFileName}` }
    }
  }

  if (mode === 'thumbnail') { thumbUrl = thumbUrl || origUrl; origUrl = '' }

  try {
    const fileId = crypto.randomBytes(8).toString('hex')
    const record = await prisma.fileUpload.create({
      data: { fileId, userId: BigInt(userId), fileName: file.name, fileSize: file.size, mimeType: file.type, fileType: 'image', storage: 'local', origUrl, thumbUrl, md5Hash: hash },
    })
    return ok({ fileId: record.fileId, fileName: record.fileName, fileSize: record.fileSize, mimeType: record.mimeType, origUrl: record.origUrl, thumbUrl: record.thumbUrl }, '上传成功')
  } catch {
    return fail(ErrorCode.UPLOAD_FAILED, '上传记录保存失败')
  }
}


