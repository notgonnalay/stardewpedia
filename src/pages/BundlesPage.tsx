import { useState } from 'react'
import { CheckCircle2, Circle, Gift, Landmark, Award } from 'lucide-react'
import { BUNDLES_DATA } from '@/data/bundles'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function BundlesPage() {
  const [activeRoomId, setActiveRoomId] = useState(BUNDLES_DATA[0].id)
  // Local state for checking items
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})

  const activeRoom = BUNDLES_DATA.find((r) => r.id === activeRoomId) || BUNDLES_DATA[0]

  const toggleItem = (itemId: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--mu)] mb-2">
          <span>Encyclopedia</span>
          <span>•</span>
          <span className="text-[var(--tx)] font-semibold">Community Center</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--tx)] flex items-center gap-3">
          <Landmark className="h-8 w-8 text-[var(--pr)]" />
          <span>Community Center Bundles Checklist</span>
        </h1>
        <p className="text-[var(--mu)] text-sm sm:text-base mt-2 max-w-2xl">
          Track required items, completion rewards, and unlockable farm facilities across all Community Center rooms.
        </p>
      </div>

      {/* Room Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
        {BUNDLES_DATA.map((room) => (
          <Button
            key={room.id}
            variant={activeRoomId === room.id ? 'default' : 'outline'}
            onClick={() => setActiveRoomId(room.id)}
            className="h-11 px-5 font-bold text-sm shrink-0 rounded-[8px]"
          >
            {room.name}
          </Button>
        ))}
      </div>

      {/* Room Reward Banner */}
      <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-[12px] p-4 sm:p-5 mb-8 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-[var(--mu)]">
              Room Completion Reward:
            </div>
            <div className="font-display font-bold text-lg text-[var(--tx)]">
              {activeRoom.reward}
            </div>
          </div>
        </div>
        <div className="text-xs font-mono text-[var(--mu)]">
          {activeRoom.bundles.length} Bundles in {activeRoom.name}
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeRoom.bundles.map((bundle) => {
          const doneCount = bundle.items.filter((item) => completedItems[`${bundle.id}-${item.id}`]).length
          const isComplete = doneCount >= bundle.slotsRequired

          return (
            <Card
              key={bundle.id}
              className={`border-2 transition-all ${
                isComplete
                  ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-[var(--line)] bg-[var(--card)]'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="font-display font-bold text-xl text-[var(--tx)]">
                      {bundle.name}
                    </h2>
                    <div className="text-xs text-[var(--mu)] mt-0.5">
                      Required slots: {bundle.slotsRequired} of {bundle.items.length} items
                    </div>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      isComplete
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[var(--sp2)] text-[var(--tx)]'
                    }`}
                  >
                    {doneCount}/{bundle.slotsRequired} Done
                  </span>
                </div>

                {/* Items Checklist */}
                <div className="space-y-2 mt-4">
                  {bundle.items.map((item) => {
                    const key = `${bundle.id}-${item.id}`
                    const isChecked = !!completedItems[key]

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(key)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-[8px] border transition-all text-left text-xs ${
                          isChecked
                            ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 line-through opacity-80'
                            : 'bg-[var(--bg)] border-[var(--line)] text-[var(--tx)] hover:border-[var(--po)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isChecked ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-[var(--mu)] shrink-0" />
                          )}
                          <span className="font-semibold">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[var(--mu)]">
                          x{item.quantity}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Bundle Reward */}
                <div className="mt-4 pt-3 border-t border-[var(--line)]/60 flex items-center gap-2 text-xs text-[var(--mu)]">
                  <Gift className="h-3.5 w-3.5 text-amber-500" />
                  <span>Bundle Reward: <strong className="text-[var(--tx)]">{bundle.reward}</strong></span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
