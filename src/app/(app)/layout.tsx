import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ShellChrome } from "@/components/shell-chrome";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  if (!cookieStore.get("meethud-onboarding")) {
    redirect("/onboarding");
  }

  return <ShellChrome>{children}</ShellChrome>;
}
