// ================================
// src/__tests__/integration.test.ts
// ================================

import { branch, parallel, pipe } from '../index';

// Test utilities
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const memoize = <T, R>(fn: (param: T) => Promise<R>): ((param: T) => Promise<R>) => {
  const cache = new Map<string, R>();
  return async (param: T): Promise<R> => {
    const key = JSON.stringify(param);
    if (cache.has(key)) return cache.get(key) as R;
    const result = await fn(param);
    cache.set(key, result);
    return result;
  };
};

const retry = <T, R>(
  fn: (param: T) => Promise<R>,
  maxAttempts: number = 3,
  delayMs: number = 0
): ((param: T) => Promise<R>) => {
  return async (param: T): Promise<R> => {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        return await fn(param);
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw new Error('Max attempts exceeded');
  };
};

describe('Integration Tests', () => {
  describe('Complex Flow Compositions', () => {
    it('should handle nested flow compositions', async () => {
      const nestedPipe = pipe([
        parallel([(x: number) => x * 2, (x: number) => x + 10]),
        ([doubled, added]: [number, number]) => doubled + added,
        branch(
          (x: number) => x > 20,
          (x: number) => `High: ${x}`,
          (x: number) => `Low: ${x}`
        ),
      ]);

      const result = await nestedPipe(5);
      expect(result).toBe('High: 25'); // (5*2) + (5+10) = 25
    });

    it('should combine flow with memoization and retry', async () => {
      let callCount = 0;
      const unreliableOperation = async (x: number): Promise<number> => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First call fails');
        }
        return x * 3;
      };

      const resilientPipe = pipe([
        memoize(retry(unreliableOperation, 2, 10)),
        (x: number) => x + 100,
      ]);

      const result1 = await resilientPipe(5);
      const result2 = await resilientPipe(5); // Should use memoized result

      expect(result1).toBe(115); // (5 * 3) + 100
      expect(result2).toBe(115);
      expect(callCount).toBe(2); // Initial failure + success, no third call due to memoization
    });
  });

  describe('Real-world Scenarios', () => {
    it('should simulate a data processing pipeline', async () => {
      // Simulate external services
      const fetchUserData = async (userId: number) => {
        await delay(20);
        return { id: userId, name: `User${userId}`, active: userId % 2 === 0 };
      };

      const enrichUserData = async (user: { id: number; name: string; active: boolean }) => {
        await delay(15);
        return { ...user, enriched: true, timestamp: Date.now() };
      };

      const validateUser = (user: { active: boolean }) => {
        if (!user.active) {
          throw new Error('Inactive user');
        }
        return user;
      };

      const saveUser = async <T extends object>(user: T) => {
        await delay(10);
        return { ...user, saved: true };
      };

      // Build processing pipeline
      const userPipeline = pipe([retry(fetchUserData, 2), validateUser, enrichUserData, saveUser]);

      // Test with active user
      const result = await userPipeline(2);
      expect(result).toMatchObject({
        id: 2,
        name: 'User2',
        active: true,
        enriched: true,
        saved: true,
      });

      // Test with inactive user (should fail)
      await expect(userPipeline(1)).rejects.toThrow('Inactive user');
    });

    it('should simulate microservices orchestration', async () => {
      // Mock services
      const userService = async (id: number) => ({ id, name: `User${id}` });
      const profileService = async (id: number) => ({ userId: id, bio: `Bio for ${id}` });
      const preferencesService = async (id: number) => ({ userId: id, theme: 'dark' as const });

      // Orchestration flow
      const userAggregator = pipe([
        // Fetch user data in parallel
        (userId: number) => parallel([userService, profileService, preferencesService])(userId),

        // Merge results
        ([user, profile, preferences]: [
          { id: number; name: string },
          { userId: number; bio: string },
          { userId: number; theme: 'dark' },
        ]) => ({
          ...user,
          profile,
          preferences,
        }),

        // Add computed fields
        (userData: any) => ({
          ...userData,
          fullProfile: true,
          fetchedAt: Date.now(),
        }),
      ]);

      const result = await userAggregator(123);
      expect(result).toMatchObject({
        id: 123,
        name: 'User123',
        profile: { userId: 123, bio: 'Bio for 123' },
        preferences: { userId: 123, theme: 'dark' },
        fullProfile: true,
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors through flow chains', async () => {
      const errorPipe = pipe([
        (x: number) => x * 2,
        (x: number) => {
          if (x > 10) throw new Error('Value too high');
          return x;
        },
        (x: number) => x + 5,
      ]);

      await expect(errorPipe(6)).rejects.toThrow('Value too high');
    });

    it('should handle partial failures in parallel operations', async () => {
      const mixedParallel = parallel([
        (x: number) => x * 2,
        (x: number) => {
          if (x === 5) throw new Error('Specific failure');
          return x + 10;
        },
        (x: number) => x ** 2,
      ]);

      await expect(mixedParallel(5)).rejects.toThrow('Specific failure');
    });
  });
});
