import { EMPTY_INFO, EMPTY, Vec2 } from "../../algeobra.js";
import * as alg from "../../algeobra.js";

import * as vis from "../../algeobraCanvas.js";

import {
    makeCanvas, makeCheckbox, makeContainer, makeTextField, makeSlider,
} from "../common.js";

// As Liascript removes elements on page turn, we will detach everything when it gets removed
function onRemoved(element, callback) {
    const config = { attributes: true, subtree: true, childList: true };
    const cb = (mutationsList, observer) => {
        for (const mut of mutationsList) {
            // check for changes to the child list
            if (mut.type === 'childList') {

                for (const rn of mut.removedNodes) {
                    if (rn === element) {
                        callback();
                        observer.disconnect();
                    }
                }
            }
        }
    };
    const observer = new MutationObserver(cb);

    observer.observe(document.body, config);
}

function makeSVGButton(scene, diagram, container, { bg = vis.NO_BACKGROUND_CONFIG } = {}) {


    const but = document.createElement("button");
    but.innerText = "Save to SVG";
    but.onclick = () => {
        const { x0, y0, x1, y1, flipY } = diagram.coordinateMapper;
        const output = new vis.SvgPathOutput(diagram.output.width, diagram.output.width / diagram.output.height);
        const diagSVG = new vis.DiagramCanvas({ x0, y0, x1, y1, flipY, canvas: output });

        vis.drawSceneToDiagram(scene, diagSVG, { bg });
        const d = output.document;

        const contentType = "image/svg+xml;charset=utf-8";
        const blob = new Blob([d], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "diagram.svg");
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    }

    container.appendChild(makeContainer(but));
    return but;

}

function demoAddition(container, canvas) {

    const scene = new alg.GeometryScene();
    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });
    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });


    const invisible = true;
    const pointZ = 0;
    const baseArrowZ = 2;
    const flippedArrowZ = 2;
    const fullArrowZ = 1;

    const pointStyle = { r: 8, fillStyle: "rgb(128,128,128)" };
    const arrowStart = scene.add(new alg.DefPoint(-2, -2), alg.EMPTY_INFO, { z: pointZ, style: pointStyle });
    const p1 = scene.add(new alg.DefPoint(1, 0), alg.EMPTY_INFO, { z: pointZ, style: pointStyle });
    const p2 = scene.add(new alg.DefPoint(2, 2), alg.EMPTY_INFO, { z: pointZ, style: pointStyle });

    const v0 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, p1), {
        z: baseArrowZ,
        style: {
            shaft: {
                strokeStyle: "rgb(255,0,0)",
                lineStyle: {
                    lineWidth: 2,
                },
            },
            arrow: {
                strokeStyle: "rgb(255,0,0)",
                fillStyle: "rgb(255,0,0)",
            },
        }
    });
    const v1 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(p1, p2), {
        z: baseArrowZ,
        style: {
            shaft: {
                strokeStyle: "rgb(0,0,255)",
                lineStyle: {
                    lineWidth: 2,
                },
            },
            arrow: {
                strokeStyle: "rgb(0,0,255)",
                fillStyle: "rgb(0,0,255)",
            },
        }
    });

    const vs1 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, p2), {
        z: fullArrowZ,
        style: {
            shaft: {

            },
            arrow: {
                width: 0.025,
            },
        }
    });

    // optional order switching
    const enableOrderSwitch = scene.add(new alg.DefBoolean(true));
    const arrowStartOrder = scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(arrowStart, enableOrderSwitch), {
        invisible
    });

    // vectors in different orders
    const u0 = scene.add(new alg.DefVector(), alg.DefVector.fromRefVector({ ref: arrowStartOrder, v: v1 }), {
        z: flippedArrowZ,
        style: {
            shaft: {
                strokeStyle: "rgba(0,0,255,0.5)",
                lineStyle: {
                    lineWidth: 2,
                },
            },
            arrow: {
                strokeStyle: "rgba(0,0,255,0.5)",
                fillStyle: "rgba(0,0,255,0.5)",
            },
        }
    });
    const u0p = scene.add(new alg.DefPoint(), alg.DefPoint.fromPointOrVector(u0), {
        z: pointZ,
        invisible,
    });
    const u1 = scene.add(new alg.DefVector(), alg.DefVector.fromRefVector({ ref: u0p, v: v0 }), {
        z: flippedArrowZ,
        style: {
            shaft: {
                strokeStyle: "rgba(255,0,0,0.5)",
                lineStyle: {
                    lineWidth: 2,
                },
            },
            arrow: {
                strokeStyle: "rgba(255,0,0,0.5)",
                fillStyle: "rgba(255,0,0,0.5)",
            },
        }
    });


    const manip = vis.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [arrowStart, p1, p2], 40);

    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });


    // Simple HTML interface
    const checkDisplayReverse = makeCheckbox(scene.get(enableOrderSwitch).value.value);
    checkDisplayReverse.onchange = e => {
        scene.update(enableOrderSwitch, new alg.DefBoolean(checkDisplayReverse.checked));
    };
    container.appendChild(makeContainer(makeTextField("Show reverse order:"), checkDisplayReverse));
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });
}

function demoScale(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    const invisible = true;
    const pointZ = 0;
    const baseArrowZ = 2;
    const scaledArrowZ = 1;
    const pointStyle = { r: 8, fillStyle: "rgb(128,128,128)" };
    const arrowStart = scene.add(new alg.DefPoint(0, 0), EMPTY_INFO, { z: pointZ, style: pointStyle, });


    const arrowEnd = scene.add(new alg.DefPoint(1, 1), EMPTY_INFO, { z: pointZ, style: pointStyle });
    const v0 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, arrowEnd), {
        z: baseArrowZ,
        style: {
            shaft: {
                lineStyle: {
                    lineWidth: 4,
                }
            },
        }
    });

    const scaleV0 = scene.add(new alg.DefNumber(1));

    const addScaledVector = dep => {
        const { v, ref, scale } = dep;
        const p = Vec2.add(ref, Vec2.scale(v, scale.value));
        return alg.makePoint(p);
    };
    const lineV0 = scene.add(new alg.DefFunc(addScaledVector), alg.DefFunc.from({ ref: arrowStart, v: v0, scale: scaleV0 }), {
        invisible
    });
    const posStyle = {
        shaft: {
            strokeStyle: "red",
            lineStyle: {
                lineWidth: 2,
            },
        },
        arrow: {
            strokeStyle: "red",
            fillStyle: "red",
        },
    };
    const negStyle = {
        shaft: {
            strokeStyle: "blue",
            lineStyle: {
                lineWidth: 2,
            },
        },
        arrow: {
            strokeStyle: "blue",
            fillStyle: "blue",
        },
    }
    const vecScaled = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, lineV0), {
        z: scaledArrowZ,
        style: alg.createFromTemplate(posStyle)
    });


    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (e.index === scaleV0) {
            const s = scene.get(e.index).value.value;
            if (s < 0) {
                scene.updateProperties(vecScaled, { style: negStyle });
            } else {
                scene.updateProperties(vecScaled, { style: posStyle });
            }
        }
    });

    const normv0 = scene.add(new alg.DefNormalVector({ normalize: true }), alg.DefNormalVector.fromVector({ v: v0, ref: arrowStart }), { invisible });
    const textOffset = scene.add(new alg.DefNumber(-0.5));
    const textOffsetPoint = scene.add(new alg.DefFunc(addScaledVector), alg.DefFunc.from({ ref: arrowStart, v: normv0, scale: textOffset }), { invisible });

    const format = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    });
    const scaleText = scene.add(new alg.DefText({
        text: s => {
            return `Scale: ${format.format(s.value)}`;
        }
    }), alg.DefText.fromObjectRef({ obj: scaleV0, ref: textOffsetPoint }),
        {
            style: {
                textStyle: {
                    font: "20px sans-serif",
                },
            }
        });

    let time = 0;
    let lastTime = new Date().getTime();
    const update = () => {
        let curTime = new Date().getTime();
        const delta = (curTime - lastTime) / 1000;
        lastTime = curTime;
        time += delta / 5;
        scene.update(scaleV0, new alg.DefNumber(2 * Math.cos(2.0 * Math.PI * time)));

        window.requestAnimationFrame(update);

    };

    update();
    const manip = vis.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [arrowStart, arrowEnd], 40);

    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });
}

