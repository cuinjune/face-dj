class DebugDraw {
    constructor(prediction, ctx) {
        this.prediction = prediction;
        this.ctx = ctx;
    }

    boundingBoxLine() {
        const boundingBoxTopLeft = this.prediction.boundingBox.topLeft[0];
        const boundingBoxBottomRight = this.prediction.boundingBox.bottomRight[0];
        const boundingBoxTopRight = [boundingBoxBottomRight[0], boundingBoxTopLeft[1]];
        const boundingBoxBottomLeft = [boundingBoxTopLeft[0], boundingBoxBottomRight[1]];
        this.ctx.beginPath();
        this.ctx.moveTo(boundingBoxTopLeft[0], boundingBoxTopLeft[1]);
        this.ctx.lineTo(boundingBoxTopRight[0], boundingBoxTopRight[1]);
        this.ctx.lineTo(boundingBoxBottomRight[0], boundingBoxBottomRight[1]);
        this.ctx.lineTo(boundingBoxBottomLeft[0], boundingBoxBottomLeft[1]);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    silhouette4Points() {
        const silhouetteLeftX = this.prediction.annotations.silhouette[8][0];
        const silhouetteLeftY = this.prediction.annotations.silhouette[8][1];
        this.ctx.beginPath();
        this.ctx.arc(silhouetteLeftX, silhouetteLeftY, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        const silhouetteRightX = this.prediction.annotations.silhouette[28][0];
        const silhouetteRightY = this.prediction.annotations.silhouette[28][1];
        this.ctx.beginPath();
        this.ctx.arc(silhouetteRightX, silhouetteRightY, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        const silhouetteTopX = this.prediction.annotations.silhouette[0][0];
        const silhouetteTopY = this.prediction.annotations.silhouette[0][1];
        this.ctx.beginPath();
        this.ctx.arc(silhouetteTopX, silhouetteTopY, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        const silhouetteBottomX = this.prediction.annotations.silhouette[18][0];
        const silhouetteBottomY = this.prediction.annotations.silhouette[18][1];
        this.ctx.beginPath();
        this.ctx.arc(silhouetteBottomX, silhouetteBottomY, 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    lipsCenterInnerPoints() {
        const lipsUpperInnerCenterX = this.prediction.annotations.lipsUpperInner[5][0];
        const lipsUpperInnerCenterY = this.prediction.annotations.lipsUpperInner[5][1];
        this.ctx.beginPath();
        this.ctx.arc(lipsUpperInnerCenterX, lipsUpperInnerCenterY, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        const lipsLowerInnerCenterX = this.prediction.annotations.lipsLowerInner[5][0];
        const lipsLowerInnerCenterY = this.prediction.annotations.lipsLowerInner[5][1];
        this.ctx.beginPath();
        this.ctx.arc(lipsLowerInnerCenterX, lipsLowerInnerCenterY, 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}







