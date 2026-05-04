const fs = require("fs/promises");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");

const getConfigPath = () => {
  const configured = process.env.AI_SEARCH_QUICK_ISSUES_FILE || "knowledge_base/ai_search_quick_issues.json";
  if (path.isAbsolute(configured)) {
    return configured;
  }
  return path.resolve(repoRoot, configured);
};

const normalizeIssue = (item) => {
  const issueId = String(item?.id || "").trim();
  const label = String(item?.label || "").trim();
  const prompt = String(item?.prompt || "").trim();

  if (!issueId || !label || !prompt) {
    return null;
  }

  return {
    id: issueId,
    label,
    prompt,
  };
};

const sanitizeIssues = (issues) => {
  if (!Array.isArray(issues)) {
    return [];
  }

  const dedupe = new Set();
  const sanitized = [];

  for (const item of issues) {
    const normalized = normalizeIssue(item);
    if (!normalized || dedupe.has(normalized.id)) {
      continue;
    }
    dedupe.add(normalized.id);
    sanitized.push(normalized);
  }

  return sanitized;
};

const readQuickIssuesFromDisk = async () => {
  const filePath = getConfigPath();

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return sanitizeIssues(parsed);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to read AI search quick issue config:", error.message);
    }
    return [];
  }
};

const writeQuickIssuesToDisk = async (issues) => {
  const filePath = getConfigPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(issues, null, 2)}\n`, "utf-8");
};

const getAiSearchQuickIssues = async (req, res) => {
  try {
    const issues = await readQuickIssuesFromDisk();
    return res.status(200).json({ issues });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateAiSearchQuickIssues = async (req, res) => {
  try {
    const sanitized = sanitizeIssues(req.body?.issues);

    if (!sanitized.length) {
      return res.status(400).json({ message: "At least one valid quick issue is required" });
    }

    await writeQuickIssuesToDisk(sanitized);
    return res.status(200).json({
      message: "AI Search quick issues updated successfully",
      issues: sanitized,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAiSearchQuickIssues,
  updateAiSearchQuickIssues,
};