function demoLength(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    const invisible = true;
    const pointZ = 0;
    const textZ = 0;
    const baseArrowZ = 2;
    const arrowZ = 1;
    const pointStyle = { r: 8, fillStyle: "rgb(128,128,128)" };
    const arrowStart = scene.add(new alg.DefPoint(-1, -1), EMPTY_INFO, { z: pointZ, style: pointStyle, });
    const arrowEnd = scene.add(new alg.DefPoint(1, 1), EMPTY_INFO, { z: pointZ, style: pointStyle });

    const v0 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, arrowEnd),
        {
            z: arrowZ,
            style: {
                shaft: {
                    lineStyle: {
                        lineWidth: 4,
                    }
                }
            }
        });

    const vX = scene.add(new alg.DefVector({ x: 1, y: 0 }), EMPTY_INFO, { invisible });

    const xAxis = scene.add(new alg.DefLine({ leftOpen: true, rightOpen: true }), alg.DefLine.fromPointVector(arrowStart, vX), { invisible });

    const endYAxis = scene.add(new alg.DefPerpendicularLine(), alg.DefPerpendicularLine.fromVectorsOrLine({ v: vX, ref: arrowEnd }), { invisible });
    const projX = scene.add(new alg.DefIntersection(), alg.DefIntersection.fromObjects(xAxis, endYAxis, { takeIndex: 0 }), { invisible });

    const xline = scene.add(new alg.DefLine(), alg.DefLine.fromPoints(arrowStart, projX), {
        z: baseArrowZ,
        style: {
            strokeStyle: "red",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });

    const yline = scene.add(new alg.DefLine(), alg.DefLine.fromPoints(projX, arrowEnd), {
        z: baseArrowZ,
        style: {
            strokeStyle: "blue",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });

    const midC = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromObject(v0), { invisible });
    const midA = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromObject(xline), { invisible });
    const midB = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromObject(yline), { invisible });

    const midTri = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromPoints(arrowStart, projX, arrowEnd), { invisible });

    const outwardsNormal = new alg.DefFunc(deps => {
        const { p0, p1, nref, ref } = deps;

        const v0 = Vec2.sub(p1, p0);
        let n0 = Vec2.normal2D(v0);

        const d = Vec2.sub(p0, nref);

        const dot = Vec2.dot(d, n0);
        if (dot < 0) {
            n0 = Vec2.scale(n0, -1);
        }
        n0 = Vec2.normalizeIfNotZero(n0);
        return alg.makeVector({ x: n0.x, y: n0.y, ref });
    });

    const nC = scene.add(outwardsNormal, alg.DefFunc.from({ p0: arrowStart, p1: arrowEnd, nref: midTri, ref: midC }), { invisible });
    const nA = scene.add(outwardsNormal, alg.DefFunc.from({ p0: arrowStart, p1: projX, nref: midTri, ref: midA }), { invisible });
    const nB = scene.add(outwardsNormal, alg.DefFunc.from({ p0: projX, p1: arrowEnd, nref: midTri, ref: midB }), { invisible });

    const scaledVector = new alg.DefFunc(deps => {
        const v = deps[0];
        return alg.makePoint(Vec2.add(v.ref, Vec2.scale(v, 0.4)));
    });

    const textOffC = scene.add(scaledVector, alg.DefFunc.from([nC]), { invisible });
    const textOffA = scene.add(scaledVector, alg.DefFunc.from([nA]), { invisible });
    const textOffB = scene.add(scaledVector, alg.DefFunc.from([nB]), { invisible });

    const angle = scene.add(new alg.DefAngle(), alg.DefAngle.fromPoints(arrowStart, projX, arrowEnd, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 30,
            arc: {
                showDirection: false,
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                }
            },
        }
    });

    const format = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    });

    const namedLength = (name) => {
        return s => `${name} ${format.format(s.value)}`;
    };

    const lenC = scene.add(new alg.DefLengthSquared(), alg.DefLengthSquared.fromPoints(arrowStart, arrowEnd));
    const lenA = scene.add(new alg.DefLengthSquared(), alg.DefLengthSquared.fromPoints(arrowStart, projX));
    const lenB = scene.add(new alg.DefLengthSquared(), alg.DefLengthSquared.fromPoints(projX, arrowEnd));

    const textC = scene.add(new alg.DefText({ text: namedLength("|c|\u00B2 = ") }), alg.DefText.fromObjectRef({ obj: lenC, ref: textOffC }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            textStyle: {
                font: "bold 15px sans-serif",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });


    const textA = scene.add(new alg.DefText({ text: namedLength("|a|\u00B2 = ") }), alg.DefText.fromObjectRef({ obj: lenA, ref: textOffA }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "red",
            textStyle: {
                font: "bold 15px sans-serif",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });


    const textB = scene.add(new alg.DefText({ text: namedLength("|b|\u00B2 = ") }), alg.DefText.fromObjectRef({ obj: lenB, ref: textOffB }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "blue",
            textStyle: {
                font: "bold 15px sans-serif",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });

    const a2b2 = scene.add(new alg.DefFunc(dep => alg.makeNumber(dep[0].value + dep[1].value)), alg.DefFunc.from([lenA, lenB]));
    const textA2B2 = scene.add(new alg.DefText({ text: namedLength("|a|\u00B2 + |b|\u00B2 = "), ref: { x: -0.5, y: 2.5 } }),
        alg.DefText.fromObjectRef({ obj: a2b2 }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "black",
            textStyle: {
                font: "bold 20px sans-serif",
                textAlign: "end",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });
    const textC2 = scene.add(new alg.DefText({ text: namedLength("|c|\u00B2 = "), ref: { x: -0.5, y: 2 } }),
        alg.DefText.fromObjectRef({ obj: lenC }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "black",
            textStyle: {
                font: "bold 20px sans-serif",
                textAlign: "end",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });

    const manip = vis.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [arrowStart, arrowEnd], 40);

    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}

function demoDot(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });
    const invisible = true;

    const pointStyle = { r: 8, fillStyle: "rgb(128,128,128)" };
    const manipZ = 0;
    const vecZ = 1;
    const lineZ = 2;
    const textZ = 0;

    const p0 = scene.add(new alg.DefPoint(0, 0), EMPTY_INFO, { z: manipZ, style: pointStyle });
    const p1 = scene.add(new alg.DefPoint(2.5, 0), EMPTY_INFO, { z: manipZ, style: pointStyle });
    const p2 = scene.add(new alg.DefPoint(1, 1), EMPTY_INFO, { z: manipZ, style: pointStyle });

    const points = [p0, p1, p2];

    const enableProjU = scene.add(new alg.DefBoolean(true));
    const enableProjV = scene.add(new alg.DefBoolean(true));

    const pointsEU = points.map(p => scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(p, enableProjU), { invisible }));
    const pointsEV = points.map(p => scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(p, enableProjV), { invisible }));

    const normalizeU = scene.add(new alg.DefBoolean(false));
    const normalizeV = scene.add(new alg.DefBoolean(false));
    const u = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(points[0], points[1], normalizeU), {
        z: vecZ,
        style: {
            shaft: {
                lineStyle: {
                    lineWidth: 4,
                }
            }
        },
    });
    const v = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(points[0], points[2], normalizeV), {
        z: vecZ,
        style: {
            shaft: {
                lineStyle: {
                    lineWidth: 4,
                }
            }
        },
    });

    const vs = [u, v];
    const vsEU = vs.map(a => scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(a, enableProjU), { invisible }))
    const vsEV = vs.map(a => scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(a, enableProjV), { invisible }))

    const vecLineStyle = {
        lineStyle: {
            lineWidth: 2,
            lineDash: [5],
        },
    };

    const angle = scene.add(new alg.DefAngle(), alg.DefAngle.fromPoints(points[1], points[0], points[2], alg.DefAngle.USE_SMALLER_ANGLE), {
        z: textZ,
        style: {
            r: 40,
            arc: {
                showDirection: false,
            },
            text: {
                radius: 0.75,
                // transform: () => "\u03b1",
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 15px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                },
            },
        }
    });

    const projectionFromOneOntoOther = (a, b, pointsA, pointsB, conditionalA, names) => {

        const aEnd = scene.add(new alg.DefPoint(), alg.DefPoint.fromPointOrVector(a), { invisible });
        const bEnd = scene.add(new alg.DefPoint(), alg.DefPoint.fromPointOrVector(b), { invisible });
        const la = scene.add(new alg.DefLine({ leftOpen: true, rightOpen: true }), alg.DefLine.fromVector(a), {
            z: lineZ,
            style: vecLineStyle
        });

        const lpa = scene.add(new alg.DefPerpendicularLine(), alg.DefPerpendicularLine.fromVectorsOrLine({ v: la, ref: bEnd }), {
            z: lineZ,
            invisible,
        });

        const inter = scene.add(new alg.DefIntersection(), alg.DefIntersection.fromObjects(la, lpa, { takeIndex: 0 }), { invisible });

        const rightAngle = scene.add(new alg.DefAngle(), alg.DefAngle.fromPoints(pointsA[0], inter, bEnd, alg.DefAngle.USE_SMALLER_ANGLE), {
            z: lineZ + 1,
            style: {
                arc: {
                    showDirection: false,
                    fillStyle: "rgba(128,128,128,0.1)",
                },
                text: {
                    radius: 0.5,
                    transform: () => ".",
                    textStyle: {
                        font: "15px bold sans-serif",
                    },
                    textAlign: "center",
                    textBaseline: "middle",
                }
            }
        });

        const fallDownLine = scene.add(new alg.DefLine(), alg.DefLine.fromPoints(inter, bEnd), {
            z: lineZ,
            style: {
                strokeStyle: "rgb(128,128,128)",
                lineStyle: {
                    lineWidth: 2,
                    lineDash: [5],
                }
            }
        });

        const dotNum = scene.add(new alg.DefFunc(deps => {
            const { a, b } = deps;
            const dot = Vec2.dot(a, b);
            return alg.makeNumber(dot);
        }), alg.DefFunc.from({ a, b }));
        // we add two segments to account for whether the product is positive or negative
        const isNegative = scene.add(new alg.DefBoolean(), alg.DefBoolean.fromPredicate((deps) => {
            return deps[0].value < 0.0;
        }, [dotNum]));

        const isNotNegative = scene.add(new alg.DefBoolean(), alg.DefBoolean.fromNot(isNegative));

        const posSegmentProps = {
            z: vecZ,
            style: {
                strokeStyle: "rgb(255,0,0)",
                lineStyle: {
                    lineWidth: 2,
                },
            }
        };
        const negSegmentProps = {
            z: vecZ,
            style: {
                strokeStyle: "rgb(0,0,255)",
                lineStyle: {
                    lineWidth: 2,
                },
            }
        };
        const segment = scene.add(new alg.DefLine(), alg.DefLine.fromPoints(pointsA[0], inter), posSegmentProps);




        const lenA = scene.add(new alg.DefLength(), alg.DefLength.fromVectorOrLine(a));
        const lenInter = scene.add(new alg.DefLength(), alg.DefLength.fromPoints(pointsA[0], inter));

        const multDot = scene.add(
            new alg.DefFunc(deps => alg.makeNumber(deps[0].value * deps[1].value * (deps[2].value ? 1 : -1))),
            alg.DefFunc.from([lenA, lenInter, isNotNegative]));

        const downV = scene.add(new alg.DefVector({ normalize: true }), alg.DefVector.fromPoints(bEnd, inter), { invisible });

        const scaledDownV = scene.add(new alg.DefFunc(dep => alg.makeVector(Vec2.scale(dep[0], dep[1].value))), alg.DefFunc.from([downV, lenA]), { invisible });

        const downPointChain = new alg.DefChainApply(
            new alg.DefVector(),
            v => {
                return alg.DefPoint.fromPointOrVector(v);
            },
            new alg.DefPoint()
        );
        const downPoint0 = scene.add(downPointChain, alg.DefVector.fromRefVector({ v: scaledDownV, ref: pointsA[0] }), { invisible });
        const downPoint1 = scene.add(downPointChain, alg.DefVector.fromRefVector({ v: scaledDownV, ref: inter }), { invisible });



        const posPolyProps = {
            z: lineZ + 1,
            style: {
                strokeStyle: "rgb(255,0,0)",
                fillStyle: "rgba(255,0,0,0.25)",
            }
        };
        const negPolyProps = {
            z: lineZ + 1,
            style: {
                strokeStyle: "rgb(0,0,255)",
                fillStyle: "rgb(0,0,255,0.25)",
            }
        };


        const dotPoly = scene.add(new alg.DefPolygon(), alg.DefPolygon.fromPoints([pointsA[0], downPoint0, downPoint1, inter]), posPolyProps);
        const dotMid = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromPoints(pointsA[0], downPoint0, downPoint1, inter), { invisible });

        scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
            if (e.index === isNegative) {
                const val = scene.get(e.index).value.value;

                if (val) {
                    scene.setProperties(segment, negSegmentProps);
                    scene.setProperties(dotPoly, negPolyProps);
                } else {
                    scene.setProperties(segment, posSegmentProps);
                    scene.setProperties(dotPoly, posPolyProps);

                }
            }
        });



        const segmentMid = scene.add(new alg.DefInterpolate(0.75), alg.DefInterpolate.fromObjects(pointsA[0], inter), { invisible });

        const textCosV = scene.add(new alg.DefText({ text: `|${names[1]}|cos \u03b1` }), alg.DefText.fromObjectRef({ ref: segmentMid }), {
            invisible: true,
            z: textZ,
            style:
            {
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 15px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                }
            },
        });

        const leftMid = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromPoints(pointsA[0], downPoint0), { invisible });
        const botMid = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromPoints(downPoint0, downPoint1), { invisible });

        const arc0 = scene.add(new alg.DefArc(), alg.DefArc.fromCenterAndPoints(pointsA[0], downPoint0, aEnd, alg.DefAngle.USE_SMALLER_ANGLE), {
            z: lineZ,
            style: {
                strokeStyle: "rgba(0,0,0,0.75)",
                outline: {
                    lineDash: [10],
                }
            }
        });


        const textDot = scene.add(new alg.DefText(), alg.DefText.fromObjectRef({ obj: multDot, ref: dotMid }), {
            z: textZ - 1,
            style:
            {
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 15px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                }
            },
        });


        const textLenA = scene.add(new alg.DefText(), alg.DefText.fromObjectRef({ obj: lenA, ref: leftMid }), {
            z: textZ,
            style:
            {
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 10px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                }
            },
        });

        const textLenProj = scene.add(new alg.DefText(), alg.DefText.fromObjectRef({ obj: lenInter, ref: botMid }), {
            z: textZ,

            style:
            {
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 10px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                }
            },
        });
    };

    projectionFromOneOntoOther(vsEU[0], vsEU[1], [pointsEU[0], pointsEU[1]], [pointsEU[0], pointsEU[2]], enableProjU, ["u", "v"]);
    projectionFromOneOntoOther(vsEV[1], vsEV[0], [pointsEV[0], pointsEV[2]], [pointsEV[0], pointsEV[1]], enableProjV, ["v", "u"]);



    const manip = vis.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [p0, p1, p2], 40);

    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });

    const checkDisplayU = makeCheckbox(scene.get(enableProjU).value.value);
    checkDisplayU.onchange = e => {
        scene.update(enableProjU, new alg.DefBoolean(checkDisplayU.checked));
    };
    container.appendChild(makeContainer(makeTextField("Display projection on u:"), checkDisplayU));

    const checkDisplayV = makeCheckbox(scene.get(enableProjV).value.value);
    checkDisplayV.onchange = e => {
        scene.update(enableProjV, new alg.DefBoolean(checkDisplayV.checked));
    };
    container.appendChild(makeContainer(makeTextField("Display projection on v:"), checkDisplayV));

    const checkNormalizeU = makeCheckbox(scene.get(normalizeU).value.value);
    checkNormalizeU.onchange = e => {
        scene.update(normalizeU, new alg.DefBoolean(checkNormalizeU.checked));
    };
    container.appendChild(makeContainer(makeTextField("Normalize u:"), checkNormalizeU));

    const checkNormalizeV = makeCheckbox(scene.get(normalizeV).value.value);
    checkNormalizeV.onchange = e => {
        scene.update(normalizeV, new alg.DefBoolean(checkNormalizeV.checked));
    };
    container.appendChild(makeContainer(makeTextField("Normalize v:"), checkNormalizeV));
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}


