# Pikantny
> Расширение прослушивания событий DOM для включения атрибутов, свойств и стилей

[![NPM version][npm-image]][npm-url] [![Gitter][gitter-image]][gitter-url]

[English](https://github.com/keleko34/pikantny/blob/master/README.md) - [Español](https://github.com/keleko34/pikantny/blob/master/README.es.md) - [Polski](https://github.com/keleko34/pikantny/blob/master/README.pl.md) - [Pусский](https://github.com/keleko34/pikantny/blob/master/README.ru.md) - [中文](https://github.com/keleko34/pikantny/blob/master/README.zh.md)

Оглавление
=================

   * [Что это?](#Что-это)
   * [Монтаж](#installation)
   * Как это использовать:
      * [Начиная](#hачиная)
      * [Атрибуты](#aтрибуты)
      * [свойства](#свойства)
      * [функции](#функции)
      * [Стили](#cтили)
      * [входные](#входные)
      * [Объект события](#oбъект-события)
   * [Примеры](#примеры)
   * [отладка](#отладка)
   * [Как внести свой вклад](#kак-внести-свой-вклад)
   * [Лицензия](#лицензия)

Что это?
==========
Эта библиотека позволяет использовать прослушиватели событий таким образом, как стандартные события, для прослушивания изменений от всего, что происходит в DOM, от прослушивания при изменении html до установки стиля или даже при изменении значения на входе.

Монтаж
============
 * [NPM](https://www.npmjs.com) :  `npm install pikantny --save`
 * [Bower](https://bower.io/) : `bower install pikantny --save`
 * [Yarn](https://yarnpkg.com/lang/en/docs/install) : `yarn add pikantny`

Начиная
============
Скрипт может быть загружен как в голове, так и в теле.
Все функции автоматически загружаются, как только файл загружен.
* Примечание: включите этот скрипт перед любыми другими скриптами для правильной реализации *
```
 <script src="/(node_modules|bower_modules)/pikantny/init.min.js"></script>
```

Начать использовать это так же просто, как просто использовать стандартный метод слушателя
#### стандарт
```
 var node = document.querySelector('selector')
 node.addEventListener('innerHTML', console.log);
```

#### jQuery
```
 $('selector').on('innerHTML', console.log);
```

при прослушивании правильных событий есть два разных типа слушателей: прослушиватель обновления до DOM и прослушиватель обновления после DOM. Просто добавив `update` в конец любого слушателя, ваше событие сработает после обновления DOM
```
 node.addEventListener('innerHTMLupdate', console.log);
```

Атрибуты
==========
Слушатели события атрибута могут быть добавлены, чтобы обнаружить любые изменения в любых атрибутах
```
 node.addEventListener('id', console.log);
 node.setAttribute('id','your-id');
 // or 
 node.id = 'your-id';
```

свойства
==========
Свойства элемента также позволяют прослушивать любые изменения
```
 node.addEventListener('textContent', console.log);
 node.textContent = 'new-text';
```

функции
==========
Любые методы элементов позволяют прослушивать их выполнение
```
 node.addEventListener('appendChild', console.log);
 node.appendChild(input);
```

Стили
======
Стили, связанные с объектом стиля или атрибутом styles, также позволяют прослушивать любые изменения, каждый соответствующий слушатель будет срабатывать, если в атрибуте style задано несколько значений.
```
 node.addEventListener('color', console.log);
 node.style.color = '#000';
 // or
 node.setAttribute('style','color:#000;');
```

входные
======
Изменения входного значения также позволяют прослушивать любые изменения и совместимы с IME
```
 input.addEventListener('value', console.log);
```

Объект события
============
Объект события, который передается каждому из этих запущенных событий, обеспечивает аналогичную функциональность, что и стандартный приемник событий DOM.

#### event.preventDefault()
При вызове из события, предшествующего обновлению DOM, этот метод может использоваться для предотвращения обновления DOM
```
 // innerHTML, textContent, appendChild, etc
 node.addEventListener('html', function(e){ e.preventDefault(); });
 
 // input
 input.addEventListener('value', function(e){ e.preventDefault(); });
```

#### event.stop()
При вызове из события, предшествующего обновлению DOM, этот метод может использоваться для остановки запуска событий обновления после DOM.
```
 node.addEventListener('innerHTML', function(e){ e.stop(); });
 
 // this will not fire
 node.addEventListener('innerHTMLupdate', console.log);
```

#### event.stopPropogation()
При вызове слушатели не всплывают после того, как сработает текущий

#### event.stopImmediatePropogation()
При вызове нет слушателей после того, как текущий сработает

#### event.action
Это свойство показывает возвращаемое значение выполненной функции при просмотре в событии обновления DOM после

#### event.value
Показывает значение, которое устанавливается

#### event.oldValue
Показывает предыдущее значение устанавливаемого элемента

Все остальные свойства события следуют тем же правилам, что и стандартный объект Event.


Примеры
========
#### Изменения HTML-элемента
Не позволяйте элементу иметь какие-либо изменения HTML
```
 var node = document.querySelector('selector');
 node.addEventListener('html',function(e){e.preventDefault();});
```

#### Проверка
Проверьте входные данные, чтобы увидеть, разрешено ли заданное значение.
Вы можете использовать `return false;` или `event.preventDefault ();`, чтобы остановить обновление ввода
```
 var input = document.querySelector('selector');
 input.addEventListener('value',function(e){ return /^[0-9A-Za-z]+$/.test(e.value); });
```

отладка
=========
Эта библиотека поддерживает панель событий dev console, все добавленные события будут отображаться на этой панели.

Как внести свой вклад
=================
Если Вы хотели бы внести свой вклад здесь, шаги

1. хранилище клонов: [Pikantny Github Repo](https://github.com/keleko34/pikantny)
2. Установите все необходимые зависимости разработки
3. скомпилировать проект `npm run build`
4. проверить ваши изменения не сломайте ничего `npm test`
5. Сделайте запрос на ваши изменения :)

Лицензия
=======
Вы можете просмотреть лицензию здесь: [License](https://github.com/keleko34/pikantny/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/pikantny
[npm-image]: https://img.shields.io/npm/v/pikantny.svg
[gitter-url]: https://gitter.im/pikantny/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/pikantny/Lobby.svg