
import * as tuts from "./tutorial.js";

import {
    makeCanvas, makeContainer,
} from "../common.js";

document.body.onload = () => {

    for (const key of Object.keys(tuts)) {
        const d = tuts[key];
        const canvas = makeCanvas(400, 400);
        canvas.classList.add("tutCanvas");
        const con = makeContainer(canvas);
        document.body.appendChild(con);
        d(con, canvas);

    }
}