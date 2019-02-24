var base = process.cwd().replace(/\\/g,'/'),
    fs = require('fs'),
    closureCompiler = require('google-closure-compiler-js').compile,
    flags = {};

console.log("Building Library...");

flags.jsCode = [{src: fs.readFileSync(base+'/pikantny.js','utf8')}];
flags.compilationLevel = 'SIMPLE';

fs.writeFileSync(base+'/pikantny.min.js',closureCompiler(flags).compiledCode);

console.log("Finished Building Minified Library..");