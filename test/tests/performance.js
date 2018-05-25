console.calculateTime = function(func,cycles)
{
  var times = [],
      start,
      end;
  
  for(var x=0,len=cycles;x<len;x++)
  {
    start = performance.now();
    func();
    end = performance.now();
    times.push((end-start));
  }
  
  return ((times.reduce(function(a, b) { return a + b; }) / times.length) * 1000).toFixed(2)+'ms';
}

var async = true,
    runTests = true;

var pikantnyTest = pikantnyDocument.querySelector('#test'),
    KBTest = KBDocument.querySelector('#test');

    pikantnyWindow.console.calculateTime = console.calculateTime;
    KBWindow.console.calculateTime = console.calculateTime;

var innerHTMLPerf = new Benchmark.Suite('innerHTML'),
    classNamePerf = new Benchmark.Suite('className'),
    setAttributePerf = new Benchmark.Suite('setAttribute'),
    appendChildPerf = new Benchmark.Suite('appendChild');

if(runTests)
{
  // add tests
  innerHTMLPerf
  .add('KB#innerHTML', function() {
    KBTest.innerHTML = Math.random();
  })
  .add('Pikantny#innerHTML', function() {
    pikantnyTest.innerHTML = Math.random();
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target),event);
  })
  .on('complete', function() {
    console.log('*****Fastest is ' + this.filter('fastest').map('name'),'******');
  })
  // run async
  .run({ 'async': async });

  // add tests
  classNamePerf
  .add('KB#className', function() {
    KBTest.className = Math.random();
  })
  .add('Pikantny#className', function() {
    pikantnyTest.className = Math.random();
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target),event);
  })
  .on('complete', function() {
    console.log('*****Fastest is ' + this.filter('fastest').map('name'),'*****');
  })
  // run async
  .run({ 'async': async });

  // add tests
  setAttributePerf
  .add('KB#setAttribute', function() {
    KBTest.setAttribute('data-custom',Math.random());
  })
  .add('Pikantny#setAttribute', function() {
    pikantnyTest.setAttribute('data-custom',Math.random());
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target),event);
  })
  .on('complete', function() {
    console.log('*****Fastest is ' + this.filter('fastest').map('name'),'*****');
  })
  // run async
  .run({ 'async': async });


  // add tests
  var d = document.createElement('div');
      d.innerHTML = "<div></div><input />";

  appendChildPerf
  .add('KB#appendChild', function() {
    KBTest.appendChild(d);
  })
  .add('Pikantny#appendChild', function() {
    pikantnyTest.appendChild(d);
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target),event);
  })
  .on('complete', function() {
    console.log('*****Fastest is ' + this.filter('fastest').map('name'),'*****');
  })
  // run async
  .run({ 'async': async }); 
}