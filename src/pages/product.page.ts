import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/logger';

/**
 * ProductPage handles viewing product specifications and adding items to cart.
 */
export class ProductPage extends BasePage {
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitle = page.locator('h2.name');
    this.productPrice = page.locator('h3.price-container');
    this.productDescription = page.locator('#more-information p');
    this.addToCartButton = page.locator('a:has-text("Add to cart")');
  }

  /**
   * Clicks 'Add to cart', intercepts the native browser alert,
   * accepts it, and returns the alert text.
   */
  async addToCart(): Promise<string> {
    Logger.info('Clicking "Add to cart" button');
    await this.addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
    const alertMessage = await this.captureDialogMessage(async () => {
      await this.addToCartButton.click();
    });
    Logger.info(`Product added alert received: "${alertMessage}"`);
    return alertMessage;
  }

  /**
   * Retrieves product name, numeric price, and description.
   */
  async getProductDetails(): Promise<{ title: string; price: number; description: string }> {
    await this.productTitle.waitFor({ state: 'visible', timeout: 10000 });
    const title = (await this.productTitle.textContent())?.trim() || '';
    const priceText = (await this.productPrice.textContent()) || '';
    // Extracts numeric digits from strings like "$360 *includes tax"
    const match = priceText.match(/\d+/);
    const price = match ? parseInt(match[0], 10) : 0;
    const description = (await this.productDescription.textContent())?.trim() || '';

    return { title, price, description };
  }
}
