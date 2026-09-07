import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Portfolio Risk &amp; Correlation Analyzer</h1>
      <p>
        Session 1 scaffold — core infra only. Portfolio data, correlation
        engine, and Agent OS connection land in later sessions per
        BUILD_ROADMAP.md.
      </p>

      {user ? (
        <div>
          <p>Signed in as {user.email}</p>
          <SignOutButton />
        </div>
      ) : (
        <div>
          <p>Not signed in.</p>
          <Link href="/login">Sign in</Link> {" | "}
          <Link href="/signup">Sign up</Link>
        </div>
      )}
    </main>
  );
}
