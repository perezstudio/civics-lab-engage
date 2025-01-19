"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message
    }
  }

  // Redirect after successful sign in
  redirect('/app/engage')
}

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export async function signOutAction() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  redirect('/sign-in')
}

export async function createWorkspaceAction(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  // Get the current user's session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const type = formData.get('type') as 'state_party' | 'county_party' | 'campaign'
  const state = formData.get('state') as string
  const county = formData.get('county') as string | null
  const race = formData.get('race') as string | null

  try {
    // Create the workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name,
        type,
        state,
        county: county || null,
        race: race || null,
      })
      .select()
      .single()

    if (workspaceError) {
      console.error('Workspace creation error:', workspaceError)
      return { error: workspaceError.message }
    }

    // Create workspace_users entry for the creator (as owner)
    const { error: userError } = await supabase
      .from('workspace_users')
      .insert({
        workspace_id: workspace.id,
        user_id: session.user.id,
        role: 'owner'
      })

    if (userError) {
      console.error('Workspace user creation error:', userError)
      return { error: userError.message }
    }

    // Set the selected workspace in user_settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        selected_workspace_id: workspace.id,
        updated_at: new Date().toISOString()
      })

    if (settingsError) {
      console.error('User settings update error:', settingsError)
      return { error: settingsError.message }
    }

    // Return success before redirect
    return { success: true, workspaceId: workspace.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to create workspace' }
  }
}

export async function selectWorkspaceAction(workspaceId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: session.user.id,
      selected_workspace_id: workspaceId,
      updated_at: new Date().toISOString()
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/engage')
  return { success: true }
}
