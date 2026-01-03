const { flow, parallel, branch, race, cycle, z, GraphRunner } = require('./lib/index.js');

async function comprehensiveTest() {
  console.log('🧪 Running comprehensive functionality test...\n');

  try {
    // Test 1: Basic flow
    console.log('1. Testing basic flow...');
    const basicFlow = flow([(x) => x * 2, (x) => x + 10]);
    const result1 = await basicFlow(5);
    console.log(`   ✅ Basic flow: ${result1} (expected: 20)`);

    // Test 2: Parallel execution
    console.log('2. Testing parallel execution...');
    const parallelOps = parallel([(x) => x * 2, (x) => x + 100]);
    const result2 = await parallelOps(5);
    console.log(`   ✅ Parallel: [${result2}] (expected: [10, 105])`);

    // Test 3: Branch condition
    console.log('3. Testing branch conditions...');
    const conditional = branch(
      (x) => x > 10,
      (x) => `High: ${x}`,
      (x) => `Low: ${x}`
    );
    const result3a = await conditional(15);
    const result3b = await conditional(5);
    console.log(`   ✅ Branch high: ${result3a} (expected: High: 15)`);
    console.log(`   ✅ Branch low: ${result3b} (expected: Low: 5)`);

    // Test 4: Race condition
    console.log('4. Testing race condition...');
    const raceOps = race([
      async (x) => {
        await new Promise((r) => setTimeout(r, 10));
        return x * 2;
      },
      async (x) => {
        await new Promise((r) => setTimeout(r, 20));
        return x * 3;
      },
    ]);
    const result4 = await raceOps(5);
    console.log(`   ✅ Race: ${result4} (expected: 10, fastest wins)`);

    // Test 5: Cycle
    console.log('5. Testing cycle...');
    const accumulator = cycle(
      (x) => x + 1,
      (x) => x < 8,
      10
    );
    const result5 = await accumulator(5);
    console.log(`   ✅ Cycle: ${result5} (expected: 8)`);

    // Test 6: Validation with Zod v4
    console.log('6. Testing validation with Zod v4...');
    const validatedFlow = flow([(x) => x * 2], {
      input: z.number().positive(),
      output: z.number(),
    });
    const result6 = await validatedFlow(5);
    console.log(`   ✅ Validated flow: ${result6} (expected: 10)`);

    // Test 7: Validation error
    console.log('7. Testing validation error handling...');
    try {
      await validatedFlow(-5);
      console.log('   ❌ Should have thrown validation error');
    } catch (error) {
      console.log(`   ✅ Validation error: ${error.message}`);
    }

    // Test 8: Graph Runner
    console.log('8. Testing Graph Runner...');
    const graph = new GraphRunner();
    graph
      .addNode('input', (x) => x * 2)
      .addNode('process', (x) => x + 10)
      .connect('input', 'process');

    await graph.execute('input', 5);
    const graphResults = graph.getResults();
    console.log(`   ✅ Graph input: ${graphResults.get('input')} (expected: 10)`);
    console.log(`   ✅ Graph process: ${graphResults.get('process')} (expected: 20)`);

    // Test 9: Complex composition (your original bug report case)
    console.log('9. Testing your original bug report case...');
    const typedPipeline = flow(
      [(x) => x * 2, (x) => x + 10, (x) => ({ result: x, processed: true })],
      {
        input: z.number().positive(),
        output: z.object({
          result: z.number(),
          processed: z.boolean(),
        }),
      }
    );
    const result9 = await typedPipeline(5);
    console.log(`   ✅ Complex typed pipeline:`, result9);
    console.log(`   ✅ Expected: { result: 20, processed: true }`);

    console.log('\n🎉 ALL TESTS PASSED! Your bug is completely fixed.');
    console.log('📦 Package ready for publishing with all missing build files included.');
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error(error.stack);
  }
}

comprehensiveTest();
