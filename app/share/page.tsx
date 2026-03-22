import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { ShareCardGallery } from "@/components/share/share-card-gallery"

export default function SharePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              Share Your <span className="gold-gradient-text">Archetype</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Download your personalized cosmic card and share it with the world.
            </p>
          </div>
          <ShareCardGallery />
        </div>
      </section>
      <Footer />
    </main>
  )
}
