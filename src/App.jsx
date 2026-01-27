import { useEffect, useState, useMemo } from "react";

// Replace with your actual API base URL
const API_BASE = "https://your-api.vercel.app"; // PROMENI OVO!

function getTgInitData() {
  return window?.Telegram?.WebApp?.initData || "";
}

function getTgUser() {
  return window?.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

const CLOWN_IMAGES = {
  0: "/images/clowns/0.png",
  1: "/images/clowns/1.png",
  2: "/images/clowns/2.png",
  3: "/images/clowns/3.png",
  4: "/images/clowns/4.png",
  5: "/images/clowns/5.png",
  6: "/images/clowns/6.png",
};

function getClownImage(level) {
  if (level >= 6) return CLOWN_IMAGES[6];
  if (level >= 5) return CLOWN_IMAGES[5];
  if (level >= 4) return CLOWN_IMAGES[4];
  if (level >= 3) return CLOWN_IMAGES[3];
  if (level >= 2) return CLOWN_IMAGES[2];
  if (level >= 1) return CLOWN_IMAGES[1];
  return CLOWN_IMAGES[0];
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [myData, setMyData] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editLocation, setEditLocation] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const tgUser = getTgUser();

  // Filter & sort
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      [u.first_name, u.username, u.clown_name, u.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [users, q]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
  }, [filtered]);

  // Init Telegram WebApp
  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();
    tg?.setHeaderColor?.("#111827");
    tg?.setBackgroundColor?.("#111827");
  }, []);

  // Load users
  const loadUsers = async () => {
    setErr("");
    try {
      const initData = getTgInitData();
      const r = await fetch(`${API_BASE}/api/users`, {
        headers: initData ? { "x-telegram-init-data": initData } : {},
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setUsers(Array.isArray(data) ? data : []);

      // Find my data
      if (tgUser?.id) {
        const me = data.find((u) => u.telegram_id === tgUser.id);
        if (me) {
          setMyData(me);
          setEditLocation(me.location || "");
          setEditStatus(me.status_message || "");
        }
      }
    } catch (e) {
      setErr(String(e?.message || e));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Level up
  const handleLevelUp = async () => {
    if (!tgUser?.id || saving) return;
    setSaving(true);
    try {
      const initData = getTgInitData();
      const r = await fetch(`${API_BASE}/api/level-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { "x-telegram-init-data": initData } : {}),
        },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await loadUsers();
      window.Telegram?.WebApp?.showAlert?.("✅ Level povećan!");
    } catch (e) {
      window.Telegram?.WebApp?.showAlert?.(`❌ Greška: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!tgUser?.id || saving) return;
    setSaving(true);
    try {
      const initData = getTgInitData();
      const r = await fetch(`${API_BASE}/api/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { "x-telegram-init-data": initData } : {}),
        },
        body: JSON.stringify({
          location: editLocation.trim() || null,
          status_message: editStatus.trim() || null,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await loadUsers();
      window.Telegram?.WebApp?.showAlert?.("✅ Profil sačuvan!");
    } catch (e) {
      window.Telegram?.WebApp?.showAlert?.(`❌ Greška: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white">
      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-4 text-center font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-orange-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🤡 Klovnovi
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-4 text-center font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-orange-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            👤 Ja
          </button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="p-4 pb-24 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">🤡 Klovn Dashboard 🤡</h1>
            <p className="text-gray-400">Klovnovi u realnom vremenu</p>
          </div>

          {/* Search */}
          <div className="flex gap-2 mb-6">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="🔍 Traži klovnove..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-600 bg-gray-800 text-white outline-none focus:border-orange-500 transition-colors"
            />
            <button
              onClick={loadUsers}
              className="px-4 py-3 rounded-xl border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              ↻
            </button>
          </div>

          {/* Error */}
          {err && (
            <div className="mb-6 p-4 bg-red-900 border-2 border-red-700 rounded-xl">
              <div className="font-semibold text-red-200">❌ Greška: {err}</div>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-3">
            {sorted.map((u) => {
              const level = u.level ?? 0;
              const clownImg = getClownImage(level);

              return (
                <div
                  key={u.telegram_id}
                  className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-xl border border-gray-600 hover:border-orange-600 transition-all overflow-hidden"
                >
                  <div className="flex">
                    <div className="relative w-28 flex-shrink-0 bg-gray-900">
                      <img
                        src={clownImg}
                        alt={`Level ${level}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" font-size="40" text-anchor="middle" dy=".3em"%3E🤡%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-xs px-2 py-1 rounded-lg shadow-lg border border-orange-400">
                        LVL {level}
                      </div>
                    </div>

                    <div className="flex-1 p-4 min-w-0">
                      <div className="mb-2">
                        <div className="font-bold text-lg truncate">
                          {u.clown_name || u.first_name || "Klovn"}
                        </div>
                        {u.username && (
                          <div className="text-sm text-gray-400 truncate">
                            @{u.username}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1 text-gray-300">
                        <span>📍</span>
                        <span className="text-sm truncate flex-1">
                          {u.location || "—"}
                        </span>
                      </div>

                      {u.status_message && (
                        <div className="flex items-start gap-2 mb-1 text-gray-300 italic">
                          <span>💬</span>
                          <span className="text-sm truncate flex-1">
                            {u.status_message}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>🕒</span>
                        <span>
                          {u.updated_at
                            ? new Date(u.updated_at).toLocaleString("sr-RS", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {!err && sorted.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤡</div>
              <div className="text-xl font-semibold text-gray-300">
                Nema klovnova
              </div>
              <div className="text-gray-400 mt-2">Čeka se klovn...</div>
            </div>
          )}

          {/* Stats */}
          {sorted.length > 0 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-xl border-2 border-gray-700 shadow-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {sorted.length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Ukupno</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">
                    {Math.max(...sorted.map((u) => u.level ?? 0))}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Max level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-300">
                    {sorted.filter((u) => u.location).length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Sa lokacijom</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="p-4 pb-24 max-w-md mx-auto">
          {myData ? (
            <>
              {/* Profile Card */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-xl border border-gray-600 overflow-hidden mb-6">
                <div className="relative">
                  <img
                    src={getClownImage(myData.level ?? 0)}
                    alt="Your clown"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em"%3E🤡%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg border-2 border-orange-400">
                    Level {myData.level ?? 0}
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-1">
                    {myData.clown_name || myData.first_name || "Klovn"}
                  </h2>
                  {myData.username && (
                    <p className="text-gray-400 mb-4">@{myData.username}</p>
                  )}

                  <button
                    onClick={handleLevelUp}
                    disabled={saving || (myData.level ?? 0) >= 6}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      saving || (myData.level ?? 0) >= 6
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg"
                    }`}
                  >
                    {saving
                      ? "⏳ Čekaj..."
                      : (myData.level ?? 0) >= 6
                      ? "⚠️ Max level!"
                      : "🎚️ Level +1"}
                  </button>
                </div>
              </div>

              {/* Edit Forms */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    📍 Lokacija
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Kafana Kod Mike"
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-600 bg-gray-800 text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    💬 Status poruka
                  </label>
                  <input
                    type="text"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    placeholder="Pijem kafu ☕"
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-600 bg-gray-800 text-white outline-none focus:border-orange-500 transition-colors"
                  />
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {editStatus.length}/200
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    saving
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg"
                  }`}
                >
                  {saving ? "⏳ Čuvanje..." : "💾 Sačuvaj profil"}
                </button>

                {editStatus && (
                  <button
                    onClick={() => {
                      setEditStatus("");
                      handleSaveProfile();
                    }}
                    disabled={saving}
                    className="w-full py-3 rounded-xl font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  >
                    🗑️ Obriši status
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤡</div>
              <div className="text-xl font-semibold text-gray-300">
                Učitavanje...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}