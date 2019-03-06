/* 
  Need to test:
  
  Standard property: (innerHTML, className, id, onclick) v/ ***
  -----------------------
  - standard prop set/get
  - stanard add and remove events
  - standard prop events
  - standard prop update events
  - standard prop prevent defaults
  - standard prop prevent propogation
  - standard prop prevent immediate propogation
  - standard prop stop update
  - standard event properties
  
  Function property: (appendChild, addEventListener, setAttribute) v/ ***
  ---------------------
  - function props run
  - stanard add and remove events
  - function prop events
  - funciton prop update events
  - function prop prevent default
  - function prop prevent propogation
  - function prop prevent immediate propogation
  - function prop stop update
  - function event properties
  
  Element attributes: (id, role, disabled, custom) v/ ***
  ----------------------
  - element attribute set/get
  - standard add and remove events
  - element attribute event properties
  - element attribute event
  - element attribute update event
  - element attribute prevent default
  - element attribute stop propogation
  - element attribute stop immediate propogation
  - element attribute stop update
  
  Element styles: (color, font-size, margin) v/ ***
  -----------------
  - element style set/get
  - standard add and remove events
  - element attribute event properties
  - element style event
  - element style update event
  - element style prevent default
  - element style stop propogation
  - element style stop immediate propogation
  - element style stop update
  
  Element Style Special: v/ ***
  ------------------------
  -webkit-user-select  Chrome all / Safari all
  -moz-user-select     Firefox all
  -ms-user-select      IE all
  
  html/text events:
  ('textContent','innerHTML','innerText','outerHTML','outerText','appendChild','removeChild','replaceChild','insertAdjacentHTML','insertBefore')
  -------------------
  - all element html properties set/get
  - all element html event (html and text)
  - all element html update event (html and text)
  - all element html prevent default (html and text)
  - all element html stop propogation (html and text)
  - all element html stop immediate propogation (html and text)
  - all element html stop update (html and text)
  
  Input values: (value, checked)
  --------------
  - input value/checked set/get
  - input value/checked event on user input
  - input value/checked update event on user input
  - input value/checked prevent default on user input
  - input value/checked stop propogation on user input
  - input value/checked stop immediate propogation on user input
  - input value/checked stop update on user input
*/
mocha.setup('bdd');

/* timer library */
function timer(key,index)
{ 
  this.key = key;
  this.index = index;
  
  this.getLastTime = function()
  {
    return localStorage.getItem(this.key+this.index);
  }

  this.updateTime = function(time)
  {
    return localStorage.setItem(this.key+this.index,time);
  }
  
  this.getTime = function(duration)
  {
    return parseInt(duration.textContent.replace('ms'),10);
  }
}

function getElementsByText(str, tag)
{
  if(!tag) tag = 'a';
  return Array.prototype.slice.call(document.getElementsByTagName(tag))
  .filter(function(el){ return (el.textContent.trim() === str.trim()) })[0];
}

function getDurationsInTest(key)
{
  return getElementsByText(key+':').parentElement.parentElement.querySelectorAll('span.duration')
}

function trackTestTime(key)
{
  var perf,
      slow = 3;

  beforeEach(function(){
    perf = new timer(key,getDurationsInTest(key).length);
  })

  afterEach(function(){

    var durations = getDurationsInTest(key),
        index = (durations.length - 1);
    if(!durations[index]) return;
    var performance = durations[index].parentElement.appendChild(document.createElement('span')),
        time = perf.getTime(durations[index]),
        oldTime = (perf.getLastTime() || 0);
    
    durations[index].style.display = 'inline';
    durations[index].style.background = (time > slow ? 'red' : '#c09853');
    performance.style.display = 'inline';
    performance.style.color = 'white';
    performance.style.background = (oldTime > slow ? 'red' : 'green');
    performance.style.boxShadow = 'inset 0 1px 1px rgba(0,0,0,.2)';
    performance.style.fontSize = '9px';
    performance.style.padding = '2px 5px';
    performance.style.borderRadius = '5px';

    performance.innerHTML = 'Last: ' + oldTime + 'ms';
    
    perf.updateTime(time);
  })
}

(function(describe,it,expect,spy){
  /* mocha tests */
  standardDomProperties(describe,it,expect,spy,timer);
  standardDomStyles(describe,it,expect,spy,timer);
  standardDomFunction(describe,it,expect,spy,timer);
  standardDomAttributes(describe,it,expect,spy,timer);
  
  mocha.run();
}(describe,it,chai.expect,sinon.spy));