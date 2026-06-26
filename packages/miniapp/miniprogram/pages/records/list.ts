// pages/records/list.ts
Component({
  data: {},
  methods: {
    onAddRecord() {
      wx.navigateTo({ url: '/pages/records/edit?id=1' });
    }
  }
});
