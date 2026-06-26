/**
 * 事件埋点枚举 — 小程序端 & 服务端共用
 *
 * 使用方式：
 *   import { EventType, EventName } from '@/utils/eventEnum'
 *   track(EventType.TAP, EventName.TAP_ADD_RELATIONSHIP, { pagePath })
 *
 * eventType: 事件分类  (lifecycle / page / navigation / tap / input / business / share / error)
 * eventName: 事件描述  (中文注释即含义，key 为上报值)
 */

// ============ EventType 事件分类 ============

export const EventType = {
  /** 应用 & 页面生命周期 */
  LIFECYCLE:  'lifecycle',
  /** 页面进入/离开（含停留时长） */
  PAGE:       'page',
  /** 导航跳转 */
  NAVIGATION: 'navigation',
  /** 用户点击 */
  TAP:        'tap',
  /** 表单输入 */
  INPUT:      'input',
  /** 业务结果（登录、CRUD 等） */
  BUSINESS:   'business',
  /** 分享 */
  SHARE:      'share',
  /** 错误 */
  ERROR:      'error',
} as const

export type EventTypeValue = (typeof EventType)[keyof typeof EventType]

// ============ EventName 事件描述 ============

export const EventName = {
  // -- lifecycle 生命周期 --
  APP_LAUNCH:              'app_launch',               // 启动小程序
  APP_SHOW:                'app_show',                 // 小程序切到前台
  APP_HIDE:                'app_hide',                 // 小程序切到后台
  PAGE_LOAD:               'page_load',                // 页面加载
  PAGE_SHOW:               'page_show',                // 页面显示
  PAGE_HIDE:               'page_hide',                // 页面隐藏
  PAGE_UNLOAD:             'page_unload',              // 页面卸载
  PAGE_ENTER:              'page_enter',               // 进入页面（开始计时）
  PAGE_LEAVE:              'page_leave',               // 离开页面（含停留时长）

  // -- navigation 导航 --
  NAVIGATE_TO:             'navigate_to',              // 跳转页面
  REDIRECT_TO:             'redirect_to',              // 重定向页面
  SWITCH_TAB:              'switch_tab',               // 切换底部 Tab
  RE_LAUNCH:               're_launch',                // 重新启动
  NAVIGATE_BACK:           'navigate_back',            // 返回上一页

  // -- tap 点击 --
  TAP_CARD:                'tap_card',                 // 点击关系卡片 → 进入详情
  TAP_ADD_RELATIONSHIP:    'tap_add_relationship',     // 点击"新增关系"
  TAP_FILTER:              'tap_filter',               // 切换筛选标签
  TAP_LIST_ITEM:           'tap_list_item',            // 点击列表项
  TAP_CHECKIN:             'tap_checkin',              // 点击"打卡"
  TAP_VIEW_ALL_RECORDS:    'tap_view_all_records',     // 点击"查看全部记录"
  TAP_ADD_RECORD:          'tap_add_record',           // 点击"新增记录"
  TAP_PREV_STEP:           'tap_prev_step',            // 表单"上一步"
  TAP_NEXT_STEP:           'tap_next_step',            // 表单"下一步"
  TAP_RETRY:               'tap_retry',                // 重试
  TAP_VIEW_LOG:            'tap_view_log',             // 跳转日志（示例页）
  TAP_CHOOSE_AVATAR:       'tap_choose_avatar',        // 选择头像
  TAP_SELECT_TYPE:         'tap_select_type',          // 选择关系类型
  TAP_SELECT_STATUS:       'tap_select_status',        // 选择状态
  TAP_SELECT_DATE:         'tap_select_date',          // 选择日期
  TAP_SELECT_MOOD:         'tap_select_mood',          // 选择心情
  TAP_CHOOSE_IMAGE:        'tap_choose_image',         // 选择图片
  TAP_DELETE_IMAGE:        'tap_delete_image',         // 删除图片
  TAP_SAVE:                'tap_save',                 // 点击"保存"
  TAP_AUTH_USER_INFO:      'tap_auth_user_info',       // 授权获取微信用户信息

  // -- input 输入 --
  INPUT_NICKNAME:          'input_nickname',           // 输入昵称
  INPUT_RELATIONSHIP_NAME: 'input_relationship_name',  // 输入关系昵称
  INPUT_NOTE:              'input_note',               // 输入备注
  INPUT_CONTENT:           'input_content',            // 输入内容

  // -- business 业务结果 --
  LOGIN_SUCCESS:           'login_success',            // 登录成功
  LOGIN_FAIL:              'login_fail',               // 登录失败
  LOGOUT:                  'logout',                   // 退出登录
  RELATIONSHIP_CREATE:     'relationship_create',      // 创建关系成功
  RELATIONSHIP_UPDATE:     'relationship_update',      // 更新关系成功
  RELATIONSHIP_DELETE:     'relationship_delete',      // 删除关系成功
  RECORD_CREATE:           'record_create',            // 创建记录成功
  RECORD_UPDATE:           'record_update',            // 更新记录成功
  RECORD_DELETE:           'record_delete',            // 删除记录成功
  CHECKIN_COMPLETE:        'checkin_complete',         // 打卡完成
  PROFILE_UPDATE:          'profile_update',           // 修改个人资料

  // -- share 分享 --
  SHARE_APP_MESSAGE:       'share_app_message',        // 分享到微信聊天

  // -- error 异常 --
  REQUEST_FAIL:            'request_fail',             // API 请求失败
} as const

export type EventNameValue = (typeof EventName)[keyof typeof EventName]
