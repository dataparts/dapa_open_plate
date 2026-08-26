import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",

    roots: [
        "<rootDir>/focus"
    ],

    testMatch: [
        "**/*.test.ts"
    ],

    moduleFileExtensions: [
        "ts",
        "js",
        "json"
    ],

    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ]
};

export default config;