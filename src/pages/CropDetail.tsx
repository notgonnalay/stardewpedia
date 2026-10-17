import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Calendar, Coins, Clock, Sparkles, ArrowLeft, Info } from 'lucide-react'
import { ItemSprite } from '@/components/common/ItemSprite'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGold } from '@/utils/formatters'
import { getCropById, CROPS_DATA } from '@/data/crops'

export function CropDetail() {
  const { id = 'parsnip' } = useParams()
  const crop = getCropById(id) || CROPS_DATA[0]
  const [activeTab, setActiveTab] = useState<'overview' | 'profit' | 'bundles'>('overview')
  const [plantedAmount, setPlantedAmount] = useState<number>(24)

  const seedCost = crop.seedPrice.pierres || crop.seedPrice.oasis || 20
  const netProfit = (crop.sellPrice.normal - seedCost) * plantedAmount

  // Calculated artisan values
  const juiceOrWinePrice = Math.round(crop.sellPrice.normal * 2.25)
  const picklesOrJamPrice = Math.round(crop.sellPrice.normal * 2 + 50)

  return (
    <main
      data-season={crop.seasons[0]}
      className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-6 space-y-6"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--mu)] font-bold">
        <Link to="/" className="hover:text-[var(--lk)] transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/crops" className="hover:text-[var(--lk)] transition-colors">
          Crops
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[var(--tx)]">{crop.name}</span>
      </nav>

      {/* Hero Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[10px] border-2 border-[var(--line)] bg-[var(--card)]">
        <div className="flex items-center gap-4">
          <ItemSprite size={96} itemId={crop.id} label={crop.name} alt={crop.name} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-[34px] sm:text-[44px] text-[var(--tx)] leading-tight">
                {crop.name}
              </h1>
              {crop.seasons.map((s) => (
                <Badge key={s} variant={s} size="sm" className="capitalize">
                  {s}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-[var(--mu)] max-w-lg leading-relaxed">
              {crop.description}
            </p>
          </div>
        </div>

        <Link to="/crops">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>All Crops</span>
          </Button>
        </Link>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mu)]">
            <Clock className="h-4 w-4 text-[var(--pr)]" />
            <span>Growth Time</span>
          </div>
          <div className="font-display font-bold text-[24px] text-[var(--tx)] mt-2">
            {crop.growthDays} Days
          </div>
          {crop.regrowDays && (
            <div className="text-xs text-[var(--mu)] mt-1 font-mono">
              Regrows: {crop.regrowDays}d
            </div>
          )}
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mu)]">
            <Coins className="h-4 w-4 text-[var(--pr)]" />
            <span>Seed Cost</span>
          </div>
          <div className="font-display font-bold text-[24px] text-[var(--tx)] mt-2">
            {formatGold(seedCost)}
          </div>
          <div className="text-xs text-[var(--mu)] mt-1 truncate">
            {crop.seedPrice.special || "Pierre's Shop"}
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mu)]">
            <Sparkles className="h-4 w-4 text-[var(--pr)]" />
            <span>Base Sell Price</span>
          </div>
          <div className="font-display font-bold text-[24px] text-[var(--tx)] mt-2">
            {formatGold(crop.sellPrice.normal)}
          </div>
          <div className="text-xs text-[var(--mu)] mt-1 font-mono">
            XP: +{crop.harvestXp}
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mu)]">
            <Calendar className="h-4 w-4 text-[var(--pr)]" />
            <span>Season</span>
          </div>
          <div className="font-display font-bold text-[24px] capitalize text-[var(--tx)] mt-2">
            {crop.seasons.join(', ')}
          </div>
          <div className="text-xs text-[var(--mu)] mt-1">
            {crop.isTrellis ? 'Trellis Crop' : 'Normal Crop'}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[var(--line)] pb-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          Pricing & Quality
        </Button>
        <Button
          variant={activeTab === 'profit' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('profit')}
        >
          Yield Calculator
        </Button>
        <Button
          variant={activeTab === 'bundles' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('bundles')}
        >
          Bundles & Uses
        </Button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sell Price Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[20px]">Sell Price by Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="border-b-2 border-[var(--line)] text-xs font-extrabold uppercase text-[var(--mu)]">
                      <th className="py-2">Quality</th>
                      <th className="py-2">Multiplier</th>
                      <th className="py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    <tr>
                      <td className="py-2.5 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                        Regular
                      </td>
                      <td className="py-2.5 text-[var(--mu)] font-mono">1.0x</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatGold(crop.sellPrice.normal)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
                        Silver
                      </td>
                      <td className="py-2.5 text-[var(--mu)] font-mono">1.25x</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatGold(crop.sellPrice.silver)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        Gold
                      </td>
                      <td className="py-2.5 text-[var(--mu)] font-mono">1.5x</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatGold(crop.sellPrice.gold)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        Iridium
                      </td>
                      <td className="py-2.5 text-[var(--mu)] font-mono">2.0x</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatGold(crop.sellPrice.iridium)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Artisan Goods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[20px]">Artisan Value (Estimated)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)]">
                <div>
                  <div className="font-bold text-[var(--tx)]">Pickles / Preserves</div>
                  <div className="text-xs text-[var(--mu)]">Preserves Jar (approx. 2-3 days)</div>
                </div>
                <div className="font-mono font-bold text-lg text-[var(--lk)]">
                  {formatGold(picklesOrJamPrice)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)]">
                <div>
                  <div className="font-bold text-[var(--tx)]">Juice / Wine</div>
                  <div className="text-xs text-[var(--mu)]">Keg (approx. 4-7 days)</div>
                </div>
                <div className="font-mono font-bold text-lg text-[var(--lk)]">
                  {formatGold(juiceOrWinePrice)}
                </div>
              </div>

              {crop.tips && (
                <div className="flex items-start gap-2 p-3 rounded-[8px] bg-amber-50/70 border border-amber-200/80 text-amber-950 dark:bg-amber-950/20 dark:border-amber-800/60 dark:text-amber-200 text-xs leading-relaxed">
                  <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Farming Tip:</strong> {crop.tips}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'profit' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[20px]">Interactive Yield Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="plantedAmount" className="block text-xs font-bold text-[var(--mu)] uppercase mb-2">
                Number of Crops Planted: {plantedAmount}
              </label>
              <input
                id="plantedAmount"
                type="range"
                min={1}
                max={200}
                value={plantedAmount}
                onChange={(e) => setPlantedAmount(Number(e.target.value))}
                className="w-full accent-[var(--po)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)]">
              <div>
                <div className="text-xs text-[var(--mu)]">Total Seed Cost</div>
                <div className="font-mono font-bold text-xl text-[var(--tx)]">
                  {formatGold(seedCost * plantedAmount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--mu)]">Gross Revenue</div>
                <div className="font-mono font-bold text-xl text-[var(--tx)]">
                  {formatGold(crop.sellPrice.normal * plantedAmount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--mu)]">Net Profit (1 harvest)</div>
                <div className="font-mono font-bold text-xl text-emerald-600 dark:text-emerald-400">
                  {formatGold(netProfit)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'bundles' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[20px]">Community Center Bundles</CardTitle>
          </CardHeader>
          <CardContent>
            {crop.bundle ? (
              <div className="flex items-center gap-3 p-4 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)]">
                <ItemSprite size={48} itemId={crop.id} label={crop.name} />
                <div>
                  <div className="font-bold text-[var(--tx)]">{crop.bundle}</div>
                  <div className="text-xs text-[var(--mu)] mt-0.5">
                    Pantry Room • Requires 1 normal or higher quality crop
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--mu)]">
                {crop.name} is not directly required for any standard Community Center bundles.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
