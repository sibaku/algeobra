
import * as tuts from "./tutorial.js";

import {
    makeCanvas, makeContainer,
} from "../common.js";

document.body.onload = () => {

    const dm = [
        tuts.controllableRectangle,
        tuts.reflectionRefraction,
    ];

    for (const d of dm) {
        const canvas = makeCanvas(400, 400);
        canvas.classList.add("tutCanvas");
        const con = makeContainer(canvas);
        document.body.appendChild(con);
        d(con, canvas);

    }
}