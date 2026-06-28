import { createBreakSession } from '../../../services/breakSession'

const INITIATOR_DICT: Record<string, string> = {
  self: '我分手',
  other: '被分手',
}

Component({
  data: {
    relId: '',
    step: 0,
    steps: ['分手类型', '开始日期', '目标设置', '确认创建'],
    // 分手类型
    initiator: '',
    initiatorLabel: '',
    // 日期
    startDate: '',
    years: [] as number[],
    months: [] as number[],
    days: [] as number[],
    dateIndex: [0, 0, 0],
    // 目标
    targetDays: 100,
    targetPresets: [
      { value: 30, label: '30天' },
      { value: 100, label: '100天' },
      { value: 365, label: '365天' },
      { value: 9999, label: '永久' },
    ],
    note: '',
    // 状态
    saving: false,
  },

  methods: {
    onBack() {
      wx.navigateBack()
    },

    onPrevStep() {
      if (this.data.step > 0) this.setData({ step: this.data.step - 1 })
    },

    onNextStep() {
      if (this.data.step === 0 && !this.data.initiator) {
        wx.showToast({ title: '请选择分手类型', icon: 'none' })
        return
      }
      if (this.data.step === 1 && !this.data.startDate) {
        wx.showToast({ title: '请选择开始日期', icon: 'none' })
        return
      }
      if (this.data.step < this.data.steps.length - 1) {
        this.setData({ step: this.data.step + 1 })
      }
    },

    /** Step 0: 选择分手类型 */
    onSelectInitiator(e: WechatMiniprogram.TouchEvent) {
      const initiator = e.currentTarget.dataset.initiator as string
      this.setData({
        initiator,
        initiatorLabel: INITIATOR_DICT[initiator] || initiator,
      })
    },

    /** Step 1: 日期选择 */
    onDateChange(e: WechatMiniprogram.CustomEvent) {
      const value = e.detail.value as number[]
      const year = this.data.years[value[0]]
      const month = String(this.data.months[value[1]]).padStart(2, '0')
      const day = String(this.data.days[value[2]]).padStart(2, '0')
      this.setData({ startDate: `${year}-${month}-${day}` })
    },

    /** Step 2: 选择目标天数 */
    onSelectTarget(e: WechatMiniprogram.TouchEvent) {
      const value = Number(e.currentTarget.dataset.value)
      this.setData({ targetDays: value })
    },

    /** Step 2: 备注输入 */
    onNoteChange(e: WechatMiniprogram.CustomEvent) {
      this.setData({ note: e.detail.value })
    },

    /** Step 3: 确认创建 */
    async onSave() {
      if (!this.data.initiator) {
        wx.showToast({ title: '请选择分手类型', icon: 'none' })
        return
      }
      if (!this.data.startDate) {
        wx.showToast({ title: '请选择开始日期', icon: 'none' })
        return
      }
      if (this.data.saving) return

      this.setData({ saving: true })
      wx.showLoading({ title: '创建中...' })

      try {
        const result = await createBreakSession({
          relId: this.data.relId,
          startDate: this.data.startDate,
          initiator: this.data.initiator,
          targetDays: this.data.targetDays,
          note: this.data.note || undefined,
        })

        if (result.code === 0) {
          wx.showToast({ title: '断联期已创建', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 1200)
        } else {
          wx.showToast({ title: result.message || '创建失败', icon: 'none' })
        }
      } catch (e) {
        wx.showToast({ title: (e as Error).message || '网络错误', icon: 'none' })
      } finally {
        this.setData({ saving: false })
        wx.hideLoading()
      }
    },
  },

  properties: {
    id: { type: String, value: '' },
  },

  lifetimes: {
    attached() {
      const id = this.data.id || ''
      const d = new Date()
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const day = d.getDate()

      // 生成 picker-view 数据
      const years: number[] = []
      for (let i = y - 5; i <= y; i++) years.push(i)
      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      const daysArr: number[] = []
      for (let i = 1; i <= 31; i++) daysArr.push(i)

      const dateIndex = [years.length - 1, m - 1, day - 1]
      const today = [y, String(m).padStart(2, '0'), String(day).padStart(2, '0')].join('-')

      this.setData({
        relId: id,
        years,
        months,
        days: daysArr,
        dateIndex,
        startDate: today,
      })
    },
  },
})
