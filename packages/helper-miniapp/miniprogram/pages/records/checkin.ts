import { createRecord } from '../../services/record'
import { getRelationshipDetail } from '../../services/relationship'
import { uploadFile } from '../../utils/request'

Component({
  data: {
    relId: '',
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
    /** 用于 WXML 预览的图片 URL（与 images 下标对齐） */
    imageUrls: [] as string[],
    slots: [0, 1, 2, 3, 4, 5],
    years: [] as number[],
    months: [] as number[],
    days: [] as number[],
    dateIndex: [0, 0, 0],
    saving: false,
  },
  methods: {
    onPrevStep() {
      if (this.data.step > 0) this.setData({ step: this.data.step - 1 });
    },
    onNextStep() {
      if (this.data.step === 0 && !this.data.recordDate) {
        wx.showToast({ title: '请选择记录日期', icon: 'none' });
        return;
      }
      if (this.data.step === 1 && !this.data.mood) {
        wx.showToast({ title: '请选择此刻心情', icon: 'none' });
        return;
      }
      if (this.data.step === 2 && !this.data.breakStatus) {
        wx.showToast({ title: '请选择断联状态', icon: 'none' });
        return;
      }
      if (this.data.step < this.data.steps.length - 1) {
        this.setData({ step: this.data.step + 1 });
      }
    },
    onSelectRelation() {
      // 只读，无需操作
    },
    onRecordDateChange(e: WechatMiniprogram.PickerChange) {
      this.setData({ recordDate: e.detail.value as string });
    },

    onDateChange(e: WechatMiniprogram.CustomEvent) {
      const value = e.detail.value as number[];
      const year = this.data.years[value[0]];
      const month = String(this.data.months[value[1]]).padStart(2, '0');
      const day = String(this.data.days[value[2]]).padStart(2, '0');
      this.setData({ recordDate: `${year}-${month}-${day}` });
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
      const that = this;
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        success: async (res) => {
          wx.showLoading({ title: '上传中...' });
          try {
            const upRes = await uploadFile(res.tempFiles[0].tempFilePath, 'both', 'record');
            if (upRes.code === 0) {
              const images = [...that.data.images];
              const imageUrls = [...that.data.imageUrls];
              images[idx] = upRes.data.fileId;
              imageUrls[idx] = upRes.data.thumbUrl || upRes.data.origUrl;
              that.setData({ images, imageUrls });
            } else {
              wx.showToast({ title: upRes.message || '上传失败', icon: 'none' });
            }
          } catch (e) {
            wx.showToast({ title: (e as Error).message || '上传失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      });
    },
    onDelImage(e: WechatMiniprogram.TouchEvent) {
      const idx = Number(e.currentTarget.dataset.index);
      const images = [...this.data.images];
      const imageUrls = [...this.data.imageUrls];
      images[idx] = '';
      imageUrls[idx] = '';
      this.setData({ images, imageUrls });
    },
    async loadRelationName(id: string) {
      try {
        const res = await getRelationshipDetail(id);
        if (res.code === 0) {
          this.setData({ relationName: res.data.nickname });
        }
      } catch (e) {
        console.error('[打卡] 加载关系名称失败:', e);
        this.setData({ relationName: '未知' });
      }
    },
    async onSave() {
      if (!this.data.recordDate) { wx.showToast({ title: '请选择记录日期', icon: 'none' }); return; }
      if (!this.data.mood) { wx.showToast({ title: '请选择此刻心情', icon: 'none' }); return; }
      if (!this.data.breakStatus) { wx.showToast({ title: '请选择断联状态', icon: 'none' }); return; }
      if (this.data.saving) return;

      this.setData({ saving: true });
      wx.showLoading({ title: '提交中...' });

      try {
        // 图片在选择时已上传，直接取 fileId
        const imageIds = this.data.images.filter(Boolean);

        const payload = {
          relId: this.data.relId,
          sessionId: this.data.sessionId || undefined,
          recordDate: this.data.recordDate,
          recMood: this.data.mood,
          recBkStatus: this.data.breakStatus,
          content: this.data.content || undefined,
          images: imageIds.length > 0 ? imageIds : undefined,
        };

        const res = await createRecord(payload);
        if (res.code === 0) {
          wx.showToast({ title: '记录已保存', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1200);
        } else {
          wx.showToast({ title: res.message || '保存失败', icon: 'none' });
        }
      } catch (e) {
        wx.showToast({ title: (e as Error).message || '网络错误，请重试', icon: 'none' });
      } finally {
        this.setData({ saving: false });
        wx.hideLoading();
      }
    }
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
      const id = this.data.id || '';

      const d = new Date();
      const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
      const today = [y, String(m).padStart(2, '0'), String(day).padStart(2, '0')].join('-');

      // 生成 picker-view 数据
      const years: number[] = [];
      for (let i = y - 5; i <= y; i++) years.push(i);
      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const days: number[] = [];
      for (let i = 1; i <= 31; i++) days.push(i);

      const dateIndex = [years.length - 1, m - 1, day - 1];

      this.setData({ relId: id, years, months, days, today, recordDate: today, dateIndex });

      // 根据传入的 id 加载关联名称
      if (id) this.loadRelationName(id);
    }
  }
});
