/**
 * Fork tests
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Fork: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
        ],
    },
    {
        name: "Fork, Merge: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
            {
                op: "Merge",
                args: [true],
            },
        ],
    },
    {
        name: "Fork, (expect) Error, Merge",
        input: "1,2,3,4\n\n3,4,5,6",
        expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        expectedError: true,
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n\n", "\n\n", false],
            },
            {
                op: "Set Union",
                args: ["\n\n", ","],
            },
            {
                op: "Merge",
                args: [true],
            },
        ],
    },
    {
        name: "Fork, Conditional Jump, Encodings",
        input: "Some data with a 1 in it\nSome data with a 2 in it",
        expectedOutput: "U29tZSBkYXRhIHdpdGggYSAxIGluIGl0\n53 6f 6d 65 20 64 61 74 61 20 77 69 74 68 20 61 20 32 20 69 6e 20 69 74",
        recipeConfig: [
            {"op": "Fork", "args": ["\\n", "\\n", false]},
            {"op": "Conditional Jump", "args": ["1", false, "skipReturn", "10"]},
            {"op": "To Hex", "args": ["Space"]},
            {"op": "Return", "args": []},
            {"op": "Label", "args": ["skipReturn"]},
            {"op": "To Base64", "args": ["A-Za-z0-9+/="]}
        ]
    },
    {
        name: "Fork, Partial Merge",
        input: "Hello World",
        expectedOutput: "48656c6c6f 576f726c64",
        recipeConfig: [
            { "op": "Fork",   args: [" ", " ", false] },
            { "op": "Fork",   args: ["l", "l", false] },
            { "op": "Merge",  args: [false] },
            { "op": "To Hex", args: ["None", 0] },
        ]
    },
    {
        name: "Fork, Ignore errors: failed branch is dropped, survivors keep order and merge delimiter",
        input: "1,2\n\n3,4|single|5,6\n\n7,8",
        expectedOutput: "1,2,3,4|5,6,7,8",
        recipeConfig: [
            { "op": "Fork", args: ["|", "|", true] },
            { "op": "Set Union", args: ["\n\n", ","] },
            { "op": "Merge", args: [true] },
        ],
    },
    {
        name: "Fork, Ignore errors: every branch failing produces an empty string",
        input: "single|another",
        expectedOutput: "",
        recipeConfig: [
            { "op": "Fork", args: ["|", "|", true] },
            { "op": "Set Union", args: ["\n\n", ","] },
            { "op": "Merge", args: [true] },
        ],
    },
    {
        name: "Fork, Ignore errors: custom merge delimiter is retained between surviving branches",
        input: "1,2\n\n3,4|single|5,6\n\n7,8",
        expectedOutput: "1,2,3,4 :: 5,6,7,8",
        recipeConfig: [
            { "op": "Fork", args: ["|", " :: ", true] },
            { "op": "Set Union", args: ["\n\n", ","] },
            { "op": "Merge", args: [true] },
        ],
    },
    {
        name: "Fork, Ignore errors off: first failed branch stops the recipe with the operation's error",
        input: "1,2\n\n3,4|single|5,6\n\n7,8",
        expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        expectedError: true,
        recipeConfig: [
            { "op": "Fork", args: ["|", "|", false] },
            { "op": "Set Union", args: ["\n\n", ","] },
            { "op": "Merge", args: [true] },
            { "op": "To Lower case", args: [] },
        ],
    },
    {
        name: "Fork, Ignore errors off: error message is the same text as a single failing operation",
        input: '{"a":1}|{bad json}|{"b":2}',
        expectedOutput: "Unable to parse input as JSON.\nSyntaxError: JSON5: invalid character 'j' at 1:6",
        expectedError: true,
        recipeConfig: [
            { "op": "Fork", args: ["|", "|", false] },
            { "op": "JSON Beautify", args: ["    ", false, false] },
            { "op": "Merge", args: [true] },
        ],
    },
    {
        name: "Fork, Ignore errors: JSON records are beautified except the dropped bad record",
        input: '{"a":1}|{bad json}|{"b":2}',
        expectedOutput: '{\n    "a": 1\n}|{\n    "b": 2\n}',
        recipeConfig: [
            { "op": "Fork", args: ["|", "|", true] },
            { "op": "JSON Beautify", args: ["    ", false, false] },
            { "op": "Merge", args: [true] },
        ],
    },
    {
        name: "Fork: Return ending a branch early is not a failure",
        input: "1,2\n\n3,4|5,6\n\n7,8",
        expectedOutput: "1,2\n\n3,4|5,6\n\n7,8",
        recipeConfig: [
            { "op": "Fork", args: ["|", "|", false] },
            { "op": "Return", args: [] },
            { "op": "Set Union", args: ["\n\n", ","] },
            { "op": "Merge", args: [true] },
        ],
    },
    {
        name: "Fork, Ignore errors: a breakpoint in a branch pauses rather than failing",
        input: '{"a":1}|{"b":2}',
        expectedOutput: '{"a":1}|{"b":2}',
        recipeConfig: [
            { "op": "Fork", args: ["|", "|", true] },
            { "op": "JSON Beautify", args: ["    ", false, false], breakpoint: true },
            { "op": "Merge", args: [true] },
        ],
    },
    {
        name: "Nested Fork, Ignore errors off: failure deep in an inner branch stops the recipe",
        input: "1,2\n\n3,4|single;5,6\n\n7,8",
        expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        expectedError: true,
        recipeConfig: [
            { "op": "Fork", args: [";", ";", false] },
            { "op": "Fork", args: ["|", "|", false] },
            { "op": "Set Union", args: ["\n\n", ","] },
            { "op": "Merge", args: [false] },
            { "op": "Merge", args: [true] },
        ],
    },
    {
        name: "Nested Fork, Ignore errors: failed inner branches are dropped by the outer fork",
        input: "1,2\n\n3,4|single;5,6\n\n7,8",
        expectedOutput: "1,2,3,4;5,6,7,8",
        recipeConfig: [
            { "op": "Fork", args: [";", ";", true] },
            { "op": "Fork", args: ["|", "|", true] },
            { "op": "Set Union", args: ["\n\n", ","] },
            { "op": "Merge", args: [false] },
            { "op": "Merge", args: [true] },
        ],
    },
]);
