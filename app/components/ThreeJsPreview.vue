<template>
  <div class="viewer-panel">
    <div id="viewer-container"></div>
    <!-- <div class="viewer-controls">
      <button class="viewer-btn" @click="toggleWireframe">📐 Wireframe</button>
      <button class="viewer-btn" @click="toggleAnimation">▶️ Animate</button>
    </div> -->
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Props-driven scene configuration
const props = defineProps({
  skinColor: { type: String, default: '#d08b5b' },
  tshirtColor: { type: String, default: '#000000' },
  morphValue: { type: Number, default: 0 },
  heightValue: { type: Number, default: 100 },
  leftArmLength: { type: Number, default: 4 }
});

const emit = defineEmits(['loaded']);

// Scene state (component-local)
let scene, camera, renderer, controls;
let currentModel = null;
let mixer = null;
let clock = new THREE.Clock();
let isWireframe = false;
let isAnimating = false;
let characterMeshes = {};
let bonesBooleans = [];
let skinMeshes = [];
let tshirtMeshes = [];

let characterState = {
  base: 'female',
  skinTone: 50,
  bodyWeight: 50,
  height: 100,
  limbs: { leftArm: true, rightArm: true, leftLeg: true, rightLeg: true }
};

function getSkinColor(toneValue) {
  const lightSkin = new THREE.Color(0xfdbcb4);
  const mediumSkin = new THREE.Color(0xd08b5b);
  const darkSkin = new THREE.Color(0x8d5524);
  const factor = toneValue / 100;
  if (factor < 0.5) return lightSkin.lerp(mediumSkin, factor * 2);
  return mediumSkin.lerp(darkSkin, (factor - 0.5) * 2);
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (mixer) mixer.update(clock.getDelta());
  if (currentModel && isAnimating) {
    const time = clock.getElapsedTime();
    currentModel.rotation.y = Math.sin(time * 0.5) * 0.1;
    currentModel.position.y = Math.sin(time * 2) * 0.1;
  }
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('viewer-container');
  if (!container || !camera || !renderer) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function setMaterialColor(material, hex) {
  const apply = (m) => {
    if (!m) return;
    if (m.color) m.color.set(hex);
    if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.needsUpdate = true; }
    if (m.map && !m.map.image) m.map = null;
    m.needsUpdate = true;
  };
  if (Array.isArray(material)) material.forEach(apply); else apply(material);
}

function updateSkinColor(hex) { skinMeshes.forEach(mesh => setMaterialColor(mesh.material, hex)); }
function updateTshirtColor(hex) { tshirtMeshes.forEach(mesh => setMaterialColor(mesh.material, hex)); }

function toggleWireframe() {
  isWireframe = !isWireframe;
  if (currentModel) currentModel.traverse(child => { if (child.isMesh) child.material.wireframe = isWireframe; });
}

function toggleAnimation() { isAnimating = !isAnimating; }

function createLimb(radius, height, color) {
  const geometry = new THREE.CapsuleGeometry(radius, height, 8, 16);
  const material = new THREE.MeshLambertMaterial({ color });
  const limb = new THREE.Mesh(geometry, material);
  limb.castShadow = true;
  return limb;
}

function createDemoCharacter() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.8,3,8,16), new THREE.MeshLambertMaterial({ color: getSkinColor(characterState.skinTone) }));
  body.position.y = 2.5; body.castShadow = true; body.userData = { type: 'body' };
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.6,16,16), new THREE.MeshLambertMaterial({ color: getSkinColor(characterState.skinTone) }));
  head.position.y = 4.8; head.castShadow = true; head.userData = { type: 'head' };
  group.add(head);
  if (characterState.limbs.leftArm) { const leftArm = createLimb(0.3,2,getSkinColor(characterState.skinTone)); leftArm.position.set(-1.2,3.5,0); leftArm.rotation.z = 0.3; leftArm.userData={type:'leftArm'}; group.add(leftArm); }
  if (characterState.limbs.rightArm) { const rightArm = createLimb(0.3,2,getSkinColor(characterState.skinTone)); rightArm.position.set(1.2,3.5,0); rightArm.rotation.z = -0.3; rightArm.userData={type:'rightArm'}; group.add(rightArm); }
  if (characterState.limbs.leftLeg) { const leftLeg = createLimb(0.4,2.5,getSkinColor(characterState.skinTone)); leftLeg.position.set(-0.4,0.8,0); leftLeg.userData={type:'leftLeg'}; group.add(leftLeg); }
  if (characterState.limbs.rightLeg) { const rightLeg = createLimb(0.4,2.5,getSkinColor(characterState.skinTone)); rightLeg.position.set(0.4,0.8,0); rightLeg.userData={type:'rightLeg'}; group.add(rightLeg); }
  const heightScale = characterState.height / 100; const weightScale = 0.7 + (characterState.bodyWeight/100)*0.6; group.scale.set(heightScale*weightScale,heightScale,heightScale*weightScale);
  currentModel = group; currentModel.userData.isDemoCharacter = true; scene.add(group);
}

