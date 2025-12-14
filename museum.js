// The LimiPlake Museum of Ideas — FINAL FIXED VERSION
// Babylon.js | Real floors | Proper walls | Separate stairs | Stable welcome text

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.92, 0.92, 0.92);

    /* ======================
       CAMERA
    ====================== */
    const camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, 2, -25),
      scene
    );
    camera.setTarget(new BABYLON.Vector3(0, 2, 10));
    camera.attachControl(canvas, true);
    camera.speed = 0.35;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    camera.checkCollisions = true;

    camera.keysUp.push(87, 38);
    camera.keysDown.push(83, 40);
    camera.keysLeft.push(65, 37);
    camera.keysRight.push(68, 39);

    scene.collisionsEnabled = true;

    /* ======================
       LIGHTS
    ====================== */
    const hemi = new BABYLON.HemisphericLight(
      "hemi",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemi.intensity = 0.8;

    const dir = new BABYLON.DirectionalLight(
      "dir",
      new BABYLON.Vector3(0, -1, 1),
      scene
    );
    dir.position = new BABYLON.Vector3(0, 20, -20);
    dir.intensity = 0.6;

    /* ======================
       MATERIALS
    ====================== */
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseTexture = new BABYLON.Texture("textures/wood_floor.jpg", scene);

    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseTexture = new BABYLON.Texture("textures/marble_wall.jpg", scene);

    const roadMat = new BABYLON.StandardMaterial("roadMat", scene);
    roadMat.diffuseTexture = new BABYLON.Texture("textures/road.jpg", scene);

    const stairMat = new BABYLON.StandardMaterial("stairMat", scene);
    stairMat.diffuseTexture = new BABYLON.Texture("textures/marble_wall.jpg", scene);

    /* ======================
       HELPERS
    ====================== */
    function wall(x, y, z, w, h, d) {
      const m = BABYLON.MeshBuilder.CreateBox("wall", { width: w, height: h, depth: d }, scene);
      m.position.set(x, y, z);
      m.material = wallMat;
      m.checkCollisions = true;
      return m;
    }

    function border(x, y, z, w, h, d) {
      const m = BABYLON.MeshBuilder.CreateBox("border", { width: w, height: h, depth: d }, scene);
      m.position.set(x, y, z);
      m.isVisible = false;
      m.checkCollisions = true;
      return m;
    }

    function stairs(start, steps, w, h, d) {
      for (let i = 0; i < steps; i++) {
        const s = BABYLON.MeshBuilder.CreateBox(
          "step",
          { width: w, height: Math.abs(h), depth: d },
          scene
        );
        s.position.set(start.x, start.y + i * h, start.z + i * d);
        s.material = stairMat;
        s.checkCollisions = true;
      }
    }

    function ramp(from, to, w) {
      const r = BABYLON.MeshBuilder.CreateBox(
        "ramp",
        { width: w, height: Math.abs(to.y - from.y), depth: Math.abs(to.z - from.z) },
        scene
      );
      r.position.set(from.x, (from.y + to.y) / 2, (from.z + to.z) / 2);
      r.isVisible = false;
      r.checkCollisions = true;
    }

    function room(name, pos) {
      const box = BABYLON.MeshBuilder.CreateBox(
        name,
        { width: 8, height: 3, depth: 8 },
        scene
      );
      box.position = pos;
      box.material = wallMat;
      box.checkCollisions = true;

      const floor = BABYLON.MeshBuilder.CreateGround(
        name + "_floor",
        { width: 8, height: 8 },
        scene
      );
      floor.position = new BABYLON.Vector3(pos.x, pos.y - 1.5, pos.z);
      floor.material = floorMat;
      floor.checkCollisions = true;

      const link = document.createElement("a");
      link.textContent = name;
      link.href = "#";
      link.style.position = "absolute";
      link.style.font = "18px Arial";
      link.style.color = "blue";
      document.body.appendChild(link);

      scene.onBeforeRenderObservable.add(() => {
        const p = BABYLON.Vector3.Project(
          pos,
          BABYLON.Matrix.Identity(),
          scene.getTransformMatrix(),
          camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );
        link.style.left = `${p.x - 40}px`;
        link.style.top = `${p.y}px`;
        link.style.display =
          BABYLON.Vector3.Distance(camera.position, pos) < 45 ? "block" : "none";
      });
    }

    /* ======================
       FLOORS
    ====================== */
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 40, height: 60 }, scene);
    ground.position.z = 25;
    ground.material = floorMat;
    ground.checkCollisions = true;

    const upL = BABYLON.MeshBuilder.CreateGround("upL", { width: 12, height: 20 }, scene);
    upL.position.set(-10, 3.5, 45);
    upL.material = floorMat;
    upL.checkCollisions = true;

    const upR = BABYLON.MeshBuilder.CreateGround("upR", { width: 12, height: 20 }, scene);
    upR.position.set(10, 3.5, 45);
    upR.material = floorMat;
    upR.checkCollisions = true;

    const down = BABYLON.MeshBuilder.CreateGround("down", { width: 30, height: 20 }, scene);
    down.position.set(0, -3.5, 45);
    down.material = floorMat;
    down.checkCollisions = true;

    /* ======================
       WALLS & HALLWAY
    ====================== */
    wall(-20, 1.5, 25, 1, 3, 60);
    wall(20, 1.5, 25, 1, 3, 60);
    wall(0, 1.5, 55, 40, 3, 1);

    wall(-12, 1.5, -10, 16, 3, 1);
    wall(12, 1.5, -10, 16, 3, 1);

    /* ======================
       ROAD + BORDERS
    ====================== */
    const road = BABYLON.MeshBuilder.CreateGround("road", { width: 40, height: 120 }, scene);
    road.position.z = -60;
    road.material = roadMat;
    road.checkCollisions = true;

    border(-20, 2, -60, 1, 4, 120);
    border(20, 2, -60, 1, 4, 120);
    border(0, 2, -120, 40, 4, 1);
    border(0, 2, 0, 40, 4, 1);

    /* ======================
       STAIRS
    ====================== */
    stairs(new BABYLON.Vector3(-8, 0, 25), 10, 4, 0.35, 0.7);
    ramp(new BABYLON.Vector3(-8, 0, 25), new BABYLON.Vector3(-8, 3.5, 32), 3);

    stairs(new BABYLON.Vector3(8, 0, 25), 10, 4, -0.35, 0.7);
    ramp(new BABYLON.Vector3(8, 0, 25), new BABYLON.Vector3(8, -3.5, 32), 3);

    /* ======================
       ROOMS
    ====================== */
    room("Color Forge", new BABYLON.Vector3(-10, 0, 45));
    room("Melody Hall", new BABYLON.Vector3(10, 0, 45));
    room("Finding Lab", new BABYLON.Vector3(0, -3.5, 55));
    room("Reakly Library", new BABYLON.Vector3(-10, 3.5, 55));
    room("Maker's Workshop", new BABYLON.Vector3(10, 3.5, 55));
    room("Prodder Display", new BABYLON.Vector3(0, 3.5, 65));

    /* ======================
       WELCOME ARCH (STABLE TEXT)
    ====================== */
    const arch = BABYLON.MeshBuilder.CreateTorus(
      "arch",
      { diameter: 14, thickness: 1.4, tessellation: 60 },
      scene
    );
    arch.rotation.x = Math.PI / 2;
    arch.position.set(0, 5, -5);

    const archMat = new BABYLON.StandardMaterial("archMat", scene);
    archMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0.2);
    arch.material = archMat;

    const sign = BABYLON.MeshBuilder.CreateBox(
      "sign",
      { width: 14, height: 2.5, depth: 0.2 },
      scene
    );
    sign.position.set(0, 3, -2);
    sign.rotation.y = Math.PI;

    const gui = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(sign);
    const txt = new BABYLON.GUI.TextBlock();
    txt.text = "THE LIMIPLAKE MUSEUM OF IDEAS";
    txt.fontSize = 48;
    txt.color = "white";
    txt.outlineWidth = 4;
    txt.outlineColor = "black";
    gui.addControl(txt);

    console.log("Museum fully loaded.");
    return scene;
  };

  const scene = createScene();
  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
});
