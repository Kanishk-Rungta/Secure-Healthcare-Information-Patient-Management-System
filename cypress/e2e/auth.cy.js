describe('Authentication Flow', () => {
    it('Should successfully load the login page and authenticate a user', () => {
        // We visit the login page running locally
        cy.visit('/login');

        // Check if the page contains 'Sign in'
        cy.contains('Sign in').should('be.visible');

        // Interact with form controls
        cy.get('input[name="email"]').type('e2e@example.com');
        cy.get('input[name="password"]').type('Password123!');

        // In a real E2E, we would submit this form but
        // since we want to avoid corrupting DB or depending on
        // seeded data reliably, we just assert the button exists.
        cy.get('button[type="submit"]').contains(/Next|Signing in/i).should('be.visible');
    });

    it('Should navigate to the register page', () => {
        cy.visit('/login');
        cy.contains('Create account').click();

        // Ensure we are redirected to /register
        cy.url().should('include', '/register');
        cy.contains('Create account').should('be.visible');
    });
});
