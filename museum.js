// The LimiPlake Museum of Ideas — Babylon.js Version WITH REAL STAIRS
// Works instantly in Chrome, WASD controls, clickable floating links, real 3D stairs.

window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);

    // CAMERA — start OUTSIDE looking IN
    const camera = new BABYLON.UniversalCamera("camera",
      new BABYLON.Vector3(0, 2, -15),
      scene
    );
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.speed = 0.3;

    camera.keysUp.push(87, 38);   // W / ↑
    camera.keysDown.push(83, 40); // S / ↓
    camera.keysLeft.push(65, 37); // A / ←
    camera.keysRight.push(68, 39);// D / →

    // LIGHTING
    const hemiLight = new BABYLON.HemisphericLight("hemi",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemiLight.intensity = 0.9;

    const dirLight = new BABYLON.DirectionalLight("dir",
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

    // -------------------------------
    //   REAL STA
