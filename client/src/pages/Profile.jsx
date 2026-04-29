import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import {
  getProfile,
  updateProfile,
  updateUserSkills,
  deleteProfileAvatar,
  uploadProfileAssets,
} from "../services/userService";

const MAX_SKILL_LENGTH = 20;
const MAX_ABOUT_LENGTH = 200;

const normalizeSkill = (value) => value.trim().toLowerCase();

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAssets, setSavingAssets] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [aboutInput, setAboutInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [achievementsInput, setAchievementsInput] = useState("");
  const [assetFiles, setAssetFiles] = useState({
    avatar: null,
    resume: null,
    certificates: [],
  });
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await getProfile();
      setUser(profile);
      setAboutInput(profile.about || "");
      setAchievementsInput((profile.achievements || []).join("\n"));
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const handleSaveProfileText = async () => {
    if (!user) {
      return;
    }

    const nextAbout = aboutInput.trim();

    if (nextAbout.length > MAX_ABOUT_LENGTH) {
      showMessage("error", `About length must be ${MAX_ABOUT_LENGTH} characters or less`);
      return;
    }

    const achievements = achievementsInput
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      const updated = await updateProfile({
        about: nextAbout,
        achievements,
      });
      setUser(updated);
      setIsEditingAbout(false);
      showMessage("success", "Profile details updated");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!user) {
      return;
    }

    const nextSkill = normalizeSkill(skillInput);

    if (!nextSkill) {
      showMessage("error", "Skill cannot be empty");
      return;
    }

    if (nextSkill.length > MAX_SKILL_LENGTH) {
      showMessage("error", `Skill length must be ${MAX_SKILL_LENGTH} characters or less`);
      return;
    }

    if ((user.skills || []).some((skill) => skill.toLowerCase() === nextSkill)) {
      showMessage("error", "Skill already added");
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateUserSkills([...(user.skills || []), nextSkill]);
      setUser(updatedUser);
      setSkillInput("");
      showMessage("success", "Skill added");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    if (!user) {
      return;
    }

    try {
      setSaving(true);
      const updatedSkills = (user.skills || []).filter((item) => item.toLowerCase() !== skill.toLowerCase());
      const updatedUser = await updateUserSkills(updatedSkills);
      setUser(updatedUser);
      showMessage("success", "Skill removed");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAssets = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    if (assetFiles.avatar) {
      formData.append("avatar", assetFiles.avatar);
    }
    if (assetFiles.resume) {
      formData.append("resume", assetFiles.resume);
    }
    if (assetFiles.certificates.length) {
      assetFiles.certificates.forEach((file) => formData.append("certificates", file));
    }

    if ([...formData.keys()].length === 0) {
      showMessage("error", "Please choose at least one file to upload");
      return;
    }

    try {
      setSavingAssets(true);
      const updated = await uploadProfileAssets(formData);
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("authChange"));
      setAssetFiles({ avatar: null, resume: null, certificates: [] });
      showMessage("success", "Files uploaded successfully");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSavingAssets(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.avatar?.url) {
      showMessage("error", "No avatar to delete");
      return;
    }

    try {
      setSavingAssets(true);
      const updated = await deleteProfileAvatar();
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("authChange"));
      showMessage("success", "Avatar removed successfully");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSavingAssets(false);
    }
  };

  const handleAvatarSelect = async (event) => {
    const avatarFile = event.target.files?.[0] || null;

    if (!avatarFile) {
      return;
    }

    try {
      setSavingAssets(true);
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const updated = await uploadProfileAssets(formData);
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("authChange"));
      showMessage("success", "Profile photo updated");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSavingAssets(false);
      event.target.value = "";
    }
  };

  if (loading) {
    return <p className="text-center text-slate-600">Loading profile...</p>;
  }

  if (loadError) {
    return <p className="text-center text-rose-700">{loadError}</p>;
  }

  const avatarLetter = (user?.name || "U").slice(0, 1).toUpperCase();

  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your profile, documents, achievements, and professional identity."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <label
              htmlFor="avatar-photo"
              className="group relative block cursor-pointer"
              title="Click to add or change profile photo"
            >
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Avatar" className="h-20 w-20 rounded-3xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-3xl font-black text-white">
                  {avatarLetter}
                </div>
              )}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-900/0 text-[11px] font-semibold text-white opacity-0 transition-all duration-200 group-hover:bg-slate-900/55 group-hover:opacity-100">
                {savingAssets ? "Uploading..." : user?.avatar?.url ? "Change" : "Add Photo"}
              </span>
            </label>
            <input
              id="avatar-photo"
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
              disabled={savingAssets}
            />
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950">{user?.name}</h2>
                  <p className="text-sm text-slate-600">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAbout(true)}
                  className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition-all"
                  title="Edit Profile"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              {user?.avatar?.url ? (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    disabled={savingAssets}
                  >
                    Delete Photo
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Rating</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{user?.rating ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Connections</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{user?.connections?.length || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Certificates</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{user?.certificates?.length || 0}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">About</p>
            {user?.about ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{user.about}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No about added</p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resume</p>
            {user?.resume?.url ? (
              <a href={user.resume.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-blue-700">
                {user.resume.name || "View Resume PDF"}
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No resume uploaded</p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Achievements</p>
            {(user?.achievements || []).length ? (
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {user.achievements.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No achievements added</p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Certificates</p>
            {(user?.certificates || []).length ? (
              <div className="mt-2 space-y-2">
                {user.certificates.map((cert) => (
                  <a
                    key={cert.publicId}
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-blue-700"
                  >
                    {cert.name || "Certificate"}
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No certificates uploaded</p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Skills</p>
            {(user?.skills || []).length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {(user?.skills || []).map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No skills added</p>
            )}
          </div>
        </section>

        <div className="space-y-6">
          {isEditingAbout ? (
            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Edit About & Achievements</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingAbout(false)}
                  className="text-slate-500 hover:text-slate-700 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={aboutInput}
                onChange={(event) => setAboutInput(event.target.value)}
                rows={4}
                placeholder="Write about your learning goals"
                className="w-full mt-3 resize-none px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200"
              />
              <p className="mt-1 text-xs text-slate-500">{aboutInput.trim().length}/{MAX_ABOUT_LENGTH}</p>

              <textarea
                value={achievementsInput}
                onChange={(event) => setAchievementsInput(event.target.value)}
                rows={5}
                placeholder="One achievement per line"
                className="w-full mt-3 resize-none px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200"
              />

              <div className="mt-3 border-t border-slate-200 pt-3">
                <label htmlFor="resume" className="block text-sm font-semibold text-slate-700 mb-1">Resume (PDF)</label>
                <input
                  id="resume"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setAssetFiles((prev) => ({ ...prev, resume: event.target.files?.[0] || null }))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                />
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3">
                <label htmlFor="certificates" className="block text-sm font-semibold text-slate-700 mb-1">Certificates (multiple)</label>
                <input
                  id="certificates"
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  onChange={(event) =>
                    setAssetFiles((prev) => ({
                      ...prev,
                      certificates: Array.from(event.target.files || []).slice(0, 5),
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                />
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Skills</label>
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleAddSkill();
                  }}
                >
                  <input
                    type="text"
                    value={skillInput}
                    maxLength={MAX_SKILL_LENGTH}
                    onChange={(event) => setSkillInput(event.target.value)}
                    placeholder="Add skill"
                    className="px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200 flex-1 text-sm"
                  />
                  <button type="submit" className="px-4 py-3 rounded-lg border-2 border-emerald-600 text-emerald-600 bg-white font-semibold transition-all duration-200 hover:bg-emerald-50 text-sm" disabled={saving || !skillInput.trim()}>
                    Add
                  </button>
                </form>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(user?.skills || []).map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="rounded-full px-1 text-blue-700 hover:bg-blue-200 hover:text-rose-600"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => {
                handleSaveProfileText();
                if (assetFiles.resume || assetFiles.certificates.length) {
                  handleUploadAssets(new Event("submit"));
                }
              }} className="w-full mt-4 px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95" disabled={saving || savingAssets}>
                {saving || savingAssets ? "Saving..." : "Save Changes"}
              </button>
            </section>
          ) : null}

          {message.text ? (
            <p className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
              {message.text}
            </p>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
