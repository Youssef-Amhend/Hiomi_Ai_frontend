"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { apiService } from "@/lib/api-service"

export function ConnectionTest() {
  const [flaskStatus, setFlaskStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [flaskError, setFlaskError] = useState<string>("")

  const testFlaskService = async () => {
    setFlaskStatus("testing")
    setFlaskError("")
    
    try {
      const corsWorks = await apiService.testCORS()
      
      if (corsWorks) {
        setFlaskStatus("success")
        setFlaskError("CORS preflight successful")
      } else {
        setFlaskStatus("error")
        setFlaskError("CORS preflight failed")
      }
    } catch (error) {
      setFlaskStatus("error")
      setFlaskError(error instanceof Error ? error.message : "Unknown error")
      console.error("Flask service test error:", error)
    }
  }

  const testActualProcessing = async () => {
    setFlaskStatus("testing")
    setFlaskError("")
    
    try {
      // Create a dummy image file for testing
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 100, 100)
        ctx.fillStyle = 'black'
        ctx.fillRect(25, 25, 50, 50)
      }
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/png')
      })
      
      const dummyFile = new File([blob], "test.png", { type: "image/png" })
      
      const result = await apiService.processImage(dummyFile, "1")
      setFlaskStatus("success")
      setFlaskError(`Processing successful: ${result.text}`)
    } catch (error) {
      setFlaskStatus("error")
      setFlaskError(error instanceof Error ? error.message : "Unknown error")
      console.error("Actual processing test error:", error)
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
            <p className="font-medium">Flask Backend Service</p>
            <p className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/process_image</p>
          </div>
          <div className="flex items-center gap-2">
            {flaskStatus === "idle" && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
            {flaskStatus === "testing" && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            {flaskStatus === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
            {flaskStatus === "error" && <XCircle className="w-4 h-4 text-red-500" />}
            <div className="flex gap-2">
              <Button 
                onClick={testFlaskService} 
                disabled={flaskStatus === "testing"}
                variant="outline"
                size="sm"
              >
                Test CORS
              </Button>
              <Button 
                onClick={testActualProcessing} 
                disabled={flaskStatus === "testing"}
                variant="outline"
                size="sm"
              >
                Test Processing
              </Button>
            </div>
          </div>
        </div>
        
        {flaskError && (
          <p className="text-sm text-red-500">{flaskError}</p>
        )}
      </CardContent>
    </Card>
  )
}
