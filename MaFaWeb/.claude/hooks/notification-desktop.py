#!/usr/bin/env python3
"""
Notification Hook - 桌面通知
将Claude的通知转发到系统桌面通知
"""
import sys
import json
import subprocess
import platform

def send_notification(title: str, message: str):
    """发送系统桌面通知"""
    system = platform.system()

    try:
        if system == 'Darwin':  # macOS
            subprocess.run([
                'osascript', '-e',
                f'display notification "{message}" with title "{title}"'
            ])
        elif system == 'Linux':
            subprocess.run(['notify-send', title, message])
        elif system == 'Windows':
            # Windows Toast通知（推荐方式）
            # 需要先安装：Install-Module -Name BurntToast -Scope CurrentUser
            try:
                # 优先使用BurntToast（更可靠）
                ps_cmd = f'New-BurntToastNotification -Text "{title}", "{message}"'
                result = subprocess.run(['powershell', '-Command', ps_cmd], capture_output=True)
                if result.returncode != 0:
                    raise Exception("BurntToast not available")
            except:
                # 回退方案：使用Windows原生Toast
                ps_cmd = f'''
                [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
                $template = [Windows.UI.Notifications.ToastTemplateType]::ToastText02
                $xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($template)
                $text = $xml.GetElementsByTagName("text")
                $text[0].AppendChild($xml.CreateTextNode("{title}")) | Out-Null
                $text[1].AppendChild($xml.CreateTextNode("{message}")) | Out-Null
                $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
                [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Claude Code").Show($toast)
                '''
                subprocess.run(['powershell', '-Command', ps_cmd], capture_output=True)
    except Exception as e:
        print(f"通知发送失败: {e}", file=sys.stderr)

def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        return

    # 获取消息内容（注意：没有notification_type字段）
    message = input_data.get('message', '')
    session_id = input_data.get('session_id', '')

    if not message:
        return

    # 构建通知标题
    title = "Claude Code"

    # 发送桌面通知
    send_notification(title, message)
    print(f"[Notification] 已发送桌面通知: {message[:50]}...", file=sys.stderr)

if __name__ == '__main__':
    main()