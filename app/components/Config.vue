<template>
    <div class="section">
    <h3>Animation Configuration</h3>
    <div class="config-form">
        <div class="form-group">
            <label for="participant">Participant ID</label>
            <input type="text" id="participant" class="form-input" v-model="participant">
        </div>
        <div class="form-group">
            <label for="movement">Movement Type</label>
            <select id="movement" class="form-input" v-model="movement">
                <option value="squat">squat</option>
                <option value="walk">Walk</option>
                <option value="run">Run</option>
                <option value="jump">Jump</option>
            </select>
        </div>
        <div class="form-group">
            <label for="setType">Set Type</label>
            <select id="setType" class="form-input" v-model="setType">
                <option value="correct">correct</option>
                <option value="set1">incorrect</option>
                <option value="set2">Set 2</option>
            </select>
        </div>
        <div class="form-group">
            <label for="camera">Camera</label>
            <select id="camera" class="form-input" v-model="camera">
                <option value="1">1</option>
                <option value="2">Camera 2</option>
                <option value="3">Camera 3</option>
                <option value="4">Camera 4</option>
            </select>
        </div>
        <div class="form-group">
            <label for="fps">FPS</label>
            <input type="number" id="fps" class="form-input" v-model.number="fps" min="1" max="60">
        </div>
        <div class="form-group">
            <label for="saveName">Save Name</label>
            <input type="text" id="saveName" class="form-input" v-model="saveName">
        </div>
    </div>
</div>
</template>
<script setup>
import { ref, watch } from 'vue';
const emit = defineEmits(['update:config']);
const participant = ref('04');
const movement = ref('squat');
const setType = ref('correct');
const camera = ref('1');
const fps = ref(30);
const saveName = ref('test_animation');

watch([participant,movement,setType,camera,fps,saveName], () => {
  emit('update:config', { participant: participant.value, movement: movement.value, setType: setType.value, camera: camera.value, fps: fps.value, saveName: saveName.value });
}, { deep: true });
</script>