import { getRelationshipDetail, deleteRelationship } from '../../services/relationship'
import { getBreakSessionList, deleteBreakSession, type BreakSessionInfo } from '../../services/breakSession'

Component({
  data: {
    relId: '',
    // 关系信息
    nickname: '',
    avatarUrl: '' as string | null,
    relType: '',
    relTypeLabel: '',
    _relTypeEmoji: '',
    _relTypeLabel: '',
    startDate: '',
    endDate: '' as string | null,
    relStatus: '',
    relStatusLabel: '',
    breakDays: 0,
    breakTargetDays: 0,
    note: '' as string | null,
    _durationText: '',
    _avatarChar: '',
    _displayImages: [] as Array<{ fileId: string; origUrl: string; thumbUrl: string | null }>,
    _imageMore: 0,
    imageList: [] as Array<{ fileId: string; origUrl: string; thumbUrl: string | null }>,
    // 断联期列表
    sessions: [] as BreakSessionInfo[],
    loading: false,
    // 统计
    totalSessions: 0,
    activeSessions: 0,
    totalRecords: 0,
  },

  methods: {
    /** 格式化持续天数 */
    formatDuration(startDate: string, endDate?: string | null): string {
      if (!startDate) return ''
      const start = new Date(startDate.replace(/-/g, '/'))
      const end = endDate ? new Date(endDate.replace(/-/g, '/')) : new Date()
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return ''
      let years = end.getFullYear() - start.getFullYear()
      let months = end.getMonth() - start.getMonth()
      let days = end.getDate() - start.getDate()
      if (days < 0) { months--; const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); days += prevMonth.getDate() }
      if (months < 0) { years--; months += 12 }
      const parts: string[] = []
      if (years > 0) parts.push(`${years}年`)
      if (months > 0) parts.push(`${months}月`)
      parts.push(`${String(days).padStart(2, '0')}天`)
      return parts.join('')
    },

    /** 加载关系信息 */
    async loadRelation() {
      try {
        const res = await getRelationshipDetail(this.data.relId)
        if (res.code === 0) {
          const d = res.data
          const statusMap: Record<string, string> = {
            active: '进行中', done: '已结束', paused: '暂停中', unknown: '不知道',
          }
          const typeMap: Record<string, string> = {
            first_love: '初恋', ex: '前任', crush: '暗恋',
            situationship: '暧昧对象', blind_date: '相亲对象', other: '其他',
          }
          const typeEmojiMap: Record<string, string> = {
            first_love: '💕', ex: '💔', crush: '💌',
            situationship: '🤔', blind_date: '🍵', other: '📌',
          }
          const imageList = d.imageList || []
          const displayImages = imageList.slice(0, 3)
          const imageMore = imageList.length > 3 ? imageList.length - 3 : 0
          this.setData({
            nickname: d.nickname,
            avatarUrl: d.avatarUrl,
            relType: d.relType,
            relTypeLabel: typeMap[d.relType] || d.relType,
            _relTypeEmoji: typeEmojiMap[d.relType] || '📌',
            _relTypeLabel: typeMap[d.relType] || d.relType,
            startDate: d.startDate,
            endDate: d.endDate,
            relStatus: d.relStatus,
            relStatusLabel: statusMap[d.relStatus] || d.relStatus,
            breakDays: d.breakDays,
            breakTargetDays: d.breakTargetDays,
            note: d.note,
            _durationText: this.formatDuration(d.startDate, d.endDate),
            _avatarChar: (d.nickname || '').trim().charAt(0) || '?',
            _displayImages: displayImages,
            _imageMore: imageMore,
            imageList: imageList,
          })
        }
      } catch (e) {
        console.error('[断联列表] 加载关系失败:', e)
      }
    },

    /** 加载断联期列表 */
    async loadSessions() {
      this.setData({ loading: true })
      try {
        const res = await getBreakSessionList({ relId: this.data.relId })
        if (res.code === 0) {
          const sessions = res.data
          let totalRecords = 0
          let activeSessions = 0
          sessions.forEach(s => {
            totalRecords += s.recordCount
            if (s.status === 'active') activeSessions++
          })
          this.setData({
            sessions,
            totalSessions: sessions.length,
            activeSessions,
            totalRecords,
          })
        }
      } catch (e) {
        console.error('[断联列表] 加载失败:', e)
      } finally {
        this.setData({ loading: false })
      }
    },

    /** 查看某段断联期的打卡记录 */
    onViewSessionRecords(e: WechatMiniprogram.TouchEvent) {
      const sessionId = e.currentTarget.dataset.sessionId as string
      wx.navigateTo({
        url: `/pages/records/list?id=${this.data.relId}&sessionId=${sessionId}`,
      })
    },

    /** 新增断联期 - 跳转到分步创建页面 */
    onNewBreakSession() {
      wx.navigateTo({
        url: `/pages/break-sessions/create/index?id=${this.data.relId}`,
      })
    },

    /** 删除断联期 */
    onDeleteSession(e: WechatMiniprogram.TouchEvent) {
      const sessionId = e.currentTarget.dataset.sessionId as string
      const session = this.data.sessions.find(s => s.sessionId === sessionId)
      if (!session) return
      const that = this
      wx.showModal({
        title: '删除断联期',
        content: `确定要删除这段断联期（${session.startDate} ~ ${session.endDate || '至今'}）吗？其下的 ${session.recordCount} 条打卡记录也将被删除。`,
        confirmText: '删除',
        confirmColor: '#FF3B30',
        success: async (res) => {
          if (!res.confirm) return
          try {
            wx.showLoading({ title: '删除中...' })
            const result = await deleteBreakSession(sessionId)
            if (result.code === 0) {
              wx.showToast({ title: '已删除', icon: 'success' })
              that.loadSessions()
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' })
            }
          } catch (e) {
            wx.showToast({ title: (e as Error).message || '网络错误', icon: 'none' })
          } finally {
            wx.hideLoading()
          }
        },
      })
    },

    /** 修改感情 - 跳转到编辑页面 */
    onEditRelation() {
      wx.navigateTo({ url: `/pages/relationships/edit?id=${this.data.relId}` })
    },

    /** 删除感情 */
    onDeleteRelation() {
      const that = this
      wx.showModal({
        title: '删除感情',
        content: `确定要删除「${this.data.nickname}」的感情档案吗？相关的断联期和打卡记录也将被删除。`,
        confirmText: '删除',
        confirmColor: '#FF3B30',
        success: async (res) => {
          if (!res.confirm) return
          try {
            wx.showLoading({ title: '删除中...' })
            const result = await deleteRelationship(this.data.relId)
            if (result.code === 0) {
              wx.showToast({ title: '已删除', icon: 'success' })
              wx.navigateBack()
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' })
            }
          } catch (e) {
            wx.showToast({ title: (e as Error).message || '网络错误', icon: 'none' })
          } finally {
            wx.hideLoading()
          }
        },
      })
    },

    /** 返回上一页 */
    onBack() {
      wx.navigateBack()
    },
  },

  properties: {
    id: { type: String, value: '' },
  },

  lifetimes: {
    attached() {
      const id = this.data.id || ''
      if (id) {
        this.setData({ relId: id })
        this.loadRelation()
        this.loadSessions()
      }
    },
  },

  pageLifetimes: {
    show() {
      const id = this.data.id || ''
      if (id && this.data.relId) {
        this.loadSessions()
      }
    },
  },
})
