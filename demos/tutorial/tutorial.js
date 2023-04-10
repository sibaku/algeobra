import { EMPTY_INFO, EMPTY, Vec2 } from "../../algeobra.js";
import * as alg from "../../algeobra.js";

import * as vis from "../../algeobraCanvas.js";

import {
    makeSlider,
    makeContainer,
    makeTextField,
} from "../common.js";

function controllableRectangle(container, canvas) {

    // get some fields for easier writing 
    const {
        DefPoint,
        DefLine,
        DefVector,
        DefPerpendicularLine,
        DefIntersection,
        DefPolygon,
        DefLength,
        DefMidPoint,
        DefText,
    } = alg;

    // in this demo we will create an oriented rectangle that can be controlled with two corners

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we don't really need a coordinate system or angles here, so flipping y doesn't matter
    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: false, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we don't use a background
    // we also let the painter take care of resizing the canvas to fill out the screen and adjusting the diagram accordingly
    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // this is the styling we want to apply to points tht we manipulate
    const manipulatorPointStyle = {
        r: 10,
        fillStyle: "rgba(255,0,0,0.5)",
    };
    // we add a z value for our points so they are always on top
    // everything starts at 0, so we could either place everything further up, or our points lower
    const pointZ = -1;

    // create the two points
    // they do not require any additional infos, just the initial coordinates
    // points on the rectangle will be ordered p0, p1, p2, p3
    const p0 = scene.add(new DefPoint(-1, 1), EMPTY_INFO, {
        z: pointZ,
        style: manipulatorPointStyle
    });
    const p2 = scene.add(new DefPoint(1, -1), EMPTY_INFO, {
        z: pointZ,
        style: manipulatorPointStyle
    });

    // we want the user to be able to move these points
    const manip = vis.PointManipulator.createForPoints(scene, diagram.coordinateMapper, diagram.canvas,
        [p0, p2], 40);

    // we specify a direction, this will be the base axis of our rectangle
    // we will attach this direction at the first point
    // this is just a helper, so we hide it
    const baseDir = scene.add(new DefVector({ x: 2, y: 1 }), DefVector.fromRefVector({ ref: p0 }), { invisible });

    // create an infinite line via the vector
    // to make the line infinite, we open it the the left (extending from the first point) and right (extending from the second one)
    const baseLine = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(baseDir), { invisible });

    // create a perpendicular line through the second point
    const rightLine = scene.add(new DefPerpendicularLine(), DefPerpendicularLine.fromVectorsOrLine({ v: baseLine, ref: p2 }), { invisible });

    // intersect both lines to get the bottom right (in the initial state) point of the rectangle
    // intersection will return an array of all intersections (some objects have multiple ones)
    // we will just take the first one, as the lines will only intersect in one
    const p1 = scene.add(new DefIntersection(), DefIntersection.fromObjects(baseLine, rightLine, {
        takeIndex: 0
    }));

    // we now construct the top side very similarly and it could be done in multiple ways
    // we will use a vector version to show some more operations
    // as the opposite sides in a rectangle are rectangular, we just attach the vector p1->p2 to the point p0, which will give us the last point
    const v12 = scene.add(new DefVector(), DefVector.fromPoints(p1, p2), { invisible });

    // create a point by attaching v12 to p0
    const p3 = scene.add(new DefPoint(), DefPoint.fromAttachedVector(p0, v12));

    // we gather all points in an array for convenience
    const points = [p0, p1, p2, p3];

    // there are a few ways to draw the rectangle
    // as it is a closed shape, it makes sense to draw a polygon
    const rect = scene.add(new DefPolygon(), DefPolygon.fromPoints(points));

    // to give some extra information, we will display the lengths of each side in the middle of them
    // this could of course be optimized, so the text doesn't overlap by moving it outside, but we will do the simple version to show how it works in principle

    // compute the distances
    // we can use usual js operations to make it easier
    // (i + 1) % points.length is the wrap around from the last to the first point
    const distances = points.map((v, i) => scene.add(new DefLength(), DefLength.fromPoints(v, points[(i + 1) % points.length])));

    // get the side midpoints
    const midpoints = points.map(
        (v, i) => scene.add(new DefMidPoint(), DefMidPoint.fromPoints(v, points[(i + 1) % points.length]),
            {
                invisible
            }));

    // create text to display the lengths and attach it to the corresponding midpoints
    // we will add a white outline, so the text can be read easier
    // you can see an overview of all the styling options at algeobraCanvas -> styles.geo.text
    const textStyle = {
        strokeStyle: "rgb(255,255,255)",
        fillStyle: "rgb(0,0,0)",
        outline: {
            lineWidth: 6,
        },
        textStyle: {
            font: "15px bold sans-serif",
            textAlign: "center",
        }
    };
    const textLengths = distances.map(
        (v, i) => scene.add(new DefText(), DefText.fromObjectRef({ obj: v, ref: midpoints[i] }),
            { style: textStyle }));
}

