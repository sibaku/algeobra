// Copyright 2023 sibaku

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";

/**
 * @module algeobraCanvas
 */

import {
    TYPE_ANGLE,
    TYPE_POINT,
    TYPE_VECTOR,
    TYPE_LINE,
    TYPE_LINE_STRIP,
    TYPE_POLYGON,
    TYPE_ARC,
    TYPE_ELLIPSE,
    TYPE_BEZIER,
    TYPE_BEZIER_SPLINE,
    TYPE_TEXT,
    DefPoint,
    GeometryScene,
    rad2deg,
    intersectLines,
    assertType,
    Vec2 as v2,
    createFromTemplate,
    subdivideBezierAdaptive,
} from "./algeobra.js";

/**
 * Style properties for drawing on a canvas
 */
const styles = {
    /**
    * Default styles that can be used for line and text styling
    */
    primitives: {
        // default values from https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        // not using experimentals
        line: {
            lineWidth: 1.0,
            lineCap: "butt",
            lineJoin: "miter",
            miterLimit: 10,
            lineDash: [],
            lineDashOffset: 0.0
        },
        text: {
            font: "10px sans-serif",
            textAlign: "start",
            textBaseline: "alphabetic",
            direction: "inherit",
            fontKerning: "auto",
        },
    },
    /**
     * Default style values for the different primitives.
     * These can be used as reference to check which properties can be set
     */
    geo: {
        point: {
            r: 4,
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgb(0,0,0)",
            outline: {
                lineWidth: 1.0,
                lineCap: "butt",
                lineJoin: "miter",
                miterLimit: 10,
                lineDash: [],
                lineDashOffset: 0.0
            },
        },

        text: {
            fillStyle: "rgb(0,0,0)",
            strokeStyle: "rgb(0,0,0)",
            outline: {
                lineWidth: 1.0,
                lineCap: "butt",
                lineJoin: "miter",
                miterLimit: 10,
                lineDash: [],
                lineDashOffset: 0.0
            },
            textStyle: {
                font: "10px sans-serif",
                textAlign: "start",
                textBaseline: "alphabetic",
                direction: "inherit",
                fontKerning: "auto",
            },
            offset: { x: 0, y: 0 },
        },

        angle: {
            r: 20,
            toDeg: true,
            arc: {
                showDirection: true,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
                outline: {
                    lineWidth: 1.0,
                    lineCap: "butt",
                    lineJoin: "miter",
                    miterLimit: 10,
                    lineDash: [],
                    lineDashOffset: 0.0
                },
            },
            text: {
                show: true,
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(0,0,0,0)",
                radius: 1.5,
                textStyle: {
                    font: "10px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 1.0,
                    lineCap: "butt",
                    lineJoin: "miter",
                    miterLimit: 10,
                    lineDash: [],
                    lineDashOffset: 0.0
                },
                transform: (angle, isDeg) => {
                    const format = new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    });
                    const t = format.format(angle);
                    return isDeg ? `${t}°` : `${t}`;
                }
            },
        },


        arc: {
            fillStyle: "rgba(0,0,0,0)",
            strokeStyle: "rgb(0,0,0)",
            outline: {
                lineWidth: 1.0,
                lineCap: "butt",
                lineJoin: "miter",
                miterLimit: 10,
                lineDash: [],
                lineDashOffset: 0.0
            },
            closeArc: false,
        },


        line: {
            strokeStyle: "rgb(0,0,0)",
            lineStyle: {
                lineWidth: 1.0,
                lineCap: "butt",
                lineJoin: "miter",
                miterLimit: 10,
                lineDash: [],
                lineDashOffset: 0.0
            },
        },
        vector: {
            shaft: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgb(0,0,0)",
                lineStyle: {
                    lineWidth: 1.0,
                    lineCap: "butt",
                    lineJoin: "miter",
                    miterLimit: 10,
                    lineDash: [],
                    lineDashOffset: 0.0
                },
            },
            arrow: {
                length: 0.2,
                width: 0.05,
                sizeRelative: true,
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgb(0,0,0)",
                lineStyle: {
                    lineWidth: 1.0,
                    lineCap: "butt",
                    lineJoin: "miter",
                    miterLimit: 10,
                    lineDash: [],
                    lineDashOffset: 0.0
                },
            }

        },
        polygon: {
            strokeStyle: "rgb(0,0,255)",
            fillStyle: "rgba(0,0,255,0.25)",
            lineStyle: {
                lineWidth: 1.0,
                lineCap: "butt",
                lineJoin: "miter",
                miterLimit: 10,
                lineDash: [],
                lineDashOffset: 0.0
            },
        },
    },
};

/**
 * Helper function to transform client coordinates into coordinates local to the given element
 * @param {Number} x The x position
 * @param {Number} y The y position
 * @param {HTMLElement} element The element to be relative to
 * @returns {{x:Number, y:Number}} The relative coordinates
 */
function clientPositionToLocal(x, y, element) {
    const rect = element.getBoundingClientRect();
    const lx = x - rect.left;
    const ly = y - rect.top;
    return { x: lx, y: ly };
}
/**
 * Helper function to transform mouse event coordinates into coordinates local to the element it happened on
 * @param {Object} e The mouse event
 * @returns {{x:Number, y:Number}} The relative coordinates
 */
function mouseEventToPosition(e) {

    return clientPositionToLocal(e.clientX, e.clientY, e.target);
}

/**
 * Configuration to draw no background
 */
const NO_BACKGROUND_CONFIG = {
    grid: {
        show: false
    },
    axes: {
        show: false
    }
};


/**
 * Configuration for a basic background with a coordinate system
 */
