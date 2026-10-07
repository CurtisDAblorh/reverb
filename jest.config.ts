import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/e2e/", "<rootDir>/.next/", "<rootDir>/out/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.stories.tsx",
    "!src/components/ui/**",
    "!src/app/**",
  ],
};

// d3 ships ESM only, so it has to be transformed rather than ignored.
const esmPackages = ["d3", "d3-[a-z-]+", "internmap", "delaunator", "robust-predicates"].join("|");

export default async function jestConfig() {
  const resolved = await createJestConfig(config)();
  return {
    ...resolved,
    transformIgnorePatterns: [
      `/node_modules/(?!(${esmPackages})/)`,
      "^.+\.module\.(css|sass|scss)$",
    ],
  };
}
