import { NextRequest } from 'next/server'
import { writeFile, mkdir, access } from 'fs/promises'
import { existsSync, constants } from 'fs'
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

  console.log('[上传] 开始上传, userId:', userId.toString())
  console.log('[上传] UPLOADS_ROOT:', UPLOADS_ROOT)
  console.log('[上传] process.cwd():', process.cwd())

  let formData: FormData
  try {
    formData = await req.formData()
  } catch (e) {
    console.error('[上传] 解析 formData 失败:', e)
    return fail(ErrorCode.BAD_REQUEST, '请求格式错误')
  }

  const file = formData.get('file') as File | null
  if (!file) return fail(ErrorCode.BAD_REQUEST, '请选择文件')
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return fail(ErrorCode.INVALID_FILE_TYPE, '不支持的文件类型')
  if (file.size > MAX_FILE_SIZE) return fail(ErrorCode.FILE_TOO_LARGE, '文件超过10MB')

  console.log('[上传] 文件信息:', { name: file.name, size: file.size, type: file.type })

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

  console.log('[上传] 存储路径:', { storeDir, origPath, thumbPath })

  // 创建目录
  if (!existsSync(storeDir)) {
    console.log('[上传] 创建目录:', storeDir)
    await mkdir(storeDir, { recursive: true })
  }

  // 写入原图
  try {
    await writeFile(origPath, buffer)
    console.log('[上传] writeFile 完成:', origPath)
  } catch (e) {
    console.error('[上传] 原图写入失败:', e)
    return fail(ErrorCode.UPLOAD_FAILED, '文件写入磁盘失败')
  }

  // 验证文件是否真实写入
  try {
    await access(origPath, constants.F_OK)
    console.log('[上传] 文件验证通过:', origPath)
  } catch (e) {
    console.error('[上传] 文件验证失败，文件未写入磁盘:', origPath, e)
    return fail(ErrorCode.UPLOAD_FAILED, '文件写入磁盘后验证失败')
  }

  let origUrl = `${baseUrl}/uploads/images/${bizType}/${dateStr}/${origFileName}`
  let thumbUrl: string | null = null

  if (mode === 'thumbnail' || mode === 'both') {
    try {
      const sharp = (await import('sharp')).default
      const thumbBuffer = await sharp(buffer).resize(300, 300, { fit: 'cover', position: 'center' }).jpeg({ quality: 80 }).toBuffer()
      console.log('[上传] 缩略图生成完成, size:', thumbBuffer.length)
      await writeFile(thumbPath, thumbBuffer)
      console.log('[上传] 缩略图写入完成:', thumbPath)
      // 验证缩略图
      await access(thumbPath, constants.F_OK)
      console.log('[上传] 缩略图验证通过')
      thumbUrl = `${baseUrl}/uploads/images/${bizType}/${dateStr}/${thumbFileName}`
    } catch (e) {
      console.error('[上传] 缩略图处理失败:', e)
      if (mode === 'thumbnail') { thumbUrl = origUrl; origUrl = `${baseUrl}/uploads/images/${bizType}/${dateStr}/${origFileName}` }
    }
  }

  if (mode === 'thumbnail') { thumbUrl = thumbUrl || origUrl; origUrl = '' }

  try {
    const fileId = crypto.randomBytes(8).toString('hex')
    console.log('[上传] 写入数据库, fileId:', fileId)
    const record = await prisma.fileUpload.create({
      data: { fileId, userId: BigInt(userId), fileName: file.name, fileSize: file.size, mimeType: file.type, fileType: 'image', storage: 'local', origUrl, thumbUrl, md5Hash: hash },
    })
    console.log('[上传] 成功:', { fileId: record.fileId, origUrl: record.origUrl })
    return ok({ fileId: record.fileId, fileName: record.fileName, fileSize: record.fileSize, mimeType: record.mimeType, origUrl: record.origUrl, thumbUrl: record.thumbUrl }, '上传成功')
  } catch (e) {
    console.error('[上传] 数据库记录保存失败:', e)
    return fail(ErrorCode.UPLOAD_FAILED, '上传记录保存失败')
  }
}


