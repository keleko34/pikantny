# Pikantny
> Rozszerzenie obserwatorów zdarzeń DOM o atrybuty, właściwości i stylu

[![NPM version][npm-image]][npm-url] [![Gitter][gitter-image]][gitter-url]

[English](https://github.com/keleko34/pikantny/blob/master/README.md) - [Español](https://github.com/keleko34/pikantny/blob/master/README.es.md) - [Polski](https://github.com/keleko34/pikantny/blob/master/README.pl.md) - [Pусский](https://github.com/keleko34/pikantny/blob/master/README.ru.md) - [中文](https://github.com/keleko34/pikantny/blob/master/README.zh.md)

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
 <script src="/(node_modules|bower_modules)/pikantny/pikantny.min.js"></script>
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
 // lub 
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
Dowolne metody elementów pozwalają na obserwację ich przemiany
```
 node.addEventListener('appendChild', console.log);
 node.appendChild(input);
```

Stylu
======
CSS w obiekty stylów lub atrybuty stylów pozwalają na obserwację ich przemiany. Każdy odpowiedni detektor uruchomi się, jeśli w atrybucie stylu zostanie ustawionych wiele elementów
```
 node.addEventListener('color', console.log);
 node.style.color = '#000';
 // or
 node.setAttribute('style','color:#000;');
```

Inputy
======
Zmiany wartości wejściowych pozwalają również na obserwowanie wszelkich zmian i są kompatybilne z IME
```
 input.addEventListener('value', console.log);
```

Obiekty event
=============
Obiekt zdarzenia, który jest przekazywany do każdego z tych uruchomionych zdarzeń, pozwala na podobną funkcjonalność, jak standardowa funkcja obserwania zdarzeń DOM

#### event.preventDefault()
Po wywołaniu z zdarzenia poprzedzającego aktualizację DOM można użyć tej metody, aby zapobiec aktualizacji DOM
```
 // innerHTML, textContent, appendChild, etc
 node.addEventListener('html', function(e){ e.preventDefault(); });
 
 // input
 input.addEventListener('value', function(e){ e.preventDefault(); });
```

#### event.stop()
Po wywołaniu ze zdarzenia aktualizacji poprzedzającego DOM ta metoda może być użyta do zatrzymania działania aktualizacji po aktualizacjach DOM
```
 node.addEventListener('innerHTML', function(e){ e.stop(); });
 
 // to nie będzie działać
 node.addEventListener('innerHTMLupdate', console.log);
```

#### event.stopPropogation()
Kiedy zostanie wywołany bez bąbelków obserwaty po tym, jak zostanie uruchomiony

#### event.stopImmediatePropogation()
Po wywołaniu bez obserwować po uruchomieniu aktualnego, w tym aktualizacji DOM

#### event.action
Ta właściwość pokazuje zwracaną wartość wykonanej funkcji, gdy spojrzymy na nią w wydaniu aktualizacji DOM

#### event.value
Pokazuje ustawioną wartość

#### event.oldValue
Poprzednia wartość ustawianego przedmiotu

Wszystkie pozostałe właściwości zdarzeń są zgodne z tymi samymi wytycznymi, co standardowy obiekt zdarzenia


Przykład
========
#### Zmiany html
Nie pozwól, aby element zawierał jakiekolwiek zmiany html
```
 var node = document.querySelector('selector');
 node.addEventListener('html',function(e){e.preventDefault();});
```

#### Validation
Sprawdź poprawność danych wejściowych, aby sprawdzić, czy dana wartość jest dozwolona.
Możesz użyć `return false;` lub `event.preventDefault();` aby zatrzymać aktualizację danych wejściowych
```
 var input = document.querySelector('selector');
 input.addEventListener('value',function(e){ return /^[0-9A-Za-z]+$/.test(e.value); });
```

Debugowanie
===========
Ten api obsługuje panel zdarzeń konsoli aplikacji, wszystkie dodane wydarzenia pojawią się w tym panelu.

Jak wnieść wkład
=================
Jeśli chcesz wnieść swój wkład, wykonaj te kroki

1. Repozytorium klonów: [Pikantny Github Repo](https://github.com/keleko34/pikantny)
2. Zainstaluj zależności npm
3. Zbuduj projekt `npm run build`
4. Przetestuj swoje zmiany, niczego nie zepsuj `npm test`
5. Make a pull request on github for your changes :)

Licencja
=======
Tutaj możesz zobaczyć licencję: [Licencja](https://github.com/keleko34/pikantny/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/pikantny
[npm-image]: https://img.shields.io/npm/v/pikantny.svg
[gitter-url]: https://gitter.im/pikantny/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/pikantny/Lobby.svg