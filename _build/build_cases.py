"""Generate the case study pages in work/.

Run from the repo root:  python3 _build/build_cases.py
Edit the CASES list below, then re-run. Pages are plain HTML, so small
text fixes can also be made directly in work/*.html (but re-running this
script overwrites them).
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "work"

FONTS = ("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500"
         "&family=Inter:wght@400;500;600&family=Instrument+Serif:ital@1&display=swap")


def P(t): return f"<p>{t}</p>\n"
def UL(items): return "<ul>\n" + "".join(f"  <li>{i}</li>\n" for i in items) + "</ul>\n"
def TODO(t): return f'<p class="todo">{t}</p>\n'
def INSIGHT(t): return f'<p class="insight">{t}</p>\n'
def IMG(slug, file, caption):
    return (f'<figure>\n  <img src="../images/{slug}/{file}" alt="{caption}" '
            f'onerror="this.outerHTML=\'<div class=ph>images/{slug}/{file}</div>\'">\n'
            f'  <figcaption>{caption}</figcaption>\n</figure>\n')

REFLECT = TODO("2 to 3 sentences: what you would do differently, and which question from this "
               "project you want to study in your Master's.")

CASES = [
  dict(
    slug="magik", short="Magik", theme="01 · Human-AI interaction",
    title="Magik: from dense dashboards to an AI agent workspace",
    summary="I led UX strategy and product design to turn Magik, a legacy Customer Value Management platform used by telecom operators, into an agentic AI marketing automation product.",
    facts=[("Role", "Product Designer, UX lead"), ("Timeline", "Mar 2025 to present"),
           ("Clients", "Etisalat, MTN Ghana, BICS, Smart"),
           ("Team", "PMs, data scientists, engineering leads")],
    result=("30%", "faster campaign setup and launch"),
    mosaic=[("workspace.jpg", "AI agent workspace"), ("mobile.jpg", "Campaign review on a smaller screen"),
            ("before.jpg", "The legacy dashboard"), ("recommendation.jpg", "A natural-language recommendation"),
            ("guardrails.jpg", "Low-code guardrails"), ("design-system.jpg", "Design system components")],
    chapters=[
      ("Context", P("Magik helped telecom marketing teams plan and run customer campaigns. It was built around dense dashboards and competed with enterprise tools such as Adobe Experience Manager. Marketers had plenty of data, but turning it into a campaign decision was slow.")
                  + TODO("A concrete example of the old workflow: how many screens or steps it took to launch one campaign.")),
      ("Research", P("I combined user research, product analytics and a competitive analysis of enterprise marketing platforms.")
                   + TODO("Number and type of users you spoke to, and your top 3 findings.")),
      ("Insight", INSIGHT("Marketers needed clear decisions, not more data.")
                  + P("The question became: how might we hand marketers a clear, explainable decision they can act on, while keeping them in control?")),
      ("Design", P("I designed a <strong>Decision-First UX framework</strong> that replaced dense dashboards with natural-language AI recommendations, and an <strong>AI agent workspace</strong> where marketers review, edit and launch multi-channel campaigns.")
                 + UL(["<strong>Recommendation first.</strong> The AI's suggestion and its reasoning lead; supporting data sits one level down.",
                       "<strong>Human in the loop.</strong> Every agent action can be reviewed and edited before launch.",
                       "<strong>Visual guardrails.</strong> Marketers set limits in a low-code editor, so the agent cannot act outside them."])
                 + IMG("magik", "before-after.jpg", "Before: a dense dashboard. After: a decision the marketer can act on.")
                 + P("To keep this consistent across modules, I built and scaled a design system in Figma with design tokens and reusable component libraries, which reduced friction in design-to-development handoff.")),
      ("Testing", P("These workflows are high-stakes, so I validated them with product analytics, user feedback loops and usability testing before rollout.")
                  + TODO("One change you made because of testing, with before and after.")),
      ("Outcome", UL(["30% reduction in campaign setup and launch time.",
                      "Moved Magik from a legacy CVM tool to an agentic AI product competing with enterprise marketing suites."])),
      ("Reflection", REFLECT),
    ]),
  dict(
    slug="zeeproc", short="zeeproc", theme="01 · Human-AI interaction",
    title="From forms to conversation: rethinking SaaS onboarding",
    summary="I replaced a form-heavy setup with a conversational, chat-based onboarding flow for zeeproc's Customer Success Management product.",
    facts=[("Role", "Product Designer (Contract)"), ("Timeline", "Dec 2024 to Feb 2025"),
           ("Company", "zeeproc"), ("Platform", "Web, B2B SaaS")],
    result=("+25%", "onboarding completion"),
    mosaic=[("chat-onboarding.jpg", "Chat-based onboarding"), ("chat-mobile.jpg", "Onboarding chat on mobile"),
            ("form-before.jpg", "The old form-heavy setup"), ("dashboard.jpg", "AI-powered analytics dashboard"),
            ("data-viz.jpg", "Real-time data visualisation"), ("components.jpg", "Chat UI components")],
    chapters=[
      ("Context", P("New customers had to complete a form-heavy setup before they could start using the product, and too few completed it.")
                  + TODO("Where in the old form people dropped off.")),
      ("Research", P("I planned and ran usability testing to validate design hypotheses and drive iterative improvements.")
                   + TODO("Number of participants and the key findings.")),
      ("Insight", TODO("Your core insight in one sentence, for example why a conversation suited this setup better than a form.")),
      ("Design", P("I designed a chat-based onboarding flow that asks one question at a time, and AI-powered analytics dashboards with real-time data visualisation for the wider product.")
                 + IMG("zeeproc", "form-vs-chat.jpg", "Form versus conversation.")),
      ("Testing", TODO("One iteration that testing triggered.")
                  + P("I also mentored junior designers on UI consistency, visual hierarchy and responsive patterns.")),
      ("Outcome", UL(["25% increase in onboarding completion."])),
      ("Reflection", REFLECT),
    ]),
  dict(
    slug="msi", short="My Site Inspection", theme="02 · Designing for context",
    title="My Site Inspection: designed with field teams, on site",
    summary="I redesigned the My Site Inspection (MSI) mobile app for field teams, using on-site usability testing to reduce the effort of every inspection.",
    facts=[("Role", "Product Designer, research owner"), ("Timeline", "2024"),
           ("Company", "RIU (Reporting Intelligence Unit)"), ("Platform", "Mobile app")],
    result=("35%", "fewer task steps and less physical effort"),
    mosaic=[("app-flow.jpg", "Redesigned inspection flow"), ("app-screen.jpg", "Key inspection screen"),
            ("field.jpg", "Testing on site"), ("checklist.jpg", "Inspection checklist"),
            ("before.jpg", "The old app"), ("report.jpg", "Inspection report")],
    chapters=[
      ("Context", P("Field teams use MSI to record site inspections while they are on site and on their feet. Every extra step costs time and physical effort.")
                  + TODO("Who the inspectors are, and what made the old app hard to use on site.")),
      ("Research", P("I owned research end to end: stakeholder workshops, user interviews and on-site field usability testing with the people doing the inspections.")
                   + TODO("How many sessions, where, and the most surprising thing you saw in the field.")
                   + IMG("msi", "field-research.jpg", "Testing where the work actually happens (blur faces and site names).")),
      ("Insight", TODO("Your core insight in one sentence.")),
      ("Design", TODO("Key design decisions, such as merged steps, larger touch targets or one-handed use, and why.")
                 + IMG("msi", "flow-before-after.jpg", "The inspection flow, before and after.")),
      ("Testing", TODO("What you tested with field teams after the redesign, and what changed.")),
      ("Outcome", UL(["35% reduction in task steps and physical effort for field teams."])),
      ("Reflection", REFLECT),
    ]),
  dict(
    slug="riu", short="RIU.ai", theme="03 · Making complex data clear",
    title="RIU.ai: making ESG compliance reporting readable",
    summary="I led 0-to-1 product design for RIU.ai, an enterprise ESG and regulatory compliance reporting platform, using progressive disclosure to simplify complex data.",
    facts=[("Role", "Product Designer, 0-to-1 lead"), ("Timeline", "Jan to Dec 2024"),
           ("Company", "RIU (Reporting Intelligence Unit)"), ("Platform", "Web, enterprise SaaS")],
    result=("+40%", "user satisfaction"),
    mosaic=[("dashboard.jpg", "Customisable analytics dashboard"), ("detail.jpg", "Drill-down detail"),
            ("navigation.jpg", "Primary navigation"), ("report.jpg", "Compliance report view"),
            ("ia.jpg", "Information architecture"), ("components.jpg", "Data components")],
    chapters=[
      ("Context", P("ESG and regulatory compliance reporting involves large amounts of complex data. Users had to find their way through it to produce accurate reports.")
                  + TODO("What users struggled with most before the redesign.")),
      ("Research", P("I ran stakeholder workshops and user interviews, and studied interaction analytics to see how people actually moved through the product.")
                   + TODO("Top 3 findings.")),
      ("Insight", TODO("Your core insight in one sentence.")),
      ("Design", P("I redesigned the information architecture, the primary navigation and a customisable analytics dashboard. Progressive disclosure shows the summary first and lets people drill into detail only when they need it.")
                 + IMG("riu", "ia-before-after.jpg", "Information architecture, before and after.")
                 + IMG("riu", "progressive-disclosure.jpg", "Summary first, detail on demand.")),
      ("Testing", TODO("How you validated the new IA and dashboard.")),
      ("Outcome", UL(["40% improvement in user satisfaction.", "Took the platform from 0 to 1."])
                  + TODO("How satisfaction was measured.")),
      ("Reflection", REFLECT),
    ]),
]

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{short} · Usha Tapal</title>
  <meta name="description" content="{summary}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{fonts}" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/site.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-head">
    <div class="wrap">
      <a class="brand" href="../index.html">Usha Tapal</a>
      <nav aria-label="Main">
        <ul class="nav">
          <li><a href="../index.html#work">Work</a></li>
          <li><a href="../index.html#interests">Research</a></li>
          <li><a href="../index.html#about">About</a></li>
          <li><a href="../index.html#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main">
    <section class="mosaic-hero" aria-label="Project images">
      <div class="wrap">
        <!-- Add images to images/{slug}/ with these file names. -->
        <div class="mosaic">
{tiles}        </div>
      </div>
    </section>

    <div class="wrap">
      <header class="cs-head">
        <a class="back" href="../index.html#work">&larr; All work</a>
        <p class="eyebrow" style="margin-top:32px">{theme}</p>
        <h1>{title}</h1>
        <p class="lead">{summary}</p>
        <dl class="facts">
{facts}
          <div class="result"><dt>Result</dt><dd>{r0}<small>{r1}</small></dd></div>
        </dl>
      </header>

      <div class="cs-body">
{chapters}      </div>

      <nav class="next" aria-label="Case studies">
        <a href="{prev_slug}.html"><small>&larr; Previous</small><strong>{prev_short}</strong></a>
        <a href="{next_slug}.html" style="text-align:right"><small>Next &rarr;</small><strong>{next_short}</strong></a>
      </nav>
    </div>
  </main>

  <footer class="site-foot">
    <div class="wrap"><span>© 2026 Usha Tapal</span><a href="mailto:usha.tapal@gmail.com">usha.tapal@gmail.com</a></div>
  </footer>
</body>
</html>
"""


