/**
 * app.js 核心功能单元测试
 * 测试应用核心功能：经验值、升级、存档等
 */

describe('App Core', () => {
  let AppCore;
  let mockGlobalData;

  beforeEach(() => {
    // 模拟应用核心
    AppCore = {
      // 初始化全局数据
      initGlobalData() {
        return {
          hero: {
            name: '英雄',
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
            equipment: {},
            skills: []
          },
          bag: {
            items: [],
            gold: 0
          },
          currentBattle: null,
          gameStatus: 'idle'
        };
      },

      // 计算升级所需经验
      calculateMaxExp(level) {
        // 经验曲线：每级需要经验 = 基础经验 * (1.2 ^ 等级)
        return Math.floor(100 * Math.pow(1.2, level - 1));
      },

      // 增加经验值
      addExp(hero, exp) {
        let totalExp = exp;
        let levelUps = 0;

        hero.exp += totalExp;

        // 检查升级
        while (hero.exp >= hero.maxExp) {
          hero.exp -= hero.maxExp;
          this.levelUp(hero);
          levelUps++;
        }

        return {
          gained: exp,
          levelUps,
          currentExp: hero.exp,
          maxExp: hero.maxExp
        };
      },

      // 升级处理
      levelUp(hero) {
        hero.level++;
        hero.maxExp = this.calculateMaxExp(hero.level);

        // 属性成长
        const growth = this.getLevelGrowth(hero.level);
        hero.maxHp += growth.hp;
        hero.maxMp += growth.mp;
        hero.attack += growth.attack;
        hero.defense += growth.defense;
        hero.speed += growth.speed;

        // 恢复状态
        hero.hp = hero.maxHp;
        hero.mp = hero.maxMp;

        return growth;
      },

      // 获取等级成长属性
      getLevelGrowth(level) {
        return {
          hp: 10 + Math.floor(level * 2),
          mp: 5 + Math.floor(level),
          attack: 2 + Math.floor(level * 0.5),
          defense: 1 + Math.floor(level * 0.3),
          speed: 1
        };
      },

      // 计算总属性（包含装备）
      getTotalStats(hero) {
        const stats = {
          attack: hero.attack,
          defense: hero.defense,
          hp: hero.maxHp,
          mp: hero.maxMp,
          speed: hero.speed
        };

        // 累加装备属性
        for (const slot in hero.equipment) {
          const item = hero.equipment[slot];
          if (item) {
            stats.attack += item.attack || 0;
            stats.defense += item.defense || 0;
            stats.hp += item.hp || 0;
            stats.mp += item.mp || 0;
            stats.speed += item.speed || 0;
          }
        }

        return stats;
      },

      // 保存游戏数据
      saveGameData(globalData) {
        const saveData = {
          hero: globalData.hero,
          bag: globalData.bag,
          saveTime: Date.now()
        };

        try {
          wx.setStorageSync('gameData', saveData);
          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      },

      // 加载游戏数据
      loadGameData() {
        try {
          const data = wx.getStorageSync('gameData');
          if (data) {
            return { success: true, data };
          }
          return { success: false, reason: 'no_save' };
        } catch (e) {
          return { success: false, error: e.message };
        }
      },

      // 检查存档是否存在
      hasSaveData() {
        const result = wx.getStorageSync('gameData');
        return !!result;
      },

      // 删除存档
      deleteSaveData() {
        try {
          wx.removeStorageSync('gameData');
          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      },

      // 初始化新游戏
      newGame() {
        return this.initGlobalData();
      },

      // 增加金币
      addGold(bag, amount) {
        bag.gold += amount;
        return { success: true, newAmount: bag.gold };
      },

      // 消耗金币
      spendGold(bag, amount) {
        if (bag.gold < amount) {
          return { success: false, reason: 'insufficient_gold' };
        }
        bag.gold -= amount;
        return { success: true, newAmount: bag.gold };
      }
    };

    mockGlobalData = AppCore.initGlobalData();
  });

  describe('initGlobalData()', () => {
    test('应返回正确的初始数据结构', () => {
      const data = AppCore.initGlobalData();

      expect(data.hero).toBeDefined();
      expect(data.bag).toBeDefined();
      expect(data.gameStatus).toBe('idle');
    });

    test('英雄应有正确的初始属性', () => {
      const data = AppCore.initGlobalData();

      expect(data.hero.level).toBe(1);
      expect(data.hero.exp).toBe(0);
      expect(data.hero.maxExp).toBe(100);
      expect(data.hero.hp).toBe(data.hero.maxHp);
    });

    test('背包应有正确的初始状态', () => {
      const data = AppCore.initGlobalData();

      expect(Array.isArray(data.bag.items)).toBe(true);
      expect(data.bag.items.length).toBe(0);
      expect(data.bag.gold).toBe(0);
    });
  });

  describe('calculateMaxExp()', () => {
    test('应计算正确的升级经验', () => {
      expect(AppCore.calculateMaxExp(1)).toBe(100);
      expect(AppCore.calculateMaxExp(2)).toBe(Math.floor(100 * 1.2));
      expect(AppCore.calculateMaxExp(10)).toBe(Math.floor(100 * Math.pow(1.2, 9)));
    });

    test('经验需求应随等级增加', () => {
      const exp1 = AppCore.calculateMaxExp(1);
      const exp10 = AppCore.calculateMaxExp(10);

      expect(exp10).toBeGreaterThan(exp1);
    });
  });

  describe('addExp()', () => {
    test('应正确增加经验值', () => {
      const hero = testUtils.createMockHero({ exp: 0, maxExp: 100 });
      const result = AppCore.addExp(hero, 50);

      expect(result.gained).toBe(50);
      expect(hero.exp).toBe(50);
      expect(result.levelUps).toBe(0);
    });

    test('经验达到上限应升级', () => {
      const hero = testUtils.createMockHero({
        level: 1,
        exp: 90,
        maxExp: 100,
        maxHp: 100,
        maxMp: 50,
        attack: 10,
        defense: 5,
        speed: 8
      });

      const result = AppCore.addExp(hero, 20);

      expect(result.levelUps).toBe(1);
      expect(hero.level).toBe(2);
      expect(hero.exp).toBe(10); // 90 + 20 - 100
    });

    test('应支持连续升级', () => {
      const hero = testUtils.createMockHero({
        level: 1,
        exp: 0,
        maxExp: 100,
        maxHp: 100,
        maxMp: 50,
        attack: 10,
        defense: 5,
        speed: 8
      });

      const result = AppCore.addExp(hero, 350); // 足够升3级

      expect(result.levelUps).toBeGreaterThanOrEqual(2);
      expect(hero.level).toBeGreaterThanOrEqual(3);
    });

    test('升级后应恢复HP和MP', () => {
      const hero = testUtils.createMockHero({
        level: 1,
        exp: 90,
        maxExp: 100,
        hp: 50, // 不满血
        maxHp: 100,
        mp: 20, // 不满蓝
        maxMp: 50
      });

      AppCore.addExp(hero, 20);

      expect(hero.hp).toBe(hero.maxHp);
      expect(hero.mp).toBe(hero.maxMp);
    });
  });

  describe('levelUp()', () => {
    test('应提升等级', () => {
      const hero = testUtils.createMockHero({ level: 1 });
      AppCore.levelUp(hero);

      expect(hero.level).toBe(2);
    });

    test('应增加属性', () => {
      const hero = testUtils.createMockHero({
        level: 1,
        maxHp: 100,
        maxMp: 50,
        attack: 10,
        defense: 5,
        speed: 8
      });

      const oldStats = { ...hero };
      AppCore.levelUp(hero);

      expect(hero.maxHp).toBeGreaterThan(oldStats.maxHp);
      expect(hero.maxMp).toBeGreaterThan(oldStats.maxMp);
      expect(hero.attack).toBeGreaterThan(oldStats.attack);
      expect(hero.defense).toBeGreaterThan(oldStats.defense);
    });
  });

  describe('getTotalStats()', () => {
    test('应返回基础属性（无装备）', () => {
      const hero = testUtils.createMockHero({
        attack: 20,
        defense: 10,
        equipment: {}
      });

      const stats = AppCore.getTotalStats(hero);

      expect(stats.attack).toBe(20);
      expect(stats.defense).toBe(10);
    });

    test('应累加装备属性', () => {
      const hero = testUtils.createMockHero({
        attack: 20,
        defense: 10,
        equipment: {
          weapon: { attack: 15 },
          armor: { defense: 20, hp: 50 }
        }
      });

      const stats = AppCore.getTotalStats(hero);

      expect(stats.attack).toBe(35); // 20 + 15
      expect(stats.defense).toBe(30); // 10 + 20
      expect(stats.hp).toBe(150); // 100 + 50
    });
  });

  describe('saveGameData()', () => {
    beforeEach(() => {
      // Mock wx.setStorageSync
      wx.setStorageSync = jest.fn((key, data) => {
        wx._storage[key] = JSON.parse(JSON.stringify(data));
      });
    });

    test('应成功保存游戏数据', () => {
      const result = AppCore.saveGameData(mockGlobalData);

      expect(result.success).toBe(true);
      expect(wx.setStorageSync).toHaveBeenCalledWith('gameData', expect.any(Object));
    });

    test('应包含保存时间', () => {
      AppCore.saveGameData(mockGlobalData);

      const saveCall = wx.setStorageSync.mock.calls[0];
      expect(saveCall[1].saveTime).toBeDefined();
    });
  });

  describe('loadGameData()', () => {
    test('应成功加载游戏数据', () => {
      // 先保存数据
      wx.setStorageSync('gameData', { hero: mockGlobalData.hero, bag: mockGlobalData.bag });

      const result = AppCore.loadGameData();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('无存档时应返回失败', () => {
      wx._storage = {}; // 清空存储

      const result = AppCore.loadGameData();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('no_save');
    });
  });

  describe('hasSaveData()', () => {
    test('有存档时应返回true', () => {
      wx.setStorageSync('gameData', { hero: {}, bag: {} });

      expect(AppCore.hasSaveData()).toBe(true);
    });

    test('无存档时应返回false', () => {
      wx._storage = {};

      expect(AppCore.hasSaveData()).toBe(false);
    });
  });

  describe('addGold()', () => {
    test('应正确增加金币', () => {
      const bag = { gold: 100 };
      const result = AppCore.addGold(bag, 50);

      expect(result.success).toBe(true);
      expect(bag.gold).toBe(150);
      expect(result.newAmount).toBe(150);
    });
  });

  describe('spendGold()', () => {
    test('应正确消耗金币', () => {
      const bag = { gold: 100 };
      const result = AppCore.spendGold(bag, 30);

      expect(result.success).toBe(true);
      expect(bag.gold).toBe(70);
    });

    test('金币不足时应失败', () => {
      const bag = { gold: 50 };
      const result = AppCore.spendGold(bag, 100);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_gold');
      expect(bag.gold).toBe(50); // 不应扣减
    });
  });
});
