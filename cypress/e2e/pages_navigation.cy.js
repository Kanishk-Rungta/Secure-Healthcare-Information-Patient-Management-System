describe('E2E Page Rendering and Navigation', () => {
    const setMockAuth = (win, role = 'PATIENT', firstName = 'Test', lastName = 'User') => {
        const user = {
            _id: 'mock-id-123',
            email: 'test@example.com',
            role: role,
            firstName: firstName, // For Admin Dashboard
            lastName: lastName,
            profile: {
                firstName: firstName, // For Patient/Doctor Dashboard
                lastName: lastName,
                professionalInfo: { specialization: 'General Medicine' }
            }
        };
        win.localStorage.setItem('user', JSON.stringify(user));
        win.localStorage.setItem('accessToken', 'mock-token-abc');
    };

    describe('Public Pages', () => {
        it('should render the Home page', () => {
            cy.visit('/');
            cy.contains('SecureHealth').should('be.visible');
            cy.contains('Platform Features').should('be.visible');
        });

        it('should render the Login page', () => {
            cy.visit('/login');
            cy.contains('Sign in').should('be.visible');
        });

        it('should render the Register page', () => {
            cy.visit('/register');
            cy.contains('Create account').should('be.visible');
        });
    });

    describe('Error & Feedback Pages', () => {
        it('should render the 404 page for unknown routes', () => {
            cy.visit('/unknown-page-path', { failOnStatusCode: false });
            cy.contains('NotFound').should('be.visible');
        });

        it('should render the Unauthorized page', () => {
            cy.visit('/unauthorized');
            // Depending on implementation, it might show "Unauthorized" h1
            cy.contains('Unauthorized').should('be.visible');
        });
    });

    describe('Role-based Dashboards', () => {
        it('should render the Admin Dashboard', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'administrator', 'Admin') });
            cy.visit('/admin');
            cy.contains('Admin Portal').should('be.visible');
            cy.contains('Welcome back, Admin!').should('be.visible');
        });

        it('should render the Patient Dashboard', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'patient', 'John') });
            cy.visit('/patient');
            cy.contains('Welcome back, John!').should('be.visible');
            cy.contains('Medical Records').should('be.visible');
        });

        it('should render the Doctor Dashboard', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'doctor', 'Doctor') });
            cy.visit('/doctor');
            cy.contains('MedPortal Pro').should('be.visible');
            cy.contains('Welcome back, Dr. Doctor').should('be.visible');
        });

        it('should render the Receptionist Dashboard', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'receptionist', 'Receptionist') });
            cy.visit('/receptionist');
            cy.contains('Receptionist Portal').should('be.visible');
            cy.contains('Recent Complaints').should('be.visible');
        });

        it('should render the Lab Dashboard', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'lab_technician') });
            cy.visit('/lab');
            cy.contains('LabTechnicianDashboard').should('be.visible');
        });

        it('should render the Pharmacy Dashboard', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'pharmacist') });
            cy.visit('/pharmacy');
            cy.contains('PharmacistDashboard').should('be.visible');
        });
    });

    describe('Feature Sub-pages (Placeholders)', () => {
        it('should render Patient Profile', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'patient') });
            cy.visit('/patient/profile');
            cy.contains('PatientProfile').should('be.visible');
        });

        it('should render Admin User Management', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'administrator') });
            cy.visit('/admin/users');
            cy.contains('UserManagement').should('be.visible');
        });

        it('should render Admin Audit Logs', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'administrator') });
            cy.visit('/admin/audit-logs');
            cy.contains('AuditLogs').should('be.visible');
        });

        it('should render Medical Staff Patient Search', () => {
            cy.visit('/login', { onBeforeLoad: (win) => setMockAuth(win, 'doctor') });
            cy.visit('/patients/search');
            cy.contains('PatientSearch').should('be.visible');
        });
    });
});
