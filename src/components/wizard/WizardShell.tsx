import { useWizardStore } from "../../stores/wizard-store";
import { useWizardNavigation } from "../../hooks/useWizardNavigation";
import { STEPS } from "../../lib/constants";
import { ProgressBar } from "../ui/ProgressBar";
import { Button } from "../ui/Button";
import { WelcomeStep } from "./WelcomeStep";
import { ProviderStep } from "./ProviderStep";
import { ApiKeyStep } from "./ApiKeyStep";
import { ChannelStep } from "./ChannelStep";
import { SkillStep } from "./SkillStep";
import { ModelStep } from "./ModelStep";
import { RuntimeStep } from "./RuntimeStep";
import { ReviewLaunchStep } from "./ReviewLaunchStep";

export function WizardShell() {
  const { step, fadeIn, launched, canNext } = useWizardStore();
  const { next, back } = useWizardNavigation();

  const showNav = step > 0 && step < STEPS.length - 1 && !launched;
  const showProgress = step > 0 && step < STEPS.length - 1;

  const stepComponents = [
    <WelcomeStep key="welcome" onNext={next} />,
    <ProviderStep key="provider" />,
    <ModelStep key="models" />,
    <ApiKeyStep key="apikey" />,
    <RuntimeStep key="runtime" />,
    <ChannelStep key="channels" />,
    <SkillStep key="skills" />,
    <ReviewLaunchStep key="launch" />,
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0F1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card */}
      <div
        role="main"
        aria-label={`Setup wizard - Step ${step + 1} of ${STEPS.length}: ${STEPS[step]?.label}`}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 640,
          background: "linear-gradient(180deg, #111827 0%, #0F172A 100%)",
          border: "1px solid #1E293B",
          borderRadius: 16,
          padding: "40px 44px",
          boxShadow:
            "0 0 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.04)",
        }}
      >
        {/* Progress */}
        {showProgress && (
          <div style={{ marginBottom: 40 }}>
            <ProgressBar step={step} />
          </div>
        )}

        {/* Step content */}
        <div
          style={{
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {stepComponents[step]}
        </div>

        {/* Navigation */}
        {showNav && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 40,
              paddingTop: 24,
              borderTop: "1px solid rgba(30,41,59,0.5)",
            }}
          >
            <Button variant="secondary" onClick={back} aria-label="Go back to previous step">
              &larr; Back
            </Button>
            <Button disabled={!canNext()} onClick={next} aria-label={step === STEPS.length - 2 ? "Review your choices" : "Continue to next step"}>
              {step === STEPS.length - 2 ? "Review \u2192" : "Continue \u2192"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