function updateModelAppearance() {
  if (!currentModel) return;
  const isDemo = currentModel.userData.isDemoCharacter;
  if (isDemo) {
    const newSkinColor = getSkinColor(characterState.skinTone);
    currentModel.traverse(child => { if (child.isMesh && child.userData.type) { if (['body','head','leftArm','rightArm','leftLeg','rightLeg'].includes(child.userData.type)) child.material.color.copy(newSkinColor); } });
    const heightScale = characterState.height / 100; const weightScale = 0.7 + (characterState.bodyWeight / 100)*0.6;
    currentModel.scale.set(heightScale*weightScale,heightScale,heightScale*weightScale);
    currentModel.traverse(child => { if (child.userData.type) { const limbType = child.userData.type; if (characterState.limbs.hasOwnProperty(limbType)) child.visible = characterState.limbs[limbType]; } });
  } else {
    const newSkinColor = getSkinColor(characterState.skinTone);
    const heightScale = characterState.height / 100; const weightScale = 0.7 + (characterState.bodyWeight / 100)*0.6;
    currentModel.scale.set(0.01*weightScale,0.01*heightScale,0.01*weightScale);
    currentModel.traverse(child => {
      if (child.isMesh && child.material) {
        const materialName = child.material.name ? child.material.name.toLowerCase() : '';
        const meshName = child.name ? child.name.toLowerCase() : '';
        const isSkinMaterial = materialName.includes('skin') || materialName.includes('body') || materialName.includes('face') || materialName.includes('head') || meshName.includes('body') || meshName.includes('face') || meshName.includes('head');
        if (isSkinMaterial) { if (child.material.color) child.material.color.copy(newSkinColor); if (child.material.map) child.material.color.copy(newSkinColor); }
      }
    });
  }
}

function loadCharacter(characterType) {
  if (currentModel) { scene.remove(currentModel); currentModel = null; if (mixer) { mixer.stopAllAction(); mixer = null; } }
  skinMeshes = []; tshirtMeshes = []; characterMeshes = [];
  const loader = new FBXLoader();
  const fbxModel = '/models/noLight.fbx';
  loader.load(fbxModel, (fbx) => {
    currentModel = fbx; fbx.scale.setScalar(0.01);
    const box = new THREE.Box3().setFromObject(fbx); const center = box.getCenter(new THREE.Vector3()); fbx.position.x = -center.x; fbx.position.y = 0; fbx.position.z = -center.z;
    scene.add(fbx);
    fbx.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true; child.receiveShadow = true;
        const name = (child.name||'').toLowerCase(); const matName = (child.material?.name||'').toLowerCase();
        if (child.material) {
          const oldMaterial = child.material;
          const newMaterial = new THREE.MeshStandardMaterial({ color: oldMaterial.color || 0xffffff, map: oldMaterial.map || null, normalMap: oldMaterial.normalMap || null, roughness: 0.6, metalness: 0.3 });
          child.material = newMaterial;
        }
        if (name.includes('skin')||name.includes('body')||name.includes('face')||name.includes('head')||name.includes('arm')||name.includes('leg')||matName.includes('skin')||matName.includes('face')||matName.includes('body')) skinMeshes.push(child);
        if (name.includes('tops')||name.includes('top')||name.includes('tshirt')||name.includes('shirt')||name.includes('sweater')||name.includes('upper')||matName.includes('tshirt')||matName.includes('shirt')||matName.includes('top')) tshirtMeshes.push(child);
        if (child.skeleton && bonesBooleans.length === 0) bonesBooleans.push(child.skeleton.bones);
        if (child.morphTargetDictionary) characterMeshes[child.name.toLowerCase()] = child;
      }
    });
    setupTshirtSwitcher();
    const initialSkinColor = document.getElementById('skinColorPicker')?.value || '#d08b5b';
    const initialTshirtColor = document.getElementById('tshirtColorPicker')?.value || '#000000';
    updateSkinColor(initialSkinColor); updateTshirtColor(initialTshirtColor);
  }, (xhr)=>{ console.log((xhr.loaded/xhr.total*100)+'% loaded'); }, (error)=>{ console.error('Error loading FBX:', error); });
}

function setupTshirtSwitcher() {
  if (tshirtMeshes.length < 2) return;
  tshirtMeshes[0].visible = false;
  const defaultBtn = document.getElementById('defaultTshirt');
  const customBtn = document.getElementById('customTshirt');
  if (defaultBtn) defaultBtn.addEventListener('click', () => { if (tshirtMeshes[0]) tshirtMeshes[0].visible = false; if (tshirtMeshes[1]) tshirtMeshes[1].visible = true; });
  if (customBtn) customBtn.addEventListener('click', () => { if (tshirtMeshes[0]) tshirtMeshes[0].visible = true; if (tshirtMeshes[1]) tshirtMeshes[1].visible = false; });
}

