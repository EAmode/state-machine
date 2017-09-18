import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
const pkg = require('./package.json')
const camelCase = require('lodash.camelcase')

const libraryName = 'ea-state-machine'

export default {
  input: `compiled/${libraryName}.js`,
  output: [{
      file: pkg.main,
      name: camelCase(libraryName),
      format: 'umd'
    },
    {
      file: pkg.module,
      format: 'es'
    }
  ],
  sourcemap: true,
  onwarn: (warning) => {
    // Suppress this error message... there are hundreds of them. Angular team says to ignore it.
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return
    }
    console.error(warning.message)
  },
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['rxjs/BehaviorSubject', 'rxjs/Subject'],
  plugins: [
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      namedExports: {
        "node_modules/ramda/index.js": ["map", "minBy", "find", "allPass", "unnest"]
      }
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps()
  ]
}
