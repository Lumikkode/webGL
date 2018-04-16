function loop() {
    window.game.update();
    requestAnimationFrame(loop);
}

class Game {
    constructor() {
        // Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        document.querySelector('body').appendChild(this.canvas);
        // WebGL
        this.gl = this.canvas.getContext('webgl2');
        this.gl.clearColor(0.4, 0.6, 1.0, 0.7);

        let vs = document.getElementById('vs_01').innerHTML;
        let fs = document.getElementById('fs_01').innerHTML;
        this.sprite1 = new Sprite(this.gl, '/images/firekeeper.gif', vs, fs);
        this.sprite2 = new Sprite(this.gl, '/images/sif.gif', vs, fs);
    }

    update() {
        // setting size of drawarea
        this.gl.viewport(0,0, this.canvas.width, this.canvas.height);
        // cleaning screen
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        // Allows images transparent to blend together
        this.gl.enable(this.gl.BLEND);
        // 1 - (alpha) = new alpha of blending channel
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        // rendering
        this.sprite1.render();
        this.sprite2.render();
        // flush data to browser
        this.gl.flush();
    }
}