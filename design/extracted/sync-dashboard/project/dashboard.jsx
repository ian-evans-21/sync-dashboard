// ---------- Mock data ----------
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
  { id: 108, invitee_email: "amir@acme.co",   invitee_name: "Amir Soltani",   meeting_time: inHours(-12), status: "cancelled" },
  { id: 109, invitee_email: "lena@acme.co",   invitee_name: "Lena Park",      meeting_time: inHours(-30), status: "cancelled" },
  { id: 110, invitee_email: "ravi@acme.co",   invitee_name: "Ravi Patel",     meeting_time: inHours(-54), status: "cancelled" },
  { id: 111, invitee_email: "noor@acme.co",   invitee_name: "Noor El-Amin",   meeting_time: inHours(-78), status: "cancelled" },
  { id: 112, invitee_email: "kenji@acme.co",  invitee_name: "Kenji Watanabe", meeting_time: inHours(-126),status: "cancelled" },
  { id: 113, invitee_email: "isla@acme.co",   invitee_name: "Isla MacRae",    meeting_time: inHours(-200),status: "cancelled" },
  { id: 107, invitee_email: "diego@acme.co",  invitee_name: "Diego Marín",    meeting_time: inHours(-26), status: "happened" },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "adminMode": false,
  "showEmptyState": false,
  "compactTable": false
}/*EDITMODE-END*/;

