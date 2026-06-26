// pages/dashboard/dashboard.ts
Component({
  data: {
    // 静态数据，后续对接后端
  },
  methods: {
    onTapCard(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: `/pages/relationships/detail?id=${id}` });
    },
    onAddRelationship() {
      wx.navigateTo({ url: '/pages/relationships/edit' });
    },
  }
});
