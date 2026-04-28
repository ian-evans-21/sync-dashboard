// ---------- Mock data (mirrors the Supabase schema) ----------
const MOCK_COWORKERS = [
  { id: 1,  name: "Marcus Chen",       slack_user_id: "U01ABCD",  email: "marcus@acme.co",  times_selected: 14 },
  { id: 2,  name: "Priya Nair",        slack_user_id: "U02ABCD",  email: "priya@acme.co",   times_selected: 11 },
  { id: 3,  name: "Jonas Weber",       slack_user_id: "U03ABCD",  email: "jonas@acme.co",   times_selected: 9  },
  { id: 4,  name: "Sofia Reyes",       slack_user_id: "U04ABCD",  email: "sofia@acme.co",   times_selected: 8  },
  { id: 5,  name: "Theo Lindqvist",    slack_user_id: "U05ABCD",  email: "theo@acme.co",    times_selected: 7  },
  { id: 6,  name: "Hana Tanaka",       slack_user_id: "U06ABCD",  email: "hana@acme.co",    times_selected: 6  },
  { id: 7,  name: "Diego Marín",       slack_user_id: "U07ABCD",  email: "diego@acme.co",   times_selected: 5  },
  { id: 8,  name: "Ruth Adeyemi",      slack_user_id: "U08ABCD",  email: "ruth@acme.co",    times_selected: 4  },
  { id: 9,  name: "Oskar Brandt",      slack_user_id: "U09ABCD",  email: "oskar@acme.co",   times_selected: 3  },
  { id: 10, name: "Liling Park",       slack_user_id: "U10ABCD",  email: "liling@acme.co",  times_selected: 2  },
  { id: 11, name: "Yusuf Demir",       slack_user_id: "U11ABCD",  email: "yusuf@acme.co",   times_selected: 1  },
];

function inHours(h) {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

const MOCK_MEETINGS = [
  { id: 101, invitee_email: "marcus@acme.co", invitee_name: "Marcus Chen",    meeting_time: inHours(74),  status: "booked" },
  { id: 102, invitee_email: "priya@acme.co",  invitee_name: "Priya Nair",     meeting_time: inHours(81),  status: "booked" },
  { id: 103, invitee_email: "sofia@acme.co",  invitee_name: "Sofia Reyes",    meeting_time: inHours(96),  status: "booked" },
  { id: 104, invitee_email: "theo@acme.co",   invitee_name: "Theo Lindqvist", meeting_time: inHours(120), status: "booked" },
  { id: 105, invitee_email: "jonas@acme.co",  invitee_name: "Jonas Weber",    meeting_time: inHours(2),   status: "waiting to be cancelled" },
  { id: 106, invitee_email: "hana@acme.co",   invitee_name: "Hana Tanaka",    meeting_time: inHours(-4),  status: "cancelled" },
  { id: 107, invitee_email: "diego@acme.co",  invitee_name: "Diego Marín",    meeting_time: inHours(-26), status: "happened" },
];

// ---------- Tweaks default block ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "adminMode": false,
  "showEmptyState": false,
  "compactTable": false,
  "accent": "#FF4848"
}/*EDITMODE-END*/;

// ---------- Helpers ----------
function fmtTime(iso) {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const hh = d.getHours().toString().padStart(2,"0");
  const mm = d.getMinutes().toString().padStart(2,"0");
  return `${months[d.getMonth()]} ${d.getDate()} · ${hh}:${mm}`;
}
function relTime(iso) {
  const ms = new Date(iso) - Date.now();
  const abs = Math.abs(ms);
  const m = Math.round(abs/60000);
  const h = Math.round(abs/3600000);
  const d = Math.round(abs/86400000);
  let v;
  if (m < 60) v = `${m}m`;
  else if (h < 24) v = `${h}h`;
  else v = `${d}d`;
  return ms >= 0 ? `in ${v}` : `${v} ago`;
}

