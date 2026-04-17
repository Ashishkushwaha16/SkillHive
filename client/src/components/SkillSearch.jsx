import { useState } from "react";

const SkillSearch = ({
  skill,
  matchMode,
  viewMode,
  minRating,
  maxRating,
  sortBy,
  sortOrder,
  minScore,
  onSkillChange,
  onMatchModeChange,
  onViewModeChange,
  onMinRatingChange,
  onMaxRatingChange,
  onSortByChange,
  onSortOrderChange,
  onMinScoreChange,
  onSearch,
  onClear,
  connectedCount,
  pendingCount,
  resultsCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="space-y-4">
      {/* Compact Top Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Skill search</p>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-2 flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Hide filters" : "Open filters"}
        >
          <span className="truncate text-slate-500">
            {skill.trim() ? skill.trim() : "Search skills, e.g. react, node, mongodb"}
          </span>
          <span className="flex items-center gap-2 text-blue-700">
            {isExpanded ? "Hide" : "Search"}
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/80 bg-white p-3 shadow-sm sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Connected</p>
          <p className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{connectedCount}</p>
        </div>
        <div className="rounded-xl border border-white/80 bg-white p-3 shadow-sm sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pending</p>
          <p className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-white/80 bg-white p-3 shadow-sm sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Results</p>
          <p className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{resultsCount}</p>
        </div>
      </div>

      {/* Expanded Search Panel */}
      {isExpanded && (
        <form onSubmit={onSearch} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {/* Search Input */}
          <input
            type="text"
            value={skill}
            onChange={(e) => onSkillChange(e.target.value)}
            placeholder="Search skills, e.g. react, node, mongodb"
            className="ui-input"
          />

          {/* Filter Controls - Responsive Grid */}
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* View Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="viewMode">
                  View:
                </label>
                <select
                  id="viewMode"
                  value={viewMode}
                  onChange={(e) => onViewModeChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All users</option>
                  <option value="matches">Smart matches</option>
                </select>
              </div>

              {/* Match Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="matchMode">
                  Match mode:
                </label>
                <select
                  id="matchMode"
                  value={matchMode}
                  onChange={(e) => onMatchModeChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Any skill</option>
                  <option value="all">All skills</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="sortBy">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                  <option value="createdAt">Newest</option>
                </select>
              </div>
            </div>

            {/* Rating Inputs */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="minRating">
                  Min rating (0-5):
                </label>
                <input
                  id="minRating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minRating}
                  onChange={(e) => onMinRatingChange(e.target.value)}
                  placeholder="Min rating"
                  className="ui-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="maxRating">
                  Max rating (0-5):
                </label>
                <input
                  id="maxRating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={maxRating}
                  onChange={(e) => onMaxRatingChange(e.target.value)}
                  placeholder="Max rating"
                  className="ui-input"
                  disabled={viewMode === "matches"}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="minScore">
                  Min match score (0-100):
                </label>
                <input
                  id="minScore"
                  type="number"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => onMinScoreChange(e.target.value)}
                  placeholder="Min match score"
                  className="ui-input"
                  disabled={viewMode !== "matches"}
                />
              </div>
            </div>

            {/* Sort Order & Info */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="sortOrder">
                  Sort order:
                </label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => onSortOrderChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">High to low</option>
                  <option value="asc">Low to high</option>
                </select>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 flex items-center">
                <span>
                  {viewMode === "matches"
                    ? "Smart mode prioritizes skill overlap score."
                    : "All users mode uses backend filters and sorting."}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClear}
              className="ui-btn-secondary rounded-lg px-4 py-2.5 text-sm font-semibold"
            >
              Clear
            </button>
            <button type="submit" className="ui-btn-primary rounded-lg px-4 py-2.5 text-sm font-semibold">
              Search
            </button>
          </div>

          {/* Tip */}
          <p className="text-xs text-slate-500">
            💡 Tip: Use comma-separated skills (e.g., <span className="font-semibold">react, node, mongodb</span>) to search
            for multiple skills.
          </p>
        </form>
      )}
    </section>
  );
};

export default SkillSearch;
