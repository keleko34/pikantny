/* 
  Need to handle:
  - standard props v/
  - dispatch event = local path events v/
  - event propogation v/
  - styles v/
  - attributes v/
  - globalized events - window? v/
  - inputs setting values v/
  - all text based operations fire one 'text|html' v/
  - if prop doesn't exist create it on listener (default observable)
  - add/remove observables (default/function)
  
  - rewrite to be dom extension hate friendly, do it for the haters
  
  Major
  * __pikantny__prevalue__
  * __pikantny__precheck__
  * __pikantny__styleList__
  * __pikantny__KeyList__
  * events
  
  Event
  * stop
  * stoppedPropogation
  * stoppedImmediatePropogation
  * __stopped__
  
  *** issues with styles resetting the descriptor, need to figure out
  
  *** addEventListenerupdate fires itself, need to circumvent
*/

"use strict";

window.pikantny = (function(){
  
  /* The entire node list starting from eventTarget down the chain, the prototypal enheritance starts with EventTarget > Node > Element > HTMLElement > all */
  var __HTMLList__ = [
       "HTMLVideoElement", "HTMLUnknownElement", "HTMLUListElement", "HTMLTrackElement", "HTMLTitleElement", "HTMLTextAreaElement", "HTMLTemplateElement", "HTMLTableSectionElement", "HTMLTableRowElement", "HTMLTableElement", "HTMLTableColElement", "HTMLTableCellElement", "HTMLTableCaptionElement", "HTMLStyleElement", "HTMLSpanElement", "HTMLSourceElement", "HTMLSlotElement", "HTMLShadowElement", "HTMLSelectElement", "HTMLScriptElement", "HTMLQuoteElement", "HTMLProgressElement", "HTMLPreElement", "HTMLPictureElement", "HTMLParamElement", "HTMLParagraphElement", "HTMLOutputElement", "HTMLOptionElement", "HTMLOptGroupElement", "HTMLObjectElement", "HTMLOListElement", "HTMLModElement", "HTMLMeterElement", "HTMLMetaElement", "HTMLMenuElement", "HTMLMediaElement", "HTMLMarqueeElement", "HTMLMapElement", "HTMLLinkElement", "HTMLLegendElement", "HTMLLabelElement", "HTMLLIElement", "HTMLInputElement", "HTMLImageElement", "HTMLIFrameElement", "HTMLHeadingElement", "HTMLHeadElement", "HTMLHRElement", "HTMLFrameSetElement", "HTMLFrameElement", "HTMLFormElement", "HTMLFontElement", "HTMLFieldSetElement", "HTMLEmbedElement", "HTMLDivElement", "HTMLDirectoryElement", "HTMLDialogElement", "HTMLDetailsElement", "HTMLDataListElement", "HTMLDListElement", "HTMLCanvasElement", "HTMLButtonElement", "HTMLBaseElement", "HTMLBRElement", "HTMLAudioElement", "HTMLAreaElement", "HTMLAnchorElement"
      ],
      
      __GlobalList__ = ["EventTarget","Node","Element","HTMLElement"].concat(__HTMLList__),
      
      __blocked__ = ['dispatchEvent','Symbol','constructor','__proto__','stop','length','setAttribute','removeAttribute'],
      
      /* helps with easier style listening changes as .style is an object created afterwards and acts differently than your standard */
      __CSSInlineList = Object.getOwnPropertyNames(document.body.style),
      
      /* would like to watch for real css rule changes, needs more research especially with link cross domain href styles */
      __CSSList__ = Array.prototype.slice.call(getComputedStyle(document.body)),
      
      /* all of these effect the text associated with an element */
      __TextPropertyList__ = ['textContent','innerHTML','innerText','outerHTML','outerText','appendChild','removeChild','replaceChild','insertAdjacentHTML','insertBefore'],
      
      /* allowing us to see the original events */
      __EventList__ = Object.keys(HTMLElement.prototype).filter(function(v){return (v.indexOf('on') === 0);}),
      
      /* allows listening for all changes no matter what it is */
      __all__ = '*';
  
  /* Backup descriptors */
  var __addEventListener = EventTarget.prototype.addEventListener,
      __removeEventListener = EventTarget.prototype.removeEventListener,
      __setAttribute = Element.prototype.setAttribute,
      __removeAttribute = Element.prototype.removeAttribute,
      __setProperty = CSSStyleDeclaration.prototype.setProperty,
      __removeProperty = CSSStyleDeclaration.prototype.removeProperty,
      __valueSelectDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value'),
      __valueInputDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value'),
      __checkedInputDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'checked');
  
  
  /* Helper method to loop through listeners and run them */
  function loopListener(looper,e)
  {
    var _looper = looper,
        _len = looper.length,
        _e = e,
        _x;
    for(_x=0;_x<_len;_x++)
    {
      looper[_x](_e);
      if(_e.__stopImmediatePropogation__ !== undefined) break;
    }
  }
  
  /* Helper method to loop through all bubbled listeners and run them */
  function loopBubbledListener(looper,e)
  {
    if(e.__stopPropogation__ !== undefined) return;
    
    var _looper = looper,
        _len = looper.length,
        _e = e,
        _x;
    
    for(_x=0;_x<_len;_x++)
    {
      _e.target = looper[_x].parent;
      looper[_x].func(_e);
      if(_e.__stopPropogation__ !== undefined) break;
    }
  }
  
  /* Helper method to loop through all listeners and return if a method exists */
  function loopListenerCheck(looper,func)
  {
    var _looper = looper,
        _len = looper.length,
        _func = func,
        _x;
    for(_x=0;_x<_len;x++)
    {
      if(_looper[x].toString() === _func.toString()) return true;
    }
    return false;
  }
  
  /* The event object that gets passed to each listener */
  function changeEvent(v)
  {
    this.stopPropagation = function(){this.__stopPropogation__ = !this.bubbles = false;};
    this.stopImmediatePropagation = function(){this.__stopImmediatePropogation__ = this.__stopPropogation__ = !this.bubbles = false;};
    this.preventDefault = function(){this.__preventDefault__ = this.defaultPrevented = true;};
    this.stop = function(){this.target.__pikantnyExtensions__.stop = this.__stopped__ = true;}
    this.cancelable = (v.cancelable || true);
    this.defaultPrevented = false;
    this.bubbles = (v.bubbles || true);
    this.value = v.value;
    this.oldValue = v.oldValue;
    this.target = v.target;
    this.attr = v.attr;
    this.arguments = v.arguments;
    this.action = v.action;
    this.srcElement = v.srcElement;
    this.type = (v.type === 'update' ? v.attr+v.type : v.attr);
    this.view = window;
    
    if(v.stop) this.__stopped__ = true;
  }

  /* This holds all listeners associated with a particular element */
  function _localBinders()
  {
    this.attrListeners = {};
    this.attrUpdateListeners = {};
    this.styleListeners = {};
    this.styleUpdateListeners = {};
    this.parentStyleListeners = {};
    this.parentStyleUpdateListeners = {};
    this.parentAttrListeners = {};
    this.parentAttrUpdateListeners = {};
    this.injectedStyle = {};
    this.events = {};
  }
  
  function _attachLocalBinders(el)
  {
    if(typeof el.__pikantnyExtensions__ === 'undefined') Object.defineProperty(el,'__pikantnyExtensions__',descriptorHidden(new _localBinders()));
    return el.__pikantnyExtensions__;
  }
  
  /* SECTION DESCRIPTOR STANDARD/VALUE/FUNCTION */ 
  function _updateStandard(el, prop, val, oldValue, args, action)
  {
    var e = new changeEvent({
        value: val,
        oldValue: oldValue,
        attr: prop,
        type: 'update',
        target: el,
        srcElement: el,
        arguments: args,
        action: action
    });
    
    if(el.__pikantnyExtensions__ !== undefined)
    {
      var localAttrListeners = el.__pikantnyExtensions__.attrUpdateListeners,
          localParentAttrListeners = el.__pikantnyExtensions__.parentAttrUpdateListeners;
      
      if(localAttrListeners[prop] !== undefined)
      {
        loopListener(localAttrListeners[prop],e);
      }
      
      if(e.__stopImmediatePropogation__ === undefined && localAttrListeners[__all__+'update'] !== undefined)
      {
        loopListener(localAttrListeners[__all__+'update'],e);
      }
      
      if(e.__stopPropogation__ === undefined && localParentAttrListeners[prop] !== undefined)
      {
        loopBubbledListener(localParentAttrListeners[prop],e);
      }
      
      if(e.__stopPropogation__ === undefined && localParentAttrListeners[__all__+'update'] !== undefined)
      {
        loopBubbledListener(localParentAttrListeners[__all__+'update'],e);
      }
    }
    
    if(e.__preventDefault__ !== undefined) return false;
    return true;
  }
  
  function _setStandard(el, prop, val, oldValue, stop, args, action)
  {
    var e = new changeEvent({
        value: val,
        oldValue: oldValue,
        attr: prop,
        type: 'set',
        target: el,
        srcElement: el,
        stop: stop,
        arguments: args,
        action: action
    });
    
    if(el.__pikantnyExtensions__ !== undefined)
    {
      var localAttrListeners = el.__pikantnyExtensions__.attrListeners,
          localParentAttrListeners = el.__pikantnyExtensions__.parentAttrListeners;
      
      if(localAttrListeners[prop] !== undefined)
      {
        loopListener(localAttrListeners[prop],e);
      }
      
      if(e.__stopImmediatePropogation__ === undefined && localAttrListeners[__all__] !== undefined)
      {
        loopListener(localAttrListeners[__all__],e);
      }
      
      if(e.__stopPropogation__ === undefined && localParentAttrListeners[prop] !== undefined)
      {
        loopBubbledListener(localParentAttrListeners[prop],e);
      }
      
      if(e.__stopPropogation__ === undefined && localParentAttrListeners[__all__] !== undefined)
      {
        loopBubbledListener(localParentAttrListeners[__all__],e);
      }
    }
    
    if(e.__preventDefault__ !== undefined) return false;
    return true;
  }
  
  /* for all standard prototypes */
  function descriptorStandard(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __update = _updateStandard,
        __set = _setStandard,
        __extensions = {},
        __oldValue;
    
    function set(v)
    {
      _attachLocalBinders(this);
      __oldValue = __descGet.call(this);
      __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
      if(__set(this,__key,v,__oldValue,__extensions.stop))
      {
        __descSet.call(this,v);
        if(!__extensions.stop) __update(this,__key,v,__oldValue);
      }
      __extensions.stop = undefined;
    }
    
    return {
      get:descriptor.get,
      set:set,
      enumerable:descriptor.enumerable,
      configurable:true
    }
  }
  
  /* for value based prototypes */
  function descriptorValue(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __update = _updateStandard,
        __set = _setStandard,
        __extensions = {},
        __writable = descriptor.writable,
        __oldValue;
    
    function get()
    {
      return __descriptor.value;
    }
    
    function set(v)
    {
      if(__writable)
      {
        __oldValue = __descriptor.value;
        __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
        if(__set(this,__key,v,__oldValue,__extensions.stop))
        {
          __descriptor.value = v;
          if(!__extensions.stop) __update(this,__key,v,__oldValue);
        } 
      }
      __extensions.stop = undefined;
    }
    
    return {
      get:get,
      set:set,
      enumerable:descriptor.enumerable,
      configurable:true
    }
  }
  
  /* for function based prototypes */
  function descriptorFunction(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descVal = descriptor.value,
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = {},
        __action;
    
    function set()
    {
      __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
      if(__set(this,__key,undefined,undefined,__extensions.stop,arguments))
      {
        __action = __descVal.apply(this,arguments);
        if(__key === 'addEventListener' && arguments[0] === 'addEventListenerupdate') __extensions.stop = true;
        if(!__extensions.stop) __update(this,__key,v,__oldValue,arguments,__action);
      }
      __extensions.stop = undefined;
    }
    
    return {
      value:set,
      writable:descriptor.writable,
      enumerable:descriptor.enumerable,
      configurable:true
    }
  }
  
  /* hidden properties */
  function descriptorHidden(value)
  {
    return {
      value:value,
      writable:true,
      enumerable:false,
      configurable:true
    }
  }
  
  /* controls keeping track of all events on an element, events are viewable via pikantny.events(element) */
  function listenerEventIntersect(el,key,value,remove,oldValue)
  {
    var __extensions = (el.__pikantnyExtensions__ || _attachLocalBinders(el)),
        __events = __extensions.events;
        
    if(typeof __events[key] === 'undefined') __events[key] = [];
    
    if(oldValue && __events[key].indexOf(oldValue) !== -1 || !!remove) __events[key].splice(__events[key].indexOf((oldValue || value)),1);
    
    if(!remove) __events[key].push(value);
  }
  
  function _updateEvent(el,prop,val,oldValue)
  {
    listenerEventIntersect(el,prop,val,false,oldValue);
    
    return _updateStandard(el,prop,val,oldValue);
  }
  
  /* applied for inline `onclick`, `onkeyup`, etc. like properties */
  function descriptorEvent(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __update = _updateEvent,
        __set = _setStandard,
        __extensions = {},
        __oldValue;
    
    function set(v)
    {
      __oldValue = __descGet.call(this);
      __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
      if(__set(this,__key,v,__oldValue,__extensions.stop))
      {
        __descSet.call(this,v);
        if(!__extensions.stop) __update(this,__key,v,__oldValue);
      }
      __extensions.stop = undefined;
    }
    
    return {
      get:descriptor.get,
      set:set,
      enumerable:true,
      configurable:true
    };
  }
  
  /* applied for if attributes are set via the: element.attributes NamedNodeMap */
  function descriptorAttribute(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __set = _setStandard,
        __update = _updateStandard,
        __element = {},
        __environment = {},
        __oldValue;
    
    function set(v)
    {
      if(this.nodeType === 2)
      {
        __oldValue = __descGet.call(this);
        __element = this.ownerElement;
        __key = this.nodeName;
        __environment = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element));
        
        if(__set(__element,__key,v,__oldValue,__extensions.stop))
        {
          if(__key === 'style') /* handle style changes, if rejected discontinue this, else continue */
          
          __descSet.call(this,v);
          if(!__extensions.stop) 
          {
            __update(__element,__key,v,__oldValue);
            if(__key === 'style') /* handle style update changes, if rejected discontinue this, else continue */
          }
        }
        __environment.stop = undefined;
      }
      else
      {
        return return __descSet.call(this,v);
      }
    }
    
    return {
      get:descriptor.get,
      set:set,
      enumerable:descriptor.enumerable,
      configurable:true
    };
  }
  
  
  /* for when setAttribute method is ran to apply to standard listeners as well and not just `setAttribute` method listeners */
  function descriptorSetAttribute(key,value)
  {
    var __oldValue = (this.attributes.getNamedItem(key) ? this.attributes.getNamedItem(key).value : undefined),
        __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this)),
        __action;
    
    if(_setStandard(this,'setAttribute',undefined,undefined,__extensions.stop,arguments))
    {
       if(key === 'style') /* handle style changes, if rejected discontinue this, else continue */
       
       if(_setStandard(this,key,value,__oldValue,__extensions.stop))
       {
         __action = __setAttribute.call(this,key,value);
         if(!__extensions.stop)
         {
           _updateStandard(this,'setAttribute',undefined,undefined,__extensions.stop,arguments,__action);
           if(key === 'style') /* handle style update changes, if rejected discontinue this, else continue */
           _updateStandard(this,'setAttribute',undefined,undefined,__extensions.stop,arguments,__action);
         }
       }
    }
    __extensions.stop = undefined;
    return undefined;
  }
  
  /******* left off here ********/
    
  function descriptorRemoveAttribute(key)
  {
    var __element = this,
        __event = init.event(key),
        __oldValue = this.attributes.getNamedItem(key).value,
        __action = null;
    __event.arguments = arguments;
    __event.stopped = (this.__stopped__ || false);
    __event.oldValue = __oldValue;
    __event.value = undefined;
    __event.stop = function(){__event.stopped = __element.__stopped__ = true;};
      
    if(this.dispatchEvent(__event))
    {
      __action = __removeAttribute.call(this,key);
      if(!this.__stopped__)
      {
        var __event_update = init.event(key,true);
        __event_update.arguments = arguments;
        __event_update.action = __action;
        __event_update.oldValue = __oldValue;
        __event_update.value = undefined;
        this.dispatchEvent(__event_update);
      }
    }
    
    return __action;
  }
  
  function descriptorAddEventListener(key,func)
  {
    var _key = processEvent.apply(this,arguments);
    if(this.events === undefined) this.events = {};
    if(this.events[_key] === undefined) this.events[_key] = [];
    if(this.events[_key].indexOf(func) === -1) this.events[_key].push(func);
    return __addEventListener.call(this,_key,func);
  }
  
  function descriptorRemoveEventListener(key,func)
  {
    var _key = processEventRemoval.apply(this,arguments);
    if(this.events === undefined) this.events = {};
    if(this.events[_key] === undefined) this.events[_key] = [];
    this.events[_key].splice(this.events[_key].indexOf(func),1);
    if(this.events[_key].length === 0) this.events[_key] = undefined;
    return __removeEventListener.call(this,_key,func);
  }
  
  function getInlineKey(key)
  {
    var _key = key.replace(/\-(.)/,function(dash,char){return char.toUpperCase();});
    if(_key.indexOf('-webkit') === 0) _key = _key.replace('-webkit','webkit');
    if(_key.indexOf('-moz') === 0) _key = _key.replace('-moz','moz');
    if(_key.indexOf('-ms') === 0) _key = _key.replace('-ms','ms');
    
    return _key;
  }
  
  function getStyleKey(key)
  {
    var _key = key.replace(/([A-Z])/g, "-$1");
    if(_key.indexOf('webkit') === 0) _key = _key.replace('webkit','-webkit');
    if(_key.indexOf('moz') === 0) _key = _key.replace('moz','-moz');
    if(_key.indexOf('ms') === 0) _key = _key.replace('ms','-ms');
    
    return _key.toLowerCase();
  }
  
  function descriptorInlineStyle(descriptor,element,key,keyProper)
  {
    var __descriptor = descriptor,
        __writable = descriptor.writable,
        __key = key,
        __keyProper = keyProper,
        __element = element,
        __oldValue = descriptor.value,
        __value = descriptor.value;
    
    function __get()
    {
      return __value;
    }
    
    function __set(v)
    {
      if(__writable)
      {
        var __event = init.event(__key);
        __event.oldValue = __oldValue = __value;
        __event.stopped = (__element.__stopped__ || false);
        __event.value = v;
        __event.stop = function(){__event.stopped = __element.__stopped__ = true;};
        
        if(__element.dispatchEvent(__event))
        {
          if(typeof v === 'string' && v.length === 0)
          {
            __removeProperty.call(this,__keyProper);
          }
          else
          {
            __value = v;
            __setProperty.call(this,__keyProper,v);
          }

          if(!__element.__stopped__)
          {
            var __event_update = init.event(__key,true);
            __event_update.oldValue = __oldValue;
            __event_update.value = v;
            
            __element.dispatchEvent(__event_update);
          }
        }
        __element.__stopped__ = undefined;
      }
    }
    
    return {
      get:__get,
      set:__set,
      enumerable:__descriptor.enumerable,
      configurable:true
    }
  }
  
  function descriptorCSSText(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descGet = __descriptor.get,
        __descSet = __descriptor.set,
        __oldValue;
    
    function __set(v)
    {
      __oldValue = __descGet.call(this);
      
      var __cssRules = getCSSTextChanges(__oldValue,v);
      for(var x=0,keys=Object.keys(__cssRules),len=keys.length,key;x<len;x++)
      {
        key = keys[x];
        this.style[key] = __cssRules[key];
      }
    }
    
    return {
      get:__descGet,
      set:__set,
      enumerable:__descriptor.enumerable,
      configurable:true
    };
  }
  
  function descriptorCSSSetProperty(key, value, priority)
  {
    var __inlineKey = getInlineKey(key);
    this[__inlineKey] = value + (priority ? '!'+priority : '');
    return undefined;
  }
  
  function descriptorCSSRemoveProperty(key)
  {
    var __inlineKey = getInlineKey(key);
    this[__inlineKey] = '';
    return undefined;
  }
  
  function getCSSTextChanges(oldValue,value)
  {
    var __cssRules = value.split(';').reduce(function(style,v,x){
          var split = v.split(':'),
          prop = getInlineKey(split[0]),
          value = split[1]; 
          style[prop] = value;
          
          return style;
        },{});
    
    for(var x=0,oldSplit=oldValue.split(';'),len=oldSplit.length,split,prop,value;x<len;x++)
    {
      split = oldSplit[x].split(':');
      prop = getInlineKey(split[0]);
      if(__cssRules[prop] === undefined) __cssRules[prop] = '';
    }
    
    return __cssRules;
  }
  
  /* must be done this way due to keyCodes not being cross platoform, may be looked into later */
  function runInputEvents(e)
  {
    if(e.defaultPrevented) return false;
    
    var __target = e.target,
        __isRadio = (['checkbox','radio'].indexOf(__target.type) !== -1),
        __oldValue = __target.__prevalue__,
        __oldChecked = __target.__prechecked__,
        __checked = __target.checked,
        __value = (__target.value);

    var __event_value = init.event('value');
        __event_value.oldValue = __oldValue;
        __event_value.stopped = (__target.__stopped__ || false);
        __event_value.value = __value;
        __event_value.stop = function(){__event_value.stopped = __target.__stopped__ = true;};

    if(__target.dispatchEvent(__event_value))
    {
      if(__isRadio)
      {
        var __event_checked = init.event('checked');
            __event_checked.oldValue = __oldChecked;
            __event_checked.stopped = (__target.__stopped__ || false);
            __event_checked.value = __checked;
            __event_checked.stop = function(){__event_checked.stopped = __target.__stopped__ = true;};
          
        if(__target.dispatchEvent(__event_checked))
        {
            if(!__target.__stopped__)
            {
                var __event_value_update = init.event('value',true);
                    __event_value_update.oldValue = __target.__prevalue__;
                    __event_value_update.value = __target.value;
                    __target.dispatchEvent(__event_value_update);

                var __event_checked_update = init.event('checked',true);
                    __event_checked_update.oldValue = __target.__prevalue__;
                    __event_checked_update.value = __target.checked;
                    __target.dispatchEvent(__event_checked_update);
            }
        }
        else
        {
          __checkedInputDescriptor.set(__oldChecked);
          __target.__stopped__ = undefined;
          return false;
        }
      }
      else
      {
          if(!__target.__stopped__)
          {
            var __event_value_update = init.event('value',true);
                __event_value_update.oldValue = __target.__prevalue__;
                __event_value_update.value = __target.value;
                __target.dispatchEvent(__event_value_update);
          }
      }
    }
    else
    {
      if(__isRadio) 
      {
        __checkedInputDescriptor.set.call(__target,__oldChecked);
      }
      else
      {
        __valueInputDescriptor.set.call(__target,__oldValue);
      }
      __target.__stopped__ = undefined;
      return false;
    }
    __target.__stopped__ = undefined;
    return true;
  }
  
  function inputListener(e)
  { 
    /* if we are holding the key we should act like a keyup event happened */
    if(this.isPressed)
    {
      if(!runInputEvents.call(this,e))
      {
        e.preventDefault();
        return false;
      }
    }
    this.isPressed = true;
    
    if(['checked','radio'].indexOf(this.type) === -1)
    {
      this.__pikantny__prevalue__ = this.value;
      /* value gets set prior to this running so we can prevent it without user seeing the value, checked requires click event to do the same */
      setTimeout(function(){
        runInputEvents.call(e.target,e);
      },0);
    }
    else
    {
      this.__pikantny__prevalue__ = this.value;
      this.__pikantny__prechecked__ = this.checked;
    }
  }
  
  function inputUpListener(e)
  {
    if(['checked','radio'].indexOf(this.type) !== -1)
    {
      runInputEvents.call(this,e);
    }
    this.isPressed = false;
  }
  
  function selectListener(e)
  {
    var __target = e.target,
        __oldValue = __target.__prevalue__,
        __oldIndex = __target.__preindex__,
        __value = __target.value;
    
    var __event_value = init.event('value');
        __event_value.oldValue = __target.__prevalue__;
        __event_value.stopped = (__target.__stopped__ || false);
        __event_value.value = __target.value;
        __event_value.stop = function(){__event_value.stopped = __target.__stopped__ = true;};
    
    var __event_index = init.event('selectedIndex');
        __event_index.oldValue = __target.__preindex__;
        __event_index.stopped = (__target.__stopped__ || false);
        __event_index.value = __target.selectedIndex;
        __event_index.stop = function(){__event_index.stopped = __target.__stopped__ = true;};
    
    if(__target.dispatchEvent(__event_value) && __target.dispatchEvent(__event_index))
    {
      if(!__target.__stopped__)
      {
        var __event_value_update = init.event('value',true);
        __event_value_update.oldValue = __oldValue;
        __event_value_update.value = __target.value;
    
        var __event_index_update = init.event('selectedIndex',true);
        __event_index_update.oldValue = __oldIndex;
        __event_index_update.value = __target.selectedIndex;
        
        __target.dispatchEvent(__event_value_update);
        __target.dispatchEvent(__event_index_update);
      }
    }
    else
    {
      __valueSelectDescriptor.set.call(__target,__oldValue);
      __target.__stopped__ = undefined;
      return false;
    }
    return true;
  }
  
  function selectFocusListener(e)
  {
    this.__pikantny__prevalue__ = this.value;
    this.__pikantny__prevalue__ = this.selectedIndex;
  }
  
  function applyTextChanges()
  {
    if(this.__pikantny__prevalue__ === undefined)
    {
      if(this.isPressed === undefined) this.isPressed = false;
      
      /* need to support html5 input types */
      
      if(['checkbox','radio'].indexOf(this.type) !== -1)
      {
        this.addEventListener('mousedown',inputListener,false);
        this.addEventListener('click',inputUpListener,false);
        Object.defineProperty(this,'__pikantny__prevalue__',descriptorHidden(this.value));
        Object.defineProperty(this,'__pikantny__prechecked__',descriptorHidden(this.checked.toString()));
      }
      else
      {
        this.addEventListener('keydown',inputListener,false);
        this.addEventListener('keyup',inputUpListener,false);
        Object.defineProperty(this,'__prevalue__',descriptorHidden(this.value));
      }
    }
  }
  
  function applySelectChanges()
  {
    if(this.__pikantny__prevalue__ === undefined)
    {
      this.addEventListener('focus',selectFocusListener);
      this.addEventListener('change',selectListener);
      Object.defineProperty(this,'__pikantny__prevalue__',descriptorHidden(this.value));
      Object.defineProperty(this,'__pikantny__prevalue__',descriptorHidden(this.selectedIndex));
    }
  }
  
  function processStyleEvent(key,keyProper)
  {
    if(this.__pikantny__styleList__ === undefined) Object.defineProperty(this,'__pikantny__styleList__',descriptorHidden([]));
    if(this.__pikantny__styleList__.indexOf(key) === -1)
    {
        Object.defineProperty(this.style,key,descriptorInlineStyle(Object.getOwnPropertyDescriptor(this.style,key),this,key,keyProper));
        this.__pikantny__styleList__.push(key);
        
        /* this allows for bubbling to take effect */
        var __children = this.querySelectorAll('*');
        for(var x=0,len=__children.length,child;x<len;x++)
        {
          child = __children[x];
          if(child.__pikantny__styleList__ === undefined) Object.defineProperty(child,'__pikantny__styleList__',descriptorHidden([]));
          if(child.__pikantny__styleList__.indexOf(key) === -1)
          {
            Object.defineProperty(child.style,key,descriptorInlineStyle(Object.getOwnPropertyDescriptor(child.style,key),child,key,keyProper));
            child.__pikantny__styleList__.push(key);
          }
        } 
    }
  }
  
  function processEvent(key,func)
  {
    /* handle inline css change listeners, attribute, and cssText, setProperty */
    var __cssKey = getStyleKey(key),
        __cssInlineKey = getInlineKey(key);
    
    if(__CSSInlineList.indexOf(__cssInlineKey) !== -1)
    {
      processStyleEvent.call(this,__cssInlineKey,__cssKey);
      
      return __cssInlineKey;
    }
    
    /* handle complicated `value` and `checked` and `selectedIndex` change listeners */
    if(['checked','value','selectedIndex'].indexOf(key) !== -1)
    {
      /* if its an input and we are looking for checked, values, and selectedIndex, easy listener addons */
      if(['input','textarea'].indexOf(this.nodeName.toLowerCase()) !== -1)
      {
        applyTextChanges.call(this);
      }
      else if(['select'].indexOf(this.nodeName.toLowerCase()) !== -1)
      {
        applySelectChanges.call(this);
      }
      else if(this.childNodes.length !== 0)
      {
        var __inputs = this.querySelectorAll('input'),
            __textareas = this.querySelectorAll('textarea'),
            __select = this.querySelectorAll('select');
        
        function loop(els,isSelect)
        {
          for(var x=0,len=els.length;x<len;x++)
          {
            if(isSelect)
            {
              applySelectChanges.call(els[x]);
            }
            else
            {
              applyTextChanges.call(els[x]);
            }
          }
        }
        
        /* loop all */
        if(key === 'value')
        {
          loop(__inputs);
          loop(__textareas);
          loop(__select,true);
        }
        /* loop only inputs */
        else if(key === 'checked')
        {
          loop(__inputs);
        }
        /* loop only select */
        else
        {
          loop(__select,true);
        }
      }
    }
    
    return key;
  }
  
  function processEventRemoval(key,func)
  {
    if(['checked','value'].indexOf(key) !== -1)
    {
      /* run up the tree checking for events */
      var __isRemovable = true,
          __parent = this.parentElement;
      while(__parent !== document.documentElement && __isRemovable)
      {
        __isRemovable = !(__parent.events['value'] !== undefined && __parent.events['value'].length !== 0);
        __parent = __parent.parentElement;
      }
      
      if(__isRemovable)
      {
        if(['input','textarea'].indexOf(this.nodeName.toLowerCase()) !== -1)
        {
          if(['checkbox','radio'].indexOf(this.type) !== -1)
          {
            __parent = this.parentElement;
            while(__parent !== document.documentElement && __isRemovable)
            {
              __isRemovable = !(__parent.events['checked'] !== undefined && __parent.events['checked'].length !== 0);
              __parent = __parent.parentElement;
            }
            
            if(__isRemovable)
            {
              this.removeEventListener('mousedown',inputListener);
              this.removeEventListener('click',inputUpListener);
            }
          }
          else
          {
            this.removeEventListener('keydown',inputListener);
            this.removeEventListener('keyup',inputUpListener);
          }
        }
        else if(['select'].indexOf(this.nodeName.toLowerCase()) !== -1)
        {
          this.removeEventListener('focus',selectFocusListener);
          this.removeEventListener('change',selectListener);
        }
        /* need to check if any listeners exist in the  lower tree... oh boy... */
        else
        {
          var __inputs = this.querySelectorAll('input'),
              __textareas = this.querySelectorAll('textarea'),
              __select = this.querySelectorAll('select'),
              __element = this;
          
          function loop(els,type,isSelect)
          {
            for(var x=0,len=els.length,parent,isRemovable = true,isRadio;x<len;x++)
            {
              parent = els[x];
              isRadio = (['checkbox','radio'].indexOf(els[x].type) !== -1);
              while(parent !== __element && isRemovable)
              {
                isRemovable = !(parent.events[type] !== undefined && parent.events[type].length !== 0);
                if(isRadio) isRemovable = !(parent.events[(type === 'value' ? 'checked' : 'value')] !== undefined && parent.events[(type === 'value' ? 'checked' : 'value')].length !== 0);
                if(isSelect) isRemovable = !(parent.events[(type === 'value' ? 'selectedIndex' : 'value')] !== undefined && parent.events[(type === 'value' ? 'selectedIndex' : 'value')].length !== 0);
                parent = parent.parentElement;
              }
              if(isRemovable)
              {
                if(['input','textarea'].indexOf(els[x].nodeName.toLowerCase()) !== -1)
                {
                  if(isRadio)
                  {
                    els[x].removeEventListener('mousedown',inputListener);
                    els[x].removeEventListener('mouseup',inputUpListener);
                  }
                  else
                  {
                    els[x].removeEventListener('keydown',inputListener);
                    els[x].removeEventListener('keyup',inputUpListener);
                  }
                }
                else
                {
                  els[x].removeEventListener('focus',selectFocusListener);
                  els[x].removeEventListener('change',selectListener);
                }
              }
            }
          }
          
          /* loop all */
          if(key === 'value')
          {
            loop(__inputs,key);
            loop(__textareas,key);
            loop(__select,key);
          }
          /* loop only inputs */
          else if(key === 'checked')
          {
            loop(__inputs,key);
          }
          /* loop only select */
          else
          {
            loop(__select,key);
          }
        }
      }
    }
    return key;
  }
  
  function init(obj,local)
  {
    if(local === undefined) local = window;
    if(local.__pikantny__KeyList__ === undefined) Object.defineProperty(local,'__pikantny__KeyList__',descriptorHidden([]));
    for(var x=0,keys=Object.getOwnPropertyNames(obj),len=keys.length;x<len;x++) init.inject(obj,keys[x],local);
    
    return init;
  }

  init.inject = function(obj,key,local)
  {
    if(local.__pikantny__KeyList__.indexOf(key) !== -1 || __blocked__.indexOf(key) !== -1 || key.indexOf('__') === 0) return init;
    
    var __descriptor = Object.getOwnPropertyDescriptor(obj,key),
        __defined;
    if(__descriptor.configurable)
    {
      if(__descriptor.set !== undefined)
      {
        __defined = !!Object.defineProperty(obj,key,descriptorStandard(__descriptor,key));
      }
      else if(typeof __descriptor.value === 'function')
      {
        __defined = !!Object.defineProperty(obj,key,descriptorFunction(__descriptor,key));
      }
      else if(__descriptor.value !== undefined)
      {
        __defined = !!Object.defineProperty(obj,key,descriptorValue(__descriptor,key));
      }
      
      /* define but add 'remove/addEventListener' on set, keep list of events and reorder on add */
      if(__defined)
      {
          var _desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype,'on'+key),
              _descUpdate = Object.getOwnPropertyDescriptor(HTMLElement.prototype,'on'+key+'update')
        
          if(!_desc) Object.defineProperty(HTMLElement.prototype,'on'+key,descriptorEvent(key));
          if(!_descUpdate) Object.defineProperty(HTMLElement.prototype,'on'+key+'update',descriptorEvent(key,true));
      }
    }
    local.__pikantny__KeyList__.push(key);
    return init;
  }
  
  init.event = function(key,update)
  {
    return new Event(key+(!!update ? 'update' : ''),{bubbles: true,cancelable: true});
  }
  
  init.observables = function(local)
  {
    return (local || window).__pikantny__KeyList__.slice();
  }
  
  init.addEventListener = document.documentElement.addEventListener.bind(document.documentElement);
  init.removeEventListener = document.documentElement.removeEventListener.bind(document.documentElement);
  
  /* handle event recording */
  EventTarget.prototype.addEventListener = descriptorAddEventListener;
  EventTarget.prototype.removeEventListener = descriptorRemoveEventListener;
  
  /* handle ability to stop an update */
  if(Element.prototype.stop === undefined)
  {
      Element.prototype.stop = function(){ 
          this.__stopped__ = true; 
          return this;
      };
  }
    
  /* handle propagation */
  Event.prototype.stopImmediatePropagation = descriptorStopImmediatePropogation;
  Event.prototype.stoppedImmediatePropagation = false;
  
  Event.prototype.stopPropagation = descriptorStopPropogation;
  Event.prototype.stoppedPropagation = false;
  
  /* handle attribute setting */
  Element.prototype.setAttribute = descriptorSetAttribute;
  Element.prototype.removeAttribute = descriptorRemoveAttribute;
  
  Object.defineProperty(Node.prototype,'nodeValue',descriptorAttribute(Object.getOwnPropertyDescriptor(Node.prototype,'nodeValue'),'nodeValue'));
  Object.defineProperty(Node.prototype,'textContent',descriptorAttribute(Object.getOwnPropertyDescriptor(Node.prototype,'textContent'),'textContent'));
  
  /* some browsers don't support the value property */
  var __valDescriptor = Object.getOwnPropertyDescriptor(Attr.prototype,'value');
  if(__valDescriptor) Object.defineProperty(Attr.prototype,'value',descriptorAttribute(__valDescriptor,'value'));
  
  /* handle special css changes */
  CSSStyleDeclaration.prototype.setProperty = descriptorCSSSetProperty;
  CSSStyleDeclaration.prototype.removeProperty = descriptorCSSRemoveProperty;
  
  Object.defineProperty(CSSStyleDeclaration.prototype,'cssText',descriptorCSSText(Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,'cssText'),'cssText'));
  
  /* main loop for all dom prototypes */
  for(var x=0,len=__GlobalList__.length,proto;x<len;x++)
  {
    if(window[__GlobalList__[x]] !== undefined && window[__GlobalList__[x]].prototype !== undefined) init(window[__GlobalList__[x]].prototype,window);
  }
    
  if (typeof define === "function" && define.amd){
    define('pikantny',function(){return init;});
  }
  if(typeof module === 'object' && typeof module.exports === 'object'){
    module.exports.pikantny = init;
  }
  
  return init;
}());