"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import EasterEggs from "../components/EasterEggs";
type SiteMode = "dark" | "light" | "matrix" | "dos" | "ussr";
const SEVERITY = {
  CRITICAL: { level: 4, label: "CRITICAL", color: "#ef4444", deduction: 25 },
  HIGH:     { level: 3, label: "HIGH",     color: "#f97316", deduction: 10 },
  MEDIUM:   { level: 2, label: "MEDIUM",   color: "#eab308", deduction: 3  },
  LOW:      { level: 1, label: "LOW",      color: "#a855f7", deduction: 1  },
  INFO:     { level: 0, label: "INFO",     color: "#71717a", deduction: 0  },
} as const;
type SeverityKey = keyof typeof SEVERITY;
type SeverityObj = typeof SEVERITY[SeverityKey];
interface Finding { severity: SeverityObj; title: string; description: string; remediation: string; }
interface ScanResult { score: number; grade: { letter: string; color: string; label: string }; findings: Finding[]; summary: Record<SeverityKey, number>; scannedAt: string; }
type Servers = Record<string, Record<string, unknown>>;
function getServers(config: Record<string, unknown>): Servers {
  const raw = config.mcpServers || config.servers || config["mcp-servers"] || config.mcptools || {};
  if (Array.isArray(raw)) {
    const mapped: Servers = {};
    (raw as Record<string, unknown>[]).forEach((item, i) => {
      if (item && typeof item === "object") { const name = (item.name as string) || `server_${i + 1}`; mapped[name] = item as Record<string, unknown>; }
    });
    return mapped;
  }
  return (raw && typeof raw === "object") ? raw as Servers : {};
}
const CVE_PACKAGES: Record<string, { fixedVersion: string | null; cvss: number; cve?: string }> = {
  "mcp-remote": { fixedVersion: "0.1.16", cvss: 9.6, cve: "CVE-2025-49596" },
  "@modelcontextprotocol/server-filesystem": { fixedVersion: "0.6.3", cvss: 8.1 },
  "framelink-figma-mcp": { fixedVersion: "0.6.3", cvss: 7.5 },
  "gemini-mcp-tool": { fixedVersion: null, cvss: 9.8 },
  "@anthropic/mcp-inspector": { fixedVersion: "0.14.1", cvss: 8.4 },
};
function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number); const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) { if ((pa[i]||0) < (pb[i]||0)) return -1; if ((pa[i]||0) > (pb[i]||0)) return 1; }
  return 0;
}
const MALICIOUS_PACKAGES = ["mcp-server-free","mcp-helper-tool","mcp-utils-pro","fastmcp-server","mcp-connect-helper"];
const KNOWN_GOOD_PACKAGES = ["@modelcontextprotocol/server-filesystem","@modelcontextprotocol/server-github","@modelcontextprotocol/server-postgres","mcp-remote","framelink-figma-mcp","mcp-server-fetch"];
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i===0?j:j===0?i:0));
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++) dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}
function entropy(str: string): number {
  const freq: Record<string,number>={};
  for(const c of str)freq[c]=(freq[c]||0)+1;
  return -Object.values(freq).reduce((s,f)=>{const p=f/str.length;return s+p*Math.log2(p);},0);
}
function scanConfig(configText: string): ScanResult {
  const findings: Finding[] = [];
  let score = 100;
  function addFinding(sev: SeverityObj, title: string, description: string, remediation: string) {
    findings.push({ severity: sev, title, description, remediation });
    score -= sev.deduction;
  }
  let config: Record<string, unknown>;
  try { config = JSON.parse(configText); }
  catch (e: unknown) {
    addFinding(SEVERITY.CRITICAL, "Invalid JSON", `Config is not valid JSON: ${(e as Error).message}`, "Fix the JSON syntax before proceeding.");
    return { score: 0, grade: { letter: "F", color: "#ef4444", label: "Critical Risk" }, findings, summary: { CRITICAL: 1, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }, scannedAt: new Date().toISOString() };
  }
  const servers = getServers(config);
  for (const [name, server] of Object.entries(servers)) {
    const transport = (server.transport || server.type || "unknown") as string;
    if (["sse","http","streamable-http"].includes(transport)) {
      const url = ((server.url || server.baseUrl || "") as string);
      const isRemote = !url.includes("localhost") && !url.includes("127.0.0.1");
      if (url.startsWith("http://") && isRemote) addFinding(SEVERITY.CRITICAL, `Server "${name}" uses unencrypted HTTP`, `Transport uses HTTP to remote host: ${url}.`, "Switch to HTTPS or use stdio transport.");
      if (isRemote) addFinding(SEVERITY.MEDIUM, `Server "${name}" connects to remote endpoint`, `Remote MCP server at ${url}.`, "Use trusted endpoints and prefer local servers.");
    }
  }
  const count = Object.keys(servers).length;
  if (count > 10) addFinding(SEVERITY.MEDIUM, `High server count (${count})`, `${count} MCP servers configured.`, "Remove unused servers.");
  if (count === 0) addFinding(SEVERITY.INFO, "No servers configured", "Config has no MCP servers.", "Add MCP server configurations for a full scan.");
  for (const [name, server] of Object.entries(servers)) {
    const cmd = (server.command || "") as string;
    const args = ((server.args || []) as string[]).join(" ");
    const full = `${cmd} ${args}`;
    if (/[;&|`$()]/.test(args)) addFinding(SEVERITY.CRITICAL, `Server "${name}": shell metacharacters in args`, `Arguments contain shell special characters: ${args.slice(0,120)}.`, "Remove shell metacharacters.");
    if (/\b(eval|exec|sh -c|bash -c|cmd \/c|powershell -command)\b/i.test(full)) addFinding(SEVERITY.HIGH, `Server "${name}": dynamic code execution pattern`, `Command uses shell execution: "${full.slice(0,140)}".`, "Invoke binaries directly.");
  }
  for (const [name, server] of Object.entries(servers)) {
    const env = (server.env || {}) as Record<string, string>;
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === "string" && value.length > 10 && /^(sk-|ghp_|gho_|github_pat_|AKIA|xox[bsp]-|glpat-|Bearer\s)/i.test(value))
        addFinding(SEVERITY.CRITICAL, `Server "${name}": hardcoded credential in env`, `Environment variable "${key}" appears to contain a secret.`, "Move secrets to a secret manager.");
      if (/(api_key|api_secret|token|password|secret|credential|auth)/i.test(key) && (!value || value === ""))
        addFinding(SEVERITY.LOW, `Server "${name}": empty sensitive env var "${key}"`, `Sensitive env var "${key}" is empty.`, "Ensure it is set securely outside this config.");
    }
  }
  const walkStr = (obj: unknown, depth = 0): void => {
    if (depth > 8) return;
    if (typeof obj === "string") {
      const patterns = [
        { regex: /sk-[a-zA-Z0-9]{20,}/, name: "OpenAI API key" },
        { regex: /ghp_[a-zA-Z0-9]{20,}/, name: "GitHub token" },
        { regex: /AKIA[0-9A-Z]{16}/, name: "AWS access key" },
        { regex: /xox[bsp]-[a-zA-Z0-9-]+/, name: "Slack token" },
        { regex: /glpat-[a-zA-Z0-9_-]{20,}/, name: "GitLab token" },
      ];
      for (const p of patterns) { if (p.regex.test(obj)) addFinding(SEVERITY.CRITICAL, `Hardcoded ${p.name} detected`, `A ${p.name} pattern was found in the config.`, "Remove credentials and use environment variables."); }
    } else if (Array.isArray(obj)) obj.forEach(i => walkStr(i, depth+1));
    else if (obj && typeof obj === "object") Object.values(obj).forEach(v => walkStr(v, depth+1));
  };
  walkStr(config);
  for (const [name, server] of Object.entries(servers)) {
    const args = ((server.args || []) as string[]).join(" ");
    const portMatch = args.match(/--port[= ](\d+)/) || args.match(/:(\d{4,5})\b/);
    if (portMatch) addFinding(SEVERITY.LOW, `Server "${name}" exposes port ${portMatch[1]}`, `Port ${portMatch[1]} detected.`, "Validate firewall and binding scope.");
  }
  for (const [name, server] of Object.entries(servers)) {
    if (!server.allowedTools && !server.disabledTools && !server.tools)
      addFinding(SEVERITY.MEDIUM, `Server "${name}": no tool restrictions`, "No allow/deny list found for exposed tools.", "Define allowedTools.");
  }
  const knownIssues: Record<string, { severity: SeverityObj; issue: string }> = {
    "mcp-server-fetch": { severity: SEVERITY.LOW, issue: "Can fetch arbitrary URLs (SSRF risk)." },
    "mcp-server-puppeteer": { severity: SEVERITY.MEDIUM, issue: "Browser automation can reach untrusted content." },
    "mcp-server-filesystem": { severity: SEVERITY.MEDIUM, issue: "Filesystem access without path restrictions." },
    "mcp-server-shell": { severity: SEVERITY.HIGH, issue: "Arbitrary shell execution capability." },
    "mcp-server-everything": { severity: SEVERITY.HIGH, issue: "Overprivileged package with broad capability surface." },
  };
  for (const [name, server] of Object.entries(servers)) {
    const haystack = `${server.command || ""} ${((server.args||[]) as string[]).join(" ")} ${name}`.toLowerCase();
    for (const [pkg, info] of Object.entries(knownIssues)) {
      if (haystack.includes(pkg.toLowerCase())) addFinding(info.severity, `Server "${name}" uses ${pkg}`, info.issue, "Pin version and apply strict runtime restrictions.");
    }
  }
  for (const [name, server] of Object.entries(servers)) {
    const args = ((server.args||[]) as string[]).join(" ");
    if (/\.\.\/|\.\.\\/  .test(args)) addFinding(SEVERITY.HIGH, `Server "${name}": path traversal in args`, `Arguments include traversal markers.`, "Use canonical absolute paths.");
  }
  const dangerousShells = ["bash","sh","cmd","powershell","pwsh","zsh"];
  for (const [name, server] of Object.entries(servers)) {
    const cmd = ((server.command||"") as string).toLowerCase();
    if (dangerousShells.some(d => cmd === d || cmd.endsWith(`/${d}`) || cmd.endsWith(`\\${d}`)))
      addFinding(SEVERITY.HIGH, `Server "${name}": runs via shell interpreter`, `Command "${server.command}" is a shell interpreter.`, "Prefer direct binary invocation.");
  }
  const txt = JSON.stringify(config).toLowerCase();
  if (['"verify":false','"tls":false','"ssl":false','"insecure":true'].some(s => txt.includes(s)))
    addFinding(SEVERITY.HIGH, "TLS/SSL verification disabled", "Detected insecure TLS flags.", "Enable strict certificate verification.");
  const txtRaw = JSON.stringify(config);
  if (/"allowedTools"\s*:\s*\[\s*"\*"\s*\]/.test(txtRaw)) addFinding(SEVERITY.MEDIUM, "Wildcard tool permissions", 'Wildcard "*" grants broad tool access.', "Replace with explicit minimal allowlist.");
  if (/"allowedDirectories"\s*:\s*\[\s*"\/"\s*\]/.test(txtRaw)) addFinding(SEVERITY.HIGH, "Root filesystem access", 'Server grants access to root directory "/".', "Restrict to minimal required directories.");
  for (const [name, server] of Object.entries(servers)) {
    if (server.disabled === true) addFinding(SEVERITY.LOW, `Server "${name}" is disabled but still present`, "Disabled servers risk accidental re-enable.", "Remove stale disabled entries.");
  }
  const names = Object.keys(servers);
  const missing = Object.values(servers).filter(s => !s.description).length;
  if (names.length > 0 && missing > 0) addFinding(SEVERITY.INFO, `${missing} server(s) without descriptions`, "Missing descriptions make security reviews harder.", "Document each server purpose.");
  for (const [name, server] of Object.entries(servers)) {
    const sargs = (server.args||[]) as string[];
    const allArgsStr = sargs.join(" ");
    if (server.command === "npx" && !sargs.some(a => /@[\w.-]+/.test(a))) addFinding(SEVERITY.MEDIUM, `Server "${name}": npx without version pinning`, "npx package version is not pinned.", "Pin exact version.");
    if ((server.command === "uvx" || server.command === "pipx") && !sargs.some(a => a.includes("=="))) addFinding(SEVERITY.MEDIUM, `Server "${name}": ${server.command} without version pinning`, `${server.command} dependency is not pinned.`, "Pin exact versions.");
    sargs.forEach(arg => {
      Object.entries(CVE_PACKAGES).forEach(([pkg, info]) => {
        if (arg.includes(pkg)) {
          const vm = arg.match(/@([\d.]+)(?:$|[^\w])/);
          const ver = vm && vm[1];
          if (!ver || (info.fixedVersion && compareVersions(ver, info.fixedVersion) < 0))
            addFinding(info.cvss >= 9.0 ? SEVERITY.CRITICAL : SEVERITY.HIGH, `Known vulnerable package: ${pkg}`, info.cve ? `${pkg} has ${info.cve} (CVSS ${info.cvss})` : `${pkg} has known vulnerability (CVSS ${info.cvss})`, info.fixedVersion ? `Pin to ${pkg}@${info.fixedVersion}` : "Replace or remove this package.");
        }
      });
      MALICIOUS_PACKAGES.forEach(pkg => { if (arg.includes(pkg)) addFinding(SEVERITY.CRITICAL, `Known malicious package: ${pkg}`, `${pkg} is on the confirmed malicious package blocklist.`, "Remove this server immediately."); });
      const pm = arg.match(/(@[a-z0-9-]+\/[a-z0-9-]+|[a-z][a-z0-9-]{3,})(?:@|$)/);
      if (pm && !MALICIOUS_PACKAGES.includes(pm[1]) && !KNOWN_GOOD_PACKAGES.includes(pm[1])) {
        KNOWN_GOOD_PACKAGES.forEach(known => { const d = levenshtein(pm[1], known); if (d === 1 || d === 2) addFinding(SEVERITY.HIGH, `Possible typosquatting: ${pm[1]}`, `"${pm[1]}" is very similar to "${known}" (distance: ${d}).`, `Did you mean "${known}"?`); });
      }
      if (typeof arg === "string" && arg.length >= 20 && !arg.startsWith("-") && !arg.startsWith("/")) {
        const e = entropy(arg); if (e > 4.5) addFinding(SEVERITY.HIGH, "High-entropy string in args (possible secret)", `"${arg.substring(0,20)}..." has entropy ${e.toFixed(2)}.`, "Move to environment variable.");
      }
      if (typeof arg === "string" && (arg.endsWith(":latest") || arg.includes("@latest"))) addFinding(SEVERITY.HIGH, `Server "${name}": package pinned to :latest`, ":latest always pulls newest version.", "Pin to a specific version tag.");
      if (typeof arg === "string" && /git\+https?:\/\/|github\.com\/archive|raw\.githubusercontent\.com/.test(arg)) addFinding(SEVERITY.HIGH, `Server "${name}": package installed from URL`, "Installing from URL bypasses registry integrity.", "Use a published npm/pypi package instead.");
    });
    if (allArgsStr.includes("--privileged")) addFinding(SEVERITY.CRITICAL, `Server "${name}": Docker --privileged mode`, "--privileged gives container full host access.", "Remove --privileged flag.");
    if (allArgsStr.includes("/var/run/docker.sock")) addFinding(SEVERITY.CRITICAL, `Server "${name}": Docker socket mounted`, "Mounting docker.sock gives full Docker control.", "Remove -v /var/run/docker.sock mount.");
    if (allArgsStr.includes("--network=host")) addFinding(SEVERITY.HIGH, `Server "${name}": Docker host network`, "--network=host bypasses network isolation.", "Use bridge networking instead.");
    ["~/.ssh","~/.aws","~/.kube"].forEach(p => { if (allArgsStr.includes(p)) addFinding(SEVERITY.CRITICAL, `Server "${name}": sensitive path mounted: ${p}`, `Mounting ${p} exposes credentials.`, `Remove the ${p} mount.`); });
    const autoApprove = server.autoApprove;
    if (autoApprove === true || autoApprove === "*" || (Array.isArray(autoApprove) && (autoApprove as string[]).includes("*")))
      addFinding(SEVERITY.CRITICAL, `Server "${name}": autoApprove wildcard`, 'autoApprove: ["*"] bypasses human-in-the-loop for all tool calls.', "Restrict to specific safe tools only.");
    else if (Array.isArray(autoApprove) && (autoApprove as string[]).length > 5)
      addFinding(SEVERITY.MEDIUM, `Server "${name}": autoApprove has ${(autoApprove as string[]).length} tools`, "Large autoApprove list reduces oversight.", "Review and trim the list.");
    const envObj = (server.env || {}) as Record<string, string>;
    const adminPats = ["ADMIN_TOKEN","ROOT_KEY","SUPERUSER","MASTER_KEY","SECRET_KEY","ADMIN_PASSWORD"];
    Object.keys(envObj).forEach(k => { adminPats.forEach(p => { if (k.toUpperCase().includes(p)) addFinding(SEVERITY.HIGH, `Server "${name}": admin credential in env: ${k}`, `${k} suggests elevated privileges.`, "Use a scoped service account."); }); });
    if (/^(sudo|doas)/.test((server.command||"") as string) || /\b(sudo|doas)\s/.test(allArgsStr))
      addFinding(SEVERITY.CRITICAL, `Server "${name}": elevated execution`, "Server runs with sudo/doas — root-level access.", "Never run MCP servers as root.");
    const surl = (server.url || "") as string;
    if (surl.startsWith("http://") && !surl.includes("localhost") && !surl.includes("127.0.0.1"))
      addFinding(SEVERITY.HIGH, `Server "${name}": SSE without TLS`, "Unencrypted HTTP for remote transport.", "Switch to HTTPS.");
  }
  const serverList = Object.values(servers);
  const hasFS = serverList.some(s => ((s.args||[]) as string[]).some(a => a.includes("server-filesystem") || a.includes("file")));
  const hasNet = serverList.some(s => ((s.args||[]) as string[]).some(a => a.includes("mcp-remote") || a.includes("fetch")) || s.url);
  if (hasFS && hasNet) addFinding(SEVERITY.HIGH, "Cross-server exfiltration risk", "Filesystem access + network-connected servers.", "Review if both are needed simultaneously.");
  const credMap: Record<string,string[]> = {};
  Object.entries(servers).forEach(([sname, s]) => {
    Object.entries((s.env||{}) as Record<string,string>).forEach(([k,v]) => { if (typeof v==="string" && v.length>8) { if (!credMap[v]) credMap[v]=[]; credMap[v].push(`${sname}.${k}`); } });
  });
  Object.entries(credMap).forEach(([,locs]) => { if (locs.length>1) addFinding(SEVERITY.MEDIUM,"Shared credential across multiple servers",`Same credential in: ${locs.join(", ")}.`,"Use separate credentials per server."); });

  // ─── Tool Security checks (tool_001 - tool_003) ───
  for (const [name, server] of Object.entries(servers)) {
    const desc = ((server.description || "") as string).toLowerCase();
    const injPats = ["you must", "always", "ignore previous", "do not tell", "override", "forget", "disregard"];
    if (injPats.some(p => desc.includes(p)))
      addFinding(SEVERITY.HIGH, `Server "${name}": tool description contains instructions`, "Tool description includes directive language that could manipulate the LLM.", "Review tool descriptions for hidden instructions.");
  }
  // tool_003: cross-server tool name collision
  const allToolNames: Record<string, string[]> = {};
  for (const [name, server] of Object.entries(servers)) {
    const tools = (server.allowedTools || server.tools || []) as string[];
    tools.forEach(tool => { if (!allToolNames[tool]) allToolNames[tool] = []; allToolNames[tool].push(name); });
  }
  Object.entries(allToolNames).forEach(([tool, srvs]) => { if (srvs.length > 1) addFinding(SEVERITY.HIGH, `Tool name collision: "${tool}"`, `Tool "${tool}" exposed by: ${srvs.join(", ")}. Shadowing risk.`, "Rename tools to avoid collision or remove duplicate server."); });
  // cs_new_002: total tools > 40
  const totalTools = Object.values(allToolNames).reduce((s, v) => s + v.length, 0);
  if (totalTools > 40) addFinding(SEVERITY.MEDIUM, `Total tools exceeds 40 (${totalTools})`, "More than 40 tools causes silent tool loss in some clients (e.g., Cursor).", "Reduce to under 40 tools.");

  // ─── Claude Code checks (cc_001 - cc_010) ───
  const permissions = config.permissions as Record<string, unknown> | undefined;
  const settings = config.settings as Record<string, unknown> | undefined;
  const envBlock = config.env as Record<string, string> | undefined;
  const allowRules = (permissions?.allow || []) as string[];
  const denyRules = (permissions?.deny || []) as string[];
  const allowStr = JSON.stringify(allowRules);
  const denyStr = JSON.stringify(denyRules);

  // cc_001: dangerously-skip-permissions
  if ((settings && (settings as Record<string,unknown>).bypassPermissions === true) || txt.includes("dangerously-skip-permissions"))
    addFinding(SEVERITY.CRITICAL, "dangerously-skip-permissions enabled", "All permission checks bypassed. Agent can execute any command without approval.", 'Remove bypassPermissions. Use granular allow/deny rules.');

  // cc_002: Unrestricted Bash access
  if (allowStr.includes("Bash(*)"))
    addFinding(SEVERITY.CRITICAL, "Unrestricted Bash access", 'Bash(*) in allow rules grants arbitrary shell execution.', 'Replace Bash(*) with specific commands: Bash(ls), Bash(cat).');

  // cc_003: All project MCP servers auto-approved
  if (settings && (settings as Record<string,unknown>).enableAllProjectMcpServers === true)
    addFinding(SEVERITY.CRITICAL, "All project MCP servers auto-approved", "enableAllProjectMcpServers: true allows any .mcp.json to add servers.", "Set to false. Approve MCP servers individually.");

  // cc_004: Sensitive paths not in deny list
  if (permissions && denyRules.length >= 0) {
    const sensitivePaths = [".env", ".ssh/", ".aws/", "credentials/", "secrets/", ".git/config"];
    const missingDeny = sensitivePaths.filter(p => !denyStr.includes(p));
    if (missingDeny.length > 0 && allowRules.length > 0)
      addFinding(SEVERITY.HIGH, "Sensitive paths not in deny list", `Missing deny rules for: ${missingDeny.join(", ")}.`, "Add sensitive paths to deny rules.");
  }

  // cc_005: Malicious CLAUDE.md indicators (in config text)
  const zeroWidthPat = /[\u200B\u200C\u200D\uFEFF\u200E\u200F]/;
  if (zeroWidthPat.test(configText))
    addFinding(SEVERITY.HIGH, "Hidden Unicode characters detected", "Zero-width or invisible characters found. Possible prompt injection vector.", "Review file: cat -A <filename>");

  // cc_006: Insecure hook commands
  const hooks = (config.hooks || config.preToolUse || config.postToolUse || config.PreToolUse || config.PostToolUse) as unknown;
  if (hooks) {
    const hookStr = JSON.stringify(hooks).toLowerCase();
    if (["curl", "wget", "nc ", "bash -c", "eval"].some(c => hookStr.includes(c)))
      addFinding(SEVERITY.CRITICAL, "Insecure hook commands", "Shell commands in hooks (curl, wget, eval) can exfiltrate data.", "Remove shell commands from hooks.");
  }

  // cc_007: ANTHROPIC_BASE_URL override (INFO - expected for Orchesis users)
  if (envBlock) {
    const baseUrl = envBlock.ANTHROPIC_BASE_URL || envBlock.anthropic_base_url;
    if (baseUrl && !baseUrl.includes("api.anthropic.com"))
      addFinding(SEVERITY.INFO, "ANTHROPIC_BASE_URL overridden", `Set to: ${baseUrl}. Expected if using a proxy (e.g., Orchesis). Suspicious if pointing to unknown endpoint.`, "Verify this points to a trusted proxy.");
  }

  // cc_008: Write access without Read deny
  if (permissions) {
    const readDenied = denyRules.some(r => typeof r === "string" && r.toLowerCase().includes("read"));
    const writeAllowed = allowRules.some(r => typeof r === "string" && (r.toLowerCase().includes("write") || r.toLowerCase().includes("edit")));
    if (readDenied && writeAllowed)
      addFinding(SEVERITY.MEDIUM, "Write access allowed despite Read deny", "Read denied but Write/Edit allowed for overlapping paths.", "Deny Write and Edit alongside Read for sensitive paths.");
  }

  // cc_009: Sandbox disabled
  if (settings && (settings as Record<string,unknown>).sandbox === false)
    addFinding(SEVERITY.HIGH, "Sandbox explicitly disabled", "Sandbox mode turned off removes OS-level isolation.", "Enable sandbox (default since v1.0).");

  // cc_010: Missing deny for dangerous commands
  if (allowRules.length > 0 && denyRules.length === 0) {
    addFinding(SEVERITY.HIGH, "No deny rules configured", "Allow rules present but no deny rules. Dangerous commands (rm, sudo, chmod, docker, kubectl) are unrestricted.", "Add deny rules for dangerous system commands.");
  } else if (denyRules.length > 0) {
    const dangerousCmds = ["rm", "sudo", "chmod", "chown", "kill", "docker", "kubectl"];
    const missingDanger = dangerousCmds.filter(c => !denyStr.toLowerCase().includes(c.toLowerCase()));
    if (missingDanger.length >= 5 && allowStr.includes("Bash"))
      addFinding(SEVERITY.HIGH, "Missing deny for dangerous commands", `No deny rules for: ${missingDanger.join(", ")}.`, "Add deny rules for dangerous system commands.");
  }

  // ─── Cursor checks (cur_001 - cur_007) ───
  const cursorSettings = config.settings as Record<string, unknown> | undefined;
  
  // cur_001: YOLO / auto-run mode
  if (cursorSettings && ((cursorSettings as Record<string,unknown>).yolo === true || (cursorSettings as Record<string,unknown>).autoRun === true))
    addFinding(SEVERITY.CRITICAL, "Auto-run (YOLO) mode enabled", "Agent executes commands without human approval.", "Disable auto-run. Require approval for each action.");

  // cur_002: Hidden Unicode in rules (already covered by cc_005 for general case)

  // cur_003: Missing .cursorignore (check if cursor config present but no ignore patterns)
  if (config.mcpServers && txt.includes("cursor") && !config.cursorignore && !txt.includes("cursorignore"))
    addFinding(SEVERITY.HIGH, "Missing .cursorignore configuration", "No .cursorignore detected. All files may be exposed to AI context.", 'Create .cursorignore with: .env, .ssh/, node_modules/, *.key');

  // cur_004: Privacy mode disabled
  if (cursorSettings && (cursorSettings as Record<string,unknown>)["privacy.mode"] === "off")
    addFinding(SEVERITY.MEDIUM, "Cursor privacy mode disabled", "Code may be sent to external servers for processing.", "Enable privacy mode to keep code local.");

  // cur_005: Workspace trust not configured
  if (cursorSettings && (cursorSettings as Record<string,unknown>).workspaceTrust === false)
    addFinding(SEVERITY.HIGH, "Workspace trust disabled", "Disabling workspace trust allows untrusted workspaces to run code.", "Enable workspace trust.");

  // cur_007: Case-sensitivity bypass risk
  if (txt.includes(".cUrSoR") || txt.includes(".CURSOR") || /\.c[uU][rR][sS][oO][rR]/.test(txt))
    addFinding(SEVERITY.HIGH, "Case-sensitivity bypass risk in config paths", "Mixed-case paths (.cUrSoR/) may bypass security filters (CVE-2025-59944).", "Use consistent lowercase casing in all config paths.");

  // ─── OpenClaw checks (oc_001 - oc_006) ───
  const sandbox = config.sandbox as Record<string, unknown> | undefined;
  const gateway = config.gateway as Record<string, unknown> | undefined;
  const toolsConfig = config.tools as Record<string, unknown> | undefined;

  // oc_001: Sandbox disabled
  if (sandbox && (sandbox as Record<string,unknown>).mode === "off")
    addFinding(SEVERITY.CRITICAL, "OpenClaw sandbox disabled", 'sandbox.mode = "off" removes container isolation.', 'Enable Docker sandbox: sandbox.mode = "docker"');

  // oc_002: Gateway publicly bound without auth
  if (gateway) {
    const bind = (gateway as Record<string,unknown>).bind as string | undefined;
    const auth = (gateway as Record<string,unknown>).auth as Record<string,unknown> | undefined;
    if (bind && bind.includes("0.0.0.0") && (!auth || auth.mode !== "token"))
      addFinding(SEVERITY.CRITICAL, "Gateway publicly bound without authentication", 'bind = "0.0.0.0" with no auth exposes the gateway to the network.', 'Set auth.mode = "token" or bind to 127.0.0.1');
  }

  // oc_003: Full tool profile
  if (toolsConfig && (toolsConfig as Record<string,unknown>).profile === "full")
    addFinding(SEVERITY.HIGH, 'OpenClaw full tool profile enabled', '"tools.profile": "full" grants maximum tool access.', "Use restricted tool profile.");

  // oc_004: Elevated tools
  if (toolsConfig) {
    const elevated = (toolsConfig as Record<string,unknown>).elevated as Record<string,unknown> | undefined;
    if (elevated && elevated.enabled === true)
      addFinding(SEVERITY.HIGH, "Elevated tools enabled", "Elevated tools grant additional system-level access.", "Disable elevated tools unless specifically required.");
  }

  // oc_005: Unsafe external content
  if (txt.includes('"allowUnsafeExternalContent":true') || txt.includes('"allowUnsafeExternalContent": true'))
    addFinding(SEVERITY.CRITICAL, "Unsafe external content allowed", "allowUnsafeExternalContent: true permits unvalidated external input.", "Set allowUnsafeExternalContent: false");

  // oc_006: API keys in plaintext (covered by general credential walk, but check OpenClaw-specific patterns)
  if (gateway || sandbox) {
    const configStr = JSON.stringify(config);
    if (/SecretRef/.test(configStr) === false && /(sk-|ghp_|AKIA|xox[bsp]-|glpat-)/.test(configStr))
      addFinding(SEVERITY.HIGH, "API keys in plaintext OpenClaw config", "Use SecretRef or auth profiles instead of plaintext keys.", "Move credentials to SecretRef or environment variables.");
  }

  // ─── OWASP Compliance checks ───
  // owasp_logging: No logging configuration
  if (!txt.includes("log") && !txt.includes("audit") && !txt.includes("trace") && count > 0)
    addFinding(SEVERITY.MEDIUM, "No logging configuration detected", "MCP server interactions are not logged for audit.", "Enable logging for all MCP server calls.");

  // owasp_context: Context oversharing indicators
  if (txt.includes('"includeSystemPrompt":true') || txt.includes('"includeSchema":true') || txt.includes('"contextMode":"full"'))
    addFinding(SEVERITY.MEDIUM, "Context oversharing detected", "Config sends excessive context (system prompts, schemas) to MCP servers.", "Minimize context sent to tools. Use selective context modes.");

  // protocol_a2a: A2A without auth
  if (txt.includes("a2a") || txt.includes("agent-to-agent")) {
    if (!txt.includes("auth") && !txt.includes("token"))
      addFinding(SEVERITY.HIGH, "A2A protocol without authentication", "Agent-to-agent communication configured without auth.", "Configure authentication for all A2A connections.");
  }

  const finalScore = Math.max(0, Math.round(score));
  const getGrade = (s: number) => {
    if (s >= 100) return { letter: "A+", color: "#22c55e", label: "Perfect" };
    if (s >= 90) return { letter: "A", color: "#22c55e", label: "Excellent" };
    if (s >= 75) return { letter: "B", color: "#38bdf8", label: "Good" };
    if (s >= 50) return { letter: "C", color: "#eab308", label: "Needs Improvement" };
    if (s >= 25) return { letter: "D", color: "#f97316", label: "Poor" };
    return { letter: "F", color: "#ef4444", label: "Critical Risk" };
  };
  const summary = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 } as Record<SeverityKey, number>;
  findings.forEach(f => { summary[f.severity.label as SeverityKey] += 1; });
  return { score: finalScore, grade: getGrade(finalScore), findings: findings.sort((a,b) => b.severity.level - a.severity.level), summary, scannedAt: new Date().toISOString() };
}

const EXAMPLES = {
  vulnerable: { mcpServers: { "shell-access": { command: "bash", args: ["-c", "node server.js; echo $SECRET"], env: { OPENAI_API_KEY: "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz" } }, "filesystem-full": { command: "npx", args: ["mcp-server-filesystem", "/"], allowedDirectories: ["/"] } } },
  moderate: { mcpServers: { search: { command: "npx", args: ["-y", "mcp-server-brave-search@1.2.0"], env: { BRAVE_API_KEY: "" } }, filesystem: { command: "npx", args: ["-y", "mcp-server-filesystem@1.0.0", "./workspace"], description: "Access workspace files only" } } },
  secure: { mcpServers: { "docs-search": { command: "uvx", args: ["mcp-docs-search==1.3.2"], description: "Search project documentation", env: {}, allowedTools: ["search_docs", "get_doc"] } } },
  claudeCode: { permissions: { allow: ["Bash(*)", "Read(*)", "Write(*)"], deny: [] }, settings: { bypassPermissions: false, enableAllProjectMcpServers: true }, env: { GITHUB_TOKEN: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" } },
};
type ConfigFormat = "mcp" | "claude-code" | "cursor" | "openclaw" | "orchesis" | "unknown";
function detectFormat(config: Record<string, unknown>): ConfigFormat {
  if (config.permissions && (config.permissions as Record<string,unknown>).deny !== undefined) return "claude-code";
  if (config.mcpServers || config.servers || config["mcp-servers"]) return "mcp";
  if ((config as Record<string,unknown>).gateway && (config as Record<string,unknown>).sandbox) return "openclaw";
  if ((config as Record<string,unknown>).proxy && (config as Record<string,unknown>).security) return "orchesis";
  return "unknown";
}
const sevPill: Record<string, React.CSSProperties> = {
  CRITICAL: { background: "#2b1115", color: "#fca5a5", border: "1px solid #7f1d1d" },
  HIGH:     { background: "#311a10", color: "#fdba74", border: "1px solid #9a3412" },
  MEDIUM:   { background: "#2e250c", color: "#fde68a", border: "1px solid #854d0e" },
  LOW:      { background: "#1e0a36", color: "#d8b4fe", border: "1px solid #6b21a8" },
  INFO:     { background: "#1c1c1f", color: "#a1a1aa", border: "1px solid #27272a" },
};
export default function ScanPage() {
  const [mode, setMode] = useState<SiteMode>("dark");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [stars, setStars] = useState<number | null>(null);
  const [openFindings, setOpenFindings] = useState<Set<number>>(new Set());
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isMatrix = mode === "matrix"; const isDos = mode === "dos"; const isUssr = mode === "ussr";
  const t = isMatrix ? { bg: "#000000", card: "#001100", border: "#001908", text: "#00ff41", dim: "#009921", muted: "#004d14", accent: "#00ff41" }
    : isDos ? { bg: "#000080", card: "#0000aa", border: "#5555ff", text: "#ffffff", dim: "#aaaaaa", muted: "#555588", accent: "#ffff55" }
    : isUssr ? { bg: "#0a0000", card: "#150000", border: "#440000", text: "#ff6666", dim: "#cc0000", muted: "#550000", accent: "#ff0000" }
    : { bg: "#0f0f11", card: "#18181b", border: "#27272a", text: "#e4e4e7", dim: "#71717a", muted: "#3f3f46", accent: "#a855f7" };
  useEffect(() => {
    fetch("https://api.github.com/repos/poushwell/orchesis").then(r => r.json()).then(d => { if (typeof d.stargazers_count === "number") setStars(d.stargazers_count); }).catch(() => {});
  }, []);
  useEffect(() => {
    if (!result) return;
    const target = result.score; const start = Date.now(); const dur = 700;
    const tick = () => { const p = Math.min(1, (Date.now() - start) / dur); setScoreDisplay(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [result]);
  const scan = useCallback(() => {
    setError("");
    if (!input.trim()) { setError("Paste a config JSON first."); return; }
    const r = scanConfig(input.trim());
    if (r.score === 0 && r.findings.length === 1 && r.findings[0].title === "Invalid JSON") { setError(r.findings[0].description); return; }
    setResult(r); setOpenFindings(new Set());
    // Shareable URL hash
    try {
      const hash = `s=${r.score},c${r.summary.CRITICAL}h${r.summary.HIGH}m${r.summary.MEDIUM}`;
      window.history.replaceState(null, "", `#${hash}`);
    } catch {}
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [input]);
  const toggleFinding = (i: number) => { setOpenFindings(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; }); };
  const copyScore = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`My AI agent config scored ${result.grade.letter} (${result.score}/100) on @orchesis security scan. ${result.findings.length} issues found.\nCheck yours: https://orchesis.ai/scan\n#MCPSecurity #AIAgents`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const tweet = () => {
    if (!result) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My AI agent config scored ${result.grade.letter} (${result.score}/100) on @orchesis security scan. ${result.findings.length} issues found.\nCheck yours:`)}&url=${encodeURIComponent("https://orchesis.ai/scan")}&hashtags=MCPSecurity,AIAgents`, "_blank", "noopener");
  };
  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: isMatrix || isDos || isUssr ? "'Courier New', monospace" : "-apple-system, system-ui, sans-serif", lineHeight: 1.5 }}>
      <EasterEggs mode={mode} onActivate={setMode} />
      {/* NAV — X3: Full nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, background: "rgba(15,15,17,0.95)", backdropFilter: "blur(8px)", zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: t.text, fontSize: "16px", fontWeight: 600 }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.9 }} />
          Orchesis
        </a>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Scan", href: "/scan" },
            { label: "Scorecard", href: "/scorecard" },
            { label: "OpenClaw", href: "/openclaw" },
            { label: "Paperclip", href: "/paperclip" },
            { label: "Docs", href: "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" },
            { label: "GitHub", href: "https://github.com/poushwell/orchesis" },
            { label: "Blog", href: "/blog" },
          ].map(item => (
            <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ color: t.dim, textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = t.text}
              onMouseLeave={e => (e.target as HTMLElement).style.color = t.dim}
            >{item.label}</a>
          ))}
          <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "6px", border: `1px solid ${t.border}`, background: t.card, textDecoration: "none", fontSize: "12px", color: t.dim, fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget).style.borderColor = t.accent}
            onMouseLeave={e => (e.currentTarget).style.borderColor = t.border}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill={t.accent}><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
            {stars !== null ? stars : "—"}
          </a>
        </div>
      </nav>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 48px 80px" }}>
        <div style={{ marginBottom: "32px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "100px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", fontSize: "12px", color: "#c084fc", marginBottom: "20px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Free · 100% private · runs in browser
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 12px" }}>AI Agent Security Scanner</h1>
          <p style={{ fontSize: "14px", color: t.dim, margin: "0 0 16px", lineHeight: 1.7 }}>Orchesis AI Agent Security Scanner checks your AI agent configuration for security vulnerabilities. 80+ checks across 9 categories including CVE database matching, OWASP MCP Top 10 compliance, and IDE-specific config validation for Cursor, Claude Code, and OpenClaw. 100+ checks available via CLI. No signup required. All processing runs client-side — your config data never leaves your browser. Free, open source, MIT license.</p>
          {/* S2: Trust badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              "80+ checks", "9 categories", "Browser-only", "No data sent", "Open source", "OWASP MCP Top 10", "Claude Code · Cursor · OpenClaw",
            ].map((text, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "100px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", fontSize: "12px", color: "#22c55e", fontWeight: 500 }}>
                ✓ {text}
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: "12px 16px", borderRadius: "10px", border: `1px solid ${t.border}`, background: "rgba(168,85,247,0.05)", color: "#c084fc", fontSize: "13px", fontWeight: 600, marginBottom: "24px" }}>
          🔒 Privacy first: your config never leaves your browser. Zero data collection.
        </div>
        {/* CTA #0: Don't have a config file? */}
        <div style={{ padding: "12px 16px", borderRadius: "10px", border: `1px solid ${t.border}`, background: t.card, fontSize: "13px", color: t.dim, marginBottom: "16px" }}>
          Don&apos;t have a config file? Run: <code style={{ color: t.accent, fontFamily: "'JetBrains Mono','SF Mono',monospace", fontSize: "12px" }}>orchesis verify</code> — it finds and checks your config automatically.
        </div>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700 }}>Paste config JSON</span>
            <span style={{ fontSize: "12px", color: t.muted }}>Ctrl+Enter to scan</span>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); scan(); } }} spellCheck={false}
            placeholder={`{
  "mcpServers": {
    "docs-search": {
      "command": "uvx",
      "args": ["mcp-docs-search==1.3.2"]
    }
  }
}`}
            style={{ width: "100%", minHeight: "280px", resize: "vertical", border: `1px solid ${t.border}`, borderRadius: "8px", padding: "14px", background: "#0d0d0f", color: "#e4e4e7", fontSize: "13px", lineHeight: 1.5, fontFamily: "'JetBrains Mono','SF Mono',monospace", outline: "none" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px", alignItems: "center" }}>
            <button onClick={scan} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Scan Configuration</button>
            {(["vulnerable","moderate","secure"] as const).map(ex => (
              <button key={ex} onClick={() => { setInput(JSON.stringify(EXAMPLES[ex], null, 2)); setError(""); }}
                style={{ padding: "8px 14px", borderRadius: "8px", border: `1px solid ${t.border}`, background: "transparent", color: t.dim, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                Try {ex}
              </button>
            ))}
            <button onClick={() => { setInput(JSON.stringify(EXAMPLES.claudeCode, null, 2)); setError(""); }}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(56,189,248,0.3)", background: "rgba(56,189,248,0.06)", color: "#38bdf8", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
              Try Claude Code
            </button>
          </div>
          {error && <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #7f1d1d", background: "#1a0a0a", color: "#fca5a5", fontSize: "13px" }}>{error}</div>}
        </div>
        {result && (
          <div ref={resultsRef} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", animation: "rise 250ms ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "16px", marginBottom: "20px" }}>
              <div style={{ background: "#111113", border: `1px solid ${t.border}`, borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px" }}>
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#1c1c1f" strokeWidth="10" />
                  <circle cx="70" cy="70" r="58" fill="none" stroke={result.grade.color} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 58}`}
                    strokeDashoffset={`${2 * Math.PI * 58 * (1 - scoreDisplay / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
                  />
                  <text x="70" y="70" textAnchor="middle" dominantBaseline="central" style={{ transform: "rotate(90deg)", transformOrigin: "70px 70px" }}>
                    <tspan fontSize="34" fontWeight="800" fill={t.text}>{scoreDisplay}</tspan>
                  </text>
                  <text x="70" y="92" textAnchor="middle" dominantBaseline="central" style={{ transform: "rotate(90deg)", transformOrigin: "70px 70px" }}>
                    <tspan fontSize="12" fill={t.dim}>/ 100</tspan>
                  </text>
                </svg>
                <div style={{ fontSize: "13px", color: result.grade.color, fontWeight: 700 }}>Grade {result.grade.letter} — {result.grade.label}</div>
              </div>
              <div style={{ background: "#111113", border: `1px solid ${t.border}`, borderRadius: "10px", padding: "16px" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: t.text }}>Security findings summary</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {(["CRITICAL","HIGH","MEDIUM","LOW","INFO"] as SeverityKey[]).map(sev => (
                    <span key={sev} style={{ borderRadius: "999px", padding: "5px 10px", fontSize: "12px", fontWeight: 700, ...sevPill[sev] }}>{result.summary[sev]} {sev}</span>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: t.dim }}>{result.findings.length === 0 ? "No issues found — this config looks clean." : `${result.findings.length} issue${result.findings.length > 1 ? "s" : ""} detected. Review findings below.`}</p>
              </div>
            </div>
            <div style={{ display: "grid", gap: "8px", marginBottom: "20px" }}>
              {result.findings.length === 0 ? (
                <div style={{ border: `1px solid ${t.border}`, borderRadius: "10px", background: "#111113", padding: "16px", color: "#22c55e", fontSize: "14px" }}>✓ No findings — safe baseline.</div>
              ) : result.findings.map((f, i) => (
                <div key={i} style={{ border: `1px solid ${t.border}`, borderRadius: "10px", background: "#111113", overflow: "hidden" }}>
                  <button onClick={() => toggleFinding(i)} style={{ width: "100%", background: "transparent", border: "none", color: t.text, textAlign: "left", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", cursor: "pointer", fontFamily: "inherit", fontSize: "14px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 700 }}>
                      <span style={{ borderRadius: "999px", padding: "3px 8px", fontSize: "11px", fontWeight: 800, ...sevPill[f.severity.label] }}>{f.severity.label}</span>
                      {f.title}
                    </span>
                    <span style={{ color: t.dim, fontSize: "12px", flexShrink: 0 }}>{openFindings.has(i) ? "▲" : "Details"}</span>
                  </button>
                  {openFindings.has(i) && (
                    <div style={{ borderTop: `1px solid ${t.border}`, padding: "12px 16px", color: "#a1a1aa", fontSize: "14px" }}>
                      <div style={{ marginBottom: "8px" }}>{f.description}</div>
                      <div style={{ fontSize: "13px", color: t.dim, marginBottom: "8px" }}><strong style={{ color: t.text }}>Fix:</strong> {f.remediation}</div>
                      {f.remediation.includes('"') && (
                        <div style={{ position: "relative" }}>
                          <code style={{ display: "block", fontSize: "11px", background: "#0d0d0f", padding: "8px 12px", borderRadius: "6px", color: "#c084fc", fontFamily: "'JetBrains Mono','SF Mono',monospace", paddingRight: "40px" }}>{f.remediation}</code>
                          <button onClick={() => { navigator.clipboard.writeText(f.remediation); }} style={{ position: "absolute", top: "6px", right: "6px", background: "transparent", border: "none", color: t.dim, cursor: "pointer", fontSize: "12px", padding: "2px 6px" }} title="Copy fix">📋</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 16px", borderRadius: "10px", border: `1px solid ${t.border}`, background: "rgba(168,85,247,0.06)", fontSize: "14px", color: t.dim, marginBottom: "20px" }}>
              Powered by <strong style={{ color: t.text }}>Orchesis</strong> — open-source AI agent security runtime.{" "}
              <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ color: "#c084fc", fontWeight: 700 }}>View on GitHub →</a>
            </div>
            {/* S6: Orchesis recommendation if issues found */}
            {result.findings.length > 0 && (
              <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid rgba(168,85,247,0.3)", background: "rgba(168,85,247,0.05)", marginBottom: "20px" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: t.text, marginBottom: "8px" }}>Found issues? Orchesis catches these at runtime — before they reach the LLM.</div>
                <code style={{ display: "block", fontSize: "12px", background: "#0d0d0f", padding: "10px 14px", borderRadius: "6px", color: "#c084fc", marginBottom: "14px", fontFamily: "'JetBrains Mono','SF Mono',monospace" }}>base_url = "http://localhost:8080"</code>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a href="https://github.com/poushwell/orchesis#quick-start" target="_blank" rel="noopener noreferrer"
                    style={{ padding: "8px 18px", borderRadius: "8px", background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Install Orchesis →</a>
                  <a href="/blog/proxy-vs-decorator" style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #27272a", background: "transparent", color: "#71717a", textDecoration: "none", fontSize: "13px" }}>How it works →</a>
                </div>
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              <p style={{ color: t.dim, marginBottom: "12px", fontSize: "14px" }}>Share your score:</p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={copyScore} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${t.border}`, background: t.card, color: t.dim, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>{copied ? "✓ Copied!" : "📋 Copy text"}</button>
                <button onClick={tweet} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${t.border}`, background: t.card, color: t.dim, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>🐦 Tweet</button>
              </div>
            </div>
          </div>
        )}
        {/* S4: Check categories */}
        <div style={{ marginTop: "48px", padding: "24px", background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 20px", color: t.text }}>What we check — 80+ checks across 9 categories</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {[
              { cat: "Supply Chain", color: "#ef4444", checks: "CVE database, malicious packages, typosquatting, version pinning", isNew: false },
              { cat: "Credentials", color: "#ef4444", checks: "12 secret patterns, entropy detection, admin tokens, shared credentials", isNew: false },
              { cat: "Permissions", color: "#f97316", checks: "autoApprove, broad paths, sensitive file access, tool restrictions", isNew: false },
              { cat: "Docker Security", color: "#fb923c", checks: "Privileged mode, socket mounts, host network, sensitive paths", isNew: false },
              { cat: "Network", color: "#38bdf8", checks: "Unencrypted transport, TLS verification, remote endpoints, ports", isNew: false },
              { cat: "Cross-Server", color: "#38bdf8", checks: "Exfiltration paths, tool collisions, server count, shared credentials", isNew: false },
              { cat: "IDE & Agent Config", color: "#a855f7", checks: "Claude Code, Cursor, OpenClaw: sandbox, permissions, hooks, deny rules", isNew: true },
              { cat: "OWASP Compliance", color: "#a855f7", checks: "Logging, context oversharing, prompt injection indicators", isNew: true },
              { cat: "Protocol Security", color: "#22d3ee", checks: "A2A authentication, shell interpreters, elevated execution", isNew: true },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{item.cat}</span>
                  {(item as {isNew?: boolean}).isNew && <span style={{ padding: "1px 6px", borderRadius: "100px", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", fontSize: "9px", fontWeight: 700, color: "#c084fc", letterSpacing: "0.08em" }}>NEW</span>}
                </div>
                <p style={{ fontSize: "12px", color: t.dim, margin: "0 0 0 16px", lineHeight: 1.5 }}>{item.checks}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* S5: Cross-links */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px 48px" }}>
        <div style={{ borderTop: "1px solid #27272a", paddingTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", color: "#3f3f46", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "4px" }}>More tools</div>
          {[
            { text: "Want a full security assessment?", link: "Try the Security Scorecard →", href: "/scorecard" },
            { text: "Need runtime protection?", link: "Install Orchesis proxy →", href: "https://github.com/poushwell/orchesis#quick-start" },
            { text: "Read our research:", link: "75% of MCP configs have security problems →", href: "/blog/mcp-scan" },
          ].map((item, i) => (
            <div key={i} style={{ fontSize: "13px", color: "#71717a" }}>
              {item.text}{" "}
              <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ color: "#a855f7", textDecoration: "none" }}
                onMouseEnter={e => (e.target as HTMLElement).style.textDecoration = "underline"}
                onMouseLeave={e => (e.target as HTMLElement).style.textDecoration = "none"}
              >{item.link}</a>
            </div>
          ))}
        </div>
      </div>
      {/* X2: Full footer */}
      <footer style={{ borderTop: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.7 }} />
            <span style={{ fontSize: "12px", color: t.muted }}>© 2026 Orchesis · MIT License</span>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[
              { label: "GitHub", href: "https://github.com/poushwell/orchesis" },
              { label: "Docs", href: "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" },
              { label: "Scan", href: "/scan" },
              { label: "Scorecard", href: "/scorecard" },
              { label: "OpenClaw", href: "/openclaw" },
              { label: "Paperclip", href: "/paperclip" },
              { label: "Telegram", href: "/telegram" },
              { label: "Blog", href: "/blog" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map(l => (
              <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ fontSize: "12px", color: t.muted, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = t.dim}
                onMouseLeave={e => (e.target as HTMLElement).style.color = t.muted}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
      <style>{`@keyframes rise { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      {isMatrix && <div style={{ textAlign: "center", paddingBottom: "12px", fontSize: "11px", color: "#004d14", fontFamily: "'Courier New',monospace" }}>&gt; PRESS_ESC_TO_EXIT_MATRIX_MODE</div>}
      {isDos && <div style={{ textAlign: "center", paddingBottom: "12px", fontSize: "11px", color: "#555588", fontFamily: "'Courier New',monospace" }}>C:\&gt; Press ESC to exit DOS mode</div>}
      {isUssr && <div style={{ textAlign: "center", paddingBottom: "12px", fontSize: "11px", color: "#550000", fontFamily: "'Courier New',monospace" }}>★ НАЖМИ ESC ЧТОБЫ ВЫЙТИ ★</div>}
    </div>
  );
}
