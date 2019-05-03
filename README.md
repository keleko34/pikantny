# Pikantny
> Extending DOM event listening to include attributes, properties, and styles

[![NPM version][npm-image]][npm-url] [![Gitter][gitter-image]][gitter-url]

[English](https://github.com/keleko34/pikantny/blob/master/README.md) - [Español](https://github.com/keleko34/pikantny/blob/master/README.es.md) - [Polski](https://github.com/keleko34/pikantny/blob/master/README.pl.md) - [Pусский](https://github.com/keleko34/pikantny/blob/master/README.ru.md) - [中文](https://github.com/keleko34/pikantny/blob/master/README.zh.md)

Table of contents
=================

   * [What is it?](#what-is-it)
   * [Installation](#installation)
   * How to use it:
      * [Getting started](#getting-started)
      * [Attributes](#attributes)
      * [Properties](#properties)
      * [Functions](#functions)
      * [Styles](#styles)
      * [Inputs](#inputs)
      * [Event object](#event-object)
   * [Examples](#examples)
   * [Debugging](#debugging)
   * [How to contribute](#how-to-contribute)
   * [License](#license)

What is it?
==========
This library allows you to use event listeners in such a manner as standard events to listen to changes from anything that happens on the DOM, from listening to when html changes to when a style gets set or even when a value on an input changes.

Installation
============
This libray can be installed using:

 * [NPM](https://www.npmjs.com) :  `npm install pikantny --save`
 * [Bower](https://bower.io/) : `bower install pikantny --save`
 * [Yarn](https://yarnpkg.com/lang/en/docs/install) : `yarn add pikantny`

Getting started
============
The script can be loaded both in the head and in the body. 
All functionality is automatically loaded as soon as the file is loaded.
*Note: include this script before any other scripts for proper implementation* 
```
 <script src="/(node_modules|bower_modules)/pikantny/pikantny.min.js"></script>
```

To start using it is as simple as just using your standard listener method
#### Native
```
 var node = document.querySelector('selector')
 node.addEventListener('innerHTML', console.log);
```

#### jQuery
```
 $('selector').on('innerHTML', console.log);
```

when listening for propery events there are two different types of listeners, the pre DOM update listener and the post DOM update listener. By simply adding `update` to the end of any listener your event will fire post DOM update
```
 node.addEventListener('innerHTMLupdate', console.log);
```

Attributes
==========
Attribute event listeners can be added to detect any changes in any attributes
```
 node.addEventListener('id', console.log);
 node.setAttribute('id','your-id');
 // or 
 node.id = 'your-id';
```

Properties
==========
Properties of an element also allow listening for any changes
```
 node.addEventListener('textContent', console.log);
 node.textContent = 'new-text';
```

Functions
==========
Any element methods allow listening for their execution
```
 node.addEventListener('appendChild', console.log);
 node.appendChild(input);
```

Styles
======
Styles associated with the styles object or styles attribute also allow listening for any changes, each respective listener will fire if multiple are set in the style attribute
```
 node.addEventListener('color', console.log);
 node.style.color = '#000';
 // or
 node.setAttribute('style','color:#000;');
```

Inputs
======
Input value changes also allow listening for any changes and are IME compatible
```
 input.addEventListener('value', console.log);
```

Event object
============
The event object that is passed to each of these fired events allow for similar functionality as that of a standard DOM event listener

#### event.preventDefault()
When called from a pre DOM update event, this method can be used to prevent the DOM from updating
```
 // innerHTML, textContent, appendChild, etc
 node.addEventListener('html', function(e){ e.preventDefault(); });
 
 // input
 input.addEventListener('value', function(e){ e.preventDefault(); });
```

#### event.stop()
When called from a pre DOM update event, this method can be used to stop the post DOM update events from firing
```
 node.addEventListener('innerHTML', function(e){ e.stop(); });
 
 // this will not fire
 node.addEventListener('innerHTMLupdate', console.log);
```

#### event.stopPropogation()
When called no bubbled listeners after the current one will fire, including post DOM update

#### event.stopImmediatePropogation()
When called no listeners after the current one will fire, including post DOM update

#### event.action
This property shows the returning value of a executed function when looked at in a post DOM update event

#### event.value
Shows the value that is being set

#### event.oldValue
Shows the previous value of the item being set

All other event properties follow the same guideline as a standard Event object


Examples
========
#### HTML changes
Don't allow an element to have any html changes
```
 var node = document.querySelector('selector');
 node.addEventListener('html',function(e){e.preventDefault();});
```

#### Validation
Validate inputs to see if a given value is allowed.
You can use `return false;` or `event.preventDefault();` to stop the input from updating
```
 var input = document.querySelector('selector');
 input.addEventListener('value',function(e){ return /^[0-9A-Za-z]+$/.test(e.value); });
```

Debugging
=========
This library supports dev console events panel, all events added will show up in this panel.

How to contribute
=================
If You would like to contribute here are the steps

1. Clone Repo: [Pikantny Github Repo](https://github.com/keleko34/pikantny)
2. Install any necessary dev dependencies
3. build the project `npm run build`
4. test your changes don't break anything `npm test`
5. Make a pull request on github for your changes :)

License
=======
You can view the license here: [License](https://github.com/keleko34/pikantny/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/pikantny
[npm-image]: https://img.shields.io/npm/v/pikantny.svg
[gitter-url]: https://gitter.im/pikantny/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/pikantny/Lobby.svg