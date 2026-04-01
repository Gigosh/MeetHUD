import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShellChrome } from "@/components/shell-chrome";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  if (!cookieStore.get("meethud-onboarding")) {
    redirect("/onboarding");
  }

  return <ShellChrome>{children}</ShellChrome>;
}
