
import * as demos3d from "./demos3d.js";

import {
    makeContainer,
} from "../common.js";

document.body.onload = () => {

    const dm = [
        demos3d.showFrustum,
    ];

    for (const d of dm) {
        const con = makeContainer();
        document.body.appendChild(con);
        d(con);

    }
}