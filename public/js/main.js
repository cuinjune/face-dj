const isDebuggingMode = false;
const VIDEO_SIZE = 400;
let model, ctx, videoWidth, videoHeight, video, canvas;
let volume, panning, cutoff, resonance;

function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

const mobile = isMobile();
const state = {
    backend: "webgl",
    maxFaces: 1,
    triangulateMesh: false
};

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

async function setupCamera() {
    video = document.getElementById("video");
    const stream = await navigator.mediaDevices.getUserMedia({
        "audio": false,
        "video": {
            facingMode: "user",
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: mobile ? undefined : VIDEO_SIZE,
            height: mobile ? undefined : VIDEO_SIZE
        },
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

function map(value, inputMin, inputMax, outputMin, outputMax) {
    return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
}

async function renderPrediction() {
    const predictions = await model.estimateFaces(video);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
        predictions.forEach(prediction => {

            // The probability of a face being present
            if (prediction.faceInViewConfidence > 0.9) { // only process accurate enough data

                // bounding box
                const boundingBoxLeftX = prediction.boundingBox.topLeft[0][0];
                const boundingBoxRightX = prediction.boundingBox.bottomRight[0][0];
                volume = map(boundingBoxRightX - boundingBoxLeftX, 0, VIDEO_SIZE, 0, 1);

                // silhouette
                const silhouetteLeftZ = prediction.annotations.silhouette[8][2];
                const silhouetteRightZ = prediction.annotations.silhouette[28][2];
                const silhouetteTopZ = prediction.annotations.silhouette[0][2];
                const silhouetteBottomZ = prediction.annotations.silhouette[18][2];
                panning = map(silhouetteRightZ - silhouetteLeftZ, -100, 100, 0, 1);
                cutoff = map(silhouetteTopZ - silhouetteBottomZ, -100, 100, 0, 1);

                // lips
                const lipsUpperInnerCenterY = prediction.annotations.lipsUpperInner[5][1];
                const lipsLowerInnerCenterY = prediction.annotations.lipsLowerInner[5][1];
                resonance = map(lipsLowerInnerCenterY - lipsUpperInnerCenterY, 0, VIDEO_SIZE / 4, 0, 1) / volume;

                // debugging
                if (isDebuggingMode) {

                    console.log("volume: ", volume);
                    console.log("panning: ", panning);
                    console.log("cutoff: ", cutoff);
                    console.log("resonance: ", resonance);

                    // bounding box
                    const boundingBoxTopLeft = prediction.boundingBox.topLeft[0];
                    const boundingBoxBottomRight = prediction.boundingBox.bottomRight[0];
                    const boundingBoxTopRight = [boundingBoxBottomRight[0], boundingBoxTopLeft[1]];
                    const boundingBoxBottomLeft = [boundingBoxTopLeft[0], boundingBoxBottomRight[1]];
                    ctx.beginPath();
                    ctx.moveTo(boundingBoxTopLeft[0], boundingBoxTopLeft[1]);
                    ctx.lineTo(boundingBoxTopRight[0], boundingBoxTopRight[1]);
                    ctx.lineTo(boundingBoxBottomRight[0], boundingBoxBottomRight[1]);
                    ctx.lineTo(boundingBoxBottomLeft[0], boundingBoxBottomLeft[1]);
                    ctx.closePath();
                    ctx.stroke();

                    // silhouette
                    const silhouetteLeftX = prediction.annotations.silhouette[8][0];
                    const silhouetteLeftY = prediction.annotations.silhouette[8][1];
                    ctx.beginPath();
                    ctx.arc(silhouetteLeftX, silhouetteLeftY, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    const silhouetteRightX = prediction.annotations.silhouette[28][0];
                    const silhouetteRightY = prediction.annotations.silhouette[28][1];
                    ctx.beginPath();
                    ctx.arc(silhouetteRightX, silhouetteRightY, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    const silhouetteTopX = prediction.annotations.silhouette[0][0];
                    const silhouetteTopY = prediction.annotations.silhouette[0][1];
                    ctx.beginPath();
                    ctx.arc(silhouetteTopX, silhouetteTopY, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    const silhouetteBottomX = prediction.annotations.silhouette[18][0];
                    const silhouetteBottomY = prediction.annotations.silhouette[18][1];
                    ctx.beginPath();
                    ctx.arc(silhouetteBottomX, silhouetteBottomY, 2, 0, 2 * Math.PI);
                    ctx.fill();

                    // lips
                    const lipsUpperInnerCenterX = prediction.annotations.lipsUpperInner[5][0];
                    const lipsUpperInnerCenterY = prediction.annotations.lipsUpperInner[5][1];
                    ctx.beginPath();
                    ctx.arc(lipsUpperInnerCenterX, lipsUpperInnerCenterY, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    const lipsLowerInnerCenterX = prediction.annotations.lipsLowerInner[5][0];
                    const lipsLowerInnerCenterY = prediction.annotations.lipsLowerInner[5][1];
                    ctx.beginPath();
                    ctx.arc(lipsLowerInnerCenterX, lipsLowerInnerCenterY, 2, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        });
    }
    requestAnimationFrame(renderPrediction);
};

async function main() {
    await tf.setBackend(state.backend);
    if (isDebuggingMode) {
        const canvasContainer = document.getElementById("container");
        canvasContainer.style.display = "block";
    }
    await setupCamera();
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    canvas = document.getElementById("output");
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    if (!isDebuggingMode) {
        canvas.style.display = "none"; // hide the canvas
    }
    const canvasWrapper = document.getElementById("canvas-wrapper");
    canvasWrapper.style = `width: ${videoWidth}px; height: ${videoHeight}px`;
    ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    model = await facemesh.load({ maxFaces: state.maxFaces });
    renderPrediction();
};

window.addEventListener("DOMContentLoaded", async () => {

    main();
});