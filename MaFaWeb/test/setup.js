/**
 * Jest 测试环境初始化
 * 模拟微信小程序环境
 */

// 模拟微信小程序全局对象
global.wx = {
  // 存储模拟
  _storage: {},

  setStorageSync(key, data) {
    this._storage[key] = JSON.parse(JSON.stringify(data));
  },

  getStorageSync(key) {
    return this._storage[key] !== undefined ? JSON.parse(JSON.stringify(this._storage[key])) : '';
  },

  removeStorageSync(key) {
    delete this._storage[key];
  },

  clearStorageSync() {
    this._storage = {};
  },

  // Toast 模拟
  showToast: jest.fn((options) => {
    if (options.success) options.success();
  }),

  showLoading: jest.fn((options) => {
    if (options.success) options.success();
  }),

  hideLoading: jest.fn(),

  // Modal 模拟
  showModal: jest.fn((options) => {
    if (options.success) options.success({ confirm: true });
  }),

  // 导航模拟
  navigateTo: jest.fn(),
  navigateBack: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),

  // 系统信息
  getSystemInfoSync: jest.fn(() => ({
    windowWidth: 375,
    windowHeight: 667,
    pixelRatio: 2
  })),

  // 画布模拟
  createCanvasContext: jest.fn(() => ({
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    fillText: jest.fn(),
    setFillStyle: jest.fn(),
    setStrokeStyle: jest.fn(),
    setFontSize: jest.fn(),
    draw: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    setGlobalAlpha: jest.fn()
  })),

  // 音频模拟
  createInnerAudioContext: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
    onEnded: jest.fn(),
    offEnded: jest.fn()
  })),

  // 振动模拟
  vibrateShort: jest.fn(),
  vibrateLong: jest.fn(),

  // 登录模拟
  login: jest.fn((options) => {
    if (options.success) {
      options.success({ code: 'mock_code_12345' });
    }
  }),

  getUserInfo: jest.fn((options) => {
    if (options.success) {
      options.success({
        userInfo: {
          nickName: '测试用户',
          avatarUrl: 'https://example.com/avatar.png'
        }
      });
    }
  })
};

// 模拟 App 全局对象
global.App = jest.fn((options) => {
  global._appOptions = options;
  global._appInstance = {
    globalData: options.globalData || {},
    ...options
  };
  return global._appInstance;
});

// 模拟 Page 全局对象
global.Page = jest.fn((options) => {
  return options;
});

// 模拟 Component 全局对象
global.Component = jest.fn((options) => {
  return options;
});

// 模拟 getApp 全局函数
global.getApp = jest.fn(() => global._appInstance || {
  globalData: {
    hero: null,
    bag: { items: [], gold: 0 },
    currentBattle: null,
    gameStatus: 'idle'
  },
  saveGameData: jest.fn(),
  loadGameData: jest.fn()
});

// 测试辅助函数
global.testUtils = {
  // 重置存储
  resetStorage() {
    wx._storage = {};
  },

  // 创建测试英雄
  createMockHero(overrides = {}) {
    return {
      name: '测试英雄',
      level: 1,
      exp: 0,
      maxExp: 100,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 10,
      defense: 5,
      speed: 8,
      critical: 0.1,
      dodge: 0.05,
      equipment: {},
      skills: [],
      weaponMastery: {},
      ...overrides
    };
  },

  // 创建测试物品
  createMockItem(overrides = {}) {
    return {
      id: 'test_item_001',
      name: '测试物品',
      type: 'weapon',
      rarity: 'common',
      level: 1,
      attack: 5,
      defense: 0,
      price: 100,
      ...overrides
    };
  },

  // 创建测试怪物
  createMockMonster(overrides = {}) {
    return {
      id: 'test_monster_001',
      name: '测试怪物',
      level: 1,
      hp: 50,
      maxHp: 50,
      mp: 20,
      maxMp: 20,
      attack: 8,
      defense: 3,
      speed: 5,
      exp: 20,
      gold: 10,
      drops: [],
      ...overrides
    };
  },

  // 固定随机数种子
  setRandomSeed(seed = 12345) {
    let currentSeed = seed;
    Math.random = jest.fn(() => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    });
  },

  // 恢复随机数
  resetRandom() {
    Math.random = jest.requireActual('math-random') || Math.random;
  }
};

// 在每个测试前重置状态
beforeEach(() => {
  wx._storage = {};
  jest.clearAllMocks();
});

// 在所有测试后清理
afterAll(() => {
  wx._storage = {};
});
