import {
  getRelationshipList,
  type RelationshipInfo,
} from '../../services/relationship'

Component({
  data: {
    filterTab: 'all' as string,
    list: [] as RelationshipInfo[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 50,
  },
  methods: {
    onFilter(e: WechatMiniprogram.TouchEvent) {
      const tab = e.currentTarget.dataset.tab as string;
      this.setData({ filterTab: tab, page: 1 }, () => this.loadList());
    },
    onTapItem(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: `/pages/relationships/detail?id=${id}` });
    },
    onAdd() {
      wx.navigateTo({ url: '/pages/relationships/edit' });
    },
    async loadList() {
      this.setData({ loading: true });
      try {
        const params: Record<string, string | number> = {
          page: this.data.page,
          size: this.data.pageSize,
        };
        if (this.data.filterTab !== 'all') {
          params.status = this.data.filterTab;
        }
        const res = await getRelationshipList(params);
        if (res.code === 0) {
          this.setData({
            list: res.data.list,
            total: res.data.total,
          });
        }
      } catch (e) {
        console.error('[关系列表] 加载失败:', e);
      } finally {
        this.setData({ loading: false });
      }
    },
  },
  lifetimes: {
    attached() {
      this.loadList();
    },
  },
});
