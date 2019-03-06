var standardDomFunction = (function(){
  
  function newEvent(eventName) {
      var event;
      if (typeof(Event) === 'function') {
          event = new Event(eventName);
      } else {
          event = document.createEvent('Event');
          event.type = eventName;
          event.initEvent(eventName, true, true);
      }
      return event;
  }
  
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
        ];
    
    function runCategory(key,args,parent,child,pre,post)
    {
      describe(key+':', function(){
        trackTestTime.call(this,key);
        
        for(var x=0,len=methods.length;x<len;x++)
        {
          methods[x](key,args,parent,child,pre,post);
        }
      });
    }

    /* INDIVIDUAL TESTS */
    /* REGION */
    
    function defaultPropertyFunctionality(key,args,node,sub_node,pre,post)
    {
      it("Functionality of "+key+" method should run as originally intended",function(done){
        var __node = document.querySelector(node),
            __args = args;
        
        expect(pre(node,undefined,key)).to.equal(true);
        __node[key].apply(__node,__args);
        expect(post(node,undefined,key)).to.equal(true);
        done();
      });
    }
    
    function defaulPropertytListeners(key,args,node,sub_node,pre,post)
    {
      it("Listeners should add, remove and fire upon update",function(done){
        var __node = document.querySelector(node),
            __args = args,
            __cb = spy();

        expect(pre(node,undefined,key)).to.equal(true);
        __node.addEventListener(key,__cb);
        __node[key].apply(__node,__args);
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        __node[key].apply(__node,__args);
        expect(__cb.callCount).to.equal(1);
        
        expect(post(node,undefined,key)).to.equal(true);
        done();
      });
    }
    
    function defaultBubbledListeners(key,args,node,sub_node,pre,post)
    {
      it("Listeners should fire upon update of a child element in a bubbled manner",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.querySelector(sub_node),
            __args = args,
            __cb = spy();
        
        expect(pre(node,sub_node,key)).to.equal(true);
        __node.addEventListener(key,__cb);
        __sub_node[key].apply(__sub_node,__args);
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        expect(post(node,sub_node,key)).to.equal(true);
        done();
      })
    }
    
    function preValueSet(key,args,node,sub_node,pre,post)
    {
      it("An event should fire prior to the method being ran",function(done){
        var __node = document.querySelector(node),
            __args = args;
        
        function CV(e)
        {
          __node.removeEventListener(key,CV);
          expect(post(node,undefined,key,true)).to.equal(true);
          e.preventDefault();
        }
        
        expect(pre(node,undefined,key)).to.equal(true);
        __node.addEventListener(key,CV);
        __node[key].apply(__node,__args);
        done();
      });
    }
    
    function postValueSet(key,args,node,sub_node,pre,post)
    {
      it("An update event should fire after the value has been set",function(done){
        var __node = document.querySelector(node),
            __args = args;
        
        function CV(e)
        {
          __node.removeEventListener(key+'update',CV);
          expect(post(node,undefined,key)).to.equal(true);
        }
        
        expect(pre(node,undefined,key)).to.equal(true);
        
        __node.addEventListener(key+'update',CV);
        __node[key].apply(__node,__args);

        done();
      });
    }
    
    function eventProperties(key,args,node,sub_node,pre,post)
    {
      it("All event properties should exist on the passed event object",function(done){
        var __node = document.querySelector(node),
            __args = args;
        
        function CV(e)
        {
          expect(JSON.stringify([].slice.call(e.arguments))).to.equal(JSON.stringify(__args));
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
        
        expect(pre(node,undefined,key));
        
        __node.addEventListener(key,CV);
        __node[key].apply(__node,__args);

        __node.removeEventListener(key,CV);
        expect(post(node,undefined,key)).to.equal(true);
        done();
      });
    }
    
    function defaultPrevented(key,args,node,sub_node,pre,post)
    {
      it("A value should not be set if event.preventDefault is called",function(done){
        var __node = document.querySelector(node),
            __args = args;
        
        function CV(e)
        {
          e.preventDefault();
          expect(e.defaultPrevented).to.equal(true);
        }
        
        expect(pre(node,undefined,key)).to.equal(true);
        
        __node.addEventListener(key,CV);
        __node[key].apply(__node,__args);
        
        __node.removeEventListener(key,CV);
        expect(post(node,undefined,key,true)).to.equal(true);
        done();
      });
    }
    
    function stopBubbledListeners(key,args,node,sub_node,pre,post)
    {
      it("Bubbled Parent listeners should not be called if event.stopPropogation is called",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.querySelector(sub_node),
            __args = args,
            __cb = spy();
        
        function CV(e)
        {
          e.stopPropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        expect(pre(node,sub_node,key)).to.equal(true);
        
        __sub_node.addEventListener(key,CV);
        __node.addEventListener(key,__cb);
        __sub_node[key].apply(__sub_node,__args);
        expect(__cb.callCount).to.equal(0);
        
        __sub_node.removeEventListener(key,CV);
        __node.removeEventListener(key,__cb);
        expect(post(node,sub_node,key)).to.equal(true);
        done();
      })
    }
    
    function stopImmediateListeners(key,args,node,sub_node,pre,post)
    {
      it("After event.stopImmediatePropogation is called no other listeners should be fired",function(done){
        var __node = document.querySelector(node),
            __args = args,
            __cb = spy();
        
        function CV(e)
        {
          e.stopImmediatePropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        expect(pre(node,undefined,key)).to.equal(true);
        
        __node.addEventListener(key,CV);
        __node.addEventListener(key,__cb);
        __node[key].apply(__node,__args);
        expect(__cb.callCount).to.equal(0);
        
        __node.removeEventListener(key,CV);
        __node.removeEventListener(key,__cb);
        expect(post(node,undefined,key)).to.equal(true);
        done();
      });
    }
    
    function stopUpdateListeners(key,args,node,sub_node,pre,post)
    {
      it("After event.stop is called update listeners should not be fired",function(done){
        var __node = document.querySelector(node),
            __args = args,
            __cb = spy();
        
        function CV(e)
        {
          e.stop();
          expect(e.stopped).to.equal(true);
        }
        
        expect(pre(node,undefined,key)).to.equal(true);
        
        __node.addEventListener(key,CV);
        __node.addEventListener(key+'update',__cb);
        __node[key].apply(__node,__args)
        expect(__cb.callCount).to.equal(0);
        
        __node.removeEventListener(key,CV);
        __node.removeEventListener(key+'update',__cb);
        expect(post(node,undefined,key)).to.equal(true);
        done();
      });
    }
    
    function bubbleFromNewElements(key,args,node,sub_node,pre,post)
    {
      it("When a new element is added it should also bubble the event",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.createElement('div'),
            __sub_node2 = document.createElement('div'),
            __prehtml = __node.innerHTML,
            __args = args,
            __cb = spy();
        
        expect(pre(node,undefined,key)).to.equal(true);
        
        __node.appendChild(__sub_node);
        __node.insertBefore(__sub_node2,__sub_node);
        
        __node.addEventListener(key,__cb);
        __sub_node[key].apply(__sub_node,__args);
        expect(__cb.callCount).to.equal(1);
        
        __sub_node2[key].apply(__sub_node2,__args);
        expect(__cb.callCount).to.equal(2);
        
        __node.removeEventListener(key,__cb);
        __node.innerHTML = __prehtml;
        done();
      });
    }
    
    /* ENDREGION */
    
    describe("STANDARD DOM FUNCTIONS:",function(){
      
      var __oldValue = "",
          __attr = 'class',
          __listener = 'click',
          __callback = spy()
      
      function func(e)
      {
        expect(e.type).to.equal('click');
        __callback();
      }
      
      function pre(node,sub_node,key)
      {
        var __node = document.querySelector(node),
            __sub_node = (sub_node ? document.querySelector(sub_node) : null),
            __currentNode = (__sub_node ? __sub_node : __node);
        
        switch(key)
        {
          case 'appendChild':
            __oldValue = __currentNode.innerHTML;
          break;
          case 'setAttribute':
            __oldValue = __currentNode.getAttribute(__attr);
          break;
        }
        return true;
      }
      
      function post(node,sub_node,key,pre)
      {
        var __node = document.querySelector(node),
            __sub_node = (sub_node ? document.querySelector(sub_node) : null),
            __currentNode = (__sub_node ? __sub_node : __node);
        
        switch(key)
        {
          case 'appendChild':
            if(pre)
            {
              expect(__currentNode.innerHTML).to.equal(__oldValue);
            }
            else
            {
              expect(__currentNode.innerHTML).to.not.equal(__oldValue);
            }
            
            __currentNode.innerHTML = __oldValue;
            expect(__currentNode.innerHTML).to.equal(__oldValue);
          break;
          case 'addEventListener':
            var __event = newEvent(__listener);
            __currentNode.dispatchEvent(__event);
            
            expect(__callback.callCount).to.equal((pre ? 0 : 1));
            __currentNode.removeEventListener(__listener,func);
            
            __callback.callCount = 0;
            __currentNode.dispatchEvent(__event);
            expect(__callback.callCount).to.equal(0);
          break;
          case 'setAttribute':
            if(pre)
            {
              expect(__currentNode.getAttribute(__attr)).to.equal(__oldValue);
            }
            else
            {
              expect(__currentNode.getAttribute(__attr)).to.not.equal(__oldValue);
            }
            
            __currentNode[__oldValue !== null ? 'setAttribute' : 'removeAttribute'](__attr,__oldValue);
            expect(__currentNode.getAttribute(__attr)).to.equal(__oldValue);
          break;
        }
        return true;
      }
      
      runCategory("appendChild",[document.createElement('div')],'#test_element','#test_element__sub',pre,post);
      runCategory("addEventListener",['click',func],'#test_element','#test_element__sub',pre,post);
      runCategory("setAttribute",['class','tester'],'#test_element','#test_element__sub',pre,post);
    });
  }
}());