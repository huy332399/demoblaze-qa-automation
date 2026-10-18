import { test, expect } from '../../src/fixtures/test.fixtures';
import { TestData } from '../../src/data/test-data';
import { Logger } from '../../src/utils/logger';
import { Helpers } from '../../src/utils/helpers';

test.describe('Shopping Cart & Checkout Module @cart', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateTo('/');
  });

  test('TC_CART_01: [Demo/E2E] Login, add product to cart, and place order successfully', async ({
    loginPage,
    homePage,
    productPage,
    cartPage,
    registeredUser,
  }) => {
    // 1. Log in with valid credentials
    Logger.step(1, `Log in as registered user: ${registeredUser.username}`);
    await loginPage.loginWithValidCredentials(registeredUser.username, registeredUser.password);

    // 2. Select product from catalog
    const targetProduct = TestData.products.samsungGalaxyS6;
    Logger.step(2, `Select product "${targetProduct.title}"`);
    await homePage.selectProduct(targetProduct.title);

    // 3. Add to cart & assert alert
    Logger.step(3, 'Add product to cart and verify alert confirmation');
    const alertText = await productPage.addToCart();
    expect(alertText).toContain(TestData.alerts.productAdded);

    // 4. Navigate to cart & verify item presence
    Logger.step(4, 'Navigate to Cart and verify product listing');
    await productPage.goToCart();
    const items = await cartPage.getCartItems();
    expect(items.length).toBeGreaterThanOrEqual(1);
    const addedItem = items.find((item) => item.title === targetProduct.title);
    expect(addedItem).toBeDefined();
    expect(addedItem?.price).toBe(targetProduct.price);

    // 5. Open checkout modal and verify total
    Logger.step(5, 'Open Order modal and complete checkout');
    const orderModal = await cartPage.openPlaceOrderModal();
    const mockOrder = Helpers.generateMockOrderData();

    // 6. Complete purchase and verify SweetAlert receipt
    Logger.step(6, 'Submit order and verify SweetAlert receipt details');
    const receipt = await orderModal.purchaseAndConfirm(mockOrder);

    expect(receipt.id).not.toBe('');
    expect(receipt.amount).toBe(targetProduct.price);
    expect(receipt.name).toBe(mockOrder.name);
    expect(receipt.cardNumber).toBe(mockOrder.card);
    Logger.info(`Order placed successfully with ID: ${receipt.id}`);
  });

  test('TC_CART_02: [Regression] Add multiple items and verify total price calculation', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    const product1 = TestData.products.samsungGalaxyS6;
    const product2 = TestData.products.nokiaLumia;
    const expectedSum = product1.price + product2.price;

    Logger.step(1, `Add first product: ${product1.title}`);
    await homePage.selectProduct(product1.title);
    await productPage.addToCart();

    Logger.step(2, `Add second product: ${product2.title}`);
    await productPage.goToHome();
    await homePage.selectProduct(product2.title);
    await productPage.addToCart();

    Logger.step(3, 'Navigate to Cart and verify total calculation');
    await productPage.goToCart();
    const items = await cartPage.getCartItems();
    expect(items.length).toBeGreaterThanOrEqual(2);

    const calculatedSum = items.reduce((sum, item) => sum + item.price, 0);
    const displayedTotal = await cartPage.getTotalPrice();
    expect(displayedTotal).toBe(calculatedSum);
    expect(displayedTotal).toBeGreaterThanOrEqual(expectedSum);
  });

  test('TC_CART_03: [Regression] Delete an item from cart and verify updated total', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    Logger.step(1, 'Add a product to cart');
    await homePage.selectProduct(TestData.products.samsungGalaxyS6.title);
    await productPage.addToCart();

    Logger.step(2, 'Navigate to cart');
    await productPage.goToCart();
    const initialItems = await cartPage.getCartItems();
    const initialCount = initialItems.length;
    expect(initialCount).toBeGreaterThan(0);

    Logger.step(3, 'Delete the first item in cart');
    await cartPage.deleteItemByIndex(0);

    Logger.step(4, 'Verify cart count decreased');
    const remainingItems = await cartPage.getCartItems();
    expect(remainingItems.length).toBe(initialCount - 1);
  });

  test('TC_CART_04: [Negative] Checkout validation fails when Name field is empty', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    Logger.step(1, 'Add product and navigate to cart');
    await homePage.selectProduct(TestData.products.samsungGalaxyS6.title);
    await productPage.addToCart();
    await productPage.goToCart();

    Logger.step(2, 'Open Order modal');
    const orderModal = await cartPage.openPlaceOrderModal();

    Logger.step(3, 'Submit order with missing Name');
    const alertMessage = await orderModal.purchaseExpectingAlert(TestData.orderData.missingName);

    Logger.step(4, 'Verify required field validation alert');
    expect(alertMessage).toBe(TestData.alerts.orderMissingFields);
  });

  test('TC_CART_05: [Negative] Checkout validation fails when Credit Card is empty', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    Logger.step(1, 'Add product and navigate to cart');
    await homePage.selectProduct(TestData.products.samsungGalaxyS6.title);
    await productPage.addToCart();
    await productPage.goToCart();

    Logger.step(2, 'Open Order modal');
    const orderModal = await cartPage.openPlaceOrderModal();

    Logger.step(3, 'Submit order with missing Credit Card');
    const alertMessage = await orderModal.purchaseExpectingAlert(TestData.orderData.missingCard);

    Logger.step(4, 'Verify required field validation alert');
    expect(alertMessage).toBe(TestData.alerts.orderMissingFields);
  });
});
