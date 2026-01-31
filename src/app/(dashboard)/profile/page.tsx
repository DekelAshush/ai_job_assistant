import ProfilePageWrapper from "@/_components/dashboard/profile/ProfilePageWrapper";
import { createClient } from "@/_lib/supabaseServer";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData.user?.id ?? null;

  let info: any = {};
  let jobPrefs: any = {};

  if (uid) {
    const { data: personal } = await supabase
      .from("user_personal_info")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    info = personal ? { ...personal } : {};

    const { data: profileData } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", uid)
      .single();

    if (profileData) {
      info = {
        ...info,
        first_name: info.first_name ?? profileData.first_name ?? null,
        last_name: info.last_name ?? profileData.last_name ?? null,
        email: info.email ?? (profileData as { email?: string }).email ?? null,
      };
    }

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    if (preferences) {
      jobPrefs = preferences;
    }
  }

  return <ProfilePageWrapper userId={uid} initialInfo={info} initialJobPrefs={jobPrefs} />;
}


// import { useEffect, useState } from "react";
// import { supabaseClient } from "@/_lib/supabaseClient";

// type PersonalInfo = {
//   first_name?: string | null;
//   last_name?: string | null;
//   preferred_name?: string | null;
//   email?: string | null;
//   phone?: string | null;
//   location?: string | null;
//   address1?: string | null;
//   address2?: string | null;
//   address3?: string | null;
//   postal_code?: string | null;
//   ethnicity?: string | null;
//   authorized_us?: boolean | null;
//   authorized_canada?: boolean | null;
//   authorized_uk?: boolean | null;
//   visa_sponsorship?: boolean | null;
//   disability?: boolean | null;
//   lgbtq?: boolean | null;
//   gender?: string | null;
//   veteran?: boolean | null;
//   resume_url?: string | null;
//   cover_letter_url?: string | null;
// };

// type JobPreferences = {
//   idx?: number | null;
//   user_id?: string | null;
//   job_status?: string | null;
//   expected_salary?: number | null;
//   roles?: string[] | null;
//   role_values?: string[] | null;
//   locations?: string[] | null;
//   work_modes?: string[] | null;
//   company_sizes?: string[] | null;
//   industries_prefer?: string[] | null;
//   industries_avoid?: string[] | null;
//   skills_prefer?: string[] | null;
//   skills_avoid?: string[] | null;
// };

// export default function ProfilePage() {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [info, setInfo] = useState<PersonalInfo>({});
//   const [jobPrefs, setJobPrefs] = useState<JobPreferences>({});
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [savingPrefs, setSavingPrefs] = useState(false);
//   const [uploadingResume, setUploadingResume] = useState(false);
//   const [uploadingCover, setUploadingCover] = useState(false);
//   const [resumeLink, setResumeLink] = useState<string | null>(null);
//   const [coverLink, setCoverLink] = useState<string | null>(null);
//   const [deletingResume, setDeletingResume] = useState(false);
//   const [deletingCover, setDeletingCover] = useState(false);
//   const fileName = (value?: string | null) => {
//     if (!value) return null;
//     const clean = (value.split("?")[0] ?? "").split("/").pop() ?? "";
//     // Strip leading "<uuid>-<timestamp>-" if present
//     const withoutPrefix = clean.replace(/^[0-9a-f-]+-\d+-/i, "");
//     return withoutPrefix || clean || null;
//   };
//   const [activeTab, setActiveTab] = useState<"profile" | "personal" | "preferences">("personal");

//   useEffect(() => {
//     const load = async () => {
//       const { data: authData } = await supabaseClient.auth.getUser();
//       const uid = authData.user?.id ?? null;
//       setUserId(uid);
//       if (!uid) {
//         setLoading(false);
//         return;
//       }

//       const { data } = await supabaseClient
//         .from("user_personal_info")
//         .select("*")
//         .eq("user_id", uid)
//         .single();

//       let mergedInfo: PersonalInfo = data ? { ...(data as PersonalInfo) } : {};

//       const { data: profileData } = await supabaseClient
//         .from("profiles")
//         .select("first_name, last_name, email")
//         .eq("id", uid)
//         .single();

