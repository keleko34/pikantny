var connect = require('connect')(),
    static = require('serve-static'),
    open = require('opn'),
    base = process.cwd().replace(/\\/g,'/');

console.info("\033[36mPress ctrl + o to quickly open the default web page in your default browser, ctrl + c will stop the server\033[37m");

connect.use('/',static(base, {'index': ['/test/index.html']}));

connect.listen(8080);

var stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data',function(key)
    {
        if(key === '\u000f')
        {
            open('http://localhost:8080');
        }
        else
        {
            if (key === '\u0003')
            {
                process.exit();
            }
            process.stdout.write(key);
        }
    });