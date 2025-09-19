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
import { apiService, PredictionResult } from "@/lib/api-service"

interface AnalysisResult {
  text: string
  modelVersion: string
  caseId: string
}

export default function DetectPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modelVersion, setModelVersion] = useState<string>(config.defaultModelVersion)


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.upload.acceptedTypes,
    maxSize: config.upload.maxSize,
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      console.log("Processing image with Flask backend...")
      
      // Call Flask API to process the image
      const predictionResult = await apiService.processImage(selectedFile, modelVersion)
      
      console.log("Processing successful:", predictionResult)
      
      // Convert Flask response to our AnalysisResult format
      const analysisResult: AnalysisResult = {
        text: predictionResult.text,
        modelVersion: `Model ${modelVersion}`,
        caseId: `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
      
      setResult(analysisResult)
      setIsAnalyzing(false)
      
    } catch (error) {
      console.error("Processing error:", error)
      let errorMessage = "Processing failed"
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to Flask backend. Please check if the service is running on port 5000 and CORS is configured."
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
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
                    {/* Model Version Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Model Version</label>
                      <div className="flex gap-2">
                        <Button
                          variant={modelVersion === "1" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setModelVersion("1")}
                          className="flex-1"
                        >
                          Model 1
                        </Button>
                        <Button
                          variant={modelVersion === "2" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setModelVersion("2")}
                          className="flex-1"
                        >
                          Model 2
                        </Button>
                      </div>
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
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleUseSample} className="flex-1 bg-transparent">
                        Use Sample Image
                      </Button>
                    </div>
                    
                    {/* Model Version Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Model Version</label>
                      <div className="flex gap-2">
                        <Button
                          variant={modelVersion === "1" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setModelVersion("1")}
                          className="flex-1"
                        >
                          Model 1
                        </Button>
                        <Button
                          variant={modelVersion === "2" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setModelVersion("2")}
                          className="flex-1"
                        >
                          Model 2
                        </Button>
                      </div>
                    </div>
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
                      <h3 className="font-serif text-2xl font-bold mb-4">
                        Analysis Result
                      </h3>
                      <div className="text-lg text-foreground mb-2">
                        {result.text}
                      </div>
                    </div>


                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <h4 className="font-semibold">Analysis Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <div>Model Version:</div>
                        <div>{result.modelVersion}</div>
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