function demoTrig(container, canvas) {

    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -2, y0: -2, x1: 2, y1: 2, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    const invisible = true;

    const {
        DefPoint,
        DefVector,
        DefAngle,
        DefLine,
        DefArc,
        DefChainApply,
        DefIntersection,
        DefClosestPoint,
        DefParallelLine,
        DefMidPoint,
        DefText,
        DefFunc,
        makePoint,
    } = alg;


    const origin = scene.add(new DefPoint(0, 0), null, {});
    const xv = scene.add(new DefVector({ x: 1, y: 0 }), DefVector.fromRefVector({ ref: origin }),
        { invisible });

    const xp = scene.add(new DefPoint(), DefPoint.fromPointOrVector(xv), {
        invisible
    });
    const yv = scene.add(new DefVector({ x: 0, y: 1, ref: { x: 0, y: 1 } }),
        DefVector.fromRefVector({ ref: origin }),
        { invisible });
    const xAxis = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(xv));
    const yAxis = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(yv));

    const circle = scene.add(new DefArc({ r: 1 }), DefArc.fromValues({ center: origin }));


    const interCircleX = scene.add(
        new DefChainApply(new DefIntersection(), (v) => v[1]),
        DefIntersection.fromObjects(circle, xAxis),
        { invisible });
    const interCircleY = scene.add(
        new DefChainApply(new DefIntersection(), (v) => v[1]),
        DefIntersection.fromObjects(circle, yAxis),
        { invisible });

    const handlePoint = scene.add(new DefPoint(0, 0), EMPTY_INFO, {
        invisible
    });
    {
        const ov = scene.get(origin);
        scene.update(handlePoint, new DefPoint(ov.value.x + 1, ov.value.y));
    }
    const circlePoint = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(handlePoint, circle), {
        style: {
            r: 6,
        }
    });

    const circleVector = scene.add(new DefVector(), DefVector.fromPoints(origin, circlePoint));
    const circleLine = scene.add(new DefLine({ leftOpen: true, rightOpen: true }),
        DefLine.fromPoints(origin, circlePoint), {
        z: 2,
        style: {
            strokeStyle: "rgba(0,0,0,0.25)",
            lineStyle: {
                lineDash: [4],
            }
        }
    });

    const projX = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(circlePoint, xAxis),
        { invisible });
    const projY = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(circlePoint, yAxis),
        { invisible });

    const showProjX = scene.add(new DefLine(), DefLine.fromPoints(projX, circlePoint), {
        style: {
            lineStyle: {
                lineDash: [4]
            }
        }
    });
    const showProjY = scene.add(new DefLine(), DefLine.fromPoints(projY, circlePoint), {
        style: {
            lineStyle: {
                lineDash: [4]
            }
        }
    });


    const angle = scene.add(new DefAngle(), DefAngle.fromPoints(xp, origin, circlePoint),
        {
            style: {
                r: 40,
                text: {
                    radius: 0.35,
                    transform: (angle, isDeg) => {
                        return `\u{03B1}`;
                    },
                    textStyle: {
                        font: "20px bold sans-serif",
                    },
                }
            }
        });

    const cosSeg = scene.add(new DefLine(), DefLine.fromPoints(origin, projX), {
        style: {
            strokeStyle: "rgb(255,0,0)",
            lineStyle: {
                lineWidth: 2,
            }
        }
    });

    const sinSeg = scene.add(new DefLine(), DefLine.fromPoints(origin, projY), {
        style: {
            strokeStyle: "rgb(0,0,255)",
            lineStyle: {
                lineWidth: 2,
            }
        }
    });


    const yperp = scene.add(new DefParallelLine(), DefParallelLine.fromVectorsOrLineRef({ v: yAxis, ref: interCircleX }), {
        style: {
            strokeStyle: "rgba(0,0,0,0.1)",
        },
    });
    const xperp = scene.add(new DefParallelLine(), DefParallelLine.fromVectorsOrLineRef({ v: xAxis, ref: interCircleY }), {
        style: {
            strokeStyle: "rgba(0,0,0,0.1)",
        },
    });

    const intersectTan = scene.add(new DefIntersection(), DefIntersection.fromObjects(circleLine, yperp, { takeIndex: 0 }), {
        invisible
    });
    const intersectCot = scene.add(new DefIntersection(), DefIntersection.fromObjects(circleLine, xperp, { takeIndex: 0 }), {
        invisible
    });

    const tanProj = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(intersectTan, xAxis), { invisible });
    const cotProj = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(intersectCot, yAxis), { invisible });
    const tanLine = scene.add(new DefLine(), DefLine.fromPoints(tanProj, intersectTan),
        {
            style: {
                strokeStyle: "rgb(0,255,0)",
                lineStyle: {
                    lineWidth: 2,
                },
            }
        });
    const cotLine = scene.add(new DefLine(), DefLine.fromPoints(cotProj, intersectCot),
        {
            style: {
                strokeStyle: "rgb(0,255,255)",
                lineStyle: {
                    lineWidth: 2,
                },
            }
        });

    const cosMidPoint = scene.add(new DefMidPoint(), DefMidPoint.fromObject(cosSeg), {
        invisible
    });
    const sinMidPoint = scene.add(new DefMidPoint(), DefMidPoint.fromObject(sinSeg), {
        invisible
    });

    const textCos = scene.add(new DefText({ text: "cos" }),
        DefText.fromObjectRef({ ref: cosMidPoint }), {
        style: {
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgba(0,0,0,0)",
            offset: { x: -0.2, y: -0.2 },
            textStyle: {
                font: "20px bold sans-serif",
            },
        }
    });

    const textSin = scene.add(new DefText({ text: "sin" }),
        DefText.fromObjectRef({ ref: sinMidPoint }), {
        style: {
            fillStyle: "rgb(0,0,255)",
            strokeStyle: "rgba(0,0,0,0)",
            offset: { x: -0.4, y: 0 },
            textStyle: {
                font: "20px bold sans-serif",
            },
        }
    });


    const axisFlip = (p, ref, orig, axis) => {
        const pdy = p[axis] - orig[axis];
        const rdy = ref[axis] - orig[axis];
        const result = { x: p.x, y: p.y };
        if (Math.sign(pdy) * Math.sign(rdy) < 0) {
            // relative to origin
            // move to center
            result[axis] -= orig[axis];
            // flip
            result[axis] *= -1;
            // move back
            result[axis] += orig[axis];
        }
        return result;
    }

    const circPointOnTanLine = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(circlePoint, yperp),
        { invisible });

    // flip along x, if tan point is below
    const tanPointFlip = scene.add(
        new DefFunc(info => {
            const { p, ref, orig } = info;
            const result = axisFlip(p, ref, orig, "y");
            return makePoint({ x: result.x, y: result.y });
        }), DefFunc.from({ p: circPointOnTanLine, ref: intersectTan, orig: origin }),
        {
            invisible
        });

    const circPointOnCotLine = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(circlePoint, xperp),
        { invisible });
    // flip along x, if tan point is below
    const cotPointFlip = scene.add(
        new DefFunc(info => {
            const { p, ref, orig } = info;
            const result = axisFlip(p, ref, orig, "x");
            return makePoint({ x: result.x, y: result.y });
        }), DefFunc.from({ p: circPointOnCotLine, ref: intersectCot, orig: origin }),
        {
            invisible
        });

    const tanMidPoint = scene.add(new DefMidPoint(), DefMidPoint.fromPoints(tanProj, tanPointFlip), {
        invisible
    });
    const cotMidPoint = scene.add(new DefMidPoint(), DefMidPoint.fromPoints(cotProj, cotPointFlip), {
        invisible
    });

    const textTan = scene.add(new DefText({ text: "tan" }),
        DefText.fromObjectRef({ ref: tanMidPoint }),
        {
            style: {
                fillStyle: "rgb(0,255,0)",
                strokeStyle: "rgba(0,0,0,0)",
                offset: { x: 0.2, y: 0 },
                textStyle: {
                    font: "20px bold sans-serif",
                },
            }
        });

    const textCot = scene.add(new DefText({ text: "cot" }),
        DefText.fromObjectRef({ ref: cotMidPoint }),
        {
            style: {
                fillStyle: "rgb(0,255,255)",
                strokeStyle: "rgba(0,0,0,0)",
                offset: { x: 0, y: 0.2 },
                textStyle: {
                    font: "20px bold sans-serif",
                },
            }
        });




    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas, [[circlePoint, handlePoint]], 40);
    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });
}

