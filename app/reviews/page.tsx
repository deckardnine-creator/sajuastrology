import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { GuestbookPage } from "@/components/guestbook/guestbook"

export const metadata = {
  title: 'Reviews',
  description: 'See what seekers are saying about their SajuAstrology cosmic readings.',
}

export default function ReviewsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <GuestbookPage />
      <Footer />
    </main>
  )
}
