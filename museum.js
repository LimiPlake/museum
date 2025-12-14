// LimiPlake Museum of Ideas — ARCHITECTED VERSION
// Real building, real floors, real stairs, ceiling, hallway, ghost mode

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.95, 0.95, 0.95);

    /* ======================
       CAMERA
    ====================== */
    const camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, 2, -18),
      scene
    );
    camera.attachControl(canvas, true);
    camera.speed = 0.35;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    camera.checkCollisions = true;
    scene.collisionsEnabled = true;

    camera.keysUp.push(87, 38);
    camera.keysDown.push(83, 40);
    camera.keysLeft.push(65, 37);
    camera.keysRight.push(68, 39);

    /* ======================
       LIGHTS
    ====================== */
    new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
    const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(0, -1, 1), scene);
    dir.position.set(0, 20, -20);

    /* ======================
       MATERIALS
    ====================== */
    const floorMat = new BABYLON.StandardMaterial("floor", scene);
    floorMat.diffuseTexture = new BABYLON.Texture("textures/wood_floor.jpg", scene);

    const wallMat = new BABYLON.StandardMaterial("wall", scene);
    wallMat.diffuseTexture = new BABYLON.Texture("textures/marble_wall.jpg", scene);

    const ceilingMat = wallMat;
    const stairMat = wallMat;

    /* ======================
       BUILDING SHELL
    ====================== */
    function solidBox(name, w, h, d, x, y, z, mat) {
      const m = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
      m.position.set(x, y, z);
      m.material = mat;
      m.checkCollisions = true;
      return m;
    }

    // Outer walls
    solidBox("wallL", 1, 6, 40, -15, 3, 20, wallMat);
    solidBox("wallR", 1, 6, 40, 15, 3, 20, wallMat);
    solidBox("wallBack", 30, 6, 1, 0, 3, 40, wallMat);

    // Entrance walls (door gap)
    solidBox("wallFL", 10, 6, 1, -10, 3, 0, wallMat);
    solidBox("wallFR", 10, 6, 1, 10, 3, 0, wallMat);

    // Ceiling
    solidBox("ceiling", 30, 1, 40, 0, 6.5, 20, ceilingMat);

    /* ======================
       FLOORS WITH STAIR HOLE
    ====================== */

    // Ground floor (two halves, hole in middle)
    const gfL = BABYLON.MeshBuilder.CreateGround("gfL", { width: 12, height: 40 }, scene);
    gfL.position.set(-6, 0, 20);
    gfL.material = floorMat;
    gfL.checkCollisions = true;

    const gfR = BABYLON.MeshBuilder.CreateGround("gfR", { width: 12, height: 40 }, scene);
    gfR.position.set(6, 0, 20);
    gfR.material = floorMat;
    gfR.checkCollisions = true;

    // Downstairs floor
    const down = BABYLON.MeshBuilder.CreateGround("down", { width: 26, height: 30 }, scene);
    down.position.set(0, -3.5, 30);
    down.material = floorMat;
    down.checkCollisions = true;

    /* ======================
       STAIRS (IN STAIRWELL)
    ====================== */
    function stairs(x, startY, startZ, dir) {
      for (let i = 0; i < 10; i++) {
        const s = BABYLON.MeshBuilder.CreateBox(
          "step",
          { width: 4, height: 0.35, depth: 0.7 },
          scene
        );
        s.position.set(x, startY + i * dir * 0.35, startZ + i * 0.7);
        s.material = stairMat;
        s.checkCollisions = true;
      }
    }

    // Downstairs stairs (center)
    stairs(0, 0, 15, -1);

    /* ======================
       HALLWAY WALLS
    ====================== */
    solidBox("hallL", 1, 3, 20, -5, 1.5, 30, wallMat);
    solidBox("hallR", 1, 3, 20, 5, 1.5, 30, wallMat);

    /* ======================
       ROOMS OFF HALLWAY
    ====================== */
    function room(name, x, y, z) {
      solidBox(name, 6, 3, 6, x, y + 1.5, z, wallMat);
      const f = BABYLON.MeshBuilder.CreateGround(name + "_f", { width: 6, height: 6 }, scene);
      f.position.set(x, y, z);
      f.material = floorMat;
      f.checkCollisions = true;

      const link = document.createElement("a");
      link.textContent = name;
      link.style.position = "absolute";
      link.style.color = "blue";
      document.body.appendChild(link);

      scene.onBeforeRenderObservable.add(() => {
        const p = BABYLON.Vector3.Project(
          new BABYLON.Vector3(x, y + 1.5, z),
          BABYLON.Matrix.Identity(),
          scene.getTransformMatrix(),
          camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );
        link.style.left = `${p.x - 40}px`;
        link.style.top = `${p.y}px`;
      });
    }

    room("Color Forge", -9, 0, 28);
    room("Melody Hall", 9, 0, 28);
    room("Finding Lab", 0, -3.5, 35);

    /* ======================
       WELCOME ARCH + BIG TEXT
    ====================== */
    const arch = BABYLON.MeshBuilder.CreateTorus(
      "arch",
      { diameter: 14, thickness: 1.5 },
      scene
    );
    arch.rotation.x = Math.PI / 2;
    arch.position.set(0, 5, -2);

    const sign = BABYLON.MeshBuilder.CreateBox(
      "sign",
      { width: 18, height: 3, depth: 0.3 },
      scene
    );
    sign.position.set(0, 3.2, -1);
    sign.rotation.y = Math.PI;

    const gui = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(sign);
    const txt = new BABYLON.GUI.TextBlock();
    txt.text = "THE LIMIPLAKE MUSEUM OF IDEAS";
    txt.fontSize = 64;
    txt.color = "white";
    txt.outlineWidth = 6;
    txt.outlineColor = "black";
    gui.addControl(txt);

    /* ======================
       GHOST MODE BUTTON
    ====================== */
    let ghost = false;
    const btn = document.createElement("button");
    btn.textContent = "Ghost Mode: OFF";
    btn.style.position = "absolute";
    btn.style.top = "15px";
    btn.style.left = "15px";
    document.body.appendChild(btn);

    btn.onclick = () => {
      ghost = !ghost;
      camera.checkCollisions = !ghost;
      scene.meshes.forEach(m => (m.checkCollisions = !ghost));
      btn.textContent = ghost ? "Ghost Mode: ON 👻" : "Ghost Mode: OFF";
    };

    return scene;
  };

  const scene = createScene();
  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
});
