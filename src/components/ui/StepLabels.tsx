import { STEPS } from "../../lib/constants";

interface StepLabelsProps {
  step: number;
}

export function StepLabels({ step }: StepLabelsProps) {
  return (
    <div className="flex justify-between mt-5 font-mono">
      {STEPS.map((s, i) => (
        <span
          key={s.id}
          className="text-center transition-all duration-400 ease-in-out text-[9px] tracking-[1px] uppercase"
          style={{
            color: i === step ? "#FCD34D" : i < step ? "#F59E0B" : "#475569",
            width: `${100 / STEPS.length}%`,
            fontWeight: i === step ? 700 : 400,
          }}
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}
