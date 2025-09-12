// API service for connecting to Spring Boot backend

const API_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL || 'http://localhost:8080';
const ML_RESULT_BASE_URL = process.env.NEXT_PUBLIC_ML_RESULT_SERVICE_URL || 'http://localhost:8085';

export interface PredictionResult {
  prediction: 'Normal' | 'Pneumonia' | 'other';
  confidence: number;
  probabilities: {
    normal: number;
    pneumonia: number;
    other: number;
  };
}

export interface MLResult {
  filename: string;
  userId: string;
  contentType: string;
  size: number;
  result: {
    prediction: string;
    confidence: number;
    probabilities: {
      pneumonia: number;
      normal: number;
      other: number;
    };
  };
}

export interface BatchPredictionResult {
  predictions: Array<{
    filename: string;
    prediction?: 'Normal' | 'Pneumonia' | 'other';
    confidence?: number;
    probabilities?: {
      normal: number;
      pneumonia: number;
      other: number;
    };
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
  private uploadBaseUrl: string;
  private mlResultBaseUrl: string;

  constructor() {
    this.uploadBaseUrl = API_BASE_URL;
    this.mlResultBaseUrl = ML_RESULT_BASE_URL;
  }
  
  // Upload image to Spring Boot backend
  async uploadImage(file: File, userId: string = "1"): Promise<UploadResponse> {
    try {
      console.log('🚀 Uploading file to:', `${this.uploadBaseUrl}/upload`);
      console.log('📁 File:', file.name, file.size, file.type);
      
      const formData = new FormData();
      formData.append('file', file);
      // formData.append('userId', userId); // Uncomment if your API accepts userId

      const response = await fetch(`${this.uploadBaseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('📊 Upload response status:', response.status);
      console.log('📊 Upload response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.text();
      console.log('✅ Upload successful:', result);
      
      return {
        message: result,
        filename: file.name,
        userId: userId,
        size: file.size
      };
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }

  // Get ML result for a specific file and user
  async getMLResult(userId: string, filename: string): Promise<MLResult> {
    try {
      console.log('🔍 Fetching ML result for:', filename, 'userId:', userId);
      
      const response = await fetch(
        `${this.mlResultBaseUrl}/results?userId=${encodeURIComponent(userId)}&filename=${encodeURIComponent(filename)}`
      );

      console.log('📊 ML result response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ML result fetch failed:', response.status, errorText);
        throw new Error(`ML result fetch failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ ML result received:', result);
      return result;
    } catch (error) {
      console.error('❌ ML result error:', error);
      throw error;
    }
  }

  // Setup Server-Sent Events for real-time ML results
  setupSSEConnection(
    onResult: (result: MLResult) => void,
    onError: (error: Event) => void,
    onOpen?: () => void
  ): EventSource {
    try {
      console.log('📡 Setting up SSE connection to:', `${this.mlResultBaseUrl}/stream`);
      
      const eventSource = new EventSource(`${this.mlResultBaseUrl}/stream`);
      
      eventSource.addEventListener('ml-result', (event: MessageEvent) => {
        try {
          const payload: MLResult = JSON.parse(event.data);
          console.log('📨 SSE received ML result:', payload);
          onResult(payload);
        } catch (parseError) {
          console.error('❌ Error parsing SSE data:', parseError);
        }
      });
      
      eventSource.onopen = () => {
        console.log('✅ SSE connection opened');
        onOpen?.();
      };
      
      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        onError(error);
      };
      
      return eventSource;
    } catch (error) {
      console.error('❌ Failed to setup SSE:', error);
      throw error;
    }
  }

  // Health check for upload service
  async checkUploadServiceHealth(): Promise<HealthCheck> {
    try {
      const response = await fetch(`${this.uploadBaseUrl}/upload`);
      if (!response.ok) {
        throw new Error(`Upload service health check failed: ${response.status}`);
      }
      const result = await response.text();
      return {
        status: result,
        service: 'upload',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Upload service health check error:', error);
      throw error;
    }
  }

  // Health check for ML result service
  async checkMLResultServiceHealth(): Promise<HealthCheck> {
    try {
      const response = await fetch(`${this.mlResultBaseUrl}/stream`);
      if (!response.ok) {
        throw new Error(`ML result service health check failed: ${response.status}`);
      }
      return {
        status: 'Stream endpoint accessible',
        service: 'ml-result',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('ML result service health check error:', error);
      throw error;
    }
  }

  // Batch upload multiple files
  async uploadBatch(files: File[], userId: string = "1"): Promise<UploadResponse[]> {
    try {
      console.log('🚀 Batch uploading', files.length, 'files');
      
      const uploadPromises = files.map(file => this.uploadImage(file, userId));
      const results = await Promise.all(uploadPromises);
      
      console.log('✅ Batch upload completed:', results.length, 'files');
      return results;
    } catch (error) {
      console.error('❌ Batch upload error:', error);
      throw error;
    }
  }

  // Poll for ML result with timeout
  async pollForMLResult(
    userId: string, 
    filename: string, 
    maxAttempts: number = 30, 
    intervalMs: number = 2000
  ): Promise<MLResult> {
    console.log('⏳ Polling for ML result:', filename, 'max attempts:', maxAttempts);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.getMLResult(userId, filename);
        console.log('✅ ML result found on attempt', attempt);
        return result;
      } catch (error) {
        if (attempt === maxAttempts) {
          console.error('❌ Max polling attempts reached');
          throw new Error(`ML result not available after ${maxAttempts} attempts`);
        }
        
        console.log(`⏳ Attempt ${attempt}/${maxAttempts} failed, retrying in ${intervalMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    throw new Error('Polling timeout');
  }

  // Get API info
  async getApiInfo() {
    try {
      const response = await fetch(`${this.uploadBaseUrl}/`);
      if (!response.ok) {
        throw new Error(`API info failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API info error:', error);
      throw error;
    }
  }

  // Test CORS preflight
  async testCORS(): Promise<boolean> {
    try {
      const response = await fetch(`${this.uploadBaseUrl}/upload`, {
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
