// src/_lib/actions.ts
"use server";

import { supabaseAdmin } from "./supabaseAdmin";

export async function registerUserAction(formData: any): Promise<{ success: boolean; error?: string }> {
    try {
        const { email, password, firstName, lastName } = formData;

        // 1. Create user in Supabase Auth (Internal)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName }
        });

        if (authError) throw new Error(authError.message);

        // 2. Upsert the profile keyed by id to avoid PK collisions
        const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
            {
                id: authData.user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                onboarded: false,
                provider: "credentials",
            },
            { onConflict: "id" }
        );

        if (profileError) throw new Error(profileError.message);

        return { success: true };
    } catch (error: any) {
        // כאן אנחנו מחזירים את הודעת השגיאה כדי שה-Frontend יוכל לקרוא אותה
        return { success: false, error: error.message || "Registration failed" };
    }
}