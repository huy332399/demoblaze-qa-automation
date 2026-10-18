import { test as baseTest, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { ProductPage } from '../pages/product.page';
import { CartPage } from '../pages/cart.page';
import { OrderModalPage } from '../pages/order-modal.page';
import { ApiClient } from '../api/api.client';
import { Helpers } from '../utils/helpers';

/**
 * Fixture options and instances injected into test cases.
 */
export interface TestFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  productPage: ProductPage;
  cartPage: CartPage;
  orderModalPage: OrderModalPage;
  apiClient: ApiClient;
  // Dynamic auto-registered user fixture for isolation in parallel execution
  registeredUser: {
    username: string;
    password: string;
    token?: string;
  };
}

export const test = baseTest.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  orderModalPage: async ({ page }, use) => {
    await use(new OrderModalPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  registeredUser: async ({ apiClient }, use) => {
    const username = Helpers.generateRandomUsername('user');
    const password = Helpers.generateRandomPassword();

    // Register user via API for fast setup
    const response = await apiClient.signUp(username, password);
    expect(response.status()).toBe(200);

    await use({ username, password });
  },
});

export { expect };
