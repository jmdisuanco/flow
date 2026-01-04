const { pipe, parallel } = require('..');

// --- Basic Example Functions ---

const logInput = (x) => {
  console.log(`Input: ${x}`);
  return x;
};

const double = (x) => x * 2;

const addTen = (x) => x + 10;

const logFinal = (x) => {
  console.log(`Final: ${x}`);
  return x;
};

async function basicExample() {
  console.log('=== Basic Flow Example ===');

  const pipeline = pipe([logInput, double, addTen, logFinal]);

  const result = await pipeline(5);
  console.log('Result:', result); // 20
}

// --- Parallel Example Functions ---

const processDouble = async (x) => {
  console.log('Processing x * 2');
  return x * 2;
};

const processAddHundred = async (x) => {
  console.log('Processing x + 100');
  return x + 100;
};

const processSquare = async (x) => {
  console.log('Processing x ** 2');
  return x ** 2;
};

async function parallelExample() {
  console.log('\n=== Parallel Example ===');

  const parallelOps = parallel([processDouble, processAddHundred, processSquare]);

  const results = await parallelOps(5);
  console.log('Results:', results); // [10, 105, 25]
}

async function runExamples() {
  try {
    await basicExample();
    await parallelExample();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

if (require.main === module) {
  runExamples();
}

module.exports = { basicExample, parallelExample };
