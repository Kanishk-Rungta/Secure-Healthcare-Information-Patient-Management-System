# Comprehensive Cypress Guide

Cypress is a next-generation front-end testing tool built for the modern web. It enables you to write end-to-end (E2E), component, and integration tests that run directly in the browser.

---

## 1. What is Cypress?

Cypress is an all-in-one testing framework, assertion library, with mocking and stubbing, all without Selenium. It operates within the same run-loop as your application, giving it native access to every object.

### Key Features:
- **Time Travel:** Cypress takes snapshots as your tests run. Hover over commands in the Command Log to see exactly what happened at each step.
- **Debuggability:** Readable error messages and stack traces.
- **Automatic Waiting:** Never add waits or sleeps to your tests. Cypress automatically waits for commands and assertions.
- **Real-time Reloads:** Cypress automatically reloads when you make changes to your tests.

---

## 2. Project Configuration

In this project, Cypress is configured via `cypress.config.js`:

```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://localhost:3005", // The URL of your app
        specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}", // Where tests are located
        supportFile: false // Optional support file for global configuration
    },
});
```

---

## 3. Directory Structure

- **`cypress/e2e/`**: Contains your test files (e.g., `auth.cy.js`).
- **`cypress/fixtures/`**: External static data used by your tests (JSON files for mocking APIs).
- **`cypress/support/`**: Place for reusable behavior like custom commands or global overrides.
- **`cypress/screenshots/`**: Automatically stores screenshots on test failure.
- **`cypress/videos/`**: Stores videos of the test run (if enabled).

---

## 4. Basic Syntax & Workflow

Cypress uses `describe` and `it` (from Mocha) for structuring tests.

```javascript
describe('Login Flow', () => {
    beforeEach(() => {
        // Runs before every test in this block
        cy.visit('/login'); 
    });

    it('should login successfully with valid credentials', () => {
        cy.get('input[name="email"]').type('user@example.com');
        cy.get('input[name="password"]').type('password123');
        cy.get('button[type="submit"]').click();

        // Assertion
        cy.url().should('include', '/dashboard');
        cy.contains('Welcome').should('be.visible');
    });
});
```

---

## 5. Common Cypress Commands

| Command | Description |
| :--- | :--- |
| `cy.visit(url)` | Navigate to a specific URL. |
| `cy.get(selector)` | Select elements (uses CSS selectors). |
| `cy.find(selector)` | Find a child element within a selection. |
| `cy.type(text)` | Type into an input field. |
| `cy.click()` | Click on an element. |
| `cy.contains(text)` | Select an element containing specific text. |
| `cy.request()` | Make HTTP requests (for API testing or setup). |
| `cy.wait(ms)` | Wait for a specific time or an aliased route. |

---

## 6. Assertions

Cypress uses **Chai** for assertions.

- **Implicit Assertions (`.should()`, `.and()`)**:
    ```javascript
    cy.get('.error').should('have.text', 'Invalid credentials');
    cy.get('button').should('be.enabled').and('have.class', 'active');
    ```
- **Explicit Assertions (`expect`)**:
    ```javascript
    expect(true).to.be.true;
    ```

---

## 7. Interacting with APIs (Mocking/Stubbing)

You can use `cy.intercept()` to manage network requests.

```javascript
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
cy.visit('/users');
cy.wait('@getUsers'); // Wait for the mocked request
```

---

## 8. Custom Commands

You can define custom commands in `cypress/support/commands.js` to avoid repetition.

```javascript
// Definition
Cypress.Commands.add('login', (email, password) => {
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button').click();
});

// Usage
cy.login('test@user.com', 'pass123');
```

---

## 9. Running Tests

1.  **Cypress Launchpad (Interactive Mode):**
    ```bash
    npx cypress open
    ```
    This opens a browser window where you can watch tests run in real-time.

2.  **Headless Mode (Continuous Integration):**
    ```bash
    npx cypress run
    ```
    Runs all tests in the background and outputs results to the terminal.

---

## 10. Best Practices

1.  **Use Data Attributes for Selectors:** Avoid using CSS classes or IDs that might change. Use `data-cy="submit-btn"`.
    - *Bad:* `cy.get('.btn-primary')`
    - *Good:* `cy.get('[data-cy=submit]')`
2.  **Avoid Shared State:** Each test should be able to run independently.
3.  **Don't Test Third-Party Links:** Cypress is for testing *your* app. Use `cy.request()` to check if a link is alive if necessary, but don't visit external sites.
4.  **Keep Tests Simple:** One test should ideally test one specific user flow.
5.  **Clean up State:** Use `beforeEach` to reset the database or clear cookies to ensure a clean slate.

---

## 11. Existing Tests in this Project

You can find current E2E tests in:
- `cypress/e2e/auth.cy.js`: Handles login/registration testing.
- `cypress/e2e/pages_navigation.cy.js`: Verifies different routes are accessible.