// ---------- Status badge ----------
function StatusBadge({ status }) {
  const map = {
    "booked":                 { label: "BOOKED",     dot: "var(--red)",   color: "var(--red)",   bg: "rgba(255,72,72,0.10)",  border: "rgba(255,72,72,0.30)",  pulse: true  },
    "waiting to be cancelled":{ label: "PENDING",    dot: "var(--amber)", color: "var(--amber)", bg: "rgba(242,180,65,0.10)", border: "rgba(242,180,65,0.30)", pulse: true  },
    "cancelled":              { label: "CANCELLED",  dot: "var(--ink-3)", color: "var(--ink-2)", bg: "rgba(138,130,117,0.08)",border: "rgba(138,130,117,0.22)",pulse: false },
    "happened":               { label: "HAPPENED",   dot: "var(--blue)",  color: "var(--blue)",  bg: "rgba(111,168,255,0.08)",border: "rgba(111,168,255,0.25)",pulse: false },
  };
  const s = map[status] || map.booked;
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "4px 9px 4px 8px", borderRadius: 999,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em",
      whiteSpace: "nowrap",
    }}>
      <span style={{ position: "relative", width: 6, height: 6 }}>
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%", background: s.dot,
        }}/>
        {s.pulse && (
          <span style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            background: s.dot, opacity: 0.6,
            animation: "pulse 1.6s ease-out infinite",
          }}/>
        )}
      </span>
      {s.label}
    </span>
  );
}

// ---------- Avatar ----------
function Avatar({ name, size = 24 }) {
  const initials = (name || "?")
    .split(/\s+/).map(w => w[0]).slice(0,2).join("").toUpperCase();
  // hash for hue
  let h = 0;
  for (const c of name||"") h = (h*31 + c.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%",
      background: `oklch(0.32 0.06 ${hue})`,
      color: `oklch(0.92 0.04 ${hue})`,
      fontSize: size * 0.42, fontWeight: 600,
      border: "1px solid rgba(255,255,255,0.06)",
      flex: "none",
    }}>
      {initials}
    </span>
  );
}

// ---------- Live clock ----------
function useNow(ms = 1000) {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

// ---------- Header / topbar ----------
function TopBar({ adminMode, now }) {
  const ts = `${now.toISOString().slice(0,10)} ${now.toTimeString().slice(0,8)} UTC`;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 24px", borderBottom: "1px solid var(--line)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.015), transparent)",
      position: "sticky", top: 0, zIndex: 5, backdropFilter: "blur(6px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Logo />
        <div style={{ width: 1, height: 18, background: "var(--line-2)" }}/>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em" }}>
          INTERNAL · v0.4.2
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
          {ts}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 10px", borderRadius: 999,
          background: "rgba(107,217,104,0.07)", border: "1px solid rgba(107,217,104,0.25)",
          color: "var(--green)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)" }}/>
          SCHEDULER ONLINE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name="Op Erator" size={26}/>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>operator</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>
              {adminMode ? "admin" : "viewer"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{
        position: "relative", width: 26, height: 26, borderRadius: 7,
        background: "var(--red)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset, 0 6px 14px -6px rgba(255,72,72,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="mono" style={{ color: "white", fontWeight: 800, fontSize: 13, letterSpacing: "-0.04em" }}>s</span>
        <span style={{ position: "absolute", right: -2, top: -2, width: 6, height: 6, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--red)" }}/>
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>sync</span>
        <span className="mono" style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.18em", marginTop: 2 }}>OPS CONSOLE</span>
      </div>
    </div>
  );
}

// ---------- Hero / stats strip ----------
function Hero({ activeCount, lifetimeCount, victims }) {
  return (
    <div style={{ padding: "44px 0 28px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--red)", letterSpacing: "0.18em", fontWeight: 600 }}>
          ◐ LIVE OPS
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.12em" }}>
          / DASHBOARD / Q2-26
        </span>
      </div>
      <h1 style={{
        margin: 0, fontSize: 76, lineHeight: 0.95, letterSpacing: "-0.045em",
        fontWeight: 700,
      }}>
        Who&rsquo;s getting <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--red)" }}>synced</span>.
      </h1>
      <p style={{
        marginTop: 18, marginBottom: 0, maxWidth: 640,
        fontSize: 16, color: "var(--ink-2)", lineHeight: 1.55,
      }}>
        sync silently books a 30&#8209;minute meeting on a coworker&rsquo;s calendar three or more days
        out, then quietly cancels it before it can ruin anyone&rsquo;s afternoon.
        <span style={{ color: "var(--ink-3)" }}> This is the operator&rsquo;s view.</span>
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1,
        marginTop: 36, background: "var(--line)",
        border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden",
      }}>
        <Stat label="ACTIVE SYNCS"    value={activeCount}    sub="live on calendars"  accent="var(--red)" big/>
        <Stat label="LIFETIME VICTIMS"value={victims}        sub="distinct coworkers"/>
        <Stat label="TOTAL SYNCS"     value={lifetimeCount}  sub="all time"/>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent, big }) {
  return (
    <div style={{
      background: "var(--panel)",
      padding: "22px 22px 20px",
      display: "flex", flexDirection: "column", gap: 10,
      position: "relative",
    }}>
      <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.14em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{
          fontSize: big ? 56 : 44, lineHeight: 1, fontWeight: 700, letterSpacing: "-0.03em",
          color: accent || "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {String(value).padStart(2, "0")}
        </span>
        {accent && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: accent, fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.12em", fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 10px ${accent}`, animation: "pulse 1.6s ease-out infinite" }}/>
            LIVE
          </span>
        )}
      </div>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.04em" }}>{sub}</span>
    </div>
  );
}

