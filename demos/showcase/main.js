
import * as demos from "./demos.js";

import {
    makeCanvas, makeContainer,
} from "../common.js";

document.body.onload = () => {

    const dm = [
        demos.demoAddition,
        demos.demoScale,
        demos.demoLength,
        demos.demoDot,
        demos.demoTrig,
        demos.demoInscribedAngle,
        demos.demoTriangleCircles,
        demos.demoDeCasteljau,
        demos.demoLens,
        demos.demoArcTangents,
        demos.demoCurveTangentNormals,
        demos.demoDetectGround,
    ];

    for (const d of dm) {
        const canvas = makeCanvas(400, 400);
        canvas.classList.add("demoCanvas");
        const con = makeContainer(canvas);
        document.body.appendChild(con);
        d(con, canvas);

    }
}