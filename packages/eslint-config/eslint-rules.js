/*
A fork of https://github.com/microsoft/rushstack/blob/a57573d44214d5283a166e36036f7920f4c21a36/stack/eslint-config/index.js
with some custom rules, also having it copied makes it easier to update plugins.

Feel free to open discussions about certain rules.
 */

module.exports = {
    // Disable the parser by default
    parser: "",

    plugins: [
        "@typescript-eslint/eslint-plugin",
        "import"
    ],

    rules: {
        // Spaces around { curly: "braces" }
        "object-curly-spacing": ["error", "always"],

        // Indent code with 4 spaces
        "indent": ["error", 4],

        // Force single quotes around strings
        "quotes": ["error", "single"],

        // Force a newline at the end of file
        "eol-last": ["error", "always"],

        // Remove trailing spaces
        "no-trailing-spaces": "error",
    },

    overrides: [
        {
            // Declare an override that applies to TypeScript files only
            "files": ["*.ts", "*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                // The "project" path is resolved relative to parserOptions.tsconfigRootDir.
                // Your local .eslintrc.js must specify that parserOptions.tsconfigRootDir=__dirname.
                project: "./tsconfig.json",

                ecmaVersion: 2020,

                sourceType: "module"
            },

            rules: {
                // Leave a trailing comma
                // RATIONALE: Better git diffs
                "comma-dangle": "off",
                "@typescript-eslint/comma-dangle": ["error", "always-multiline"],

                "import/order": [
                    "error",
                    {
                        "newlines-between": "always",
                        "alphabetize": {"order": "asc"}
                    }
                ],

                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/adjacent-overload-signatures": "error",

                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                //
                // CONFIGURATION:     By default, these are banned: String, Boolean, Number, Object, Symbol
                "@typescript-eslint/ban-types": [
                    "error",
                    {
                        types: {
                            String: {
                                message: "Use 'string' instead",
                                fixWith: "string"
                            },
                            Boolean: {
                                message: "Use 'boolean' instead",
                                fixWith: "boolean"
                            },
                            Number: {
                                message: "Use 'number' instead",
                                fixWith: "number"
                            },
                            Object: {
                                message: "Use 'object' instead, or else define a proper TypeScript type:"
                            },
                            Symbol: {
                                message: "Use 'symbol' instead",
                                fixWith: "symbol"
                            }
                        }
                    }
                ],

                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/naming-convention": ["error"],

                // RATIONALE:         We require "x as number" instead of "<number>x" to avoid conflicts with JSX.
                "@typescript-eslint/consistent-type-assertions": "error",

                // RATIONALE:         Code is more readable when the type of every variable is immediately obvious.
                //                    Even if the compiler may be able to infer a type, this inference will be unavailable
                //                    to a person who is reviewing a GitHub diff.  This rule makes writing code harder,
                //                    but writing code is a much less important activity than reading it.
                //
                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/explicit-function-return-type": [
                    "error",
                    {
                        allowExpressions: true,
                        allowTypedFunctionExpressions: true,
                        allowHigherOrderFunctions: false,
                    },
                ],

                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/explicit-member-accessibility": "error",

                // RATIONALE:         Object-oriented programming organizes code into "classes" that associate
                //                    data structures (the class's fields) and the operations performed on those
                //                    data structures (the class's members).  Studying the fields often reveals the "idea"
                //                    behind a class.  The choice of which class a field belongs to may greatly impact
                //                    the code readability and complexity.  Thus, we group the fields prominently at the top
                //                    of the class declaration.  We do NOT enforce sorting based on public/protected/private
                //                    or static/instance, because these designations tend to change as code evolves, and
                //                    reordering methods produces spurious diffs that make PRs hard to read.  For classes
                //                    with lots of methods, alphabetization is probably a more useful secondary ordering.
                "@typescript-eslint/member-ordering": [
                    "error",
                    {
                        "default": "never",
                        "classes": [
                            "field",
                            "constructor",
                            "method"
                        ]
                    }
                ],

                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/no-array-constructor": "error",

                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                //
                // RATIONALE:         The "any" keyword disables static type checking, the main benefit of using TypeScript.
                //                    This rule should be suppressed only in very special cases such as JSON.stringify()
                //                    where the type really can be anything.  Even if the type is flexible, another type
                //                    may be more appropriate such as "unknown", "{}", or "Record<k,V>".
                "@typescript-eslint/no-explicit-any": "error",

                // RATIONALE:         The #1 rule of promises is that every promise chain must be terminated by a catch()
                //                    handler.  Thus wherever a Promise arises, the code must either append a catch handler,
                //                    or else return the object to a caller (who assumes this responsibility).  Unterminated
                //                    promise chains are a serious issue.  Besides causing errors to be silently ignored,
                //                    they can also cause a NodeJS process to terminate unexpectedly.
                "@typescript-eslint/no-floating-promises": "error",

                // RATIONALE:         Catches a common coding mistake.
                "@typescript-eslint/no-for-in-array": "error",

                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/no-misused-new": "error",

                // RATIONALE:         The "namespace" keyword is not recommended for organizing code because JavaScript lacks
                //                    a "using" statement to traverse namespaces.  Nested namespaces prevent certain bundler
                //                    optimizations.  If you are declaring loose functions/variables, it's better to make them
                //                    static members of a class, since classes support property getters and their private
                //                    members are accessible by unit tests.  Also, the exercise of choosing a meaningful
                //                    class name tends to produce more discoverable APIs: for example, search+replacing
                //                    the function "reverse()" is likely to return many false matches, whereas if we always
                //                    write "Text.reverse()" is more unique.  For large scale organization, it's recommended
                //                    to decompose your code into separate NPM packages, which ensures that component
                //                    dependencies are tracked more conscientiously.
                //
                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/no-namespace": [
                    "error",
                    {
                        // Discourage "namespace" in .ts and .tsx files
                        "allowDeclarations": false,

                        // Allow it in .d.ts files that describe legacy libraries
                        "allowDefinitionFiles": false
                    }
                ],

                // RATIONALE:         When left in shipping code, unused variables often indicate a mistake.  Dead code
                //                    may impact performance.
                //
                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/no-unused-vars": [
                    "error",
                    {
                        "vars": "all",
                        // Unused function arguments often indicate a mistake in JavaScript code.  However in TypeScript code,
                        // the compiler catches most of those mistakes, and unused arguments are fairly common for type signatures
                        // that are overriding a base class method or implementing an interface.
                        "args": "none"
                    }
                ],

                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/no-use-before-define": "error",

                // RATIONALE:         The require() API is generally obsolete.  Use "import" instead.
                //
                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/no-var-requires": "error",

                // RATIONALE:         The "module" keyword is deprecated except when describing legacy libraries.
                //
                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "@typescript-eslint/prefer-namespace-keyword": "error",

                // RATIONALE:         Catches a common coding mistake.
                "accessor-pairs": "error",

                // RATIONALE:         In TypeScript, if you write x["y"] instead of x.y, it disables type checking.
                "dot-notation": [
                    "error",
                    {
                        "allowPattern": "^_"
                    }
                ],

                // RATIONALE:         Catches a common coding mistake.
                "eqeqeq": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "for-direction": "error",

                // RATIONALE:         Catches a common coding mistake.
                "guard-for-in": "error",

                // RATIONALE:         If you have more than 2,000 lines in a single source file, it's probably time
                //                    to split up your code.
                "max-lines": ["error", {"max": 2000}],

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-async-promise-executor": "error",

                // RATIONALE:         "|" and "&" are relatively rare, and are more likely to appear as a mistake when
                //                    someone meant "||" or "&&".  (But nobody types the other operators by mistake.)
                "no-bitwise": [
                    "error",
                    {
                        allow: [
                            "^",
                            // "|",
                            // "&",
                            "<<",
                            ">>",
                            ">>>",
                            "^=",
                            // "|=",
                            //"&=",
                            "<<=",
                            ">>=",
                            ">>>=",
                            "~"
                        ]
                    }
                ],

                // RATIONALE:         Deprecated language feature.
                "no-caller": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-compare-neg-zero": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-cond-assign": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-constant-condition": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-control-regex": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-debugger": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-delete-var": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-duplicate-case": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-empty": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-empty-character-class": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-empty-pattern": "error",

                // RATIONALE:         Eval is a security concern and a performance concern.
                "no-eval": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-ex-assign": "error",

                // RATIONALE:         System types are global and should not be tampered with in a scalable code base.
                //                    If two different libraries (or two versions of the same library) both try to modify
                //                    a type, only one of them can win.  Polyfills are acceptable because they implement
                //                    a standardized interoperable contract, but polyfills are generally coded in plain
                //                    JavaScript.
                "no-extend-native": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-extra-boolean-cast": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-extra-label": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-fallthrough": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-func-assign": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-implied-eval": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-invalid-regexp": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-label-var": "error",

                // RATIONALE:         Eliminates redundant code.
                "no-lone-blocks": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-misleading-character-class": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-multi-str": "error",

                // RATIONALE:         It's generally a bad practice to call "new Thing()" without assigning the result to
                //                    a variable.  Either it's part of an awkward expression like "(new Thing()).doSomething()",
                //                    or else implies that the constructor is doing nontrivial computations, which is often
                //                    a poor class design.
                "no-new": "error",

                // RATIONALE:         Obsolete notation that is error-prone.
                "no-new-func": "error",

                // RATIONALE:         Obsolete notation.
                "no-new-object": "error",

                // RATIONALE:         Obsolete notation.
                "no-new-wrappers": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-octal": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-octal-escape": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-regex-spaces": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-return-assign": "error",

                // RATIONALE:         Security risk.
                "no-script-url": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-self-assign": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-self-compare": "error",

                // RATIONALE:         This avoids statements such as "while (a = next(), a && a.length);" that use
                //                    commas to create compound expressions.  In general code is more readable if each
                //                    step is split onto a separate line.  This also makes it easier to set breakpoints
                //                    in the debugger.
                "no-sequences": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-shadow-restricted-names": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-sparse-arrays": "error",

                // RATIONALE:         Although in theory JavaScript allows any possible data type to be thrown as an exception,
                //                    such flexibility adds pointless complexity, by requiring every catch block to test
                //                    the type of the object that it receives.  Whereas if catch blocks can always assume
                //                    that their object implements the "Error" contract, then the code is simpler, and
                //                    we generally get useful additional information like a call stack.
                "no-throw-literal": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-unmodified-loop-condition": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-unsafe-finally": "error",

                // RATIONALE:         Catches a common coding mistake.
                "no-unused-expressions": "off",
                "@typescript-eslint/no-unused-expressions": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-unused-labels": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-useless-catch": "error",

                // RATIONALE:         Avoids a potential performance problem.
                "no-useless-concat": "error",

                // RATIONALE:         The "var" keyword is deprecated because of its confusing "hoisting" behavior.
                //                    Always use "let" or "const" instead.
                //
                // STANDARDIZED BY:   @typescript-eslint\eslint-plugin\dist\configs\recommended.json
                "no-var": "error",

                // RATIONALE:         Generally not needed in modern code.
                "no-void": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "no-with": "error",

                // @typescript-eslint\eslint-plugin\dist\configs\eslint-recommended.js
                "prefer-const": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "require-atomic-updates": "error",

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "require-yield": "error",

                // "Use strict" is redundant when using the TypeScript compiler.
                "strict": ["error", "never"],

                // STANDARDIZED BY:   eslint\conf\eslint-recommended.js
                "use-isnan": "error",

                // RATIONALE:         End statements with semicolons.
                "semi": ["error", "always"]
            }
        }
    ]
};
