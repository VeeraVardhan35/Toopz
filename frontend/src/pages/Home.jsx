import LeftSidebar from "../components/LeftSidebar.jsx";
import MainFeed from "../components/MainFeed.jsx";
import RightSidebar from "../components/RightSidebar.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-1/5 sticky top-6 self-start">
          <LeftSidebar />
        </div>

        {/* Main Feed */}
        <div className="w-full lg:w-3/5">
          <MainFeed />
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-1/5 sticky top-6 self-start">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}