// button.js - 通用按钮组件
Component({
  properties: {
    // 按钮文字
    text: {
      type: String,
      value: '按钮'
    },
    // 按钮类型: primary, secondary, success, warning, error
    type: {
      type: String,
      value: 'primary'
    },
    // 尺寸: small, medium, large
    size: {
      type: String,
      value: 'medium'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 是否加载中
    loading: {
      type: Boolean,
      value: false
    },
    // 是否镂空
    outline: {
      type: Boolean,
      value: false
    }
  },

  data: {},

  methods: {
    handleTap() {
      if (!this.data.disabled && !this.data.loading) {
        this.triggerEvent('click')
      }
    }
  }
})
