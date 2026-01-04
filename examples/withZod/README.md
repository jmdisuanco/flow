# Zod Integration Example

This example demonstrates how to integrate [Zod](https://zod.dev/) for schema validation within `@jmdisuanco/flow` pipelines.

## Overview

The example pipeline processes user data through several stages:
1.  **Input Validation**: Validates the raw input object against a Zod schema.
2.  **Enrichment**: Simulates fetching additional data or business logic processing.
3.  **Output Validation**: Ensures the processed data matches the internal domain model.
4.  **Formatting**: Formats the final response.

## Usage

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Run the example**:
    ```bash
    node index.js
    ```

## Key Concept: Reusable Validation Wrapper

We use a simple helper function to adapt Zod schemas into pipeline-compatible async functions:

```javascript
const validate = (schema) => async (data) => {
  return schema.parseAsync(data);
};

const validateInput = validate(InputSchema);
```

This keeps your pipeline definitions clean and readable.
