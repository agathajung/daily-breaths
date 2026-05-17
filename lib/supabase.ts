import { createClient } from "@supabase/supabase-js";

// 빌드 시점에 env 없어도 createClient 호출이 throw하지 않도록 placeholder.
// 런타임에 실제 환경변수가 있으면 그 값으로 createClient.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  if (typeof window !== "undefined") {
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. .env.local 또는 Vercel 환경변수를 확인하세요."
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Mood = {
  id: string;
  text: string;
  created_at: string;
};
