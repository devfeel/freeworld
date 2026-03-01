// components/equipment-slot/equipment-slot.js
Component({
  /**
   * 组件属性
   */
  properties: {
    // 槽位类型
    slotType: {
      type: String,
      value: 'weapon' // weapon, helmet, armor, shield, necklace, ring, etc.
    },
    // 槽位名称
    slotName: {
      type: String,
      value: ''
    },
    // 槽位标签（空槽位时显示）
    slotLabel: {
      type: String,
      value: ''
    },
    // 默认图标
    defaultEmoji: {
      type: String,
      value: '⚔️'
    },
    // 装备数据
    equipment: {
      type: Object,
      value: null
    },
    // 尺寸: small, medium, large
    size: {
      type: String,
      value: 'medium'
    },
    // 是否显示槽位名称
    showName: {
      type: Boolean,
      value: false
    },
    // 是否新获得
    isNew: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件初始数据
   */
  data: {
    slotLabels: {
      weapon: '武器',
      helmet: '头盔',
      armor: '盔甲',
      shield: '盾牌',
      necklace: '项链',
      ring: '戒指',
      bracer: '护腕',
      amulet: '护身符',
      belt: '腰带',
      mount: '坐骑'
    },
    defaultEmojis: {
      weapon: '⚔️',
      helmet: '🪖',
      armor: '🛡️',
      shield: '🛡️',
      necklace: '📿',
      ring: '💍',
      bracer: '✊',
      amulet: '🔮',
      belt: '➰',
      mount: '🐴'
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'slotType': function(type) {
      const labels = this.data.slotLabels
      const emojis = this.data.defaultEmojis

      if (!this.properties.slotName) {
        this.setData({
          slotName: labels[type] || '装备'
        })
      }

      if (!this.properties.slotLabel) {
        this.setData({
          slotLabel: labels[type] || '装备'
        })
      }

      if (this.properties.defaultEmoji === '⚔️') {
        this.setData({
          defaultEmoji: emojis[type] || '⚔️'
        })
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    onTap() {
      this.triggerEvent('tap', {
        slotType: this.properties.slotType,
        equipment: this.properties.equipment
      })
    },

    onLongPress() {
      this.triggerEvent('longpress', {
        slotType: this.properties.slotType,
        equipment: this.properties.equipment
      })
    }
  }
})
