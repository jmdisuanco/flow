const { pipe } = require('..');

const processStep1 = (x) => {
  console.log(`Step 1: processing ${x}`);
  return x;
};

const checkNegative = (x) => {
  if (x < 0) {
    throw new Error('Negative values not allowed!');
  }
  return x * 2;
};

const processStep3 = (x) => {
  console.log(`Step 3: success with ${x}`);
  return x;
};

async function errorHandlingExample() {
  console.log('=== Error Handling Example ===');

  const riskyPipeline = pipe([processStep1, checkNegative, processStep3]);

  console.log('Test 1: Success case');
  try {
    const result = await riskyPipeline(10);
    console.log('Result:', result);
  } catch (err) {
    console.error('Caught error:', err.message);
  }

  console.log('\nTest 2: Failure case');
  try {
    await riskyPipeline(-5);
  } catch (err) {
    console.error('Caught error:', err.message);
  }
}

if (require.main === module) {
  errorHandlingExample().catch(console.error);
}

module.exports = { errorHandlingExample };
