// Verifies with the public anon key that RLS hides everything that must not be
// public. Run with: npm run verify:rls  (reads .env.local)
//
// Relies on the fixed IDs in supabase/seed.sql: dogs 01–42 are available,
// 43–50 are reserved/adopted/deceased/transferred.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, anonKey, { auth: { persistSession: false } });

const dogId = (n) => `d0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const HIDDEN_DOG_IDS = [43, 44, 45, 46, 47, 48, 49, 50].map(dogId);
const EXPECTED_AVAILABLE = 42;

let failures = 0;
function check(name, passed, detail) {
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!passed) failures++;
}

// 1. Non-available statuses return nothing.
{
  const { data, error } = await supabase
    .from("dogs")
    .select("id, name, status")
    .in("status", ["reserved", "adopted", "deceased", "transferred"]);
  check(
    "dogs with hidden statuses are not readable",
    !error && data.length === 0,
    error?.message ?? `${data.length} rows`,
  );
}

// 2. Hidden dogs can't be fetched even by ID.
{
  const { data, error } = await supabase.from("dogs").select("id").in("id", HIDDEN_DOG_IDS);
  check(
    "hidden dogs are not readable by id",
    !error && data.length === 0,
    error?.message ?? `${data.length} rows`,
  );
}

// 3. Everything visible is available, and all available seed dogs are visible.
{
  const { data, error } = await supabase.from("dogs").select("id, status");
  const allAvailable = !error && data.every((d) => d.status === "available");
  check("every readable dog is available", allAvailable, error?.message ?? `${data.length} rows`);
  check(
    `all ${EXPECTED_AVAILABLE} available seed dogs are readable`,
    !error && data.length === EXPECTED_AVAILABLE,
    error?.message ?? `${data.length} rows`,
  );
}

// 4. Photos of hidden dogs are not readable.
{
  const { data, error } = await supabase
    .from("dog_photos")
    .select("id, dog_id")
    .in("dog_id", HIDDEN_DOG_IDS);
  check(
    "photos of hidden dogs are not readable",
    !error && data.length === 0,
    error?.message ?? `${data.length} rows`,
  );
}
{
  const { data, error } = await supabase.from("dog_photos").select("id");
  check(
    "photos of available dogs are readable",
    !error && data.length > 0,
    error?.message ?? `${data.length} rows`,
  );
}

// 5. status_history and profiles are not readable at all
//    (status_history has seeded rows: the trigger logs every insert).
for (const table of ["status_history", "profiles"]) {
  const { data, error } = await supabase.from(table).select("*").limit(1);
  check(
    `${table} is not readable`,
    Boolean(error) || data.length === 0,
    error ? `rejected: ${error.message}` : `${data.length} rows`,
  );
}

// 6. Writes are rejected.
{
  const { error } = await supabase.from("dogs").insert({
    shelter_id: "a0000000-0000-4000-8000-000000000001",
    name: "RLS test",
    size: "small",
    estimated_birth_date: "2024-01-01",
  });
  check("insert into dogs is rejected", Boolean(error), error?.message ?? "insert succeeded!");
}
{
  const { data, error } = await supabase
    .from("dogs")
    .update({ status: "adopted" })
    .eq("id", dogId(1))
    .select("id");
  check(
    "update of dogs is rejected",
    Boolean(error) || data.length === 0,
    error ? `rejected: ${error.message}` : `${data.length} rows updated`,
  );
}
{
  const { data, error } = await supabase
    .from("shelters")
    .delete()
    .eq("id", "a0000000-0000-4000-8000-000000000001")
    .select("id");
  check(
    "delete from shelters is rejected",
    Boolean(error) || data.length === 0,
    error ? `rejected: ${error.message}` : `${data.length} rows deleted`,
  );
}

console.log(failures === 0 ? "\nAll RLS checks passed." : `\n${failures} RLS check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
