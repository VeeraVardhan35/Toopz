import LeftSidebar from "../components/LeftSidebar.jsx";
import MainFeed from "../components/MainFeed.jsx";
import RightSidebar from "../components/RightSidebar.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex gap-3 p-3">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-[22%] flex-shrink-0">
          <div className="sticky top-3">
            <LeftSidebar />
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          <MainFeed />
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-[22%] flex-shrink-0">
          <div className="sticky top-3">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}