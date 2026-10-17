import { Link } from 'react-router-dom'
import { Calculator, Gift, CheckSquare, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TOOL_ITEMS } from '@/utils/constants'

const TOOL_ICONS = {
  'crop-calculator': Calculator,
  'gift-finder': Gift,
  'bundle-tracker': CheckSquare,
}

export function ToolCards() {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-[26px] sm:text-[30px] text-[var(--tx)]">
            Interactive Tools
          </h2>
          <p className="text-sm text-[var(--mu)] mt-0.5">
            Optimize your farm yields and community center progression
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOL_ITEMS.map((tool) => {
          const Icon = TOOL_ICONS[tool.id as keyof typeof TOOL_ICONS] || Calculator

          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--po)] rounded-[10px]"
            >
              <Card className="h-full transition-all group-hover:border-[var(--po)] group-hover:shadow-md flex flex-col justify-between">
                <CardHeader>
                  <div className="w-12 h-12 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)] flex items-center justify-center text-[var(--pr)] mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <CardTitle className="group-hover:text-[var(--lk)] transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <div className="px-5 pb-5 max-sm:px-3.5 max-sm:pb-3.5 flex items-center gap-1.5 text-xs font-bold text-[var(--lk)]">
                  <span>Open Tool</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
