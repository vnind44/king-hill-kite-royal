import { createFileRoute } from "@tanstack/react-router";
import { useTheme, type ThemeChoice } from "@/components/campus/theme-provider";
import { updateMySettings } from "@/lib/campus/api";
import { AuthGate } from "@/components/campus/shell";
import { Card } from "@/components/campus/ui";
import { cn } from "@/lib/campus/cn";
import { useCampusProfile } from "@/lib/campus/use-profile";

export const Route = createFileRoute("/_app/appearance")({ component: AppearancePage });

function AppearancePage() {
  return (
    <AuthGate next="/appearance">
      <AppearanceBody />
    </AuthGate>
  );
}

function AppearanceBody() {
  const { theme, setTheme } = useTheme();
  const { refresh } = useCampusProfile();
  const options: { id: ThemeChoice; label: string; note: string }[] = [
    { id: "light", label: "Light", note: "Paper surfaces, ink text" },
    { id: "dark", label: "Dark", note: "Navy campus night mode" },
    { id: "system", label: "System", note: "Follow the device setting" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Appearance</h1>
      <p className="text-sm text-muted">
        Centralized theme tokens only. Arbitrary background tints are disabled so text contrast stays readable.
      </p>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className="w-full text-left"
          onClick={async () => {
            setTheme(opt.id);
            await updateMySettings({ data: { theme: opt.id } });
            await refresh();
          }}
        >
          <Card className={cn("p-4", theme === opt.id && "border-teal")}>
            <p className="font-semibold">{opt.label}</p>
            <p className="text-xs text-muted">{opt.note}</p>
          </Card>
        </button>
      ))}
    </div>
  );
}
