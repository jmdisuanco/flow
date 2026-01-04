const { race, pipe } = require('..');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fastTask = async () => {
    await delay(100);
    return 'Fast Task Finished';
};

const slowTask = async () => {
    await delay(500);
    return 'Slow Task Finished';
};

async function racingExample() {
    console.log('=== Racing Example ===');

    const raceOps = race([slowTask, fastTask]);

    console.log('Starting race...');
    const winner = await raceOps();
    console.log('Winner:', winner); // Fast Task Finished
}

if (require.main === module) {
    racingExample().catch(console.error);
}

module.exports = { racingExample };
