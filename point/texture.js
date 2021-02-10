var canvas = document.getElementById("screen");
var gl = canvas.getContext("webgl");

var VERTEX_SHADER = `
    attribute vec4 a_Position;
    attribute vec2 a_texture;
    varying vec2 v_texture; 
    void main() {
        gl_Position = a_Position;
        v_texture = a_texture;
    }
`;

var FRAGMENT_SHADER = `
    precision mediump float;
    uniform sampler2D u_sample;
    uniform sampler2D u_sample1;
    varying vec2 v_texture;
    void main() {
        vec4 color1 = texture2D(u_sample, v_texture);
        vec4 color2 = texture2D(u_sample1, v_texture);
        gl_FragColor = color1 * color2;
    }
`;

initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER);

var number = initVertexBuffer(gl);

createTexture(gl, number);

function initVertexBuffer(context) {
    var textures = new Float32Array([
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]);


    var size = textures.BYTES_PER_ELEMENT;

    var n = 4;
    var buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, textures, context.STATIC_DRAW);

    var a_Position = context.getAttribLocation(context.program, 'a_Position');
    context.vertexAttribPointer(a_Position, 2, context.FLOAT, false, size * 4, 0);
    context.enableVertexAttribArray(a_Position);

    var a_texture = context.getAttribLocation(context.program, 'a_texture');
    context.vertexAttribPointer(a_texture, 2, context.FLOAT, false, size * 4, size * 2);
    context.enableVertexAttribArray(a_texture);

    return n;
}

function createTexture(context, n) {
    var textInstance = context.createTexture();
    var textInstance1 = context.createTexture();
    var img = new Image();
    var img1 = new Image();

    var u_Sample = context.getUniformLocation(context.program, 'u_sample');
    var u_Sample1 = context.getUniformLocation(context.program, 'u_sample1');

    setTimeout(function(){
        initTexture(context, img, u_Sample, textInstance, n, context.TEXTURE0, 0);
        initTexture(context, img1, u_Sample1, textInstance1, n, context.TEXTURE1, 1);
    }, 100);

    
    img1.src = "./circle.gif";
    img.src = "./sky.jpg";
}

function initTexture(context, img, sample, instance, n, t, m) {
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1);
    context.activeTexture(t);
    context.bindTexture(context.TEXTURE_2D, instance);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGB, context.RGB, context.UNSIGNED_BYTE, img)
    context.uniform1i(sample, m);
    context.drawArrays(context.TRIANGLE_STRIP, 0, n);
}
