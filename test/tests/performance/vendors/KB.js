	function CreateKB(){

        /* This holds global attribute listeners when tied to kb */
        var _attrListeners = {},

            /* This holds global attribute update listeners when tied to kb */
            _attrUpdateListeners = {},

            /* This holds global style listeners when tied to kb */
            _styleListeners = {},

            /* This holds global style update listeners when tied to kb */
            _styleUpdateListeners = {},

            /* This holds all injected objects, so You can see what is injected */
            _injected = {},

            /* The symbol to dignify what the master global listener is */
            _all = '*',

            _texts = ['textContent','innerHTML','innerText','outerHTML','outerText','appendChild','removeChild','replaceChild','insertAdjacentHTML','insertBefore'],

            /* A master list of all style prop names */
            _allStyles = Object.getOwnPropertyNames(document.body.style),

            _allEvents = Object.keys(HTMLElement.prototype).filter(function(v){return (v.indexOf('on') === 0);}).concat(['addEventListener','removeEventListener']),

            /* global iterators */
            x,
            i,

            /* Default set method for all listeners, loops through and runs all attached listeners */
            _set = function(el,prop,val,ret,args,stopChange)
            {
              var e = new _changeEvent(el,prop,val,ret,args,undefined,'set',stopChange);

              if(el.__kb !== undefined)
              {
                var localAttrListeners = el.__kb._attrListeners,
                    localStyleListeners = el.__kb._styleListeners,
                    localParentAttrListeners = el.__kb._parentAttrListeners,
                    localParentStyleListeners = el.__kb._parentStyleListeners;

                if(localAttrListeners[prop] !== undefined)
                {
                  loopListener(localAttrListeners[prop],e);
                }

                if(e._stopPropogation === undefined && localStyleListeners[prop] !== undefined)
                {
                  loopListener(localStyleListeners[prop],e);
                }
                
                if(e._stopPropogation === undefined && localAttrListeners[_all] !== undefined)
                {
                  loopListener(localAttrListeners[_all],e);
                  if(e._stopPropogation === undefined)
                  {
                    loopListener(localStyleListeners[_all],e);
                  }
                }

                if(e._stopPropogation === undefined && localParentAttrListeners[prop] !== undefined)
                {
                  loopParentListener(localParentAttrListeners[prop],e);
                }

                if(e._stopPropogation === undefined && localParentStyleListeners[prop] !== undefined)
                {
                  loopParentListener(localParentStyleListeners[prop],e);
                }
                
                if(e._stopPropogation === undefined && localParentAttrListeners[_all] !== undefined)
                {
                  loopParentListener(localParentAttrListeners[_all],e);

                  if(e._stopPropogation === undefined)
                  {
                    loopParentListener(localParentStyleListeners[_all],e);
                  }
                }
              }

              if(e._stopPropogation === undefined && _attrListeners[prop] !== undefined)
              {
                loopListener(_attrListeners[prop],e);
              }

              if(e._stopPropogation === undefined && _styleListeners[prop] !== undefined)
              {
                loopListener(_styleListeners[prop],e);
              }
              
              if(e._stopPropogation === undefined && _attrListeners[_all] !== undefined)
              {
                loopListener(_attrListeners[_all],e);
                if(e._stopPropogation === undefined)
                {
                  loopListener(_styleListeners[_all],e);
                }
              }

              if(e._preventDefault !== undefined) return false;

              return true;
            },

            /* Default update method for all listeners, loops through and runs all attached update listeners */
            _update = function(el,prop,val,ret,args,action)
            {
              var e = new _changeEvent(el,prop,val,ret,args,action,'update');
              
              if(el.__kb !== undefined)
              {
                var localAttrListeners = el.__kb._attrUpdateListeners,
                    localStyleListeners = el.__kb._styleUpdateListeners,
                    localParentAttrListeners = el.__kb._parentAttrUpdateListeners,
                    localParentStyleListeners = el.__kb._parentStyleUpdateListeners;
              
                if(localAttrListeners[prop] !== undefined)
                {
                  loopListener(localAttrListeners[prop],e);
                }

                if(e._stopPropogation === undefined && localStyleListeners[prop] !== undefined)
                {
                  loopListener(localStyleListeners[prop],e);
                }
                
                if(e._stopPropogation === undefined && localAttrListeners[_all] !== undefined)
                {
                  loopListener(localAttrListeners[_all],e);
                  if(e._stopPropogation === undefined)
                  {
                    loopListener(localStyleListeners[_all],e);
                  }
                }
                
                if(e._stopPropogation === undefined && localParentAttrListeners[prop] !== undefined)
                {
                  loopParentListener(localParentAttrListeners[prop],e);
                }

                if(e._stopPropogation === undefined && localParentStyleListeners[prop] !== undefined)
                {
                  loopParentListener(localParentStyleListeners[prop],e);
                }
                
                if(e._stopPropogation === undefined && localParentAttrListeners[_all] !== undefined)
                {
                  loopParentListener(localParentAttrListeners[_all],e);

                  if(e._stopPropogation === undefined)
                  {
                    loopParentListener(localParentStyleListeners[_all],e);
                  }
                }
              
              }
              
              if(e._stopPropogation === undefined && _attrUpdateListeners[prop] !== undefined)
              {
                loopListener(_attrUpdateListeners[prop],e);
              }

              if(e._stopPropogation === undefined && _styleUpdateListeners[prop] !== undefined)
              {
                loopListener(_styleUpdateListeners[prop],e);
              }
              
              if(e._stopPropogation === undefined && _attrUpdateListeners[_all] !== undefined)
              {
                loopListener(_attrUpdateListeners[_all],e);
                if(e._stopPropogation === undefined)
                {
                  loopListener(_styleUpdateListeners[_all],e);
                }
              }

              if(e._preventDefault !== undefined) return false;

              return true;
            }

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
            if(_e._stopPropogation !== undefined) break;
          }
        }

        /* Helper method to loop through all parent listeners and run them */
        function loopParentListener(looper,e)
        {
          var _looper = looper,
              _len = looper.length,
              _e = e,
              _x;
          for(_x=0;_x<_len;_x++)
          {
            _e.child = _e.target;
            _e.target = looper[_x].parent;
            looper[_x].func(_e);
            if(_e._stopPropogation !== undefined) break;
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
        function _changeEvent(el,attr,value,oldValue,args,action,type,stopChange)
        {
          this.stopPropagation = function(){this._stopPropogation = true;};
          this.preventDefault = function(){this._preventDefault = true;};
          this.value = value;
          this.oldValue = oldValue;
          this.target = el;
          this.attr = attr;
          this.arguments = args;
          this.action = action;
          this.child = undefined;
          this.type = type;
          this.stopChange = stopChange;
        }

        /* This holds all listeners associated with a particular element */
        function _localBinders()
        {
          this._attrListeners = {};
          this._attrUpdateListeners = {};
          this._styleListeners = {};
          this._styleUpdateListeners = {};
          this._parentStyleListeners = {};
          this._parentStyleUpdateListeners = {};
          this._parentAttrListeners = {};
          this._parentAttrUpdateListeners = {};
          this._injectedStyle = {};
        }

        /* This is a standard property set overwrite  */
        function setStandard(descriptor,key,set,update)
        {
          var _descriptor = descriptor,
              _descGet = _descriptor.get,
              _descSet = _descriptor.set,
              _key = key,
              _set = set,
              _update = update,
              _oldValue;
          return function standardSet(v)
          {
             _oldValue = _descGet.call(this);
             if(_set(this,_key,v,_oldValue,undefined,this._stopChange))
             {
               _descSet.call(this,v);
             }
             if(!this._stopChange)
             {
               _update(this,_key,v,_oldValue);
             }
             this._stopChange = undefined;
          }
        }

        /* This is a standard value set overwrite */
        function setValue(descriptor,key,set,update)
        {
          var _descriptor = descriptor,
              _key = key,
              _set = set,
              _update = update,
              _oldValue;
          return function valueSet(v)
          {
            _oldValue = _descriptor.value;
            if(_set(this,_key,v,_oldValue,arguments,this._stopChange))
            {
              _descriptor.value = v;
            }
            if(!this._stopChange)
            {
              _update(this,_key,v,_oldValue,arguments);
            }
            this._stopChange = undefined;
          }
        }

        /* This is a standard function overwrite  */
        function setFunction(descriptor,key,set,update)
        {
          var _descriptor = descriptor,
              _descVal = _descriptor.value,
              _key = key,
              _set = set,
              _update = update,
              _action;
          return function functionSet()
          {
            if(_set(this,_key,null,null,arguments,this._stopChange))
            {
              _action = _descVal.apply(this,arguments);
            }
            if(!this._stopChange)
            {
              _update(this,_key,null,null,arguments,_action);
            }
            this._stopChange = undefined;
            return _action;
          }
        }

        /* This overwites a style property */
        function setStyle(descriptor,key,set,update,el)
        {
          var _proto = el.style,
              _descriptor = descriptor,
              _key = key,
              _keyCP = key.replace(/([A-Z])/g, "-$1").replace('webkit','-webkit'),
              _set = set,
              _update = update,
              _el = el,
              _oldValue,
              _value;
          return {
            get:function(){return _value;},
            set:function styleSet(v)
            {
              _oldValue = _value;
              if(_set(_el,_key,v,_oldValue,undefined,this._stopChange))
              {
                _value = v;
                _proto.setProperty(_keyCP,v);
              }
              if(!this._stopChange)
              {
                _update(_el,_key,v,_oldValue);
              }
              this._stopChange = undefined;
            },
            enumerable:true,
            configurable:true
          }
        }

        /* A helper method that is run for all addListener methods */
        function addListener(attr,func,child,update)
        {
          if(typeof func !== 'function') return bind;

          var isInput = (['value','checked'].indexOf(attr) !== -1),
              isStyle = (_allStyles.indexOf(attr) !== -1),
              listeners;

          if(this.toString() !== bind.toString())
          {
            if(child)
            {
              var children = this.querySelectorAll('*'),
                  len = children.length,
                  listenerObj;
              for(var x=0;x<len;x++)
              {
                listenerObj = children[x].attrListeners();
                if(isInput || (attr === _all))
                {
                  if(children[x].addInputBinding !== undefined) children[x].addInputBinding();
                  if(children[x].addInputBoxBinding !== undefined) children[x].addInputBoxBinding();
                }
                if(isStyle)
                {
                  bind.injectStyleProperty(children[x],attr);
                  listeners = (update ? '_parentStyleUpdateListeners' : '_parentStyleListeners');
                  if(listenerObj[listeners][attr] === undefined) listenerObj[listeners][attr] = [];
                  listenerObj[listeners][attr].push({parent:this,func:func});
                }
                else
                {
                  if(attr === _all)
                  {
                    listeners = (update ? '_parentStyleUpdateListeners' : '_parentStyleListeners');
                    var len = _allStyles.length;
                    for(var i = 0;i<len;i++)
                    {
                      bind.injectStyleProperty(children[x],_allStyles[i]);
                    }
                    if(listenerObj[listeners][_all] === undefined) listenerObj[listeners][_all] = [];
                      listenerObj[listeners][_all].push({parent:this,func:func});
                  }
                  listeners = (update ? '_parentAttrUpdateListeners' : '_parentAttrListeners');
                  if(listenerObj[listeners][attr] === undefined) listenerObj[listeners][attr] = [];
                  listenerObj[listeners][attr].push({parent:this,func:func});
                }
              }
            }
            else
            {
              listenerObj = this.attrListeners();
              if(isStyle)
              {
                listeners = (update ? '_styleUpdateListeners' : '_styleListeners');
                bind.injectStyleProperty(this,attr);
                if(listenerObj[listeners][attr] === undefined) listenerObj[listeners][attr] = [];
                listenerObj[listeners][attr].push(func);
              }
              else
              {
                if(isInput || (attr === _all))
                {
                  if(this.addInputBinding !== undefined) this.addInputBinding();
                  if(this.addInputBoxBinding !== undefined) this.addInputBoxBinding();
                }
                if(attr === _all)
                {
                  listeners = (update ? '_styleUpdateListeners' : '_styleListeners');
                  var len = _allStyles.length;
                  for(var x = 0;x<len;x++)
                  {
                    bind.injectStyleProperty(this,_allStyles[x]);
                  }
                  if(listenerObj[listeners][attr] === undefined) listenerObj[listeners][attr] = [];
                  listenerObj[listeners][attr].push(func);
                }
                listeners = (update ? '_attrUpdateListeners' : '_attrListeners');
                if(listenerObj[listeners][attr] === undefined) listenerObj[listeners][attr] = [];
                listenerObj[listeners][attr].push(func);
              }
            }
          }
          else
          {
            if(isInput || (attr === _all))
            {
              var inputs = document.querySelectorAll('input, textarea'),
                  len = inputs.length;
              for(var x=0;x<len;x++)
              {
                if(inputs[x].addInputBinding !== undefined) inputs[x].addInputBinding();
                if(inputs[x].addInputBoxBinding !== undefined) inputs[x].addInputBoxBinding();
              }
            }
            if(isStyle)
            {
              var els = Array.prototype.slice.call(document.body.querySelectorAll('*')),
                  len = (els.length+1);
              els.unshift(document.body);
              for(var x=0;x<len;x++)
              {
                bind.injectStyleProperty(els[x],attr);
              }
              listeners = (update ? _styleUpdateListeners : _styleListeners);
              if(listeners[attr] === undefined) listeners[attr] = [];
              listeners[attr].push(func);
            }
            else
            {
              if(attr === _all)
              {
                var els = Array.prototype.slice.call(document.body.querySelectorAll('*')),
                    len = (els.length+1),
                    lenStyles = _allStyles.length;
                els.unshift(document.body);
                for(var x=0;x<len;x++)
                {
                  for(var i=0;i<lenStyles;i++)
                  {
                    bind.injectStyleProperty(els[x],_allStyles[i]);
                  }
                }
                listeners = (update ? _styleUpdateListeners : _styleListeners);
                if(listeners[attr] === undefined) listeners[attr] = [];
                listeners[attr].push(func);
              }
              listeners = (update ? _attrUpdateListeners : _attrListeners);
              if(listeners[attr] === undefined) listeners[attr] = [];
              listeners[attr].push(func);
            }
          }
        }

        /* A helper method that is ran for all removeListener methods */
        function removeListener(attr,func,child,update)
        {
          if(typeof func !== 'function') return bind;

          var isInput = (['value','checked'].indexOf(attr) !== -1),
              isStyle = (_allStyles.indexOf(attr) !== -1),
              listeners,
              x;

              function cut(attr,list)
              {
                var listenerFuncs = list[attr],
                    len = listenerFuncs.length;
                for(x=0;x<len;x++)
                {
                  if(listenerFuncs[x].toString() === func.toString())
                  {
                    listenerFuncs.splice(x,1);
                  }
                }
              }

          if(this.toString() !== bind.toString())
          {
            if(child)
            {
              var children = this.querySelectorAll('*'),
                  len = children.length;
              if(isStyle)
              {
                listeners = (update ? '_childStyleUpdateListeners' : '_childStyleListeners');
                cut(attr,this.attrListeners()[listeners]);
                listeners = (update ? '_parentStyleUpdateListeners' : '_parentStyleListeners');
              }
              else
              {
                if(attr === _all)
                {
                  listeners = (update ? '_childStyleUpdateListeners' : '_childStyleListeners');
                  cut(attr,this.attrListeners()[listeners]);
                }
                listeners = (update ? '_childAttrUpdateListeners' : '_childAttrListeners');
                cut(attr,this.attrListeners()[listeners]);
                listeners = (update ? '_parentAttrUpdateListeners' : '_parentAttrListeners');
              }
              for(x=0;x<len;x++)
              {
                var parents = children[x].attrListeners()[listeners][attr],
                    parentLen = parents.length;
                for(var i=0;i<parentLen;i++)
                {
                  if(parents[i].isEqualNode(this))
                  {
                    parents.slice(i,1);
                  }
                }
                if(attr === _all)
                {
                  listenersStyle = (update ? '_parentStyleUpdateListeners' : '_parentStyleListeners');
                  var parents = children[x].attrListeners()[listeners][attr],
                      parentLen = parents.length;
                  for(var i=0;i<parentLen;i++)
                  {
                    if(parents[i].isEqualNode(this))
                    {
                      parents.slice(i,1);
                    }
                  }
                }
              }
            }
            else
            {
              if(isStyle)
              {
                listeners = (update ? '_styleUpdateListeners' : '_styleListeners');
                cut(attr,this.attrListeners()[listeners]);
              }
              else
              {
                if(attr === _all)
                {
                  listeners = (update ? '_styleUpdateListeners' : '_styleListeners');
                  cut(attr,this.attrListeners()[listeners]);
                }
                listeners = (update ? '_attrUpdateListeners' : '_attrListeners');
                cut(attr,this.attrListeners()[listeners]);
              }
            }
          }
          else
          {
            if(isStyle)
            {
              listeners = (update ? _styleUpdateListeners : _styleListeners);
              cut(attr,listeners);
            }
            else
            {
              if(attr === _all)
              {
                listeners = (update ? _styleUpdateListeners : _styleListeners);
                cut(attr,listeners);
              }
              listeners = (update ? _attrUpdateListeners : _attrListeners);
              cut(attr,listeners);
            }
          }
        }

        /* this method gets attached to all elements for easy listener adding of child events */
        function addChildAttrListener(attr,func)
        {
          bind.addAttrListener.call(this,attr,func,true);
          return this;
        }

        /* this method gets attached to all elements for easy listener adding of child update events */
        function addChildAttrUpdateListener(attr,func)
        {
          bind.addAttrUpdateListener.call(this,attr,func,true);
          return this;
        }

        /* this method gets attached to all elements for easy listener removal of child events */
        function removeChildAttrListener(attr,func)
        {
          bind.removeAttrListener.call(this,attr,func,true);
          return this;
        }

        /* this method gets attached to all elements for easy listener removal of child update events */
        function removeChildAttrUpdateListener(attr,func)
        {
          bind.removeAttrUpdateListener.call(this,attr,func,true);
          return this;
        }

        /* This method checks if a listener of this function already exists on a desired attribute */
        function hasListener(listener,attr,func)
        {
          var _listeners = this.attrListeners();

          if(attr === 'html') attr = 'innerHTML';
          if(attr === 'events') attr = 'onclick';
          switch(listener)
          {
            case 'attr':
              if(typeof _listeners._attrListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_listeners._attrListeners[attr],func)) return true;
              }
              else if(typeof _listeners._styleListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_listeners._styleListeners[attr],func)) return true;
              }
              else if(typeof _listeners._parentAttrListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_listeners._parentAttrListeners[attr],func)) return true;
              }
              else if(typeof _listeners._parentStyleListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_listeners._parentStyleListeners[attr],func)) return true;
              }
            break;
            case 'attrupdate':
              if(typeof _listeners._attrUpdateListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_listeners._attrUpdateListeners[attr],func)) return true;
              }
              else if(typeof _listeners._styleUpdateListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_listeners._styleUpdateListeners[attr],func)) return true;
              }
              else if(typeof _listeners._parentAttrUpdateListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_listeners._parentAttrUpdateListeners[attr],func)) return true;
              }
              else if(typeof _listeners._parentStyleUpdateListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_listeners._parentStyleUpdateListeners[attr],func)) return true;
              }
            break;
          }
          return false;
        }

        /* sets stopChange Property for stopping update listeners to fire */
        function stopChange()
        {
          this._stopChange = true;
          return this;
        }

        /* This is the master constructor, to be ran only once. */
        function bind()
        {
          bind.injectPrototypes(Node,'Node');
          bind.injectPrototypes(Element,'Element');
          bind.injectPrototypes(HTMLElement,'HTMLElement');
          bind.injectPrototypes(HTMLInputElement,'HTMLInputElement');
          bind.injectPrototypes(HTMLTextAreaElement,'HTMLTextAreaElement');
          bind.injectPrototypes(Document,'Document');

          var __set = _set,
              __update = _update;

          function hasInput(attrListeners)
          {
            var attrs = ['value','checked'],
                _localListeners = attrListeners,
                _localAttr = _localListeners._attrListeners,
                _localUpdateAttr = _localListeners._attrUpdateListeners,
                _localParentAttr = _localListeners._parentAttrListeners,
                _localParentUpdateAttr = _localListeners._parentAttrUpdateListeners,
                has = false;

            if(_attrListeners[_all] !== undefined || _attrUpdateListeners[_all] !== undefined)
            {
              has = true;
            }
            if(has !== true && _localAttr[_all] !== undefined ||
               _localUpdateAttr[_all] !== undefined ||
               _localParentAttr[_all] !== undefined ||
               _localParentUpdateAttr[_all] !== undefined)
            {
              has = true;
            }
            if(has !== true)
            {
              for(var x=0;x<attrs.length;x++)
              {
                if(_attrListeners[attrs[x]] !== undefined ||
                   _attrUpdateListeners[attrs[x]] !== undefined ||
                   _localAttr[attrs[x]] !== undefined ||
                   _localUpdateAttr[attrs[x]] !== undefined ||
                   _localParentAttr[attrs[x]] !== undefined ||
                   _localParentUpdateAttr[attrs[x]] !== undefined)
                  {
                    has = true;
                    break;
                  }
              }
            }
            return has;
          }

          function getStyles(arr,styles)
          {
            var x,
                _arr = arr,
                _styles = styles,
                len = styles.length;
            for(x=0;x<len;x++)
            {
              if(_arr.indexOf(_styles[x]) === -1)
              {
                _arr.push(_styles[x]);
              }
            }
            return _arr;
          }

          function hasStyle(attrListeners)
          {
            var _globalStyle = Object.keys(_styleListeners),
                _globalStyleUpdate = Object.keys(_styleUpdateListeners),
                _localListeners = attrListeners,
                _localStyle = Object.keys(_localListeners._styleListeners),
                _localUpdateStyle = Object.keys(_localListeners._styleUpdateListeners),
                _localParentStyle = Object.keys(_localListeners._parentStyleListeners),
                _localParentUpdateStyle = Object.keys(_localListeners._parentStyleUpdateListeners),
                has = [];

            if(_globalStyle.length !== 0 ||
               _globalStyleUpdate.length !== 0)
            {
              has = getStyles(has,_globalStyle);
              has = getStyles(has,_globalStyleUpdate);
            }
            if(has.length !== 0 && _localParentStyle.length !== 0 ||
               _localParentUpdateStyle.length !== 0)
            {
              has = getStyles(has,_localParentStyle);
              has = getStyles(has,_localParentUpdateStyle);
            }
            if(has.indexOf(_all) !== -1) has = _allStyles;
            return has;
          }

          function copyListeners(listeners,copyTo)
          {
            var listenerProps = Object.keys(listeners),
                _currProp,
                _currListener;
            for(var x=0,len=listenerProps.length;x<len;x++)
            {
              _currProp = listenerProps[x];
              if(copyTo[_currProp] === undefined)
              {
                copyTo[_currProp] = listeners[_currProp].slice();
              }
              else
              {
                for(var i=0,lenI=listeners[_currProp].length;i<lenI;i++)
                {
                  _currListener = listeners[_currProp][i];
                  copyTo[_currProp].push(_currListener);
                }
              }
            }
          }

          function reSync(e)
          {
            if(e.target.nodeType !== 3 && e.target.nodeType !== 8)
            {
              var attrListeners = e.target.attrListeners(),
                  _hasInput = hasInput(attrListeners),
                  _hasStyle = hasStyle(attrListeners),
                  _hasStyleLen = _hasStyle.length,
                  _parentAttr,
                  _parentAttrUpdate,
                  _parentStyle,
                  _parentStyleUpdate,
                  _listeners,
                  nodes = [],
                  len,
                  outer = ((e.attr === 'outerHTML' || e.attr === 'outerText') ? e.attr : undefined),
                  target = e.target

              if(outer !== undefined)
              {
                e.attr = 'appendChild',
                e.arguments = [e.target];
                e.target = e.target.parentElement;
              }

              if(_hasInput)
              {
                if(e.attr === 'appendChild' && e.arguments[0].nodeType !== 3 && e.arguments[0].nodeType !== 8)
                {
                  nodes = Array.prototype.slice.call(e.arguments[0].querySelectorAll('input,textarea'));
                  if(e.arguments[0].tagName === 'INPUT' || e.arguments[0].tagName === 'TEXTAREA')
                  {
                    nodes.unshift(e.arguments[0])
                  }
                }
                else
                {
                  nodes = Array.prototype.slice.call(e.target.querySelectorAll('input,textarea'));
                }
                len = nodes.length;
                for(var x=0;x<len;x++)
                {
                  if(nodes[x].addInputBinding !== undefined) nodes[x].addInputBinding();
                  if(nodes[x].addInputBoxBinding !== undefined) nodes[x].addInputBoxBinding();
                }
              }

              if(e.attr === 'appendChild' && e.arguments[0].nodeName !== '#text' && e.arguments[0].nodeName !== '#comment')
              {
                nodes = Array.prototype.slice.call(e.arguments[0].querySelectorAll('*'));
                nodes.unshift(e.arguments[0]);
                _parentAttr = e.target.__kb._parentAttrListeners;
                _parentAttrUpdate = e.target.__kb._parentAttrUpdateListeners;
                _parentStyle = e.target.__kb._parentStyleListeners;
                _parentStyleUpdate = e.target.__kb._parentStyleUpdateListeners;
              }
              else
              {
                nodes = Array.prototype.slice.call(e.target.querySelectorAll('*'));
                _parentAttr = e.target.__kb._parentAttrListeners;
                _parentAttrUpdate = e.target.__kb._parentAttrUpdateListeners;
                _parentStyle = e.target.__kb._parentStyleListeners;
                _parentStyleUpdate = e.target.__kb._parentStyleUpdateListeners;
              }
              len = nodes.length;

                for(var x=0;x<len;x++)
                {
                  if(_hasStyleLen !== 0)
                  {
                    for(var i=0;i<_hasStyleLen;i++)
                    {
                      bind.injectStyleProperty(nodes[x],_hasStyle[i]);
                    }
                  }
                  _listeners = nodes[x].attrListeners();

                  copyListeners(_parentAttr,_listeners._parentAttrListeners);
                  copyListeners(_parentAttrUpdate,_listeners._parentAttrUpdateListeners);
                  copyListeners(_parentStyle,_listeners._parentStyleListeners);
                  copyListeners(_parentStyleUpdate,_listeners._parentStyleUpdateListeners);
                }

              if(outer !== undefined)
              {
                e.attr = outer;
                e.target = target;
                e.arguments = [];
              }
            }
          }

          function checkAttr(e)
          {
            var oldAttr = e.target.attributes[e.arguments[0]],
                old = (oldAttr !== undefined ? oldAttr.value : ""),
                val = (e.attr === 'setAttribute' ? e.arguments[1] : "");
              if(!__set(e.target,e.arguments[0],val,old,[val])){
                e.preventDefault();
              }
          }

          function checkAttrUpdate(e)
          {
            var oldAttr = e.target.attributes[e.arguments[0]],
                old = (oldAttr !== undefined ? oldAttr.value : ""),
                val = (e.attr === 'setAttribute' ? e.arguments[1] : "");
                __update(e.target,e.arguments[0],val,old,[val]);
          }

          //for keeping binds with inputs
          bind.addAttrUpdateListener('appendChild',reSync);
          bind.addAttrUpdateListener('removeChild',reSync);
          bind.addAttrUpdateListener('innerHTML',reSync);
          bind.addAttrUpdateListener('outerHTML',reSync);
          bind.addAttrUpdateListener('innerText',reSync);
          bind.addAttrUpdateListener('outerText',reSync);
          bind.addAttrUpdateListener('textContent',reSync);

          //allows for html attribute changes to be listened to just like properties
          bind.addAttrListener('setAttribute',checkAttr);
          bind.addAttrListener('removeAttribute',checkAttr);

          bind.addAttrUpdateListener('setAttribute',checkAttrUpdate);
          bind.addAttrUpdateListener('removeAttribute',checkAttrUpdate);

          return bind;
        }

        bind.injectPrototypeProperty = function(obj,key,injectName,set,update)
        {
          var _proto = obj.prototype,
              _descriptor = Object.getOwnPropertyDescriptor(_proto,key),
              _injectName = (injectName || obj.toString().split(/\s+/)[1].split('{')[0].replace('()','')),
              _injectedObj =  _injected[_injectName],
              __set = (set || _set),
              __update = (update || _update);

          if(_proto.attrListeners === undefined)
          {
            _proto = {};
            _proto.attrListeners = (function()
            {
              if(this.__kb === undefined)
              {
                this.__kb = new _localBinders();
              }
              return this.__kb;
            }).bind(_proto);
            _proto.addAttrListener = bind.addAttrListener;
            _proto.addAttrUpdateListener = bind.addAttrUpdateListener;
            _proto.addChildAttrListener = addChildAttrListener;
            _proto.addChildAttrUpdateListener = addChildAttrUpdateListener;
            _proto.hasListener = hasListener;

            _proto.removeAttrListener = bind.removeAttrListener;
            _proto.removeAttrUpdateListener = bind.removeAttrUpdateListener;
            _proto.removeChildAttrListener = removeChildAttrListener;
            _proto.removeChildAttrUpdateListener = removeChildAttrUpdateListener;

            _proto.stopChange = stopChange;
          }

          if(_injectedObj === undefined)
          {
            _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
            _injectedObj = _injected[_injectName];
            _injectedObj.set = __set;
            _injectedObj.update = __update;
          }

          if(_injectedObj.descriptors[key] === undefined) _injectedObj.descriptors[key] = _descriptor;
          if(_descriptor.configurable)
          {
            if(_descriptor.set !== undefined)
            {
               Object.defineProperty(_proto,key,{
                 get:_descriptor.get,
                 set:setStandard(_descriptor,key,__set,__update),
                 enumerable:true,
                 configurable:true
               });
            }
            else if(typeof _descriptor.value === 'function')
            {
                Object.defineProperty(_proto,key,{
                  value:setFunction(_descriptor,key,__set,__update),
                  writable:true,
                  enumerable:true,
                  configurable:true
                });
            }
            else if(_descriptor.value !== undefined)
            {
              Object.defineProperty(_proto,key,{
                get:function()
                {
                  return _descriptor.value;
                },
                set:setValue(_descriptor,key,__set,__update),
                enumerable:true,
                configurable:true
              });
            }
          }
          return bind;
        }

        bind.injectStyleProperty = function(el,key,set,update)
        {
          var _proto = el.style,
              _descriptor = Object.getOwnPropertyDescriptor(_proto,key),
              _injectedObj = el.attrListeners().injectedStyle,
              __set = (set || _set),
              __update = (update || _update);

          if(_injectedObj === undefined)
          {
            el.attrListeners().injectedStyle = {obj:el,proto:_proto,descriptors:{},set:undefined,update:undefined};
            el.attrListeners().injectedStyle.set = __set;
            el.attrListeners().injectedStyle.update = __update;
            _injectedObj = el.attrListeners().injectedStyle;
          }

          if(_injectedObj.descriptors[key] === undefined) _injectedObj.descriptors[key] = _descriptor;

          if(_descriptor.configurable)
          {
            Object.defineProperty(_proto,key,setStyle(_descriptor,key,__set,__update,el));
          }
          return bind;
        }

        bind.injectPrototypes = function(obj,injectName,set,update)
        {
          var _proto = obj.prototype,
              _injectName = (injectName || obj.toString().split(/\s+/)[1].split('{')[0].replace('()','')),
              _injectedObj = _injected[_injectName],
              _keys = Object.getOwnPropertyNames(_proto),
              __set = (set || _set),
              __update = (update || _update),
              _descriptors,
              x;

          if(_proto.attrListeners === undefined)
          {
            _proto.attrListeners = function()
            {
              if(this.__kb === undefined)
              {
                this.__kb = new _localBinders();
              }
              return this.__kb;
            }
            _proto.addAttrListener = bind.addAttrListener;
            _proto.addAttrUpdateListener = bind.addAttrUpdateListener;
            _proto.addChildAttrListener = addChildAttrListener;
            _proto.addChildAttrUpdateListener = addChildAttrUpdateListener;
            _proto.removeAttrListener = bind.removeAttrListener;
            _proto.removeAttrUpdateListener = bind.removeAttrUpdateListener;
            _proto.removeChildAttrListener = removeChildAttrListener;
            _proto.removeChildAttrUpdateListener = removeChildAttrUpdateListener;
            _proto.hasListener = hasListener;
            _proto.stopChange = stopChange;
          }

          if(_injectedObj === undefined)
          {
            _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
            _injectedObj = _injected[_injectName];
            _injectedObj.set = __set;
            _injectedObj.update = __update;
          }

          _descriptors = _injected[_injectName].descriptors;

          for(x=0;x<_keys.length;x+=1)
          {
            if(_descriptors[_keys[x]] === undefined)
            {
              bind.injectPrototypeProperty(obj,_keys[x],_injectName,__set,_update);
            }
          }

          if(_keys.indexOf('value') !== -1)
          {
            function keyDown(e)
            {
              var isCheck,
                  oldCheck,
                  oldValue,
                  value;

              if(this.type === 'checkbox' || this.type === 'radio')
              {
                oldCheck = this.checked;
                isCheck = true;
              }
              oldValue = (isCheck ? (typeof this.checked === 'string' ? this.checked : (this.checked ? "true" : "false")) : this.value);
              setTimeout((function()
              {
                value = (isCheck ? (typeof this.checked === 'string' ? this.checked : (this.checked ? "true" : "false")) : this.value);
                if(isCheck)
                {
                  if(!_injectedObj.set(this,'checked',this.checked,oldValue))
                  {
                    _descriptors['checked'].set.call(this,oldValue);
                  }
                  else
                  {
                    _injectedObj.update(this,'checked',this.checked,oldValue);
                  }
                }
                this.value = value;

                if(!_injectedObj.set(this,'value',this.value,oldValue))
                {
                  _descriptors['value'].set.call(this,oldValue);
                }
                else
                {
                  _injectedObj.update(this,'value',this.checked,oldValue);
                }
              }).bind(this),0);

            }

            _proto.removeInputBinding = function(){
              this.attrListeners()._onkeydown = undefined;
              this.removeEventListener('keydown',keyDown);
            }

            _proto.addInputBinding = function(){
              this.attrListeners()._onkeydown = true;
              this.addEventListener('keydown',keyDown);
            }

            _proto.removeInputBoxBinding = function(){
              this.attrListeners()._onmousedown = undefined;
              this.removeEventListener('mouseup',keyDown);
            }

            _proto.addInputBoxBinding = function(){
              this.attrListeners()._onmousedown = true;
              this.addEventListener('mouseup',keyDown);
            }
          }
          return bind;
        }

        bind.addAttrListener = function(attr,func,child)
        {
          if(attr === 'html')
          {
            for(var x=0,len=_texts.length;x<len;x++)
            {
              addListener.call(this,_texts[x],func,child,false);
            }
          }
          else if(attr === 'events')
          {
            for(var x=0,len=_allEvents.length;x<len;x++)
            {
              addListener.call(this,_allEvents[x],func,child,false);
            }
          }
          else
          {
            addListener.call(this,attr,func,child,false);
          }
          return this;
        }

        bind.addAttrUpdateListener = function(attr,func,child)
        {
          if(attr === 'html')
          {
            for(var x=0,len=_texts.length;x<len;x++)
            {
              addListener.call(this,_texts[x],func,child,true);
            }
          }
          else if(attr === 'events')
          {
            for(var x=0,len=_allEvents.length;x<len;x++)
            {
              addListener.call(this,_allEvents[x],func,child,true);
            }
          }
          else
          {
            addListener.call(this,attr,func,child,true);
          }
          return this;
        }

        bind.removeAttrListener = function(attr,func,child)
        {
          if(attr === 'html')
          {
            for(var x=0,len=_texts.length;x<len;x++)
            {
              removeListener.call(this,_texts[x],func,child,false);
            }
          }
          else if(attr === 'events')
          {
            for(var x=0,len=_allEvents.length;x<len;x++)
            {
              removeListener.call(this,_allEvents[x],func,child,false);
            }
          }
          else
          {
            removeListener.call(this,attr,func,child,false);
          }
          return this;
        }

        bind.removeAttrUpdateListener = function(attr,func,child)
        {
          if(attr === 'html')
          {
            for(var x=0,len=_texts.length;x<len;x++)
            {
              removeListener.call(this,_texts[x],func,child,true);
            }
          }
          else if(attr === 'events')
          {
            for(var x=0,len=_allEvents.length;x<len;x++)
            {
              removeListener.call(this,_allEvents[x],func,child,true);
            }
          }
          else
          {
            removeListener.call(this,attr,func,child,true);
          }
          return this;
        }

        bind.hasListener = function(listener,attr,func)
        {
          if(attr === 'html') attr = 'innerHTML';
          if(attr === 'events') attr = 'onclick';
          switch(listener)
          {
            case 'attr':
              if(typeof _attrListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_attrListeners[attr],func)) return true;
              }
              else if(typeof _styleListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_styleListeners[attr],func)) return true;
              }
            break;
            case 'attrupdate':
              if(typeof _attrUpdateListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_attrUpdateListeners[attr],func)) return true;
              }
              else if(typeof _styleUpdateListeners[attr] !== undefined)
              {
                if(loopListenerCheck(_styleUpdateListeners[attr],func)) return true;
              }
            break;
          }
          return false;
        }

        bind.injectedPrototypes = function()
        {
          return _injected;
        }

        return bind;
    }
    if (typeof define === "function" && define.amd)
    {
      define('KB',CreateKB); //global KM define in browser
    }