import { Navigate, useLocation } from "react-router-dom";

/**
 * The standalone /slides page has been merged into /agent/powerpoint.
 * The unified Presentation Studio exposes the AI Agent and the Slide Editor
 * as two tabs of the same page (?tab=editor opens the editor directly).
 */
export default function SlidesRedirect() {
  const { search, hash } = useLocation();
  const params = new URLSearchParams(search);
  if (!params.get("tab")) params.set("tab", "editor");
  return <Navigate to={`/agent/powerpoint?${params.toString()}${hash}`} replace />;
}
