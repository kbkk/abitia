/*
https://github.com/eslint/eslint/issues/3458#issuecomment-516716165

We need to patch ESLint plugin loading, so this should be added to the top of .eslintrc.js:
require("@abitia/eslint/patch-eslint");
 */

require('@rushstack/eslint-patch/modern-module-resolution');
