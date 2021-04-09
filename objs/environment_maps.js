const VERTEX_SHADER = `
    attribute vec4 a_Position;
    uniform vec3 a_Normal;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_WorldMatrix;
    uniform mat4 u_ViewMatrix;

    varying mat4 m_WorldPosition;
    varying mat4 m_WorldNormal;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_WorldMatrix * a_Position;
        m_WorldPosition = u_WorldMatrix * a_Position;
        m_WorldNormal = u_WorldMatrix * a_Normal; 
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;
    varying mat4 m_WorldPosition;
    varying mat4 m_WorldNormal;

    uniform samplerCube u_texture;
    uniform vec4 u_cameraPosition;
    void main() {
        vec4 worldNormal = normalize(m_WorldNormal);
        vec4 eyeToSurfaceDir = normalize(m_WorldPosition - u_cameraPosition);
        vec4 direction = reflect(eyeToSurfaceDir, worldNormal);

        gl_FragColor = textureCube(u_texture, direction);
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
    //initialize matrix;
    create_matrix(webgl, program);

    //create vertices and indices;
    const verticesAndIndices = cubeVertex();

    // initialize buffers;

    myInitBuffer(webgl, program, verticesAndIndices.vertices, 'a_Position', 3);
    myInitBuffer(webgl, program, verticesAndIndices.normals, 'a_Normal', 3);
    myInitBuffer(webgl, program, verticesAndIndices.triangleIndices, undefined, undefined, true);

    //create cube_map

    // create_cube_map(webgl);
    
    // start drawing objects
    
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
    webgl.drawElements(webgl.TRIANGLES, verticesAndIndices.len, webgl.UNSIGNED_SHORT, 0);

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
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    });

}

function create_matrix(gl, program) {
    const ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
    const CameraMatrix = gl.getUniformLocation(program, "u_cameraPosition");
    const WorldMatrix = gl.getUniformLocation(program, "u_WorldMatrix");

    const ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");

    // myInitMatrix(webgl, viewProjectionMatrix);
    const pM = new Matrix4();
    pM.setPerspective(30.0, 1.0, 1.0, 100.0)
    const cM = new Matrix4();
    cM.lookAt(1, 3, 5, 0, 0, 0, 0, 1, 0);
    const wM = new Matrix4();
    wM.setRotate(10, 0, 1, 0);

    const vM = new Matrix4();
    vM.setInVerseof(cM);
    vM.transpose();

    gl.uniformMatrix4fv(ProjectionMatrix, false, pM.elements);
    gl.uniformMatrix4fv(CameraMatrix, false, cM.elements);
    gl.uniformMatrix4fv(WorldMatrix, false, wM.elements);
    gl.uniformMatrix4fv(ViewMatrix, false, vM.elements)
}