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
  - if prop doesn't exist create it on listener (default observable, attribute?)
  - add/remove observables (default/function)
  
  - rewrite to be dom extension hate friendly, do it for the haters
  
  Major
  * __pikantnyExtensions__
  * __pikantnyKeyList__
  * events
  
  *** issues with styles resetting the descriptor,
      found chrome bug, ref: https://bugs.chromium.org/p/chromium/issues/detail?id=782776
  
  *** addEventListenerupdate fires itself, need to circumvent
*/

"use strict";

window.pikantny = (function(){
  
  /* The entire node list starting from eventTarget down the chain, the prototypal enheritance starts with EventTarget > Node > Element > HTMLElement > all */
  var __HTMLList__ = [
       "HTMLVideoElement", "HTMLUnknownElement", "HTMLUListElement", "HTMLTrackElement", "HTMLTitleElement", "HTMLTextAreaElement", "HTMLTemplateElement", "HTMLTableSectionElement", "HTMLTableRowElement", "HTMLTableElement", "HTMLTableColElement", "HTMLTableCellElement", "HTMLTableCaptionElement", "HTMLStyleElement", "HTMLSpanElement", "HTMLSourceElement", "HTMLSlotElement", "HTMLShadowElement", "HTMLSelectElement", "HTMLScriptElement", "HTMLQuoteElement", "HTMLProgressElement", "HTMLPreElement", "HTMLPictureElement", "HTMLParamElement", "HTMLParagraphElement", "HTMLOutputElement", "HTMLOptionElement", "HTMLOptGroupElement", "HTMLObjectElement", "HTMLOListElement", "HTMLModElement", "HTMLMeterElement", "HTMLMetaElement", "HTMLMenuElement", "HTMLMediaElement", "HTMLMarqueeElement", "HTMLMapElement", "HTMLLinkElement", "HTMLLegendElement", "HTMLLabelElement", "HTMLLIElement", "HTMLInputElement", "HTMLImageElement", "HTMLIFrameElement", "HTMLHeadingElement", "HTMLHeadElement", "HTMLHRElement", "HTMLFrameSetElement", "HTMLFrameElement", "HTMLFormElement", "HTMLFontElement", "HTMLFieldSetElement", "HTMLEmbedElement", "HTMLDivElement", "HTMLDirectoryElement", "HTMLDialogElement", "HTMLDetailsElement", "HTMLDataListElement", "HTMLDListElement", "HTMLCanvasElement", "HTMLButtonElement", "HTMLBaseElement", "HTMLBRElement", "HTMLAudioElement", "HTMLAreaElement", "HTMLAnchorElement"
      ],
      
      __GlobalList__ = ["EventTarget","Node","Element","HTMLElement"].concat(__HTMLList__),
      
      /* items that should not be injected as they disrupt key actions */
      __blocked__ = [
        'dispatchEvent','Symbol','constructor','__proto__','stop','length','setAttribute','removeAttribute', 'addEventListener','removeEventListener','setProperty','removeProperty','getPropertyValue'
      ],
      
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
  
  /* backup to allow complex listening actions */
  var __addEventListener = EventTarget.prototype.addEventListener,
      __removeEventListener = EventTarget.prototype.removeEventListener,
      
      /* backup so we can overwrite the original to listen to changes just as properties as well as track new attributes */
      __setAttribute = Element.prototype.setAttribute,
      __removeAttribute = Element.prototype.removeAttribute,
      
      /* track values for inputs */
      __valueSelectDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value'),
      __valueInputDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value'),
      __checkedInputDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'checked'),
      
      __querySelectorAll = Object.getOwnPropertyDescriptor(Element.prototype,'querySelectorAll').value;
  
  
  /* Helper method to loop through listeners and run them, node listeners */
  function loopListener(looper,e)
  {
    /* listeners array */
    var _looper = looper;
    for(var _x=0,_e=e,_len=looper.length;_x<_len;_x++)
    {
      /* loop and call listeners */
      looper[_x](_e);
      
      /* if stopImmediatePropogation method was called then we stop calling listeners on this node  */
      if(_e.__stopImmediatePropogation__ !== undefined) break;
    }
  }
  
  /* Helper method to loop through all bubbled listeners and run them parent nodes */
  function loopBubbledListener(looper,e)
  {
    /* if either stopImmediatePropogation or stopPropogation were called we don't run bubbled listeners */
    if(e.__stopPropogation__ !== undefined) return;
    
    /* bubbled listeners array */
    var _looper = looper;
    for(var _x=0,_e=e,_len=looper.length,loop;_x<_len;_x++)
    {
      loop = looper[_x];
      /* get the parent node for the event */
      _e.target = loop.parent;
      
      /* call bubbled parent node listeners */
      loop.func(_e);
      
      /* stop bubbling if stopImmediatePropogation or stopPropogation is called */
      if(_e.__stopPropogation__ !== undefined) break;
    }
  }
  
  /* Helper method to loop through all listeners and return if a method exists for removing it */
  function loopListenerCheck(looper,func)
  {
    /* listener array to check */
    var _looper = looper,
        _len = looper.length,
        _func = func,
        _x;
    
    for(_x=0;_x<_len;x++)
    {
      /* convert function to string and compare */
      if(_looper[x].toString() === _func.toString()) return true;
    }
    return false;
  }
  
  /* The event object that gets passed to each listener */
  function changeEvent(v)
  {
    /* stops bubbling of event */
    this.stopPropagation = function()
    {
      this.bubbles = false;
      this.__stopPropogation__ = !this.bubbles;
    };
    
    /* stops event */
    this.stopImmediatePropagation = function()
    {
      this.bubbles = false;
      this.__stopImmediatePropogation__ = this.__stopPropogation__ = !this.bubbles;
    };
    
    /* prevent the default action */
    this.preventDefault = function()
    {
      this.__preventDefault__ = this.defaultPrevented = true;
    };
    
    /* stop the update listeners from firing */
    this.stop = function()
    {
      this.target.__pikantnyExtensions__.stop = this.__stopped__ = true;
    }
    
    /* if the event can be cancelled (not implemented) */
    this.cancelable = (v.cancelable || true);
    
    /* if default was prevented (not implemented) */
    this.defaultPrevented = false;
    
    /* if the event can bubble */
    this.bubbles = (v.bubbles || true);
    
    /* the current value of the property */
    this.value = v.value;
    
    /* the old value of the property */
    this.oldValue = v.oldValue;
    
    /* the target node the event is being ran on */
    this.target = v.target;
    
    /* the name of the property */
    this.attr = v.attr;
    
    /* passed arguments if the property was a method */
    this.arguments = v.arguments;
    
    /* the returned result of running that method (update only) */
    this.action = v.action;
    
    /* the original element that fired the event */
    this.srcElement = v.srcElement;
    
    /* the name of the listener */
    this.type = (v.type === 'update' ? v.attr+v.type : v.attr);
    
    this.stopped = false;
    
    /* tells if the update listeners have been stopped or not */
    if(v.stop) this.__stopped__ = this.stopped = true;
  }

  /* This holds all listeners associated with a particular element */
  function _localBinders()
  {
    /* node's property listeners */
    this.attrListeners = {};
    
    /* node's property update listeners */
    this.attrUpdateListeners = {};
    
    /* any bubbled property listeners */
    this.parentAttrListeners = {};
    
    /* any bubbled property update listeners */
    this.parentAttrUpdateListeners = {};
    
    /* node's style listeners */
    this.styleListeners = {};
    
    /* node's style update listeners */
    this.styleUpdateListeners = {};
    
    /* any bubbled style listeners */
    this.parentStyleListeners = {};
    
    /* any bubbled style update listeners */
    this.parentStyleUpdateListeners = {};
    
    /* current injected style descriptors */
    this.injectedStyle = {};
    
    /* all events tied to the node */
    this.events = {};
    
    /* Extra logic properties */
    
    /* if the stop update listeners has been called */
    this.stop = undefined;
    
    /* if an inline style event has been called, tells setProperty not to run listeners as the style already did */
    this.inlinestyle = undefined;
    
    /* input listener helpers */
    this.preValue = '';
    this.descValue = undefined;
    this.preChecked = '';
    this.descChecked = undefined;
    this.isPressed = false;
  }
  
  /* checks if the element has the above extensions, if not it adds them */
  function _attachLocalBinders(el)
  {
    if(typeof el.__pikantnyExtensions__ === 'undefined') Object.defineProperty(el,'__pikantnyExtensions__',descriptorHidden(new _localBinders()));
    return el.__pikantnyExtensions__;
  }
  
  /* SECTION DESCRIPTOR STANDARD/VALUE/FUNCTION */
  
  /* runs the associated pre value set listeners */
  function _setStandard(el, prop, val, oldValue, extensions, stop, args, action)
  {
    /* create event */
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
    }),
    __extensions = extensions;
    
    /* check if the node is extended */
    if(__extensions !== undefined)
    {
      /* get standard and bubbled listeners */
      var localAttrListeners = __extensions.attrListeners,
          localParentAttrListeners = __extensions.parentAttrListeners;
      
      /* loop local listeners first */
      if(localAttrListeners[prop] !== undefined)
      {
        loopListener(localAttrListeners[prop],e);
      }
      
      /* if a * (all) listener was added, loop them */
      if(e.__stopImmediatePropogation__ === undefined && localAttrListeners[__all__] !== undefined)
      {
        loopListener(localAttrListeners[__all__],e);
      }
      
      /* loop bubbled listeners */
      if(e.__stopPropogation__ === undefined && localParentAttrListeners[prop] !== undefined)
      {
        loopBubbledListener(localParentAttrListeners[prop],e);
      }
      
      /* if a * (all) bubbled listener was added, loop them */
      if(e.__stopPropogation__ === undefined && localParentAttrListeners[__all__] !== undefined)
      {
        loopBubbledListener(localParentAttrListeners[__all__],e);
      }
    }
    
    if(e.__preventDefault__ !== undefined) return false;
    return true;
  }
  
  /* runs the associated post value set update listeners */
  function _updateStandard(el, prop, val, oldValue, extensions, args, action)
  {
    /* create event */
    var e = new changeEvent({
        value: val,
        oldValue: oldValue,
        attr: prop,
        type: 'update',
        target: el,
        srcElement: el,
        arguments: args,
        action: action
    }),
    __extensions = extensions;
    
    /* check if the node is extended */
    if(__extensions !== undefined)
    {
      /* get standard and bubbled update listeners */
      var localAttrListeners = __extensions.attrUpdateListeners,
          localParentAttrListeners = __extensions.parentAttrUpdateListeners;
      
      /* loop local listeners first */
      if(localAttrListeners[prop] !== undefined)
      {
        loopListener(localAttrListeners[prop],e);
      }
      
      /* if a * (all) listener was added, loop them */
      if(e.__stopImmediatePropogation__ === undefined && localAttrListeners[__all__] !== undefined)
      {
        loopListener(localAttrListeners[__all__],e);
      }
      
      /* loop bubbled listeners */
      if(e.__stopPropogation__ === undefined && localParentAttrListeners[prop] !== undefined)
      {
        loopBubbledListener(localParentAttrListeners[prop],e);
      }
      
      /* if a * (all) bubbled listener was added, loop them */
      if(e.__stopPropogation__ === undefined && localParentAttrListeners[__all__] !== undefined)
      {
        loopBubbledListener(localParentAttrListeners[__all__],e);
      }
    }
    
    if(e.__preventDefault__ !== undefined) return false;
    return true;
  }
  
  /* for all standard prototypes that contain getters and setters */
  function descriptorStandard(descriptor,key,extended)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __descriptor = descriptor,
        __key = key,
        __extended = extended,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __update = _updateStandard,
        __set = _setStandard,
        __extensions = {},
        __oldValue;
    
    function setExtended(v)
    {
      /* get the current value of this property */
      __oldValue = __descGet.call(this);
      
      /* get the extensions for this node */
      __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
      
      if(__set(this,__key,v,__oldValue,__extensions.stop) && __set(this,__extended,v,__oldValue,__extensions.stop))
      {
        /* if the default was not prevented, set the value */
        __descSet.call(this,v);

        /* if update listeners were not stopped run them */
        if(!__extensions.stop)
        {
          __update(this,__key,v,__oldValue);
          __update(this,__extended,v,__oldValue);
        }
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
    }
    
    /* main setter method */
    function set(v)
    {
      /* get the current value of this property */
      __oldValue = __descGet.call(this);
      
      /* get the extensions for this node */
      __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
      
      /* run the pre value set listeners */
      if(__set(this,__key,v,__oldValue,__extensions.stop))
      {
        /* if the default was not prevented, set the value */
        __descSet.call(this,v);

        /* if update listeners were not stopped run them */
        if(!__extensions.stop) __update(this,__key,v,__oldValue);
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
    }
    
    /* return new descriptor */
    return {
      get:descriptor.get,
      set:(__extended !== undefined ? setExtended : set),
      enumerable:descriptor.enumerable,
      configurable:true
    }
  }
  
  /* for value based prototypes that contain value and writable, converts them to getter setter descriptors */
  function descriptorValue(descriptor,key)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __descriptor = descriptor,
        __key = key,
        __update = _updateStandard,
        __set = _setStandard,
        __extensions = {},
        __writable = descriptor.writable,
        __oldValue;
    
    /* getter method, returns current value */
    function get()
    {
      return __descriptor.value;
    }
    
    /* main setter method */
    function set(v)
    {
      /* if the property was not supposed to be writable do not let it to be set */
      if(__writable)
      {
        /* get the current value of this property */
        __oldValue = __descriptor.value;
        
        /* get the extensions for this node */
        __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
        
        /* run the pre value set listeners */
        if(__set(this,__key,v,__oldValue,__extensions.stop))
        {
          /* if the default was not prevented, set the value */
          __descriptor.value = v;
          
          /* if update listeners were not stopped run them */
          if(!__extensions.stop) __update(this,__key,v,__oldValue);
        } 
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
    }
    
    /* return new descriptor */
    return {
      get:get,
      set:set,
      enumerable:descriptor.enumerable,
      configurable:true
    }
  }
  
  /* for function based prototypes that contain value and writable and the default value is a function */
  function descriptorFunction(descriptor,key,extended)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __descriptor = descriptor,
        __key = key,
        __extended = extended,
        __descVal = descriptor.value,
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = {},
        __action;
    
    function setExtended()
    {
      /* get the extensions for this node */
      __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
      
      /* run the pre method activation listeners */
      if(__set(this,__key,undefined,undefined,__extensions.stop,arguments) && __set(this,__extended,undefined,undefined,__extensions.stop,arguments))
      {
        /* run the associated method */
        __action = __descVal.apply(this,arguments);

        /* we don't want to create a circular reference */
        if(__key === 'addEventListener' && arguments[0] === 'addEventListenerupdate') __extensions.stop = true;

        /* if update listeners were not stopped run them */
        if(!__extensions.stop)
        {
          __update(this,__key,undefined,undefined,arguments,__action);
          __update(this,__extended,undefined,undefined,arguments,__action);
        }
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
      return __action;
    }
    
    /* the new function that will be used as the value for this descriptor */
    function set()
    {
      /* get the extensions for this node */
      __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
      
      /* run the pre method activation listeners */
      if(__set(this,__key,undefined,undefined,__extensions.stop,arguments))
      {
        /* run the associated method */
        __action = __descVal.apply(this,arguments);

        /* we don't want to create a circular reference */
        if(__key === 'addEventListener' && arguments[0] === 'addEventListenerupdate') __extensions.stop = true;

        /* if update listeners were not stopped run them */
        if(!__extensions.stop) __update(this,__key,undefined,undefined,arguments,__action);
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
      return __action;
    }
    
    /* return new descriptor */
    return {
      value:(__extended !== undefined ? setExtended : set),
      writable:descriptor.writable,
      enumerable:descriptor.enumerable,
      configurable:true
    }
  }
  
  /* hidden properties */
  function descriptorHidden(value)
  {
    /* creates a descriptor that is not loopable/enumerable */
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
    /* get extension and all associated events */
    var __extensions = (el.__pikantnyExtensions__ || _attachLocalBinders(el)),
        __events = __extensions.events;
    
    /* create associated events array if it does not exist */
    if(typeof __events[key] === 'undefined') __events[key] = [];
    
    /* if we are updating or removing an event we must remove the old one */
    if(oldValue && __events[key].indexOf(oldValue) !== -1 || !!remove) __events[key].splice(__events[key].indexOf((oldValue || value)),1);
    
    /* if we are not just removing an event add it to the proper array */
    if(!remove) __events[key].push(value);
  }
  
  /* applied for inline `onclick`, `onkeyup`, etc. like properties */
  function descriptorEvent(descriptor,key)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __descriptor = descriptor,
        __key = key,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __update = _updateStandard,
        __set = _setStandard,
        __extensions = {},
        __oldValue;
    
    /* main setter method */
    function set(v)
    {
      /* get the old event */
      __oldValue = __descGet.call(this);
      
      /* get the current extensions */
      __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this));
      
      /* run the pre value set listeners */
      if(__set(this,__key,v,__oldValue,__extensions.stop))
      {
        /* set the new value */
        __descSet.call(this,v);
        
        /* if update listeners were not stopped run them */
        if(!__extensions.stop) __update(this,__key,v,__oldValue);
        
        /* add to event object for viewing */
        listenerEventIntersect(this,__key,v,false,__oldValue);
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
    }
    
    /* return new descriptor */
    return {
      get:descriptor.get,
      set:set,
      enumerable:true,
      configurable:true
    };
  }
  
  /*** Left off commenting here, need to update style ref ***/
  
  /* applied for if attributes are set via the: element.attributes NamedNodeMap, Examples: element.attributes.class.nodeValue,element.attributes.class.textContent */
  function descriptorAttribute(descriptor,key)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __descriptor = descriptor,
        __key = key,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __set = _setStandard,
        __update = _updateStandard,
        __element = {},
        __extensions = {},
        __oldValue,
        __cssRules;
    
    /* main setter method */
    function set(v)
    {
      /* we bind to nodeValue, textContent from the Node prototype, for this we must check to make sure we are in fact on a Attr object */
      if(this instanceof Attr)
      {
        /* fetch the old value */
        __oldValue = __descGet.call(this);
        
        /* element that holds this attribute */
        __element = this.ownerElement;
        
        /* attribute key name */
        __key = this.nodeName;
        
        /* get the current extensions */
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element));
        
        /* run the pre value set listeners */
        if(__set(__element,__key,v,__oldValue,__extensions.stop))
        {
          /* if the key that is being changed is the style attribute we must handle this differently by letting the individual style listeners fire first */
          if(__key === 'style')
          {
            /* splits a inline style: "margin:10px;padding:5px;" into an object {margin:"10px",padding:"5px"} */
            __cssRules = getCSSTextChanges(__oldValue,value);
            
            /* loop and set, when set the attribute is automatically updated */
            for(var x=0,keys=Object.keys(__cssRules),len=keys.length,key;x<len;x++)
            {
              key = keys[x];
              __element.style[key] = __cssRules[key]
            }
          }
          
          /* if the key is not a style set the attribute */
          if(__key !== 'style') __descSet.call(this,v);
          
          /* if update listeners were not stopped, run them */
          if(!__extensions.stop) 
          {
            __update(__element,__key,v,__oldValue);
          }
        }
        
        /* reset update stop */
        __extensions.stop = undefined;
      }
      else
      {
        /* all other instance types just run their redefined functionality */
        return __descSet.call(this,v);
      }
    }
    
    /* return the getter setter descriptor */
    return {
      get:descriptor.get,
      set:set,
      enumerable:descriptor.enumerable,
      configurable:true
    };
  }
  
  /* for when setAttribute method is ran to apply to standard listeners as well and not just `setAttribute` method listeners. Example: `class` fires all `class` listeners */
  function descriptorSetAttribute(key,value)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __oldValue = (this.attributes.getNamedItem(key) ? this.attributes.getNamedItem(key).value : undefined),
        __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this)),
        __cssRules,
        __action;
    
    /* run the pre value set listeners for the method and the attr name */
    if(_setStandard(this,'setAttribute',undefined,undefined,__extensions.stop,arguments) && _setStandard(this,key,value,__oldValue,__extensions.stop))
    {
      /* if the key is style fire the style changes on the style object */
      if(key === 'style')
      {
        /* convert string to object */
        __cssRules = getCSSTextChanges(__oldValue,value);
        for(var x=0,keys=Object.keys(__cssRules),len=keys.length,key;x<len;x++)
        {
          key = keys[x];
          this.style[key] = __cssRules[key]
        }
      }
      
      /* run setAttribute unless the key is style as the attribute is already is already set inline */
      __action = (key !== 'style' ? __setAttribute.call(this,key,value) : undefined);
      
      /* if update is not stopped run update listeners */
      if(!__extensions.stop)
      {
        _updateStandard(this,'setAttribute',undefined,undefined,__extensions.stop,arguments,__action);
        _updateStandard(this,key,value,__oldValue,__extensions.stop,arguments,__action);
      }
    }
    
    /* reset update stop */
    __extensions.stop = undefined;
    return __action;
  }
    
  function descriptorRemoveAttribute(key)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __oldValue = (this.attributes.getNamedItem(key) ? this.attributes.getNamedItem(key).value : undefined),
        __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this)),
        __cssRules,
        __action;
    
    /* run the pre value remove listeners for the method and the attr name */
    if(_setStandard(this,'removeAttribute',undefined,undefined,__extensions.stop,arguments) && _setStandard(this,key,undefined,__oldValue,__extensions.stop))
    {
        /* if style attribute fire individual inline style listeners */
        if(key === 'style')
        {
          /* convert string to object */
          __cssRules = getCSSTextChanges(__oldValue,value);
          for(var x=0,keys=Object.keys(__cssRules),len=keys.length,key;x<len;x++)
          {
            key = keys[x];
            this.style[key] = __cssRules[key]
          }
        }
        
        /* remove the attribute from the element */
        __action = __removeAttribute.call(this,key);
        
        /* if update is not stopped run update listeners */
        if(!__extensions.stop)
        {
          _updateStandard(this,'removeAttribute',undefined,undefined,__extensions.stop,arguments,__action);
          _updateStandard(this,key,undefined,__oldValue,__extensions.stop,arguments,__action);
        }
    }
    
    /* reset update stop */
    __extensions.stop = undefined;
    
    return __action;
  }
    
  /* process Event, controls all listener access */
  function descriptorAddEventListener(key,func)
  {
    /* closured local var's for increased perf */
    var __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this)),
        __action;
    
    if(_setStandard(this,'addEventListener',undefined,undefined,__extensions.stop,arguments))
    {
      __action = __addEventListener.call(this,key,func);
      processEvent.apply(this,arguments);
      
      if(!__extensions.stop)
      {
        _updateStandard(this,'addEventListener',undefined,undefined,__extensions.stop,arguments,__action);
      }
    }
    __extensions.stop = undefined;
    return __action;
  }
  
  /* process event removal, controls listener access removal */
  function descriptorRemoveEventListener(key,func)
  {
    /* closured local var's for increased perf */
    var __extensions = (this.__pikantnyExtensions__ || _attachLocalBinders(this)),
        __action;
    
    if(_setStandard(this,'removeEventListener',undefined,undefined,__extensions.stop,arguments))
    {
      __action = __removeEventListener.call(this,key,func);
      processEventRemoval.apply(this,arguments);
      if(!__extensions.stop)
      {
        _updateStandard(this,'removeEventListener',undefined,undefined,__extensions.stop,arguments,__action);
      }
    }
    __extensions.stop = undefined;
    return __action;
  }
  
  /* formats a standard css key into an inline key */
  function getInlineKey(key)
  {
    var _key = key.replace(/\-(.)/,function(dash,char){return char.toUpperCase();});
    if(_key.indexOf('-webkit') === 0) _key = _key.replace('-webkit','webkit');
    if(_key.indexOf('-moz') === 0) _key = _key.replace('-moz','moz');
    if(_key.indexOf('-ms') === 0) _key = _key.replace('-ms','ms');
    
    return _key;
  }
  
  /* formats a inline key into a standard css key */
  function getStyleKey(key)
  {
    var _key = key.replace(/([A-Z])/g, "-$1");
    if(_key.indexOf('webkit') === 0) _key = _key.replace('webkit','-webkit');
    if(_key.indexOf('moz') === 0) _key = _key.replace('moz','-moz');
    if(_key.indexOf('ms') === 0) _key = _key.replace('ms','-ms');
    
    return _key.toLowerCase();
  }
  
  /* converts an inline style string into an object */
  function getCSSTextChanges(oldValue,value)
  { 
    /* split string rules using `;` and `:` into a key:value pair object */
    var __cssRules = value.split(';').reduce(function(style,v,x){
          var split = v.split(':'),
          prop = getInlineKey(split[0]),
          value = split[1]; 
          style[prop] = value;
          
          return style;
        },{});
    
    /* loop over and check oldValue for ones that were removed and set them to empty values to be removed properly */
    for(var x=0,oldSplit=oldValue.split(';'),len=oldSplit.length,split,prop,value;x<len;x++)
    {
      split = oldSplit[x].split(':');
      prop = getInlineKey(split[0]);
      if(__cssRules[prop] === undefined) __cssRules[prop] = '';
    }
    
    return __cssRules;
  }
  
  /* when a style listener is added to an element we convert the `style` object key to an observable */
  function descriptorInlineStyle(descriptor,element,key)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __descriptor = descriptor,
        __proto = element.style,
        __removeProperty = __proto.removeProperty,
        __setProperty = __proto.setProperty,
        __writable = descriptor.writable,
        __keyInline = getInlineKey(key),
        __keyStyle = getStyleKey(key),
        __element = element,
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = {},
        __oldValue = descriptor.value,
        __value = descriptor.value;
    
    /* getter */
    function get()
    {
      return __value;
    }
    
    /* setter */
    function set(v)
    {
      if(__writable)
      {
        __oldValue = __value;
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element));
        
        /* run pre value listeners for both inline key and css style key */
        if(__set(__element,__keyInline,v,__oldValue,__extensions.stop) && __set(__element,__keyStyle,v,__oldValue,__extensions.stop))
        {
          __value = v;
          if(typeof v === 'string' && v.length === 0)
          {
            /* inline style helps dif whether the setProperty method was ran or the inline style was changed */
            __extensions.inlinestyle = true;
            __removeProperty(__keyStyle);
          }
          else
          {
            /* inline style helps dif whether the setProperty method was ran or the inline style was changed */
            __extensions.inlinestyle = true;
            __setProperty(__keyStyle,v);
          }

          
          if(!__extensions.stop)
          {
            __update(__element,__keyInline,v,__oldValue);
            __update(__element,__keyStyle,v,__oldValue);
          }
        }
        __extensions.stop = undefined;
      }
    }
    
    return {
      get:get,
      set:set,
      enumerable:descriptor.enumerable,
      configurable:true
    }
  }
  
  /* if the cssText property on the style Object is set we parse it */
  function descriptorCSSText(descriptor,element,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __element = element,
        __proto = element.style,
        __set = _setStandard,
        __update = _updateStandard,
        __descGet = __descriptor.get,
        __extensions = {},
        __oldValue;
    
    function set(v)
    {
      __oldValue = __descGet.call(this);
      __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element));
      if(__set(__element,__key,v,__oldValue,__extensions.stop))
      {
        var __cssRules = getCSSTextChanges(__oldValue,v);
        for(var x=0,keys=Object.keys(__cssRules),len=keys.length,key;x<len;x++)
        {
          key = keys[x];
          this.style[key] = __cssRules[key];
        }
        if(!__extensions.stop)
        {
          __update(__element,__key,v,__oldValue);
        }
      }
      __extensions.stop = undefined;
    }
    
    return {
      get:descriptor.get,
      set:set,
      enumerable:descriptor.enumerable,
      configurable:true
    };
  }
  
  /* in the case that setProperty method on the style Object+ is directly called */
  function descriptorCSSSetProperty(descriptor, element, key)
  {
    var __descriptor = descriptor,
        __element = element,
        __proto = element.style,
        __descSet = descriptor.value,
        __keyInline = getInlineKey(key),
        __keyStyle = getStyleKey(key),
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = {},
        __action = undefined;
    
    function set(key,v,priority)
    {
      __extensions = (_elemenet.__pikantnyExtensions__ || _attachLocalBinders(__element));
      
      if(!__extensions.inlinestyle)
      {
        if(__set(__element,__keyInline,undefined,undefined,__extensions.stop,arguments) && __set(__element,__keyStyle,undefined,undefined,__extensions.stop,arguments))
        {
          __action = __descSet.apply(this,arguments);
          if(!__extensions.stop) 
          {
            __update(__element,__keyInline,undefined,undefined,__extensions.stop,arguments,__action);
            __update(__element,__keyStyle,undefined,undefined,__extensions.stop,arguments,__action);
          }
        }
        __extensions.stop = undefined;
      }
      else
      {
        __extensions.inlinestyle = undefined;
        return __descSet.apply(this,arguments);
      }
    }
    
    return {
      value:set,
      writable:descriptor.writable,
      enumerable:descriptor.enumerable,
      configurable:true
    };
  }
  
  /* in the case that removeProperty method on the style Object is directly called */
  function descriptorCSSRemoveProperty(descriptor, element, key)
  {
    var __descriptor = descriptor,
        __element = element,
        __proto = element.style,
        __descSet = descriptor.value,
        __keyInline = getInlineKey(key),
        __keyStyle = getStyleKey(key),
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = {},
        __action = undefined;
    
    function set(key)
    {
      __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element));
      
      if(!__extensions.inlinestyle)
      {
        if(__set(__element,__key,undefined,undefined,__extensions.stop,arguments))
        {
          __action = __descSet.apply(this,arguments);
          if(!__extensions.stop) __update(__element,__key,undefined,undefined,__extensions.stop,arguments,__action);
        }
        __extensions.stop = undefined;
      }
      else
      {
        __extensions.inlinestyle = undefined;
        return __descSet.apply(this,arguments);
      }
    }
    
    return {
      value:set,
      writable:descriptor.writable,
      enumerable:descriptor.enumerable,
      configurable:true
    };
  }
     
  /* must be done this way due to keyCodes not being cross platoform, may be looked into later */
  
  /* run from events, need seperate for value and checked being set */
  function runInputEvents(e)
  {
    if(e.defaultPrevented) return false;
    
    var __target = e.target,
        __extensions = (__target.__pikantnyExtensions__ || _attachLocalBinders(__target)),
        __set = _setStandard,
        __update = _updateStandard,
        __isRadio = (['checkbox','radio'].indexOf(__target.type) !== -1),
        __oldChecked = __extensions.__prechecked__,
        __oldValue = (__isRadio ? __oldChecked : __extensions.__prevalue__),
        __checked = __target.checked,
        __value = (__isRadio ? __checked : __target.value);

    if(__set(__target,'value',__value,__oldValue,__extensions.stop))
    {
      if(__isRadio)
      {
        if(__set(__target,'checked',__checked,__oldChecked,__extensions.stop))
        {
          if(!__target.__stopped__)
          {
            __update(__target,'value',__value,__oldValue);
            __update(__target,'checked',__checked,__oldChecked);
          }
        }
        else
        {
          __checkedInputDescriptor.set.call(__target,__oldChecked);
          __extensions.stop = undefined;
          return false;
        }
      }
      else
      {
          if(!__target.__stopped__)
          {
            __update(__target,'value',__value,__oldValue);
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
      __extensions.stop = undefined;
      return false;
    }
    __extensions.stop = undefined;
    return true;
  }
  
  function inputListener(e)
  { 
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element));
    
    /* if we are holding the key we should act like a keyup event happened */
    if(__extensions.isPressed)
    {
      if(!runInputEvents.call(this,e))
      {
        e.preventDefault();
        return false;
      }
    }
    __extensions.isPressed = true;
    
    if(['checked','radio'].indexOf(this.type) === -1)
    {
      __extensions.__prevalue__ = this.value;
      /* value gets set prior to this running so we can prevent it without user seeing the value, checked requires click event to do the same */
      setTimeout(function(){
        runInputEvents.call(e.target,e);
      },0);
    }
    else
    {
      __extensions.__prevalue__ = this.value;
      __extensions.__prechecked__ = this.checked;
    }
  }
  
  function inputUpListener(e)
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element));
    
    /* in the case 'enter' or 'space' is pressed on a radio input */
    if(['checked','radio'].indexOf(this.type) !== -1)
    {
      runInputEvents.call(this,e);
    }
    __extensions.isPressed = false;
  }
  
  function selectListener(e)
  {
    var __target = e.target,
        __extensions = (__target.__pikantnyExtensions__ || _attachLocalBinders(__target)),
        __set = _setStandard,
        __update = _updateStandard,
        __oldValue = __extensions.__prevalue__,
        __oldIndex = __extensions.__preindex__,
        __index = __target.selectedIndex,
        __value = __target.value;
    
    if(__set(__target,'value',__value,__oldValue) && __set(__target,'selectedIndex',__index,__oldIndex))
    {
      if(!__extensions.__stopped__)
      {
        __update(__target,'value',__value,__oldValue);
        __update(__target,'selectedIndex',__index,__oldIndex);
      }
    }
    else
    {
      __valueSelectDescriptor.set.call(__target,__oldValue);
      __extensions.__stopped__ = undefined;
      return false;
    }
    __extensions.__stopped__ = undefined;
    return true;
  }
  
  function selectFocusListener(e)
  {
    var __target = e.target,
        __extensions = (__target.__pikantnyExtensions__ || _attachLocalBinders(__target));
    
    __extensions.__prevalue__ = this.value;
    __extensions.__preindex__ = this.selectedIndex;
  }
  
  function applyTextChanges()
  {
    if(this.__pikantnyExtensions__ === undefined)
    {
      var __target = this,
          __extensions =  _attachLocalBinders(__target);
      
      __extensions.isPressed = false;
      
      /* need to support html5 input types */
      
      if(['checkbox','radio'].indexOf(this.type) !== -1)
      {
        this.addEventListener('mousedown',inputListener,false);
        this.addEventListener('click',inputUpListener,false);
        __extensions.__prevalue__ = this.value;
        __extensions.__prechecked__ = this.checked.toString();
      }
      else
      {
        this.addEventListener('keydown',inputListener,false);
        this.addEventListener('keyup',inputUpListener,false);
        __extensions.__prevalue__ = this.value;
      }
    }
  }
  
  function applySelectChanges()
  {
    if(this.__pikantnyExtensions__ === undefined)
    {
      var __target = this,
          __extensions =  _attachLocalBinders(__target);
      
      this.addEventListener('focus',selectFocusListener);
      this.addEventListener('change',selectListener);
      __extensions.__prevalue__ = this.value;
      __extensions.__preindex__ = this.selectedIndex;
    }
  }
  
  function processStyleEvent(key,keyProper)
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element));
    
    if(__extensions.__styleList__ === undefined) __extensions.__styleList__ = [];
    if(__extensions.__styleList__.indexOf(key) === -1)
    {
        Object.defineProperty(__element.style,key,descriptorInlineStyle(Object.getOwnPropertyDescriptor(__element.style,key),__element,key,keyProper));
        __extensions.__styleList__.push(key);
        
        /* this allows for bubbling to take effect */
        var __children = __element.querySelectorAll('*');
        for(var x=0,len=__children.length,child,ext;x<len;x++)
        {
          child = __children[x];
          ext = (child.__pikantnyExtensions__ || _attachLocalBinders(child));
          
          if(ext.__styleList__ === undefined) ext.__styleList__ = [];
          if(ext.__styleList__.indexOf(key) === -1)
          {
            /* need to handle this differently for bubbled events */
            
            Object.defineProperty(child.style,key,descriptorInlineStyle(Object.getOwnPropertyDescriptor(child.style,key),child,key,keyProper));
            ext.__styleList__.push(key);
          }
        }
    }
  }
  
  
  /* note, need to add into account bubbled listeners on nodes that are post inserted into the dom */
  /* .__pikantnyExtensions__.attrListeners, .__pikantnyExtensions__.parentAttrListeners */
  
  function attachAttrEvent(el,key,func)
  {
    var __element = el,
        __children = __element.querySelectorAll('*'),
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element)),
        __isMultipleKeys = (typeof key === 'object' && !!key.length);
    
    /* standard */
    if(__isMultipleKeys)
    {
      for(var x=0,len=key.length,__isUpdate,__listener,__key;x<len;x++)
      {
        __isUpdate = (key[x].indexOf('update') !== -1);
        __listener = (!__isUpdate ? 'attrListeners' : 'attrUpdateListeners');
        __key = (key[x].replace('update',''))
        
        if(!__extensions[__listener][__key]) __extensions[__listener][__key] = [];
        __extensions[__listener][__key].push(func);
        
        /* bubbled */
        attachAttrBubbled(__element,__children,key[x],func);
      }
    }
    else
    {
      var __isUpdate = (key.indexOf('update') !== -1),
          __listener = (!__isUpdate ? 'attrListeners' : 'attrUpdateListeners'),
          __key = (key.replace('update',''));
      
      if(!__extensions[__listener][__key]) __extensions[__listener][__key] = [];
      __extensions[__listener][__key].push(func);
      
      /* bubbled */
      attachAttrBubbled(__element,__children,key,func);
    }
  }
  
  function attachAttrBubbled(el,children,key,func)
  {
    var __isUpdate = (key.indexOf('update') !== -1),
        __listener = (!__isUpdate ? 'parentAttrListeners' : 'parentAttrUpdateListeners'),
        __key = (key.replace('update',''));
    
    for(var x=0,len=children.length,ext;x<len;x++)
    {
      ext = (children[x].__pikantnyExtensions__ || _attachLocalBinders(children[x]));
      if(!ext[__listener][__key]) ext[__listener][__key] = [];
      ext[__listener][__key].push({func:func,parent:el});
    }
  }
  
  function processEvent(key,func)
  {
    /* handle inline css change listeners, attribute, and cssText, setProperty */
    var __element = this,
        __cssKey = getStyleKey(key),
        __cssInlineKey = getInlineKey(key);
    
    if(__CSSInlineList.indexOf(__cssInlineKey) !== -1)
    {
      processStyleEvent.call(__element,__cssInlineKey,__cssKey);
      attachAttrEvent(__element,[__cssKey,__cssInlineKey],func);
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
    
    attachAttrEvent(__element,key,func);
    return key;
  }
  
  function removeAttrEvent(el,key,func)
  {
    var __element = el,
        __children = __element.querySelectorAll('*'),
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element)),
        __isMultipleKeys = (typeof key === 'object' && !!key.length),
        __stringFunc = func.toString(),
        __listeners = [];
    
    /* standard */
    if(__isMultipleKeys)
    {
      for(var x=0,len=key.length,listeners,__isUpdate,__listener,__key;x<len;x++)
      {
        __isUpdate = (key[x].indexOf('update') !== -1);
        __listener = (!__isUpdate ? 'attrListeners' : 'attrUpdateListeners');
        __key = (key[x].replace('update',''))
        
        listeners = __extensions[__listener][__key];
        if(!!listeners)
        {
          inner:for(var i=0,lenn=listeners.length;i<lenn;i++)
          {
            if(listeners[i].toString() === _stringFunc)
            {
              listeners.splice(i,1);
              break inner;
            }
          }
        }
        
        /* bubbled */
        removeAttrBubbled(__children,key[x],func);
      }
    }
    else
    {
      var __isUpdate = (key.indexOf('update') !== -1),
          __listener = (!__isUpdate ? 'attrListeners' : 'attrUpdateListeners'),
          __key = (key.replace('update',''));
      
      __listeners = __extensions[__listener][__key];
      if(!!__listeners)
      {
        inner:for(var i=0,lenn=__listeners.length;i<lenn;i++)
        {
          if(__listeners[i].toString() === __stringFunc)
          {
            __listeners.splice(i,1);
            break inner;
          }
        }
      }
      
      /* bubbled */
      removeAttrBubbled(__children,key,func);
    }
  }
  
  function removeAttrBubbled(children,key,func)
  {
    var __stringFunc = func.toString(),
        __isUpdate = (key.indexOf('update') !== -1),
        __listener = (!__isUpdate ? 'parentAttrListeners' : 'parentAttrUpdateListeners'),
        __key = (key.replace('update',''));
    
    outer:for(var x=0,len=children.length,ext,listeners;x<len;x++)
    {
      ext = (children[x].__pikantnyExtensions__ || _attachLocalBinders(children[x]));
      listeners = ext[__listener][__key];
      if(!!listeners)
      {
        inner:for(var i=0,lenn=listeners.length;i<lenn;i++)
        {
          if(listeners[i].func.toString() === __stringFunc)
          {
            listeners.splice(i,1);
            break inner;
          }
        }
      }
    }
  }
  
  /* only removes non bubbled, so we then just must remove none and ignore if has bubbled */
  function processEventRemoval(key,func)
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element)),
        __cssKey = getStyleKey(key),
        __cssInlineKey = getInlineKey(key);
    
    if(__CSSInlineList.indexOf(__cssInlineKey) !== -1)
    {
      removeAttrEvent(__element,[__cssKey,__cssInlineKey],func);
      return __cssInlineKey;
    }
    
    if(['checked','value','selectedIndex'].indexOf(key) !== -1)
    {
      /* run up the tree checking for events, should be run down the tree? */
      var __isBubbleRemovable = (__extensions.parentAttrListeners[key] === undefined || __extensions.parentAttrListeners[key].length < 2);

      if(!!__extensions.attrListeners[key] && __extensions.attrListeners[key].length < 2)
      {
        if(['input','textarea'].indexOf(this.nodeName.toLowerCase()) !== -1)
        {
          if(['checkbox','radio'].indexOf(this.type) !== -1)
          {
            if(__isBubbleRemovable)
            {
              this.removeEventListener('mousedown',inputListener);
              this.removeEventListener('click',inputUpListener);
            }
          }
          else
          {
            if(__isBubbleRemovable)
            {
              this.removeEventListener('keydown',inputListener);
              this.removeEventListener('keyup',inputUpListener);
            }
          }
        }
        else if(['select'].indexOf(this.nodeName.toLowerCase()) !== -1)
        {
          if(__isBubbleRemovable)
          {
            this.removeEventListener('focus',selectFocusListener);
            this.removeEventListener('change',selectListener);
          }
        }
        /* need to check if any listeners exist in the  lower tree... oh boy... */
        else
        {
          var __inputs = this.querySelectorAll('input'),
              __textareas = this.querySelectorAll('textarea'),
              __select = this.querySelectorAll('select'),
              __element = this;
          
          /* need to check if listeners are on attrListeners and not to remove if so */
          function loop(els,type)
          {
            for(var x=0,len=els.length,isBubbleRemovable,isRadio,el,ext;x<len;x++)
            {
              el = els[x];
              ext = (el.__pikantnyExtensions__ || _attachLocalBinders(el));
              isRadio = (['checkbox','radio'].indexOf(el.type) !== -1);
              isBubbleRemovable = (ext.parentAttrListeners[key] === undefined || ext.parentAttrListeners[key].length < 2)
              
              if(!!ext.attrListeners[key] && ext.attrListeners[key].length < 2)
              {
                if(['input','textarea'].indexOf(el.nodeName.toLowerCase()) !== -1)
                {
                  if(isRadio)
                  {
                    if(isBubbleRemovable)
                    {
                      el.removeEventListener('mousedown',inputListener);
                      el.removeEventListener('mouseup',inputUpListener);
                    }
                  }
                  else
                  {
                    if(isBubbleRemovable)
                    {
                      el.removeEventListener('keydown',inputListener);
                      el.removeEventListener('keyup',inputUpListener);
                    }
                  }
                }
                else
                {
                  if(isBubbleRemovable)
                  {
                    el.removeEventListener('focus',selectFocusListener);
                    el.removeEventListener('change',selectListener);
                  }
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
    removeAttrEvent(__element,key,func);
    return key;
  }
  
  function init(obj,local)
  {
    if(local === undefined) local = window;
    if(local.__pikantnyKeyList__ === undefined) Object.defineProperty(local,'__pikantnyKeyList__',descriptorHidden([]));
    for(var x=0,keys=Object.getOwnPropertyNames(obj),len=keys.length;x<len;x++) init.inject(obj,keys[x],local);
    
    return init;
  }

  init.inject = function(obj,key,local)
  {
    var __extensions = local.__pikantnyKeyList__;
    
    if(__extensions[key] !== undefined || __blocked__.indexOf(key) !== -1 || key.indexOf('__') === 0) return init;
    
    var __descriptor = Object.getOwnPropertyDescriptor(obj,key),
        __defined;
    
    if(__descriptor.configurable)
    {
      if(__TextPropertyList__.indexOf(key) !== -1)
      {
        if(__descriptor.set !== undefined)
        {
          __defined = !!Object.defineProperty(obj,key,descriptorStandard(__descriptor,key,'html'));
        }
        else if(typeof __descriptor.value === 'function')
        {
          __defined = !!Object.defineProperty(obj,key,descriptorFunction(__descriptor,key,'html'));
        }
      }
      else if(__descriptor.set !== undefined)
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
              _descUpdate = Object.getOwnPropertyDescriptor(HTMLElement.prototype,'on'+key+'update');
        
          if(!_desc) Object.defineProperty(HTMLElement.prototype,'on'+key,descriptorEvent(key));
          if(!_descUpdate) Object.defineProperty(HTMLElement.prototype,'on'+key+'update',descriptorEvent(key,true));
      }
      
      if(__extensions[key] === undefined) __extensions[key] = __descriptor;
    }
    return init;
  }
  
  init.observables = function(local)
  {
    return (local || window).__pikantnyKeyList__.slice();
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
          (this.__pikantnyExtensions__ || _attachLocalBinders(this)).stop = true;
          return this;
      };
  }
  
  /* handle attribute setting */
  Element.prototype.setAttribute = descriptorSetAttribute;
  Element.prototype.removeAttribute = descriptorRemoveAttribute;
  
  /* sounds fishy, needs looked into */
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
  
  /******* left off here ********/
  
  function htmlCopyBubbled(ext,listeners,isUpdate)
  {
    var __listener = (!isUpdate ? 'parentAttrListeners' : 'parentAttrUpdateListeners');
    
    for(var x=0,keys=Object.keys(listeners),len=keys.length,key,func;x<len;x++)
    {
      key = keys[x];
      if(!ext[__listener][key]) ext[__listener][key] = [];
      ext[__listener][key].concat(listeners[key]);
    }
  }
  
  function htmlAttachBubbledListeners(el,extensions)
  {
    if(!el.__pikantnyExtensions__)
    {
      /* copy listeners over */
      htmlCopyBubbled((_attachLocalBinders(el)),extensions.attrListeners);
      /* copy update listeners over */
      htmlCopyBubbled((_attachLocalBinders(el)),extensions.attrUpdateListeners,true);
      /* copy parent listeners over */
      htmlCopyBubbled((_attachLocalBinders(el)),extensions.parentAttrListeners);
      /* copy parent update listeners over */
      htmlCopyBubbled((_attachLocalBinders(el)),extensions.parentAttrUpdateListeners,true);
    }
  }
  
  /* remember to propogate bubbled events onto new html nodes (do it gently) */
  
  /* add html listener to remove bubbled listeners properly */
  document.addEventListener('htmlupdate',function(e){
    
    /* fetch current target listeners and parent bubbled listeners */
    var __element = e.srcElement,
        __extensions = (__element.__pikantnyExtensions__ || _attachLocalBinders(__element)),
        __children = __querySelectorAll.call(__element,'*');
    
    for(var x=0,len=__children.length;x<len;x++)
    {
      htmlAttachBubbledListeners(__children[x],__extensions);
    }
    
  });
  
  if (typeof define === "function" && define.amd){
    define('pikantny',function(){return init;});
  }
  if(typeof module === 'object' && typeof module.exports === 'object'){
    module.exports.pikantny = init;
  }
  
  return init;
}());