//       if (profileData) {
//         mergedInfo = {
//           ...mergedInfo,
//           first_name: mergedInfo.first_name ?? profileData.first_name ?? null,
//           last_name: mergedInfo.last_name ?? profileData.last_name ?? null,
//           email: mergedInfo.email ?? (profileData as { email?: string }).email ?? null,
//         };
//       }

//       setInfo(mergedInfo);

//       const { data: preferences } = await supabaseClient
//         .from("user_preferences")
//         .select("*")
//         .eq("user_id", uid)
//         .single();

//       if (preferences) {
//         setJobPrefs(preferences as JobPreferences);
//       }
//       setLoading(false);
//     };
//     load();
//   }, []);

//   const updateField = (field: keyof PersonalInfo, value: any) => {
//     setInfo((prev) => ({ ...prev, [field]: value }));
//   };

//   const updatePrefsField = (field: keyof JobPreferences, value: any) => {
//     setJobPrefs((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSave = async () => {
//     if (!userId) {
//       alert("Please sign in to save your profile.");
//       return;
//     }
//     setSaving(true);
//     const { error } = await supabaseClient.from("user_personal_info").upsert({
//       user_id: userId,
//       ...info,
//     });
//     setSaving(false);
//     if (error) {
//       alert(error.message);
//     } else {
//       alert("Saved");
//     }
//   };

//   const resolveSignedUrl = async (path: string, bucketName: string) => {
//     if (!path) return null;
//     // If a legacy public URL is already stored, just return it
//     if (path.startsWith("http")) return path;
//     const { data, error } = await supabaseClient.storage.from(bucketName).createSignedUrl(path, 60 * 60);
//     if (error) {
//       console.warn("Signed URL error:", error.message);
//       return null;
//     }
//     return data?.signedUrl ?? null;
//   };

//   useEffect(() => {
//     const loadLinks = async () => {
//       if (info.resume_url) {
//         const url = await resolveSignedUrl(info.resume_url, "resumes");
//         setResumeLink(url);
//       } else {
//         setResumeLink(null);
//       }
//       if (info.cover_letter_url) {
//         const url = await resolveSignedUrl(info.cover_letter_url, "cover_letter");
//         setCoverLink(url);
//       } else {
//         setCoverLink(null);
//       }
//     };
//     loadLinks();
//   }, [info.resume_url, info.cover_letter_url]);

//   const uploadDocument = async (file: File, field: "resume_url" | "cover_letter_url") => {
//     /**
//      * 1. CRITICAL FIX: Fetch user directly from auth session.
//      * This guarantees we have the full UUID and avoids the empty string error ("").
//      */
//     const { data: { user } } = await supabaseClient.auth.getUser();
//     const currentUid = user?.id;
  
//     // If there's no UID, stop the execution to prevent the UUID syntax error
//     if (!currentUid) {
//       alert("Authentication error: Please sign in again.");
//       return;
//     }
  
//     const isResume = field === "resume_url";
//     isResume ? setUploadingResume(true) : setUploadingCover(true);
  
//     /**
//      * 2. Identify the correct bucket (matching your Supabase dashboard).
//      * Bucket names are 'resumes' and 'cover_letter'.
//      */
//     const bucketName = isResume ? "resumes" : "cover_letter";
//     const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
//     const baseName = file.name.replace(new RegExp(`\\.${ext}$`, "i"), "");
//     const safeBase = baseName.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "file";
    
//     /**
//      * 3. Generate a clean path (UUID + Timestamp + original filename for user visibility).
//      * Example: <uuid>-1699999999999-my-resume.pdf
//      */
//     const path = `${currentUid}-${Date.now()}-${safeBase}.${ext}`;
  
//     // 4. Upload to Supabase Storage
//     const { error: uploadError } = await supabaseClient.storage
//       .from(bucketName)
//       .upload(path, file, { upsert: true });
  
//     if (uploadError) {
//       isResume ? setUploadingResume(false) : setUploadingCover(false);
//       alert(`Upload failed: ${uploadError.message}`);
//       return;
//     }
  
