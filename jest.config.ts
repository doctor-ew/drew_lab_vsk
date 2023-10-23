module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    globals: {
        'ts-jest': {
            tsConfig: './tsconfig.jest.json' // Path to your tsconfig.jest.json
        }
    }
};
