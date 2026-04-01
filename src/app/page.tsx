import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  redirect(cookieStore.get("meethud-onboarding") ? "/meetings" : "/onboarding");
}
