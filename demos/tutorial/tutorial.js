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

export {
    controllableRectangle,
    reflectionRefraction
};