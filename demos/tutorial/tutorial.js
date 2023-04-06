import { EMPTY_INFO, EMPTY, Vec2 } from "../../algeobra.js";
import * as alg from "../../algeobra.js";

import * as vis from "../../algeobraCanvas.js";

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

export {
    controllableRectangle,
};