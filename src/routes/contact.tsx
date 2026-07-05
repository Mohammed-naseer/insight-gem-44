import { createFileRoute } from "@tanstack/react-router";
import { MarketingNav } from "@/components/site/marketing-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Lumina AI" },
    { name: "description", content: "Talk to our team about enterprise review intelligence." },
    { property: "og:title", content: "Contact — Lumina AI" },
    { property: "og:description", content: "Get in touch with sales, support, or partnerships." },
  ]}),
  component: Page,
});

type FormData = { name: string; email: string; company: string; message: string };

function Page() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();
  const onSubmit = async (_: FormData) => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent — we'll reply within one business day.");
    reset();
  };
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-14">
        <div className="space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-brand">Contact</div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Let's talk intelligence</h1>
          <p className="text-muted-foreground">Sales, integrations, or enterprise procurement — we'll route you to the right team.</p>
          <ul className="space-y-3 pt-4 text-sm">
            <li className="flex items-center gap-3"><Mail className="size-4 text-brand" /> hello@lumina.ai</li>
            <li className="flex items-center gap-3"><Phone className="size-4 text-brand" /> +1 (415) 555-0130</li>
            <li className="flex items-center gap-3"><MapPin className="size-4 text-brand" /> 500 Market St, San Francisco</li>
          </ul>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 rounded-2xl bg-card ring-1 ring-border space-y-4">
          <Field label="Name" error={errors.name?.message}>
            <input {...register("name", { required: "Required" })} className="input-field" />
          </Field>
          <Field label="Work email" error={errors.email?.message}>
            <input type="email" {...register("email", { required: "Required" })} className="input-field" />
          </Field>
          <Field label="Company">
            <input {...register("company")} className="input-field" />
          </Field>
          <Field label="Message" error={errors.message?.message}>
            <textarea rows={4} {...register("message", { required: "Required" })} className="input-field resize-none" />
          </Field>
          <button disabled={isSubmitting} className="w-full bg-brand text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            {isSubmitting ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="text-xs text-danger mt-1 block">{error}</span>}
    </label>
  );
}