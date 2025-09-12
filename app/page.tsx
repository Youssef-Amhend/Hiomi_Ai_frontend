import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Upload, Brain, FileText, Shield, Clock, AlertTriangle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Full Screen */}
        <section className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              AI-assisted pneumonia detection from chest X-rays
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload a chest X-ray to get a probability estimate and visualization in seconds. For educational and
              research purposes only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/detect">Try the Demo</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">Upload</h3>
                <p className="text-muted-foreground">Upload your chest X-ray image in JPG, PNG, or DICOM format</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">Analyze</h3>
                <p className="text-muted-foreground">Our AI model analyzes the image for signs of pneumonia</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">Review</h3>
                <p className="text-muted-foreground">Get detailed results with confidence scores and visualizations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Model Overview */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Model Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Sensitivity</CardTitle>
                  <CardDescription>True positive rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">92.5%</div>
                  <p className="text-sm text-muted-foreground mt-2">Correctly identifies pneumonia cases</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Specificity</CardTitle>
                  <CardDescription>True negative rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">89.3%</div>
                  <p className="text-sm text-muted-foreground mt-2">Correctly identifies normal cases</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">Important Disclaimer</h4>
                    <p className="text-sm text-muted-foreground">
                      This tool is for research and educational purposes only. It does not provide medical advice and
                      should not be used for clinical diagnosis. Always consult a qualified healthcare professional for
                      medical decisions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Privacy & Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <Shield className="w-8 h-8 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Secure Processing</h3>
                  <p className="text-muted-foreground">
                    All images are processed securely and deleted immediately after analysis
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="w-8 h-8 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">No Storage</h3>
                  <p className="text-muted-foreground">
                    We don't store your images or personal data without explicit consent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What file types are supported?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We support JPG, JPEG, PNG, and DICOM (.dcm) files up to 20MB in size.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How long does analysis take?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Most analyses complete within 5-10 seconds, depending on image size and server load.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I use this for medical diagnosis?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No, this tool is strictly for educational and research purposes. It should never be used for
                    clinical diagnosis or medical decision-making.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
