import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassPanel } from "@/components/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso — Hispania Quest" },
      { name: "description", content: "Inicia sesión o regístrate en Hispania Quest." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup";
type Rol = "alumno" | "profesor";

function AuthPage() {
  const [rol, setRol] = useState<Rol>("alumno");
  const [mode, setMode] = useState<Mode>("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { nombre, rol },
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Iniciando sesión…");
        // Auto sign in (sin confirmación de email por defecto)
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await router.invalidate();
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <Link
        to="/"
        className="absolute top-6 left-6 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        ← Volver
      </Link>
      <GlassPanel strong className="w-full max-w-md p-8 sm:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-glow">
            <span className="text-2xl font-black">HQ</span>
          </div>
          <h1 className="text-2xl font-black">Hispania Quest</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Inicia sesión para continuar" : "Crea tu cuenta y empieza a jugar"}
          </p>
        </div>

        <Tabs value={rol} onValueChange={(v) => setRol(v as Rol)} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alumno" className="gap-2">
              <GraduationCap className="h-4 w-4" /> Alumno
            </TabsTrigger>
            <TabsTrigger value="profesor" className="gap-2">
              <ShieldCheck className="h-4 w-4" /> Profesor
            </TabsTrigger>
          </TabsList>
          <TabsContent value="alumno" />
          <TabsContent value="profesor" />
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-full bg-brand text-primary-foreground shadow-glow hover:opacity-95"
          >
            {loading ? "Cargando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}
