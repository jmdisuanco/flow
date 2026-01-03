const { commonSchemas } = require('../src/validation');
const { pipe, parallel, z, validate } = require('../src/index');

async function basicExample() {
  console.log('=== Basic Flow Example ===');

  const pipeline = pipe([
    validate.input(z.number().positive()),
    (x) => x * 2,
    (x) => x + 10,
    validate.output(z.number()),
  ]);

  const result = await pipeline(5);
  console.log('Result:', result); // 20
}

async function parallelExample() {
  console.log('=== Parallel Example ===');

  const parallelOps = parallel([(x) => x * 2, (x) => x + 100, (x) => x ** 2]);

  const results = await parallelOps(5);
  console.log('Results:', results); // [10, 105, 25]
}

async function validationExample() {
  console.log('=== Validation Example ===');

  const userPipe = pipe([
    validate.input(z.object({ email: z.string().email(), age: z.number().min(18) })),
    async (userData) => ({
      id: Math.floor(Math.random() * 1000),
      ...userData,
      verified: false,
    }),
    validate.output(
      commonSchemas.user.omit({ createdAt: true, updatedAt: true }).extend({
        age: z.number(),
        verified: z.boolean(),
      })
    ),
  ]);

  try {
    const result = await userPipe({ email: 'test@example.com', age: 25 });
    console.log('User created:', result);
  } catch (error) {
    console.error('Validation failed:', error.format());
  }
}

async function runExamples() {
  await validationExample();
}

if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = { basicExample, parallelExample, validationExample };
