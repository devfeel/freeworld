// components/item-card/item-card.js
Component({
  /**
   * 组件属性
   */
  properties: {
    // 物品名称
    name: {
      type: String,
      value: '未知物品'
    },
    // 物品图标 URL
    icon: {
      type: String,
      value: ''
    },
    // 物品 emoji（当没有图标时使用）
    emoji: {
      type: String,
      value: '📦'
    },
    // 物品描述
    description: {
      type: String,
      value: ''
    },
    // 物品等级
    level: {
      type: Number,
      value: 0
    },
    // 攻击力
    attack: {
      type: Number,
      value: 0
    },
    // 防御力
    defense: {
      type: Number,
      value: 0
    },
    // 稀有度
    rarity: {
      type: String,
      value: 'common'
    },
    // 价格
    price: {
      type: Number,
      value: 0
    },
    // 数量
    count: {
      type: Number,
      value: 1
    },
    // 是否为新物品
    isNew: {
      type: Boolean,
      value: false
    },
    // 是否选中
    selected: {
      type: Boolean,
      value: false
    },
    // 是否显示信息
    showInfo: {
      type: Boolean,
      value: true
    },
    // 尺寸: small/normal/large
    size: {
      type: String,
      value: 'normal'
    }
  },

  /**
   * 组件数据
   */
  data: {
    rarityClass: ''
  },

  /**
   * 生命周期
   */
  lifetimes: {
    attached() {
      this.updateRarityClass()
    }
  },

  /**
   * 属性监听器
   */
  observers: {
    'rarity': function() {
      this.updateRarityClass()
    }
  },

  /**
   * 组件方法
   */
  methods: {
    // 更新稀有度类名
    updateRarityClass() {
      const rarityMap = {
        'common': 'tag-common',
        'uncommon': 'tag-uncommon',
        'rare': 'tag-rare',
        'epic': 'tag-epic',
        'legendary': 'tag-legendary',
        'mythic': 'tag-mythic',
        'divine': 'tag-divine'
      }
      this.setData({
        rarityClass: rarityMap[this.properties.rarity] || 'tag-common'
      })
    },

    // 点击事件
    onTap() {
      this.triggerEvent('tap', {
        name: this.properties.name,
        rarity: this.properties.rarity
      })
    }
  }
})
