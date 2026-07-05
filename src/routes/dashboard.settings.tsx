import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export const Route = createFileRoute("/dashboard/settings")({
  component: Page,
});

function Page() {
  return (
    <>
      <DashboardTopbar title="Settings" />
      <div className="p-6 max-w-3xl w-full mx-auto space-y-6">
        <Card title="Profile" desc="Update your personal details visible across the workspace.">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-gradient-to-br from-brand to-accent-cyan grid place-items-center text-white text-lg font-semibold">SJ</div>
            <button className="ring-1 ring-border px-3 py-1.5 rounded-lg text-sm hover:bg-muted">Change photo</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name"><input className="input-field" defaultValue="Sarah Jenkins" /></Field>
            <Field label="Email"><input className="input-field" defaultValue="sarah@northwind.co" /></Field>
          </div>
        </Card>

        <Card title="Preferences" desc="Personalize your Lumina experience.">
          <Field label="Language"><select className="input-field"><option>English (US)</option><option>Español</option></select></Field>
          <Field label="Theme"><select className="input-field"><option>System</option><option>Light</option><option>Dark</option></select></Field>
        </Card>

        <Card title="Notifications" desc="Choose what lands in your inbox.">
          <Toggle label="Weekly digest" defaultChecked />
          <Toggle label="Aspect drift alerts" defaultChecked />
          <Toggle label="Product update newsletter" />
        </Card>

        <Card title="Security" desc="Protect your account with additional layers.">
          <Field label="Change password"><input type="password" className="input-field" placeholder="New password" /></Field>
          <Toggle label="Two-factor authentication" defaultChecked />
        </Card>

        <Card title="API configuration" desc="Manage tokens and webhook endpoints.">
          <Field label="Publishable key"><input className="input-field font-mono text-xs" defaultValue="pk_live_9k2h8f2h3jsdlfk" readOnly /></Field>
        </Card>

        <div className="p-6 rounded-xl bg-danger/5 ring-1 ring-danger/30">
          <div className="font-semibold text-danger">Delete account</div>
          <p className="text-sm text-muted-foreground mt-1">Permanently remove your workspace and all data. This action cannot be undone.</p>
          <button className="mt-4 bg-danger text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90">Delete workspace</button>
        </div>
      </div>
    </>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="p-6 rounded-xl bg-card ring-1 ring-border space-y-4">
      <div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative w-10 h-6 bg-muted rounded-full peer-checked:bg-brand transition-colors before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:size-5 before:bg-white before:rounded-full before:transition-transform peer-checked:before:translate-x-4 cursor-pointer" />
    </label>
  );
}