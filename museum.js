// The LimiPlake Museum of Ideas — Babylon.js Version WITH REAL STAIRS

window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);

    // CAMERA — start OUTSIDE looking IN
    const camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, 2, -15),
      scene
    );
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.speed = 0.3;

    // WASD + Arrows
    camera.keysUp.push(87, 38);
    camera.keysDown.push(83, 40);
    camera.keysLeft.push(65, 37);
    camera.keysRight.push(68, 39);

    // LIGHTING
    const hemiLight = new BABYLON.HemisphericLight(
      "hemi",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemiLight.intensity = 0.9;

    const dirLight = new BABYLON.DirectionalLight(
      "dir",
      new BABYLON.Vector3(0, -1, 1),
      scene
    );
    dirLight.intensity = 0.7;

    // MATERIALS
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseTexture = new BABYLON.Texture("textures/wood_floor.jpg", scene);

    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseTexture = new BABYLON.Texture("textures/marble_wall.jpg", scene);

    const roadMat = new BABYLON.StandardMaterial("roadMat", scene);
    roadMat.diffuseTexture = new BABYLON.Texture("textures/road.jpg", scene);

    const stairMat = new BABYLON.StandardMaterial("stairMat", scene);
    stairMat.diffuseTexture = new BABYLON.Texture("textures/marble_wall.jpg", scene);

    // ---------------------------
    //  REAL STAIRS (visible steps)
    // ---------------------------
    function makeStairs(startPos, steps, width, stepH, stepD, material) {
      const stairGroup = new BABYLON.TransformNode("stairs", scene);

      for (let i = 0; i < steps; i++) {
        const step = BABYLON.MeshBuilder.CreateBox(
          "step_" + i,
          { width: width, height: Math.abs(stepH), depth: stepD },
          scene
        );

        step.position = new BABYLON.Vector3(
          startPos.x,
          startPos.y + i * stepH,
          startPos.z + i * stepD
        );
        step.material = material;
        step.parent = stairGroup;
      }

      return stairGroup;
    }

    // ---------------------------
    //  INVISIBLE RAMP (smooth walk)
    // ---------------------------
    function makeRamp(startPos, endPos, width) {
      const height = endPos.y - startPos.y;
      const depth = endPos.z - startPos.z;

      const ramp = BABYLON.MeshBuilder.CreateBox(
        "ramp",
        {
          width: width,
          height: Math.abs(height),
          depth: Math.abs(depth)
        },
        scene
      );

      ramp.position = new BABYLON.Vector3(
        startPos.x,
        startPos.y + height / 2,
        startPos.z + depth / 2
      );

      ramp.isVisible = false;
      ramp.checkCollisions = true;
      return ramp;
    }

    // ---------------------------
    //  ROOM WITH FLOATING LINK
    // ---------------------------
    function makeRoom(name, pos) {
      const room = BABYLON.MeshBuilder.CreateBox(
        name,
        { width: 10, height: 3, depth: 10 },
        scene
      );
      room.position = pos;
      room.material = wallMat;

      const floor = BABYLON.MeshBuilder.CreateGround(
        name + "_floor",
        { width: 10, height: 10 },
        scene
      );
      floor.position = new BABYLON.Vector3(pos.x, pos.y - 1.5, pos.z);
      floor.material = floorMat;
      floor.checkCollisions = true;

      // floating HTML link
      const link = document.createElement("a");
      link.textContent = name;
      link.href = "#";
      link.style.position = "absolute";
      link.style.color = "blue";
      link.style.font = "20px Arial";
      link.style.textDecoration = "underline";
      document.body.appendChild(link);

      // update link screen position every frame
      scene.registerBeforeRender(function () {
        const projected = BABYLON.Vector3.Project(
          pos,
          BABYLON.Matrix.Identity(),
          scene.getTransformMatrix(),
          camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );

        link.style.left = `${projected.x - 40}px`;
        link.style.top = `${projected.y}px`;

        const dist = BABYLON.Vector3.Distance(camera.position, pos);
        link.style.display = dist < 40 ? "block" : "none";
      });
    }
        // ---------------------------
    //  ROOMS (Z moved forward)
    // ---------------------------
    makeRoom("Color Forge",     new BABYLON.Vector3(-10, 0, 15));
    makeRoom("Melody Hall",     new BABYLON.Vector3( 10, 0, 15));
    makeRoom("Finding Lab",     new BABYLON.Vector3(  0,-3.5,27));
    makeRoom("Reakly Library",  new BABYLON.Vector3(-10, 3.5,39));
    makeRoom("Maker's Workshop",new BABYLON.Vector3( 10, 3.5,39));
    makeRoom("Prodder Display", new BABYLON.Vector3(  0, 3.5,51));

    // ---------------------------
    //  MAIN FLOOR + ROAD
    // ---------------------------
    const museumFloor = BABYLON.MeshBuilder.CreateGround(
      "mainFloor",
      { width: 60, height: 90 },
      scene
    );
    museumFloor.material = floorMat;
    museumFloor.checkCollisions = true;

    const road = BABYLON.MeshBuilder.CreateGround(
      "road",
      { width: 60, height: 200 },
      scene
    );
    road.position = new BABYLON.Vector3(0, -0.02, -120);
    road.material = roadMat;
    road.checkCollisions = true;

    // ---------------------------
    //  STAIRS UP
    // ---------------------------
    makeStairs(
      new BABYLON.Vector3(0, 0, 8),
      10,
      8,
      0.35,
      0.7,
      stairMat
    );

    makeRamp(
      new BABYLON.Vector3(0, 0, 8),
      new BABYLON.Vector3(0, 3.5, 15),
      6
    );

    // ---------------------------
    //  STAIRS DOWN
    // ---------------------------
    makeStairs(
      new BABYLON.Vector3(0, 0, 6),
      10,
      8,
      -0.35,
      0.7,
      stairMat
    );

    makeRamp(
      new BABYLON.Vector3(0, 0, 6),
      new BABYLON.Vector3(0, -3.5, 27),
      6
    );

    // ---------------------------
    //  INVISIBLE BARRIER BEFORE ROAD
    // ---------------------------
    const barrier = BABYLON.MeshBuilder.CreateBox(
      "barrier",
      { width: 60, height: 10, depth: 1 },
      scene
    );
    barrier.position = new BABYLON.Vector3(0, 1.5, -5);
    barrier.isVisible = false;
    barrier.checkCollisions = true;

    // COLLISIONS
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;

    console.log("🎨 LimiPlake Museum of Ideas (STAIRS VERSION) loaded");

    return scene;
  };

  const scene = createScene();

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
});
