export default function EmailSidebar({
  activeCategory,
  onCategoryChange,
  onComposeClick,
  unreadCounts,
}) {
  const categories = [
    {
      id: "all",
      label: "All Messages",
      icon: "🎁",
      color: "text-red-400",
    },
    {
      id: "important",
      label: "Important",
      icon: "📢",
      color: "text-red-400",
      count: unreadCounts.important,
    },
    {
      id: "Academic",
      label: "Academic",
      icon: "👥",
      color: "text-green-400",
    },
    {
      id: "Clubs",
      label: "Clubs & Activities",
      icon: "🎨",
      color: "text-blue-400",
    },
    {
      id: "Lost & Found",
      label: "Lost & Found",
      icon: "🟡",
      color: "text-yellow-400",
      count: 3,
    },
    {
      id: "Optional / Misc",
      label: "Optional / Misc",
      icon: "🟣",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="w-72 bg-[#252B36] p-4 flex flex-col gap-4 h-full min-h-0 overflow-y-auto">
      {/* Compose Button */}
      <button
        onClick={onComposeClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <span className="text-xl">+</span>
        <span>Compose</span>
      </button>

      {/* Categories */}
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              activeCategory === category.id
                ? "bg-[#2C3440]"
                : "hover:bg-[#2C3440]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${category.color}`}>
                {category.icon}
              </span>
              <span className="text-white font-medium">{category.label}</span>
            </div>
            {category.count > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                {category.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
