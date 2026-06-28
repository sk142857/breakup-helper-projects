import { getRelationshipDetail, deleteRelationship } from '../../services/relationship'
import { getRecordList, deleteRecord, type RecordInfo } from '../../services/record'
import { getBreakSessionList, createBreakSession, updateBreakSession, type BreakSessionInfo } from '../../services/breakSession'

Component({
  data: {
    relId: '',
    // 关系详情
    nickname: '',
    avatarUrl: '' as string | null,
    relType: '',
    relTypeLabel: '',
    startDate: '',
    endDate: '' as string | null,
    breakTargetDays: 0,
    relStatus: '',
    relStatusLabel: '',
    note: '' as string | null,
    images: [] as string[],
    // 断联期
    sessions: [] as BreakSessionInfo[],
    currentSessionId: '' as string,
    currentSession: null as BreakSessionInfo | null,
    // 统计（基于当前选中的断联期）
    breakDays: 0,
    totalRecords: 0,
    // 时间线记录
    records: [] as RecordInfo[],
    loading: false,
    sessionListVisible: false,
  },
  methods: {
    onViewAllRecords() {
      if (!this.data.currentSessionId) return
      wx.navigateTo({
        url: `/pages/records/list?id=${this.data.relId}&sessionId=${this.data.currentSessionId}`,
      })
    },
    onAddRecord() {
      if (!this.data.currentSessionId) {
        wx.showToast({ title: '请先创建一个断联期', icon: 'none' })
        return
      }
      wx.navigateTo({
        url: `/pages/records/checkin?id=${this.data.relId}&sessionId=${this.data.currentSessionId}`,
      })
    },
    onEdit() {
      wx.navigateTo({ url: `/pages/relationships/edit?id=${this.data.relId}` })
    },

    /** 切换断联期 */
    onSwitchSession(e: WechatMiniprogram.TouchEvent) {
      const sessionId = e.currentTarget.dataset.sessionId as string
      this.setData({
        currentSessionId: sessionId,
        sessionListVisible: false,
      })
      this.loadRecords()
      this.updateSessionStats()
    },

    /** 显示/隐藏断联期列表 */
    onToggleSessionList() {
      this.setData({ sessionListVisible: !this.data.sessionListVisible })
    },

    /** 新建断联期（新增分手） */
    async onNewBreakSession() {
      const that = this
      wx.showModal({
        title: '新增分手',
        content: '确定要开始一段新的断联期吗？之前的打卡记录将归属于上一段断联期。',
        confirmText: '开始',
        confirmColor: '#f6685d',
        success: async (res) => {
          if (!res.confirm) return
          try {
            wx.showLoading({ title: '创建中...' })
            const today = new Date().toISOString().split('T')[0]
            const result = await createBreakSession({
              relId: that.data.relId,
              startDate: today,
              targetDays: that.data.breakTargetDays || 100,
            })
            if (result.code === 0) {
              wx.showToast({ title: '已开始新的断联期', icon: 'success' })
              await that.loadSessions()
              that.setData({ currentSessionId: result.data.sessionId })
              that.loadRecords()
              that.updateSessionStats()
            } else {
              wx.showToast({ title: result.message || '创建失败', icon: 'none' })
            }
          } catch (e) {
            wx.showToast({ title: (e as Error).message || '网络错误', icon: 'none' })
          } finally {
            wx.hideLoading()
          }
        },
      })
    },

    /** 结束当前断联期 */
    async onEndSession() {
      const that = this
      wx.showModal({
        title: '结束断联期',
        content: '确定要结束这段断联期吗？之后将不能再为此断联期打卡。',
        confirmText: '结束',
        confirmColor: '#f6685d',
        success: async (res) => {
          if (!res.confirm) return
          try {
            wx.showLoading({ title: '处理中...' })
            const today = new Date().toISOString().split('T')[0]
            const result = await updateBreakSession(that.data.currentSessionId, {
              endDate: today,
              status: 'done',
            })
            if (result.code === 0) {
              wx.showToast({ title: '已结束', icon: 'success' })
              await that.loadSessions()
              that.updateSessionStats()
            } else {
              wx.showToast({ title: result.message || '操作失败', icon: 'none' })
            }
          } catch (e) {
            wx.showToast({ title: (e as Error).message || '网络错误', icon: 'none' })
          } finally {
            wx.hideLoading()
          }
        },
      })
    },

    confirmDelete() {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除「${this.data.nickname}」的感情记录吗？相关的断联记录也会一并删除。`,
        confirmText: '删除',
        confirmColor: '#FF3B30',
        success: async (res) => {
          if (!res.confirm) return;
          try {
            wx.showLoading({ title: '删除中...' });
            const result = await deleteRelationship(this.data.relId);
            if (result.code === 0) {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 1200);
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' });
            }
          } catch (e) {
            console.error('[删除] 失败:', e);
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        },
      });
    },
    /** 更新当前断联期的统计 */
    updateSessionStats() {
      const sessions = this.data.sessions
      const currentSessionId = this.data.currentSessionId
      const session = sessions.find(s => s.sessionId === currentSessionId) || null
      this.setData({
        currentSession: session,
        breakDays: session?.recordCount || 0,
        breakTargetDays: session?.targetDays || 100,
      })
    },

    /** 加载断联期列表 */
    async loadSessions() {
      try {
        const res = await getBreakSessionList({ relId: this.data.relId })
        if (res.code === 0) {
          const sessions = res.data
          let currentSessionId = this.data.currentSessionId
          if (!currentSessionId || !sessions.find(s => s.sessionId === currentSessionId)) {
            const activeSession = sessions.find(s => s.status === 'active')
            currentSessionId = activeSession?.sessionId || sessions[0]?.sessionId || ''
          }
          this.setData({ sessions, currentSessionId })
          this.updateSessionStats()
        }
      } catch (e) {
        console.error('[断联期] 加载失败:', e)
      }
    },

    async loadDetail() {
      this.setData({ loading: true })
      try {
        const res = await getRelationshipDetail(this.data.relId)
        if (res.code === 0) {
          const d = res.data
          const typeMap: Record<string, string> = {
            first_love: '初恋', ex: '前任', crush: '暗恋',
            situationship: '暧昧对象', blind_date: '相亲对象', other: '其他',
          }
          const statusMap: Record<string, string> = {
            active: '进行中', done: '已结束', paused: '暂停中', unknown: '不知道',
          }
          this.setData({
            nickname: d.nickname,
            avatarUrl: d.avatarUrl,
            relType: d.relType,
            relTypeLabel: typeMap[d.relType] || d.relType,
            startDate: d.startDate,
            endDate: d.endDate,
            breakTargetDays: d.breakTargetDays,
            relStatus: d.relStatus,
            relStatusLabel: statusMap[d.relStatus] || d.relStatus,
            note: d.note,
            images: d.images || [],
          })

          if (d.breakSessions && d.breakSessions.length > 0) {
            const sessions = d.breakSessions as BreakSessionInfo[]
            const activeSession = sessions.find(s => s.status === 'active')
            const currentSessionId = activeSession?.sessionId || sessions[0].sessionId
            this.setData({ sessions, currentSessionId })
            this.updateSessionStats()
          }
        }
      } catch (e) {
        console.error('[关系详情] 加载失败:', e)
      } finally {
        this.setData({ loading: false })
      }
    },

    async loadRecords() {
      if (!this.data.currentSessionId) return
      try {
        const res = await getRecordList({
          relId: this.data.relId,
          sessionId: this.data.currentSessionId,
          page: 1,
          size: 10,
        })
        if (res.code === 0) {
          this.setData({
            records: res.data.list,
            totalRecords: res.data.total,
          })
        }
      } catch (e) {
        console.error('[关系详情] 加载记录失败:', e)
      }
    },
    onDeleteRecord(e: WechatMiniprogram.TouchEvent) {
      const recordId = Number(e.currentTarget.dataset.id);
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这条断联记录吗？',
        confirmText: '删除',
        confirmColor: '#FF3B30',
        success: async (res) => {
          if (!res.confirm) return;
          try {
            wx.showLoading({ title: '删除中...' });
            const result = await deleteRecord(recordId);
            if (result.code === 0) {
              wx.showToast({ title: '已删除', icon: 'success' })
              this.loadRecords()
              this.loadSessions()
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' });
            }
          } catch (e) {
            wx.showToast({ title: (e as Error).message || '网络错误', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        },
      });
    },
  },
  /**
   * 接收页面路由参数（Component 作为页面时，URL 查询参数自动映射到 properties）
   */
  properties: {
    id: { type: String, value: '' },
  },

  lifetimes: {
    attached() {
      const id = this.data.id || '';
      if (id) {
        this.setData({ relId: id });
        this.loadDetail();
        this.loadRecords();
      }
    },
  },

  /**
   * 从编辑页返回时重新加载数据
   */
  pageLifetimes: {
    show() {
      const id = this.data.id || '';
      if (id && this.data.relId) {
        this.loadDetail();
        this.loadRecords();
      }
    },
  },
});
