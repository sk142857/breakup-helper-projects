// ============ 文件上传类型 ============

/** 上传模式 */
export type UploadMode = 'thumbnail' | 'original' | 'both'

/** 上传响应 */
export interface UploadResult {
  fileId: string
  fileName: string
  fileSize: number
  mimeType: string
  origUrl: string
  thumbUrl: string | null
}

/** 已关联图片信息（用于感情/记录等模块展示） */
export interface ImageInfo {
  fileId: string
  origUrl: string
  thumbUrl: string | null
}
