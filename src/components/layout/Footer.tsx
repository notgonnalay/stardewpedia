import { Logo } from '@/assets/brand/Logo'
import { LegalDisclaimer } from '@/components/common/LegalDisclaimer'
import { GAME_VERSION } from '@/utils/constants'

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-[var(--line)] bg-[var(--card)] pt-8 pb-28 md:pb-8 px-4 sm:px-8 mt-12 transition-colors">
      <div className="mx-auto max-w-[1100px] flex flex-col gap-6">
        {/* Prominent Legal & Intellectual Property Disclaimer */}
        <LegalDisclaimer />

        {/* Footer Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--line)]/60 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <Logo isMobile={true} />
            <span className="hidden sm:inline text-[var(--line)]">•</span>
            <span className="text-xs font-mono font-bold text-[var(--mu)]">
              Version {GAME_VERSION} Reference
            </span>
          </div>

          <div className="text-xs text-[var(--mu)]">
            Built with React &amp; Tailwind CSS • Unofficial Community Guide
          </div>
        </div>
      </div>
    </footer>
  )
}
