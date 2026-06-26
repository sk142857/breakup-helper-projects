// pages/records/edit.ts
Component({
  data: {
    step: 0,
    steps: ['关联信息', '此刻心情', '断联状态', '心情记录'],
    relationName: '',
    recordDate: '',
    today: '',
    mood: '',
    moodOptions: [
      { value: 'cry', label: '难过', emoji: '😭' },
      { value: 'sad', label: '伤心', emoji: '😢' },
      { value: 'meh', label: '一般', emoji: '😐' },
      { value: 'ok', label: 'OK', emoji: '🙂' },
      { value: 'happy', label: '开心', emoji: '😊' },
      { value: 'free', label: '解放', emoji: '😄' },
      { value: 'strong', label: '坚定', emoji: '💪' },
      { value: 'heartbreak', label: '心碎', emoji: '💔' }
    ],
    breakStatus: '',
    statusOptions: [
      { value: 'keeping', label: '保持断联中', icon: 'check-circle', color: '#34C759' },
      { value: 'almost', label: '差点破功（忍住了）', icon: 'error-circle', color: '#FF9500' },
      { value: 'broken', label: '破功了（已联系）', icon: 'close-circle', color: '#FF3B30' },
      { value: 'contacted', label: '对方联系我了', icon: 'chat', color: '#5B8DEF' }
    ],
    content: '',
    images: [] as string[],
    slots: [0, 1, 2, 3, 4, 5]
  },
  methods: {
    onPrevStep() {
      if (this.data.step > 0) this.setData({ step: this.data.step - 1 });
    },
    onNextStep() {
      // Step 0: 日期必选
      if (this.data.step === 0 && !this.data.recordDate) {
        wx.showToast({ title: '请选择记录日期', icon: 'none' });
        return;
      }
      // Step 1: 心情必选
      if (this.data.step === 1 && !this.data.mood) {
        wx.showToast({ title: '请选择此刻心情', icon: 'none' });
        return;
      }
      // Step 2: 状态必选
      if (this.data.step === 2 && !this.data.breakStatus) {
        wx.showToast({ title: '请选择断联状态', icon: 'none' });
        return;
      }
      if (this.data.step < this.data.steps.length - 1) {
        this.setData({ step: this.data.step + 1 });
      }
    },
    onSelectRelation() {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    },
    onRecordDateChange(e: WechatMiniprogram.PickerChange) {
      this.setData({ recordDate: e.detail.value as string });
    },
    onSelectMood(e: WechatMiniprogram.TouchEvent) {
      this.setData({ mood: e.currentTarget.dataset.mood });
    },
    onSelectStatus(e: WechatMiniprogram.TouchEvent) {
      this.setData({ breakStatus: e.currentTarget.dataset.status });
    },
    onContentChange(e: WechatMiniprogram.CustomEvent) {
      this.setData({ content: e.detail.value });
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
      if (!this.data.recordDate) { wx.showToast({ title: '请选择记录日期', icon: 'none' }); return; }
      if (!this.data.mood) { wx.showToast({ title: '请选择此刻心情', icon: 'none' }); return; }
      if (!this.data.breakStatus) { wx.showToast({ title: '请选择断联状态', icon: 'none' }); return; }
      wx.showToast({ title: '记录已保存', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1200);
    }
  },
  lifetimes: {
    attached() {
      const d = new Date();
      const today = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
      this.setData({ today, recordDate: today });
    }
  }
});