function reflectionRefraction(container, canvas) {
    // get some fields for easier writing 
    const {
        DefPoint,
        DefLine,
        DefVector,
        DefMidPoint,
        DefText,
        DefNormalVector,
        DefArc,
        DefClosestPoint,
        DefReflection,
        DefRefraction,
        DefNumber,
        DefFunc,
        DefAngle,
        makeVector,
        deg2rad,
        objectToString,
        makeNumber,
    } = alg;

    // in this demo we will create a demonstration of reflection and refraction at a material surface with different indices of refraction
    // this one combines a lot of elements and also interaction with elements from outside, here HTML elements

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new vis.DiagramCanvas({ x0: -2, y0: -1.5, x1: 2, y1: 1.5, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we don't use a background
    // we also let the painter take care of resizing the canvas to fill out the screen and adjusting the diagram accordingly
    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.5,
        }
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // create a line. This will be the material interface. We will specify a fixed line, as it does not change
    // we also draw it a bit thicker
    const lineInterface = scene.add(new DefLine(
        {
            p0: { x: -1, y: 0 }, p1: { x: 1, y: 0 },
            leftOpen: true, rightOpen: true
        }), EMPTY_INFO, {
        style: {
            lineStyle: {
                lineWidth: 2,
            }
        }
    });

    // we will create a midpoint on the line. For lines, this will be the middle of the points used to define the line
    // we could also hardcode the point or declare another line and intersect it with the interface
    const p0 = scene.add(new DefMidPoint(), DefMidPoint.fromObject(lineInterface), {});

    // define the normal at the point. We instruct it to be normalized
    // normals are defined by a 90 degree rotation counter-clockwise
    const n = scene.add(new DefNormalVector({ normalize: true }), DefNormalVector.fromLine({ line: lineInterface, ref: p0 }));

    // we create a simple interface to move our incoming vector around
    // this will be a half circle for the top half
    // we will also put it behind other things and add a bit of stylization
    const arcInterface = scene.add(new DefArc({ r: 1, startAngle: 0, endAngle: deg2rad(180) }),
        DefArc.fromValues({ center: p0 }), {
        z: 1,
        style: {
            strokeStyle: "rgba(128,128,128,0.5)",
            outline: {
                lineDash: [4],
                lineWidth: 2,
            }
        }
    });

    // we will create two points for our interface:
    // one point is the actual point that we drag around
    // the other point is the closest point on the arc. The arc point is used as reference when calculating closeness.
    // That way we can constrain our interface to move a point around an arc!
    const handlePoint = scene.add(new DefPoint(2, 2), EMPTY_INFO, { invisible });
    const arcPoint = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(handlePoint, arcInterface), {});

    // we want the user to be able to move the handle
    // we pass pairs of handles and moveable points to the helper function
    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, diagram.canvas,
        [[arcPoint, handlePoint]], 40);
    // you can now drag the point along the arc!

    // define the incoming light vector
    const vLight = scene.add(new DefVector(), DefVector.fromPoints(arcPoint, p0), {});

    // compute the reflection vector
    const vReflect = scene.add(new DefReflection(), DefReflection.fromVectorNormal({ v: vLight, n, ref: p0 }), {});

    // define the interface indices of refraction
    // roughly air
    const eta0 = scene.add(new DefNumber(1.0));
    // roughly glass
    const eta1 = scene.add(new DefNumber(1.4));

    // define the ratio of refraction indices
    // for that we will use a function to compute this
    // we pass in the dependencies as an array of numbers
    // there is a more generic function, that can take anything, but we don't need it for this
    const eta = scene.add(new DefNumber(), DefNumber.fromFunc((e0, e1) => e0 / e1, [eta0, eta1]));
    const vRefract = scene.add(new DefRefraction(), DefRefraction.fromVectorNormal({ v: vLight, n, ref: p0, eta }));

    // we now visualize the angles
    // the angles in for the reflection should be the same as the incoming angle
    // for the incoming angle, we need to reverse the light vector, since otherwise we would not be measuring the incoming, but a kind of outgoing angle
    // the easiest way to do this, would be to just define a vector from the same two points but in reverse order
    // we will do it more generically here, to show the use of a general function
    // we can specify a general function (dep, params), where we can specify any dependencies that we want in an array or flat object and additional parameters.
    // (there is also an additional parameter, that we can ignore here)
    const flipVector = deps => {
        // get the value of the passed vector
        // we can freely choose names when defining the function dependencies
        const { v } = deps;
        // for general functions, we could do type checking here, but in this scene, we know everything
        // a vector has xy coordinates and a reference point
        // for this flip, we will put the reference point where the original vector tip was
        // that way, the vector stays at the same place, just the tip is on the other side
        // use the bundled simple vector functions, you can of course just do it on your own
        // all the bundled functions take objects with xy fields
        const tip = Vec2.add(v.ref, v);
        const d = Vec2.scale(v, -1);

        // create a new vector value
        return makeVector({ x: d.x, y: d.y, ref: tip });
    };
    // define a function object with the flip function, making sure to pass in the light vector as a field "v"
    const vLightReverse = scene.add(new DefFunc(flipVector), DefFunc.from({ v: vLight }), { invisible });


    // the angle between normal and light direction
    // we pass in the additional useAngle parameter, so the smallest angle is always used
    // that way, we don't have to worry about the order
    const angleLN = scene.add(new DefAngle(), DefAngle.fromVectorsOrLines(n, vLightReverse, DefAngle.USE_SMALLER_ANGLE),
        {
            style: {
                r: 40,
                arc: {
                    showDirection: false,
                    fillStyle: "rgba(255,0,0,0.25)",
                },
                text: {
                    fillStyle: "rgb(255,0,0)",
                    strokeStyle: "rgba(0,0,0,0)",
                    textStyle: {
                        textAlign: "center",
                    },
                },
            }
        });

    // the angle between normal and reflected vector
    const angleRN = scene.add(new DefAngle(), DefAngle.fromVectorsOrLines(n, vReflect, DefAngle.USE_SMALLER_ANGLE),
        {
            style: {
                r: 40,
                arc: {
                    showDirection: false,
                    fillStyle: "rgba(128,128,128,0.25)",
                },
                text: {
                    fillStyle: "rgb(128,128,128)",
                    strokeStyle: "rgba(0,0,0,0)",
                    textStyle: {
                        textAlign: "center",
                    },
                },
            }
        });

    // similarly we will measure the refracted angle

    // like with the incoming light, we need to flip the normal when measuring the angle, as our current normal points in the outer half space
    // luckily, since we defined the function before, we can reuse it
    // we could of course also encapsulate this in its own definition and creation info
    const nReverse = scene.add(new DefFunc(flipVector), DefFunc.from({ v: n }), { invisible });
    // for that we first set a dotted line through the normal to visualize in the diagram

    const normLine = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(nReverse),
        {
            style: {
                lineStyle: {
                    lineDash: [4],
                }
            }
        });

    // we then measure the angle
    const angleRFN = scene.add(new DefAngle(), DefAngle.fromVectorsOrLines(normLine, vRefract, DefAngle.USE_SMALLER_ANGLE),
        {
            style: {
                r: 40,
                arc: {
                    showDirection: false,
                    fillStyle: "rgba(0,0,255,0.25)",
                },
                text: {
                    fillStyle: "rgb(0,0,255)",
                    strokeStyle: "rgba(0,0,0,0)",
                    textStyle: {
                        textAlign: "center",
                    },
                },
            }
        });

    // to see the law of refraction (Snell's law), we will first display the indices of refraction 
    // we will pass in a text transformer, that displays our values a bit nicer with unicode
    // be careful though, as the passed in values are the actual computed values, so you need to handle these
    // you can use the predefined objectToString method to convert the object (makes a string out of the predefined types and otherwise calls .toString())
    // in our case, the values are numbers, so we could just write obj.value
    const makeVarText = name => {
        return obj => {
            return `${name} = ${objectToString(obj)}`;
        };
    };
    // setting the default text parameter of a DefText to a function allows us to transform passed in values
    const textEta0 = scene.add(
        new DefText({ text: makeVarText("\u03b7\u2081"), ref: { x: 1.25, y: 0.25 } }),
        DefText.fromObjectRef({ obj: eta0 }), {
        style: {
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "bottom",
                font: "20px bold sans-serif",
            }
        }
    });
    const textEta1 = scene.add(
        new DefText({ text: makeVarText("\u03b7\u2082"), ref: { x: 1.25, y: -0.25 } }),
        DefText.fromObjectRef({ obj: eta1 }), {
        style: {
            fillStyle: "rgb(0,0,255)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "top",
                font: "20px bold sans-serif",
            }
        }
    });

    // we will now calculate Snell's law with eta_0 * sin(theta_0) = eta_1 * sin(theta_1)
    // as this involves angles and numbers, we will just use a general function again
    // since both sides are calculated the same, we make another shared function
    const calcEtaSinTheta = deps => {
        const { eta, theta } = deps;
        // both numbers and angles use .value to store their numeric value
        // we want to create a number
        return makeNumber(eta.value * Math.sin(theta.value));
    };
    const eta0sinTheta0 = scene.add(new DefFunc(calcEtaSinTheta), DefFunc.from({ eta: eta0, theta: angleLN }));
    const eta1sinTheta1 = scene.add(new DefFunc(calcEtaSinTheta), DefFunc.from({ eta: eta1, theta: angleRFN }));

    // display the computed values
    const textSnell0 = scene.add(
        new DefText({ text: makeVarText("\u03b7\u2081sin(\u03b8\u2081)"), ref: { x: -1.5, y: 1.25 } }),
        DefText.fromObjectRef({ obj: eta0sinTheta0 }), {
        style: {
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "bottom",
                font: "20px bold sans-serif",
            }
        }
    });
    const textSnell1 = scene.add(
        new DefText({ text: makeVarText("\u03b7\u2082in(\u03b8\u2082)"), ref: { x: -1.5, y: -1.25 } }),
        DefText.fromObjectRef({ obj: eta1sinTheta1 }), {
        style: {
            fillStyle: "rgb(0,0,255)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "top",
                font: "20px bold sans-serif",
            }
        }
    });

    // finally we will add two sliders to influence the values of eta0 and eta1
    const mapFrom = (v, min, max) => (v - min) / (max - min);
    const mapTo = (v, min, max) => v * (max - min) + min;
    // create the slider by getting the current eta values and mapping it between 0 and 100 
    // (integer slider values avoid some issues with decimal step sizes)
    const minEta = 1;
    const maxEta = 2;
    // we can get all data associated with an object with scene.get
    const slider0 = makeSlider(0, 100, mapTo(mapFrom(scene.get(eta0).value.value, minEta, maxEta), 0, 100));
    const slider1 = makeSlider(0, 100, mapTo(mapFrom(scene.get(eta1).value.value, minEta, maxEta), 0, 100));

    slider0.oninput = () => {
        // convert slider value into [0,1]
        const t = mapFrom(parseInt(slider0.value), parseInt(slider0.min), parseInt(slider0.max));
        const eta = mapTo(t, minEta, maxEta);

        // when updating a value, we can't use scene.add, as this would create a new object
        // we could use scene.set, but this is discouraged in this situation, as it completely resets the object and dependencies
        // especially dependencies are an issue, since the have to be recalculated along the chain
        // to avoid that, there is the method: scene.update
        // in general, the structure of a scene will not change, so dependencies are fixed
        // if a value has to be updated, we will just do that and not touch any dependencies (aside from them getting updated)

        scene.update(eta0, new DefNumber(eta));
    };

    slider1.oninput = () => {
        // convert slider value into [0,1]
        const t = mapFrom(parseInt(slider1.value), parseInt(slider1.min), parseInt(slider1.max));
        const eta = mapTo(t, minEta, maxEta);

        // For explanations regarding update, see the above oninput for slider0
        scene.update(eta1, new DefNumber(eta));
    };

    container.appendChild(makeContainer(makeTextField("\u03b7\u2081: "), slider0));
    container.appendChild(makeContainer(makeTextField("\u03b7\u2082: "), slider1));
}

