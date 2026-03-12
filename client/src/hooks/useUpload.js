import { useState, useRef } from "react";

/**
 * Custom hook that manages all state and logic for a single upload section.
 * @param {string} endpoint - the full server URL to POST the file to
 * @returns all state values and handler functions needed by the UI
 */
export function useUpload(endpoint) {
  const [file, setFile]       = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus]   = useState("idle"); // idle | uploading | success | error
  const [result, setResult]   = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef              = useRef(null);

  // ── file size formatter ──────────────────────────────────────
  function fmt(bytes) {
    if (bytes < 1024)    return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  // ── validate file extension ──────────────────────────────────
  function validateFile(f) {
    const ext = f.name.split(".").pop().toLowerCase();
    return ["csv", "xlsx", "xls"].includes(ext);
  }

  // ── called when user selects or drops a file ─────────────────
  function pickFile(f) {
    if (!f) return;
    if (!validateFile(f)) {
      setErrorMsg("Only .csv, .xlsx, or .xls files are accepted.");
      setFile(null);
      return;
    }
    setErrorMsg("");
    setFile(f);
    setStatus("idle");
    setResult(null);
  }

  // ── drag and drop handlers ───────────────────────────────────
  function onDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files[0]);
  }

  // ── POST file to server ──────────────────────────────────────
  async function upload() {
    if (!file) return;
    setStatus("uploading");
    setResult(null);
    setErrorMsg("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res  = await fetch(endpoint, { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        if (data.missing_columns?.length) {
          setErrorMsg(`Missing required columns:\n${data.missing_columns.join(", ")}`);
        } else {
          setErrorMsg(data.error || "Upload failed");
        }
        setStatus("error");
        return;
      }

      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  // ── reset everything back to initial state ───────────────────
  function reset() {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return {
    // state
    file,
    dragOver,
    status,
    result,
    errorMsg,
    inputRef,
    // helpers
    fmt,
    // handlers
    pickFile,
    onDragOver,
    onDragLeave,
    onDrop,
    upload,
    reset,
  };
}