// pages/relationships/detail.ts
Component({
  data: {},
  methods: {
    onViewAllRecords() {
      wx.navigateTo({ url: '/pages/records/list?id=1' });
    },
    onAddRecord() {
      wx.navigateTo({ url: '/pages/records/checkin?id=1' });
    },
  }
});
