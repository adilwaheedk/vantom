var scene, renderer, camera, model, mixer, idle, newAnim, idle_anim, fileAnimations, idle_action;
let idx = 0;

console.log(location.host);

// SOCKET-IO
var web_sock = "http://"+location.host+"/socket.io/"
const sock = io();


// SOCKET CONNECTIONS
sock.on('connect', function(event){
    console.log("SOCKETIO connected...");
});

sock.on('message', function(event){
    console.log(event);
});

sock.on('disconnect', function(event){
    console.log("SOCKETIO disconnected...");
});



// var gui = new dat.GUI();

let clock = new THREE.Clock();

const sentences = [
    "vantom is a revolutionary holographic device that offers an unparalleled level of interactivity and engagement",
    "the platform features a proprietary handheld hologram that can be controlled through a mobile app which allows users to stream a wide range of holographic content",
    "vantom is designed to enhance the overall experience by incorporating built-in sound capabilities which further immerses users in the holographic content",
    "vantom is an innovative and exciting device that has the potential to transform the way we use technology entertain, and interact with our surroundings"
]

//let audios = [
//    "talk3.mp3",
//    "talk4.mp3",
//    "talk2.mp3",
//    "talk.mp3",
//]

const MODEL_PATH = "static/decimated-vantom-v1.glb";
const canvas = document.querySelector("#c");
const speak_btn = document.querySelector("#speak-btn");
const bx = document.querySelector(".vertical-centered-box");
const load_text = document.querySelector("#load-text");

// var greet = false;

// Init the scene
scene = new THREE.Scene();

// Init the renderer
renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add a camera
camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 26;
camera.position.x = 0;
camera.position.y = -4;


const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = function(MODEL_PATH, item, total){

  bx.style.opacity = "1";

  speak_btn.style.opacity = "0";
  load_text.style.opacity = "1";

  bx.style.transition = "opacity 0.8s";
}

loadingManager.onLoad = function(MODEL_PATH, item, total){
  bx.style.opacity = "0";

  speak_btn.style.opacity = "1";
  load_text.style.opacity = "0";

  bx.style.transition = "opacity 0.5s";
}

var loader = new THREE.GLTFLoader(loadingManager);

