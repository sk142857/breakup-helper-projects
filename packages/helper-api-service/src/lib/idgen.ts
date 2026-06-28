import { randomBytes } from 'crypto'

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

/**
 * 生成 6 位随机字母数字字符串（小写字母+数字）
 * 用于感情关系主键等场景
 */
export function generateRelId(): string {
  const bytes = randomBytes(6)
  let id = ''
  for (let i = 0; i < 6; i++) {
    id += CHARS[bytes[i] % 36]
  }
  return id
}
