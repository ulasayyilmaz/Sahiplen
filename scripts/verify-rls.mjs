// Verifies the database access rules (RLS, grants, storage policies) against the
// live project, using only the public anon key plus real logins.
// Run with: npm run verify:rls  (reads .env.local)
//
// Anonymous checks always run. Logged-in checks need the test accounts from
// the README (test-admin, test-staff-a, test-staff-b, test-pending @example.com)
// and TEST_USER_PASSWORD in .env.local; they are skipped otherwise.
//
// Relies on the fixed IDs in supabase/seed.sql: dogs 01–42 are available,
// 43–50 are reserved/adopted/deceased/transferred. Shelter 01 (İstanbul) has
// dogs 01–07 and 43; shelter 02 has 08–14, 45 and 48.
//
// Every write attempted here is either expected to be rejected or is harmless
// and undone, so the script is safe to run repeatedly.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testPassword = process.env.TEST_USER_PASSWORD;
if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const dogId = (n) => `d0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const shelterId = (n) => `a0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const HIDDEN_DOG_IDS = [43, 44, 45, 46, 47, 48, 49, 50].map(dogId);
const EXPECTED_AVAILABLE = 42;
const SHELTER_A = shelterId(1); // test-staff-a's shelter
const SHELTER_OTHER = shelterId(2); // nobody in the tests works here
const OWN_DOG = dogId(1); // Karabaş, available, shelter 01
const OWN_HIDDEN_DOG = dogId(43); // Çomar, reserved, shelter 01
const OTHER_DOG = dogId(8); // Duman, available, shelter 02
const OTHER_HIDDEN_DOGS = [dogId(45), dogId(48)]; // adopted / deceased, shelter 02

let failures = 0;
function check(name, passed, detail) {
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!passed) failures++;
}
const rows = ({ data, error }) => (error ? `error: ${error.message}` : `${data.length} rows`);
/** A write that must not happen: rejected outright, or zero rows affected. */
const blocked = ({ data, error }) => Boolean(error) || (Array.isArray(data) && data.length === 0);
const blockedDetail = ({ data, error }) =>
  error ? `rejected: ${error.message}` : `${data?.length ?? 0} rows affected`;

