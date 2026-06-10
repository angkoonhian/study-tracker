import { useState } from "react";

const ROLE_GROUPS = [
  {
    group: "Big Tech (FAANG+)",
    color: "#6FA8FF",
    border: "#2F66C4",
    roles: [
      {
        company: "Google",
        title: "Software Engineer, Google Ads",
        location: "Singapore",
        fit: "Java/Python, data structures & algorithms. Strong fit with your Java background.",
        link: "https://www.google.com/about/careers/applications/jobs/results?location=Singapore&q=software%20engineer",
        resume: "bigtech",
      },
      {
        company: "Google",
        title: "Software Engineer, Payments Data Platform",
        location: "Singapore",
        fit: "2 yrs exp, large-scale data + distributed systems. Excellent fit given GIC fintech experience.",
        link: "https://www.google.com/about/careers/applications/jobs/results?location=Singapore&q=software%20engineer",
        resume: "fintech",
      },
      {
        company: "Meta",
        title: "Software Engineer, Product",
        location: "Singapore",
        fit: "Full stack web/mobile with React. Your React/full-stack experience aligns directly.",
        link: "https://www.metacareers.com/jobs?q=software%20engineer&location[0]=Singapore",
        resume: "bigtech",
      },
      {
        company: "Meta",
        title: "Full Stack Software Engineer",
        location: "Singapore",
        fit: "Full stack role — direct match with your profile.",
        link: "https://www.metacareers.com/jobs?q=full%20stack%20engineer&location[0]=Singapore",
        resume: "bigtech",
      },
      {
        company: "Amazon",
        title: "Software Development Engineer",
        location: "Singapore",
        fit: "Java/Python/TypeScript. They value microservices and distributed systems experience.",
        link: "https://www.amazon.jobs/en/search?base_query=software+development+engineer&loc_query=Singapore",
        resume: "bigtech",
      },
      {
        company: "Microsoft",
        title: "Software Engineer (various teams)",
        location: "Singapore",
        fit: "APAC HQ in Singapore. Values Java, TypeScript, React skills.",
        link: "https://jobs.careers.microsoft.com/global/en/search?lc=Singapore&l=en_us&pg=1&pgSz=20&o=Relevance",
        resume: "bigtech",
      },
      {
        company: "Apple",
        title: "Software Engineer, Early Career",
        location: "Singapore",
        fit: "Early career track, good for ~3 yrs experience. Apple’s IST group manages large-scale services.",
        link: "https://jobs.apple.com/en-sg/search?location=singapore-SGP&team=SFTWR",
        resume: "bigtech",
      },
      {
        company: "Apple",
        title: "Software Engineer, Apple Online Store",
        location: "Singapore",
        fit: "Full stack web development. Good alignment with your e-commerce and full-stack experience.",
        link: "https://jobs.apple.com/en-sg/search?location=singapore-SGP&team=SFTWR",
        resume: "bigtech",
      },
      {
        company: "TikTok / ByteDance",
        title: "Backend Software Engineer",
        location: "Singapore",
        fit: "Backend services for large-scale consumer app. Your Spring Boot microservices at GIC are relevant.",
        link: "https://careers.tiktok.com/position?keywords=software%20engineer&location=CT_163&project=",
        resume: "bigtech",
      },
      {
        company: "TikTok / ByteDance",
        title: "Backend Software Engineer (Transaction)",
        location: "Singapore",
        fit: "Transaction systems — your fintech/trade editor experience at GIC is a strong match.",
        link: "https://careers.tiktok.com/position?keywords=backend%20engineer&location=CT_163&project=",
        resume: "fintech",
      },
      {
        company: "TikTok / ByteDance",
        title: "Software Engineer (Backend/Fullstack) - Trust & Safety",
        location: "Singapore",
        fit: "Full stack role. Good all-around match.",
        link: "https://careers.tiktok.com/position?keywords=fullstack&location=CT_163&project=",
        resume: "bigtech",
      },
    ],
  },
  {
    group: "Fintech / Finance",
    color: "#5FD79E",
    border: "#27613F",
    roles: [
      {
        company: "Stripe",
        title: "Full Stack Engineer, Expansion",
        location: "Singapore",
        fit: "2+ yrs backend/full stack. Payments domain — excellent match with GIC fintech background.",
        link: "https://stripe.com/jobs/search?office_locations=Asia+Pacific--Singapore",
        resume: "fintech",
      },
      {
        company: "Goldman Sachs",
        title: "Engineering Roles",
        location: "Singapore",
        fit: "Your GIC sovereign wealth fund experience is a rare differentiator. Java/Spring Boot in trade systems is highly relevant.",
        link: "https://higher.gs.com/roles/engineering?location=Singapore",
        resume: "fintech",
      },
      {
        company: "JPMorgan Chase",
        title: "Software Engineer Program",
        location: "Singapore",
        fit: "For experienced SWEs. No prior financial services exp required. Your GIC background gives you a significant edge.",
        link: "https://careers.jpmorgan.com/global/en/search?q=software+engineer&loc=Singapore",
        resume: "fintech",
      },
      {
        company: "Bloomberg",
        title: "Software Engineer, Data Technologies",
        location: "Singapore",
        fit: "Distributed systems, data processing for financial data. Your GIC data platform work is relevant.",
        link: "https://careers.bloomberg.com/job/search?lc=singapore",
        resume: "fintech",
      },
      {
        company: "PayPal",
        title: "Software Engineer (Full Stack)",
        location: "Singapore (Hybrid)",
        fit: "REST APIs, Spring, SQL. Your NestJS/Spring Boot/React stack aligns perfectly.",
        link: "https://paypal.eightfold.ai/careers?query=software%20engineer&location=Singapore",
        resume: "fintech",
      },
      {
        company: "Visa",
        title: "Software Engineer",
        location: "Singapore",
        fit: "Payments/fintech domain matches your GIC experience. 200+ SWE roles in Singapore.",
        link: "https://corporate.visa.com/en/jobs/?q=software+engineer&location=Singapore",
        resume: "fintech",
      },
    ],
  },
  {
    group: "Tech Companies (Southeast Asia)",
    color: "#C084FC",
    border: "#7C3AED",
    roles: [
      {
        company: "Databricks",
        title: "Software Engineer, Fullstack",
        location: "Singapore",
        fit: "3+ yrs exp building production systems in Python/Scala/Java. AI/ML platform work.",
        link: "https://www.databricks.com/company/careers?location=Singapore",
        resume: "bigtech",
      },
      {
        company: "Atlassian",
        title: "Engineering Roles",
        location: "Singapore",
        fit: "Language agnostic hiring. 50 roles in Singapore. Your full-stack React + Java is a direct match.",
        link: "https://www.atlassian.com/company/careers/all-jobs?location=Singapore&team=Engineering",
        resume: "bigtech",
      },
      {
        company: "Grab",
        title: "Software Engineer, Fullstack",
        location: "Singapore",
        fit: "Products for passengers, drivers, merchants. Golang, Redis, MySQL, ReactJS. Excellent match.",
        link: "https://www.grab.careers/en/search-jobs/?search=software+engineer&location=Singapore",
        resume: "bigtech",
      },
      {
        company: "Grab",
        title: "Software Engineer, Backend",
        location: "Singapore",
        fit: "Backend microservices on AWS. Your Spring Boot microservices experience translates well.",
        link: "https://www.grab.careers/en/search-jobs/?search=backend+engineer&location=Singapore",
        resume: "bigtech",
      },
      {
        company: "Shopee",
        title: "Backend Engineer",
        location: "Singapore",
        fit: "Financial systems (ShopeePay) and marketplace engineering. Full-stack and fintech exp is a strong fit.",
        link: "https://careers.shopee.sg/jobs?department_id=109&level=2",
        resume: "fintech",
      },
      {
        company: "Sea Group",
        title: "Software Engineering Roles",
        location: "Singapore",
        fit: "Parent of Shopee, Garena, SeaMoney. Frontend and backend roles across gaming, e-commerce, fintech.",
        link: "https://career.sea.com/",
        resume: "fintech",
      },
      {
        company: "Spotify",
        title: "Backend Engineer (various)",
        location: "Remote / Stockholm / London",
        fit: "Various specializations. Supports remote work — check for APAC-eligible roles.",
        link: "https://www.lifeatspotify.com/jobs?c=engineering&l=all",
        resume: "bigtech",
      },
    ],
  },
];

