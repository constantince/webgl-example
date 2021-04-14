const VERTEX_SHADER = `
    attribute vec4 a_Position;
    varying vec4 v_Position;
    void main() {
        v_Position = a_Position;
        gl_Position = a_Position;
        gl_Position.z = 1.0;
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;
    varying vec4 v_Position;

    uniform samplerCube u_Skybox;
    uniform mat4 u_SkyboxProjection;
    void main() {
        vec4 t = u_SkyboxProjection * v_Position;
        gl_FragColor = textureCube(u_Skybox, normalize(t.xyz / t.w));
    }
`;

function main() {
    const canvas = document.getElementById("cube");
    const webgl = canvas.getContext("webgl");

    webgl.clearColor(0.75, 0.85, 0.8, 0.9);
    webgl.enable(webgl.DEPTH_TEST);

    //initialize the shaders
    const program = myInitShader(webgl, VERTEX_SHADER, FRAGMENT_SHADER);
    webgl.useProgram(program);
    

    //create vertices and indices;
    // const verticesAndIndices = cubeVertex();
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ])
    // initialize buffers;

    myInitBuffer(webgl, program, vertices, 'a_Position', 2);
    // myInitBuffer(webgl, program, verticesAndIndices.normals, 'a_Normal', 3);
    // myInitBuffer(webgl, program, verticesAndIndices.triangleIndices, undefined, undefined, true);

    //create cube_map

    create_cube_map(webgl);


    let start = 0, speed = 0.5;
    var tick = () => {
        start += speed;
        //initialize matrix;
        create_matrix(webgl, program, start);
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        webgl.drawArrays(webgl.TRIANGLES, 0, 6);
        requestAnimationFrame(tick)
    }
    
     tick();

}

function create_cube_map(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    const faceInfos = [
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-x.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-x.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-y.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-y.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-z.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-z.jpg',
        },
    ];

    faceInfos.forEach(v => {
        const {target, url} = v;
        const image = new Image();
        image.crossOrigin = "";
        const LEVEL = 0,
        FORMAT = gl.RGBA, width = 512,
        height = 512, type = gl.UNSIGNED_BYTE;
        gl.texImage2D(target, LEVEL, FORMAT, width, height, 0, FORMAT, type, null);
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, LEVEL, FORMAT, FORMAT, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        }
        image.src = url;
    });

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

}
let then = 0;
function degToRad(d) {
    return d * Math.PI / 180;
  }

var fieldOfViewRadians = degToRad(60);

function create_matrix(gl, program, time) {
    const skyboxLocation = gl.getUniformLocation(program, "u_Skybox");
    const viewDirectionProjectionInverseLocation = gl.getUniformLocation(program, "u_SkyboxProjection");
    // convert to seconds
    time *= 0.1;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;
    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection_matrix = mat4.create();
    const sky_box_matrix = mat4.create();
    const camera_matrix = mat4.create();
    mat4.identity(projection_matrix);
    mat4.identity(sky_box_matrix);
    mat4.identity(camera_matrix);

    mat4.perspective(projection_matrix, glMatrix.toRadian(60), aspect, 1, 2000);
    
    // camera going in circle 2 units from origin looking at origin
    var cameraPosition = [Math.cos(time * -.1), 0, Math.sin(time * -.1)];
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    // Compute the camera's matrix using look at.
    mat4.lookAt(camera_matrix, cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = mat4.invert(mat4.create(), camera_matrix);

    // We only care about direciton so remove the translation
    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    mat4.multiply(projection_matrix, projection_matrix, viewMatrix);

    mat4.invert(projection_matrix, projection_matrix);

    // Set the uniforms
    gl.uniformMatrix4fv(
        viewDirectionProjectionInverseLocation, false,
        projection_matrix);

    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skyboxLocation, 0);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    return;
    
}