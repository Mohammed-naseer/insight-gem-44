import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/site/auth-shell";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [
    { title: "Create account — Lumina AI" },
    { name: "description", content: "Create your Lumina AI workspace in seconds." },
  ]}),
  component: Page,
});

type FormData = { name: string; email: string; password: string };

function Page() {
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const onSubmit = async (_: FormData) => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Workspace created");
    nav({ to: "/dashboard" });
  };
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Start your 14-day free trial"
      footer={<>Have an account? <Link to="/login" className="text-brand font-medium">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input placeholder="Full name" {...register("name", { required: true })} className="input-field" />
        {errors.name && <span className="text-xs text-danger">Required</span>}
        <input type="email" placeholder="Work email" {...register("email", { required: true })} className="input-field" />
        {errors.email && <span className="text-xs text-danger">Required</span>}
        <input type="password" placeholder="Password (min 8 characters)" {...register("password", { required: true, minLength: 8 })} className="input-field" />
        {errors.password && <span className="text-xs text-danger">Min 8 characters</span>}
        <button disabled={isSubmitting} className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60">
          {isSubmitting ? "Creating…" : "Create account"}
        </button>
        <p className="text-[10px] text-muted-foreground text-center">By continuing you agree to our Terms and Privacy Policy.</p>
      </form>
    </AuthShell>
  );
}