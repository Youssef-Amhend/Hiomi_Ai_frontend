"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Upload, X, Download, RotateCcw, AlertTriangle, Eye, EyeOff, Brain } from "lucide-react"
import Image from "next/image"
import { config } from "@/lib/config"
import { ConnectionTest } from "@/components/connection-test"
import { apiService, MLResult } from "@/lib/api-service"

interface AnalysisResult {
  label: "pneumonia" | "normal" | "other"
  probabilities: {
    pneumonia: number
    normal: number
    other: number
  }
  overlays?: {
    heatmapUrl?: string
    boxes?: Array<{ x: number; y: number; w: number; h: number; score: number; label: string }>
  }
  modelVersion: string
  runtimeMs: number
  caseId: string
}

export default function DetectPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [overlayOpacity, setOverlayOpacity] = useState([80])
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [userId] = useState(config.defaultUserId)
  
  // Refs for cleanup
  const eventSourceRef = useRef<EventSource | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function for SSE and polling
  const cleanupListeners = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Option B: Polling for results
  const setupPolling = useCallback(() => {
    cleanupListeners()
    
    if (!uploadedFileName) return
    
    const pollForResult = async () => {
      try {
        const payload = await apiService.getMLResult(userId, uploadedFileName)
        
        if (payload.filename === uploadedFileName && payload.userId === userId) {
          const analysisResult: AnalysisResult = {
            label: payload.result.prediction as "pneumonia" | "normal" | "other",
            probabilities: payload.result.probabilities,
            modelVersion: "PneumoNet-v2.1",
            runtimeMs: 0,
            caseId: `case_${Date.now()}`,
          }
          
          setResult(analysisResult)
          setIsAnalyzing(false)
          cleanupListeners() // Stop polling once we get the result
          console.log("Received ML result via polling:", payload)
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }
    
    // Poll immediately, then every configured interval
    pollForResult()
    pollingIntervalRef.current = setInterval(pollForResult, config.polling.interval)
  }, [uploadedFileName, userId, cleanupListeners])

  // Option A: SSE (Server-Sent Events) for live updates
  const setupSSE = useCallback(() => {
    cleanupListeners()
    
    try {
      const es = apiService.setupSSEConnection(
        (payload: MLResult) => {
          // Check if this result is for our uploaded file
          if (payload.filename === uploadedFileName && payload.userId === userId) {
            const analysisResult: AnalysisResult = {
              label: payload.result.prediction as "pneumonia" | "normal" | "other",
              probabilities: payload.result.probabilities,
              modelVersion: "PneumoNet-v2.1", // You can get this from the payload if available
              runtimeMs: 0, // You can get this from the payload if available
              caseId: `case_${Date.now()}`,
            }
            
            setResult(analysisResult)
            setIsAnalyzing(false)
            console.log("Received ML result via SSE:", payload)
          }
        },
        (error) => {
          console.error("SSE error:", error)
          // Fallback to polling if SSE fails
          setupPolling()
        }
      )
      eventSourceRef.current = es
    } catch (error) {
      console.error("Failed to setup SSE, falling back to polling:", error)
      setupPolling()
    }
  }, [uploadedFileName, userId, cleanupListeners, setupPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupListeners()
    }
  }, [cleanupListeners])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
      setUploadedFileName(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.upload.acceptedTypes,
    maxSize: config.upload.maxSize,
    multiple: false,
  })

  // Function to generate random analysis results
  const generateRandomResult = (): AnalysisResult => {
    const labels: ("pneumonia" | "normal" | "other")[] = ["pneumonia", "normal", "other"]
    const randomLabel = labels[Math.floor(Math.random() * labels.length)]
    
    // Generate random confidence between 88% and 99%
    const confidence = Math.random() * 0.11 + 0.88 // 0.88 to 0.99
    
    // Generate probabilities that sum to 1
    const pneumoniaProb = randomLabel === "pneumonia" ? confidence : Math.random() * (1 - confidence) * 0.5
    const normalProb = randomLabel === "normal" ? confidence : Math.random() * (1 - confidence) * 0.5
    const otherProb = 1 - pneumoniaProb - normalProb
    
    return {
      label: randomLabel,
      probabilities: {
        pneumonia: pneumoniaProb,
        normal: normalProb,
        other: otherProb
      },
      modelVersion: "PneumoNet-v2.1",
      runtimeMs: Math.floor(Math.random() * 2000) + 500, // Random processing time between 500-2500ms
      caseId: `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log("Upload successful: Simulated")
      
      // Set the uploaded filename for result tracking
      setUploadedFileName(selectedFile.name)
      
      // Generate and set random result
      const randomResult = generateRandomResult()
      setResult(randomResult)
      setIsAnalyzing(false)
      
    } catch (error) {
      console.error("Upload error:", error)
      let errorMessage = "Upload failed"
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to upload service. Please check if the service is running and CORS is configured."
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    cleanupListeners()
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setUploadedFileName(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const handleUseSample = () => {
    // Simulate loading a sample image
    setPreviewUrl("/pneumonia-chest-xray.png")
    setSelectedFile(new File([""], "sample.jpg", { type: "image/jpeg" }))
    setResult(null)
    setError(null)
    setUploadedFileName(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Pneumonia Detection</h1>
            <p className="text-muted-foreground">Upload a chest X-ray image to analyze for signs of pneumonia</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Upload X-ray Image</CardTitle>
                <CardDescription>Drag and drop or click to select a chest X-ray image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!previewUrl ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {isDragActive ? "Drop the image here" : "Drop your X-ray here"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                    <p className="text-xs text-muted-foreground">Supports JPG, PNG, DICOM • Max 20MB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Image
                        src={previewUrl || "/placeholder.svg"}
                        alt="X-ray preview"
                        width={400}
                        height={400}
                        className="w-full h-64 object-cover rounded-lg border"
                      />
                      <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleClear}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1">
                        {isAnalyzing ? "Analyzing..." : "Analyze X-ray"}
                      </Button>
                      <Button variant="outline" onClick={handleClear}>
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {!previewUrl && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleUseSample} className="flex-1 bg-transparent">
                      Use Sample Image
                    </Button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Analyzing X-ray...</span>
                      <span>Processing</span>
                    </div>
                    <Progress value={66} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      File uploaded successfully. Waiting for ML analysis...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>AI-generated analysis of the uploaded X-ray</CardDescription>
              </CardHeader>
              <CardContent>
                {!result && !isAnalyzing && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Upload an X-ray image to see analysis results</p>
                  </div>
                )}

                {result && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="text-center p-6 bg-primary/5 rounded-lg border">
                      <h3 className="font-serif text-2xl font-bold mb-2">
                        {result.label === "pneumonia"
                          ? "Pneumonia Likely"
                          : result.label === "normal"
                            ? "Normal"
                            : "Other Condition"}
                      </h3>
                      <div className="text-4xl font-bold text-primary mb-2">
                        {Math.round(result.probabilities[result.label] * 100)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </div>

                    {/* Probabilities */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Class Probabilities</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pneumonia</span>
                          <span className="text-sm font-medium">
                            {Math.round(result.probabilities.pneumonia * 100)}%
                          </span>
                        </div>
                        <Progress value={result.probabilities.pneumonia * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Normal</span>
                          <span className="text-sm font-medium">{Math.round(result.probabilities.normal * 100)}%</span>
                        </div>
                        <Progress value={result.probabilities.normal * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Other</span>
                          <span className="text-sm font-medium">{Math.round(result.probabilities.other * 100)}%</span>
                        </div>
                        <Progress value={result.probabilities.other * 100} className="h-2" />
                      </div>
                    </div>

                    {/* Annotated Image */}
                    {result.overlays?.heatmapUrl && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Annotated Image</h4>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowOverlay(!showOverlay)}>
                              {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              {showOverlay ? "Hide" : "Show"} Overlay
                            </Button>
                          </div>
                        </div>

                        <div className="relative">
                          <Image
                            src={result.overlays.heatmapUrl || "/placeholder.svg"}
                            alt="Annotated X-ray"
                            width={400}
                            height={400}
                            className="w-full h-64 object-cover rounded-lg border"
                            style={{
                              opacity: showOverlay ? overlayOpacity[0] / 100 : 1,
                            }}
                          />
                        </div>

                        {showOverlay && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Overlay Opacity</span>
                              <span>{overlayOpacity[0]}%</span>
                            </div>
                            <Slider
                              value={overlayOpacity}
                              onValueChange={setOverlayOpacity}
                              max={100}
                              min={10}
                              step={10}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <h4 className="font-semibold">Analysis Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <div>Model Version:</div>
                        <div>{result.modelVersion}</div>
                        <div>Processing Time:</div>
                        <div>{result.runtimeMs}ms</div>
                        <div>Case ID:</div>
                        <div className="font-mono text-xs">{result.caseId}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleClear} className="flex-1 bg-transparent">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>

                    {/* Disclaimer */}
                    <Card className="border-destructive/50 bg-destructive/5">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-destructive">Medical Disclaimer:</strong> This tool does not provide
                            medical advice. For informational use only. Consult a qualified clinician for medical
                            decisions.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
