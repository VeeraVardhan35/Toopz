import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import {
  getUserProfile,
  getUserPosts,
  getUserGroups,
  updateUserProfile,
} from "../api/profile.api.js";
import { BATCHES, DEPARTMENTS } from "../constants/enums.js";

export default function Profile() {
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    department: "",
    batch: "",
  });
  const [profilePreview, setProfilePreview] = useState("");
  const [profileFile, setProfileFile] = useState(null); // Store actual file

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const DEFAULT_COVER_IMAGE =
    "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop";

  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get("userId") || currentUser.id;

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileResponse, postsResponse, groupsResponse] = await Promise.all([
        getUserProfile(userId),
        getUserPosts(userId, 20),
        getUserGroups(userId),
      ]);

      setProfile(profileResponse.user);
      setPosts(postsResponse.posts || []);
      setGroups(groupsResponse.groups || []);
      setFormState({
        name: profileResponse.user?.name || "",
        department: profileResponse.user?.department || "",
        batch: profileResponse.user?.batch || "",
      });
      setProfilePreview(profileResponse.user?.profileUrl || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
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

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store the actual file for later upload
    setProfileFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString() || "";
      setProfilePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5500/api/v1/users/upload-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.profileUrl; // Assuming backend returns { profileUrl: "cloudinary-url" }
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      let profileUrl = profile.profileUrl;

      // If user selected a new profile image, upload it first
      if (profileFile) {
        setUploadingImage(true);
        profileUrl = await uploadImageToCloudinary(profileFile);
        setUploadingImage(false);
      }

      const payload = {
        name: formState.name,
        department: formState.department || null,
        batch: formState.batch || null,
        profileUrl,
      };

      console.log("Saving profile with payload:", payload);

      const response = await updateUserProfile(payload);
      
      setProfile((prev) => ({
        ...prev,
        ...response.user,
      }));
      
      setProfilePreview(response.user.profileUrl);
      setEditing(false);
      setProfileFile(null);
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E2329]">
      {/* Header */}
      <div className="bg-[#252B36] border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={profilePreview || profile.profileUrl || DEFAULT_PROFILE_IMAGE}
              alt={profile.name}
              className="w-10 h-10 rounded-full"
            />
            <h1 className="text-xl font-bold text-white">{profile.name}</h1>
          </div>
          <div className="flex items-center gap-3">
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
                  src={DEFAULT_COVER_IMAGE}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative px-8 pb-6">
                <div className="absolute -top-20 left-8">
                  <img
                    src={profilePreview || profile.profileUrl || DEFAULT_PROFILE_IMAGE}
                    alt={profile.name}
                    className="w-40 h-40 rounded-full border-4 border-[#252B36] object-cover"
                  />
                  {isOwnProfile && editing && (
                    <label className="mt-2 block text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                      {uploadingImage ? "Uploading..." : "Change Photo"}
                    </label>
                  )}
                </div>

                <div className="pt-24">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profile.name}
                  </h1>
                  <p className="text-gray-400 mb-2">{profile.email}</p>
                  <p className="text-gray-300 mb-2 capitalize">Role: {profile.role}</p>
                  <p className="text-gray-300 mb-2">
                    Department: {profile.department || "N/A"}
                  </p>
                  <p className="text-gray-300 mb-2">Batch: {profile.batch || "N/A"}</p>
                  {profile.university?.name && (
                    <p className="text-gray-300 mb-2">
                      University: {profile.university.name} ({profile.university.domain})
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-6 text-gray-300">
                  <div>
                    <span className="text-white font-bold">
                      {profile.stats?.posts ?? 0}
                    </span>{" "}
                    Posts
                  </div>
                  <div>
                    <span className="text-white font-bold">
                      {profile.stats?.groups ?? 0}
                    </span>{" "}
                    Groups
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="mt-6">
                    <button
                      onClick={() => setEditing((prev) => !prev)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {editing ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>
                )}

                {isOwnProfile && editing && (
                  <div className="mt-6 bg-[#242A33] rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Name</label>
                        <input
                          type="text"
                          value={formState.name}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              name: event.target.value,
                            }))
                          }
                          className="w-full bg-[#1E2329] border border-gray-700 rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          Department
                        </label>
                        <select
                          value={formState.department || ""}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              department: event.target.value,
                            }))
                          }
                          className="w-full bg-[#1E2329] border border-gray-700 rounded px-3 py-2 text-white"
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map((dep) => (
                            <option key={dep} value={dep}>
                              {dep}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Batch</label>
                        <select
                          value={formState.batch || ""}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              batch: event.target.value,
                            }))
                          }
                          className="w-full bg-[#1E2329] border border-gray-700 rounded px-3 py-2 text-white"
                        >
                          <option value="">Select Batch</option>
                          {BATCHES.map((batch) => (
                            <option key={batch} value={batch}>
                              {batch}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || uploadingImage}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? "Uploading image..." : saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.length === 0 ? (
                  <div className="text-gray-400">No posts yet.</div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="bg-[#252B36] rounded-lg p-4">
                      <p className="text-white mb-2">
                        {post.content || "No content"}
                      </p>
                      {post.group?.name && (
                        <p className="text-gray-400 text-sm">
                          Group: {post.group.name}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "groups" && (
              <div className="space-y-4">
                {groups.length === 0 ? (
                  <div className="text-gray-400">No groups yet.</div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-[#252B36] rounded-lg p-6 hover:bg-[#2C3440] transition-colors"
                    >
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {group.name}
                        </h3>
                        <p className="text-gray-400 text-sm capitalize">
                          Role: {group.role}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Joined {new Date(group.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}