// ---------- Section header ----------
function SectionHeader({ kicker, title, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      marginBottom: 14, gap: 16,
    }}>
      <div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.18em", marginBottom: 6 }}>{kicker}</div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// ---------- Active syncs table ----------
function ActiveTable({ meetings, compact }) {
  const pad = compact ? "10px 16px" : "16px 18px";
  return (
    <div style={{
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: 14, overflow: "hidden",
      boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 200px 140px 130px",
        background: "var(--bg-2)", borderBottom: "1px solid var(--line)",
        padding: `12px 18px`,
      }} className="mono">
        {["INVITEE","MEETING TIME","T-MINUS","STATUS"].map(h => (
          <span key={h} style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.14em" }}>{h}</span>
        ))}
      </div>
      {meetings.map((m, i) => (
        <div key={m.id} style={{
          display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 200px 140px 130px",
          padding: pad, alignItems: "center",
          borderTop: i === 0 ? "none" : "1px solid var(--line)",
          transition: "background 120ms ease",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Avatar name={m.invitee_name || m.invitee_email} size={28}/>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {m.invitee_name || m.invitee_email}
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
                {m.invitee_email}
              </span>
            </div>
          </div>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>
            {fmtTime(m.meeting_time)}
          </span>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>
            {relTime(m.meeting_time)}
          </span>
          <StatusBadge status={m.status}/>
        </div>
      ))}
    </div>
  );
}

// ---------- Empty state — radar / scanner ----------
function EmptyState() {
  return (
    <div style={{
      position: "relative",
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: 14, overflow: "hidden",
      padding: "44px 28px", display: "flex", alignItems: "center", gap: 36,
    }}>
      <Radar/>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--red)", letterSpacing: "0.16em", fontWeight: 600 }}>
          ⊙ NO TARGETS LOCKED
        </span>
        <div style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 600, letterSpacing: "-0.02em" }}>
          The calendars are clean.
        </div>
        <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14, maxWidth: 460, lineHeight: 1.55 }}>
          No coworkers are currently in the pipeline. The scheduler is sweeping for an opening 3+ days out — sit tight, and we&rsquo;ll find someone&rsquo;s Wednesday to ruin.
        </p>
        <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
            next sweep: <span style={{ color: "var(--ink-2)" }}>~14m</span>
          </span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ink-4)" }}/>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
            queue depth: <span style={{ color: "var(--ink-2)" }}>0</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Radar() {
  return (
    <div style={{
      position: "relative", width: 160, height: 160, flex: "none",
      borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(255,72,72,0.08) 0%, transparent 65%)",
    }}>
      <svg viewBox="0 0 160 160" width="160" height="160" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="rg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,72,72,0.0)"/>
            <stop offset="80%" stopColor="rgba(255,72,72,0.0)"/>
            <stop offset="100%" stopColor="rgba(255,72,72,0.5)"/>
          </radialGradient>
          <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,72,72,0.55)"/>
            <stop offset="100%" stopColor="rgba(255,72,72,0)"/>
          </linearGradient>
        </defs>
        {/* rings */}
        {[20, 40, 60, 75].map(r => (
          <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="rgba(255,72,72,0.18)" strokeWidth="1" strokeDasharray="2 4"/>
        ))}
        {/* crosshairs */}
        <line x1="5" y1="80" x2="155" y2="80" stroke="rgba(255,72,72,0.12)" strokeWidth="1"/>
        <line x1="80" y1="5" x2="80" y2="155" stroke="rgba(255,72,72,0.12)" strokeWidth="1"/>
        {/* sweep */}
        <g style={{ transformOrigin: "80px 80px", animation: "spin 4s linear infinite" }}>
          <path d="M80,80 L80,5 A75,75 0 0 1 152,55 Z" fill="url(#sweep)"/>
        </g>
        {/* center dot */}
        <circle cx="80" cy="80" r="3" fill="var(--red)"/>
      </svg>
    </div>
  );
}

