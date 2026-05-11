"use client";
import { useEffect, useRef } from "react";

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

type EggTheme = "dark" | "light" | "matrix" | "dos" | "ussr";

interface Props {
  mode: EggTheme;
  onActivate: (t: EggTheme) => void;
}

export default function EasterEggs({ mode, onActivate }: Props) {
  const konamiPos = useRef(0);
  const keyBuf = useRef("");
  const keyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  function flash(cls: string, cb: () => void) {
    document.body.classList.add(cls);
    setTimeout(() => { document.body.classList.remove(cls); cb(); }, 350);
  }

  function activate(theme: EggTheme) {
    const cur = modeRef.current;
    if (cur === theme) { deactivate(); return; }
    if (theme === "matrix") {
      flash("egg-glitch", () => {
        onActivate("matrix");
        console.log("%c╔═══════════════════════════════════╗", "color:#00ff41;font-family:monospace");
        console.log("%c║  ORCHESIS SECURITY TERMINAL v1.0  ║", "color:#00ff41;font-family:monospace");
        console.log("%c║  17 phases active. 0 deps loaded. ║", "color:#00ff41;font-family:monospace");
        console.log("%c║                                   ║", "color:#00ff41;font-family:monospace");
        console.log("%c║  > orchesis.matrix_mode = true    ║", "color:#00ff41;font-family:monospace");
        console.log("%c║  > \"There is no spoon.\"           ║", "color:#00ff41;font-family:monospace");
        console.log("%c║  > Press ESC to exit.             ║", "color:#00ff41;font-family:monospace");
        console.log("%c╚═══════════════════════════════════╝", "color:#00ff41;font-family:monospace");
      });
    } else if (theme === "dos") {
      flash("egg-bios", () => onActivate("dos"));
    } else if (theme === "ussr") {
      flash("egg-scanlines", () => onActivate("ussr"));
    }
  }

  function deactivate() {
    const prev = modeRef.current;
    onActivate(prev === "ussr" || prev === "dos" || prev === "matrix" ? "dark" : prev);
  }

  useEffect(() => {
    // Console hint on load
    console.log("%c╔═══════════════════════════════════╗", "color:#00ff41;font-family:monospace");
    console.log("%c║  ORCHESIS SECURITY TERMINAL v1.0  ║", "color:#00ff41;font-family:monospace");
    console.log("%c║  17 phases active. 0 deps loaded. ║", "color:#00ff41;font-family:monospace");
    console.log("%c║                                   ║", "color:#00ff41;font-family:monospace");
    console.log("%c║  > hint: the old ways still work  ║", "color:#00ff41;font-family:monospace");
    console.log("%c╚═══════════════════════════════════╝", "color:#00ff41;font-family:monospace");

    // Restore from localStorage
    const saved = localStorage.getItem("orchesis_theme") as EggTheme | null;
    if (saved && ["matrix","dos"].includes(saved)) onActivate(saved);

    // Expose orchesis.hack() in console
    (window as unknown as Record<string, unknown>).orchesis = { hack: () => activate("matrix") };

    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // ESC resets
      if (e.key === "Escape") { deactivate(); return; }

      // Konami
      if (e.key === KONAMI[konamiPos.current]) {
        konamiPos.current++;
        if (konamiPos.current === KONAMI.length) {
          konamiPos.current = 0;
          activate("matrix");
        }
      } else {
        konamiPos.current = e.key === KONAMI[0] ? 1 : 0;
      }

      // Key buffer: "help" → DOS, "exit" → reset, "sputnik" → USSR
      if (e.key.length === 1) {
        keyBuf.current = (keyBuf.current + e.key.toLowerCase()).slice(-7);
        if (keyTimer.current) clearTimeout(keyTimer.current);
        keyTimer.current = setTimeout(() => { keyBuf.current = ""; }, 3000);
        if (keyBuf.current.endsWith("help")) activate("dos");
        if (keyBuf.current.endsWith("sputnik")) activate("ussr");
        if (keyBuf.current.endsWith("exit")) deactivate();
      }
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("orchesis:logo-click", () => {});
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (["matrix","dos","ussr"].includes(mode)) {
      localStorage.setItem("orchesis_theme", mode);
    } else {
      localStorage.removeItem("orchesis_theme");
    }
  }, [mode]);

  if (!["matrix","dos","ussr"].includes(mode)) return null;

  const badges: Record<string, string> = {
    matrix: "[MATRIX MODE ACTIVE]",
    dos: "C:\\ORCHESIS\\DOS MODE",
    ussr: "★ РЕЖИМ СССР ★",
  };
  const badgeStyle: Record<string, React.CSSProperties> = {
    matrix: { background: "#000", color: "#00ff41", border: "1px solid #00ff41" },
    dos:    { background: "#000080", color: "#ffff55", border: "1px solid #5555ff" },
    ussr:   { background: "#0a0000", color: "#ff3333", border: "1px solid #ff0000" },
  };

  return (
    <div
      onClick={deactivate}
      title="Click to exit"
      style={{
        position: "fixed", bottom: "20px", right: "20px", zIndex: 9999,
        padding: "6px 14px", fontSize: "11px",
        fontFamily: "'Courier New', monospace",
        letterSpacing: ".1em", cursor: "pointer",
        ...badgeStyle[mode],
      }}
    >
      {badges[mode]}
    </div>
  );
}
