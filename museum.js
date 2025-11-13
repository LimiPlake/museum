// LimiPlake Museum of Ideas 3D Walkthrough
// Made for Anhad :) — Classic museum layout with floating links

let scene, camera, renderer, controls;
const move = { forward:false, backward:false, left:false, right:false };
const velocity = 0.15;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  // CAMERA
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.6, 0); // starting height ~ eye level

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // CONTROLS (Pointer Lock)
  controls = new THREE.PointerLockControls(camera, renderer.domElement);
  document.addEventListener('click', () => controls.lock());
  scene.add(controls.getObject());

  // LIGHTING
  const ambient = new THREE.HemisphereLight(0xffffff, 0x777777, 1);
  scene.add(ambient);

  const pointLight = new THREE.PointLight(0xfff8e1, 0.6);
  pointLight.position.set(0, 5, 0);
  scene.add(pointLight);

  // LOAD TEXTURES
  const loader = new THREE.TextureLoader();
  const floorTex = loader.load('textures/wood_floor.jpg');
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(4,4);

  const wallTex = loader.load('textures/marble_wall.jpg');
  const roadTex = loader.load('textures/road.jpg');
  roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.repeat.set(10,1);

  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex });
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex });
  const roadMat = new THREE.MeshStandardMaterial({ map: roadTex });

  // FUNCTION: Create an empty room box with texture and link
  function makeRoom(name, x, y, z) {
    const group = new THREE.Group();

    // Room floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10,10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);

    // Four walls
    const wallGeo = new THREE.PlaneGeometry(10,3);
    const front = new THREE.Mesh(wallGeo, wallMat);
    front.position.set(0,1.5,-5);
    group.add(front);

    const back = front.clone();
    back.position.set(0,1.5,5);
    back.rotation.y = Math.PI;
    group.add(back);

    const left = new THREE.Mesh(wallGeo, wallMat);
    left.position.set(-5,1.5,0);
    left.rotation.y = Math.PI/2;
    group.add(left);

    const right = left.clone();
    right.position.set(5,1.5,0);
    right.rotation.y = -Math.PI/2;
    group.add(right);

    // Floating clickable link (just HTML)
    const link = document.createElement('a');
    link.textContent = name;
    link.href = "#";
    link.style.position = 'absolute';
    link.style.color = 'blue';
    link.style.font = '20px Arial';
    link.style.textDecoration = 'underline';
    link.style.pointerEvents = 'auto';
    document.body.appendChild(link);

    group.userData = { link, pos: new THREE.Vector3(x, y + 1.5, z) };

    group.position.set(x, y, z);
    scene.add(group);
    return group;
  }

  // ROOMS
  const rooms = [
    makeRoom("Color Forge", -10, 0, 0),
    makeRoom("Melody Hall", 10, 0, 0),
    makeRoom("Finding Lab", 0, -3.5, 12),
    makeRoom("Reakly Library", -10, 3.5, 24),
    makeRoom("Maker's Workshop", 10, 3.5, 24),
    makeRoom("Prodder Display", 0, 3.5, 36)
  ];

  // MAIN FLOOR
  const museumFloor = new THREE.Mesh(new THREE.PlaneGeometry(50, 80), floorMat);
  museumFloor.rotation.x = -Math.PI/2;
  museumFloor.position.y = -0.01;
  scene.add(museumFloor);

  // ROAD OUTSIDE (long but blocked)
  const road = new THREE.Mesh(new THREE.PlaneGeometry(50, 200), roadMat);
  road.rotation.x = -Math.PI/2;
  road.position.set(0, -0.02, -110);
  scene.add(road);

  // INVISIBLE WALL at entrance (so you can't walk onto road)
  const wallGeo = new THREE.BoxGeometry(50, 10, 1);
  const invisibleMat = new THREE.MeshBasicMaterial({ visible: false });
  const barrier = new THREE.Mesh(wallGeo, invisibleMat);
  barrier.position.set(0, 1.5, -5);
  scene.add(barrier);

  // MOVEMENT EVENTS
  document.addEventListener('keydown', (e)=>{
    switch(e.code){
      case 'KeyW': case 'ArrowUp': move.forward=true; break;
      case 'KeyS': case 'ArrowDown': move.backward=true; break;
      case 'KeyA': case 'ArrowLeft': move.left=true; break;
      case 'KeyD': case 'ArrowRight': move.right=true; break;
    }
  });
  document.addEventListener('keyup', (e)=>{
    switch(e.code){
      case 'KeyW': case 'ArrowUp': move.forward=false; break;
      case 'KeyS': case 'ArrowDown': move.backward=false; break;
      case 'KeyA': case 'ArrowLeft': move.left=false; break;
      case 'KeyD': case 'ArrowRight': move.right=false; break;
    }
  });

  // UPDATE LINKS POSITION on screen each frame
  function updateLinks() {
    rooms.forEach(r=>{
      const screenPos = r.userData.pos.clone();
      screenPos.project(camera);
      const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
      r.userData.link.style.left = `${x - 40}px`;
      r.userData.link.style.top = `${y}px`;

      // hide if behind camera
      const dist = camera.position.distanceTo(r.userData.pos);
      r.userData.link.style.display = dist < 25 ? 'block' : 'none';
    });
  }

  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Save function for later animation loop
  scene.userData.updateLinks = updateLinks;
}

function animate() {
  requestAnimationFrame(animate);

  // Handle movement
  if (controls.isLocked) {
    const dir = new THREE.Vector3();
    if (move.forward) dir.z -= 1;
    if (move.backward) dir.z += 1;
    if (move.left) dir.x -= 1;
    if (move.right) dir.x += 1;
    dir.normalize();
    dir.applyQuaternion(camera.quaternion);
    controls.getObject().position.addScaledVector(dir, velocity);
  }

  // Keep camera above floor
  controls.getObject().position.y = 1.6;

  // Update link positions
  if (scene.userData.updateLinks) scene.userData.updateLinks();

  renderer.render(scene, camera);
}
