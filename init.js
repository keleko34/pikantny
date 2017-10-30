/* 
  Need to handle:
  - standard props v/
  - dispatch event = local path events v/
  - event propogation v/
  - styles v/
  - attributes v/
  - globalized events - window?
  - inputs setting values v/
  - all text based operations fire one 'text|html'
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
      __TextPropertyList__ = ['textContent','innerHTML','innerText','outerHTML','outerText','appendChild','removeChild','replaceChild','insertAdjacentHTML','insertBefore'],
      
      /* allowing us to see the original events */
      __EventList__ = Object.keys(HTMLElement.prototype).filter(function(v){return (v.indexOf('on') === 0);});
  
  /* add original descriptors to a list? */
  
  function descriptorStandard(descriptor,key)
  {
    var __descriptor = descriptor,
        __key = key,
        __descSet = __descriptor.set,
        __descGet = __descriptor.get,
        __isTextBased = (__TextPropertyList__.indexOf(key) !== -1),
        __oldValue;
    
    function __set(v)
    {
      var __event = init.event(__key);
      __event.oldValue = __oldValue = __descGet.call(this);
      __event.stopped = this.__stopped__;
      __event.value = v;
      if(this.dispatchEvent(__event))
      {
        if(__isTextBased)
        {
          var __event_text = init.event('text');
              __event_text.oldValue = __oldValue;
              __event_text.stopped = this.__stopped__;
              __event_text.value = v;
          
          var __event_html = init.event('html');
              __event_html.oldValue = __oldValue;
              __event_html.stopped = this.__stopped__;
              __event_html.value = v;
          
          if(this.dispatchEvent(__event_text) && this.dispatchEvent(__event_html))
          {
            __descSet.call(this,v);
            
            if(!this.__stopped__)
            {
              var __event_text_update = init.event('text',true);
                  __event_text_update.oldValue = __oldValue;
                  __event_text_update.stopped = this.__stopped__;
                  __event_text_update.value = v;
              this.dispatchEvent(__event_text_update);
          
              var __event_html_update = init.event('html',true);
                  __event_html_update.oldValue = __oldValue;
                  __event_html_update.stopped = this.__stopped__;
                  __event_html_update.value = v;
              this.dispatchEvent(__event_html_update);
              
              var __event_update = init.event(__key,true);
                  __event_update.oldValue = __oldValue;
                  __event_update.value = v;
              this.dispatchEvent(__event_update);
            }
          }
        }
        else
        {
          __descSet.call(this,v);
        
          if(!this.__stopped__)
          {
            var __event_update = init.event(__key,true);
                __event_update.oldValue = __oldValue;
                __event_update.value = v;
            this.dispatchEvent(__event_update);
          }
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
            var __event_update = init.event(__key,true);
            __event_update.oldValue = __oldValue;
            __event_update.value = v;
            
            this.dispatchEvent(__event_update);
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
        __oldValue,
        __isTextBased = (__TextPropertyList__.indexOf(key) !== -1),
        __action;
    
    function __set()
    {
      var __event = init.event(__key);
      __event.arguments = arguments;
      __event.method = __key;
      __event.stopped = this.__stopped__;
      
      if(this.dispatchEvent(__event))
      {
        if(__isTextBased)
        {
          var __event_text = init.event('text');
              __event_text.oldValue = __oldValue = this.innerHTML;
              __event_text.arguments = arguments;
              __event_text.method = __key;
              __event_text.stopped = this.__stopped__;
          
          var __event_html = init.event('html');
              __event_html.oldValue = __oldValue = this.innerHTML;
              __event_html.arguments = arguments;
              __event_html.method = __key;
              __event_html.stopped = this.__stopped__;
          
          if(this.dispatchEvent(__event_text) && this.dispatchEvent(__event_html))
          {
            __action = __descVal.apply(this,arguments);
            
            if(!this.__stopped__)
            {
              var __event_text_update = init.event('text',true);
                  __event_text_update.oldValue = __oldValue;
                  __event_text_update.arguments = arguments;
                  __event_text_update.method = __key;
                  __event_text_update.action = __action;
                  __event_text_update.value = this.innerHTML;
              this.dispatchEvent(__event_text_update);
          
              var __event_html_update = init.event('html',true);
                  __event_html_update.oldValue = __oldValue;
                  __event_html_update.arguments = arguments;
                  __event_html_update.method = __key;
                  __event_html_update.action = __action;
                  __event_html_update.value = this.innerHTML;
              this.dispatchEvent(__event_html_update);
              
              var __event_update = init.event(__key,true);
                  __event_update.arguments = arguments;
                  __event_update.method = __key;
                  __event_update.action = __action;
              this.dispatchEvent(__event_update);
            }
          }
        }
        else
        {
          __action = __descVal.apply(this,arguments);
          if(!this.__stopped__)
          {
            var __event_update = init.event(__key,true);
                __event_update.arguments = arguments;
                __event_update.action = __action;
            this.dispatchEvent(__event_update);
          }
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
      writable:true,
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
            var __event_update = init.event(this.nodeName,true);
            __event_update.oldValue = __oldValue;
            __event_update.value = v;
            this.ownerElement.dispatchEvent(__event_update);
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
        var __event_update = init.event(key,true);
        __event_update.arguments = arguments;
        __event_update.action = undefined;
        __event_update.oldValue = __oldValue;
        __event_update.value = value;
        this.dispatchEvent(__event_update);
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
        __event_value.stopped = __target.__stopped__;
        __event_value.value = __value;

    if(__target.dispatchEvent(__event_value))
    {
      if(__isRadio)
      {
        var __event_checked = init.event('checked');
            __event_checked.oldValue = __oldChecked;
            __event_checked.stopped = __target.__stopped__;
            __event_checked.value = __checked;
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
          __target.__checkeddescriptor__.set(__oldChecked);
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
        __target.__checkeddescriptor__.set.call(__target,__oldChecked);
      }
      else
      {
        __target.__valuedescriptor__.set.call(__target,__oldValue);
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
    if(this.isHolding)
    {
      if(!runInputEvents.call(this,e))
      {
        e.preventDefault();
        return false;
      }
    }
    this.isHolding = true;
    
    if(['checked','radio'].indexOf(this.type) === -1)
    {
      this.__prevalue__ = this.value;
      /* value gets set prior to this running so we can prevent it without user seeing the value, checked requires click event to do the same */
      setTimeout(function(){
        runInputEvents.call(e.target,e);
      },0);
    }
    else
    {
      this.__prevalue__ = this.value;
      this.__prechecked__ = this.checked;
    }
  }
  
  function inputUpListener(e)
  {
    if(['checked','radio'].indexOf(this.type) !== -1)
    {
      runInputEvents.call(this,e);
    }
    this.isHolding = false;
  }
  
  function selectListener(e)
  {
    var __target = e.target,
        __oldValue = __target.__prevalue__,
        __oldIndex = __target.__preindex__,
        __value = __target.value;
    
    var __event_value = init.event('value');
        __event_value.oldValue = __target.__prevalue__;
        __event_value.stopped = __target.__stopped__;
        __event_value.value = __target.value;
    
    var __event_index = init.event('selectedIndex');
        __event_index.oldValue = __target.__preindex__;
        __event_index.stopped = __target.__stopped__;
        __event_index.value = __target.selectedIndex;
    
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
      __target.__valuedescriptor__.set.call(__target,__oldValue);
      __target.__stopped__ = undefined;
      return false;
    }
    return true;
  }
  
  function applyTextChanges()
  {
    if(this.__inputlistener__ === undefined)
    {
      Object.defineProperty(this,'__inputlistener__',descriptorHidden(inputListener));
      Object.defineProperty(this,'__inputupdatelistener__',descriptorHidden(inputUpListener));
      
      this.isHolding = false;
      
      /* need to support html5 input types */
      
      if(['checkbox','radio'].indexOf(this.type) !== -1)
      {
        this.addEventListener('mousedown',this.__inputlistener__,false);
        this.addEventListener('click',this.__inputupdatelistener__,false);
        Object.defineProperty(this,'__prevalue__',descriptorHidden(this.value));
        Object.defineProperty(this,'__prechecked__',descriptorHidden(this.checked.toString()));
      }
      else
      {
        this.addEventListener('keydown',this.__inputlistener__,false);
        this.addEventListener('keyup',this.__inputupdatelistener__,false);
        Object.defineProperty(this,'__prevalue__',descriptorHidden(this.value));
      }
    }
  }
  
  function applySelectChanges()
  {
    if(this.__selectlistener__ === undefined)
    {
      Object.defineProperty(this,'__selectlistener__',descriptorHidden(selectListener));

      Object.defineProperty(this,'__selectfocuslistener__',descriptorHidden(function(){
        this.__prevalue__ = this.value;
        this.__preindex__ = this.selectedIndex;
      }));

      this.addEventListener('focus',this.__selectfocuslistener__);
      this.addEventListener('change',this.__selectlistener__);
      Object.defineProperty(this,'__prevalue__',descriptorHidden(this.value));
      Object.defineProperty(this,'__preindex__',descriptorHidden(this.selectedIndex));
    }
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
        Object.defineProperty(this.style,__cssInlineKey,descriptorInlineStyle(Object.getOwnPropertyDescriptor(this.style,__cssInlineKey),this,__cssInlineKey,__cssKey));
        this.__styleList__.push(__cssInlineKey);
      }
      
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
              this.removeEventListener('mousedown',this.__inputlistener__);
              this.removeEventListener('click',this.__inputupdatelistener__);
            }
          }
          else
          {
            this.removeEventListener('keydown',this.__inputlistener__);
            this.removeEventListener('keyup',this.__inputupdatelistener__);
          }
        }
        else if(['select'].indexOf(this.nodeName.toLowerCase()) !== -1)
        {
          this.removeEventListener('focus',this.__selectfocuslistener__);
          this.removeEventListener('change',this.__selectlistener__);
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
                    els[x].removeEventListener('mousedown',els[x].__inputlistener__);
                    els[x].removeEventListener('mouseup',els[x].__inputupdatelistener__);
                  }
                  else
                  {
                    els[x].removeEventListener('keydown',els[x].__inputlistener__);
                    els[x].removeEventListener('keyup',els[x].__inputupdatelistener__);
                  }
                }
                else
                {
                  els[x].removeEventListener('focus',els[x].__selectfocuslistener__);
                  els[x].removeEventListener('change',els[x].__selectlistener__);
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
    if(local.__KeyList__ === undefined) Object.defineProperty(local,'__KeyList__',descriptorHidden([]));
    for(var x=0,keys=Object.getOwnPropertyNames(obj),len=keys.length;x<len;x++) init.inject(obj,keys[x],local);
    
    return init;
  }

  init.inject = function(obj,key,local)
  {
    if(local.__KeyList__.indexOf(key) !== -1 || __blocked__.indexOf(key) !== -1 || key.indexOf('__') === 0) return init;
    
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
    local.__KeyList__.push(key);
    return init;
  }
  
  init.event = function(key,update)
  {
    return new Event(key+(!!update ? 'update' : ''),{bubbles: true,cancelable: true});
  }
  
  init.observables = function(local)
  {
    return (local || window).__KeyList__.slice();
  }
  
  init.addEventListener = document.documentElement.addEventListener.bind(document.documentElement);
  init.removeEventListener = document.documentElement.removeEventListener.bind(document.documentElement);
  
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
  
  /* handle special case for select value descriptor */
  if(HTMLSelectElement.prototype.__valuedescriptor__ === undefined)
  {
    Object.defineProperty(HTMLSelectElement.prototype,'__valuedescriptor__',descriptorHidden(Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')));
  }
  
  if(HTMLInputElement.prototype.__valuedescriptor__ === undefined)
  {
    Object.defineProperty(HTMLInputElement.prototype,'__valuedescriptor__',descriptorHidden(Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')));
    Object.defineProperty(HTMLInputElement.prototype,'__checkeddescriptor__',descriptorHidden(Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'checked')));
  }
  
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