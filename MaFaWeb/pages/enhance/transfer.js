// pages/enhance/transfer.js
const app = getApp()
const { enhanceDataService } = require('../../services/enhanceService')

Page({
  data: {
    hero: {},
    bag: {},
    sourceItem: null,
    targetItem: null,

    // 预览信息
    canTransfer: false,
    reason: '',
    sourceLevel: 0,
    targetLevel: 0,
    levelLost: 0,
    scrollPrice: 50,
    scrollCurrency: 'yuanbao',

    // 状态
    isTransferring: false,
    showResult: false,
    resultSuccess: false,
    resultMessage: '',

    // 元宝
    yuanbao: 0,
    hasScroll: false
  },

  async onLoad() {
    const hero = app.globalData.hero
    const bag = app.globalData.bag

    this.setData({
      hero,
      bag,
      yuanbao: hero.yuanbao || 0
    })

    // 从存储中读取源装备
    const sourceItem = wx.getStorageSync('transferSource')
    if (sourceItem) {
      this.setData({ sourceItem })
      this.checkScroll()
    } else {
      wx.showToast({
        title: '未选择源装备',
        icon: 'none',
        complete: () => setTimeout(() => wx.navigateBack(), 1500)
      })
    }
  },

  onShow() {
    const hero = app.globalData.hero
    this.setData({
      hero,
      yuanbao: hero.yuanbao || 0
    })
    this.checkScroll()
  },

  // 检查是否有转移卷轴
  checkScroll() {
    const { ENHANCE_TRANSFER } = require('../../data/enhance')
    const bag = app.globalData.bag || { items: [] }
    const hasScroll = bag.items.some(item => item.id === ENHANCE_TRANSFER.itemId)
    this.setData({ hasScroll })
  },

  // 选择目标装备
  selectTarget() {
    const { sourceItem } = this.data

    // 存储源装备到临时存储
    wx.setStorageSync('transferSource', sourceItem)

    // 跳转到装备选择页面（复用角色页的背包展示）
    wx.navigateTo({
      url: '/pages/enhance/select-target'
    })
  },

  // 从选择页面返回后调用
  async onTargetSelected(targetItem) {
    if (!targetItem) return

    this.setData({ targetItem })

    // 获取转移预览
    const preview = await enhanceDataService.getTransferPreview(
      this.data.sourceItem,
      targetItem
    )

    if (preview.canTransfer) {
      this.setData({
        canTransfer: true,
        sourceLevel: preview.sourceLevel,
        targetLevel: preview.targetLevel,
        levelLost: preview.levelLost,
        scrollPrice: preview.scrollPrice,
        scrollCurrency: preview.scrollCurrency
      })
    } else {
      this.setData({
        canTransfer: false,
        reason: preview.reason
      })
    }
  },

  // 执行转移
  async doTransfer() {
    const { sourceItem, targetItem, hasScroll } = this.data

    if (!hasScroll) {
      wx.showToast({ title: '需要强化转移卷轴', icon: 'none' })
      return
    }

    const hero = app.globalData.hero
    const bag = app.globalData.bag

    this.setData({ isTransferring: true })

    // 调用服务层执行转移
    const result = await enhanceDataService.transferEnhance(
      sourceItem,
      targetItem,
      bag.items,
      hero
    )

    // 保存数据
    app.saveGameData()

    this.setData({
      isTransferring: false,
      showResult: true,
      resultSuccess: result.success,
      resultMessage: result.message,
      yuanbao: hero.yuanbao || 0
    })

    if (result.success) {
      this.checkScroll()
    }
  },

  // 关闭结果
  closeResult() {
    this.setData({ showResult: false })
    if (this.data.resultSuccess) {
      wx.navigateBack()
    }
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 前往商城
  goToShop() {
    wx.navigateTo({ url: '/pages/shop/shop' })
  }
})
