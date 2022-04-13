// Import shaders
import { vertexShader } from "./shaders/vertex.js";   
import { fragmentShader } from "./shaders/fragment.js";

// Select canvas
const canvas = document.querySelector("canvas.webGL");

// Set dimensions
const size = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Create scene
const scene = new THREE.Scene();

// Create geomertry, material and mesh
const planeGeometry = new THREE.PlaneGeometry(10, 10, 100, 100);
const material = new THREE.ShaderMaterial({ 
  vertexShader, 
  fragmentShader,
  // add a uniform - this will be the same for all the vertices/pixels in the shader
  uniforms: {
    uTime: {value: 0},
  }
});

const planeMesh = new THREE.Mesh(planeGeometry, material);
scene.add(planeMesh);

// Create camera
var camera = new THREE.PerspectiveCamera(
  70,
  size.width / size.height,
  0.001,
  1000
);

camera.position.z = 15;
scene.add(camera);

// Controls
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(size.width, size.height);
renderer.setClearColor("#151B26", 1);

// Clock
const clock = new THREE.Clock();

// Frame function
const frame = () => {
  requestAnimationFrame(frame);

  // update the uTime uniform
  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime; 
  
  // Update controls
  controls.update();

  // render
  renderer.render(scene, camera);
};

frame();
