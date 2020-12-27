import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/ea-state-machine.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [typescript()],
}
