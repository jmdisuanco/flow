import { ValidationError, withSchema, type z } from './validation';

export type AsyncFunction<TInput = any, TOutput = any> = (
  input: TInput
) => Promise<TOutput> | TOutput;

export type PipeFunction<TInput = any, TOutput = any> = (input: TInput) => Promise<TOutput>;

export type ParallelFunction<TInput = any, TOutput = any[]> = (input: TInput) => Promise<TOutput>;

export type BranchFunction<TInput = any, TOutput = any> = (input: TInput) => Promise<TOutput>;

export type RaceFunction<TInput = any, TOutput = any> = (input: TInput) => Promise<TOutput>;

export type CycleFunction<TInput = any, TOutput = any> = (input: TInput) => Promise<TOutput>;

export interface ValidationOptions {
  input?: z.ZodSchema<any>;
  output?: z.ZodSchema<any>;
  label?: string;
}

export function pipe<TInput = any, TOutput = any>(
  fns: AsyncFunction[],
  validation: ValidationOptions = {}
): PipeFunction<TInput, TOutput> {
  if (!Array.isArray(fns)) {
    throw new Error('pipe() requires an array of functions');
  }
  if (fns.length === 0) {
    throw new Error('pipe() requires at least one function');
  }

  const { input: inputSchema, output: outputSchema, label = 'pipe' } = validation;

  const corePipe = async (param: TInput): Promise<TOutput> => {
    return fns.reduce(async (payload: Promise<any>, nxt: AsyncFunction, index: number) => {
      if (typeof nxt !== 'function') {
        throw new Error(
          `All items in pipe array must be functions (item ${index} is ${typeof nxt})`
        );
      }

      try {
        return await nxt(await payload);
      } catch (error) {
        if (error instanceof ValidationError) {
          error.flowContext = error.flowContext || [];
          error.flowContext.unshift(`${label}[${index}]`);
        }
        throw error;
      }
    }, Promise.resolve(param)) as Promise<TOutput>;
  };

  if (inputSchema || outputSchema) {
    return withSchema(
      corePipe,
      { input: inputSchema, output: outputSchema },
      label
    ) as PipeFunction<TInput, TOutput>;
  }

  return corePipe;
}

export function parallel<TInput = any, TOutput = any[]>(
  fns: AsyncFunction[],
  validation: ValidationOptions = {}
): ParallelFunction<TInput, TOutput> {
  if (!Array.isArray(fns)) {
    throw new Error('parallel() requires an array of functions');
  }

  const { input: inputSchema, output: outputSchema, label = 'parallel' } = validation;

  const coreParallel = async (param: TInput): Promise<TOutput> => {
    const promises = fns.map((fn: AsyncFunction, index: number) => {
      if (typeof fn !== 'function') {
        throw new Error(
          `All items in parallel array must be functions (item ${index} is ${typeof fn})`
        );
      }

      return Promise.resolve(fn(param)).catch((error) => {
        if (error instanceof ValidationError) {
          error.flowContext = error.flowContext || [];
          error.flowContext.unshift(`${label}[${index}]`);
        }
        throw error;
      });
    });

    return Promise.all(promises) as Promise<TOutput>;
  };

  if (inputSchema || outputSchema) {
    return withSchema(
      coreParallel,
      { input: inputSchema, output: outputSchema },
      label
    ) as ParallelFunction<TInput, TOutput>;
  }

  return coreParallel;
}

export function branch<TInput = any, TOutput = any>(
  condition: (input: TInput) => Promise<boolean> | boolean,
  trueFn: AsyncFunction<TInput, TOutput>,
  falseFn: AsyncFunction<TInput, TOutput>,
  validation: ValidationOptions = {}
): BranchFunction<TInput, TOutput> {
  if (
    typeof condition !== 'function' ||
    typeof trueFn !== 'function' ||
    typeof falseFn !== 'function'
  ) {
    throw new Error('branch() requires three functions: condition, trueFn, falseFn');
  }

  const { input: inputSchema, output: outputSchema, label = 'branch' } = validation;

  const coreBranch = async (param: TInput): Promise<TOutput> => {
    try {
      const shouldTakeTrue = await condition(param);
      const selectedFn = shouldTakeTrue ? trueFn : falseFn;
      const result = await selectedFn(param);
      return result;
    } catch (error) {
      if (error instanceof ValidationError) {
        error.flowContext = error.flowContext || [];
        error.flowContext.unshift(label);
      }
      throw error;
    }
  };

  if (inputSchema || outputSchema) {
    return withSchema(
      coreBranch,
      { input: inputSchema, output: outputSchema },
      label
    ) as BranchFunction<TInput, TOutput>;
  }

  return coreBranch;
}

export function race<TInput = any, TOutput = any>(
  fns: AsyncFunction[]
): RaceFunction<TInput, TOutput> {
  return async (param: TInput): Promise<TOutput> => {
    if (!Array.isArray(fns)) {
      throw new Error('race() requires an array of functions');
    }

    return Promise.race(
      fns.map((fn: AsyncFunction) => {
        if (typeof fn !== 'function') {
          throw new Error('All items in race array must be functions');
        }
        return fn(param);
      })
    ) as Promise<TOutput>;
  };
}

export function cycle<TInput = any>(
  bodyFn: AsyncFunction<TInput, TInput>,
  condition: (input: TInput) => Promise<boolean> | boolean,
  maxIterations: number = 100
): CycleFunction<TInput, TInput> {
  return async (param: TInput): Promise<TInput> => {
    if (typeof bodyFn !== 'function' || typeof condition !== 'function') {
      throw new Error('cycle() requires bodyFn and condition functions');
    }

    let current = param;
    let iterations = 0;

    while ((await condition(current)) && iterations < maxIterations) {
      current = await bodyFn(current);
      iterations++;

      if (iterations >= maxIterations) {
        throw new Error(`Cycle exceeded maximum iterations (${maxIterations})`);
      }
    }

    return current;
  };
}

// Re-export validation utilities
export { commonSchemas, ValidationError, validate, withSchema, z } from './validation';
