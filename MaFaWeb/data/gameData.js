/**
 * 游戏数据统一导出
 * 方便 mock 模块引用
 */

const { MONSTERS } = require('./monsters')
const { ITEMS } = require('./items')
const { DUNGEONS } = require('./dungeons')

module.exports = {
  MONSTERS,
  ITEMS,
  DUNGEONS
}
