import { useRef, useState } from "react";
import LeftSidebar from "../components/LeftSidebar.jsx";
import MainFeed from "../components/MainFeed.jsx";
import RightSidebar from "../components/RightSidebar.jsx";

export default function Home() {
  const drawerWidth = 280;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const dragStartX = useRef(0);

  const handleDragStart = (e) => {
    dragStartX.current = e.clientX;
    setDragging(true);
    setDragX(0);
  };

  const handleDragMove = (e) => {
    if (!dragging) return;
    const dx = Math.max(0, Math.min(drawerWidth, e.clientX - dragStartX.current));
    setDragX(dx);
  };

  const handleDragEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > 120) {
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
    }
    setDragX(0);
  };

  const drawerTranslate = () => {
    if (dragging) return `translateX(${dragX - drawerWidth}px)`;
    return drawerOpen ? "translateX(0)" : `translateX(-${drawerWidth}px)`;
  };

  return (
    <div className="min-h-screen bg-[#0f1216] text-slate-100">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,#2a2f36_0%,#14181d_45%,#0f1216_100%)]" />

        {/* Mobile drag handle */}
        <div
          className="lg:hidden fixed top-0 left-0 h-full w-3 z-40"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        />

        {/* Mobile drawer */}
        <div
          className="lg:hidden fixed top-0 left-0 h-full z-50"
          style={{
            width: `${drawerWidth}px`,
            transform: drawerTranslate(),
            transition: dragging ? "none" : "transform 200ms ease",
          }}
        >
          <div className="h-full bg-[#1b2027]/95 backdrop-blur border-r border-white/10 shadow-2xl">
            <div className="p-4">
              <LeftSidebar />
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {(drawerOpen || dragging) && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Mobile floating button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden fixed bottom-6 left-6 z-40 bg-[#1b2027] text-slate-100 shadow-xl border border-white/10 rounded-full px-4 py-2 text-sm font-semibold"
        >
          Menu
        </button>

        <div className="relative px-4 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px] gap-6">
              {/* Left Sidebar */}
              <div className="hidden lg:block">
                <div className="sticky top-6 rounded-2xl bg-[#1b2027]/90 backdrop-blur border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-3">
                  <LeftSidebar />
                </div>
              </div>

              {/* Main Feed */}
              <div className="min-w-0">
                <div className="rounded-2xl bg-[#1b2027]/90 backdrop-blur border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-4 md:p-6">
                  <MainFeed />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="hidden xl:block">
                <div className="sticky top-6 rounded-2xl bg-[#1b2027]/90 backdrop-blur border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-3">
                  <RightSidebar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
