
const makeContainer = (...children) => {
    const c = document.createElement("div");
    for (let child of children) {
        c.appendChild(child);
    }
    return c;
};

const makeCanvas = (width, height) => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
};

const makeCheckbox = (checked) => {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = checked;
    return box;
};

const makeSpan = (...children) => {
    const c = document.createElement("span");
    for (let child of children) {
        c.appendChild(child);
    }
    return c;
};
const makeTextField = (text) => {
    const span = makeSpan();
    span.textContent = text;
    return span;
};

const makeSlider = (min, max, value) => {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.value = value;
    return slider;
};

const mapFrom = (v, min, max) => (v - min) / (max - min);
const mapTo = (v, min, max) => v * (max - min) + min;

const makeUpdateSlider = (cb, min = 0, max = 1, value = min, steps = 100) => {
    const slider = makeSlider(1, steps,
        mapTo(mapFrom(value, min, max), 1, steps));

    slider.oninput = () => {
        // convert slider value into [0,1]
        const t = mapFrom(parseInt(slider.value), parseInt(slider.min), parseInt(slider.max));
        const val = mapTo(t, min, max);
        cb(val, slider);
    };

    slider.oninput();

    return slider;
}

export {
    makeContainer, makeCanvas, makeCheckbox, makeSpan, makeTextField, makeSlider, makeUpdateSlider
};