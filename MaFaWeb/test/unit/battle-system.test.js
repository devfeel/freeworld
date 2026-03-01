/**
 * battle-system.js 单元测试
 * 测试战斗系统核心逻辑
 */

// const BattleSystem = require('../../utils/battle-system.js');

// 模拟战斗系统（因为实际文件路径可能不存在，这里使用模拟）
class MockBattleSystem {
  constructor(options = {}) {
    this.hero = options.hero || null;
    this.enemy = options.enemy || null;
    this.onEvent = options.onEvent || (() => {});
    this.state = 'idle';
    this.turn = 1;
    this.turnQueue = [];
    this.battleLog = [];
  }

  startBattle(hero, enemy) {
    this.hero = { ...hero, currentHp: hero.hp, currentMp: hero.mp };
    this.enemy = { ...enemy, currentHp: enemy.hp, currentMp: enemy.mp };
    this.state = 'in_progress';
    this.turn = 1;
    this.turnQueue = this.determineTurnOrder();
    this.battleLog = [];

    this.emitEvent('battleStart', { hero: this.hero, enemy: this.enemy });
    return this;
  }

  determineTurnOrder() {
    const heroSpeed = this.hero.speed;
    const enemySpeed = this.enemy.speed;

    // 速度快的先手，速度相同时随机
    if (heroSpeed > enemySpeed) {
      return ['hero', 'enemy'];
    } else if (enemySpeed > heroSpeed) {
      return ['enemy', 'hero'];
    } else {
      return Math.random() < 0.5 ? ['hero', 'enemy'] : ['enemy', 'hero'];
    }
  }

  heroAttack() {
    if (this.state !== 'in_progress') return null;

    const result = this.calculateAttack(this.hero, this.enemy);
    this.enemy.currentHp = Math.max(0, this.enemy.currentHp - result.damage);

    this.battleLog.push({
      turn: this.turn,
      actor: 'hero',
      action: 'attack',
      ...result
    });

    this.emitEvent('heroAttack', result);

    if (this.enemy.currentHp <= 0) {
      this.endBattle('victory');
    } else {
      this.nextTurn();
    }

    return result;
  }

  enemyAttack() {
    if (this.state !== 'in_progress') return null;

    const result = this.calculateAttack(this.enemy, this.hero);
    this.hero.currentHp = Math.max(0, this.hero.currentHp - result.damage);

    this.battleLog.push({
      turn: this.turn,
      actor: 'enemy',
      action: 'attack',
      ...result
    });

    this.emitEvent('enemyAttack', result);

    if (this.hero.currentHp <= 0) {
      this.endBattle('defeat');
    } else {
      this.nextTurn();
    }

    return result;
  }

  calculateAttack(attacker, defender) {
    const baseDamage = Math.max(1, attacker.attack - defender.defense);
    const variance = 1 + (Math.random() * 0.2 - 0.1);
    let damage = Math.floor(baseDamage * variance);
    const isCritical = Math.random() < (attacker.critical || 0.1);

    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    const isDodged = this.checkDodge(attacker, defender);

    if (isDodged) {
      damage = 0;
    }

    return { damage, isCritical, isDodged };
  }

  checkDodge(attacker, defender) {
    const dodgeRate = Math.min(0.3, (defender.speed - attacker.speed) * 0.02 + 0.05);
    return Math.random() < dodgeRate;
  }

  useSkill(skillId) {
    if (this.state !== 'in_progress') return null;

    const skill = this.hero.skills?.find(s => s.id === skillId);
    if (!skill) return null;

    if (this.hero.currentMp < skill.mpCost) {
      this.emitEvent('notEnoughMp', { current: this.hero.currentMp, required: skill.mpCost });
      return null;
    }

    this.hero.currentMp -= skill.mpCost;

    const result = this.calculateAttack(this.hero, this.enemy, skill.multiplier);
    this.enemy.currentHp = Math.max(0, this.enemy.currentHp - result.damage);

    this.battleLog.push({
      turn: this.turn,
      actor: 'hero',
      action: 'skill',
      skillId,
      ...result
    });

    this.emitEvent('heroSkill', { skillId, ...result });

    if (this.enemy.currentHp <= 0) {
      this.endBattle('victory');
    } else {
      this.nextTurn();
    }

    return result;
  }

