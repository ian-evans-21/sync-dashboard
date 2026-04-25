"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  activeCount: number;
};

export default function AdminPanel({ activeCount }: Props) {
  const [status, setStatus] = useState<"idle" | "confirming" | "firing" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function fireKillSwitch() {
    setStatus("firing");
    const { error } = await supabase
      .from("kill_switch")
      .insert({ processed: false });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("done");
  }

  return (
    <div className="mt-12 p-6 border-2 border-red-300 rounded-lg bg-red-50">
      <div className="text-xs font-mono text-red-700 mb-3">ADMIN MODE</div>

      {status === "idle" && (
        <button
          onClick={() => setStatus("confirming")}
          className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700"
        >
          CANCEL ALL ACTIVE SYNCS
        </button>
      )}

      {status === "confirming" && (
        <div>
          <p className="mb-3 text-red-900">
            Are you sure? This will cancel {activeCount} active{" "}
            {activeCount === 1 ? "meeting" : "meetings"}.
          </p>
          <div className="flex gap-3">
            <button
              onClick={fireKillSwitch}
              className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700"
            >
              Yes, cancel them all
            </button>
            <button
              onClick={() => setStatus("idle")}
              className="bg-zinc-200 text-zinc-800 px-4 py-2 rounded-md font-semibold hover:bg-zinc-300"
            >
              Never mind
            </button>
          </div>
        </div>
      )}

      {status === "firing" && (
        <p className="text-red-900">Sending kill signal...</p>
      )}

      {status === "done" && (
        <p className="text-red-900">
          Kill switch fired. Scheduler will cancel meetings within 60 seconds.
        </p>
      )}

      {status === "error" && (
        <p className="text-red-900">Error: {errorMsg}</p>
      )}
    </div>
  );
}