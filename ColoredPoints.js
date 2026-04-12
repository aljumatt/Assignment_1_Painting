// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  //gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// global selection vars
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5
let g_selectedType = POINT;
let g_circleSegments = 10;

function addActionsForHtmlUI() {
  // connect color button events
  document.getElementById('red').onclick = function () {
    g_selectedColor = [1.0, 0.0, 0.0, 1.0];
    document.getElementById("redSlide").value = 100.0;
    document.getElementById("greenSlide").value = 0.0;
    document.getElementById("blueSlide").value = 0.0;
    updateColorDisplay();
  }
  document.getElementById('green').onclick = function () {
    g_selectedColor = [0.0, 1.0, 0.0, 1.0];
    document.getElementById("redSlide").value = 0.0;
    document.getElementById("greenSlide").value = 100.0;
    document.getElementById("blueSlide").value = 0.0;
    updateColorDisplay();
  }
  document.getElementById('blue').onclick = function () {
    g_selectedColor = [0.0, 0.0, 1.0, 1.0];
    document.getElementById("redSlide").value = 0.0;
    document.getElementById("greenSlide").value = 0.0;
    document.getElementById("blueSlide").value = 100.0;
    updateColorDisplay();
  }

  // clear button
  document.getElementById('clear').onclick = function () { g_shapesList = []; renderAllShapes(); }

  // shape buttons
  document.getElementById('pointButton').onclick = function () { g_selectedType = POINT }
  document.getElementById('triangleButton').onclick = function () { g_selectedType = TRIANGLE }
  document.getElementById('circleButton').onclick = function () { g_selectedType = CIRCLE }

  // connect color sliders
  document.getElementById('redSlide').addEventListener("input", function () {
    g_selectedColor[0] = this.value / 100;
    updateColorDisplay();
  })
  document.getElementById('greenSlide').addEventListener("input", function () {
    g_selectedColor[1] = this.value / 100;
    updateColorDisplay();
  })
  document.getElementById('blueSlide').addEventListener("input", function () {
    g_selectedColor[2] = this.value / 100;
    updateColorDisplay();
  })

  //connect size slider
  document.getElementById('sizeSlide').addEventListener("input", function () {
    g_selectedSize = this.value;
    document.getElementById("sizeText").textContent = this.value.toString();
  })

  //connect segments slider
  document.getElementById('segmentSlide').addEventListener("input", function () {
    g_circleSegments = this.value;
    document.getElementById("segmentsText").textContent = this.value.toString();
  })


  //connect draw picture button
  document.getElementById('drawPictureButton').onclick = function () { drawPicture() }
}

function updateColorDisplay() {
  let r = g_selectedColor[0]
  let g = g_selectedColor[1]
  let b = g_selectedColor[2]
  const label = document.getElementById('colorDisplay');

  // Set the background instead of text color
  label.style.backgroundColor = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;

  // Add some styling so it looks like a square
  label.style.display = "inline-block";
  label.style.width = "20px";
  label.style.height = "20px";
  label.textContent = ""; // Clear the emoji
}


function main() {

  // call setup funcitons
  setupWebGL(); // setup canvas and gl variables
  connectVariablesToGLSL(); //setup GLSL shader program and aconnect GLSL varaibles
  addActionsForHtmlUI(); // setup html buttons

  // makes it so that whenever the canvas is clicked it calls the click funciton
  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

//list of all shapes
var g_shapesList = [];

function click(ev) {

  // extract the click coordinates from event
  let [x, y] = convertCoordinatesEventToGL(ev);

  // creat new shape
  let point;

  // figure out type
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_circleSegments;
  }

  // apply all info to it
  point.position = [x, y]
  point.color = g_selectedColor.slice()
  point.size = g_selectedSize

  // add to shape list
  g_shapesList.push(point)

  // draw all the shapes that should be on the canvas
  renderAllShapes();
}


function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}


// handles the drawing of everything on the screen whenever it is updated
function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    //render each shape
    g_shapesList[i].render()
  }
}


// draws example picture
function drawPicture() {
  //clear
  g_shapesList = [];
  renderAllShapes();

  // feet
  drawTriangle([0.0, -0.4, -0.1, -0.5, 0.1, -0.5])
  drawTriangle([0.0, -0.4, 0.1, -0.4, 0.1, -0.5])
  drawTriangle([0.2, -0.5, 0.1, -0.4, 0.1, -0.5])

  // leg
  drawTriangle([0.0, -0.4, 0.1, -0.4, 0.0, -0.2])
  drawTriangle([0.1, -0.2, 0.1, -0.4, 0.0, -0.2])

  //tail
  drawTriangle([-0.3, -0.2, -0.3, -0.3, -0.6, -0.6])

  // toso bottom half
  drawTriangle([0.1, -0.2, -0.3, -0.3, -0.3, -0.2])
  drawTriangle([0.1, -0.2, 0.1, 0.0, 0.3, 0.0])
  drawTriangle([0.1, -0.2, 0.1, 0.0, -0.3, -0.2])
  drawTriangle([0.1, 0.0, -0.2, 0.0, -0.3, -0.2])

  //torso top half
  drawTriangle([-0.2, 0.0, 0.1, 0.0, 0.0, 0.2])
  drawTriangle([0.1, 0.0, 0.3, 0.0, 0.4, 0.2])
  drawTriangle([0.0, 0.2, 0.1, 0.0, 0.4, 0.2])

  //neck
  drawTriangle([0.0, 0.2, 0.4, 0.2, 0.1, 0.4])
  drawTriangle([0.4, 0.2, 0.1, 0.4, 0.3, 0.4])

  //head
  drawTriangle([0.1, 0.4, 0.3, 0.4, 0.2, 0.6])
  drawTriangle([0.3, 0.4, 0.2, 0.6, 0.5, 0.5])
}