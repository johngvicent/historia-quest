
-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('alumno', 'profesor');
CREATE TYPE public.pregunta_tipo AS ENUM ('test', 'vf', 'orden');
CREATE TYPE public.dificultad AS ENUM ('facil', 'medio', 'dificil');

-- ===== profiles =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  nivel INTEGER NOT NULL DEFAULT 1,
  monedas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== user_roles =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ===== temas =====
CREATE TABLE public.temas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  periodo TEXT NOT NULL DEFAULT '',
  orden INTEGER NOT NULL DEFAULT 0,
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.temas TO authenticated;
GRANT ALL ON public.temas TO service_role;
ALTER TABLE public.temas ENABLE ROW LEVEL SECURITY;

-- ===== pruebas =====
CREATE TABLE public.pruebas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id UUID NOT NULL REFERENCES public.temas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  dificultad dificultad NOT NULL DEFAULT 'facil',
  tiempo_estimado INTEGER NOT NULL DEFAULT 5,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  monedas_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pruebas TO authenticated;
GRANT ALL ON public.pruebas TO service_role;
ALTER TABLE public.pruebas ENABLE ROW LEVEL SECURITY;

-- ===== preguntas =====
CREATE TABLE public.preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prueba_id UUID NOT NULL REFERENCES public.pruebas(id) ON DELETE CASCADE,
  tipo pregunta_tipo NOT NULL,
  enunciado TEXT NOT NULL,
  opciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  respuesta_correcta JSONB NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  puntos INTEGER NOT NULL DEFAULT 10
);
GRANT SELECT ON public.preguntas TO authenticated;
GRANT ALL ON public.preguntas TO service_role;
ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;

-- ===== resultados =====
CREATE TABLE public.resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prueba_id UUID NOT NULL REFERENCES public.pruebas(id) ON DELETE CASCADE,
  puntuacion INTEGER NOT NULL DEFAULT 0,
  aciertos INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  tiempo_seg INTEGER NOT NULL DEFAULT 0,
  xp_ganado INTEGER NOT NULL DEFAULT 0,
  monedas_ganadas INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.resultados TO authenticated;
GRANT ALL ON public.resultados TO service_role;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;

-- ===== insignias =====
CREATE TABLE public.insignias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  icono TEXT NOT NULL DEFAULT 'Award'
);
GRANT SELECT ON public.insignias TO authenticated;
GRANT ALL ON public.insignias TO service_role;
ALTER TABLE public.insignias ENABLE ROW LEVEL SECURITY;

-- ===== user_insignias =====
CREATE TABLE public.user_insignias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insignia_id UUID NOT NULL REFERENCES public.insignias(id) ON DELETE CASCADE,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, insignia_id)
);
GRANT SELECT ON public.user_insignias TO authenticated;
GRANT ALL ON public.user_insignias TO service_role;
ALTER TABLE public.user_insignias ENABLE ROW LEVEL SECURITY;

-- ===== RLS Policies =====
-- profiles: cada usuario lee/edita su perfil; profesor lee todos
CREATE POLICY "profiles select own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles select profesor" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles: usuario lee su propio rol; profesor lee todos
CREATE POLICY "user_roles select own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_roles select profesor" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'profesor'));

-- temas: authenticated leen, profesor CRUD
CREATE POLICY "temas select all auth" ON public.temas FOR SELECT TO authenticated USING (true);
CREATE POLICY "temas insert profesor" ON public.temas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "temas update profesor" ON public.temas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "temas delete profesor" ON public.temas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'profesor'));

-- pruebas: authenticated leen, profesor CRUD
CREATE POLICY "pruebas select all auth" ON public.pruebas FOR SELECT TO authenticated USING (true);
CREATE POLICY "pruebas insert profesor" ON public.pruebas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "pruebas update profesor" ON public.pruebas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "pruebas delete profesor" ON public.pruebas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'profesor'));

-- preguntas: authenticated leen (respuesta_correcta se filtra en server fn); profesor CRUD
CREATE POLICY "preguntas select all auth" ON public.preguntas FOR SELECT TO authenticated USING (true);
CREATE POLICY "preguntas insert profesor" ON public.preguntas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "preguntas update profesor" ON public.preguntas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "preguntas delete profesor" ON public.preguntas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'profesor'));

-- resultados: alumno ve/crea los suyos; profesor lee todos
CREATE POLICY "resultados select own" ON public.resultados FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "resultados select profesor" ON public.resultados FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "resultados insert own" ON public.resultados FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- insignias: todos leen
CREATE POLICY "insignias select all auth" ON public.insignias FOR SELECT TO authenticated USING (true);

-- user_insignias: usuario ve las suyas; profesor lee todas
CREATE POLICY "user_insignias select own" ON public.user_insignias FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_insignias select profesor" ON public.user_insignias FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'profesor'));

-- ===== Trigger nuevo usuario =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role app_role;
  v_nombre TEXT;
BEGIN
  v_nombre := COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1));
  v_role := COALESCE((NEW.raw_user_meta_data->>'rol')::app_role, 'alumno');

  INSERT INTO public.profiles (id, nombre) VALUES (NEW.id, v_nombre);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
