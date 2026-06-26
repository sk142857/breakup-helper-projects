import { z } from 'zod'

// ============ User Schemas ============
// 这些 Zod schema 同时用于: server 参数校验 / admin 表单校验 / miniapp 表单校验

export const UserCreateSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最多50字'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  avatar: z.string().url().optional().or(z.literal('')),
})

export const UserUpdateSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
})

export const UserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  keyword: z.string().optional(),
  status: z.enum(['active', 'disabled']).optional(),
})

export type UserCreate = z.infer<typeof UserCreateSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type UserQuery = z.infer<typeof UserQuerySchema>
