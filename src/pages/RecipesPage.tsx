import { useState, useMemo } from 'react'
import { Search, Utensils, Wrench, Sparkles, ChefHat } from 'lucide-react'
import { RECIPES_DATA } from '@/data/recipes'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function RecipesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'cooking' | 'crafting'>('all')
  const [search, setSearch] = useState('')

  const filteredRecipes = useMemo(() => {
    return RECIPES_DATA.filter((recipe) => {
      const matchesTab = activeTab === 'all' || recipe.kind === activeTab
      const matchesSearch =
        recipe.name.toLowerCase().includes(search.toLowerCase()) ||
        recipe.description.toLowerCase().includes(search.toLowerCase()) ||
        recipe.ingredients.some((i) => i.name.toLowerCase().includes(search.toLowerCase())) ||
        (recipe.buffs && recipe.buffs.toLowerCase().includes(search.toLowerCase()))

      return matchesTab && matchesSearch
    })
  }, [activeTab, search])

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--mu)] mb-2">
          <span>Encyclopedia</span>
          <span>•</span>
          <span className="text-[var(--tx)] font-semibold">Recipes</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--tx)] flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-[var(--pr)]" />
          <span>Cooking & Crafting Recipes</span>
        </h1>
        <p className="text-[var(--mu)] text-sm sm:text-base mt-2 max-w-2xl">
          Browse ingredient requirements, energy and health replenishment, skill buffs, and unlock sources for all recipes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-[12px] p-4 mb-8 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mu)]" />
          <Input
            type="text"
            placeholder="Search by recipe name, ingredient, or buff (e.g. Speed)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-[var(--bg)] border-[var(--line)]"
          />
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className="h-10 text-xs font-bold px-3.5"
          >
            All Recipes
          </Button>
          <Button
            variant={activeTab === 'cooking' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cooking')}
            className="h-10 text-xs font-bold px-3.5 gap-1.5"
          >
            <Utensils className="h-3.5 w-3.5" />
            Cooking
          </Button>
          <Button
            variant={activeTab === 'crafting' ? 'default' : 'outline'}
            onClick={() => setActiveTab('crafting')}
            className="h-10 text-xs font-bold px-3.5 gap-1.5"
          >
            <Wrench className="h-3.5 w-3.5" />
            Crafting
          </Button>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecipes.map((recipe) => (
          <Card
            key={recipe.id}
            className="border-2 border-[var(--line)] bg-[var(--card)] hover:border-[var(--po)] transition-all shadow-xs flex flex-col justify-between"
          >
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)] flex items-center justify-center text-[var(--tx)]">
                      {recipe.kind === 'cooking' ? (
                        <Utensils className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-xl text-[var(--tx)]">
                        {recipe.name}
                      </h2>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)]">
                        {recipe.kind}
                      </span>
                    </div>
                  </div>

                  {recipe.buffs && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                      <Sparkles className="h-2.5 w-2.5" />
                      Buff
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--mu)] leading-relaxed mt-2">
                  {recipe.description}
                </p>

                {/* Buffs and Energy/Health */}
                {(recipe.buffs || recipe.energy) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono font-bold">
                    {recipe.buffs && (
                      <span className="bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded">
                        {recipe.buffs}
                      </span>
                    )}
                    {recipe.energy && (
                      <span className="bg-[var(--sp2)] text-[var(--tx)] px-2 py-0.5 rounded">
                        +{recipe.energy} Energy / +{recipe.health} HP
                      </span>
                    )}
                  </div>
                )}

                {/* Ingredients */}
                <div className="mt-4 pt-3 border-t border-[var(--line)]/60">
                  <div className="text-xs font-bold text-[var(--tx)] mb-2">
                    Ingredients:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.ingredients.map((ing) => (
                      <span
                        key={ing.name}
                        className="text-[11px] font-medium bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 rounded text-[var(--tx)]"
                      >
                        {ing.name} <strong className="font-mono text-[var(--mu)]">x{ing.quantity}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Source */}
              <div className="mt-2 text-[11px] text-[var(--mu)] bg-[var(--sp2)]/70 p-2.5 rounded-[6px]">
                <strong className="text-[var(--tx)]">Source:</strong> {recipe.source}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
