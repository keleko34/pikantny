var standardDomStyles = (function(){
  return function(describe,it,expect,spy,timer)
  {
    var methods = [
          defaultPropertyFunctionality,
          defaulPropertytListeners,
          defaulStyleListeners,
          defaultBubbledListeners,
          preValueSet,
          postValueSet,
          eventProperties,
          defaultPrevented,
          stopBubbledListeners,
          stopImmediateListeners,
          stopUpdateListeners,
          bubbleFromNewElements,
          cssTextUpdate,
          styleAttrUpdate,
          setPropertyUpdate
        ];
    
    function runCategory(key,keyProper,value,parent,child)
    {
      describe(key+':', function(){
        trackTestTime.call(this,key);
        
        for(var x=0,len=methods.length;x<len;x++)
        {
          methods[x](key,keyProper,value,parent,child);
        }
      });
    }

    /* INDIVIDUAL TESTS */
    /* REGION */
    
    function defaultPropertyFunctionality(key,keyProper,value,node)
    {
      it("Functionality of "+key+" should update as originally intended",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value; 

        /* insert new value */
        __node.style[key] = __value;
        expect(__node.style[key]).to.equal(__value);

        /* reset value */
        __node.style[key] = __oldValue;
        expect(__node.style[key]).to.equal(__oldValue);
        done();
      });
    }
    
    function defaulPropertytListeners(key,keyProper,value,node)
    {
      it("Listeners should add, remove and fire upon update",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value,
            __cb = spy();

        __node.addEventListener(key,__cb);
        __node.style[key] = __value;
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        __node.style[key] = __oldValue;
        expect(__cb.callCount).to.equal(1);
        done();
      });
    }
    
    function defaulStyleListeners(key,keyProper,value,node)
    {
      it("CSS style syntax listeners should fire upon update",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value,
            __cb =  spy();

        __node.addEventListener(keyProper,__cb);
        __node.style[key] = __value;
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(keyProper,__cb);
        __node.style[key] = __oldValue;
        expect(__cb.callCount).to.equal(1);
        done();
      });
    }
    
    function defaultBubbledListeners(key,keyProper,value,node,sub_node)
    {
      it("Listeners should fire upon update of a child element in a bubbled manner",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.querySelector(sub_node),
            __oldValue = __sub_node.style[key],
            __value = value,
            __cb = spy();
        
        __node.addEventListener(key,__cb);
        __sub_node.style[key] = __value;
        expect(__cb.callCount).to.equal(1);

        __node.removeEventListener(key,__cb);
        __sub_node.style[key] = __oldValue;
        done();
      })
    }
    
    function preValueSet(key,keyProper,value,node)
    {
      it("An event should fire prior to the value being set",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value;
        
        function CV(e)
        {
          expect(__node.style[key]).to.equal(__oldValue);
        }

        __node.addEventListener(key,CV);
        __node.style[key] = __value;

        __node.removeEventListener(key,CV);
        __node.style[key] = __oldValue;
        done();
      });
    }
    
    function postValueSet(key,keyProper,value,node)
    {
      it("An update event should fire after the value has been set",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value;
        
        function CV(e)
        {
          expect(__node.style[key]).to.equal(__value);
        }

        __node.addEventListener(key+'update',CV);
        __node.style[key] = __value;

        __node.removeEventListener(key+'update',CV);
        __node.style[key] = __oldValue;
        done();
      });
    }
    
    function eventProperties(key,keyProper,value,node)
    {
      it("All event properties should exist on the passed event object",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value;
        
        function CV(e)
        {
          expect(e.oldValue).to.equal(__oldValue);
          expect(e.value).to.equal(__value);
          expect(e.cancelable).to.equal(true);
          expect(e.defaultPrevented).to.equal(false);
          expect(e.bubbles).to.equal(true);
          expect(e.attr).to.equal(key);
          expect(e.style).to.equal(keyProper);
          expect(e.target).to.equal(__node);
          expect(e.stopped).to.equal(false);
          expect(typeof e.preventDefault).to.equal('function');
          expect(typeof e.stopPropagation).to.equal('function');
          expect(typeof e.stopImmediatePropagation).to.equal('function');
          expect(typeof e.stop).to.equal('function');
        }

        __node.addEventListener(key,CV);
        __node.style[key] = __value;

        __node.removeEventListener(key,CV);
        __node.style[key] = __oldValue;
        done();
      });
    }
    
    function defaultPrevented(key,keyProper,value,node)
    {
      it("A value should not be set if event.preventDefault is called",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value;
        
        function CV(e)
        {
          e.preventDefault();
          expect(e.defaultPrevented).to.equal(true);
        }
        
        __node.addEventListener(key,CV);
        __node.style[key] = __value;
        expect(__node.style[key]).to.equal(__oldValue);
        
        __node.removeEventListener(key,CV);
        __node.style[key] = __oldValue;
        done();
      });
    }
    
    function stopBubbledListeners(key,keyProper,value,node,sub_node)
    {
      it("Bubbled Parent listeners should not be called if event.stopPropogation is called",function(done){
        var __node = document.querySelector(node),
            __sub_node = document.querySelector(sub_node),
            __oldValue = __sub_node.style[key],
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stopPropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        __sub_node.addEventListener(key,CV);
        __node.addEventListener(key,__cb);
        __sub_node.style[key] = __value;
        expect(__cb.callCount).to.equal(0);
        
        __sub_node.removeEventListener(key,CV);
        __node.removeEventListener(key,__cb);
        __sub_node.style[key] = __oldValue;
        done();
      })
    }
    
    function stopImmediateListeners(key,keyProper,value,node)
    {
      it("After event.stopImmediatePropogation is called no other listeners should be fired",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stopImmediatePropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        __node.addEventListener(key,CV);
        __node.addEventListener(key,__cb);
        __node.style[key] = __value;
        expect(__cb.callCount).to.equal(0);
        
        __node.removeEventListener(key,CV);
        __node.removeEventListener(key,__cb);
        __node.style[key] = __oldValue;
        done();
      });
    }
    
    function stopUpdateListeners(key,keyProper,value,node)
    {
      it("After event.stop is called update listeners should not be fired",function(done){
        var __node = document.querySelector(node),
            __oldValue = __node.style[key],
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stop();
          expect(e.stopped).to.equal(true);
        }
        
        __node.addEventListener(key,CV);
        __node.addEventListener(key+'update',__cb);
        __node.style[key] = __value;
        expect(__cb.callCount).to.equal(0);
        
        __node.removeEventListener(key,CV);
        __node.removeEventListener(key+'update',__cb);
        __node.style[key] = __oldValue;
        done();
      });
    }
    
    function bubbleFromNewElements(key,keyProper,value,node)
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
        __sub_node.style[key] = __value;
        expect(__cb.callCount).to.equal(1);
        
        __node.insertBefore(__sub_node2,__sub_node);
        __sub_node2.style[key] = __value;
        expect(__cb.callCount).to.equal(2);
        
        __node.removeEventListener(key,__cb);
        __node.innerHTML = __oldValue;
        done();
      });
    }
    
    function cssTextUpdate(key,keyProper,value,node)
    {
      it("Style listeners should fire when cssText is updated",function(done){
          var __node = document.querySelector(node),
              __oldValue = __node.style[key],
              __value = value,
              __cb = spy();

              __node.addEventListener(key,__cb);
              __node.style.cssText = keyProper+":"+__value+";";
              expect(__cb.callCount).to.equal(1);

              __node.removeEventListener(key,__cb);
              __node.style.cssText = keyProper+":"+__oldValue+";";
              done();
      });
    }
    
    function styleAttrUpdate(key,keyProper,value,node)
    {
      it("Style listeners should fire when the style attribute on an element is updated",function(done){
          var __node = document.querySelector(node),
              __oldValue = __node.style[key],
              __value = value,
              __cb = spy();

              __node.addEventListener(key,__cb);
              __node.setAttribute('style',keyProper+":"+__value+";");
              expect(__cb.callCount).to.equal(1);

              __node.removeEventListener(key,__cb);
              __node.setAttribute('style',keyProper+":"+__oldValue+";");
              done();
      });
    }
    
    function setPropertyUpdate(key,keyProper,value,node)
    {
      it("Style listeners should fire when setProperty or removeProperty methods are used",function(done){
          var __node = document.querySelector(node),
              __oldValue = __node.style[key],
              __value = value,
              __cb = spy();

              __node.addEventListener(key,__cb);
              __node.style.setProperty(keyProper,__value);
              __node.style.removeProperty(keyProper);
              expect(__cb.callCount).to.equal(2);

              __node.removeEventListener(key,__cb);
              __node.style.setProperty(keyProper,__oldValue);
              done();
      });
    }
    
    /* ENDREGION */
    
    describe("STANDARD DOM STYLES:",function(){
      runCategory("color","color","rgb(0, 0, 0)",'#test_element','#test_element__sub');
      runCategory("backgroundColor","background-color","rgb(240, 15, 0)",'#test_element','#test_element__sub');
      runCategory("margin","margin","0px 0px 5px",'#test_element','#test_element__sub');
      runCategory("fontSize","font-size","28px",'#test_element','#test_element__sub');
      runCategory("fontWeight","font-weight","500",'#test_element','#test_element__sub');
    });
    
    /* browser specific 
      -webkit-  Chrome all / Safari all
      -moz-     Firefox all
      -ms-      IE all */
    
    describe("BROWSER DOM STYLES:",function(){
      runCategory("webkitPaddingStart","-webkit-padding-start","0px",'#test_element','#test_element__sub');
      runCategory("mozPaddingStart","-moz-padding-start","0px",'#test_element','#test_element__sub');
      runCategory("msPaddingStart","-ms-padding-start","0px",'#test_element','#test_element__sub');
      
      runCategory("webkitUserSelect","-webkit-user-select","text",'#test_element','#test_element__sub');
      runCategory("mozUserSelect","-moz-user-select","text",'#test_element','#test_element__sub');
      runCategory("msUserSelect","-ms-user-select","text",'#test_element','#test_element__sub');
    });
    
  }
}());