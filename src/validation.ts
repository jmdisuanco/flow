import { z } from 'zod/v4';

export class ValidationError extends Error {
  name: 'ValidationError' = 'ValidationError';
  errors: Array<{ path?: PropertyKey[]; message: string }>;
  received?: unknown;
  nodeContext?: string;
  flowContext?: string[];

  constructor(
    message: string,
    details?: {
      errors?: Array<{ path?: PropertyKey[]; message: string }>;
      received?: unknown;
      nodeContext?: string;
      flowContext?: string[];
    }
  ) {
    super(message);
    this.errors = details?.errors || [];
    this.received = details?.received;
    this.nodeContext = details?.nodeContext;
    this.flowContext = details?.flowContext;
  }

  format(): string {
    const lines = [this.message];
    if (this.nodeContext) lines.push(`\nNode: ${this.nodeContext}`);
    if (this.flowContext) lines.push(`Flow: ${this.flowContext.join(' → ')}`);
    if (this.errors.length > 0) {
      lines.push('\nValidation errors:');
      for (const error of this.errors) {
        const path = error.path && error.path.length > 0 ? error.path.join('.') : 'root';
        lines.push(`  • ${path}: ${error.message}`);
      }
    }
    if (this.received !== undefined) {
      lines.push(`\nReceived: ${JSON.stringify(this.received, null, 2)}`);
    }
    return lines.join('\n');
  }
}

export interface ValidationOptions {
  input?: z.ZodSchema<any>;
  output?: z.ZodSchema<any>;
  label?: string;
}

export type ValidateFunction = <T>(data: unknown) => T;

export const validate = {
  input:
    <T>(schema: z.ZodSchema<T>, label?: string) =>
    (data: unknown): T => {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new ValidationError(`Input validation failed${label ? ` at '${label}'` : ''}`, {
          errors: result.error.issues,
          received: data,
          nodeContext: label,
        });
      }
      return result.data;
    },

  output:
    <T>(schema: z.ZodSchema<T>, label?: string) =>
    (data: unknown): T => {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new ValidationError(`Output validation failed${label ? ` at '${label}'` : ''}`, {
          errors: result.error.issues,
          received: data,
          nodeContext: label,
        });
      }
      return result.data;
    },

  between:
    <T>(schema: z.ZodSchema<T>, fromLabel: string, toLabel: string) =>
    (data: unknown): T => {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new ValidationError(`Validation failed between '${fromLabel}' and '${toLabel}'`, {
          errors: result.error.issues,
          received: data,
          flowContext: [fromLabel, 'VALIDATION_FAILED', toLabel],
        });
      }
      return result.data;
    },

  // Enhanced validation with custom error messages
  custom:
    <T>(schema: z.ZodSchema<T>, errorMessage: string, label?: string) =>
    (data: unknown): T => {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new ValidationError(errorMessage + (label ? ` at '${label}'` : ''), {
          errors: result.error.issues,
          received: data,
          nodeContext: label,
        });
      }
      return result.data;
    },
};

export function withSchema<TInput = unknown, TOutput = unknown>(
  fn: (input: TInput) => Promise<TOutput> | TOutput,
  schemas: {
    input?: z.ZodSchema<TInput>;
    output?: z.ZodSchema<TOutput>;
  } = {},
  label?: string
): (data: unknown) => Promise<TOutput> {
  const functionLabel = label || fn.name || 'anonymous';

  return async (data: unknown): Promise<TOutput> => {
    let validatedInput = data as TInput;

    if (schemas.input) {
      const inputResult = schemas.input.safeParse(data);
      if (!inputResult.success) {
        throw new ValidationError(`Input validation failed for function '${functionLabel}'`, {
          errors: inputResult.error.issues,
          received: data,
          nodeContext: functionLabel,
        });
      }
      validatedInput = inputResult.data;
    }

    let result: TOutput;
    try {
      result = await fn(validatedInput);
    } catch (error) {
      if (error instanceof ValidationError) {
        error.nodeContext = error.nodeContext || functionLabel;
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Function '${functionLabel}' execution failed: ${errorMessage}`);
    }

    if (schemas.output) {
      const outputResult = schemas.output.safeParse(result);
      if (!outputResult.success) {
        throw new ValidationError(`Output validation failed for function '${functionLabel}'`, {
          errors: outputResult.error.issues,
          received: result,
          nodeContext: functionLabel,
        });
      }
      return outputResult.data;
    }

    return result;
  };
}

export interface TypedFlowBuilder<TOutput> {
  input: <TInput>(inputSchema: z.ZodSchema<TInput>) => {
    flow: (
      functions: Array<(input: any) => any>,
      label?: string
    ) => (input: TInput) => Promise<TOutput>;
  };
}

export function typedFlow<TOutput>(outputSchema: z.ZodSchema<TOutput>): TypedFlowBuilder<TOutput> {
  return {
    input: <TInput>(inputSchema: z.ZodSchema<TInput>) => ({
      flow: (functions: Array<(input: any) => any>, label = 'typed-flow') => {
        // We'll implement this when flow is actually called to avoid circular dependency
        return async (input: TInput): Promise<TOutput> => {
          const { pipe } = require('./index');
          const pipeline = pipe([
            validate.input(inputSchema, `${label}-input`),
            ...functions,
            validate.output(outputSchema, `${label}-output`),
          ]);
          return await pipeline(input);
        };
      },
    }),
  };
}

// Updated for Zod v4 - using new top-level functions
export const commonSchemas = {
  id: z.number().positive().int(),
  email: z.email(), // Zod v4 top-level function
  user: z.object({
    id: z.number().positive(),
    email: z.email(), // Zod v4 top-level function
    name: z.string().min(1),
    createdAt: z.iso.datetime(), // Zod v4 ISO datetime format
    updatedAt: z.iso.datetime(), // Zod v4 ISO datetime format
  }),
  apiResponse: <T>(dataSchema: z.ZodSchema<T>) =>
    z.object({
      success: z.boolean(),
      data: dataSchema.optional(),
      error: z.string().optional(),
      timestamp: z.iso.datetime().default(() => new Date().toISOString()), // Zod v4 ISO datetime
    }),
};

export { z };
