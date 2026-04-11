import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { getProfile, updateProfile, updateUserSkills } from "../services/userService";

const MAX_SKILL_LENGTH = 20;
const MAX_ABOUT_LENGTH = 200;

const normalizeSkill = (value) => value.trim().toLowerCase();

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [skillInput, setSkillInput] = useState("");
  const [aboutInput, setAboutInput] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUser(data);
      setAboutInput(data.about || "");
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!message.text) {
      return;
    }

    const timer = setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  const setFeedback = (type, text) => {
    setMessage({ type, text });
  };

  const handleSaveAbout = async () => {
    if (aboutInput.trim().length > MAX_ABOUT_LENGTH) {
      setFeedback("error", `About must be ${MAX_ABOUT_LENGTH} characters or less`);
      return;
    }

    const previousUser = user;
    const normalizedAbout = aboutInput.trim();

    setUser((prev) => ({ ...prev, about: normalizedAbout }));

    try {
      setSavingAbout(true);
      const updatedUser = await updateProfile({ about: normalizedAbout });
      setUser(updatedUser);
      setAboutInput(updatedUser.about || "");
      setFeedback("success", "About updated");
    } catch (err) {
      setUser(previousUser);
      setFeedback("error", err.message);
    } finally {
      setSavingAbout(false);
    }
  };

  const handleAddSkill = async () => {
    const nextSkill = normalizeSkill(skillInput);

    if (!nextSkill) {
      setFeedback("error", "Please enter a skill");
      return;
    }

    if (nextSkill.length > MAX_SKILL_LENGTH) {
      setFeedback("error", `Skill must be ${MAX_SKILL_LENGTH} characters or less`);
      return;
    }

    const exists = (user?.skills || []).some(
      (item) => item.toLowerCase() === nextSkill.toLowerCase()
    );

    if (exists) {
      setFeedback("error", "Skill already added");
      return;
    }

    const previousUser = user;
    const nextSkills = [...(user?.skills || []), nextSkill];

    setUser((prev) => ({ ...prev, skills: nextSkills }));
    setSkillInput("");

    try {
      setSaving(true);
      const updatedUser = await updateUserSkills(nextSkills);
      setUser(updatedUser);
      setFeedback("success", "Skill added");
    } catch (err) {
      setFeedback("error", err.message);
      setUser(previousUser);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const previousUser = user;
    const nextSkills = (user?.skills || []).filter((skill) => skill !== skillToRemove);

    setUser((prev) => ({ ...prev, skills: nextSkills }));

    try {
      setSaving(true);
      const updatedUser = await updateUserSkills(nextSkills);
      setUser(updatedUser);
      setFeedback("success", "Skill removed");
    } catch (err) {
      setFeedback("error", err.message);
      setUser(previousUser);
    } finally {
      setSaving(false);
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
      <div className="ui-card p-8">
      <h2 className="mb-5 text-xl font-semibold text-slate-900">Your Information</h2>

      <div className="space-y-3 text-slate-700">
        <p>
          <span className="font-semibold">Name:</span> {user?.name || "-"}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user?.email || "-"}
        </p>
        <p>
          <span className="font-semibold">Rating:</span> {user?.rating ?? 0}
        </p>
        <div>
          <p className="font-semibold">About:</p>
          <p className="mt-1 text-slate-600">{user?.about || "No about info added"}</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900">Edit About</h3>
        <textarea
          value={aboutInput}
          onChange={(e) => {
            setAboutInput(e.target.value);
            if (message.text) {
              setMessage({ type: "", text: "" });
            }
          }}
          rows={4}
          placeholder="Write something about yourself"
          className="ui-input mt-3"
        />
        <div className="mt-2 flex items-center justify-between">
          <p
            className={`text-xs ${
              aboutInput.trim().length > MAX_ABOUT_LENGTH ? "text-red-600" : "text-slate-500"
            }`}
          >
            {aboutInput.trim().length}/{MAX_ABOUT_LENGTH} characters
          </p>
          <button
            type="button"
            onClick={handleSaveAbout}
            disabled={savingAbout}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingAbout ? "Saving..." : "Save About"}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900">Skills</h3>

        <form
          className="mt-3 flex gap-3"
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
            disabled={saving || !skillInput.trim()}
            className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add"}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          {skillInput.trim().length}/{MAX_SKILL_LENGTH} characters
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {user?.skills?.length ? (
            user.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 transition-transform duration-200 hover:-translate-y-0.5"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  disabled={saving}
                  className="rounded-full px-1 text-blue-700 transition-colors duration-200 hover:bg-blue-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ✕
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">No skills added</p>
          )}
        </div>
      </div>

      {saving && <p className="mt-4 text-sm text-slate-500">Saving skills...</p>}
      {message.text && (
        <p className={`mt-3 text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
      </div>
    </PageLayout>
  );
};

export default Profile;
