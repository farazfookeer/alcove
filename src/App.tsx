import { WizardShell } from "./components/wizard/WizardShell";
import { Dashboard } from "./components/dashboard/Dashboard";
import { useWizardStore } from "./stores/wizard-store";

function App() {
  const launched = useWizardStore((s) => s.launched);
  return launched ? <Dashboard /> : <WizardShell />;
}

export default App;
