// Babylon.js version of The LimiPlake Museum of Ideas
// Lightweight, no import issues, fully browser-ready

window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);

    // CAMERA
    const camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 2, 15), scene);
    camera.attachControl(canvas, true);
    camera.speed = 0.3;
    camera.keysUp.push(87, 38);   // W / ↑
    camera.keysDown.push(83, 40); // S / ↓
    camera.keysLeft.push(65, 37); // A / ←
    camera.keysRight.push(68, 39);// D / →

    // LIGHTING
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.9;
    const dirLight = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(0, -1, 1), scene);
    dirLight.intensity = 0.7;

    // MATERIALS
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseTexture = new BABYLON.Texture("textures/wood_floor.jpg", scene);

    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseTexture = new BABYLON.Texture("textures/marble_wall.jpg", scene);

    const roadMat = new BABYLON.StandardMaterial("roadMat", scene);
    roadMat.diffuseTexture = new BABYLON.Texture("textures/road.jpg", scene);

    // HELPER: make a textured room
    function makeRoom(name, pos) {
      const room = BABYLON.MeshBuilder.CreateBox(name, { width: 10, height: 3, depth: 10 }, scene);
      room.position = pos;
      room.material = wallMat;

      // Add floor separately (for texture)
      const floor = BABYLON.MeshBuilder.CreateGround(`${name}_floor`, { width: 10, height: 10 }, scene);
      floor.position = new BABYLON.Vector3(pos.x, pos.y - 1.5, pos.z);
      floor.material = floorMat;

      // Floating link (HTML element)
      const link = document.createElement("a");
      link.textContent = name;
      link.href = "#";
      link.style.position = "absolute";
      link.style.color = "blue";
      link.style.font = "20px Arial";
      link.style.textDecoration = "underline";
      document.body.appendChild(link);

      // Update screen position each frame
      scene.registerBeforeRender(() => {
        const projected = BABYLON.Vector3.Project(
          pos,
          BABYLON.Matrix.Identity(),
          scene.getTransformMatrix(),
          camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );
        link.style.left = `${projected.x - 40}px`;
        link.style.top = `${projected.y}px`;
        const dist = BABYLON.Vector3.Distance(camera.position, pos);
        link.style.display = dist < 35 ? "block" : "none";
      });
    }

    // ROOMS
    makeRoom("Color Forge", new BABYLON.Vector3(-10, 0, 0));
    makeRoom("Melody Hall", new BABYLON.Vector3(10, 0, 0));
    makeRoom("Finding Lab", new BABYLON.Vector3(0, -3.5, 12));
    makeRoom("Reakly Library", new BABYLON.Vector3(-10, 3.5, 24));
    makeRoom("Maker's Workshop", new BABYLON.Vector3(10, 3.5, 24));
    makeRoom("Prodder Display", new BABYLON.Vector3(0, 3.5, 36));

    // MUSEUM FLOOR
    const museumFloor = BABYLON.MeshBuilder.CreateGround("mainFloor", { width: 60, height: 80 }, scene);
    museumFloor.material = floorMat;

    // ROAD OUTSIDE (long but blocked)
    const road = BABYLON.MeshBuilder.CreateGround("road", { width: 60, height: 200 }, scene);
    road.position = new BABYLON.Vector3(0, -0.01, -120);
    road.material = roadMat;

    // INVISIBLE WALL (barrier)
    const barrier = BABYLON.MeshBuilder.CreateBox("barrier", { width: 60, height: 10, depth: 1 }, scene);
    barrier.position = new BABYLON.Vector3(0, 1.5, -5);
    barrier.isVisible = false;
    barrier.checkCollisions = true;

    // Enable collisions for camera + floor
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    museumFloor.checkCollisions = true;
    road.checkCollisions = true;

    return scene;
  };

  const scene = createScene();

  // Run loop
  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
});
