import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { SearchDialog } from '@/components/common/SearchDialog'
import { Home } from '@/pages/Home'
import { CropsPage } from '@/pages/CropsPage'
import { CropDetail } from '@/pages/CropDetail'
import { FishPage } from '@/pages/FishPage'
import { FishDetail } from '@/pages/FishDetail'
import { VillagersPage } from '@/pages/VillagersPage'
import { BundlesPage } from '@/pages/BundlesPage'
import { RecipesPage } from '@/pages/RecipesPage'
import { SectionPlaceholder } from '@/pages/SectionPlaceholder'

export default function App() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--bg)] text-[var(--tx)] antialiased transition-colors">
      <Header />
      
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Encyclopedia Routes */}
          <Route path="/crops" element={<CropsPage />} />
          <Route path="/crops/:id" element={<CropDetail />} />
          <Route path="/fish" element={<FishPage />} />
          <Route path="/fish/:id" element={<FishDetail />} />
          <Route path="/villagers" element={<VillagersPage />} />
          <Route path="/bundles" element={<BundlesPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          
          {/* Roadmap & Feature Routes */}
          <Route path="/calendar" element={<SectionPlaceholder />} />
          <Route path="/festivals" element={<SectionPlaceholder />} />
          <Route path="/quests" element={<SectionPlaceholder />} />
          <Route path="/achievements" element={<SectionPlaceholder />} />
          <Route path="/monster-goals" element={<SectionPlaceholder />} />
          <Route path="/random-events" element={<SectionPlaceholder />} />
          <Route path="/tools/*" element={<SectionPlaceholder />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      <Footer />
      <MobileBottomNav />
      <SearchDialog />
    </div>
  )
}
