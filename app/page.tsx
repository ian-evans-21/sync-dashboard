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
  const styles = {
    booked: "bg-green-100 text-green-800",
    "waiting to be cancelled": "bg-yellow-100 text-yellow-800",
    cancelled: "bg-zinc-200 text-zinc-700",
    happened: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-mono ${styles[status]}`}>
      {status}
    </span>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>;
}) {
  const { admin } = await searchParams;
  const isAdmin = admin === "bananabread";

  const { coworkers, meetings } = await getData();
  const activeMeetings = meetings.filter((m) => m.status === "booked");

  return (
    <main className="min-h-screen bg-zinc-50 p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight mb-2">sync</h1>
        <p className="text-zinc-600 mb-12">
          who&apos;s getting synced, who&apos;s gotten synced, and who&apos;s next.
        </p>

        <section className="mb-12">
          <h2 className="text-xs font-mono text-zinc-500 mb-3 tracking-wider">
            CURRENTLY ACTIVE
          </h2>
          {activeMeetings.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-zinc-500 text-sm">
              No active syncs right now.
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-100 text-zinc-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invitee</th>
                    <th className="px-4 py-3 font-medium">Meeting time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMeetings.map((m) => (
                    <tr key={m.id} className="border-t border-zinc-100">
                      <td className="px-4 py-3">
                        {m.invitee_name ?? m.invitee_email}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {new Date(m.meeting_time).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{statusBadge(m.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-xs font-mono text-zinc-500 mb-3 tracking-wider">
            LIFETIME TALLY
          </h2>
          {coworkers.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-zinc-500 text-sm">
              Nobody synced yet.
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-100 text-zinc-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Times synced</th>
                  </tr>
                </thead>
                <tbody>
                  {coworkers.map((c) => (
                    <tr key={c.id} className="border-t border-zinc-100">
                      <td className="px-4 py-3">{c.name}</td>
                      <td className="px-4 py-3 text-zinc-600">
                        {c.times_selected}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-zinc-400 text-xs mt-16">
          this is a joke project. nobody is actually getting synced.
        </p>

        {isAdmin && <AdminPanel activeCount={activeMeetings.length} />}
      </div>
    </main>
  );
}