function pythagoras(container, canvas) {
    // get some fields for easier writing 
    const {
        DefPoint,
        DefBoolean,
        DefPolygon,
        DefConditional,
        DefLine,
        DefVector,
        DefMidPoint,
        DefText,
        DefNormalVector,
        DefPerpendicularLine,
        DefIntersection,
        DefChainApply,
        DefNumber,
        DefFunc,
        DefLength,
        DefAngle,
        DefSelect,
        makePoint,
    } = alg;

    // in this demo we will simply draw the famous visualization of the pythagoras theorem
    // we will mainly show like a general map function approach to define a bunch of similar stuff

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new vis.DiagramCanvas({ x0: -4, y0: -4, x1: 4, y1: 4, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we don't use a background
    // we also let the painter take care of resizing the canvas to fill out the screen and adjusting the diagram accordingly
    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        }
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // the triangle points
    // draw them in front and larger to signify they can be moved
    const p0 = scene.add(new DefPoint(-1, -1), EMPTY_INFO, {
        z: -2, style: {
            r: 8,
            fillStyle: "rgb(128,128,128)",
        }
    });
    const p2 = scene.add(new DefPoint(1, 1), EMPTY_INFO, {
        z: -2, style: {
            r: 8,
            fillStyle: "rgb(128,128,128)",
        }
    });

    const vecX = scene.add(new DefVector({ x: 1, y: 0 }), DefVector.fromRefVector({ ref: p0 }), { invisible });
    //  compute the middle point as the intersection of the x axis through p0 and y through p2
    const lineX = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(vecX), { invisible });
    const lineY = scene.add(new DefPerpendicularLine(), DefPerpendicularLine.fromVectorsOrLine({ v: lineX, ref: p2 }), { invisible });
    const p1 = scene.add(new DefIntersection(), DefIntersection.fromObjects(lineX, lineY, { takeIndex: 0 }), { invisible });

    const points = [p0, p1, p2];

    // show angle
    // we will replace the text with a simple dot to represent the right angle
    const rightAngle = scene.add(new DefAngle(), DefAngle.fromPoints(p0, p1, p2, DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 30,
            arc: {
                showDirection: false,
                fillStyle: "rgba(128,128,128,0.5)",
            },
            text: {
                radius: 0.5,
                textStyle: {
                    font: "20px bold sans-serif",
                    textAlign: "center",
                },
                transform: () => ".",
            }
        }
    });

    // we want the user to be able to move these points
    const manip = vis.PointManipulator.createForPoints(scene, diagram.coordinateMapper, diagram.canvas,
        [p0, p2], 40);

    // make a polygon to display the triangle
    // draw it on top
    const tri = scene.add(new DefPolygon(), DefPolygon.fromPoints(points), {
        z: -1,
        style: {
            fillStyle: "rgba(0,0,0,0)",
            strokeStyle: "rgb(0,0,0)",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });


    // compute the orientation of the triangle
    // as the user may move around points, this  could invert the order of points and make normals point inwards
    // the nice solution for that is computing the signed area with: sum_i x_i y_{i+1} - x_{i+1} y_i
    // we disregard the half factor here, as we don't need it
    const isCCW = scene.add(new DefBoolean(), DefBoolean.fromPredicate(
        deps => {
            let sum = 0;
            for (let i = 0; i < deps.length; i++) {
                const ip = (i + 1) % deps.length;
                const pi = deps[i];
                const pip = deps[ip];

                sum += pi.x * pip.y - pip.x * pi.y;
            }
            return sum >= 0;
        },
        points
    ));

    // to make it easy, we calculate two sets of normals, one set pointing inwards, one outwards
    // then we select one depending on the value of isCCW
    // we could also define a function instead that does this all in one
    // The normals are calculated as a counter clockwise rotation, so for a CCW triangle, we need to use the inverted one
    const normalsCW = points.map(
        (v, i) => scene.add(
            new DefNormalVector({ normalize: true }),
            DefNormalVector.fromPoints({ ref: v, p0: v, p1: points[(i + 1) % points.length] }),
            { invisible }));
    const normalsCCW = points.map(
        (v, i) => scene.add(
            new DefNormalVector({ normalize: true }),
            DefNormalVector.fromPoints({ ref: v, p0: points[(i + 1) % points.length], p1: v }),
            { invisible, }));

    // a conditional defines objects based on some criteria
    // in this case, we select the outward pointing normal based on the isCCW boolean value
    const normals = normalsCCW.map((v, i) => scene.add(
        new DefConditional(),
        DefConditional.fromEitherOr(v, normalsCW[i], isCCW),
        { invisible }
    ));

    // compute the lengths of the sides
    const sideLengths = points.map((v, i) => scene.add(new DefLength(), DefLength.fromPoints(v, points[(i + 1) % points.length]), {}));

    // create the boxes
    // we could create a bunch of points, but we will use a chain definition here to see how that works
    // basically we do the following steps:
    // input: sidepoints p0,p1, sidenormal n, sidelength len -> DefFunc: create the 4 vertices and pass them to a DefPolygon

    // we will add some different colors
    const boxColors = [
        "255,0,0",
        "0,0,255",
        "255,0,255",
    ];
    // chain apply will go through each given function and call its compute field or the object itself, if it is a function
    // the result of one in the chain will be passed to the next one
    // initially, the given creation info is put in
    const boxes = points.map((v, i) => scene.add(
        new DefChainApply(
            new DefFunc(deps => {
                const { p0, p1, n, len } = deps;
                // we could also have computed the 
                const p2 = Vec2.add(p0, Vec2.scale(n, len.value));
                const p3 = Vec2.add(p1, Vec2.scale(n, len.value));

                // creation info for a polygon
                // here we can see, that we can create the info structure directly with values, while we are in the compute part
                return DefPolygon.fromPoints([p0, makePoint({ x: p2.x, y: p2.y }), makePoint({ x: p3.x, y: p3.y }), p1]);
            }),
            new DefPolygon(),
        ),
        DefFunc.from({ p0: v, p1: points[(i + 1) % points.length], n: normals[i], len: sideLengths[i] }),
        {
            style: {
                fillStyle: `rgba(${boxColors[i]}, 0.25)`,
                strokeStyle: `rgb(${boxColors[i]})`,
                lineStyle: {
                    lineWidth: 2,
                }
            }
        }
    ));

    // extract the box polygon points to compute their centers
    // we can extract fields from a value with the DefSelect definition
    const pointArrays = boxes.map(v => scene.add(
        new DefSelect("points"), DefSelect.fromObject(v), { invisible }
    ));

    // DefMidpoint can take in an array value made of points
    const centers = pointArrays.map(v => scene.add(
        new DefMidPoint(), DefMidPoint.fromObject(v), { invisible }
    ));

    // create areas
    const areas = sideLengths.map(v => scene.add(new DefNumber(), DefNumber.fromFunc(x => x * x, v)));

    // create text
    const texts = centers.map((v, i) => scene.add(
        new DefText(),
        DefText.fromObjectRef({ obj: areas[i], ref: v }),
        {
            style: {
                strokeStyle: "rgb(255,255,255)",
                outline: {
                    lineWidth: 6,
                },
                textStyle: {
                    font: "20px sans-serif",
                    textAlign: "center",
                    textBaseline: "middle",
                },
            }
        }
    ));
}

