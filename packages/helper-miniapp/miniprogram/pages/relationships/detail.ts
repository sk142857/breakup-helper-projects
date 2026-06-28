import { getRelationshipDetail, deleteRelationship } from '../../services/relationship'
import { getRecordList, type RecordInfo } from '../../services/record'

Component({
  data: {
    relId: '',
    // 关系详情
    nickname: '',
    avatarUrl: '' as string | null,
    relType: '',
    relTypeLabel: '',
    startDate: '',
    endDate: '' as string | null,
    breakTargetDays: 0,
    relStatus: '',
    relStatusLabel: '',
    note: '' as string | null,
    images: [] as string[],
    // 统计
    breakDays: 0,
    totalRecords: 0,
    // 时间线记录
    records: [] as RecordInfo[],
    loading: false,
  },
  methods: {
    onViewAllRecords() {
      wx.navigateTo({ url: `/pages/records/list?id=${this.data.relId}` });
    },
    onAddRecord() {
      wx.navigateTo({ url: `/pages/records/checkin?id=${this.data.relId}` });
    },
    onEdit() {
      wx.navigateTo({ url: `/pages/relationships/edit?id=${this.data.relId}` });
    },

    confirmDelete() {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除「${this.data.nickname}」的感情记录吗？相关的断联记录也会一并删除。`,
        confirmText: '删除',
        confirmColor: '#FF3B30',
        success: async (res) => {
          if (!res.confirm) return;
          try {
            wx.showLoading({ title: '删除中...' });
            const result = await deleteRelationship(this.data.relId);
            if (result.code === 0) {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 1200);
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' });
            }
          } catch (e) {
            console.error('[删除] 失败:', e);
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        },
      });
    },
    async loadDetail() {
      this.setData({ loading: true });
      try {
        const res = await getRelationshipDetail(this.data.relId);
        if (res.code === 0) {
          const d = res.data;
          // 类型中文映射
          const typeMap: Record<string, string> = {
            first_love: '初恋', ex: '前任', crush: '暗恋',
            situationship: '暧昧对象', blind_date: '相亲对象', other: '其他',
          };
          const statusMap: Record<string, string> = {
            active: '进行中', done: '已结束', paused: '暂停中', unknown: '不知道',
          };
          this.setData({
            nickname: d.nickname,
            avatarUrl: d.avatarUrl,
            relType: d.relType,
            relTypeLabel: typeMap[d.relType] || d.relType,
            startDate: d.startDate,
            endDate: d.endDate,
            breakTargetDays: d.breakTargetDays,
            relStatus: d.relStatus,
            relStatusLabel: statusMap[d.relStatus] || d.relStatus,
            note: d.note,
            images: d.images || [],
            breakDays: d.breakDays,
          });
        }
      } catch (e) {
        console.error('[关系详情] 加载失败:', e);
      } finally {
        this.setData({ loading: false });
      }
    },
    async loadRecords() {
      try {
        const res = await getRecordList({ relId: this.data.relId, page: 1, size: 10 });
        if (res.code === 0) {
          this.setData({
            records: res.data.list,
            totalRecords: res.data.total,
          });
        }
      } catch (e) {
        console.error('[关系详情] 加载记录失败:', e);
      }
    },
  },
  /**
   * 接收页面路由参数（Component 作为页面时，URL 查询参数自动映射到 properties）
   */
  properties: {
    id: { type: String, value: '' },
  },

  lifetimes: {
    attached() {
      const id = this.data.id || '';
      if (id) {
        this.setData({ relId: id });
        this.loadDetail();
        this.loadRecords();
      }
    },
  },

  /**
   * 从编辑页返回时重新加载数据
   */
  pageLifetimes: {
    show() {
      const id = this.data.id || '';
      if (id && this.data.relId) {
        this.loadDetail();
        this.loadRecords();
      }
    },
  },
});
