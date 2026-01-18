import { useEffect, useMemo, useState } from "react";

// Replace with your actual API base URL
const API_BASE = import.meta.env.VITE_API_BASE;

function getTgInitData() {
  return window?.Telegram?.WebApp?.initData || "";
}

// Lokalne clown slike
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
  if (level === 5) return CLOWN_IMAGES[5];
  if (level === 4) return CLOWN_IMAGES[4];
  if (level === 3) return CLOWN_IMAGES[3];
  if (level === 2) return CLOWN_IMAGES[2];
  if (level === 1) return CLOWN_IMAGES[1];
  return CLOWN_IMAGES[0];
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #111827, #1f2937, #7c2d12)",
    padding: "16px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  wrapper: {
    maxWidth: "672px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "white",
  },
  subtitle: {
    color: "#d1d5db",
  },
  searchRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #4b5563",
    outline: "none",
    background: "#1f2937",
    color: "white",
    fontSize: "14px",
  },
  inputFocus: {
    borderColor: "#f97316",
  },
  refreshBtn: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #4b5563",
    background: "#1f2937",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    marginBottom: "24px",
    padding: "16px",
    background: "#7f1d1d",
    border: "2px solid #991b1b",
    borderRadius: "12px",
  },
  errorTitle: {
    fontWeight: 600,
    color: "#fecaca",
  },
  errorText: {
    fontSize: "14px",
    color: "#fca5a5",
    marginTop: "8px",
  },
  usersList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  userCard: {
    background: "linear-gradient(to right, #1f2937, #374151)",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
    border: "1px solid #374151",
    overflow: "hidden",
    transition: "all 0.2s",
  },
  userCardHover: {
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    borderColor: "#ea580c",
  },
  userCardInner: {
    display: "flex",
    gap: 0,
  },
  imageContainer: {
    position: "relative",
    width: "112px",
    flexShrink: 0,
    background: "#111827",
  },
  clownImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  levelBadge: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    background: "linear-gradient(to right, #ea580c, #dc2626)",
    color: "white",
    fontWeight: "bold",
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
    border: "1px solid #fb923c",
  },
  userInfo: {
    flex: 1,
    padding: "16px",
    minWidth: 0,
  },
  nameContainer: {
    marginBottom: "8px",
  },
  name: {
    fontWeight: "bold",
    fontSize: "18px",
    color: "white",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  username: {
    fontSize: "14px",
    color: "#9ca3af",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  locationRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
    color: "#d1d5db",
  },
  locationText: {
    fontSize: "14px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  statusRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "6px",
    color: "#d1d5db",
    fontStyle: "italic",
  },
  statusText: {
    fontSize: "13px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  timeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#6b7280",
  },
  emptyState: {
    textAlign: "center",
    paddingTop: "48px",
    paddingBottom: "48px",
  },
  emptyIcon: {
    fontSize: "60px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#e5e7eb",
  },
  emptyText: {
    color: "#9ca3af",
    marginTop: "8px",
  },
  stats: {
    marginTop: "24px",
    padding: "16px",
    background: "#1f2937",
    borderRadius: "12px",
    border: "2px solid #374151",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "4px",
  },
};

export default function App() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

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
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>🤡 Klovn Dashboard 🤡</h1>
          <p style={styles.subtitle}>Klovnovi u realnom vremenu</p>
        </div>

        <div style={styles.searchRow}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Traži klovnove..."
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = "#f97316")}
            onBlur={(e) => (e.target.style.borderColor = "#4b5563")}
          />
          <button
            onClick={() => window.location.reload()}
            style={styles.refreshBtn}
            onMouseEnter={(e) => (e.target.style.background = "#374151")}
            onMouseLeave={(e) => (e.target.style.background = "#1f2937")}
          >
            ↻
          </button>
        </div>

        {err ? (
          <div style={styles.error}>
            <div style={styles.errorTitle}>❌ Greška: {err}</div>
            <div style={styles.errorText}>
              (Ako otvaraš u običnom browseru, moguće je da backend očekuje Telegram initData.)
            </div>
          </div>
        ) : null}

        <div style={styles.usersList}>
          {sorted.map((u) => {
            const level = u.level ?? 0;
            const clownImg = getClownImage(level);
            const isHovered = hoveredCard === u.telegram_id;

            return (
              <div
                key={u.telegram_id}
                style={{
                  ...styles.userCard,
                  ...(isHovered ? styles.userCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(u.telegram_id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={styles.userCardInner}>
                  <div style={styles.imageContainer}>
                    <img
                      src={clownImg}
                      alt={`Level ${level}`}
                      style={styles.clownImage}
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" font-size="40" text-anchor="middle" dy=".3em"%3E🤡%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div style={styles.levelBadge}>LVL {level}</div>
                  </div>

                  <div style={styles.userInfo}>
                    <div style={styles.nameContainer}>
                      <div style={styles.name}>
                        {u.clown_name || u.first_name || "Klovn"}
                      </div>
                      {u.username && (
                        <div style={styles.username}>@{u.username}</div>
                      )}
                    </div>

                    <div style={styles.locationRow}>
                      <span style={{ fontSize: "16px" }}>📍</span>
                      <span style={styles.locationText}>
                        {u.location || "—"}
                      </span>
                    </div>

                    {u.status_message && (
                      <div style={styles.statusRow}>
                        <span style={{ fontSize: "16px" }}>💬</span>
                        <span style={styles.statusText}>
                          {u.status_message}
                        </span>
                      </div>
                    )}

                    <div style={styles.timeRow}>
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

        {!err && sorted.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🤡</div>
            <div style={styles.emptyTitle}>Nema klovnova</div>
            <div style={styles.emptyText}>Čeka se klovn...</div>
          </div>
        ) : null}

        {sorted.length > 0 && (
          <div style={styles.stats}>
            <div style={styles.statsGrid}>
              <div>
                <div style={{ ...styles.statValue, color: "#f97316" }}>
                  {sorted.length}
                </div>
                <div style={styles.statLabel}>Ukupno</div>
              </div>
              <div>
                <div style={{ ...styles.statValue, color: "#ef4444" }}>
                  {Math.max(...sorted.map((u) => u.level ?? 0))}
                </div>
                <div style={styles.statLabel}>Max level</div>
              </div>
              <div>
                <div style={{ ...styles.statValue, color: "#d1d5db" }}>
                  {sorted.filter((u) => u.location).length}
                </div>
                <div style={styles.statLabel}>Sa lokacijom</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}