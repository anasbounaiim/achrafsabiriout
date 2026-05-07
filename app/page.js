"use client";

import { useEffect, useMemo, useState } from "react";

const initialSignatures = 12346;
const goal = 200000;

export default function Home() {
  const [signed, setSigned] = useState(false);
  const [signatures, setSignatures] = useState(initialSignatures);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadVotes() {
      const response = await fetch("/api/votes", { cache: "no-store" });
      const data = await response.json();

      if (isMounted && Number.isFinite(data.count)) {
        setSignatures(data.count);
      }

      if (isMounted) {
        setSigned(data.voted === true);
      }
    }

    loadVotes().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const progress = useMemo(() => {
    return Math.min((signatures / goal) * 100, 100);
  }, [signatures]);

  async function signPetition() {
    if (isSubmitting || signed) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (Number.isFinite(data.count)) {
        setSignatures(data.count);
      }

      if (data.voted === true) {
        setSigned(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <h1 className="top-mark" aria-label="Sabiri Out">
        <span>SABIRI</span>
        <span className="bottom-mark">OUT</span>
      </h1>

      <section className="petition-card" aria-label="Petition">
        <div className="poster">
          <img src="/player.jpg" alt="achraf Sabiri" />
        </div>

        <div className="main-stamp" aria-hidden="true">
          FUERA
        </div>

        <p className="hero-text">
          Bakhiristas, make your voice heard. If you believe change is needed,
          don&apos;t stay silent. Sign this petition and stand for what you think is
          best for the club&apos;s future.
        </p>

        <div className="stats-panel">
          <div className="stat-row" aria-label="Petition progress">
            <div>
              <strong>{signatures.toLocaleString()}</strong>
              <span>BAKHIRISTAS SIGNED</span>
            </div>
            <div>
              <strong>{goal.toLocaleString()}</strong>
              <span>GOAL</span>
            </div>
          </div>

          <div className="progress-track" aria-hidden="true">
            <div style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-copy">{progress.toFixed(2)}% of goal</p>
        </div>

        {signed ? (
          <div className="voice-heard" role="status">
            VOICE HEARD. FUERA SABIRI!
          </div>
        ) : (
          <button className="sign-button" onClick={signPetition} disabled={isSubmitting}>
            {isSubmitting ? "SIGNING..." : "SIGN THE PETITION"}
          </button>
        )}
        <p className="share-note">No account needed - Share to grow the movement</p>
      </section>

      <footer>
        <span />
        <strong>BAKHIRA KBIRA</strong>
        <span />
        <small>created by <b>pocoloco</b></small>
      </footer>
    </main>
  );
}
