"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/_lib/supabaseClient";
import { PersonalInfo } from "@/types/profile";

type Props = {
  userId: string | null;
  value: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
};

const fileName = (value?: string | null) => {
  if (!value) return null;
  const clean = (value.split("?")[0] ?? "").split("/").pop() ?? "";
  const withoutPrefix = clean.replace(/^[0-9a-f-]+-\d+-/i, "");
  return withoutPrefix || clean || null;
};

export default function Documents({ userId, value, onChange }: Props) {
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [resumeLink, setResumeLink] = useState<string | null>(null);
  const [coverLink, setCoverLink] = useState<string | null>(null);
  const [deletingResume, setDeletingResume] = useState(false);
  const [deletingCover, setDeletingCover] = useState(false);

  const resolveSignedUrl = async (path: string, bucketName: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const { data, error } = await supabaseClient.storage.from(bucketName).createSignedUrl(path, 60 * 60);
    if (error) {
      console.warn("Signed URL error:", error.message);
      return null;
    }
    return data?.signedUrl ?? null;
  };

  useEffect(() => {
    const loadLinks = async () => {
      if (value.resume_url) {
        const url = await resolveSignedUrl(value.resume_url, "resumes");
        setResumeLink(url);
      } else {
        setResumeLink(null);
      }
      if (value.cover_letter_url) {
        const url = await resolveSignedUrl(value.cover_letter_url, "cover_letter");
        setCoverLink(url);
      } else {
        setCoverLink(null);
      }
    };
    loadLinks();
  }, [value.resume_url, value.cover_letter_url]);

  const uploadDocument = async (file: File, field: "resume_url" | "cover_letter_url") => {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    const currentUid = user?.id ?? userId;

    if (!currentUid) {
      alert("Authentication error: Please sign in again.");
      return;
    }

    const isResume = field === "resume_url";
    isResume ? setUploadingResume(true) : setUploadingCover(true);

    const bucketName = isResume ? "resumes" : "cover_letter";
    const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
    const baseName = file.name.replace(new RegExp(`\\.${ext}$`, "i"), "");
    const safeBase =
      baseName.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "file";
    const path = `${currentUid}-${Date.now()}-${safeBase}.${ext}`;

    const { error: uploadError } = await supabaseClient.storage
      .from(bucketName)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      isResume ? setUploadingResume(false) : setUploadingCover(false);
      alert(`Upload failed: ${uploadError.message}`);
      return;
    }

    const storedPath = path;
    const { error: upsertError } = await supabaseClient
      .from("user_personal_info")
      .upsert(
        { user_id: currentUid, [field]: storedPath, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    isResume ? setUploadingResume(false) : setUploadingCover(false);

    if (upsertError) {
      alert(`Database update failed: ${upsertError.message}`);
      return;
    }

    onChange({ ...value, [field]: storedPath });
    alert("Document uploaded and profile updated!");
  };

  const deleteDocument = async (field: "resume_url" | "cover_letter_url") => {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    const currentUid = user?.id ?? userId;
    if (!currentUid) {
      alert("Authentication error: Please sign in again.");
      return;
    }

    const path = value[field];
    if (!path) {
      alert("No file to delete.");
      return;
    }

    const isResume = field === "resume_url";
    isResume ? setDeletingResume(true) : setDeletingCover(true);
    const bucketName = isResume ? "resumes" : "cover_letter";

    await supabaseClient.storage.from(bucketName).remove([path]);

    const { error: upsertError } = await supabaseClient
      .from("user_personal_info")
      .upsert(
        { user_id: currentUid, [field]: null, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    isResume ? setDeletingResume(false) : setDeletingCover(false);

    if (upsertError) {
      alert(`Delete failed: ${upsertError.message}`);
      return;
    }

    onChange({ ...value, [field]: null });
    if (isResume) setResumeLink(null);
    else setCoverLink(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Documents</h3>
      <p className="text-sm text-slate-300">Upload and manage your resume and cover letters securely.</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Resume</p>
          <p className="mt-2 text-sm font-semibold text-slate-100">
            {resumeLink ? (
              <a
                className="text-sky-300 underline underline-offset-2"
                href={resumeLink}
                target="_blank"
                rel="noreferrer"
              >
                View current resume
              </a>
            ) : (
              "Upload your latest resume"
            )}
          </p>
          {resumeLink && (
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-400 break-all">{fileName(value.resume_url)}</p>
              <button
                onClick={() => deleteDocument("resume_url")}
                disabled={deletingResume}
                className="text-[11px] text-rose-300 hover:text-rose-200 disabled:opacity-60"
              >
                {deletingResume ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
          <label className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer hover:border-slate-500">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadDocument(file, "resume_url");
              }}
            />
            {uploadingResume ? "Uploading..." : "Upload Resume"}
          </label>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Cover Letter</p>
          <p className="mt-2 text-sm font-semibold text-slate-100">
            {coverLink ? (
              <a
                className="text-sky-300 underline underline-offset-2"
                href={coverLink}
                target="_blank"
                rel="noreferrer"
              >
                View current cover letter
              </a>
            ) : (
              "Add or manage cover letters"
            )}
          </p>
          {coverLink && (
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-400 break-all">{fileName(value.cover_letter_url)}</p>
              <button
                onClick={() => deleteDocument("cover_letter_url")}
                disabled={deletingCover}
                className="text-[11px] text-rose-300 hover:text-rose-200 disabled:opacity-60"
              >
                {deletingCover ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
          <label className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer hover:border-slate-500">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadDocument(file, "cover_letter_url");
              }}
            />
            {uploadingCover ? "Uploading..." : "Upload Cover Letter"}
          </label>
        </div>
      </div>
    </div>
  );
}