function demoInscribedAngle(container, canvas) {


    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    const invisible = true;

    const {
        DefPoint,
        DefAngle,
        DefLine,
        DefArc,
        DefClosestPoint,
        DefText,
        createFromTemplate,
        rad2deg,
    } = alg;
    const origin = scene.add(new DefPoint(0, 0), EMPTY_INFO, {
        invisible
    });

    const circle = scene.add(new DefArc({ r: 2 }), DefArc.fromValues({ center: origin }));


    // // initial
    const handleA = scene.add(new DefPoint(0, 0), EMPTY_INFO, {
        invisible
    });
    const handleB = scene.add(new DefPoint(0, 0), EMPTY_INFO, {
        invisible
    });
    const handleP = scene.add(new DefPoint(0, 0), EMPTY_INFO, {
        invisible
    });

    const handlePoint = scene.add(new DefPoint(0, 0), EMPTY_INFO, {
        invisible
    });
    {
        const ov = scene.get(origin);
        scene.update(handleA, new DefPoint(ov.value.x - 1, ov.value.y));
        scene.update(handleB, new DefPoint(ov.value.x + 1, ov.value.y));
        scene.update(handleP, new DefPoint(ov.value.x, ov.value.y + 1));
    }


    const pA = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(handleA, circle), {
        z: -1,
        style: {
            r: 6,
        }
    });
    const pB = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(handleB, circle), {
        z: -1,
        style: {
            r: 6,
        }
    });
    const pP = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(handleP, circle), {
        z: -1,
        style: {
            r: 6,
        }
    });


    const points = [[pA, handleA], [pB, handleB], [pP, handleP]];


    const lineAB = scene.add(new DefLine(), DefLine.fromPoints(pA, pB));
    const lineBP = scene.add(new DefLine(), DefLine.fromPoints(pB, pP));
    const linePA = scene.add(new DefLine(), DefLine.fromPoints(pP, pA));

    const centerStyle = {
        lineStyle: {
            lineDash: [5],
        }
    };

    const lineCA = scene.add(new DefLine(), DefLine.fromPoints(origin, pA), {
        style: centerStyle
    });
    const lineCB = scene.add(new DefLine(), DefLine.fromPoints(origin, pB), {
        style: centerStyle
    });
    const lineCP = scene.add(new DefLine(), DefLine.fromPoints(origin, pP), {
        style: centerStyle
    });

    const angleStyles0 = {
        r: 40,
        arc: {
            showDirection: false,
            fillStyle: "rgba(0,0,200,0.35)",
            strokeStyle: "rgb(0,0,200)",
        }, text: {
            radius: 0.5,
            strokeStyle: "rgba(0,0,0,0)",
            fillStyle: "rgb(0,0,150)",
            textStyle: {
                font: "20px sans-serif",
            }
        }
    };
    const angleStyles1 = {
        r: 40,
        arc: {
            showDirection: false,
            fillStyle: "rgba(200,0,0,0.35)",
            strokeStyle: "rgb(200,0,0)",
        },
        text: {
            radius: 0.5,
            strokeStyle: "rgba(150,0,0,0)",
            fillStyle: "rgb(150,0,0)",
            textStyle: {
                textAlign: "right",
                font: "20px sans-serif",
            }
        }
    };

    const angleNameDisplay = (name) => {
        return (val, isDeg) => {
            return name;
        }
    };
    const anglePhi2 = scene.add(new DefAngle(), DefAngle.fromPoints(pB, pA, pP),
        {
            style: createFromTemplate(angleStyles0, {
                text: {
                    transform: angleNameDisplay("\u03C6\u2082"),
                },
            }),
        });
    const anglePhi1 = scene.add(new DefAngle(), DefAngle.fromPoints(pP, pB, pA),
        {
            style: createFromTemplate(angleStyles1, {
                text: {
                    transform: angleNameDisplay("\u03C6\u2081"),
                },
            }),
        });

    const angleMu1 = scene.add(new DefAngle(), DefAngle.fromPoints(pP, origin, pA),
        {
            style: createFromTemplate(angleStyles1, {
                text: {
                    transform: angleNameDisplay("\u03BC\u2081"),
                },
            }),
        });
    const angleMu2 = scene.add(new DefAngle(), DefAngle.fromPoints(pB, origin, pP),
        {
            style: createFromTemplate(angleStyles0, {
                text: {
                    transform: angleNameDisplay("\u03BC\u2082"),
                },
            }),
        });


    const textA = scene.add(new DefText({ text: "A" }),
        DefText.fromObjectRef({ ref: pA }),
        {
            style: {
                offset: { x: -0.25, y: 0 },
                strokeStyle: "rgba(0,0,0,0)",
                fillStyle: "rgb(0,0,0)",
                textStyle: {
                    font: "20px bold sans-serif"
                }
            }
        }
    );

    const textB = scene.add(new DefText({ text: "B" }),
        DefText.fromObjectRef({ ref: pB }),
        {
            style: {
                offset: { x: 0.25, y: 0 },
                strokeStyle: "rgba(0,0,0,0)",
                fillStyle: "rgb(0,0,0)",
                textStyle: {
                    font: "20px bold sans-serif"
                }
            }
        }
    );

    const textC = scene.add(new DefText({ text: "P" }),
        DefText.fromObjectRef({ ref: pP }),
        {
            style: {
                offset: { x: 0, y: 0.25 },
                strokeStyle: "rgba(0,0,0,0)",
                fillStyle: "rgb(0,0,0)",
                textStyle: {
                    font: "20px bold sans-serif"
                }
            }
        }
    );

    const textM = scene.add(new DefText({ text: "M" }),
        DefText.fromObjectRef({ ref: origin }),
        {
            style: {
                offset: { x: 0, y: -0.25 },
                strokeStyle: "rgba(0,0,0,0)",
                fillStyle: "rgb(0,0,0)",
                textStyle: {
                    font: "20px bold sans-serif"
                }
            }
        }
    );

    const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    });
    const angleNameValue = (name) => {
        return (obj) => {
            const val = rad2deg(obj.value);
            return `${name} = ${formatter.format(val)}°`;
        }
    }
    const angleTextStyle = {
        textStyle: {
            font: "20px sans-serif",
        }
    };

    const angleTextStyle0 = createFromTemplate(angleTextStyle, {
        strokeStyle: "rgba(0,0,0,0)",
        fillStyle: "rgb(150,0,0)",
        textStyle: {
            textAlign: "center",
        }
    });
    const angleTextStyle1 = createFromTemplate(angleTextStyle, {
        strokeStyle: "rgba(0,0,0,0)",
        fillStyle: "rgb(0,0,150)",
        textStyle: {
            textAlign: "center",
        }
    });
    const showAnglePhi1 = scene.add(new DefText(
        {
            text: angleNameValue("\u03C6\u2081"),
            ref: { x: -2, y: 2 }
        }),
        DefText.fromObjectRef({ obj: anglePhi1 }),
        {
            style: angleTextStyle0
        });

    const showAngleMu1 = scene.add(new DefText(
        {
            text: angleNameValue("\u03BC\u2081"),
            ref: { x: -2, y: 1.75 }
        }),
        DefText.fromObjectRef({ obj: angleMu1 }),
        {
            style: angleTextStyle0
        });

    const showAnglePhi2 = scene.add(new DefText(
        {
            text: angleNameValue("\u03C6\u2082"),
            ref: { x: 2, y: 2 }
        }),
        DefText.fromObjectRef({ obj: anglePhi2 }),
        {
            style: angleTextStyle1
        });
    const showAngleMu2 = scene.add(new DefText(
        {
            text: angleNameValue("\u03BC\u2082"),
            ref: { x: 2, y: 1.75 }
        }),
        DefText.fromObjectRef({ obj: angleMu2 }),
        {
            style: angleTextStyle1
        });

    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas,
        points, 40);
    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });

    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}

