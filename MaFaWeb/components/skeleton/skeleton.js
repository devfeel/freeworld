// skeleton.js - 骨架屏组件
Component({
  properties: {
    // 类型: card, list, detail
    type: {
      type: String,
      value: 'card'
    },
    // 行数
    rows: {
      type: Number,
      value: 3
    },
    // 是否显示
    loading: {
      type: Boolean,
      value: true
    }
  },

  data: {},

  lifetimes: {
    attached() {
      // 设置动画
    }
  }
})
