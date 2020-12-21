module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
}
