import { useCallback } from "react";
import { useWizardStore } from "../stores/wizard-store";
import { STEPS } from "../lib/constants";

export function useWizardNavigation() {
  const { step, setStep, setFadeIn } = useWizardStore();

  const transition = useCallback(
    (newStep: number) => {
      setFadeIn(false);
      setTimeout(() => {
        setStep(newStep);
        setFadeIn(true);
      }, 250);
    },
    [setStep, setFadeIn]
  );

  const next = useCallback(() => {
    transition(Math.min(step + 1, STEPS.length - 1));
  }, [step, transition]);

  const back = useCallback(() => {
    transition(Math.max(step - 1, 0));
  }, [step, transition]);

  return { next, back, transition };
}
