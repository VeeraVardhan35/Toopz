import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Profile() {
  const { userId } = useParams(); // Get userId from URL params, or use current user if not provided
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const DEFAULT_PROFILE_IMAGE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const DEFAULT_COVER_IMAGE = "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop";

  useEffect(() => {
    fetchProfile();
    fetchUserContent();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await getUserProfile(userId || currentUser.id);
      
      // Mock data for demonstration
      const mockProfile = {
        id: userId || currentUser.id,
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
      setIsFollowing(false); // Check if current user follows this profile
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      // Fetch user's posts and groups
      // const postsResponse = await getUserPosts(userId || currentUser.id);
      // const groupsResponse = await getUserGroups(userId || currentUser.id);
      
      // Mock data
      setPosts([
        {
          id: "1",
          title: "Research Paper on Anomalies of Ermest with Wastra astronauts",
          image: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=300&h=200&fit=crop",
          author: "Prof. Anya Sharma",
          date: "2 days ago"
        },
        {
          id: "2",
          title: "Class Field Trip",
          image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop",
          author: "Prof. Anya Sharma",
          date: "5 days ago"
        },
        {
          id: "3",
          title: "AI Ethics Discussion",
          image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=200&fit=crop",
          author: "Prof. Anya Sharma",
          date: "1 week ago"
        },
        {
          id: "4",
          title: "Conkwel Russia Gonce",
          image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=300&h=200&fit=crop",
          author: "Prof. Anya Sharma",
          date: "2 weeks ago"
        },
      ]);

      setGroups([
        { id: "1", name: "AI Research Lab", members: 45 },
        { id: "2", name: "CS Department", members: 120 },
      ]);
    } catch (error) {
      console.error("Error fetching user content:", error);
    }
  };

  const handleFollow = async () => {
    try {
      // API call to follow/unfollow user
      // await toggleFollow(profile.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleMessage = () => {
    navigate(`/messages?userId=${profile.id}`);
  };

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
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
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
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#2C3440] rounded-lg transition-colors mb-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Go Back</span>
                </button>

                <div className="border-t border-gray-700 my-2"></div>

                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#2C3440] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#2C3440] rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Messages</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#2C3440] rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Groups</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#2C3440] rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Saved</span>
                </button>

                <div className="mt-6">
                  <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1">
            {/* Profile Header */}
            <div className="bg-[#252B36] rounded-lg overflow-hidden mb-6">
              {/* Cover Image */}
              <div className="h-64 relative">
                <img
                  src={profile.coverUrl || DEFAULT_COVER_IMAGE}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="relative px-8 pb-6">
                {/* Profile Picture */}
                <div className="absolute -top-20 left-8">
                  <div className="relative">
                    <img
                      src={profile.profileUrl || DEFAULT_PROFILE_IMAGE}
                      alt={profile.name}
                      className="w-40 h-40 rounded-full border-4 border-[#252B36] object-cover"
                    />
                  </div>
                </div>

                {/* Profile Details */}
                <div className="pt-24">
                  <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
                  <p className="text-gray-400 mb-4">{profile.title}</p>
                  
                  <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  </div>
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

            {/* Content Grid */}
            {activeTab === "posts" && (
              <div className="grid grid-cols-2 gap-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#252B36] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-gray-400">{post.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "saved" && (
              <div className="bg-[#252B36] rounded-lg p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-gray-400">No saved posts yet</p>
              </div>
            )}

            {activeTab === "groups" && (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-[#252B36] rounded-lg p-6 hover:bg-[#2C3440] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{group.name}</h3>
                        <p className="text-gray-400 text-sm">{group.members} members</p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Contact Info */}
            <div className="bg-[#252B36] rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Follow</span>
                </button>
                <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Follett</span>
                </button>
              </div>
            </div>

            {/* Breel Groups */}
            <div className="bg-[#252B36] rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Breel Groups</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Cordinats</span>
                </button>
              </div>
            </div>

            {/* Shared Groups */}
            <div className="bg-[#252B36] rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Shared Groups</h3>
              <p className="text-gray-400 text-sm">No shared groups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}