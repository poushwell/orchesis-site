export default function Privacy() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f11",
      color: "#e4e4e7",
      fontFamily: "'Geist', -apple-system, sans-serif",
      padding: "80px 48px",
    }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <a href="/" style={{ color: "#71717a", textDecoration: "none", fontSize: "14px" }}>← Back</a>

        <h1 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.04em", margin: "32px 0 8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: "13px", color: "#52525b", marginBottom: "48px" }}>Last updated: March 2026</p>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Who We Are</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            Orchesis is an open-source project maintained by Pavel (<a href="https://github.com/poushwell" style={{ color: "#a855f7", textDecoration: "none" }}>github.com/poushwell</a>). This privacy policy applies to the website orchesis.io.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>What We Collect</h2>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", marginTop: "20px" }}>Website (orchesis.io)</h3>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            Currently, orchesis.io does <strong style={{ color: "#e4e4e7" }}>not</strong> collect any personal data. No cookies. No analytics or tracking scripts. No user accounts or registration. No contact forms that store data. No third-party scripts that track visitors.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a", marginTop: "12px" }}>
            The website is hosted on Vercel. Vercel may collect standard web server logs (IP addresses, timestamps, pages visited) as part of their hosting service. See <a href="https://vercel.com/legal/privacy-policy" style={{ color: "#a855f7", textDecoration: "none" }}>Vercel&apos;s Privacy Policy</a> for details.
          </p>

          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", marginTop: "20px" }}>Orchesis Software</h3>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            Orchesis is self-hosted software that runs entirely on your own infrastructure. We do not receive, collect, or have access to any data processed by your Orchesis instance. No telemetry. No phone-home. No usage analytics. See our <a href="https://github.com/poushwell/orchesis/blob/main/PRIVACY.md" style={{ color: "#a855f7", textDecoration: "none" }}>PRIVACY.md</a> for details on local data handling.
          </p>

          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", marginTop: "20px" }}>GitHub</h3>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            Our source code is hosted on GitHub. If you interact with our repository (starring, forking, opening issues, submitting PRs), GitHub collects data according to their privacy policy. We can see your GitHub username and public profile information.
          </p>

          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", marginTop: "20px" }}>Email</h3>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            If you email us at security@orchesis.io, we will have your email address and message content. We use this only to respond to your inquiry and will not share it with third parties.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Your Rights</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            Under GDPR (if you are an EU resident) and similar laws, you have the right to access what data we have about you (likely none beyond any emails you&apos;ve sent us), request deletion of any data we hold, and request a copy of your data in a standard format. To exercise these rights, email security@orchesis.io.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Changes</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            We may update this privacy policy. Changes will be posted on this page with an updated date.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Contact</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            Email: security@orchesis.io<br />
            GitHub: <a href="https://github.com/poushwell/orchesis" style={{ color: "#a855f7", textDecoration: "none" }}>github.com/poushwell/orchesis</a>
          </p>
        </section>

        <div style={{ borderTop: "1px solid #27272a", paddingTop: "24px", marginTop: "60px", fontSize: "13px", color: "#3f3f46" }}>
          <a href="/" style={{ color: "#52525b", textDecoration: "none" }}>orchesis.io</a>
          {" · "}
          <a href="/terms" style={{ color: "#52525b", textDecoration: "none" }}>Terms</a>
          {" · "}
          <a href="https://github.com/poushwell/orchesis" style={{ color: "#52525b", textDecoration: "none" }}>GitHub</a>
        </div>
      </div>
    </div>
  );
}
