<template>  
    <div class="section">
        <h3>Appearance</h3>
        <div class="slider-group">
            <label>Skin Tone</label>
                <div>
                    <input id="skinColorPicker" type="color" :value="skin" @input="onSkin" />
                </div>
            <!-- <div class="slider-container">
                <input type="range" class="slider" id="skinTone" min="0" max="100" value="50" oninput="updateSkinTone(this.value)">
                <span class="slider-value" id="skinToneValue">50</span>
            </div> -->
        </div>
        <!-- Skin Color -->

        <div class="slider-group">
            <label>Choose Tshirt</label>
                <div class="grid-selector" >
                <div class="grid-item" @click="selectDefault">
                    <p>Default</p>
                </div>
                <div class="grid-item" @click="selectCustom">
                    <p>Custom</p>
                </div>
            </div>
        </div>
        <!-- Tshirt Color -->
        <div class="slider-group">
            <label>Upper clothes color</label>
                <div>
                <input  id="tshirtColorPicker" type="color" :value="tshirt" @input="onTshirt" />
                </div>
        </div>
        <div class="slider-group">
            <label>Body Weight</label>
                <div class="slider-container">
                <input type="range" class="slider" id="morphSlider" min="0" max="1" step="0.01" :value="morph" @input="onMorph">
                <span class="slider-value" id="morphSliderValue">{{ Math.round(morph*10) }}</span>
            </div>
        </div>
        <div class="slider-group">
            <label>Height</label>
                <div class="slider-container">
                <input type="range" class="slider" id="height" min="80" max="120" :value="height" @input="onHeight">
                <span class="slider-value" id="heightValue">{{ height }}</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const emit = defineEmits(['update:skinColor','update:tshirtColor','update:morphValue','update:height','select-tshirt']);
const skin = ref('#d08b5b');
const tshirt = ref('#000000');
const morph = ref(0);
const height = ref(100);

function onSkin(e){ skin.value = e.target.value; emit('update:skinColor', skin.value); }
function onTshirt(e){ tshirt.value = e.target.value; emit('update:tshirtColor', tshirt.value); }
function onMorph(e){ morph.value = parseFloat(e.target.value); emit('update:morphValue', morph.value); }
function onHeight(e){ height.value = parseInt(e.target.value); emit('update:height', height.value); }

function selectDefault(){ emit('select-tshirt','default'); }
function selectCustom(){ emit('select-tshirt','custom'); }
</script>