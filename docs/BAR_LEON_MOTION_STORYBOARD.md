# BAR LEÓN — Motion storyboard (Fajalauza Vivo prototype)

Branch `design/fajalauza-vivo-prototype` · 2026-07-12
Constraints honoured: transform/opacity only · no loops · no scroll-jacking · no autoplay · no external animation library · total motion JS < 2 KB.

"Fable" column = whether a dedicated motion-design tool would add real value over the hand-written CSS/JS, per animation.

| # | Animation | Trigger | Duration / easing | Purpose | Implementation | Reduced-motion fallback | Fable worth it? |
|---|---|---|---|---|---|---|---|
| 1 | Section fade-rise | IntersectionObserver, 15% visible, −30 px margin; once per element | 400 ms, ease-out, stagger 60 ms (max 3) | Settle the page in reading order; avoid wall-of-content | `.reveal` → `.is-in`, CSS transition on opacity + translateY(12px) | Opacity-only, 150 ms linear | No — trivial in CSS |
| 2 | Button colour shift | :hover / :focus-visible | 150 ms, ease | Feedback without movement | CSS `transition: background-color, color, border-color` | Kept (colour only, no motion) | No |
| 3 | Image scale | :hover on `.img-frame` | scale 1.02, 500 ms, ease-out | Signal "this is a photograph you can look at" | CSS transform on img inside overflow:hidden frame | Disabled | No |
| 4 | Ramo + pomegranate stroke reveal | IO when History section enters | 800 ms, ease-out, stroke-dashoffset → 0 | The one crafted moment: the facade's foliage "draws itself" beside 1959 | Inline SVG, `--len` custom property per path, CSS `@keyframes motifDraw` | Fully drawn from load (offset forced to 0) | **Maybe** — if the traced ornament kit becomes multi-path and choreographed, a motion tool could help time 10+ paths; for the current 5-path sprig, no |
| 5 | Sticky mobile bar entrance | scroll > 320 px (passive listener) | 200 ms, ease-out, translateY | Keep Llamar/Carta reachable without stealing the first viewport | `.is-visible` class toggle, CSS transform | No transition (instant show/hide) | No |
| 6 | Category change (carta) | Chip tap → anchor; scrollspy via IO (−30%/−60% margins) | Native smooth scroll; chip recentres `inline:'center'` | Orientation inside a long carta | `scroll-behavior: smooth`, `scrollIntoView`, `.active` swap | `scroll-behavior: auto`, instant jump | No |

**Explicitly not implemented:** hero parallax (listed in the redirection brief as optional; dropped here to keep the LCP element static and CLS at 0), continuous decorative loops, page-transition effects, autoplaying the two Instagram videos.

**Performance notes:** LCP = hero `<img fetchpriority="high">`, no animation applied to it; all animated properties compositable; IO everywhere (no scroll-position reads except the 320 px bar threshold, passive); fonts `display=swap`.

**Verdict on Fable overall:** not needed for this prototype or its production integration. Reconsider only if the traced Fajalauza ornament kit grows into choreographed multi-path sequences (row 4).
