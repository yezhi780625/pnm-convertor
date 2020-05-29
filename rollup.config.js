import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
    },

    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        include: ['src/**/*.ts'],
      }),
    ],
    preserveModules: true,
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/bundle.min.js',
      name: 'PNMConvertor',
      format: 'umd',
      plugins: [terser({ ie8: true })],
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        include: ['src/**/*.ts'],
      }),
    ],
  },
];
