function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

// Given a value and an input range, map the value to an output range.
function map(value, inputMin, inputMax, outputMin, outputMax) {
    return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
}

// Linearly interpolate a value within a range.
function lerp(start, stop, amount) {
    return start + (stop - start) * amount;
}
