import { useState, useRef, useEffect } from "react";
import logoIcon from "./assets/Untitled 1.png";
import logoText from "./assets/Untitled 2.png";
import humanFigure from "./assets/Untitled design (10) 1.png";
import bloodTestImg from "./assets/Screenshot (596).png";
import geneticTestImg from "./assets/genetic-screenshot.png";
import gutImg from "./assets/Gut score dashboard.png";
import nutritionImg from "./assets/WhatsApp Image 2026-05-01 at 6.14.50 PM.jpeg";
import cellHealthImg from "./assets/WhatsApp Image 2026-05-01 at 6.07.28 PM.jpeg";
import { Footer as SharedFooter } from "../../shared/components/Footer";
import { trackGa4CustomEvent } from "../bloodtest/utils/ga4CustomEvents";

/* ─── Design tokens ─── */
const C = {
  navy: "#101129", navy2: "#2a2c5b",
  purple: "#8B5CF6", purpleLight: "#e7e1ff", purpleMid: "#f3f0ff", purpleFade: "#a78bfa",
  teal: "#41C9B3",
  black: "#161616", darkGray: "#414141", gray: "#828282",
  offWhite: "#f9f9fb", white: "#ffffff",
};

/* ─── Responsive hook ─── */
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, w };
}

/* ═══════════════════════════════════════
   NAVBAR
═══════════════════════════════════════ */
function Navbar() {
  const { isMobile, isTablet } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesk = !isMobile && !isTablet;

  const links = [
    { label: "Blood Tests", href: "/blood-test" },
    { label: "Genetic Tests", href: "/genetic-tests" },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      width: "100%", background: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${C.purpleLight}`,
      boxShadow: "0 2px 20px rgba(139,92,246,0.06)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "0 16px" : "0 32px",
        height: isMobile ? 56 : 66,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16,
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <img
            src={logoIcon}
            alt="Nucleotide logo icon"
            style={{ height: isMobile ? 26 : 32, width: "auto", display: "block" }}
          />
          <img
            src={logoText}
            alt="Nucleotide"
            style={{ height: isMobile ? 16 : 20, width: "auto", display: "block" }}
          />
        </div>

        {/* Desktop nav links */}
        {isDesk && (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {links.map(link => (
              <a key={link.href} href={link.href} style={{
                background: "transparent", border: "1px solid transparent",
                borderRadius: 100, padding: "6px 16px",
                fontFamily: "'Poppins', sans-serif", fontSize: 13.5, fontWeight: 500,
                color: C.darkGray, textDecoration: "none",
                cursor: "pointer", transition: "all 0.16s", display: "inline-block",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.purpleMid; e.currentTarget.style.borderColor = C.purpleLight; e.currentTarget.style.color = C.purple; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = C.darkGray; }}
              >{link.label}</a>
            ))}
          </div>
        )}

        {/* Mobile hamburger */}
        {!isDesk && (
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: "transparent", border: `1px solid ${C.purpleLight}`,
            borderRadius: 8, padding: "7px 10px", cursor: "pointer",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 18, height: 1.5, background: C.navy, borderRadius: 1 }}/>)}
          </button>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {!isDesk && menuOpen && (
        <div style={{
          background: C.white,
          borderTop: `1px solid ${C.purpleLight}`,
          padding: "12px 16px 16px",
        }}>
          {links.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              display: "block", padding: "11px 14px", marginBottom: 4,
              fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500,
              color: C.darkGray, textDecoration: "none", borderRadius: 10,
              border: "1px solid transparent",
            }}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════
   DIGITAL HUMAN SECTION — "What makes us different"
═══════════════════════════════════════ */
const LEFT_PILLS = [
  "Built around your unique biology",
  "Connected ecosystem",
  "Accurate and science-backed insights",
];
const RIGHT_PILLS = [
  "Built around your unique biology",
  "Actionable recommendations",
  "Secure and private health data",
];

function HumanFigurePlaceholder() {
  return (
    <img
      src={humanFigure}
      alt="Digital human figure"
      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
    />
  );
}

function FloatingPill({ text, fontSize = 15 }) {
  return (
    <div style={{
      background: C.white,
      border: "1px solid rgba(139,92,246,0.15)",
      borderRadius: 110,
      padding: "10px 22px",
      display: "inline-flex", alignItems: "center",
      boxShadow: "0 4px 24px rgba(139,92,246,0.1)",
    }}>
      <span style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize, fontWeight: 500,
        color: C.navy, whiteSpace: "nowrap",
      }}>
        {text}
      </span>
    </div>
  );
}

function DigitalHumanSection() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  return (
    <section style={{
      background: "linear-gradient(to top, #e7e1ff 0%, #ffffff 82%)",
      padding: isMobile ? "48px 0 56px" : isTablet ? "60px 0 72px" : "72px 0 88px",
      overflow: "hidden",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px" : "0 32px" }}>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: isMobile ? "clamp(22px, 7vw, 30px)" : isTablet ? "clamp(26px, 4vw, 34px)" : "clamp(30px, 3.5vw, 42px)",
          fontWeight: 500, color: C.navy,
          textAlign: "center", letterSpacing: "-0.03em",
          lineHeight: 1.2, marginBottom: isMobile ? 32 : isTablet ? 44 : 60,
        }}>
          What makes us different
        </h2>

        {/* ── Desktop layout ── */}
        {isDesktop && (
          <div style={{ position: "relative", height: 520 }}>
            {/* Human figure — center */}
            <div style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              top: 0, bottom: 0, width: 320,
            }}>
              <HumanFigurePlaceholder/>
            </div>

            {/* Left pills */}
            <div style={{ position: "absolute", left: 10, top: "12%", maxWidth: 340 }}>
              <FloatingPill text={LEFT_PILLS[0]}/>
            </div>
            <div style={{ position: "absolute", left: 0, top: "40%", maxWidth: 300 }}>
              <FloatingPill text={LEFT_PILLS[1]}/>
            </div>
            <div style={{ position: "absolute", left: 8, top: "67%", maxWidth: 360 }}>
              <FloatingPill text={LEFT_PILLS[2]}/>
            </div>

            {/* Right pills */}
            <div style={{ position: "absolute", right: 10, top: "18%", maxWidth: 340 }}>
              <FloatingPill text={RIGHT_PILLS[0]}/>
            </div>
            <div style={{ position: "absolute", right: 0, top: "44%", maxWidth: 320 }}>
              <FloatingPill text={RIGHT_PILLS[1]}/>
            </div>
            <div style={{ position: "absolute", right: 8, top: "70%", maxWidth: 340 }}>
              <FloatingPill text={RIGHT_PILLS[2]}/>
            </div>
          </div>
        )}

        {/* ── Tablet layout ── */}
        {isTablet && (
          <div style={{ position: "relative", height: 400 }}>
            {/* Human figure — center */}
            <div style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              top: 0, bottom: 0, width: 190,
              borderRadius: 16, overflow: "hidden",
            }}>
              <HumanFigurePlaceholder/>
            </div>

            {/* Left pills */}
            {LEFT_PILLS.map((text, i) => (
              <div key={i} style={{
                position: "absolute",
                left: i === 1 ? 0 : 8,
                top: ["10%", "38%", "65%"][i],
              }}>
                <div style={{
                  background: C.white, border: "1px solid rgba(139,92,246,0.15)",
                  borderRadius: 110, padding: "8px 16px",
                  display: "inline-flex", alignItems: "center",
                  boxShadow: "0 4px 16px rgba(139,92,246,0.1)", maxWidth: 220,
                }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: C.navy, lineHeight: 1.4 }}>{text}</span>
                </div>
              </div>
            ))}

            {/* Right pills */}
            {RIGHT_PILLS.map((text, i) => (
              <div key={i} style={{
                position: "absolute",
                right: i === 1 ? 0 : 6,
                top: ["15%", "42%", "68%"][i],
              }}>
                <div style={{
                  background: C.white, border: "1px solid rgba(139,92,246,0.15)",
                  borderRadius: 110, padding: "8px 16px",
                  display: "inline-flex", alignItems: "center",
                  boxShadow: "0 4px 16px rgba(139,92,246,0.1)", maxWidth: 220,
                }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: C.navy, lineHeight: 1.4 }}>{text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Mobile layout ── */}
        {isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
            {/* Human figure */}
            <div style={{ width: "80%", maxWidth: 240, height: 300, borderRadius: 20, overflow: "hidden" }}>
              <HumanFigurePlaceholder/>
            </div>

            {/* Pills — 2-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
              {[...LEFT_PILLS, ...RIGHT_PILLS].map((text, i) => (
                <div key={i} style={{
                  background: C.white,
                  border: `1px solid ${C.purpleLight}`,
                  borderRadius: 14, padding: "10px 12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(139,92,246,0.08)",
                  textAlign: "center",
                }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 500, color: C.navy, lineHeight: 1.45 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   TAB DATA
   exploreHref: where "Login to Explore" navigates
═══════════════════════════════════════ */
const TABS = [
  {
    id: "genetic",
    label: "Genetic testing",
    title: "Genetic testing",
    description:
      "Understand your body at a deeper level through DNA insights. Nucleotide helps you decode your genetics into simple, actionable health guidance.",
    discoverLabel: "What you'll discover:",
    bullets: [
      "Disease risk and prevention insights",
      "Nutrition and vitamin needs",
      "Fitness and lifestyle traits",
      "Drug response and compatibility",
    ],
    exploreHref: "/genetic-tests",
    comingSoon: false,
    image: geneticTestImg,
  },
  {
    id: "lab",
    label: "Blood Testing",
    title: "Blood Testing",
    description:
      "Get a comprehensive view of your blood health with advanced biomarker analysis. Track trends over time and receive actionable insights tailored to your body.",
    discoverLabel: "What you'll discover:",
    bullets: [
      "Complete blood count and metabolic panels",
      "Hormone and thyroid markers",
      "Vitamin, mineral and iron levels",
      "Inflammation and immune markers",
    ],
    exploreHref: "/blood-test",
    comingSoon: false,
    image: bloodTestImg,
  },
  {
  id: "gut",
  label: "Gut",
  title: "Gut",
  description:
    "Understand and improve your gut health with personalized tracking and insights. Log daily habits, get a clear view of how your lifestyle impacts your gut.",
  discoverLabel: "What you'll discover:",
  bullets: [
    "Daily stool logging with type and symptom tracking",
    "Gut health score with trends over time",
    "Lifestyle impact from water, sleep, and fibre intake",
    "Smart insights and personalized recommendations",
  ],
    exploreHref: null,
    comingSoon: false,
    image: gutImg,
  },
  {
    id: "nutrition",
    label: "Nutrition",
    title: "Nutrition",
    description: "Food guidance built on your DNA and biomarkers — not generic advice. Understand what your body actually needs based on how it's wired and how it's performing.",
    discoverLabel: "What you'll discover:",
    bullets: [
      "Personalised deficiency detection",
      "Supplement and diet recommendations",
      "Linked to your genetic and blood data",
      "Macronutrient and micronutrient insights",
    ],
    exploreHref: null,
    comingSoon: false,
    image: nutritionImg,
  },
  {
    id: "cell-health",
    label: "Cell Health",
    title: "Cell Health",
    description: "Monitor your cellular health through advanced biomarker analysis. Track inflammation, oxidative stress, and metabolic markers to understand how your cells are ageing and performing.",
    discoverLabel: "What you'll discover:",
    bullets: [
      "Inflammation and oxidative stress markers",
      "Metabolic and mitochondrial health",
      "Cellular ageing insights",
      "Linked to your Digital Health Twin",
    ],
    exploreHref: null,
    comingSoon: false,
    image: cellHealthImg,
  },
];

/* ─── Image placeholder ─── */
function ImgPlaceholder({ label }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(135deg, ${C.purpleMid} 0%, ${C.purpleLight} 60%, #ddd6fe 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 10,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navy2} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: 0.7,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke={C.teal} strokeWidth="1.6"/>
          <circle cx="12" cy="10" r="3" stroke={C.purple} strokeWidth="1.4"/>
          <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={C.purple} strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{
        fontFamily: "'Poppins', sans-serif", fontSize: 12,
        color: C.purple, opacity: 0.6, textAlign: "center", maxWidth: 180,
      }}>
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════
   NUCLEOTIDE BRINGS TOGETHER — main section
═══════════════════════════════════════ */
function NucleotideBringsTogether() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [activeTab, setActiveTab] = useState(0);
  const tabBarRef = useRef(null);

  const tab = TABS[activeTab];
  const goTo = (idx) => {
    const next = Math.max(0, Math.min(TABS.length - 1, idx));
    trackGa4CustomEvent("home_tab_change", { linkText: TABS[next]?.label });
    setActiveTab(next);
  };

  /* scroll active tab into view on mobile */
  useEffect(() => {
    if (tabBarRef.current) {
      const btn = tabBarRef.current.children[activeTab];
      if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const px = isMobile ? "16px" : "32px";
  const py = isMobile ? "40px" : "72px";

  return (
    <section style={{ background: C.white, padding: `${py} 0`, minHeight: "calc(100vh - 66px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: `0 ${px}` }}>

        {/* ── Heading ── */}
        <h2 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: isMobile ? "clamp(24px, 8vw, 34px)" : isTablet ? "clamp(28px, 5vw, 40px)" : 48,
          fontWeight: 500, color: C.navy,
          textAlign: "center", letterSpacing: "-0.03em",
          lineHeight: 1.27, marginBottom: isMobile ? 28 : isTablet ? 32 : 40,
        }}>
          Nucleotide Brings Together
        </h2>

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: isMobile ? 20 : 24 }}>
          <div
            ref={tabBarRef}
            style={{
              display: "flex", gap: isMobile ? 8 : isTablet ? 10 : 16,
              alignItems: "center",
              background: C.white,
              boxShadow: "0 4px 78px rgba(136,107,249,0.23)",
              borderRadius: 233,
              padding: isMobile ? "8px" : "13px",
              overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none",
              maxWidth: "100%",
            }}
          >
            {TABS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => {
                  trackGa4CustomEvent("home_tab_change", { linkText: t.label });
                  setActiveTab(i);
                }}
                style={{
                  flexShrink: 0,
                  background: i === activeTab ? C.navy : C.white,
                  color: i === activeTab ? C.white : C.navy,
                  border: i === activeTab ? `1px solid ${C.purpleLight}` : "1px solid transparent",
                  borderRadius: 58,
                  height: isMobile ? 38 : 50,
                  padding: isMobile ? "0 14px" : isTablet ? "0 18px" : "0 27px",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: isMobile ? 12 : isTablet ? 14 : 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: i === activeTab ? "0 4px 78px rgba(136,107,249,0.23)" : "none",
                  transition: "all 0.22s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content card ── */}
        <div style={{
          background: C.white,
          borderRadius: isMobile ? 16 : 20,
          overflow: "hidden",
          border: `1px solid ${C.purpleLight}`,
          boxShadow: "0 4px 40px rgba(139,92,246,0.08)",
          minHeight: isMobile ? 300 : isTablet ? 420 : 536,
        }}>

          {/* Coming Soon state */}
          {tab.comingSoon ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: isMobile ? 280 : isTablet ? 420 : 536,
            }}>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: isMobile ? 40 : isTablet ? 72 : "clamp(64px, 8vw, 136px)",
                fontWeight: 500, color: C.purple, opacity: 0.38,
                letterSpacing: "-0.045em", textAlign: "center",
              }}>
                Coming Soon!
              </span>
            </div>
          ) : (

            /* Active tab content */
            <div style={{
              display: "flex",
              flexDirection: isMobile || isTablet ? "column" : "row",
              alignItems: isDesktop ? "center" : "flex-start",
              gap: isMobile ? 20 : isTablet ? 28 : 0,
              padding: isMobile
                ? "28px 20px 24px"
                : isTablet
                  ? "36px 28px"
                  : "27px 0 27px 55px",
              minHeight: isMobile ? "auto" : isTablet ? 420 : 536,
            }}>

              {/* Left: text */}
              <div style={{
                flex: isDesktop ? "0 0 500px" : "none",
                width: isMobile || isTablet ? "100%" : 500,
                display: "flex", flexDirection: "column",
                gap: isMobile ? 18 : 24,
              }}>

                {/* Title + description */}
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 20 }}>
                  <h3 style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: isMobile ? 22 : isTablet ? 26 : 32,
                    fontWeight: 500, color: C.navy,
                    letterSpacing: "-0.02em", lineHeight: 1.03,
                  }}>
                    {tab.title}
                  </h3>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: isMobile ? 14 : isTablet ? 16 : 18,
                    color: C.gray, lineHeight: 1.65, fontWeight: 400,
                  }}>
                    {tab.description}
                  </p>
                </div>

                {/* Bullets */}
                {tab.bullets.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: isMobile ? 15 : isTablet ? 18 : 20,
                      fontWeight: 500, color: C.navy, letterSpacing: "-0.02em",
                    }}>
                      {tab.discoverLabel}
                    </p>
                    <ul style={{ listStyle: "disc", paddingLeft: 24, display: "flex", flexDirection: "column", gap: 5 }}>
                      {tab.bullets.map((b, i) => (
                        <li key={i} style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: isMobile ? 13 : isTablet ? 15 : 17,
                          color: C.gray, lineHeight: 1.6,
                        }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Login to Explore button */}
                {tab.exploreHref && (
                  <a
                    href={tab.exploreHref}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: C.purple, color: C.white,
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: isMobile ? 14 : isTablet ? 16 : 18,
                      fontWeight: 500,
                      padding: isMobile ? "12px 24px" : "0 34px",
                      height: isMobile ? "auto" : 58,
                      borderRadius: 8, textDecoration: "none",
                      width: "fit-content", cursor: "pointer",
                      boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                      transition: "opacity 0.18s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    onClick={() => {
                      if (tab.title === "Genetic testing") {
                        trackGa4CustomEvent("genetic_login_explore", { linkText: "Login to Explore" });
                      } else if (tab.title === "Blood Testing") {
                        trackGa4CustomEvent("blood_login_explore", { linkText: "Login to Explore" });
                      }
                    }}
                  >
                    Login to Explore
                  </a>
                )}
              </div>

              {/* Right: product screenshot placeholder */}
              {isMobile ? (
                <div style={{
                  width: "100%", height: 220,
                  borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 4px 40px rgba(136,107,249,0.2)",
                }}>
                  {tab.image
                    ? <img src={tab.image} alt={tab.title} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: "12px" }}/>
                    : <ImgPlaceholder label={`${tab.title} — Product Screenshot`}/>
                  }
                </div>
              ) : isTablet ? (
                <div style={{
                  width: "100%", height: 320,
                  borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 4px 78px rgba(136,107,249,0.2)",
                }}>
                  {tab.image
                    ? <img src={tab.image} alt={tab.title} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: "12px" }}/>
                    : <ImgPlaceholder label={`${tab.title} — Product Screenshot`}/>
                  }
                </div>
              ) : (
                <div style={{
                  flex: 1, height: 482,
                  borderRadius: 20, overflow: "hidden",
                  boxShadow: "0 4px 156px rgba(136,107,249,0.23)",
                  margin: "0 24px",
                }}>
                  {tab.image
                    ? <img src={tab.image} alt={tab.title} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: "12px" }}/>
                    : <ImgPlaceholder label={`${tab.title} — Product Screenshot`}/>
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Navigation arrows ── */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: isMobile ? 24 : 36 }}>
          {/* Prev */}
          <button
            onClick={() => goTo(activeTab - 1)}
            disabled={activeTab === 0}
            style={{
              width: isMobile ? 48 : 58, height: isMobile ? 48 : 58,
              borderRadius: "50%",
              background: activeTab === 0 ? `rgba(139,92,246,0.28)` : C.purple,
              border: "none",
              cursor: activeTab === 0 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: activeTab === 0 ? "none" : "0 4px 20px rgba(139,92,246,0.3)",
              transition: "all 0.2s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 5l-5 5 5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={() => goTo(activeTab + 1)}
            disabled={activeTab === TABS.length - 1}
            style={{
              width: isMobile ? 48 : 58, height: isMobile ? 48 : 58,
              borderRadius: "50%",
              background: activeTab === TABS.length - 1 ? `rgba(139,92,246,0.28)` : C.purple,
              border: "none",
              cursor: activeTab === TABS.length - 1 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: activeTab === TABS.length - 1 ? "none" : "0 4px 20px rgba(139,92,246,0.3)",
              transition: "all 0.2s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 5l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* ── Dot indicators ── */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          {TABS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                trackGa4CustomEvent("home_tab_change", { linkText: TABS[i]?.label });
                setActiveTab(i);
              }}
              style={{
                width: i === activeTab ? 22 : 8,
                height: 8, borderRadius: 4,
                background: i === activeTab ? C.purple : C.purpleLight,
                border: "none", cursor: "pointer",
                padding: 0, transition: "all 0.22s",
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   FOOTER
═══════════════════════════════════════ */
const FOOTER_COLUMNS = [
  {
    heading: 'Privacy & Legal',
    links: [
      { text: 'Privacy Policy', url: '/privacy-policy' },
      { text: 'Terms and Conditions', url: '/terms' },
      { text: 'Refund and Cancellation', url: '/refund-policy' },
    ],
  },
  {
    heading: 'Quick Links',
    links: [
      { text: 'About Us', url: '#' }
      
    ],
  },
  {
    heading: 'Support',
    links: [
      { text: 'Contact Us', url: '/contact-us' },
    ],
  },
];

function Footer() {
  const { isMobile } = useBreakpoint();
  const [email, setEmail] = useState('');

  const iconStyle = {
    width: 34, height: 34, borderRadius: '50%',
    background: '#1F2340',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none',
    transition: 'background 0.2s',
  };

  return (
    <footer style={{ background: '#101129', fontFamily: "'Poppins', sans-serif" }}>
      {/* Main section */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '48px 20px 32px' : '64px 32px 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr 1fr',
        gap: isMobile ? 40 : 48,
      }}>
        {/* Brand col */}
        <div>
          {/* Logo */}
          <div style={{ marginBottom: 16 }}>
            <img src={footerLogo} alt="Nucleotide" style={{ width: 140, height: 'auto', objectFit: 'contain' }} />
          </div>
          
          {/* Tagline */}
          <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.7, margin: '0 0 24px' }}>
            Building your digital health twin by combining genetics, biomarkers, lifestyle, nutrition, and more to deliver personalized health insights.
          </p>
          
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 14 }}>
            {/* Facebook */}
            <a href="https://www.facebook.com/nucleotidehealthcare" aria-label="Facebook" style={iconStyle}
               onMouseEnter={e => e.currentTarget.style.background = '#2a2c5b'}
               onMouseLeave={e => e.currentTarget.style.background = '#1F2340'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            
            {/* Instagram */}
            <a href="https://www.instagram.com/nucleotidehealthcare" aria-label="Instagram" style={iconStyle}
               onMouseEnter={e => e.currentTarget.style.background = '#2a2c5b'}
               onMouseLeave={e => e.currentTarget.style.background = '#1F2340'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/company/nucleotidehealthcare" aria-label="LinkedIn" style={iconStyle}
               onMouseEnter={e => e.currentTarget.style.background = '#2a2c5b'}
               onMouseLeave={e => e.currentTarget.style.background = '#1F2340'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            
            {/* YouTube */}
            <a href="https://youtube.com/@nucleotidehealthcare?si=9KYpX0d3Mp7Hlh8_" aria-label="YouTube" style={iconStyle}
               onMouseEnter={e => e.currentTarget.style.background = '#2a2c5b'}
               onMouseLeave={e => e.currentTarget.style.background = '#1F2340'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#101129"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLUMNS.map(col => (
          <div key={col.heading}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
              {col.heading}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {col.links.map(link => (
                <a
                  key={link.text}
                  href={link.url}
                  style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid #1F2340',
        padding: isMobile ? '24px 20px' : '28px 32px',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>
          © 2026 Nucleotide. All rights reserved.
        </span>

        {/* Email subscribe */}
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              flex: isMobile ? 1 : 'none',
              width: isMobile ? 'auto' : 220,
              padding: '10px 14px',
              background: '#1F2340',
              border: '1px solid #2a2c5b',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              outline: 'none',
            }}
            aria-label="Email for newsletter"
          />
          <button
            type="button"
            style={{
              padding: '10px 20px',
              background: C.purple,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              cursor: 'pointer',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#7c4ee4'}
            onMouseLeave={e => e.currentTarget.style.background = C.purple}
          >
            Subscribe
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   PAGE ROOT
═══════════════════════════════════════ */
export default function NucleotidePage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Inter:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; background: #fff; }
        ::-webkit-scrollbar { display: none; }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      <div style={{ minHeight: "100vh", background: C.white }}>
        <Navbar />
        <NucleotideBringsTogether />
        <DigitalHumanSection />
        <SharedFooter />
      </div>
    </>
  );
}