//     // 5. Retrieve the Public URL for the database entry
//     // For private buckets we store the path; link rendering uses signed URLs.
//     const storedPath = path;
  
//     /**
//      * 6. Update user_personal_info table with the confirmed currentUid.
//      * We use 'upsert' to update the specific URL field without losing other data.
//      */
//     const { error: upsertError } = await supabaseClient
//       .from("user_personal_info")
//       .upsert({
//         user_id: currentUid,
//         [field]: storedPath,
//         updated_at: new Date().toISOString(),
//       }, { onConflict: "user_id" });
  
//     isResume ? setUploadingResume(false) : setUploadingCover(false);
  
//     if (upsertError) {
//       alert(`Database update failed: ${upsertError.message}`);
//     } else {
//       // 7. Update local state to show the change in the UI immediately
//       setInfo((prev) => ({ ...prev, [field]: storedPath }));
//       alert("Document uploaded and profile updated!");
//     }
//   };

//   const deleteDocument = async (field: "resume_url" | "cover_letter_url") => {
//     const { data: { user } } = await supabaseClient.auth.getUser();
//     const currentUid = user?.id;
//     if (!currentUid) {
//       alert("Authentication error: Please sign in again.");
//       return;
//     }

//     const path = info[field];
//     if (!path) {
//       alert("No file to delete.");
//       return;
//     }

//     const isResume = field === "resume_url";
//     isResume ? setDeletingResume(true) : setDeletingCover(true);
//     const bucketName = isResume ? "resumes" : "cover_letter";

//     // Remove from storage (ignore if not found)
//     await supabaseClient.storage.from(bucketName).remove([path]);

//     const { error: upsertError } = await supabaseClient
//       .from("user_personal_info")
//       .upsert(
//         { user_id: currentUid, [field]: null, updated_at: new Date().toISOString() },
//         { onConflict: "user_id" }
//       );

//     isResume ? setDeletingResume(false) : setDeletingCover(false);

//     if (upsertError) {
//       alert(`Delete failed: ${upsertError.message}`);
//       return;
//     }

//     setInfo((prev) => ({ ...prev, [field]: null }));
//     if (isResume) setResumeLink(null);
//     else setCoverLink(null);
//   };

//   const handleSavePreferences = async () => {
//     if (!userId) {
//       alert("Please sign in to save your preferences.");
//       return;
//     }
//     setSavingPrefs(true);
//     const { error } = await supabaseClient.from("user_preferences").upsert(
//       {
//         user_id: userId,
//         ...jobPrefs,
//         updated_at: new Date().toISOString(),
//       },
//       { onConflict: "user_id" }
//     );
//     setSavingPrefs(false);
//     if (error) {
//       alert(error.message);
//     } else {
//       alert("Preferences saved");
//     }
//   };

//   const stringToArray = (value: string) =>
//     value
//       .split(",")
//       .map((v) => v.trim())
//       .filter(Boolean);

//   const initials = (() => {
//     const first = info.first_name?.trim() ?? "";
//     const last = info.last_name?.trim() ?? "";
//     if (!first && !last) return "DA";
//     const firstInitial = first ? first[0]?.toUpperCase() : "";
//     const lastInitial = last ? last[0]?.toUpperCase() : "";
//     return `${firstInitial}${lastInitial || ""}` || "DA";
//   })();

//   const displayName = [info.first_name, info.last_name].filter(Boolean).join(" ") || "Your profile";
//   const displayStatus = jobPrefs.job_status || "Actively looking";

