import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

export default function Profile() {
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const DEFAULT_COVER_IMAGE =
    "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop";

  // Get userId from URL query: ?userId=123
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get("userId") || currentUser.id;

  useEffect(() => {
    fetchProfile();
    fetchUserContent();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Mock profile data
      const mockProfile = {
        id: userId,
        name: "Prof. Anya Sharma",
        email: "anya.sharma@university.edu",
        role: "professor",
        department: "Computer Science",
        batch: null,
        profileUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        coverUrl: DEFAULT_COVER_IMAGE,
        bio: "AI Ethics Researcher, Passionate about decentralized learning & student mentorship. Office hours: Mon/Wed 10 AM.",
        title: "Professor - Computer Science Dept",
        followersCount: 234,
        followingCount: 89,
        postsCount: 45,
      };

      setProfile(mockProfile);
      setIsFollowing(false); // mock follow status
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      // Mock posts
      setPosts([
        {
          id: "1",
          title: "Research Paper on Anomalies of Ermest with Wastra astronauts",
          image:
            "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=300&h=200&fit=crop",
          author: "Prof. Anya Sharma",
          date: "2 days ago",
        },
        {
          id: "2",
          title: "Class Field Trip",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop",
          author: "Prof. Anya Sharma",
          date: "5 days ago",
        },
      ]);

      // Mock groups
      setGroups([
        { id: "1", name: "AI Research Lab", members: 45 },
        { id: "2", name: "CS Department", members: 120 },
      ]);
    } catch (error) {
      console.error("Error fetching user content:", error);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    window.location.href = `/messages?userId=${profile.id}`;
  };

  const goBack = () => window.history.back();
  const goHome = () => (window.location.href = "/");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E2329]">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E2329]">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  const isOwnProfile = profile.id === currentUser.id;

  return (
    <div className="min-h-screen bg-[#1E2329]">
      {/* Header */}
      <div className="bg-[#252B36] border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={profile.profileUrl || DEFAULT_PROFILE_IMAGE}
              alt={profile.name}
              className="w-10 h-10 rounded-full"
            />
            <h1 className="text-xl font-bold text-white">{profile.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFollow}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
            {!isOwnProfile && (
              <button
                onClick={handleMessage}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Message
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 p-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-[#252B36] rounded-lg overflow-hidden">
              <nav className="p-2">
                <button
                  onClick={goBack}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#2C3440] rounded-lg transition-colors mb-2"
                >
                  Go Back
                </button>
                <button
                  onClick={goHome}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#2C3440] rounded-lg transition-colors"
                >
                  Home
                </button>
              </nav>
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1">
            {/* Profile Header */}
            <div className="bg-[#252B36] rounded-lg overflow-hidden mb-6">
              <div className="h-64 relative">
                <img
                  src={profile.coverUrl || DEFAULT_COVER_IMAGE}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative px-8 pb-6">
                <div className="absolute -top-20 left-8">
                  <img
                    src={profile.profileUrl || DEFAULT_PROFILE_IMAGE}
                    alt={profile.name}
                    className="w-40 h-40 rounded-full border-4 border-[#252B36] object-cover"
                  />
                </div>

                <div className="pt-24">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profile.name}
                  </h1>
                  <p className="text-gray-400 mb-4">{profile.title}</p>
                  <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-t border-gray-700">
                <div className="flex gap-8 px-8">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`py-4 border-b-2 transition-colors ${
                      activeTab === "posts"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`py-4 border-b-2 transition-colors ${
                      activeTab === "saved"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => setActiveTab("groups")}
                    className={`py-4 border-b-2 transition-colors ${
                      activeTab === "groups"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    Groups
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {activeTab === "posts" && (
              <div className="grid grid-cols-2 gap-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#252B36] rounded-lg overflow-hidden hover:scale-105 transition-all cursor-pointer"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{post.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "saved" && (
              <div className="bg-[#252B36] rounded-lg p-8 text-center text-gray-400">
                No saved posts yet
              </div>
            )}

            {activeTab === "groups" && (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-[#252B36] rounded-lg p-6 hover:bg-[#2C3440] transition-colors cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {group.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {group.members} members
                      </p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