function sat(container, canvas) {
    // get some fields for easier writing 
    const {
        DefPoint,
        DefLine,
        DefVector,
        DefPerpendicularLine,
        DefIntersection,
        DefPolygon,
        DefText,
        DefArc,
        DefClosestPoint,
        DefCurveParam,
        DefFunc,
        DefSelect,
        DefCurvePoint,
        DefBoolean,
        DefConditional,
        makeNumber,
        makeVector,
        INVALID,
    } = alg;

    // in this demo we will create  demo showing how the principle of the separating axis theorem (SAT) works


    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we don't use a background
    // we also let the painter take care of resizing the canvas to fill out the screen and adjusting the diagram accordingly
    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // we create two input polygons. 
    // we could also do arcs or ellipses, but that would make it a bit more complex here, so for this tutorial we stay with polygons
    // SAT is defined for convex shapes, so we have multiple options:
    // 1. Only triangles, they are always convex
    // 2. Use more than 3 vertices and allow the user to make concave shapes to explore the fail case. (we could also visualize that this case is false)
    // 3. Use more than 3 vertices and always use the convex cull (convex hull is a library function)

    // we choose option 2 here, as the others require a bit more code, but we listed the others to give you an idea
    // create polygon p points
    const pPointProps = {
        z: -1,
        style: {
            fillStyle: "rgb(255,0,0)",
        }
    };
    const p0 = scene.add(new DefPoint(0.5, -1), EMPTY_INFO, pPointProps);
    const p1 = scene.add(new DefPoint(1, -1), EMPTY_INFO, pPointProps);
    const p2 = scene.add(new DefPoint(1, 1), EMPTY_INFO, pPointProps);
    const p3 = scene.add(new DefPoint(0.5, 1), EMPTY_INFO, pPointProps);
    const p4 = scene.add(new DefPoint(0, 0), EMPTY_INFO, pPointProps);

    const pointsP = [p0, p1, p2, p3, p4];
    // polygon
    const p = scene.add(new DefPolygon(), DefPolygon.fromPoints(pointsP), {
        style: {
            strokeStyle: "rgb(255,0,0)",
            fillStyle: "rgba(255,0,0,0.25)",
        }
    });

    // create polygon q points
    const qPointProps = {
        z: -1,
        style: {
            fillStyle: "rgb(0,0,255)",
        }
    };
    const q0 = scene.add(new DefPoint(-1.5, -0.5), EMPTY_INFO, qPointProps);
    const q1 = scene.add(new DefPoint(-0.5, -0.5), EMPTY_INFO, qPointProps);
    const q2 = scene.add(new DefPoint(-0.5, 1), EMPTY_INFO, qPointProps);

    const pointsQ = [q0, q1, q2];
    const q = scene.add(new DefPolygon(), DefPolygon.fromPoints(pointsQ), {
        style: {
            fillStyle: "rgba(0,0,255,0.25)",
            strokeStyle: "rgb(0,0,255)",
        }
    });


    // the points will get projected onto a plane, but we don't want a fixed plane
    // we will use a basic circular handle to move around the surrounding plane

    const origin = scene.add(new DefPoint(0, 0), EMPTY_INFO, { invisible });
    // the movement circle
    const handleCircle = scene.add(new DefArc({ r: 2 }), DefArc.fromValues({ center: origin }), {
        style: {
            strokeStyle: "rgba(128,128,128,0.25)",
            outline: {
                lineWidth: 2,
                lineDash: [4],
            }
        }
    });
    // the point that we actually move
    const handlePoint = scene.add(new DefPoint(0, 4), EMPTY_INFO, { invisible });
    // the point that we handle
    const circlePoint = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(handlePoint, handleCircle), {
        style: {
            r: 6,
            fillStyle: "rgb(0,0,0)",
        }
    });

    // we now define the manipulation code
    // here, we have a slightly more complicated setup, where only one point is split between handle and move
    // we will just create the [reference,handle] pairs for all points, where both points are the same for the polygons
    const handleMoves = [[circlePoint, handlePoint]];
    [...pointsP, ...pointsQ].forEach(v => handleMoves.push([v, v]));

    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, diagram.canvas, handleMoves, 40);

    // we will now create a the line at our circle point
    // for that, we use the radius vector from the circle center to the handle point and attach a perpendicular line
    const dir = scene.add(new DefVector(), DefVector.fromPoints(origin, circlePoint), { invisible });

    // move the projection plane a bit further away, so the movement circle is visible
    const dirScaled = scene.add(new DefFunc(deps => {
        const { v } = deps;
        const vs = Vec2.scale(v, 1.2);
        return makeVector({ x: vs.x, y: vs.y, ref: v.ref });
    }), DefFunc.from({ v: dir }), { invisible });
    const planePoint = scene.add(new DefPoint(), DefPoint.fromPointOrVector(dirScaled), { invisible });

    const projectionPlane = scene.add(new DefPerpendicularLine(),
        DefPerpendicularLine.fromVectorsOrLine({ v: dir, ref: planePoint }),
        {
            style: {
                lineStyle: {
                    lineWidth: 2,
                }
            }
        });

    // we can now project all points onto the plane
    // first, we construct rays in the dir direction through each triangle point and then intersect those with the projection plane

    // helper function
    const makeLines = p => scene.add(
        new DefLine({ rightOpen: true }),
        DefLine.fromPointVector(p, dir),
        {
            style: {
                strokeStyle: "rgba(0,0,0,0.5)",
                lineStyle: {
                    lineDash: [2],
                }
            }
        });

    const linesP = pointsP.map(makeLines);
    const linesQ = pointsQ.map(makeLines);

    // intersection helper
    const makeIntersect = (l, props) => scene.add(
        new DefIntersection(),
        DefIntersection.fromObjects(l, projectionPlane, { takeIndex: 0 }), props
    );

    const projP = linesP.map(l => makeIntersect(l, { style: { r: 3, fillStyle: "rgb(255,0,0)", } }));
    const projQ = linesQ.map(l => makeIntersect(l, { style: { r: 3, fillStyle: "rgb(0,0,255)", } }));

    // for each of the points, we will compute its parameter on the projection plane
    // this could be relative to any point on the plane, so we can just use an inbuilt curve parameter definition
    // for a line, this will be with respect to the defining points

    const computeParams = p => scene.add(
        new DefCurveParam(),
        DefCurveParam.fromCurve(projectionPlane, p, { takeIndex: 0 })
    );

    const paramsP = projP.map(computeParams);
    const paramsQ = projQ.map(computeParams);

    // we will now find the minimum and maximum for each set
    // for that we will again define a helper function to be used in a general DefFunc
    const computeParamBounds = deps => {
        let tmin = Infinity;
        let tmax = -Infinity;

        // we assume the parameters are passed in as an array
        for (let tn of deps) {
            // parameters are numbers
            const t = tn.value;
            tmin = Math.min(tmin, t);
            tmax = Math.max(tmax, t);
        }

        return [tmin, tmax].map(t => makeNumber(t));
    };

    const boundsP = scene.add(new DefFunc(computeParamBounds), DefFunc.from(paramsP));
    const boundsQ = scene.add(new DefFunc(computeParamBounds), DefFunc.from(paramsQ));

    // these are both two element array, so we take the first and second element to get min/max
    const minP = scene.add(new DefSelect(0), DefSelect.fromObject(boundsP));
    const maxP = scene.add(new DefSelect(1), DefSelect.fromObject(boundsP));

    const minQ = scene.add(new DefSelect(0), DefSelect.fromObject(boundsQ));
    const maxQ = scene.add(new DefSelect(1), DefSelect.fromObject(boundsQ));

    // create points from the min max parameters
    // these points are the bounds of the projection line
    // since we used the inbuilt param function, we can revert those to get the actual points
    const minPointP = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: projectionPlane, t: minP }), { invisible });
    const maxPointP = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: projectionPlane, t: maxP }), { invisible });

    const minPointQ = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: projectionPlane, t: minQ }), { invisible });
    const maxPointQ = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: projectionPlane, t: maxQ }), { invisible });

    // we can now draw a line between each boundary point
    const lineProjP = scene.add(new DefLine(), DefLine.fromPoints(minPointP, maxPointP), {
        style: {
            strokeStyle: "rgba(255,0,0,0.5)",
            lineStyle: {
                lineWidth: 12,
            }
        }
    });

    const lineProjQ = scene.add(new DefLine(), DefLine.fromPoints(minPointQ, maxPointQ), {
        style: {
            strokeStyle: "rgba(0,0,255,0.5)",
            lineStyle: {
                lineWidth: 12,
            }
        }
    });

    // due to the alpha values, we can see, when the projected areas overlap, but we want to make it explicit
    // for that, we first create a predicate, that computes, whether the two parameter ranges overlap

    const doOverlap = scene.add(new DefBoolean(), DefBoolean.fromPredicate(deps => {
        const { rangeP, rangeQ } = deps;

        // the overlap check is just a 1D circle!
        const minP = rangeP[0].value;
        const maxP = rangeP[1].value;
        const minQ = rangeQ[0].value;
        const maxQ = rangeQ[1].value;

        const centerP = (maxP + minP) * 0.5;
        const rP = (maxP - minP) * 0.5;

        const centerQ = (maxQ + minQ) * 0.5;
        const rQ = (maxQ - minQ) * 0.5;

        // distance between the centers
        const d = Math.abs(centerP - centerQ);
        // combined radii
        const r = rP + rQ;

        // the 1D circles don't overlap, if their combined radii is less than the distance between the circles
        return r - d >= 1E-7;
    }, { rangeP: boundsP, rangeQ: boundsQ }));

    // we use two kinds of texts and display one according to the condition
    const textNoOverlap = scene.add(new DefText({ text: "No overlap", ref: { x: -2.5, y: -2.5 } }), EMPTY_INFO, { invisible });
    const textOverlap = scene.add(new DefText({ text: "Overlap", ref: { x: -2.5, y: -2.5 } }), EMPTY_INFO, { invisible });

    const textDoOverlap = scene.add(new DefConditional(),
        DefConditional.fromEitherOr(textOverlap, textNoOverlap, doOverlap),
        {
            style: {
                strokeStyle: "rgb(255,255,255)",
                outline: {
                    lineWidth: 4,
                },
                textStyle: {
                    font: "20px bold sans-serif",
                }
            }
        });

    // we will explicitly highlight a separation axis
    // the axis will go through the middle of the free bound region
    // this computation is very similar to the one to detect overlap
    // in this case, it will find the mean parameter
    // we will only define this point, if no overlap exists
    const midOverlapParameter = scene.add(new DefFunc(deps => {
        const { rangeP, rangeQ, doOverlap } = deps;
        if (doOverlap.value) {
            return INVALID;
        }

        // the overlap check is just a 1D circle!
        const minP = rangeP[0].value;
        const maxP = rangeP[1].value;
        const minQ = rangeQ[0].value;
        const maxQ = rangeQ[1].value;

        const centerP = (maxP + minP) * 0.5;
        const rP = (maxP - minP) * 0.5;

        const centerQ = (maxQ + minQ) * 0.5;
        const rQ = (maxQ - minQ) * 0.5;

        return makeNumber(0.5 * (centerP + centerQ) + 0.5 * (rP - rQ) * (centerP <= centerQ ? 1 : -1));
    }), DefFunc.from({ rangeP: boundsP, rangeQ: boundsQ, doOverlap }));

    const midOverlapPoint = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: projectionPlane, t: midOverlapParameter }), { invisible });

    // place the separating plane
    const sepPlane = scene.add(new DefPerpendicularLine(), DefPerpendicularLine.fromVectorsOrLine({ v: projectionPlane, ref: midOverlapPoint }), {
        style: {
            strokeStyle: "rgba(255,0,255,0.5)",
            lineStyle: {
                lineWidth: 4,
            },
        }
    });


    // we will create a simple feedback to show whether the quadrilateral is convex or concave
    // SAT only works with convex objects

    // there are efficient tests, but we will only implement a not so efficient but conceptually simple test here
    // in a convex polygon, each edge is part of the convex hull and all other points lie inside (or not outside) of the edge
    // depending on how the user orders the points, the object may become clockwise or counter clockwise, so we just use the first edge to determine the sign

    const isConvex = scene.add(new DefBoolean(), DefBoolean.fromPredicate(points => {
        // go through all n edges
        // for each edge, check that the remaining n-2 points are on one side
        const n = points.length;

        for (let i = 0; i < n; i++) {
            const p0 = points[i];
            const p1 = points[(i + 1) % n];
            const d = Vec2.sub(p1, p0);
            const norm = Vec2.normal2D(d);
            // get sign of first non edge point
            // we know that our polygon has at least 3 points
            // this algorithm handles arbitrary polygons
            let q = Vec2.sub(points[(i + 2) % n], p0);
            const s0 = Vec2.dot(norm, q) >= -1E-10 ? 1 : -1;

            for (let j = 1; j < n - 2; j++) {
                q = Vec2.sub(points[(i + 2 + j) % n], p0);
                let s = Vec2.dot(norm, q) >= -1E-10 ? 1 : -1;
                if (s * s0 < 0) {
                    return false;
                }
            }
        }

        return true;
    }, pointsP));

    // we will only display this, if the first shape is concave
    const textConvave = scene.add(new DefText({ text: "Red shape is concave!\nSAT only works for convex shapes!", ref: { x: 0, y: -2.5 } }), EMPTY_INFO, { invisible });

    // we negate the isConvex predicate
    const isConcave = scene.add(new DefBoolean(), DefBoolean.fromNot(isConvex));

    const displayConcave = scene.add(new DefConditional(), DefConditional.fromCondition(textConvave, isConcave), {
        style: {
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgb(255,255,255)",
            outline: {
                lineWidth: 4,
            },
            textStyle: {
                font: "15px bold sans-serif",
            }
        }
    });
}

