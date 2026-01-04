const { cycle, pipe } = require('..');

const incrementCounter = async (x) => {
    console.log(`Counter: ${x}`);
    return x + 1;
};

const isLessThanFive = (x) => x < 5;

const logStart = (start) => {
    console.log(`Starting loop at ${start}`);
    return start;
};

const logFinish = (final) => `Loop finished at ${final}`;

async function loopingExample() {
    console.log('=== Looping Example ===');

    const countUp = cycle(
        incrementCounter,
        isLessThanFive,
        10 // Max iterations safety
    );

    const pipeline = pipe([
        logStart,
        countUp,
        logFinish
    ]);

    const result = await pipeline(0);
    console.log(result);
}

if (require.main === module) {
    loopingExample().catch(console.error);
}

module.exports = { loopingExample };
