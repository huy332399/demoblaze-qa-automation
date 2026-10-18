import { test, expect } from '../../src/fixtures/test.fixtures';
import { TestData } from '../../src/data/test-data';
import { Logger } from '../../src/utils/logger';

test.describe('Authentication - Login Module @login', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateTo('/');
  });

  test('TC_LOGIN_01: [Smoke] User can successfully log in with valid credentials', async ({
    loginPage,
    registeredUser,
  }) => {
    Logger.step(1, `Login with freshly registered user: ${registeredUser.username}`);
    await loginPage.loginWithValidCredentials(registeredUser.username, registeredUser.password);

    Logger.step(2, 'Verify user greeting and logout button visibility');
    await expect(loginPage.navUserGreeting).toHaveText(`Welcome ${registeredUser.username}`);
    await expect(loginPage.navLogout).toBeVisible();
    await expect(loginPage.navLogin).toBeHidden();
  });

  test('TC_LOGIN_02: [Regression] User session persists after page reload', async ({
    page,
    loginPage,
    registeredUser,
  }) => {
    Logger.step(1, 'Log in user');
    await loginPage.loginWithValidCredentials(registeredUser.username, registeredUser.password);

    Logger.step(2, 'Reload page');
    await page.reload();

    Logger.step(3, 'Verify greeting remains visible post-reload');
    await expect(loginPage.navUserGreeting).toHaveText(`Welcome ${registeredUser.username}`);
  });

  test('TC_LOGIN_03: [Smoke] User can successfully log out', async ({
    loginPage,
    registeredUser,
  }) => {
    Logger.step(1, 'Log in user');
    await loginPage.loginWithValidCredentials(registeredUser.username, registeredUser.password);

    Logger.step(2, 'Log out');
    await loginPage.logout();

    Logger.step(3, 'Verify login button is visible again and greeting is hidden');
    await expect(loginPage.navLogin).toBeVisible();
    await expect(loginPage.navLogout).toBeHidden();
  });

  test('TC_LOGIN_04: [Negative] Login fails with incorrect password', async ({
    loginPage,
    registeredUser,
  }) => {
    Logger.step(1, 'Attempt login with valid username and wrong password');
    const alert = await loginPage.loginExpectingAlert(registeredUser.username, 'WrongPassword123!');

    Logger.step(2, 'Verify error alert message');
    expect(alert).toBe(TestData.alerts.wrongPassword);
    await expect(loginPage.navUserGreeting).toBeHidden();
  });

  test('TC_LOGIN_05: [Negative] Login fails with non-existent username', async ({
    loginPage,
  }) => {
    Logger.step(1, 'Attempt login with ghost username');
    const alert = await loginPage.loginExpectingAlert(
      TestData.invalidUsers.nonExistentUser.username,
      TestData.invalidUsers.nonExistentUser.password
    );

    Logger.step(2, 'Verify User does not exist alert');
    expect(alert).toBe(TestData.alerts.userDoesNotExist);
  });

  test('TC_LOGIN_06: [Negative] Login with empty username displays validation alert', async ({
    loginPage,
  }) => {
    Logger.step(1, 'Submit login with empty username');
    const alert = await loginPage.loginExpectingAlert('', 'SomePassword123!');

    Logger.step(2, 'Verify missing field alert message');
    expect(alert).toBe(TestData.alerts.loginMissingFields);
  });

  test('TC_LOGIN_07: [Negative] Login with empty password displays validation alert', async ({
    loginPage,
    registeredUser,
  }) => {
    Logger.step(1, 'Submit login with empty password');
    const alert = await loginPage.loginExpectingAlert(registeredUser.username, '');

    Logger.step(2, 'Verify missing field alert message');
    expect(alert).toBe(TestData.alerts.loginMissingFields);
  });

  test('TC_LOGIN_08: [Negative] Login with both fields empty displays validation alert', async ({
    loginPage,
  }) => {
    Logger.step(1, 'Submit login with both fields empty');
    const alert = await loginPage.loginExpectingAlert('', '');

    Logger.step(2, 'Verify missing field alert message');
    expect(alert).toBe(TestData.alerts.loginMissingFields);
  });

  test('TC_LOGIN_09: [Edge] Dismissing login modal clears state and leaves page accessible', async ({
    loginPage,
  }) => {
    Logger.step(1, 'Open login modal and click Close button');
    await loginPage.openLoginModal();
    await loginPage.dismissLoginModal();

    Logger.step(2, 'Verify modal is hidden and user can continue browsing');
    await expect(loginPage.loginModal).toBeHidden();
    await expect(loginPage.navLogin).toBeVisible();
  });
});
