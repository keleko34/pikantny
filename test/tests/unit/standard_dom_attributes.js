var standardDomAttributes = (function(){
  
  return function(describe,it,expect,spy){
    
      var parentElement = document.querySelector('.test_subject__element'),
          childElement = document.querySelector('.test_subject__element__child'),
          parentInputElement = document.querySelector('.test_inputs'),
          inputElement = document.querySelector('.test_subject__element__input');
    
      describe("Standard dom attributes", function(){
        describe("id", function(){ 
            /* default functionality */
            it("Should function normally setting, getting, and removing the attribute",function(){
               var inner = parentElement.id,
                   check = 'test_element',
                   test = "test_element__test",
                   testGetAttribute = parentElement.getAttribute('id'),
                   testSetAttribute = parentElement.setAttribute('id',test);

               /* check if element exists */
               expect(parentElement.id).to.not.equal(check);
               expect(testGetAttribute).to.equal(check);

               /* check if method returned correct output */
               expect(testSetAttribute).to.equal(undefined);

               /* remove content */
               parentElement.removeAttribute('id');
               expect(parentElement.id).to.equal('');

               /* set content back */
               parentElement.setAttribute('id',check);
               expect(parentElement.id).to.equal(check);
            });

            /* remove and add listeners */
            it("Should be able to add and remove event listeners",function(){
               var test = "test_element__test",
                   inner = parentElement.id, 
                   cb = spy();

               parentElement.addEventListener('setAttribute',cb);
               parentElement.setAttribute('id',test);
               expect(cb.callCount).to.equal(1);
               parentElement.removeEventListener('setAttribute',cb);
               parentElement.setAttribute('id',inner);
               expect(cb.callCount).to.equal(1);
           });

            /* add standard listeners */
            it("Should fire an event when a listener is attached before the function has been ran",function(){
                 var test = "test_element__test",
                     inner = parentElement.id,
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.id).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                 }

                 parentElement.addEventListener('setAttribute',testFunc);
                 parentElement.setAttribute('id',test);

                 expect(cb.callCount).to.equal(1);

                 parentElement.setAttribute('id',inner);

                 expect(cb.callCount).to.equal(2);
                   
                 parentElement.removeEventListener('setAttribute',testFunc);
             });

            /* add update listeners */
            it("Should fire an update event after the function has been ran",function(){
                var test = "test_element__test",
                    inner = parentElement.id,
                    cb = spy(),
                    count = 0;

               function testFunc(e)
               {
                   count++;
                   expect(parentElement.id).to.equal((count === 1 ? test : inner));
                   cb.apply(this,arguments);
               }

               parentElement.addEventListener('setAttributeupdate',testFunc);
               parentElement.setAttribute('id',test);

               expect(cb.callCount).to.equal(1);

               parentElement.setAttribute('id',inner);

               expect(cb.callCount).to.equal(2);
                 
               parentElement.removeEventListener('setAttributeupdate',testFunc);
           });

            /* event object */
            it("Should contain all standard Event() properties and the new: arguments, method, stopped, stop in the event object",function(){
               var test = "test_element__test",
                   inner = parentElement.id;

               function testFunc(e)
               {
                  expect(e.arguments).to.not.equal(undefined);
                  expect(e.attr).to.not.equal(undefined);
                  expect(e.stopped).to.not.equal(undefined);
                  expect(e.stop).to.not.equal(undefined);
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.setAttribute('id',test);
               parentElement.setAttribute('id',inner);
              
               parentElement.removeEventListener('setAttribute',testFunc);
           });

            /* preventDefault */
            it("Should prevent the function from being ran when event.preventDefault(); is called",function(){
               var test = "test_element__test",
                   inner = parentElement.id,
                   cb = spy(),
                   count = 0;

               function testFunc(e)
               {
                   e.preventDefault();

                   count++;
                   expect(parentElement.id).to.equal(inner);
                   cb.apply(this,arguments);
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.setAttribute('id',test);

               expect(cb.callCount).to.equal(1);
               expect(parentElement.id).to.equal(inner);

               parentElement.setAttribute('id',inner);

               expect(cb.callCount).to.equal(2);
               expect(parentElement.id).to.equal(inner);
              
               parentElement.removeEventListener('setAttribute',testFunc);
            });

            /* stopPropogation */
            it("Should prevent bubbling when event.stopPropogation(); is called",function(){
               var test = "test_element__test",
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
                       childElement.removeEventListener('setAttribute',testChildFunc);
                       parentElement.removeEventListener('setAttribute',cbParent);
                   }
               }

               childElement.addEventListener('setAttribute',testChildFunc);
               parentElement.addEventListener('setAttribute',cbParent);

               childElement.setAttribute('id',test);

               expect(cbChild.callCount).to.equal(1);
               expect(cbParent.callCount).to.equal(0);

               childElement.setAttribute('id',innerChild);

               expect(cbChild.callCount).to.equal(2);
               expect(cbParent.callCount).to.equal(0);
           });

            /* stopImmediatePropogation */
            it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
               var test = "test_element__test",
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
                       parentElement.removeEventListener('setAttribute',testFunc);
                       parentElement.removeEventListener('setAttribute',cbSec);
                   }
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.addEventListener('setAttribute',cbSec);

               parentElement.setAttribute('id',test);

               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('id',inner);

               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);
           });

            /* stopped */
            it("Should not fire a update listener if either element.stop(); or event.stop(); have been called",function(){
               var test = "test_element__test",
                   test2 = "test_element__test__sec",
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
                       parentElement.removeEventListener('setAttribute',testFunc);
                       parentElement.removeEventListener('setAttributeupdate',cbSec);
                   }
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.addEventListener('setAttributeupdate',cbSec);

               parentElement.stop();
               parentElement.setAttribute('id',test);
               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('id',test2);
               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('id',"");
               expect(cb.callCount).to.equal(3);
               expect(cbSec.callCount).to.equal(1);

               parentElement.setAttribute('id',inner);
           });
        });

        describe("role", function(){
            /* default functionality */
            it("Should function normally setting, getting, and removing the attribute",function(){
               var inner = parentElement.getAttribute('role'),
                   check = 'button',
                   test = "link",
                   testGetAttribute = parentElement.getAttribute('role'),
                   testSetAttribute = parentElement.setAttribute('role',test);

               /* check if element exists */
               expect(parentElement.getAttribute('role')).to.not.equal(check);
               expect(testGetAttribute).to.equal(check);

               /* check if method returned correct output */
               expect(testSetAttribute).to.equal(undefined);

               /* remove content */
               parentElement.removeAttribute('role');
               expect(parentElement.getAttribute('role')).to.equal(null);

               /* set content back */
               parentElement.setAttribute('role',check);
               expect(parentElement.getAttribute('role')).to.equal(check);
            });

            /* remove and add listeners */
            it("Should be able to add and remove event listeners",function(){
               var test = "link",
                   inner = parentElement.getAttribute('role'), 
                   cb = spy();

               parentElement.addEventListener('setAttribute',cb);
               parentElement.setAttribute('role',test);
               expect(cb.callCount).to.equal(1);
               parentElement.removeEventListener('setAttribute',cb);
               parentElement.setAttribute('role',inner);
               expect(cb.callCount).to.equal(1);
           });

            /* add standard listeners */
            it("Should fire an event when a listener is attached before the function has been ran",function(){
                 var test = "link",
                     inner = parentElement.getAttribute('role'),
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.getAttribute('role')).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('setAttribute',testFunc);
                 }

                 parentElement.addEventListener('setAttribute',testFunc);
                 parentElement.setAttribute('role',test);

                 expect(cb.callCount).to.equal(1);

                 parentElement.setAttribute('role',inner);

                 expect(cb.callCount).to.equal(2);
             });

            /* add update listeners */
            it("Should fire an update event after the function has been ran",function(){
                var test = "link",
                    inner = parentElement.getAttribute('role'),
                    cb = spy(),
                    count = 0;

               function testFunc(e)
               {
                   count++;
                   expect(parentElement.getAttribute('role')).to.equal((count === 1 ? test : inner));
                   cb.apply(this,arguments);
                   if(count === 2) parentElement.removeEventListener('setAttributeupdate',testFunc);
               }

               parentElement.addEventListener('setAttributeupdate',testFunc);
               parentElement.setAttribute('role',test);

               expect(cb.callCount).to.equal(1);

               parentElement.setAttribute('role',inner);

               expect(cb.callCount).to.equal(2);
           });

            /* event object */
            it("Should contain all standard Event() properties and the new: arguments, method, stopped, stop in the event object",function(){
               var test = "link",
                   inner = parentElement.getAttribute('role');

               function testFunc(e)
               {
                  expect(e.arguments).to.not.equal(undefined);
                  expect(e.attr).to.not.equal(undefined);
                  expect(e.stopped).to.not.equal(undefined);
                  expect(e.stop).to.not.equal(undefined);
                  parentElement.removeEventListener('setAttribute',testFunc);
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.setAttribute('role',test);
               parentElement.setAttribute('role',inner);
           });

            /* preventDefault */
            it("Should prevent the function from being ran when event.preventDefault(); is called",function(){
               var test = "link",
                   inner = parentElement.getAttribute('role'),
                   cb = spy(),
                   count = 0;

               function testFunc(e)
               {
                   e.preventDefault();

                   count++;
                   expect(parentElement.getAttribute('role')).to.equal(inner);
                   cb.apply(this,arguments);
                   if(count === 2) parentElement.removeEventListener('setAttribute',testFunc);
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.setAttribute('role',test);

               expect(cb.callCount).to.equal(1);
               expect(parentElement.getAttribute('role')).to.equal(inner);

               parentElement.setAttribute('role',inner);

               expect(cb.callCount).to.equal(2);
               expect(parentElement.getAttribute('role')).to.equal(inner);
            });

            /* stopPropogation */
            it("Should prevent bubbling when event.stopPropogation(); is called",function(){
               var test = "link",
                   innerChild = childElement.getAttribute('role'),
                   innerParent = parentElement.getAttribute('role'),
                   cbChild = spy(),
                   cbParent = spy(),
                   countChild = 0;

               function testChildFunc(e)
               {
                   e.stopPropagation();
                   countChild++;
                   expect(childElement.getAttribute('role')).to.equal((countChild === 1 ? innerChild : test));
                   cbChild.apply(this,arguments);
                   if(countChild === 2)
                   {
                       childElement.removeEventListener('setAttribute',testChildFunc);
                       parentElement.removeEventListener('setAttribute',cbParent);
                   }
               }

               childElement.addEventListener('setAttribute',testChildFunc);
               parentElement.addEventListener('setAttribute',cbParent);

               childElement.setAttribute('role',test);

               expect(cbChild.callCount).to.equal(1);
               expect(cbParent.callCount).to.equal(0);

               childElement.setAttribute('role',innerChild);

               expect(cbChild.callCount).to.equal(2);
               expect(cbParent.callCount).to.equal(0);
           });

            /* stopImmediatePropogation */
            it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
               var test = "link",
                   inner = parentElement.getAttribute('role'),
                   cb = spy(),
                   cbSec = spy(),
                   count = 0;

               function testFunc(e)
               {
                   e.stopImmediatePropagation();
                   count++;
                   expect(parentElement.getAttribute('role')).to.equal((count === 1 ? inner : test));
                   cb.apply(this,arguments);
                   if(count === 2)
                   {
                       parentElement.removeEventListener('setAttribute',testFunc);
                       parentElement.removeEventListener('setAttribute',cbSec);
                   }
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.addEventListener('setAttribute',cbSec);

               parentElement.setAttribute('role',test);

               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('role',inner);

               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);
           });

            /* stopped */
            it("Should not fire a update listener if either element.stop(); or event.stop(); have been called",function(){
               var test = "link",
                   test2 = "nav",
                   inner = parentElement.getAttribute('role'),
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
               parentElement.setAttribute('role',test);
               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('role',test2);
               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('role',"");
               expect(cb.callCount).to.equal(3);
               expect(cbSec.callCount).to.equal(1);

               parentElement.setAttribute('role',inner);
           });
        });

        describe("disabled", function(){
            /* default functionality */
            it("Should function normally setting, getting, and removing the attribute",function(){
               var inner = inputElement.disabled,
                   check = false,
                   test = true,
                   testGetAttribute = inputElement.getAttribute('disabled'),
                   testSetAttribute = inputElement.setAttribute('disabled',test);

               /* check if element exists */
               expect(inputElement.disabled).to.not.equal(check);
               expect(testGetAttribute).to.equal(null);

               /* check if method returned correct output */
               expect(testSetAttribute).to.equal(undefined);

               /* set content back */
               inputElement.removeAttribute('disabled');
               expect(inputElement.disabled).to.equal(check);
            });

            /* remove and add listeners */
            it("Should be able to add and remove event listeners",function(){
               var test = true,
                   inner = inputElement.disabled, 
                   cb = spy();

               inputElement.addEventListener('setAttribute',cb);
               inputElement.setAttribute('disabled',test);
               expect(cb.callCount).to.equal(1);
               inputElement.removeEventListener('setAttribute',cb);
               inputElement.removeAttribute('disabled');
               expect(cb.callCount).to.equal(1);
           });

            /* add standard listeners */
            it("Should fire an event when a listener is attached before the function has been ran",function(){
                 var test = true,
                     inner = inputElement.disabled,
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(inputElement.disabled).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2)
                     {
                       inputElement.removeEventListener('setAttribute',testFunc);
                       inputElement.removeEventListener('removeAttribute',testFunc);
                     }
                 }

                 inputElement.addEventListener('setAttribute',testFunc);
                 inputElement.addEventListener('removeAttribute',testFunc);
                 inputElement.setAttribute('disabled',test);

                 expect(cb.callCount).to.equal(1);

                 inputElement.removeAttribute('disabled');

                 expect(cb.callCount).to.equal(2);
             });

            /* add update listeners */
            it("Should fire an update event after the function has been ran",function(){
                var test = true,
                    inner = inputElement.disabled,
                    cb = spy(),
                    count = 0;

               function testFunc(e)
               {
                   count++;
                   expect(inputElement.disabled).to.equal((count === 1 ? test : inner));
                   cb.apply(this,arguments);
                   if(count === 2)
                   {
                     inputElement.removeEventListener('setAttributeupdate',testFunc);
                     inputElement.removeEventListener('removeAttributeupdate',testFunc);
                   }
               }

               inputElement.addEventListener('setAttributeupdate',testFunc);
               inputElement.addEventListener('removeAttributeupdate',testFunc);
               inputElement.setAttribute('disabled',test);

               expect(cb.callCount).to.equal(1);

               inputElement.removeAttribute('disabled');

               expect(cb.callCount).to.equal(2);
           });

            /* event object */
            it("Should contain all standard Event() properties and the new: arguments, method, stopped, stop in the event object",function(){
               var test = true,
                   inner = inputElement.disabled;

               function testFunc(e)
               {
                  expect(e.arguments).to.not.equal(undefined);
                  expect(e.attr).to.not.equal(undefined);
                  expect(e.stopped).to.not.equal(undefined);
                  expect(e.stop).to.not.equal(undefined);
                  inputElement.removeEventListener('setAttribute',testFunc);
               }

               inputElement.addEventListener('setAttribute',testFunc);
               inputElement.setAttribute('disabled',test);
               inputElement.removeAttribute('disabled');
           });

            /* preventDefault */
            it("Should prevent the function from being ran when event.preventDefault(); is called",function(){
               var test = true,
                   inner = inputElement.disabled,
                   cb = spy(),
                   count = 0;

               function testFunc(e)
               {
                   e.preventDefault();

                   count++;
                   expect(inputElement.disabled).to.equal(inner);
                   cb.apply(this,arguments);
                   if(count === 2)
                   {
                     inputElement.removeEventListener('setAttribute',testFunc);
                     inputElement.removeEventListener('removeAttribute',testFunc);
                   }
               }

               inputElement.addEventListener('setAttribute',testFunc);
               inputElement.addEventListener('removeAttribute',testFunc);
               inputElement.setAttribute('disabled',test);

               expect(cb.callCount).to.equal(1);
               expect(inputElement.disabled).to.equal(inner);

               inputElement.removeAttribute('disabled');

               expect(cb.callCount).to.equal(2);
               expect(inputElement.disabled).to.equal(inner);
            });

            /* stopPropogation */
            it("Should prevent bubbling when event.stopPropogation(); is called",function(){
               var test = true,
                   innerChild = inputElement.disabled,
                   innerParent = parentInputElement.disabled,
                   cbChild = spy(),
                   cbParent = spy(),
                   countChild = 0;

               function testChildFunc(e)
               {
                   e.stopPropagation();
                   countChild++;
                   expect(inputElement.disabled).to.equal((countChild === 1 ? innerChild : test));
                   cbChild.apply(this,arguments);
                   if(countChild === 2)
                   {
                       inputElement.removeEventListener('setAttribute',testChildFunc);
                       parentInputElement.removeEventListener('setAttribute',cbParent);

                       inputElement.removeEventListener('removeAttribute',testChildFunc);
                       parentInputElement.removeEventListener('removeAttribute',cbParent);
                   }
               }

               inputElement.addEventListener('setAttribute',testChildFunc);
               parentInputElement.addEventListener('setAttribute',cbParent);

               inputElement.addEventListener('removeAttribute',testChildFunc);
               parentInputElement.addEventListener('removeAttribute',cbParent);

               inputElement.setAttribute('disabled',test);

               expect(cbChild.callCount).to.equal(1);
               expect(cbParent.callCount).to.equal(0);

               inputElement.removeAttribute('disabled');

               expect(cbChild.callCount).to.equal(2);
               expect(cbParent.callCount).to.equal(0);
           });

            /* stopImmediatePropogation */
            it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
               var test = true,
                   inner = inputElement.disabled,
                   cb = spy(),
                   cbSec = spy(),
                   count = 0;

               function testFunc(e)
               {
                   e.stopImmediatePropagation();
                   count++;
                   expect(inputElement.disabled).to.equal((count === 1 ? inner : test));
                   cb.apply(this,arguments);
                   if(count === 2)
                   {
                       inputElement.removeEventListener('setAttribute',testFunc);
                       inputElement.removeEventListener('setAttribute',cbSec);

                       inputElement.removeEventListener('removeAttribute',testFunc);
                       inputElement.removeEventListener('removeAttribute',cbSec);
                   }
               }

               inputElement.addEventListener('setAttribute',testFunc);
               inputElement.addEventListener('setAttribute',cbSec);

               inputElement.addEventListener('removeAttribute',testFunc);
               inputElement.addEventListener('removeAttribute',cbSec);

               inputElement.setAttribute('disabled',test);

               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               inputElement.removeAttribute('disabled');

               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);
           });

            /* stopped */
            it("Should not fire a update listener if either element.stop(); or event.stop(); have been called",function(){
               var test = true,
                   test2 = true,
                   inner = inputElement.disabled,
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
                       inputElement.removeEventListener('setAttribute',testFunc);
                       inputElement.removeEventListener('setAttributeupdate',cbSec);

                       inputElement.removeEventListener('removeAttribute',testFunc);
                       inputElement.removeEventListener('removeAttributeupdate',cbSec);
                   }
               }

               inputElement.addEventListener('setAttribute',testFunc);
               inputElement.addEventListener('setAttributeupdate',cbSec);

               inputElement.addEventListener('removeAttribute',testFunc);
               inputElement.addEventListener('removeAttributeupdate',cbSec);

               inputElement.stop();
               inputElement.setAttribute('disabled',test);
               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               inputElement.setAttribute('disabled',false);
               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);

               inputElement.setAttribute('disabled',"");
               expect(cb.callCount).to.equal(3);
               expect(cbSec.callCount).to.equal(1);

               inputElement.removeAttribute('disabled');
           });
        });

        describe("data-custom", function(){
          /* default functionality */
            it("Should function normally setting, getting, and removing the attribute",function(){
               var inner = parentElement.getAttribute('data-custom'),
                   check = 'custom_data',
                   test = "custom_data_test",
                   testGetAttribute = parentElement.getAttribute('data-custom'),
                   testSetAttribute = parentElement.setAttribute('data-custom',test);

               /* check if element exists */
               expect(parentElement.getAttribute('data-custom')).to.not.equal(check);
               expect(testGetAttribute).to.equal(check);

               /* check if method returned correct output */
               expect(testSetAttribute).to.equal(undefined);

               /* remove content */
               parentElement.removeAttribute('data-custom');
               expect(parentElement.getAttribute('data-custom')).to.equal(null);

               /* set content back */
               parentElement.setAttribute('data-custom',check);
               expect(parentElement.getAttribute('data-custom')).to.equal(check);
            });

            /* remove and add listeners */
            it("Should be able to add and remove event listeners",function(){
               var test = "custom_data_test",
                   inner = parentElement.getAttribute('data-custom'), 
                   cb = spy();

               parentElement.addEventListener('setAttribute',cb);
               parentElement.setAttribute('data-custom',test);
               expect(cb.callCount).to.equal(1);
               parentElement.removeEventListener('setAttribute',cb);
               parentElement.setAttribute('data-custom',inner);
               expect(cb.callCount).to.equal(1);
           });

            /* add standard listeners */
            it("Should fire an event when a listener is attached before the function has been ran",function(){
                 var test = "custom_data_test",
                     inner = parentElement.getAttribute('data-custom'),
                     cb = spy(),
                     count = 0;

                 function testFunc(e)
                 {
                     count++;
                     expect(parentElement.getAttribute('data-custom')).to.equal((count === 1 ? inner : test));
                     cb.apply(this,arguments);
                     if(count === 2) parentElement.removeEventListener('setAttribute',testFunc);
                 }

                 parentElement.addEventListener('setAttribute',testFunc);
                 parentElement.setAttribute('data-custom',test);

                 expect(cb.callCount).to.equal(1);

                 parentElement.setAttribute('data-custom',inner);

                 expect(cb.callCount).to.equal(2);
             });

            /* add update listeners */
            it("Should fire an update event after the function has been ran",function(){
                var test = "custom_data_test",
                    inner = parentElement.getAttribute('data-custom'),
                    cb = spy(),
                    count = 0;

               function testFunc(e)
               {
                   count++;
                   expect(parentElement.getAttribute('data-custom')).to.equal((count === 1 ? test : inner));
                   cb.apply(this,arguments);
                   if(count === 2) parentElement.removeEventListener('setAttributeupdate',testFunc);
               }

               parentElement.addEventListener('setAttributeupdate',testFunc);
               parentElement.setAttribute('data-custom',test);

               expect(cb.callCount).to.equal(1);

               parentElement.setAttribute('data-custom',inner);

               expect(cb.callCount).to.equal(2);
           });

            /* event object */
            it("Should contain all standard Event() properties and the new: arguments, method, stopped, stop in the event object",function(){
               var test = "custom_data_test",
                   inner = parentElement.getAttribute('data-custom');

               function testFunc(e)
               {
                  expect(e.arguments).to.not.equal(undefined);
                  expect(e.attr).to.not.equal(undefined);
                  expect(e.stopped).to.not.equal(undefined);
                  expect(e.stop).to.not.equal(undefined);
                  parentElement.removeEventListener('setAttribute',testFunc);
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.setAttribute('data-custom',test);
               parentElement.setAttribute('data-custom',inner);
           });

            /* preventDefault */
            it("Should prevent the function from being ran when event.preventDefault(); is called",function(){
               var test = "custom_data_test",
                   inner = parentElement.getAttribute('data-custom'),
                   cb = spy(),
                   count = 0;

               function testFunc(e)
               {
                   e.preventDefault();

                   count++;
                   expect(parentElement.getAttribute('data-custom')).to.equal(inner);
                   cb.apply(this,arguments);
                   if(count === 2) parentElement.removeEventListener('setAttribute',testFunc);
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.setAttribute('data-custom',test);

               expect(cb.callCount).to.equal(1);
               expect(parentElement.getAttribute('data-custom')).to.equal(inner);

               parentElement.setAttribute('data-custom',inner);

               expect(cb.callCount).to.equal(2);
               expect(parentElement.getAttribute('data-custom')).to.equal(inner);
            });

            /* stopPropogation */
            it("Should prevent bubbling when event.stopPropogation(); is called",function(){
               var test = "custom_data_test",
                   innerChild = childElement.getAttribute('data-custom'),
                   innerParent = parentElement.getAttribute('data-custom'),
                   cbChild = spy(),
                   cbParent = spy(),
                   countChild = 0;

               function testChildFunc(e)
               {
                   e.stopPropagation();
                   countChild++;
                   expect(childElement.getAttribute('data-custom')).to.equal((countChild === 1 ? innerChild : test));
                   cbChild.apply(this,arguments);
                   if(countChild === 2)
                   {
                       childElement.removeEventListener('setAttribute',testChildFunc);
                       parentElement.removeEventListener('setAttribute',cbParent);
                   }
               }

               childElement.addEventListener('setAttribute',testChildFunc);
               parentElement.addEventListener('setAttribute',cbParent);

               childElement.setAttribute('data-custom',test);

               expect(cbChild.callCount).to.equal(1);
               expect(cbParent.callCount).to.equal(0);

               childElement.setAttribute('data-custom',innerChild);

               expect(cbChild.callCount).to.equal(2);
               expect(cbParent.callCount).to.equal(0);
           });

            /* stopImmediatePropogation */
            it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
               var test = "custom_data_test",
                   inner = parentElement.getAttribute('data-custom'),
                   cb = spy(),
                   cbSec = spy(),
                   count = 0;

               function testFunc(e)
               {
                   e.stopImmediatePropagation();
                   count++;
                   expect(parentElement.getAttribute('data-custom')).to.equal((count === 1 ? inner : test));
                   cb.apply(this,arguments);
                   if(count === 2)
                   {
                       parentElement.removeEventListener('setAttribute',testFunc);
                       parentElement.removeEventListener('setAttribute',cbSec);
                   }
               }

               parentElement.addEventListener('setAttribute',testFunc);
               parentElement.addEventListener('setAttribute',cbSec);

               parentElement.setAttribute('data-custom',test);

               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('data-custom',inner);

               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);
           });

            /* stopped */
            it("Should not fire a update listener if either element.stop(); or event.stop(); have been called",function(){
               var test = "data_custom_test",
                   test2 = "data_custom_test_sec",
                   inner = parentElement.getAttribute('data-custom'),
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
               parentElement.setAttribute('data-custom',test);
               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('data-custom',test2);
               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);

               parentElement.setAttribute('data-custom',"");
               expect(cb.callCount).to.equal(3);
               expect(cbSec.callCount).to.equal(1);

               parentElement.setAttribute('data-custom',inner);
           });
        });
    });
  };
  
}());