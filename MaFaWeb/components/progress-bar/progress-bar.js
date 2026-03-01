// components/progress-bar/progress-bar.js
Component({
  /**
   * 组件属性
   */
  properties: {
    // 进度值 0-100
    percent: {
      type: Number,
      value: 0,
      observer(newVal) {
        // 确保值在 0-100 范围内
        if (newVal < 0) this.setData({ percent: 0 })
        else if (newVal > 100) this.setData({ percent: 100 })
      }
    },
    // 类型：hp, mp, exp, stamina, custom
    type: {
      type: String,
      value: 'custom'
    },
    // 是否显示文字
    showText: {
      type: Boolean,
      value: true
    },
    // 自定义文字
    text: {
      type: String,
      value: ''
    },
    // 自定义样式类
    className: {
      type: String,
      value: ''
    },
    // 自定义容器样式
    customStyle: {
      type: String,
      value: ''
    },
    // 填充区域自定义样式
    fillStyle: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件初始数据
   */
  data: {

  },

  /**
   * 组件方法
   */
  methods: {

  }
})
