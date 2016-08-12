const { rollup } = require('rollup');
const rollupBabel = require('rollup-plugin-babel');
const flow = require('rollup-plugin-flow');
const css = require('modular-css/rollup');
const path = require('path');

rollup({
  sourceMap: true,
  entry: 'src/RichTextEditor.js',
  external: [
    'react',
    'react-dom',
  ],
  plugins: [
    css({
      css: 'dist/index.css'
    }),
    flow(),
    rollupBabel({
      exclude: ['node_modules/**'],
      plugins: ['transform-flow-strip-types'],
      // plugins: ['transform-runtime', 'external-helpers'],
      presets: ['es2015-rollup', 'react', 'stage-2'],
      runtimeHelpers: true,
      externalHelpers: true,
      babelrc: false
    })
  ]
}).then((bundle) => {
  return bundle.write({
    format: 'es',
    exports: 'named',
    // moduleName: 'react-rte',
    dest: 'dist/react-rte.js'
  });
})
.catch((error) => console.log(error));
