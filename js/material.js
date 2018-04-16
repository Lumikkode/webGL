class Material {
    constructor(gl, vs, fs) {
        this.gl = gl;
        let vsShade = this.getShader(vs, gl.VERTEX_SHADER);
        let fsShade = this.getShader(fs, gl.FRAGMENT_SHADER);

        if(vsShade && fsShade) {
            this.program = gl.createProgram();
            gl.attachShader(this.program, vsShade);
            gl.attachShader(this.program, fsShade);
            gl.linkProgram(this.program);

            if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Cannot load shader', gl.getProgramInfoLog(this.program));
                return null;
            }

            gl.detachShader(this.program, vsShade);
            gl.detachShader(this.program, fsShade);
            gl.deleteShader(vsShade);
            gl.deleteShader(fsShade);

            gl.useProgram(null);
        }
    }

    getShader (script, type) {
        let gl = this.gl;
        var output = gl.createShader(type);
        gl.shaderSource(output, script);
        gl.compileShader(output);

        if(!gl.getShaderParameter(output, gl.COMPILE_STATUS)) {
            console.error('Failed to compile Shader: ', gl.getShaderInfoLog(output));
            return null;
        }
        return output;
    }
}

class Sprite {
    constructor(gl, img_url, vs, fs) {
        this.gl = gl;
        this.isLoaded = false;
        this.material = new Material(gl, vs, fs);

        this.image = new Image();
        this.image.src = img_url;
        this.image.sprite = this;
        this.image.onload = function() {
            this.sprite.setup();
        }
    }

    static createRectArray(x=-1, y=-1, w=1, h=1) {
        // triangles
        return new Float32Array([
            x, y, 
            x+w, y,
            x, y+h,
            x, y+h,
            x+w, y,
            x+w, y+h,
        ]);
    }

    setup() {
        let gl = this.gl;
        gl.useProgram(this.material.program);
        this.gl_tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.tex_buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
        gl.bufferData(gl.ARRAY_BUFFER, Sprite.createRectArray(), gl.STATIC_DRAW);

        this.geo_buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
        gl.bufferData(gl.ARRAY_BUFFER, Sprite.createRectArray(), gl.STATIC_DRAW);

        this.aPositionLoc = gl.getAttribLocation(this.material.program, "a_position");
        this.aTexcoordLoc = gl.getAttribLocation(this.material.program, "a_texCoord");
        this.uImageLocation = gl.getUniformLocation(this.material.program, "u_image");

        gl.useProgram(null);
        this.isLoaded = true;
    }

    render() {
        if(this.isLoaded) {
            let gl = this.gl;
            gl.useProgram(this.material.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
            gl.uniform1i(this.uImageLocation, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
            gl.enableVertexAttribArray(this.aTexcoordLoc);
            gl.vertexAttribPointer(this.aTexcoordLoc, 2, gl.FLOAT, false, 0,0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
            gl.enableVertexAttribArray(this.aPositionLoc);
            gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 0,0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
            gl.useProgram(null);
        }
    }
}

