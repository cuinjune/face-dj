const shouldSupportSafari = false;

// create an AudioContext
const audioContextList = [];
(function () {
    let AudioContext = self.AudioContext || (shouldSupportSafari && self.webkitAudioContext) || false;
    if (AudioContext) {
        self.AudioContext = new Proxy(AudioContext, {
            construct(target, args) {
                const result = new target(...args);
                audioContextList.push(result);
                return result;
            }
        });
    }
    else {
        alert("The Web Audio API is not supported in this browser.\nPlease try it in the latest version of Chrome or Firefox.");
    }
})();

function resumeAudio() {
    audioContextList.forEach(ctx => {
        if (ctx.state !== "running") { ctx.resume(); }
    });
}

// resume audio on events
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