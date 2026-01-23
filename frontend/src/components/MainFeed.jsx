import Stories from "./Stories.jsx";
import PostFeed from "./PostFeed.jsx";

export default function MainFeed() {
    return (
        <div className="space-y-8">
            <h2>Main Feed</h2>
            <Stories />
            <PostFeed />
        </div>
    );
}
