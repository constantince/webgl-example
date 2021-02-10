var canvas = document.getElementById("screen");
console.log(canvas);
var gl = canvas.getContext("webgl")

var vertex_shader = `
    attribute vec4 p;
    void main() {
        gl_Position = p;
        gl_PointSize = 20.0;
    }
`;

var fragement_shader = `
    precision mediump float;
    uniform vec4 color;
    void main() {
        gl_FragColor = vec4(color);
    }
`



initShaders(gl, vertex_shader, fragement_shader);
// console.log(gl.program)

var point_vertex = gl.getAttribLocation(gl.program, 'p');
var frag_color = gl.getUniformLocation(gl.program, 'color');

const canvas_width = 500/2;
const canvas_height = 500/2;
const arr = [];
let gColor = 'red'
function switchColor(c) {
    switch(c){
        case 'red':
            gl.uniform4f(frag_color, 1.0, 0.0, 0.0, 1.0);
        break;
        case 'green':
            gl.uniform4f(frag_color, 0.0, 1.0, 0.0, 1.0);
        break;
        case 'blue':
            gl.uniform4f(frag_color, 0.0, 0.0, 1.0, 1.0);
        break;

    }
}

canvas.addEventListener("click", (event) => {
    const x = event.clientX;
    const y = event.clientY;
    const rect = event.target.getBoundingClientRect();
    console.log(x, y, rect.left, rect.top);
    const d3_left = (x - rect.left - canvas_width) / canvas_width;
    const d3_right = (canvas_height - y - rect.top) / canvas_height;

    arr.push({
        x: d3_left,
        y: d3_right,
        color: gColor
    });

    gl.clear(gl.COLOR_BUFFER_BIT);

    arr.forEach(element => {
        switchColor(element.color);
        gl.vertexAttrib3f(point_vertex, element.x, element.y, 0.0);
        gl.drawArrays(gl.POINTS, 0, 1);
    });

   
}, false);


document.getElementById('green').addEventListener('click', () => {
    gColor = 'green';
});

document.getElementById('blue').addEventListener('click', () => {
    gColor = 'blue';
})