function demoTriangleCircles(container, canvas) {

    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    const {
        DefPoint,
        DefAngle,
        DefLine,
        DefArc,
        DefChainApply,
        DefIntersection,
        DefPerpendicularLine,
        DefLength,
        DefInterpolate,
        DefPolarVector,
        DefMidPoint,
        DefPolygon,
        DefBoolean,
        DefConditional,
    } = alg;
    const pointZ = -3;
    const lineZ = -2;
    const polyZ = -1;

    const invisible = true;

    const point0 = scene.add(new DefPoint(-2, 0), EMPTY_INFO, {
        z: pointZ,
        style: {
            r: 6,
            fillStyle: "black",
        }
    });
    const point1 = scene.add(new DefPoint(2, 0), EMPTY_INFO, {
        z: pointZ,
        style: {
            r: 6,
            fillStyle: "black",
        }

    });
    const point2 = scene.add(new DefPoint(0, 2), EMPTY_INFO, {
        z: pointZ,
        style: {
            r: 6,
            fillStyle: "black",
        }

    });

    const triPoints = [point0, point1, point2];

    const triangle = scene.add(new DefPolygon(), DefPolygon.fromPoints(triPoints), { z: polyZ });

    const enableMid = scene.add(new DefBoolean(true));

    const midPoints = triPoints.map(p => scene.add(new DefConditional(), DefConditional.fromCondition(p, enableMid), {
        invisible,
        z: pointZ,
    }));

    const midLines = midPoints.map((v, i) => {
        return scene.add(new DefLine(), DefLine.fromPoints(v, midPoints[(i + 1) % midPoints.length]), { z: lineZ })
    });

    const centerPoints = midLines.map(l => scene.add(new DefMidPoint(), DefMidPoint.fromObject(l), {
        z: pointZ,
        style: {
            fillStyle: "rgb(255,0,0)",
            r: 3,
        }
    }));

    const perpLines = centerPoints.map((p, i) => scene.add(new DefPerpendicularLine(), DefPerpendicularLine.fromVectorsOrLine({ ref: p, v: midLines[i] }), {
        z: lineZ,
        style: {
            strokeStyle: "rgba(128,0,0,0.5)",
            lineStyle: {
                lineWidth: 2
            }
        }
    }));

    // intersection of perplines
    // they will intersect in one point so we only add one
    const circumscribedInter = scene.add(new DefIntersection(), DefIntersection.fromObjects(perpLines[0], perpLines[1], { takeIndex: 0 }), {
        z: pointZ,
        style: {
            fillStyle: "rgb(255,0,0)",
            r: 6,
        }
    });
    const distp0Inter = scene.add(new DefLength(), DefLength.fromPoints(midPoints[0], circumscribedInter));
    const circumscribed = scene.add(new DefArc(), DefArc.fromValues({ r: distp0Inter, center: circumscribedInter }), {
        style: {
            strokeStyle: "rgba(255,0,0,0.5)",
            outline: {
                lineWidth: 4,
            },
        }
    });
    // create midpoint lines

    const enableIn = scene.add(new DefBoolean(true));

    const inPoints = triPoints.map(p => scene.add(new DefConditional(), DefConditional.fromCondition(p, enableIn), {
        invisible
    }));

    const inLines = inPoints.map((v, i) => {
        return scene.add(new DefLine(), DefLine.fromPoints(v, inPoints[(i + 1) % inPoints.length]), { invisible, z: lineZ })
    });

    const inAngles = inPoints.map((p, i) => {
        const n = inPoints.length;
        const il = (i + n - 1) % n;
        const ir = (i + 1) % n;

        return scene.add(new DefAngle(), DefAngle.fromPoints(inPoints[ir], p, inPoints[il], DefAngle.USE_SMALLER_ANGLE), {
            style: {
                arc: {
                    showDirection: false,
                },
                text: {
                    show: false,
                }
            }
        });
    });

    const inMidAngles = inAngles.map((a, i) => scene.add(new DefInterpolate(0.5), DefInterpolate.fromAngle(a), { invisible }));

    const inMidLines = inMidAngles.map(a => {
        return scene.add(new DefChainApply(
            new DefPolarVector(),
            d => {
                return DefLine.fromVector(d);
            },
            new DefLine({ leftOpen: true, rightOpen: true })
        ), DefPolarVector.fromAngle({ angle: a }), {
            style: {
                strokeStyle: "rgba(0,0,128,0.5)",
                lineStyle: {
                    lineWidth: 1,
                },
            }
        });
    });

    const inInter = scene.add(new DefIntersection(), DefIntersection.fromObjects(inMidLines[0], inMidLines[1], { takeIndex: 0 }), {
        z: pointZ,
        style: {
            fillStyle: "rgb(0,0,255)",
            r: 6,
        }
    });

    // perp line through inInter
    const inPerp = scene.add(new DefPerpendicularLine(), DefPerpendicularLine.fromVectorsOrLine({ v: inLines[0], ref: inInter }), {
        z: lineZ,
        style: {
            strokeStyle: "rgba(128,128,128,0.5)",
            lineStyle: {
                lineWidth: 2,
                lineDash: [4],
            },
        }
    });

    const inSideInter = scene.add(new DefIntersection(), DefIntersection.fromObjects(inPerp, inLines[0], { takeIndex: 0 }), {
        z: pointZ,
        style: {
            fillStyle: "rgb(0,0,255)",
            r: 3,
        }
    });
    const inLen = scene.add(new DefLength(), DefLength.fromPoints(inInter, inSideInter));

    const incircle = scene.add(new DefArc(), DefArc.fromValues({
        r: inLen, center: inInter
    }), {
        style: {
            strokeStyle: "rgba(0,0,255,0.5)",
            outline: {
                lineWidth: 4,
            },
        }
    });

    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas,
        triPoints, 40);

    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });

    const checkOut = makeCheckbox(scene.get(enableMid).value.value);
    checkOut.onchange = e => {
        scene.update(enableMid, new DefBoolean(checkOut.checked));
    };

    container.appendChild(makeContainer(makeTextField("Show outcircle: "), checkOut));

    const checkIn = makeCheckbox(scene.get(enableIn).value.value);
    checkIn.onchange = e => {
        scene.update(enableIn, new DefBoolean(checkIn.checked));
    };

    container.appendChild(makeContainer(makeTextField("Show incircle: "), checkIn));
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}

function demoDeCasteljau(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    const {
        DefPoint,
        DefLine,
        DefInterpolate,
        DefBezier,
        DefNumber,
    } = alg;

    const v2 = Vec2.vec2;
    const controlPointsIn = [
        v2(-2, -2),
        v2(-2, 2),
        v2(2, 2),
        v2(2, -2),
    ];

    const manipZ = 0;
    const pointZ = 1;
    const lineZ = 2;
    const manipStyle = { r: 8, fillStyle: "rgb(128,128,128)" };

    const cpoints = controlPointsIn.map(p => scene.add(new DefPoint(p.x, p.y), EMPTY_INFO, {
        z: manipZ,
        style: manipStyle,
    }));

    const bez = scene.add(new DefBezier(), DefBezier.fromPoints(cpoints), { z: manipZ + 1 });

    const t = scene.add(new DefNumber(0.5));

    const colors = [
        "blue",
        "red",
        "cyan",
    ];

    const lineWidths = [
        4, 3, 2, 1
    ];

    const radii = [
        3, 3, 3, 3
    ];

    const makeStep = (points, t, color, lw, r) => {
        const segments = [];
        for (let i = 0; i < points.length - 1; i++) {
            segments.push(scene.add(new DefLine(), DefLine.fromPoints(points[i], points[i + 1]), {
                z: lineZ,
                style: {
                    strokeStyle: color,
                    lineStyle: {
                        lineWidth: lw,
                    },
                }
            }));
        }
        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            newPoints.push(scene.add(new DefInterpolate(), DefInterpolate.fromObjects(points[i], points[i + 1], t), {
                z: pointZ,
                style: {
                    fillStyle: color,
                    r,
                    outline: {
                        lineWidth: 2,
                    },
                }
            }));
        }

        return [segments, newPoints];
    };

    let curPoints = cpoints;

    let idx = 0;
    while (curPoints.length > 1) {
        let col = colors[idx];
        let r = radii[idx];
        let lw = lineWidths[idx];
        idx = (idx + 1) % colors.length;
        let [s, p] = makeStep(curPoints, t, col, lw, r);
        curPoints = p;
    }

    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas,
        cpoints, 40);

    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });

    const slider = makeSlider(0, 100, 50);
    const textField = makeTextField("");
    const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    slider.oninput = () => {

        const tv = (Number.parseInt(slider.value) - Number.parseInt(slider.min)) / (Number.parseInt(slider.max) - Number.parseInt(slider.min));
        scene.update(t, new DefNumber(tv));
        textField.textContent = `t = ${formatter.format(tv)}`;
    };
    slider.oninput();
    container.appendChild(makeContainer(slider, textField));
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}

