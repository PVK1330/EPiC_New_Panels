import { Check } from "lucide-react";

const STEPS = [
  "Routes",
  "Organisation",
  "CoS Requirements",
  "Documents",
  "Auth. Officer",
  "Key Contact",
  "Level 1 Users",
  "Declarations",
];

export default function WizardStepBar({ current }) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <ol className="flex items-center min-w-max gap-0">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <Check size={14} /> : step}
                </div>
                <span
                  className={`mt-1 text-[10px] font-black whitespace-nowrap ${
                    active ? "text-primary" : done ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-12 mx-1 mt-[-14px] rounded-full transition-all ${
                    done ? "bg-emerald-400" : "bg-gray-100"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