// ---------- Lifetime tally ----------
function LifetimeTable({ coworkers, compact }) {
  const max = Math.max(...coworkers.map(c => c.times_selected), 1);
  const pad = compact ? "10px 18px" : "14px 18px";
  return (
    <div style={{
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: 14, overflow: "hidden",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "44px minmax(180px, 1fr) 1fr 80px",
        background: "var(--bg-2)", borderBottom: "1px solid var(--line)",
        padding: "12px 18px",
      }} className="mono">
        {["#","COWORKER","FREQUENCY","TALLY"].map(h => (
          <span key={h} style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.14em" }}>{h}</span>
        ))}
      </div>
      {coworkers.map((c, i) => {
        const pct = (c.times_selected / max) * 100;
        const isTop = i === 0;
        return (
          <div key={c.id} style={{
            display: "grid", gridTemplateColumns: "44px minmax(180px, 1fr) 1fr 80px",
            padding: pad, alignItems: "center",
            borderTop: i === 0 ? "none" : "1px solid var(--line)",
          }}>
            <span className="mono" style={{ fontSize: 11, color: isTop ? "var(--red)" : "var(--ink-4)", fontWeight: 600 }}>
              {String(i+1).padStart(2,"0")}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={c.name} size={26}/>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{c.slack_user_id}</span>
              </div>
            </div>
            <div style={{ paddingRight: 24 }}>
              <div style={{
                position: "relative", height: 6, borderRadius: 3,
                background: "rgba(255,255,255,0.03)", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0, width: `${pct}%`,
                  background: isTop
                    ? "linear-gradient(90deg, var(--red), var(--red-2))"
                    : "linear-gradient(90deg, rgba(255,72,72,0.5), rgba(255,72,72,0.2))",
                  borderRadius: 3,
                  boxShadow: isTop ? "0 0 12px rgba(255,72,72,0.4)" : "none",
                }}/>
              </div>
            </div>
            <span className="mono" style={{
              fontSize: 14, color: "var(--ink)", fontWeight: 600,
              fontVariantNumeric: "tabular-nums", textAlign: "right",
            }}>
              {c.times_selected}×
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- KILL SWITCH PANEL ----------
function KillSwitchPanel({ activeCount }) {
  // status: idle | armed | confirming | firing | done | error
  const [status, setStatus] = React.useState("idle");
  const [error, setError] = React.useState("");
  const [holdProgress, setHoldProgress] = React.useState(0);
  const holdRef = React.useRef(null);

  function startHold() {
    if (status !== "armed") return;
    const start = Date.now();
    holdRef.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 1500);
      setHoldProgress(t);
      if (t >= 1) {
        clearInterval(holdRef.current);
        setStatus("firing");
        setHoldProgress(0);
        setTimeout(() => setStatus("done"), 1400);
      }
    }, 30);
  }
  function endHold() {
    if (holdRef.current) clearInterval(holdRef.current);
    setHoldProgress(0);
  }

  const cardBg = "linear-gradient(180deg, #1A0A0A 0%, #0F0606 100%)";

  return (
    <div style={{
      marginTop: 56, marginBottom: 24,
      background: cardBg,
      border: "1px solid rgba(255,72,72,0.35)",
      borderRadius: 18,
      padding: 0, overflow: "hidden",
      position: "relative",
      boxShadow: "0 30px 80px -30px rgba(255,72,72,0.45), 0 1px 0 rgba(255,255,255,0.05) inset",
    }}>
      {/* hazard stripe header */}
      <div style={{
        height: 14, position: "relative",
        background: "repeating-linear-gradient(45deg, #1A0A0A 0 14px, var(--red) 14px 28px)",
        opacity: 0.85,
      }}/>
      <div style={{ padding: "26px 28px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 10px", borderRadius: 999,
              background: "rgba(255,72,72,0.12)", border: "1px solid rgba(255,72,72,0.35)",
              color: "var(--red)", fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", boxShadow: "0 0 10px var(--red)", animation: "pulse 1.6s ease-out infinite" }}/>
              ADMIN MODE — RESTRICTED
            </div>
            <span className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em" }}>
              auth · bananabread
            </span>
          </div>
          <span className="mono" style={{ fontSize: 10.5, color: "rgba(255,72,72,0.6)", letterSpacing: "0.18em" }}>
            ZONE-Ω
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 36, alignItems: "center" }}>
          <div>
            <h3 style={{
              margin: 0, fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.03em",
              fontWeight: 700, color: "white",
            }}>
              Cancel <span style={{ color: "var(--red)", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>everything</span>.
            </h3>
            <p style={{
              marginTop: 14, marginBottom: 0, color: "rgba(255,255,255,0.55)",
              fontSize: 14, lineHeight: 1.55, maxWidth: 440,
            }}>
              The kill switch fires a signal to the scheduler. Within 60 seconds, every booked sync will be quietly cancelled and the queue drained.
            </p>
            <div className="mono" style={{
              marginTop: 22, display: "flex", flexDirection: "column", gap: 6,
              fontSize: 11.5, color: "rgba(255,255,255,0.4)",
            }}>
              <Row k="active syncs"  v={`${activeCount} on calendars`} accent="var(--red)"/>
              <Row k="propagation"   v="≤ 60s"/>
              <Row k="reversibility" v="none"/>
            </div>
          </div>

          {/* The big button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <KillButton
              status={status}
              setStatus={setStatus}
              holdProgress={holdProgress}
              startHold={startHold}
              endHold={endHold}
            />
            <div className="mono" style={{
              fontSize: 11, letterSpacing: "0.14em", textAlign: "center",
              color: "rgba(255,255,255,0.45)", minHeight: 16,
            }}>
              {{
                idle:       "FLIP COVER TO ARM",
                armed:      "PRESS & HOLD 1.5s TO FIRE",
                confirming: "—",
                firing:     "TRANSMITTING…",
                done:       "KILL SIGNAL ACK ✓",
                error:      `ERROR: ${error || "unknown"}`,
              }[status]}
            </div>
            {status === "done" && (
              <button
                onClick={() => setStatus("idle")}
                className="mono"
                style={{
                  background: "transparent", color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "6px 14px", borderRadius: 999, cursor: "pointer",
                  fontSize: 10.5, letterSpacing: "0.12em", fontWeight: 600,
                }}
              >
                ↺ RESET CONSOLE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, accent }) {
  return (
    <div style={{ display: "flex", gap: 10, whiteSpace: "nowrap" }}>
      <span style={{ width: 92, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", flex: "none" }}>{k}</span>
      <span style={{ color: accent || "rgba(255,255,255,0.7)" }}>{v}</span>
    </div>
  );
}

// The actual switch
function KillButton({ status, setStatus, holdProgress, startHold, endHold }) {
  const armed = status === "armed" || status === "firing" || status === "done";
  const firing = status === "firing";
  const done = status === "done";

  // Cover lifts when armed
  const coverRot = armed ? -110 : 0;

  return (
    <div style={{
      position: "relative", width: 230, height: 230,
      perspective: 800,
      userSelect: "none",
    }}>
      {/* Bezel / housing */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18,
        background: "linear-gradient(160deg, #2a1010, #110707)",
        border: "1px solid rgba(255,72,72,0.35)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(0,0,0,0.6) inset, 0 14px 36px -10px rgba(255,72,72,0.35)",
      }}/>
      {/* corner screws */}
      {[[10,10],[210,10],[10,210],[210,210]].map(([x,y], i) => (
        <span key={i} style={{
          position: "absolute", left: x, top: y, width: 10, height: 10, borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, #5a3030, #1a0909)",
          boxShadow: "0 1px 1px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}/>
      ))}
      {/* hazard band */}
      <div style={{
        position: "absolute", left: 24, right: 24, top: 30, height: 6, borderRadius: 2,
        background: "repeating-linear-gradient(45deg, #FFCB30 0 6px, #1A0A0A 6px 12px)",
        opacity: 0.85,
      }}/>
      <div className="mono" style={{
        position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center",
        fontSize: 9.5, color: "rgba(255,72,72,0.6)", letterSpacing: "0.24em",
      }}>
        ⚠ KILL SWITCH · DO NOT PRESS ⚠
      </div>

      {/* The button itself */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        width: 130, height: 130,
      }}>
        <button
          disabled={!armed || firing || done}
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={(e) => { e.preventDefault(); startHold(); }}
          onTouchEnd={endHold}
          aria-label="Fire kill switch"
          style={{
            position: "relative", width: "100%", height: "100%", borderRadius: "50%",
            border: "none", padding: 0, cursor: armed && !firing && !done ? "pointer" : "default",
            background: done
              ? "radial-gradient(circle at 35% 30%, #5a8a5a, #1a3a1a 70%)"
              : "radial-gradient(circle at 35% 30%, #FF6B6B, #B0211E 65%, #6E0F0D 100%)",
            boxShadow: firing
              ? "0 0 0 4px rgba(255,72,72,0.3), 0 0 60px 10px rgba(255,72,72,0.6), 0 6px 0 #4a0a0a, 0 1px 0 rgba(255,255,255,0.3) inset"
              : armed
                ? "0 8px 0 #4a0a0a, 0 22px 36px -8px rgba(255,72,72,0.5), 0 1px 0 rgba(255,255,255,0.3) inset"
                : "0 8px 0 #4a0a0a, 0 1px 0 rgba(255,255,255,0.3) inset",
            transition: "box-shadow 200ms ease, transform 80ms ease, background 300ms ease",
            transform: holdProgress > 0 ? `translateY(${holdProgress * 6}px)` : firing ? "translateY(6px)" : "translateY(0)",
          }}
        >
          {/* inner ring */}
          <span style={{
            position: "absolute", inset: 14, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 -10px 20px rgba(255,255,255,0.15) inset, 0 12px 24px rgba(0,0,0,0.3) inset",
          }}/>
          {/* highlight */}
          <span style={{
            position: "absolute", left: "20%", top: "12%", width: "55%", height: "30%", borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.5), transparent 70%)",
            pointerEvents: "none",
          }}/>
          {/* hold-progress ring */}
          {holdProgress > 0 && !firing && (
            <svg viewBox="0 0 130 130" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3"
                strokeDasharray={`${holdProgress * 2 * Math.PI * 58} 1000`}
                strokeLinecap="round"/>
            </svg>
          )}
          <span className="mono" style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            color: done ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.95)",
            fontSize: 12, fontWeight: 800, letterSpacing: "0.16em",
            textShadow: "0 1px 0 rgba(0,0,0,0.45)",
          }}>
            {done ? "FIRED" : firing ? "…" : "FIRE"}
          </span>
        </button>
      </div>

      {/* The flip-up cover */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        width: 162, height: 162, transformStyle: "preserve-3d",
      }}>
        <div
          onClick={() => { if (status === "idle") setStatus("armed"); }}
          style={{
            position: "absolute", inset: 0,
            transformOrigin: "50% 100%",
            transform: `rotateX(${coverRot}deg)`,
            transition: "transform 600ms cubic-bezier(.5,1.6,.4,1)",
            cursor: status === "idle" ? "pointer" : "default",
            borderRadius: 12,
            background: "linear-gradient(165deg, #2A1010 0%, #160808 60%, #0E0505 100%)",
            border: "1px solid rgba(255,72,72,0.4)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -8px 14px rgba(255,72,72,0.08) inset",
            backgroundImage: "repeating-linear-gradient(45deg, rgba(255,203,48,0.08) 0 6px, transparent 6px 12px), linear-gradient(165deg, #2A1010 0%, #160808 60%, #0E0505 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backfaceVisibility: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 6, borderRadius: 8, border: "1px dashed rgba(255,72,72,0.25)" }}/>
          <span className="mono" style={{
            color: "rgba(255,72,72,0.7)", fontSize: 10, letterSpacing: "0.22em", fontWeight: 700,
          }}>
            LIFT TO ARM
          </span>
          {/* hinge dots */}
          <span style={{ position: "absolute", left: 6, bottom: -3, width: 8, height: 8, borderRadius: "50%", background: "#3a1010", border: "1px solid rgba(255,72,72,0.4)" }}/>
          <span style={{ position: "absolute", right: 6, bottom: -3, width: 8, height: 8, borderRadius: "50%", background: "#3a1010", border: "1px solid rgba(255,72,72,0.4)" }}/>
        </div>
      </div>
    </div>
  );
}

// ---------- Footer note ----------
function FooterNote() {
  return (
    <div style={{
      marginTop: 60, paddingTop: 28, paddingBottom: 40,
      borderTop: "1px dashed var(--line-2)",
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24,
    }}>
      <p className="mono" style={{ margin: 0, fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.06em" }}>
        // this is a joke project. nobody is actually getting synced.
      </p>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
        an internal experiment by <span style={{ color: "var(--red)" }}>tl;dv</span>
      </span>
    </div>
  );
}

// ---------- App ----------
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const now = useNow(1000);

  // sort just like Supabase queries do
  const coworkers = [...MOCK_COWORKERS].sort((a,b) => b.times_selected - a.times_selected);
  const meetings  = [...MOCK_MEETINGS].sort((a,b) => new Date(a.meeting_time) - new Date(b.meeting_time));
  const activeMeetings = meetings.filter(m => m.status === "booked");

  const lifetimeCount = coworkers.reduce((s,c) => s + c.times_selected, 0);
  const victims = coworkers.filter(c => c.times_selected > 0).length;

  return (
    <div data-screen-label="01 Sync Dashboard" style={{ minHeight: "100vh" }}>
      <TopBar adminMode={t.adminMode} now={now}/>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px 80px" }}>
        <Hero
          activeCount={t.showEmptyState ? 0 : activeMeetings.length}
          lifetimeCount={lifetimeCount}
          victims={victims}
        />

        <section style={{ marginTop: 28 }}>
          <SectionHeader
            kicker="01 — CURRENTLY ACTIVE"
            title="Syncs in flight"
            right={
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.1em" }}>
                live · auto-refreshing every 30s
              </span>
            }
          />
          {t.showEmptyState || activeMeetings.length === 0
            ? <EmptyState/>
            : <ActiveTable meetings={activeMeetings} compact={t.compactTable}/>
          }
        </section>

        <section style={{ marginTop: 56 }}>
          <SectionHeader
            kicker="02 — LIFETIME TALLY"
            title="Hall of fame"
            right={
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.1em" }}>
                ranked by times synced · {coworkers.length} coworkers
              </span>
            }
          />
          <LifetimeTable coworkers={coworkers} compact={t.compactTable}/>
        </section>

        {t.adminMode && (
          <section>
            <KillSwitchPanel activeCount={t.showEmptyState ? 0 : activeMeetings.length}/>
          </section>
        )}

        <FooterNote/>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="View">
          <TweakToggle label="Admin mode (?admin=bananabread)"
            value={t.adminMode} onChange={v => setTweak('adminMode', v)}/>
          <TweakToggle label="Show empty state"
            value={t.showEmptyState} onChange={v => setTweak('showEmptyState', v)}/>
          <TweakToggle label="Compact tables"
            value={t.compactTable} onChange={v => setTweak('compactTable', v)}/>
        </TweakSection>
      </TweaksPanel>

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(0.6); opacity: 0.7; }
          70%  { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
