/**
 * Subsection Tests.
 *
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Subsection: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["", true, true, false],
            },
        ],
    },
    {
        name: "Subsection, Full Merge: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["", true, true, false],
            },
            {
                "op": "Merge",
                "args": [true],
            },
        ],
    },
    {
        name: "Subsection, Partial Merge: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["", true, true, false],
            },
            {
                "op": "Merge",
                "args": [false],
            },
        ],
    },
    {
        name: "Subsection, Full Merge: Base64 with Hex",
        input: "SGVsbG38675629ybGQ=",
        expectedOutput: "Hello World",
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["386756", true, true, false],
            },
            {
                "op": "From Hex",
                "args": ["Auto"],
            },
            {
                "op": "Merge",
                "args": [true],
            },
            {
                "op": "From Base64",
                "args": ["A-Za-z0-9+/=", true, false],
            },
        ],
    },
    {
        name: "Subsection, Partial Merge: Base64 with Hex surrounded by binary data.",
        input: "000000000SGVsbG38675629ybGQ=0000000000",
        expectedOutput: "000000000Hello World0000000000",
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["SGVsbG38675629ybGQ=", true, true, false],
            },
            {
                "op": "Subsection",
                "args": ["386756", true, true, false],
            },
            {
                "op": "From Hex",
                "args": ["Auto"],
            },
            {
                "op": "Merge",
                "args": [false],
            },
            {
                "op": "From Base64",
                "args": ["A-Za-z0-9+/=", true, false],
            },
        ],
    },
    {
        name: "Subsection, Ignore errors: failed match keeps its original text, other matches still processed",
        input: 'pre {"a":1} mid {bad} post',
        expectedOutput: 'pre {\n    "a": 1\n} mid {bad} post',
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["\\{[^}]*\\}", true, true, true],
            },
            {
                "op": "JSON Beautify",
                "args": ["    ", false, false],
            },
            {
                "op": "Merge",
                "args": [true],
            },
        ],
    },
    {
        name: "Subsection, Ignore errors: failed match with a capture group keeps the whole match",
        input: 'pre X{"a":1}X mid X{bad}X post',
        expectedOutput: 'pre X{\n    "a": 1\n}X mid X{bad}X post',
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["X(\\{[^}]*\\})X", true, true, true],
            },
            {
                "op": "JSON Beautify",
                "args": ["    ", false, false],
            },
            {
                "op": "Merge",
                "args": [true],
            },
        ],
    },
    {
        name: "Subsection, Ignore errors off: first failed match stops the recipe with the operation's error",
        input: 'pre {"a":1} mid {bad} post',
        expectedOutput: "Unable to parse input as JSON.\nSyntaxError: JSON5: invalid character '}' at 1:5",
        expectedError: true,
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["\\{[^}]*\\}", true, true, false],
            },
            {
                "op": "JSON Beautify",
                "args": ["    ", false, false],
            },
            {
                "op": "Merge",
                "args": [true],
            },
        ],
    },
    {
        name: "Subsection: Return ending a matched section early is not a failure",
        input: 'pre {"a":1} post',
        expectedOutput: 'pre {"a":1} post',
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["\\{[^}]*\\}", true, true, false],
            },
            {
                "op": "Return",
                "args": [],
            },
            {
                "op": "JSON Beautify",
                "args": ["    ", false, false],
            },
            {
                "op": "Merge",
                "args": [true],
            },
        ],
    },
    {
        name: "Subsection, Ignore errors: input with no matching section is returned unchanged",
        input: "no json here",
        expectedOutput: "no json here",
        recipeConfig: [
            {
                "op": "Subsection",
                "args": ["\\d+", true, true, true],
            },
            {
                "op": "JSON Beautify",
                "args": ["    ", false, false],
            },
            {
                "op": "Merge",
                "args": [true],
            },
        ],
    },
]);
