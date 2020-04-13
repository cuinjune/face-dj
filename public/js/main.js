// audio autoplay
const audioContextList = [];
(function () {
    self.AudioContext = new Proxy(self.AudioContext, {
        construct(target, args) {
            const result = new target(...args);
            audioContextList.push(result);
            return result;
        }
    });
})();

function resumeAudio() {
    audioContextList.forEach(ctx => {
        if (ctx.state !== "running") { ctx.resume(); }
    });
}

["click", "contextmenu", "auxclick", "dblclick"
    , "mousedown", "mouseup", "pointerup", "touchend"
    , "keydown", "keyup"
].forEach(name => document.addEventListener(name, resumeAudio));

// emscripten module
var Module = {
    preRun: []
    , postRun: []
    , print: function (e) {
        1 < arguments.length && (e = Array.prototype.slice.call(arguments).join(" "));
        console.log(e);
    }
    , printErr: function (e) {
        1 < arguments.length && (e = Array.prototype.slice.call(arguments).join(" "));
        console.error(e)
    }
};

async function getSynthData() {
    const synthUrl = "/api/v1/synth/data";
    const synthUrlApiOptions = { method: "GET" };
    const synthUrlResponse = await fetch(synthUrl, synthUrlApiOptions);
    const synthJson = await synthUrlResponse.json();
    return synthJson;
}

async function addSynthDataElement(newData) {
    const synthUrl = "/api/v1/synth/data";
    const synthUrlApiOptions = { method: "POST", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(newData) };
    const synthUrlResponse = await fetch(synthUrl, synthUrlApiOptions);
    const synthJson = await synthUrlResponse.json();
    return synthJson;
}

async function updateSynthDataElement(id, newData) {
    const synthUrl = `/api/v1/synth/data/${id}`;
    const synthUrlApiOptions = { method: "PUT", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(newData) };
    const synthUrlResponse = await fetch(synthUrl, synthUrlApiOptions);
    const synthJson = await synthUrlResponse.json();
    return synthJson;
}

async function deleteSynthDataElement(id) {
    const synthUrl = `/api/v1/synth/data/${id}`;
    const synthUrlApiOptions = { method: "DELETE", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } };
    const synthUrlResponse = await fetch(synthUrl, synthUrlApiOptions);
    const synthJson = await synthUrlResponse.json();
    return synthJson;
}

