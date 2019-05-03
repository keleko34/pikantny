# Pikantny
> 扩展DOM事件侦听包括属性和样式

[![NPM version][npm-image]][npm-url] [![Gitter][gitter-image]][gitter-url]

[English](https://github.com/keleko34/pikantny/blob/master/README.md) - [Español](https://github.com/keleko34/pikantny/blob/master/README.es.md) - [Polski](https://github.com/keleko34/pikantny/blob/master/README.pl.md) - [Pусский](https://github.com/keleko34/pikantny/blob/master/README.ru.md) - [中文](https://github.com/keleko34/pikantny/blob/master/README.zh.md)

目录
=================

   * [它是什么?](#它是什么)
   * [安装](#安装)
   * 如何使用它:
      * [入门](#入门)
      * [属性](#属性)
      * [功能](#功能)
      * [款式](#款式)
      * [输入](#输入)
      * [事件对象](#事件对象)
   * [例子](#例子)
   * [调试](#调试)
   * [如何贡献](#如何贡献)
   * [执照](#执照)

它是什么?
==========
此库允许您以标准事件的方式使用事件侦听器来侦听DOM上发生的任何更改，从侦听html更改到设置样式时，甚至输入上的值更改时

安装
============
 * [NPM](https://www.npmjs.com) :  `npm install pikantny --save`
 * [Bower](https://bower.io/) : `bower install pikantny --save`
 * [Yarn](https://yarnpkg.com/lang/en/docs/install) : `yarn add pikantny`

入门
============
该脚本既可以加载到html的顶部，也可以加载到内容中。
加载文件后，将自动加载所有功能。
*注意：在任何其他脚本之前包含此脚本以正确实现*
```
 <script src="/(node_modules|bower_modules)/pikantny/init.min.js"></script>
```

开始使用它就像使用标准监听器方法一样简单
#### 标准
```
 var node = document.querySelector('selector')
 node.addEventListener('innerHTML', console.log);
```

#### jQuery
```
 $('selector').on('innerHTML', console.log);
```

在监听propery事件时，有两种不同类型的侦听器，即前DOM更新侦听器和后DOM更新侦听器。 通过简单地将“update”添加到任何侦听器的末尾，您的事件将触发DOM更新
```
 node.addEventListener('innerHTMLupdate', console.log);
```

属性
==========
可以添加属性事件侦听器以检测任何属性中的任何更改
```
 node.addEventListener('id', console.log);
 node.setAttribute('id','your-id');
 // or 
 node.id = 'your-id';
 
 node.addEventListener('textContent', console.log);
 node.textContent = 'new-text';
```

功能
==========
任何元素方法都允许侦听它们的执行
```
 node.addEventListener('appendChild', console.log);
 node.appendChild(input);
```

款式
======
与样式对象或样式属性关联的样式也允许侦听任何更改，如果在样式属性中设置了多个，则将触发每个相应的侦听器
```
 node.addEventListener('color', console.log);
 node.style.color = '#000';
 // or
 node.setAttribute('style','color:#000;');
```

输入
======
输入值更改还允许侦听任何更改并且与IME兼容
```
 input.addEventListener('value', console.log);
```

事件对象
============
传递给每个触发事件的事件对象允许与标准DOM事件侦听器类似的功能

#### event.preventDefault()
从pre DOM更新事件调用时，此方法可用于防止DOM更新
```
 // innerHTML, textContent, appendChild, etc
 node.addEventListener('html', function(e){ e.preventDefault(); });
 
 // input
 input.addEventListener('value', function(e){ e.preventDefault(); });
```

#### event.stop()
从前DOM更新事件调用时，此方法可用于停止发布后DOM更新事件
```
 node.addEventListener('innerHTML', function(e){ e.stop(); });
 
 // this will not fire
 node.addEventListener('innerHTMLupdate', console.log);
```

#### event.stopPropogation()
当被调用时没有冒泡的侦听器将会触发，包括发布DOM更新

#### event.stopImmediatePropogation()
当被调用时，当前的一个侦听器将不会被激活，包括发布DOM更新

#### event.action
此属性显示在后DOM更新事件中查看时执行函数的返回值

#### event.value
显示正在设置的值

#### event.oldValue
显示正在设置的项目的上一个值

所有其他事件属性遵循与标准Event对象相同的准则


例子
========
#### HTML元素更改
不允许元素进行任何html更改
```
 var node = document.querySelector('selector');
 node.addEventListener('html',function(e){e.preventDefault();});
```

#### 验证
验证输入以查看是否允许给定值。
您可以使用`return false;`或`event.preventDefault（）;`来停止输入更新
```
 var input = document.querySelector('selector');
 input.addEventListener('value',function(e){ return /^[0-9A-Za-z]+$/.test(e.value); });
```

调试
=========
此库支持开发控制台事件面板，添加的所有事件将显示在此面板中。

如何贡献
=================
如果你想在这里贡献的是步骤

1. 克隆存储库: [Pikantny Github Repo](https://github.com/keleko34/pikantny)
2. 安装任何必要的开发依赖项
3. 编译项目 `npm run build`
4. 测试你的更改不要破坏任何东西 `npm test`
5. 请求您的更改 :)

执照
=======
您可以在此处查看许可证: [License](https://github.com/keleko34/pikantny/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/pikantny
[npm-image]: https://img.shields.io/npm/v/pikantny.svg
[gitter-url]: https://gitter.im/pikantny/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/pikantny/Lobby.svg