import { test, expect } from '../../src/fixtures/test.fixtures';
import { Helpers } from '../../src/utils/helpers';
import { Logger } from '../../src/utils/logger';

test.describe('DemoBlaze Backend REST API Suite @api', () => {
  test('TC_API_01: [Smoke] GET /entries returns product catalog items with 200 OK', async ({
    apiClient,
  }) => {
    Logger.step(1, 'Call GET /entries');
    const response = await apiClient.getCatalogEntries();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('Items');
    expect(Array.isArray(body.Items)).toBeTruthy();
    expect(body.Items.length).toBeGreaterThan(0);

    const firstItem = body.Items[0];
    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('title');
    expect(firstItem).toHaveProperty('price');
  });

  test('TC_API_02: [Smoke] POST /signup registers a new unique user', async ({
    apiClient,
  }) => {
    const username = Helpers.generateRandomUsername('api_user');
    const password = Helpers.generateRandomPassword();

    Logger.step(1, `Call POST /signup for ${username}`);
    const response = await apiClient.signUp(username, password);
    expect(response.status()).toBe(200);

    const text = await response.text();
    // DemoBlaze returns empty string or no error on success
    expect(text).not.toContain('This user already exist.');
  });

  test('TC_API_03: [Negative] POST /signup with already registered user returns error message', async ({
    apiClient,
  }) => {
    const username = Helpers.generateRandomUsername('dup_user');
    const password = Helpers.generateRandomPassword();

    Logger.step(1, 'Register first time');
    await apiClient.signUp(username, password);

    Logger.step(2, 'Register identical username a second time');
    const response = await apiClient.signUp(username, password);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.errorMessage).toBe('This user already exist.');
  });

  test('TC_API_04: [Smoke] POST /login with valid credentials returns Auth_token', async ({
    apiClient,
  }) => {
    const username = Helpers.generateRandomUsername('auth_user');
    const password = Helpers.generateRandomPassword();

    Logger.step(1, 'Create account');
    await apiClient.signUp(username, password);

    Logger.step(2, 'Authenticate account');
    const response = await apiClient.login(username, password);
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain('Auth_token:');
  });

  test('TC_API_05: [Negative] POST /login with incorrect password returns error message', async ({
    apiClient,
  }) => {
    const username = Helpers.generateRandomUsername('pwd_user');
    const password = Helpers.generateRandomPassword();

    await apiClient.signUp(username, password);

    Logger.step(1, 'Attempt login with bad password');
    const response = await apiClient.login(username, 'WrongPassword999!');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.errorMessage).toBe('Wrong password.');
  });

  test('TC_API_06: [Smoke] POST /bycat filters catalog by category', async ({
    apiClient,
  }) => {
    Logger.step(1, 'Call POST /bycat with cat: phone');
    const response = await apiClient.getEntriesByCategory('phone');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.Items.length).toBeGreaterThan(0);
    expect(body.Items.every((item: { cat: string }) => item.cat === 'phone')).toBeTruthy();
  });

  test('TC_API_07: [Smoke] POST /view retrieves single product details by id', async ({
    apiClient,
  }) => {
    Logger.step(1, 'Call POST /view with id: 1 (Samsung Galaxy S6)');
    const response = await apiClient.getProductDetails(1);
    expect(response.status()).toBe(200);

    const product = await response.json();
    expect(product.id).toBe(1);
    expect(product.title).toBe('Samsung galaxy s6');
    expect(product.price).toBe(360);
  });
});