// brand gradient
const BRAND_GRAD = "linear-gradient(115deg, #9D7CFF 0%, #FF7AB6 55%, #6FD7E8 100%)";
const BRAND_GRAD_SOFT = "linear-gradient(115deg, rgba(157,124,255,0.18), rgba(255,122,182,0.18) 55%, rgba(111,215,232,0.18) 100%)";

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
    "booked":                 { label: "BOOKED",     dot: "var(--purple)", color: "var(--purple-deep)", bg: "rgba(123,92,255,0.10)",  border: "rgba(123,92,255,0.28)",  pulse: true  },
    "waiting to be cancelled":{ label: "PENDING",    dot: "var(--amber)",  color: "#9C6A0A",            bg: "rgba(229,160,25,0.10)",  border: "rgba(229,160,25,0.30)",  pulse: true  },
    "cancelled":              { label: "CANCELLED",  dot: "var(--ink-4)",  color: "var(--ink-3)",       bg: "rgba(168,159,194,0.10)", border: "rgba(168,159,194,0.28)", pulse: false },
    "happened":               { label: "HAPPENED",   dot: "var(--cyan)",   color: "#1F8A9C",            bg: "rgba(111,215,232,0.14)", border: "rgba(111,215,232,0.34)", pulse: false },
  };
  const s = map[status] || map.booked;
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "4px 10px 4px 9px", borderRadius: 999,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em",
      whiteSpace: "nowrap",
    }}>
      <span style={{ position: "relative", width: 6, height: 6 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: s.dot }}/>
        {s.pulse && (
          <span style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            background: s.dot, opacity: 0.5,
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
  const initials = (name || "?").split(/\s+/).map(w => w[0]).slice(0,2).join("").toUpperCase();
  let h = 0;
  for (const c of name||"") h = (h*31 + c.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%",
      background: `oklch(0.86 0.10 ${hue})`,
      color: `oklch(0.32 0.14 ${hue})`,
      fontSize: size * 0.42, fontWeight: 700,
      border: "1px solid rgba(26,18,48,0.06)",
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

// ---------- Logo ----------
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        position: "relative", width: 30, height: 30, borderRadius: 9,
        background: BRAND_GRAD,
        boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 6px 14px -6px rgba(123,92,255,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="mono" style={{ color: "white", fontWeight: 800, fontSize: 14, letterSpacing: "-0.04em", textShadow: "0 1px 0 rgba(0,0,0,0.1)" }}>s</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>sync</span>
        <span className="mono" style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.18em", marginTop: 3 }}>OPS CONSOLE</span>
      </div>
    </div>
  );
}

// ---------- Top bar ----------
function TopBar({ adminMode, now }) {
  const ts = `${now.toISOString().slice(0,10)} ${now.toTimeString().slice(0,8)} UTC`;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 28px",
      borderBottom: "1px solid rgba(221,212,242,0.6)",
      background: "rgba(255,255,255,0.6)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Logo/>
        <div style={{ width: 1, height: 18, background: "var(--line-2)" }}/>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em" }}>
          INTERNAL · v0.4.2
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{ts}</span>
        <span className="mono" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 11px", borderRadius: 999,
          background: "rgba(61,190,124,0.10)", border: "1px solid rgba(61,190,124,0.32)",
          color: "#1F7A4A", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px rgba(61,190,124,0.7)" }}/>
          SCHEDULER ONLINE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        </div>
      </div>
    </div>
  );
}

// ---------- Hero ----------
function Hero({ activeCount, lifetimeCount, victims }) {
  return (
    <div style={{ padding: "52px 0 28px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
        <span className="mono" style={{
          fontSize: 11, letterSpacing: "0.18em", fontWeight: 600,
          background: BRAND_GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          ◐ LIVE OPS
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.12em" }}>
          / DASHBOARD / Q2-26
        </span>
      </div>
      <h1 style={{
        margin: 0, fontSize: 88, lineHeight: 0.92, letterSpacing: "-0.04em",
        fontWeight: 700, color: "var(--ink)",
        fontFamily: "'Work Sans', system-ui, sans-serif",
      }}>
        Who&rsquo;s getting{" "}
        <span style={{
          fontFamily: "'Fraunces', 'Instrument Serif', serif",
          fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.02em",
          background: BRAND_GRAD,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          synced
        </span>.
      </h1>
      <p style={{
        marginTop: 22, marginBottom: 0, maxWidth: 660,
        fontSize: 17, color: "var(--ink-2)", lineHeight: 1.55,
      }}>
        This dashboard displays all currently active and past syncs.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16,
        marginTop: 40,
      }}>
        <Stat label="ACTIVE SYNCS"    value={activeCount}    sub="live on calendars"  highlight big/>
        <Stat label="TOTAL SYNCS"     value={lifetimeCount}  sub="all time"/>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, highlight, big }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: highlight
        ? "linear-gradient(155deg, rgba(157,124,255,0.10) 0%, rgba(255,122,182,0.10) 50%, rgba(111,215,232,0.10) 100%), #FFFFFF"
        : "rgba(255,255,255,0.85)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(221,212,242,0.7)",
      borderRadius: 18,
      padding: "22px 22px 20px",
      display: "flex", flexDirection: "column", gap: 10,
      boxShadow: highlight
        ? "0 1px 0 rgba(255,255,255,0.7) inset, 0 18px 40px -22px rgba(123,92,255,0.35)"
        : "0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 20px -14px rgba(26,18,48,0.18)",
    }}>
      {highlight && (
        <div style={{
          position: "absolute", inset: -1, padding: 1, borderRadius: 18, pointerEvents: "none",
          background: BRAND_GRAD, WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)", WebkitMaskComposite: "xor", maskComposite: "exclude",
          opacity: 0.55,
        }}/>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.14em" }}>{label}</span>
        {highlight && (
          <span className="mono" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "var(--purple-deep)", fontSize: 10, letterSpacing: "0.14em", fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--purple)", boxShadow: "0 0 10px var(--purple)", animation: "pulse 1.6s ease-out infinite" }}/>
            LIVE
          </span>
        )}
      </div>
      <span style={{
        fontSize: big ? 64 : 50, lineHeight: 1, fontWeight: 700, letterSpacing: "-0.035em",
        color: highlight ? "transparent" : "var(--ink)",
        background: highlight ? BRAND_GRAD : "none",
        WebkitBackgroundClip: highlight ? "text" : "border-box",
        WebkitTextFillColor: highlight ? "transparent" : "var(--ink)",
        fontVariantNumeric: "tabular-nums",
      }}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.04em" }}>{sub}</span>
    </div>
  );
}

// ---------- Section header ----------
function SectionHeader({ kicker, title, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      marginBottom: 16, gap: 16,
    }}>
      <div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.18em", marginBottom: 6 }}>{kicker}</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// ---------- Card wrapper ----------
function Card({ children, style }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(221,212,242,0.7)",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 1px 0 rgba(255,255,255,0.7) inset, 0 14px 36px -22px rgba(79,47,204,0.18)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ---------- Active table ----------
function ActiveTable({ meetings, compact }) {
  const pad = compact ? "10px 18px" : "16px 20px";
  return (
    <Card>
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 200px 130px 140px",
        background: "linear-gradient(180deg, rgba(157,124,255,0.06), rgba(157,124,255,0.02))",
        borderBottom: "1px solid rgba(221,212,242,0.7)",
        padding: "13px 20px",
      }} className="mono">
        {["INVITEE","MEETING TIME","T-MINUS","STATUS"].map(h => (
          <span key={h} style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.14em" }}>{h}</span>
        ))}
      </div>
      {meetings.map((m, i) => (
        <div key={m.id} style={{
          display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 200px 130px 140px",
          padding: pad, alignItems: "center",
          borderTop: i === 0 ? "none" : "1px solid rgba(221,212,242,0.5)",
          transition: "background 120ms ease",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(157,124,255,0.04)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Avatar name={m.invitee_name || m.invitee_email} size={30}/>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {m.invitee_name || m.invitee_email}
            </span>
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
    </Card>
  );
}

// ---------- Empty state — iridescent radar ----------
function EmptyState() {
  return (
    <Card style={{ padding: "44px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <Radar/>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <span className="mono" style={{
            fontSize: 10.5, letterSpacing: "0.16em", fontWeight: 600,
            background: BRAND_GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            ⊙ NO TARGETS LOCKED
          </span>
          <div style={{ fontSize: 28, lineHeight: 1.15, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            The calendars are clean.
          </div>
          <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14, maxWidth: 480, lineHeight: 1.55 }}>
            No coworkers are currently in the pipeline. The scheduler is sweeping for an opening 3+ days out — sit tight, and we&rsquo;ll find someone&rsquo;s Wednesday to ruin.
          </p>
          <div style={{ marginTop: 6, display: "flex", gap: 10, alignItems: "center" }}>
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
    </Card>
  );
}

function Radar() {
  return (
    <div style={{
      position: "relative", width: 170, height: 170, flex: "none",
      borderRadius: "50%",
      background: "radial-gradient(circle at 50% 50%, rgba(157,124,255,0.12), transparent 65%)",
    }}>
      <svg viewBox="0 0 170 170" width="170" height="170" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(157,124,255,0.55)"/>
            <stop offset="50%" stopColor="rgba(255,122,182,0.35)"/>
            <stop offset="100%" stopColor="rgba(111,215,232,0)"/>
          </linearGradient>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(157,124,255,0.5)"/>
            <stop offset="50%" stopColor="rgba(255,122,182,0.5)"/>
            <stop offset="100%" stopColor="rgba(111,215,232,0.5)"/>
          </linearGradient>
        </defs>
        {[22, 44, 66, 80].map(r => (
          <circle key={r} cx="85" cy="85" r={r} fill="none" stroke="url(#ring)" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 4"/>
        ))}
        <line x1="5" y1="85" x2="165" y2="85" stroke="rgba(157,124,255,0.18)" strokeWidth="1"/>
        <line x1="85" y1="5" x2="85" y2="165" stroke="rgba(157,124,255,0.18)" strokeWidth="1"/>
        <g style={{ transformOrigin: "85px 85px", animation: "spin 4s linear infinite" }}>
          <path d="M85,85 L85,5 A80,80 0 0 1 161,60 Z" fill="url(#sweep)"/>
        </g>
        <circle cx="85" cy="85" r="4" fill="#9D7CFF"/>
      </svg>
    </div>
  );
}

// ---------- Lifetime tally ----------
function LifetimeTable({ coworkers, compact }) {
  const max = Math.max(...coworkers.map(c => c.times_selected), 1);
  const pad = compact ? "10px 20px" : "14px 20px";
  return (
    <Card>
      <div style={{
        display: "grid", gridTemplateColumns: "44px minmax(180px, 1fr) 1fr 80px",
        background: "linear-gradient(180deg, rgba(157,124,255,0.06), rgba(157,124,255,0.02))",
        borderBottom: "1px solid rgba(221,212,242,0.7)",
        padding: "13px 20px",
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
            borderTop: i === 0 ? "none" : "1px solid rgba(221,212,242,0.5)",
          }}>
            <span className="mono" style={{
              fontSize: 11, fontWeight: 700,
              color: isTop ? "transparent" : "var(--ink-4)",
              background: isTop ? BRAND_GRAD : "none",
              WebkitBackgroundClip: isTop ? "text" : "border-box",
              WebkitTextFillColor: isTop ? "transparent" : "var(--ink-4)",
            }}>
              {String(i+1).padStart(2,"0")}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={c.name} size={28}/>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{c.name}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{c.slack_user_id}</span>
              </div>
            </div>
            <div style={{ paddingRight: 24 }}>
              <div style={{
                position: "relative", height: 6, borderRadius: 3,
                background: "rgba(157,124,255,0.10)", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0, width: `${pct}%`,
                  background: BRAND_GRAD,
                  borderRadius: 3,
                  opacity: isTop ? 1 : 0.55,
                  boxShadow: isTop ? "0 0 14px rgba(157,124,255,0.45)" : "none",
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
    </Card>
  );
}

// ---------- Kill switch ----------
function KillSwitchPanel({ activeCount }) {
  const [status, setStatus] = React.useState("idle");
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

  return (
    <div style={{
      marginTop: 60, marginBottom: 24,
      borderRadius: 22,
      overflow: "hidden", position: "relative",
      background: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(255,87,87,0.35)",
      boxShadow: "0 30px 80px -30px rgba(255,87,87,0.30), 0 1px 0 rgba(255,255,255,0.8) inset",
    }}>
      {/* hazard stripe */}
      <div style={{
        height: 14,
        background: "repeating-linear-gradient(45deg, #FFE15A 0 14px, #1A1230 14px 28px)",
        opacity: 0.95,
      }}/>
      <div style={{ padding: "26px 32px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="mono" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 11px", borderRadius: 999,
              background: "rgba(255,87,87,0.10)", border: "1px solid rgba(255,87,87,0.36)",
              color: "var(--red-deep)",
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", boxShadow: "0 0 10px var(--red)", animation: "pulse 1.6s ease-out infinite" }}/>
              ADMIN MODE — RESTRICTED
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.14em" }}>
              auth · bananabread
            </span>
          </div>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--red)", letterSpacing: "0.18em", fontWeight: 600 }}>
            ZONE-Ω
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 36, alignItems: "center" }}>
          <div>
            <h3 style={{
              margin: 0, fontSize: 42, lineHeight: 1.05, letterSpacing: "-0.03em",
              fontWeight: 700, color: "var(--ink)",
            }}>
              Cancel{" "}
              <span className="serif" style={{
                fontStyle: "italic", fontWeight: 400, color: "var(--red-deep)",
              }}>
                everything
              </span>.
            </h3>
            <p style={{
              marginTop: 14, marginBottom: 0, color: "var(--ink-3)",
              fontSize: 14.5, lineHeight: 1.55, maxWidth: 460,
            }}>
              The kill switch fires a signal to the scheduler. Within 60 seconds, every booked sync will be quietly cancelled and the queue drained.
            </p>
            <div className="mono" style={{
              marginTop: 22, display: "flex", flexDirection: "column", gap: 6,
              fontSize: 11.5,
            }}>
              <Row k="active syncs"  v={`${activeCount} on calendars`} accent="var(--red-deep)"/>
              <Row k="propagation"   v="≤ 60s"/>
              <Row k="reversibility" v="none"/>
            </div>
          </div>

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
              color: "var(--ink-3)", minHeight: 16,
            }}>
              {{
                idle:   "FLIP COVER TO ARM",
                armed:  "PRESS & HOLD 1.5s TO FIRE",
                firing: "TRANSMITTING…",
                done:   "KILL SIGNAL ACK ✓",
              }[status]}
            </div>
            {status === "done" && (
              <button
                onClick={() => setStatus("idle")}
                className="mono"
                style={{
                  background: "transparent", color: "var(--ink-3)",
                  border: "1px solid var(--line-2)",
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
      <span style={{ width: 100, color: "var(--ink-4)", letterSpacing: "0.1em", flex: "none" }}>{k}</span>
      <span style={{ color: accent || "var(--ink-2)", fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function KillButton({ status, setStatus, holdProgress, startHold, endHold }) {
  const armed = status === "armed" || status === "firing" || status === "done";
  const firing = status === "firing";
  const done = status === "done";
  const coverRot = armed ? -110 : 0;

  return (
    <div style={{
      position: "relative", width: 230, height: 230,
      perspective: 800, userSelect: "none",
    }}>
      {/* housing */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18,
        background: "linear-gradient(160deg, #FFFFFF, #F0E9FA)",
        border: "1px solid rgba(255,87,87,0.35)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(26,18,48,0.06) inset, 0 14px 36px -10px rgba(255,87,87,0.25)",
      }}/>
      {[[10,10],[210,10],[10,210],[210,210]].map(([x,y], i) => (
        <span key={i} style={{
          position: "absolute", left: x, top: y, width: 10, height: 10, borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, #DDD4F2, #8A7FB0)",
          boxShadow: "0 1px 1px rgba(26,18,48,0.18)",
        }}/>
      ))}
      <div style={{
        position: "absolute", left: 24, right: 24, top: 30, height: 6, borderRadius: 2,
        background: "repeating-linear-gradient(45deg, #FFE15A 0 6px, #1A1230 6px 12px)",
      }}/>
      <div className="mono" style={{
        position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center",
        fontSize: 9.5, color: "var(--red-deep)", letterSpacing: "0.24em", fontWeight: 700,
      }}>
        ⚠ KILL SWITCH · DO NOT PRESS ⚠
      </div>

      {/* button */}
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
              ? "radial-gradient(circle at 35% 30%, #7AE0A5, #2E8B57 70%)"
              : "radial-gradient(circle at 35% 30%, #FF8585, #C92F2F 65%, #7A1414 100%)",
            boxShadow: firing
              ? "0 0 0 6px rgba(255,87,87,0.25), 0 0 60px 12px rgba(255,87,87,0.55), 0 6px 0 #7A1414, 0 1px 0 rgba(255,255,255,0.45) inset"
              : armed
                ? "0 8px 0 #7A1414, 0 22px 36px -8px rgba(255,87,87,0.45), 0 1px 0 rgba(255,255,255,0.45) inset"
                : "0 8px 0 #7A1414, 0 1px 0 rgba(255,255,255,0.45) inset",
            transition: "box-shadow 200ms ease, transform 80ms ease, background 300ms ease",
            transform: holdProgress > 0 ? `translateY(${holdProgress * 6}px)` : firing ? "translateY(6px)" : "translateY(0)",
          }}
        >
          <span style={{
            position: "absolute", inset: 14, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 -10px 20px rgba(255,255,255,0.18) inset, 0 12px 24px rgba(0,0,0,0.25) inset",
          }}/>
          <span style={{
            position: "absolute", left: "20%", top: "12%", width: "55%", height: "30%", borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.6), transparent 70%)",
          }}/>
          {holdProgress > 0 && !firing && (
            <svg viewBox="0 0 130 130" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3"
                strokeDasharray={`${holdProgress * 2 * Math.PI * 58} 1000`}
                strokeLinecap="round"/>
            </svg>
          )}
          <span className="mono" style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em",
            textShadow: "0 1px 0 rgba(0,0,0,0.35)",
          }}>
            {done ? "FIRED" : firing ? "…" : "FIRE"}
          </span>
        </button>
      </div>

      {/* cover */}
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
            background: "linear-gradient(165deg, #FFFFFF 0%, #F4EAFE 60%, #ECE0FF 100%)",
            backgroundImage: "repeating-linear-gradient(45deg, rgba(255,87,87,0.06) 0 6px, transparent 6px 12px), linear-gradient(165deg, #FFFFFF 0%, #F4EAFE 60%, #ECE0FF 100%)",
            border: "1px solid rgba(255,87,87,0.45)",
            boxShadow: "0 10px 24px rgba(26,18,48,0.18), 0 1px 0 rgba(255,255,255,0.9) inset",
            display: "flex", alignItems: "center", justifyContent: "center",
            backfaceVisibility: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 6, borderRadius: 8, border: "1px dashed rgba(255,87,87,0.4)" }}/>
          <span className="mono" style={{
            color: "var(--red-deep)", fontSize: 10, letterSpacing: "0.22em", fontWeight: 800,
          }}>
            LIFT TO ARM
          </span>
          <span style={{ position: "absolute", left: 6, bottom: -3, width: 8, height: 8, borderRadius: "50%", background: "#FFE15A", border: "1px solid rgba(255,87,87,0.5)" }}/>
          <span style={{ position: "absolute", right: 6, bottom: -3, width: 8, height: 8, borderRadius: "50%", background: "#FFE15A", border: "1px solid rgba(255,87,87,0.5)" }}/>
        </div>
      </div>
    </div>
  );
}

// ---------- Footer ----------
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
        an internal experiment by{" "}
        <span style={{
          background: BRAND_GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontWeight: 700,
        }}>tl;dv</span>
      </span>
    </div>
  );
}

// ---------- Cancelled toggle ----------
function CancelledToggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="mono"
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "6px 8px 6px 12px", borderRadius: 999,
        background: value ? "rgba(157,124,255,0.12)" : "rgba(255,255,255,0.7)",
        border: `1px solid ${value ? "rgba(123,92,255,0.42)" : "var(--line-2)"}`,
        color: value ? "var(--purple-deep)" : "var(--ink-3)",
        cursor: "pointer",
        fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
        transition: "all 160ms ease",
      }}
    >
      SHOW CANCELLED
      <span style={{
        position: "relative", width: 28, height: 16, borderRadius: 999,
        background: value ? "var(--purple)" : "#D6CCEE",
        transition: "background 160ms ease",
      }}>
        <span style={{
          position: "absolute", top: 2, left: value ? 14 : 2,
          width: 12, height: 12, borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(26,18,48,0.25)",
          transition: "left 160ms ease",
        }}/>
      </span>
    </button>
  );
}

