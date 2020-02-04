const { unlink, readFileSync, writeFileSync } = require('fs')
      base = process.cwd().replace(/\\/g,'/'),
      closureCompiler = require('google-closure-compiler-js'),
      flags = {};

console.log("Building Pikantny Library...");

flags.jsCode = [{src: readFileSync(base+'/pikantny.js','utf8')}];
flags.compilationLevel = 'SIMPLE';
flags.rewritePolyfills = false;
unlink(base+'/pikantny.min.js', (err) => {
 if(err && !err.code === 'ENOENT') return;
 writeFileSync(base+'/pikantny.min.js',closureCompiler(flags).compiledCode);
 console.log("Finished Building Minified Library..");
});
