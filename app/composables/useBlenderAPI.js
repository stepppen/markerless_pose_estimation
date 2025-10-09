// frontend/composables/useBlenderAPI.js
export const useBlenderAPI = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const generateAnimation = async (animationConfig) => {
    try {
      const response = await $fetch(`${apiBase}/api/generate-animation`, {
        method: 'POST',
        body: animationConfig
      })
      return response
    } catch (error) {
      console.error('Error generating animation:', error)
      throw error
    }
  }

  const getJobStatus = async (jobId) => {
    try {
      const response = await $fetch(`${apiBase}/api/job-status/${jobId}`)
      return response
    } catch (error) {
      console.error('Error fetching job status:', error)
      throw error
    }
  }

  const downloadAnimation = (filename) => {
    window.open(`${apiBase}/api/download/${filename}`, '_blank')
  }

  return {
    generateAnimation,
    getJobStatus,
    downloadAnimation
  }
}