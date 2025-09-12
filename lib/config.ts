// API Configuration for Hiomi AI Frontend
export const config = {
  // Upload service (Spring Boot)
  uploadService: {
    baseUrl: process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL || "http://localhost:8080",
    uploadEndpoint: "/upload",
  },
  
  // ML Result service
  mlResultService: {
    baseUrl: process.env.NEXT_PUBLIC_ML_RESULT_SERVICE_URL || "http://localhost:8085",
    streamEndpoint: "/stream",
    resultsEndpoint: "/results",
  },
  
  // Default user ID (you can make this dynamic based on authentication)
  defaultUserId: "1",
  
  // Polling configuration
  polling: {
    interval: 2000, // 2 seconds
    maxAttempts: 30, // 1 minute max
  },
  
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
export const getUploadUrl = () => `${config.uploadService.baseUrl}${config.uploadService.uploadEndpoint}`
export const getStreamUrl = () => `${config.mlResultService.baseUrl}${config.mlResultService.streamEndpoint}`
export const getResultsUrl = (userId: string, filename: string) => 
  `${config.mlResultService.baseUrl}${config.mlResultService.resultsEndpoint}?userId=${encodeURIComponent(userId)}&filename=${encodeURIComponent(filename)}`
