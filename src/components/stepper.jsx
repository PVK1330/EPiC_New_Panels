import React from "react";
import { Check } from "lucide-react";

const stepsData = [
  { step: "Application Submitted", status: "completed", date: "2025-01-15" },
  { step: "Document Verification", status: "completed", date: "2025-01-20" },
  { step: "Background Check", status: "in-progress", date: "2025-02-01" },
  { step: "Final Approval", status: "pending", date: "TBD" },
];

const Stepper = () => {
  const currentStepIndex = stepsData.findIndex(
    (s) => s.status === "in-progress"
  );

  const progress =
    (currentStepIndex / (stepsData.length - 1)) * 100;

  return (
    <div className="w-full p-4">
      <h1 className="text-center font-bold text-[#004ca5] text-xl mb-6">
        Track Your Application
      </h1>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-[#c8102e] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs">
          <span className="text-gray-500">
            Step {currentStepIndex + 1} of {stepsData.length}
          </span>
          <span className="font-semibold text-[#c8102e]">
            {stepsData[currentStepIndex]?.step}
          </span>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex relative items-center justify-between mt-10">
        {/* Background line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200" />

        {/* Progress line */}
        <div
          className="absolute top-6 left-0 h-0.5 bg-[#c8102e] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

        {stepsData.map((item, index) => {
          const isCompleted = item.status === "completed";
          const isActive = item.status === "in-progress";

          return (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center text-center w-full"
            >
              {/* Circle */}
              <div
                className={`w-15 h-15 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? "bg-[#c8102e] border-[#c8102e] text-white"
                    : isActive
                    ? "bg-white border-[#c8102e] text-[#c8102e]"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span className="font-bold">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-3 text-sm ${
                  isActive
                    ? "text-[#c8102e] font-semibold"
                    : "text-gray-500"
                }`}
              >
                {item.step}
              </span>

              {/* Date */}
              <span className="text-xs text-gray-400 mt-1">
                {item.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;