/* 
  Need to test:
  
  Standard property: (innerHTML, className, id, onclick)
  -----------------------
  - standard prop set/get
  - standard prop events
  - standard prop update events
  - standard prop prevent defaults
  - standard prop prevent propogation
  - standard prop prevent immediate propogation
  - standard prop stop update
  
  Standard property, bubbled: (innerHTML, className, id, onclick)
  -----------------------------
  - standard prop events, event on parent elements
  - standard prop update events, event on parent elements
  - standard prop prevent defaults, event on parent elements
  - standard prop prevent propogation, event on parent elements
  - standard prop prevent immediate propogation, event on parent elements
  - standard prop stop update, event on parent elements
  
  Function property: (appendChild, addEventListener, setAttribute)
  ---------------------
  - function props run
  - function prop events
  - funciton prop update events
  - function prop prevent default
  - function prop prevent propogation
  - function prop prevent immediate propogation
  - function prop stop update
  
  Function property, bubbled: (appendChild, addEventListener, setAttribute)
  -----------------------------
  - function prop events, event on parent elements
  - funciton prop update events, event on parent elements
  - function prop prevent default, event on parent elements
  - function prop prevent propogation, event on parent elements
  - function prop prevent immediate propogation, event on parent elements
  - function prop stop update, event on parent elements
  
  Element attributes: (class, role, disabled, custom)
  ----------------------
  - element attribute set/get
  - element attribute event
  - element attribute update event
  - element attribute prevent default
  - element attribute stop propogation
  - element attribute stop immediate propogation
  - element attribute stop update
  
  Element attributes, bubbled: (class, role, disabled, custom)
  ------------------------------
  - element attribute event, event on parent elements
  - element attribute update event, event on parent elements
  - element attribute prevent default, event on parent elements
  - element attribute stop propogation, event on parent elements
  - element attribute stop immediate propogation, event on parent elements
  - element attribute stop update, event on parent elements
  
  Element styles: (color, font-size, margin)
  -----------------
  - element style set/get
  - element style event
  - element style update event
  - element style prevent default
  - element style stop propogation
  - element style stop immediate propogation
  - element style stop update
  
  Element styles, bubbled: (color, font-size, margin)
  ------------------------------
  - element style event, event on parent elements
  - element style update event, event on parent elements
  - element style prevent default, event on parent elements
  - element style stop propogation, event on parent elements
  - element style stop immediate propogation, event on parent elements
  - element style stop update, event on parent elements
  
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

(function(describe,expect){
  
  /* mocha tests */
  
  
  mocha.run();
}(describe,chai.expect));