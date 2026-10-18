import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/logger';

/**
 * HomePage represents the product catalog and categories view.
 */
export class HomePage extends BasePage {
  readonly categoryPhones: Locator;
  readonly categoryLaptops: Locator;
  readonly categoryMonitors: Locator;
  readonly productCards: Locator;
  readonly carouselIndicators: Locator;

  constructor(page: Page) {
    super(page);
    this.categoryPhones = page.locator('a.list-group-item:has-text("Phones")');
    this.categoryLaptops = page.locator('a.list-group-item:has-text("Laptops")');
    this.categoryMonitors = page.locator('a.list-group-item:has-text("Monitors")');
    this.productCards = page.locator('#tbodyid .card');
    this.carouselIndicators = page.locator('#carouselExampleIndicators');
  }

  /**
   * Filter catalog by category name.
   */
  async filterByCategory(category: 'Phones' | 'Laptops' | 'Monitors'): Promise<void> {
    Logger.info(`Filtering products by category: ${category}`);
    if (category === 'Phones') await this.categoryPhones.click();
    else if (category === 'Laptops') await this.categoryLaptops.click();
    else if (category === 'Monitors') await this.categoryMonitors.click();

    // Allow ajax cards reload
    await this.page.waitForResponse((res) => res.url().includes('/bycat') && res.status() === 200, {
      timeout: 10000,
    }).catch(() => {});
  }

  /**
   * Select a product card by title and navigate to product details.
   */
  async selectProduct(productTitle: string): Promise<void> {
    Logger.info(`Selecting product "${productTitle}" from catalog`);
    const productLink = this.page.locator(`a.hrefch:has-text("${productTitle}")`).first();
    await productLink.waitFor({ state: 'visible', timeout: 10000 });
    await productLink.click();
    await this.page.waitForURL(/.*prod\.html\?idp_=.*/, { timeout: 15000 });
  }

  /**
   * Retrieve titles of all currently displayed products.
   */
  async getDisplayedProductTitles(): Promise<string[]> {
    await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 });
    return this.page.locator('#tbodyid h4.card-title a').allInnerTexts();
  }
}