const BASIC_BACKGROUND_CONFIG = {
    grid: {
        strokeStyle: "rgb(192,192,192)",
        lineStyle: {
            lineWidth: 1.0,
            lineCap: "butt",
            lineJoin: "miter",
            miterLimit: 10,
            lineDash: [],
            lineDashOffset: 0.0
        },
        xticks: 1,
        yticks: 1,
        show: true
    },
    axes: {
        show: true,
        x: {
            strokeStyle: "rgb(0,0,0)",
            lineStyle: {
                lineWidth: 2,
                lineCap: "butt",
                lineJoin: "miter",
                miterLimit: 10,
                lineDash: [],
                lineDashOffset: 0.0
            },
            ticks: {
                show: true,
                spacing: 1,
                size: 0.1,
                strokeStyle: "rgb(0,0,0)",
                lineStyle: {
                    lineWidth: 2,
                    lineCap: "butt",
                    lineJoin: "miter",
                    miterLimit: 10,
                    lineDash: [],
                    lineDashOffset: 0.0
                },
            },
            labels: {
                show: true,
                strokeStyle: "rgb(192,192,192)",
                fillStyle: "rgb(192,192,192)",
                textStyle: {
                    font: "10px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
            },
            show: true
        },
        y: {
            strokeStyle: "rgb(0,0,0)",
            lineStyle: {
                lineWidth: 2,
                lineCap: "butt",
                lineJoin: "miter",
                miterLimit: 10,
                lineDash: [],
                lineDashOffset: 0.0
            },
            ticks: {
                show: true,
                spacing: 1,
                size: 0.1,
                strokeStyle: "rgb(0,0,0)",
                lineStyle: {
                    lineWidth: 2,
                    lineCap: "butt",
                    lineJoin: "miter",
                    miterLimit: 10,
                    lineDash: [],
                    lineDashOffset: 0.0
                },
            },
            labels: {
                show: true,
                strokeStyle: "rgb(192,192,192)",
                fillStyle: "rgb(192,192,192)",
                textStyle: {
                    font: "10px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
            },
            show: true
        },
        numberFormatter: null,
    }
};

/**
 * 
 * @param {Number} spacing The spacing in coordinate space
 * @param {Number} coordStart Start of the coordinate range
 * @param {Number} coordLength Length of the coordinate range
 * @param {Boolean } flip If true, coordinates gets flipped
 * @param {Number} outStart Start of the output range
 * @param {Number} outLength  Length of the output range
 * @returns {Array} Offsets
 */
function makeTicks(spacing, coordStart, coordLength, flip, outStart, outLength) {
    let g0 = spacing * Math.ceil(coordStart / spacing);
    // convert into window space
    const g0n = (g0 - coordStart) / coordLength;
    const wspacing = spacing / coordLength;
    // how many do we need?
    const num = coordLength / spacing;
    let offsets = [];
    for (let i = 0; i < num; i++) {
        let o = g0n + i * wspacing;
        let ob = g0 + i * spacing;
        if (flip) {
            o = 1 - o;
        }
        o = o * outLength + outStart;
        offsets.push([ob, o]);
    }

    return offsets;
}


/**
 * Simple mouse interaction
 * Takes a number of points and handles. 
 * They are separate to allow for constrained points that can be controlled via a handle. 
 * For example, a handle is the closest point on a circle to the settable point. Thus the handle will always be constrained to the circle.
 * 
 * Touch is still a bit finnicky.
 */
class PointManipulator {
    static #STATE_BASE = 0;
    static #STATE_GRABBING = 1;

    #state;
    #stateData;

    /**
     * 
     * @param {GeometryScene} scene The scene where the points are registered
     * @param {CoordinateMapper} coordinateMapper A mapper to convert from and to the canvas
     * @param {HTMLCanvasElement} canvas The canvas element
     * @param {{write : Number, read: Number, radius : Number}} pointDescriptors Descriptors for points and handles.
     * write: The point that is updated via the mouse position
     * read: The point that is used to check closeness
     * radius: Interaction radius of the point
     */
    constructor(scene, coordinateMapper, canvas, pointDescriptors) {

        this.scene = scene;
        this.writePoints = [];
        this.readPoints = [];

        this.handlers = {};

        for (let o of pointDescriptors) {
            const { write, read, radius } = o;
            this.writePoints.push(write);
            this.readPoints.push({ index: read, radius });
        }

        this.#state = 0;
        this.#stateData = {};

        this.attach(canvas, coordinateMapper);


    }

    /**
     * Remove this from the local canvas
     */
    detach() {
        for (let key of Object.keys(this.handlers)) {
            this.#removeListener(key);
        }
        this.#stateData.down = false;
        this.#stateData.lastPos = null;
        this.#stateData.lastDownPos = null;

        this.#state = PointManipulator.#STATE_BASE;
    }

    /**
     * Attach this to a new canvas
     * @param {HTMLCanvasElement} canvas The new canvas
     * @param {CoordinateMapper} coordinateMapper The corresponding coordinate mapper
     */
    attach(canvas, coordinateMapper) {
        this.detach();
        this.handlers = {};
        this.canvas = canvas;
        this.coordinateMapper = coordinateMapper;

        this.#addListener("mousedown", e => this.#handleMousedown(e));
        this.#addListener("mouseup", e => this.#handleMouseup(e));
        this.#addListener("mouseleave", e => this.#handleMouseleave(e));
        this.#addListener("mousemove", e => this.#handleMousemove(e));

        this.#addListener("touchstart", e => this.#handleTouchStart(e));
        this.#addListener("touchend", e => this.#handleTouchEnd(e));
        this.#addListener("touchmove", e => this.#handleTouchMove(e));
        this.#addListener("touchcancel", e => this.#handleTouchCancel(e));

    }

    #addListener(type, handler) {
        this.#removeListener(type);
        this.canvas.addEventListener(type, handler);
        this.handlers[type] = handler;
    }
    #removeListener(type) {
        const handler = this.handlers[type];
        if (handler) {
            this.canvas.removeEventListener(type, handler);
            delete this.handlers[type];
        }
    }
    #handleTouchStart(e) {
        if (!e.touches[0]) {
            return;
        }

        const touch0 = e.touches[0];
        const pos = clientPositionToLocal(touch0.clientX, touch0.clientY, this.canvas);

        this.#stateData.down = true;
        this.#stateData.lastPos = pos;
        this.#stateData.lastDownPos = pos;


        if (this.#state === PointManipulator.#STATE_BASE) {

            const lpos = this.coordinateMapper.convertSurfaceToLocal(pos.x, pos.y);

            const mIdx = this.#findClosest(lpos);

            if (mIdx >= 0) {
                // found point, set as grab
                this.#state = PointManipulator.#STATE_GRABBING;
                this.#stateData.idx = mIdx;
            }

            this.#stateData.lastTime = new Date().getTime();


        }
    }
    #handleTouchEnd(e) {
        const touch0 = e.changedTouches[0];

        const pos = clientPositionToLocal(touch0.clientX, touch0.clientY, this.canvas);

        this.#stateData.down = false;
        this.#stateData.lastPos = pos;
        this.#stateData.lastDownPos = null;

        this.#state = PointManipulator.#STATE_BASE;
    }
    #handleTouchMove(e) {

        const touch0 = e.touches[0];

        // output point
        const pos = clientPositionToLocal(touch0.clientX, touch0.clientY, this.canvas);

        const lpos = this.coordinateMapper.convertSurfaceToLocal(pos.x, pos.y);
        if (this.#state === PointManipulator.#STATE_GRABBING) {
            const curTime = new Date().getTime();
            const delta = curTime - this.#stateData.lastTime;

            if (delta < 40) {
                // swipe
                this.#stateData.down = false;
                this.#stateData.lastDownPos = null;

                this.#state = PointManipulator.#STATE_BASE;

                return;
            }
            e.preventDefault();
            if (!e.touches[0]) {
                return;
            }
            const { idx } = this.#stateData;
            const writePoint = this.writePoints[idx];
            // clamp to canvas, as touch may go outside
            lpos.x = Math.max(this.coordinateMapper.x0, Math.min(lpos.x, this.coordinateMapper.x1));
            lpos.y = Math.max(this.coordinateMapper.y0, Math.min(lpos.y, this.coordinateMapper.y1));
            this.scene.update(writePoint, new DefPoint(lpos.x, lpos.y));
        }

        this.#stateData.lastPos = pos;
    }
    #handleTouchCancel(e) {
        const touch0 = e.changedTouches[0];

        const pos = clientPositionToLocal(touch0.clientX, touch0.clientY, this.canvas);

        this.#stateData.down = false;
        this.#stateData.lastPos = pos;
        this.#stateData.lastDownPos = null;

        this.#state = PointManipulator.#STATE_BASE;
    }

    #findClosest(pos) {
        const scene = this.scene;
        // go through read points and find closest
        let mIdx = -1;
        let mD2 = Infinity;
        for (let i = 0; i < this.readPoints.length; i++) {
            const rp = this.readPoints[i];
            const rpv = scene.get(rp.index).value;
            assertType(rpv, TYPE_POINT);

            const d2 = v2.len2(v2.sub(rpv, pos));
            // scale radius to local space
            const rl = rp.radius / this.coordinateMapper.scalingLocalToSurface();
            const rl2 = rl * rl;
            if (d2 < rl2 && d2 < mD2) {
                mD2 = d2;
                mIdx = i;
            }
        }
        return mIdx;
    }
    #handleMousedown(e) {
        const pos = mouseEventToPosition(e);

        this.#stateData.down = true;
        this.#stateData.lastPos = pos;
        this.#stateData.lastDownPos = pos;

        if (this.#state === PointManipulator.#STATE_BASE) {


            const lpos = this.coordinateMapper.convertSurfaceToLocal(pos.x, pos.y);


            const mIdx = this.#findClosest(lpos);

            if (mIdx >= 0) {
                // found point, set as grab
                this.#state = PointManipulator.#STATE_GRABBING;
                this.#stateData.idx = mIdx;
            }
        }
    }

    #handleMouseup(e) {
        const pos = mouseEventToPosition(e);

        this.#stateData.down = false;
        this.#stateData.lastPos = pos;
        this.#stateData.lastDownPos = null;

        this.#state = PointManipulator.#STATE_BASE;
    }

    #handleMouseleave(e) {
        const pos = mouseEventToPosition(e);

        this.#stateData.down = false;
        this.#stateData.lastPos = pos;
        this.#stateData.lastDownPos = null;

        this.#state = PointManipulator.#STATE_BASE;
    }

    #handleMousemove(e) {
        // output point
        const pos = mouseEventToPosition(e);
        const lpos = this.coordinateMapper.convertSurfaceToLocal(pos.x, pos.y);
        if (this.#state === PointManipulator.#STATE_GRABBING) {
            const { idx } = this.#stateData;
            const writePoint = this.writePoints[idx];

            this.scene.update(writePoint, new DefPoint(lpos.x, lpos.y));
        }

        this.#stateData.lastPos = pos;
    }

    /**
     * Create a new PointManipulator that allows one to move the given points
     * @param {GeometryScene} scene The scene
     * @param {CoordinateMapper} coordinateMapper Mapper
     * @param {HTMLCanvasElement} canvas The canvas to attach to
     * @param {Array<Number>} points An array of point indices from the scene
     * @param {Number} radius The interaction radius of the points
     * @returns {PointManipulator} A new manipulator
     */
    static createForPoints(scene, coordinateMapper, canvas, points, radius) {
        const descriptors = [];

        for (let p of points) {
            descriptors.push({ read: p, write: p, radius });
        }

        return new PointManipulator(scene, coordinateMapper, canvas, descriptors);
    }
    /**
     * Create a new PointManipulator that allows one to move the given points using handles
     * @param {GeometryScene} scene The scene
     * @param {CoordinateMapper} coordinateMapper Mapper
     * @param {HTMLCanvasElement} canvas The canvas to attach to
     * @param {Array<Number[]>} points An array of arrays, where the second array elements are of length two and contains [point index, handle index] from the scene
     * @param {Number} radius The interaction radius of the points
     * @returns {PointManipulator} A new manipulator
     */
    static createForPointsAndHandles(scene, coordinateMapper, canvas, pointsAndHandles, radius) {

        const descriptors = [];

        for (let i = 0; i < pointsAndHandles.length; i++) {
            const pi = pointsAndHandles[i];

            let p, h;

            if (Array.isArray(pi) && pi.length === 2) {
                if (pi.length === 2) {
                    [p, h] = pi;
                } else {
                    p = pi[0];
                    h = p;
                }
            } else {
                p = pi;
                h = p;
            }
            descriptors.push({ read: p, write: h, radius });
        }

        return new PointManipulator(scene, coordinateMapper, canvas, descriptors);
    }
}

