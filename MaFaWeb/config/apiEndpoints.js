/**
 * API端点配置
 * 集中管理所有API端点路径
 */

const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout'
  },
  PLAYER: {
    INFO: '/api/player/info',
    UPDATE: '/api/player/update',
    HEARTBEAT: '/api/player/heartbeat'
  },
  HERO: {
    INFO: '/api/hero/info',
    UPDATE: '/api/hero/update',
    EQUIP: '/api/hero/equip',
    UNEQUIP: '/api/hero/unequip'
  },
  BAG: {
    LIST: '/api/bag/list',
    USE: '/api/bag/use',
    DELETE: '/api/bag/delete'
  },
  SHOP: {
    LIST: '/api/shop/list',
    BUY: '/api/shop/buy'
  },
  RANK: {
    LIST: '/api/rank/list'
  },
  DUNGEON: {
    LIST: '/api/dungeon/list',
    DETAIL: '/api/dungeon/detail',
    ENTER: '/api/dungeon/enter',
    EXPLORE: '/api/dungeon/explore'
  },
  BATTLE: {
    START: '/api/dungeon/battle',
    ATTACK: '/api/battle/attack',
    SKILL: '/api/battle/skill',
    DEFEND: '/api/battle/defend',
    RUN: '/api/battle/run',
    RESULT: '/api/battle/result'
  },
  EXP: {
    INFO: '/api/exp/info',
    REMAINING: '/api/exp/remaining'
  }
}

module.exports = {
  API_ENDPOINTS
}