//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100">
//       <div className="w-full px-10 md:px-16 lg:px-24 xl:px-32 py-12 space-y-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-800/60 px-6 py-5 shadow-lg shadow-slate-900/40">
//           <div className="space-y-1.5">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-900/60 text-sky-200 text-xs font-semibold border border-sky-700/60">
//               <span className="h-2 w-2 rounded-full bg-emerald-400" />
//               Profile Overview
//             </div>
//             <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">My Career Hub</h1>
//             <p className="text-sm text-slate-300">
//               Manage your profile, personal info, and job preferences in one place.
//             </p>
//           </div>
//           <div className="flex items-center gap-3 rounded-2xl bg-slate-900/80 border border-slate-700 px-4 py-3 shadow-inner shadow-slate-900/50">
//             <div className="h-14 w-14 rounded-2xl bg-sky-500 text-slate-900 font-bold flex items-center justify-center text-lg shadow-lg">
//               {initials}
//             </div>
//             <div>
//               <p className="text-base font-semibold text-white">{displayName}</p>
//               <p className="text-xs text-emerald-300 font-medium">{displayStatus}</p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left column */}
//           <div className="space-y-6">
//             <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
//               <h2 className="text-lg font-semibold mb-4">My Career Hub</h2>
//               <div className="flex flex-col gap-3">
//                 <button
//                   onClick={() => setActiveTab("profile")}
//                   className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === "profile"
//                     ? "bg-sky-600 text-white shadow-sm shadow-sky-900/40"
//                     : "bg-slate-900 border border-slate-700 hover:border-slate-500"
//                     }`}
//                 >
//                   <span className="flex items-center gap-3">
//                     <span className="text-base">📝</span>
//                     Profile
//                   </span>
//                   <span className="text-xs text-sky-100">Edit autofill information</span>
//                 </button>

//                 <button
//                   onClick={() => setActiveTab("personal")}
//                   className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === "personal"
//                     ? "bg-sky-600 text-white shadow-sm shadow-sky-900/40"
//                     : "bg-slate-900 border border-slate-700 hover:border-slate-500"
//                     }`}
//                 >
//                   <span className="flex items-center gap-3">
//                     <span className="text-base">📊</span>
//                     Personal Info
//                   </span>
//                   <span className="text-xs text-slate-400">Edit demographic data</span>
//                 </button>

//                 <button
//                   onClick={() => setActiveTab("preferences")}
//                   className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === "preferences"
//                     ? "bg-sky-600 text-white shadow-sm shadow-sky-900/40"
//                     : "bg-slate-900 border border-slate-700 hover:border-slate-500"
//                     }`}
//                 >
//                   <span className="flex items-center gap-3">
//                     <span className="text-base">💼</span>
//                     Job Preferences
//                   </span>
//                   <span className="text-xs text-slate-400">Refine your job search</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right column */}
//           <div className="lg:col-span-2 space-y-6">
//             {activeTab === "personal" && (
//               <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
//                 <h3 className="text-lg font-semibold mb-3">Personal Info</h3>
//                 {loading ? (
//                   <p className="text-sm text-slate-400">Loading...</p>
//                 ) : (
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-slate-400">First Name</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.first_name ?? ""}
//                           onChange={(e) => updateField("first_name", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Last Name</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.last_name ?? ""}
//                           onChange={(e) => updateField("last_name", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Preferred Name</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.preferred_name ?? ""}
//                           onChange={(e) => updateField("preferred_name", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Email</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm cursor-not-allowed opacity-80"
//                           value={info.email ?? ""}
//                           readOnly
//                         />
//                         <p className="mt-1 text-[11px] text-slate-400">
//                           Email is managed via account settings; contact support to change.
//                         </p>
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Phone</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.phone ?? ""}
//                           onChange={(e) => updateField("phone", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Location</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.location ?? ""}
//                           onChange={(e) => updateField("location", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Address</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.address1 ?? ""}
//                           onChange={(e) => updateField("address1", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Address 2</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.address2 ?? ""}
//                           onChange={(e) => updateField("address2", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Address 3</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.address3 ?? ""}
//                           onChange={(e) => updateField("address3", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Postal Code</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.postal_code ?? ""}
//                           onChange={(e) => updateField("postal_code", e.target.value)}
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-slate-400">Ethnicity</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.ethnicity ?? ""}
//                           onChange={(e) => updateField("ethnicity", e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Gender</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={info.gender ?? ""}
//                           onChange={(e) => updateField("gender", e.target.value)}
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={!!info.authorized_us}
//                           onChange={(e) => updateField("authorized_us", e.target.checked)}
//                           className="h-4 w-4"
//                         />
//                         <label className="text-sm text-slate-200">Authorized to work in the US?</label>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={!!info.authorized_canada}
//                           onChange={(e) => updateField("authorized_canada", e.target.checked)}
//                           className="h-4 w-4"
//                         />
//                         <label className="text-sm text-slate-200">Authorized to work in Canada?</label>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={!!info.authorized_uk}
//                           onChange={(e) => updateField("authorized_uk", e.target.checked)}
//                           className="h-4 w-4"
//                         />
//                         <label className="text-sm text-slate-200">Authorized to work in the UK?</label>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={!!info.visa_sponsorship}
//                           onChange={(e) => updateField("visa_sponsorship", e.target.checked)}
//                           className="h-4 w-4"
//                         />
//                         <label className="text-sm text-slate-200">Require future visa sponsorship?</label>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={!!info.disability}
//                           onChange={(e) => updateField("disability", e.target.checked)}
//                           className="h-4 w-4"
//                         />
//                         <label className="text-sm text-slate-200">Do you have a disability?</label>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={!!info.lgbtq}
//                           onChange={(e) => updateField("lgbtq", e.target.checked)}
//                           className="h-4 w-4"
//                         />
//                         <label className="text-sm text-slate-200">Do you identify as LGBTQ+?</label>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={!!info.veteran}
//                           onChange={(e) => updateField("veteran", e.target.checked)}
//                           className="h-4 w-4"
//                         />
//                         <label className="text-sm text-slate-200">Are you a veteran?</label>
//                       </div>
//                     </div>

