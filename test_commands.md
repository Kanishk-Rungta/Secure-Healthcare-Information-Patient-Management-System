# Secure Healthcare Management System - Testing Commands

This file contains all the commands you can use to run tests for different parts of the application (Frontend, Backend, and End-to-End).

## 1. Frontend Tests (React)
The frontend uses Jest and React Testing Library. All frontend commands should be run from inside the `frontend` directory.

```bash
# Navigate to the frontend directory
cd frontend
```

### Run all frontend tests
```bash
# Runs all tests in the frontend and watches for changes
npx react-scripts test

# Runs all tests once without watching (good for CI/CD)
npx react-scripts test --watchAll=false
```

### Run all tests and generate a coverage report
```bash
npx react-scripts test --watchAll=false --coverage
```

### Run tests for a specific file
You can specify the path to a specific test file or just the name of the component.
```bash
# Run tests for a specific file by its name pattern
npx react-scripts test Login

# Run a specific test file by exact path
npx react-scripts test src/pages/__tests__/Login.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/Dashboard.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/Register.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/PatientDashboard.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/ReceptionistDashboard.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/AdminDashboard.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/DoctorDashboard.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/PharmacyDashboard.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/LabDashboard.test.js --watchAll=false
npx react-scripts test src/pages/__tests__/Home.test.js --watchAll=false
```

### Run tests inside the pages directory only
```bash
npx react-scripts test src/pages/ --watchAll=false
```

---

## 2. Backend Tests (Node.js/Express)
The backend uses Jest, Supertest, and a MongoDB in-memory server for testing. All backend commands should be run from inside the `backend` directory.

```bash
# Navigate to the backend directory
cd backend
```

### Run all backend tests
```bash
npx jest
```

### Run all tests and generate a coverage report
```bash
npx jest --coverage
```

### Run tests sequentially (resolves port/memory collision issues)
```bash
npx jest --runInBand
```

### Run tests for a specific file or folder
```bash
# Run all Auth Controller tests
npx jest src/__tests__/controllers/authController.test.js

# Run all User Model tests
npx jest src/__tests__/models/User.test.js

# Run tests filtering by name
npx jest -t "should successfully register a new patient"
```

---

## 3. End-to-End Tests (Cypress)
Cypress is used to test the full flow of the application. The frontend and backend servers need to be running for these tests to work.

```bash
# Navigate to the root directory where `cypress` is located
# Ensure both servers are running first!
cd /path/to/project
```

### Open the Cypress Test Runner (Interactive UI)
```bash
npx cypress open
```

### Run all E2E tests in the terminal (Headless mode)
```bash
npx cypress run
```

### Run a specific Cypress test file
```bash
npx cypress run --spec "cypress/e2e/auth.cy.js"
```
