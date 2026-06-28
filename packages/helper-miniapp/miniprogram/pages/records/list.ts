import { getRecordList, deleteRecord, type RecordInfo } from '../../services/record'

Component({
  data: {
    relId: '',
    sessionId: '',
    records: [] as RecordInfo[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 50,
  },
  methods: {
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
          this.setData({
            records: res.data.list,
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
