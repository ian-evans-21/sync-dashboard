import { supabase } from "@/lib/supabase";
import AdminPanel from "./AdminPanel";

export const revalidate = 0;

type Coworker = {
  id: number;
  name: string;
  slack_user_id: string;
  email: string | null;
  times_selected: number;
};

type Meeting = {
  id: number;
  invitee_email: string;
  invitee_name: string | null;
  meeting_time: string;
  status: "booked" | "waiting to be cancelled" | "cancelled" | "happened";
};

async function getData() {
  const [coworkersRes, meetingsRes] = await Promise.all([
    supabase
      .from("coworkers")
      .select("*")
      .order("times_selected", { ascending: false }),
    supabase
      .from("meetings")
      .select("*")
      .order("meeting_time", { ascending: true }),
  ]);

  return {
    coworkers: (coworkersRes.data ?? []) as Coworker[],
    meetings: (meetingsRes.data ?? []) as Meeting[],
  };
}

function statusBadge(status: Meeting["status"]) {
  const styles: Record<Meeting["status"], { wrap: string; dot: string; pulse: boolean; label: string }> = {
    booked: {
      wrap:
        "bg-[rgba(123,92,255,0.10)] text-[#4F2FCC] border-[rgba(123,92,255,0.28)]",
      dot: "bg-[#7B5CFF]",
      pulse: true,
      label: "BOOKED",
    },
    "waiting to be cancelled": {
      wrap:
        "bg-[rgba(229,160,25,0.10)] text-[#9C6A0A] border-[rgba(229,160,25,0.30)]",
      dot: "bg-[#E5A019]",
      pulse: true,
      label: "PENDING",
    },
    cancelled: {
      wrap:
        "bg-[rgba(168,159,194,0.10)] text-[#7A6E9A] border-[rgba(168,159,194,0.28)]",
      dot: "bg-[#A89FC2]",
      pulse: false,
      label: "CANCELLED",
    },
    happened: {
      wrap:
        "bg-[rgba(111,215,232,0.14)] text-[#1F8A9C] border-[rgba(111,215,232,0.34)]",
      dot: "bg-[#6FD7E8]",
      pulse: false,
      label: "HAPPENED",
    },
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1",
        "text-[10px] font-semibold tracking-[0.18em] font-mono whitespace-nowrap",
        styles[status].wrap,
      ].join(" ")}
    >
      <span className="relative h-1.5 w-1.5">
        <span className={["absolute inset-0 rounded-full", styles[status].dot].join(" ")} />
        {styles[status].pulse && (
          <span
            className={[
              "absolute -inset-1 rounded-full opacity-50",
              styles[status].dot,
              "animate-ping",
            ].join(" ")}
          />
        )}
      </span>
      {styles[status].label}
    </span>
  );
}

function avatarInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "?")
    .join("");
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTMinus(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(ms);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const v = minutes < 60 ? `${minutes}m` : hours < 24 ? `${hours}h` : `${days}d`;
  return ms >= 0 ? `in ${v}` : `${v} ago`;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string; show?: string }>;
}) {
  const { admin, show } = await searchParams;
  const isAdmin = admin === "bananabread";

  const { coworkers, meetings } = await getData();
  const activeMeetings = meetings.filter((m) => m.status === "booked");
  const showCancelled = show === "cancelled";
  const cancelledMeetings = meetings
    .filter((m) => m.status === "cancelled" || m.status === "waiting to be cancelled")
    .slice()
    .sort((a, b) => new Date(b.meeting_time).getTime() - new Date(a.meeting_time).getTime());

  const meetingsToShow = showCancelled ? cancelledMeetings : activeMeetings;

  const dashboardHref = (() => {
    const p = new URLSearchParams();
    if (admin) p.set("admin", admin);
    return p.toString() ? `?${p.toString()}` : "/";
  })();
  const cancelledHref = (() => {
    const p = new URLSearchParams();
    if (admin) p.set("admin", admin);
    p.set("show", "cancelled");
    return `?${p.toString()}`;
  })();

  return (
    <main className="min-h-screen bg-[#FAF8FF] text-[#1A1230]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#FAF8FF] bg-[radial-gradient(1100px_600px_at_85%_-10%,rgba(255,160,201,0.40),transparent_60%),radial-gradient(900px_500px_at_-10%_30%,rgba(157,124,255,0.40),transparent_60%),radial-gradient(1000px_600px_at_50%_110%,rgba(111,215,232,0.32),transparent_60%)] bg-fixed" />

      <header className="sticky top-0 z-10 border-b border-[rgba(221,212,242,0.6)] bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#9D7CFF] via-[#FF7AB6] to-[#6FD7E8] shadow-[0_6px_14px_-6px_rgba(123,92,255,0.5)]">
                <span className="font-mono text-sm font-extrabold tracking-tight text-white">s</span>
              </div>
              <div className="leading-none">
                <div className="text-base font-bold tracking-tight">sync</div>
                <div className="font-mono text-[10px] font-semibold tracking-[0.22em] text-[#A89FC2]">
                  OPS CONSOLE
                </div>
              </div>
            </div>
            <div className="h-5 w-px bg-[rgba(221,212,242,0.8)]" />
            <div className="font-mono text-[11px] tracking-[0.14em] text-[#7A6E9A]">
              INTERNAL · v0.4.2
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(61,190,124,0.32)] bg-[rgba(61,190,124,0.10)] px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.12em] text-[#1F7A4A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3DBE7C] shadow-[0_0_12px_rgba(61,190,124,0.7)]" />
              SCHEDULER ONLINE
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <div className="mb-10">
          <div className="mb-4 flex items-baseline gap-3">
            <span className="bg-gradient-to-r from-[#9D7CFF] via-[#FF7AB6] to-[#6FD7E8] bg-clip-text font-mono text-[11px] font-semibold tracking-[0.22em] text-transparent">
              ◐ LIVE OPS
            </span>
            <span className="font-mono text-[11px] tracking-[0.14em] text-[#A89FC2]">
              / DASHBOARD / Q2-26
            </span>
          </div>

          <h1 className="text-balance text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-[#1A1230] sm:text-6xl md:text-7xl">
            Who&rsquo;s getting{" "}
            <span className="bg-gradient-to-r from-[#9D7CFF] via-[#FF7AB6] to-[#6FD7E8] bg-clip-text font-serif italic font-normal tracking-[-0.02em] text-transparent">
              synced
            </span>
            .
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[#7A6E9A]">
            This dashboard displays all currently active and past syncs.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#ECE6FA] bg-white/70 p-5 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_80px_-50px_rgba(123,92,255,0.25)] backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[#A89FC2]">
                  ACTIVE SYNCS
                </div>
                <div className="h-8 w-8 rounded-xl bg-[rgba(157,124,255,0.18)]" />
              </div>
              <div className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#1A1230]">
                {activeMeetings.length.toString().padStart(2, "0")}
              </div>
              <div className="mt-2 font-mono text-[11px] tracking-[0.14em] text-[#7A6E9A]">
                currently booked
              </div>
            </div>

            <div className="rounded-2xl border border-[#ECE6FA] bg-white/70 p-5 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_80px_-50px_rgba(123,92,255,0.25)] backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[#A89FC2]">
                  TOTAL SYNCS
                </div>
                <div className="h-8 w-8 rounded-xl bg-[rgba(111,215,232,0.18)]" />
              </div>
              <div className="mt-4 bg-gradient-to-r from-[#9D7CFF] via-[#FF7AB6] to-[#6FD7E8] bg-clip-text text-4xl font-bold tracking-[-0.04em] text-transparent">
                {coworkers.reduce((s, c) => s + c.times_selected, 0).toString().padStart(2, "0")}
              </div>
              <div className="mt-2 font-mono text-[11px] tracking-[0.14em] text-[#7A6E9A]">
                lifetime tally
              </div>
            </div>
          </div>
        </div>

        <section className="mb-12">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[12px] font-semibold tracking-[0.18em] text-[#7A6E9A]">
                {showCancelled ? "01 — CANCELLED" : "01 — ACTIVE"}
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#1A1230]">
                Active syncs
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={showCancelled ? dashboardHref : cancelledHref}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
                  "font-mono text-[11px] font-semibold tracking-[0.12em] transition",
                  showCancelled
                    ? "border-[rgba(123,92,255,0.42)] bg-[rgba(157,124,255,0.12)] text-[#4F2FCC]"
                    : "border-[rgba(221,212,242,0.9)] bg-white/70 text-[#7A6E9A] hover:bg-white",
                ].join(" ")}
              >
                SHOW CANCELLED
                <span
                  className={[
                    "relative h-4 w-7 rounded-full",
                    showCancelled ? "bg-[#7B5CFF]" : "bg-[#D6CCEE]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-[0_1px_2px_rgba(26,18,48,0.25)] transition-all",
                      showCancelled ? "left-3.5" : "left-0.5",
                    ].join(" ")}
                  />
                </span>
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#ECE6FA] bg-white/70 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_80px_-50px_rgba(123,92,255,0.25)] backdrop-blur-md">
            {meetingsToShow.length === 0 ? (
              <div className="px-6 py-10">
                <div className="flex items-center justify-between gap-8">
                  <div>
                    <div className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[#A89FC2]">
                      NO TARGETS LOCKED
                    </div>
                    <div className="mt-2 text-lg font-semibold text-[#1A1230]">
                      Nothing active right now.
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-[#7A6E9A]">
                      The scheduler is online. Stand by for the next harmlessly suspicious calendar event.
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="h-24 w-24 rounded-full border border-[rgba(123,92,255,0.28)] bg-[radial-gradient(circle_at_30%_30%,rgba(157,124,255,0.30),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(111,215,232,0.22),transparent_55%),radial-gradient(circle_at_30%_80%,rgba(255,122,182,0.22),transparent_60%)]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#ECE6FA] bg-[#FBFAFF]/80">
                    <tr className="text-[#7A6E9A]">
                      <th className="px-6 py-4 font-mono text-[11px] font-semibold tracking-[0.18em]">
                        INVITEE
                      </th>
                      <th className="px-6 py-4 font-mono text-[11px] font-semibold tracking-[0.18em]">
                        WHEN
                      </th>
                      <th className="px-6 py-4 font-mono text-[11px] font-semibold tracking-[0.18em]">
                        T‑MINUS
                      </th>
                      <th className="px-6 py-4 font-mono text-[11px] font-semibold tracking-[0.18em]">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetingsToShow.map((m) => {
                      const name = m.invitee_name ?? m.invitee_email;
                      return (
                        <tr key={m.id} className="border-b border-[#ECE6FA] last:border-b-0">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(26,18,48,0.06)] bg-[rgba(157,124,255,0.18)] text-xs font-extrabold text-[#1A1230]">
                                {avatarInitials(name)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-[#1A1230]">{name}</div>
                                <div className="truncate font-mono text-[11px] tracking-[0.10em] text-[#A89FC2]">
                                  {m.invitee_email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-[12px] text-[#7A6E9A]">
                            {formatWhen(m.meeting_time)}
                          </td>
                          <td className="px-6 py-4 font-mono text-[12px] text-[#7A6E9A]">
                            {formatTMinus(m.meeting_time)}
                          </td>
                          <td className="px-6 py-4">{statusBadge(m.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-3">
            <div className="font-mono text-[12px] font-semibold tracking-[0.18em] text-[#7A6E9A]">
              02 — LEADERBOARD
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#1A1230]">
              Leaderboard
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#ECE6FA] bg-white/70 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_80px_-50px_rgba(123,92,255,0.25)] backdrop-blur-md">
            {coworkers.length === 0 ? (
              <div className="px-6 py-10 text-sm text-[#7A6E9A]">Nobody synced yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#ECE6FA] bg-[#FBFAFF]/80">
                    <tr className="text-[#7A6E9A]">
                      <th className="px-6 py-4 font-mono text-[11px] font-semibold tracking-[0.18em]">
                        RANK
                      </th>
                      <th className="px-6 py-4 font-mono text-[11px] font-semibold tracking-[0.18em]">
                        COWORKER
                      </th>
                      <th className="px-6 py-4 font-mono text-[11px] font-semibold tracking-[0.18em]">
                        FREQUENCY
                      </th>
                      <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold tracking-[0.18em]">
                        TIMES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coworkers.map((c, idx) => {
                      const max = coworkers[0]?.times_selected ?? 1;
                      const pct = Math.max(0.06, Math.min(1, c.times_selected / max));
                      const isTop = idx === 0;
                      return (
                        <tr key={c.id} className="border-b border-[#ECE6FA] last:border-b-0">
                          <td className="px-6 py-4 font-mono text-[12px] font-semibold tabular-nums">
                            <span
                              className={
                                isTop
                                  ? "bg-gradient-to-r from-[#9D7CFF] via-[#FF7AB6] to-[#6FD7E8] bg-clip-text text-transparent"
                                  : "text-[#A89FC2]"
                              }
                            >
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(26,18,48,0.06)] bg-[rgba(111,215,232,0.22)] text-xs font-extrabold text-[#1A1230]">
                                {avatarInitials(c.name)}
                              </div>
                              <div className="leading-tight">
                                <div className="font-semibold text-[#1A1230]">{c.name}</div>
                                <div className="font-mono text-[11px] tracking-[0.10em] text-[#A89FC2]">
                                  {c.slack_user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-2 w-full rounded-full bg-[rgba(157,124,255,0.10)]">
                              <div
                                className={[
                                  "h-2 rounded-full bg-gradient-to-r from-[#9D7CFF] via-[#FF7AB6] to-[#6FD7E8]",
                                  isTop ? "shadow-[0_0_14px_rgba(157,124,255,0.45)]" : "opacity-60",
                                ].join(" ")}
                                style={{ width: `${pct * 100}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-[14px] font-semibold tabular-nums text-[#1A1230]">
                            {c.times_selected}×
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {isAdmin && <AdminPanel activeCount={activeMeetings.length} />}
      </div>
    </main>
  );
}