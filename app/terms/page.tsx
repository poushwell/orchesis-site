export default function Terms() {
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

        <h1 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.04em", margin: "32px 0 8px" }}>Terms of Use</h1>
        <p style={{ fontSize: "13px", color: "#52525b", marginBottom: "48px" }}>Last updated: March 2026</p>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Acceptance</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            By using orchesis.io or the Orchesis software, you agree to these terms.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>The Software</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            Orchesis is open-source software licensed under the MIT License. You may use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the MIT License terms.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Disclaimer of Warranties</h2>
          <p style={{ fontSize: "12px", lineHeight: 1.7, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.02em" }}>
            The software is provided &quot;as is&quot;, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a", marginTop: "16px" }}>
            Orchesis is a security tool, but it does not guarantee protection against all threats, does not guarantee compliance with any specific regulation, and detection capabilities depend on configuration and threat signatures. No security tool provides 100% protection. You are responsible for your own security posture. Orchesis is a tool to help, not a guarantee.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Limitation of Liability</h2>
          <p style={{ fontSize: "12px", lineHeight: 1.7, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.02em" }}>
            In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a", marginTop: "16px" }}>
            This includes but is not limited to data loss or corruption, security breaches that occur despite Orchesis being deployed, costs from false positives or false negatives, regulatory fines or penalties, and loss of business or revenue.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Compliance Claims</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            When Orchesis documentation references compliance frameworks (MAST, OWASP, EU AI Act, NIST), this means Orchesis provides <strong style={{ color: "#e4e4e7" }}>tooling that helps</strong> with compliance. It does <strong style={{ color: "#e4e4e7" }}>not</strong> certify or guarantee compliance. Compliance is your responsibility and depends on your full security posture. Coverage percentages (e.g. &quot;MAST 78.6%&quot;) indicate which framework items Orchesis addresses, not that you are 78.6% compliant.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Third-Party Services</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            Orchesis does not include third-party services. However, the website is hosted on Vercel (subject to Vercel&apos;s terms), source code is on GitHub (subject to GitHub&apos;s terms), and you may configure Orchesis to proxy requests to third-party LLM providers (subject to their terms).
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#a1a1aa" }}>Changes</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#71717a" }}>
            We may update these terms. Continued use after changes constitutes acceptance.
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
          <a href="/privacy" style={{ color: "#52525b", textDecoration: "none" }}>Privacy</a>
          {" · "}
          <a href="https://github.com/poushwell/orchesis" style={{ color: "#52525b", textDecoration: "none" }}>GitHub</a>
        </div>
      </div>
    </div>
  );
}
