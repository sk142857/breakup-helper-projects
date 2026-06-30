import { getRecordList, deleteRecord, type RecordInfo } from '../../services/record'
import { getRelationshipDetail } from '../../services/relationship'

Component({
  data: {
    relId: '',
    sessionId: '',
    // 关系信息（用于顶部档案卡片）
    nickname: '',
    avatarUrl: '' as string | null,
    relType: '',
    _relTypeEmoji: '',
    _relTypeLabel: '',
    startDate: '',
    endDate: '' as string | null,
    _avatarChar: '',
    _durationText: '',
    imageList: [] as Array<{ fileId: string; origUrl: string; thumbUrl: string | null }>,
    // 记录列表
    records: [] as RecordInfo[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 50,
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

    /** 计算记录是断联期的第几天 */
    calcSessionDay(recordDate: string): number {
      const sessionStart = this.data.startDate
      if (!sessionStart) return 0
      const start = new Date(sessionStart.replace(/-/g, '/'))
      const rec = new Date(recordDate.replace(/-/g, '/'))
      if (isNaN(start.getTime()) || isNaN(rec.getTime())) return 0
      return Math.floor((rec.getTime() - start.getTime()) / (86400000)) + 1
    },

    /** 加载感情关系信息（用于头像/昵称/档案卡） */
    async loadRelation() {
      try {
        const res = await getRelationshipDetail(this.data.relId)
        if (res.code === 0) {
          const d = res.data
          const typeEmojiMap: Record<string, string> = {
            first_love: '💕', ex: '💔', crush: '💌',
            situationship: '🤔', blind_date: '🍵', other: '📌',
          }
          const typeMap: Record<string, string> = {
            first_love: '初恋', ex: '前任', crush: '暗恋',
            situationship: '暧昧对象', blind_date: '相亲对象', other: '其他',
          }
          this.setData({
            nickname: d.nickname,
            avatarUrl: d.avatarUrl,
            relType: d.relType,
            _relTypeEmoji: typeEmojiMap[d.relType] || '📌',
            _relTypeLabel: typeMap[d.relType] || d.relType,
            startDate: d.startDate,
            endDate: d.endDate,
            _durationText: this.formatDuration(d.startDate, d.endDate),
            _avatarChar: (d.nickname || '').trim().charAt(0) || '?',
            imageList: d.imageList || [],
          })
        }
      } catch (e) {
        console.error('[记录列表] 加载关系失败:', e)
      }
    },

    onAddRecord() {
      if (this.data.sessionId) {
        wx.navigateTo({ url: `/pages/records/checkin?id=${this.data.relId}&sessionId=${this.data.sessionId}` })
      } else {
        wx.navigateTo({ url: `/pages/records/checkin?id=${this.data.relId}` })
      }
    },
    async loadRecords() {
      this.setData({ loading: true })
      try {
        const params: Record<string, unknown> = { relId: this.data.relId, page: this.data.page, size: this.data.pageSize }
        if (this.data.sessionId) {
          params.sessionId = this.data.sessionId
        }
        const res = await getRecordList(params)
        if (res.code === 0) {
          // 为每条记录预计算展示字段
          const records = (res.data.list || []).map((r: RecordInfo) => {
            const imageList = r.imageList || []
            const displayImages = imageList.slice(0, 3)
            const imageMore = imageList.length > 3 ? imageList.length - 3 : 0
            return {
              ...r,
              _displayImages: displayImages,
              _imageMore: imageMore,
              _sessionDay: this.calcSessionDay(r.recordDate),
            }
          })
          this.setData({
            records,
            total: res.data.total,
          })
        }
      } catch (e) {
        console.error('[记录列表] 加载失败:', e)
      } finally {
        this.setData({ loading: false })
      }
    },
    onDeleteRecord(e: WechatMiniprogram.TouchEvent) {
      const recordId = Number(e.currentTarget.dataset.id)
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这条断联记录吗？',
        confirmText: '删除',
        confirmColor: '#FF3B30',
        success: async (res) => {
          if (!res.confirm) return
          try {
            wx.showLoading({ title: '删除中...' })
            const result = await deleteRecord(recordId)
            if (result.code === 0) {
              wx.showToast({ title: '已删除', icon: 'success' })
              this.loadRecords()
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
    /** 修改记录 - 跳转到打卡页面预填数据（TODO: 未来可加编辑接口） */
    onEditRecord(e: WechatMiniprogram.TouchEvent) {
      const recordId = Number(e.currentTarget.dataset.id)
      wx.showToast({ title: '编辑功能开发中', icon: 'none' })
    },
    /** 返回上一页 */
    onBack() {
      wx.navigateBack()
    },
  },
  /**
   * 接收页面路由参数（Component 作为页面时，URL 查询参数自动映射到 properties）
   */
  properties: {
    id: { type: String, value: '' },
    sessionId: { type: String, value: '' },
  },
  lifetimes: {
    attached() {
      const id = this.data.id || ''
      const sessionId = this.data.sessionId || ''
      if (id) {
        this.setData({ relId: id, sessionId })
        this.loadRelation()
        this.loadRecords()
      }
    },
  },
  pageLifetimes: {
    show() {
      const id = this.data.id || ''
      const sessionId = this.data.sessionId || ''
      if (id) {
        this.setData({ relId: id, sessionId })
        this.loadRecords()
      }
    },
  },
})
