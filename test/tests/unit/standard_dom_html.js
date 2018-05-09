/* NOT FINISHED */

var standardDomHTML = (function(){
  return function(describe,it,expect,spy,timer)
  {
    var methods = [
          defaultPropertyFunctionality,
          defaulPropertytListeners,
          defaultBubbledListeners,
          preValueSet,
          postValueSet,
          eventProperties,
          defaultPrevented,
          stopBubbledListeners,
          stopImmediateListeners,
          stopUpdateListeners,
          bubbleFromNewElements
        ],
        testMethods = [
          'textContent',
          'innerHTML',
          'innerText',
          'outerHTML',
          'outerText',
          'appendChild',
          'removeChild',
          'replaceChild',
          'insertAdjacentHTML',
          'insertBefore'
        ];
    
    function runCategory(key,value,parent,child)
    {
      describe(key+':', function(){
        trackTestTime.call(this,key);
        
        for(var x=0,len=methods.length,perf,el;x<len;x++)
        {
          methods[x](key,value,parent,child);
        }
      });
    }

    /* INDIVIDUAL TESTS */
    /* REGION */
    
    function defaulPropertytListeners(key,value,node)
    {
      it("Listeners should add, remove and fire upon update",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node[key],
            __value = value,
            __cb = spy();

        __node.addEventListener(key,__cb);
        __node[key] = __value;
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        __node[key] = __oldValue;
        expect(__cb.callCount).to.equal(1);
        done();
      });
    }
    
    function defaultBubbledListeners(key,value,node,sub_node)
    {
      it("Listeners should fire upon update of a child element in a bubbled manner",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.querySelector(sub_node),
            __oldValue = __sub_node[key],
            __value = value,
            __cb = spy();
        
        __node.addEventListener(key,__cb);
        __sub_node[key] = __value;
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        __sub_node[key] = __oldValue;
        done();
      })
    }
    
    function preValueSet(key,value,node)
    {
      it("An event should fire prior to the value being set",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node[key],
            __value = value;
        
        function CV(e)
        {
          expect(__node[key]).to.equal(__oldValue);
        }

        __node.addEventListener(key,CV);
        __node[key] = __value;

        __node.removeEventListener(key,CV);
        __node[key] = __oldValue;
        done();
      });
    }
    
    function postValueSet(key,value,node)
    {
      it("An update event should fire after the value has been set",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node[key],
            __value = value;
        
        function CV(e)
        {
          expect(__node[key]).to.equal(__value);
        }

        __node.addEventListener(key+'update',CV);
        __node[key] = __value;

        __node.removeEventListener(key+'update',CV);
        __node[key] = __oldValue;
        done();
      });
    }
    
    function eventProperties(key,value,node)
    {
      it("All event properties should exist on the passed event object",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node[key],
            __value = value;
        
        function CV(e)
        {
          expect(e.oldValue).to.equal(__oldValue);
          expect(e.value).to.equal(__value);
          expect(e.cancelable).to.equal(true);
          expect(e.defaultPrevented).to.equal(false);
          expect(e.bubbles).to.equal(true);
          expect(e.attr).to.equal(key);
          expect(e.target).to.equal(__node);
          expect(e.stopped).to.equal(false);
          expect(typeof e.preventDefault).to.equal('function');
          expect(typeof e.stopPropagation).to.equal('function');
          expect(typeof e.stopImmediatePropagation).to.equal('function');
          expect(typeof e.stop).to.equal('function');
        }

        __node.addEventListener(key,CV);
        __node[key] = __value;

        __node.removeEventListener(key,CV);
        __node[key] = __oldValue;
        done();
      });
    }
    
    function defaultPrevented(key,value,node)
    {
      it("A value should not be set if event.preventDefault is called",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node[key],
            __value = value;
        
        function CV(e)
        {
          e.preventDefault();
          expect(e.defaultPrevented).to.equal(true);
        }
        
        __node.addEventListener(key,CV);
        __node[key] = __value;
        expect(__node[key]).to.equal(__oldValue);
        
        __node.removeEventListener(key,CV);
        __node[key] = __oldValue;
        done();
      });
    }
    
    function stopBubbledListeners(key,value,node,sub_node)
    {
      it("Bubbled Parent listeners should not be called if event.stopPropogation is called",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.querySelector(sub_node),
            __oldValue = __sub_node[key],
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stopPropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        __sub_node.addEventListener(key,CV);
        __node.addEventListener(key,__cb);
        __sub_node[key] = __value;
        expect(__cb.callCount).to.equal(0);
        
        __sub_node.removeEventListener(key,CV);
        __node.removeEventListener(key,__cb);
        __sub_node[key] = __oldValue;
        done();
      })
    }
    
    function stopImmediateListeners(key,value,node)
    {
      it("After event.stopImmediatePropogation is called no other listeners should be fired",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node[key],
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stopImmediatePropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        __node.addEventListener(key,CV);
        __node.addEventListener(key,__cb);
        __node[key] = __value;
        expect(__cb.callCount).to.equal(0);
        
        __node.removeEventListener(key,CV);
        __node.removeEventListener(key,__cb);
        __node[key] = __oldValue;
        done();
      });
    }
    
    function stopUpdateListeners(key,value,node)
    {
      it("After event.stop is called update listeners should not be fired",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node[key],
            __value = value,
            __cb = spy(),
            __cb2 = spy();
        
        function CV(e)
        {
          e.stop();
          expect(e.stopped).to.equal(true);
        }
        
        __node.addEventListener(key,CV);
        __node.addEventListener(key+'update',__cb);
        __node.addEventListener(key+'update',__cb2);
        __node[key] = __value;
        expect(__cb.callCount).to.equal(0);
        expect(__cb2.callCount).to.equal(0);
        
        __node.removeEventListener(key,CV);
        __node.removeEventListener(key+'update',__cb);
        __node.removeEventListener(key+'update',__cb2);
        __node[key] = __oldValue;
        done();
      });
    }
    
    function bubbleFromNewElements(key,value,node)
    {
      it("When a new element is added it should also bubble the event",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.createElement('div'),
            __sub_node2 = document.createElement('div'),
            __oldValue = __node.innerHTML,
            __value = value,
            __cb = spy();
        
        __node.addEventListener(key,__cb);
        __node.appendChild(__sub_node);
        __sub_node[key] = __value;
        expect(__cb.callCount).to.equal(1);
        
        __node.insertBefore(__sub_node2,__sub_node);
        __sub_node2[key] = __value;
        expect(__cb.callCount).to.equal(2);
        
        __node.removeEventListener(key,__cb);
        __node.innerHTML = __oldValue;
        done();
      });
    }
    
    /* ENDREGION */
    
    describe("STANDARD DOM PROPERTIES:",function(){
      runCategory("innerHTML","<div>test</div>",'#test_element','#test_element__sub');
      runCategory("className","test__class",'#test_element','#test_element__sub');
      runCategory("id","test__id",'.test_subject__element','.test_subject__element__child');
      runCategory("onclick",function(){},'#test_element','#test_element__sub');
    });
    
    describe("CUSTOM DOM PROPERTIES",function(){
      runCategory("foo","test__foo",'#test_element','#test_element__sub');
      runCategory("bar","test__bar",'#test_element','#test_element__sub');
    })
  }
}());