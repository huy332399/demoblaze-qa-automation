import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../utils/logger';

export interface CatalogItem {
  id: number;
  title: string;
  price: number;
  cat: string;
  desc: string;
  img: string;
}

/**
 * ApiClient handles direct REST API requests to DemoBlaze backend (api.demoblaze.com).
 * Useful for test data seeding, state assertions, and standalone API test suites.
 */
export class ApiClient {
  readonly request: APIRequestContext;
  readonly baseUrl: string;

  constructor(request: APIRequestContext, baseUrl = 'https://api.demoblaze.com') {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  /**
   * Helper to base64 encode strings (matching DemoBlaze frontend encoding).
   */
  static encodePassword(str: string): string {
    return Buffer.from(str).toString('base64');
  }

  /**
   * Sign up a new user account via API.
   */
  async signUp(username: string, rawPassword: string): Promise<APIResponse> {
    const password = ApiClient.encodePassword(rawPassword);
    Logger.info(`API: Registering user "${username}"`);
    return this.request.post(`${this.baseUrl}/signup`, {
      data: { username, password },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Authenticate a user via API.
   * Returns token string if successful (e.g., "Auth_token: ...").
   */
  async login(username: string, rawPassword: string): Promise<APIResponse> {
    const password = ApiClient.encodePassword(rawPassword);
    Logger.info(`API: Logging in user "${username}"`);
    return this.request.post(`${this.baseUrl}/login`, {
      data: { username, password },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Fetch all catalog entries.
   */
  async getCatalogEntries(): Promise<APIResponse> {
    Logger.info('API: Fetching catalog entries');
    return this.request.get(`${this.baseUrl}/entries`);
  }

  /**
   * Fetch catalog filtered by category ('phone', 'notebook', 'monitor').
   */
  async getEntriesByCategory(category: 'phone' | 'notebook' | 'monitor'): Promise<APIResponse> {
    Logger.info(`API: Fetching entries by category: ${category}`);
    return this.request.post(`${this.baseUrl}/bycat`, {
      data: { cat: category },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Fetch details for a specific product ID.
   */
  async getProductDetails(productId: string | number): Promise<APIResponse> {
    Logger.info(`API: Fetching product details for ID: ${productId}`);
    return this.request.post(`${this.baseUrl}/view`, {
      data: { id: String(productId) },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Add a product to cart via API.
   */
  async addToCart(cookieToken: string, productId: number | string, isUserFlag = true): Promise<APIResponse> {
    const guid = Math.random().toString(36).substring(2, 15);
    Logger.info(`API: Adding product ${productId} to cart for token ${cookieToken.substring(0, 8)}...`);
    return this.request.post(`${this.baseUrl}/addtocart`, {
      data: {
        id: guid,
        cookie: cookieToken,
        prod_id: productId,
        flag: isUserFlag,
      },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * View cart items for a given cookie/token.
   */
  async viewCart(cookieToken: string, isUserFlag = true): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/viewcart`, {
      data: {
        cookie: cookieToken,
        flag: isUserFlag,
      },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Check token validity.
   */
  async checkToken(token: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/check`, {
      data: { token },
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