/**
 * Clips a possibly infinite line against a viewport
 * @param {CoordinateMapper} coordinateMapper The coordinate mapper
 * @param {Number} x0 First point x coordinate
 * @param {Number} y0 First point y coordinate
 * @param {Number} x1 Second point x coordinate
 * @param {Number} y1 Second point y coordinate
 * @param {Boolean} leftOpen Specifies, whether the line extends to infinity from the first point
 * @param {Boolean} rightOpen Specifies, whether the line extends to infinity from the second point
 * @returns {{ p0: { x: Number, y: Number }, p1: { x: Number, y: Number }}} The clipped end points of the line
 */
function clipLineAtScreen(coordinateMapper, x0, y0, x1, y1, leftOpen, rightOpen) {

    const cMap = coordinateMapper;
    const points = cMap.viewportCorners;
    const sides = cMap.viewportSides;
    const vx = x1 - x0;
    const vy = y1 - y0;

    const a0 = { x: x0, y: y0 };
    const a1 = { x: x1, y: y1 };

    let tmin = leftOpen ? -Infinity : 0;
    let tmax = rightOpen ? Infinity : 1;

    for (let i = 0; i < sides.length; i++) {
        const si = sides[i];

        const inter = intersectLines(a0, a1, si.p0, si.p1);
        if (!inter) {
            // parallel
            continue;
        }

        const dotvn = si.n.x * vx + si.n.y * vy;
        if (dotvn < 0) {
            // incoming
            tmin = Math.max(tmin, inter.ua);
        } else {
            tmax = Math.min(tmax, inter.ua);
        }

    }

    const rx0 = x0 + tmin * vx;
    const ry0 = y0 + tmin * vy;

    const rx1 = x0 + tmax * vx;
    const ry1 = y0 + tmax * vy;

    return {
        p0: {
            x: rx0,
            y: ry0
        },
        p1: {
            x: rx1,
            y: ry1
        }
    };

}

/**
 * A helper class to handle coordinate transformations between an output surface and an abstract coordinate space
 */
class CoordinateMapper {
    /**
     * 
     * @param {Object} params
     * @param {Number} [params.x0] The x origin
     * @param {Number} [params.y0] The y origin
     * @param {Number} [params.x1] The x end
     * @param {Number} [params.x1] The y end
     * @param {Boolean} [params.flipY] Specifies whether the y axis should be flipped
     * @param {Number} params.width The width of the output
     * @param {Number} params.height The height of the output
     */
    constructor({
        x0 = 0,
        y0 = 0,
        x1 = 1,
        y1 = 1,
        flipY = true,
        width,
        height
    }) {
        this.surface = { width, height };
        this.flipY = flipY;

        this.updateViewport({ x0, y0, x1, y1 });
    }

    updateSurface(width, height) {
        this.surface = { width, height };
        this.#computeAdjustedViewport();
    }

    /**
     * Update the visible viewport
     * @param {Object} params
     * @param {Number} [params.x0] The x origin
     * @param {Number} [params.y0] The y origin
     * @param {Number} [params.x1] The x end
     * @param {Number} [params.x1] The y end
     */
    updateViewport({
        x0, y0,
        x1, y1,
    } = {}) {
        this.requestedViewport = {
            x0, y0,
            x1, y1,
        };


        this.#computeAdjustedViewport();
    }


    /**
     * Converts a local coordinate to the output surface space
     * @param {Number} x 
     * @param {Number} y 
     * @returns {{x: Number, y:Number}} The transformed coordinate
     */
    convertLocalToSurface(x, y) {
        // 
        const { x0, y0, x1, y1 } = this;

        const w = x1 - x0;
        const h = y1 - y0;

        x = (x - x0) / w;
        y = (y - y0) / h;

        if (this.flipY) {
            y = 1.0 - y;
        }

        // scale to canvas
        x = x * this.surface.width;
        y = y * this.surface.height;

        return { x, y };
    }
    /**
     * Converts a output surface coordinate to the local space
     * @param {Number} x 
     * @param {Number} y 
     * @returns {{x: Number, y:Number}} The transformed coordinate
     */
    convertSurfaceToLocal(x, y) {

        x = x / this.surface.width;
        y = y / this.surface.height;

        if (this.flipY) {
            y = 1.0 - y;
        }

        const { x0, y0, x1, y1 } = this;

        const w = x1 - x0;
        const h = y1 - y0;


        x = x * w + x0;
        y = y * h + y0;

        return { x, y };
    }

