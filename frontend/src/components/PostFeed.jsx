import PostCard from "./PostCard.jsx";

export default function PostFeed() {
    return (
        <div className="space-y-6">
            <h4> Posts </h4>
            <PostCard />
            <PostCard />
            <PostCard />
        </div>
    );
}