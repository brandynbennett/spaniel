/*
Copyright 2016 LinkedIn Corp. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

var Funnel = require('broccoli-funnel');
var uglify = require('broccoli-uglify-js');
var typescript = require('broccoli-typescript-compiler').typescript;
var Rollup = require('broccoli-rollup');
var merge = require('broccoli-merge-trees');
var replace = require('broccoli-string-replace');

var es6Tree = typescript('src', {
  tsconfig: {
    compilerOptions: {
      "noImplicitAny": true,
      "declaration": true,
      "isolatedModules": false,
      "module": "es2015",
      "target": "es5",
      "outDir": "es6",
      "sourceMap": true,
      "moduleResolution": "node"
    },
    filesGlob: [
      "**/*.ts"
    ]
  }
});

// use replace to fix ES6 + Typescript helpers issue
// Possibly won't be needed after https://github.com/Microsoft/TypeScript/pull/9097
var umdTree = replace(new Rollup(es6Tree, {
  rollup: {
    entry: 'es6/index.js',
    dest: 'spaniel.js',
    format: 'umd',
    moduleName: 'spaniel',
    exports: 'named',
    sourceMap: true,
  }
}), {
  files: [ 'spaniel.js' ],
  pattern: {
    match: /undefined.__extends/g,
    replacement: 'false'
  }
});


var minTree = uglify(new Funnel(umdTree, {
  destDir: 'min'
}), {
  mangle: true,
  compress: true
});

module.exports = merge([es6Tree, umdTree, minTree]);