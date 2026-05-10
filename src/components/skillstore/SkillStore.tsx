import { useState, useEffect } from "react";
import { useSkillStore } from "../../hooks/useSkillStore";
import { SkillCard } from "./SkillCard";
import { SkillDetail } from "./SkillDetail";
import { ErrorBanner } from "../ui/ErrorBanner";

const CATEGORIES = [
  "All",
  "productivity",
  "communication",
  "development",
  "utility",
  "data",
  "information",
];

export function SkillStore() {
  const {
    results,
    installed,
    loading,
    installing,
    selectedSkill,
    error,
    search,
    browse,
    installSkill,
    removeSkill,
    updateAll,
    refreshInstalled,
    setSelectedSkill,
  } = useSkillStore();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"browse" | "installed">("browse");

  // Load initial data
  useEffect(() => {
    browse("All");
    refreshInstalled();
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      search(query.trim());
    } else {
      browse(category);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setQuery("");
    if (cat === "All") {
      browse("All");
    } else {
      browse(cat);
    }
  };

  const installedSlugs = new Set(installed.map((s) => s.slug));
  const hasUpdates = installed.some((s) => s.has_update);

  // Detail view
  if (selectedSkill) {
    return (
      <SkillDetail
        skill={selectedSkill}
        isInstalled={installedSlugs.has(selectedSkill.slug)}
        installing={installing === selectedSkill.slug}
        onInstall={() => installSkill(selectedSkill.slug)}
        onRemove={() => removeSkill(selectedSkill.slug)}
        onBack={() => setSelectedSkill(null)}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#F1F5F9",
            margin: 0,
          }}
        >
          Skill Store
        </h2>
        <div
          style={{
            fontSize: 11,
            color: "#64748B",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Powered by ClawHub
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 16,
          background: "#0F172A",
          borderRadius: 8,
          padding: 3,
        }}
      >
        {(["browse", "installed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "8px 16px",
              background: tab === t ? "#1E293B" : "transparent",
              color: tab === t ? "#F1F5F9" : "#64748B",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {t === "browse" ? "Browse" : `Installed (${installed.length})`}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} onDismiss={() => {}} />

      {tab === "browse" ? (
        <>
          {/* Search bar */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              aria-label="Search skills"
              placeholder="Search 13,700+ skills..."
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: 8,
                color: "#F1F5F9",
                fontSize: 13,
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#0B0F1A",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </div>

          {/* Category filters */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: "5px 14px",
                  background:
                    category === cat
                      ? "rgba(245,158,11,0.15)"
                      : "#0F172A",
                  color:
                    category === cat ? "#F59E0B" : "#94A3B8",
                  border: `1px solid ${category === cat ? "rgba(245,158,11,0.3)" : "#1E293B"}`,
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#64748B",
                fontSize: 13,
              }}
            >
              Searching...
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#EF4444",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          ) : results.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#64748B",
                fontSize: 13,
              }}
            >
              No skills found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((skill) => (
                <SkillCard
                  key={skill.slug}
                  skill={skill}
                  isInstalled={installedSlugs.has(skill.slug)}
                  installing={installing === skill.slug}
                  onInstall={() => installSkill(skill.slug)}
                  onRemove={() => removeSkill(skill.slug)}
                  onSelect={() => setSelectedSkill(skill)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Installed tab */}
          {hasUpdates && (
            <button
              onClick={updateAll}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(245,158,11,0.08)",
                color: "#F59E0B",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 16,
                fontFamily: "'JetBrains Mono', monospace",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? "Updating..." : "Update all skills"}
            </button>
          )}

          {installed.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#64748B",
                fontSize: 13,
              }}
            >
              No skills installed yet. Browse the store to get started.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {installed.map((skill) => (
                <div
                  key={skill.slug}
                  style={{
                    padding: "14px 20px",
                    background: "#0F172A",
                    border: "1px solid #1E293B",
                    borderRadius: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#F1F5F9",
                      }}
                    >
                      {skill.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        fontFamily: "'JetBrains Mono', monospace",
                        marginLeft: 10,
                      }}
                    >
                      v{skill.version}
                    </span>
                    {skill.has_update && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "#F59E0B",
                          background: "rgba(245,158,11,0.1)",
                          padding: "2px 8px",
                          borderRadius: 10,
                          marginLeft: 8,
                          fontWeight: 600,
                        }}
                      >
                        Update available
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeSkill(skill.slug)}
                    disabled={installing === skill.slug}
                    style={{
                      padding: "5px 14px",
                      background: "rgba(239,68,68,0.1)",
                      color: "#EF4444",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: installing === skill.slug ? 0.5 : 1,
                    }}
                  >
                    {installing === skill.slug ? "..." : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
