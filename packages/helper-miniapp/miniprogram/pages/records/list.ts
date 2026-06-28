import { getRecordList, type RecordInfo } from '../../services/record'

Component({
  data: {
    relId: '',
    records: [] as RecordInfo[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 50,
  },
  methods: {
    onAddRecord() {
      wx.navigateTo({ url: `/pages/records/checkin?id=${this.data.relId}` });
    },
    async loadRecords() {
      this.setData({ loading: true });
      try {
        const res = await getRecordList({ relId: this.data.relId, page: this.data.page, size: this.data.pageSize });
        if (res.code === 0) {
          this.setData({
            records: res.data.list,
            total: res.data.total,
          });
        }
      } catch (e) {
        console.error('[记录列表] 加载失败:', e);
      } finally {
        this.setData({ loading: false });
      }
    },
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      const options = (current as any).options || {};
      const id = options.id || '';
      if (id) {
        this.setData({ relId: id });
        this.loadRecords();
      }
    },
  },
});