//                     <div className="flex justify-end">
//                       <button
//                         onClick={handleSave}
//                         disabled={saving}
//                         className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 transition-colors text-sm font-semibold"
//                       >
//                         {saving ? "Saving..." : "Save Personal Info"}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === "profile" && (
//               <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
//                 <h3 className="text-lg font-semibold mb-3">Profile</h3>
//                 <p className="text-sm text-slate-300">
//                   Manage your profile autofill info (coming soon). Select Personal Info to edit your demographics now.
//                 </p>
//               </div>
//             )}

//             {activeTab === "preferences" && (
//               <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
//                 <h3 className="text-lg font-semibold mb-3">Job Preferences</h3>
//                 {loading ? (
//                   <p className="text-sm text-slate-400">Loading...</p>
//                 ) : (
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-slate-400">Job Status</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={jobPrefs.job_status ?? ""}
//                           onChange={(e) => updatePrefsField("job_status", e.target.value)}
//                           placeholder="Actively looking, Open to offers, etc."
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Expected Salary</label>
//                         <input
//                           type="number"
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={jobPrefs.expected_salary ?? ""}
//                           onChange={(e) =>
//                             updatePrefsField("expected_salary", e.target.value ? Number(e.target.value) : null)
//                           }
//                           placeholder="125000"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-slate-400">Role Values</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.role_values ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("role_values", stringToArray(e.target.value))}
//                           placeholder="Impact, Growth, Learning"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Roles</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.roles ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("roles", stringToArray(e.target.value))}
//                           placeholder="Frontend Engineer, Fullstack Engineer"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-slate-400">Locations</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.locations ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("locations", stringToArray(e.target.value))}
//                           placeholder="Remote, New York, London"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Work Modes</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.work_modes ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("work_modes", stringToArray(e.target.value))}
//                           placeholder="Remote, Hybrid, Onsite"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-slate-400">Preferred Company Sizes</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.company_sizes ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("company_sizes", stringToArray(e.target.value))}
//                           placeholder="1-10, 50-200, 500+"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Preferred Industries</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.industries_prefer ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("industries_prefer", stringToArray(e.target.value))}
//                           placeholder="Fintech, AI, Developer Tools"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-slate-400">Industries to Avoid</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.industries_avoid ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("industries_avoid", stringToArray(e.target.value))}
//                           placeholder="Gambling, Tobacco"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-xs text-slate-400">Skills to Highlight</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.skills_prefer ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("skills_prefer", stringToArray(e.target.value))}
//                           placeholder="React, TypeScript, Node.js"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-slate-400">Skills to Avoid</label>
//                         <input
//                           className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
//                           value={(jobPrefs.skills_avoid ?? []).join(", ")}
//                           onChange={(e) => updatePrefsField("skills_avoid", stringToArray(e.target.value))}
//                           placeholder="PHP, COBOL"
//                         />
//                       </div>
//                       <div />
//                     </div>

