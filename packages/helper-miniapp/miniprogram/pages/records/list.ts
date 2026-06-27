// pages/records/list.ts
Component({
  data: {},
  methods: {
    onAddRecord() {
      wx.navigateTo({ url: '/pages/records/checkin?id=1' });
    }
  }
});