loader.load(
  MODEL_PATH,
  function (gltf) {

    model = gltf.scene;
    fileAnimations = gltf.animations;

// Uncomment this when in development, displays all the animations in console
    console.log(gltf.animations);

    model.scale.set(6, 6, 6);
    model.position.y = -10;
    model.position.z = 10;
    model.rotation.x = 0.30;

//    mixer = new THREE.AnimationMixer(model);
//    mixer.timeScale = 1.5;
//
//
//    var action_clip = fileAnimations.find((clip) => clip.name === "idle2");
//
//    idle_action = mixer.clipAction(action_clip);
//    idle_action.play();
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Text Variables
var dialogue;
var phoneme;
var words;
var aud_src;


speak_btn.addEventListener('click', function(){
    if(idx >= 3){
        aud_src = `static/tmp/output${idx}.mp3`;
        idx = 0;
    }
    else{
        aud_src = `static/tmp/output${idx}.mp3`;
        idx = idx + 1;
    }

    console.log(idx);

    dialogue = sentences[idx];
    phoneme = dialogue.match(/[aeobpmfvwqig]/g);
    words = dialogue.split(' ');
    sock.emit('user', {id: idx, text: dialogue, prev_file: aud_src});
}); // END EVENT


sock.on('user', function(event){

    var wi = 0;
    var anim_fade = 0;
    var aud = new Audio();

    mixer = new THREE.AnimationMixer(model);
    mixer.timeScale = 25;


    var A_key = fileAnimations.find((clip) => clip.name === "A-Key");
    var O_key = fileAnimations.find((clip) => clip.name === "O-key");
    var E_key = fileAnimations.find((clip) => clip.name === "E-Key");
    var BPM_key = fileAnimations.find((clip) => clip.name === "B-Key");
    var FV_key = fileAnimations.find((clip) => clip.name === "FV-Key");
    var WQ_key = fileAnimations.find((clip) => clip.name === "WQ-Key");


    var idle3 = fileAnimations.find((clip) => clip.name === "_2Action");

    var ak = mixer.clipAction(A_key);
    var ok = mixer.clipAction(O_key);
    var ek = mixer.clipAction(E_key);
    var bpmk = mixer.clipAction(BPM_key);
    var fvk = mixer.clipAction(FV_key);
    var wqk = mixer.clipAction(WQ_key);

    // console.log(phoneme);

    ak.loop = THREE.LoopOnce;
    ok.loop = THREE.LoopOnce;
    ek.loop = THREE.LoopOnce;
    bpmk.loop = THREE.LoopOnce;
    fvk.loop = THREE.LoopOnce;
    wqk.loop = THREE.LoopOnce;

    speak_btn.disabled = true;

//    $(document).ready(function(){
//        $.ajax({
//            url: 'http://127.0.0.1:5000/',
//            type: 'POST',
//            cache: false,
//            contentType: 'application/json',
//            data: JSON.stringify(),
//            success: function(e){
//                console.log(e);
//
//            },
//            error: function(e){
//                console.log(e);
//            }
//        }) // END AJAX
//    }); // END API
    console.log(idx);

    aud.src = `static/tmp/output${idx}.mp3`;
    aud.playbackRate = 0.8;
    aud.play();

    if(phoneme[wi] === "a" || phoneme[wi] === "i" || phoneme[wi] === "s"){
        ak.fadeIn(anim_fade);
        ak.play();
        // console.log("Event A, I, S");
    }
    else if(phoneme[wi] === "o"){
        ok.fadeIn(anim_fade);
        ok.play();
        // console.log("Event O");
    }
    else if(phoneme[wi] === "e" || phoneme[wi] === "c" || phoneme[wi] === "g"){
        ek.fadeIn(anim_fade);
        ek.play();
        // console.log("Event E, C, G");
    }
    else if(phoneme[wi] === "b" || phoneme[wi] === "p" || phoneme[wi] === "m"){
        bpmk.fadeIn(anim_fade);
        bpmk.play();
        // console.log("Event B, P, M");
    }
    else if(phoneme[wi] === "f" || phoneme[wi] === "v"){
        fvk.fadeIn(anim_fade);
        fvk.play();
        // console.log("Event F, V");
    }
    else if(phoneme[wi] === "w" || phoneme[wi] === "q"){
        wqk.fadeIn(anim_fade);
        wqk.play();
        // console.log("Event W, Q");
    }

    wi = wi + 1;

    mixer.addEventListener("finished", function(e){
        if(wi >= phoneme.length){
                mixer = new THREE.AnimationMixer(model);
                mixer.timeScale = 0.9;

                var reset_action = fileAnimations.find((clip) => clip.name === "idle2");
                var ra = mixer.clipAction(reset_action);
                ra.fadeIn(1);
                ra.play();
                // console.log("Animation Ended");

                wi = 0;
                speak_btn.disabled = false;
        }
        else{
            if(e.action._clip.name === "A-Key"){
                if(phoneme[wi] === "a" || phoneme[wi] === "i"){
                    ak.fadeIn(anim_fade);
                    ak.reset();
                    ak.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "o"){
                    ok.fadeIn(anim_fade);
                    ok.reset();
                    ok.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "e" || phoneme[wi] === "c" || phoneme[wi] === "g"){
                    ek.fadeIn(anim_fade);
                    ek.reset();
                    ek.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "b" || phoneme[wi] === "p" || phoneme[wi] === "m"){
                    bpmk.fadeIn(anim_fade);
                    bpmk.reset();
                    bpmk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "f" || phoneme[wi] === "v"){
                    fvk.fadeIn(anim_fade);
                    fvk.reset();
                    fvk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "w" || phoneme[wi] === "q"){
                    wqk.fadeIn(anim_fade);
                    wqk.reset();
                    wqk.play();
                    // console.log(phoneme[wi]);
                }

                wi = wi + 1;

            }

            if(e.action._clip.name === "O-key"){
                if(phoneme[wi] === "a" || phoneme[wi] === "i"){
                    ak.fadeIn(anim_fade);
                    ak.reset();
                    ak.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "o"){
                    ok.fadeIn(anim_fade);
                    ok.reset();
                    ok.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "e" || phoneme[wi] === "c" || phoneme[wi] === "g"){
                    ek.fadeIn(anim_fade);
                    ek.reset();
                    ek.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "b" || phoneme[wi] === "p" || phoneme[wi] === "m"){
                    bpmk.fadeIn(anim_fade);
                    bpmk.reset();
                    bpmk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "f" || phoneme[wi] === "v"){
                    fvk.fadeIn(anim_fade);
                    fvk.reset();
                    fvk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "w" || phoneme[wi] === "q"){
                    wqk.fadeIn(anim_fade);
                    wqk.reset();
                    wqk.play();
                    // console.log(phoneme[wi]);
                }

                wi = wi + 1;
            }

            if(e.action._clip.name === "E-Key"){
                if(phoneme[wi] === "a" || phoneme[wi] === "i"){
                    ak.fadeIn(anim_fade);
                    ak.reset();
                    ak.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "o"){
                    ok.fadeIn(anim_fade);
                    ok.reset();
                    ok.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "e" || phoneme[wi] === "c" || phoneme[wi] === "g"){
                    ek.fadeIn(anim_fade);
                    ek.reset();
                    ek.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "b" || phoneme[wi] === "p" || phoneme[wi] === "m"){
                    bpmk.fadeIn(anim_fade);
                    bpmk.reset();
                    bpmk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "f" || phoneme[wi] === "v"){
                    fvk.fadeIn(anim_fade);
                    fvk.reset();
                    fvk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "w" || phoneme[wi] === "q"){
                    wqk.fadeIn(anim_fade);
                    wqk.reset();
                    wqk.play();
                    // console.log(phoneme[wi]);
                }

                wi = wi + 1;
            }


            if(e.action._clip.name === "B-Key"){
                if(phoneme[wi] === "a" || phoneme[wi] === "i"){
                    ak.fadeIn(anim_fade);
                    ak.reset();
                    ak.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "o"){
                    ok.fadeIn(anim_fade);
                    ok.reset();
                    ok.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "e" || phoneme[wi] === "c" || phoneme[wi] === "g"){
                    ek.fadeIn(anim_fade);
                    ek.reset();
                    ek.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "b" || phoneme[wi] === "p" || phoneme[wi] === "m"){
                    bpmk.fadeIn(anim_fade);
                    bpmk.reset();
                    bpmk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "f" || phoneme[wi] === "v"){
                    fvk.fadeIn(anim_fade);
                    fvk.reset();
                    fvk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "w" || phoneme[wi] === "q"){
                    wqk.fadeIn(anim_fade);
                    wqk.reset();
                    wqk.play();
                    // console.log(phoneme[wi]);
                }

                wi = wi + 1;
            }


            if(e.action._clip.name === "FV-Key"){
                if(phoneme[wi] === "a" || phoneme[wi] === "i"){
                    ak.fadeIn(anim_fade);
                    ak.reset();
                    ak.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "o"){
                    ok.fadeIn(anim_fade);
                    ok.reset();
                    ok.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "e" || phoneme[wi] === "c" || phoneme[wi] === "g"){
                    ek.fadeIn(anim_fade);
                    ek.reset();
                    ek.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "b" || phoneme[wi] === "p" || phoneme[wi] === "m"){
                    bpmk.fadeIn(anim_fade);
                    bpmk.reset();
                    bpmk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "f" || phoneme[wi] === "v"){
                    fvk.fadeIn(anim_fade);
                    fvk.reset();
                    fvk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "w" || phoneme[wi] === "q"){
                    wqk.fadeIn(anim_fade);
                    wqk.reset();
                    wqk.play();
                    // console.log(phoneme[wi]);
                }

                wi = wi + 1;
            }

            if(e.action._clip.name === "WQ-Key"){
                if(phoneme[wi] === "a" || phoneme[wi] === "i"){
                    ak.fadeIn(anim_fade);
                    ak.reset();
                    ak.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "o"){
                    ok.fadeIn(anim_fade);
                    ok.reset();
                    ok.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "e" || phoneme[wi] === "c" || phoneme[wi] === "g"){
                    ek.fadeIn(anim_fade);
                    ek.reset();
                    ek.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "b" || phoneme[wi] === "p" || phoneme[wi] === "m"){
                    bpmk.fadeIn(anim_fade);
                    bpmk.reset();
                    bpmk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "f" || phoneme[wi] === "v"){
                    fvk.fadeIn(anim_fade);
                    fvk.reset();
                    fvk.play();
                    // console.log(phoneme[wi]);
                }
                else if(phoneme[wi] === "w" || phoneme[wi] === "q"){
                    wqk.fadeIn(anim_fade);
                    wqk.reset();
                    wqk.play();
                    // console.log(phoneme[wi]);
                }

                wi = wi + 1;
            }

        }
    }) // END EVENT

}); // END SOCKET


// Add lights
let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
// Add hemisphere light to scene
scene.add(hemiLight);

let d = 8.25;
let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1500;
dirLight.shadow.camera.left = d * -1;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = d * -1;
// Add directional Light to scene
scene.add(dirLight);


function update() {
    if (mixer) {
        mixer.update(clock.getDelta());
    }

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // renderer.physicallyCorrectLights = true;
     renderer.gammaOutput = true;
     renderer.gammaFactor = 2.3;
    // renderer.outputColorSpace =
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}

update();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}
