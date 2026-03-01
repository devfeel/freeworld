/**
 * 任务完成提示系统
 * 提供友好的任务完成反馈
 */

// 任务完成提示组件
class TaskCompletionNotifier {
  constructor() {
    this.notifiedTasks = new Set() // 记录已通知的任务，避免重复提醒
  }

  // 显示任务完成提示
  showTaskCompletion(task) {
    // 如果该任务已提示过，则跳过
    if (this.notifiedTasks.has(task.id)) {
      return
    }

    // 记录已提示的任务
    this.notifiedTasks.add(task.id)

    // 构造奖励描述
    let rewardDesc = ''
    if (task.rewards.exp) {
      rewardDesc += `经验+${task.rewards.exp} `
    }
    if (task.rewards.gold) {
      rewardDesc += `金币+${task.rewards.gold} `
    }
    if (task.rewards.items && task.rewards.items.length > 0) {
      rewardDesc += `物品+${task.rewards.items.length} `
    }

    // 显示成功提示
    wx.showToast({
      title: `任务完成！${rewardDesc.trim()}`,
      icon: 'success',
      duration: 2000
    })

    // 如果有成就称号，额外提示
    if (task.rewards.title) {
      setTimeout(() => {
        wx.showModal({
          title: '获得称号',
          content: `恭喜获得称号：${task.rewards.title}`,
          showCancel: false,
          success: () => {
            // 这里可以添加称号系统相关逻辑
          }
        })
      }, 2000)
    }
  }

  // 重置通知记录（比如用于新游戏开始）
  resetNotifiedTasks() {
    this.notifiedTasks.clear()
  }

  // 检查是否已通知过某任务
  hasNotified(taskId) {
    return this.notifiedTasks.has(taskId)
  }
}

// 创建单例实例
const taskNotifier = new TaskCompletionNotifier()

module.exports = {
  taskNotifier
}