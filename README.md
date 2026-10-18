# DemoBlaze Enterprise QA Automation Framework

[![Playwright](https://img.shields.io/badge/Playwright-v1.50.0-2EAD33?style=flat&logo=playwright)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat&logo=githubactions)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, end-to-end QA Test Automation Framework built for **[DemoBlaze](https://www.demoblaze.com/)** using **Playwright** and **TypeScript**. This repository demonstrates production-level test design patterns, including the Page Object Model (POM), custom fixtures, dynamic test data generation, cross-browser execution, direct REST API validation, performance benchmarking, CI/CD automation via GitHub Actions, and detailed test case documentation (Excel & Markdown).

---

## Table of Contents
1. [Framework Architecture & Design Rationale](#framework-architecture--design-rationale)
2. [Project Structure](#project-structure)
3. [Test Case Coverage Matrix](#test-case-coverage-matrix)
4. [Prerequisites & Installation](#prerequisites--installation)
5. [Steps to Execute Demo & Test Suites](#steps-to-execute-demo--test-suites)
6. [Supported Test Types (UI, API, Performance)](#supported-test-types)
7. [Reporting, Tracing & Artifacts](#reporting-tracing--artifacts)
8. [CI/CD Pipeline Integration](#cicd-pipeline-integration)
9. [Deliverables Summary](#deliverables-summary)

---

## Framework Architecture & Design Rationale

### 1. Page Object Model (POM)
The framework strictly separates test specifications from web page DOM interactions:
- **`BasePage`**: Encapsulates common elements (navbar, brand logo, modals) and provides generic helper functions such as `captureDialogMessage()` to seamlessly intercept, log, and dismiss native browser alerts (`window.alert`).
- **Domain-Specific Pages**: `HomePage`, `LoginPage`, `ProductPage`, `CartPage`, and `OrderModalPage` contain strongly typed locators and user actions.

### 2. Custom Playwright Fixtures (`test.fixtures.ts`)
Rather than relying on `beforeEach` instantiation or global singletons, this framework extends Playwright's base test runner with custom fixtures:
- Injects pre-instantiated page objects directly into test functions.
- Provides `registeredUser`: A fixture that generates and registers a fresh, unique user account on the backend before the test starts, ensuring total isolation and zero credential collisions during parallel execution.

### 3. Native Alert Interception & Dialog Handling
DemoBlaze relies heavily on native JavaScript `alert()` dialogs for login errors, cart additions, and validation warnings. The framework uses asynchronous event listeners:
```typescript
const alertText = await page.captureDialogMessage(async () => {
  await page.loginButton.click();
});
```
This guarantees tests never hang waiting for unhandled modals.

### 4. Hybrid API & UI Capabilities
DemoBlaze communicates with a backend REST API at `https://api.demoblaze.com`. The framework includes an `ApiClient` to:
- Test backend endpoints in isolation (sign up, login tokens, catalog pagination, cart sessions).
- Perform fast state setup and teardown for E2E scenarios.

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── playwright.yml          # GitHub Actions matrix CI/CD workflow
├── docs/
│   ├── Test_Cases_DemoBlaze_Login_Cart.xlsx # Professional Excel test case suite
│   ├── TEST_CASES.md               # Detailed Markdown test specification matrix
│   └── generate-test-cases.ts      # Automated generator script for Excel/Markdown
├── src/
│   ├── api/
│   │   └── api.client.ts           # Direct REST API client for api.demoblaze.com
│   ├── data/
│   │   └── test-data.ts            # Centralized test credentials & catalog mock data
│   ├── fixtures/
│   │   └── test.fixtures.ts        # Extended Playwright test fixtures & user factory
│   ├── pages/
│   │   ├── base.page.ts            # Foundational page with navbar & dialog handling
│   │   ├── home.page.ts            # Catalog, category filtering, product selection
│   │   ├── login.page.ts           # Login modal, auth assertions, error capture
│   │   ├── product.page.ts         # Product details, specs, and Add-to-Cart
│   │   ├── cart.page.ts            # Cart items table, deletion, total calculation
│   │   └── order-modal.page.ts     # Checkout form, validation & SweetAlert receipt
│   └── utils/
│       ├── helpers.ts              # Unique username, password, order data generators
│       └── logger.ts               # Structured timestamped console logging
├── tests/
│   ├── api/
│   │   └── demoblaze-api.spec.ts   # REST API test suite (7 tests)
│   ├── performance/
│   │   └── performance.spec.ts     # Performance & SLA benchmark tests (3 tests)
│   └── ui/
│       ├── login.spec.ts           # Login functional, negative, edge cases (9 tests)
│       ├── cart-checkout.spec.ts   # Cart, checkout E2E & validation tests (5 tests)
│       └── edge-cases.spec.ts      # Category filter, duplicates, SQL injection (4 tests)
├── package.json                    # NPM scripts, dependencies & configurations
├── playwright.config.ts            # Multi-browser matrix, timeouts, and reporters
├── tsconfig.json                   # TypeScript configuration & path aliases
└── README.md                       # Framework documentation and execution guide
```

---

## Test Case Coverage Matrix

A comprehensive suite of **25 test cases** has been developed for the Login and Cart functionalities, documented in both:
- **Interactive Excel Spreadsheet:** [`docs/Test_Cases_DemoBlaze_Login_Cart.xlsx`](docs/Test_Cases_DemoBlaze_Login_Cart.xlsx)
- **Markdown Specification:** [`docs/TEST_CASES.md`](docs/TEST_CASES.md)

### Executive Breakdown

| Module | Category | Test Cases | Automation Status |
| :--- | :--- | :---: | :---: |
| **Login** | Functional, Negative, Edge Case, Security | 12 | 100% Automated |
| **Cart** | Functional, Regression, Edge Case, Performance | 8 | 100% Automated |
| **Checkout** | Functional, Negative, Edge Case | 5 | 100% Automated |
| **Total** | **All Categories** | **25** | **100% Automated** |

### Key Scenarios Covered
- **Functional:** Valid login, session persistence across page reload, user logout, adding single/multiple products, cart item deletion, total sum calculation, complete order placement with SweetAlert confirmation.
- **Negative:** Invalid password, non-existent user, empty username, empty password, empty checkout Name, empty checkout Credit Card.
- **Edge Cases:** Modal close/dismiss behavior, adding duplicate items, guest session cart persistence, order total alignment.
- **Security:** SQL injection resistance in login inputs, masked password input validation.
- **Performance:** DOMContentLoaded SLA (< 4000ms), API response latency SLA (< 2000ms).

---

## Prerequisites & Installation

### Requirements
- **Node.js**: v18 or later (tested on Node v20/v25)
- **npm**: v9 or later

### Installation Steps
```bash
# Clone the repository
git clone <repository_url>
cd demoblaze-playwright-automation

# Install project dependencies
npm install

# Install Playwright browser binaries (Chromium, Firefox, WebKit)
npx playwright install --with-deps
```

---

## Steps to Execute Demo & Test Suites

### 1. Execute Main Automation Demo (Login -> Add to Cart -> Place Order)
To run the primary challenge demo scenario:
```bash
npx playwright test tests/ui/cart-checkout.spec.ts -g "TC_CART_01" --headed
```
*This executes the full user journey: authenticating with valid credentials, browsing the catalog, adding a smartphone to the cart, verifying the browser alert, reviewing the cart table, filling out the checkout form, and validating the SweetAlert purchase confirmation receipt.*

### 2. Execute by Test Category
```bash
# Run all Smoke tests
npm run test:smoke

# Run full Regression suite
npm run test:regression

# Run UI tests only
npm run test:ui

# Run direct REST API tests only
npm run test:api

# Run Performance SLA benchmark tests only
npm run test:perf
```

### 3. Execute Across Browsers & Devices
```bash
# Google Chrome / Chromium
npm run test:chromium

# Mozilla Firefox
npm run test:firefox

# Apple Safari / WebKit
npm run test:webkit

# Mobile Emulation (Google Pixel 5)
npm run test:mobile
```

### 4. Interactive Debugging & Playwright UI Mode
```bash
# Open interactive Playwright UI Mode
npx playwright test --ui

# Run tests in headed browser with step-by-step inspector
npm run test:debug
```

### 5. Re-generate Excel & Markdown Documentation
```bash
npm run generate:docs
```

---

## Supported Test Types

| Test Type | Description | Location |
| :--- | :--- | :--- |
| **UI E2E** | Full end-to-end user browser interactions, DOM verifications, and alert handling | `tests/ui/` |
| **API** | Pure REST API tests validating HTTP status codes, payloads, error handling, and authentication tokens | `tests/api/` |
| **Regression** | Tagged regression test cases verifying multi-product cart totals, deletion, and session reload | `@regression` tag |
| **Performance** | Measures Navigation Timing (TTFB, DOMContentLoaded) and backend API response latency SLAs | `tests/performance/` |

---

## Reporting, Tracing & Artifacts

After any test execution, view the rich HTML report:
```bash
npm run report
```

### Reporting Features
- **Screenshots on Failure:** Automatically captured and attached to the report.
- **Videos on Failure:** Recorded WebM videos of failing test runs.
- **Playwright Trace Viewer:** Inspect the complete DOM snapshot, console logs, and network waterfall for any step using:
  ```bash
  npx playwright show-trace test-results/<test-folder>/trace.zip
  ```
- **CI XML / JSON Reports:** Emitted to `test-results/junit-report.xml` and `test-results/test-results.json` for CI dashboard ingestion.

---

## CI/CD Pipeline Integration

The repository includes a ready-to-run GitHub Actions workflow located at [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml):
- **Triggers:** Automatically runs on every `push` and `pull_request` to `main` and `master`, as well as on manual `workflow_dispatch`.
- **Cross-Browser Matrix:** Executes parallel jobs across **Chromium**, **Firefox**, and **WebKit**.
- **Caching:** Automatically caches `~/.cache/ms-playwright` and `node_modules` for fast build cycles (< 2 mins).
- **Artifacts:** Publishes HTML reports and trace archives as build artifacts retained for 14 days.

---

## Deliverables Summary

1. **Test Case Suite:** 
   - Excel Workbook: [`docs/Test_Cases_DemoBlaze_Login_Cart.xlsx`](docs/Test_Cases_DemoBlaze_Login_Cart.xlsx)
   - Markdown Matrix: [`docs/TEST_CASES.md`](docs/TEST_CASES.md)
2. **Automation Framework:** Fully operational Playwright + TypeScript framework with POM architecture, custom fixtures, cross-browser support, and CI/CD.
3. **Demo Scripts:** Complete Login and Cart checkout flow with receipt assertions in `tests/ui/cart-checkout.spec.ts`.
4. **Documentation:** Full setup guide, design rationale, and architecture details in this README.
