// pages/enhance/enhance.js
const app = getApp()
const { EnhanceSystem } = require('../../utils/enhance-system')
const { ENHANCE_TRANSFER, ENHANCE_PROTECT } = require('../../data/enhance')

Page({
  data: {
    hero: {},
    item: null,
    enhanceSystem: null,

    // 强化信息
    currentLevel: 0,
    targetLevel: 0,
    cost: 0,
    successRate: 0,
    canEnhance: false,
    failureWarning: '',
    canProtect: false,

    // 属性预览
    statPreview: [],

    // 材料选择
    selectedMaterial: null,
    materials: [],
    useProtect: false,
    hasProtectScroll: false,

    // 动画
    isEnhancing: false,
    showResult: false,
    resultSuccess: false,
    resultMessage: '',

    // 元宝
    yuanbao: 0
  },

  onLoad(options) {
    const hero = app.globalData.hero
    const enhanceSystem = new EnhanceSystem(hero)

    this.setData({
      hero,
      enhanceSystem,
      yuanbao: hero.yuanbao || 0
    })

    // 加载装备数据
    if (options.itemUid) {
      this.loadItem(options.itemUid)
    } else {
      // 从存储中读取
      const item = wx.getStorageSync('enhanceItem')
      if (item) {
        this.loadItemData(item)
      }
    }

    // 加载背包中的强化材料
    this.loadMaterials()
  },

  onShow() {
    // 刷新英雄数据
    const hero = app.globalData.hero
    this.setData({
      hero,
      yuanbao: hero.yuanbao || 0
    })
  },

  // 加载装备
  loadItem(itemUid) {
    const bag = app.globalData.bag || { items: [] }
    const item = bag.items.find(i => i.uid === itemUid)

    if (item) {
      this.loadItemData(item)
    } else {
      // 检查已装备的物品
      const equipment = this.data.hero.equipment || {}
      for (const slot in equipment) {
        if (equipment[slot] && equipment[slot].uid === itemUid) {
          this.loadItemData(equipment[slot])
          return
        }
      }

      wx.showToast({
        title: '装备不存在',
        icon: 'none',
        complete: () => {
          setTimeout(() => wx.navigateBack(), 1500)
        }
      })
    }
  },

  // 加载装备数据并计算预览
  loadItemData(item) {
    const { enhanceSystem } = this.data

    // 确保装备有 enhance 字段
    if (!item.enhance) {
      item.enhance = { level: 0, bonusStats: {} }
    }

    this.setData({ item })

    // 获取强化预览
    const preview = enhanceSystem.getEnhancePreview(item)

    if (preview.canEnhance) {
      this.setData({
        currentLevel: preview.currentLevel,
        targetLevel: preview.targetLevel,
        cost: preview.cost,
        successRate: preview.successRate,
        canEnhance: true,
        statPreview: preview.statPreview,
        failureWarning: preview.failureWarning,
        canProtect: preview.canProtect
      })
    } else {
      this.setData({
        canEnhance: false,
        failureWarning: preview.reason
      })
    }
  },

  // 加载可用材料
  loadMaterials() {
    const bag = app.globalData.bag || { items: [] }
    const { ENHANCE_MATERIALS } = require('../../data/enhance')

    const materials = []

    // 查找背包中的强化石
    Object.keys(ENHANCE_MATERIALS).forEach(key => {
      const material = ENHANCE_MATERIALS[key]
      const count = bag.items.filter(item => item.id === material.id).length

      if (count > 0) {
        materials.push({
          ...material,
          count,
          selected: false
        })
      }
    })

    // 检查是否有保护卷轴
    const hasProtectScroll = bag.items.some(item => item.id === ENHANCE_PROTECT.scroll_protect.id)

    this.setData({
      materials,
      hasProtectScroll
    })
  },

  // 选择材料
  selectMaterial(e) {
    const id = e.currentTarget.dataset.id
    const { materials } = this.data

    const newMaterials = materials.map(m => ({
      ...m,
      selected: m.id === id ? !m.selected : false
    }))

    const selectedMaterial = newMaterials.find(m => m.selected)

    this.setData({
      materials: newMaterials,
      selectedMaterial: selectedMaterial ? selectedMaterial.id : null
    })

    // 重新计算成功率
    this.updateSuccessRate()
  },

  // 切换保护卷轴
  toggleProtect() {
    this.setData({
      useProtect: !this.data.useProtect
    })
  },

  // 更新成功率
  updateSuccessRate() {
    const { item, enhanceSystem, selectedMaterial } = this.data
    const rate = enhanceSystem.calculateSuccessRate(item, selectedMaterial)

    this.setData({
      successRate: rate
    })
  },

  // 执行强化
  async doEnhance() {
    const { item, enhanceSystem, selectedMaterial, useProtect } = this.data

    if (!item || !enhanceSystem) return

    // 检查金币
    const check = enhanceSystem.canEnhance(item)
    if (!check.canEnhance) {
      wx.showToast({ title: check.reason, icon: 'none' })
      return
    }

    // 开始强化动画
    this.setData({ isEnhancing: true })

    // 扣除强化石（如果使用了）
    if (selectedMaterial) {
      await this.consumeMaterial(selectedMaterial)
    }

    // 扣除保护卷轴（如果使用了）
    if (useProtect) {
      await this.consumeProtectScroll()
    }

    // 延迟执行强化（动画效果）
    setTimeout(() => {
      const result = enhanceSystem.enhance(item, selectedMaterial, useProtect)

      // 保存数据
      app.saveGameData()

      this.setData({
        isEnhancing: false,
        showResult: true,
        resultSuccess: result.success,
        resultMessage: result.message
      })

      // 播放音效（可选）
      if (result.success) {
        // 成功音效
      } else {
        // 失败音效
      }

      // 刷新数据
      this.loadItemData(item)
      this.loadMaterials()

      // 更新英雄数据
      const hero = app.globalData.hero
      this.setData({ hero, yuanbao: hero.yuanbao || 0 })

    }, 1500)
  },

  // 消耗材料
  consumeMaterial(materialId) {
    const bag = app.globalData.bag
    const index = bag.items.findIndex(item => item.id === materialId)

    if (index !== -1) {
      bag.items.splice(index, 1)
    }

    return Promise.resolve()
  },

  // 消耗保护卷轴
  consumeProtectScroll() {
    const bag = app.globalData.bag
    const index = bag.items.findIndex(item => item.id === ENHANCE_PROTECT.scroll_protect.id)

    if (index !== -1) {
      bag.items.splice(index, 1)
    }

    this.setData({ hasProtectScroll: false })
    return Promise.resolve()
  },

  // 关闭结果弹窗
  closeResult() {
    this.setData({ showResult: false })
  },

  // 前往转移页面
  goToTransfer() {
    const { item } = this.data
    if (!item) return

    wx.setStorageSync('transferSource', item)
    wx.navigateTo({
      url: '/pages/enhance/transfer'
    })
  },

  // 前往商城购买材料
  goToShop() {
    wx.navigateTo({
      url: '/pages/shop/shop'
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
})
