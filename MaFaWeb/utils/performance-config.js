/**
 * PerformanceConfig - 性能配置管理
 * 管理战斗视觉效果性能设置
 */

const CONFIG_KEY = 'battle_performance_config'

const PerformanceConfig = {
  // 默认配置
  defaultConfig: {
    mode: 'balanced', // 'high', 'balanced', 'low'
    particleLimit: 50,
    enableShake: true,
    shakeIntensity: 'medium', // 'light', 'medium', 'heavy'
    enableGlow: true,
    enableStatusAnimation: true,
    logAnimation: true,
    backgroundDetail: 'medium' // 'high', 'medium', 'low'
  },

  // 性能模式预设
  presets: {
    high: {
      mode: 'high',
      particleLimit: 100,
      enableShake: true,
      shakeIntensity: 'heavy',
      enableGlow: true,
      enableStatusAnimation: true,
      logAnimation: true,
      backgroundDetail: 'high'
    },
    balanced: {
      mode: 'balanced',
      particleLimit: 50,
      enableShake: true,
      shakeIntensity: 'medium',
      enableGlow: true,
      enableStatusAnimation: true,
      logAnimation: true,
      backgroundDetail: 'medium'
    },
    low: {
      mode: 'low',
      particleLimit: 20,
      enableShake: false,
      shakeIntensity: 'light',
      enableGlow: false,
      enableStatusAnimation: false,
      logAnimation: false,
      backgroundDetail: 'low'
    }
  },

  /**
   * 获取当前配置
   */
  get() {
    try {
      const config = wx.getStorageSync(CONFIG_KEY)
      if (config) {
        return { ...this.defaultConfig, ...config }
      }
    } catch (e) {
      console.error('[PerformanceConfig] 读取配置失败:', e)
    }
    return { ...this.defaultConfig }
  },

  /**
   * 保存配置
   */
  save(config) {
    try {
      wx.setStorageSync(CONFIG_KEY, config)
      return true
    } catch (e) {
      console.error('[PerformanceConfig] 保存配置失败:', e)
      return false
    }
  },

  /**
   * 设置性能模式
   */
  setMode(mode) {
    const preset = this.presets[mode]
    if (preset) {
      this.save(preset)
      return preset
    }
    return null
  },

  /**
   * 获取性能模式列表
   */
  getModes() {
    return [
      { key: 'high', name: '高性能', desc: '完整特效，最佳视觉体验' },
      { key: 'balanced', name: '平衡', desc: '适中特效，兼顾性能' },
      { key: 'low', name: '低功耗', desc: '最小特效，省电流畅' }
    ]
  },

  /**
   * 检测设备性能（简单版）
   */
  detectDevicePerformance() {
    const systemInfo = wx.getSystemInfoSync()

    // 根据设备信息推断性能等级
    const brand = systemInfo.brand?.toLowerCase() || ''
    const model = systemInfo.model?.toLowerCase() || ''

    // 高端设备标识
    const highEndMarkers = ['iphone 1', 'ipad pro', 'mate', 'p40', 'p50', 'mi 1', 'mi 11', 'galaxy s2']
    // 低端设备标识
    const lowEndMarkers = ['iphone 6', 'iphone 7', 'iphone 8', 'redmi', 'honor play']

    const isHighEnd = highEndMarkers.some(marker => model.includes(marker))
    const isLowEnd = lowEndMarkers.some(marker => model.includes(marker))

    if (isHighEnd) return 'high'
    if (isLowEnd) return 'low'

    // 根据内存判断
    if (systemInfo.memory && systemInfo.memory >= 8000) return 'high'
    if (systemInfo.memory && systemInfo.memory <= 2000) return 'low'

    return 'balanced'
  },

  /**
   * 自动设置最佳性能模式
   */
  autoConfigure() {
    const detectedMode = this.detectDevicePerformance()
    return this.setMode(detectedMode)
  },

  /**
   * 应用配置到各系统
   */
  apply(particleSystem, screenShake, battleAnimationManager) {
    const config = this.get()

    // 应用粒子系统限制
    if (particleSystem) {
      particleSystem.setPerformanceMode(config.mode)
    }

    // 应用震动设置
    if (screenShake) {
      screenShake.setPerformanceMode(config.mode)
      if (!config.enableShake) {
        screenShake.stop()
      }
    }

    // 应用动画管理器设置
    if (battleAnimationManager) {
      battleAnimationManager.setPerformanceMode(config.mode)
    }

    return config
  }
}

module.exports = PerformanceConfig
