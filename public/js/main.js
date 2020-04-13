const isDebugMode = false;
const VIDEO_SIZE = 400;
let model, ctx, videoWidth, videoHeight, video, canvas;
let volume, panning, cutoff, resonance;

const mobile = isMobile();
const state = {
    backend: "webgl",
    maxFaces: 1,
    triangulateMesh: false
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
                panning = map(silhouetteLeftZ - silhouetteRightZ, -200, 200, 0, 1);
                cutoff = map(silhouetteTopZ - silhouetteBottomZ, -100, 100, 0, 1);

                // lips
                const lipsUpperInnerCenterY = prediction.annotations.lipsUpperInner[5][1];
                const lipsLowerInnerCenterY = prediction.annotations.lipsLowerInner[5][1];
                resonance = map(lipsLowerInnerCenterY - lipsUpperInnerCenterY, 0, VIDEO_SIZE / 4, 0, 1) / volume;

                // send to pd
                Module.sendFloat("volume", volume);
                Module.sendFloat("panning", panning);
                Module.sendFloat("cutoff", cutoff);
                Module.sendFloat("resonance", resonance);

                // debugging
                if (isDebugMode) {
                    console.log("volume: ", volume);
                    console.log("panning: ", panning);
                    console.log("cutoff: ", cutoff);
                    console.log("resonance: ", resonance);
                    const debugDraw = new DebugDraw(prediction, ctx);
                    debugDraw.boundingBoxLine();
                    debugDraw.silhouette4Points();
                    debugDraw.lipsCenterInnerPoints();
                }
            }
        });
    }
    requestAnimationFrame(renderPrediction);
};

async function main() {
    await tf.setBackend(state.backend);
    if (isDebugMode) {
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

    if (!isDebugMode) {
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

    function playMusic() {
        Module.sendBang("playMusic");
    }

    document.getElementById("playMusicButton").addEventListener("click", playMusic, false);
});