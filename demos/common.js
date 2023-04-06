
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


export {
    makeContainer, makeCanvas, makeCheckbox, makeSpan, makeTextField, makeSlider,
};