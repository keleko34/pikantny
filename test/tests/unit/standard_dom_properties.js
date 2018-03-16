var standardDomProperties = (function(){
  
  return function(describe,it,expect,spy){
    
      var parentElement = document.querySelector('.test_subject__element'),
          childElement = document.querySelector('.test_subject__element__child');
    
      describe("Standard dom properties", function() {
          describe("innerHTML",function(){

             /* default functionality */
             it("Should function normally returning and setting inside html content",function(){
                 var inner = parentElement.innerHTML,
                     check = '\n            Parent Element\n            <div class="test_subject__element__child" id="test_element__sub"> - Sub Element</div>\n        ',
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

             /* remove and add listeners */
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

             /* add standard listeners */
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

             /* add update listeners */
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

             /* event object */
             it("Should contain all standard Event() properties and the new: value, oldvalue, stopped, stop in the event object",function(){
                 var test = "<div>Testing innerHTML standard listener...</div>",
                     inner = parentElement.innerHTML;

                 function testFunc(e)
                 {
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

             /* preventDefault */
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

             /* stopPropogation */
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

             /* stopImmediatePropogation */
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

             /* stopped */
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
                     if(count < 3) expect(e.stopped).to.equal(true);
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

              /* default functionality */
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

              /* remove and add listeners */
              it("Should be able to add and remove event listeners",function(){
                 var test = "test_subject__element__test",
                     inner = parentElement.className, 
                     cb = spy();
                 parentElement.addEventListener('className',cb);
                 parentElement.className = test;
                 expect(cb.callCount).to.equal(1);
                 parentElement.removeEventListener('className',cb);
                 parentElement.className = inner;
                 expect(cb.callCount).to.equal(1);
             });

              /* add standard listeners */
              it("Should fire an event when a listener is attached before the value has been set",function(){
                 var test = "test_subject__element__test",
                     inner = parentElement.className,
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.className).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('className',testFunc);
                 }

                 parentElement.addEventListener('className',testFunc);
                 parentElement.className = test;

                 expect(cb.callCount).to.equal(1);

                 parentElement.className = inner;

                 expect(cb.callCount).to.equal(2);
             });

              /* add update listeners */
              it("Should fire an update event after the property has been set",function(){
                  var test = "test_subject__element__test",
                      inner = parentElement.className,
                      cb = spy(),
                      count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.className).to.equal((count === 1 ? test : inner));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('classNameupdate',testFunc);
                 }

                 parentElement.addEventListener('classNameupdate',testFunc);
                 parentElement.className = test;

                 expect(cb.callCount).to.equal(1);

                 parentElement.className = inner;

                 expect(cb.callCount).to.equal(2);
             });

              /* event object */
              it("Should contain all standard Event() properties and the new: value, oldvalue, stopped, stop in the event object",function(){
                 var test = "test_subject__element__test",
                     inner = parentElement.className;

                 function testFunc(e)
                 {
                     expect(e.value).to.not.equal(undefined);
                     expect(e.oldValue).to.not.equal(undefined);
                     expect(e.stopped).to.not.equal(undefined);
                     expect(e.stop).to.not.equal(undefined);
                     parentElement.removeEventListener('className',testFunc);
                 }

                 parentElement.addEventListener('className',testFunc);
                 parentElement.className = test;
                 parentElement.className = inner;
             });

              /* preventDefault */
              it("Should prevent the value from being set when event.preventDefault(); is called",function(){
                 var test = "test_subject__element__test",
                     inner = parentElement.className,
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     e.preventDefault();

                     count++;
                     expect(parentElement.className).to.equal(inner);
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('className',testFunc);
                 }

                 parentElement.addEventListener('className',testFunc);
                 parentElement.className = test;

                 expect(cb.callCount).to.equal(1);
                 expect(parentElement.className).to.equal(inner);

                 parentElement.className = inner;

                 expect(cb.callCount).to.equal(2);
                 expect(parentElement.className).to.equal(inner);
              });

              /* stopPropogation */
              it("Should prevent bubbling when event.stopPropogation(); is called",function(){
                 var test = "test_subject__element__test",
                     innerChild = childElement.className,
                     innerParent = parentElement.className,
                     cbChild = spy(),
                     cbParent = spy(),
                     countChild = 0;

                 function testChildFunc(e)
                 {
                     e.stopPropagation();
                     countChild++;
                     expect(childElement.className).to.equal((countChild === 1 ? innerChild : test));
                     cbChild.apply(this,arguments);
                     if(countChild === 2)
                     {
                         childElement.removeEventListener('className',testChildFunc);
                         parentElement.removeEventListener('className',cbParent);
                     }
                 }

                 childElement.addEventListener('className',testChildFunc);
                 parentElement.addEventListener('className',cbParent);

                 childElement.className = test;

                 expect(cbChild.callCount).to.equal(1);
                 expect(cbParent.callCount).to.equal(0);

                 childElement.className = innerChild;

                 expect(cbChild.callCount).to.equal(2);
                 expect(cbParent.callCount).to.equal(0);
             });

              /* stopImmediatePropogation */
              it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
                 var test = "test_subject__element__test",
                     inner = parentElement.className,
                     cb = spy(),
                     cbSec = spy(),
                     count = 0;
                 function testFunc(e)
                 {
                     e.stopImmediatePropagation();
                     count++;
                     expect(parentElement.className).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2)
                     {
                         parentElement.removeEventListener('className',testFunc);
                         parentElement.removeEventListener('className',cbSec);
                     }
                 }

                 parentElement.addEventListener('className',testFunc);
                 parentElement.addEventListener('className',cbSec);

                 parentElement.className = test;

                 expect(cb.callCount).to.equal(1);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.className = inner;

                 expect(cb.callCount).to.equal(2);
                 expect(cbSec.callCount).to.equal(0);
             });

              /* stopped */
              it("Should not fire a update listener if either element.stop(); or event.stop(); have been called prior to setting",function(){
                 var test = "test_subject__element__test",
                     test2 = "test_subject__element__test__sec",
                     inner = parentElement.className,
                     cb = spy(),
                     cbSec = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     if(count === 2) e.stop();
                     cb.apply(this,arguments);
                     if(count < 3) expect(e.stopped).to.equal(true);
                     if(count === 4)
                     {
                         parentElement.removeEventListener('className',testFunc);
                         parentElement.removeEventListener('classNameupdate',cbSec);
                     }
                 }

                 parentElement.addEventListener('className',testFunc);
                 parentElement.addEventListener('classNameupdate',cbSec);

                 parentElement.stop();
                 parentElement.className = test;
                 expect(cb.callCount).to.equal(1);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.className = test2;
                 expect(cb.callCount).to.equal(2);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.className = "";
                 expect(cb.callCount).to.equal(3);
                 expect(cbSec.callCount).to.equal(1);

                 parentElement.className = inner;
             });
          });

          describe("id",function(){

              /* default functionality */
              it("Should function normally returning and setting id content",function(){
                 var inner = parentElement.id,
                     check = 'test_element',
                     test = "test_element__check";
                 /* check default */
                 expect(inner).to.equal(check);
                 parentElement.id = test;
                 /* check replaced content */
                 expect(parentElement.id).to.equal(test);

                 /* set content back */
                 parentElement.id = inner;
                 expect(parentElement.id).to.equal(check);
             });

              /* remove and add listeners */
              it("Should be able to add and remove event listeners",function(){
                 var test = "test_element__check",
                     inner = parentElement.id, 
                     cb = spy();
                 parentElement.addEventListener('id',cb);
                 parentElement.id = test;
                 expect(cb.callCount).to.equal(1);
                 parentElement.removeEventListener('id',cb);
                 parentElement.id = inner;
                 expect(cb.callCount).to.equal(1);
             });

              /* add standard listeners */
              it("Should fire an event when a listener is attached before the value has been set",function(){
                 var test = "test_element__check",
                     inner = parentElement.id,
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.id).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('id',testFunc);
                 }

                 parentElement.addEventListener('id',testFunc);
                 parentElement.id = test;

                 expect(cb.callCount).to.equal(1);

                 parentElement.id = inner;

                 expect(cb.callCount).to.equal(2);
             });

              /* add update listeners */
              it("Should fire an update event after the property has been set",function(){
                  var test = "test_element__check",
                      inner = parentElement.id,
                      cb = spy(),
                      count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.id).to.equal((count === 1 ? test : inner));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('idupdate',testFunc);
                 }

                 parentElement.addEventListener('idupdate',testFunc);
                 parentElement.id = test;

                 expect(cb.callCount).to.equal(1);

                 parentElement.id = inner;

                 expect(cb.callCount).to.equal(2);
             });

              /* event object */
              it("Should contain all standard Event() properties and the new: value, oldvalue, stopped, stop in the event object",function(){
                 var test = "test_element__check",
                     inner = parentElement.id;

                 function testFunc(e)
                 {
                     expect(e.value).to.not.equal(undefined);
                     expect(e.oldValue).to.not.equal(undefined);
                     expect(e.stopped).to.not.equal(undefined);
                     expect(e.stop).to.not.equal(undefined);
                     parentElement.removeEventListener('id',testFunc);
                 }

                 parentElement.addEventListener('id',testFunc);
                 parentElement.id = test;
                 parentElement.id = inner;
             });

              /* preventDefault */
              it("Should prevent the value from being set when event.preventDefault(); is called",function(){
                 var test = "test_element__check",
                     inner = parentElement.id,
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     e.preventDefault();

                     count++;
                     expect(parentElement.id).to.equal(inner);
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('id',testFunc);
                 }

                 parentElement.addEventListener('id',testFunc);
                 parentElement.id = test;

                 expect(cb.callCount).to.equal(1);
                 expect(parentElement.id).to.equal(inner);

                 parentElement.id = inner;

                 expect(cb.callCount).to.equal(2);
                 expect(parentElement.id).to.equal(inner);
              });

              /* stopPropogation */
             it("Should prevent bubbling when event.stopPropogation(); is called",function(){
                 var test = "test_element__check",
                     innerChild = childElement.id,
                     innerParent = parentElement.id,
                     cbChild = spy(),
                     cbParent = spy(),
                     countChild = 0;

                 function testChildFunc(e)
                 {
                     e.stopPropagation();
                     countChild++;
                     expect(childElement.id).to.equal((countChild === 1 ? innerChild : test));
                     cbChild.apply(this,arguments);
                     if(countChild === 2)
                     {
                         childElement.removeEventListener('id',testChildFunc);
                         parentElement.removeEventListener('id',cbParent);
                     }
                 }

                 childElement.addEventListener('id',testChildFunc);
                 parentElement.addEventListener('id',cbParent);

                 childElement.id = test;

                 expect(cbChild.callCount).to.equal(1);
                 expect(cbParent.callCount).to.equal(0);

                 childElement.id = innerChild;

                 expect(cbChild.callCount).to.equal(2);
                 expect(cbParent.callCount).to.equal(0);
             });

             /* stopImmediatePropogation */
             it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
                 var test = "test_element__check",
                     inner = parentElement.id,
                     cb = spy(),
                     cbSec = spy(),
                     count = 0;
                 function testFunc(e)
                 {
                     e.stopImmediatePropagation();
                     count++;
                     expect(parentElement.id).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2)
                     {
                         parentElement.removeEventListener('id',testFunc);
                         parentElement.removeEventListener('id',cbSec);
                     }
                 }

                 parentElement.addEventListener('id',testFunc);
                 parentElement.addEventListener('id',cbSec);

                 parentElement.id = test;

                 expect(cb.callCount).to.equal(1);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.id = inner;

                 expect(cb.callCount).to.equal(2);
                 expect(cbSec.callCount).to.equal(0);
             });

             /* stopped */
             it("Should not fire a update listener if either element.stop(); or event.stop(); have been called prior to setting",function(){
                 var test = "test_element__check",
                     test2 = "test_element__check__sec",
                     inner = parentElement.id,
                     cb = spy(),
                     cbSec = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     if(count === 2) e.stop();
                     cb.apply(this,arguments);
                     if(count < 3) expect(e.stopped).to.equal(true);
                     if(count === 4)
                     {
                         parentElement.removeEventListener('id',testFunc);
                         parentElement.removeEventListener('idupdate',cbSec);
                     }
                 }

                 parentElement.addEventListener('id',testFunc);
                 parentElement.addEventListener('idupdate',cbSec);

                 parentElement.stop();
                 parentElement.id = test;
                 expect(cb.callCount).to.equal(1);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.id = test2;
                 expect(cb.callCount).to.equal(2);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.id = "";
                 expect(cb.callCount).to.equal(3);
                 expect(cbSec.callCount).to.equal(1);

                 parentElement.id = inner;
             });
          });

          describe("onclick",function(){

              /* default functionality */
              it("Should function normally returning and setting onclick method",function(){
                 var inner = parentElement.onclick,
                     check = null,
                     cb = spy(),
                     test = function(e){console.log(e);};

                 /* check default */
                 expect(inner).to.equal(check);
                 parentElement.onclick = test;
                 /* check replaced content */
                 expect(parentElement.onclick).to.equal(test);

                 parentElement.onclick = cb;

                 parentElement.dispatchEvent(new MouseEvent('click'));

                 expect(cb.callCount).to.equal(1);

                 /* set content back */
                 parentElement.onclick = inner;
                 expect(parentElement.onclick).to.equal(check);
             });

              /* remove and add listeners */
              it("Should be able to add and remove event listeners",function(){
                 var test = function(e){console.log(e);},
                     inner = parentElement.onclick, 
                     cb = spy();
                 parentElement.addEventListener('onclick',cb);
                 parentElement.onclick = test;
                 expect(cb.callCount).to.equal(1);
                 parentElement.removeEventListener('onclick',cb);
                 parentElement.onclick = inner;
                 expect(cb.callCount).to.equal(1);
             });

              /* add standard listeners */
              it("Should fire an event when a listener is attached before the value has been set",function(){
                 var test = function(e){console.log(e);},
                     inner = parentElement.onclick,
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.onclick).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('onclick',testFunc);
                 }

                 parentElement.addEventListener('onclick',testFunc);
                 parentElement.onclick = test;

                 expect(cb.callCount).to.equal(1);

                 parentElement.onclick = inner;

                 expect(cb.callCount).to.equal(2);
             });

              /* add update listeners */
              it("Should fire an update event after the property has been set",function(){
                  var test = function(e){console.log(e);},
                      inner = parentElement.onclick,
                      cb = spy(),
                      count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.onclick).to.equal((count === 1 ? test : inner));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('onclickupdate',testFunc);
                 }

                 parentElement.addEventListener('onclickupdate',testFunc);
                 parentElement.onclick = test;

                 expect(cb.callCount).to.equal(1);

                 parentElement.onclick = inner;

                 expect(cb.callCount).to.equal(2);
             });

              /* event object */
              it("Should contain all standard Event() properties and the new: value, oldvalue, stopped, stop in the event object",function(){
                 var test = function(e){console.log(e);},
                     inner = parentElement.onclick;

                 function testFunc(e)
                 {
                     expect(e.value).to.not.equal(undefined);
                     expect(e.oldValue).to.not.equal(undefined);
                     expect(e.stopped).to.not.equal(undefined);
                     expect(e.stop).to.not.equal(undefined);
                     parentElement.removeEventListener('onclick',testFunc);
                 }

                 parentElement.addEventListener('onclick',testFunc);
                 parentElement.onclick = test;
                 parentElement.onclick = inner;
             });

              /* preventDefault */
              it("Should prevent the value from being set when event.preventDefault(); is called",function(){
                 var test = function(e){console.log(e);},
                     inner = parentElement.onclick,
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     e.preventDefault();

                     count++;
                     expect(parentElement.onclick).to.equal(inner);
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('onclick',testFunc);
                 }

                 parentElement.addEventListener('onclick',testFunc);
                 parentElement.onclick = test;

                 expect(cb.callCount).to.equal(1);
                 expect(parentElement.onclick).to.equal(inner);

                 parentElement.onclick = inner;

                 expect(cb.callCount).to.equal(2);
                 expect(parentElement.onclick).to.equal(inner);
              });

              /* stopPropogation */
             it("Should prevent bubbling when event.stopPropogation(); is called",function(){
                 var test = function(e){console.log(e);},
                     innerChild = childElement.onclick,
                     innerParent = parentElement.onclick,
                     cbChild = spy(),
                     cbParent = spy(),
                     countChild = 0;

                 function testChildFunc(e)
                 {
                     e.stopPropagation();
                     countChild++;
                     expect(childElement.onclick).to.equal((countChild === 1 ? innerChild : test));
                     cbChild.apply(this,arguments);
                     if(countChild === 2)
                     {
                         childElement.removeEventListener('onclick',testChildFunc);
                         parentElement.removeEventListener('onclick',cbParent);
                     }
                 }

                 childElement.addEventListener('onclick',testChildFunc);
                 parentElement.addEventListener('onclick',cbParent);

                 childElement.onclick = test;

                 expect(cbChild.callCount).to.equal(1);
                 expect(cbParent.callCount).to.equal(0);

                 childElement.onclick = innerChild;

                 expect(cbChild.callCount).to.equal(2);
                 expect(cbParent.callCount).to.equal(0);
             });

             /* stopImmediatePropogation */
             it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
                 var test = function(e){console.log(e);},
                     inner = parentElement.onclick,
                     cb = spy(),
                     cbSec = spy(),
                     count = 0;
                 function testFunc(e)
                 {
                     e.stopImmediatePropagation();
                     count++;
                     expect(parentElement.onclick).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2)
                     {
                         parentElement.removeEventListener('onclick',testFunc);
                         parentElement.removeEventListener('onclick',cbSec);
                     }
                 }

                 parentElement.addEventListener('onclick',testFunc);
                 parentElement.addEventListener('onclick',cbSec);

                 parentElement.onclick = test;

                 expect(cb.callCount).to.equal(1);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.onclick = inner;

                 expect(cb.callCount).to.equal(2);
                 expect(cbSec.callCount).to.equal(0);
             });

             /* stopped */
             it("Should not fire a update listener if either element.stop(); or event.stop(); have been called prior to setting",function(){
                 var test = function(e){console.log(e);},
                     test2 = function(e){console.log(this,e);},
                     inner = parentElement.onclick,
                     cb = spy(),
                     cbSec = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     if(count === 2) e.stop();
                     cb.apply(this,arguments);
                     if(count < 3) expect(e.stopped).to.equal(true);
                     if(count === 4)
                     {
                         parentElement.removeEventListener('onclick',testFunc);
                         parentElement.removeEventListener('onclickupdate',cbSec);
                     }
                 }

                 parentElement.addEventListener('onclick',testFunc);
                 parentElement.addEventListener('onclickupdate',cbSec);

                 parentElement.stop();
                 parentElement.onclick = test;
                 expect(cb.callCount).to.equal(1);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.onclick = test2;
                 expect(cb.callCount).to.equal(2);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.onclick = "";
                 expect(cb.callCount).to.equal(3);
                 expect(cbSec.callCount).to.equal(1);

                 parentElement.onclick = inner;
             });
          });
      });
  };
  
}());