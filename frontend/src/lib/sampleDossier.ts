import { ResearchResponse } from "./api";

export const SAMPLE_RESEARCH_DOSSIER: ResearchResponse = {
  success: true,
  topic: "Analyse the Indian AdTech market in 2026, including competitors, business models, market opportunities and emerging technologies.",
  iteration_count: 2,
  plan: {
    topic: "Analyse the Indian AdTech market in 2026, including competitors, business models, market opportunities and emerging technologies.",
    objective: "Deconstruct the market sizing, programmatic infrastructure, retail media platforms, regulatory privacy impacts, and emerging AI bidding architectures in Indian AdTech by 2026.",
    methodology_summary: "Multi-stage autonomous research executed via Tavily Search. Initial queries covered macro market sizing, programmatic exchanges, and retail media. Follow-up queries resolved gaps regarding DPDP privacy mandates and connected TV CAGR.",
    questions: [
      {
        id: "Q1",
        question: "What is the projected digital ad spend and TAM of the Indian AdTech market in 2026?",
        rationale: "Establishes financial market scale and macro growth trajectory.",
        category: "Market Size & Growth"
      },
      {
        id: "Q2",
        question: "Who are the dominant supply-side and demand-side programmatic players in India?",
        rationale: "Identifies competitive landscape dynamics between global and domestic vendors.",
        category: "Competitive Landscape"
      },
      {
        id: "Q3",
        question: "How are Retail Media Networks and Connected TV (CTV) reshaping business models?",
        rationale: "Analyzes modern monetization models and attribution shifts.",
        category: "Business Models"
      },
      {
        id: "Q4",
        question: "What is the impact of India's Digital Personal Data Protection (DPDP) Act on targeting?",
        rationale: "Evaluates regulatory compliance risk and cookieless identity solutions.",
        category: "Regulatory & Compliance"
      }
    ]
  },
  sources: [
    {
      id: "S1",
      title: "India Digital AdTech Sector Report 2026 - Tracxn",
      url: "https://tracxn.com/d/sectors/adtech-india",
      content: "The Indian AdTech market showcases rapid investment and programmatic expansion. Total digital advertising spend in India is projected to exceed $8.5 Billion by 2026, driven by mobile video, vernacular platforms, and programmatic buying.",
      published_date: "2026-01-15",
      score: 0.96,
      query: "Indian AdTech market size 2026",
      assessment: {
        domain: "tracxn.com",
        domain_category: "industry_analyst",
        source_type: "secondary",
        relevance_score: 0.95,
        overall_quality: "high",
        quality_justification: "Established startup and private market intelligence provider with verified dataset."
      }
    },
    {
      id: "S2",
      title: "IAMAI Digital Advertising in India Annual Dossier",
      url: "https://iamai.in/research/reports",
      content: "Indian digital ad spend is poised to reach $8.5 billion by late 2026. Programmatic buying is projected to capture 65% of all digital display spend across desktop, mobile, and connected devices.",
      published_date: "2026-01-20",
      score: 0.94,
      query: "IAMAI India digital ad spend forecast 2026",
      assessment: {
        domain: "iamai.in",
        domain_category: "primary_institution",
        source_type: "primary",
        relevance_score: 0.98,
        overall_quality: "high",
        quality_justification: "Official apex industry body representing digital advertising and internet commerce in India."
      }
    },
    {
      id: "S3",
      title: "Exchange4Media Dentsu Digital Media Forecast",
      url: "https://exchange4media.com/advertising-news",
      content: "Net digital ad media receipts projected to touch $7.8 billion by end of fiscal 2026. Connected TV advertising revenues are expanding at an unprecedented 38.5% CAGR.",
      published_date: "2026-02-02",
      score: 0.91,
      query: "Connected TV advertising CAGR India 2026",
      assessment: {
        domain: "exchange4media.com",
        domain_category: "tech_news",
        source_type: "secondary",
        relevance_score: 0.89,
        overall_quality: "medium",
        quality_justification: "Premier media and advertising news publication reporting industry survey data."
      }
    },
    {
      id: "S4",
      title: "Economic Times: India AdTech Pivot to First-Party Data",
      url: "https://economictimes.indiatimes.com",
      content: "With the full enforcement of the Digital Personal Data Protection (DPDP) Act, programmatic vendors are rapidly adopting first-party data clean rooms and cookieless universal ID graphs.",
      published_date: "2026-02-10",
      score: 0.92,
      query: "DPDP Act impact on AdTech targeting India",
      assessment: {
        domain: "economictimes.indiatimes.com",
        domain_category: "tech_news",
        source_type: "secondary",
        relevance_score: 0.92,
        overall_quality: "high",
        quality_justification: "Major national business daily with established editorial and verification standards."
      }
    }
  ],
  findings: [
    {
      id: "F1",
      category: "Market Size & Growth",
      headline: "Digital Advertising Sizing Hits $8.5B by Late 2026",
      details: "India remains one of the fastest growing digital advertising markets globally. Fuelled by vernacular video consumption, 5G handset penetration, and programmatic exchanges, digital ad expenditure will reach between $7.8B and $8.5B.",
      source_urls: ["https://iamai.in/research/reports", "https://tracxn.com/d/sectors/adtech-india"],
      source_ids: ["S1", "S2"]
    },
    {
      id: "F2",
      category: "Emerging Tech & Architecture",
      headline: "Programmatic Transacting Crosses 65% Market Share",
      details: "Manual direct publisher deals continue to contract as automated programmatic auctions (header bidding, real-time DSP/SSP integrations) capture over 65% of display inventory.",
      source_urls: ["https://iamai.in/research/reports"],
      source_ids: ["S2"]
    },
    {
      id: "F3",
      category: "Business Models",
      headline: "Connected TV (CTV) & Retail Media Surge",
      details: "CTV ad revenues are expanding at a 38.5% CAGR, while quick-commerce retail media platforms (Blinkit, Zepto, Flipkart) offer high-margin closed-loop attribution models.",
      source_urls: ["https://exchange4media.com/advertising-news"],
      source_ids: ["S3"]
    },
    {
      id: "F4",
      category: "Regulatory & Compliance",
      headline: "DPDP Privacy Act Accelerates Clean Room Adoption",
      details: "Third-party cookie deprecation combined with statutory DPDP penalties has accelerated enterprise adoption of data clean rooms and OEM-level identity graphs.",
      source_urls: ["https://economictimes.indiatimes.com"],
      source_ids: ["S4"]
    }
  ],
  verifications: [
    {
      id: "C1",
      claim: "Indian digital ad spend is projected to reach $8.5 Billion by late 2026",
      status: "supported",
      supporting_sources: ["https://iamai.in/research/reports", "https://tracxn.com/d/sectors/adtech-india"],
      supporting_source_ids: ["S1", "S2"],
      supporting_evidence_quotes: [
        "Total digital advertising spend in India is projected to exceed $8.5 Billion by 2026.",
        "Indian digital ad spend is poised to reach $8.5 billion by late 2026."
      ],
      opposing_sources: [],
      evidence_sufficiency: "sufficient",
      reasoning: "Corroborated across primary industry body IAMAI and Tracxn financial analysts."
    },
    {
      id: "C2",
      claim: "Programmatic display transacting will reach 65% market share in India",
      status: "supported",
      supporting_sources: ["https://iamai.in/research/reports"],
      supporting_source_ids: ["S2"],
      supporting_evidence_quotes: [
        "Programmatic buying is projected to capture 65% of all digital display spend across desktop, mobile, and connected devices."
      ],
      opposing_sources: [],
      evidence_sufficiency: "sufficient",
      reasoning: "Direct verbatim quotation confirmed in official industry report S2."
    },
    {
      id: "C3",
      claim: "Total 2026 digital ad expenditure will be strictly $7.8 Billion",
      status: "conflicting",
      supporting_sources: ["https://exchange4media.com/advertising-news"],
      supporting_source_ids: ["S3"],
      supporting_evidence_quotes: [
        "Net digital ad media receipts projected to touch $7.8 billion by end of fiscal 2026."
      ],
      opposing_sources: ["https://iamai.in/research/reports"],
      opposing_source_ids: ["S2"],
      opposing_evidence_quotes: [
        "Indian digital ad spend is poised to reach $8.5 billion by late 2026."
      ],
      evidence_sufficiency: "partial",
      reasoning: "Discrepancy resolved by context: Source S3 counts net media spend whereas Source S2 includes gross billings (agency commissions & production fees)."
    },
    {
      id: "C4",
      claim: "Autonomous neural advertising chips will replace DSP servers in Mumbai by 2026",
      status: "insufficient_evidence",
      supporting_sources: [],
      supporting_evidence_quotes: [],
      opposing_sources: [],
      evidence_sufficiency: "insufficient",
      reasoning: "No empirical citations, patent filings, or commercial roadmaps found in any retrieved source."
    }
  ],
  contradictions: [
    {
      id: "X1",
      topic_aspect: "2026 Indian Digital Ad Spend Market Sizing",
      claim_a: "Total market expenditure will reach $8.5 Billion",
      source_a_id: "S2",
      source_a_url: "https://iamai.in/research/reports",
      source_a_date: "2026-01-20",
      source_a_quote: "Indian digital ad spend is poised to reach $8.5 billion by late 2026.",
      claim_b: "Net media receipts will reach $7.8 Billion",
      source_b_id: "S3",
      source_b_url: "https://exchange4media.com/advertising-news",
      source_b_date: "2026-02-02",
      source_b_quote: "Net digital ad media receipts projected to touch $7.8 billion by end of fiscal 2026.",
      discrepancy_reason: "Gross billings (including agency commissions) vs net publisher inventory receipts.",
      contextual_resolution: "The $700M discrepancy is accounted for by intermediary agency fees, influencer production overhead, and platform commissions. Both figures are methodologically consistent once normalized."
    }
  ],
  metrics: {
    total_sources: 4,
    total_claims: 4,
    supported_claims: 2,
    conflicting_claims: 1,
    insufficient_claims: 1,
    evidence_coverage_pct: 50.0,
    conflict_rate_pct: 25.0,
    high_quality_sources_pct: 75.0,
    total_iterations: 2,
    formula_definitions: {
      evidence_coverage_pct: "round((supported_claims / total_claims) * 100, 1)",
      conflict_rate_pct: "round((conflicting_claims / total_claims) * 100, 1)",
      high_quality_sources_pct: "round((high_quality_sources / total_sources) * 100, 1)"
    }
  },
  final_report: {
    title: "Strategic Intelligence Dossier: Indian AdTech Market in 2026",
    executive_summary: "The Indian digital advertising ecosystem is entering an inflection point entering 2026. Valued between $7.8B (net media spend) and $8.5B (gross expenditure), growth is propelled by Connected TV (38.5% CAGR), quick-commerce retail media networks, and automated programmatic exchanges capturing 65% of all display inventory. Concurrently, the enforcement of the Digital Personal Data Protection (DPDP) Act has driven programmatic vendors toward first-party clean rooms and identity graph federations.",
    research_methodology: "Autonomous multi-agent research executed via LangGraph and Tavily Search API. In iteration 1, four strategic research questions investigated market size, competitive programmatic dynamics, retail media business models, and regulatory compliance. In iteration 2, targeted follow-up queries resolved data gaps regarding DPDP clean room deployment.",
    key_findings: [
      "Total Indian digital advertising expenditure projected to reach $8.5 Billion by late 2026.",
      "Programmatic trading accounts for 65% of display advertising inventory across mobile and desktop.",
      "Connected TV (CTV) advertising revenues are compounding at a 38.5% CAGR, replacing legacy linear TV budgets.",
      "Retail media networks command an estimated 18% of performance ad budgets, providing closed-loop transaction attribution.",
      "DPDP statutory privacy enforcement has accelerated enterprise adoption of first-party data clean rooms."
    ],
    detailed_analysis: "### 1. Market Size & Macroeconomic Drivers\nIndia remains the fastest growing major digital ad market globally. Mobile advertising represents 78% of total expenditure, driven by 5G rollouts, vernacular short-video content, and micro-payment ecosystems.\n\n### 2. Competitive Landscape & Programmatic Players\nWhile global incumbents (Google, Meta, Amazon) maintain ~70% market share of digital receipts, domestic players such as InMobi, Affle, and Media.net are expanding their market share in OEM app stores, dynamic creative optimization (DCO), and performance DSP algorithms.\n\n### 3. Retail Media Networks & CTV Monetization\nQuick-commerce platforms (Blinkit, Zepto, Swiggy Instamart) and e-commerce leaders (Flipkart, Amazon) have emerged as powerful retail media networks, allowing FMCG brands to target consumers at the point of intent with sub-15 minute attribution feedback loops.",
    conflicting_information: "A notable divergence was detected between the IAMAI forecast ($8.5B) and the Dentsu forecast ($7.8B). Epistemic audit reveals that this discrepancy is not an empirical error, but a definitional variance: IAMAI accounts for gross marketing spend (inclusive of influencer fees and agency retainers), whereas Dentsu reports net publisher receipts.",
    limitations: "Financial statements of bootstrapped and pre-IPO AdTech startups in India are not publicly filed. APAC aggregate figures from multinational platforms were disaggregated using statutory filings where available.",
    sources_and_citations: [
      { id: "S1", title: "India Digital AdTech Sector Report 2026 - Tracxn", url: "https://tracxn.com/d/sectors/adtech-india" },
      { id: "S2", title: "IAMAI Digital Advertising in India Annual Dossier", url: "https://iamai.in/research/reports" },
      { id: "S3", title: "Exchange4Media Dentsu Digital Media Forecast", url: "https://exchange4media.com/advertising-news" },
      { id: "S4", title: "Economic Times: India AdTech Pivot to First-Party Data", url: "https://economictimes.indiatimes.com" }
    ]
  },
  logs: [
    "[Planner Agent] Formulated 4 targeted research questions for topic: 'Indian AdTech Market 2026'",
    "[Research Agent (Iteration 1)] Queried Tavily across 4 research questions. Retrieved 4 canonical sources.",
    "[Analysis Agent] Synthesized 4 categorized empirical findings.",
    "[Gap Evaluator (Iteration 1/3)] Identified information gaps regarding DPDP clean room adoption. Triggering iteration 2.",
    "[Research Agent (Iteration 2)] Executed follow-up query 'DPDP Act impact on AdTech targeting India'.",
    "[Gap Evaluator] Evidence coverage deemed sufficient. Proceeding to verification.",
    "[Verification Agent] Verified 4 claims: 2 Supported, 1 Conflicting, 1 Insufficient Evidence. Evidence coverage: 50.0%.",
    "[Report Agent] Successfully generated final research dossier: 'Strategic Intelligence Dossier: Indian AdTech Market in 2026'."
  ]
};
