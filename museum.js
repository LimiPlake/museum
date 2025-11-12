// museum.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r152/three.module.min.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;
let objects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const plaqueDiv = document.getElementById('plaque');

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, renderer.domElement);

  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');
  // Immediately engage pointer lock on click
  document.body.addEventListener('click', () => {
    controls.lock();
  });

  controls.addEventListener('lock', function () {});
  controls.addEventListener('unlock', function () {});

  scene.add(controls.getObject());

  const ambient = new THREE.HemisphereLight(0xffffff, 0x444444);
  ambient.position.set(0, 20, 0);
  scene.add(ambient);

  const floorTexture = new THREE.TextureLoader().load('textures/wood_floor.jpg');
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4,4);
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
  floor.rotation.x = -Math.PI/2;
  scene.add(floor);

  const wallTexture = new THREE.TextureLoader().load('textures/marble_wall.jpg');
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture });

  // Create walls & rooms logic
  function makeRoom(width, height, depth, position) {
    const room = new THREE.Group();
    const wallGeoV = new THREE.PlaneGeometry(depth, height);
    const wallGeoH = new THREE.PlaneGeometry(width, height);

    const wall1 = new THREE.Mesh(wallGeoV, wallMat);
    wall1.position.set( position.x + width/2, position.y + height/2, position.z );
    wall1.rotation.y = -Math.PI/2;
    room.add(wall1);

    const wall2 = new THREE.Mesh(wallGeoV, wallMat);
    wall2.position.set( position.x - width/2, position.y + height/2, position.z );
    wall2.rotation.y = Math.PI/2;
    room.add(wall2);

    const wall3 = new THREE.Mesh(wallGeoH, wallMat);
    wall3.position.set( position.x, position.y + height/2, position.z + depth/2 );
    wall3.rotation.y = 0;
    room.add(wall3);

    const wall4 = new THREE.Mesh(wallGeoH, wallMat);
    wall4.position.set( position.x, position.y + height/2, position.z - depth/2 );
    wall4.rotation.y = Math.PI;
    room.add(wall4);

    room.position.set(position.x, position.y, position.z);
    scene.add(room);
    objects.push(room);
  }

  // Layout your museum (floor plan)
  makeRoom(10, 3, 10, {x: -10, y: 0, z: 0}); // Color Forge (left)
  makeRoom(10, 3, 10, {x: +10, y: 0, z: 0}); // Melody Hall (right)
  makeRoom(10, 3, 10, {x: 0, y: -3.5, z: +12}, ); // Finding Lab (downstairs)
  makeRoom(10, 3, 10, {x: 0, y: +3.5, z: +12}); // Upstairs room corridor origin
  makeRoom(10, 3, 10, {x: -10, y: +3.5, z: +24}); // Reakly Library (upper left)
  makeRoom(10, 3, 10, {x: +10, y: +3.5, z: +24}); // Maker’s Workshop (upper right)
  makeRoom(10, 3, 10, {x: 0, y: +3.5, z: +36}); // Prodder Display (straight ahead upstairs)

  // Add clickable items in Prodder Display
  const itemsInfo = [
    { name: 'Unlimis', pos: { x: 0, y:1, z: +36 + 1 } },
    { name: 'Podcard', pos: { x: -2, y:1, z: +36 - 1 } },
    { name: 'USBD Device', pos: { x: +2, y:1, z: +36 - 1 } }
  ];

  const clickMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  itemsInfo.forEach(info => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), clickMaterial);
    mesh.position.set(info.pos.x, info.pos.y, info.pos.z);
    mesh.name = info.name;
    scene.add(mesh);
    objects.push(mesh);
  });

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onMouseClick);
}

function onWindowResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const move = { forward:false, backward:false, left:false, right:false };

function onKeyDown(event) {
  switch (event.code) {
    case 'ArrowUp': case 'KeyW': move.forward = true; break;
    case 'ArrowDown': case 'KeyS': move.backward = true; break;
    case 'ArrowLeft': case 'KeyA': move.left = true; break;
    case 'ArrowRight': case 'KeyD': move.right = true; break;
  }
}

document.addEventListener('keyup', function(event){
  switch (event.code) {
    case 'ArrowUp': case 'KeyW': move.forward = false; break;
    case 'ArrowDown': case 'KeyS': move.backward = false; break;
    case 'ArrowLeft': case 'KeyA': move.left = false; break;
    case 'ArrowRight': case 'KeyD': move.right = false; break;
  }
});

function onMouseClick(event) {
  if (!controls.isLocked) return;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects, true);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (obj.name) {
      showPlaque(obj.name);
    }
  }
}

function showPlaque(text) {
  plaqueDiv.textContent = text;
  plaqueDiv.style.display = 'block';
  setTimeout(()=> plaqueDiv.style.display = 'none', 2000);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = 0.1;
  if (controls.isLocked) {
    const direction = new THREE.Vector3();
    if (move.forward) direction.z -= 1;
    if (move.backward) direction.z += 1;
    if (move.left) direction.x -= 1;
    if (move.right) direction.x += 1;
    direction.applyQuaternion(camera.quaternion);
    controls.getObject().position.addScaledVector(direction, delta);
  }

  raycaster.setFromCamera(mouse, camera);
  renderer.render(scene, camera);
}
