
import * as demos from "./demos.js";

import {
    makeCanvas, makeContainer,
} from "../common.js";

document.body.onload = () => {


    for (const key of Object.keys(demos)) {
        const d = demos[key];
        const canvas = makeCanvas(400, 400);
        canvas.classList.add("demoCanvas");
        const con = makeContainer(canvas);
        document.body.appendChild(con);
        d(con, canvas);
    }
}