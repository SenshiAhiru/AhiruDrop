/**
 * Root-level template.
 *
 * Unlike `layout.tsx`, Next.js remounts a template on every route
 * change — which is exactly what we need to run a CSS keyframe on
 * each navigation. The `.page-transition-enter` class is defined in
 * globals.css and runs a quick fade + 8px slide-up.
 *
 * Keep this dead simple. No state, no client hooks. Server component.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition-enter">{children}</div>;
}
