export default {
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.ts$": "babel-jest",
  },
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/tests/**"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  transformIgnorePatterns: ["node_modules/(?!(supertest)/)", "generated/"],
  moduleNameMapper: {
    "^../config/database.js$": "<rootDir>/src/tests/setup.js",
  },
};
