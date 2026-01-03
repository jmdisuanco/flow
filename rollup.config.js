const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');

module.exports = [
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'named',
    },
    external: ['zod/v4'],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'lib',
        rootDir: 'src',
        compilerOptions: {
          module: 'esnext',
        },
      }),
    ],
  },
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.esm.js',
      format: 'esm',
    },
    external: ['zod/v4'],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        compilerOptions: {
          module: 'esnext',
          declarationMap: false,
        },
      }),
    ],
  },
  // UMD build (minified)
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.umd.min.js',
      format: 'umd',
      name: 'JmartFlow',
      exports: 'named',
      globals: {
        'zod/v4': 'z',
      },
    },
    external: ['zod/v4'],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        compilerOptions: {
          module: 'esnext',
          declarationMap: false,
        },
      }),
      terser(),
    ],
  },
];
