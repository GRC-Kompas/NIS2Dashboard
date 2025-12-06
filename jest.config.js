const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Ensure we transform node_modules if they are ESM but Jest runs in CJS
  // jose is pure ESM. We can try to map it or tell jest to transform it.
  // Actually simplest is to tell ts-jest to process it or use a preset.
  // But often 'jose' works better if we map to the cjs version if available, or force transform.
  // However, 'jose' 5.x+ is ESM only.

  // Let's try transformIgnorePatterns to include 'jose'
  transformIgnorePatterns: [
    "node_modules/(?!(jose|@panva/hkdf)/)"
  ],
};
