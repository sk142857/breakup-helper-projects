import {
  getRelationshipList,
  deleteRelationship,
  type RelationshipInfo,
} from '../../services/relationship'

/** 关系类型 → Emoji 映射 */
const relTypeEmojiMap: Record<string, string> = {
  first_love: '💕',
  ex: '💔',
  crush: '💌',
  situationship: '🤔',
  blind_date: '🍵',
  other: '📌',
}

/** 关系状态 → 中文标签 */
const relStatusLabelMap: Record<string, string> = {
  active: '进行中',
  done: '已结束',
  paused: '暂停中',
  unknown: '不知道',
}

/** 关系类型 → 中文标签 */
const relTypeLabelMap: Record<string, string> = {
  first_love: '初恋',
  ex: '前任',
  crush: '暗恋',
  situationship: '暧昧对象',
  blind_date: '相亲对象',
  other: '其他',
}

/** 格式化持续天数：根据起止日期或仅有开始日期计算跨度 */
function formatDuration(startDate: string, endDate?: string | null): string {
  if (!startDate) return ''
  const start = new Date(startDate.replace(/-/g, '/'))
  const end = endDate ? new Date(endDate.replace(/-/g, '/')) : new Date()
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return ''

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  const parts: string[] = []
  if (years > 0) parts.push(`${years}年`)
  if (months > 0) parts.push(`${months}月`)
  parts.push(`${String(days).padStart(2, '0')}天`)
  return parts.join('')
}

/** 格式化 ISO 日期为可读格式 */
function formatDate(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

Component({
  data: {
    list: [] as RelationshipInfo[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 50,
  },
  methods: {
    /** 获取关系类型对应的 Emoji */
    relTypeEmoji(type: string): string {
      return relTypeEmojiMap[type] || '📌'
    },
    /** 格式化持续天数 */
    formatDays(startDate: string, endDate?: string | null): string {
      return formatDuration(startDate, endDate)
    },
    onTapItem(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: `/pages/break-sessions/index?id=${id}` });
    },
    onAdd() {
      wx.navigateTo({ url: '/pages/relationships/edit' });
    },
    onDeleteItem(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id as string;
      const that = this;
      wx.showModal({
        title: '提示',
        content: '确定要删除这段感情记录吗？删除后不可恢复。',
        confirmColor: '#FF3B30',
        success: async (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '删除中...' });
            try {
              const result = await deleteRelationship(id);
              if (result.code === 0) {
                wx.showToast({ title: '已删除', icon: 'success' });
                that.loadList();
              } else {
                wx.showToast({ title: result.message || '删除失败', icon: 'none' });
              }
            } catch (e) {
              wx.showToast({ title: (e as Error).message || '网络错误', icon: 'none' });
            } finally {
              wx.hideLoading();
            }
          }
        }
      });
    },
    async loadList() {
      this.setData({ loading: true });
      try {
        const res = await getRelationshipList({ page: this.data.page, size: this.data.pageSize });
        if (res.code === 0) {
          // 预计算 WXML 展示字段（WXML 中无法调用带参数的方法）
          const list = res.data.list.map((item: RelationshipInfo) => {
            const imageList = item.imageList || []
            const displayImages = imageList.slice(0, 3)
            const imageMore = imageList.length > 3 ? imageList.length - 3 : 0
            return {
              ...item,
              _relStatusLabel: relStatusLabelMap[item.relStatus] || item.relStatus,
              _relTypeLabel: relTypeLabelMap[item.relType] || item.relType,
              _relTypeEmoji: relTypeEmojiMap[item.relType] || '📌',
              _durationText: formatDuration(item.startDate, item.endDate),
              _updatedLabel: formatDate(item.updatedAt || item.createdAt),
              _avatarChar: (item.nickname || '').trim().charAt(0) || '?',
              _displayImages: displayImages,
              _imageMore: imageMore,
            }
          });
          this.setData({
            list,
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
  pageLifetimes: {
    show() {
      this.loadList();
    },
  },
});
