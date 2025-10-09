<!-- frontend/pages/index.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">
          Therapeutic Exercise Character Customization
        </h1>
        <p class="text-slate-400">
          Customize your avatar for motion capture analysis
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Preview Area -->
        <div class="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <h2 class="text-xl font-semibold text-white mb-4">Live Preview</h2>
          <div class="aspect-square bg-slate-900 rounded-xl overflow-hidden">
            <ThreeJsPreview :customization="customization" />
          </div>
          
          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div class="bg-slate-900 rounded-lg p-3">
              <p class="text-xs text-slate-400">Weight</p>
              <p class="text-white font-semibold">{{ getWeightLabel(customization.weight) }}</p>
            </div>
            <div class="bg-slate-900 rounded-lg p-3">
              <p class="text-xs text-slate-400">Height</p>
              <p class="text-white font-semibold">{{ getHeightLabel(customization.height) }}</p>
            </div>
            <div class="bg-slate-900 rounded-lg p-3">
              <p class="text-xs text-slate-400">Build</p>
              <p class="text-white font-semibold">{{ getMuscleLabel(customization.muscle) }}</p>
            </div>
          </div>
        </div>

        <!-- Customization Controls -->
        <div class="space-y-4">
          <!-- Body Proportions -->
          <div class="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <h3 class="text-lg font-semibold text-white mb-4">Body Proportions</h3>
            
            <!-- Weight -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-2">
                <label class="text-slate-300 text-sm">Weight</label>
                <span class="text-white font-mono text-sm">{{ customization.weight.toFixed(2) }}</span>
              </div>
              <input
                v-model.number="customization.weight"
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <!-- Height -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-2">
                <label class="text-slate-300 text-sm">Height</label>
                <span class="text-white font-mono text-sm">{{ customization.height.toFixed(2) }}</span>
              </div>
              <input
                v-model.number="customization.height"
                type="range"
                min="0.85"
                max="1.15"
                step="0.05"
                class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <!-- Muscle -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-slate-300 text-sm">Muscle Definition</label>
                <span class="text-white font-mono text-sm">{{ customization.muscle.toFixed(2) }}</span>
              </div>
              <input
                v-model.number="customization.muscle"
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <!-- Appearance -->
          <div class="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <h3 class="text-lg font-semibold text-white mb-4">Appearance</h3>
            
            <div class="mb-4">
              <label class="text-slate-300 text-sm block mb-2">Skin Color</label>
              <input
                v-model="customization.skinColor"
                type="color"
                class="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div class="mb-4">
              <label class="text-slate-300 text-sm block mb-2">T-Shirt</label>
              <select
                v-model="customization.tshirt"
                class="w-full bg-slate-900 text-white rounded-lg px-4 py-2 border border-slate-700"
              >
                <option value="none">None</option>
                <option value="basic">Basic T-Shirt</option>
                <option value="polo">Polo Shirt</option>
              </select>
            </div>

            <div v-if="customization.tshirt !== 'none'">
              <label class="text-slate-300 text-sm block mb-2">T-Shirt Color</label>
              <input
                v-model="customization.tshirtColor"
                type="color"
                class="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <!-- Exercise Selection -->
          <div class="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <h3 class="text-lg font-semibold text-white mb-4">Exercise Settings</h3>
            
            <div class="mb-4">
              <label class="text-slate-300 text-sm block mb-2">Exercise Type</label>
              <select
                v-model="exerciseConfig.exercise"
                class="w-full bg-slate-900 text-white rounded-lg px-4 py-2 border border-slate-700"
              >
                <option value="squat">Squat</option>
                <option value="lunge">Lunge</option>
                <option value="bridge">Bridge</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="text-slate-300 text-sm block mb-2">Execution</label>
              <select
                v-model="exerciseConfig.execution"
                class="w-full bg-slate-900 text-white rounded-lg px-4 py-2 border border-slate-700"
              >
                <option value="correct">Correct</option>
                <option value="incorrect">Incorrect</option>
              </select>
            </div>
          </div>

          <!-- Generate Button -->
          <button
            @click="handleGenerate"
            :disabled="isGenerating"
            class="w-full py-4 rounded-xl font-semibold text-lg transition-all"
            :class="isGenerating 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl'"
          >
            {{ isGenerating ? 'Generating Animation...' : 'Generate Therapeutic Exercise' }}
          </button>

          <!-- Job Status -->
          <div v-if="currentJob" class="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <h3 class="text-lg font-semibold text-white mb-4">Render Status</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-slate-400">Job ID:</span>
                <span class="text-white font-mono text-sm">{{ currentJob.id.substring(0, 8) }}...</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-slate-400">Status:</span>
                <span 
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="{
                    'bg-yellow-500/20 text-yellow-400': currentJob.status === 'queued',
                    'bg-blue-500/20 text-blue-400': currentJob.status === 'processing',
                    'bg-green-500/20 text-green-400': currentJob.status === 'completed',
                    'bg-red-500/20 text-red-400': currentJob.status === 'failed'
                  }"
                >
                  {{ currentJob.status }}
                </span>
              </div>

              <div v-if="currentJob.status === 'completed'" class="pt-3">
                <button
                  @click="downloadAnimation(currentJob.output_file)"
                  class="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Download Animation
                </button>
              </div>

              <div v-if="currentJob.status === 'failed'" class="pt-3">
                <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p class="text-red-400 text-sm">{{ currentJob.error || 'Unknown error occurred' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { generateAnimation, getJobStatus, downloadAnimation } = useBlenderAPI()

const customization = ref({
  weight: 1.0,
  height: 1.0,
  muscle: 1.0,
  skinColor: '#FFDBAC',
  tshirt: 'none',
  tshirtColor: '#4A90E2'
})

const exerciseConfig = ref({
  exercise: 'squat',
  execution: 'correct'
})

const isGenerating = ref(false)
const currentJob = ref(null)
let statusCheckInterval = null

const getWeightLabel = (value) => {
  if (value < 0.9) return 'Slim'
  if (value > 1.1) return 'Heavy'
  return 'Average'
}

const getHeightLabel = (value) => {
  if (value < 0.95) return 'Short'
  if (value > 1.05) return 'Tall'
  return 'Average'
}

const getMuscleLabel = (value) => {
  if (value < 0.9) return 'Lean'
  if (value > 1.1) return 'Muscular'
  return 'Athletic'
}

const handleGenerate = async () => {
  isGenerating.value = true
  
  try {
    const config = {
      person: '04',
      exercise: exerciseConfig.value.exercise,
      execution: exerciseConfig.value.execution,
      camera: 1,
      fps: 30,
      filename: `animation_${Date.now()}`,
      customization: customization.value
    }

    const response = await generateAnimation(config)
    
    if (response.success) {
      currentJob.value = {
        id: response.job_id,
        status: response.status
      }
      
      // Start polling for status
      startStatusPolling(response.job_id)
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to generate animation')
    isGenerating.value = false
  }
}

const startStatusPolling = (jobId) => {
  statusCheckInterval = setInterval(async () => {
    try {
      const status = await getJobStatus(jobId)
      currentJob.value = {
        ...currentJob.value,
        ...status
      }
      
      if (status.status === 'completed' || status.status === 'failed') {
        clearInterval(statusCheckInterval)
        isGenerating.value = false
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }, 2000) // Poll every 2 seconds
}

onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }
})
</script>

<style>
/* Add custom slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>