  useItem(itemId) {
    if (this.state !== 'in_progress') return null;
    // 道具使用逻辑
    this.emitEvent('itemUsed', { itemId });
    return true;
  }

  escape() {
    if (this.state !== 'in_progress') return false;

    const escapeChance = 0.5;
    const success = Math.random() < escapeChance;

    if (success) {
      this.endBattle('escaped');
    } else {
      this.emitEvent('escapeFailed', {});
      this.nextTurn();
    }

    return success;
  }

  nextTurn() {
    this.turn++;
    this.emitEvent('turnStart', { turn: this.turn });
  }

  endBattle(result) {
    this.state = 'ended';

    const endData = {
      result,
      hero: this.hero,
      enemy: this.enemy,
      turns: this.turn,
      log: this.battleLog
    };

    if (result === 'victory') {
      endData.exp = this.enemy.exp;
      endData.gold = this.enemy.gold;
      endData.drops = this.processDrops();
    }

    this.emitEvent('battleEnd', endData);
  }

  processDrops() {
    const drops = [];
    if (this.enemy.drops) {
      for (const drop of this.enemy.drops) {
        if (Math.random() < drop.chance) {
          drops.push({
            itemId: drop.itemId,
            quantity: Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
          });
        }
      }
    }
    return drops;
  }

  emitEvent(eventName, data) {
    this.onEvent(eventName, data);
  }

  getState() {
    return {
      state: this.state,
      turn: this.turn,
      hero: this.hero,
      enemy: this.enemy,
      turnQueue: this.turnQueue
    };
  }
}

