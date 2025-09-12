import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Lead AI Researcher",
      image: "/female-doctor-headshot.png",
      bio: "Specializes in medical imaging AI with 10+ years experience in radiology.",
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Clinical Advisor",
      image: "/male-doctor-headshot.png",
      bio: "Board-certified radiologist with expertise in chest imaging and pneumonia diagnosis.",
    },
    {
      name: "Alex Kim",
      role: "Software Engineer",
      image: "/software-engineer-headshot.png",
      bio: "Full-stack developer focused on healthcare applications and AI model deployment.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Our Team</h1>
            <p className="text-xl text-muted-foreground">
              Meet the experts behind PneumoAI's advanced detection technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-serif text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