function demoLens(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -1, y0: -3, x1: 6, y1: 3, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });
    const {
        DefPoint,
        DefVector,
        DefLine,
        DefArc,
        DefChainApply,
        DefIntersection,
        DefPolarVector,
        DefNumber,
        DefSelect,
        DefPolarCoord,
        DefNormalVector,
        DefRefraction,
        INVALID,
        deg2rad,
    } = alg;

    const v2 = Vec2.vec2;



    const invisible = true;

    const rmin = 0.5;
    const rmax = 3.5;
    const rdelta = rmax - rmin;

    const origin = scene.add(new DefPoint(2 - 0.5 * rdelta, 0), EMPTY_INFO, {
        invisible
    });
    const origin2 = scene.add(new DefPoint(2 + 0.5 * rdelta, 0), EMPTY_INFO, {
        invisible
    });
    const rad0 = scene.add(new DefNumber(0.75 * rdelta));
    const rad1 = scene.add(new DefNumber(0.75 * rdelta));
    const circle = scene.add(new DefArc({ r: 1.5 }),
        DefArc.fromValues({ center: origin, r: rad0 }), {
        invisible
    });
    const circle2 = scene.add(new DefArc({ r: 1.75 }),
        DefArc.fromValues({ center: origin2, r: rad1 }), {
        invisible
    });

    const intersectCircles = scene.add(new DefIntersection(),
        DefIntersection.fromObjects(circle, circle2),
        { invisible });


    const circleInter0 = scene.add(
        new DefSelect(0),
        DefSelect.fromObject(intersectCircles),
        {
            invisible
        });
    const circleInter1 = scene.add(
        new DefSelect(1),
        DefSelect.fromObject(intersectCircles),
        {
            invisible
        });

    const arc0 = scene.add(new DefArc(),
        DefArc.fromCenterAndPoints(origin, circleInter0, circleInter1),
        {
            style: {
                strokeStyle: "red",
            }
        }
    );
    const arc1 = scene.add(new DefArc(),
        DefArc.fromCenterAndPoints(origin2, circleInter1, circleInter0),
        {
            style: {
                strokeStyle: "blue",
            }
        }
    );

    const makePath = (origin, dir, circleA, circleB, eta) => {
        const ray = scene.add(new DefLine({ rightOpen: true }),
            DefLine.fromPointVector(origin, dir),
            {
                invisible
            });
        const inter0 = scene.add(
            new DefChainApply(new DefIntersection(), v => v[0] ? v[0] : INVALID),
            DefIntersection.fromObjects(ray, circleB)
        );
        const norm0 = scene.add(new DefNormalVector({ normalize: true }),
            DefNormalVector.fromArc(inter0, circleB),
            {
                invisible,
                style: {
                    shaft: {
                        strokeStyle: "red"
                    }
                }
            });


        const refr0 = scene.add(new DefRefraction({ normalize: true }), DefRefraction.fromVectorNormal({
            v: dir, n: norm0, ref: inter0, eta
        }), {
            invisible,
            style: {
                shaft: {
                    strokeStyle: "blue",
                    lineStyle: {
                        lineWidth: 4
                    }
                }
            }
        });

        const ray1 = scene.add(new DefLine({ rightOpen: true }),
            DefLine.fromPointVector(inter0, refr0),
            {
                invisible
            });
        const inter1 = scene.add(
            new DefChainApply(new DefIntersection(),
                v => v.length === 2 ?
                    (v[1] ? v[1] : INVALID) : (v[0] ? v[0] : INVALID)),
            DefIntersection.fromObjects(ray1, circleA)
        );
        const norm1 = scene.add(new DefNormalVector({ normalize: true, }),
            DefNormalVector.fromArc(inter1, circleA),
            {
                invisible,
                style: {
                    shaft: {
                        strokeStyle: "red"
                    }
                }
            });

        const refr1 = scene.add(new DefRefraction({ normalize: true }), DefRefraction.fromVectorNormal({
            v: refr0, n: norm1, ref: inter1, eta,
        }), {
            invisible,
            style: {
                shaft: {
                    strokeStyle: "blue",
                    lineStyle: {
                        lineWidth: 4
                    }
                }
            }
        });

        const segmentStyle = {
            strokeStyle: "rgb(127,127,127)",
            lineStyle: {
                lineWidth: 4
            },
        };
        const segment0 = scene.add(new DefLine(),
            DefLine.fromPoints(projOrigin, inter0),
            {
                z: 2,
                style: segmentStyle,
            });
        const segment1 = scene.add(new DefLine(),
            DefLine.fromPoints(inter0, inter1),
            {
                z: 2,
                style: segmentStyle,
            });
        const segment2 = scene.add(new DefLine({ rightOpen: true }),
            DefLine.fromPointVector(inter1, refr1),
            {
                z: 2,
                style: segmentStyle,
            });

    };


    const projOrigin = scene.add(new DefPoint(-0.25, 0));
    const pointDir = scene.add(new DefPoint(0.75, 0), EMPTY_INFO, {
        z: 0,
        style: {
            r: 8,
            fillStyle: "rgba(0,128,128,0.5)",
            outline: {
                strokeStyle: "rgba(0,32,32,0.5",
            },
        }
    });

    const ray = scene.add(new DefLine({ rightOpen: true }),
        DefLine.fromPoints(projOrigin, pointDir),
        {
            invisible
        });
    const rayDir = scene.add(new DefVector({ normalized: true }),
        DefVector.fromLineSegment(ray),
        {
            invisible
        });

    const rayPolar = scene.add(new DefPolarCoord(),
        DefPolarCoord.fromPointOrVector(rayDir));
    const rayAngle = scene.add(new DefNumber(),
        DefNumber.fromField(rayPolar, "alpha"));

    const addOffset = off => (v => v + off);

    let offsets = [];

    const numOffsets = 4;
    const maxOffset = deg2rad(25);
    for (let i = 0; i < numOffsets; i++) {
        const t = (i + 1) / numOffsets;
        const a = t * maxOffset;
        offsets.push(a);
        offsets.push(-a);
    }

    const rayAngles = [];
    const rayDirs = [];
    for (const o of offsets) {
        const rayAngleO0 = scene.add(new DefNumber(),
            DefNumber.fromField(rayPolar, "alpha", addOffset(o)));
        const rayDir1 = scene.add(new DefPolarVector({ r: 1 }),
            DefPolarVector.fromRadiusAngle({
                ref: projOrigin,
                alpha: rayAngleO0,
            }),
            {
                invisible
            });
        rayAngles.push(rayAngleO0);
        rayDirs.push(rayDir1);
    }

    //air
    const eta1 = 1.0;
    // other material
    const eta2 = 1.3;

    const eta = eta1 / eta2;

    const neta = scene.add(new DefNumber(eta));

    makePath(projOrigin, rayDir, arc0, arc1, neta);
    for (let r of rayDirs) {
        makePath(projOrigin, r, arc0, arc1, neta);

    }

    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas,
        [pointDir], Infinity);

    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });
    const slider1 = makeSlider(0, 100, 50);

    slider1.oninput = e => {
        const smax = Number.parseInt(slider1.max);
        const smin = Number.parseInt(slider1.min);
        const sdelta = smax - smin;
        let t = (Number.parseInt(slider1.value) - smin) / sdelta;

        // invert t, to make it look more like the display
        t = 1 - t;
        const r = rmin + t * rdelta;

        scene.update(rad1, new DefNumber(r));
    };

    const slider2 = makeSlider(0, 100, 50);

    slider2.oninput = e => {
        const smax = Number.parseInt(slider2.max);
        const smin = Number.parseInt(slider2.min);
        const sdelta = smax - smin;
        let t = (Number.parseInt(slider2.value) - smin) / sdelta;
        const r = rmin + t * rdelta;
        scene.update(rad0, new DefNumber(r));
    };

    container.appendChild(makeContainer(makeTextField("Left:"), slider1));
    container.appendChild(makeContainer(makeTextField("Right:"), slider2));

    const etaSlider = makeSlider(0, 100, 50);
    const etaText = makeTextField("");

    const etaMin = 1;
    const etaMax = 2;
    const etaDelta = etaMax - etaMin;
    const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    etaSlider.oninput = () => {
        const t = (Number.parseInt(etaSlider.value) - Number.parseInt(etaSlider.min)) / (Number.parseInt(etaSlider.max) - Number.parseInt(etaSlider.min));


        const eta1 = etaMin + t * etaDelta;
        const etaN = 1.0 / (eta1);
        scene.update(neta, new DefNumber(etaN));
        etaText.textContent = `Eta material: ${formatter.format(eta1)}`;
    };

    etaSlider.oninput();

    container.appendChild(makeContainer(etaSlider, etaText));

    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}


function demoArcTangents(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -4, y0: -4, x1: 4, y1: 4, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    const {
        DefPoint,
        DefArc,
        DefEllipse,
        DefTangentLines,
        DefTangentPoints,
        deg2rad,
    } = alg;

    const v2 = Vec2.vec2;

    const invisible = true;


    const point0 = scene.add(new DefPoint(2, 0), EMPTY_INFO, {
        z: -1,
        style: {
            r: 6,
            fillStyle: "rgb(32,32,32)",
        }
    });

    const arc0 = scene.add(new DefArc({
        center: { x: 0, y: 0 },
        r: 1,
        startAngle: deg2rad(0),
        endAngle: deg2rad(360)
    }), DefArc.fromValues({ center: point0 }));


    const arc1 = scene.add(new DefArc({
        center: { x: 3, y: -2 },
        r: 0.25,
        startAngle: deg2rad(0),
        endAngle: deg2rad(240)
    }), DefArc.fromValues({}));

    const arc2 = scene.add(new DefArc({
        center: { x: -2, y: 2 },
        r: 1.5,
        startAngle: deg2rad(0),
        endAngle: deg2rad(270)
    }), DefArc.fromValues({}));

    const ell0 = scene.add(new DefEllipse({
        center: { x: 3, y: 2 },
        rx: 0.5,
        ry: 1,
        startAngle: deg2rad(0),
        endAngle: deg2rad(360)
    }), DefEllipse.fromValues({}));

    const to01 = scene.add(new DefTangentLines(), DefTangentLines.fromOuterTangents(arc0, arc1), {
        style: {
            strokeStyle: "red",
        }
    });
    const tpo01 = scene.add(new DefTangentPoints(), DefTangentPoints.fromOuterTangents(arc0, arc1), {
        style: {
            fillStyle: "red",
        }
    });

    const ti01 = scene.add(new DefTangentLines(), DefTangentLines.fromInnerTangents(arc0, arc1), {
        style: {
            strokeStyle: "blue",
        }
    });
    const tpi01 = scene.add(new DefTangentPoints(), DefTangentPoints.fromInnerTangents(arc0, arc1), {
        style: {
            fillStyle: "blue",
        }
    });

    const tan01 = scene.add(new DefTangentLines(), DefTangentLines.fromPointArc(point0, arc1), {
        style: {
            strokeStyle: "green",
        }
    });
    const tanp01 = scene.add(new DefTangentPoints(), DefTangentPoints.fromPointArc(point0, arc1), {
        style: {
            fillStyle: "green",
        }
    });

    const to02 = scene.add(new DefTangentLines(), DefTangentLines.fromOuterTangents(arc0, arc2), {
        style: {
            strokeStyle: "red",
        }
    });
    const tpo02 = scene.add(new DefTangentPoints(), DefTangentPoints.fromOuterTangents(arc0, arc2), {
        style: {
            fillStyle: "red",
        }
    });

    const ti02 = scene.add(new DefTangentLines(), DefTangentLines.fromInnerTangents(arc0, arc2), {
        style: {
            strokeStyle: "blue",
        }
    });
    const tpi02 = scene.add(new DefTangentPoints(), DefTangentPoints.fromInnerTangents(arc0, arc2), {
        style: {
            fillStyle: "blue",
        }
    });


    const tan02 = scene.add(new DefTangentLines(), DefTangentLines.fromPointArc(point0, arc2), {
        style: {
            strokeStyle: "green",
        }
    });
    const tanp02 = scene.add(new DefTangentPoints(), DefTangentPoints.fromPointArc(point0, arc2), {
        style: {
            fillStyle: "green",
        }
    });

    const tan0e0 = scene.add(new DefTangentLines(), DefTangentLines.fromPointEllipse(point0, ell0, { leftOpen: true, rightOpen: true }), {
        style: {
            strokeStyle: "orange",
        }
    });
    const tanp0e0 = scene.add(new DefTangentPoints(), DefTangentPoints.fromPointEllipse(point0, ell0), {
        style: {
            fillStyle: "orange",
        }
    });
    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas,
        [point0], Infinity);
    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}