// ---------- App ----------
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const now = useNow(1000);
  const [showCancelled, setShowCancelled] = React.useState(false);

  const coworkers = [...MOCK_COWORKERS].sort((a,b) => b.times_selected - a.times_selected);
  const meetings  = [...MOCK_MEETINGS].sort((a,b) => new Date(a.meeting_time) - new Date(b.meeting_time));
  const activeMeetings = meetings.filter(m => m.status === "booked");
  const cancelledMeetings = meetings
    .filter(m => m.status === "cancelled" || m.status === "waiting to be cancelled")
    .sort((a,b) => new Date(b.meeting_time) - new Date(a.meeting_time));

  const lifetimeCount = coworkers.reduce((s,c) => s + c.times_selected, 0);
  const victims = 4;

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
            kicker={showCancelled ? "01 — CANCELLED" : "01 — CURRENTLY ACTIVE"}
            title={showCancelled ? "Cancelled syncs" : "Active syncs"}
            right={<CancelledToggle value={showCancelled} onChange={setShowCancelled}/>}
          />
          {(showCancelled
            ? cancelledMeetings.length === 0
            : (t.showEmptyState || activeMeetings.length === 0))
            ? <EmptyState/>
            : <ActiveTable meetings={showCancelled ? cancelledMeetings : activeMeetings} compact={t.compactTable}/>
          }
        </section>

        <section style={{ marginTop: 56 }}>
          <SectionHeader
            kicker="02 — LIFETIME TALLY"
            title="Leaderboard"
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
