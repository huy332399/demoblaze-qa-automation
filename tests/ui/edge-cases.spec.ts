import { test, expect } from '../../src/fixtures/test.fixtures';
import { TestData } from '../../src/data/test-data';
import { Logger } from '../../src/utils/logger';

test.describe('Edge Cases & UI Resiliency @edge', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateTo('/');
  });

  test('TC_EDGE_01: Product category filtering updates catalog correctly', async ({
    homePage,
  }) => {
    Logger.step(1, 'Filter by Laptops category');
    await homePage.filterByCategory('Laptops');
    const laptopTitles = await homePage.getDisplayedProductTitles();
    expect(laptopTitles.length).toBeGreaterThan(0);
    expect(laptopTitles.some((t) => t.toLowerCase().includes('vaio') || t.toLowerCase().includes('macbook') || t.toLowerCase().includes('dell'))).toBeTruthy();

    Logger.step(2, 'Filter by Monitors category');
    await homePage.filterByCategory('Monitors');
    const monitorTitles = await homePage.getDisplayedProductTitles();
    expect(monitorTitles.length).toBeGreaterThan(0);
    expect(monitorTitles.some((t) => t.toLowerCase().includes('apple') || t.toLowerCase().includes('asus'))).toBeTruthy();
  });

  test('TC_EDGE_02: Adding duplicate items of the same product adds multiple line items', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    const product = TestData.products.samsungGalaxyS6;

    Logger.step(1, `Select ${product.title} and add to cart twice`);
    await homePage.selectProduct(product.title);
    await productPage.addToCart();
    await productPage.addToCart();

    Logger.step(2, 'Navigate to cart and inspect row entries');
    await productPage.goToCart();
    const items = await cartPage.getCartItems();
    const matchingItems = items.filter((item) => item.title === product.title);

    expect(matchingItems.length).toBeGreaterThanOrEqual(2);
  });

  test('TC_EDGE_03: SQL Injection payload in login input is safely handled by backend', async ({
    loginPage,
  }) => {
    Logger.step(1, 'Submit SQL injection payload string into login form');
    const alert = await loginPage.loginExpectingAlert(
      TestData.invalidUsers.specialCharUser.username,
      TestData.invalidUsers.specialCharUser.password
    );

    Logger.step(2, 'Verify payload does not cause 500 error or unauthorized access');
    expect(['User does not exist.', 'Wrong password.']).toContain(alert);
    await expect(loginPage.navUserGreeting).toBeHidden();
  });

  test('TC_EDGE_04: Price integrity between Product Detail page and Cart page', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    const product = TestData.products.sonyVaioI5;

    Logger.step(1, 'Inspect product detail price');
    await homePage.selectProduct(product.title);
    const details = await productPage.getProductDetails();
    expect(details.price).toBe(product.price);

    Logger.step(2, 'Add to cart and verify cart table price matches');
    await productPage.addToCart();
    await productPage.goToCart();
    const items = await cartPage.getCartItems();
    const cartProduct = items.find((i) => i.title === product.title);

    expect(cartProduct).toBeDefined();
    expect(cartProduct?.price).toBe(details.price);
  });
});
