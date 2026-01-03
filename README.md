# @jmdisuanco/flow

[![npm version](https://img.shields.io/github/package-json/v/jmdisuanco/flow)](https://github.com/jmdisuanco/flow/packages)
[![CI](https://github.com/jmdisuanco/flow/actions/workflows/ci.yml/badge.svg)](https://github.com/jmdisuanco/flow/actions/workflows/ci.yml)
[![Release](https://github.com/jmdisuanco/flow/actions/workflows/release.yml/badge.svg)](https://github.com/jmdisuanco/flow/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A lightweight, functional approach to Flow-Based Programming (FBP) focused on composable primitives: pipe, parallel, branch, race, and cycle patterns.

## 🚀 Features

- **Functional Purity** - Each node is a pure async function
- **Complex Topologies** - Support for branching, merging, parallel paths, and cycles  
- **Async-First** - Built for modern async workflows
- **Composable** - Primitives can be nested and combined
- **TypeScript Support** - Full TypeScript type definitions with generic type safety
- **Zod Validation** - Built-in schema validation and error handling
- **Error Handling** - Built-in timeout and error propagation

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Primitives](#core-primitives)
- [Flow Diagrams](#flow-diagrams)
- [Usage Examples](#usage-examples)
- [Advanced Patterns](#advanced-patterns)
- [Use Cases](#use-cases)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## 🛠 Installation

```bash
npm install @jmdisuanco/flow
# or
yarn add @jmdisuanco/flow
```

## ⚡ Quick Start

### JavaScript
```javascript
import { pipe, parallel, branch, race, cycle } from '@jmdisuanco/flow';

// Sequence / Pipe
const linearPipeline = pipe([
  x => x * 2,
  x => x + 10,
  x => ({ result: x, processed: true })
]);

const result = await linearPipeline(5); // { result: 20, processed: true }
```

### TypeScript
```typescript
import { pipe, parallel, z, ValidationOptions } from '@jmdisuanco/flow';

// Type-safe pipe with validation
const typedPipeline = pipe<number, { result: number; processed: boolean }>([
  (x: number) => x * 2,
  (x: number) => x + 10,
  (x: number) => ({ result: x, processed: true })
], {
  input: z.number().positive(),
  output: z.object({
    result: z.number(),
    processed: z.boolean()
  })
});

const result = await typedPipeline(5); // Fully typed result
```

## 🔧 Core Primitives

### Pipe / Sequence
```javascript
const pipe = (fns) => async (param) => 
  fns.reduce(async (payload, nxt) => nxt(await payload), param);
```

### Parallel Execution
```javascript
const parallel = (fns) => async (param) => 
  Promise.all(fns.map(fn => fn(param)));
```

### Conditional Branching
```javascript
const branch = (condition, trueFn, falseFn) => async (param) => 
  (await condition(param)) ? trueFn(param) : falseFn(param);
```

### Racing Execution
```javascript
const race = (fns) => async (param) => 
  Promise.race(fns.map(fn => fn(param)));
```

### Cycle/Loop
```javascript
const cycle = (bodyFn, condition, maxIterations = 100) => async (param) => {
  let current = param;
  let iterations = 0;
  
  while (await condition(current) && iterations < maxIterations) {
    current = await bodyFn(current);
    iterations++;
  }
  
  return current;
};
```

## 📊 Flow Diagrams

### 1. Pipe / Sequence
```
Input → Process A → Process B → Process C → Output
  5   →    10    →    20     →    30     →   30
```

### 2. Parallel Flow
```
        ┌─→ Process A (×2) ─┐
Input ──┼─→ Process B (+100)─┼─→ [Results Array]
   5    └─→ Process C (²) ──┘     [10, 105, 25]
```

### 3. Branching Flow  
```
Input → Condition
  │         │
  │    ┌────┴────┐
  │    │ > 10 ?  │
  │    └────┬────┘
  │         │
  ├─ TRUE ──┼─→ High Path (×10)
  │         │
  └─ FALSE ─┼─→ Low Path (+5)
```



### 4. Cycle Flow (Fibonacci)
```
Input: {a:0, b:1, n:0}
   │
   ▼
┌─────────────────┐
│ While n < 10    │◄──┐
└─────────────────┘   │
   │                  │
   ▼                  │
Process: {a:b, b:a+b, n:n+1}
   │                  │
   └──────────────────┘
   │
   ▼
Output: {a:55, b:89, n:10}
```

### 5. Race Flow
```
        ┌─→ Slow Process (500ms) ──┐
Input ──┼─→ Fast Process (100ms) ──┼─→ First to Complete
   5    └─→ Medium Process (200ms) ─┘         ↑
                                           Winner!
```

## 💡 Usage Examples

### Visual Flow Builder (React Flow Integration)
```bash
# Run the interactive React Flow example
cd examples/vite-react-flow
npm install && npm run dev
```

Visual interface with drag-and-drop flow building, real-time execution, and result visualization. Features linear, parallel, and branching flow examples with TypeScript support.

### Data Processing Pipeline
```javascript
const dataProcessor = pipe([
  // Extract
  async (url) => fetch(url).then(r => r.json()),
  
  // Transform
  async (data) => data.map(item => ({
    ...item,
    processed: true,
    timestamp: Date.now()
  })),
  
  // Load
  async (transformedData) => {
    await saveToDatabase(transformedData);
    return { success: true, count: transformedData.length };
  }
]);

const result = await dataProcessor('https://api.example.com/data');
```

### API Orchestration
```javascript
const apiOrchestrator = parallel([
  async (userId) => fetchUserProfile(userId),
  async (userId) => fetchUserPosts(userId), 
  async (userId) => fetchUserConnections(userId)
]);

const [profile, posts, connections] = await apiOrchestrator(123);
```

### Conditional Processing
```javascript
const smartProcessor = branch(
  async (data) => data.type === 'premium',
  
  // Premium path
  pipe([
    async (data) => enhanceWithAI(data),
    async (data) => addPremiumFeatures(data),
    async (data) => notifyPremiumUsers(data)
  ]),
  
  // Standard path  
  pipe([
    async (data) => basicProcessing(data),
    async (data) => standardNotification(data)
  ])
);
```



### With Validation
```javascript
import { pipe, validate, z, ValidationError } from '@jmdisuanco/flow';

const validatedPipe = pipe([
  validate.input(z.number().positive(), 'input-validator'),
  x => x * 2,
  validate.output(z.number().min(0), 'output-validator')
]);

try {
  await validatedPipe(5); // Works: 10
  await validatedPipe(-1); // Throws ValidationError
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.format()); // Detailed error with context
  }
}
```

## 🎯 Use Cases

### 1. **ETL Pipelines**
- **Extract** data from multiple sources in parallel
- **Transform** with conditional logic based on data type
- **Load** to different destinations using branching

```javascript
const etlPipeline = pipe([
  parallel([fetchDatabase, fetchAPI, fetchFiles]),
  (sources) => merge(sources),
  branch(isLargeDataset, heavyTransform, lightTransform),
  parallel([saveToWarehouse, saveToCache, sendNotification])
]);
```

### 2. **Microservices Orchestration**
- Coordinate multiple service calls
- Handle failures with racing timeouts
- Implement circuit breaker patterns

```javascript
const serviceOrchestrator = race([
  pipe([callPrimaryService, validateResponse]),
  timeout(callBackupService, 5000),
  async () => getCachedFallback()
]);
```

### 3. **Real-time Data Processing**
- Stream processing with branching logic
- Parallel aggregations
- Feedback loops for iterative refinement

```javascript
const streamProcessor = cycle(
  pipe([
    receiveStreamData,
    parallel([aggregateMetrics, detectAnomalies, updateModels]),
    branch(hasAnomalies, alertSystem, continueProcessing)
  ]),
  (state) => state.shouldContinue
);
```

### 4. **Machine Learning Pipelines**  
- Parallel feature extraction
- Model ensemble voting
- Iterative training loops

```javascript
const mlPipeline = pipe([
  parallel([extractFeatures, preprocessData, validateInputs]),
  (results) => combineFeatures(results),
  race([modelA, modelB, modelC]), // Ensemble racing
  postProcessPredictions
]);
```

### 5. **Content Management**
- Multi-stage content processing
- Parallel thumbnail/preview generation  
- Conditional publishing workflows

```javascript
const contentProcessor = branch(
  (content) => content.type === 'video',
  
  // Video processing
  parallel([
    generateThumbnails,
    extractMetadata,
    transcodeFormats,
    generatePreview
  ]),
  
  // Image processing
  parallel([
    optimizeImage,
    generateVariants,
    extractEXIF
  ])
);
```

## 📚 API Reference

### Core Functions

#### `pipe<TInput, TOutput>(functions: Function[], validation?: ValidationOptions): PipeFunction<TInput, TOutput>`
Creates a linear pipeline where output of each function becomes input of the next.

#### `parallel<TInput, TOutput>(functions: Function[], validation?: ValidationOptions): ParallelFunction<TInput, TOutput>`  
Executes all functions simultaneously with the same input.

#### `branch<TInput, TOutput>(condition: Function, trueFn: Function, falseFn: Function, validation?: ValidationOptions): BranchFunction<TInput, TOutput>`
Conditionally executes one of two functions based on condition result.

#### `race<TInput, TOutput>(functions: Function[]): RaceFunction<TInput, TOutput>`
Executes all functions simultaneously, returns result of first to complete.

#### `cycle<TInput>(bodyFn: Function, condition: Function, maxIterations?: number): CycleFunction<TInput>`
Repeatedly executes bodyFn while condition is true.

### Validation Functions

#### `validate.input<T>(schema: z.ZodSchema<T>, label?: string): ValidateFunction`
Creates an input validator function.

#### `validate.output<T>(schema: z.ZodSchema<T>, label?: string): ValidateFunction`
Creates an output validator function.

#### `withSchema<TInput, TOutput>(fn: Function, schemas: ValidationOptions, label?: string): Function`
Wraps a function with input/output validation.



## 🔍 Advanced Patterns

### Error Handling
```javascript
const resilientFlow = pipe([
  async (data) => {
    try {
      return await riskyOperation(data);
    } catch (error) {
      return { error: error.message, fallback: true };
    }
  },
  (result) => result.error ? handleError(result) : processSuccess(result)
]);
```

### Memoization
```javascript
const memoize = (fn, keyFn = JSON.stringify) => {
  const cache = new Map();
  return async (param) => {
    const key = keyFn(param);
    if (cache.has(key)) return cache.get(key);
    
    const result = await fn(param);
    cache.set(key, result);
    return result;
  };
};

const cachedFlow = pipe([
  memoize(expensiveOperation),
  quickTransform,
  memoize(anotherExpensiveOperation)
]);
```

### Monitoring & Metrics
```javascript
const withMetrics = (name, fn) => async (param) => {
  const start = Date.now();
  try {
    const result = await fn(param);
    metrics.timing(`${name}.success`, Date.now() - start);
    return result;
  } catch (error) {
    metrics.timing(`${name}.error`, Date.now() - start);
    metrics.increment(`${name}.failure`);
    throw error;
  }
};

const monitoredFlow = pipe([
  withMetrics('fetch', fetchData),
  withMetrics('transform', transformData),
  withMetrics('save', saveData)
]);
```

## 🧪 Testing

```javascript
// Test individual nodes
describe('Data Transformer', () => {
  it('should transform user data correctly', async () => {
    const transformer = createTransformer();
    const input = { id: 1, name: 'John' };
    const result = await transformer(input);
    
    expect(result).toEqual({
      id: 1,
      name: 'John',
      processed: true,
      timestamp: expect.any(Number)
    });
  });
});

// Test flow composition
describe('User Processing Flow', () => {
  it('should process user through complete pipeline', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ id: 1, name: 'John' });
    const mockSave = jest.fn().mockResolvedValue({ success: true });
    
    const userPipeline = pipe([mockFetch, transformUser, mockSave]);
    const result = await userPipeline('user123');
    
    expect(mockFetch).toHaveBeenCalledWith('user123');
    expect(mockSave).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });
});
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
git clone https://github.com/jmdisuanco/flow.git
cd flow
npm install
npm test
npm run type-check  # TypeScript type checking
npm run build       # Builds JS and copies .d.ts files to lib/
```

### Build Process
The build process now includes TypeScript declaration files:
- Compiles JavaScript with Rollup (CommonJS, ESM, UMD)
- Copies TypeScript `.d.ts` files from `src/` to `lib/`
- Generated `lib/` directory contains both JS and type definitions
- Users get full TypeScript support when importing the package

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classical Flow-Based Programming concepts
- Built for modern async/await JavaScript patterns  
- Designed to complement React Flow visual programming interfaces

---

**Happy Flowing! 🌊**