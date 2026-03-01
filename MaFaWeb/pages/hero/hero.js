// pages/hero/hero.js
const app = getApp()
const { getRarityClass, getRarityName } = require('../../data/items')
const { calculatePower, getRankInfo } = require('../../services/powerService')

Page({
  data: {
    hero: {},
    totalStats: { attack: 0, defense: 0 },
    totalPower: 0,
    hpPercent: 100,
    mpPercent: 100,
    expPercent: 0,
    showStats: false,
    inventoryItems: [],
    totalSlots: 40,
    selectedItem: null,
    selectedIndex: -1,
    inventoryExpanded: true,
    proficiencyData: [],
    // 装备对比数据
    equippedItemForCompare: null,
    compareStats: [],
    // 排名和称号
    rankInfo: {
      rank: 0,
      title: '新手冒险者',
      titleColor: '#888'
    },
    // 职业和头像
    heroClass: 'warrior',
    classEmoji: '🛡️',
    defaultTitle: '新手冒险者'
  },

  onLoad() {
    this.loadHeroData()
  },

  onShow() {
    this.loadHeroData()
  },

  // 计算总战力 - 使用配置化服务（支持 mock 和 API）
  async calculateTotalPower(stats, hero) {
    try {
      // 支持 mock 和 API 两种模式
      const result = await calculatePower(stats, hero)
      if (result.code === 0 && result.data) {
        return result.data.total || 0
      }
      // 降级使用本地计算
      return this.calculatePowerLocal(stats, hero)
    } catch (error) {
      console.error('战力计算失败:', error)
      return this.calculatePowerLocal(stats, hero)
    }
  },

  // 本地战力计算（降级方案）
  calculatePowerLocal(stats, hero) {
    const power = Math.floor(
      (stats.attack || 0) * 2 +
      (stats.defense || 0) * 1.5 +
      ((stats.hp || hero?.maxHp || 100) / 10) +
      ((stats.mp || hero?.maxMp || 100) / 10) +
      (stats.crit || 0) * 5 +
      (stats.dodge || 0) * 5 +
      (stats.speed || 0) * 3
    )
    return power
  },

  // 根据战力获取排名和称号 - 使用配置化服务
  getRankInfoByPower(power) {
    return getRankInfo(power)
  },

  // 获取武器图标
  getWeaponIcon(subType) {
    const iconMap = {
      'dao': '🔪',
      'jian': '🗡️',
      'axe': '🪓',
      'staff': '🪄',
      'bow': '🏹',
      'weapon': '⚔️'
    }
    return iconMap[subType] || '⚔️'
  },

  // 获取物品图标路径或emoji
  getItemIcon(item) {
    if (!item) return { type: 'emoji', value: '📦' }

    // 药水使用图片图标
    if (item.type === 'potion') {
      let iconPath = '/assets/icons/items/potion.png'
      if (item.subType === 'mp') {
        iconPath = '/assets/icons/items/potion_mp.png'
      } else if (item.subType === 'dual') {
        iconPath = '/assets/icons/items/potion_dual.png'
      } else if (item.subType === 'hp') {
        iconPath = '/assets/icons/items/potion_hp.png'
      }
      return { type: 'image', value: iconPath }
    }

    // 装备使用emoji图标
    const equipIconMap = {
      'dao': '🔪', 'jian': '🗡️', 'axe': '🪓', 'staff': '🪄', 'bow': '🏹',
      'weapon': '⚔️', 'helmet': '⛑️', 'armor': '🦺', 'armor_chest': '🦺',
      'shield': '🛡️', 'necklace': '📿', 'ring': '💍', 'belt': '🎀',
      'bracer': '💪', 'amulet': '🔮', 'gem': '💎', 'mount': '🐎'
    }

    const icon = equipIconMap[item.subType] || equipIconMap[item.slot] || '⚔️'
    return { type: 'emoji', value: icon }
  },

  // 获取技能图标
  getSkillIcon(skillName) {
    const iconMap = {
      '普通攻击': '⚔️',
      '重击': '🔨',
      '连斩': '⚡',
      '破甲': '💥',
      '火球术': '🔥',
      '冰冻术': '❄️',
      '雷电术': '⚡',
      '治疗术': '✨',
      '护盾': '🛡️',
      '疾风步': '💨',
      '狂暴': '😤',
      '致命一击': '💀'
    }
    return iconMap[skillName] || '⚡'
  },

  // 加载角色数据
  async loadHeroData() {
    const hero = app.globalData.hero || {}
    const bag = app.globalData.bag || { items: [], gold: 0 }
    const bagItems = bag.items || []
    const totalStats = app.getTotalStats(hero)

    const maxHp = totalStats.hp || hero.maxHp || 100
    const maxMp = totalStats.mp || hero.maxMp || 100

    // 注意：不要修改原始 hero 对象的基础属性，否则会导致战力计算累积错误
    // 只用于显示的总属性
    const displayStats = {
      attack: totalStats.attack || hero.attack || 0,
      defense: totalStats.defense || hero.defense || 0
    }

    const hpPercent = maxHp ? Math.floor(hero.hp / maxHp * 100) : 100
    const mpPercent = maxMp ? Math.floor((hero.mp || 100) / maxMp * 100) : 100
    const expPercent = hero.maxExp ? Math.floor((hero.exp || 0) / hero.maxExp * 100) : 0

    // 使用配置化战力计算服务（支持 mock 和 API）
    let totalPower = 0
    try {
      totalPower = await this.calculateTotalPower(totalStats, hero)
    } catch (error) {
      console.error('战力计算失败:', error)
      totalPower = 0
    }

    // 根据等级和装备确定职业和称号
    const { heroClass, classEmoji } = this.getHeroClass(totalStats, hero)
    const title = this.getHeroTitle(hero.level || 1, totalPower)

    // 更新英雄称号
    hero.title = title

    // 获取武器熟练度信息
    const dataService = require('../../services/dataService')
    const weaponProficiency = hero.weaponProficiency || { dao: 0, jian: 0, axe: 0, staff: 0, bow: 0 }

    // 计算熟练度进度（假设每1000点升一级，最高10000）
    const maxProficiency = 10000
    const proficiencyData = [
      { key: 'dao', name: '刀', icon: '🔪', value: weaponProficiency.dao, progress: Math.min((weaponProficiency.dao / maxProficiency) * 100, 100), tier: dataService.getProficiencyTier(weaponProficiency.dao) },
      { key: 'jian', name: '剑', icon: '⚔️', value: weaponProficiency.jian, progress: Math.min((weaponProficiency.jian / maxProficiency) * 100, 100), tier: dataService.getProficiencyTier(weaponProficiency.jian) },
      { key: 'axe', name: '斧', icon: '🪓', value: weaponProficiency.axe, progress: Math.min((weaponProficiency.axe / maxProficiency) * 100, 100), tier: dataService.getProficiencyTier(weaponProficiency.axe) },
      { key: 'staff', name: '杖', icon: '🪄', value: weaponProficiency.staff, progress: Math.min((weaponProficiency.staff / maxProficiency) * 100, 100), tier: dataService.getProficiencyTier(weaponProficiency.staff) },
      { key: 'bow', name: '弓', icon: '🏹', value: weaponProficiency.bow, progress: Math.min((weaponProficiency.bow / maxProficiency) * 100, 100), tier: dataService.getProficiencyTier(weaponProficiency.bow) }
    ]

    // 为每个物品添加图标，为技能添加图标
    const itemsWithIcons = bagItems.map(item => ({
      ...item,
      icon: this.getItemIcon(item)
    }))

    // 为技能添加图标
    if (hero.skills) {
      // skills 是对象格式，需要转换为数组并添加图标
      const skillsWithIcons = Object.entries(hero.skills).map(([skillId, skill]) => ({
        id: skillId,
        ...skill,
        icon: this.getSkillIcon(skill.name || skillId)
      }))
      hero.skills = skillsWithIcons
    }

    this.setData({
      hero,
      totalStats,
      totalPower,
      hpPercent,
      mpPercent,
      expPercent,
      inventoryItems: itemsWithIcons,
      maxHp,
      maxMp,
      proficiencyData,
      heroClass,
      classEmoji,
      defaultTitle: title,
      learnedSkillCount: Object.keys(hero.skills || {}).length
    })
  },

  // 获取稀有度类名（用于WXML调用）
  getRarityClass(item) {
    if (!item || !item.rarity) return ''
    return getRarityClass(item.rarity)
  },

  // 获取英雄职业和头像
  getHeroClass(stats, hero) {
    const equipment = hero.equipment || {}
    const hasShield = equipment.shield
    const hasBow = equipment.weapon && equipment.weapon.subType === 'bow'
    const hasStaff = equipment.weapon && equipment.weapon.subType === 'staff'
    const hasSword = equipment.weapon && (equipment.weapon.subType === 'jian' || equipment.weapon.subType === 'dao')

    // 根据装备判断职业
    if (hasShield) {
      return { heroClass: 'shield', classEmoji: '💂‍♂️' }
    }
    if (hasBow) {
      return { heroClass: 'ranger', classEmoji: '🧝‍♂️' }
    }
    if (hasStaff) {
      return { heroClass: 'mage', classEmoji: '🧙‍♂️' }
    }
    if (hasSword) {
      return { heroClass: 'swordsman', classEmoji: '🤺' }
    }

    // 默认冒险者
    return { heroClass: 'adventurer', classEmoji: '🧗‍♂️' }
  },

  // 获取英雄称号
  getHeroTitle(level, power) {
    if (power >= 10000) return '传说英雄'
    if (power >= 5000) return '史诗勇士'
    if (power >= 2000) return '精英战士'
    if (level >= 30) return '大冒险家'
    if (level >= 20) return '资深冒险者'
    if (level >= 10) return '见习勇士'
    return '新手冒险者'
  },

  // 跳转到技能页面
  goToSkills() {
    wx.navigateTo({
      url: '/pages/skills/skills'
    })
  },

  // 获取稀有度名称
  getRarityName(rarity) {
    return getRarityName(rarity)
  },

  // 获取武器图标（用于WXML）
  getWeaponIconForWX(subType) {
    return this.getWeaponIcon(subType)
  },

  // 显示装备菜单
  async showEquipMenu(e) {
    const slot = e.currentTarget.dataset.slot
    const bag = app.globalData.bag || { items: [] }
    const items = bag.items || []

    // 筛选可装备的物品
    const equipableItems = items.filter(item => {
      if (slot === 'weapon') return item.type === 'weapon'
      if (slot === 'armor') return item.slot === 'armor' || item.subType === 'armor'
      if (slot === 'helmet') return item.slot === 'helmet' || item.subType === 'helmet'
      if (slot === 'shield') return item.slot === 'shield' || item.subType === 'shield'
      if (slot === 'necklace') return item.slot === 'necklace' || item.subType === 'necklace'
      if (slot === 'ring') return item.slot === 'ring' || item.subType === 'ring'
      if (slot === 'bracer') return item.slot === 'bracer' || item.subType === 'bracer'
      if (slot === 'amulet') return item.slot === 'amulet' || item.subType === 'amulet'
      if (slot === 'belt') return item.slot === 'belt' || item.subType === 'belt'
      if (slot === 'mount') return item.slot === 'mount' || item.subType === 'mount'
      return false
    })

    if (equipableItems.length === 0) {
      wx.showToast({ title: '背包中没有可装备的物品', icon: 'none' })
      return
    }

    // 显示物品选择列表
    const itemList = equipableItems.map(item => `${item.name} [${getRarityName(item.rarity)}]`)

    wx.showActionSheet({
      itemList,
      success: async (res) => {
        const selectedItem = equipableItems[res.tapIndex]
        const actualIndex = items.findIndex(item => item.uid === selectedItem.uid)
        const result = await app.equipItem(actualIndex, slot)

        if (result && result.hero) {
          this.loadHeroData()
          wx.showToast({ title: '装备成功', icon: 'success' })
        } else {
          wx.showToast({ title: result?.message || '装备失败', icon: 'none' })
        }
      }
    })
  },

  // 一键卸下所有装备
  async unequipAll() {
    const hero = app.globalData.hero
    const equipment = hero.equipment || {}
    const slots = ['weapon', 'helmet', 'armor', 'shield', 'necklace', 'ring', 'bracer', 'amulet', 'belt', 'mount']

    let unequippedCount = 0
    for (const slot of slots) {
      if (equipment[slot]) {
        await app.unequipItem(slot)
        unequippedCount++
      }
    }

    if (unequippedCount > 0) {
      this.loadHeroData()
      wx.showToast({ title: `已卸下${unequippedCount}件装备`, icon: 'success' })
    } else {
      wx.showToast({ title: '没有装备可卸下', icon: 'none' })
    }
  },

  // 获取物品对应的装备槽位
  getEquipSlot(item) {
    // 武器类型统一映射到 weapon 槽位
    if (item.type === 'weapon') return 'weapon'

    const itemId = item.id || ''

    // 优先从 item id 推断槽位（更可靠）
    if (itemId.includes('helmet')) return 'helmet'
    if (itemId.includes('armor_chest') || itemId.includes('armor_legs') || itemId.includes('armor_boots') || itemId.includes('armor_gloves')) return 'armor'
    if (itemId.includes('shield')) return 'shield'
    if (itemId.includes('necklace')) return 'necklace'
    if (itemId.includes('belt')) return 'belt'
    if (itemId.includes('bracer')) return 'bracer'
    if (itemId.includes('amulet')) return 'amulet'
    if (itemId.includes('gem')) return 'gem'
    if (itemId.includes('ring')) return 'ring'
    if (itemId.includes('mount')) return 'mount'

    // 后备：根据 subType 或 slot 确定装备槽位
    const subType = item.subType || item.slot || ''

    // 盔甲类统一映射到 armor 槽位
    if (subType.startsWith('armor')) return 'armor'

    // 其他装备类型直接返回
    const validSlots = ['helmet', 'shield', 'necklace', 'ring', 'belt', 'bracer', 'amulet']
    if (validSlots.includes(subType)) return subType

    return subType
  },

  // 一键装备最佳物品
  async equipBest() {
    const bag = app.globalData.bag || { items: [] }
    const items = bag.items || []
    const hero = app.globalData.hero

    // 按槽位分组并找出最佳装备
    const slotMap = {}
    items.forEach(item => {
      if (item.type !== 'weapon' && item.type !== 'equipment') return

      // 获取正确的装备槽位
      const slot = this.getEquipSlot(item)
      if (!slot) return

      if (!slotMap[slot] || this.isBetterItem(item, slotMap[slot])) {
        slotMap[slot] = item
      }
    })

    let equippedCount = 0
    for (const [slot, item] of Object.entries(slotMap)) {
      const actualIndex = items.findIndex(i => i.uid === item.uid)
      if (actualIndex !== -1) {
        const result = await app.equipItem(actualIndex, slot)
        if (result && result.hero) {
          equippedCount++
        }
      }
    }

    if (equippedCount > 0) {
      this.loadHeroData()
      wx.showToast({ title: `已装备${equippedCount}件最佳物品`, icon: 'success' })
    } else {
      wx.showToast({ title: '没有可装备的更好物品', icon: 'none' })
    }
  },

  // 判断item1是否比item2更好
  isBetterItem(item1, item2) {
    // 优先比较品质
    const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5, 'mythic': 6, 'divine': 7 }
    const r1 = rarityOrder[item1.rarity] || 1
    const r2 = rarityOrder[item2.rarity] || 1
    if (r1 !== r2) return r1 > r2

    // 同品质比较等级
    if (item1.level !== item2.level) return item1.level > item2.level

    // 比较属性总和
    const sum1 = (item1.attack || 0) + (item1.defense || 0) + (item1.hpBonus || 0) / 10
    const sum2 = (item2.attack || 0) + (item2.defense || 0) + (item2.hpBonus || 0) / 10
    return sum1 > sum2
  },

  // 显示属性弹窗
  showStatsModal() {
    this.setData({ showStats: true })
  },

  // 隐藏属性弹窗
  hideStatsModal() {
    this.setData({ showStats: false })
  },

  // 阻止冒泡
  stopPropagation() {},

  // 切换包裹栏展开/收起
  toggleInventory() {
    this.setData({ inventoryExpanded: !this.data.inventoryExpanded })
  },

  // 显示物品详情（带对比）
  showItemDetail(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.inventoryItems[index]

    // 查找当前同槽位装备
    const hero = app.globalData.hero
    let equippedItem = null
    let compareStats = []

    if (item.slot || item.subType) {
      const slot = item.slot || item.subType
      equippedItem = hero.equipment?.[slot] || null

      if (equippedItem) {
        // 生成对比数据，包含强化属性
        const statKeys = ['attack', 'defense', 'hpBonus', 'mpBonus', 'crit', 'dodge', 'speed', 'block']
        const statLabels = { attack: '攻击', defense: '防御', hpBonus: '生命', mpBonus: '魔法', crit: '暴击', dodge: '闪避', speed: '速度', block: '格挡' }

        compareStats = statKeys
          .filter(key => item[key] || equippedItem[key] || item.enhance?.bonusStats?.[key] || equippedItem.enhance?.bonusStats?.[key])
          .map(key => {
            // 基础属性
            const itemBase = item[key] || 0
            const equippedBase = equippedItem[key] || 0

            // 强化加成
            const itemEnhance = item.enhance?.bonusStats?.[key] || 0
            const equippedEnhance = equippedItem.enhance?.bonusStats?.[key] || 0

            // 总属性
            const itemTotal = itemBase + itemEnhance
            const equippedTotal = equippedBase + equippedEnhance

            return {
              key,
              label: statLabels[key],
              currentBase: equippedBase,
              currentEnhance: equippedEnhance,
              current: equippedTotal,
              newBase: itemBase,
              newEnhance: itemEnhance,
              new: itemTotal,
              diff: itemTotal - equippedTotal,
              hasEnhance: itemEnhance > 0 || equippedEnhance > 0
            }
          })
      }
    }

    this.setData({
      selectedItem: item,
      selectedIndex: index,
      equippedItemForCompare: equippedItem,
      compareStats
    })
  },

  // 关闭物品详情
  closeItemDetail() {
    this.setData({
      selectedItem: null,
      selectedIndex: -1,
      equippedItemForCompare: null,
      compareStats: []
    })
  },

  // 使用选中的物品
  async useSelectedItem() {
    const index = this.data.selectedIndex
    const item = this.data.inventoryItems[index]

    if (item.type !== 'potion') {
      wx.showToast({ title: '该物品不能直接使用', icon: 'none' })
      return
    }

    const bag = app.globalData.bag || { items: [] }
    const actualIndex = bag.items.findIndex(bagItem => bagItem.uid === item.uid)

    if (actualIndex === -1) {
      wx.showToast({ title: '物品不存在', icon: 'none' })
      return
    }

    const result = await app.useItem(actualIndex)
    if (result) {
      this.loadHeroData()
      this.closeItemDetail()
      wx.showToast({ title: '使用成功', icon: 'success' })
    }
  },

  // 装备选中的物品
  async equipSelectedItem() {
    const index = this.data.selectedIndex
    const item = this.data.inventoryItems[index]

    if (item.type !== 'weapon' && item.type !== 'equipment') {
      wx.showToast({ title: '该物品不能装备', icon: 'none' })
      return
    }

    const result = await app.equipItem(index)
    if (result && result.hero) {
      this.loadHeroData()
      this.closeItemDetail()
      wx.showToast({ title: '装备成功', icon: 'success' })
    }
  },

  // 出售选中的物品
  async sellSelectedItem() {
    const index = this.data.selectedIndex
    const item = this.data.inventoryItems[index]

    wx.showModal({
      title: '确认出售',
      content: `确定要出售 ${item.name} 吗？可获得 ${item.price || 0} 金币`,
      success: async (res) => {
        if (res.confirm) {
          const bag = app.globalData.bag || { items: [] }
          const actualIndex = bag.items.findIndex(bagItem => bagItem.uid === item.uid)

          if (actualIndex !== -1) {
            const result = await app.sellItem(actualIndex)
            if (result) {
              this.loadHeroData()
              this.closeItemDetail()
              wx.showToast({ title: '出售成功', icon: 'success' })
            }
          }
        }
      }
    })
  }
})