    /**
     * The scaling factor that scales local lengths to the output surface space.
     * The viewport is uniformly scaled, so it is just a single value
     * @returns {Number} The scaling factor
     */
    scalingLocalToSurface() {
        // we will make sure to not scale dimensions differently
        return this.surface.width / (this.x1 - this.x0);
    }

    /**
  * The scaling factor that scales local lengths to the output surface space.
  * The viewport is uniformly scaled, so it is just a single value
  * @returns {Number} The scaling factor
  */
    scalingSurfaceToLocal() {
        // we will make sure to not scale dimensions differently
        return 1.0 / this.scalingLocalToSurface();
    }


    /**
     * Converts a local angle to output surface angle
     * @param {Number} a The local angle
     * @returns {Number} The transformed angle
     */
    convertLocalAngleToSurface(a) {
        if (this.flipY) {
            return -a;
        }

        return a;
    }

    /**
     * 
     * @returns True, if angles are measured counter-clockwise on the output surface, false otherwise
     */
    isCounterClockwise() {
        return this.flipY;
    }


    #computeAdjustedViewport() {
        // try to stretch the desired viewport into the actual canvas size as good as possible
        // this might require expanding the actual viewport outside of the desired one
        const { surface } = this;
        {
            const ac = surface.width / surface.height;
            const { x0, y0, x1, y1 } = this.requestedViewport;
            const w = x1 - x0;
            const h = y1 - y0;
            const ad = w / h;

            let width;
            let height;

            if (ac > ad) {
                // the desired viewport is wider than the actual one
                // we will push the height to fill out the canvas
                height = h;
                // use the viewport aspect ratio to compute w
                width = height * ac;
            } else {
                // the other way around
                width = w;
                height = width / ac;
            }

            // desired center
            const cx = (x0 + x1) * 0.5;
            const cy = (y0 + y1) * 0.5;

            // set new bounds from the center
            this.x0 = cx - 0.5 * width;
            this.y0 = cy - 0.5 * height;

            this.x1 = cx + 0.5 * width;
            this.y1 = cy + 0.5 * height;

        }

        const { x0: cx0, y0: cy0, x1: cx1, y1: cy1 } = this;
        const c0 = { x: cx0, y: cy0 };
        const c1 = { x: cx1, y: cy0 };
        const c2 = { x: cx1, y: cy1 };
        const c3 = { x: cx0, y: cy1 };
        const points = [c0, c1, c2, c3];

        const sides = [];
        for (let i = 0; i < points.length; i++) {
            const ip = (i + 1) % points.length;
            const a = points[i];
            const b = points[ip];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            // normals pointing outwards
            sides.push({ p0: a, p1: b, n: { x: dy, y: -dx } });
        }

        this.viewportCorners = points;
        this.viewportSides = sides;
    }
}

/**
 * Drawing utilities for a Html canvas element
 */
class DiagramCanvas {

    /**
     * @param {Object} params
     * @param {Number} [params.x0] The x origin
     * @param {Number} [params.y0] The y origin
     * @param {Number} [params.x1] The x end
     * @param {Number} [params.x1] The y end
     * @param {Boolean} [params.flipY] Specifies whether the y axis should be flipped
     * @param {HTMLCanvasElement} params.canvas The output canvas
     */
    constructor({
        x0 = 0,
        y0 = 0,
        x1 = 1,
        y1 = 1,
        flipY = true,
        canvas
    } = {}) {

        this.flipY = flipY;
        this.canvas = canvas;

        this.context = canvas.getContext("2d");
        this.coordinateMapper = new CoordinateMapper({
            x0, y0, x1, y1, flipY, width: canvas.width, height: canvas.height,
        });

        this.subdivisionThreshold = 4;
    }

    /**
     * Update the visible viewport
     * @param {Object} params
     * @param {Number} [params.x0] The x origin
     * @param {Number} [params.y0] The y origin
     * @param {Number} [params.x1] The x end
     * @param {Number} [params.x1] The y end
     */
    updateViewport({
        x0, y0,
        x1, y1,
    } = {}) {

        this.coordinateMapper.updateViewport({ x0, y0, x1, y1 });
    }

    notifyCanvasSizeChanged() {
        this.coordinateMapper.updateSurface(this.canvas.width, this.canvas.height);
    }
    /**
     * Clear the canvas
     * @param {Object} params
     * @param {Boolean} params.fillAlpha If true, the canvas will be filled with opaque white, otherwise it will be cleared
     */
    clear({
        fillAlpha = true,
    } = {}) {
        if (fillAlpha) {
            this.context.save();
            this.context.fillStyle = "rgb(255,255,255)";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.restore();
        } else {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }



    #applyLineStyle(lineStyle) {
        const ctx = this.context;
        const {
            lineWidth,
            lineCap,
            lineJoin,
            miterLimit,
            lineDash,
            lineDashOffset,
        } = lineStyle;

        ctx.lineWidth = lineWidth;
        ctx.lineCap = lineCap;
        ctx.lineJoin = lineJoin;
        ctx.miterLimit = miterLimit;
        ctx.setLineDash(lineDash);
        ctx.lineDashOffset = lineDashOffset;
    }

