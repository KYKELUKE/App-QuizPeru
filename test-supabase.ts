// test-supabase.ts
import { supabase } from "./lib/supabase";

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("themes").select("count");

    if (error) {
      console.error("Error connecting to Supabase:", error);
      return false;
    }

    console.log("Successfully connected to Supabase!", data);
    return true;
  } catch (e) {
    console.error("Exception when connecting to Supabase:", e);
    return false;
  }
}
