import { ORDER_STATUS_STEPS } from "../constants/orderStatus";
import type { OrderStatus } from "../types";

interface Props {
  current: OrderStatus;
}

export function StatusStepper({ current }: Props): JSX.Element {
  const activeIndex = ORDER_STATUS_STEPS.indexOf(current);

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-4">
      {ORDER_STATUS_STEPS.map((step, idx) => {
        const done = idx < activeIndex;
        const active = idx === activeIndex;
        return (
          <li
            key={step}
            className="flex items-center gap-2 text-sm"
            data-status-step={step}
            data-active={active ? "true" : "false"}
            data-testid={active ? "status-current" : undefined}
          >
            <span
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done
                  ? "bg-emerald-600 text-white"
                  : active
                    ? "bg-orange-600 text-white ring-2 ring-orange-300"
                    : "bg-slate-200 text-slate-600",
              ].join(" ")}
            >
              {done ? "✓" : idx + 1}
            </span>
            <span
              className={
                active ? "font-semibold text-slate-900" : "text-slate-600"
              }
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
