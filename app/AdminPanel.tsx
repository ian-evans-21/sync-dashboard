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
    <div className="mt-16 overflow-hidden rounded-[22px] border border-[rgba(255,87,87,0.35)] bg-white/85 shadow-[0_30px_80px_-30px_rgba(255,87,87,0.30),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-md">
      <div className="h-3.5 bg-[repeating-linear-gradient(45deg,#FFE15A_0_14px,#1A1230_14px_28px)] opacity-95" />

      <div className="px-6 py-6 sm:px-8 sm:py-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,87,87,0.36)] bg-[rgba(255,87,87,0.10)] px-3 py-1 font-mono text-[11px] font-extrabold tracking-[0.16em] text-[#C92F2F]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF5757] shadow-[0_0_12px_rgba(255,87,87,0.9)]" />
              ADMIN MODE — RESTRICTED
            </span>
            <span className="hidden font-mono text-[11px] tracking-[0.14em] text-[#A89FC2] sm:inline">
              auth · bananabread
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[#FF5757]">
            ZONE-Ω
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_290px] lg:items-center">
          <div>
            <h3 className="text-balance text-3xl font-bold leading-tight tracking-[-0.03em] text-[#1A1230] sm:text-[42px]">
              Cancel{" "}
              <span className="font-serif italic font-normal text-[#C92F2F]">
                everything
              </span>
              .
            </h3>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#7A6E9A]">
              The kill switch fires a signal to the scheduler. Within 60 seconds, every booked sync will be quietly cancelled and the queue drained.
            </p>

            <div className="mt-6 space-y-2 font-mono text-[12px]">
              <div className="flex gap-3 whitespace-nowrap">
                <span className="w-28 flex-none tracking-[0.10em] text-[#A89FC2]">
                  active syncs
                </span>
                <span className="font-semibold text-[#C92F2F]">
                  {activeCount} on calendars
                </span>
              </div>
              <div className="flex gap-3 whitespace-nowrap">
                <span className="w-28 flex-none tracking-[0.10em] text-[#A89FC2]">
                  propagation
                </span>
                <span className="font-semibold text-[#4A3D70]">≤ 60s</span>
              </div>
              <div className="flex gap-3 whitespace-nowrap">
                <span className="w-28 flex-none tracking-[0.10em] text-[#A89FC2]">
                  reversibility
                </span>
                <span className="font-semibold text-[#4A3D70]">none</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative h-[230px] w-[230px] select-none">
              <div className="absolute inset-0 rounded-[18px] border border-[rgba(255,87,87,0.35)] bg-gradient-to-br from-white to-[#F0E9FA] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_-1px_0_rgba(26,18,48,0.06)_inset,0_14px_36px_-10px_rgba(255,87,87,0.25)]" />
              <div className="absolute left-6 right-6 top-8 h-1.5 rounded-sm bg-[repeating-linear-gradient(45deg,#FFE15A_0_6px,#1A1230_6px_12px)]" />
              <div className="absolute inset-x-0 bottom-4 text-center font-mono text-[10px] font-extrabold tracking-[0.24em] text-[#C92F2F]">
                ⚠ KILL SWITCH · DO NOT PRESS ⚠
              </div>

              {status === "idle" && (
                <button
                  onClick={() => setStatus("confirming")}
                  className="absolute inset-0 m-auto flex h-40 w-40 items-center justify-center rounded-full border border-[rgba(255,87,87,0.45)] bg-[repeating-linear-gradient(45deg,rgba(255,87,87,0.06)_0_6px,transparent_6px_12px),linear-gradient(165deg,#FFFFFF_0%,#F4EAFE_60%,#ECE0FF_100%)] shadow-[0_10px_24px_rgba(26,18,48,0.18),0_1px_0_rgba(255,255,255,0.9)_inset] transition hover:shadow-[0_14px_30px_rgba(26,18,48,0.20),0_1px_0_rgba(255,255,255,0.9)_inset] focus:outline-none focus:ring-2 focus:ring-[#FF7AB6]/40"
                >
                  <span className="rounded-full border border-dashed border-[rgba(255,87,87,0.40)] px-4 py-2 font-mono text-[10px] font-extrabold tracking-[0.22em] text-[#C92F2F]">
                    LIFT TO ARM
                  </span>
                </button>
              )}

              {status === "confirming" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[190px] rounded-2xl border border-[#ECE6FA] bg-white/80 p-4 shadow-[0_14px_36px_-16px_rgba(26,18,48,0.25)] backdrop-blur">
                    <div className="font-mono text-[11px] font-semibold tracking-[0.16em] text-[#A89FC2]">
                      CONFIRM ACTION
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#1A1230]">
                      This will cancel {activeCount} active{" "}
                      {activeCount === 1 ? "meeting" : "meetings"}.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={fireKillSwitch}
                        className="flex-1 rounded-xl bg-gradient-to-b from-[#FF8585] via-[#FF5757] to-[#C92F2F] px-3 py-2 text-center font-mono text-[11px] font-extrabold tracking-[0.16em] text-white shadow-[0_10px_22px_-10px_rgba(255,87,87,0.65)] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#FF5757]/40"
                      >
                        FIRE
                      </button>
                      <button
                        onClick={() => setStatus("idle")}
                        className="rounded-xl border border-[#DDD4F2] bg-white/70 px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#7A6E9A] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#9D7CFF]/30"
                      >
                        ABORT
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {status === "firing" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#FF8585,#C92F2F_65%,#7A1414_100%)] shadow-[0_0_0_6px_rgba(255,87,87,0.25),0_0_60px_12px_rgba(255,87,87,0.55)]">
                    <span className="font-mono text-[12px] font-extrabold tracking-[0.16em] text-white">
                      …
                    </span>
                  </div>
                </div>
              )}

              {status === "done" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#7AE0A5,#2E8B57_70%)] shadow-[0_10px_26px_-10px_rgba(61,190,124,0.55)]">
                    <span className="font-mono text-[12px] font-extrabold tracking-[0.16em] text-white">
                      FIRED
                    </span>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[200px] rounded-2xl border border-[rgba(255,87,87,0.35)] bg-[rgba(255,87,87,0.08)] p-4 text-center shadow-[0_14px_36px_-16px_rgba(255,87,87,0.35)]">
                    <div className="font-mono text-[11px] font-extrabold tracking-[0.16em] text-[#C92F2F]">
                      ERROR
                    </div>
                    <div className="mt-2 text-xs leading-relaxed text-[#1A1230]">
                      {errorMsg}
                    </div>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-3 w-full rounded-xl border border-[#DDD4F2] bg-white/70 px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#7A6E9A] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#9D7CFF]/30"
                    >
                      RESET
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="min-h-4 text-center font-mono text-[11px] font-semibold tracking-[0.14em] text-[#7A6E9A]">
              {{
                idle: "FLIP COVER TO ARM",
                confirming: "CONFIRM TO FIRE",
                firing: "TRANSMITTING…",
                done: "KILL SIGNAL ACK ✓",
                error: "FAILED",
              }[status]}
            </div>

            {status === "done" && (
              <button
                onClick={() => setStatus("idle")}
                className="rounded-full border border-[#DDD4F2] bg-transparent px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-[#7A6E9A] hover:bg-white/70"
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