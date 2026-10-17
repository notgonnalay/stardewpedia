import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Fish, MapPin, Clock, CloudRain, Sun, Award, Sparkles } from 'lucide-react'
import { ItemSprite } from '@/components/common/ItemSprite'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SeasonBadge } from '@/components/common/SeasonBadge'
import { formatGold } from '@/utils/formatters'
import { getFishById, FISH_DATA } from '@/data/fish'

export function FishDetail() {
  const { id = 'catfish' } = useParams()
  const fish = getFishById(id) || FISH_DATA[0]

  return (
    <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--mu)] font-bold">
        <Link to="/" className="hover:text-[var(--lk)] transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/fish" className="hover:text-[var(--lk)] transition-colors">
          Fish
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[var(--tx)]">{fish.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[10px] border-2 border-[var(--line)] bg-[var(--card)]">
        <div className="flex items-center gap-4">
          <ItemSprite size={96} itemId={fish.id} label={fish.name} alt={fish.name} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-[34px] sm:text-[44px] text-[var(--tx)] leading-tight">
                {fish.name}
              </h1>
              {fish.isLegendary && (
                <Badge variant="outline" size="sm" className="bg-amber-100 text-amber-800 border-amber-300 font-bold">
                  ★ Legendary
                </Badge>
              )}
            </div>
            <p className="text-sm text-[var(--mu)] max-w-lg leading-relaxed">
              {fish.description}
            </p>
          </div>
        </div>

        <Link to="/fish">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>All Fish</span>
          </Button>
        </Link>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mu)]">
            <Clock className="h-4 w-4 text-[var(--pr)]" />
            <span>Active Hours</span>
          </div>
          <div className="font-display font-bold text-[20px] text-[var(--tx)] mt-2">
            {fish.time}
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mu)]">
            <Sparkles className="h-4 w-4 text-[var(--pr)]" />
            <span>Base Sell Price</span>
          </div>
          <div className="font-display font-bold text-[24px] text-[var(--tx)] mt-2">
            {formatGold(fish.basePrice)}
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mu)]">
            <Award className="h-4 w-4 text-[var(--pr)]" />
            <span>Difficulty & Behavior</span>
          </div>
          <div className="font-display font-bold text-[22px] text-[var(--tx)] mt-2 capitalize">
            {fish.difficulty} • {fish.behavior}
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mu)]">
            {fish.weather === 'rain' ? (
              <CloudRain className="h-4 w-4 text-blue-500" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
            <span>Weather</span>
          </div>
          <div className="font-display font-bold text-[22px] capitalize text-[var(--tx)] mt-2">
            {fish.weather === 'any' ? 'Any Weather' : `${fish.weather} Only`}
          </div>
        </Card>
      </div>

      {/* Seasons & Catch Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[20px] flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[var(--pr)]" />
              <span>Catch Locations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="divide-y divide-[var(--line)] text-sm">
              {fish.locations.map((loc) => (
                <li key={loc} className="py-2.5 font-medium text-[var(--tx)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--pr)]" />
                  {loc}
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <div className="text-xs font-bold text-[var(--mu)] mb-2 uppercase">Active Seasons:</div>
              <div className="flex flex-wrap gap-1.5">
                {fish.seasons.map((season) => (
                  <SeasonBadge key={season} season={season} size="md" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[20px] flex items-center gap-2">
              <Fish className="h-5 w-5 text-[var(--pr)]" />
              <span>Fishing Tips & Bundles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {fish.tips && (
              <div className="p-3.5 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)] text-xs leading-relaxed text-[var(--tx)]">
                <strong className="block font-bold text-[var(--lk)] mb-1">Catch Strategy:</strong>
                {fish.tips}
              </div>
            )}

            {fish.bundle ? (
              <div className="flex items-center gap-3 p-3.5 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)]">
                <ItemSprite size={48} itemId={fish.id} label={fish.name} />
                <div>
                  <div className="font-bold text-[var(--tx)]">{fish.bundle}</div>
                  <div className="text-xs text-[var(--mu)]">
                    Community Center • Fish Tank Room
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--mu)]">
                This fish is not required for any standard Community Center bundles.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
