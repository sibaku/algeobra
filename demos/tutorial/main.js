
import * as demos from "./tutorial.js";

import {
    makeCanvas, makeContainer,
} from "../common.js";

document.body.onload = () => {

    const dm = [
    ];

    for (const d of dm) {
        const canvas = makeCanvas(400, 400);
        canvas.classList.add("demoCanvas");
        const con = makeContainer(canvas);
        document.body.appendChild(con);
        d(con, canvas);

    }
}