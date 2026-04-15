import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { getProfile, updateProfile, updateUserSkills } from "../services/userService";

const MAX_SKILL_LENGTH = 20;
const MAX_ABOUT_LENGTH = 200;

const normalizeSkill = (value) => value.trim().toLowerCase();

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [aboutInput, setAboutInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        setUser(profile);
        setAboutInput(profile.about || "");
      } catch (error) {
        setLoadError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const handleSaveAbout = async () => {
    if (!user) {
      return;
    }

    const nextAbout = aboutInput.trim();

    if (nextAbout.length > MAX_ABOUT_LENGTH) {
      showMessage("error", `About length must be ${MAX_ABOUT_LENGTH} characters or less`);
      return;
    }

    try {
      setSavingAbout(true);
      const updatedUser = await updateProfile({ about: nextAbout });
      setUser(updatedUser);
      setAboutInput(updatedUser.about || "");
      showMessage("success", "About updated");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSavingAbout(false);
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
      setSavingSkills(true);
      const updatedUser = await updateUserSkills([...(user.skills || []), nextSkill]);
      setUser(updatedUser);
      setSkillInput("");
      showMessage("success", "Skill added");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSavingSkills(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    if (!user) {
      return;
    }

    try {
      setSavingSkills(true);
      const updatedSkills = (user.skills || []).filter((item) => item.toLowerCase() !== skill.toLowerCase());
      const updatedUser = await updateUserSkills(updatedSkills);
      setUser(updatedUser);
      showMessage("success", "Skill removed");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setSavingSkills(false);
    }
  };

  if (loading) {
    return <p className="text-center text-slate-600">Loading profile...</p>;
  }

  if (loadError) {
    return <p className="text-center text-red-600">{loadError}</p>;
  }

  return (
    <PageLayout title="Profile" subtitle="Update your details and keep your skills fresh.">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="ui-card-soft p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-2xl font-black text-white">
              {(user?.name || "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Account summary</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">{user?.name || "-"}</h2>
              <p className="text-sm text-slate-600">{user?.email || "-"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Rating</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{user?.rating ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Skills</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{user?.skills?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">About length</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{aboutInput.trim().length}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">About</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{user?.about || "No about info added"}</p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="ui-card p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">Edit About</h3>
                <p className="mt-1 text-sm text-slate-600">Keep your profile concise and useful.</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {aboutInput.trim().length}/{MAX_ABOUT_LENGTH}
              </div>
            </div>

            <textarea
              value={aboutInput}
              onChange={(e) => {
                setAboutInput(e.target.value);
                if (message.text) {
                  setMessage({ type: "", text: "" });
                }
              }}
              rows={5}
              placeholder="Write something about yourself"
              className="ui-input mt-4 resize-none"
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className={`text-xs ${aboutInput.trim().length > MAX_ABOUT_LENGTH ? "text-rose-600" : "text-slate-500"}`}>
                Keep it under {MAX_ABOUT_LENGTH} characters.
              </p>
              <button
                type="button"
                onClick={handleSaveAbout}
                disabled={savingAbout}
                className="ui-btn-primary rounded-full px-5 py-2.5"
              >
                {savingAbout ? "Saving..." : "Save About"}
              </button>
            </div>
          </section>

          <section className="ui-card p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">Skills</h3>
                <p className="mt-1 text-sm text-slate-600">Add the skills you want people to find you for.</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {skillInput.trim().length}/{MAX_SKILL_LENGTH}
              </div>
            </div>

            <form
              className="mt-4 flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddSkill();
              }}
            >
              <input
                type="text"
                value={skillInput}
                maxLength={MAX_SKILL_LENGTH}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  if (message.text) {
                    setMessage({ type: "", text: "" });
                  }
                }}
                placeholder="Add skill"
                className="ui-input flex-1"
              />
              <button
                type="submit"
                disabled={savingAbout || savingSkills || !skillInput.trim()}
                className="ui-btn-secondary rounded-full px-5 py-3"
              >
                {savingSkills ? "Saving..." : "Add"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {user?.skills?.length ? (
                user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      disabled={savingSkills}
                      className="rounded-full px-1 text-blue-700 transition-colors duration-200 hover:bg-blue-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      x
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills added</p>
              )}
            </div>
          </section>

          {message.text ? (
            <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
              {message.text}
            </p>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
