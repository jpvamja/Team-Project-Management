import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],

        ignores: ["node_modules/", "dist/", "build/", "coverage/"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.node },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-undef": "error",

            "no-async-promise-executor": "error",
            "require-await": "warn",
            "no-return-await": "warn",

            semi: ["error", "always"],
            quotes: ["error", "double"],
            indent: ["error", 4, { SwitchCase: 1 }],

            eqeqeq: ["error", "always"],
            curly: ["error", "all"],
            "consistent-return": "error",

            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
]);