window.addEventListener("DOMContentLoaded", async () => {

    //synth data
    var synthData = await getSynthData();

    //get preset index
    async function getPresetIndex(preset) {
        synthData = await getSynthData();
        var presetIndex = -1;
        for (let i = 0; i < synthData.length; ++i) {
            if (synthData[i].preset == preset) {
                presetIndex = i;
                break;
            }
        }
        return presetIndex;
    }
    
    //knobs
    var knobs = [];
    for (let i = 0; i < 16; ++i) {
        knobs[i] = new Nexus.Dial(`knob${i}`, {
            'size': [75, 75],
            'interaction': 'radial', // "radial", "vertical", or "horizontal"
            'mode': 'relative', // "absolute" or "relative"
            'min': 0,
            'max': 1,
            'step': 0,
            'value': synthData[0][`knob${i}`]
        });
        knobs[i].colorize("accent", "#4DB33D");
        knobs[i].colorize("fill", "#E8E7D5");
        knobs[i].on("change", function (v) {
            Module.sendFloat(`knob${i}`, v);
        });
    }

    //presets
    var options = [];
    for (let i = 0; i < synthData.length; ++i) {
        options.push(synthData[i].preset);
    }
    var presets = new Nexus.Select('#presets', {
        'size': [100, 30],
        'options': options,
        'selectedIndex': 0
    });
    presets.on("change", async function (v) {
        const preset = v.value;
        const presetIndex = await getPresetIndex(preset);
        for (let i = 0; i < 16; ++i) {
            knobs[i].value = synthData[presetIndex][`knob${i}`];
        }
        document.getElementById("preset").value = preset;
    });
    async function updateOptions(selectedIndex) {
        synthData = await getSynthData();
        options = [];
        for (let i = 0; i < synthData.length; ++i) {
            options.push(synthData[i].preset);
        }
        presets.defineOptions(options)
        if (selectedIndex == -1) {
            presets.selectedIndex = options.length - 1;
        }
        else {
            presets.selectedIndex = selectedIndex;
        }
    }

    //save button listener
    const $saveButton = document.getElementById("saveButton");
    $saveButton.addEventListener('click', async () => {
        const preset = document.getElementById("preset").value;
        var presetIndex = await getPresetIndex(preset);
        const newData = {
            preset: preset,
            knob0: knobs[0].value,
            knob1: knobs[1].value,
            knob2: knobs[2].value,
            knob3: knobs[3].value,
            knob4: knobs[4].value,
            knob5: knobs[5].value,
            knob6: knobs[6].value,
            knob7: knobs[7].value,
            knob8: knobs[8].value,
            knob9: knobs[9].value,
            knob10: knobs[10].value,
            knob11: knobs[11].value,
            knob12: knobs[12].value,
            knob13: knobs[13].value,
            knob14: knobs[14].value,
            knob15: knobs[15].value
        };
        if (presetIndex == -1) {
            if (confirm(`Do you want to save the current settings as a new preset "${preset}?"`)) {
                await addSynthDataElement(newData);
                await updateOptions(-1);
            }
        }
        else if (presetIndex == 0) {
            alert("Cannot overwrite the default preset.\nChange the name to save it as a new preset.");
        }
        else {
            if (confirm(`Do you want to overwrite the existing preset "${preset}?"`)) {
                await updateSynthDataElement(synthData[presetIndex]._id, newData);
                await updateOptions(presetIndex);
            }
        }
    });

    //delete button listener
    const $deleteButton = document.getElementById("deleteButton");
    $deleteButton.addEventListener('click', async () => {
        const preset = document.getElementById("preset").value;
        var presetIndex = await getPresetIndex(preset);
        if (presetIndex == -1) {
            alert(`Cannot delete the unsaved preset "${preset}".`);
        }
        else if (presetIndex == 0) {
            alert("Cannot delete the default preset.");
        }
        else {
            if (confirm(`Do you want to delete the preset "${preset}?"`)) {
                await deleteSynthDataElement(synthData[presetIndex]._id);
                await updateOptions(presetIndex - 1);
            }
        }
    });

    //keyboard
    var keyboard = new Nexus.Piano('#keyboard', {
        'size': [700, 175],
        'mode': 'button',  // 'button', 'toggle', or 'impulse'
        'lowNote': 48,
        'highNote': 84
    });
    keyboard.colorize("accent", "#E8E7D5");
    keyboard.on("change", function (v) {
        if (v.state == true)
            Module.sendFloat("note", v.note);
    });
    const keyboardMap = {
        'z': 48,
        's': 49,
        'x': 50,
        'd': 51,
        'c': 52,
        'v': 53,
        'g': 54,
        'b': 55,
        'h': 56,
        'n': 57,
        'j': 58,
        'm': 59,
        ',': 60,
        'l': 61,
        '.': 62,
        ';': 63,
        '/': 64,
        'q': 60,
        '2': 61,
        'w': 62,
        '3': 63,
        'e': 64,
        'r': 65,
        '5': 66,
        't': 67,
        '6': 68,
        'y': 69,
        '7': 70,
        'u': 71,
        'i': 72,
        '9': 73,
        'o': 74,
        '0': 75,
        'p': 76,
        '[': 77,
        '=': 78,
        ']': 79
    };
    document.addEventListener("keydown", function (e) {
        e = e || window.event;
        if (e.repeat) return;
        const note = keyboardMap[e.key];
        if (typeof note == "undefined") return;
        keyboard.toggleKey(note, true);
        Module.sendFloat("note", note);
    });
    document.addEventListener("keyup", function (e) {
        e = e || window.event;
        if (e.repeat) return;
        const note = keyboardMap[e.key];
        if (typeof note == "undefined") return;
        keyboard.toggleKey(note, false);
    });
});