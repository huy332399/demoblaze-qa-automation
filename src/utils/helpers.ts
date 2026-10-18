/**
 * Helper utility functions for test execution and dynamic data generation.
 */
export class Helpers {
  /**
   * Generates a unique username using a timestamp and random suffix.
   * Useful to register fresh users on DemoBlaze during parallel test runs.
   */
  static generateRandomUsername(prefix = 'qa_user'): string {
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${prefix}_${timestamp}_${randomSuffix}`;
  }

  /**
   * Generates a strong random password.
   */
  static generateRandomPassword(): string {
    return `Pass@${Math.floor(100000 + Math.random() * 900000)}`;
  }

  /**
   * Generates synthetic mock credit card details for checkout.
   */
  static generateMockOrderData() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return {
      name: `Test Buyer ${rand}`,
      country: 'United States',
      city: 'San Francisco',
      card: `411122223333${rand}`,
      month: '12',
      year: '2028',
    };
  }

  /**
   * Safe sleep/delay helper if required for animations.
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