function demoCurveTangentNormals(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -5, y0: -5, x1: 5, y1: 5, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });
    const {
        DefVector,
        DefLine,
        DefArc,
        DefPolygon,
        DefBoolean,
        DefBezier,
        DefNumber,
        DefEllipse,
        DefLineStrip,
        DefBezierSpline,
        DefCurveNormal,
        DefCurvePoint,
        DefCurveTangent,
        INVALID,
        deg2rad,
    } = alg;

    const v2 = Vec2.vec2;

    const invisible = true;


    const normalizeNormals = scene.add(new DefBoolean(true));
    const normalizeTangents = scene.add(new DefBoolean(true));

    const t = scene.add(new DefNumber(0));
    const normScale = scene.add(new DefNumber(1));
    const tanScale = scene.add(new DefNumber(1));
    const vec0 = scene.add(new DefVector({
        x: 0.5, y: -1, ref: {
            x: -3, y: -2
        }
    }));

    const line0 = scene.add(new DefLine({ p0: { x: -2, y: -2 }, p1: { x: -2.1, y: -2.5 } }));

    const lineStrip0 = scene.add(new DefLineStrip([
        v2(-1, -3),
        v2(-0.5, -3.5),
        v2(0, -2),
        v2(-0.75, -2.5),
    ]));

    const poly0 = scene.add(new DefPolygon([
        v2(1.5, -3),
        v2(1, -3.5),
        v2(0.5, -2),
        v2(1.25, -2.5),
    ]));

    const bez0 = scene.add(new DefBezier([
        v2(-3, 1),
        v2(-1, 1.5),
        v2(-1.5, 1),
        v2(-3.5, 0.5),
    ]));

    const spline0 = scene.add(new DefBezierSpline({
        points: [
            v2(-2, 3),
            v2(-1, 2),
            v2(0, 2.5),
            v2(-0.5, 3.5),
            v2(-1, 1),
            v2(-1.5, 1.5),
            v2(1, 1),
        ],
        degree: 2,
    }));


    const ellipse0 = scene.add(new DefEllipse({
        center: { x: 3, y: 3 },
        rx: 0.5,
        ry: 1,
        rotation: deg2rad(0),
        startAngle: deg2rad(0),
        endAngle: deg2rad(270)
    }), DefEllipse.fromValues({ rotation: t }));

    const arc0 = scene.add(new DefArc({
        r: 0.5, center: { x: 2.5, y: 0 },
        startAngle: deg2rad(10),
        endAngle: deg2rad(340)
    }));



    const normalProps = {
        style: {
            shaft: {
                strokeStyle: "rgba(255,0,0,0.5)",
            },
            arrow: {

                fillStyle: "rgba(255,0,0,0.5)",
                strokeStyle: "rgba(255,0,0,0.5)",
            }
        }
    };
    const nv = scene.add(new DefCurveNormal(), DefCurveNormal.fromCurve(
        {
            obj: vec0, t, normalize: normalizeNormals, scale: normScale,
        }), normalProps);
    const nl = scene.add(new DefCurveNormal(), DefCurveNormal.fromCurve(
        {
            obj: line0, t, normalize: normalizeNormals, scale: normScale,
        }), normalProps);
    const nls = scene.add(new DefCurveNormal(), DefCurveNormal.fromCurve(
        {
            obj: lineStrip0, t, normalize: normalizeNormals, scale: normScale,
        }), normalProps);
    const npoly = scene.add(new DefCurveNormal(), DefCurveNormal.fromCurve(
        {
            obj: poly0, t, normalize: normalizeNormals, scale: normScale,
        }), normalProps);
    const nbez = scene.add(new DefCurveNormal(), DefCurveNormal.fromCurve(
        {
            obj: bez0, t, normalize: normalizeNormals, scale: normScale,
        }), normalProps);
    const nspline = scene.add(new DefCurveNormal(), DefCurveNormal.fromCurve(
        {
            obj: spline0, t, normalize: normalizeNormals, scale: normScale,
        }), normalProps);
    const narc = scene.add(new DefCurveNormal(), DefCurveNormal.fromCurve(
        {
            obj: arc0, t, normalize: normalizeNormals, scale: normScale,
        }), normalProps);
    const nell = scene.add(new DefCurveNormal(), DefCurveNormal.fromCurve(
        {
            obj: ellipse0, t, normalize: normalizeNormals, scale: normScale,
        }), normalProps);


    const tanProps = {
        style: {
            shaft: {
                strokeStyle: "rgba(0,255,0,0.5)",
            },
            arrow: {

                fillStyle: "rgba(0,255,0,0.5)",
                strokeStyle: "rgba(0,255,0,0.5)",
            }
        }
    };

    const tv = scene.add(new DefCurveTangent(), DefCurveTangent.fromCurve({ obj: vec0, t, normalize: normalizeTangents, scale: tanScale, }), tanProps);
    const tl = scene.add(new DefCurveTangent(), DefCurveTangent.fromCurve({ obj: line0, t, normalize: normalizeTangents, scale: tanScale, }), tanProps);
    const tls = scene.add(new DefCurveTangent(), DefCurveTangent.fromCurve({ obj: lineStrip0, t, normalize: normalizeTangents, scale: tanScale, }), tanProps);
    const tpoly = scene.add(new DefCurveTangent(), DefCurveTangent.fromCurve({ obj: poly0, t, normalize: normalizeTangents, scale: tanScale, }), tanProps);
    const tbez = scene.add(new DefCurveTangent(), DefCurveTangent.fromCurve({ obj: bez0, t, normalize: normalizeTangents, scale: tanScale, }), tanProps);
    const tspline = scene.add(new DefCurveTangent(), DefCurveTangent.fromCurve({ obj: spline0, t, normalize: normalizeTangents, scale: tanScale, }), tanProps);
    const tarc = scene.add(new DefCurveTangent(), DefCurveTangent.fromCurve({ obj: arc0, t, normalize: normalizeTangents, scale: tanScale, }), tanProps);
    const tell = scene.add(new DefCurveTangent(), DefCurveTangent.fromCurve({ obj: ellipse0, t, normalize: normalizeTangents, scale: tanScale, }), tanProps);

    const pointProps = {
        style: {
            r: 5,
            fillStyle: "rgba(0,0,255,0.5)",
        }
    };

    const pv = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: vec0, t }), pointProps);
    const pl = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: line0, t }), pointProps);
    const pls = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: lineStrip0, t }), pointProps);
    const ppoly = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: poly0, t }), pointProps);
    const pbez = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: bez0, t }), pointProps);
    const pspline = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: spline0, t }), pointProps);
    const parc = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: arc0, t }), pointProps);
    const pell = scene.add(new DefCurvePoint(), DefCurvePoint.fromCurve({ obj: ellipse0, t }), pointProps);

    let time = 0;
    let lastTime = new Date().getTime();
    const update = () => {
        let curTime = new Date().getTime();
        const delta = (curTime - lastTime) / 1000;
        lastTime = curTime;
        time += delta / 5;
        scene.update(t, new alg.DefNumber(time % 1));

        window.requestAnimationFrame(update);

    };

    update();

    onRemoved(canvas, () => {
        diagPainter.disconnect();
    });

    const checkNormNormals = makeCheckbox(scene.get(normalizeNormals).value.value);
    checkNormNormals.onchange = e => {
        scene.update(normalizeNormals, new alg.DefBoolean(checkNormNormals.checked));
    };
    container.appendChild(makeContainer(makeTextField("Normalize normals:"), checkNormNormals));

    const checkNormTangents = makeCheckbox(scene.get(normalizeTangents).value.value);
    checkNormTangents.onchange = e => {
        scene.update(normalizeTangents, new alg.DefBoolean(checkNormTangents.checked));
    };
    container.appendChild(makeContainer(makeTextField("Normalize tangents:"), checkNormTangents));


    const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    const sliderNormS = makeSlider(0, 100, 50);
    const textNormS = makeTextField("");

    sliderNormS.oninput = () => {

        let tv = (Number.parseInt(sliderNormS.value) - Number.parseInt(sliderNormS.min)) / (Number.parseInt(sliderNormS.max) - Number.parseInt(sliderNormS.min));

        tv *= 2;
        scene.update(normScale, new DefNumber(tv));
        textNormS.textContent = `Normal scale: ${formatter.format(tv)}`;
    };
    sliderNormS.oninput();
    container.appendChild(makeContainer(sliderNormS, textNormS));

    const sliderTanS = makeSlider(0, 100, 50);
    const textTanS = makeTextField("");

    sliderTanS.oninput = () => {

        let tv = (Number.parseInt(sliderTanS.value) - Number.parseInt(sliderTanS.min)) / (Number.parseInt(sliderTanS.max) - Number.parseInt(sliderTanS.min));

        tv *= 2;
        scene.update(tanScale, new DefNumber(tv));
        textTanS.textContent = `Tangent scale: ${formatter.format(tv)}`;
    };
    sliderTanS.oninput();
    container.appendChild(makeContainer(sliderTanS, textTanS));

    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}

