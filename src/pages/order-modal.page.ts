import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/logger';

export interface OrderData {
  name: string;
  country?: string;
  city?: string;
  card: string;
  month?: string;
  year?: string;
}

export interface PurchaseReceipt {
  id: string;
  amount: number;
  cardNumber: string;
  name: string;
  date: string;
  rawText: string;
}

/**
 * OrderModalPage handles the checkout modal and the SweetAlert confirmation receipt.
 */
export class OrderModalPage extends BasePage {
  readonly orderModal: Locator;
  readonly totalLabel: Locator;
  readonly nameInput: Locator;
  readonly countryInput: Locator;
  readonly cityInput: Locator;
  readonly cardInput: Locator;
  readonly monthInput: Locator;
  readonly yearInput: Locator;
  readonly purchaseButton: Locator;
  readonly closeButton: Locator;

  // SweetAlert Confirmation dialog elements
  readonly sweetAlertModal: Locator;
  readonly sweetAlertTitle: Locator;
  readonly sweetAlertDetails: Locator;
  readonly sweetAlertConfirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.orderModal = page.locator('#orderModal');
    this.totalLabel = page.locator('#totalm');
    this.nameInput = page.locator('#name');
    this.countryInput = page.locator('#country');
    this.cityInput = page.locator('#city');
    this.cardInput = page.locator('#card');
    this.monthInput = page.locator('#month');
    this.yearInput = page.locator('#year');
    this.purchaseButton = page.locator('#orderModal button[onclick="purchaseOrder()"]');
    this.closeButton = page.locator('#orderModal button.btn-secondary:has-text("Close")');

    this.sweetAlertModal = page.locator('.sweet-alert.showSweetAlert');
    this.sweetAlertTitle = page.locator('.sweet-alert h2');
    this.sweetAlertDetails = page.locator('.sweet-alert p.lead.text-muted');
    this.sweetAlertConfirmButton = page.locator('.sweet-alert button.confirm');
  }

  /**
   * Fills the order form fields.
   */
  async fillOrderForm(data: OrderData): Promise<void> {
    Logger.info(`Filling order form for buyer: "${data.name}"`);
    await this.orderModal.waitFor({ state: 'visible', timeout: 10000 });

    if (data.name !== undefined) await this.nameInput.fill(data.name);
    if (data.country !== undefined) await this.countryInput.fill(data.country);
    if (data.city !== undefined) await this.cityInput.fill(data.city);
    if (data.card !== undefined) await this.cardInput.fill(data.card);
    if (data.month !== undefined) await this.monthInput.fill(data.month);
    if (data.year !== undefined) await this.yearInput.fill(data.year);
  }

  /**
   * Submits purchase expecting successful order placement with SweetAlert confirmation.
   */
  async purchaseAndConfirm(data: OrderData): Promise<PurchaseReceipt> {
    await this.fillOrderForm(data);
    Logger.info('Clicking "Purchase" button');
    await this.purchaseButton.click();

    // Verify SweetAlert appearance
    await this.sweetAlertModal.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.sweetAlertTitle).toHaveText('Thank you for your purchase!');

    const detailsText = (await this.sweetAlertDetails.textContent()) || '';
    Logger.info(`Order Receipt Raw Text:\n${detailsText}`);

    // Parse receipt details
    const idMatch = detailsText.match(/Id:\s*(\d+)/);
    const amountMatch = detailsText.match(/Amount:\s*(\d+)\s*USD/);
    const cardMatch = detailsText.match(/Card Number:\s*(.*?)(?:Name:|$)/);
    const nameMatch = detailsText.match(/Name:\s*(.*?)(?:Date:|$)/);
    const dateMatch = detailsText.match(/Date:\s*(.*?)$/);

    const receipt: PurchaseReceipt = {
      id: idMatch ? idMatch[1] : '',
      amount: amountMatch ? parseInt(amountMatch[1], 10) : 0,
      cardNumber: cardMatch ? cardMatch[1].trim() : '',
      name: nameMatch ? nameMatch[1].trim() : '',
      date: dateMatch ? dateMatch[1].trim() : '',
      rawText: detailsText,
    };

    // Click OK to finish order and return to index
    await this.sweetAlertConfirmButton.click();
    await this.page.waitForURL(/.*(index\.html)?$/, { timeout: 10000 });

    return receipt;
  }

  /**
   * Submits order form and intercepts validation alert (e.g., when Name/Card are empty).
   */
  async purchaseExpectingAlert(data: OrderData): Promise<string> {
    await this.fillOrderForm(data);
    const alertMessage = await this.captureDialogMessage(async () => {
      await this.purchaseButton.click();
    });
    Logger.info(`Checkout validation alert: "${alertMessage}"`);
    return alertMessage;
  }
}