    #applyFontStyle(fontStyle) {
        const ctx = this.context;
        const {
            font,
            textAlign,
            textBaseline,
            direction,
            fontKerning,
        } = fontStyle;
        ctx.font = font;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.direction = direction;
        ctx.fontKerning = fontKerning;
    }

    /**
     * Draws a background
     * All options can be found in the BASIC_BACKGROUND_CONFIG object
     * @param {Object} config The background config
     */
    drawBackground(config = NO_BACKGROUND_CONFIG) {
        const { axes = {}, grid = {}, numberFormatter = (v) => v } = config;
        const { x0, y0, x1, y1, flipY } = this.coordinateMapper;

        const w = x1 - x0;
        const h = y1 - y0;

        const { canvas, context: ctx } = this;

        const cMap = this.coordinateMapper;

        if (grid.show) {

            const { strokeStyle, lineStyle } = grid;

            ctx.save();
            this.#applyLineStyle(lineStyle);

            ctx.strokeStyle = strokeStyle;

            const { xticks, yticks } = grid;

            let xOffsets = [];

            if (typeof (xticks) === "number") {
                xOffsets = makeTicks(xticks, x0, w, false, 0, canvas.width);
            } else if (Array.isArray(xticks)) {
                xOffsets = xticks.map(v => [v, (v - x0) / w * canvas.width]);
            }

            let yOffsets = [];

            if (typeof (yticks) === "number") {
                yOffsets = makeTicks(yticks, y0, h, flipY, 0, canvas.height);
            } else if (Array.isArray(yticks)) {
                yOffsets = yticks.map(v => [v, (v - y0) / h * canvas.height]);
            }



            ctx.beginPath();
            for (let off of xOffsets) {
                const [, x] = off;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }
            for (let off of yOffsets) {
                const [, y] = off;
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();


            ctx.restore();
        }

        if (axes.show) {

            ctx.save();

            // compute coordinate center
            const c = cMap.convertLocalToSurface(0, 0);

            // draw coordinate lines
            const { x, y } = axes;
            if (x.show) {
                const { strokeStyle, lineStyle } = x;
                ctx.strokeStyle = strokeStyle;
                this.#applyLineStyle(lineStyle);

                ctx.beginPath();
                ctx.moveTo(0, c.y);
                ctx.lineTo(canvas.width, c.y);
                ctx.stroke();

                // ticks + labels
                const { ticks } = x;
                if (ticks.show) {
                    const tickOffsets = makeTicks(ticks.spacing, x0, w, false, 0, canvas.width);

                    ctx.strokeStyle = ticks.strokeStyle;
                    this.#applyLineStyle(ticks.lineStyle);

                    const { size } = ticks;
                    const sizeCanvas = size * cMap.scalingLocalToSurface();
                    ctx.beginPath();

                    for (let offsets of tickOffsets) {
                        const [, o] = offsets;
                        ctx.moveTo(o, c.y - sizeCanvas);
                        ctx.lineTo(o, c.y + sizeCanvas);
                    }
                    ctx.stroke();

                    const { labels } = x;
                    if (labels.show) {
                        this.#applyFontStyle(labels.textStyle);
                        let textOffset = -sizeCanvas * 1.5;
                        textOffset *= this.flipY ? -1 : 1;

                        for (let off of tickOffsets) {
                            const [ob, o] = off;
                            const txt = numberFormatter(ob);
                            const m = ctx.measureText(txt);
                            const offy = textOffset + m.actualBoundingBoxAscent;
                            const offx = -m.width * 0.5;

                            ctx.fillText(txt, o + offx, c.y + offy);
                        }
                    }
                }

            }

            if (y.show) {
                const { strokeStyle, lineStyle } = y;
                ctx.strokeStyle = strokeStyle;
                this.#applyLineStyle(lineStyle);

                ctx.beginPath();
                ctx.moveTo(c.x, 0);
                ctx.lineTo(c.x, canvas.height);
                ctx.stroke();

                // ticks + labels
                const { ticks, labels } = y;
                if (ticks.show) {
                    const tickOffsets = makeTicks(ticks.spacing, y0, h, this.flipY
                        , 0, canvas.height);

                    ctx.strokeStyle = ticks.strokeStyle;
                    this.#applyLineStyle(ticks.lineStyle);

                    const { size } = ticks;
                    const sizeCanvas = size * cMap.scalingLocalToSurface();
                    ctx.beginPath();

                    for (let offsets of tickOffsets) {
                        const [, o] = offsets;
                        ctx.moveTo(c.x - sizeCanvas, o);
                        ctx.lineTo(c.x + sizeCanvas, o);
                    }
                    ctx.stroke();

                    if (labels.show) {
                        this.#applyFontStyle(labels.textStyle);
                        let textOffset = -sizeCanvas * 1.5;

                        for (let off of tickOffsets) {
                            const [ob, o] = off;
                            const txt = numberFormatter(ob);
                            const m = ctx.measureText(txt);
                            const textCy = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) * 0.5;
                            const offy = textCy;
                            const offx = textOffset - m.actualBoundingBoxRight;

                            ctx.fillText(txt, c.x + offx, o + offy);
                        }
                    }
                }
            }


            ctx.restore();
        }
    }

    /**
     * Draws a point
     * Style options and defaults can be found at styles.geo.point
     * @param {Number} x x coordinate in local space
     * @param {Number} y y coordinate in local space
     * @param {Object} style
     */
    drawPoint(x, y, style = {}) {

        style = createFromTemplate(styles.geo.point, style);
        let {
            r,
            fillStyle,
            strokeStyle,
            outline,
        } = style;

        const ctx = this.context;

        ctx.save();

        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;

        this.#applyLineStyle(outline);

        ({ x, y } = this.coordinateMapper.convertLocalToSurface(x, y));

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2.0 * Math.PI);

        ctx.fill();
        ctx.stroke();
        ctx.restore();

    }

    /**
     * Draws text
     * Style options and defaults can be found at styles.geo.text
     * @param {Number} x x coordinate in local space
     * @param {Number} y y coordinate in local space
     * @param {String} text 
     * @param {Object} style
     */
    drawText(x, y, text, style = {}) {

        style = createFromTemplate(styles.geo.text, style);
        let {
            fillStyle,
            strokeStyle,
            outline,
            textStyle,
            offset,
        } = style;

        ({ x, y } = this.coordinateMapper.convertLocalToSurface(x + offset.x, y + offset.y));

        const ctx = this.context;

        ctx.save();

        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        this.#applyLineStyle(outline);
        this.#applyFontStyle(textStyle);

        // split lines
        const lines = text.split("\n");

        const metrics = ctx.measureText(text);
        let lineHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        if (!this.flipY) {
            lineHeight *= -1;
        }

        for (let l of lines) {
            ctx.beginPath();
            ctx.strokeText(l, x, y);
            ctx.fillText(l, x, y);
            y += lineHeight;
        }

        ctx.restore();
    }

    /**
     * Draws an angle
     * Style options and defaults can be found at styles.geo.angle
     * @param {Number} x x coordinate in local space
     * @param {Number} y y coordinate in local space
     * @param {Number} angle The angle itself
     * @param {Number} start Where the angle starts
     * @param {Object} style
     */
    drawAngle(x, y, angle, start, style = {}) {

        style = createFromTemplate(styles.geo.angle, style);
        let {
            r,
            toDeg,
            arc,
            text,
        } = style;

        const cMap = this.coordinateMapper;

        const rLocal = r / cMap.scalingLocalToSurface();
        const angleEnd = start + angle;
        const angleMid = start + 0.5 * angle;

        // compute angle center to place text at
        let cx = x + rLocal * text.radius * Math.cos(angleMid);
        let cy = y + rLocal * text.radius * Math.sin(angleMid);

        let { x: xl, y: yl } = cMap.convertLocalToSurface(x, y);
        ({ x: cx, y: cy } = cMap.convertLocalToSurface(cx, cy));
        const ctx = this.context;

        ctx.save();

        ctx.fillStyle = arc.fillStyle;
        ctx.strokeStyle = arc.strokeStyle;
        this.#applyLineStyle(arc.outline);




        ctx.beginPath();
        ctx.moveTo(xl, yl);
        ctx.arc(xl, yl, r, cMap.convertLocalAngleToSurface(start), cMap.convertLocalAngleToSurface(angleEnd), cMap.isCounterClockwise());
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (arc.showDirection) {
            // final point

            const dir = {
                x: Math.cos(angleEnd),
                y: Math.sin(angleEnd)
            };
            const backDir = {
                x: dir.y,
                y: -dir.x
            };
            let x0 = x + rLocal * dir.x;
            let y0 = y + rLocal * dir.y;

            let x1 = x0 + 0.6 * rLocal * backDir.x;
            let y1 = y0 + 0.6 * rLocal * backDir.y;

            let x2 = x1 + 0.2 * rLocal * dir.x;
            let y2 = y1 + 0.2 * rLocal * dir.y;


            ({ x: x0, y: y0 } = cMap.convertLocalToSurface(x0, y0));
            ({ x: x1, y: y1 } = cMap.convertLocalToSurface(x1, y1));
            ({ x: x2, y: y2 } = cMap.convertLocalToSurface(x2, y2));

            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();


        }

        if (text.show) {
            let txtAngle = toDeg ? rad2deg(angle) : angle;

            const displayText = text.transform ? text.transform(txtAngle, toDeg) : "";
            this.#applyFontStyle(text.textStyle);
            this.#applyLineStyle(text.outline);

            ctx.fillStyle = text.fillStyle;
            ctx.strokeStyle = text.strokeStyle;
            ctx.strokeText(displayText, cx, cy);
            ctx.fillText(displayText, cx, cy);
        }

        ctx.restore();
    }

    /**
     * Draws an arc
     * Style options and defaults can be found at styles.geo.arc
     * @param {Number} x x coordinate in local space
     * @param {Number} y y coordinate in local space
     * @param {Number} r radius in local space
     * @param {Number} startAngle The start angle
     * @param {Number} endAngle The end angle
     * @param {Object} style
     */
    drawArc(x, y, r, startAngle = 0, endAngle = 2.0 * Math.PI, style = {}) {
        style = createFromTemplate(styles.geo.arc, style);

        let {
            fillStyle,
            strokeStyle,
            outline,
            closeArc,
        } = style;

        const ctx = this.context;

        const cMap = this.coordinateMapper;

        ctx.save();

        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;

        this.#applyLineStyle(outline);

        ({ x, y } = cMap.convertLocalToSurface(x, y));
        r *= cMap.scalingLocalToSurface();

        ctx.beginPath();
        if (closeArc) {
            ctx.moveTo(x, y);
        }
        ctx.arc(x, y, r,
            cMap.convertLocalAngleToSurface(startAngle),
            cMap.convertLocalAngleToSurface(endAngle),
            cMap.isCounterClockwise());

        if (closeArc) {
            ctx.closePath();
        }
        ctx.stroke();
        ctx.fill();
        ctx.restore();

    }

    /**
     * Draws an ellipse
     * Style options and defaults can be found at styles.geo.arc
     * @param {Number} x x coordinate in local space
     * @param {Number} y y coordinate in local space
     * @param {Number} rx x-eccentricity in local space
     * @param {Number} ry y-eccentricity in local space
     * @param {Number} startAngle The start angle
     * @param {Number} endAngle The end angle
     * @param {Number} rotation The rotation of the ellipse
     * @param {Object} style 
     */
    drawEllipse(
        x, y,
        rx, ry,
        startAngle, endAngle,
        rotation,
        style = {}) {

        style = createFromTemplate(styles.geo.arc, style);

        let {
            fillStyle,
            strokeStyle,
            outline,
            closeArc,
        } = style;

        const ctx = this.context;

        const cMap = this.coordinateMapper;
        ctx.save();

        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;

        this.#applyLineStyle(outline);

        ({ x, y } = cMap.convertLocalToSurface(x, y));
        rx *= cMap.scalingLocalToSurface();
        ry *= cMap.scalingLocalToSurface();

        ctx.beginPath();

        if (closeArc) {
            ctx.moveTo(x, y);
        }

        ctx.ellipse(x, y, rx, ry,
            cMap.convertLocalAngleToSurface(rotation),
            cMap.convertLocalAngleToSurface(startAngle),
            cMap.convertLocalAngleToSurface(endAngle),
            cMap.isCounterClockwise());

        if (closeArc) {
            ctx.closePath();
        }
        ctx.stroke();
        ctx.fill();
        ctx.restore();

    }


    /**
     * Draws a line
     * Style options and defaults can be found at styles.geo.line
     * @param {Number} x0 x coordinate in local space of the first point
     * @param {Number} y0 y coordinate in local space of the first point
     * @param {Number} x1 x coordinate in local space of the second point
     * @param {Number} y1 y coordinate in local space of the second point
     * @param {Boolean} leftOpen Specifies, whether the line extends to infinity from the first point
     * @param {Boolean} rightOpen Specifies, whether the line extends to infinity from the second point
     * @param {Object} style 
     */
    drawLine(x0, y0, x1, y1, leftOpen, rightOpen, style = {}) {

        style = createFromTemplate(styles.geo.line, style);

        let {
            strokeStyle = "rgb(0,0,0)",
            lineStyle,
        } = style;


        const ctx = this.context;

        const cMap = this.coordinateMapper;

        ctx.save();

        ctx.strokeStyle = strokeStyle;
        this.#applyLineStyle(lineStyle, styles.geo.line.lineStyle);

        const { p0, p1 } = clipLineAtScreen(this.coordinateMapper, x0, y0, x1, y1, leftOpen, rightOpen);

        ({ x: x0, y: y0 } = cMap.convertLocalToSurface(p0.x, p0.y));
        ({ x: x1, y: y1 } = cMap.convertLocalToSurface(p1.x, p1.y));

        ctx.beginPath();

        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);

        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draws a Bezier curve
     * Style options and defaults can be found at styles.geo.line
     * @param {Array<{x:Number, y:Number}>} points Control point coordinates in local space
     * @param {Object} style 
     */
    drawBezier(points, style = {}) {
        if (points.length < 2) {
            throw new Error(`Bezier curve must have degree of at least 1`);
        }

        style = createFromTemplate(styles.geo.line, style);

        let {
            strokeStyle = "rgb(0,0,0)",
            lineStyle,
        } = style;


        const ctx = this.context;

        const cMap = this.coordinateMapper;

        ctx.save();

        ctx.strokeStyle = strokeStyle;
        this.#applyLineStyle(lineStyle, styles.geo.line.lineStyle);

        const pointsScreen = points.map(v => cMap.convertLocalToSurface(v.x, v.y));

        ctx.beginPath();
        if (pointsScreen.length === 2) {
            // just a line
            const [p0, p1] = pointsScreen;
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
        }
        else if (pointsScreen.length === 3) {
            const [p0, p1, p2] = pointsScreen;
            // quadratic curve
            ctx.moveTo(p0.x, p0.y);
            ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);

        } else if (pointsScreen.length === 4) {
            const [p0, p1, p2, p3] = pointsScreen;
            // quadratic curve
            ctx.moveTo(p0.x, p0.y);
            ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        } else {
            // create subdivision curve
            // error metric is adjustable, but can go down to a pixel
            const eps = Math.max(1, this.subdivisionThreshold);
            const pointsSub = subdivideBezierAdaptive(pointsScreen, eps);
            ctx.moveTo(pointsSub[0].x, pointsSub[0].y);
            for (let i = 1; i < pointsSub.length; i++) {
                const pi = pointsSub[i];
                ctx.lineTo(pi.x, pi.y);
            }
        }

        ctx.stroke();
        ctx.restore();
    }
    /**
     * Draws a Bezier spline
     * Style options and defaults can be found at styles.geo.line
     * @param {Array<{x:Number, y:Number}>} points Control point coordinates in local space
     * @param {Number} degree  The degree of the spline
     * @param {Object} style 
     */
    drawBezierSpline(points, degree, style = {}) {
        if (degree < 1) {
            throw new Error(`Drawing bezier curves only supported starting from degree 1, got ${degree}`);
        }

        // check for correct number of points
        if ((points.length - (degree + 1)) % degree !== 0) {
            throw new Error(`Wrong number of input points`);
        }

        style = createFromTemplate(styles.geo.line, style);

        let {
            strokeStyle = "rgb(0,0,0)",
            lineStyle,
        } = style;


        const ctx = this.context;

        const cMap = this.coordinateMapper;

        ctx.save();

        ctx.strokeStyle = strokeStyle;
        this.#applyLineStyle(lineStyle, styles.geo.line.lineStyle);

        const pointsScreen = points.map(v => cMap.convertLocalToSurface(v.x, v.y));

        ctx.beginPath();
        ctx.moveTo(pointsScreen[0].x, pointsScreen[0].y);

        for (let i = 1; i < pointsScreen.length; i += degree) {
            if (degree === 1) {
                // just a line
                const [p1] = [pointsScreen[i]];
                ctx.lineTo(p1.x, p1.y);
            }
            else if (degree === 2) {
                const [p1, p2] = [pointsScreen[i], pointsScreen[i + 1]];
                // quadratic curve
                ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);

            } else if (degree === 3) {
                const [p1, p2, p3] = [pointsScreen[i], pointsScreen[i + 1], pointsScreen[i + 2]];
                // cubic curve
                ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
            }
            else {
                const subPoints = [];
                for (let j = 0; j <= degree; j++) {
                    subPoints.push(pointsScreen[i - 1 + j]);
                }
                // create subdivision curve
                // error metric is adjustable, but can go down to a pixel
                const eps = Math.max(1, this.subdivisionThreshold);
                const pointsSub = subdivideBezierAdaptive(subPoints, eps);
                // move already done by previous segment/first point
                for (let i = 1; i < pointsSub.length; i++) {
                    const pi = pointsSub[i];
                    ctx.lineTo(pi.x, pi.y);
                }
            }
        }


        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draws a line strip
     * Style options and defaults can be found at styles.geo.line
     * @param {Array<{x:Number, y:Number}>} points Point coordinates in local space
     * @param {Object} style 
     */
    drawLineStrip(points, style = {}) {

        if (points.length < 2) {
            return;
        }
        style = createFromTemplate(styles.geo.line, style);

        let {
            strokeStyle = "rgb(0,0,0)",
            lineStyle,
        } = style;


        const ctx = this.context;

        const cMap = this.coordinateMapper;

        ctx.save();

        ctx.strokeStyle = strokeStyle;
        this.#applyLineStyle(lineStyle, styles.geo.line.lineStyle);



        ctx.beginPath();

        const p0 = cMap.convertLocalToSurface(points[0].x, points[0].y);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < points.length; i++) {
            let pi = points[i];
            pi = cMap.convertLocalToSurface(pi.x, pi.y);
            ctx.lineTo(pi.x, pi.y);
        }

        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draws a polygon
     * Style options and defaults can be found at styles.geo.polygon
     * @param {Array<{x:Number, y:Number}>} points Point coordinates in local space
     * @param {Object} style 
     */
    drawPolygon(points, style = {}) {

        if (points.length < 2) {
            return;
        }
        style = createFromTemplate(styles.geo.polygon, style);

        let {
            strokeStyle,
            fillStyle,
            lineStyle,
        } = style;


        const ctx = this.context;

        const cMap = this.coordinateMapper;

        ctx.save();

        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        this.#applyLineStyle(lineStyle, styles.geo.line.lineStyle);

        ctx.beginPath();

        const p0 = cMap.convertLocalToSurface(points[0].x, points[0].y);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < points.length; i++) {
            let pi = points[i];
            pi = cMap.convertLocalToSurface(pi.x, pi.y);
            ctx.lineTo(pi.x, pi.y);
        }

        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draws a vector from the first to the second point
     * Style options and defaults can be found at styles.geo.vector
     * @param {Number} x0 x coordinate in local space of the first point
     * @param {Number} y0 y coordinate in local space of the first point
     * @param {Number} x1 x coordinate in local space of the second point
     * @param {Number} y1 y coordinate in local space of the second point
     * @param {Object} style 
     */
    drawVector(x0, y0, x1, y1, style = {}) {
        style = createFromTemplate(styles.geo.vector, style);

        let {
            shaft,
            arrow,
        } = style;

        const ctx = this.context;

        const cMap = this.coordinateMapper;

        ({ x: x0, y: y0 } = cMap.convertLocalToSurface(x0, y0));
        ({ x: x1, y: y1 } = cMap.convertLocalToSurface(x1, y1));

        const dx = x1 - x0;
        const dy = y1 - y0;

        const d2 = dx * dx + dy * dy;
        if (d2 < 1) {
            // length less than a pixel
            return;
        }
        const d = Math.sqrt(d2);

        let nx;
        let ny;
        if (arrow.sizeRelative) {
            nx = -arrow.width * dy;
            ny = arrow.width * dx;
        } else {
            nx = -arrow.width * dy / d;
            ny = arrow.width * dx / d;
        }

        let lineEndX;
        let lineEndY;
        if (arrow.sizeRelative) {
            const ti = 1 - arrow.length;

            lineEndX = x0 + ti * dx;
            lineEndY = y0 + ti * dy;
        } else {
            lineEndX = x1 - arrow.length * dx / d;
            lineEndY = y1 - arrow.length * dy / d;
        }

        ctx.save();


        this.#applyLineStyle(shaft.lineStyle);
        ctx.strokeStyle = shaft.strokeStyle;
        //arrow shaft
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.stroke();

        this.#applyLineStyle(arrow.lineStyle);
        // arrow head
        ctx.strokeStyle = arrow.strokeStyle;
        ctx.fillStyle = arrow.fillStyle;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(lineEndX + nx, lineEndY + ny);
        ctx.lineTo(lineEndX - nx, lineEndY - ny);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}