function demoDetectGround(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -2, y0: -2, x1: 7, y1: 6, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });
    const {
        DefPoint,
        DefVector,
        DefLine,
        DefIntersection,
        DefFunc,
        DefLineStrip,
        INVALID,
        makePoint,
        makeLine,
        makePolygon,
        calcAngle,
        calcConvexHull,
    } = alg;

    const v2 = Vec2.vec2;


    const invisible = true;

    const orig = scene.add(new DefPoint(1.5, 2), EMPTY_INFO, {

    });

    let offsets = [];

    offsets = [0.3, 0.6, 0.9, 1.2];


    const points = [orig];
    for (let o of offsets) {
        const v = scene.add(new DefFunc(info => {
            const { orig } = info;
            const p = Vec2.add(orig, { x: o, y: 0 });
            return makePoint(p);
        }), DefFunc.from({ orig }));

        points.push(v);
    }
    const yAxis = scene.add(new DefVector({ x: 0, y: 1 }), EMPTY_INFO, {
        invisible
    });
    const yAxisN = scene.add(new DefVector({ x: 0, y: -1 }), EMPTY_INFO, {
        invisible
    });

    const p0 = scene.add(new DefPoint(2, 2), EMPTY_INFO, {
        invisible
    });

    const p1 = scene.add(new DefPoint(2.2, 1.5), EMPTY_INFO, {
        invisible
    });

    const p2 = scene.add(new DefPoint(1, -0.5), EMPTY_INFO, {
        invisible
    });


    const p3 = scene.add(new DefPoint(4, 0), EMPTY_INFO, {
        invisible
    });

    const ls = scene.add(new DefLineStrip(
        [
            v2(-1, 1),
            v2(1, 2),
            v2(2, 2),
            v2(2.2, 1.5),
            v2(1, -0.5),
            v2(4, 0),
            v2(5, 3),
        ]),
        EMPTY_INFO,
        {
            z: 3,
            style: {
                strokeStyle: "rgba(0,0,0,0.5)",
                lineStyle: {
                    lineWidth: 2,
                }
            }
        });

    const makeIntersectionLine = (strip, orig, dir) => {
        const line0 = scene.add(new DefLine({ leftOpen: false, rightOpen: true }),
            DefLine.fromPointVector(orig, dir));

        const inter0 = scene.add(new DefIntersection(),
            DefIntersection.fromObjects(strip, line0),
            {
                invisible
            });

        const closestI0 = scene.add(new DefFunc(info => {
            const { points, orig } = info;
            if (points.length === 0) {
                return INVALID;
            }
            let mi = 0;
            let mt = Infinity
            for (let i = 0; i < points.length; i++) {
                const u = Vec2.len2(Vec2.sub(points[i], orig));
                if (u < mt) {
                    mt = u;
                    mi = i;
                }
            }

            // add field to point to use later... a bit hacky
            points[mi].minT = mt;
            return points[mi];
        }), DefFunc.from({ points: inter0, orig }), {
            style: {
                fillStyle: "rgba(0,0,255,0.5)",
                r: 8,
            }
        });

        return { line: line0, inter: inter0, closest: closestI0 };
    };

    let lines = [];
    for (const p of points) {
        lines.push(makeIntersectionLine(ls, p, yAxisN));
    }

    let lineClosest = [];
    for (const l of lines) {
        lineClosest.push(l.closest);
    }

    const filteredClosestPoints = scene.add(new DefFunc(info => {
        const points = info;
        const filterLine = [];
        for (let p of points) {
            if (p !== INVALID) {
                filterLine.push(p);
            }
        }
        return filterLine;
    }), DefFunc.from(lineClosest, {}, true), {
        invisible
    })
    let closestLineStrip = scene.add(new DefLineStrip(),
        DefLineStrip.fromPointArray(filteredClosestPoints), {
        z: 1,
        style: {
            strokeStyle: "rgba(0,0,255,0.5)",
            lineStyle: {
                lineWidth: 8,
            }
        }
    });

    const closestLine = scene.add(new DefFunc(info => {
        const { points } = info;

        if (points.length < 2) {
            return INVALID;
        }
        const idx = [];

        for (let i = 0; i < points.length; i++) {
            idx.push(i);
        }
        idx.sort((a, b) => Math.abs(points[a].minT) - Math.abs(points[b].minT));
        return makeLine({ p0: points[idx[0]], p1: points[idx[1]] });
    }), DefFunc.from({ points: filteredClosestPoints }, {}, true),
        {
            z: 2,
            style: {
                strokeStyle: "red",
                lineStyle: {
                    lineWidth: 15,
                }
            }
        }
    );

    const maxLine = scene.add(new DefFunc(info => {
        const { points } = info;

        if (points.length < 2) {
            return INVALID;
        }

        let edge = [points[0], points[1]];
        const compAngle = a => a > Math.PI ? a - 2 * Math.PI : a;
        let dirAngle = (edge) => {
            const e = Vec2.sub(edge[1], edge[0]);
            return compAngle(calcAngle(e.x, e.y));
        }
        let curAngle = dirAngle(edge);

        for (let i = 2; i < points.length; i++) {
            let tedge = [edge[0], points[i]];
            let a = dirAngle(tedge);
            if (a > curAngle) {
                a = curAngle;
                edge = tedge;
            }
        }

        // test
        return makeLine({ p0: edge[0], p1: edge[1], leftOpen: true, rightOpen: true });
    }), DefFunc.from({ points: filteredClosestPoints }, {}, true),
        {
            z: 4,
            style: {
                strokeStyle: "rgba(128,128,128,0.5",
                lineStyle: {
                    lineWidth: 2,
                    lineDash: [4]
                }
            }
        }
    );

    const convHull = scene.add(new DefFunc(info => {
        const { points } = info;

        return makePolygon({ points: calcConvexHull(points) });
    }), DefFunc.from({ points: filteredClosestPoints }, {}, true),
        {
            z: 1,
            style: {
                strokeStyle: "rgb(0,255,0)",
                lineStyle: {
                    lineWidth: 4,
                }
            }
        }
    );


    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas,
        [orig], Infinity);
    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}


function demoClip(container, canvas) {
    const scene = new alg.GeometryScene();

    const diagram = new vis.DiagramCanvas({ x0: -2, y0: -2, x1: 7, y1: 6, flipY: true, canvas });

    const diagPainter = new vis.DiagramPainter(scene, diagram, {
        bg: vis.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });
    const {
        DefPoint,
        DefVector,
        DefLine,
        DefPolygon,
        DefAngle,
        DefFunc,
        makePolygon,
    } = alg;

    const invisible = true;

    const p0 = scene.add(new DefPoint(-0.5, 2), EMPTY_INFO, {});
    const p1 = scene.add(new DefPoint(-0.5, 3), EMPTY_INFO, {});

    const line = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromPoints(p0, p1), {});

    const poly0 = scene.add(new DefPolygon([
        Vec2.new(-1, 1), Vec2.new(0, 1), Vec2.new(0, 2), Vec2.new(-1, 2)
    ]), EMPTY_INFO, {});

    const clip0 = scene.add(new DefPolygon(), DefPolygon.fromClipLine(poly0, line), {
        style: {
            strokeStyle: "rgb(0,0,255)",
            fillStyle: "rgba(255,0,255,0.25)",
        }
    });

    const q0 = scene.add(new DefPoint(1.5, 1), EMPTY_INFO, {});
    const q1 = scene.add(new DefPoint(2.5, 2), EMPTY_INFO, {});
    const v = scene.add(new DefVector(), DefVector.fromPoints(q0, q1), {});
    const poly1 = scene.add(new DefPolygon([
        Vec2.new(1, 1), Vec2.new(2, 1), Vec2.new(2, 2), Vec2.new(1, 2)
    ]), EMPTY_INFO, {});
    const clip1 = scene.add(new DefPolygon(), DefPolygon.fromClipPointNormal(poly1, { n: v }), {
        style: {
            strokeStyle: "rgb(0,0,255)",
            fillStyle: "rgba(255,0,255,0.25)",
        }
    });

    const r0 = scene.add(new DefPoint(3.5, 1.5), EMPTY_INFO, { invisible });
    const r1 = scene.add(new DefPoint(4.5, 1.5), EMPTY_INFO, { invisible });
    const r2 = scene.add(new DefPoint(3.5, 2.5), EMPTY_INFO, {});

    const l01 = scene.add(new DefLine(), DefLine.fromPoints(r0, r1));
    const l02 = scene.add(new DefLine(), DefLine.fromPoints(r0, r2));

    const a = scene.add(new DefAngle(), DefAngle.fromPoints(r1, r0, r2), {});

    const clipPolyBase = scene.add(new DefPolygon([
        Vec2.new(-1, 0), Vec2.new(1, 0), Vec2.new(0.5, 0.5)
    ]), EMPTY_INFO, { invisible });

    const clipPoly = scene.add(new DefFunc(deps => {
        const { poly, angle, p } = deps;

        const ca = Math.cos(angle.value);
        const sa = Math.sin(angle.value);

        const points = poly.points.map(q => Vec2.add(p, Vec2.rotate(q, angle.value, ca, sa)));
        return makePolygon({ points });

    }), DefFunc.from({ poly: clipPolyBase, angle: a, p: r0 }), {
        style: {
            strokeStyle: "rgb(0,0,255)",
            fillStyle: "rgba(0,0,0,0.0)",
        }
    });

    const poly2 = scene.add(new DefPolygon([
        Vec2.new(3, 1), Vec2.new(4, 1), Vec2.new(4, 2), Vec2.new(3, 2)
    ]), EMPTY_INFO, {});

    const clip2 = scene.add(new DefPolygon(), DefPolygon.fromClipPoly(poly2, clipPoly), {
        style: {
            strokeStyle: "rgb(0,0,255)",
            fillStyle: "rgba(255,0,255,0.25)",
        }
    });
    const manip = vis.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas,
        [p0, p1, q0, q1, r2], Infinity);
    onRemoved(canvas, () => {
        manip.detach();
        diagPainter.disconnect();
    });

    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });
}

export {
    demoAddition,
    demoScale,
    demoLength,
    demoDot,
    demoTrig,
    demoInscribedAngle,
    demoTriangleCircles,
    demoDeCasteljau,
    demoLens,
    demoArcTangents,
    demoCurveTangentNormals,
    demoDetectGround,
    demoClip,
};