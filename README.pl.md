# Pikantny
> Rozszerzenie obserwatorów zdarzeń DOM o atrybuty, właściwości i stylu

[![NPM version][npm-image]][npm-url] [![Gitter][gitter-image]][gitter-url]

[English](https://github.com/keleko34/pikantny/blob/master/README.md) [Español](https://github.com/keleko34/pikantny/blob/master/README.es.md) [Polski](https://github.com/keleko34/pikantny/blob/master/README.pl.md) [Pусский](https://github.com/keleko34/pikantny/blob/master/README.ru.md) [中文](https://github.com/keleko34/pikantny/blob/master/README.zh.md)

Spis treści
=================

   * [Co to jest?](#co-to-jest)
   * [Instalacja](#instalacja)
   * Jak tego użyć:
      * [Implementacja](#implementacja)
      * [Atrybuty](#atrybuty)
      * [Właściwości](#właściwości)
      * [Funcje](#funcje)
      * [Stylu](#stylu)
      * [Inputy](#inputy)
      * [Obiekty event](#obiekty-event)
   * [Przykład](#przykład)
   * [Debugowanie](#debugowanie)
   * [Jak wnieść wkład](#jak-wnieść-wkład )
   * [License](#license)

Co to jest?
==========
Dzięki temu można używać obserwatorów zdarzeń w taki sam sposób, jak standardowe obserwatorów zdarzeń. Obserwować ze wszystkiego, co dzieje się w DOM. zmian html, zmian stylu, a nawet od zmiany wartości wejścia.

Instalacja
============
Można to zainstalować za pomocą:

 * [NPM](https://www.npmjs.com) :  `npm install pikantny --save`
 * [Bower](https://bower.io/) : `bower install pikantny --save`
 * [Yarn](https://yarnpkg.com/lang/en/docs/install) : `yarn add pikantny`

Implementacja
============
API może mieć znacznik HTML Script w strony u góry lub u dołu.
Wszystkie funkcje są ładowane automatycznie po załadowaniu pliku.
*Uwaga: dołącz ten API przed jakimkolwiek innym javascript do prawidłowej implementacji* 
```
 <script src="/(node_modules|bower_modules)/pikantny/init.min.js"></script>
```

Aby rozpocząć używanie standardowe obserwatorów zdarzeń metody
#### Ojczysty
```
 var node = document.querySelector('selector')
 node.addEventListener('innerHTML', console.log);
```

#### jQuery
```
 $('selector').on('innerHTML', console.log);
```

Obserwatorów zdarzeń propery są dwa różne typy detektorów, detektor aktualizacji pre DOM i detektor aktualizacji postu. Przez dodanie "update" na końcu dowolnego detektora, twoje zdarzenie uruchomi aktualizację DOM po aktualizacji.
```
 node.addEventListener('innerHTMLupdate', console.log);
```

Atrybuty
==========
Atrybuty obserwatorów zdarzeń można dodawać w celu wykrycia wszelkich zmian w dowolnych atrybutach
```
 node.addEventListener('id', console.log);
 node.setAttribute('id','your-id');
 // or 
 node.id = 'your-id';
```

Właściwości
==========
Właściwości elementu pozwalają również obserwować wszelkie zmiany
```
 node.addEventListener('textContent', console.log);
 node.textContent = 'new-text';
```

Funcje
==========
Dowolne metody elementów pozwalają na obserwację ich wykonania
```
 node.addEventListener('appendChild', console.log);
 node.appendChild(input);
```

Stylu
======
Styles associated with the styles obect or styles attribute also allow listening for any changes, each respective listener will fire if multiple are set in the style attribute
```
 node.addEventListener('color', console.log);
 node.style.color = '#000';
 // or
 node.setAttribute('style','color:#000;');
```

Inputy
======
Input value changes also allow listening for any changes and are IME compatible
```
 input.addEventListener('value', console.log);
```

Obiekty event
=============
The event object that is passed to each of these fired events allow for similiar functionality as that of a standard DOM event listener

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
When called no bubbled listeners after the current one will fire

#### event.stopImmediatePropogation()
When called no listeners after the current one will fire

#### event.action
This property shows the returning value of a executed function when looked at in a post DOM update event

#### event.value
Shows the value that is being set

#### event.oldValue
Shows the previous value of the item being set

All other event properties follow the same guideline as a standard Event object


Przykład
========
#### Element changes
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

Debugowanie
===========
This library supports dev console events panel, all events added will show up in this panel.

Jak wnieść wkład
=================
If You would like to contribute here are the steps

1. Clone Repo: [Pikantny Github Repo](https://github.com/keleko34/pikantny)
2. Install any necessary dev dependencies
3. build the project `npm run build`
4. test your changes don't break anything `npm test`
5. Make a request for your changes :)

License
=======
You can view the license here: [License](https://github.com/keleko34/pikantny/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/pikantny
[npm-image]: https://img.shields.io/npm/v/pikantny.svg
[gitter-url]: https://gitter.im/pikantny/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/pikantny/Lobby.svg