function smoothFunction(container, canvas) {
    // get some fields for easier writing 
    const {
        DefNumber,
        DefFunc,
        DefBezierSpline,
        makePoint,
    } = alg;

    // in this demo we will display a smooth sine curve by computing a number of sample points and then displaying them using a Catmull-Rom spline

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new vis.DiagramCanvas({ x0: 0, y0: -2, x1: 2 * Math.PI, y1: 2, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });

    // we create a time variable for the sine function, so it can change
    const t = scene.add(new DefNumber(0));

    // amplitude
    const a = scene.add(new DefNumber(1));

    // set a number of subsampling points
    const n = scene.add(new DefNumber(20));

    const sinePoints = scene.add(new DefFunc(deps => {
        const { t, n, a } = deps;
        const tv = t.value;
        const nv = n.value;
        const av = a.value;
        const points = [];
        for (let i = 0; i < nv; i++) {
            const ox = (i / (nv - 1)) * 2 * Math.PI;
            const x = (i / (nv - 1) + tv) * 2 * Math.PI;
            const s = Math.sin(x) * av;
            points.push(makePoint({ x: ox, y: s }));
        }
        return points;
    }), DefFunc.from({ t, n, a }));

    const spline = scene.add(new DefBezierSpline(), DefBezierSpline.fromCatmullRom(sinePoints), {
        style: {
            lineStyle: {
                lineWidth: 2,
            },
        }
    });

    // simple time update
    const dt = 1 / 40;
    const update = () => {
        const tv = scene.get(t).value.value;
        scene.update(t, new DefNumber(tv + dt * 0.5));
        setTimeout(update, dt * 1000);

    };
    setTimeout(update, dt * 1000);

    // add slider to adjust sample points and amplitude
    // finally we will add two sliders to influence the values of eta0 and eta1
    const mapFrom = (v, min, max) => (v - min) / (max - min);
    const mapTo = (v, min, max) => v * (max - min) + min;
    // create the slider by getting the current eta values and mapping it between 0 and 100 
    // (integer slider values avoid some issues with decimal step sizes)
    const minA = 0;
    const maxA = 2;

    const minN = 3;
    const maxN = 50;
    // we can get all data associated with an object with scene.get
    const slider0 = makeSlider(0, 100, mapTo(mapFrom(scene.get(a).value.value, minA, maxA), 0, 100));
    const slider1 = makeSlider(minN, maxN, scene.get(n).value.value);

    slider0.oninput = () => {
        // convert slider value into [0,1]
        const t = mapFrom(parseInt(slider0.value), parseInt(slider0.min), parseInt(slider0.max));
        const an = mapTo(t, minA, maxA);

        // when updating a value, we can't use scene.add, as this would create a new object
        // we could use scene.set, but this is discouraged in this situation, as it completely resets the object and dependencies
        // especially dependencies are an issue, since the have to be recalculated along the chain
        // to avoid that, there is the method: scene.update
        // in general, the structure of a scene will not change, so dependencies are fixed
        // if a value has to be updated, we will just do that and not touch any dependencies (aside from them getting updated)

        scene.update(a, new DefNumber(an));
    };

    slider1.oninput = () => {
        // this is easier, since we have integer inputs
        // just set n
        const nv = parseInt(slider1.value);
        scene.update(n, new DefNumber(nv));
    };

    container.appendChild(makeContainer(makeTextField("Amplitude: "), slider0));
    container.appendChild(makeContainer(makeTextField("#Samples: "), slider1));

}

export {
    controllableRectangle,
    reflectionRefraction,
    pythagoras,
    sat,
    smoothFunction,
};