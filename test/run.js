const { spawn } = require('child_process'),
      { createServer } = require("http"),
      { stdin, platform } = process,
      { createReadStream } = require('fs'),
      base = process.cwd().replace(/\\/g, '/'),
      app = (platform == 'darwin' ? 'open' : platform == 'win32' ? 'explorer.exe' : 'xdg-open');

let browser;

createServer((req, res) => {
  if(req.url === '/') req.url = '/test/index.html';
  const read = createReadStream(base + req.url, { encoding: 'utf8' });
  read.on('open', () => { read.pipe(res); });
  read.on('error', (err) => { console.error(err); res.end(''); });
})
.listen(8080);

function exit() {
  if(browser) browser.kill();
  process.exit();
}

stdin.setEncoding('utf8');
stdin.setRawMode(true);
stdin.resume();

console.info("\033[36mPress ctrl + o to quickly open the default web page in your default browser, ctrl + c will stop the server\033[37m");

stdin.on('data',function(key) {
  if(key.charCodeAt(0) === 15) {
    if(!browser) browser = spawn(`${app}`, [`http://localhost:8080`]);
  }
  else {
    if (key.charCodeAt(0) === 3) exit();
    process.stdout.write(key);
  }
});

process.on('exit', exit);