def indent(html, n):
    pad = " " * n
    return "".join(pad + line + "\n" if line else "\n" for line in html.rstrip("\n").split("\n"))


def build(c, prev, nxt):
    tiles = "".join(
        f'          <figure class="tile m{i}">\n'
        f'            <img src="../images/{c["slug"]}/{f}" alt="{alt}" onerror="this.remove()">\n'
        f'            <span class="ph-label">images/{c["slug"]}/{f}</span>\n'
        f'            <figcaption class="chip">{alt}</figcaption>\n'
        f'          </figure>\n'
        for i, (f, alt) in enumerate(c["mosaic"], 1))
    facts = "\n".join(f"          <div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in c["facts"])
    chapters = "".join(
        f'        <section class="chapter">\n'
        f'          <h2><span class="n">{i:02d}</span>{name}</h2>\n'
        f'          <div class="text">\n{indent(body, 12)}          </div>\n'
        f'        </section>\n'
        for i, (name, body) in enumerate(c["chapters"], 1))
    return PAGE.format(fonts=FONTS, tiles=tiles, facts=facts, chapters=chapters,
                       r0=c["result"][0], r1=c["result"][1],
                       prev_slug=prev["slug"], prev_short=prev["short"],
                       next_slug=nxt["slug"], next_short=nxt["short"],
                       **{k: c[k] for k in ("short", "summary", "slug", "theme", "title")})


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for i, c in enumerate(CASES):
        page = build(c, CASES[i - 1], CASES[(i + 1) % len(CASES)])
        (OUT / f"{c['slug']}.html").write_text(page)
        print("wrote", f"work/{c['slug']}.html")
