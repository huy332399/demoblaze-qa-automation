import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { OrderModalPage } from './order-modal.page';
import { Logger } from '../utils/logger';

export interface CartItem {
  title: string;
  price: number;
}

/**
 * CartPage represents the shopping cart view where items, totals, and deletions are handled.
 */
export class CartPage extends BasePage {
  readonly cartTable: Locator;
  readonly cartRows: Locator;
  readonly totalPriceLabel: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartTable = page.locator('table.table');
    this.cartRows = page.locator('#tbodyid tr');
    this.totalPriceLabel = page.locator('#totalp');
    this.placeOrderButton = page.locator('button.btn-success:has-text("Place Order")');
  }

  /**
   * Waits for cart items or empty state to settle.
   */
  async waitForCartLoaded(): Promise<void> {
    Logger.info('Waiting for cart contents to load');
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for viewcart AJAX response
    await this.page.waitForResponse((res) => res.url().includes('/viewcart'), { timeout: 10000 }).catch(() => {});
    // Give table rows time to render from asynchronous /view calls
    await this.cartRows.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  /**
   * Retrieves all product items currently listed in the cart table.
   */
  async getCartItems(): Promise<CartItem[]> {
    await this.waitForCartLoaded();
    const count = await this.cartRows.count();
    const items: CartItem[] = [];

    for (let i = 0; i < count; i++) {
      const row = this.cartRows.nth(i);
      const title = (await row.locator('td').nth(1).textContent())?.trim() || '';
      const priceText = (await row.locator('td').nth(2).textContent())?.trim() || '0';
      items.push({
        title,
        price: parseInt(priceText, 10) || 0,
      });
    }

    return items;
  }

  /**
   * Reads and parses the total price displayed on the cart page.
   */
  async getTotalPrice(): Promise<number> {
    const rawTotal = (await this.totalPriceLabel.textContent())?.trim() || '0';
    return parseInt(rawTotal, 10) || 0;
  }

  /**
   * Deletes a cart item by its row index.
   */
  async deleteItemByIndex(index = 0): Promise<void> {
    const row = this.cartRows.nth(index);
    const deleteButton = row.locator('a:has-text("Delete")');
    Logger.info(`Deleting cart item at index ${index}`);

    const [response] = await Promise.all([
      this.page.waitForResponse((res) => res.url().includes('/deleteitem') && res.status() === 200, {
        timeout: 10000,
      }),
      deleteButton.click(),
    ]);

    // Page reloads after delete in demoblaze
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(800);
  }

  /**
   * Deletes a cart item matching a product title.
   */
  async deleteItemByTitle(title: string): Promise<void> {
    Logger.info(`Deleting cart item: "${title}"`);
    const count = await this.cartRows.count();
    for (let i = 0; i < count; i++) {
      const row = this.cartRows.nth(i);
      const rowTitle = (await row.locator('td').nth(1).textContent())?.trim();
      if (rowTitle === title) {
        await this.deleteItemByIndex(i);
        return;
      }
    }
  }

  /**
   * Clears all items in the cart table.
   */
  async clearAllItems(): Promise<void> {
    let count = await this.cartRows.count();
    while (count > 0) {
      await this.deleteItemByIndex(0);
      count = await this.cartRows.count();
    }
  }

  /**
   * Clicks 'Place Order' and opens the Order modal.
   */
  async openPlaceOrderModal(): Promise<OrderModalPage> {
    Logger.info('Opening Place Order modal');
    await this.placeOrderButton.click();
    const orderModal = new OrderModalPage(this.page);
    await orderModal.orderModal.waitFor({ state: 'visible', timeout: 10000 });
    return orderModal;
  }
}
