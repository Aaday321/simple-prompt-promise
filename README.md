promptPromise
=============

A simple and flexible npm package for prompting user input from the command line.

Installation
------------

npm install promptPromise

Features
--------

- Type Safety: Validation based on expected data type.
- Cancel Options: Capability to cancel input with pre-defined keywords.
- Flexible Validation: Built-in validation functions or custom validation rules.
- Multiple Input Types: Prompt for strings, numbers, and booleans with customization.

Usage
-----

### Importing

\`\`\`javascript
const { getInputWithPrompt, getInput, getNumberWithPrompt, getBooleanWithPrompt } = require('promptPromise');
\`\`\`

### Prompt for String Input with Validation

\`\`\`javascript
const name = await getInputWithPrompt('Enter your name: ', {
    validation: (input) => input.length >= 3 || "Name must be at least 3 characters long.",
    canCancel: true
});
\`\`\`

### Get Raw Input without a Prompt

\`\`\`javascript
const rawInput = await getInput({
    validation: (input) => input.length > 0 || "Input cannot be empty.",
    canCancel: ['quit', 'exit']
});
\`\`\`

### Prompt for a Number within a Range

\`\`\`javascript
const age = await getNumberWithPrompt('Enter your age: ', {
    range: [0, 150],
    canCancel: false
});
\`\`\`

### Prompt for a Boolean Value

\`\`\`javascript
const isConfirmed = await getBooleanWithPrompt('Confirm? (y/n): ', {
    accept: ['yes', 'y'],
    reject: ['no', 'n'],
    canCancel: ['quit']
});
\`\`\`

API
---

### Functions

- getInputWithPrompt(prompt, options)
- getInput(options)
- getNumberWithPrompt(prompt, options)
- getBooleanWithPrompt(prompt, options)

#### Options

- validation: A function that returns true if the input is valid or a custom error message.
- canCancel: A boolean or array of strings that will cancel the prompt.
- range: An array of two numbers defining the acceptable range (for getNumberWithPrompt).
- accept: An array of strings considered as 'true' (for getBooleanWithPrompt).
- reject: An array of strings considered as 'false' (for getBooleanWithPrompt).

Contributing
------------

Feel free to open issues or PRs!
