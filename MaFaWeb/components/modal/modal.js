// components/modal/modal.js
Component({
  /**
   * 组件属性
   */
  properties: {
    // 是否显示
    visible: {
      type: Boolean,
      value: false
    },
    // 标题
    title: {
      type: String,
      value: ''
    },
    // 是否显示关闭按钮
    showClose: {
      type: Boolean,
      value: true
    },
    // 是否显示底部按钮
    showFooter: {
      type: Boolean,
      value: true
    },
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      value: true
    },
    // 确认按钮文字
    confirmText: {
      type: String,
      value: '确定'
    },
    // 取消按钮文字
    cancelText: {
      type: String,
      value: '取消'
    },
    // 动画类型: scale, slide-up, fade
    animation: {
      type: String,
      value: 'scale'
    },
    // 点击遮罩是否关闭
    closeOnOverlay: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件方法
   */
  methods: {
    onOverlayTap() {
      if (this.properties.closeOnOverlay) {
        this.triggerEvent('close')
      }
    },

    onContainerTap(e) {
      // 阻止冒泡
      e.stopPropagation()
    },

    onClose() {
      this.triggerEvent('close')
    },

    onConfirm() {
      this.triggerEvent('confirm')
    },

    onCancel() {
      this.triggerEvent('cancel')
    }
  }
})
