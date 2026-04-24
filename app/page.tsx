import { supabase } from "@/lib/supabase";

// This makes the page re-fetch on every request instead of caching forever.
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
      .order("meeting_time", { ascending: false }),
  ]);

  return {
    coworkers: (coworkersRes.data as Coworker[]) ?? [],
    meetings: (meetingsRes.data as Meeting[]) ?? [],
  };
}

function statusStyle(status: Meeting["status"]) {
  switch (status) {
    case "booked":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "waiting to be cancelled":
      return "bg-orange-100 text-orange-900 border-orange-200";
    case "cancelled":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    case "happened":
      return "bg-rose-100 text-rose-900 border-rose-200";
  }
}

export default async function Home() {
  const { coworkers, meetings } = await getData();

  // For each coworker, find their most recent active (booked) meeting if any.
  const meetingByEmail = new Map<string, Meeting>();
  for (const m of meetings) {
    if (m.status === "booked" && !meetingByEmail.has(m.invitee_email)) {
      meetingByEmail.set(m.invitee_email, m);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">sync</h1>
          <p className="mt-2 text-sm text-zinc-600">
            who&apos;s getting synced, who&apos;s gotten synced, and who&apos;s next.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
            currently active
          </h2>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meeting time</th>
                </tr>
              </thead>
              <tbody>
                {meetings.filter((m) => m.status === "booked").length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-zinc-500"
                    >
                      No active syncs right now.
                    </td>
                  </tr>
                )}
                {meetings
                  .filter((m) => m.status === "booked")
                  .map((m) => (
                    <tr
                      key={m.id}
                      className="border-t border-zinc-100"
                    >
                      <td className="px-4 py-3 font-medium">
                        {m.invitee_name ?? m.invitee_email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-xs ${statusStyle(
                            m.status
                          )}`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {new Date(m.meeting_time).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
            lifetime tally
          </h2>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Times selected</th>
                </tr>
              </thead>
              <tbody>
                {coworkers.map((c) => (
                  <tr key={c.id} className="border-t border-zinc-100">
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {c.times_selected}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-10 text-xs text-zinc-400">
          this is a joke project. nobody is actually getting synced.
        </footer>
      </div>
    </main>
  );
}