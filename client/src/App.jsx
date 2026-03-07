import { useState, useEffect, useRef } from "react";

export default function App() {
  const [frame, setFrame] = useState("");
  const [connected, setConnected] = useState(false);
  const [dots, setDots] = useState("");
  const dotsInterval = useRef(null);

  useEffect(() => {
    function connect() {
      const source = new EventSource("https://stream-production-748d.up.railway.app/stream");

      source.onopen = () => {
        // clear the dots animation when connection is restored
        setConnected(true);
        setDots("");
        setFrame(""); // reset so it animates from scratch
        clearInterval(dotsInterval.current);
      };

      source.onmessage = (event) => {
        setFrame(event.data);
      };

      source.onerror = () => {
        setConnected(false);
        source.close();

        // start animating the dots
        let d = 0;
        dotsInterval.current = setInterval(() => {
          d = (d + 1) % 4; // cycles 0,1,2,3 → "", ".", "..", "..."
          setDots(".".repeat(d));
        }, 500);

        // try reconnecting every 3 seconds
        setTimeout(connect, 3000);
      };
    }

    connect();

    return () => clearInterval(dotsInterval.current);
  }, []);

  return (
    <div className="terminal">
      <div className="screen">

        <div className="header">
          <div className={`dot ${connected ? "active" : ""}`} />
          <div className="dot" />
          <div className="dot" />
          <span className="header-label">stream@localhost:5000</span>
        </div>

        <div className="prompt-line">
          <span className="prompt-symbol">›</span>
          <span className="output">
            {connected
              ? <>{frame}<span className="cursor" /></>
              : <>reconnecting{dots}</>
            }
          </span>
        </div>

        <div className="status-bar">
          <span className="status-text">SSE / text-event-stream</span>
          <span className={`status-text ${connected ? "live" : ""}`}>
            {connected ? "● LIVE" : "○ DISCONNECTED"}
          </span>
        </div>

      </div>
    </div>
  );
}