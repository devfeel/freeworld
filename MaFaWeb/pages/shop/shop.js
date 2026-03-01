// pages/shop/shop.js
const app = getApp()
const { getShopItems, getItem, getRarityClass, getRarityName } = require('../../data/items')

Page({
  data: {
    hero: {},
    shopItems: [],
    currentCategory: 'all'
  },

  onLoad() {
    this.loadShopItems('all')
  },

  onShow() {
    const hero = app.globalData.hero || {}
    this.setData({ hero })
  },

  // 加载商城物品
  loadShopItems(category) {
    const items = getShopItems(category)

    // 为每个物品添加图标
    const itemsWithIcons = items.map(item => ({
      ...item,
      icon: item.type === 'potion'
        ? this.getItemIcon(item.subType)
        : this.getEquipmentIcon(item.subType)
    }))

    this.setData({
      shopItems: itemsWithIcons,
      currentCategory: category
    })
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.loadShopItems(category)
  },

  // 获取物品图标
  getItemIcon(subType) {
    const iconMap = {
      'hp': '❤️',
      'mp': '💎',
      'dual': '⭐'
    }
    return iconMap[subType] || '🧪'
  },

  // 获取装备图标 - 扩展版，支持更多类型
  getEquipmentIcon(subType) {
    const iconMap = {
      // 武器类型
      'dao': '🔪',      // 刀
      'jian': '🗡️',     // 剑
      'axe': '🪓',      // 斧
      'staff': '🪄',    // 法杖
      'bow': '🏹',      // 弓
      'weapon': '⚔️',   // 默认武器
      // 防具类型
      'helmet': '⛑️',   // 头盔
      'armor': '🛡️',    // 盔甲/胸甲
      'armor_chest': '🛡️',
      'armor_legs': '👖',
      'armor_boots': '👢',
      'armor_gloves': '🧤',
      'shield': '🧱',   // 盾牌
      // 饰品类型
      'necklace': '📿', // 项链
      'ring': '💍',     // 戒指
      'belt': '🎀',     // 腰带
      'bracer': '💪',   // 护腕
      'amulet': '🔮',   // 护身符
      'gem': '💎',      // 宝石
      'earring': '👂',  // 耳环
      // 其他
      'cloak': '🦇',    // 披风
      'mount': '🐎',    // 坐骑
      'book': '📖',     // 书/卷轴
      'scroll': '📜'    // 卷轴
    }
    return iconMap[subType] || '📦'
  },

  // 获取稀有度类名
  getRarityClass(rarity) {
    return getRarityClass(rarity)
  },

  // 获取稀有度名称
  getRarityName(rarity) {
    return getRarityName(rarity)
  },

  // 显示物品详情
  showItemDetail(e) {
    const item = e.currentTarget.dataset.item

    let statsText = ''
    if (item.type === 'weapon' || item.type === 'equipment') {
      const stats = []
      if (item.attack) stats.push(`攻击: +${item.attack}`)
      if (item.magicAttack) stats.push(`魔法攻击: +${item.magicAttack}`)
      if (item.defense) stats.push(`防御: +${item.defense}`)
      if (item.magicDefense) stats.push(`魔法防御: +${item.magicDefense}`)
      if (item.hpBonus) stats.push(`生命: +${item.hpBonus}`)
      if (item.mpBonus) stats.push(`魔法: +${item.mpBonus}`)
      if (item.speed) stats.push(`速度: ${item.speed > 0 ? '+' : ''}${item.speed}`)
      if (item.crit) stats.push(`暴击: +${item.crit}`)
      if (item.dodge) stats.push(`闪避: +${item.dodge}`)
      if (item.block) stats.push(`格挡: +${item.block}`)
      if (stats.length > 0) {
        statsText = `\n${stats.join(' | ')}`
      }
    }

    const setText = item.isSet ? '\n类型: 套装装备' : ''
    wx.showModal({
      title: item.name,
      content: `${item.description}${statsText}\n\n需求等级: ${item.level || 1}\n价格: ${item.price} 金币\n稀有度: ${getRarityName(item.rarity)}${setText}`,
      confirmText: '购买',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.buyItem(item)
        }
      }
    })
  },

  // 购买物品
  async buyItem(item) {
    const hero = app.globalData.hero || {}
    const currency = item.currency || 'gold'
    const price = item.price

    // 检查余额
    if (currency === 'yuanbao') {
      if ((hero.yuanbao || 0) < price) {
        wx.showModal({
          title: '元宝不足',
          content: '是否前往充值？',
          success: (res) => {
            if (res.confirm) {
              wx.showToast({ title: '充值功能开发中', icon: 'none' })
            }
          }
        })
        return
      }

      // 元宝购买需要二次确认
      const confirmRes = await new Promise(resolve => {
        wx.showModal({
          title: '确认购买',
          content: `花费 ${price} 元宝购买 ${item.name}？`,
          confirmText: '购买',
          cancelText: '取消',
          success: resolve
        })
      })

      if (!confirmRes.confirm) return
    } else {
      // 金币购买
      if ((hero.gold || 0) < price) {
        wx.showToast({ title: '金币不足', icon: 'none' })
        return
      }
    }

    // 检查背包空间
    const bag = app.globalData.bag || { items: [] }
    const items = bag.items || []
    if (items.length >= 50) {
      wx.showToast({ title: '背包已满', icon: 'none' })
      return
    }

    // 扣除货币
    if (currency === 'yuanbao') {
      hero.yuanbao = (hero.yuanbao || 0) - price
    } else {
      hero.gold = (hero.gold || 0) - price
    }

    // 添加到背包
    app.addItem({
      ...item,
      uid: Date.now() + Math.random()
    })

    // 保存游戏
    app.saveGameData()

    // 更新界面
    const updatedHero = app.globalData.hero || {}
    this.setData({ hero: updatedHero })

    wx.showToast({
      title: `购买了 ${item.name}`,
      icon: 'success'
    })
  }
})
