
export class LogUtil {
  /**
   * 简单日志输出，包含类名和行号
   * @param message 日志消息
   * @param args 可选参数
   */
  public static d(message: string, ...args: any[]): void {
    // 获取调用栈信息
    const stack = new Error().stack || '';

    // 解析调用栈获取类名和行号
    const callerInfo = this.parseCallerInfo(stack);

    // 格式化消息
    const formattedMessage = this.formatMessage(callerInfo, message, ...args);

    // 输出到控制台
    console.log("==="+formattedMessage);
  }

  /**
   * 解析调用栈信息
   */
  private static parseCallerInfo(stack: string): { className: string, lineNumber: string } {
    // 默认值
    const defaultInfo = {
      className: 'UnknownClass',
      lineNumber: '0'
    };

    try {
      // 分割调用栈
      const stackLines = stack.split('\n');

      // 查找调用log方法的行（通常在第3行）
      // 第0行: Error
      // 第1行: at SimpleLog.log
      // 第2行: 调用log的地方
      if (stackLines.length >= 3) {
        const callerLine = stackLines[2].trim();

        // 解析类名和行号
        // 格式通常为: at ClassName.method (file:///.../entry/src/main/ets/...:行号:列号)
        const match = callerLine.match(/at\s+(\w+)\.?\w*\s+\(.*\/(\w+)\.ets:(\d+)/);
        if (match) {
          return {
            className: match[2], // 类名（文件名）
            lineNumber: match[3] // 行号
          };
        }

        // 尝试其他格式匹配
        const simpleMatch = callerLine.match(/at\s+(\w+)/);
        if (simpleMatch) {
          return {
            className: simpleMatch[1],
            lineNumber: '0'
          };
        }
      }
    } catch (error) {
      console.error('解析调用栈失败:', error);
    }

    return defaultInfo;
  }

  /**
   * 格式化消息
   */
  private static formatMessage(callerInfo: { className: string, lineNumber: string },
    message: string, ...args: any[]): string {
    // 格式化时间
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // 如果有参数，格式化消息
    let formattedMessage = message;
    if (args && args.length > 0) {
      try {
        // 简单格式化：用JSON.stringify显示对象
        formattedMessage = `${message} ${args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg
        ).join(' ')}`;
      } catch (error) {
        formattedMessage = `${message} [格式化错误]`;
      }
    }

    // 最终格式: [时间] [类名:行号] 消息
    return `[${timeStr}] [${callerInfo.className}:${callerInfo.lineNumber}] ${formattedMessage}`;
  }
}

// 快捷导出
export const log = LogUtil.d;