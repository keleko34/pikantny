# Pikantny
> Extiende la escucha de eventos DOM para incluir atributos, propiedades y estilos

[![NPM version][npm-image]][npm-url] [![Gitter][gitter-image]][gitter-url]

[English](https://github.com/keleko34/pikantny/blob/master/README.md) - [Español](https://github.com/keleko34/pikantny/blob/master/README.es.md) - [Polski](https://github.com/keleko34/pikantny/blob/master/README.pl.md) - [Pусский](https://github.com/keleko34/pikantny/blob/master/README.ru.md) - [中文](https://github.com/keleko34/pikantny/blob/master/README.zh.md)

Lista de contenidos
=================

   * [¿Qué es?](#¿qué-es?)
   * [Instalación](#instalación)
   * Como usarlo:
      * [Empezando](#empezando)
      * [Atributos](#atributos)
      * [Propiedades](#propiedades)
      * [Métodos](#métodos)
      * [Estilos](#estilos)
      * [Entradas](#entradas)
      * [Objeto de evento](#objeto-de-evento)
   * [Ejemplos](#ejemplos)
   * [Depuración](#depuración)
   * [Como contribuir](#como-contribuir)
   * [Licencia](#licencia)

¿Qué es?
==========
Esta biblioteca permite usar oyentes de eventos en forma de eventos estándar para monitorizar los cambios de cualquier cosa que suceda en el DOM, desde escuchar cambios de html a cuando un estilo se establece o incluso cuando un valor en una entrada cambia.

Instalación
============
Esta biblioteca se puede instalar usando:

 * [NPM](https://www.npmjs.com) :  `npm install pikantny --save`
 * [Bower](https://bower.io/) : `bower install pikantny --save`
 * [Yarn](https://yarnpkg.com/lang/en/docs/install) : `yarn add pikantny`

Como usarlo
============
El script se puede cargar tanto en la cabecera como en el cuerpo.
Toda la funcionalidad se carga automáticamente tan pronto como se carga el archivo.
* Nota: incluya este script antes que cualquier otro script para una implementación adecuada *
```
 <script src="/(node_modules|bower_modules)/pikantny/pikantny.min.js"></script>
```

Comenzar a usarlo es tan simple como usar su método de escucha estándar
#### Nativo
```
 var node = document.querySelector('selector')
 node.addEventListener('innerHTML', console.log);
```

#### jQuery
```
 $('selector').on('innerHTML', console.log);
```

Cuando se escuchan eventos de propiedad, hay dos tipos diferentes de oyentes de eventos, eventos de actualización previos a DOM y de actualización posterior a DOM. Simplemente agregando `update` al final de cualquier oyente de evento, el evento se activará después de la actualización de DOM
```
 node.addEventListener('innerHTMLupdate', console.log);
```

Atributos
==========
Se pueden agregar oyentes de eventos de atributos para detectar cualquier cambio en cualquier atributo
```
 node.addEventListener('id', console.log);
 node.setAttribute('id','your-id');
 // or 
 node.id = 'your-id';
```

Propiedades
==========
Las propiedades de un elemento también permiten escuchar cualquier cambio.
```
 node.addEventListener('textContent', console.log);
 node.textContent = 'new-text';
```

Métodos
==========
Cualquier método de elementos permite escuchar su ejecución.
```
 node.addEventListener('appendChild', console.log);
 node.appendChild(input);
```

Estilos
======
Los estilos asociados con el objeto de estilos o el atributo de estilos también permiten escuchar cualquier cambio, cada oyente respectivo se activará si se establecen múltiples en el atributo de estilo
```
 node.addEventListener('color', console.log);
 node.style.color = '#000';
 // or
 node.setAttribute('style','color:#000;');
```

Entradas
======
Los cambios en el valor de entrada también permiten escuchar cualquier cambio y son compatibles con IME
```
 input.addEventListener('value', console.log);
```

Objeto de evento
============
El objeto de evento que se pasa a cada uno de estos eventos activados permite una funcionalidad similar a la de un detector de eventos DOM estándar

#### event.preventDefault()
Cuando se llama desde un evento de actualización previo al DOM, este método se puede usar para evitar que el DOM se actualice
```
 // innerHTML, textContent, appendChild, etc
 node.addEventListener('html', function(e){ e.preventDefault(); });
 
 // input
 input.addEventListener('value', function(e){ e.preventDefault(); });
```

#### event.stop()
Cuando se llama desde un evento de actualización previo a DOM, este método se puede usar para detener la activación de los eventos de actualización posterior a DOM
```
 node.addEventListener('innerHTML', function(e){ e.stop(); });
 
 // this will not fire
 node.addEventListener('innerHTMLupdate', console.log);
```

#### event.stopPropogation()
Cuando se llama, no hay mas oyentes de eventos en la fase bubbling después de que el actual se dispare

#### event.stopImmediatePropogation()
Cuando se llama no hay oyentes de eventos después del actual se disparará

#### event.action
Esta propiedad muestra el valor de retorno de una función ejecutada cuando se analiza en un evento de actualización posterior a DOM

#### event.value
Muestra el valor que se está configurando.

#### event.oldValue
Muestra el valor anterior del elemento que se está configurando.

Todas las demás propiedades de eventos siguen la misma guía que un objeto de evento estándar


Ejemplos
========
#### Cambios de elementos
No permitas que un elemento tenga cambios en html
```
 var node = document.querySelector('selector');
 node.addEventListener('html',function(e){e.preventDefault();});
```

#### Validación
Valide las entradas para ver si se permite un valor dado.
Puede usar `return false;` o `event.preventDefault();` para detener la actualización de la entrada
```
 var input = document.querySelector('selector');
 input.addEventListener('value',function(e){ return /^[0-9A-Za-z]+$/.test(e.value); });
```

Depuración
=========
Esta biblioteca es compatible con el panel de eventos de la consola dev, todos los eventos agregados se mostrarán en este panel.

Como contribuir
=================
Si quieres contribuir aquí están los pasos.

1. Clon Repo: [Pikantny Github Repo](https://github.com/keleko34/pikantny)
2. Instale las dependencias de desarrollo necesarias
3. construir el proyecto `npm run build`
4. Pon a prueba tus cambios, no rompas nada. `npm test`
5. Haga una solicitud de sus cambios :)

Licencia
=======
Puedes ver la licencia aquí: [License](https://github.com/keleko34/pikantny/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/pikantny
[npm-image]: https://img.shields.io/npm/v/pikantny.svg
[gitter-url]: https://gitter.im/pikantny/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/pikantny/Lobby.svg