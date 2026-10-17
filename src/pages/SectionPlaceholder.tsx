import { Link, useLocation } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { capitalize } from '@/utils/formatters'

export function SectionPlaceholder() {
  const location = useLocation()
  const sectionName = capitalize(location.pathname.replace('/', '').replace('-', ' '))

  return (
    <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-12 flex flex-col items-center justify-center text-center">
      <Card className="max-w-lg p-8">
        <CardHeader className="p-0 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[var(--sp2)] border border-[var(--line)] flex items-center justify-center text-[var(--pr)] mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <CardTitle className="text-[28px]">{sectionName} Guide</CardTitle>
          <CardDescription className="text-base mt-2">
            This section is part of the roadmap outlined in the system architecture and design plan.
          </CardDescription>
        </CardHeader>

        <div className="mt-8 flex justify-center">
          <Link to="/">
            <Button variant="default" size="default" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  )
}
