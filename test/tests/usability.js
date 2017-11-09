/* 
  Need to test:
  
  Standard property: (innerHTML, className, id, onclick)
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

(function(describe,it,expect,spy){
  
  /* dom nodes to use */
  var parentElement = document.querySelector('.test_subject__element'),
      childElement = document.querySelector('.test_subject__element__child'),
      inputElement = document.querySelector('.test_subject__element__input'),
      checkboxElement = document.querySelector('.test_subject__element__checkbox');
    
  /* mocha tests */
  describe("Standard dom properties", function() {
      describe("innerHTML",function(){
         it("Should function normally returning and setting inside html content",function(){
             var inner = parentElement.innerHTML,
                 check = '\n            Parent Element\n            <div class="test_subject__element__child"> - Sub Element</div>\n        ',
                 test = "<div>Testing html changes...</div>";
             /* check default */
             expect(inner).to.equal(check);
             parentElement.innerHTML = test;
             /* check replaced content */
             expect(parentElement.innerHTML).to.equal(test);

             /* set content back */
             parentElement.innerHTML = inner;
             expect(parentElement.innerHTML).to.equal(check);
         });

         it("Should be able to add and remove event listeners",function(){
             var test = "<div>Testing innerHTML standard listener...</div>",
                 inner = parentElement.innerHTML, 
                 cb = spy();
             parentElement.addEventListener('innerHTML',cb);
             parentElement.innerHTML = test;
             expect(cb.callCount).to.equal(1);
             parentElement.removeEventListener('innerHTML',cb);
             parentElement.innerHTML = inner;
             expect(cb.callCount).to.equal(1);
         });

         it("Should fire an event when a listener is attached before the value has been set",function(){
             var test = "<div>Testing innerHTML standard listener...</div>",
                 inner = parentElement.innerHTML,
                 cb = spy(),
                 count = 0;

             function testFunc(e)
             {
                 count++;
                 expect(parentElement.innerHTML).to.equal((count === 1 ? inner : test));
                 cb.apply(this,arguments);
                 if(count === 2) parentElement.removeEventListener('innerHTML',testFunc);
             }

             parentElement.addEventListener('innerHTML',testFunc);
             parentElement.innerHTML = test;

             expect(cb.callCount).to.equal(1);

             parentElement.innerHTML = inner;

             expect(cb.callCount).to.equal(2);
         });

         it("Should fire an update event after the property has been set",function(){
              var test = "<div>Testing innerHTML standard listener...</div>",
                  inner = parentElement.innerHTML,
                  cb = spy(),
                  count = 0;

             function testFunc(e)
             {
                 count++;
                 expect(parentElement.innerHTML).to.equal((count === 1 ? test : inner));
                 cb.apply(this,arguments);
                 if(count === 2) parentElement.removeEventListener('innerHTMLupdate',testFunc);
             }

             parentElement.addEventListener('innerHTMLupdate',testFunc);
             parentElement.innerHTML = test;

             expect(cb.callCount).to.equal(1);

             parentElement.innerHTML = inner;

             expect(cb.callCount).to.equal(2);
         });
         
         it("Should contain all standard Event() properties and the new: value, oldvalue, stopped, stop in the event object",function(){
             var test = "<div>Testing innerHTML standard listener...</div>",
                 inner = parentElement.innerHTML;
             
             function testFunc(e)
             {
                 expect(e instanceof Event).to.equal(true);
                 expect(e.value).to.not.equal(undefined);
                 expect(e.oldValue).to.not.equal(undefined);
                 expect(e.stopped).to.not.equal(undefined);
                 expect(e.stop).to.not.equal(undefined);
                 parentElement.removeEventListener('innerHTML',testFunc);
             }

             parentElement.addEventListener('innerHTML',testFunc);
             parentElement.innerHTML = test;
             parentElement.innerHTML = inner;
         })
         
         it("Should prevent the value from being set when event.preventDefault(); is called",function(){
             var test = "<div>Testing innerHTML standard listener...</div>",
                 inner = parentElement.innerHTML,
                 cb = spy(),
                 count = 0;

             function testFunc(e)
             {
                 e.preventDefault();

                 count++;
                 expect(parentElement.innerHTML).to.equal(inner);
                 cb.apply(this,arguments);
                 if(count === 2) parentElement.removeEventListener('innerHTML',testFunc);
             }

             parentElement.addEventListener('innerHTML',testFunc);
             parentElement.innerHTML = test;

             expect(cb.callCount).to.equal(1);
             expect(parentElement.innerHTML).to.equal(inner);

             parentElement.innerHTML = inner;

             expect(cb.callCount).to.equal(2);
             expect(parentElement.innerHTML).to.equal(inner);
         });

         it("Should prevent bubbling when event.stopPropogation(); is called",function(){
             var test = "<div>Testing innerHTML standard listener...</div>",
                 innerChild = childElement.innerHTML,
                 innerParent = parentElement.innerHTML,
                 cbChild = spy(),
                 cbParent = spy(),
                 countChild = 0;

             function testChildFunc(e)
             {
                 e.stopPropagation();
                 countChild++;
                 expect(childElement.innerHTML).to.equal((countChild === 1 ? innerChild : test));
                 cbChild.apply(this,arguments);
                 if(countChild === 2)
                 {
                     childElement.removeEventListener('innerHTML',testChildFunc);
                     parentElement.removeEventListener('innerHTML',cbParent);
                 }
             }

             childElement.addEventListener('innerHTML',testChildFunc);
             parentElement.addEventListener('innerHTML',cbParent);

             childElement.innerHTML = test;

             expect(cbChild.callCount).to.equal(1);
             expect(cbParent.callCount).to.equal(0);

             childElement.innerHTML = innerChild;

             expect(cbChild.callCount).to.equal(2);
             expect(cbParent.callCount).to.equal(0);
         });

         it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
             var test = "<div>Testing innerHTML standard listener...</div>",
                 inner = parentElement.innerHTML,
                 cb = spy(),
                 cbSec = spy(),
                 count = 0;
             function testFunc(e)
             {
                 e.stopImmediatePropagation();
                 count++;
                 expect(parentElement.innerHTML).to.equal((count === 1 ? inner : test));
                 cb.apply(this,arguments);
                 if(count === 2)
                 {
                     parentElement.removeEventListener('innerHTML',testFunc);
                     parentElement.removeEventListener('innerHTML',cbSec);
                 }
             }

             parentElement.addEventListener('innerHTML',testFunc);
             parentElement.addEventListener('innerHTML',cbSec);

             parentElement.innerHTML = test;

             expect(cb.callCount).to.equal(1);
             expect(cbSec.callCount).to.equal(0);

             parentElement.innerHTML = inner;

             expect(cb.callCount).to.equal(2);
             expect(cbSec.callCount).to.equal(0);
         });
         
         it("Should not fire a update listener if either element.stop(); or event.stop(); have been called prior to setting",function(){
             var test = "<div>Testing innerHTML stop listener...</div>",
                 test2 = "<div>Testing second innerHTML stop listener...</div>",
                 inner = parentElement.innerHTML,
                 cb = spy(),
                 cbSec = spy(),
                 count = 0;
             
             function testFunc(e)
             {
                 count++;
                 if(count === 2) e.stop();
                 cb.apply(this,arguments);
                 if(count === 4)
                 {
                     parentElement.removeEventListener('innerHTML',testFunc);
                     parentElement.removeEventListener('innerHTMLupdate',cbSec);
                 }
             }
             
             parentElement.addEventListener('innerHTML',testFunc);
             parentElement.addEventListener('innerHTMLupdate',cbSec);
             
             parentElement.stop();
             parentElement.innerHTML = test;
             expect(cb.callCount).to.equal(1);
             expect(cbSec.callCount).to.equal(0);
             
             parentElement.innerHTML = test2;
             expect(cb.callCount).to.equal(2);
             expect(cbSec.callCount).to.equal(0);
             
             parentElement.innerHTML = "";
             expect(cb.callCount).to.equal(3);
             expect(cbSec.callCount).to.equal(1);
             
             parentElement.innerHTML = inner;
         });
     });
      
      describe("className",function(){
          it("Should function normally returning and setting className content",function(){
             var inner = parentElement.className,
                 check = 'test_subject__element',
                 test = "test_subject__element__test";
             /* check default */
             expect(inner).to.equal(check);
             parentElement.className = test;
             /* check replaced content */
             expect(parentElement.className).to.equal(test);

             /* set content back */
             parentElement.className = inner;
             expect(parentElement.className).to.equal(check);
         });
      });
  });
  
  mocha.run();
}(describe,it,chai.expect,sinon.spy));