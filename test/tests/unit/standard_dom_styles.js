var standardDomStyles = (function(){
  
  return function(describe,it,expect,spy){
    
    describe("Standard dom styles", function() {
        describe("color", function() {
            /* default functionality */
            it("Should function normally returning and setting color style",function(){
              
              var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
               var inner = parentElement.style.color,
                   check = 'rgb(0, 0, 0)',
                   test = "rgb(240, 15, 0)";
               /* check default */
               expect(inner).to.equal(check);
               parentElement.style.color = test;
               /* check replaced content */
               expect(parentElement.style.color).to.equal(test);
              
               expect(getComputedStyle(parentElement).color).to.equal(test);

               /* set content back */
               parentElement.style.color = inner;
               expect(parentElement.style.color).to.equal(check);
              
               expect(getComputedStyle(parentElement).color).to.equal(check);
           });
          
            /* remove and add listeners */
            it("Should be able to add and remove event listeners",function(){
              
              var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
               var test = "rgb(240, 15, 0)",
                   inner = parentElement.style.color, 
                   cb = spy();
                
               function color(e)
               {
                 cb.call(this,arguments);
               }
              
               parentElement.addEventListener('color',color);
               parentElement.style.color = test;
               expect(cb.callCount).to.equal(1);
              
               parentElement.removeEventListener('color',color);
               parentElement.style.color = inner;
               expect(cb.callCount).to.equal(1);
           });
          
            /* add standard listeners */
            it("Should fire an event when a listener is attached before the style has been set",function(){
              
              var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
               var test = "rgb(240, 15, 0)",
                   inner = parentElement.style.color,
                   cb = spy(),
                   count = 0;

               function testFunc(e)
               {
                   count++;
                   expect(parentElement.style.color).to.equal((count === 1 ? inner : test));
                   expect(getComputedStyle(parentElement).color).to.equal((count === 1 ? inner : test));
                   cb.apply(this,arguments);
                   if(count === 2) parentElement.removeEventListener('color',testFunc);
               }

               parentElement.addEventListener('color',testFunc);
               parentElement.style.color = test;

               expect(cb.callCount).to.equal(1);

               parentElement.style.color = inner;

               expect(cb.callCount).to.equal(2);
           });
          
            /* add update listeners */
            it("Should fire an update event after the style has been set",function(){
              
                var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
                var test = "rgb(240, 15, 0)",
                    inner = parentElement.style.color,
                    cb = spy(),
                    count = 0;

               function testFunc(e)
               {
                   count++;
                   expect(parentElement.style.color).to.equal((count === 1 ? test : inner));
                   expect(getComputedStyle(parentElement).color).to.equal((count === 1 ? test : inner));
                   cb.apply(this,arguments);
                   if(count === 2) parentElement.removeEventListener('colorupdate',testFunc);
               }

               parentElement.addEventListener('colorupdate',testFunc);
               parentElement.style.color = test;

               expect(cb.callCount).to.equal(1);

               parentElement.style.color = inner;

               expect(cb.callCount).to.equal(2);
           });
          
            /* event object */
            it("Should contain all standard Event() properties and the new: value, oldvalue, stopped, stop in the event object",function(){
              
              var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
               var test = "rgb(240, 15, 0)",
                   inner = parentElement.style.color;

               function testFunc(e)
               {
                   expect(e.value).to.not.equal(undefined);
                   expect(e.oldValue).to.not.equal(undefined);
                   expect(e.stopped).to.not.equal(undefined);
                   expect(e.stop).to.not.equal(undefined);
                   parentElement.removeEventListener('color',testFunc);
               }

               parentElement.addEventListener('color',testFunc);
               parentElement.style.color = test;
               parentElement.style.color = inner;
           });
          
            /* preventDefault */
            it("Should prevent the style from being set when event.preventDefault(); is called",function(){
              
              var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
               var test = "rgb(240, 15, 0)",
                   inner = parentElement.style.color,
                   cb = spy(),
                   count = 0;

               function testFunc(e)
               {
                   e.preventDefault();

                   count++;
                   expect(parentElement.style.color).to.equal(inner);
                   expect(getComputedStyle(parentElement).color).to.equal(inner);
                   cb.apply(this,arguments);
                   if(count === 2) parentElement.removeEventListener('color',testFunc);
               }

               parentElement.addEventListener('color',testFunc);
               parentElement.style.color = test;

               expect(cb.callCount).to.equal(1);
               expect(parentElement.style.color).to.equal(inner);
               expect(getComputedStyle(parentElement).color).to.equal(inner);

               parentElement.style.color = inner;

               expect(cb.callCount).to.equal(2);
               expect(parentElement.style.color).to.equal(inner);
               expect(getComputedStyle(parentElement).color).to.equal(inner);
            });
          
            /* stopPropogation */
            it("Should prevent bubbling when event.stopPropogation(); is called",function(){
              
               //expect("Test broken by bug in chrome").to.equal('version 50+');
              
              var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
               var test = "rgb(240, 15, 0)",
                   innerChild = childElement.style.color,
                   innerParent = parentElement.style.color,
                   cbChild = spy(),
                   cbParent = spy(),
                   countChild = 0;

               function testChildFunc(e)
               {
                  
                   childElement = document.querySelector('.test_subject__element__child');
                 
                   e.stopPropagation();
                   countChild++;
                   expect(childElement.style.color).to.equal((countChild === 1 ? innerChild : test));
                   cbChild.apply(this,arguments);
                   if(countChild === 2)
                   {
                       childElement.removeEventListener('color',testChildFunc);
                       parentElement.removeEventListener('color',cbParent);
                   }
               }

               childElement.addEventListener('color',testChildFunc);
               parentElement.addEventListener('color',cbParent);

               childElement.style.color = test;

               expect(cbChild.callCount).to.equal(1);
               expect(cbParent.callCount).to.equal(0);

               childElement.style.color = innerChild;

               expect(cbChild.callCount).to.equal(2);
               expect(cbParent.callCount).to.equal(0);
           });
          
            /* stopImmediatePropogation */
            it("Should prevent any further events from firing when event.stopImmediatePropogation(); is called",function(){
              
                var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
               var test = "rgb(240, 15, 0)",
                   inner = parentElement.style.color,
                   cb = spy(),
                   cbSec = spy(),
                   count = 0;
               function testFunc(e)
               {
                   e.stopImmediatePropagation();
                   count++;
                   expect(parentElement.style.color).to.equal((count === 1 ? inner : test));
                   expect(getComputedStyle(parentElement).color).to.equal((count === 1 ? inner : test));
                   cb.apply(this,arguments);
                   if(count === 2)
                   {
                       parentElement.removeEventListener('color',testFunc);
                       parentElement.removeEventListener('color',cbSec);
                   }
               }

               parentElement.addEventListener('color',testFunc);
               parentElement.addEventListener('color',cbSec);

               parentElement.style.color = test;

               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.style.color = inner;

               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);
           });
          
            /* stopped */
            it("Should not fire a update listener if either element.stop(); or event.stop(); have been called prior to setting",function(){
              
               var parentElement = document.querySelector('.test_subject__element'),
                  childElement = document.querySelector('.test_subject__element__child');
              
               var test = "rgb(240, 15, 0)",
                   test2 = "rgb(240, 15, 100)",
                   inner = parentElement.style.color,
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
                       parentElement.removeEventListener('color',testFunc);
                       parentElement.removeEventListener('colorupdate',cbSec);
                   }
               }

               parentElement.addEventListener('color',testFunc);
               parentElement.addEventListener('colorupdate',cbSec);

               parentElement.stop();
               parentElement.style.color = test;
               expect(cb.callCount).to.equal(1);
               expect(cbSec.callCount).to.equal(0);

               parentElement.style.color = test2;
               expect(cb.callCount).to.equal(2);
               expect(cbSec.callCount).to.equal(0);

               parentElement.style.color = "";
               expect(cb.callCount).to.equal(3);
               expect(cbSec.callCount).to.equal(1);

               parentElement.style.color = inner;
           });
            
        });
      
        describe("font-size", function() {
      
        });
      
        describe("margin", function() {
      
        });
    });
  };
  
}());