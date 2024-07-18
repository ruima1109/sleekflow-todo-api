import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";


export default [
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.jest, // Add Jest globals here
        process: 'readonly' // Ensure 'process' is recognized as a global variable
      }
    }
  },
  pluginJs.configs.recommended,
  pluginReactConfig
];