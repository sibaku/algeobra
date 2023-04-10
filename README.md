# algeobra

This is a library for dynamic geometry computations. More specifically, it is meant to simplify creating (interactive) diagrams that can be put onto websites to illustrate geometric problems.

## How to use

To use algeobra, just put the JavaScript files into your project or load the raw files from this repository.
Loading from a link can be done the following way:

``` js 
import * as alg from "https://cdn.jsdelivr.net/gh/sibaku/algeobra/algeobra.js";
import * as vis from "https://cdn.jsdelivr.net/gh/sibaku/algeobra/algeobraCanvas.js";
```

There are currently two files:

* **algeobra.js**: The main library. Contains various types and methods for geometry computations, such as points, lines, circles, intersections, tangents, etc...
* **algeobraCanvas.js**: Basic functionality to display a geometry scene onto a HTML canvas. The library itself does not require any drawing operations, so this could be replaced or extended as needed. For that, some helper functions are provided as well. For example, offline or SVG rendering should be easy to achieve, as everything that is used for the canvas is also present there

Here you can have a look at a basic interactive diagram and the code used to generate it. Two draggable points are created and a vector is drawn between them:

[Demo JSFiddle](https://jsfiddle.net/y9zhxeav/)

## Examples

Here you can see a few example diagrams created with the library. You can also see them in action with dynamic interactions in this showcase created in LiaScript: [Demo showcase](https://sibaku.github.io/algeobra_showcase).

<img src="../assets/img/add_vectors.png" alt="Demo vector addition" width="30%"></img>
<img src="../assets/img/dot_product.png" alt="Demo dot product" width="30%"></img>
<img src="../assets/img/curves.png" alt="Demo curves" width="30%"></img>
<img src="../assets/img/inscribed_angle.png" alt="Demo inscribed angles" width="30%"></img>
<img src="../assets/img/inoutcircle.png" alt="Demo in and outcircle" width="30%"></img>
<img src="../assets/img/lens.png" alt="Demo lens" width="30%"></img>

The code that was used to generate those and more demos can be found in the demo branch [Demo branch](https://github.com/sibaku/algeobra/tree/demos). It is mostly uncommented, though it should give a good overview over a lot of features.

## General overview

The general idea of how to use the library is as follows: There are a number of primitive types, such as points, vectors, lines or arcs. A primitive type is generated by some kind of definition. For example, we could specify a point by its coordinates, as a point on a curve for a given parameter or the intersection of two objects (this could of course also be multiple points). This is potentially a dynamic step, as one value changing might affect everything that depends on that. For example, the normal at a point on the curve changes, as the curve point moves due to the changing curve parameter.

A scene is made up of a number of these kinds of definitions. Each definition gets added to the scene and can then be referenced by a handle. They are somewhat similar to a factory that produces primitives. The way they produce these primitives is by being provided information on how to create them. One type of definition can declare/consume any number of such creation information structures. For example, a simple vector may be defined by a start and endpoint or an angle and radius in polar coordinates. You might also not even require any such additional information and just define the vector by some fixed coordinates.

The creation information contains the other objects, that are needed to define the new object. These are called dependencies. In slightly more complicated scenarios, you can put the computed values of those dependencies directly into the creation info, but mostly, you will just put the handles of objects there. This allows the scene to automatically gather the computed primitive values of the dependencies and pass them along to our new definition. It also allows the system to recompute any definition, if any of its direct or indirect dependencies have changed. Like the previous example, imagine the normal on a curve point. The algeobra system allows you to change the value of the curve parameter to automatically update the dependent position and normal.
Generally, definitions in algeobra are grouped in hopefully useful conceptually different objects. For example, while a primitive point is just that, a point, we differentiate between a DefPoint, DefIntersection and others, as these do represent a different kind of point. Each definition in algeobra will have a number of static methods to make the needed creation information structures, but if you add your own definitions, you aren't bound to a specific way to do it.

## Documentation

The full function reference can be found here: [sibaku.github.io/docs/algeobra](https://sibaku.github.io/docs/algeobra/).

More information (WIP) can be found in the Wiki [Wiki](https://github.com/sibaku/algeobra/wiki).

Demos to use as reference can be found in the demo directory and branch [Demo branch](https://github.com/sibaku/algeobra/tree/demos).

## Tutorials

Tutorial code can be found in the demo branch in the demo/tutorial directory or [tutorial code](https://github.com/sibaku/algeobra/tree/demos/demos/tutorial).

You will need a local server to open the HTML/load the module files. If you just want to have a look, JSFiddle versions are listed below, so you can look at it directly in the browser.

The following shows a list of the current tutorials that you can find in the code

### An adjustable rectangle with side lengths

JSFiddle version of the code: [Fiddle](https://jsfiddle.net/bk7h84gy/1/)

<img src="../assets/img/tut_rect.gif" alt="Adjustable rectangle" width="50%"></img>

### Reflection and refraction

JSFiddle version of the code: [Fiddle](https://jsfiddle.net/8xbf130z/3/)

<img src="../assets/img/reflect_refract.gif" alt="Adjustable rectangle" width="50%"></img>

### Pythagoras

JSFiddle version of the code: [Fiddle](https://jsfiddle.net/xrmhjovc/)

<img src="../assets/img/pythag.gif" alt="Pythagoras" width="50%"></img>

### Separating axis theorem (SAT)

JSFiddle version of the code: [Fiddle](https://jsfiddle.net/t486v2do/)

<img src="../assets/img/sat.gif" alt="SAT" width="50%"></img>

### Smooth function

JSFiddle version of the code: [Fiddle](https://jsfiddle.net/6koca49p/)

<img src="../assets/img/smooth_func.gif" alt="Smooth function" width="50%"></img>
