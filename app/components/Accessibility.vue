<template>
    <!-- Limbs -->
    <div class="section">
        <h3>Accessibility</h3>
        <div class="slider-group">
            <label>Left Arm</label>
            <div class="slider-container">
                <input id="leftArmLength" class="slider" type="range" min="1" max="4" v-model="leftArm" @input="onLeftArm" />
                <span class="slider-value" id="leftArmLengthValue">{{ leftArm }}</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const emit = defineEmits(['update:leftArmLength']);
const leftArm = ref(4);
function onLeftArm(e){ leftArm.value = parseInt(e.target.value); emit('update:leftArmLength', leftArm.value); }
</script>