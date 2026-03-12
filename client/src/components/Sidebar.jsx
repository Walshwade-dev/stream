import { SECTIONS } from "../config/sections";

/**
 * Sidebar navigation showing all sections and their upload status.
 * @param {Array}    sectionStates - array of { id, status } for each section
 * @param {string}   activeId      - id of the currently visible section
 * @param {function} onSelect      - called with section id when nav item clicked
 * @param {function} onGenerate    - called when Generate Report button clicked
 * @param {boolean}  canGenerate   - true when at least one section is ready
 */
export function Sidebar({
  sectionStates,
  activeId,
  onSelect,
  onGenerate,
  canGenerate,
}) {
  function getStatus(id) {
    return sectionStates.find((s) => s.id === id)?.status ?? "idle";
  }

  function StatusDot({ status }) {
    const colors = {
      success:   "#28c840",  // green  — uploaded and ready
      uploading: "#febc2e",  // yellow — in progress
      error:     "#ff5f57",  // red    — failed
      idle:      "#444",     // grey   — not started
    };
    return (
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: colors[status] ?? colors.idle,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <aside className="sidebar">

      {/* app title */}
      <div className="sidebar-top-bar">
        <div className="sidebar-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="sidebar-logo-text">ReportGen</span>
      </div>

      <div className="sidebar-divider" />

      {/* Section navigation */}
      <nav className="sidebar-nav">
        {SECTIONS.map((section) => {
          const status = getStatus(section.id);
          const isActive = section.id === activeId;

          return (
            <button
              key={section.id}
              className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`}
              onClick={() => onSelect(section.id)}
            >
              <span className="sidebar-nav-label">{section.title}</span>
              <StatusDot status={status} />
            </button>
          );
        })}
      </nav>

      {/* Spacer pushes generate button to bottom */}
      <div style={{ flex: 1 }} />

      <div className="sidebar-divider" />

      {/* Section readiness summary */}
      <div className="sidebar-summary">
        {sectionStates.filter((s) => s.status === "success").length} of{" "}
        {SECTIONS.length} sections ready
      </div>

      {/* Generate report button */}
      <button
        className={`sidebar-generate-btn ${!canGenerate ? "sidebar-generate-btn-disabled" : ""}`}
        onClick={onGenerate}
        disabled={!canGenerate}
      >
        {canGenerate ? "↓ Generate Report" : "⊘ No sections ready"}
      </button>

    </aside>
  );
}