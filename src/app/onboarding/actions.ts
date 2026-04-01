"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface OnboardingState {
  error: string | null;
}

export async function completeOnboardingAction(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const workspace = formData.get("workspace")?.toString().trim();
  const teamSize = formData.get("teamSize")?.toString().trim();
  const rhythm = formData.get("rhythm")?.toString().trim();

  if (!workspace || !teamSize || !rhythm) {
    return {
      error: "Fill out the workspace, team size, and meeting rhythm to continue.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    "meethud-onboarding",
    JSON.stringify({ workspace, teamSize, rhythm }),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    },
  );

  redirect("/meetings");
}
