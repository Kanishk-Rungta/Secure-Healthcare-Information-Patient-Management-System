/**
 * Jest Configuration for Backend Testing
 * Secure Healthcare Information System
 */
module.exports = {
    testEnvironment: 'node',
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetModules: true,
    testTimeout: 30000,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/app.js',
        '!src/config/database.js',
        '!node_modules/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 75,
            lines: 80,
            statements: 80
        }
    },
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['./src/__tests__/setup.js']
};
