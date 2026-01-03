import { branch, parallel, pipe, ValidationError, z } from '../index';

describe('Core Flow Functions', () => {
  describe('pipe()', () => {
    it('should execute functions in sequence', async () => {
      const pipeline = pipe([(x: number) => x * 2, (x: number) => x + 10]);

      const result = await pipeline(5);
      expect(result).toBe(20);
    });

    it('should validate input and output', async () => {
      const validatedPipe = pipe([(x: number) => x * 2], {
        input: z.number().positive(),
        output: z.number(),
      });

      const result = await validatedPipe(5);
      expect(result).toBe(10);

      await expect(validatedPipe(-5)).rejects.toThrow(ValidationError);
    });
  });

  describe('parallel()', () => {
    it('should execute functions in parallel', async () => {
      const parallelOps = parallel([(x: number) => x * 2, (x: number) => x + 100]);

      const results = await parallelOps(5);
      expect(results).toEqual([10, 105]);
    });
  });

  describe('branch()', () => {
    it('should execute correct branch based on condition', async () => {
      const conditional = branch(
        (x: number) => x > 10,
        (x: number) => `High: ${x}`,
        (x: number) => `Low: ${x}`
      );

      expect(await conditional(15)).toBe('High: 15');
      expect(await conditional(5)).toBe('Low: 5');
    });
  });

  describe('ValidationError', () => {
    it('should format error messages properly', () => {
      const error = new ValidationError('Test error', {
        errors: [{ path: ['email'], message: 'Invalid email' }],
        received: { email: 'invalid' },
      });

      const formatted = error.format();
      expect(formatted).toContain('Test error');
      expect(formatted).toContain('email: Invalid email');
    });
  });
});
