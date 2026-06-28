// pages/dashboard/dashboard.ts

import { getRelationshipList, type RelationshipInfo } from '../../services/relationship'

Component({
  data: {
    list: [] as RelationshipInfo[],
    loading: false,
    totalRelations: 0,
    activeCount: 0,
    doneCount: 0,
    totalRecords: 0,
  },
  methods: {
    onTapCard(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: `/pages/break-sessions/index?id=${id}` });
    },
    onAddRelationship() {
      wx.navigateTo({ url: '/pages/relationships/edit' });
    },
    async loadList() {
      this.setData({ loading: true });
      try {
        const res = await getRelationshipList({ page: 1, size: 50 });
        if (res.code === 0) {
          const list = res.data.list;
          let activeCount = 0, doneCount = 0;
          list.forEach((item: RelationshipInfo) => {
            if (item.relStatus === 'active') activeCount++;
            else if (item.relStatus === 'done') doneCount++;
          });
          this.setData({
            list,
            totalRelations: list.length,
            activeCount,
            doneCount,
          });
        }
      } catch (e) {
        console.error('[断联计划] 加载关系列表失败:', e);
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
  pageLifetimes: {
    show() {
      this.loadList();
    },
  },
});
