const THREE = require('three');
import GLTFLoader from 'three-gltf-loader';

function WebGLThreeJS(dataSetObjArr){

  'use strict';

  let scene,
      legoObj,
      camera,
      renderer,
      hemisphereLight,
      ambientLight,
      directionalLight,
      pointLight,
      spotLight,
      spotLight2,
      spotLight3,
      obj,
      gltf,
      gltfStore = {},
      action,
      rayCast,
      mouse,
      rayIntersects,
      dataSetObj;

  const gltfLoader = new GLTFLoader();
  const mixers = [];
  const clock = new THREE.Clock();
  const buttonObey = document.getElementById('obey');
  const clonesAmount = 35;
  const toBeCloned = [
    'Flamingo',
    'Stork',
    'Parrot'
  ];
  const dataSet = {
    'Wuerfel_2': {
      'path': '/dist/glb/Wuerfel_Posemoprh-02.glb',
      'objName': 'Cube',
      'rotation': true,
      'position': new THREE.Vector3( 0, 0, 0 ),
      'loadGltfPromise': null,
      'loadObjPromise': null,
      'action': null,
      'gltfStore': {},
    },
    'Flamingo': {
      'path': '/dist/glb/Flamingo.glb',
      'objName': 'mesh_0',
      'rotation': false,
      'position': new THREE.Vector3( 140, -30, 150 ),
      'loadGltfPromise': null,
      'loadObjPromise': null,
      'action': null,
      'gltfStore': {},
    },
    'Stork': {
      'path': '/dist/glb/Stork.glb',
      'objName': 'mesh_0',
      'rotation': false,
      'position': new THREE.Vector3( 33, 150, -240 ),
      'loadGltfPromise': null,
      'loadObjPromise': null,
      'action': null,
      'gltfStore': {},
    },
    'Parrot': {
      'path': '/dist/glb/Parrot.glb',
      'objName': 'mesh_0',
      'rotation': false,
      'position': new THREE.Vector3( -160,10, 100 ),
      'loadGltfPromise': null,
      'loadObjPromise': null,
      'action': null,
      'gltfStore': {},
    }
  };

  function init(){
    setVars();
    bindEvents();
    addObj();
    createRaycaster();
    mainLoop();
  }

  function setVars(){

    scene = new THREE.Scene();

    dataSetObjArr.forEach(function(dataSetStr){
      dataSetObj = dataSetStr;
      dataSet[dataSetStr].loadGltfPromise = loadGltf(dataSetStr);
      dataSet[dataSetStr].loadObjPromise = loadObj(dataSetStr);
    });

    setCamera();
    setLights();
    setRenderer();

  }

  function setRenderer(){
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio( window.devicePixelRatio );
    // renderer.gammaFactor = 1;
    // renderer.gammaOutput = true;
    // renderer.physicallyCorrectLights = true;
    document.body.appendChild(renderer.domElement);
  }

  function setCamera(){
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0,0,800);
    camera.lookAt( 0,0,0 );
  }

  function setLights(){
    // HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )
    hemisphereLight = new THREE.HemisphereLight(0xfff5fc, 0x46002e, 1);

    // AmbientLight( color : Integer, intensity : Float )
    ambientLight = new THREE.AmbientLight(0x000000, 0.005);

    // DirectionalLight( color : Integer, intensity : Float )
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(0, 1200, 0);
    directionalLight.target.position.set(0, 0, 0);

    // PointLight( color : Integer, intensity : Float, distance : Number, decay : Float )
    pointLight = new THREE.PointLight( 0xff78cb, 0.01 );
  	pointLight.position.set(-500, 100, 200);

    // SpotLight( color : Integer, intensity : Float, distance : Float, angle : Radians, penumbra : Float, decay : Float )
    spotLight = new THREE.SpotLight(0x920060, 0.05, 0, 1, 1, 1);
    spotLight.position.set(500,0,200);

    scene.add(pointLight, spotLight, ambientLight);
  }

  function bindEvents(){
    window.addEventListener('resize', resizeRenderer);
    buttonObey.addEventListener('click', onButtonClickForwards);
    document.addEventListener('click', onClickHandler, false);
    document.addEventListener('touchstart', onTouchHandler, false);
  }

  function onTouchHandler(e){
    var xClicked = e.clientX,
        yClicked = e.clientY;

    mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
    mouse.z = 1;

    rayCast.setFromCamera(mouse, camera);

    rayIntersects = rayCast.intersectObjects(scene.children);

    if(rayIntersects.length){
      fireClick(buttonObey);
    }
  }

  function onClickHandler(e){
    var xClicked = e.clientX,
        yClicked = e.clientY;

    mouse.x = (xClicked / window.innerWidth) * 2 - 1;
    mouse.y = -(yClicked / window.innerHeight) * 2 + 1;
    mouse.z = 1;

    rayCast.setFromCamera(mouse, camera);

    rayIntersects = rayCast.intersectObjects(scene.children);

    if(rayIntersects.length){
      fireClick(buttonObey);
    }
  }

  function fireClick(node){
    if ( document.createEvent ) {
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, false);
        node.dispatchEvent(evt);
    } else if( document.createEventObject ) {
        node.fireEvent('onclick') ;
    } else if (typeof node.onclick == 'function' ) {
        node.onclick();
    }
  }

  function onButtonClickForwards(){
    console.log(dataSet);
    const keys = Object.keys(dataSet);
    for (const key of keys) {
      if(dataSet[key].action){
        dataSet[key].action.timeScale = 1;
        dataSet[key].action.clampWhenFinished = true;
        dataSet[key].action.paused = false;
        dataSet[key].action.play();
      }
    }
    buttonObey.innerHTML = 'backwards!';
    buttonObey.removeEventListener('click', onButtonClickForwards);
    buttonObey.addEventListener('click', onButtonClickBackwards);
  }

  function onButtonClickBackwards(){
    const keys = Object.keys(dataSet);
    for (const key of keys) {
      if(dataSet[key].action){
        dataSet[key].action.timeScale = -1;
        dataSet[key].action.paused = false;
        dataSet[key].action.play();
      }
    }
    buttonObey.innerHTML = 'forwards!';
    buttonObey.removeEventListener('click', onButtonClickBackwards);
    buttonObey.addEventListener('click', onButtonClickForwards);
  }

  function resizeRenderer(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function loadGltf(dataSetStr){

    let progress = console.log;

    return new Promise(function( resolve, reject ){

      gltfLoader.load(
        dataSet[dataSetStr].path,
        function ( gltf ) {

          dataSet[dataSetStr].gltfStore.animations =  gltf.animations;

          for (var i = 0; i < clonesAmount; i++) {
            if(toBeCloned.includes(dataSetStr)){
              dataSet[dataSetStr+i] = {};
              dataSet[dataSetStr+i].gltfStore = {};
              dataSet[dataSetStr+i].gltfStore.animations =  gltf.animations;
            }
          }

          // gltf.scene.traverse(function(child){
          //   console.log(child);
          // });

          resolve(gltf);

      	},
      	// called while loading is progressing
      	function ( xhr ) {

      		console.log( dataSetStr + ' ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      	},
      	// called when loading has errors
      	function ( error ) {

      		console.log( 'An error happened' );
          console.log(error);
          reject();

      	}
      );

    });

  }

  function loadObj(dataSetStr){

    let progress = console.log;

    return new Promise(function( resolve, reject ){

      dataSet[dataSetStr].loadGltfPromise.then(gltf => {
        gltf = gltf;
        const obj = gltf.scene.getObjectByName(dataSet[dataSetStr].objName);
        resolve(obj);
      });

    });

  }

  function addObj(){

    dataSetObjArr.forEach(function(dataSetStr){

      dataSet[dataSetStr].loadObjPromise.then(obj => {

        const animation = dataSet[dataSetStr].gltfStore.animations[0];

        const mixer = new THREE.AnimationMixer(obj);
        mixers.push(mixer);

        dataSet[dataSetStr].action = mixer.clipAction(animation);
        dataSet[dataSetStr].action.setLoop( THREE.LoopOnce );

        obj.material.color.setRGB(150,150,150);
        obj.position.copy(dataSet[dataSetStr].position);
        scene.add(obj);

        for (var i = 0; i < clonesAmount; i++) {
          if(toBeCloned.includes(dataSetStr)){
            const clone = obj.clone();
            clone.position.set((Math.random() - 0.5)*-1500, (Math.random() - 0.5)*-1500, (Math.random() - 1)*3000);
            dataSet[dataSetStr+i].gltfStore.speedFactor = (Math.random() - 0.5) / 2;
            const animation = dataSet[dataSetStr+i].gltfStore.animations[0];
            const mixer = new THREE.AnimationMixer(clone);
            mixers.push(mixer);
            dataSet[dataSetStr+i].action = mixer.clipAction(animation);
            dataSet[dataSetStr+i].action.fadeIn(Math.random() * 4);
            dataSet[dataSetStr+i].action.timeScale = dataSet[dataSetStr+i].gltfStore.speedFactor + 0.8;
            dataSet[dataSetStr+i].action.play();
            dataSet[dataSetStr+i].obj = clone;
            scene.add(clone);
          }
        }

        // const btn = document.createElement("BUTTON");   // Create a <button> element
        // btn.innerHTML = dataSetStr;                   // Insert text
        // document.body.appendChild(btn);

      });
    });

  }

  function createRaycaster(){
    rayCast = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mouse.x = mouse.y = -1;
  }

  function update(){

    const delta = clock.getDelta();

    mixers.forEach( ( mixer ) => { mixer.update( delta ); } );

  }

  function mainLoop(){

    for (const key of Object.keys(dataSet)) {
      if(dataSet[key].rotation){
        dataSet[key].loadObjPromise.then(obj => {
          obj.rotation.x += 0.0025;
          obj.rotation.y += 0.005;
          obj.rotation.z -= 0.001;
        });
      }
    }

    toBeCloned.forEach(function(key){
      dataSet[key].loadObjPromise.then(obj => {
        for (var i = 0; i < clonesAmount; i++) {
          dataSet[key+i].obj.position.z += dataSet[key+i].gltfStore.speedFactor + 0.8;
          dataSet[key+i].obj.position.x += dataSet[key+i].gltfStore.speedFactor;
          dataSet[key+i].obj.position.y += dataSet[key+i].gltfStore.speedFactor;
          if(dataSet[key+i].obj.position.z >= 300){
            dataSet[key+i].obj.position.z = -3000;
            dataSet[key+i].gltfStore.speedFactor = dataSet[key+i].gltfStore.speedFactor * -1;
          }
        }
      });
    });



    update();

    renderer.render(scene, camera);
    requestAnimationFrame(mainLoop);

  }

  init();

}

WebGLThreeJS(['Wuerfel_2', 'Flamingo', 'Parrot', 'Stork']);
