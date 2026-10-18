import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/logger';

/**
 * LoginPage handles Login and Sign Up modal interactions.
 */
export class LoginPage extends BasePage {
  // Login Modal elements
  readonly loginModal: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginCloseButton: Locator;
  readonly loginCloseIcon: Locator;

  // Sign Up Modal elements
  readonly signUpModal: Locator;
  readonly signUpUsernameInput: Locator;
  readonly signUpPasswordInput: Locator;
  readonly signUpSubmitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loginModal = page.locator('#logInModal');
    this.usernameInput = page.locator('#loginusername');
    this.passwordInput = page.locator('#loginpassword');
    this.loginButton = page.locator('#logInModal button[onclick="logIn()"]');
    this.loginCloseButton = page.locator('#logInModal button.btn-secondary:has-text("Close")');
    this.loginCloseIcon = page.locator('#logInModal button.close');

    this.signUpModal = page.locator('#signInModal');
    this.signUpUsernameInput = page.locator('#sign-username');
    this.signUpPasswordInput = page.locator('#sign-password');
    this.signUpSubmitButton = page.locator('#signInModal button[onclick="register()"]');
  }

  /**
   * Fills credentials and clicks the Login button.
   */
  async submitLoginForm(username: string, password: string): Promise<void> {
    Logger.info(`Submitting login form with username: "${username}"`);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Logs in with valid credentials, verifying successful session and greeting.
   */
  async loginWithValidCredentials(username: string, password: string): Promise<void> {
    await this.openLoginModal();
    await this.submitLoginForm(username, password);

    // Wait for modal to dismiss and user greeting to appear
    await expect(this.loginModal).toBeHidden({ timeout: 10000 });
    await expect(this.navUserGreeting).toHaveText(`Welcome ${username}`, { timeout: 10000 });
    await expect(this.navLogout).toBeVisible();
    Logger.info(`Successfully logged in as ${username}`);
  }

  /**
   * Submits login and captures the error alert (e.g., Wrong password, User does not exist, etc.)
   */
  async loginExpectingAlert(username: string, password: string): Promise<string> {
    await this.openLoginModal();
    const alertMessage = await this.captureDialogMessage(async () => {
      await this.submitLoginForm(username, password);
    });
    Logger.info(`Captured alert during login: "${alertMessage}"`);
    return alertMessage;
  }

  /**
   * Signs up a new user account and intercepts the resulting alert.
   */
  async registerNewUser(username: string, password: string): Promise<string> {
    await this.openSignUpModal();
    await this.signUpUsernameInput.fill(username);
    await this.signUpPasswordInput.fill(password);

    const alertMessage = await this.captureDialogMessage(async () => {
      await this.signUpSubmitButton.click();
    });
    Logger.info(`Sign up alert response: "${alertMessage}"`);
    return alertMessage;
  }

  /**
   * Dismiss the login modal via the secondary Close button.
   */
  async dismissLoginModal(): Promise<void> {
    await this.loginCloseButton.click();
    await expect(this.loginModal).toBeHidden();
  }
}
