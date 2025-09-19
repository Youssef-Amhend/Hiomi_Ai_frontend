// API service for connecting to Flask backend

const API_BASE_URL = '';

export interface PredictionResult {
  text: string;
}

export interface MLResult {
  text: string;
}

export interface BatchPredictionResult {
  predictions: Array<{
    filename: string;
    text?: string;
    error?: string;
  }>;
}

export interface HealthCheck {
  status: string;
  service: string;
  timestamp: string;
}

export interface UploadResponse {
  message: string;
  filename: string;
  userId: string;
  size: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }
  
  // Process image with Flask backend
  async processImage(file: File, modelVersion: string = "1"): Promise<PredictionResult> {
    try {
      console.log('🚀 Processing image with Flask:', file.name, file.size, file.type);
      console.log('🤖 Using model version:', modelVersion);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('model', modelVersion);

      const response = await fetch(`/api/process_image`, {
        method: 'POST',
        body: formData,
      });

      console.log('📊 Processing response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Processing failed:', response.status, errorText);
        throw new Error(`Processing failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Processing successful:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Processing error:', error);
      throw error;
    }
  }

  // Batch process multiple images
  async processBatch(files: File[], modelVersion: string = "1"): Promise<BatchPredictionResult> {
    try {
      console.log('🚀 Batch processing', files.length, 'files');
      
      const processPromises = files.map(async (file) => {
        try {
          const result = await this.processImage(file, modelVersion);
          return {
            filename: file.name,
            text: result.text
          };
        } catch (error) {
          return {
            filename: file.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });
      
      const results = await Promise.all(processPromises);
      console.log('✅ Batch processing completed:', results.length, 'files');
      
      return { predictions: results };
    } catch (error) {
      console.error('❌ Batch processing error:', error);
      throw error;
    }
  }

  // Test CORS preflight
  async testCORS(): Promise<boolean> {
    try {
      const response = await fetch(`/api/process_image`, {
        method: "OPTIONS",
        headers: {
          "Origin": "http://localhost:3000",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });
      
      console.log('CORS test response:', response.status, response.statusText);
      console.log('CORS headers:', {
        "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
        "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
      });
      
      return response.ok;
    } catch (error) {
      console.error('CORS test error:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