onMounted(() => {
  const container = document.getElementById('viewer-container');
  if (!container) return;
  // Scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, container.clientWidth/container.clientHeight, 0.1, 1000);
  camera.position.set(0,5,90);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  new RGBELoader().load('/env/studio_hdr.hdr', (texture)=>{ texture.mapping = THREE.EquirectangularReflectionMapping; scene.environment = texture; scene.background = new THREE.Color(0xD3D3D3); }, undefined, (err)=>{ console.error(err); scene.background = new THREE.Color(0xD3D3D3); });
  controls = new OrbitControls(camera, renderer.domElement); controls.target.set(0,1,0); controls.enableDamping = true; controls.dampingFactor = 0.05; controls.minDistance = 3; controls.maxDistance = 3; controls.minAzimuthAngle = 5; controls.maxAzimuthAngle = -5; controls.minPolarAngle = 1; controls.maxPolarAngle = Math.PI/1.8;
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); scene.add(ambientLight);
  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x444422, 0.6); hemiLight.position.set(0,50,0); scene.add(hemiLight);
  const sunLight = new THREE.DirectionalLight(0xffffff,1.0); sunLight.position.set(10,20,10); sunLight.castShadow=true; sunLight.shadow.mapSize.width=4096; sunLight.shadow.mapSize.height=4096; sunLight.shadow.camera.left=-20; sunLight.shadow.camera.right=20; sunLight.shadow.camera.top=20; sunLight.shadow.camera.bottom=-20; sunLight.shadow.camera.near=0.5; sunLight.shadow.camera.far=100; scene.add(sunLight);
  const fillLight = new THREE.DirectionalLight(0xffffff,0.3); fillLight.position.set(-10,5,-5); scene.add(fillLight);
  container.appendChild(renderer.domElement);
  const groundGeometry = new THREE.PlaneGeometry(20,20); const groundMaterial = new THREE.MeshLambertMaterial({ color:0xFFFFFF, transparent:true, opacity:0.8 }); const ground = new THREE.Mesh(groundGeometry, groundMaterial); ground.rotation.x=-Math.PI/2; ground.position.y=0; ground.receiveShadow=true; scene.add(ground);
  loadCharacter('female');
  window.addEventListener('resize', onWindowResize);
  // react to initial props
  updateSkinColor(props.skinColor);
  updateTshirtColor(props.tshirtColor);
  // apply initial morph/leftArm/height via watchers below

  animate();
  // expose some helpers to window for quick debugging
  if (typeof window !== 'undefined') {
    window.toggleWireframe = toggleWireframe;
    window.toggleAnimation = toggleAnimation;
    window.loadCharacter = loadCharacter;
    window.updateSkinColor = updateSkinColor;
    window.updateTshirtColor = updateTshirtColor;
  }
});

// Watch for prop changes and react
watch(() => props.skinColor, (val) => { updateSkinColor(val); });
watch(() => props.tshirtColor, (val) => { updateTshirtColor(val); });
watch(() => props.morphValue, (val) => {
  const topsMesh = characterMeshes['tops']; const bottomsMesh = characterMeshes['bottoms'];
  if (topsMesh && topsMesh.morphTargetDictionary){ const dict = topsMesh.morphTargetDictionary; const influences = topsMesh.morphTargetInfluences; if (dict['top'] !== undefined) influences[dict['top']] = val; }
  if (bottomsMesh && bottomsMesh.morphTargetDictionary){ const dict = bottomsMesh.morphTargetDictionary; const influences = bottomsMesh.morphTargetInfluences; if (dict['BottomOne'] !== undefined) influences[dict['BottomOne']] = val; }
});
watch(() => props.heightValue, (val) => { if (currentModel) currentModel.scale.y = val/100; });
watch(() => props.leftArmLength, (val) => {
  if (!bonesBooleans[0]) return;
  // reset
  for (let i = 10; i <= 31; i++) if (bonesBooleans[0][i]) bonesBooleans[0][i].scale.set(1,1,1);
  if (val === 3) for (let i=0;i<=20;i++) if (bonesBooleans[0][12+i]) bonesBooleans[0][12+i].scale.set(0,0,0);
  else if (val === 2) for (let i=0;i<=20;i++) if (bonesBooleans[0][11+i]) bonesBooleans[0][11+i].scale.set(0,0,0);
  else if (val === 1) for (let i=0;i<=20;i++) if (bonesBooleans[0][10+i]) bonesBooleans[0][10+i].scale.set(0,0,0);
});
</script>

<style scoped>
/* keep minimal; page css handles layout */
.viewer-panel { position: relative; border-radius: 1rem; background: #ffffff; overflow: hidden; height: 100%; } 
#viewer-container { width: 100%; height: 100%; }
.viewer-controls { position: absolute; top: 20px; left: 20px; z-index: 100; display:flex; flex-direction:column; gap:10px; }
.viewer-btn { background: rgba(255,255,255,0.9); border:none; padding:8px; border-radius:8px; cursor:pointer; }
</style>