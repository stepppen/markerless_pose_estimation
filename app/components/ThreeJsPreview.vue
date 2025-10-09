<!-- frontend/components/ThreeJsPreview.vue -->
<template>
  <div ref="containerRef" class="w-full h-full"></div>
</template>

<script setup>
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps({
  customization: {
    type: Object,
    default: () => ({})
  }
})

const containerRef = ref(null)
let scene, camera, renderer, controls, character

onMounted(() => {
  initThree()
  loadCharacter()
})

watch(() => props.customization, () => {
  updateCharacter()
}, { deep: true })

const initThree = () => {
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1e293b)

  // Camera
  camera = new THREE.PerspectiveCamera(
    50,
    1,
    30,
    1000
  )
  camera.position.set(0, 50, 3)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.shadowMap.enabled = true
  containerRef.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1, 0)
  controls.update()

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // Ground
  const groundGeometry = new THREE.PlaneGeometry(10, 10)
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // Animation loop
  animate()
}

function loadCharacter() {

  const loader = new FBXLoader()
  
  loader.load('/models/changed.fbx', (fbx) => {
    character = fbx
    character.scale.setScalar(0.01);

    // Center and ground the model
    const box = new THREE.Box3().setFromObject(character);
    const center = box.getCenter(new THREE.Vector3());
    character.position.sub(center);
    character.position.y = 0;

    scene.add(character)
    updateCharacter()
  })
}

const updateCharacter = () => {
  if (!character) return
  
  const { weight, height, muscle } = props.customization
  
  // Update character scale based on customization
  character.scale.set(
    weight * muscle,
    height,
    weight * muscle
  )
  
  // Update skin color
  if (props.customization.skinColor && character.material) {
    character.material.color.setStyle(props.customization.skinColor)
  }
}

const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

onUnmounted(() => {
  if (renderer) {
    renderer.dispose()
  }
})
</script>