const RESUME_TAGS = {
  bigtech: { label: "Big Tech CV", color: "#6FA8FF", bg: "rgba(111,168,255,.12)", border: "rgba(111,168,255,.35)" },
  fintech: { label: "Fintech CV", color: "#5FD79E", bg: "rgba(95,215,158,.12)", border: "rgba(95,215,158,.35)" },
};

const TOTAL_ROLES = ROLE_GROUPS.reduce((s, g) => s + g.roles.length, 0);

export default function JobRoles({ onBack }) {
  const [expandedGroup, setExpandedGroup] = useState(0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #16243B 0%, #0B1422 60%, #070D16 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif",
      color: "#E8EDF4", padding: "0 0 80px 0",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
        .role-card { animation: fadeUp .35s ease both; }
        .role-card:hover { background: rgba(255,255,255,.04); }
        .group-btn:hover { transform: translateX(3px); }
        ::-webkit-scrollbar { width: 9px; }
        ::-webkit-scrollbar-track { background: #0B1422; }
        ::-webkit-scrollbar-thumb { background: #2A3C56; border-radius: 5px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #243650",
        background: "linear-gradient(180deg, rgba(20,33,54,.85), rgba(11,20,34,.6))",
        backdropFilter: "blur(6px)", padding: "34px 28px 26px",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <button onClick={onBack} style={{
            background: "rgba(111,168,255,.08)", border: "1px solid #2F66C4",
            color: "#9CC0F5", borderRadius: 20, padding: "5px 14px",
            fontSize: 12, cursor: "pointer", fontFamily: "system-ui",
            fontWeight: 600, marginBottom: 16,
          }}>← Back to Tracker</button>

          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase",
                color: "#7E9BC4", marginBottom: 8, fontFamily: "system-ui" }}>
                Curated for Your Profile
              </div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700,
                color: "#F4F8FE", lineHeight: 1.15 }}>
                Target Roles & Applications
              </h1>
            </div>
            <div style={{ textAlign: "right", fontFamily: "system-ui" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#6FA8FF",
                lineHeight: 1 }}>{TOTAL_ROLES}</div>
              <div style={{ fontSize: 12, color: "#7E9BC4", marginTop: 4 }}>
                roles across {ROLE_GROUPS.length} categories
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 920, margin: "26px auto 0", padding: "0 22px" }}>
        {/* Fit summary */}
        <div style={{
          padding: "16px 20px", marginBottom: 20,
          background: "linear-gradient(135deg,#13243F,#0E1B30)",
          border: "1px solid #243650", borderRadius: 14,
          fontSize: 13.5, lineHeight: 1.65, color: "#A9BCD8",
        }}>
          <strong style={{ color: "#9CC0F5" }}>Your profile:</strong>{" "}
          Full Stack SWE · GIC (fintech/trade systems, Spring Boot microservices) ·
          OST Technologies (IoT, React/NestJS) · Skilio (Angular/NestJS/Firebase) ·
          JS/TS, Java, Python · React, Angular, Vue, Next.js · Node.js, NestJS, Spring Boot ·
          PostgreSQL, MySQL, MongoDB
        </div>

        {ROLE_GROUPS.map((grp, gi) => {
          const isOpen = expandedGroup === gi;
          return (
            <div key={gi} style={{ marginBottom: 16 }}>
              <button className="group-btn" onClick={() =>
                setExpandedGroup(isOpen ? null : gi)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: isOpen
                    ? "linear-gradient(135deg,#1B3360,#15294A)"
                    : "linear-gradient(135deg,#152444,#111E36)",
                  border: `1px solid ${isOpen ? grp.border : "#23344E"}`,
                  borderRadius: 14, padding: "18px 22px", color: "#E8EDF4",
                  transition: "all .2s ease", display: "flex",
                  alignItems: "center", gap: 18,
                }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: grp.color,
                  fontFamily: "system-ui", minWidth: 28,
                }}>{grp.roles.length}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{grp.group}</div>
                  <div style={{ fontSize: 12.5, color: "#8AA1C2",
                    marginTop: 3, fontFamily: "system-ui" }}>
                    {grp.roles.length} roles · {[...new Set(grp.roles.map(r => r.company))].join(", ")}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: grp.color,
                  transform: isOpen ? "rotate(90deg)" : "none",
                  transition: "transform .2s" }}>›</div>
              </button>

              {isOpen && (
                <div style={{ marginTop: 10, display: "flex",
                  flexDirection: "column", gap: 8 }}>
                  {grp.roles.map((role, ri) => (
                    <div key={ri} className="role-card" style={{
                      background: "linear-gradient(180deg,#101D33,#0C1626)",
                      border: "1px solid #1F2F47",
                      borderRadius: 13, padding: "16px 18px",
                      animationDelay: `${ri * 0.04}s`,
                    }}>
                      <div style={{ display: "flex", alignItems: "baseline",
                        gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 800,
                          fontFamily: "system-ui", color: grp.color,
                          letterSpacing: 1 }}>{role.company.toUpperCase()}</span>
                        <span style={{ fontSize: 16, fontWeight: 700,
                          color: "#EAF0F8" }}>{role.title}</span>
                        <span style={{ marginLeft: "auto", display: "flex", gap: 6,
                          alignItems: "center", flexShrink: 0 }}>
                          {role.resume && (() => {
                            const rt = RESUME_TAGS[role.resume];
                            return (
                              <span style={{ fontSize: 10.5, fontWeight: 700,
                                fontFamily: "system-ui", color: rt.color,
                                background: rt.bg, border: `1px solid ${rt.border}`,
                                borderRadius: 10, padding: "2px 10px",
                                whiteSpace: "nowrap", letterSpacing: 0.3 }}>
                                {rt.label}
                              </span>
                            );
                          })()}
                          <span style={{ fontSize: 11.5,
                            color: "#7E9BC4", fontFamily: "system-ui",
                            border: "1px solid #23344E", borderRadius: 10,
                            padding: "2px 10px", whiteSpace: "nowrap" }}>
                            {role.location}
                          </span>
                        </span>
                      </div>

                      <div style={{ fontSize: 13.5, color: "#8DA4C4",
                        lineHeight: 1.55, marginBottom: 10 }}>
                        {role.fit}
                      </div>

                      <a href={role.link} target="_blank" rel="noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 12.5, fontWeight: 600,
                          color: grp.color, textDecoration: "none",
                          background: `${grp.color}12`,
                          border: `1px solid ${grp.color}44`,
                          borderRadius: 8, padding: "6px 14px",
                          fontFamily: "system-ui",
                          transition: "background .15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${grp.color}22`}
                        onMouseLeave={e => e.currentTarget.style.background = `${grp.color}12`}
                      >
                        Apply / View Listing →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Recommendations */}
        <div style={{
          marginTop: 28, padding: "20px 24px",
          background: "linear-gradient(135deg,#13243F,#0E1B30)",
          border: "1px solid #243650", borderRadius: 14,
          fontSize: 14, lineHeight: 1.65, color: "#A9BCD8",
        }}>
          <strong style={{ color: "#5FD79E" }}>Top priority applications:</strong>
          <ol style={{ margin: "10px 0 0", paddingLeft: 22, color: "#C5D4E9" }}>
            <li><strong>Stripe</strong> — payments domain, 2+ yrs required, direct fintech match</li>
            <li><strong>Grab</strong> — Singapore HQ, ReactJS + backend microservices</li>
            <li><strong>Databricks</strong> — 3+ yrs required, high-growth AI/ML platform</li>
            <li><strong>Google (Payments)</strong> — 2 yrs required, fintech-adjacent</li>
            <li><strong>Meta</strong> — full stack React, Singapore office</li>
            <li><strong>TikTok (Transaction)</strong> — maps directly to GIC trade work</li>
            <li><strong>Goldman Sachs / JPMorgan</strong> — your GIC sovereign wealth fund experience is a rare differentiator</li>
          </ol>
        </div>

        <div style={{
          marginTop: 16, padding: "16px 24px",
          background: "linear-gradient(135deg,#13243F,#0E1B30)",
          border: "1px solid #243650", borderRadius: 14,
          fontSize: 13, lineHeight: 1.6, color: "#8DA4C4",
        }}>
          <strong style={{ color: "#FFB86C" }}>Note:</strong>{" "}
          Links point to each company's career search page filtered for Singapore SWE roles.
          Specific listings change frequently — use these as starting points and bookmark
          the ones that match. Apply to 10–12 in your first wave as the study plan recommends.
        </div>
      </div>
    </div>
  );
}
