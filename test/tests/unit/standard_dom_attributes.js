var standardDomAttributes = (function(){
  return function(describe,it,expect,spy,timer)
  {
    var methods = [
          defaultPropertyFunctionality,
          defaulPropertytListeners,
          defaulStyletListeners,
          defaultBubbledListeners,
          preValueSet,
          postValueSet,
          eventProperties,
          defaultPrevented,
          stopBubbledListeners,
          stopImmediateListeners,
          stopUpdateListeners,
          bubbleFromNewElements,
          changeFromAttributes
        ];
    
    function runCategory(key,value,parent,child)
    {
      describe(key+':', function(){
        trackTestTime.call(this,key);
        
        for(var x=0,len=methods.length;x<len;x++)
        {
          methods[x](key,value,parent,child);
        }
      });
    }

    /* INDIVIDUAL TESTS */
    /* REGION */
    
    function defaultPropertyFunctionality(key,value,node)
    {
      it("Functionality of "+key+" should update as originally intended",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
            __value = value;

        __node.setAttribute(key,__value);
        expect(__node.getAttribute(key)).to.equal(__value);

        __node[(__oldValue !== null ? 'setAttribute' : 'removeAttribute')](key,__oldValue);
        expect(__node.getAttribute(key)).to.equal(__oldValue);
        done();
      });
    }
    
    function defaulPropertytListeners(key,value,node)
    {
      it("Listeners should add, remove and fire upon update",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
            __value = value,
            __cb = spy();

        __node.addEventListener(key,__cb);
        __node.setAttribute(key,__value);
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        expect(__cb.callCount).to.equal(1);
        done();
      });
    }
    
    function defaulStyletListeners(key,value,node)
    {
      it("CSS style syntax listeners should fire upon update",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
            __value = value,
            __cb = spy();

        __node.addEventListener(key,__cb);
        __node.setAttribute(key,__value);
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        expect(__cb.callCount).to.equal(1);
        done();
      });
    }
    
    function defaultBubbledListeners(key,value,node,sub_node)
    {
      it("Listeners should fire upon update of a child element in a bubbled manner",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.querySelector(sub_node),
            __oldValue = (__sub_node.getAttribute(key) === null ? null : __sub_node.getAttribute(key)),
            __value = value,
            __cb = spy();
        
        __node.addEventListener(key,__cb);
        __sub_node.setAttribute(key,__value);
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        __sub_node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        done();
      })
    }
    
    function preValueSet(key,value,node)
    {
      it("An event should fire prior to the value being set",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
            __value = value;
        
        function CV(e)
        {
          expect(__node.getAttribute(key)).to.equal(__oldValue);
        }

        __node.addEventListener(key,CV);
        __node.setAttribute(key,__value);

        __node.removeEventListener(key,CV);
        __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        done();
      });
    }
    
    function postValueSet(key,value,node)
    {
      it("An update event should fire after the value has been set",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
            __value = value;
        
        function CV(e)
        {
          expect(__node.getAttribute(key)).to.equal(__value);
        }

        __node.addEventListener(key+'update',CV);
        __node.setAttribute(key,__value);

        __node.removeEventListener(key+'update',CV);
        __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        done();
      });
    }
    
    function eventProperties(key,value,node)
    {
      it("All event properties should exist on the passed event object",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
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
        __node.setAttribute(key,__value);

        __node.removeEventListener(key,CV);
        __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        done();
      });
    }
    
    function defaultPrevented(key,value,node)
    {
      it("A value should not be set if event.preventDefault is called",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
            __value = value;
        
        function CV(e)
        {
          e.preventDefault();
          expect(e.defaultPrevented).to.equal(true);
        }
        
        __node.addEventListener(key,CV);
        __node.setAttribute(key,__value);
        expect(__node.getAttribute(key)).to.equal(__oldValue);
        
        __node.removeEventListener(key,CV);
        __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        done();
      });
    }
    
    function stopBubbledListeners(key,value,node,sub_node)
    {
      it("Bubbled Parent listeners should not be called if event.stopPropogation is called",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.querySelector(sub_node),
            __oldValue = (__sub_node.getAttribute(key) === null ? null : __sub_node.getAttribute(key)),
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stopPropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        __sub_node.addEventListener(key,CV);
        __node.addEventListener(key,__cb);
        __sub_node.setAttribute(key,__value);
        expect(__cb.callCount).to.equal(0);
        
        __sub_node.removeEventListener(key,CV);
        __node.removeEventListener(key,__cb);
        __sub_node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        done();
      })
    }
    
    function stopImmediateListeners(key,value,node)
    {
      it("After event.stopImmediatePropogation is called no other listeners should be fired",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stopImmediatePropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        __node.addEventListener(key,CV);
        __node.addEventListener(key,__cb);
        __node.setAttribute(key,__value);
        expect(__cb.callCount).to.equal(0);
        
        __node.removeEventListener(key,CV);
        __node.removeEventListener(key,__cb);
        __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
        done();
      });
    }
    
    function stopUpdateListeners(key,value,node)
    {
      it("After event.stop is called update listeners should not be fired",function(done){
        var __node = document.querySelector(node),
            __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stop();
          expect(e.stopped).to.equal(true);
        }
        
        __node.addEventListener(key,CV);
        __node.addEventListener(key+'update',__cb);
        __node.setAttribute(key,__value);
        expect(__cb.callCount).to.equal(0);
        
        __node.removeEventListener(key,CV);
        __node.removeEventListener(key+'update',__cb);
        __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
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
        __sub_node.setAttribute(key,__value);
        expect(__cb.callCount).to.equal(1);
        
        __node.insertBefore(__sub_node2,__sub_node);
        __sub_node2.setAttribute(key,__value);
        expect(__cb.callCount).to.equal(2);
        
        __node.removeEventListener(key,__cb);
        __node.innerHTML = __oldValue;
        done();
      });
    }
    
    function changeFromAttributes(key,value,node)
    {
      it("A listener should fire when an attribute is directly changed using the attributes object",function(done){
          var __node = document.querySelector(node),
              __oldValue = (__node.getAttribute(key) === null ? null : __node.getAttribute(key)),
              __value = value,
              __cb = spy();
        
              __node.setAttribute(key,__oldValue);
              __node.addEventListener(key,__cb);
              __node.attributes[key].value = __value;
        
              expect(__cb.callCount).to.equal(1);
              __node.removeEventListener(key,__cb);
              __node[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](key,__oldValue);
              done();
      });
    }
    
    /* ENDREGION */
    
    describe("STANDARD DOM ATTRIBUTES:",function(){
      runCategory("disabled","true",'#test_element','#test_element__sub');
      runCategory("role","button",'#test_element','#test_element__sub');
      runCategory("onkeyup","(function(e){})",'#test_element','#test_element__sub'); //issue with IE?
      runCategory("data-custom","500",'#test_element','#test_element__sub');
    });
  }
}());