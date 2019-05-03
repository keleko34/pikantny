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
	  -- workaround using __pikantnyExtensions__.__GCSTYLEFIX__ = element.style;
*/

/* TODO */

/* add extensions to detached nodes, keep track of detached nodes - needs checks on removeChild, innerHMTL, outerHMTL, creation */
/* add descriptor for attributes.setNamedItems, attributes.removeNamedItems */
/* work in CSSSpecials and InputIgnores, checkedInputsDescriptor */

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
      
      /* This allows using a single keyword for multiple listener types, May extend this to be allowed to be set by users */
      __Extended__ = {
        textContent: 'html',
        innerHTML: 'html',
        innerText: 'html',
        outerHTML: 'html',
        outerText: 'html',
        appendChild: 'html',
        removeChild: 'html',
        replaceChild: 'html',
        insertAdjacentHTML: 'html',
        insertAdjacentElement: 'html',
        insertAdjacentText: 'html',
        insertBefore: 'html',
        prepend: 'html',
        className: 'class'
      },
      __NonTraditional__ = ['html'],
      
      /* helps with easier style listening changes as .style is an object created afterwards and acts differently than your standard dom property */
      __CSSList__ = Object.getOwnPropertyNames(document.head.style)
                    .concat(Object.getOwnPropertyNames(document.head.style.__proto__))
                    .concat((CSSStyleDeclaration ? Object.getOwnPropertyNames(CSSStyleDeclaration.prototype) : []))
                    .filter(function(v,i,ar){return (ar.indexOf(v) === i);}),
      
      /* allowing us to see the original events, and to skip observing when using addEventListener */
      __EventList__ = Object.keys(HTMLElement.prototype).filter(function(v){return (v.indexOf('on') === 0);})
      .concat(['onDOMContentLoaded','onDOMAttributeNameChanged','onDOMAttrModified','onDOMCharacterDataModified','onDOMNodeInserted','onDOMNodeRemoved','onDOMSubtreeModified']),
      
      /* setAttribute translators to fire events for their property counterparts */
      __AttrTranslate__ = {
        'class': 'className',
        'tabindex': 'tabIndex'
      },
      
      /* firefox does not fire a keydown event, helps us detect IME keyboards */
      __InputIMEDetect__ = [
        'Unidentified', //IE
        'Process' //Chrome
      ],
      
      /* allows listening for all changes no matter what it is */
      __all__ = '*',
      
      __GlobalNodes__ = [window,document];
  
  /* ENDREGION */
  
  /* DESCRIPTOR LOCALS */
  /* REGION */
  if(typeof EventTarget === 'undefined') window.EventTarget = Node;
      /* backup to allow complex listening actions, Check is for IE as EventTarget does not exist in IE */
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
      __indexSelectDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'selectedIndex'),
      __valueInputDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value'),
      __valueTextAreaDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value'),
      
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
  function changeEvent(value,oldValue,target,attr,style,args,action,srcElement,type,stop,cancelable,bubbles, extended)
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
    
    /* if the event is currently being propogated */
    this.bubbled = false;
    
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
    
    /* if an extended prop was used this will be the original item changed */
    this.extended = extended;
    
    /* tells if the update listeners have been stopped or not */
    if(stop) this.target.__pikantnyExtensions__.stop = this.stopped = true;
  }
  
  /* This holds all listeners associated with a particular element */
  function localBinders(pass)
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
    
    /* passed extension params */
    if(pass)
    {
      var __keys = Object.keys(pass),
          __key,
          __x = 0,
          __len = __keys.length;
      
      for(__x;__x<__len;__x++)
      {
        __key = __keys[__x];
        this[__key] = pass[__key];
      }
    }
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
        _len = _looper.length,
        _e = e,
        _x;
    for(_x=0;_x<_len;_x++)
    {
      /* loop and call listeners */
      if(_looper[_x](_e) === false) _e.__preventDefault__ = true;
      
      /* if stopImmediatePropogation method was called then we stop calling listeners on this node  */
      if(_e.__stopImmediatePropogation__) break;
      
      /* Reset length in case any listeners are removed from the list */
      if(_len !== _looper.length)
      {
        x = Math.max(x - (_len - _looper.length), -1);
        _len = _looper.length;
      }
    }
  }
  
  /* Helper method to loop through all bubbled listeners and run them parent nodes */
  function loopBubbledListener(looper,e)
  { 
    /* bubbled listeners array */
    var _looper = looper,
        _len = _looper.length,
        _e = e,
        _x;
    
    for(_x=0;_x<_len;_x++)
    {
      /* get the parent node for the event */
      _e.target = _looper[_x].parent;
      
      /* call bubbled parent node listeners */
      _looper[_x].func(_e);
      
      /* stop bubbling if stopImmediatePropogation or stopPropogation is called */
      if(_e.__stopPropogation__ !== undefined) break;
      
      /* Reset length in case any listeners are removed from the list */
      if(_len !== _looper.length)
      {
        x = Math.max(x - (_len - _looper.length), -1);
        _len = _looper.length;
      }
    }
  }
  
  /* checks if the element has the above extensions, if not it adds them */
  function attachLocalBinders(el, pass)
  {
    if(typeof el.__pikantnyExtensions__ === 'undefined') Object.defineProperty(el,'__pikantnyExtensions__',descriptorHidden(new localBinders(pass)));
    return el.__pikantnyExtensions__;
  }
  
  /* note, need to add into account bubbled listeners on nodes that are post inserted into the dom */
  /* .__pikantnyExtensions__.attrListeners, .__pikantnyExtensions__.parentAttrListeners */
  
  /* Helps us to remove the inputs oninput listeners when there are no more input related listeners */
  function isLastAttrListener(extension,key)
  {
    if(extension.attrListeners[key])
    {
      if(extension.attrListeners[key].length > 1) return false;
    }
    if(extension.attrUpdateListeners[key])
    {
      if(extension.attrUpdateListeners[key].length > 1) return false;
    }
    return true;
  }
  
  function isLastParentAttrListener(extension,key)
  {
    if(extension.parentAttrListeners[key])
    {
      if(extension.parentAttrListeners[key].length > 1) return false;
    }
    if(extension.parentAttrUpdateListeners[key])
    {
      if(extension.parentAttrUpdateListeners[key].length > 1) return false;
    }
    return true;
  }
  
  function attachAttrEvent(el,key,func)
  {
    var __element = el,
        __children = __querySelectorAll.call(__element,'*'),
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __isMultipleKeys = (typeof key === 'object' && !!key.length),
        __isUpdate,
        __listener,
        __key;
    
    /* standard */
    if(__isMultipleKeys)
    {
      for(var x=0,len=key.length;x<len;x++)
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
      __isUpdate = (key.indexOf('update') !== -1);
      __listener = (!__isUpdate ? 'attrListeners' : 'attrUpdateListeners');
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
        __listeners = [],
        __isUpdate,
        __listener,
        __key,
        i,
        lenn;
    
    /* standard */
    if(__isMultipleKeys)
    {
      for(var x=0,len=key.length;x<len;x++)
      {
        __isUpdate = (key[x].indexOf('update') !== -1);
        __listener = (!__isUpdate ? 'attrListeners' : 'attrUpdateListeners');
        __key = (key[x].replace('update',''))
        
        __listeners = __extensions[__listener][__key];
        if(__listeners)
        {
          i = 0;
          lenn = __listeners.length;
          inner:for(i;i<lenn;i++)
          {
            if(__listeners[i].toString() === __stringFunc)
            {
              __listeners.splice(i,1);
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
      __isUpdate = (key.indexOf('update') !== -1);
      __listener = (!__isUpdate ? 'attrListeners' : 'attrUpdateListeners');
      __key = (key.replace('update',''));
      
      __listeners = __extensions[__listener][__key];
      if(__listeners)
      {
        i = 0;
        lenn = __listeners.length;
        inner:for(i;i<lenn;i++)
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
    
    for(var x=0,len=children.length,ext,listeners;x<len;x++)
    {
      ext = (children[x].__pikantnyExtensions__ || attachLocalBinders(children[x]));
      listeners = ext[__listener][__key];
      if(listeners)
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
  
  /* helps with listening to attibutes when a new one is added */
  function processNewAttr(el,key)
  {
    return Object.defineProperty(el,key,descriptorValue({value:undefined,writable:true,enumerable:true,configurable:true},key));
  }
  
  /* helps to listen to style changes when a inline style is set */
  function processNewStyle(el,key)
  {
    return Object.defineProperty(el.style,key,descriptorInlineStyle(el,key));
  }
  
  /* helps for listening when a classname is changed */
  function processClassList(element, classList)
  {
    if(!classList.__add)
    {
      classList.__add = classList.add;
      classList.__remove = classList.remove;

      classList.add = descriptorClassListAdd.bind(element);
      classList.remove = descriptorClassListRemove.bind(element);
    }
  }
  
  /* watches for html changes so as to allow listening on the new elements properties */
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
        else if(['value','checked','selectedIndex'].indexOf(__key) !== -1 && ['INPUT','TEXTAREA','SELECT'].indexOf(el.nodeName) !== -1)
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
            if(__NonTraditional__.indexOf(__key) === -1)
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
            __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element, __element.__pikantnyExtensionsPass__)),
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
  
  if(Text.prototype.stop === undefined)
  {
      Text.prototype.stop = function(){
          (this.__pikantnyExtensions__ || attachLocalBinders(this)).stop = true;
          return this;
      };
  }
  
  /* ENDREGION */
  
  /* SET/UPDATE METHODS */
  /* REGION */
  
  /* runs the associated pre value set listeners */
  function _setStandard(el, prop, val, oldValue, __extensions, stop, args, action, style, extended)
  {
    /* create event */
    // value,oldValue,target,attr,style,args,action,srcElement,type,stop,cancelable,bubbles,extended
    var e = new changeEvent(val,oldValue,el,prop,style,args,action,el,prop,stop,undefined,undefined,extended);
    
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
    
    if(e.bubbles)
    {
      e.bubbled = true;
    
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
    }
    
    if(e.__preventDefault__) return false;
    return true;
  }
  
  /* runs the associated post value set update listeners */
  function _updateStandard(el, prop, val, oldValue, __extensions, args, action, style, extended)
  {
    /* create event */
    // value,oldValue,target,attr,style,args,action,srcElement,type,stop,cancelable,bubbles,extended
    var e = new changeEvent(val,oldValue,el,prop,style,args,action,el,prop+'update',undefined, undefined,undefined,extended);
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
    
    if(e.bubbles)
    {
      e.bubbled = true;

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
        if(__set(this,__extended,v,__oldValue,__extensions,__extensions.stop, undefined, undefined, undefined, __key))
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
          if(__set(this,__extended,v,__oldValue,__extensions,__extensions.stop, undefined, undefined, undefined, __key))
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
        __descVal = __descriptor.value,
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
        if(__set(this,__extended,undefined,undefined,__extensions,__extensions.stop,arguments, undefined, undefined, __key))
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
            __cssRules = getCSSTextChanges(__oldValue,v);
            
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
        __cssRules,
        __currentKey;
    
    /* run the pre value remove listeners for the method and the attr name */
    if(_setStandard(this,'removeAttribute',undefined,undefined,__extensions,__extensions.stop,arguments))
    {
      if(_setStandard(this,key,undefined,__oldValue,__extensions,__extensions.stop))
      {
        /* if style attribute fire individual inline style listeners */
        if(key === 'style')
        {
          /* convert string to object */
          __cssRules = getCSSTextChanges(__oldValue,undefined);
          for(var x=0,keys=Object.keys(__cssRules),len=keys.length;x<len;x++)
          {
            __currentKey = keys[x];
            this.style[__currentKey] = __cssRules[__currentKey]
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
  
  function descriptorClassListAdd(value)
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __classList = __element.classList,
        __add = __classList.__add,
        __ret = 0;
    
    if(_setStandard(this,'class','',value,__extensions,__extensions.stop))
    {
      if(_setStandard(this,'className','',value,__extensions,__extensions.stop))
      {
        __ret = __add.call(__classList,value);
        if(!__extensions.stop)
        {
          _updateStandard(this,'class','',value,__extensions);
          _updateStandard(this,'className','',value,__extensions);
        }
      }
    }
    return __ret;
  }
  
  function descriptorClassListRemove(value)
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __classList = __element.classList,
        __remove = __classList.__remove,
        __ret = 0;
    
    if(_setStandard(this,'class',value,'',__extensions,__extensions.stop))
    {
      if(_setStandard(this,'className',value,'',__extensions,__extensions.stop))
      {
        __ret = __remove.call(__classList,value);
        if(!__extensions.stop)
        {
          _updateStandard(this,'class',value,'',__extensions);
          _updateStandard(this,'className',value,'',__extensions);
        }
      }
    }
    return __ret;
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
  function descriptorAddEventListener(key,func, options)
  {
    //if(this === document) return console.error("Note* You can not add a listener to the `document` object, use `document.documentElement` instead\n", "This issue is due to IE/Edge bug in regards to not allowing descriptor `document.querySelectorAll` to be used on `document`\n\n", new Error().stack);
    /* closured local var's for increased perf */
    var __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
    
    if(_setStandard(this,'addEventListener',undefined,undefined,__extensions,__extensions.stop,arguments))
    {
      /* prior for standard events */
      __addEventListener.call(this,key,func, options);

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
  function descriptorRemoveEventListener(key,func, options)
  {
    //if(this === document) return console.error("Note* You can not remove a listener from the `document` object, use `document.documentElement` instead\n", "This issue is due to IE/Edge bug in regards to not allowing descriptor `document.querySelectorAll` to be used on `document`\n\n", new Error().stack);
    /* closured local var's for increased perf */
    var __extensions = (this.__pikantnyExtensions__ || attachLocalBinders(this));
    if(_setStandard(this,'removeEventListener',undefined,undefined,__extensions,__extensions.stop,arguments))
    {
      __removeEventListener.call(this,key,func, options);
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
  
  function loop(els)
  {
    var __len = els.length,
        __ext,
        __x;

    for(__x=0;x<__len;x++)
    {
      __ext = (els[__x].__pikantnyExtensions__ || attachLocalBinders(els[__x]))
      if(!__ext.injectedInput) attachInputListeners(els[__x]);
    }
  }
  
  function processEvent(key,func)
  {
    /* handle inline css change listeners, attribute, and cssText, setProperty, classList */
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __truekey = key.replace('update',''),
        __cssInlineKey = getInlineKey(__truekey),
        __cssSpecial = __cssInlineKey.match(/(webkit|moz|ms)/),
        __children,
        __len,
        __x;
    
    /* in case we have a css proeprty we need to inject the style object for that style */
    if(__CSSList__.indexOf(__cssInlineKey) !== -1 || (__cssSpecial && __cssSpecial.index === 0))
    {
      __children = __querySelectorAll.call(__element,'*');
      __len = __children.length;
      __x = 0;
      
      var __cssKey = getStyleKey(__truekey),
          __hasUpdate = (key.indexOf('update') !== -1 ? 'update' : ''),
          __ext;
          
      if(!__extensions.__styleList__ || __extensions.__styleList__.indexOf(__cssInlineKey) === -1)
      {
        processNewStyle(__element,__cssInlineKey);
      }   
      for(__x;__x<__len;__x++)
      {
        __ext = (__children[__x].__pikantnyExtensions__ || attachLocalBinders(__children[__x]))
        if(!__ext.__styleList__ || __ext.__styleList__.indexOf(__cssInlineKey) === -1) processNewStyle(__children[__x],__cssInlineKey);
      }
      
      processStyleEvent(__element,__cssInlineKey,__cssKey);
      attachAttrEvent(__element,(__cssInlineKey+__hasUpdate),func);
      return __cssInlineKey;
    }
    
    /* handle complicated `value` and `checked` and `selectedIndex` change listeners */
    else if(['value','checked','selectedIndex'].indexOf(__truekey) !== -1)
    {
      /* if its an input and we are looking for checked, values, and selectedIndex, easy listener addons */
      if(['INPUT','TEXTAREA','SELECT'].indexOf(__element.nodeName) !== -1)
      {
        if(!__extensions.injectedInput) attachInputListeners(__element);
      }
      else if(__element.childNodes.length !== 0)
      {
        var __inputs = __querySelectorAll.call(__element,'input'),
            __textareas = __querySelectorAll.call(__element,'textarea'),
            __select = __querySelectorAll.call(__element,'select');
        
        /* loop all */
        if(key === 'value')
        {
          loop(__inputs);
          loop(__textareas);
          loop(__select);
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
    
    /* in case we are trying to listen to class or className we should inject the classList as well */
    else if(['class','className'].indexOf(__truekey) !== -1)
    {
      __children = __querySelectorAll.call(__element,'*');
      __len = __children.length;
      __x = 0;
      
      processClassList(__element,__element.classList);
      for(__x;__x<__len;__x++)
      {
        processClassList(__children[__x],__children[__x].classList);
      }
    }
    else if(__GlobalNodes__.indexOf(__element) === -1 && __element.getAttribute(__truekey) === null && !__element[__truekey] && __NonTraditional__.indexOf(__truekey) === -1)
    {
      processNewAttr(__element,__truekey);
      var __childNodes = __querySelectorAll.call(__element,'*');
      for(var x=0,len=__childNodes.length;x<len;x++)
      {
        processNewAttr(__childNodes[x],__truekey);
      }
    }
    attachAttrEvent(__element,key,func);
  }
  
  /* need to check if listeners are on attrListeners and not to remove if so */
  function loopRemove(els, key, truekey)
  {
    var __len = els.length,
        __key = truekey,
        __ext,
        __el,
        __x = 0;

    for(__x;x<__len;x++)
    {
      __el = els[x];
      __ext = __el.__pikantnyExtensions__;
      if(__ext)
      {
        if(['INPUT','TEXTAREA','SELECT'].indexOf(__el.nodeName) !== -1)
        {
          if(isLastAttrListener(__ext,__key))
          {
            if(isLastParentAttrListener(__ext,__key))
            {
              removeTypeListeners(__el.type,__el);
            }
          }
        }
      }
    }
  }
  
  /* only removes non bubbled, so we then just must remove none and ignore if has bubbled */
  function processEventRemoval(key,func)
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __truekey = key.replace('update',''),
        __cssInlineKey = getInlineKey(key),
        __cssSpecial = __cssInlineKey.match(/(webkit|moz|ms)/);
    
    if(__CSSList__.indexOf(__cssInlineKey) !== -1  || (__cssSpecial && __cssSpecial.index === 0))
    {
      var __cssKey = getStyleKey(key);
      
      removeAttrEvent(__element,[__cssKey,__cssInlineKey],func);
      return __cssInlineKey;
    }
    
    if(['value','checked','selectedIndex'].indexOf(__truekey) !== -1)
    {
      /* run up the tree checking for events, should be run down the tree? */
      if(isLastAttrListener(__extensions,__truekey))
      {
        if(['INPUT','TEXTAREA','SELECT'].indexOf(__element.nodeName) !== -1)
        {
          if(isLastParentAttrListener(__extensions,__truekey))
          {
            removeTypeListeners(__element.type,__element);
          }
        }
        /* need to check if any listeners exist in the  lower tree... oh boy... */
        else if(__element.childNodes.length !== 0)
        {
          var __inputs = __querySelectorAll.call(__element,'input'),
              __textareas = __querySelectorAll.call(__element,'textarea'),
              __select = __querySelectorAll.call(__element,'select');

          /* loop all */
          if(key === 'value')
          {
            loopRemove(__inputs,key, __truekey);
            loopRemove(__textareas,key, __truekey);
            loopRemove(__select,key, __truekey);
          }
          /* loop only inputs */
          else if(key === 'checked')
          {
            loopRemove(__inputs,key, __truekey);
          }
          /* loop only select */
          else
          {
            loopRemove(__select,key, __truekey);
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
        __children = __querySelectorAll.call(el,'*'),
        x,
        len,
        child,
        ext,
        events,
        local;
    
    /* create associated events array if it does not exist */
    if(!__local) __local = __events[key] = [];
    
    /* if we are updating or removing an event we must remove the old one */
    if(oldValue && __local.indexOf(oldValue) !== -1 || !!remove)
    {
      __local.splice(__local.indexOf((oldValue || value)),1);
      
      x = 0;
      len = __children.length;
      
      for(x;x<len;x++)
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
      x = 0;
      len = __children.length;
      
      for(x;x<len;x++)
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
        __getInlineKey = getInlineKey,
        __getStyleKey = getStyleKey,
        __keyInline,
        __keyStyle,
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
        __action = undefined;
    
    function set(key,v)
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
        __getInlineKey = getInlineKey,
        __getStyleKey = getStyleKey,
        __keyInline,
        __keyStyle,
        __set = _setStandard,
        __update = _updateStandard,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element)),
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
    var __cssRules = value.split(';')
    .reduce(function(style,v){
      var split = v.split(':'),
      prop = getInlineKey(split[0]),
      value = split[1]; 
      style[prop] = value;

      return style;
    },{});
    
    /* loop over and check oldValue for ones that were removed and set them to empty values to be removed properly */
    for(var x=0,oldSplit=oldValue.split(';'),len=oldSplit.length,split,prop;x<len;x++)
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
        __list = __extensions.__styleList__;
    
    if(!__list)
    {
      __list = __extensions.__styleList__ = [];
      
      /* Chrome likes to randomly GC the style object, if we have a pointer to the style object GC ignores it  */
      __extensions.__GCSTYLEFIX__ = __element.style;
      
      Object.defineProperty(__element.style,'setProperty',descriptorCSSSetProperty(__element));
      Object.defineProperty(__element.style,'removeProperty',descriptorCSSRemoveProperty(__element));
      Object.defineProperty(__element.style,'cssText',descriptorCSSText(__element));
    }
    
    if(__list.indexOf(key) === -1)
    {
      /* set local style listener first */
      Object.defineProperty(__element.style,key,descriptorInlineStyle(__element,key,keyProper));
      __extensions.__styleList__[__list.length] = key;
      return true;
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
  
  /*** [LOGIC]
  
  INPUTS/TEXTAREA: set runs on keydown, set+update runs on hold, update runs on keyup
  INPUTS (Non-Text): prevalueset on focus, set and update runs on input/change,
  RADIO:  runs on keydown [Spacebar]/ mousedown, update runs on keydown [Spacebar]/ mouseup
  SELECT: prevalueset on focus, set and update onchange
  
  Notes:
  - IME detection done on keyDown through keys:
        'Unidentified', //IE
        'Process' //Chrome
  - Firefox does not fire key events during IME mode
  - compisitionstart, compositionend used for IME mode
  - pasting and cutting fallback done in oninput and fallback to onchange due to IE issues on paste and cut listeners
    (may change later)
  - non standard inputs: date, color, etc doesnt contain selectionStart and has oninput and fallback to onchange
  ***/
  
  /* text inputs and textareas */
  function checkIfBackspace(e)
  {
    return (e.key === 'Backspace' || ((e.keyCode || e.which) === 8));
  }
  
  function checkIfPaste(e)
  {
    return ((['V','v'].indexOf(e.key) !== -1 || (e.keyCode || e.which) === 86) && e.ctrlKey);
  }
  
  function checkIfCut(e)
  {
    return ((['X','x'].indexOf(e.key) !== -1 || (e.keyCode || e.which) === 88) && e.ctrlKey);
  }
  
  function checkIfEnter(e)
  {
    return (e.key === 'Enter' || (e.keyCode || e.which) === 13);
  }
  
  function getInputKeyDownChar(e)
  {
    if(e.key.length === 1) return e.key;
    return '';
  }
  
  function getInputKeyDownValue(element,e)
  {
    var __value = element.value,
        __isSelected = (element.selectionStart === element.selectionEnd),
        __selectStart = element.selectionStart,
        __selectEnd = element.selectionEnd,
        __selectedStartText,
        __selectedEndText;
    
    if(__isSelected) 
    {
      __selectedStartText = __value.substring(0,__selectStart);
      __selectedEndText = (__selectEnd === __value.length ? '' : __value.substring(__selectEnd,__value.length));
      
      return (__selectedStartText + (checkIfBackspace(e) ? '' : getInputKeyDownChar(e)) + __selectedEndText);
    }
    
    if(checkIfBackspace(e)) return __value.substring(0,(__selectStart-1))+__value.substring(__selectStart,__value.length);
    
    return __value.substring(0,__selectStart) + getInputKeyDownChar(e) + __value.substring(__selectStart,__value.length);
  }
  
  /* in the case a input paste happens before any typing */
  function inputFocusEvent()
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));
    
    __extensions.__prevalue__ = __element.value;
    
    return true;
  }
  
  /* 
     isPressed: is the key being pressed down
     isPressedUpdate: if the key was held down long enough for another character to be added and update the input
     isIME: are we using an IME keyboard system
     isInputUpdate: do we allow `input` event
     isAltered: if paste or cut was used 
     iskeyDownUpdate: if keydown happened then don't run input and onchange 
   */
  
  function inputKeyDownEvent(e)
  {
    if(e.defaultPrevented) return false;
    
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __update = _updateStandard,
        __value = __element.value,
        __oldUpdateValue = __extensions.__prevalue__,
        __oldValue = __value;
    
    /* checkif in IME mode */
    if(__extensions.isIME || __InputIMEDetect__.indexOf(e.key) !== -1)
    {
      __extensions.isIME = true;
      
      /* this prevents the form from being submitted on IE when a user hits enter when in IME mode */
      if(checkIfEnter(e)) return !!e.preventDefault();
      return true;
    }
    
    __extensions.isInputUpdate = undefined;
    __extensions.isAltered = undefined;
    __extensions.isIME = undefined;
    __extensions.__prevalue__ = __oldValue;
    
    if(e.key && (e.key.length !== 1 && !checkIfBackspace(e))) return true;
    
    if(checkIfPaste(e) || checkIfCut(e))
    {
      __extensions.isAltered = true;
      return true;
    }
    
    if(e.ctrlKey || e.altKey) return true;
    
    __value = getInputKeyDownValue(__element,e);
    __extensions.isKeyDownUpdate = true;
    if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
    {
      if(__extensions.isPressed)
      {
        __extensions.isPressedUpdate = true;
        if(!__extensions.stop) __update(__element,'value',__element.value,__oldUpdateValue,__extensions);
        __extensions.stop = undefined;
      }
      else
      {
        __extensions.isPressed = true;
      }
    }
    else
    {
      __extensions.stop = true;
      __extensions.latestValue = __element.value;
      return !!e.preventDefault();
    }
    return true;
  }
  
  function inputKeyUpEvent(e)
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __update = _updateStandard,
        __value = __element.value,
        __oldValue = __extensions.__prevalue__;
    
    if(__extensions.isIME || __InputIMEDetect__.indexOf(e.key) !== -1) return true;
    
    if(e.key && (e.key.length !== 1 && !checkIfBackspace(e))) return true;
    
    if(e.ctrlKey || e.altKey) return true;
    
    /* so that update is not fired twice when isPressed is true */
    if(!__extensions.isPressedUpdate)
    {
      if(!__extensions.stop) __update(__element,'value',__value,__oldValue,__extensions);
    }
    __extensions.isKeyDownUpdate = false;
    __extensions.isPressedUpdate = false;
    __extensions.isPressed = false;
    __extensions.stop = undefined;
    __extensions.latestValue = __value;
    return true;
  }
  
  /* Input happens prior to change event in the case of pasting, cutting or non standard inputs */
  function inputInputEvent(e)
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __update = _updateStandard,
        __value = __element.value,
        __oldValue = __extensions.__prevalue__,
        __isTextArea = (__element.nodeName === 'TEXTAREA');
    
    if(__extensions.isIME) return true;
    
    /* if we are pasting/cutting using ctrl + v/x keys or from context, run set/update
       - some browsers throw input event before keyup event
    */
    if(__extensions.isAltered || (!__extensions.isKeyDownUpdate && !__extensions.isPressed))
    {
      /* fallback to change event if this property is not set */
      __extensions.isInputUpdate = true;
      
      if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
      {
        if(!__extensions.stop) __update(__element,'value',__value,__oldValue,__extensions);
      }
      else
      {
        (__isTextArea ? __valueTextAreaDescriptor : __valueInputDescriptor).set.call(__element,__oldValue);
        __extensions.stop = undefined;
        __extensions.latestValue = __element.value;
        return !!e.preventDefault();
      }
      __extensions.latestValue = __element.value;
      __extensions.stop = undefined;
    }
    return true;
  }
  
  /* fallback for pasting or cutting and non standard inputs */
  function inputChangeEvent(e)
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __update = _updateStandard,
        __value = __element.value,
        __oldValue = __extensions.latestValue,
        __isTextArea = (__element.nodeName === 'TEXTAREA');
    
    if(!__extensions.isInputUpdate)
    {
      if(__extensions.latestValue !== __element.value)
      {
        if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
        {
          if(!__extensions.stop) __update(__element,'value',__value,__oldValue,__extensions);
        }
        else
        {
          (__isTextArea ? __valueTextAreaDescriptor : __valueInputDescriptor).set.call(__element,__oldValue);
          __extensions.stop = undefined;
          return !!e.preventDefault();
        }
      }
    }
    __extensions.stop = undefined;
    return true;
  }
  
  /* to add multiLingual IME keyboard support */
  function inputCompositionStart()
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__;
    
    __extensions.isIME = true;
    __extensions.__prevalue__ = __element.value;
    
    return true;
  }
  
  function inputCompositionEnd(e)
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __update = _updateStandard,
        __value = __element.value,
        __oldValue = __extensions.__prevalue__,
        __isTextArea = (__element.nodeName === 'TEXTAREA');
    
    if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
    {
      if(!__extensions.stop) __update(__element,'value',__value,__oldValue,__extensions);
    }
    else
    {
      e.preventDefault();
      (__isTextArea ? __valueTextAreaDescriptor : __valueInputDescriptor).set.call(__element,__oldValue);
      __extensions.stop = undefined;
      __extensions.isIME = false;
      __extensions.latestValue = __element.value;
      return false;
    }
    __extensions.stop = undefined;
    __extensions.isIME = false;
    __extensions.latestValue = __element.value;
    return true;
  }
  
  /* non standard inputs such as new html5 inputs */
  function nonStandardInputFocusEvent()
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));
    
    __extensions.__prevalue__ = __element.value;
    __extensions.isInputUpdate = false;
    
    return true;
  }
  
  function nonStandardInputInputEvent(e)
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __update = _updateStandard,
        __value = __element.value,
        __oldValue = __extensions.__prevalue__;
    
    /* fallback to change event if this property is not set */
    __extensions.isInputUpdate = true;
    if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
    {
      if(!__extensions.stop) __update(__element,'value',__value,__oldValue,__extensions);
    }
    else
    {
      __valueInputDescriptor.set.call(__element,__oldValue);
      __extensions.stop = undefined;
      return !!e.preventDefault();
    }
    __extensions.stop = undefined;
    return true;
  }
  
  function nonStandardInputChangeEvent(e)
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __update = _updateStandard,
        __value = __element.value,
        __oldValue = __extensions.__prevalue__;
    
    if(!__extensions.isInputUpdate)
    {
      if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
      {
        if(!__extensions.stop) __update(__element,'value',__value,__oldValue,__extensions);
      }
      else
      {
        __valueInputDescriptor.set.call(__element,__oldValue);
        __extensions.stop = undefined;
        return !!e.preventDefault();
      }
    }
    __extensions.stop = undefined;
    return true;
  }
  
  /* radio elements */
  function radioFocusEvent()
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));
    
    __extensions.__prevalue__ = (__element.checked ? 'on' : 'off');
    __extensions.__prechecked__ = __element.checked;
    
    return true;
  }
  
  function radioKeyDownEvent(e)
  {
    if(e.defaultPrevented) return false;
    
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __value = (__element.checked ? 'on' : 'off'),
        __checked = __element.checked,
        __oldValue,
        __oldChecked;
    
    __extensions.isSpaceBarEvent = undefined;
    __extensions.isFromMouseEvent = undefined;
    __extensions.defaultPrevented = undefined;
    
    if(e.key === ' ' || ((e.keyCode || e.which) === 32))
    {
      __extensions.isSpaceBarEvent = true;
      if(!__extensions.isPressed)
      {
        __extensions.__prevalue__ = __oldValue = __value;
        __extensions.__prechecked__ = __oldChecked = __element.checked;
        __value = (__checked ? 'off' : 'on');
        __checked = (!__checked);

        __extensions.isPressed = true;
        if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
        {
          if(!__set(__element,'checked',__checked,__oldChecked,__extensions,__extensions.stop))
          {
            __extensions.defaultPrevented = true;
            __extensions.stop = true;
            return !!e.preventDefault();
          }
        }
        else
        {
          __extensions.defaultPrevented = true;
          __extensions.stop = true;
          return !!e.preventDefault();
        }
      }
    }
    return true;
  }
  
  function radioKeyUpEvent()
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__;
    
    __extensions.isPressed = undefined;
    return true;
  }
  
  function radioMouseDownEvent(e)
  {
    if(e.defaultPrevented) return false;
    
    if(e.button !== 0) return true;
    
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __value = (__element.checked ? 'off' : 'on'),
        __checked = (!__element.checked),
        __oldValue = (__element.checked ? 'on' : 'off'),
        __oldChecked = __element.checked;
        
        __extensions.__prevalue__ = __oldValue;
        __extensions.__prechecked__ = __oldChecked;
        __extensions.defaultPrevented = undefined;
        __extensions.isPressed = undefined;
        __extensions.isFromMouseEvent = true;
        __extensions.isSpaceBarEvent = undefined;
    
    if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
    {
      if(!__set(__element,'checked',__checked,__oldChecked,__extensions,__extensions.stop))
      {
        __extensions.defaultPrevented = true;
        __extensions.stop = true;
        return !!e.preventDefault();
      }
    }
    else
    {
      __extensions.defaultPrevented = true;
      __extensions.stop = true;
      return !!e.preventDefault();
    }
    return true;
  }
  
  /* both keydown(spacebar) and mousedown activate click event */
  function radioMouseClickEvent(e)
  { 
    if(e.button !== 0) return true;
    
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __update = _updateStandard,
        __value = (__element.checked ? 'on' : 'off'),
        __checked = __element.checked,
        __oldValue = __extensions.__prevalue__,
        __oldChecked = __extensions.__prechecked__;
    
    if(__extensions.isFromMouseEvent || __extensions.isSpaceBarEvent)
    {
      if(__extensions.defaultPrevented) return !!e.preventDefault();
    
      /* browsers like to fire click event on spacebar.. */
      if(!__extensions.stop)
      {
        __update(__element,'value',__value,__oldValue,__extensions);
        __update(__element,'checked',__checked,__oldChecked,__extensions);
      }
    }
    
    __extensions.isPressed = undefined;
    __extensions.stop = undefined;
    return true;
  }
  
  /* select elements */
  function selectFocusEvent()
  {
    var __element = this,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));
    
    __extensions.__prevalue__ = __element.value;
    __extensions.__preindex__ = __element.selectedIndex;
    return true;
  }
  
  function selectChangeEvent(e)
  {
    var __element = this,
        __extensions = __element.__pikantnyExtensions__,
        __set = _setStandard,
        __update = _updateStandard,
        __value = __element.value,
        __index = __element.selectedIndex,
        __oldValue = __extensions.__prevalue__,
        __oldIndex = __extensions.__preindex__;
    
    if(__set(__element,'value',__value,__oldValue,__extensions,__extensions.stop))
    {
      if(__set(__element,'selectedIndex',__index,__oldIndex,__extensions,__extensions.stop))
      {
        if(!__extensions.stop)
        {
          __update(__element,'value',__value,__oldValue,__extensions);
          __update(__element,'selectedIndex',__index,__oldIndex,__extensions);
        }
      }
      else
      {
        __indexSelectDescriptor.set.call(__element,__oldIndex);
        __valueSelectDescriptor.set.call(__element,__oldValue);
        __extensions.stop = undefined;
        return !!e.preventDefault();
      }
    }
    else
    {
      __indexSelectDescriptor.set.call(__element,__oldIndex);
      __valueSelectDescriptor.set.call(__element,__oldValue);
      __extensions.stop = undefined;
      return !!e.preventDefault();
    }
    __extensions.stop = undefined;
    return true;
  }
  
  /* used when type attribute is changed on an input to add and remove proper events */
  function typeChangeEvent(e)
  {
    var __element = e.target,
        __oldValue = e.oldValue;
    
    removeTypeListeners(__oldValue,__element,true);
    addTypeListeners(__element);
    return true;
  }
  
  function addTypeListeners(element)
  {
    var __element = element,
        __extensions = __element.__pikantnyExtensions__;
    __extensions.nonStandard = false;
    
    if(['checkbox','radio'].indexOf(__element.type) !== -1)
    {
      /* radio and checkbox inputs */
      __addEventListener.call(__element,'focus',radioFocusEvent);
      __addEventListener.call(__element,'keydown',radioKeyDownEvent);
      __addEventListener.call(__element,'keyup',radioKeyUpEvent);
      __addEventListener.call(__element,'mousedown',radioMouseDownEvent);
      __addEventListener.call(__element,'click',radioMouseClickEvent);
    }
    else if(__element.selectionStart === null)
    {
      __extensions.nonStandard = true;

      /* non standard inputs */
      __addEventListener.call(__element,'focus',nonStandardInputFocusEvent);
      __addEventListener.call(__element,'input',nonStandardInputInputEvent);
      __addEventListener.call(__element,'change',nonStandardInputChangeEvent);
    }
    else
    {
      /* standard text inputs */
      __addEventListener.call(__element,'focus',inputFocusEvent);
      __addEventListener.call(__element,'keydown',inputKeyDownEvent);
      __addEventListener.call(__element,'keyup',inputKeyUpEvent);
      __addEventListener.call(__element,'input',inputInputEvent);
      __addEventListener.call(__element,'change',inputChangeEvent);
      __addEventListener.call(__element,'compositionstart',inputCompositionStart);
      __addEventListener.call(__element,'compositionend',inputCompositionEnd);
    }
  }
  
  function removeTypeListeners(type,element,isTypeChange)
  {
    var __element = element,
        __extensions = __element.__pikantnyExtensions__,
        __type = type;
    
    if(element.nodeName === 'SELECT')
    {
      __removeEventListener.call(__element,'focus',selectFocusEvent);
      __removeEventListener.call(__element,'change',selectChangeEvent);
      __extensions.injectedInput = undefined;
      return true;
    }
       
    if(!__extensions.nonStandard)
    {
      if(['checkbox','radio'].indexOf(__type) === -1)
      {
        /* standard text inputs */
        __removeEventListener.call(__element,'focus',inputFocusEvent);
        __removeEventListener.call(__element,'keydown',inputKeyDownEvent);
        __removeEventListener.call(__element,'keyup',inputKeyUpEvent);
        __removeEventListener.call(__element,'input',inputInputEvent);
        __removeEventListener.call(__element,'change',inputChangeEvent);
        __removeEventListener.call(__element,'compositionstart',inputCompositionStart);
        __removeEventListener.call(__element,'compositionend',inputCompositionEnd);
        if(!isTypeChange)
        {
          __element.removeEventListener('typeupdate',typeChangeEvent);
          __extensions.injectedInput = undefined;
        }
      }
      else
      {
        /* radio and checkbox inputs */
        __removeEventListener.call(__element,'focus',radioFocusEvent);
        __removeEventListener.call(__element,'keydown',radioKeyDownEvent);
        __removeEventListener.call(__element,'keyup',radioKeyUpEvent);
        __removeEventListener.call(__element,'mousedown',radioMouseDownEvent);
        __removeEventListener.call(__element,'mouseup',radioMouseClickEvent);
        if(!isTypeChange)
        {
          __element.removeEventListener('typeupdate',typeChangeEvent);
          __extensions.injectedInput = undefined;
        }
      }
    }
    else
    {
      __extensions.nonStandard = undefined;
      
      /* non standard inputs */
      __removeEventListener.call(element,'focus',nonStandardInputFocusEvent);
      __removeEventListener.call(element,'input',nonStandardInputInputEvent);
      __removeEventListener.call(element,'change',nonStandardInputChangeEvent);
      if(!isTypeChange)
      {
        __element.removeEventListener('typeupdate',typeChangeEvent);
        __extensions.injectedInput = undefined;
      }
    }
  }
  
  function attachInputListeners(element)
  {
    var __element = element,
        __extensions = (__element.__pikantnyExtensions__ || attachLocalBinders(__element));
    
    switch(__element.nodeName)
    {
      case 'INPUT':
        addTypeListeners(__element);
        __element.addEventListener('typeupdate',typeChangeEvent);
        __extensions.injectedInput = true;
        break;
      case 'TEXTAREA':
        /* textarea */
        __addEventListener.call(__element,'focus',inputFocusEvent);
        __addEventListener.call(__element,'keydown',inputKeyDownEvent);
        __addEventListener.call(__element,'keyup',inputKeyUpEvent);
        __addEventListener.call(__element,'input',inputInputEvent);
        __addEventListener.call(__element,'change',inputChangeEvent);
        __addEventListener.call(__element,'compositionstart',inputCompositionStart);
        __addEventListener.call(__element,'compositionend',inputCompositionEnd);
        __extensions.injectedInput = true;
        break;
      case 'SELECT':
        /* option select box */
        __addEventListener.call(__element,'focus',selectFocusEvent);
        __addEventListener.call(__element,'change',selectChangeEvent);
        __extensions.injectedInput = true;
        break;
    }
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
    
    if(!__extensions[key]) __extensions[key] = {};
    
    if(__extensions[key][title]) return init;
    
    var __descriptor = Object.getOwnPropertyDescriptor(obj,key),
        __defined;
    
    if(!__descriptor) return init;
    
    if(__descriptor.configurable)
    {
      if(__Extended__[key])
      {
        if(__descriptor.set)
        {
          __defined = !!Object.defineProperty(obj,key,descriptorStandard(__descriptor,key,__Extended__[key]));
        }
        else if(typeof __descriptor.value === 'function')
        {
          __defined = !!Object.defineProperty(obj,key,descriptorFunction(__descriptor,key,__Extended__[key]));
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
        __events = {},
        x = 0,
        len = __attr.length;
    
    /* loop standard attribute events */
    for(x;x<len;x++)
    {
      __events[__attr[x]] = __extensions.attrListeners[__attr[x]].slice();
    }
    
    x = 0;
    len = __attrUpdate.length;
    
    /* loop update attribute events */
    for(x;x<len;x++)
    {
      __events[__attrUpdate[x]+'update'] = __extensions.attrUpdateListeners[__attrUpdate[x]].slice();
    }
    
    x = 0;
    len = __domEvents.length;
    
    /* loop dom events */
    for(x;x<len;x++)
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
        __events = {},
        x = 0,
        len = __attr.length;
    
    /* loop bubbled standard attribute events */
    for(x;x<len;x++)
    {
      __events[__attr[x]] = __extensions.parentAttrListeners[__attr[x]].slice();
    }
    
    x = 0;
    len = __attrUpdate.length;
    
    /* loop bubbled update attribute events */
    for(x;x<len;x++)
    {
      __events[__attrUpdate[x]+'update'] = __extensions.parentAttrUpdateListeners[__attrUpdate[x]].slice();
    }
    
    x = 0;
    len = __domEvents.length;
    
    /* loop bubbled dom events */
    for(x;x<len;x++)
    {
      __events[__domEvents[x]] = __extensions.bubbledEvents[__domEvents[x]].slice();
    }
    
    return __events;
  }
  
  /* ENDREGION */
  
  /* CONSTRUCTOR */
  /* REGION */
  
  /* main loop for all dom prototypes */
  for(var x=0,len=__GlobalList__.length;x<len;x++)
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