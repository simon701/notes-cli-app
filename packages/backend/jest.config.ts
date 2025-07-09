import { Config } from "jest";
import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testRegex: ".*\\.test\\.ts$",
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>"],
  coverageDirectory: "coverage",
};

export default config;
