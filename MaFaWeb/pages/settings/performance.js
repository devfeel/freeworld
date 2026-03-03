// pages/settings/performance.js
const PerformanceConfig = require('../../utils/performance-config')

Page({
  data: {
    modes: [],
    selectedMode: 'balanced',
    config: {},
    deviceInfo: {},
    recommendedMode: 'balanced'
  },

  onLoad() {
    this.loadConfig()
    this.loadDeviceInfo()
  },

  onShow() {
    this.loadConfig()
  },

  loadConfig() {
    const config = PerformanceConfig.get()
    const modes = PerformanceConfig.getModes()

    this.setData({
      config,
      modes,
      selectedMode: config.mode
    })
  },

  loadDeviceInfo() {
    const systemInfo = wx.getSystemInfoSync()
    const recommended = PerformanceConfig.detectDevicePerformance()

    this.setData({
      deviceInfo: {
        brand: systemInfo.brand || '未知',
        model: systemInfo.model || '未知',
        system: `${systemInfo.platform} ${systemInfo.system}`,
        memory: systemInfo.memory || '未知'
      },
      recommendedMode: this.getModeName(recommended)
    })
  },

  getModeName(key) {
    const modeMap = {
      high: '高性能',
      balanced: '平衡',
      low: '低功耗'
    }
    return modeMap[key] || key
  },

  selectMode(e) {
    const mode = e.currentTarget.dataset.mode
    const config = PerformanceConfig.setMode(mode)

    this.setData({
      selectedMode: mode,
      config
    })

    wx.showToast({
      title: '设置已更新',
      icon: 'success'
    })
  },

  autoConfigure() {
    const config = PerformanceConfig.autoConfigure()

    this.setData({
      selectedMode: config.mode,
      config
    })

    wx.showToast({
      title: '已自动配置',
      icon: 'success'
    })
  },

  applySettings() {
    wx.showToast({
      title: '设置已应用',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  },

  goBack() {
    wx.navigateBack()
  }
})
