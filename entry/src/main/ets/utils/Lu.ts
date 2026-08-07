import hilog from '@ohos.hilog';

/**
 * 鸿蒙日志工具类
 * 支持分级打印：DEBUG/INFO/WARN/ERROR/FATAL
 * 自动获取调用类名，无需手动传入
 * 可全局控制日志开关，发布环境关闭日志
 */
export class Lu {
  // 日志开关（发布环境设为 false，关闭所有日志）
  private static readonly IS_LOG_ENABLE = true;
  // 日志域（自定义，建议使用应用包名对应的数字或自定义标识，范围 0x0~0xFFFF）
  private static readonly LOG_DOMAIN = 0x1000;
  // 日志标签（便于筛选日志）
  private static readonly LOG_TAG = "BleControlApp";

  /**
   * 获取调用类名（自动获取当前执行日志的类/组件名）
   */
  private static getClassName(): string {
    try {
      // 通过错误栈获取调用信息
      const error = new Error();
      const stack = error.stack?.split('\n') || [];
      // 栈结构：0-Error本身，1-当前getClassName方法，2-日志方法（如d/i/w），3-调用者
      const callerLine = stack[3] || '';
      // 匹配类名（适配 ArkTS 组件/工具类命名）
      const classNameMatch = callerLine.match(/at\s+(.+?)\./);
      return classNameMatch ? classNameMatch[1] : "UnknownClass";
    } catch (e) {
      return "UnknownClass";
    }
  }

  /**
   * DEBUG 级别日志（调试信息，开发环境使用）
   * @param message 日志内容
   * @param args 可变参数（支持格式化占位符）
   */
  public static d(message: string, ...args: any[]): void {
    if (!this.IS_LOG_ENABLE) {
      return;
    }
    const className = this.getClassName();
    hilog.debug(
      this.LOG_DOMAIN,
      `${this.LOG_TAG}===${className}`,
      `[DEBUG] ${message}`,
      args
    );
  }

  /**
   * INFO 级别日志（普通信息，如流程节点）
   * @param message 日志内容
   * @param args 可变参数（支持格式化占位符）
   */
  public static i(message: string, ...args: any[]): void {
    if (!this.IS_LOG_ENABLE) {
      return;
    }
    const className = this.getClassName();
    hilog.info(
      this.LOG_DOMAIN,
      `${this.LOG_TAG}===${className}`,
      `[INFO] ${message}`,
      args
    );
  }

  /**
   * WARN 级别日志（警告信息，如非致命异常）
   * @param message 日志内容
   * @param args 可变参数（支持格式化占位符）
   */
  public static w(message: string, ...args: any[]): void {
    if (!this.IS_LOG_ENABLE) {
      return;
    }
    const className = this.getClassName();
    hilog.warn(
      this.LOG_DOMAIN,
      `${this.LOG_TAG}===${className}`,
      `[WARN] ${message}`,
      args
    );
  }

  /**
   * ERROR 级别日志（错误信息，如业务异常）
   * @param message 日志内容
   * @param args 可变参数（支持格式化占位符）
   */
  public static e(message: string, ...args: any[]): void {
    if (!this.IS_LOG_ENABLE) {
      return;
    }
    const className = this.getClassName();
    hilog.error(
      this.LOG_DOMAIN,
      `${this.LOG_TAG}===${className}`,
      `[ERROR] ${message}`,
      args
    );
  }

  /**
   * FATAL 级别日志（致命错误，如程序崩溃）
   * @param message 日志内容
   * @param args 可变参数（支持格式化占位符）
   */
  public static f(message: string, ...args: any[]): void {
    if (!this.IS_LOG_ENABLE) {
      return;
    }
    const className = this.getClassName();
    hilog.fatal(
      this.LOG_DOMAIN,
      `${this.LOG_TAG}===${className}`,
      `[FATAL] ${message}`,
      args
    );
  }
}