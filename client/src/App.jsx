import { useState, useCallback } from "react";

import { SECTIONS } from "./config/sections";
import { generatePDF } from "./utils/generatePDF";
import { generateImpoundedPDF } from "./utils/generateImpoundedPDF";
import { Sidebar } from "./components/Sidebar";
import { UploadSection } from "./components/UploadSection";

export default function App() {
  const [sectionStates, setSectionStates] = useState(
    SECTIONS.map((s) => ({ id: s.id, status: "idle", result: null }))
  );

  const [activeId, setActiveId] = useState(SECTIONS[0]?.id);

  const handleSectionStatus = useCallback((id, status, result) => {
    setSectionStates((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, result } : s))
    );
  }, []);

  const canGenerate = sectionStates.some((s) => s.status === "success");

  function handleGenerate() {
    const readySections = sectionStates.filter((s) => s.status === "success");
    if (readySections.length > 0) {
      const first = readySections[0];
      if (first.id === "impounded") {
        generateImpoundedPDF(first.result);
      } else {
        generatePDF(first.result);
      }
    }
  }

  return (
    <div className="root">
      <Sidebar
        sectionStates={sectionStates}
        activeId={activeId}
        onSelect={setActiveId}
        onGenerate={handleGenerate}
        canGenerate={canGenerate}
      />

      <main className="main-content">
        {SECTIONS.map((section) =>
          // ✅ only render the section that matches activeId
          section.id === activeId ? (
            <UploadSection
              key={section.id}
              section={section}
              onStatusChange={handleSectionStatus}
            />
          ) : null
        )}
      </main>
    </div>
  );
}