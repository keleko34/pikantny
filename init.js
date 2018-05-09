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
  - if prop doesn't exist create it on listener (default observable, attribute) setProperty, setAttribute, addEventListener (#default property) v/
  - base non injected functions EX: querySelectorAll() => querySelectorAll.base() === non-injected v/
  
  Major
  * __pikantnyExtensions__ extensions attached to each node
  * __pikantnyKeyList__ global injections normally attached to `window` or global object
  
  *** issues with styles resetting the descriptor (Garbage collection issue),
      found chrome bug, ref: https://bugs.chromium.org/p/chromium/issues/detail?id=782776
      doesn't break in KB `research workaround`
*/

/* TODO */

/* custom style properties */

/* add descriptor for attributes.setNamedItems, attributes.removeNamedItems */

"use strict";

window.pikantny = (function(){
  
  /* SCOPED LOCALS */
  /* REGION */
  
  /* The entire node list starting from eventTarget down the chain, the prototypal enheritance starts with EventTarget > Node > Element > HTMLElement > all */
  var __HTMLList__ = [
       "HTMLVideoElement", "HTMLUnknownElement", "HTMLUListElement", "HTMLTrackElement", "HTMLTitleElement", "HTMLTextAreaElement", "HTMLTemplateElement", "HTMLTableSectionElement", "HTMLTableRowElement", "HTMLTableElement", "HTMLTableColElement", "HTMLTableCellElement", "HTMLTableCaptionElement", "HTMLStyleElement", "HTMLSpanElement", "HTMLSourceElement", "HTMLSlotElement", "HTMLShadowElement", "HTMLSelectElement", "HTMLScriptElement", "HTMLQuoteElement", "HTMLProgressElement", "HTMLPreElement", "HTMLPictureElement", "HTMLParamElement", "HTMLParagraphElement", "HTMLOutputElement", "HTMLOptionElement", "HTMLOptGroupElement", "HTMLObjectElement", "HTMLOListElement", "HTMLModElement", "HTMLMeterElement", "HTMLMetaElement", "HTMLMenuElement", "HTMLMediaElement", "HTMLMarqueeElement", "HTMLMapElement", "HTMLLinkElement", "HTMLLegendElement", "HTMLLabelElement", "HTMLLIElement", "HTMLInputElement", "HTMLImageElement", "HTMLIFrameElement", "HTMLHeadingElement", "HTMLHeadElement", "HTMLHRElement", "HTMLFrameSetElement", "HTMLFrameElement", "HTMLFormElement", "HTMLFontElement", "HTMLFieldSetElement", "HTMLEmbedElement", "HTMLDivElement", "HTMLDirectoryElement", "HTMLDialogElement", "HTMLDetailsElement", "HTMLDataListElement", "HTMLDListElement", "HTMLCanvasElement", "HTMLButtonElement", "HTMLBaseElement", "HTMLBRElement", "HTMLAudioElement", "HTMLAreaElement", "HTMLAnchorElement"
      ],
      
      __GlobalList__ = ["EventTarget","Node","Element","HTMLElement"].concat(__HTMLList__),
      
      /* items that should not be injected as they disrupt key actions */
      __blocked__ = [
        'dispatchEvent','Symbol','constructor','__proto__','stop','length','setAttribute','removeAttribute', 'addEventListener','removeEventListener','setProperty','removeProperty','getPropertyValue'
      ],
      
      /* items that have the same property name but are unique to the elements */
      __DoubleList__ = [
        'value'
      ],
      
      __Double__ = {
        'value':['HTMLInputElement','HTMLTextAreaElement','HTMLSelectElement']
      },
      
      __Extended__ = [
        'html'
      ],
      
      /* helps with easier style listening changes as .style is an object created afterwards and acts differently than your standard dom property */
      __CSSList__ = Object.getOwnPropertyNames(document.head.style)
                    .concat(Object.getOwnPropertyNames(document.head.style.__proto__))
                    .concat(Array.prototype.slice.call(getComputedStyle(document.head)))
                    .filter(function(v,i,ar){return (ar.indexOf(v) === i);}),
      
      __CSSSpecials__ = ['webkit','moz','ms'],
      
      /* all of these effect the text associated with an element */
      __TextPropertyList__ = ['textContent','innerHTML','innerText','outerHTML','outerText','appendChild','removeChild','replaceChild','insertAdjacentHTML','insertBefore'],
      
      /* allowing us to see the original events, and to skip observing when using addEventListener */
      __EventList__ = Object.keys(HTMLElement.prototype).filter(function(v){return (v.indexOf('on') === 0);})
      .concat(['onDOMContentLoaded','onDOMAttributeNameChanged','onDOMAttrModified','onDOMCharacterDataModified','onDOMNodeInserted','onDOMNodeRemoved','onDOMSubtreeModified']),
      
      /* setAttribute translators to fire events for their property counterparts */
      __AttrTranslate__ = {
        'class': 'className',
        'tabindex': 'tabIndex'
      },
      
      /* allows listening for all changes no matter what it is */
      __all__ = '*',
      
      __GlobalNodes__ = [window,document];
      
      /* backup to allow complex listening actions */
  var __addEventListener = EventTarget.prototype.addEventListener,
      __removeEventListener = EventTarget.prototype.removeEventListener,

      /* backup so we can overwrite the original to listen to changes just as properties as well as track new attributes note* IE doesnt allow call, apply on document or window */
      __setAttribute = (function()
      {
        var __set = Element.prototype.setAttribute;
        
        return function(){
          return __set.apply((__GlobalNodes__.indexOf(this) !== -1 ? document.documentElement : this),arguments);
        }
      }()),
      __removeAttribute = (function()
      {
        var __remove = Element.prototype.removeAttribute;
        
        return function(){
          return __remove.apply((__GlobalNodes__.indexOf(this) !== -1 ? document.documentElement : this),arguments);
        }
      }()),

      __getAttribute = (function(){
        var __get = Element.prototype.getAttribute;
        
        return function(){
          return __get.apply((__GlobalNodes__.indexOf(this) !== -1 ? document.documentElement : this),arguments);
        }
      }()),
      
      /* track values for inputs */
      __valueSelectDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value'),
      __valueInputDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value'),
      __valueTextAreaDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value'),
      __checkedInputDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'checked'),
      
      /* used as a faster approach inside the htmlupdate for updating bubbled events, note* IE doesnt allow call, apply on document or window */
      __querySelectorAll =  (function()
      {
        var __query = Element.prototype.querySelectorAll;
        
        return function(){
          return __query.apply((__GlobalNodes__.indexOf(this) !== -1 ? document.documentElement : this),arguments);
        }
      }()),
      
      /* track cssText property changes */
      __cssTextDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,'cssText');
      
      
  
  /* SCOPED LOCALS */
  /* ENDREGION */
  
  /* OBJECT CLASSES */
  /* REGION */
  
  /* The event object that gets passed to each listener */
  function changeEvent(value,oldValue,target,attr,style,args,action,srcElement,type,stop,cancelable,bubbles)
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
      this.target.__pikantnyExtensions__.stop = this.stopped = true;
    }
    
    /* if the event can be cancelled (not implemented) */
    this.cancelable = (cancelable || true);
    
    /* if default was prevented (not implemented) */
    this.defaultPrevented = false;
    
    /* if the event can bubble */
    this.bubbles = (bubbles || true);
    
    /* the current value of the property */
    this.value = value;
    
    /* the old value of the property */
    this.oldValue = oldValue;
    
    /* the target node the event is being ran on */
    this.target = target;
    
    /* the name of the property */
    this.attr = attr;
    
    /* in the case the attr is a style Example: `font-size` */
    this.style = style;
    
    /* passed arguments if the property was a method */
    this.arguments = args;
    
    /* the returned result of running that method (update only) */
    this.action = action;
    
    /* the original element that fired the event */
    this.srcElement = srcElement;
    
    /* the name of the listener */
    this.type = type;
    
    /* default stopped telling if update listeners should be stopped */
    this.stopped = false;
    
    /* tells if the update listeners have been stopped or not */
    if(stop) this.target.__pikantnyExtensions__.stop = this.stopped = true;
  }
  
  /* This holds all listeners associated with a particular element */
  function localBinders()
  {
    /* node's property listeners */
    this.attrListeners = {};
    
    /* node's property update listeners */
    this.attrUpdateListeners = {};
    
    /* any bubbled property listeners */
    this.parentAttrListeners = {};
    
    /* any bubbled property update listeners */
    this.parentAttrUpdateListeners = {};
    
    /* all events tied to the node */
    this.events = {};
    
    /* all bubbled Events */
    this.bubbledEvents = {};
    
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
  
  /* OBJECT CLASSES */
  /* ENDREGION */
  
  /* EVENT HELPER METHODS */
  /* REGION */
  
  /* Helper method to loop through listeners and run them, node listeners */
  function loopListener(looper,e)
  {
    /* listeners array */
    var _looper = looper,
        _len = looper.length,
        _e = e,
        _x;
    for(_x=0;_x<_len;_x++)
    {
      /* loop and call listeners */
      looper[_x](_e);
      
      /* if stopImmediatePropogation method was called then we stop calling listeners on this node  */
      if(_e.__stopImmediatePropogation__) break;
    }
  }
  
  /* Helper method to loop through all bubbled listeners and run them parent nodes */
  function loopBubbledListener(looper,e)
  { 
    /* bubbled listeners array */
    var _looper = looper,
        _len = looper.length,
        _e = e,
        _x;
    
    for(_x=0;_x<_len;_x++)
    {
      /* get the parent node for the event */
      _e.target = looper[_x].parent;
      
      /* call bubbled parent node listeners */
      looper[_x].func(_e);
      
      /* stop bubbling if stopImmediatePropogation or stopPropogation is called */
      if(_e.__stopPropogation__ !== undefined) break;
    }
  }
  
  /* checks if the element has the above extensions, if not it adds them */
  function attachLocalBinders(el)
  {
    if(typeof el.__pikantnyExtensions__ === 'undefined') Object.defineProperty(el,'__pikantnyExtensions__',descriptorHidden(new localBinders()));
    return el.__pikantnyExtensions__;
  }
  
  /* note, need to add into account bubbled listeners on nodes that are post inserted into the dom */
  /* .__pikantnyExtensions__.attrListeners, .__pikantnyExtensions__.parentAttrListeners */
  
  function attachAttrEvent(el,key,func)
  {
    var __element = el,
        __children = __querySelectorAll.call(__element,'*'),
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
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
      ext = (children[x].__pikantnyExtensions__ || attachLocalBinders(children[x]));
      if(!ext[__listener][__key]) ext[__listener][__key] = [];
      ext[__listener][__key].push({func:func,parent:el});
    }
  }
  
  function removeAttrEvent(el,key,func)
  {
    var __element = el,
        __children = __querySelectorAll.call(__element,'*'),
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
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
            if(listeners[i].toString() === __stringFunc)
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
      ext = (children[x].__pikantnyExtensions__ || attachLocalBinders(children[x]));
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
  
  function processNewAttr(el,key)
  {
    return Object.defineProperty(el,key,descriptorValue({value:undefined,writable:true,enumerable:true,configurable:true},key));
  }
  
  function processNewStyle(el,key)
  {
    return Object.defineProperty(el.style,key,descriptorInlineStyle(el,key));
  }
  
  function attachHtmlWatcher()
  {
    var q = __querySelectorAll;
    
    function htmlCopyBubbled(parent,el,ext,listeners,isUpdate)
    {
      var __listener = (!isUpdate ? 'parentAttrListeners' : 'parentAttrUpdateListeners'),
          __keys = Object.keys(listeners),
          __extListeners = ext[__listener],
          __len = __keys.length,
          __key,
          __keyInline,
          __cssSpecial,
          __x,
          __lenKey,
          __i;

      for(__x = 0;__x<__len;__x++)
      {
        __key = __keys[__x];
        __keyInline = getInlineKey(__key);
        __cssSpecial = __keyInline.match(/(webkit|moz|ms)/);
        
        /* check specials styles */
        if(__CSSList__.indexOf(__keyInline) !== -1 || (__cssSpecial && !__cssSpecial.index))
        {
          if(listeners[__keyInline].length)
          {
            if(el.style[__keyInline] === undefined) processNewStyle(el,__keyInline);
            attachStyleListeners(el,__keyInline,getStyleKey(__key)); 
          }
        }
        /* check inputs */
        else if(['value','checked','selectedIndex'].indexOf(__key) !== -1)
        {
          if(listeners[__key].length)
          {
            attachInputListeners(el);
          }
        }
        /* check attributes */
        else if(el.getAttribute(__key) === null)
        {
          if(el[__key] === undefined)
          {
            if(__Extended__.indexOf(__key) === -1)
            {
              processNewAttr(el,__key);
            }
          }
        }
        
        if(listeners[__key].length)
        {
          if(listeners[__key][0].parent)
          {
            __extListeners[__key] = listeners[__key].slice(); 
          }
          else
          {
            __extListeners[__key] = [];
            __lenKey = listeners[__key].length;
            for(__i =0;__i<__lenKey;__i++)
            {
              __extListeners[__key][__i] = {parent:parent,func:listeners[__key][__i]};
            }
          }
        }
        else
        {
          __extListeners[__key] = [];
          __lenKey = listeners[__key].length;
          for(__i =0;__i<__lenKey;__i++)
          {
            __extListeners[__key][__i] = {parent:parent,func:listeners[__key][__i]};
          }
        }
      }
    }
    
    /* remember to propogate bubbled events onto new html nodes (do it gently) */
    /* add html listener to remove bubbled listeners properly */
    document.documentElement.addEventListener('htmlupdate',function(e){
      if(e.srcElement.nodeType !== 3 && e.srcElement.nodeType !== 8)
      {
        /* fetch current target listeners and parent bubbled listeners */
        var __element = e.srcElement,
            __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
            __children = q.call(__element,'*'),
            __child,
            __childExtensions,
            __len = __children.length,
            __x;

        for(__x=0;__x<__len;__x++)
        {
          __child = __children[__x];
          if(!__child.__pikantnyExtensions__)
          {
            __childExtensions = attachLocalBinders(__child);
            /* copy listeners over */
            htmlCopyBubbled(__element,__child,__childExtensions,__extensions.attrListeners);
            /* copy update listeners over */
            htmlCopyBubbled(__element,__child,__childExtensions,__extensions.attrUpdateListeners,true);
            /* copy parent listeners over */
            htmlCopyBubbled(__element,__child,__childExtensions,__extensions.parentAttrListeners);
            /* copy parent update listeners over */
            htmlCopyBubbled(__element,__child,__childExtensions,__extensions.parentAttrUpdateListeners,true);
          }
        }
      }
    });
  }
  
  /* handle ability to stop an update */
  if(Element.prototype.stop === undefined)
  {
      Element.prototype.stop = function(){ 
          (this.__pikantnyExtensions__ || attachLocalBinders(this)).stop = true;
          return this;
      };
  }
  
  /* ENDREGION */
  
  /* SET/UPDATE METHODS */
  /* REGION */
  
  /* runs the associated pre value set listeners */
  function _setStandard(el, prop, val, oldValue, __extensions, stop, args, action, style)
  {
    /* create event */
    var e = new changeEvent(val,oldValue,el,prop,style,args,el,prop,stop);
    
    /* get standard and bubbled listeners */
    var localAttrListeners = __extensions.attrListeners,
        localParentAttrListeners = __extensions.parentAttrListeners,
        all = __all__;

    /* loop local listeners first */
    if(localAttrListeners[prop])
    {
      loopListener(localAttrListeners[prop],e);
    }

    /* if a * (all) listener was added, loop them */
    if(!e.__stopImmediatePropogation__ && localAttrListeners[all])
    {
      loopListener(localAttrListeners[all],e);
    }

    /* loop bubbled listeners */
    if(!e.__stopPropogation__ && localParentAttrListeners[prop])
    {
      loopBubbledListener(localParentAttrListeners[prop],e);
    }

    /* if a * (all) bubbled listener was added, loop them */
    if(!e.__stopPropogation__ && localParentAttrListeners[all])
    {
      loopBubbledListener(localParentAttrListeners[all],e);
    }
    
    if(e.__preventDefault__) return false;
    return true;
  }
  
  /* runs the associated post value set update listeners */
  function _updateStandard(el, prop, val, oldValue, __extensions, args, action, style)
  {
    /* create event value,oldValue,target,attr,style,arguments,action,srcElement,type,stop,cancelable,bubbles */
    var e = new changeEvent(val,oldValue,el,prop,style,args,action,el,prop+'update');
    /* get standard and bubbled update listeners */
    var localAttrListeners = __extensions.attrUpdateListeners,
        localParentAttrListeners = __extensions.parentAttrUpdateListeners,
        all = __all__;

    /* loop local listeners first */
    if(localAttrListeners[prop])
    {
      loopListener(localAttrListeners[prop],e);
    }

    /* if a * (all) listener was added, loop them */
    if(!e.__stopImmediatePropogation__ && localAttrListeners[all])
    {
      loopListener(localAttrListeners[all],e);
    }

    /* loop bubbled listeners */
    if(!e.__stopPropogation__ && localParentAttrListeners[prop])
    {
      loopBubbledListener(localParentAttrListeners[prop],e);
    }

    /* if a * (all) bubbled listener was added, loop them */
    if(!e.__stopPropogation__ && localParentAttrListeners[all])
    {
      loopBubbledListener(localParentAttrListeners[all],e);
    }
    
    if(e.__preventDefault__) return false;
    return true;
  }
  
  /* ENDREGION */
  
  /* COMMON DESCRIPTORS GET/SET, VALUE, FUNCTION, HIDDEN */
  /* REGION */
  
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
    
    /* if extended passed EX: `innerHTML` will fire standard event as well as `html` event */
    function setExtended(v)
    {
      /* get the current value of this property */
      __oldValue = __descGet.call(this);
      
      /* get the extensions for this node */
      __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
      
      if(__set(this,__key,v,__oldValue,__extensions,__extensions.stop))
      {
        if(__set(this,__extended,v,__oldValue,__extensions,__extensions.stop))
        {
          /* if the default was not prevented, set the value */
          __descSet.call(this,v);

          /* if update listeners were not stopped run them */
          if(__extensions.stop === undefined)
          {
            __update(this,__key,v,__oldValue,__extensions);
            __update(this,__extended,v,__oldValue,__extensions);
          }
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
      __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
      
      /* run the pre value set listeners */
      if(__set(this,__key,v,__oldValue,__extensions,__extensions.stop))
      {
        /* if the default was not prevented, set the value */
        __descSet.call(this,v);

        /* if update listeners were not stopped run them */
        if(!__extensions.stop) __update(this,__key,v,__oldValue,__extensions);
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
  function descriptorValue(descriptor,key,extended)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __descriptor = descriptor,
        __key = key,
        __extended = extended,
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
    
    function setExtended(v)
    {
      /* if the property was not supposed to be writable do not let it to be set */
      if(__writable)
      {
        /* get the current value of this property */
        __oldValue = __descriptor.value;

        /* get the extensions for this node */
        __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));

        if(__set(this,__key,v,__oldValue,__extensions,__extensions.stop))
        {
          if(__set(this,__extended,v,__oldValue,__extensions,__extensions.stop))
          {
            /* if the default was not prevented, set the value */
            __descriptor.value = v;

            /* if update listeners were not stopped run them */
            if(!__extensions.stop)
            {
              __update(this,__key,v,__oldValue,__extensions);
              __update(this,__extended,v,__oldValue,__extensions);
            }
          }
        }
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
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
        __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
        
        /* run the pre value set listeners */
        if(__set(this,__key,v,__oldValue,__extensions,__extensions.stop))
        {
          /* if the default was not prevented, set the value */
          __descriptor.value = v;
          
          /* if update listeners were not stopped run them */
          if(!__extensions.stop) __update(this,__key,v,__oldValue,__extensions);
        } 
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
    }
    
    /* return new descriptor */
    return {
      get:get,
      set:(__extended ? setExtended : set),
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
      __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
      
      /* run the pre method activation listeners */
      if(__set(this,__key,undefined,undefined,__extensions,__extensions.stop,arguments))
      {
        if(__set(this,__extended,undefined,undefined,__extensions,__extensions.stop,arguments))
        {
          /* run the associated method */
          __action = __descVal.apply(this,arguments);

          /* we don't want to create a circular reference */
          if(__key === 'addEventListener' && arguments[0] === 'addEventListenerupdate') __extensions.stop = true;

          /* if update listeners were not stopped run them */
          if(!__extensions.stop)
          {
            __update(this,__key,undefined,undefined,__extensions,arguments,__action);
            __update(this,__extended,undefined,undefined,__extensions,arguments,__action);
          }
        }
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
      return __action;
    }
    
    /* allows quickly running the original function and not the observable function */
    setExtended.base = __descVal;
    
    /* the new function that will be used as the value for this descriptor */
    function set()
    {
      /* get the extensions for this node */
      __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
      
      /* run the pre method activation listeners */
      if(__set(this,__key,undefined,undefined,__extensions,__extensions.stop,arguments))
      {
        /* run the associated method */
        __action = __descVal.apply(this,arguments);

        /* we don't want to create a circular reference */
        if(__key === 'addEventListener' && arguments[0] === 'addEventListenerupdate') __extensions.stop = true;

        /* if update listeners were not stopped run them */
        if(!__extensions.stop) __update(this,__key,undefined,undefined,__extensions,arguments,__action);
      }
      
      /* reset update stop */
      __extensions.stop = undefined;
      return __action;
    }
    
    /* allows quickly running the original function and not the observable function */
    set.base = __descVal;
    
    /* return new descriptor */
    return {
      value:(__extended ? setExtended : set),
      writable:false,
      enumerable:descriptor.enumerable,
      configurable:false
    }
  }
  
  /* ENDREGION */
  
  /* SETATTRIBUTE DESCRIPTORS AND OVERWRITES */
  /* REGION */
  
  /* handle attribute setting */
  Element.prototype.setAttribute = descriptorSetAttribute;
  Element.prototype.removeAttribute = descriptorRemoveAttribute;
  
  /* Used in connection with attribute nodes, as they update through these properties */
  Object.defineProperty(Node.prototype,'nodeValue',descriptorAttribute(Object.getOwnPropertyDescriptor(Node.prototype,'nodeValue'),'nodeValue'));
  Object.defineProperty(Node.prototype,'textContent',descriptorAttribute(Object.getOwnPropertyDescriptor(Node.prototype,'textContent'),'textContent'));
  
  /* some browsers don't support the value property */
  var __valDescriptor = Object.getOwnPropertyDescriptor(Attr.prototype,'value');
  if(__valDescriptor) Object.defineProperty(Attr.prototype,'value',descriptorAttribute(__valDescriptor,'value'));
  
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
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));
        
        /* run the pre value set listeners */
        if(__set(__element,__key,v,__oldValue,__extensions,__extensions.stop))
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
              __element.style[key] = __cssRules[key];
            }
          }
          
          /* if the key is not a style set the attribute */
          if(__key !== 'style')
          {
            if(__AttrTranslate__[key])
            {
              if(__set(__element,__AttrTranslate__[key],v,__oldValue,__extensions,__extensions.stop))
              {
                __descSet.call(this,v);
              }
            }
            else
            {
              __descSet.call(this,v);
            }
          }
          
          /* if update listeners were not stopped, run them */
          if(!__extensions.stop)
          {
            __update(__element,__key,v,__oldValue,__extensions);
            if(__AttrTranslate__[key]) __update(__element,__AttrTranslate__[key],v,__oldValue,__extensions);
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
  
  /* for when `setAttribute` method is ran to apply to standard listeners and property listeners. Example: `class` fires all `class` listeners
     if style is set all style listeners must be properly applied */
  function descriptorSetAttribute(key,value)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __oldValue = __getAttribute.call(this,key),
        __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this)),
        __cssRules,
        __styleKeys,
        __styleKey,
        __styleLen,
        __styleX;
    
    /* run the pre value set listeners for the method and the attr name */
    if(_setStandard(this,'setAttribute',undefined,undefined,__extensions,__extensions.stop,arguments))
    {
      if(_setStandard(this,key,value,__oldValue,__extensions,__extensions.stop))
      {
        /* if the key is style fire the style changes on the style object */
        if(key === 'style')
        {
          /* convert string to object */
          __cssRules = getCSSTextChanges(__oldValue,value);
          __styleKeys = Object.keys(__cssRules);
          __styleLen = __styleKeys.length;
          for(__styleX = 0;__styleX<__styleLen;__styleX++)
          {
            __styleKey = __styleKeys[__styleX];
            this.style[__styleKey] = __cssRules[__styleKey];
          }
        }
        

        /* run setAttribute unless the key is style as the attribute is already is already set inline */
        else
        {
          if(__AttrTranslate__[key])
          {
            if(_setStandard(this,__AttrTranslate__[key],value,__oldValue,__extensions,__extensions.stop))
            {
              __setAttribute.call(this,key,value);
            }
          }
          else
          {
            __setAttribute.call(this,key,value);
          }
        }

        /* if update is not stopped run update listeners */
        if(!__extensions.stop)
        {
          _updateStandard(this,'setAttribute',undefined,undefined,__extensions,arguments);
          _updateStandard(this,key,value,__oldValue,__extensions,arguments);
          if(__AttrTranslate__[key]) _updateStandard(this,__AttrTranslate__[key],value,__oldValue,__extensions,arguments);
        }
      }
    }
    
    /* reset update stop */
    __extensions.stop = undefined;
    return undefined;
  }
  
  /* for when `removeAttribute` method is ran to apply to standard listeners, if style is removed all style events must be properly fired */
  function descriptorRemoveAttribute(key)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __oldValue = (this.attributes.getNamedItem(key) ? this.attributes.getNamedItem(key).value : null),
        __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this)),
        __cssRules;
    
    /* run the pre value remove listeners for the method and the attr name */
    if(_setStandard(this,'removeAttribute',undefined,undefined,__extensions,__extensions.stop,arguments))
    {
      if(_setStandard(this,key,undefined,__oldValue,__extensions,__extensions.stop))
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
        if(__AttrTranslate__[key])
        {
          if(_setStandard(this,__AttrTranslate__[key],undefined,__oldValue,__extensions,__extensions.stop))
          {
            __removeAttribute.call(this,key);
          }
        }
        else
        {
          __removeAttribute.call(this,key);
        }
        
        /* if update is not stopped run update listeners */
        if(!__extensions.stop)
        {
          _updateStandard(this,'removeAttribute',undefined,undefined,__extensions,__extensions.stop,arguments);
          _updateStandard(this,key,undefined,__oldValue,__extensions,__extensions.stop,arguments);
          if(__AttrTranslate__[key]) _updateStandard(this,__AttrTranslate__[key],undefined,__oldValue,__extensions,__extensions.stop,arguments);
        }
      }
    }
    
    /* reset update stop */
    __extensions.stop = undefined;
    
    return undefined;
  }
  
  /* ENDREGION */
  
  /* EVENT DESCRIPTORS AND OVERWRITES */
  /* REGION */
  
  /* handle event recording */
  EventTarget.prototype.addEventListener = descriptorAddEventListener;
  EventTarget.prototype.removeEventListener = descriptorRemoveEventListener;
  
  /* applied for inline `onclick`, `onkeyup`, etc. like properties, EX: `element.onclick = function(){}` fires event */
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
      __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
      
      /* run the pre value set listeners */
      if(__set(this,__key,v,__oldValue,__extensions,__extensions.stop))
      {
        /* set the new value */
        __descSet.call(this,v);
        
        /* if update listeners were not stopped run them */
        if(!__extensions.stop) __update(this,__key,v,__extensions,__oldValue);
        
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
  
  /* process Event, controls all listener access */
  function descriptorAddEventListener(key,func)
  {
    //if(this === document) return console.error("Note* You can not add a listener to the `document` object, use `document.documentElement` instead\n", "This issue is due to IE/Edge bug in regards to not allowing descriptor `document.querySelectorAll` to be used on `document`\n\n", new Error().stack);
    /* closured local var's for increased perf */
    var __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
    
    if(_setStandard(this,'addEventListener',undefined,undefined,__extensions,__extensions.stop,arguments))
    {
      /* prior for standard events */
      __addEventListener.call(this,key,func);

      if(!__extensions.stop)
      {
        _updateStandard(this,'addEventListener',undefined,undefined,__extensions,__extensions.stop,arguments);
      }

      if(__EventList__.indexOf('on'+key) === -1)
      {
        /* post for adding to updateStandard too soon */
        processEvent.apply(this,arguments); 
      }
      else
      {
        /* add to event object for viewing */
        listenerEventIntersect(this,key,func,false);
      }
    } 
    __extensions.stop = undefined;
    return undefined;
  }
  
  /* process event removal, controls listener access removal */
  function descriptorRemoveEventListener(key,func)
  {
    //if(this === document) return console.error("Note* You can not remove a listener from the `document` object, use `document.documentElement` instead\n", "This issue is due to IE/Edge bug in regards to not allowing descriptor `document.querySelectorAll` to be used on `document`\n\n", new Error().stack);
    /* closured local var's for increased perf */
    var __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
    if(_setStandard(this,'removeEventListener',undefined,undefined,__extensions,__extensions.stop,arguments))
    {
      __removeEventListener.call(this,key,func);
      if(__EventList__.indexOf('on'+key) === -1)
      {
        processEventRemoval.apply(this,arguments);
      }
      else
      {
        /* add to event object for viewing */
        listenerEventIntersect(this,key,func,true);
      }

      if(!__extensions.stop)
      {
        _updateStandard(this,'removeEventListener',undefined,undefined,__extensions,__extensions.stop,arguments);
      }
    }
    __extensions.stop = undefined;
    return undefined;
  }
  
  /* note, need to add into account bubbled listeners on nodes that are post inserted into the dom */
  /* .__pikantnyExtensions__.attrListeners, .__pikantnyExtensions__.parentAttrListeners */
  
  function processEvent(key,func)
  {
    /* handle inline css change listeners, attribute, and cssText, setProperty */
    var __element = this,
        __truekey = key.replace('update',''),
        __cssInlineKey = getInlineKey(__truekey),
        __cssSpecial = __cssInlineKey.match(/(webkit|moz|ms)/);
        
    if(__CSSList__.indexOf(__cssInlineKey) !== -1 || (__cssSpecial && __cssSpecial.index === 0))
    {
      var __cssKey = getStyleKey(__truekey),
          __hasUpdate = (key.indexOf('update') !== -1 ? 'update' : '');
      
      if(!__element.style[__cssInlineKey])
      {
        processNewStyle(__element,__cssInlineKey);
        var __children = __querySelectorAll.call(__element,'*');
        for(var x=0,len=__children.length;x<len;x++)
        {
          processNewStyle(__children[x],__cssInlineKey);
        }
      }
      
      processStyleEvent(__element,__cssInlineKey,__cssKey);
      attachAttrEvent(__element,(__cssInlineKey+__hasUpdate),func);
      return __cssInlineKey;
    }
    
    /* handle complicated `value` and `checked` and `selectedIndex` change listeners */
    else if(['checked','value','selectedIndex'].indexOf(key) !== -1)
    {
      /* if its an input and we are looking for checked, values, and selectedIndex, easy listener addons */
      if(['input','textarea'].indexOf(this.nodeName.toLowerCase()) !== -1)
      {
        applyTextChanges(this);
      }
      else if(['select'].indexOf(this.nodeName.toLowerCase()) !== -1)
      {
        applySelectChanges(this);
      }
      else if(this.childNodes.length !== 0)
      {
        var __inputs = __querySelectorAll.call(this,'input'),
            __textareas = __querySelectorAll.call(this,'textarea'),
            __select = __querySelectorAll.call(this,'select');
        
        function loop(els,isSelect)
        {
          for(var x=0,len=els.length;x<len;x++)
          {
            if(isSelect)
            {
              applySelectChanges(els[x]);
            }
            else
            {
              applyTextChanges(els[x]);
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
    else if(__GlobalNodes__.indexOf(__element) === -1 && __element.getAttribute(__truekey) === null && !__element[__truekey] && __Extended__.indexOf(__truekey) === -1)
    {
      processNewAttr(__element,__truekey);
      var __children = __querySelectorAll.call(__element,'*');
      for(var x=0,len=__children.length;x<len;x++)
      {
        processNewAttr(__children[x],__truekey);
      }
    }
    attachAttrEvent(__element,key,func);
  }
  
  /* only removes non bubbled, so we then just must remove none and ignore if has bubbled */
  function processEventRemoval(key,func)
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __cssInlineKey = getInlineKey(key),
        __cssSpecial = __cssInlineKey.match(/(webkit|moz|ms)/);
    
    if(__CSSList__.indexOf(__cssInlineKey) !== -1  || (__cssSpecial && __cssSpecial.index === 0))
    {
      var __cssKey = getStyleKey(key);
      
      removeAttrEvent(__element,[__cssKey,__cssInlineKey],func);
      return __cssInlineKey;
    }
    
    if(['checked','value','selectedIndex'].indexOf(key) !== -1)
    {
      /* run up the tree checking for events, should be run down the tree? */
      var __isBubbleRemovable = (!__extensions.parentAttrListeners[key] || __extensions.parentAttrListeners[key].length < 2);

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
          var __inputs = __querySelectorAll.call(this,'input'),
              __textareas = __querySelectorAll.call(this,'textarea'),
              __select = __querySelectorAll.call(this,'select'),
              __element = this;
          
          /* need to check if listeners are on attrListeners and not to remove if so */
          function loop(els,type)
          {
            for(var x=0,len=els.length,isBubbleRemovable,isRadio,el,ext;x<len;x++)
            {
              el = els[x];
              ext = (el.__pikantnyExtensions__ || attachLocalBinders(el));
              isRadio = (['checkbox','radio'].indexOf(el.type) !== -1);
              isBubbleRemovable = (!ext.parentAttrListeners[key] || ext.parentAttrListeners[key].length < 2)
              
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
  
  /* controls keeping track of all events on an element, events are viewable via pikantny.events(element) */
  function listenerEventIntersect(el,key,value,remove,oldValue)
  {
    /* get extension and all associated events */
    var __extensions = (el.__pikantnyExtensions__ || attachLocalBinders(el)),
        __events = __extensions.events,
        __local = __events[key],
        __children = __querySelectorAll.call(el,'*');
    
    /* create associated events array if it does not exist */
    if(!__local) __local = __events[key] = [];
    
    /* if we are updating or removing an event we must remove the old one */
    if(oldValue && __local.indexOf(oldValue) !== -1 || !!remove)
    {
      __local.splice(__local.indexOf((oldValue || value)),1);
      
      for(var x=0,len=__children.length,child,ext,events,local;x<len;x++)
      {
        child = __children[x];
        ext = (child.__pikantnyExtensions__ || attachLocalBinders(child));
        events = ext.bubbledEvents;
        local = events[key];
        
        /* create associated events array if it does not exist */
        if(!local) local = events[key] = [];
        
        local.splice(local.indexOf((oldValue || value)),1);
      }
    }
    
    /* if we are not just removing an event add it to the proper array */
    if(!remove)
    {
      __events[key][__local.length] = value;
      
      for(var x=0,len=__children.length,child,ext,events,local;x<len;x++)
      {
        child = __children[x];
        ext = (child.__pikantnyExtensions__ || attachLocalBinders(child));
        events = ext.bubbledEvents;
        local = events[key];
        
        /* create associated events array if it does not exist */
        if(!local) local = events[key] = [];
        
        events[key][local.length] = value;
      }
    }
  }
  
  /* ENDREGION */
  
  /* STYLE DESCRIPTORS AND OVERWRITES */
  /* REGION */
  
  /* needs rework */
  /* when a style listener is added to an element we convert the `style` object key to an observable */
  function descriptorInlineStyle(element,key)
  {
    /* closured descriptor, used methods and local var's for increased perf */
    var __proto = element.style,
        __removeProperty = __proto.removeProperty,
        __setProperty = __proto.setProperty,
        __keyInline = getInlineKey(key),
        __keyStyle = getStyleKey(key),
        __element = element,
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = {},
        __oldValue = __proto[__keyInline],
        __value = __proto[__keyInline];
    
    /* getter */
    function get()
    {
      return __value;
    }
    
    /* setter */
    function set(v)
    {
      __oldValue = __value;
      __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));

      /* run pre value listeners for both inline key and css style key */
      if(__set(__element,__keyInline,v,__oldValue,__extensions,__extensions.stop,undefined,undefined,__keyStyle))
      {
        __value = v;
        if(typeof v === 'string' && v.length === 0)
        {
          /* inline style helps dif whether the setProperty method was ran or the inline style was changed */
          __extensions.inlinestyle = true;
          __removeProperty.call(__proto,__keyStyle);
        }
        else
        {
          /* inline style helps dif whether the setProperty method was ran or the inline style was changed */
          __extensions.inlinestyle = true;
          __setProperty.call(__proto,__keyStyle,v);
        }


        if(!__extensions.stop)
        {
          __update(__element,__keyInline,v,__oldValue,__extensions,false,undefined,undefined,__keyStyle);
        }
      }
      __extensions.stop = undefined;
    }
    
    return {
      get:get,
      set:set,
      enumerable:true,
      configurable:true
    }
  }
  
  /* needs rework */
  /* if the cssText property on the style Object is set we parse it */
  function descriptorCSSText(element)
  {
    var __proto = element.style,
        __descriptor = __cssTextDescriptor,
        __element = element,
        __set = _setStandard,
        __update = _updateStandard,
        __descGet = __descriptor.get,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __oldValue = __proto.csssText,
        __cssRules;
    
    function set(v)
    {
      __oldValue = __descGet.call(this);
      if(__set(__element,'cssText',v,__oldValue,__extensions,__extensions.stop))
      {
        __cssRules = getCSSTextChanges(__oldValue,v);
        for(var x=0,keys=Object.keys(__cssRules),len=keys.length,key;x<len;x++)
        {
          key = keys[x];
          this[key] = __cssRules[key];
        }
        
        if(!__extensions.stop)
        {
          __update(__element,'cssText',v,__oldValue,__extensions);
        }
      }
      __extensions.stop = undefined;
    }
    
    return {
      get:__descGet,
      set:set,
      enumerable:true,
      configurable:false
    };
  }
  
  /* in the case that setProperty method on the style Object is directly called, this is main method ran when any style is set */
  function descriptorCSSSetProperty(element)
  {
    var __proto = element.style,
        __element = element,
        __descSet = __proto.setProperty,
        __cssList = __CSSList__,
        __getInlineKey = getInlineKey,
        __getStyleKey = getStyleKey,
        __keyInline,
        __keyStyle,
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __standardExists,
        __action = undefined;
    
    function set(key,v,priority)
    {
      if(typeof v === 'string' && v.length === 0) return (__proto.removeProperty(key));
      
      if(!__extensions.inlinestyle)
      {
        __keyInline = __getInlineKey(key);
        __keyStyle = __getStyleKey(key);
        
        if(__set(__element,__keyInline,undefined,undefined,__extensions,__extensions.stop,arguments,undefined,__keyStyle))
        {
          __action = __descSet.apply(this,arguments);
          if(!__extensions.stop) 
          {
            __update(__element,__keyInline,undefined,undefined,__extensions,__extensions.stop,arguments,__action,__keyStyle);
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
      writable:true,
      enumerable:true,
      configurable:false
    };
  }
  
  /* needs rework */
  /* in the case that removeProperty method on the style Object is directly called */
  function descriptorCSSRemoveProperty(element)
  {
    var __proto = element.style,
        __element = element,
        __descSet = __proto.removeProperty,
        __cssList = __CSSList__,
        __getInlineKey = getInlineKey,
        __getStyleKey = getStyleKey,
        __keyInline,
        __keyStyle,
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __standardExists,
        __action = undefined;
    
    function set(key)
    {
      if(!__extensions.inlinestyle)
      {
        __keyInline = __getInlineKey(key);
        __keyStyle = __getStyleKey(key);
        
        if(__set(__element,__keyInline,undefined,undefined,__extensions,__extensions.stop,arguments,undefined,__keyStyle))
        {
          __action = __descSet.apply(this,arguments);
          if(!__extensions.stop) 
          {
            __update(__element,__keyInline,undefined,undefined,__extensions,__extensions.stop,arguments,__action,__keyStyle);
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
      writable:true,
      enumerable:true,
      configurable:false
    };
  }
  
  /* formats a standard css key into an inline key */
  function getInlineKey(key)
  {
    if(key.indexOf('-webkit') === 0) key = key.replace('-webkit','webkit');
    if(key.indexOf('-moz') === 0) key = key.replace('-moz','moz');
    if(key.indexOf('-ms') === 0) key = key.replace('-ms','ms');
    
    return key.replace(/\-(.)/g,function(dash,char){return char.toUpperCase();});
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
  
  /* converts an css text style string into an object */
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
      if(!__cssRules[prop]) __cssRules[prop] = '';
    }
    
    return __cssRules;
  }
  
  /* due to bug in chrome 50+ we add the object also to style so we can see if the GC has renewed the style object */
  function attachStyleListeners(element,key,keyProper)
  {
    var __element = element,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __elementList = __element.style.__styleList__,
        __list = __extensions.__styleList__;
    
    if(!__list || !__elementList)
    {
      __list = __extensions.__styleList__ = [];
      __elementList = __element.style.__styleList__ = [];
      
      Object.defineProperty(__element.style,'setProperty',descriptorCSSSetProperty(__element));
      Object.defineProperty(__element.style,'removeProperty',descriptorCSSRemoveProperty(__element));
      Object.defineProperty(__element.style,'cssText',descriptorCSSText(__element));
    }
    
    if(__list.indexOf(key) === -1)
    {
      /* set local style listener first */
      Object.defineProperty(__element.style,key,descriptorInlineStyle(__element,key,keyProper));
      __extensions.__styleList__[__list.length] = key;
      __element.style.__styleList__[__elementList.length] = key;
      return true;
    }
    
    if(__elementList.indexOf(key) === -1 && __list.indexOf(key) !== -1)
    {
      /* set local style listener first */
      Object.defineProperty(__element.style,key,descriptorInlineStyle(__element,key,keyProper));
      __element.style.__styleList__[__elementList.length] = key;
    }
    return false;
  }
  
  function processStyleEvent(element,key,keyProper)
  {
    if(attachStyleListeners(element,key,keyProper))
    {
      /* this allows for bubbling to take effect */
      var __children = __querySelectorAll.call(element,'*');
      
      for(var x=0,len=__children.length;x<len;x++)
      {
        attachStyleListeners(__children[x],key,keyProper);
      }
    }
  }
  
  /* ENDREGION */
  
  /* INPUT DESCRIPTORS AND OVERWRITES */
  /* REGION */
  
  /* run from events, need seperate for value and checked being set */
  function runInputEvents(e)
  {
    if(e.defaultPrevented) return false;
    
    var __target = e.target,
        __extensions = (__target.__pikantnyExtensions__ || attachLocalBinders(__target)),
        __set = _setStandard,
        __update = _updateStandard,
        __isRadio = (['checkbox','radio'].indexOf(__target.type) !== -1),
        __oldChecked = __extensions.__prechecked__,
        __oldValue = (__isRadio ? __oldChecked : __extensions.__prevalue__),
        __checked = __target.checked,
        __value = (__isRadio ? __checked : __target.value);

    if(__set(__target,'value',__value,__oldValue,__extensions,__extensions.stop))
    {
      if(__isRadio)
      {
        if(__set(__target,'checked',__checked,__oldChecked,__extensions,__extensions.stop))
        {
          if(!__extensions.stop)
          {
            __update(__target,'value',__value,__oldValue,__extensions);
            __update(__target,'checked',__checked,__oldChecked,__extensions);
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
          if(!__extensions.stop)
          {
            __update(__target,'value',__value,__oldValue,__extensions);
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
        if(__target.nodeName === 'INPUT') __valueInputDescriptor.set.call(__target,__oldValue);
        if(__target.nodeName === 'TEXTAREA') __valueTextAreaDescriptor.set.call(__target,__oldValue);
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
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));
    
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
    
    if(['checkbox','radio'].indexOf(this.type) === -1)
    {
      __extensions.__prevalue__ = this.value;
      
      /* value gets set prior to this running so we can prevent it without user seeing the value, checked requires click event to do the same */
      if(runInputEvents.call(e.target,e) === false)
      {
        e.preventDefault();
        return false;
      }
    }
    else
    {
      __extensions.__prevalue__ = this.value;
      __extensions.__prechecked__ = this.checked;
      
      if(e.type === 'keydown')
      {
        if(runInputEvents.call(this,e) === false)
        {
          e.preventDefault();
          return false;
        }
      }
    }
  }
  
  function inputKeyListener(e)
  {
    if((e.keyCode || e.which) === 32) return inputListener.call(this,e);
    return true;
  }
  
  function inputUpListener(e)
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));
    
    /* in the case 'enter' or 'space' is pressed on a radio input */
    if(['checkbox','radio'].indexOf(this.type) !== -1 && e.type !== 'keydown') runInputEvents.call(this,e);
    
    __extensions.isPressed = false;
  }
  
  function inputKeyUpListener(e)
  {
    if((e.keyCode || e.which) === 32) return inputUpListener.call(this,e);
    return true;
  }
  
  function selectListener(e)
  {
    var __target = e.target,
        __extensions = (__target.__pikantnyExtensions__ || attachLocalBinders(__target)),
        __set = _setStandard,
        __update = _updateStandard,
        __oldValue = __extensions.__prevalue__,
        __oldIndex = __extensions.__preindex__,
        __index = __target.selectedIndex,
        __value = __target.value;
    
    if(__set(__target,'value',__value,__oldValue,__extensions))
    {
      if(__set(__target,'selectedIndex',__index,__oldIndex,__extensions))
      {
        if(!__extensions.stop)
        {
          __update(__target,'value',__value,__oldValue,__extensions);
          __update(__target,'selectedIndex',__index,__oldIndex,__extensions);
        }
      }
    }
    else
    {
      __valueSelectDescriptor.set.call(__target,__oldValue);
      __extensions.stop = undefined;
      return false;
    }
    __extensions.stop = undefined;
    return true;
  }
  
  function selectFocusListener(e)
  {
    var __target = e.target,
        __extensions = (__target.__pikantnyExtensions__ || attachLocalBinders(__target));
    
    __extensions.__prevalue__ = this.value;
    __extensions.__preindex__ = this.selectedIndex;
  }
  
  function applyTextChanges(element)
  {
    var __target = element,
        __extensions = (__target.__pikantnyExtensions__ || attachLocalBinders(__target)),
        __events = __extensions.events;
    
    if(!__extensions.inputExtended)
    {
      __extensions.inputExtended = true;
      __extensions.isPressed = false;
      
      /* need to support html5 input types */
      
      if(['checkbox','radio'].indexOf(__target.type) !== -1)
      {
        __target.addEventListener('mousedown',inputListener,false);
        __target.addEventListener('keydown',inputKeyListener,false);
        __target.addEventListener('click',inputUpListener,false);
        __target.addEventListener('keyup',inputKeyUpListener,false);
        __extensions.__prevalue__ = __target.value;
        __extensions.__prechecked__ = __target.checked.toString();
      }
      else
      {
        __target.addEventListener('keydown',inputListener,false);
        __target.addEventListener('keyup',inputUpListener,false);
        __extensions.__prevalue__ = __target.value;
      }
      return true;
    }
    return false;
  }
  
  function applySelectChanges(element)
  {
    var __target = element,
        __extensions = (__target.__pikantnyExtensions__ || attachLocalBinders(__target)),
        __events = __extensions.events;
    
    if(!__extensions.inputExtended)
    {
      __extensions.inputExtended = true;
      __target.addEventListener('focus',selectFocusListener,false);
      __target.addEventListener('change',selectListener,false);
      __extensions.__prevalue__ = __target.value;
      __extensions.__preindex__ = __target.selectedIndex;
      return true;
    }
    return false;
  }
  
  function attachInputListeners(element)
  {
    return (['INPUT','TEXTAREA'].indexOf(element.nodeName) !== -1 ? applyTextChanges(element) : (element.nodeName === 'SELECT' ? applySelectChanges(element) : false));
  }
  
  /* ENDREGION */
  
  /* MAIN PUBLIC METHODS */
  /* REGION */
  
  function init(title,obj,local)
  {
    if(!local) local = window;
    if(!local.__pikantnyKeyList__) Object.defineProperty(local,'__pikantnyKeyList__',descriptorHidden([]));
    for(var x=0,keys=Object.getOwnPropertyNames(obj),len=keys.length;x<len;x++) init.inject(title,obj,keys[x],local);
    
    return init;
  }
  
  init.inject = function(title,obj,key,local)
  {
    if(!local) local = window;
    if(!local.__pikantnyKeyList__) Object.defineProperty(local,'__pikantnyKeyList__',descriptorHidden([]));
    
    var __extensions = local.__pikantnyKeyList__;
    
    if(__blocked__.indexOf(key) !== -1 || key.indexOf('__') === 0) return init;
    
    if(__extensions[key] && __DoubleList__.indexOf(key) !== -1)
    {
      if(__Double__[key].indexOf(title) === -1 || __extensions[key][title]) return init;
    }
    else if(__extensions[key])
    {
      return init;
    }
    
    var __descriptor = Object.getOwnPropertyDescriptor(obj,key),
        __defined;
    
    if(__descriptor.configurable)
    {
      if(__TextPropertyList__.indexOf(key) !== -1)
      {
        if(__descriptor.set)
        {
          __defined = !!Object.defineProperty(obj,key,descriptorStandard(__descriptor,key,'html'));
        }
        else if(typeof __descriptor.value === 'function')
        {
          __defined = !!Object.defineProperty(obj,key,descriptorFunction(__descriptor,key,'html'));
        }
      }
      else if(__descriptor.set)
      {
        __defined = !!Object.defineProperty(obj,key,descriptorStandard(__descriptor,key));
      }
      else if(typeof __descriptor.value === 'function')
      {
        __defined = !!Object.defineProperty(obj,key,descriptorFunction(__descriptor,key));
      }
      else if(__descriptor.value)
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
      
      if(!__extensions[key]) __extensions[key] = {};
      
      __extensions[key][title] = __descriptor;
    }
    return init;
  }
  
  init.observables = function(local)
  {
    return (local || window).__pikantnyKeyList__.slice();
  }
  
  init.isObservable = function(key,local)
  {
    return ((local || window).__pikantnyKeyList__[key] !== undefined);
  }
  
  init.addEventListener = __addEventListener.bind(document.documentElement);
  init.removeEventListener = __removeEventListener.bind(document.documentElement);
  
  init.getEventListeners = function(element)
  {
    var __extensions = (element.__pikantnyExtensions__ || attachLocalBinders(element)),
        __attr = Object.keys(__extensions.attrListeners),
        __attrUpdate = Object.keys(__extensions.attrUpdateListeners),
        __domEvents = Object.keys(__extensions.events),
        __events = {};
    
    /* loop standard attribute events */
    for(var x=0,len=__attr.length;x<len;x++)
    {
      __events[__attr[x]] = __extensions.attrListeners[__attr[x]].slice();
    }
    
    /* loop update attribute events */
    for(var x=0,len=__attrUpdate.length;x<len;x++)
    {
      __events[__attrUpdate[x]+'update'] = __extensions.attrUpdateListeners[__attrUpdate[x]].slice();
    }
    
    /* loop dom events */
    for(var x=0,len=__domEvents.length;x<len;x++)
    {
      __events[__domEvents[x]] = __extensions.events[__domEvents[x]].slice();
    }
    
    return __events;
  }
  
  init.getBubbledEventListeners = function(element)
  {
    var __extensions = (element.__pikantnyExtensions__ || attachLocalBinders(element)),
        __attr = Object.keys(__extensions.parentAttrListeners),
        __attrUpdate = Object.keys(__extensions.parentAttrUpdateListeners),
        __domEvents = Object.keys(__extensions.bubbledEvents),
        __events = {};
    
    /* loop bubbled standard attribute events */
    for(var x=0,len=__attr.length;x<len;x++)
    {
      __events[__attr[x]] = __extensions.parentAttrListeners[__attr[x]].slice();
    }
    
    /* loop bubbled update attribute events */
    for(var x=0,len=__attrUpdate.length;x<len;x++)
    {
      __events[__attrUpdate[x]+'update'] = __extensions.parentAttrUpdateListeners[__attrUpdate[x]].slice();
    }
    
    /* loop bubbled dom events */
    for(var x=0,len=__domEvents.length;x<len;x++)
    {
      __events[__domEvents[x]] = __extensions.bubbledEvents[__domEvents[x]].slice();
    }
    
    return __events;
  }
  
  /* ENDREGION */
  
  /* CONSTRUCTOR */
  /* REGION */
  
  /* main loop for all dom prototypes */
  for(var x=0,len=__GlobalList__.length,proto;x<len;x++)
  {
    if(window[__GlobalList__[x]] !== undefined && window[__GlobalList__[x]].prototype !== undefined) init(__GlobalList__[x],window[__GlobalList__[x]].prototype,window);
  }
  
  attachHtmlWatcher();
  /* ENDREGION */
  
  /* AMD AND COMMONJS COMPATABILITY */
  /* REGION */
  
  if (typeof define === "function" && define.amd){
    define('pikantny',function(){return init;});
  }
  if(typeof module === 'object' && typeof module.exports === 'object'){
    module.exports.pikantny = init;
  }
  
  /* ENDREGION */
  
  return init;
}());