/**
 * Class to simplify keeping a drawing updated, when changes in the scene occur.
 * Updates are queued for the next animation frame, so multiple updates after another don't trigger many draw updates
 */
class ScenePainter {

    #updates = [];
    #removals = [];
    #propUpdates = [];
    #requested;


    #updateId = -1;
    #removeId = -1;
    #propId = -1;

    #requestId = -1;

    /**
     * This callback is displayed as part of the Requester class.
     * @callback ScenePainter~drawCallback
     * @param {GeometryScene} scene The scene
     * @param {Number[]} updates Updated objects since the last call
     * @param {Number[]} removals Removed objects since the last call
     * @param {Number[]} propUpdates Objects that had properties updated since the last call
     */

    /**
     * 
     * @param {GeometryScene} scene The scene to draw
     * @param {ScenePainter~drawCallback}  drawFunc The function that draws the scene. 
     * Additional parameters give information about what happened since the last draw
     */
    constructor(scene, drawFunc = null) {
        this.drawFunc = drawFunc;
        this.scene = scene;
        this.#requested = false;
        this.stopped = false;

        this.#updates = [];
        this.#removals = [];
        this.#propUpdates = [];

        this.#updateId = this.scene.registerCallback(GeometryScene.EVENT_UPDATE, (e) => {
            this.#updates.push(e.index);
            this.requestDraw();
        });
        this.#removeId = this.scene.registerCallback(GeometryScene.EVENT_REMOVE, (e) => {
            this.#removals.push(e.index);
            this.requestDraw();
        });
        this.#propId = this.scene.registerCallback(GeometryScene.EVENT_PROPERTY, (e) => {
            this.#propUpdates.push(e.index);
            this.requestDraw();
        });

        this.requestDraw();
    }

    setDrawFunc(drawFunc) {
        this.drawFunc = drawFunc;
    }
    /**
     * Stops the drawing from updating
     */
    stop() {
        this.stopped = true;
    }
    /**
     * Starts the drawing update. Will enqueue a drawing operation
     */
    start() {
        this.start = true;
        this.requestDraw();
    }
    requestDraw() {
        if (this.stopped) {
            return;
        }
        if (!this.#requested) {
            this.#requested = true;
            this.#requestId = window.requestAnimationFrame(() => {
                if (this.drawFunc) {
                    this.drawFunc(this.scene, [...this.#updates], [...this.#removals], [...this.#propUpdates]);
                }
                this.#requestId = -1;
                this.#requested = false;
                this.#updates = [];
                this.#removals = [];
                this.#propUpdates = [];
            })
        }
    }

    draw() {
        if (this.drawFunc) {
            this.drawFunc(this.scene, [...this.#updates], [...this.#removals], [...this.#propUpdates]);
        }
        this.#requested = false;
        this.#updates = [];
        this.#removals = [];
        this.#propUpdates = [];
    }

    disconnect() {
        if (this.#requestId >= 0) {
            window.cancelAnimationFrame(this.#requestId);
            this.#requestId = -1;
        }
        this.scene.removeCallback(GeometryScene.EVENT_UPDATE, this.#updateId);
        this.scene.removeCallback(GeometryScene.EVENT_REMOVE, this.#removeId);
        this.scene.removeCallback(GeometryScene.EVENT_PROPERTY, this.#propId);

        this.#updateId = -1;
        this.#removeId = -1;
        this.#propId = -1;

    }
}

/**
 * This sorts the objects in the scene, according to their z-value, if present. Default z is 0.
 * Objects may be excluded from drawing by adding a "invisible" property and setting it to true
 * @param {GeometryScene} scene The scene
 * @returns {Array<{value: Object, z : Number, properties: Object}>} Sorted list of objects to be drawn
 */
function sortDrawables(scene) {
    const drawables = [];
    for (const obj of scene.view({ skipInvalidValues: true })) {
        const { value, properties = {} } = obj;
        if (properties["invisible"]) {
            continue;
        }
        const { z = 0 } = properties;

        drawables.push({
            value,
            z,
            properties
        });

    }

    drawables.sort((a, b) => {
        return b.z - a.z;
    });

    return drawables;
}

/**
 * Class to bundle a number of drawing functions for differently typed objects
 * A default drawing function can be provided to handle all-non provided typed objects
 * An drawing function for untyped objects allows to draw arbitrary objects
 */
class DrawFuncRegistry {
    /**
     * A drawing function has the same signature as DrawFuncRegistry.draw
     * All of the provided fields can be changed later as well
     * @param {Object} params
     * @param {Object} [params.typedDrawFuncs] A map of typename -> drawing function pairs
     * @param {Function} [params.defaultDrawFunc] The function called for non registered types
     * @param {Function} [params.untypedDrawFunc] The drawing function for general untyped objects
     */
    constructor({ typedDrawFuncs = {},
        defaultDrawFunc = () => { },
        untypedDrawFunc = () => { },
    } = {}) {
        this.typedDrawFuncs = typedDrawFuncs;
        this.defaultDrawFunc = defaultDrawFunc;
        this.untypedDrawFunc = untypedDrawFunc;
    }

    /**
     * Draw an object to an output
     * @param {Object} output The output object. Must be compatible with the registered functions
     * @param {Object} object The object to be drawn
     * @param {Object} properties Properties corresponding to the object
     */
    draw(output, object, properties) {
        const type = object.type;
        if (type !== undefined) {
            const f = this.typedDrawFuncs[type];
            if (f !== undefined) {
                f(output, object, properties);
            } else {
                this.defaultDrawFunc(output, object, properties);
            }
        } else {
            this.untypedDrawFunc(output, object, properties);
        }
    }
}

/**
 * Fills a DrawFuncRegistry with default functions for the predefined algeobra types
 * @returns {DrawFuncRegistry} Default diagram drawing functions for algeobra types
 */
function createDiagramCanvasDrawFuncRegistry() {
    const tf = {};

    tf[TYPE_POINT] = (diagram, obj, props) => diagram.drawPoint(obj.x, obj.y, props.style);
    tf[TYPE_LINE] = (diagram, obj, props) => {
        const { p0, p1, leftOpen, rightOpen } = obj;
        diagram.drawLine(p0.x, p0.y, p1.x, p1.y, leftOpen, rightOpen, props.style);
    };
    tf[TYPE_VECTOR] = (diagram, obj, props) => {
        const { ref, x, y } = obj;
        diagram.drawVector(ref.x, ref.y, ref.x + x, ref.y + y, props.style);
    };

    tf[TYPE_ARC] = (diagram, obj, props) => {
        const { center, r, startAngle, endAngle } = obj;
        diagram.drawArc(center.x, center.y, r, startAngle, endAngle, props.style);
    };

    tf[TYPE_ANGLE] = (diagram, obj, props) => {
        const { ref, value, start } = obj;
        diagram.drawAngle(ref.x, ref.y, value, start, props.style);
    };
    tf[TYPE_TEXT] = (diagram, obj, props) => {
        const { text, ref } = obj;
        diagram.drawText(ref.x, ref.y, text, props.style);
    };
    tf[TYPE_LINE_STRIP] = (diagram, obj, props) => {
        const { points } = obj;
        diagram.drawLineStrip(points, props.style);
    };
    tf[TYPE_POLYGON] = (diagram, obj, props) => {
        const { points } = obj;
        diagram.drawPolygon(points, props.style);
    };
    tf[TYPE_BEZIER] = (diagram, obj, props) => {
        const { points } = obj;
        diagram.drawBezier(points, props.style);
    };
    tf[TYPE_BEZIER_SPLINE] = (diagram, obj, props) => {
        const { points, degree } = obj;
        diagram.drawBezierSpline(points, degree, props.style);
    };
    tf[TYPE_ELLIPSE] = (diagram, obj, props) => {
        const { center,
            rx, ry,
            startAngle, endAngle,
            rotation, } = obj;
        diagram.drawEllipse(
            center.x, center.y,
            rx, ry,
            startAngle, endAngle,
            rotation, props.style);
    }

    const reg = new DrawFuncRegistry({ typedDrawFuncs: tf });

    return reg;
}

class DiagramPainter extends ScenePainter {

    #resizeObserver;
    #currentSize = [0, 0];
    #diagram = null;


    /**
     * 
     * @param {GeometryScene} scene 
     * @param {DiagramCanvas} diagram 
     * @param {Object} options 
     * @param {Object} options.bg The background configuration
     * @param {Object} options.autoResize
     * @param {Element | SVGElement} options.autoResize.target The target which the canvas size should be adjusted to 
     * @param {Number} [options.autoResize.minWidth = 1] The minimum width that will be preserved
     * @param {Number} [options.autoResize.widthFactor = 0.9] The percentage of the container that the canvas should occupy
     * @param {Boolean} [options.autoResize.keepAspect = false] If true, the autoresize will keep the previous aspect ratio, if false not
     */
    constructor(scene, diagram, {
        drawFuncRegistry = createDiagramCanvasDrawFuncRegistry(diagram),
        bg = NO_BACKGROUND_CONFIG,
        autoResize = null,
    } = {}) {
        super(scene);
        this.bg = bg;
        this.drawFuncRegistry = drawFuncRegistry;
        this.#diagram = diagram;

        this.#currentSize = [diagram.canvas.width, diagram.canvas.height];

        this.setDrawFunc((s) => {
            this.#diagram.clear();
            this.#diagram.drawBackground(this.bg);
            const drawables = sortDrawables(s);

            for (let i = 0; i < drawables.length; i++) {
                const { value, properties } = drawables[i];
                const draw = Array.isArray(value) ? value : [value];
                for (let j = 0; j < draw.length; j++) {
                    const obj = draw[j];
                    this.drawFuncRegistry.draw(this.#diagram, obj, properties);
                }
            }
        });

        if (autoResize) {
            const {
                minWidth = 1,
                keepAspect = false,
                widthFactor = 0.9,
                target
            } = autoResize;

            if (!target) {
                throw new Error("Container must be specified for auto resize");
            }

            this.#resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target === target) {
                        let maxSize = entry.contentBoxSize.reduce((p, c) => Math.max(p, c.inlineSize), 0);

                        const curAspect = this.#currentSize[0] / this.#currentSize[1];

                        let w = maxSize * widthFactor;

                        if (w < minWidth) {
                            return;
                        }
                        const canvas = this.#diagram.canvas;
                        canvas.width = w;
                        if (keepAspect) {
                            canvas.height = w / curAspect;
                        }
                        this.#currentSize = [canvas.width, canvas.height];
                        this.#diagram.notifyCanvasSizeChanged();
                        this.draw();
                    }
                }
            });

            this.#resizeObserver.observe(target);

        }
    }

    disconnect() {
        super.disconnect();

        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect();
        }
    }
}
export {
    CoordinateMapper,
    DiagramCanvas,
    PointManipulator,
    ScenePainter,
    DiagramPainter,
    DrawFuncRegistry,
    createDiagramCanvasDrawFuncRegistry,
    clientPositionToLocal,
    mouseEventToPosition,
    makeTicks,
    styles,
    NO_BACKGROUND_CONFIG,
    BASIC_BACKGROUND_CONFIG,
}