module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          baseUrl: "./src",
          paths: {
            "@core/*": ["core/*"],
            "@platforms/*": ["platforms/*"],
            "@infrastructure/*": ["infrastructure/*"],
            "@presentation/*": ["presentation/*"],
            "@aiModels/*": ["aiModels/*"],
          },
        },
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@platforms/(.*)$": "<rootDir>/src/platforms/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@presentation/(.*)$": "<rootDir>/src/presentation/$1",
    "^@aiModels/(.*)$": "<rootDir>/src/aiModels/$1",
  },
};
