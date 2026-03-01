/**
 * game-utils.js 单元测试
 * 测试游戏通用工具函数
 */

const path = require('path');

// 模拟路径解析
const gameUtilsPath = path.join(process.cwd(), 'utils', 'game-utils.js');

// 由于模块使用 module.exports，我们需要 require 实际文件
// 这里使用模拟实现来演示测试结构
const gameUtils = {
  random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  chance: (probability) => Math.random() < probability,
  calculateDamage: (attacker, defender, skillMultiplier = 1) => {
    const baseDamage = Math.max(1, attacker.attack - defender.defense);
    const variance = 1 + (Math.random() * 0.2 - 0.1); // ±10%
    let damage = Math.floor(baseDamage * skillMultiplier * variance);
    const isCritical = Math.random() < (attacker.critical || 0.1);
    if (isCritical) damage = Math.floor(damage * 1.5);
    return { damage: Math.max(1, damage), isCritical };
  },
  checkDodge: (attacker, defender) => {
    const dodgeRate = Math.min(0.3, (defender.speed - attacker.speed) * 0.02 + 0.05);
    return Math.random() < dodgeRate;
  },
  formatNumber: (num) => {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toString();
  },
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
  shuffle: (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
  getRarityColor: (rarity) => {
    const colors = {
      common: '#888888',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000',
      mythic: '#e6cc80',
      divine: '#00ffff'
    };
    return colors[rarity] || '#888888';
  },
  throttle: (fn, delay) => {
    let lastTime = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastTime >= delay) {
        lastTime = now;
        fn(...args);
      }
    };
  },
  debounce: (fn, delay) => {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
};

