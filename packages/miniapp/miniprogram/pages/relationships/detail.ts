// pages/relationships/detail.ts
Component({
  data: {},
  methods: {
    onCheckin() {
      wx.navigateTo({ url: '/pages/records/checkin?id=1' });
    },
    onViewAllRecords() {
      wx.navigateTo({ url: '/pages/records/list?id=1' });
    },
    onAddRecord() {
      wx.navigateTo({ url: '/pages/records/edit?id=1' });
    },
  }
});
