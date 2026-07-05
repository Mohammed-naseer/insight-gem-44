import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/site/auth-shell";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Github } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Sign in — Lumina AI" },
    { name: "description", content: "Sign in to your Lumina AI workspace." },
  ]}),
  component: Page,
});

type FormData = { email: string; password: string; remember: boolean };

function Page() {
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const onSubmit = async (_: FormData) => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Welcome back");
    nav({ to: "/dashboard" });
  };
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Lumina workspace"
      footer={<>Don't have an account? <Link to="/signup" className="text-brand font-medium">Sign up</Link></>}
    >
      <div className="grid grid-cols-2 gap-2">
        <button className="ring-1 ring-border py-2 rounded-lg text-sm font-medium hover:bg-muted flex items-center justify-center gap-2">
          <GoogleIcon /> Google
        </button>
        <button className="ring-1 ring-border py-2 rounded-lg text-sm font-medium hover:bg-muted flex items-center justify-center gap-2">
          <Github className="size-4" /> GitHub
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px bg-border flex-1" /><span className="text-xs text-muted-foreground">OR</span><div className="h-px bg-border flex-1" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input type="email" placeholder="Work email" {...register("email", { required: true })} className="input-field" />
          {errors.email && <span className="text-xs text-danger">Email is required</span>}
        </div>
        <div>
          <input type="password" placeholder="Password" {...register("password", { required: true })} className="input-field" />
          {errors.password && <span className="text-xs text-danger">Password is required</span>}
        </div>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2"><input type="checkbox" {...register("remember")} /> Remember me</label>
          <Link to="/login" className="text-brand">Forgot password?</Link>
        </div>
        <button disabled={isSubmitting} className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.6c-.2 1.3-1 2.4-2.1 3.2v2.6h3.4c2-1.8 3.1-4.5 3.1-7.8z" fill="#4285F4"/><path d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10 10 0 0012 22z" fill="#34A853"/><path d="M6.2 13.6c-.2-.6-.3-1.2-.3-1.9 0-.7.1-1.3.3-1.9V7.1H2.7A10 10 0 002 12c0 1.6.4 3.1 1 4.4l3.2-2.8z" fill="#FBBC05"/><path d="M12 5.8c1.5 0 2.9.5 3.9 1.5l3-3C17.2 2.6 14.8 2 12 2A10 10 0 002.7 7.1L6.2 9.8C7 7.6 9.3 5.8 12 5.8z" fill="#EA4335"/></svg>
  );
}