import { createRelationship, updateRelationship, getRelationshipDetail } from '../../services/relationship'
import { uploadFile } from '../../utils/request'

Component({
  data: {
    editId: '',
    step: 0,
    steps: ['头像昵称', '关系类型', '日期设置', '当前状态', '备注图片'],
    avatarUrl: '',
    name: '',
    typeValue: '',
    typeOptions: [
      { value: 'first_love', label: '初恋', emoji: '💕' },
      { value: 'ex', label: '前任', emoji: '💔' },
      { value: 'crush', label: '暗恋', emoji: '💌' },
      { value: 'situationship', label: '暧昧对象', emoji: '🤔' },
      { value: 'blind_date', label: '相亲对象', emoji: '🍵' },
      { value: 'other', label: '其他', emoji: '📌' }
    ],
    startDate: '',
    endDate: '',
    goalDays: 0,
    goalDaysText: '',
    today: '',
    status: 'active',
    statusOptions: [
      { value: 'active', label: '进行中', emoji: '🔥', desc: '断联进行中' },
      { value: 'done', label: '已结束', emoji: '✅', desc: '断联已结束' },
      { value: 'paused', label: '暂停中', emoji: '⏸️', desc: '暂时搁置' },
      { value: 'unknown', label: '不知道', emoji: '🤷', desc: '不太确定' }
    ],
    note: '',
    images: [] as string[],
    slots: [0, 1, 2, 3, 4, 5],
    saving: false,
    // picker-view 日期
    years: [] as number[],
    months: [] as number[],
    days: [] as number[],
    startDateIndex: [0, 0, 0] as number[],
    endDateIndex: [0, 0, 0] as number[],
    dateEditTarget: '' as 'start' | 'end' | '',
  },
  methods: {
    onPrevStep() {
      if (this.data.step > 0) this.setData({ step: this.data.step - 1 });
    },
    onNextStep() {
      if (this.data.step === 0 && !this.data.name.trim()) {
        wx.showToast({ title: '请填写昵称', icon: 'none' });
        return;
      }
      if (this.data.step === 1 && !this.data.typeValue) {
        wx.showToast({ title: '请选择关系类型', icon: 'none' });
        return;
      }
      if (this.data.step === 2) {
        if (!this.data.startDate) {
          wx.showToast({ title: '请选择开始日期', icon: 'none' });
          return;
        }
        if (this.data.endDate && this.data.endDate < this.data.startDate) {
          wx.showToast({ title: '结束日期不能早于开始日期', icon: 'none' });
          return;
        }
      }
      if (this.data.step < this.data.steps.length - 1) {
        this.setData({ step: this.data.step + 1 });
      }
    },
    onNameChange(e: WechatMiniprogram.CustomEvent) {
      this.setData({ name: e.detail.value });
    },
    onChooseAvatar() {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        success: (res) => {
          wx.cropImage({
            src: res.tempFiles[0].tempFilePath,
            cropScale: '1:1',
            success: (crop) => {
              this.setData({ avatarUrl: crop.tempFilePath });
            }
          });
        }
      });
    },
    onSelectType(e: WechatMiniprogram.TouchEvent) {
      this.setData({ typeValue: e.currentTarget.dataset.value });
    },
    onSelectStatus(e: WechatMiniprogram.TouchEvent) {
      this.setData({ status: e.currentTarget.dataset.value });
    },
    onTapStartDate() {
      this.setData({ dateEditTarget: 'start' });
    },
    onTapEndDate() {
      this.setData({ dateEditTarget: 'end' });
    },
    onDatePickerChange(e: WechatMiniprogram.PickerChange) {
      const val = e.detail.value as number[];
      const [yIdx, mIdx, dIdx] = val;
      const y = this.data.years[yIdx];
      const m = this.data.months[mIdx];
      const d = this.data.days[dIdx];
      const dateStr = [y, String(m).padStart(2, '0'), String(d).padStart(2, '0')].join('-');

      if (this.data.dateEditTarget === 'start') {
        this.setData({ startDate: dateStr, startDateIndex: val, endDate: this.data.endDate && this.data.endDate < dateStr ? '' : this.data.endDate }, () => this.calcGoalDays());
      } else {
        this.setData({ endDate: dateStr, endDateIndex: val }, () => this.calcGoalDays());
      }
    },
    initDatePicker(baseDate?: string) {
      const d = baseDate ? new Date(baseDate.replace(/-/g, '/')) : new Date();
      const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
      const years: number[] = [];
      for (let i = y - 5; i <= y + 1; i++) years.push(i);
      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const days: number[] = [];
      for (let i = 1; i <= 31; i++) days.push(i);
      this.setData({ years, months, days });
    },
    dateStrToIndex(dateStr: string): number[] {
      if (!dateStr) return [this.data.years.length - 1, 0, 0];
      const parts = dateStr.split('-');
      const y = parseInt(parts[0]), m = parseInt(parts[1]), d = parseInt(parts[2]);
      const yIdx = this.data.years.indexOf(y);
      return [yIdx >= 0 ? yIdx : this.data.years.length - 1, Math.max(0, m - 1), Math.max(0, d - 1)];
    },
    calcGoalDays() {
      const { startDate, endDate } = this.data;
      if (!startDate) {
        this.setData({ goalDays: 0, goalDaysText: '' });
        return;
      }
      const start = new Date(startDate.replace(/-/g, '/'));
      const end = endDate ? new Date(endDate.replace(/-/g, '/')) : new Date();
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
      const diff = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000));
      this.setData({ goalDays: diff, goalDaysText: String(diff) });
    },
    onNoteChange(e: WechatMiniprogram.CustomEvent) {
      this.setData({ note: e.detail.value });
    },
    onChooseImage(e: WechatMiniprogram.TouchEvent) {
      const idx = Number(e.currentTarget.dataset.index);
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        success: (res) => {
          const images = [...this.data.images];
          images[idx] = res.tempFiles[0].tempFilePath;
          this.setData({ images });
        }
      });
    },
    onDelImage(e: WechatMiniprogram.TouchEvent) {
      const idx = Number(e.currentTarget.dataset.index);
      const images = [...this.data.images];
      images[idx] = '';
      this.setData({ images });
    },
    async uploadLocalFiles(paths: string[]): Promise<string[]> {
      const urls: string[] = [];
      for (const p of paths) {
        if (!p) continue;
        // 如果是已有远程 URL 则跳过上传
        if (p.startsWith('http://') || p.startsWith('https://')) {
          urls.push(p);
          continue;
        }
        try {
          const res = await uploadFile(p, 'both');
          if (res.code === 0) {
            urls.push(res.data.origUrl);
          }
        } catch (e) {
          console.error('[上传] 图片上传失败:', e);
        }
      }
      return urls;
    },
    async loadEditData(id: string) {
      try {
        const res = await getRelationshipDetail(id);
        if (res.code === 0) {
          const d = res.data;
          this.setData({
            name: d.nickname,
            avatarUrl: d.avatarUrl || '',
            typeValue: d.relType,
            startDate: d.startDate,
            endDate: d.endDate || '',
            goalDays: d.breakTargetDays,
            goalDaysText: String(d.breakTargetDays),
            status: d.relStatus,
            note: d.note || '',
            images: d.images || [],
          });
          // 初始化日期滚轮索引
          this.setData({
            startDateIndex: this.dateStrToIndex(d.startDate),
            endDateIndex: this.dateStrToIndex(d.endDate || ''),
          });
        }
      } catch (e) {
        console.error('[编辑] 加载数据失败:', e);
      }
    },
    async onSave() {
      if (!this.data.name.trim()) { wx.showToast({ title: '请填写昵称', icon: 'none' }); return; }
      if (!this.data.typeValue) { wx.showToast({ title: '请选择关系类型', icon: 'none' }); return; }
      if (!this.data.startDate) { wx.showToast({ title: '请选择开始日期', icon: 'none' }); return; }
      if (this.data.saving) return;

      this.setData({ saving: true });
      wx.showLoading({ title: '保存中...' });

      try {
        // 1. 上传头像
        let avatarUrl = '';
        if (this.data.avatarUrl && !this.data.avatarUrl.startsWith('http')) {
          const uploadRes = await uploadFile(this.data.avatarUrl, 'thumbnail');
          if (uploadRes.code === 0) {
            avatarUrl = uploadRes.data.origUrl;
          }
        } else if (this.data.avatarUrl) {
          avatarUrl = this.data.avatarUrl;
        }

        // 2. 上传图片
        const imageUrls = await this.uploadLocalFiles(this.data.images.filter(Boolean));

        // 3. 构建请求数据
        const payload = {
          nickname: this.data.name.trim(),
          avatarUrl: avatarUrl || undefined,
          relType: this.data.typeValue,
          startDate: this.data.startDate,
          endDate: this.data.endDate || undefined,
          breakTargetDays: this.data.goalDays > 0 ? this.data.goalDays : undefined,
          relStatus: this.data.status,
          note: this.data.note || undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        };

        let res;
        if (this.data.editId) {
          res = await updateRelationship(this.data.editId, payload as unknown as Record<string, unknown>);
        } else {
          res = await createRelationship(payload);
        }

        if (res.code === 0) {
          wx.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1200);
        } else {
          wx.showToast({ title: res.message || '保存失败', icon: 'none' });
        }
      } catch (e) {
        console.error('[保存] 失败:', e);
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      } finally {
        this.setData({ saving: false });
        wx.hideLoading();
      }
    }
  },
  properties: {
    id: { type: String, value: '' },
  },

  lifetimes: {
    attached() {
      const d = new Date();
      const today = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
      this.setData({ today });

      // 初始化日期滚轮数据
      this.initDatePicker(today);
      const defaultIdx = this.data.years.length - 1;
      this.setData({
        startDateIndex: [defaultIdx, d.getMonth(), d.getDate() - 1],
        endDateIndex: [defaultIdx, d.getMonth(), d.getDate() - 1],
      });

      // 编辑模式：加载已有数据
      const id = this.data.id || '';
      if (id) {
        this.setData({ editId: id });
        this.loadEditData(id);
      }
    },
  },
});
