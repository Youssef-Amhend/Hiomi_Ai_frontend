// API Configuration for Hiomi AI Frontend
export const config = {
  // Flask backend service
  apiService: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    processEndpoint: "/process_image",
  },
  
  // Default model version (1 or 2)
  defaultModelVersion: "1",
  
  // File upload configuration
  upload: {
    maxSize: 20 * 1024 * 1024, // 20MB
    acceptedTypes: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/dicom": [".dcm"],
    },
  },
} as const

// Helper functions
export const getProcessUrl = () => `${config.apiService.baseUrl}${config.apiService.processEndpoint}`