function client() {
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

async function loginAs(who) {
  const sb = client();
  const { data, error } = await sb.auth.signInWithPassword({
    email: `test-${who}@example.com`,
    password: testPassword,
  });
  if (error) throw new Error(`Login as test-${who} failed: ${error.message}`);
  return { sb, userId: data.user.id };
}

const tinyFile = () => new Blob(["x"], { type: "image/webp" });
const randomPath = (shelter, dog) => `${shelter}/${dog}/${crypto.randomUUID()}.webp`;

// ---------------------------------------------------------------------------
console.log("\n== Anonymous visitor ==");
{
  const anon = client();

  let r = await anon
    .from("dogs")
    .select("id")
    .in("status", ["reserved", "adopted", "deceased", "transferred"]);
  check("dogs with hidden statuses are not readable", !r.error && r.data.length === 0, rows(r));

  r = await anon.from("dogs").select("id").in("id", HIDDEN_DOG_IDS);
  check("hidden dogs are not readable by id", !r.error && r.data.length === 0, rows(r));

  r = await anon.from("dogs").select("id, status");
  check(
    "every readable dog is available",
    !r.error && r.data.every((d) => d.status === "available"),
    rows(r),
  );
  check(
    `all ${EXPECTED_AVAILABLE} available seed dogs are readable`,
    !r.error && r.data.length >= EXPECTED_AVAILABLE,
    rows(r),
  );

  r = await anon.from("dog_photos").select("id").in("dog_id", HIDDEN_DOG_IDS);
  check("photos of hidden dogs are not readable", !r.error && r.data.length === 0, rows(r));
  r = await anon.from("dog_photos").select("id");
  check("photos of available dogs are readable", !r.error && r.data.length > 0, rows(r));

  for (const table of ["status_history", "profiles"]) {
    r = await anon.from(table).select("*").limit(1);
    check(`${table} is not readable`, blocked(r), blockedDetail(r));
  }

  r = await anon
    .from("dogs")
    .insert({
      shelter_id: SHELTER_A,
      name: "RLS test",
      size: "small",
      estimated_birth_date: "2024-01-01",
    })
    .select("id");
  check("insert into dogs is rejected", blocked(r), blockedDetail(r));
  r = await anon.from("dogs").update({ status: "adopted" }).eq("id", OWN_DOG).select("id");
  check("update of dogs is rejected", blocked(r), blockedDetail(r));
  r = await anon.from("shelters").delete().eq("id", SHELTER_A).select("id");
  check("delete from shelters is rejected", blocked(r), blockedDetail(r));

  r = await anon.rpc("admin_list_staff");
  check("admin_list_staff is rejected", Boolean(r.error), r.error?.message ?? "returned data!");
  r = await anon.storage.from("dog-photos").upload(randomPath(SHELTER_A, OWN_DOG), tinyFile());
  check("storage upload is rejected", Boolean(r.error), r.error?.message ?? "uploaded!");
}

if (!testPassword) {
  console.log("\nSKIP  logged-in checks: set TEST_USER_PASSWORD in .env.local (see README).");
} else {
  // -------------------------------------------------------------------------
  console.log("\n== Unapproved sign-up (test-pending) ==");
  {
    const { sb, userId } = await loginAs("pending");

    let r = await sb.from("profiles").select("user_id");
    check(
      "reads only their own profile",
      !r.error && r.data.length === 1 && r.data[0].user_id === userId,
      rows(r),
    );
    r = await sb
      .from("profiles")
      .update({ approved: true })
      .eq("user_id", userId)
      .select("user_id");
    check("cannot approve themselves", blocked(r), blockedDetail(r));
    r = await sb
      .from("profiles")
      .update({ role: "platform_admin" })
      .eq("user_id", userId)
      .select("user_id");
    check("cannot make themselves admin", blocked(r), blockedDetail(r));
    r = await sb.rpc("admin_set_staff", {
      target_user: userId,
      set_approved: true,
      set_shelter_id: SHELTER_A,
    });
    check("cannot call admin_set_staff", Boolean(r.error), r.error?.message ?? "succeeded!");
    r = await sb.rpc("admin_list_staff");
    check("cannot call admin_list_staff", Boolean(r.error), r.error?.message ?? "returned data!");

    r = await sb
      .from("dogs")
      .insert({
        shelter_id: SHELTER_A,
        name: "RLS test",
        size: "small",
        estimated_birth_date: "2024-01-01",
      })
      .select("id");
    check("cannot add dogs", blocked(r), blockedDetail(r));
    r = await sb.from("dogs").select("id").eq("id", OWN_HIDDEN_DOG);
    check("cannot read non-available dogs", !r.error && r.data.length === 0, rows(r));
    r = await sb.from("dogs").update({ name: "RLS test" }).eq("id", OWN_DOG).select("id");
    check("cannot edit dogs", blocked(r), blockedDetail(r));
    r = await sb.storage.from("dog-photos").upload(randomPath(SHELTER_A, OWN_DOG), tinyFile());
    check("cannot upload photos", Boolean(r.error), r.error?.message ?? "uploaded!");
  }

  // -------------------------------------------------------------------------
  console.log("\n== Approved staff of shelter 01 (test-staff-a) ==");
  {
    const { sb, userId } = await loginAs("staff-a");

    let r = await sb.from("profiles").select("user_id");
    check("reads only their own profile", !r.error && r.data.length === 1, rows(r));
    r = await sb
      .from("profiles")
      .update({ approved: false })
      .eq("user_id", userId)
      .select("user_id");
    check("cannot change their own approval", blocked(r), blockedDetail(r));
    r = await sb
      .from("profiles")
      .update({ shelter_id: SHELTER_OTHER })
      .eq("user_id", userId)
      .select("user_id");
    check("cannot move themselves to another shelter", blocked(r), blockedDetail(r));
    const { data: me } = await sb
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .single();
    r = await sb
      .from("profiles")
      .update({ full_name: me.full_name })
      .eq("user_id", userId)
      .select("user_id");
    check("can edit their own name", !r.error && r.data.length === 1, rows(r));
    r = await sb.rpc("admin_set_staff", {
      target_user: userId,
      set_approved: true,
      set_shelter_id: SHELTER_OTHER,
    });
    check("cannot call admin_set_staff", Boolean(r.error), r.error?.message ?? "succeeded!");

    r = await sb.from("dogs").select("id").eq("id", OWN_HIDDEN_DOG);
    check("reads own shelter's non-available dog", !r.error && r.data.length === 1, rows(r));
    r = await sb.from("dogs").select("id").in("id", OTHER_HIDDEN_DOGS);
    check(
      "cannot read other shelters' non-available dogs",
      !r.error && r.data.length === 0,
      rows(r),
    );
    r = await sb.from("status_history").select("id").eq("dog_id", OWN_DOG);
    check("reads status history of own dogs", !r.error && r.data.length > 0, rows(r));
    r = await sb
      .from("status_history")
      .select("id")
      .in("dog_id", [OTHER_DOG, ...OTHER_HIDDEN_DOGS]);
    check("cannot read other shelters' status history", !r.error && r.data.length === 0, rows(r));

    const { data: own } = await sb
      .from("dogs")
      .select("last_verified_at")
      .eq("id", OWN_DOG)
      .single();
    r = await sb
      .from("dogs")
      .update({ last_verified_at: own.last_verified_at })
      .eq("id", OWN_DOG)
      .select("id");
    check("can edit own shelter's dog", !r.error && r.data.length === 1, rows(r));
    r = await sb.from("dogs").update({ name: "RLS test" }).eq("id", OTHER_DOG).select("id");
    check("cannot edit another shelter's dog", blocked(r), blockedDetail(r));
    r = await sb
      .from("dogs")
      .insert({
        shelter_id: SHELTER_OTHER,
        name: "RLS test",
        size: "small",
        estimated_birth_date: "2024-01-01",
      })
      .select("id");
    check("cannot add a dog to another shelter", blocked(r), blockedDetail(r));
    r = await sb.from("dogs").update({ shelter_id: SHELTER_OTHER }).eq("id", OWN_DOG).select("id");
    check("cannot move a dog to another shelter", blocked(r), blockedDetail(r));
    r = await sb.from("dogs").delete().eq("id", OWN_DOG).select("id");
    check("cannot delete dogs", blocked(r), blockedDetail(r));

    const otherPhotoUrl = `${url}/storage/v1/object/public/dog-photos/${randomPath(SHELTER_OTHER, OTHER_DOG)}`;
    r = await sb.from("dog_photos").insert({ dog_id: OTHER_DOG, url: otherPhotoUrl }).select("id");
    check("cannot add photos to another shelter's dog", blocked(r), blockedDetail(r));
    r = await sb
      .from("dog_photos")
      .insert({ dog_id: OWN_DOG, url: "https://example.com/not-our-storage.jpg" })
      .select("id");
    check("cannot add a photo URL outside our storage", blocked(r), blockedDetail(r));
    r = await sb.storage
      .from("dog-photos")
      .upload(randomPath(SHELTER_OTHER, OTHER_DOG), tinyFile());
    check(
      "cannot upload into another shelter's folder",
      Boolean(r.error),
      r.error?.message ?? "uploaded!",
    );

    const path = randomPath(SHELTER_A, OWN_DOG);
    r = await sb.storage.from("dog-photos").upload(path, tinyFile(), { contentType: "image/webp" });
    check("can upload into own shelter's folder", !r.error, r.error?.message ?? "uploaded");
    r = await sb.storage.from("dog-photos").remove([path]);
    check("can delete own upload (cleanup)", !r.error && r.data.length === 1, rows(r));

    r = await sb.from("shelters").update({ name: "RLS test" }).eq("id", SHELTER_A).select("id");
    check("cannot edit shelters", blocked(r), blockedDetail(r));
    r = await sb
      .from("shelters")
      .insert({ name: "RLS test", city: "Test", district: "Test" })
      .select("id");
    check("cannot add shelters", blocked(r), blockedDetail(r));
  }

  // -------------------------------------------------------------------------
  console.log("\n== Platform admin (test-admin) ==");
  {
    const { sb, userId } = await loginAs("admin");

    let r = await sb.rpc("admin_list_staff");
    check("can list staff with emails", !r.error && r.data.length >= 4, rows(r));
    r = await sb.from("dogs").select("id").in("id", HIDDEN_DOG_IDS);
    check(
      "reads all non-available dogs",
      !r.error && r.data.length === HIDDEN_DOG_IDS.length,
      rows(r),
    );
    r = await sb.from("profiles").select("user_id");
    check("reads all profiles", !r.error && r.data.length >= 4, rows(r));
    r = await sb.rpc("admin_set_staff", {
      target_user: userId,
      set_approved: false,
      set_shelter_id: null,
    });
    check(
      "cannot demote an admin (incl. themselves)",
      Boolean(r.error),
      r.error?.message ?? "succeeded!",
    );
    r = await sb.rpc("admin_reject_staff", { target_user: userId });
    check("cannot delete an admin account", Boolean(r.error), r.error?.message ?? "succeeded!");
  }
}

console.log(failures === 0 ? "\nAll RLS checks passed." : `\n${failures} RLS check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