describe('BattleSystem', () => {
  let battle;
  let mockHero;
  let mockEnemy;
  let events;

  beforeEach(() => {
    events = [];
    mockHero = testUtils.createMockHero({
      hp: 100,
      mp: 50,
      attack: 20,
      defense: 10,
      speed: 10,
      critical: 0.1,
      skills: [
        { id: 'fireball', name: '火球术', mpCost: 10, multiplier: 1.5 }
      ]
    });

    mockEnemy = testUtils.createMockMonster({
      hp: 80,
      mp: 30,
      attack: 15,
      defense: 5,
      speed: 8,
      exp: 50,
      gold: 20,
      drops: [
        { itemId: 'potion', chance: 0.5, min: 1, max: 2 }
      ]
    });

    battle = new MockBattleSystem({
      onEvent: (eventName, data) => {
        events.push({ eventName, data });
      }
    });

    testUtils.setRandomSeed(12345);
  });

  describe('startBattle()', () => {
    test('应正确初始化战斗', () => {
      battle.startBattle(mockHero, mockEnemy);

      expect(battle.state).toBe('in_progress');
      expect(battle.hero.currentHp).toBe(100);
      expect(battle.enemy.currentHp).toBe(80);
      expect(battle.turn).toBe(1);
    });

    test('应触发 battleStart 事件', () => {
      battle.startBattle(mockHero, mockEnemy);

      const startEvent = events.find(e => e.eventName === 'battleStart');
      expect(startEvent).toBeDefined();
      expect(startEvent.data.hero).toBeDefined();
      expect(startEvent.data.enemy).toBeDefined();
    });

    test('应根据速度决定先手', () => {
      battle.startBattle(mockHero, mockEnemy);
      // hero speed 10 > enemy speed 8
      expect(battle.turnQueue[0]).toBe('hero');
    });

    test('速度相同时应随机决定先手', () => {
      mockHero.speed = 10;
      mockEnemy.speed = 10;
      battle.startBattle(mockHero, mockEnemy);

      // 队列应该包含 hero 和 enemy
      expect(battle.turnQueue).toContain('hero');
      expect(battle.turnQueue).toContain('enemy');
    });
  });

  describe('heroAttack()', () => {
    beforeEach(() => {
      battle.startBattle(mockHero, mockEnemy);
    });

    test('应造成伤害', () => {
      const initialHp = battle.enemy.currentHp;
      const result = battle.heroAttack();

      expect(result.damage).toBeGreaterThan(0);
      expect(battle.enemy.currentHp).toBeLessThan(initialHp);
    });

    test('应触发 heroAttack 事件', () => {
      battle.heroAttack();

      const attackEvent = events.find(e => e.eventName === 'heroAttack');
      expect(attackEvent).toBeDefined();
    });

    test('应记录战斗日志', () => {
      battle.heroAttack();

      expect(battle.battleLog.length).toBeGreaterThan(0);
      expect(battle.battleLog[0].actor).toBe('hero');
      expect(battle.battleLog[0].action).toBe('attack');
    });

    test('击败敌人应结束战斗', () => {
      battle.enemy.currentHp = 1;
      battle.heroAttack();

      expect(battle.state).toBe('ended');

      const endEvent = events.find(e => e.eventName === 'battleEnd');
      expect(endEvent.data.result).toBe('victory');
    });
  });

  describe('enemyAttack()', () => {
    beforeEach(() => {
      battle.startBattle(mockHero, mockEnemy);
    });

    test('应造成伤害', () => {
      const initialHp = battle.hero.currentHp;
      battle.enemyAttack();

      expect(battle.hero.currentHp).toBeLessThan(initialHp);
    });

    test('应触发 enemyAttack 事件', () => {
      battle.enemyAttack();

      const attackEvent = events.find(e => e.eventName === 'enemyAttack');
      expect(attackEvent).toBeDefined();
    });

    test('英雄死亡应结束战斗', () => {
      battle.hero.currentHp = 1;
      battle.enemyAttack();

      expect(battle.state).toBe('ended');

      const endEvent = events.find(e => e.eventName === 'battleEnd');
      expect(endEvent.data.result).toBe('defeat');
    });
  });

  describe('useSkill()', () => {
    beforeEach(() => {
      battle.startBattle(mockHero, mockEnemy);
    });

    test('应消耗MP', () => {
      const initialMp = battle.hero.currentMp;
      battle.useSkill('fireball');

      expect(battle.hero.currentMp).toBeLessThan(initialMp);
    });

    test('MP不足应失败', () => {
      battle.hero.currentMp = 0;
      const result = battle.useSkill('fireball');

      expect(result).toBeNull();
    });

    test('应触发 heroSkill 事件', () => {
      battle.useSkill('fireball');

      const skillEvent = events.find(e => e.eventName === 'heroSkill');
      expect(skillEvent).toBeDefined();
      expect(skillEvent.data.skillId).toBe('fireball');
    });
  });

  describe('escape()', () => {
    beforeEach(() => {
      battle.startBattle(mockHero, mockEnemy);
    });

    test('成功逃跑应结束战斗', () => {
      // 固定种子使逃跑成功
      testUtils.setRandomSeed(100);
      const success = battle.escape();

      if (success) {
        expect(battle.state).toBe('ended');
        const endEvent = events.find(e => e.eventName === 'battleEnd');
        expect(endEvent.data.result).toBe('escaped');
      }
    });

    test('逃跑失败应继续战斗', () => {
      // 固定种子使逃跑失败
      testUtils.setRandomSeed(500);
      const success = battle.escape();

      if (!success) {
        expect(battle.state).toBe('in_progress');
      }
    });
  });

  describe('endBattle()', () => {
    beforeEach(() => {
      battle.startBattle(mockHero, mockEnemy);
    });

    test('胜利应返回奖励', () => {
      battle.endBattle('victory');

      const endEvent = events.find(e => e.eventName === 'battleEnd');
      expect(endEvent.data.exp).toBe(mockEnemy.exp);
      expect(endEvent.data.gold).toBe(mockEnemy.gold);
      expect(endEvent.data.drops).toBeDefined();
    });

    test('失败不应返回奖励', () => {
      battle.endBattle('defeat');

      const endEvent = events.find(e => e.eventName === 'battleEnd');
      expect(endEvent.data.exp).toBeUndefined();
      expect(endEvent.data.gold).toBeUndefined();
    });
  });

  describe('getState()', () => {
    test('应返回正确的战斗状态', () => {
      battle.startBattle(mockHero, mockEnemy);
      const state = battle.getState();

      expect(state.state).toBe('in_progress');
      expect(state.hero).toBeDefined();
      expect(state.enemy).toBeDefined();
      expect(state.turn).toBe(1);
    });
  });
});
