// pages/dashboard/dashboard.ts

interface RelationItem {
  id: number
  name: string
  subtitle: string
  avatarColor: string
  status: string
  privacy: string
  days: number
  targetDays: number
  lastRecord: string
  progress: number
}

const MOCK_LIST: RelationItem[] = [
  {
    id: 1,
    name: '张三',
    subtitle: '初恋 · 在一起 2 年',
    avatarColor: 'green',
    status: '进行中',
    privacy: '私密',
    days: 89,
    targetDays: 100,
    lastRecord: '3天前',
    progress: 89,
  },
  {
    id: 2,
    name: '李四',
    subtitle: '前任 · 在一起 1 年',
    avatarColor: 'blue',
    status: '进行中',
    privacy: '公开',
    days: 38,
    targetDays: 100,
    lastRecord: '1天前',
    progress: 38,
  },
]

Component({
  data: {
    list: MOCK_LIST,
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
