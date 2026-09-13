'use client'
import { ProgrammerDonnateur } from "@/app/actions/donations";
import { useActionState } from "react";
export default function ProgrammerDonateurPage({donId}) {
    const [state, formAction, isPending] =  useActionState(ProgrammerDonnateur, null)
  return (
    <div className="mt-6 bg-white border border-ong-bordure rounded-lg p-6">
      <h2 className="font-display font-semibold text-blue-700 text-[16px] mb-4">
        Programmer le donateur
      </h2>
      <form action={formAction}>
        <label
          htmlFor="dateReception"
          className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5"
        >
          Date
        </label>
        <div className="flex gap-x-6 items-center">
          <input type="hidden" value={donId} name="donId" />
          <input
            required
            id="dateProgrammee"
            name="dateProgrammee"
            type="date"
            className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert"
          />
          <button
            disabled={isPending}
            href="#"
            target="_blank"
            rel="noreferrer"
            style={{ color: "white" }}
            className="inline-flex disabled:bg-slate-500  items-center cursor-pointer gap-2 px-4 py-2.5 rounded-md bg-ong-bleu text-white text-[13px] font-medium hover:bg-ong-bleu-fonce transition-colors"
          >
            {isPending ? "Programmer..." : "Programmer"}
          </button>
        </div>
        {state?.error && <p className="text-red-600">{state.error}</p>}
        {state?.success && <p className="text-green-600">{state.success}</p>}
      </form>
    </div>
  );
}
