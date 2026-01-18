import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

function getTgInitData() {
  return window?.Telegram?.WebApp?.initData || "";
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

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

  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();
  }, []);

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const initData = getTgInitData();
        const r = await fetch(`${API_BASE}/api/users`, {
          headers: initData ? { "x-telegram-init-data": initData } : {},
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(String(e?.message || e));
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ margin: "0 0 12px" }}>🤡 Klovn Dashboard</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (ime, username, lokacija...)"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
        >
          ↻
        </button>
      </div>

      {err ? (
        <div style={{ padding: 12, border: "1px solid #f99", borderRadius: 12 }}>
          ❌ Greška: {err}
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            (Ako otvaraš u običnom browseru, moguće je da backend očekuje Telegram initData.)
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((u) => (
          <div
            key={u.telegram_id}
            style={{
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>
                {u.clown_name || u.first_name || "Klovn"}{" "}
                {u.username ? (
                  <span style={{ opacity: 0.6, fontWeight: 500 }}>
                    @{u.username}
                  </span>
                ) : null}
              </div>
              <div style={{ opacity: 0.8 }}>
                📍 {u.location || "—"}
              </div>
              <div style={{ opacity: 0.6, fontSize: 12 }}>
                🕒 {u.updated_at ? new Date(u.updated_at).toLocaleString() : "—"}
              </div>
            </div>

            <div
              style={{
                minWidth: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid #eee",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 18,
              }}
              title="Level"
            >
              {u.level ?? 0}
            </div>
          </div>
        ))}
      </div>

      {!err && filtered.length === 0 ? (
        <div style={{ marginTop: 16, opacity: 0.7 }}>Nema klovnova 🤷‍♂️</div>
      ) : null}
    </div>
  );
}