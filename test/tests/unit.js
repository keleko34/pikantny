/* 
  Need to test:
  
  Standard property: (innerHTML, className, id, onclick) v/
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
  
  Function property: (appendChild, addEventListener, setAttribute) v/
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
  
  Element attributes: (id, role, disabled, custom) v/
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
  
  Element styles: (color, font-size, margin)
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
  
  Element Style Special:
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
  
  Custom events: (custom)
  ----------------
  * to be added
  
  Custom observables: (custom)
  --------------------
  * to be added
  
*/

mocha.setup('bdd');

(function(describe,it,expect,spy){
    
  /* mocha tests */
  standardDomProperties(describe,it,expect,spy);
  standardDomStyles(describe,it,expect,spy);
  standardDomAttributes(describe,it,expect,spy);
  standardDomFunction(describe,it,expect,spy);
  
  mocha.run();
}(describe,it,chai.expect,sinon.spy));