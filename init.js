/* 
  Need to handle:
  - standard props v/
  - dispatch event = local path events v/
  - event propogation v/
  - styles v/
  - attributes v/
  - globalized events - window?
  - inputs setting values
  - if prop doesn't exist create it on listener
*/

"use strict";

window.pikantny = (function(){
  
  /* The entire node list starting from eventTarget down the chain, the prototypal enheritance starts with EventTarget > Node > Element > HTMLElement > all */
  var __HTMLList__ = [
       "HTMLVideoElement", "HTMLUnknownElement", "HTMLUListElement", "HTMLTrackElement", "HTMLTitleElement", "HTMLTextAreaElement", "HTMLTemplateElement", "HTMLTableSectionElement", "HTMLTableRowElement", "HTMLTableElement", "HTMLTableColElement", "HTMLTableCellElement", "HTMLTableCaptionElement", "HTMLStyleElement", "HTMLSpanElement", "HTMLSourceElement", "HTMLSlotElement", "HTMLShadowElement", "HTMLSelectElement", "HTMLScriptElement", "HTMLQuoteElement", "HTMLProgressElement", "HTMLPreElement", "HTMLPictureElement", "HTMLParamElement", "HTMLParagraphElement", "HTMLOutputElement", "HTMLOptionsCollection", "HTMLOptionElement", "HTMLOptGroupElement", "HTMLObjectElement", "HTMLOListElement", "HTMLModElement", "HTMLMeterElement", "HTMLMetaElement", "HTMLMenuElement", "HTMLMediaElement", "HTMLMarqueeElement", "HTMLMapElement", "HTMLLinkElement", "HTMLLegendElement", "HTMLLabelElement", "HTMLLIElement", "HTMLInputElement", "HTMLImageElement", "HTMLIFrameElement", "HTMLHtmlElement", "HTMLHeadingElement", "HTMLHeadElement", "HTMLHRElement", "HTMLFrameSetElement", "HTMLFrameElement", "HTMLFormElement", "HTMLFormControlsCollection", "HTMLFontElement", "HTMLFieldSetElement", "HTMLEmbedElement", "HTMLDocument", "HTMLDivElement", "HTMLDirectoryElement", "HTMLDialogElement", "HTMLDetailsElement", "HTMLDataListElement", "HTMLDListElement", "HTMLContentElement", "HTMLCollection", "HTMLCanvasElement", "HTMLButtonElement", "HTMLBodyElement", "HTMLBaseElement", "HTMLBRElement", "HTMLAudioElement", "HTMLAreaElement", "HTMLAnchorElement"
      ],
      
      __GlobalList__ = ["EventTarget","Node","Element","HTMLElement"].concat(__HTMLList__),
      
      __blocked__ = ['dispatchEvent','Symbol','constructor','__proto__'],
      
      /* helps with easier style listening changes as .style is an object created afterwards and acts differently than your standard */
      __CSSInlineList = Object.getOwnPropertyNames(document.body.style),
      
      /* would like to watch for real css rule changes, needs more research especially with cross domain href css */
      __CSSList__ = Array.prototype.slice.call(getComputedStyle(document.body)),
      
      /* all of these effect the text associated with an element */
      __TextList__ = ['textContent','innerHTML','innerText','outerHTML','outerText','appendChild','removeChild','replaceChild','insertAdjacentHTML','insertBefore'],
      
      /* allowing us to see the original events */
      __EventList__ = Object.keys(HTMLElement.prototype).filter(function(v){return (v.indexOf('on') === 0);}),
      
      /* holds a list of all observable properties */
      __KeyList__ = [];
  
  function descriptorStandard(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __oldValue;
    
    function __set(v)
    {
      var __event = init.event(__key);
      __event.oldValue = __oldValue = __descGet.call(this);
      __event.stopped = this.__stopped__;
      __event.value = v;
      if(this.dispatchEvent(__event))
      {
        __descSet.call(this,v);
        
        if(!this.__stopped__)
        {
          __event = init.event(__key,true);
          __event.oldValue = __oldValue;
          __event.value = v;
          this.dispatchEvent(__event);
        }
      }
      this.__stopped__ = undefined;
    }
    
    return {
      get:__descGet,
      set:__set,
      enumerable:__descriptor.enumerable,
      configurable:true
    }
  }
  
  function descriptorValue(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __oldValue;
    
    function __get()
    {
      return __descriptor.value;
    }
    
    function __set(v)
    {
      if(__descriptor.writable)
      {
        var __event = init.event(__key);
        __event.oldValue = __descriptor.value;
        __event.stopped = this.__stopped__;
        __event.value = v;
        
        
        if(this.dispatchEvent(__event))
        {
          __descSet.call(this,v);

          if(!this.__stopped__)
          {
            __event = init.event(__key,true);
            __event.oldValue = __oldValue;
            __event.value = v;
            
            this.dispatchEvent(__event);
          }
        }
        this.__stopped__ = undefined;
      }
    }
    
    return {
      get:__get,
      set:__set,
      enumerable:__descriptor.enumerable,
      configurable:true
    }
  }
  
  function descriptorFunction(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descVal = __descriptor.value,
        __action;
    
    function __set()
    {
      var __event = init.event(__key);
      __event.arguments = arguments;
      __event.stopped = this.__stopped__;
      
      if(this.dispatchEvent(__event))
      {
        __action = __descVal.apply(this,arguments);
        if(!this.__stopped__)
        {
          __event = init.event(__key,true);
          __event.arguments = arguments;
          __event.action = __action;
          this.dispatchEvent(__event);
        }
      }
      this.__stopped__ = undefined;
      return __action;
    }
    
    return {
      value:__set,
      writable:__descriptor.writable,
      enumerable:__descriptor.enumerable,
      configurable:true
    }
  }
  
  function descriptorHidden(value)
  {
    return {
      value:value,
      writable:false,
      enumerable:false,
      configurable:true
    }
  }
  
  function descriptorEvent(key,update)
  {
    var __value,
        __key = key+(update ? 'update' : '');
    
    function get()
    {
      return __value;
    }
    
    function set(v)
    {
      if(this.events === undefined) this.events = {};
      if(this.events[__key] === undefined) this.events[__key] = [];
      
      if(typeof v === undefined && __value !== undefined)
      {
        this.removeEventListener(__key,this.events[__key][0]);
        this.events[__key].shift();
      }
      
      if(typeof v !== 'function'){ __value = v; return;}
      
      var __events = this.events[__key];
          
      for(var x=0,len=__events.length;x<len;x++)
      {
        this.removeEventListener(__key,__events[x]);
      }
      
      if(__value === undefined)
      {
        __events.unshift(v);
      }
      else
      {
        __events[0] = v;
      }
      
      for(var x=0,len=__events.length;x<len;x++)
      {
        this.addEventListener(__key,__events[x]);
      }
    }
    
    return {
      get:get,
      set:set,
      enumerable:true,
      configurable:true
    };
  }
  
  function descriptorAttribute(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __oldValue;
    
    function __set(v)
    {
      if(this.nodeType === 2)
      {
        var __event = init.event(this.nodeName);
        __event.oldValue = __oldValue = __descGet.call(this);
        __event.stopped = this.ownerElement.__stopped__;
        __event.value = v;
        
        if(this.ownerElement.dispatchEvent(__event))
        {
          __descSet.call(this,v);

          if(!this.ownerElement.__stopped__)
          {
            __event = init.event(this.nodeName,true);
            __event.oldValue = __oldValue;
            __event.value = v;
            this.ownerElement.dispatchEvent(__event);
          }
        }
        this.ownerElement.__stopped__ = undefined;
      }
      else
      {
        return __descSet.call(this,v);
      }
    }
    
    return {
      get:__descGet,
      set:__set,
      enumerable:__descriptor.enumerable,
      configurable:true
    };
  }
  
  function descriptorSetAttribute(key,value)
  {
    var __event = init.event(key),
        __oldValue = (this.attributes.getNamedItem(key) ? this.attributes.getNamedItem(key).value : undefined);
    __event.arguments = arguments;
    __event.stopped = this.__stopped__;
    __event.oldValue = __oldValue;
    __event.value = value;
    
    if(this.dispatchEvent(__event))
    {
      /* handle 'style' attribute changes */
      if(key === 'style')
      {
        var __cssRules = getCSSTextChanges(__oldValue,value);
        for(var x=0,keys=Object.keys(__cssRules),len=keys.length,key;x<len;x++)
        {
          key = keys[x];
          this.style[key] = __cssRules[key];
        }
      }
      else
      {
        this.__setAttribute__.call(this,key,value);
      }
      if(!this.__stopped__)
      {
        __event = init.event(key,true);
        __event.arguments = arguments;
        __event.action = undefined;
        __event.oldValue = __oldValue;
        __event.value = value;
        this.dispatchEvent(__event);
      }
    }
    
    return undefined;
  }
  
  function descriptorRemoveAttribute(key)
  {
    var __event = init.event(key),
        __oldValue = this.attributes.getNamedItem(key).value,
        __action = null;
    __event.arguments = arguments;
    __event.stopped = this.__stopped__;
    __event.oldValue = __oldValue;
    __event.value = undefined;
    if(this.dispatchEvent(__event))
    {
      __action = this.__removeAttribute__.call(this,key);
      if(!this.__stopped__)
      {
        __event = init.event(key,true);
        __event.arguments = arguments;
        __event.action = __action;
        __event.oldValue = __oldValue;
        __event.value = undefined;
        this.dispatchEvent(__event);
      }
    }
    
    return __action;
  }
  
  function descriptorInlineStyle(descriptor,element,key,keyProper)
  {
    var __descriptor = descriptor,
        __key = key,
        __keyProper = keyProper,
        __element = element,
        __oldValue;
    
    function __get()
    {
      return __element.style.getPropertyValue(__keyProper);
    }
    
    function __set(v)
    {
      console.log('set_inline')
      if(__descriptor.writable)
      {
        var __event = init.event(__key);
        __event.oldValue = __oldValue = __descriptor.value;
        __event.stopped = __element.__stopped__;
        __event.value = v;
        
        if(__element.dispatchEvent(__event))
        {
          __element.style[(typeof v === 'string' && v.length === 0 ? '__removeProperty__' : '__setProperty__')](__keyProper,v);

          if(!__element.__stopped__)
          {
            __event = init.event(__key,true);
            __event.oldValue = __oldValue;
            __event.value = v;
            
            __element.dispatchEvent(__event);
          }
        }
        __element.__stopped__ = undefined;
      }
    }
    
    return {
      get:__get,
      set:__set,
      enumerable:__descriptor.enumerable,
      configurable:false
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
      enumerable:__descriptor.enumerate,
      configurable:true
    };
  }
  
  function descriptorCSSSetProperty(key, value, priority)
  {
    console.log('setting');
    var __inlineKey = key.replace(/\-(.)/,function(dash,char){return char.toUpperCase();}).replace('-webkit','webkit');
    this[__inlineKey] = value + (priority ? '!'+priority : '');
    return undefined;
  }
  
  function descriptorCSSRemoveProperty(key)
  {
    var __inlineKey = key.replace(/\-(.)/,function(dash,char){return char.toUpperCase();}).replace('-webkit','webkit');
    this[__inlineKey] = '';
    return undefined;
  }
  
  function getCSSTextChanges(oldValue,value)
  {
    var __cssRules = value.split(';').reduce(function(style,v,x){
          var split = v.split(':'),
          prop = split[0].replace(/\-(.)/,function(dash,char){return char.toUpperCase();}).replace('-webkit','webkit'),
          value = split[1]; 
          style[prop] = value;
          
          return style;
        },{});
    
    for(var x=0,oldSplit=oldValue.split(';'),len=oldSplit.length,split,prop,value;x<len;x++)
    {
      split = oldSplit[x].split(':');
      prop = split[0].replace(/\-(.)/,function(dash,char){return char.toUpperCase();}).replace('-webkit','webkit');
      if(__cssRules[prop] === undefined) __cssRules[prop] = '';
    }
    
    return __cssRules;
  }
  
  function processEvent(key,func)
  {
    /* handle inline css change listeners, attribute, and cssText, setProperty */
    var __cssKey = key.replace(/([A-Z])/g, "-$1").replace('webkit','-webkit').toLowerCase(),
        __cssInlineKey = key.replace(/\-(.)/,function(dash,char){return char.toUpperCase();}).replace('-webkit','webkit');

    if(__CSSInlineList.indexOf(__cssInlineKey) !== -1)
    {
      if(this.__styleList__ === undefined) Object.defineProperty(this,'__styleList__',descriptorHidden([]));
      
      if(this.__styleList__.indexOf(__cssInlineKey) === -1)
      {
        console.log(Object.getOwnPropertyDescriptor(this.style,__cssInlineKey),__cssInlineKey);
        Object.defineProperty(this.style,__cssInlineKey,descriptorInlineStyle(Object.getOwnPropertyDescriptor(this.style,__cssInlineKey),this,__cssInlineKey,__cssKey));
        console.log(Object.getOwnPropertyDescriptor(this.style,__cssInlineKey),__cssInlineKey);
        this.__styleList__.push(__cssInlineKey);
      }
      
      return __cssInlineKey;
    }
    
    return key;
  }
  
  function processEventRemoval(key,func)
  {
    
    return key;
  }
  
  function init(obj)
  {
    for(var x=0,keys=Object.getOwnPropertyNames(obj),len=keys.length;x<len;x++) init.inject(obj,keys[x]);
    
    return init;
  }

  init.inject = function(obj,key)
  {
    if(__KeyList__.indexOf(key) !== -1 || __blocked__.indexOf(key) !== -1 || key.indexOf('__') === 0) return init;
    
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
          Object.defineProperty(HTMLElement.prototype,'on'+key,descriptorEvent(key));
          Object.defineProperty(HTMLElement.prototype,'on'+key+'update',descriptorEvent(key,true));
      }
    }
    __KeyList__.push(key);
    return init;
  }
  
  init.event = function(key,update)
  {
    return new Event(key+(!!update ? 'update' : ''),{bubbles: true,cancelable: true});
  }
  
  init.observables = function()
  {
    return __KeyList__.slice();
  }
  
  init.addEventListener = window.addEventListener.bind(window);
  init.removeEventListener = window.removeEventListener.bind(window);
  
  /* handle event recording */
  if(EventTarget.prototype.__addEventListener__ === undefined && EventTarget.prototype.__removeEventListener__ === undefined)
  {
    Object.defineProperty(EventTarget.prototype,'__addEventListener__',descriptorHidden(EventTarget.prototype.addEventListener));
    EventTarget.prototype.addEventListener = function(key,func)
    {
      key = processEvent.call(this,key,func);
      if(this.events === undefined) this.events = {};
      if(this.events[key] === undefined) this.events[key] = [];
      if(this.events[key].indexOf(func) === -1) this.events[key].push(func);
      return this.__addEventListener__.call(this,key,func);
    }
    Object.defineProperty(EventTarget.prototype,'__removeEventListener__',descriptorHidden(EventTarget.prototype.removeEventListener));
    EventTarget.prototype.removeEventListener = function(key,func)
    {
      key = processEventRemoval.call(this,key,func);
      if(this.events === undefined) this.events = {};
      if(this.events[key] === undefined) this.events[key] = [];
      this.events[key].splice(this.events[key].indexOf(func),1);
      if(this.events[key].length === 0) this.events[key] = undefined;
      return this.__removeEventListener__.call(this,key,func);
    }
  }
  
  /* handle ability to stop an update */
  if(EventTarget.prototype.stop === undefined) EventTarget.prototype.stop = function(){ this.__stopped__ = true; return this;};
  
  /* handle propagation */
  if(Event.prototype.stoppedImmediatePropagation === undefined)
  {
    Event.prototype.stoppedImmediatePropagation = false;
    Object.defineProperty(Event.prototype,'__stopImmediatePropagation__',descriptorHidden(Event.prototype.stopImmediatePropagation));
    Event.prototype.stopImmediatePropagation = function(){
      this.stoppedImmediatePropagation = true;
      this.stoppedPropagation = true;
      return this.__stopImmediatePropagation__.call(this);
    };
  }

  if(Event.prototype.stoppedPropagation === undefined)
  {
    Event.prototype.stoppedPropagation = false;
    Object.defineProperty(Event.prototype,'__stopPropagation__',descriptorHidden(Event.prototype.stopPropagation));
    Event.prototype.stopPropagation = function(){
      this.stoppedPropagation = true;
      return this.__stopPropagation__.call(this);
    };
  }
  
  if(Element.prototype.__setAttribute__ === undefined && Element.prototype.__removeAttribute__ === undefined)
  {
    Object.defineProperty(Element.prototype,'__setAttribute__',descriptorHidden(Element.prototype.setAttribute));
    Element.prototype.setAttribute = descriptorSetAttribute;
    Object.defineProperty(Element.prototype,'__removeAttribute__',descriptorHidden(Element.prototype.removeAttribute));
    Element.prototype.removeAttribute = descriptorRemoveAttribute;
    
    var __valDescriptor = Object.getOwnPropertyDescriptor(Attr.prototype,'value');
    
    if(__valDescriptor) Object.defineProperty(Attr.prototype,'value',descriptorAttribute(__valDescriptor,'value'));
    Object.defineProperty(Node.prototype,'nodeValue',descriptorAttribute(Object.getOwnPropertyDescriptor(Node.prototype,'nodeValue'),'nodeValue'));
    Object.defineProperty(Node.prototype,'textContent',descriptorAttribute(Object.getOwnPropertyDescriptor(Node.prototype,'textContent'),'textContent'));
  }
  
  /* handle special css changes */
  if(CSSStyleDeclaration.prototype.__setProperty__ === undefined && CSSStyleDeclaration.prototype.__removeProperty__ === undefined)
  {
    Object.defineProperty(CSSStyleDeclaration.prototype,'cssText',descriptorCSSText(Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,'cssText'),'cssText'));
    
    Object.defineProperty(CSSStyleDeclaration.prototype,'__setProperty__',descriptorHidden(CSSStyleDeclaration.prototype.setProperty));
    CSSStyleDeclaration.prototype.setProperty = descriptorCSSSetProperty;
    
    Object.defineProperty(CSSStyleDeclaration.prototype,'__removeProperty__',descriptorHidden(CSSStyleDeclaration.prototype.removeProperty));
    CSSStyleDeclaration.prototype.removeProperty = descriptorCSSRemoveProperty;
  }
  
  for(var x=0,len=__GlobalList__.length,proto;x<len;x++)
  {
    if(window[__GlobalList__[x]] !== undefined && window[__GlobalList__[x]].prototype !== undefined) init(window[__GlobalList__[x]].prototype);
  }
    
  if (typeof define === "function" && define.amd){
    define('pikantny',function(){return init;});
  }
  if(typeof module === 'object' && typeof module.exports === 'object'){
    module.exports.pikantny = init;
  }
}());