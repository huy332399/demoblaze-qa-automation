import { Page, Locator, Dialog } from '@playwright/test';
import { Logger } from '../utils/logger';

/**
 * BasePage serves as the foundational class for all Page Objects.
 * Contains shared locators (Navbar, footer), common actions, and alert/dialog handlers.
 */
export class BasePage {
  readonly page: Page;

  // Global Navigation Bar Locators
  readonly brandLogo: Locator;
  readonly navHome: Locator;
  readonly navContact: Locator;
  readonly navAboutUs: Locator;
  readonly navCart: Locator;
  readonly navLogin: Locator;
  readonly navLogout: Locator;
  readonly navSignUp: Locator;
  readonly navUserGreeting: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandLogo = page.locator('#nava');
    this.navHome = page.locator('a.nav-link:has-text("Home")');
    this.navContact = page.locator('a.nav-link[data-target="#exampleModal"]');
    this.navAboutUs = page.locator('a.nav-link[data-target="#videoModal"]');
    this.navCart = page.locator('#cartur');
    this.navLogin = page.locator('#login2');
    this.navLogout = page.locator('#logout2');
    this.navSignUp = page.locator('#signin2');
    this.navUserGreeting = page.locator('#nameofuser');
  }

  /**
   * Navigate to a path relative to baseURL or direct URL.
   */
  async navigateTo(path = '/'): Promise<void> {
    Logger.info(`Navigating to ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Open the Cart page from any screen.
   */
  async goToCart(): Promise<void> {
    Logger.info('Clicking Cart in navigation bar');
    await this.navCart.click();
    await this.page.waitForURL(/.*cart\.html/, { timeout: 15000 });
  }

  /**
   * Open Home page from navbar.
   */
  async goToHome(): Promise<void> {
    await this.navHome.click();
    await this.page.waitForURL(/.*(index\.html)?$/, { timeout: 15000 });
  }

  /**
   * Open the Login Modal from the navbar.
   */
  async openLoginModal(): Promise<void> {
    Logger.info('Opening Login modal');
    await this.navLogin.click();
    await this.page.locator('#logInModal').waitFor({ state: 'visible', timeout: 8000 });
  }

  /**
   * Open the Sign Up Modal from the navbar.
   */
  async openSignUpModal(): Promise<void> {
    Logger.info('Opening Sign Up modal');
    await this.navSignUp.click();
    await this.page.locator('#signInModal').waitFor({ state: 'visible', timeout: 8000 });
  }

  /**
   * Perform logout.
   */
  async logout(): Promise<void> {
    Logger.info('Logging out user');
    await this.navLogout.click();
    await this.navLogin.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Get logged-in user welcome text (e.g., "Welcome username").
   */
  async getUserGreetingText(): Promise<string> {
    await this.navUserGreeting.waitFor({ state: 'visible', timeout: 10000 });
    return (await this.navUserGreeting.textContent())?.trim() || '';
  }

  /**
   * Executes an action that triggers a native browser alert/dialog,
   * captures the message text, automatically accepts it, and returns the message.
   */
  async captureDialogMessage(action: () => Promise<void>): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.page.off('dialog', dialogHandler);
        reject(new Error('Timeout waiting for browser dialog'));
      }, 10000);

      const dialogHandler = async (dialog: Dialog) => {
        clearTimeout(timeout);
        this.page.off('dialog', dialogHandler);
        const msg = dialog.message();
        Logger.info(`Dialog intercepted: "${msg}"`);
        await dialog.accept().catch(() => {});
        resolve(msg);
      };

      this.page.once('dialog', dialogHandler);
      action().catch((err) => {
        clearTimeout(timeout);
        this.page.off('dialog', dialogHandler);
        reject(err);
      });
    });
  }
}
