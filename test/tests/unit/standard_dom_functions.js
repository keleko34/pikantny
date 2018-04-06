var standardDomFunction = (function(){
  
  return function(describe,it,expect,spy){
    
      var parentElement = document.querySelector('.test_subject__element'),
          childElement = document.querySelector('.test_subject__element__child');
    
      describe("Standard dom functions", function(){
        describe("appendChild", function(){
            /* default functionality */
            it("Should function normally appending an element",function(){
               var inner = parentElement.innerHTML,
                   test = document.createElement('input'),
                   testAppend = parentElement.appendChild(test);

               /* check if element exists */
               expect(parentElement.querySelector('input')).to.not.equal(null);

               /* check if method returned correct output */
               expect(testAppend).to.equal(test);

               /* set content back */
               parentElement.innerHTML = inner;
               expect(parentElement.innerHTML).to.equal(inner);
            });

            /* remove and add listeners */
            it("Should be able to add and remove event listeners",function(){
              var test = document.createElement('input'),
                  inner = parentElement.innerHTML, 
                  cb = spy();

              parentElement.addEventListener('appendChild',cb);
              parentElement.appendChild(test);
              expect(cb.callCount).to.equal(1);
              parentElement.removeEventListener('appendChild',cb);
              parentElement.appendChild(test);
              expect(cb.callCount).to.equal(1);

              parentElement.innerHTML = inner;
              expect(parentElement.innerHTML).to.equal(inner);
            });

            /* add standard listeners */
            it("Should fire an event when a listener is attached before the method has been implemented",function(){
                var test = document.createElement('input'),
                    inner = parentElement.innerHTML,
                    cb = spy();

                 function testFunc(e)
                 {
                    expect(parentElement.querySelectorAll('input').length).to.equal(0);
                    cb.apply(this,arguments);
                    parentElement.removeEventListener('appendChild',testFunc);
                 }

                 parentElement.addEventListener('appendChild',testFunc);
                 parentElement.appendChild(test);

                 expect(cb.callCount).to.equal(1);
                 parentElement.innerHTML = inner;
                 expect(parentElement.innerHTML).to.equal(inner);
            });

            /* add update listeners */
            it("Should fire an update event after the method has been implemented",function(){
                var test = document.createElement('input'),
                    inner = parentElement.innerHTML,
                    cb = spy();

                 function testFunc(e)
                 {
                    expect(parentElement.querySelectorAll('input').length).to.equal(1);
                    cb.apply(this,arguments);
                    parentElement.innerHTML = inner;
                 }

                 parentElement.addEventListener('appendChildupdate',testFunc);
                 parentElement.appendChild(test);
                 parentElement.removeEventListener('appendChildupdate',testFunc);
                 expect(cb.callCount).to.equal(1);
            });

            /* event object */
            it("Should contain all standard Event() properties and the new: arguments, method, stopped, stop in the event object",function(){
              var test = document.createElement('input'),
                  inner = parentElement.innerHTML;

              function testFunc(e)
              {
                 expect(e.arguments).to.not.equal(undefined);
                 expect(e.attr).to.not.equal(undefined);
                 expect(e.stopped).to.not.equal(undefined);
                 expect(e.stop).to.not.equal(undefined);
                 expect(typeof e.arguments[0]).to.equal('object');
                 expect(e.arguments[0] instanceof HTMLElement).to.equal(true);
              }

              parentElement.addEventListener('appendChild',testFunc);
              parentElement.appendChild(test);
              parentElement.removeEventListener('appendChild',testFunc);
              parentElement.innerHTML = inner;
            });

            /* preventDefault */
            it("Should prevent the method from being implemented when event.preventDefault(); is called",function(){
                var test = document.createElement('input'),
                    inner = parentElement.innerHTML,
                    cb = spy();

                function testFunc(e)
                {
                   e.preventDefault();
                   cb.apply(this,arguments);
                }

                parentElement.addEventListener('appendChild',testFunc);
                parentElement.appendChild(test);
                parentElement.removeEventListener('appendChild',testFunc);
                expect(cb.callCount).to.equal(1);
                expect(parentElement.querySelectorAll('input').length).to.equal(0);

                parentElement.innerHTML = inner;
            });

            /* stopPropogation */
            it("Should prevent bubbling when event.stopPropogation(); is called",function(){
                var test = document.createElement('input'),
                    inner = parentElement.innerHTML,
                    cbChild = spy(),
                    cbParent = spy();

                function testChildFunc(e)
                {
                    e.stopPropagation();

                    expect(childElement.querySelector('input')).to.equal(null);
                    cbChild.apply(this,arguments);
                }

                childElement.addEventListener('appendChild',testChildFunc);
                parentElement.addEventListener('appendChild',cbParent);

                childElement.appendChild(test);
                childElement.removeEventListener('appendChild',testChildFunc);
                parentElement.removeEventListener('appendChild',cbParent);
                expect(cbChild.callCount).to.equal(1);
                expect(cbParent.callCount).to.equal(0);

                parentElement.innerHTML = inner;
            });

            /* stopImmediatePropogation */
            it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
                var test = document.createElement('input'),
                    inner = parentElement.innerHTML,
                    cb = spy(),
                    cbSec = spy();
                function testFunc(e)
                {
                   e.stopImmediatePropagation();
                   cb.apply(this,arguments);
                }

                parentElement.addEventListener('appendChild',testFunc);
                parentElement.addEventListener('appendChild',cbSec);

                parentElement.appendChild(test);

                expect(cb.callCount).to.equal(1);
                expect(cbSec.callCount).to.equal(0);

                parentElement.innerHTML = inner;
                parentElement.removeEventListener('appendChild',testFunc);
                parentElement.removeEventListener('appendChild',cbSec);
            });

            /* stopped */
            it("Should not fire a update listener if either element.stop(); or event.stop(); have been called prior execution",function(){
              var test = document.createElement('input'),
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
                     if(count === 3)
                     {
                         parentElement.removeEventListener('appendChild',testFunc);
                         parentElement.removeEventListener('appendChildupdate',cbSec);
                     }
                 }

                 parentElement.addEventListener('appendChild',testFunc);
                 parentElement.addEventListener('appendChildupdate',cbSec);

                 parentElement.stop();
                 parentElement.appendChild(test);
                 expect(cb.callCount).to.equal(1);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.appendChild(test);
                 expect(cb.callCount).to.equal(2);
                 expect(cbSec.callCount).to.equal(0);

                 parentElement.innerHTML = inner;
            });
        });

        describe("addEventListener", function(){
          /* default functionality */
            it("Should function normally adding and removing a default listener",function(){
                var cb = spy();

                parentElement.addEventListener('click',cb);

                parentElement.dispatchEvent(new MouseEvent('click'));

                expect(cb.callCount).to.equal(1);
                parentElement.removeEventListener('click',cb);

                parentElement.dispatchEvent(new MouseEvent('click'));
                expect(cb.callCount).to.equal(1);
            });

            /* remove and add listeners */
            it("Should be able to add and remove event listeners",function(){
              var cb = spy(),
                  cbSec = spy(),
                  cbthird = spy();

              parentElement.addEventListener('addEventListener',cb);

              parentElement.addEventListener('click',cbSec);

              expect(cb.callCount).to.equal(1);

              parentElement.removeEventListener('addEventListener',cb);
              parentElement.addEventListener('click',cbthird);

              expect(cb.callCount).to.equal(1);

              parentElement.removeEventListener('click',cbSec);
              parentElement.removeEventListener('click',cbthird);
            });

            /* add standard listeners */
            it("Should fire an event when a listener is attached before the method has been implemented",function(){
                var cb = spy(),
                    cbSec = spy();
                
                function click()
                {
                  cbSec.apply(this,arguments);
                }
              
                function testFunc(e)
                {
                  cb.apply(this,arguments);
                  parentElement.removeEventListener('addEventListener',testFunc);
                }

                parentElement.addEventListener('addEventListener',testFunc);
                parentElement.addEventListener('click',click);
                parentElement.dispatchEvent(new MouseEvent('click'));
                parentElement.removeEventListener('click',click);
                expect(cb.callCount).to.equal(1);
                expect(cbSec.callCount).to.equal(1);
            });

            /* add update listeners */
            it("Should fire an update event after the method has been implemented",function(){
                var cb = spy(),
                    cbSec = spy();
                
                function click()
                {
                  cbSec.apply(this,arguments);
                }
              
                function testFunc(e)
                {
                  cb.apply(this,arguments);
                  parentElement.dispatchEvent(new MouseEvent('click'));
                  parentElement.removeEventListener('addEventListenerupdate',testFunc);
                  parentElement.removeEventListener('click',click);
                }

                parentElement.addEventListener('addEventListenerupdate',testFunc);
                parentElement.addEventListener('click',click);

                expect(cb.callCount).to.equal(1);
                expect(cbSec.callCount).to.equal(1);
            });

            /* event object */
            it("Should contain all standard Event() properties and the new: arguments, method, stopped, stop in the event object",function(){
              var cb = spy(),
                  cbSec = spy();

              function testFunc(e)
              {
                  expect(e.arguments).to.not.equal(undefined);
                  expect(e.attr).to.not.equal(undefined);
                  expect(e.stopped).to.not.equal(undefined);
                  expect(e.stop).to.not.equal(undefined);
                  expect(typeof e.arguments[0]).to.equal('string');
                  expect(typeof e.arguments[1]).to.equal('function');
                  parentElement.removeEventListener('addEventListener',testFunc);
                  parentElement.removeEventListener('click',cbSec);
              }

              parentElement.addEventListener('addEventListener',testFunc);
              parentElement.addEventListener('click',cbSec);
            });

            /* preventDefault */
            it("Should prevent the method from being implemented when event.preventDefault(); is called",function(){
                var cb = spy(),
                    cbSec = spy();

                function testFunc(e)
                {
                    e.preventDefault();
                    cb.apply(this,arguments);
                    parentElement.dispatchEvent(new MouseEvent('click'));
                    expect(cbSec.callCount).to.equal(0);
                }

                parentElement.addEventListener('addEventListener',testFunc);
                parentElement.addEventListener('click',cbSec);

                expect(cb.callCount).to.equal(1);

                parentElement.removeEventListener('addEventListener',testFunc);
                parentElement.removeEventListener('click',cbSec);
            });

            /* stopPropogation */
            it("Should prevent bubbling when event.stopPropogation(); is called",function(){
                var cbChild = spy(),
                    cbParent = spy();

                function testChildFunc(e)
                {
                    e.stopPropagation();
                }

                childElement.addEventListener('addEventListener',testChildFunc);
                parentElement.addEventListener('addEventListener',cbParent);

                childElement.addEventListener('click',cbChild);

                expect(cbParent.callCount).to.equal(0);

                childElement.removeEventListener('addEventListener',testChildFunc);
                parentElement.removeEventListener('addEventListener',cbParent);

                childElement.removeEventListener('click',cbChild);
            });

            /* stopImmediatePropogation */
            it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
                var cb = spy(),
                    cbSec = spy(),
                    cbThird = spy();

                function testFunc(e)
                {
                   e.stopImmediatePropagation();
                   cb.apply(this,arguments);
                }

                parentElement.addEventListener('addEventListener',testFunc);
                parentElement.addEventListener('addEventListener',cbSec);

                parentElement.addEventListener('click',cbThird);

                expect(cb.callCount).to.equal(2);
                expect(cbSec.callCount).to.equal(0);

                parentElement.removeEventListener('addEventListener',testFunc);
                parentElement.removeEventListener('addEventListener',cbSec);

                parentElement.removeEventListener('click',cbThird);
            });

            /* stopped */
            it("Should not fire a update listener if either element.stop(); or event.stop(); have been called prior execution",function(){
              var cb = spy(),
                  cbSec = spy(),
                  cbThird = spy(),
                  cbFourth = spy(),
                  count = 0;

              function testFunc(e)
              {
                 count++;
                 if(count === 3) e.stop();
                 cb.apply(this,arguments);
                 if(count < 4 && count !== 1) expect(e.stopped).to.equal(true);
              }

              parentElement.addEventListener('addEventListener',testFunc);
              parentElement.addEventListener('addEventListenerupdate',cbSec);

              parentElement.stop();
              parentElement.addEventListener('click',cbThird);

              parentElement.addEventListener('click',cbFourth);

              expect(cb.callCount).to.equal(3);
              expect(cbSec.callCount).to.equal(0);

              parentElement.removeEventListener('addEventListener',testFunc);
              parentElement.removeEventListener('addEventListenerupdate',cbSec);
              parentElement.removeEventListener('click',cbThird);
              parentElement.removeEventListener('click',cbFourth);
            });
        });

        describe("setAttribute", function(){
            /* default functionality */
            it("Should function normally setting an attribute",function(){
                 var inner = parentElement.className,
                     check = 'test_subject__element',
                     test = "test_subject__element__test",
                     testSetAttribute = parentElement.setAttribute('class',test);

                 /* check if element exists */
                 expect(parentElement.className).to.not.equal('test_subject__element');

                 /* check if method returned correct output */
                 expect(testSetAttribute).to.equal(undefined);

                 /* set content back */
                 parentElement.setAttribute('class',check);
                 expect(parentElement.className).to.equal(check);
              });

            /* remove and add listeners */
            it("Should be able to add and remove event listeners",function(){
               var test = "test_subject__element__test",
                   inner = parentElement.className, 
                   cb = spy();
               parentElement.addEventListener('setAttribute',cb);
               parentElement.setAttribute('class',test);
               expect(cb.callCount).to.equal(1);
               parentElement.removeEventListener('setAttribute',cb);
               parentElement.setAttribute('class',inner);
               expect(cb.callCount).to.equal(1);
           });

            /* add standard listeners */
            it("Should fire an event when a listener is attached before the function has been ran",function(){
                   var test = "test_subject__element__test",
                       inner = parentElement.className,
                       cb = spy(),
                       count = 0;

                   function testFunc(e)
                   {
                       count++;
                       expect(parentElement.className).to.equal((count === 1 ? inner : test));
                       cb.apply(this,arguments);
                       if(count === 2) parentElement.removeEventListener('setAttribute',testFunc);
                   }

                   parentElement.addEventListener('setAttribute',testFunc);
                   parentElement.setAttribute('class',test);

                   expect(cb.callCount).to.equal(1);

                   parentElement.setAttribute('class',inner);

                   expect(cb.callCount).to.equal(2);
               });

            /* add update listeners */
            it("Should fire an update event after the function has been ran",function(){
                  var test = "test_subject__element__test",
                      inner = parentElement.className,
                      cb = spy(),
                      count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.className).to.equal((count === 1 ? test : inner));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('setAttributeupdate',testFunc);
                 }

                 parentElement.addEventListener('setAttributeupdate',testFunc);
                 parentElement.setAttribute('class',test);

                 expect(cb.callCount).to.equal(1);

                 parentElement.setAttribute('class',inner);

                 expect(cb.callCount).to.equal(2);
             });

            /* event object */
            it("Should contain all standard Event() properties and the new: arguments, method, stopped, stop in the event object",function(){
               var test = "test_subject__element__test",
                   inner = parentElement.className;

               function testFunc(e)
               {
                  expect(e.arguments).to.not.equal(undefined);
                  expect(e.attr).to.not.equal(undefined);
                  expect(e.stopped).to.not.equal(undefined);
                  expect(e.stop).to.not.equal(undefined);
                  expect(typeof e.arguments[0]).to.equal('string');
                  parentElement.removeEventListener('setAttribute',testFunc);
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.setAttribute('class',test);
               parentElement.setAttribute('class',inner);
           });

            /* preventDefault */
            it("Should prevent the function from being ran when event.preventDefault(); is called",function(){
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
                   if(count === 2) parentElement.removeEventListener('setAttribute',testFunc);
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.setAttribute('class',test);

               expect(cb.callCount).to.equal(1);
               expect(parentElement.className).to.equal(inner);

               parentElement.setAttribute('class',inner);

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
                       childElement.removeEventListener('setAttribute',testChildFunc);
                       parentElement.removeEventListener('setAttribute',cbParent);
                   }
               }

               childElement.addEventListener('setAttribute',testChildFunc);
               parentElement.addEventListener('setAttribute',cbParent);

               childElement.setAttribute('class',test);

               expect(cbChild.callCount).to.equal(1);
               expect(cbParent.callCount).to.equal(0);

               childElement.setAttribute('class',innerChild);

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
                       parentElement.removeEventListener('setAttribute',testFunc);
                       parentElement.removeEventListener('setAttribute',cbSec);
                   }
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.addEventListener('setAttribute',cbSec);

               parentElement.setAttribute('class',test);

               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('class',inner);

               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);
           });

            /* stopped */
            it("Should not fire a update listener if either element.stop(); or event.stop(); have been called",function(){
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
                       parentElement.removeEventListener('setAttribute',testFunc);
                       parentElement.removeEventListener('setAttributeupdate',cbSec);
                   }
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.addEventListener('setAttributeupdate',cbSec);

               parentElement.stop();
               parentElement.setAttribute('class',test);
               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('class',test2);
               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('class',"");
               expect(cb.callCount).to.equal(3);
               expect(cbSec.callCount).to.equal(1);

               parentElement.setAttribute('class',inner);
           });
        });
      });
  };
  
}());