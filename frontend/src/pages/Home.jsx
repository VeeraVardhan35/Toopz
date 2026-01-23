import LeftSidebar from "../components/LeftSidebar.jsx";
import MainFeed from "../components/MainFeed.jsx";
import RightSidebar from "../components/RightSidebar.jsx";

export default  function Home() {
    return (
        <div className="min-h-screen flex gap-6 p-6">
            <div className="w-1/5">
                <LeftSidebar />
            </div>
            <div className="w-3/5">
                <MainFeed />
            </div>
            <div className="w-1/5">
                <RightSidebar />
            </div>
        </div>
    );
}