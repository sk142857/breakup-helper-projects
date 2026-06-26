// pages/records/checkin.ts
Component({
  data: {
    id: '',
    name: '',
    day: 0,
    target: 100,
    selectedMood: '',
    note: '',
    checkedToday: false,
    // 静态数据，后续对接后端
  },

  lifetimes: {
    attached() {
      // 从 onLoad 参数获取关系 ID，后续对接后端查询
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      const options = (current as any).options || {};
      const id = options.id || '1';
      this.setData({ id });
      // TODO: 从后端加载数据
      this.loadMockData(id);
    }
  },

  methods: {
    loadMockData(id: string) {
      // 模拟数据，后续对接后端
      if (id === '1') {
        this.setData({ name: '张三', day: 89, target: 100 });
      } else if (id === '2') {
        this.setData({ name: '李四', day: 38, target: 90 });
      }
    },

    onSelectMood(e: WechatMiniprogram.TouchEvent) {
      const mood = e.currentTarget.dataset.mood;
      this.setData({
        selectedMood: this.data.selectedMood === mood ? '' : mood
      });
    },

    onNoteChange(e: WechatMiniprogram.CustomEvent) {
      this.setData({ note: e.detail.value });
    },

    onCheckin() {
      if (!this.data.selectedMood) {
        wx.showToast({ title: '请选择今日心情', icon: 'none' });
        return;
      }
      // TODO: 提交到后端
      wx.showToast({ title: '打卡成功！', icon: 'success' });
      this.setData({ checkedToday: true });
    }
  }
});
