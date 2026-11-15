"""
ResearchPilot AI - PDF Report Generator
Generates publication-grade research dossiers using ReportLab.
Includes executive briefings, findings, metrics, claim audits, contradictions, and clickable source links.
"""

import io
from datetime import datetime, timezone
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)


def build_pdf_report(data: Dict[str, Any]) -> bytes:
    """
    Compiles a comprehensive PDF intelligence dossier from real workflow state.
    Returns the generated PDF as raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6,
    )

    meta_style = ParagraphStyle(
        "MetaStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=14,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#312e81"),
        spaceBefore=12,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=8,
    )

    bullet_style = ParagraphStyle(
        "ReportBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
        leftIndent=14,
        spaceAfter=4,
    )

    claim_style = ParagraphStyle(
        "ClaimStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1e293b"),
    )

    quote_style = ParagraphStyle(
        "QuoteStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#475569"),
    )

    story = []

    # Title & Header
    report = data.get("final_report") or {}
    topic = data.get("topic", "Research Dossier")
    title = report.get("title") or f"Research Intelligence Dossier: {topic}"

    story.append(Paragraph(title, title_style))

    gen_date = datetime.now(timezone.utc).strftime("%B %d, %Y - %H:%M UTC")
    metrics = data.get("metrics") or {}
    total_sources = len(data.get("sources", []))
    total_claims = len(data.get("verifications", []))
    coverage = metrics.get("evidence_coverage_pct", 0.0)

    meta_text = (
        f"<b>Generated:</b> {gen_date} &nbsp;|&nbsp; "
        f"<b>Topic:</b> {topic} &nbsp;|&nbsp; "
        f"<b>Engine:</b> ResearchPilot AI (Tavily Grounded & LangGraph Multi-Agent)"
    )
    story.append(Paragraph(meta_text, meta_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))

    # Research Quality Metrics Scorecard Table
    metrics_data = [
        [
            Paragraph("<b>Total Sources</b>", claim_style),
            Paragraph("<b>Claims Audited</b>", claim_style),
            Paragraph("<b>Evidence Coverage</b>", claim_style),
            Paragraph("<b>Supported Claims</b>", claim_style),
            Paragraph("<b>Conflicts Flagged</b>", claim_style),
        ],
        [
            Paragraph(f"<font size=11 color='#312e81'><b>{total_sources}</b></font>", claim_style),
            Paragraph(f"<font size=11 color='#312e81'><b>{total_claims}</b></font>", claim_style),
            Paragraph(f"<font size=11 color='#16a34a'><b>{coverage}%</b></font>", claim_style),
            Paragraph(f"<font size=11 color='#16a34a'><b>{metrics.get('supported_claims', 0)}</b></font>", claim_style),
            Paragraph(f"<font size=11 color='#d97706'><b>{metrics.get('conflicting_claims', 0)}</b></font>", claim_style),
        ],
    ]
    metrics_table = Table(metrics_data, colWidths=[105, 105, 110, 105, 105])
    metrics_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 12))

    # 1. Executive Summary
    exec_summary = report.get("executive_summary", "No executive summary compiled.")
    story.append(Paragraph("1. Executive Summary", section_heading))
    story.append(Paragraph(exec_summary.replace("\n", "<br/>"), body_style))

    # 2. Key Findings
    key_findings = report.get("key_findings", [])
    if key_findings:
        story.append(Paragraph("2. Key Factual Findings", section_heading))
        for idx, finding in enumerate(key_findings, 1):
            story.append(Paragraph(f"<b>{idx}.</b> {finding}", bullet_style))
        story.append(Spacer(1, 8))

    # 3. Research Methodology
    methodology = report.get("research_methodology", "")
    plan = data.get("plan") or {}
    questions = plan.get("questions", [])
    if methodology or questions:
        story.append(Paragraph("3. Research Methodology & Formulation", section_heading))
        if methodology:
            story.append(Paragraph(methodology.replace("\n", "<br/>"), body_style))
        if questions:
            story.append(Paragraph("<b>Targeted Sub-Questions Investigated:</b>", body_style))
            for q in questions:
                q_text = f"• <b>[{q.get('id', 'Q')}]</b> {q.get('question', '')} <i>({q.get('category', '')})</i>"
                story.append(Paragraph(q_text, bullet_style))
            story.append(Spacer(1, 8))

    # 4. Detailed Analysis
    detailed = report.get("detailed_analysis", "")
    if detailed:
        story.append(Paragraph("4. Detailed Market & Technical Analysis", section_heading))
        # Clean markdown headers slightly for ReportLab paragraphs
        paragraphs = detailed.split("\n\n")
        for p in paragraphs:
            clean_p = p.strip().replace("### ", "<b>").replace("## ", "<b>")
            if "<b>" in clean_p and not clean_p.endswith("</b>"):
                clean_p += "</b>"
            story.append(Paragraph(clean_p.replace("\n", "<br/>"), body_style))

    # 5. Evidence Verification & Claims Audit
    verifications = data.get("verifications", [])
    if verifications:
        story.append(Paragraph("5. Evidence Grounding & Claims Audit", section_heading))
        story.append(Paragraph(
            "Every key factual assertion was cross-examined against raw web extractions. "
            "Status definitions: <b>Supported</b> (empirically confirmed), <b>Conflicting</b> (opposing figures detected), "
            "<b>Insufficient</b> (unsubstantiated conjecture).",
            body_style
        ))

        claim_rows = [
            [
                Paragraph("<b>Claim</b>", claim_style),
                Paragraph("<b>Status</b>", claim_style),
                Paragraph("<b>Evidence Excerpt / Reasoning</b>", claim_style),
            ]
        ]
        for v in verifications:
            status_val = v.get("status", "insufficient_evidence").upper()
            status_color = "#16a34a" if status_val == "SUPPORTED" else "#d97706" if status_val == "CONFLICTING" else "#64748b"

            quotes = v.get("supporting_evidence_quotes", [])
            quote_txt = f"<br/><i>Quote: \"{quotes[0][:180]}...\"</i>" if quotes else ""
            reasoning_txt = v.get("reasoning", "")

            claim_rows.append([
                Paragraph(v.get("claim", ""), claim_style),
                Paragraph(f"<font color='{status_color}'><b>{status_val}</b></font>", claim_style),
                Paragraph(f"{reasoning_txt}{quote_txt}", claim_style),
            ])

        claims_table = Table(claim_rows, colWidths=[180, 85, 265])
        claims_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(claims_table)
        story.append(Spacer(1, 10))

    # 6. Contradictions & Discrepancies
    contradictions = data.get("contradictions", [])
    conflicting_info = report.get("conflicting_information", "")
    if contradictions or conflicting_info:
        story.append(Paragraph("6. Contradictions & Divergent Estimates", section_heading))
        if conflicting_info:
            story.append(Paragraph(conflicting_info.replace("\n", "<br/>"), body_style))

        if contradictions:
            for c in contradictions:
                c_data = [
                    [
                        Paragraph(f"<b>Conflict Issue: {c.get('topic_aspect', '')}</b>", claim_style),
                        Paragraph(f"<b>Context Resolution</b>", claim_style)
                    ],
                    [
                        Paragraph(
                            f"<b>Claim A:</b> {c.get('claim_a', '')}<br/>"
                            f"<i>Source {c.get('source_a_id', '')}: \"{c.get('source_a_quote', '')}\"</i><br/><br/>"
                            f"<b>Claim B:</b> {c.get('claim_b', '')}<br/>"
                            f"<i>Source {c.get('source_b_id', '')}: \"{c.get('source_b_quote', '')}\"</i>",
                            claim_style
                        ),
                        Paragraph(
                            f"<b>Discrepancy:</b> {c.get('discrepancy_reason', '')}<br/><br/>"
                            f"<b>Analysis:</b> {c.get('contextual_resolution', '')}",
                            claim_style
                        ),
                    ]
                ]
                c_table = Table(c_data, colWidths=[265, 265])
                c_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#fef3c7")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#f59e0b")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#fde68a")),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]))
                story.append(c_table)
                story.append(Spacer(1, 6))

    # 7. Limitations
    limitations = report.get("limitations", "")
    if limitations:
        story.append(Paragraph("7. Research Limitations & Scope", section_heading))
        story.append(Paragraph(limitations.replace("\n", "<br/>"), body_style))

    # 8. Sources and Citations with Clickable Links
    sources = data.get("sources", [])
    if sources:
        story.append(Paragraph("8. Canonical Sources & Verified Citations", section_heading))
        src_rows = [
            [
                Paragraph("<b>ID</b>", claim_style),
                Paragraph("<b>Source Title & Canonical Link</b>", claim_style),
                Paragraph("<b>Quality / Domain</b>", claim_style),
            ]
        ]
        for s in sources:
            s_id = s.get("id", "")
            s_title = s.get("title", "Untitled Source")
            s_url = s.get("url", "")
            assessment = s.get("assessment") or {}
            quality_tag = assessment.get("overall_quality", "medium").upper()
            domain_cat = assessment.get("domain_category", "web")

            link_html = f"<a href='{s_url}' color='#4338ca'><u>{s_title}</u></a><br/><font color='#64748b' size=7>{s_url}</font>"
            quality_html = f"<b>{quality_tag}</b> ({domain_cat})"

            src_rows.append([
                Paragraph(f"<b>[{s_id}]</b>", claim_style),
                Paragraph(link_html, claim_style),
                Paragraph(quality_html, claim_style),
            ])

        src_table = Table(src_rows, colWidths=[40, 360, 130])
        src_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(src_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
