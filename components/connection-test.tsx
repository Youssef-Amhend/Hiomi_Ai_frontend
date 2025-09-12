"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { apiService } from "@/lib/api-service"

export function ConnectionTest() {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [streamStatus, setStreamStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [uploadError, setUploadError] = useState<string>("")
  const [streamError, setStreamError] = useState<string>("")

  const testUploadService = async () => {
    setUploadStatus("testing")
    setUploadError("")
    
    try {
      const corsWorks = await apiService.testCORS()
      
      if (corsWorks) {
        setUploadStatus("success")
        setUploadError("CORS preflight successful")
      } else {
        setUploadStatus("error")
        setUploadError("CORS preflight failed")
      }
    } catch (error) {
      setUploadStatus("error")
      setUploadError(error instanceof Error ? error.message : "Unknown error")
      console.error("Upload service test error:", error)
    }
  }

  const testStreamService = async () => {
    setStreamStatus("testing")
    setStreamError("")
    
    try {
      const health = await apiService.checkMLResultServiceHealth()
      setStreamStatus("success")
      setStreamError(`Stream service accessible: ${health.status}`)
    } catch (error) {
      setStreamStatus("error")
      setStreamError(error instanceof Error ? error.message : "Unknown error")
      console.error("Stream service test error:", error)
    }
  }

  const testActualUpload = async () => {
    setUploadStatus("testing")
    setUploadError("")
    
    try {
      // Create a dummy file for testing
      const dummyFile = new File(["dummy content"], "test.txt", { type: "text/plain" })
      
      const result = await apiService.uploadImage(dummyFile, "1")
      setUploadStatus("success")
      setUploadError(`Upload successful: ${result.message}`)
    } catch (error) {
      setUploadStatus("error")
      setUploadError(error instanceof Error ? error.message : "Unknown error")
      console.error("Actual upload test error:", error)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Connection Test</CardTitle>
        <CardDescription>Test connectivity to backend services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Upload Service (CORS)</p>
            <p className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL || 'http://localhost:8080'}/upload</p>
          </div>
          <div className="flex items-center gap-2">
            {uploadStatus === "idle" && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
            {uploadStatus === "testing" && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            {uploadStatus === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
            {uploadStatus === "error" && <XCircle className="w-4 h-4 text-red-500" />}
            <div className="flex gap-2">
              <Button 
                onClick={testUploadService} 
                disabled={uploadStatus === "testing"}
                variant="outline"
                size="sm"
              >
                Test CORS
              </Button>
              <Button 
                onClick={testActualUpload} 
                disabled={uploadStatus === "testing"}
                variant="outline"
                size="sm"
              >
                Test Upload
              </Button>
            </div>
          </div>
        </div>
        
        {uploadError && (
          <p className="text-sm text-red-500">{uploadError}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Stream Service</p>
            <p className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_ML_RESULT_SERVICE_URL || 'http://localhost:8085'}/stream</p>
          </div>
          <div className="flex items-center gap-2">
            {streamStatus === "idle" && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
            {streamStatus === "testing" && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            {streamStatus === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
            {streamStatus === "error" && <XCircle className="w-4 h-4 text-red-500" />}
            <Button 
              onClick={testStreamService} 
              disabled={streamStatus === "testing"}
              variant="outline"
              size="sm"
            >
              Test
            </Button>
          </div>
        </div>
        
        {streamError && (
          <p className="text-sm text-red-500">{streamError}</p>
        )}
      </CardContent>
    </Card>
  )
}
