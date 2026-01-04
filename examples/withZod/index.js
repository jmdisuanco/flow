const { pipe } = require('@jmdisuanco/flow');
const { z } = require('zod');

// --- Schemas ---

const UserInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

const UserOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  isActive: z.boolean(),
});

// --- Helper Factory ---

const validate = (schema) => async (data) => {
  return schema.parseAsync(data);
};

// --- Pipeline Steps ---

const validateInput = validate(UserInputSchema);

const enrichUserData = async (data) => {
  console.log(`Enriching data for ${data.name}...`);
  // Simulate DB processing or external API call
  return {
    ...data,
    id: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
    isActive: true,
    processedAt: new Date(),
  };
};

const validateOutput = validate(UserOutputSchema);

const formatResponse = (data) => {
  console.log('Formatting response...');
  return {
    status: 201,
    body: data,
  };
};

// --- Main Example ---

async function zodExample() {
  console.log('=== Zod Integration Example ===');

  const createUserPipeline = pipe([validateInput, enrichUserData, validateOutput, formatResponse]);

  console.log('\nTest 1: Valid Input');
  try {
    const input = {
      name: 'Alice',
      email: 'alice@example.com',
      age: 25,
    };
    const result = await createUserPipeline(input);
    console.log('Result:', result);
  } catch (error) {
    console.error('Pipeline failed:', error);
  }

  console.log('\nTest 2: Invalid Input');
  try {
    const invalidInput = {
      name: 'B', // Too short
      email: 'not-an-email',
      age: 12, // Too young
    };
    await createUserPipeline(invalidInput);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', error.issues);
    } else {
      console.error('Unknown Error:', error);
    }
  }
}

if (require.main === module) {
  zodExample();
}

module.exports = { zodExample };
