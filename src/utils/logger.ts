/**
 * Simple structured console logger for test execution traceability.
 */
export class Logger {
  static info(message: string, ...args: unknown[]) {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...args);
  }

  static warn(message: string, ...args: unknown[]) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...args);
  }

  static error(message: string, ...args: unknown[]) {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...args);
  }

  static step(stepNumber: number | string, description: string) {
    console.log(`  ➤ Step ${stepNumber}: ${description}`);
  }
}
