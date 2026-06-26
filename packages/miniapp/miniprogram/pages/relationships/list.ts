// pages/relationships/list.ts
Component({
  data: {
    filterTab: 'all' // all | active | done
  },
  methods: {
    onFilter(e: WechatMiniprogram.TouchEvent) {
      const tab = e.currentTarget.dataset.tab;
      this.setData({ filterTab: tab });
    },
    onTapItem(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: `/pages/relationships/detail?id=${id}` });
    },
    onAdd() {
      wx.navigateTo({ url: '/pages/relationships/edit' });
    }
  }
});
