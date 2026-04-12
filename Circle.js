class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;
    }

    render() {
        //get all info from point
        var xy = this.position
        var rgba = this.color
        var size = this.size

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // pass the size to the shader
        gl.uniform1f(u_Size, size);

        // Draw
        var d = this.size / 200.0; //delta
        let angleStep = 360 / this.segments // triangle angle
        for (var angle = 0; angle < 360; angle += angleStep) {
            // calc circle segment
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d]; // vec1 = vec(cos(a1), sin(a1)) * d
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d]; // vec2 = vec(cos(a2), sin(a2)) * d
            let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]]; // turn vec1 into pt1 by offsetting vec from center
            let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]]; // turn vec2 into pt2 by offsetting vec from center

            // draw segment
            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]])
        }
    }
}