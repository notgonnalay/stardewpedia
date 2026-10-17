import { ShieldAlert } from 'lucide-react'

export function LegalDisclaimer() {
  return (
    <aside
      aria-label="Legal and Intellectual Property Disclaimer"
      className="w-full rounded-[10px] border-2 border-[var(--line)] bg-[var(--sp2)]/40 p-4 sm:p-5 text-xs text-[var(--mu)] leading-relaxed"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-[var(--po)] shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <div className="font-display font-bold text-sm text-[var(--tx)] tracking-normal">
            Unofficial Fan Project &amp; Rights Notice
          </div>
          <p>
            <strong>Stardewpedia</strong> is an independent, non-commercial, unofficial fan project created for the player community. This website is not affiliated with, maintained, authorized, endorsed, or sponsored by ConcernedApe LLC.
          </p>
          <p>
            <strong>Stardew Valley</strong>, along with all associated game trademarks, character names, crop and fish designs, sprite artwork, and lore belong exclusively to their respective rights holders (ConcernedApe). All game information and sprite representations are presented under Fair Use for informational, reference, and educational purposes.
          </p>
        </div>
      </div>
    </aside>
  )
}