//                     <div className="flex justify-end">
//                       <button
//                         onClick={handleSavePreferences}
//                         disabled={savingPrefs}
//                         className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 transition-colors text-sm font-semibold"
//                       >
//                         {savingPrefs ? "Saving..." : "Save Preferences"}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
//               <h3 className="text-lg font-semibold mb-3">Profile Overview</h3>
//               <p className="text-sm text-slate-300">
//                 Your profile is used to match you with jobs and autofill applications.
//               </p>
//               <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
//                   <p className="text-xs text-slate-400">Resume</p>
//                   <p className="mt-2 text-sm font-semibold text-slate-100">
//                     {resumeLink ? (
//                       <a
//                         className="text-sky-300 underline underline-offset-2"
//                         href={resumeLink}
//                         target="_blank"
//                         rel="noreferrer"
//                       >
//                         View current resume
//                       </a>
//                     ) : (
//                       "Upload your latest resume"
//                     )}
//                   </p>
//                   {resumeLink && (
//                     <div className="mt-1 flex items-center justify-between gap-2">
//                       <p className="text-xs text-slate-400 break-all">
//                         {fileName(info.resume_url)}
//                       </p>
//                       <button
//                         onClick={() => deleteDocument("resume_url")}
//                         disabled={deletingResume}
//                         className="text-[11px] text-rose-300 hover:text-rose-200 disabled:opacity-60"
//                       >
//                         {deletingResume ? "Deleting..." : "Delete"}
//                       </button>
//                     </div>
//                   )}
//                   <label className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer hover:border-slate-500">
//                     <input
//                       type="file"
//                       accept=".pdf,.doc,.docx"
//                       className="hidden"
//                       onChange={(e) => {
//                         const file = e.target.files?.[0];
//                         if (file) uploadDocument(file, "resume_url");
//                       }}
//                     />
//                     {uploadingResume ? "Uploading..." : "Upload Resume"}
//                   </label>
//                 </div>
//                 <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
//                   <p className="text-xs text-slate-400">Cover Letter</p>
//                   <p className="mt-2 text-sm font-semibold text-slate-100">
//                     {coverLink ? (
//                       <a
//                         className="text-sky-300 underline underline-offset-2"
//                         href={coverLink}
//                         target="_blank"
//                         rel="noreferrer"
//                       >
//                         View current cover letter
//                       </a>
//                     ) : (
//                       "Add or manage cover letters"
//                     )}
//                   </p>
//                   {coverLink && (
//                     <div className="mt-1 flex items-center justify-between gap-2">
//                       <p className="text-xs text-slate-400 break-all">
//                         {fileName(info.cover_letter_url)}
//                       </p>
//                       <button
//                         onClick={() => deleteDocument("cover_letter_url")}
//                         disabled={deletingCover}
//                         className="text-[11px] text-rose-300 hover:text-rose-200 disabled:opacity-60"
//                       >
//                         {deletingCover ? "Deleting..." : "Delete"}
//                       </button>
//                     </div>
//                   )}
//                   <label className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer hover:border-slate-500">
//                     <input
//                       type="file"
//                       accept=".pdf,.doc,.docx"
//                       className="hidden"
//                       onChange={(e) => {
//                         const file = e.target.files?.[0];
//                         if (file) uploadDocument(file, "cover_letter_url");
//                       }}
//                     />
//                     {uploadingCover ? "Uploading..." : "Upload Cover Letter"}
//                   </label>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
//               <h3 className="text-lg font-semibold mb-3">Profile Strength</h3>
//               <p className="text-sm text-slate-300 mb-3">Complete your profile to improve matches.</p>
//               <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
//                 <div className="h-full w-1/3 bg-sky-500" />
//               </div>
//               <p className="mt-2 text-xs text-slate-400">40% complete</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
