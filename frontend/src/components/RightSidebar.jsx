import { useAuth } from "../AuthContext.jsx";

export default function RightSidebar() {
    const { user } = useAuth();
    const DEFAULT_LOGO =
        "https://cdn-icons-png.flaticon.com/512/685/685815.png";

    return (
        <div className="p-4 space-y-8 text-slate-100">
            <div className="rounded-2xl border border-white/10 bg-[#1b2027]/90 backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-center">
                    <svg
                        width="220"
                        height="80"
                        viewBox="0 0 440 160"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="toopz logo"
                    >
                        <defs>
                            <linearGradient id="toopzGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#48D7FF" />
                                <stop offset="60%" stopColor="#7C8CFF" />
                                <stop offset="100%" stopColor="#A764FF" />
                            </linearGradient>
                        </defs>
                        <text
                            x="20"
                            y="110"
                            fontFamily="Poppins, ui-sans-serif, system-ui"
                            fontSize="120"
                            fontWeight="600"
                            fill="url(#toopzGrad)"
                            letterSpacing="-2"
                        >
                            toopz
                        </text>
                        <circle cx="405" cy="56" r="6" fill="#A764FF" />
                        <circle cx="423" cy="56" r="6" fill="#A764FF" />
                        <circle cx="405" cy="76" r="6" fill="#A764FF" />
                        <circle cx="423" cy="76" r="6" fill="#A764FF" />
                    </svg>
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">
                    Stay updated with your campus feed
                </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1b2027]/90 backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-[#14181d] flex items-center justify-center">
                        <img
                            src={user?.university?.logoUrl || DEFAULT_LOGO}
                            alt={user?.university?.name || "University"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            University
                        </p>
                        <p className="text-sm font-semibold text-slate-100 truncate">
                            {user?.university?.name || "Your University"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {user?.university?.domain || "university.edu"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1b2027]/90 backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">Campus Pulse</h4>
                    <span className="text-[10px] text-slate-400">Live</span>
                </div>
                <div className="mt-4 space-y-3">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-2/3 bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400" />
                    </div>
                    <p className="text-xs text-slate-400">
                        A clean, calm space for updates, without noise.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1b2027]/90 backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <h4 className="text-sm font-semibold text-slate-200">Quick Tips</h4>
                <ul className="mt-3 text-xs text-slate-400 space-y-2">
                    <li>Keep posts concise for better reach.</li>
                    <li>Use clear titles and visuals.</li>
                    <li>Engage with comments to boost visibility.</li>
                </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1b2027] via-[#171b21] to-[#12161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-violet-400" />
                    <div>
                        <p className="text-sm font-semibold text-slate-100">Toopz Daily</p>
                        <p className="text-xs text-slate-400">Your calm space for campus life.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
