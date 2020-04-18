# Face DJ
<img src="screenshot.png" alt="Screenshot" width="1000"/>

Here's the [Live Demo on Glitch](https://cuinjune-face-dj.glitch.me/).

**You need a webcam, headphones, and a microphone to fully use this app.
Please try the app in the latest version of Chrome or Firefox. (Safari is currently not supported)**

## Features
* Moving your head by X, Y position changes the song pattern.
* Moving your head by Z position changes the volume.
* Tilting the head based on the Y-axis controls the panning.
* Tilting the head based on the X-axis controls the filter cutoff.
* Opening/closing your mouth controls the filter resonance.
* Saying something to the microphone plays a vocoder.

## Setup
1. Installation of node.js is required. Follow [this guide](https://github.com/itp-dwd/2020-spring/blob/master/guides/installing-nodejs.md) to install it.
2. Run the following commands in the Terminal.
```
git clone https://github.com/cuinjune/face-dj.git
cd face-dj
npm install dependencies
npm start
```
3. Open your web browser and navigate to http://localhost:3000

## Tools & Assets used
[Tensorflow Facemesh library](https://github.com/tensorflow/tfjs-models/tree/master/facemesh), Three.js, Pure Data, libpd, SDL, Emscripten, Node.js, Express.js, [Royalty Free Music from Bensound](https://www.bensound.com/royalty-free-music/track/dance), [Hifi Stereo 3D Model from Google Poly](https://poly.google.com/view/4lmTyNSCszQ).

## Reporting bugs
Please post an [issue](https://github.com/cuinjune/face-dj/issues) if you face any problem (e.g. no music playing after clicking the “Play Music” button or speakers not moving) using the app.

## Author
* [Zack Lee](https://www.cuinjune.com/about): an MPS Candidate at [NYU ITP](https://itp.nyu.edu).
