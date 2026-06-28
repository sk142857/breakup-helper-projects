import { getRelationshipDetail } from '../../services/relationship'
import { getBreakSessionList, deleteBreakSession, type BreakSessionInfo } from '../../services/breakSession'

Component({
  data: {
    relId: '',
    // 关系信息
    nickname: '',
    avatarUrl: '' as string | null,
    relTypeLabel: '',
    startDate: '',
    endDate: '' as string | null,
    relStatus: '',
    relStatusLabel: '',
    // 断联期列表
    sessions: [] as BreakSessionInfo[],
    loading: false,
    // 统计
    totalSessions: 0,
    activeSessions: 0,
    totalRecords: 0,
  },

  methods: {
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
          this.setData({
            nickname: d.nickname,
            avatarUrl: d.avatarUrl,
            relTypeLabel: typeMap[d.relType] || d.relType,
            startDate: d.startDate,
            endDate: d.endDate,
            relStatus: d.relStatus,
            relStatusLabel: statusMap[d.relStatus] || d.relStatus,
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
