import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Zap, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">About PneumoAI</h1>
            <p className="text-xl text-muted-foreground">
              Advancing medical education through AI-powered chest X-ray analysis
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="font-serif text-2xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PneumoAI is dedicated to advancing medical education and research through cutting-edge artificial
                intelligence. Our platform provides students, researchers, and educators with powerful tools to
                understand pneumonia detection in chest X-rays, fostering learning and innovation in medical imaging.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold mb-6">Our Approach</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Target className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Precision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Our AI models are trained on diverse datasets to provide accurate and reliable pneumonia detection
                      capabilities.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Zap className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Innovation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We continuously improve our algorithms using the latest advances in deep learning and medical
                      imaging research.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Shield className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Ethics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We prioritize responsible AI development with strict privacy protections and clear educational
                      disclaimers.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold mb-6">Educational Focus</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                PneumoAI is designed specifically for educational and research purposes. We believe in the power of AI
                to enhance medical education by providing interactive, visual learning experiences that help students
                and professionals better understand diagnostic imaging.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our platform is not intended for clinical use and should never replace professional medical judgment.
                Instead, it serves as a valuable tool for learning, research, and advancing our collective understanding
                of AI applications in healthcare.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
