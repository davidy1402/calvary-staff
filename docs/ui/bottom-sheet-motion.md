# Bottom sheet motion

The shared `BottomSheet` handles identity selection, assignment, roster details,
volunteer management, service settings, and WhatsApp preview. The reported issue
is opening stutter across these sheets in the phone PWA, not just identity selection.

## Rendering changes

- Keep the native modal dialog for focus trapping, inert background content,
  Escape handling, and stacking above sticky headers.
- Keep `::backdrop` transparent. A separate scrim fades using opacity rather than
  transitioning a full-screen background color.
- Animate only the panel transform. Prepare transform/opacity compositing hints
  before entry and clear them after entry completes (with a timer fallback).
- Open in a layout effect so the hidden starting position is established before
  paint. Two animation frames allow that starting surface to paint before movement.
- Initially focus the dialog, then focus a requested initial target after entry,
  only if the user has not moved focus. This avoids moving scroll containers or
  invoking an input keyboard during entry.
- Avoid a second entrance animation on the identity list. Use a smaller static
  panel shadow. Pointer tracking continues to update CSS without React renders.
- Cancel scheduled opening frames when closing, including an early Escape.
- Reduced motion skips the frame preparation delay and uses the existing CSS override.

## Verification and limits

Local browser checks: identity entry and dismissal, service settings, volunteer
management (784 descendants), WhatsApp preview, Escape, initial focus, compositing
hint release, and reduced-motion entry. No schedule edits or messages were made.

A single desktop Chromium trace per version recorded 5 versus 3 Paint events;
Layout events were 1 versus 2. These are diagnostic samples, not a benchmark or
an iPhone frame-rate measurement. The actual phone PWA symptom has not been
reproduced on the user's device. Confirm on the device after deploying this code:
first opening, repeated opening, closing during entry, scrolling within a sheet,
and keyboard entry after the sheet settles. Compare Safari and standalone PWA
on the same iOS version if stutter persists.

Reference: [WebKit animation guidance](https://webkit.org/blog/10266/web-animations-in-safari-13-1/).
