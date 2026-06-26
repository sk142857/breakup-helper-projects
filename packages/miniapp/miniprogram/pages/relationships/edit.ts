// pages/relationships/edit.ts
Component({
  data: {
    step: 0,
    steps: ['头像昵称', '关系类型', '日期设置', '当前状态', '备注图片'],
    avatarUrl: '',
    name: '',
    typeValue: '',
    typeOptions: [
      { value: 'first_love', label: '初恋', emoji: '💕' },
      { value: 'ex', label: '前任', emoji: '💔' },
      { value: 'crush', label: '暗恋', emoji: '💌' },
      { value: 'situationship', label: '暧昧对象', emoji: '🤔' },
      { value: 'blind_date', label: '相亲对象', emoji: '🍵' },
      { value: 'other', label: '其他', emoji: '📌' }
    ],
    startDate: '',
    endDate: '',
    goalDays: 0,
    goalDaysText: '',
    today: '',
    status: 'active',
    statusOptions: [
      { value: 'active', label: '进行中', emoji: '🔥', desc: '断联进行中' },
      { value: 'done', label: '已结束', emoji: '✅', desc: '断联已结束' },
      { value: 'paused', label: '暂停中', emoji: '⏸️', desc: '暂时搁置' },
      { value: 'unknown', label: '不知道', emoji: '🤷', desc: '不太确定' }
    ],
    note: '',
    images: [] as string[],
    slots: [0, 1, 2, 3, 4, 5]
  },
  methods: {
    onPrevStep() {
      if (this.data.step > 0) this.setData({ step: this.data.step - 1 });
    },
    onNextStep() {
      // Step 0: 昵称必填
      if (this.data.step === 0 && !this.data.name.trim()) {
        wx.showToast({ title: '请填写昵称', icon: 'none' });
        return;
      }
      // Step 1: 关系类型必选
      if (this.data.step === 1 && !this.data.typeValue) {
        wx.showToast({ title: '请选择关系类型', icon: 'none' });
        return;
      }
      // Step 2: 开始日期必填，结束日期不能早于开始日期
      if (this.data.step === 2) {
        if (!this.data.startDate) {
          wx.showToast({ title: '请选择开始日期', icon: 'none' });
          return;
        }
        if (this.data.endDate && this.data.endDate < this.data.startDate) {
          wx.showToast({ title: '结束日期不能早于开始日期', icon: 'none' });
          return;
        }
      }
      if (this.data.step < this.data.steps.length - 1) {
        this.setData({ step: this.data.step + 1 });
      }
    },
    onNameChange(e: WechatMiniprogram.CustomEvent) {
      this.setData({ name: e.detail.value });
    },
    onChooseAvatar() {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        success: (res) => {
          wx.cropImage({
            src: res.tempFiles[0].tempFilePath,
            cropScale: '1:1',
            success: (crop) => {
              this.setData({ avatarUrl: crop.tempFilePath });
            }
          });
        }
      });
    },
    onSelectType(e: WechatMiniprogram.TouchEvent) {
      this.setData({ typeValue: e.currentTarget.dataset.value });
    },
    onSelectStatus(e: WechatMiniprogram.TouchEvent) {
      this.setData({ status: e.currentTarget.dataset.value });
    },
    onStartDateChange(e: WechatMiniprogram.PickerChange) {
      const val = e.detail.value as string;
      this.setData({ startDate: val, endDate: this.data.endDate && this.data.endDate < val ? '' : this.data.endDate }, () => this.calcGoalDays());
    },
    onEndDateChange(e: WechatMiniprogram.PickerChange) {
      this.setData({ endDate: e.detail.value as string }, () => this.calcGoalDays());
    },
    calcGoalDays() {
      const { startDate, endDate } = this.data;
      if (!startDate) {
        this.setData({ goalDays: 0, goalDaysText: '' });
        return;
      }
      const start = new Date(startDate.replace(/-/g, '/'));
      const end = endDate ? new Date(endDate.replace(/-/g, '/')) : new Date();
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
      const diff = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000));
      this.setData({ goalDays: diff, goalDaysText: String(diff) });
    },
    onNoteChange(e: WechatMiniprogram.CustomEvent) {
      this.setData({ note: e.detail.value });
    },
    onChooseImage(e: WechatMiniprogram.TouchEvent) {
      const idx = Number(e.currentTarget.dataset.index);
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        success: (res) => {
          const images = [...this.data.images];
          images[idx] = res.tempFiles[0].tempFilePath;
          this.setData({ images });
        }
      });
    },
    onDelImage(e: WechatMiniprogram.TouchEvent) {
      const idx = Number(e.currentTarget.dataset.index);
      const images = [...this.data.images];
      images[idx] = '';
      this.setData({ images });
    },
    onSave() {
      if (!this.data.name.trim()) { wx.showToast({ title: '请填写昵称', icon: 'none' }); return; }
      if (!this.data.typeValue) { wx.showToast({ title: '请选择关系类型', icon: 'none' }); return; }
      if (!this.data.startDate) { wx.showToast({ title: '请选择开始日期', icon: 'none' }); return; }
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1200);
    }
  },
  lifetimes: {
    attached() {
      const d = new Date();
      const today = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
      this.setData({ today });
    }
  }
});
