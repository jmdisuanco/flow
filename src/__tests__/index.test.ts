import { branch, cycle, parallel, pipe, race } from '../index';

describe('pipe', () => {
  it('should execute functions in sequence', async () => {
    const addOne = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    const pipeline = pipe([addOne, double]);

    const result = await pipeline(1);
    expect(result).toBe(4);
  });

  it('should handle async functions', async () => {
    const asyncAdd = async (x: number) => x + 1;
    const pipeline = pipe([asyncAdd, asyncAdd]);

    const result = await pipeline(1);
    expect(result).toBe(3);
  });

  it('should throw error if input is not an array', () => {
    expect(() => pipe('not array' as any)).toThrow();
  });

  it('should throw error if input array is empty', () => {
    expect(() => pipe([])).toThrow();
  });

  it('should propagate errors', async () => {
    const throwError = () => {
      throw new Error('Test error');
    };
    const pipeline = pipe([throwError]);
    await expect(pipeline(1)).rejects.toThrow('Test error');
  });
});

describe('parallel', () => {
  it('should execute functions in parallel', async () => {
    const slow = async (x: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return x * 2;
    };
    const fast = (x: number) => x * 3;

    const p = parallel([slow, fast]);
    const result = await p(10);
    expect(result).toEqual([20, 30]);
  });
});

describe('branch', () => {
  it('should execute trueFn when condition is true', async () => {
    const condition = (x: number) => x > 5;
    const trueFn = (x: number) => x * 2;
    const falseFn = (x: number) => x / 2;

    const b = branch(condition, trueFn, falseFn);
    expect(await b(10)).toBe(20);
  });

  it('should execute falseFn when condition is false', async () => {
    const condition = (x: number) => x > 5;
    const trueFn = (x: number) => x * 2;
    const falseFn = (x: number) => x / 2;

    const b = branch(condition, trueFn, falseFn);
    expect(await b(2)).toBe(1);
  });
});

describe('race', () => {
  it('should return result from first completed function', async () => {
    const slow = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return 'slow';
    };
    const fast = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'fast';
    };

    const r = race([slow, fast]);
    expect(await r(1)).toBe('fast');
  });
});

describe('cycle', () => {
  it('should repeat execution until condition is false', async () => {
    const increment = (x: number) => x + 1;
    const condition = (x: number) => x < 5;

    const c = cycle(increment, condition);
    expect(await c(0)).toBe(5);
  });

  it('should respect maxIterations', async () => {
    const increment = (x: number) => x + 1;
    const alwaysTrue = () => true;

    const c = cycle(increment, alwaysTrue, 5);
    await expect(c(0)).rejects.toThrow('Cycle exceeded');
  });
});
