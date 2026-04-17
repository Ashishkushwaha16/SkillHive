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
      showMessage("success", "Avatar removed successfully");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSavingAssets(false);
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
      title="Profile / Dashboard"
      subtitle="Manage your profile, documents, achievements, and professional identity."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="ui-card-soft p-6">
          <div className="flex items-center gap-4">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="Avatar" className="h-20 w-20 rounded-3xl object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-3xl font-black text-white">
                {avatarLetter}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">{user?.name}</h2>
              <p className="text-sm text-slate-600">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  disabled={savingAssets || !user?.avatar?.url}
                >
                  Delete Photo
                </button>
              </div>
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
        </section>

        <div className="space-y-6">
          <section className="ui-card p-6">
            <h3 className="text-xl font-bold text-slate-900">About & Achievements</h3>
            <textarea
              value={aboutInput}
              onChange={(event) => setAboutInput(event.target.value)}
              rows={4}
              placeholder="Write about your learning goals"
              className="ui-input mt-3 resize-none"
            />
            <p className="mt-1 text-xs text-slate-500">{aboutInput.trim().length}/{MAX_ABOUT_LENGTH}</p>

            <textarea
              value={achievementsInput}
              onChange={(event) => setAchievementsInput(event.target.value)}
              rows={5}
              placeholder="One achievement per line"
              className="ui-input mt-3 resize-none"
            />

            <button type="button" onClick={handleSaveProfileText} className="ui-btn-primary mt-3" disabled={saving}>
              {saving ? "Saving..." : "Save Profile Details"}
            </button>
          </section>

          <section className="ui-card p-6">
            <h3 className="text-xl font-bold text-slate-900">Skills</h3>
            <form
              className="mt-3 flex gap-2"
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
                className="ui-input flex-1"
              />
              <button type="submit" className="ui-btn-secondary" disabled={saving || !skillInput.trim()}>
                Add
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
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
          </section>

          <section className="ui-card p-6">
            <h3 className="text-xl font-bold text-slate-900">Manage Photos and Files</h3>
            <form onSubmit={handleUploadAssets} className="mt-3 space-y-3">
              <div>
                <label htmlFor="avatar" className="mb-1 block text-sm font-semibold text-slate-700">Profile Photo (image)</label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setAssetFiles((prev) => ({ ...prev, avatar: event.target.files?.[0] || null }))}
                  className="ui-input"
                />
              </div>
              <div>
                <label htmlFor="resume" className="mb-1 block text-sm font-semibold text-slate-700">Resume (PDF)</label>
                <input
                  id="resume"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setAssetFiles((prev) => ({ ...prev, resume: event.target.files?.[0] || null }))}
                  className="ui-input"
                />
              </div>
              <div>
                <label htmlFor="certificates" className="mb-1 block text-sm font-semibold text-slate-700">Certificates (multiple)</label>
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
                  className="ui-input"
                />
              </div>
              <button type="submit" className="ui-btn-primary" disabled={savingAssets}>
                {savingAssets ? "Uploading..." : "Upload Files"}
              </button>
            </form>

            {(user?.certificates || []).length ? (
              <div className="mt-4 space-y-2">
                {user.certificates.map((cert) => (
                  <a key={cert.publicId} href={cert.url} target="_blank" rel="noreferrer" className="block text-sm font-semibold text-blue-700">
                    {cert.name || "Certificate"}
                  </a>
                ))}
              </div>
            ) : null}
          </section>

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
