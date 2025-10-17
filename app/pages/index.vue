<template>

    <div class="app-container">
        <div class="py-4 pl-4">
            <ThreeJsPreview
                :skinColor="skinColor"
                :tshirtColor="tshirtColor"
                :morphValue="morphValue"
                :heightValue="heightValue"
                :leftArmLength="leftArmLength"
            />
        </div>

        <div class="flex flex-col gap-4 max-h-screen pr-4">
            <Config @update:config="config = $event" />
            <Appearance
                @update:skinColor="skinColor = $event"
                @update:tshirtColor="tshirtColor = $event"
                @update:morphValue="morphValue = $event"
                @update:height="heightValue = $event"
            />
            <Accessibility @update:leftArmLength="leftArmLength = $event" />
            <button class="generate-btn" @click="generateExercise">
                Generate Animation
            </button>

            <div class="error-message" id="errorMessage"></div>
        </div>
    </div>
</template>

<script setup>

import { ref, reactive } from 'vue';
import { useHead } from '#app';
// set page title/meta for Nuxt
useHead({ title: '3D Character Customization' });
import Appearance from '../components/Appearance.vue';
import Config from '../components/Config.vue';
import Accessibility from '../components/Accessibility.vue';
import ThreeJsPreview from '../components/ThreeJsPreview.vue';

// Centralized reactive state for child components
const skinColor = ref('#f0c8a0');
const tshirtColor = ref('#000000');
const morphValue = ref(0.0); // body weight / morph target influence
const heightValue = ref(170); // cm
const leftArmLength = ref(3); // accessibility option
const config = reactive({ participant: '1', movement: 'squat', setType: 'correct', camera: 0, fps: 30, saveName: '' });

// Page-level server functions remain here and read from reactive state
async function generateExercise() {
    try {
        const btn = document.querySelector('.generate-btn');
        if (btn) {
            btn.textContent = 'Generating...';
            btn.disabled = true;
        }

        // Use the reactive config object populated by the Config component
        const payload = {
            participant: config.participant,
            movement: config.movement || 'squat',
            setType: config.setType || 'correct',
            camera: parseInt(config.camera) || 0,
            fps: parseInt(config.fps) || 30,
            saveName: config.saveName || ''
        };

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
            showError(`✅ Generation started! Job ID: ${result.job_id}`, 'success');
            pollJobStatus(result.job_id);
        } else {
            showError(`❌ Generation failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error generating exercise:', error);
        showError(`❌ Network error: ${error.message}`, 'error');
    } finally {
        const btn = document.querySelector('.generate-btn');
        if (btn) {
            btn.textContent = 'Generate Animation';
            btn.disabled = false;
        }
    }
}

async function pollJobStatus(jobId) {
    const maxPolls = 500; let pollCount = 0;
    const poll = async () => {
        try {
            const response = await fetch(`/api/status/${jobId}`);
            const status = await response.json();
            if (status.status === 'completed') {
                showError(`✅ Animation completed! Runtime: ${status.runtime.toFixed(1)}s`, 'success');
                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = 'Download Video'; downloadBtn.className = 'viewer-btn'; downloadBtn.onclick = () => window.open(`/api/download/custom_character_exercise.mp4`, '_blank');
                document.querySelector('.viewer-controls')?.appendChild(downloadBtn);
            } else if (status.status === 'failed' || status.status === 'error') {
                showError(`❌ Generation failed. Check logs for details.`, 'error');
            } else if (status.status === 'running' && pollCount < maxPolls) {
                pollCount++; setTimeout(poll, 5000); showError(`⏳ Processing... (${status.runtime.toFixed(1)}s elapsed)`, 'info');
            } else {
                showError(`⏰ Generation timed out after ${maxPolls * 5} seconds`, 'error');
            }
        } catch (error) { showError(`❌ Status check failed: ${error.message}`, 'error'); }
    };
    poll();
}

function showError(message, type = 'error') {
    const errorEl = document.getElementById('errorMessage');
    if (!errorEl) return;
    errorEl.textContent = message; errorEl.className = `error-message ${type}`; errorEl.style.display = 'block';
    if (type === 'success') setTimeout(() => errorEl.style.display = 'none', 8000);
    else if (type === 'info') setTimeout(() => errorEl.style.display = 'none', 3000);
}

</script>

<style>


        .app-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1rem;
            /* height: 100vh; */
        }

        .viewer-panel {
            position: relative;
            background: #ffffff;
            overflow: hidden;
        }

        #viewer-container {
            width: 100%;
            height: 100%;
            cursor: grab;
        }

        #viewer-container:active {
            cursor: grabbing;
        }

        .viewer-controls {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .viewer-btn {
            background: rgba(255, 255, 255, 0.9);
            border: none;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .viewer-btn:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.05);
        }

        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: white;
            font-size: 18px;
            z-index: 200;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #333;
            border-top: 5px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .character-selector {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }

        .character-option {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }

        .character-option:hover {
            border-color: #667eea;
            transform: translateY(-2px);
        }

        .character-option.selected {
            border-color: #667eea;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
        }

        .animation-controls {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .anim-btn {
            flex: 1;
            padding: 10px;
            border: 2px solid #667eea;
            background: white;
            color: #667eea;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .anim-btn:hover {
            background: #667eea;
            color: white;
        }

        .anim-btn.active {
            background: #667eea;
            color: white;
        }

        .generate-section {
            background: linear-gradient(45deg, #667eea, #764ba2);
            margin: -20px;
            margin-top: 20px;
            padding: 20px;
            color: white;
        }


        .generate-btn {
            width: 100%;
            padding: 1rem;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 1rem;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .generate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .accessibility-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .accessibility-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background: #f8f9fa;
        }

        .accessibility-item input[type="checkbox"] {
            margin: 0;
        }

        .error-message {
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
            display: none;
            font-weight: 500;
        }

        .error-message.error {
            background: #ff6b6b;
            color: white;
            border: 1px solid #ff5252;
        }

        .error-message.success {
            background: #4caf50;
            color: white;
            border: 1px solid #45a049;
        }

        .error-message.info {
            background: #2196f3;
            color: white;
            border: 1px solid #1976d2;
        }

        /* @media (max-width: 768px) {
            .app-container {
                grid-template-columns: 1fr;
                grid-template-rows: 60vh 1fr;
            }
        } */
        
</style>