# Examples

This directory contains examples demonstrating various features of `@jmdisuanco/flow`. [Back to Main Documentation](../README.md)

## Running the Examples

All single-file examples can be run directly with `node`. For the project-based examples (like `withZod`), you'll need to install dependencies first.

| Example | Description | Command |
| :--- | :--- | :--- |
| **[Basic Usage](basic-usage.js)** | Demonstrates the core `pipe` for sequential execution and `parallel` for concurrent tasks. | `node basic-usage.js` |
| **[Branching](branching.js)** | Shows how to use `branch` to conditionally execute different pipeline steps based on input. | `node branching.js` |
| **[Looping](looping.js)** | Demonstrates the `cycle` function for iterative processing until a condition is met. | `node looping.js` |
| **[Racing](racing.js)** | Uses `race` to run multiple tasks and return the result of the fastest one. | `node racing.js` |
| **[Error Handling](error-handling.js)** | Illustrates how exceptions propagate through the pipeline and how to handle them. | `node error-handling.js` |
| **[Zod Integration](withZod/README.md)** | A complete example showing how to use [Zod](https://zod.dev) for schema validation in pipelines. | `cd withZod && pnpm install && node index.js` |

## Notes

- All examples use **named functions** to demonstrate clean code practices and better composability.
- The `withZod` example requires `pnpm` to be installed.