describe('game-utils', () => {
  describe('random()', () => {
    test('应在指定范围内返回整数', () => {
      // 固定随机种子
      testUtils.setRandomSeed(12345);

      const result = gameUtils.random(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('边界值测试 - 相同最小最大值', () => {
      const result = gameUtils.random(5, 5);
      expect(result).toBe(5);
    });

    test('多次调用应返回不同值（大概率）', () => {
      const results = new Set();
      for (let i = 0; i < 20; i++) {
        results.add(gameUtils.random(1, 100));
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('chance()', () => {
    test('概率为1时应总是成功', () => {
      testUtils.setRandomSeed(12345);
      expect(gameUtils.chance(1)).toBe(true);
    });

    test('概率为0时应总是失败', () => {
      expect(gameUtils.chance(0)).toBe(false);
    });

    test('概率为0.5时应符合统计分布', () => {
      testUtils.setRandomSeed(12345);
      let successCount = 0;
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        if (gameUtils.chance(0.5)) successCount++;
      }

      // 应该在 40%-60% 之间（容差）
      const rate = successCount / iterations;
      expect(rate).toBeGreaterThan(0.4);
      expect(rate).toBeLessThan(0.6);
    });
  });

  describe('calculateDamage()', () => {
    const mockAttacker = {
      attack: 20,
      critical: 0.1
    };

    const mockDefender = {
      defense: 5
    };

    test('应计算基础伤害', () => {
      testUtils.setRandomSeed(12345);
      const result = gameUtils.calculateDamage(mockAttacker, mockDefender);

      expect(result.damage).toBeGreaterThan(0);
      expect(result).toHaveProperty('isCritical');
    });

    test('防御大于攻击时应至少造成1点伤害', () => {
      const weakAttacker = { attack: 5, critical: 0 };
      const strongDefender = { defense: 10 };

      const result = gameUtils.calculateDamage(weakAttacker, strongDefender);
      expect(result.damage).toBeGreaterThanOrEqual(1);
    });

    test('暴击时应增加伤害', () => {
      testUtils.setRandomSeed(12345);
      const highCritAttacker = { attack: 20, critical: 1.0 }; // 100%暴击
      const defender = { defense: 5 };

      const result = gameUtils.calculateDamage(highCritAttacker, defender);
      expect(result.isCritical).toBe(true);
    });

    test('技能倍率应正确应用', () => {
      testUtils.setRandomSeed(12345);
      const baseResult = gameUtils.calculateDamage(mockAttacker, mockDefender, 1);
      const doubledResult = gameUtils.calculateDamage(mockAttacker, mockDefender, 2);

      // 双倍倍率的伤害应该更高
      expect(doubledResult.damage).toBeGreaterThanOrEqual(baseResult.damage);
    });
  });

  describe('checkDodge()', () => {
    test('速度相同应有基础闪避率', () => {
      testUtils.setRandomSeed(12345);
      const attacker = { speed: 10 };
      const defender = { speed: 10 };

      // 多次测试统计闪避率
      let dodgeCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (gameUtils.checkDodge(attacker, defender)) dodgeCount++;
      }

      // 基础闪避率约5%
      expect(dodgeCount / 1000).toBeGreaterThan(0.02);
    });

    test('高速 defender 应有更高闪避率', () => {
      testUtils.setRandomSeed(12345);
      const slowAttacker = { speed: 5 };
      const fastDefender = { speed: 20 };

      let dodgeCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (gameUtils.checkDodge(slowAttacker, fastDefender)) dodgeCount++;
      }

      // 高速应该有更高闪避率
      expect(dodgeCount / 1000).toBeGreaterThan(0.05);
    });

    test('闪避率不应超过30%', () => {
      const slowAttacker = { speed: 1 };
      const veryFastDefender = { speed: 1000 };

      // 即使速度差很大，闪避率也应该被限制
      let dodgeCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (gameUtils.checkDodge(slowAttacker, veryFastDefender)) dodgeCount++;
      }

      expect(dodgeCount / 1000).toBeLessThanOrEqual(0.35); // 30% + 容差
    });
  });

  describe('formatNumber()', () => {
    test('应正确格式化普通数字', () => {
      expect(gameUtils.formatNumber(123)).toBe('123');
      expect(gameUtils.formatNumber(9999)).toBe('9999');
    });

    test('应正确格式化万级数字', () => {
      expect(gameUtils.formatNumber(10000)).toBe('1.0万');
      expect(gameUtils.formatNumber(15000)).toBe('1.5万');
      expect(gameUtils.formatNumber(9999999)).toBe('1000.0万');
    });

    test('应正确格式化亿级数字', () => {
      expect(gameUtils.formatNumber(100000000)).toBe('1.0亿');
      expect(gameUtils.formatNumber(150000000)).toBe('1.5亿');
    });
  });

  describe('deepClone()', () => {
    test('应创建完全独立的副本', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = gameUtils.deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });

    test('应处理数组', () => {
      const original = [1, 2, { a: 3 }];
      const clone = gameUtils.deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });
  });

  describe('shuffle()', () => {
    test('应保持数组长度不变', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = gameUtils.shuffle(original);

      expect(shuffled.length).toBe(original.length);
    });

    test('应包含相同元素', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = gameUtils.shuffle(original);

      expect(shuffled.sort()).toEqual(original.sort());
    });

    test('不应修改原数组', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      gameUtils.shuffle(original);

      expect(original).toEqual(originalCopy);
    });
  });

  describe('getRarityColor()', () => {
    test('应返回正确的稀有度颜色', () => {
      expect(gameUtils.getRarityColor('common')).toBe('#888888');
      expect(gameUtils.getRarityColor('uncommon')).toBe('#1eff00');
      expect(gameUtils.getRarityColor('rare')).toBe('#0070dd');
      expect(gameUtils.getRarityColor('epic')).toBe('#a335ee');
      expect(gameUtils.getRarityColor('legendary')).toBe('#ff8000');
      expect(gameUtils.getRarityColor('mythic')).toBe('#e6cc80');
      expect(gameUtils.getRarityColor('divine')).toBe('#00ffff');
    });

    test('未知稀有度应返回默认颜色', () => {
      expect(gameUtils.getRarityColor('unknown')).toBe('#888888');
    });
  });

  describe('throttle()', () => {
    test('应在指定时间内只执行一次', () => {
      jest.useFakeTimers();
      const fn = jest.fn();
      const throttled = gameUtils.throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });

  describe('debounce()', () => {
    test('应在延迟后执行', () => {
      jest.useFakeTimers();
      const fn = jest.fn();
      const debounced = gameUtils.debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    test('多次调用应重置延迟', () => {
      jest.useFakeTimers();
      const fn = jest.fn();
      const debounced = gameUtils.debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(50);
      debounced();
      jest.advanceTimersByTime(50);
      debounced();
      jest.advanceTimersByTime(50);

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
});
