const { branch, pipe } = require('..');

const isGreaterThanTen = (x) => x > 10;

const handleHigh = async (x) => {
  console.log(`${x} is greater than 10`);
  return 'High';
};

const handleLow = async (x) => {
  console.log(`${x} is less than or equal to 10`);
  return 'Low';
};

const formatResult = (result) => `Result category: ${result} `;

// Optional: Identity function for initial logging or pass-through
const logStart = (x) => x;

async function branchingExample() {
  console.log('=== Branching Example ===');

  // Define the branching logic separately for clarity
  const checkValue = branch(isGreaterThanTen, handleHigh, handleLow);

  const pipeline = pipe([logStart, checkValue, formatResult]);

  console.log(await pipeline(5)); // Low
  console.log(await pipeline(15)); // High
}

if (require.main === module) {
  branchingExample().catch(console.error);
}

module.exports = { branchingExample };
