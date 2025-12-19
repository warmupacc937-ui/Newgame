let scene,camera,renderer;
let player,ground;
let obstacles=[];
let speed=0.35;
let running=false;

let velocityY=0;
let jumping=false;
let sliding=false;
let lane=0;

init();

function init(){
  scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0x000000,10,50);

  camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.1,100);
  camera.position.set(0,3,6);

  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth,innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1));
  const dir=new THREE.DirectionalLight(0xffffff,1);
  dir.position.set(5,10,5);
  scene.add(dir);

  // Ground
  ground=new THREE.Mesh(
    new THREE.PlaneGeometry(1000,10),
    new THREE.MeshStandardMaterial({color:0x111111})
  );
  ground.rotation.x=-Math.PI/2;
  scene.add(ground);

  // Player
  player=new THREE.Mesh(
    new THREE.BoxGeometry(1,2,1),
    new THREE.MeshStandardMaterial({color:0x6c63ff})
  );
  player.position.y=1;
  scene.add(player);

  // UI
  startBtn.onclick=()=>{
    startScreen.style.display="none";
    running=true;
  };
  jumpBtn.onclick=jump;
  slideBtn.onclick=slide;
  leftBtn.onclick=()=>dodge(-1);
  rightBtn.onclick=()=>dodge(1);
  punchBtn.onclick=punch;

  animate();
}

function animate(){
  requestAnimationFrame(animate);
  if(!running) return;

  updatePlayer();
  updateObstacles();

  if(Math.random()<0.02) spawnObstacle();

  renderer.render(scene,camera);
}

/* PLAYER */
function updatePlayer(){
  velocityY-=0.012;
  player.position.y+=velocityY;

  if(player.position.y<1){
    player.position.y=1;
    velocityY=0;
    jumping=false;
  }

  player.position.x+=(lane*2-player.position.x)*0.15;
  player.scale.y=sliding?0.5:1;
}

function jump(){
  if(!jumping){
    velocityY=0.28;
    jumping=true;
  }
}

function slide(){
  sliding=true;
  setTimeout(()=>sliding=false,500);
}

function dodge(dir){
  lane=Math.max(-1,Math.min(1,lane+dir));
}

function punch(){
  obstacles.forEach((o,i)=>{
    if(o.userData.type===3 && o.position.z>-2){
      scene.remove(o);
      obstacles.splice(i,1);
    }
  });
}

/* OBSTACLES */
function spawnObstacle(){
  let type=Math.floor(Math.random()*4);
  let geo;

  if(type===0) geo=new THREE.BoxGeometry(1,1,1);      // jump
  if(type===1) geo=new THREE.BoxGeometry(1,0.5,1);    // slide
  if(type===2) geo=new THREE.BoxGeometry(1,2,1);      // dodge
  if(type===3) geo=new THREE.BoxGeometry(2,2,0.5);    // punch wall

  let obs=new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({color:0xff4444})
  );
  obs.position.set((Math.floor(Math.random()*3)-1)*2,1,-40);
  obs.userData.type=type;
  scene.add(obs);
  obstacles.push(obs);
}

function updateObstacles(){
  obstacles.forEach((o,i)=>{
    o.position.z+=speed;

    if(o.position.z>5){
      scene.remove(o);
      obstacles.splice(i,1);
    }
  });
}

window.onresize=()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
};
