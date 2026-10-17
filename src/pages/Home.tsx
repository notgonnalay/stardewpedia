import { Hero } from '@/components/home/Hero'
import { ToolCards } from '@/components/home/ToolCards'
import { BrowseSection } from '@/components/home/BrowseSection'
import { PopularSection } from '@/components/home/PopularSection'
import { useSeason } from '@/context/SeasonContext'

export function Home() {
  const { activeSeason } = useSeason()

  return (
    <main
      data-season={activeSeason || undefined}
      className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-8 space-y-4"
    >
      <Hero />
      <PopularSection />
      <ToolCards />
      <BrowseSection />
    </main>
  )
}
