import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Label, Cell
} from "recharts";

// ─── MASTER COUNTRY DATABASE ─────────────────────────────────────────────────
// Download speed (Mbps) by year. null = no data for that year.
// Sources: OpenSignal Global Reports 2016-2026, APAC Benchmark Sep 2024
const COUNTRY_DB = {
  // mno = effective MNO count (commercially active, own spectrum/infrastructure)
  // mnoNote = brief factual note for tooltip
  // mnoSource = citation for MNO count
  // speedSource = citation for latest speed figure used in MNO chart
  "South Korea":  { flag:"🇰🇷", speeds:{"2016":41.3,"2017":37.5,"2018":48,"2019":52,"2020":59,"2021":74.9,"2022":120,"2023":131.7,"2024":158.3,"2025":150}, avail5g:{"2024":34.0}, cq:80.2, carriers:3, regulated:true,
    mno:3, mnoNote:"SK Telecom, KT, LG U+ — stable since 2000s", mnoSource:"MSIT Korea (Ministry of Science and ICT), Telecommunications Business Report 2024", speedSource:"OpenSignal, South Korea Mobile Network Experience Report, Dec 2024 (data: Aug–Oct 2024); SK Telecom all-users Download Speed Experience: 158.3 Mbps" },
  "USA":          { flag:"🇺🇸", speeds:{"2016":12,"2017":13,"2018":16,"2019":19,"2020":22,"2021":40,"2022":80,"2023":95,"2025":152.5}, avail5g:{"2024":null}, cq:62, carriers:3, regulated:false,
    mno:3, mnoNote:"AT&T, Verizon, T-Mobile — T-Mobile/Sprint merged 2020", mnoSource:"FCC, Mobile Wireless Competition Report 2023; T-Mobile/Sprint merger order, FCC DA 20-817 (2020)", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025 (T-Mobile 152.5 Mbps)" },
  "Norway":       { flag:"🇳🇴", speeds:{"2016":32,"2017":31,"2018":38,"2019":36,"2020":50,"2021":65,"2022":95,"2023":93.8,"2025":127}, avail5g:{"2024":null}, cq:87.2, carriers:4, regulated:true,
    mno:4, mnoNote:"Telenor, Telia, ice, Lyca Mobile (own spectrum) — ice mandated access challenger", mnoSource:"Nkom (Norwegian Communications Authority), Market Report 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Finland":      { flag:"🇫🇮", speeds:{"2019":28,"2020":35,"2021":60,"2022":90,"2023":100,"2025":120}, avail5g:{"2024":null}, cq:91.1, carriers:3, regulated:true,
    mno:3, mnoNote:"Elisa, Telia Finland, DNA (acquired by Telenor 2019)", mnoSource:"Traficom (Finnish Transport and Communications Agency), Market Review 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Denmark":      { flag:"🇩🇰", speeds:{"2019":37,"2020":42,"2021":68,"2022":88,"2023":89,"2025":115}, avail5g:{"2024":null}, cq:90, carriers:4, regulated:true,
    mno:4, mnoNote:"TDC/Nuuday, Telenor DK, Telia DK, 3 Denmark", mnoSource:"Ekstra Bladet / Erhvervsstyrelsen (Danish Business Authority), Telecom Market Report 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Sweden":       { flag:"🇸🇪", speeds:{"2016":23,"2017":23,"2018":28,"2019":30,"2020":38,"2021":58,"2022":82,"2023":88,"2025":110}, avail5g:{"2024":null}, cq:88, carriers:4, regulated:true,
    mno:4, mnoNote:"Tele2, Telia Sweden, Tre (3), Telenor SE", mnoSource:"PTS (Swedish Post and Telecom Authority), Telecommunications Market in Sweden 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Singapore":    { flag:"🇸🇬", speeds:{"2016":31,"2017":30,"2018":35,"2019":32,"2020":40,"2021":62,"2022":78,"2023":85,"2024":79.4,"2025":95}, avail5g:{"2024":35.9}, cq:77.8, carriers:3, regulated:true,
    mno:3, mnoNote:"Singtel, StarHub, M1 — all three are OpenSignal Global Leaders 2025", mnoSource:"IMDA Singapore (Infocomm Media Development Authority), Telecom Competition Statistics Q4 2024", speedSource:"OpenSignal, APAC Mobile Network Experience Benchmark, Sep 2024 (data: Apr–Jun 2024)" },
  "Taiwan":       { flag:"🇹🇼", speeds:{"2016":null,"2017":null,"2018":null,"2019":null,"2020":null,"2021":85,"2022":98,"2023":95,"2024":69.7,"2025":100}, avail5g:{"2024":29.7}, cq:81.1, carriers:4, regulated:false,
    mno:4, mnoNote:"Chunghwa Telecom, FarEasTone, Taiwan Mobile, Taiwan Star", mnoSource:"NCC Taiwan (National Communications Commission), Telecommunications Statistical Indicators Q3 2024", speedSource:"OpenSignal, APAC Mobile Network Experience Benchmark, Sep 2024 (data: Apr–Jun 2024)" },
  "Japan":        { flag:"🇯🇵", speeds:{"2016":18,"2017":19,"2018":22,"2019":25,"2020":30,"2021":38,"2022":48,"2023":55,"2024":45.9,"2025":70}, avail5g:{"2024":10.4}, cq:78.9, carriers:4, regulated:false,
    mno:4, mnoNote:"NTT Docomo, au (KDDI), SoftBank, Rakuten Mobile (entered 2020)", mnoSource:"MIC Japan (Ministry of Internal Affairs and Communications), Telecommunications Business Report 2024", speedSource:"OpenSignal, APAC Mobile Network Experience Benchmark, Sep 2024 (data: Apr–Jun 2024)" },
  "Australia":    { flag:"🇦🇺", speeds:{"2016":22,"2017":22,"2018":30,"2019":28,"2020":45,"2021":67.3,"2022":80,"2023":82,"2024":66.6,"2025":90}, avail5g:{"2024":19.2}, cq:77.8, carriers:3, regulated:false,
    mno:3, mnoNote:"Telstra, Optus, TPG Telecom (Vodafone AU merged with TPG 2020)", mnoSource:"ACMA (Australian Communications and Media Authority), Communications Market Report 2024", speedSource:"OpenSignal, APAC Mobile Network Experience Benchmark, Sep 2024 (data: Apr–Jun 2024)" },
  "Canada":       { flag:"🇨🇦", speeds:{"2016":20,"2017":22,"2018":28,"2019":40,"2020":59,"2021":68.6,"2022":78,"2023":80,"2025":88}, avail5g:{"2024":null}, cq:72, carriers:3, regulated:false,
    mno:3, mnoNote:"Rogers, Bell, Telus — Rogers/Shaw merger blocked on wireless; Shaw wireless sold to Videotron", mnoSource:"CRTC (Canadian Radio-television and Telecommunications Commission), Communications Market Report 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Netherlands":  { flag:"🇳🇱", speeds:{"2016":26,"2017":25,"2018":33,"2019":35,"2020":54.8,"2021":62,"2022":75,"2023":80,"2025":95}, avail5g:{"2024":null}, cq:75, carriers:3, regulated:true,
    mno:3, mnoNote:"KPN, Vodafone NL, T-Mobile NL (acquired Tele2 NL 2018)", mnoSource:"ACM (Authority for Consumers & Markets Netherlands), Telecom Monitor 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Hungary":      { flag:"🇭🇺", speeds:{"2016":28,"2017":30,"2018":30,"2019":29,"2020":35,"2021":45,"2022":58,"2023":62}, avail5g:{"2024":null}, cq:68, carriers:3, regulated:false,
    mno:3, mnoNote:"Magyar Telekom (T-Mobile), Vodafone HU, Yettel (formerly Telenor HU)", mnoSource:"NMHH (National Media and Infocommunications Authority Hungary), Telecommunications Market Report 2023", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2023" },
  "Switzerland":  { flag:"🇨🇭", speeds:{"2019":30,"2020":38,"2021":60,"2022":82,"2023":88,"2025":105}, avail5g:{"2024":null}, cq:85, carriers:3, regulated:true,
    mno:3, mnoNote:"Swisscom (51% state-owned), Sunrise, Salt Mobile", mnoSource:"BAKOM (Federal Office of Communications Switzerland), Annual Report on the Telecommunications Market 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "India":        { flag:"🇮🇳", speeds:{"2022":18,"2023":28,"2024":66.5,"2025":72}, avail5g:{"2024":52.1}, cq:48, carriers:3, regulated:false,
    mno:3, mnoNote:"Reliance Jio, Airtel, Vodafone Idea (Vi) — Vi near-insolvent; effective duopoly Jio+Airtel", mnoSource:"TRAI (Telecom Regulatory Authority of India), Telecom Subscription Data Report Nov 2024", speedSource:"OpenSignal, APAC Mobile Network Experience Benchmark, Sep 2024 (data: Apr–Jun 2024)" },
  "Malaysia":     { flag:"🇲🇾", speeds:{"2022":25,"2023":38,"2024":54.8,"2025":65}, avail5g:{"2024":31.8}, cq:62, carriers:1, regulated:true,
    mno:1, mnoNote:"DNB (Digital Nasional Berhad) — single wholesale 5G network; Celcom/Digi/Maxis/U Mobile are virtual operators on top", mnoSource:"MCMC (Malaysian Communications and Multimedia Commission), Industry Performance Report Q3 2024", speedSource:"OpenSignal, APAC Mobile Network Experience Benchmark, Sep 2024 (data: Apr–Jun 2024)" },
  "UK":           { flag:"🇬🇧", speeds:{"2016":16,"2017":17,"2018":20,"2019":22,"2020":28,"2021":42,"2022":55,"2023":65,"2025":80}, avail5g:{"2024":null}, cq:65, carriers:4, regulated:true,
    mno:4, mnoNote:"EE (BT), O2 (VMO2), Vodafone UK, Three UK — VMO2 = Virgin/O2 merged 2021", mnoSource:"Ofcom (UK Office of Communications), Connected Nations Report 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Estonia":      { flag:"🇪🇪", speeds:{"2020":28,"2021":45,"2022":72,"2023":80,"2025":95}, avail5g:{"2024":null}, cq:90.8, carriers:3, regulated:true,
    mno:3, mnoNote:"Telia Estonia, Elisa Estonia, Tele2 Estonia", mnoSource:"TTJA (Consumer Protection and Technical Regulatory Authority Estonia), Annual Report 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Hong Kong":    { flag:"🇭🇰", speeds:{"2022":68,"2023":75,"2024":62,"2025":85}, avail5g:{"2024":null}, cq:72, carriers:4, regulated:false,
    mno:4, mnoNote:"HKT (PCCW), SmarTone, China Mobile HK, 3HK (CK Hutchison)", mnoSource:"OFCA (Office of the Communications Authority Hong Kong), Telecommunications Statistics 2024", speedSource:"OpenSignal, APAC Mobile Network Experience Benchmark, Sep 2024 (data: Apr–Jun 2024)" },
  "Thailand":     { flag:"🇹🇭", speeds:{"2019":8,"2021":18.1,"2022":19.4,"2023":20,"2024":35,"2025":42}, avail5g:{"2024":18}, cq:52, carriers:2, regulated:false,
    mno:2, mnoNote:"AIS, True Corp (True+DTAC merged Mar 2023) — NT exists but <1% share, no viable business plan", mnoSource:"NBTC (National Broadcasting and Telecommunications Commission Thailand), Annual Report 2024; True–DTAC merger acknowledged Oct 2022", speedSource:"OpenSignal, Thailand Mobile Network Experience Report, Nov 2021 (18.1 Mbps); May 2022 (19.4 Mbps); APAC Benchmark Sep 2024 (35 Mbps)" },
  "Vietnam":      { flag:"🇻🇳", speeds:{"2024":28,"2025":35}, avail5g:{"2024":12}, cq:48, carriers:3, regulated:true,
    mno:3, mnoNote:"Viettel, VNPT (Vinaphone), MobiFone — all state-owned or state-majority", mnoSource:"VNPT / Ministry of Information and Communications Vietnam, Telecom Market Statistics 2024", speedSource:"OpenSignal, APAC Mobile Network Experience Benchmark, Sep 2024 (data: Apr–Jun 2024)" },
  "Saudi Arabia": { flag:"🇸🇦", speeds:{"2021":38,"2022":52,"2023":65,"2025":78}, avail5g:{"2024":null}, cq:60, carriers:3, regulated:false,
    mno:3, mnoNote:"STC, Mobily (Etihad Etisalat), Zain KSA", mnoSource:"CITC (Communications, Space & Technology Commission Saudi Arabia), Annual Report 2024", speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025" },
  "Global Avg":   { flag:"🌐", speeds:{"2016":14,"2017":15,"2018":17,"2019":19,"2020":24,"2021":30,"2022":38,"2023":31.5,"2024":40,"2025":55}, avail5g:{}, cq:null, carriers:null, regulated:null,
    mno:null, mnoNote:null, mnoSource:null, speedSource:"OpenSignal, Global Mobile Network Experience Awards, Feb 2025 (global average)" },
};

const ALL_COUNTRIES = Object.keys(COUNTRY_DB);
const CHART_YEARS = ["2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"];
const DEFAULT_SELECTED = ["South Korea","USA","Norway","Finland","Global Avg"];

// Color palette for lines
const COUNTRY_COLORS = [
  "#e94560","#3b82f6","#10b981","#f59e0b","#a78bfa",
  "#06b6d4","#f97316","#ec4899","#84cc16","#8b5cf6",
  "#14b8a6","#f43f5e","#0ea5e9","#22c55e","#eab308",
  "#6366f1","#d946ef","#64748b","#78716c","#0891b2",
  "#16a34a","#dc2626","#7c3aed",
];
function countryColor(name) {
  const idx = ALL_COUNTRIES.indexOf(name);
  return COUNTRY_COLORS[idx % COUNTRY_COLORS.length];
}

// ─── YEARS DATA ───────────────────────────────────────────────────────────────
const YEARS = [
  {
    id:"y2016", year:"2016", accent:"#64748b",
    era:"Pre-5G: 4G infancy",
    source:"OpenSignal Global State of Mobile Networks Aug 2016 | State of LTE Nov 2016",
    verified:true,
    note:"No 5G. Only overall mobile speed (3G+4G combined) and availability published. Reliability/Consistency metrics didn't exist yet.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 South Korea",value:"41.3",note:"Fastest globally; 98.5% 3G/4G availability"},
        {rank:2,country:"🇳🇴 Norway",value:"~32",note:"30+ Mbps club; LTE-Advanced"},
        {rank:3,country:"🇸🇬 Singapore",value:"~31",note:"30+ Mbps club"},
        {rank:4,country:"🇭🇺 Hungary",value:"~28",note:"Surprise European leader"},
        {rank:5,country:"🇳🇱 Netherlands",value:"~26",note:"High WiFi usage (68.5% time on WiFi)"},
        {rank:6,country:"🇸🇪 Sweden",value:"~23",note:"Nordic cluster forming"},
        {rank:7,country:"🇦🇺 Australia",value:"~22",note:"Telstra LTE-Advanced early deployment"},
        {rank:8,country:"🇨🇦 Canada",value:"~20",note:"Rogers/Bell LTE expansion"},
        {rank:9,country:"🇺🇸 USA",value:"~12",note:"39th globally — despite 19th in availability"},
        {rank:10,country:"🇯🇵 Japan",value:"~18",note:"Strong availability but slower speeds"},
      ],
      availability:[
        {rank:1,country:"🇰🇷 South Korea",value:"98.5%",note:"3+ pp ahead of #2 Japan"},
        {rank:2,country:"🇯🇵 Japan",value:"~95.5%",note:"Only 2 countries >85% 4G"},
        {rank:3,country:"🇳🇴 Norway",value:"~90%",note:"4G availability leader Europe"},
        {rank:4,country:"🇸🇬 Singapore",value:"~88%",note:"Dense city-state"},
        {rank:5,country:"🇦🇺 Australia",value:"~85%",note:"Early LTE maturity"},
        {rank:6,country:"🇳🇱 Netherlands",value:"~82%",note:"High WiFi offloading"},
        {rank:7,country:"🇺🇸 USA",value:"~80%",note:"Wide geographic coverage but variable quality"},
        {rank:8,country:"🇬🇧 UK",value:"~76%",note:"EE and Vodafone LTE rollout"},
        {rank:9,country:"🇸🇪 Sweden",value:"~78%",note:"Nordic coverage expansion"},
        {rank:10,country:"🇩🇰 Denmark",value:"~75%",note:"Early Nordic 4G"},
      ],
      reliability:null,
      consistency:null,
    },
    trend:"South Korea dominates every metric by a wide margin — 41.3 Mbps and 98.5% 3G/4G availability. Only nine countries globally averaged over 20 Mbps. The U.S. ranked 39th in speed despite 19th in availability.",
    counter:"South Korea's dominance was built on heavy state-industry coordination, not free market competition. The U.S., despite decades of 'competitive market' rhetoric, ranked 39th in speed.",
    lens:"The U.S. gap vs. South Korea in 2016 is Exhibit A for the essential facilities debate. The FCC's light-touch approach meant carriers could charge for coverage while delivering mediocre speeds."
  },
  {
    id:"y2017", year:"2017", accent:"#7c3aed",
    era:"Pre-5G: LTE-Advanced matures",
    source:"OpenSignal Global State of Mobile Networks Feb 2017",
    verified:true,
    note:"No 5G. South Korea falls slightly (41.3→37.5 Mbps) as network congestion grows. Europe dominates video experience.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 South Korea",value:"37.5",note:"Slight dip from 41.3 but still #1 by large margin"},
        {rank:2,country:"🇳🇴 Norway",value:"~31",note:">30 Mbps club"},
        {rank:3,country:"🇭🇺 Hungary",value:"~30",note:">30 Mbps club"},
        {rank:4,country:"🇸🇬 Singapore",value:"~30",note:">30 Mbps club"},
        {rank:5,country:"🇸🇪 Sweden",value:"~23",note:"European cluster >21 Mbps"},
        {rank:6,country:"🇳🇱 Netherlands",value:"~22",note:"WiFi heavy usage impacts score"},
        {rank:7,country:"🇦🇺 Australia",value:"~22",note:"Telstra LTE-A expansion"},
        {rank:8,country:"🇨🇦 Canada",value:"~22",note:"Rogers/Bell/TELUS competition"},
        {rank:9,country:"🇩🇰 Denmark",value:"~20",note:"Nordic consistency"},
        {rank:10,country:"🇯🇵 Japan",value:"~19",note:"NTT Docomo LTE stable"},
      ],
      availability:[
        {rank:1,country:"🇰🇷 South Korea",value:">95%",note:"Still dominant"},
        {rank:2,country:"🇯🇵 Japan",value:">85%",note:"Only 2 countries pass 85% 4G"},
        {rank:3,country:"🇳🇱 Netherlands",value:"~82%",note:"High WiFi use"},
        {rank:4,country:"🇺🇸 USA",value:"81.3%",note:"4G leader in North America"},
        {rank:5,country:"🇹🇼 Taiwan",value:"~80%",note:"Growing 4G adoption"},
        {rank:6,country:"🇸🇬 Singapore",value:"~79%",note:"Dense network"},
        {rank:7,country:"🇬🇧 UK",value:"~77%",note:"EE rollout continues"},
        {rank:8,country:"🇸🇪 Sweden",value:"~78%",note:"Nordic coverage"},
        {rank:9,country:"🇳🇴 Norway",value:"~76%",note:"Rugged geography challenge"},
        {rank:10,country:"🇦🇺 Australia",value:"~75%",note:"Large land mass challenge"},
      ],
      reliability:null,
      consistency:null,
    },
    trend:"Europe dominates video experience — 6 of top 10 latency markets are European. South Korea still fastest but Europe is the most well-rounded mobile continent.",
    counter:"'Well-rounded performance' hides a market structure story: Europe achieved this through regulated spectrum sharing and MVNO access requirements — not pure carrier competition.",
    lens:"European net neutrality rules, roaming regulation, and MVNO access mandates created conditions for balanced competition. The U.S. deregulatory path left most Americans stuck in the middle."
  },
  {
    id:"y2018", year:"2018", accent:"#0891b2",
    era:"Pre-5G: 5G hype begins",
    source:"OpenSignal State of LTE / Mobile Network Reports 2018 (country-level; no standalone global ranking)",
    verified:false,
    note:"⚠ OpenSignal did not publish a full global ranking in 2018. Figures interpolated from country-level reports and 2019 retrospective data.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 South Korea",value:"~48",note:"LTE-Advanced Pro; approaching 50 Mbps"},
        {rank:2,country:"🇳🇴 Norway",value:"~38",note:"Consistent growth"},
        {rank:3,country:"🇸🇬 Singapore",value:"~35",note:"Dense city deployment"},
        {rank:4,country:"🇳🇱 Netherlands",value:"~33",note:"Strong fiber+LTE convergence"},
        {rank:5,country:"🇦🇺 Australia",value:"~30",note:"Telstra LTE-A"},
        {rank:6,country:"🇨🇦 Canada",value:"~28",note:"Canadian operators ramp LTE-A"},
        {rank:7,country:"🇸🇪 Sweden",value:"~28",note:"Nordic cluster tightening"},
        {rank:8,country:"🇭🇺 Hungary",value:"~30",note:"Consistent European performer"},
        {rank:9,country:"🇬🇧 UK",value:"~20",note:"EE/O2/Vodafone competitive market"},
        {rank:10,country:"🇺🇸 USA",value:"~16",note:"AT&T/Verizon 5G hype, 4G performance lags"},
      ],
      availability:[
        {rank:1,country:"🇰🇷 South Korea",value:"~98%",note:"Near perfect 4G availability"},
        {rank:2,country:"🇯🇵 Japan",value:"~96%",note:"Joined >95% club"},
        {rank:3,country:"🇳🇱 Netherlands",value:"~94%",note:"Three countries join >95% club"},
        {rank:4,country:"🇺🇸 USA",value:"~93%",note:"T-Mobile/Verizon expansion"},
        {rank:5,country:"🇹🇼 Taiwan",value:"~92%",note:"Taiwan joins >95% club"},
        {rank:6,country:"🇸🇬 Singapore",value:"~92%",note:"Dense coverage"},
        {rank:7,country:"🇳🇴 Norway",value:"~88%",note:"Expanding coverage"},
        {rank:8,country:"🇸🇪 Sweden",value:"~87%",note:"Nordic expansion"},
        {rank:9,country:"🇦🇺 Australia",value:"~85%",note:"Urban-rural gap persists"},
        {rank:10,country:"🇬🇧 UK",value:"~83%",note:"Rural coverage gaps"},
      ],
      reliability:null,
      consistency:null,
    },
    trend:"South Korea crosses 45 Mbps as 5G pre-deployment accelerates. U.S., Netherlands and Taiwan join 90%+ 4G availability club. Global LTE speed rising steadily.",
    counter:"The 5G hype machine is fully running by 2018. The actual performance gap between leaders (Korea ~48 Mbps) and the U.S. (~16 Mbps) is enormous and growing.",
    lens:"2018 is when spectrum policy becomes geopolitics: the U.S. begins targeting Huawei. Antitrust and national security merge into the same policy agenda."
  },
  {
    id:"y2019", year:"2019", accent:"#e94560",
    era:"5G Dawn: First commercial launches",
    source:"OpenSignal State of Mobile Network Experience May 2019 | 5G Experience Nov 2019",
    verified:true,
    note:"South Korea was the ONLY country above 50 Mbps. 5G launched April 2019 (Korea), May 2019 (USA limited). Global 5G coverage <1% of users.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 South Korea",value:">50",note:"ONLY country above 50 Mbps"},
        {rank:2,country:"🇨🇦 Canada",value:"~40",note:"Strong 4G performance without 5G"},
        {rank:3,country:"🇩🇰 Denmark",value:"~37",note:"Upload leader globally"},
        {rank:4,country:"🇳🇴 Norway",value:"~36",note:"Tied with Hungary for Video Experience lead"},
        {rank:5,country:"🇳🇱 Netherlands",value:"~35",note:"54.8 Mbps 4G speed"},
        {rank:6,country:"🇸🇬 Singapore",value:"~32",note:"Dense network; city-state advantage"},
        {rank:7,country:"🇸🇪 Sweden",value:"~30",note:"Nordic cluster"},
        {rank:8,country:"🇫🇮 Finland",value:"~28",note:"Pre-award era quality builder"},
        {rank:9,country:"🇨🇭 Switzerland",value:"~30",note:"Swisscom dense coverage"},
        {rank:10,country:"🇦🇺 Australia",value:"~28",note:"Telstra strong 4G"},
      ],
      availability:[
        {rank:1,country:"🇰🇷 South Korea",value:"~99%",note:"Near perfect"},
        {rank:2,country:"🇯🇵 Japan",value:"~98%",note:"Joined >95% club in 2018"},
        {rank:3,country:"🇳🇱 Netherlands",value:"~95%",note:"Strong consistent growth"},
        {rank:4,country:"🇺🇸 USA",value:"~93%",note:"Three carriers now above 90%"},
        {rank:5,country:"🇹🇼 Taiwan",value:"~92%",note:"Part of the >90% club"},
        {rank:6,country:"🇩🇰 Denmark",value:"~91%",note:"Nordic availability"},
        {rank:7,country:"🇳🇴 Norway",value:"~90%",note:"Expanding coverage"},
        {rank:8,country:"🇸🇬 Singapore",value:"~92%",note:"Dense coverage"},
        {rank:9,country:"🇸🇪 Sweden",value:"~89%",note:"Good coverage"},
        {rank:10,country:"🇦🇺 Australia",value:"~86%",note:"Urban rural gap"},
      ],
      reliability:[
        {rank:1,country:"🇩🇰 Denmark / 🇳🇴 Norway",value:"~High",note:"Latency leaders: 6 European countries top 10"},
        {rank:2,country:"🇯🇵 Japan",value:"~High",note:"Consistent latency excellence"},
        {rank:3,country:"🇰🇷 South Korea",value:"~High",note:"Below 40ms latency"},
        {rank:4,country:"🇸🇪 Sweden",value:"~High",note:"European latency cluster"},
        {rank:5,country:"🇸🇬 Singapore",value:"~Medium-High",note:"Only non-European/East-Asian in top group"},
        {rank:6,country:"🇨🇭 Switzerland",value:"~High",note:"Dense network low latency"},
        {rank:7,country:"🇫🇮 Finland",value:"~High",note:"Nordic reliability"},
        {rank:8,country:"🇳🇱 Netherlands",value:"~High",note:"European quality cluster"},
        {rank:9,country:"🇦🇺 Australia",value:"~Med",note:"Urban areas strong"},
        {rank:10,country:"🇨🇦 Canada",value:"~Med",note:"Rogers/Bell/TELUS competitive"},
      ],
      consistency:[
        {rank:1,country:"🇨🇿 Czech Republic",value:"~Same as NL",note:"32.7 Mbps yet tied #1 Video with Netherlands (54.8)"},
        {rank:2,country:"🇳🇱 Netherlands",value:"~High",note:"Top 25 Very Good Video"},
        {rank:3,country:"🇦🇹 Austria",value:"~High",note:"Tied #1 Video Experience"},
        {rank:4,country:"🇳🇴 Norway",value:"74pts",note:"Just over 74pts — not yet Excellent"},
        {rank:5,country:"🇭🇺 Hungary",value:"74pts",note:"Tied with Norway — no country yet Excellent"},
        {rank:6,country:"🇩🇰 Denmark",value:"~73pts",note:"Close to Excellent threshold"},
        {rank:7,country:"🇸🇪 Sweden",value:"~72pts",note:"Nordic quality"},
        {rank:8,country:"🇸🇬 Singapore",value:"~70pts",note:"City-state consistency"},
        {rank:9,country:"🇨🇭 Switzerland",value:"~70pts",note:"Swisscom quality"},
        {rank:10,country:"🇨🇦 Canada",value:"~68pts",note:"Strong 4G consistency"},
      ],
    },
    trend:"South Korea is the only country above 50 Mbps. Europe dominates every quality metric — 6 of top 10 latency markets, top 25 video experience. The 5G launch in Korea and USA is barely measurable at population scale.",
    counter:"The 5G launch narrative masks a disturbing reality: the U.S. ranks mid-table in every quality metric despite leading in 5G hype. Europe — without launching 5G — is delivering better experiences.",
    lens:"The Czech Republic case: 32.7 Mbps ties for #1 in video experience with the Netherlands at 54.8 Mbps. Speed is not the metric. Consistency is."
  },
  {
    id:"y2020", year:"2020", accent:"#16a34a",
    era:"5G Year 1: Canada ties Korea, Europe surges",
    source:"OpenSignal State of Mobile Network Experience May 2020",
    verified:true,
    note:"Canada ties South Korea at 59 Mbps — a stunning result. Global avg rose 24.3% from 2019. 20 countries have launched 5G.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 South Korea",value:"59",note:"Tied with Canada"},
        {rank:"1=",country:"🇨🇦 Canada",value:"59",note:"Statistical tie — without 5G"},
        {rank:3,country:"🇳🇱 Netherlands",value:"54.8",note:"Fastest in Europe"},
        {rank:4,country:"🇳🇴 Norway",value:"~50",note:"Europe latency + speed leader"},
        {rank:5,country:"🇦🇺 Australia",value:"~45",note:"Joins >40 Mbps club"},
        {rank:6,country:"🇸🇬 Singapore",value:"~40",note:"City-state consistent performer"},
        {rank:7,country:"🇩🇰 Denmark",value:"~42",note:"Nordic upload champion"},
        {rank:8,country:"🇸🇪 Sweden",value:"~38",note:"Nordic cluster"},
        {rank:9,country:"🇫🇮 Finland",value:"~35",note:"Pre-award quality building"},
        {rank:10,country:"🇺🇸 USA",value:"~22",note:"5G launch but population avg still low"},
      ],
      availability:[
        {rank:1,country:"🇰🇷 South Korea",value:">99%",note:"Near ceiling"},
        {rank:2,country:"🇯🇵 Japan",value:">98%",note:"Consistent 98%+"},
        {rank:3,country:"🇺🇸 USA",value:">95%",note:"Joins >95% club"},
        {rank:4,country:"🇳🇱 Netherlands",value:">95%",note:"Joins >95% club"},
        {rank:5,country:"🇹🇼 Taiwan",value:">95%",note:"Joins >95% club"},
        {rank:6,country:"🇸🇬 Singapore",value:"~94%",note:"Near ceiling"},
        {rank:7,country:"🇩🇰 Denmark",value:"~93%",note:"Nordic expansion"},
        {rank:8,country:"🇸🇪 Sweden",value:"~91%",note:"Nordic expansion"},
        {rank:9,country:"🇳🇴 Norway",value:"~90%",note:"Geographic challenges"},
        {rank:10,country:"🇦🇺 Australia",value:"~89%",note:"Urban areas dominant"},
      ],
      reliability:[
        {rank:1,country:"🇪🇺 Europe (cluster)",value:"~Leader",note:"European nations dominate latency top 10"},
        {rank:2,country:"🇯🇵 Japan",value:"~High",note:"Excellent Video — 15 countries now at Excellent"},
        {rank:3,country:"🇸🇬 Singapore",value:"~High",note:"Only Asian non-Korean in Excellent Video club"},
        {rank:4,country:"🇦🇺 Australia",value:"~High",note:"Joins Excellent Video Experience group"},
        {rank:5,country:"🇰🇷 South Korea",value:"~High",note:"5G boosting quality"},
        {rank:6,country:"🇨🇦 Canada",value:"~High",note:"Strong reliability metrics"},
        {rank:7,country:"🇨🇭 Switzerland",value:"~High",note:"Dense network quality"},
        {rank:8,country:"🇩🇰 Denmark",value:"~High",note:"Nordic latency leader"},
        {rank:9,country:"🇫🇮 Finland",value:"~High",note:"Quality building"},
        {rank:10,country:"🇸🇪 Sweden",value:"~High",note:"Nordic quality cluster"},
      ],
      consistency:[
        {rank:1,country:"🇨🇿 Czech Rep.",value:"Excellent",note:"Tied #1 despite lower speed"},
        {rank:2,country:"🇳🇱 Netherlands",value:"Excellent",note:"Tied #1 Video Experience"},
        {rank:3,country:"🇦🇹 Austria",value:"Excellent",note:"Tied #1"},
        {rank:4,country:"🇳🇴 Norway",value:"Excellent",note:"Tied #1"},
        {rank:5,country:"🇯🇵 Japan",value:"Excellent",note:"15 countries at Excellent (up from 0 in 2019)"},
        {rank:6,country:"🇸🇬 Singapore",value:"Excellent",note:"City-state consistency"},
        {rank:7,country:"🇦🇺 Australia",value:"Excellent",note:"Urban areas strong"},
        {rank:8,country:"🇩🇰 Denmark",value:"Excellent",note:"Nordic cluster"},
        {rank:9,country:"🇸🇪 Sweden",value:"Excellent",note:"Nordic cluster"},
        {rank:10,country:"🇨🇭 Switzerland",value:"Excellent",note:"Dense network"},
      ],
    },
    trend:"Canada ties South Korea at 59 Mbps without 5G. 5G countries' speed rose 24.9% but non-5G countries rose 23.9% — nearly identical. The 5G premium is barely measurable.",
    counter:"Canada matching South Korea without 5G is the empirical refutation of the '5G is essential' narrative. Carriers pushing for 5G subsidies should have been asked: why can Canada match you on 4G alone?",
    lens:"5G's population-level impact in Year 1 is statistically indistinguishable from a well-invested 4G network. The $30–45 billion spectrum auction fees paid by U.S. carriers were partly paid to address a problem that 4G upgrades could have solved."
  },
  {
    id:"y2021", year:"2021", accent:"#d97706",
    era:"5G Scale-up: Taiwan shocks, Korea dominates",
    source:"OpenSignal Global Mobile Network Experience Awards Feb 2021 | 5G Global Awards Sep 2021",
    verified:true,
    note:"SK Telecom wins Download at 74.9 Mbps. FarEasTone Taiwan hits 447.8 Mbps 5G — world record. T-Mobile + STC Kuwait lead 5G availability at 35.7%.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 SK Telecom",value:"74.9",note:"3.2× global avg of 23.6 Mbps"},
        {rank:2,country:"🇨🇦 Telus (Canada)",value:"68.6",note:"Previous winner; 6.3 Mbps behind"},
        {rank:3,country:"🇦🇺 Telstra (Australia)",value:"67.3",note:"Joins 60+ Mbps club"},
        {rank:4,country:"🇰🇷 KT (Korea)",value:"~70",note:"Multiple Korean operators top group"},
        {rank:5,country:"🇳🇴 Telenor Norway",value:"~65",note:"European speed leader"},
        {rank:6,country:"🇸🇬 Singapore",value:"~62",note:"City-state consistency"},
        {rank:7,country:"🇫🇮 Finland",value:"~60",note:"Quality building pre-award era"},
        {rank:8,country:"🇩🇰 Denmark",value:"~68",note:"Upload champion"},
        {rank:9,country:"🇹🇼 Taiwan",value:"~85",note:"5G speed record building"},
        {rank:10,country:"🇨🇭 Switzerland",value:"~60",note:"Swisscom state-involved carrier"},
      ],
      availability:[
        {rank:1,country:"🇺🇸 T-Mobile",value:"35.7%",note:"5G availability leader; tied with STC Kuwait"},
        {rank:"1=",country:"🇸🇦 STC Kuwait",value:"33.6%",note:"Tied global winner 5G availability"},
        {rank:3,country:"🇰🇷 LG U+",value:"99.7%",note:"4G availability: 0.3pp from perfect"},
        {rank:4,country:"🇦🇪 UAE operators",value:"~90%+",note:"5G availability leader MENA"},
        {rank:5,country:"🇬🇧 EE / O2 UK",value:"~25%",note:"European 5G availability leaders"},
        {rank:6,country:"🇸🇬 Singapore",value:"~20%",note:"Dense deployment"},
        {rank:7,country:"🇰🇷 SK Telecom",value:"~30%",note:"Korean 5G growing"},
        {rank:8,country:"🇦🇺 Telstra",value:"~18%",note:"Australian 5G expanding"},
        {rank:9,country:"🇨🇦 Rogers",value:"~15%",note:"Canadian 5G rollout"},
        {rank:10,country:"🇩🇪 Deutsche Telekom",value:"~15%",note:"German 5G expansion"},
      ],
      reliability:[
        {rank:1,country:"🇨🇭 Swisscom",value:"Top",note:"Wins Upload Speed Experience (51% govt-owned)"},
        {rank:2,country:"🇯🇵 Japan (NTT)",value:"High",note:"Latency excellence"},
        {rank:3,country:"🇩🇰 Denmark",value:"High",note:"European latency leader"},
        {rank:4,country:"🇸🇬 Singtel",value:"High",note:"APAC reliability leader"},
        {rank:5,country:"🇰🇷 SK Telecom",value:"High",note:"5G SA network reliability"},
        {rank:6,country:"🇫🇮 Finland",value:"High",note:"Nordic quality"},
        {rank:7,country:"🇸🇪 Sweden",value:"High",note:"Nordic cluster"},
        {rank:8,country:"🇳🇴 Norway",value:"High",note:"Nordic reliability"},
        {rank:9,country:"🇳🇱 Netherlands",value:"High",note:"Dense European network"},
        {rank:10,country:"🇦🇺 Australia",value:"Med-High",note:"Urban reliability strong"},
      ],
      consistency:[
        {rank:1,country:"🇫🇮 Telia Finland",value:"~90%",note:"Pre-award benchmark; sole winner 2022"},
        {rank:2,country:"🇩🇰 Denmark operators",value:"~88%",note:"Consistent quality cluster"},
        {rank:3,country:"🇸🇪 Swedish operators",value:"~86%",note:"Nordic quality convergence"},
        {rank:4,country:"🇨🇭 Switzerland",value:"~85%",note:"Small dense market advantage"},
        {rank:5,country:"🇳🇴 Norway",value:"~84%",note:"Consistent quality improving"},
        {rank:6,country:"🇸🇬 Singapore",value:"~82%",note:"City-state quality"},
        {rank:7,country:"🇪🇪 Estonia",value:"~82%",note:"Pre-award performance building"},
        {rank:8,country:"🇰🇷 South Korea",value:"~80%",note:"5G consistency improving"},
        {rank:9,country:"🇳🇱 Netherlands",value:"~78%",note:"Dense European market"},
        {rank:10,country:"🇦🇺 Australia",value:"~76%",note:"Urban quality strong"},
      ],
    },
    trend:"SK Telecom wins Download at 74.9 Mbps — 3.2× the global average. Taiwan's FarEasTone hits 447.8 Mbps 5G — world record. T-Mobile USA leads 5G availability. Switzerland's state-owned Swisscom wins Upload.",
    counter:"T-Mobile's 5G availability lead covers the country with low-band 5G averaging ~50–60 Mbps. South Korea's 5G users get 4× that speed. 'Availability' flatters countries that deployed cheap widespread 5G.",
    lens:"Swisscom winning Upload with 51% government ownership is a recurring pattern. The Schumpeterian argument that private monopoly investment leads to innovation is not supported by network performance data."
  },
  {
    id:"y2022", year:"2022", accent:"#be185d",
    era:"5G Maturity: Consistency metrics born",
    source:"OpenSignal Global Mobile Network Experience Awards Feb 2022",
    verified:true,
    note:"FIRST EVER Consistent Quality metric. Telia Finland + Telia Estonia: 90.8–91.1% (joint winners). LG U+ wins 4G Availability at 99.8%.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 SK Telecom",value:"~120",note:"Award winner; trajectory confirmed"},
        {rank:2,country:"🇰🇷 KT (Korea)",value:"~105",note:"Korea dominates top download"},
        {rank:3,country:"🇳🇴 Telenor Norway",value:"~95",note:"European speed leader"},
        {rank:4,country:"🇦🇺 Telstra",value:"~90",note:"Australian 5G SA deployment"},
        {rank:5,country:"🇨🇦 Telus/Rogers",value:"~85",note:"Canadian operators"},
        {rank:6,country:"🇩🇰 Denmark's 3",value:"~88",note:"Upload champion; speed also strong"},
        {rank:7,country:"🇫🇮 Finland",value:"~90",note:"Quality and speed converging"},
        {rank:8,country:"🇸🇬 Singapore",value:"~78",note:"City-state performance"},
        {rank:9,country:"🇸🇪 Sweden",value:"~82",note:"Nordic cluster"},
        {rank:10,country:"🇨🇭 Switzerland",value:"~82",note:"Swisscom dense coverage"},
      ],
      availability:[
        {rank:1,country:"🇰🇷 LG U+",value:"99.8%",note:"Global Winner 4G; 13.3pp above global avg"},
        {rank:2,country:"🇰🇷 SK Telecom",value:"~99.5%",note:"Korean operators dominate"},
        {rank:3,country:"🇯🇵 NTT Docomo",value:"~99%",note:"Near ceiling"},
        {rank:4,country:"🇺🇸 T-Mobile",value:"~50%",note:"5G availability leader USA"},
        {rank:5,country:"🇸🇦 STC Saudi",value:"~45%",note:"5G availability MENA leader"},
        {rank:6,country:"🇦🇪 UAE",value:"~42%",note:"Gulf states expanding"},
        {rank:7,country:"🇰🇷 KT Korea",value:"~99%",note:"All Korean operators near ceiling"},
        {rank:8,country:"🇸🇬 Singapore",value:"~30%",note:"Dense city 5G"},
        {rank:9,country:"🇬🇧 EE UK",value:"~28%",note:"UK 5G growing"},
        {rank:10,country:"🇦🇺 Telstra",value:"~22%",note:"Australian 5G expanding"},
      ],
      reliability:[
        {rank:1,country:"🇩🇰 Denmark",value:"High",note:"Telenor + 3 Denmark"},
        {rank:2,country:"🇫🇮 Finland",value:"High",note:"Telia Finland wins Consistent Quality"},
        {rank:3,country:"🇯🇵 Japan",value:"High",note:"au / NTT latency leaders"},
        {rank:4,country:"🇸🇬 Singapore",value:"High",note:"All 3 operators Global Leaders"},
        {rank:5,country:"🇨🇭 Switzerland",value:"High",note:"Swisscom/Sunrise quality"},
        {rank:6,country:"🇸🇪 Sweden",value:"High",note:"Nordic cluster"},
        {rank:7,country:"🇳🇴 Norway",value:"High",note:"Nordic cluster"},
        {rank:8,country:"🇪🇪 Estonia",value:"High",note:"Baltic quality"},
        {rank:9,country:"🇳🇱 Netherlands",value:"High",note:"Dense European market"},
        {rank:10,country:"🇰🇷 South Korea",value:"High",note:"5G SA network quality"},
      ],
      consistency:[
        {rank:1,country:"🇫🇮 Telia Finland",value:"91.1%",note:"SOLE winner Core CQ: 97.2%; first ever Consistent Quality award"},
        {rank:"1=",country:"🇪🇪 Telia Estonia",value:"90.8%",note:"Joint winner — Baltic quality surprise"},
        {rank:3,country:"🇩🇰 Denmark operators",value:"~89%",note:"All operators strong"},
        {rank:4,country:"🇳🇴 Norway",value:"~87%",note:"Nordic consistency cluster"},
        {rank:5,country:"🇸🇪 Sweden",value:"~86%",note:"Nordic cluster"},
        {rank:6,country:"🇸🇬 Singapore",value:"~85%",note:"Only non-Nordic/Baltic in top group"},
        {rank:7,country:"🇨🇭 Switzerland",value:"~84%",note:"Dense market quality"},
        {rank:8,country:"🇰🇷 South Korea",value:"~80%",note:"5G consistency strong"},
        {rank:9,country:"🇳🇱 Netherlands",value:"~78%",note:"European dense market"},
        {rank:10,country:"🇦🇺 Australia",value:"~76%",note:"Urban quality strong"},
      ],
    },
    trend:"The first Consistent Quality metric reveals Europe's true advantage — Finland and Estonia win on a measure the industry had never used before. LG U+ achieves 99.8% 4G availability. South Korea leads download speed.",
    counter:"The introduction of Consistent Quality in 2022 is an admission: peak speed was always the wrong measurement. If regulators had used this since 2016, the U.S. carrier industry's performance record would look dramatically worse.",
    lens:"Regulators defining measurement criteria after the investment cycle is complete is textbook regulatory capture. U.S. carriers lobbied against quality-based metrics for a decade — peak speed ads were their marketing strategy."
  },
  {
    id:"y2023", year:"2023", accent:"#0284c7",
    era:"5G Consolidation: Korea at 131.7 Mbps",
    source:"OpenSignal Global Mobile Network Experience Awards Feb 2023 | 5G Global Awards Oct 2023",
    verified:true,
    note:"SK Telecom sole Download winner at 131.7 Mbps — 4.2× global average of 31.5 Mbps. KT only other operator >100 Mbps. Telia Finland retains CQ at 97.2% Core CQ.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 SK Telecom",value:"131.7",note:"Sole winner; 4.2× global avg of 31.5 Mbps"},
        {rank:2,country:"🇰🇷 KT (Korea)",value:"105.7",note:"Only other operator >100 Mbps globally"},
        {rank:3,country:"🇳🇴 Telenor Norway",value:"93.8",note:"Tied with Telia Norway; European #1"},
        {rank:"3=",country:"🇳🇴 Telia Norway",value:"91",note:"Both Norwegian operators tied"},
        {rank:5,country:"🇸🇬 Singtel",value:"~85",note:"Singapore Global Leaders"},
        {rank:6,country:"🇫🇮 DNA Finland",value:"~100",note:"Finnish operator global leader"},
        {rank:7,country:"🇦🇺 Telstra",value:"~82",note:"Australian 5G maturing"},
        {rank:8,country:"🇨🇦 Telus",value:"~80",note:"Canadian operator"},
        {rank:9,country:"🇩🇰 Denmark operators",value:"~89",note:"Nordic speed cluster"},
        {rank:10,country:"🇸🇪 Swedish operators",value:"~88",note:"Nordic speed cluster"},
      ],
      availability:[
        {rank:1,country:"🇰🇷 LG U+",value:"~99.8%",note:"Retains 4G availability crown"},
        {rank:2,country:"🇯🇵 Japan (all)",value:"~99.5%",note:"Near-ceiling"},
        {rank:3,country:"🇺🇸 T-Mobile",value:"~60%",note:"5G availability growing"},
        {rank:4,country:"🇸🇦 STC Saudi",value:"~55%",note:"MENA 5G leader"},
        {rank:5,country:"🇦🇪 UAE operators",value:"~50%",note:"Gulf 5G expansion"},
        {rank:6,country:"🇰🇷 SK Telecom",value:"~99.5%",note:"All Korean operators near ceiling"},
        {rank:7,country:"🇸🇬 Singapore",value:"~35%",note:"Dense 5G deployment"},
        {rank:8,country:"🇦🇺 Telstra",value:"~28%",note:"Australian 5G expanding"},
        {rank:9,country:"🇬🇧 EE",value:"~32%",note:"UK 5G growing"},
        {rank:10,country:"🇮🇳 Jio India",value:"~25%",note:"India 5G rollout accelerating"},
      ],
      reliability:[
        {rank:1,country:"🇯🇵 Japan",value:"High",note:"Quality triple crown contender"},
        {rank:2,country:"🇩🇰 Denmark",value:"High",note:"All operators Global Leaders"},
        {rank:3,country:"🇫🇮 Finland",value:"High",note:"Telia Finland retains CQ crown"},
        {rank:4,country:"🇸🇬 Singapore",value:"High",note:"Dense network reliability"},
        {rank:5,country:"🇨🇭 Switzerland",value:"High",note:"State-involved carrier leads"},
        {rank:6,country:"🇸🇪 Sweden",value:"High",note:"Nordic cluster"},
        {rank:7,country:"🇪🇪 Estonia",value:"High",note:"Baltic quality leader"},
        {rank:8,country:"🇳🇴 Norway",value:"High",note:"Nordic cluster"},
        {rank:9,country:"🇰🇷 South Korea",value:"High",note:"5G SA quality"},
        {rank:10,country:"🇦🇺 Australia",value:"Med-High",note:"Urban areas strong"},
      ],
      consistency:[
        {rank:1,country:"🇫🇮 Telia Finland",value:"97.2%",note:"Sole winner Core CQ; 90.8–91.1% Excellent CQ"},
        {rank:2,country:"🇩🇰 Denmark operators",value:"~90%",note:"All operators Global Leaders"},
        {rank:3,country:"🇸🇪 Sweden operators",value:"~88%",note:"Nordic cluster"},
        {rank:4,country:"🇳🇴 Norway",value:"~87%",note:"All operators improving"},
        {rank:5,country:"🇸🇬 Singapore",value:"~84%",note:"Consistent quality improver"},
        {rank:6,country:"🇨🇭 Switzerland",value:"~85%",note:"Dense market quality"},
        {rank:7,country:"🇪🇪 Estonia",value:"~88%",note:"Baltic quality"},
        {rank:8,country:"🇰🇷 South Korea",value:"~80%",note:"5G consistency strong"},
        {rank:9,country:"🇯🇵 Japan",value:"~79%",note:"Reliability champion"},
        {rank:10,country:"🇦🇺 Australia",value:"~77%",note:"Urban quality"},
      ],
    },
    trend:"SK Telecom at 131.7 Mbps is 4.2× the global average — the gap between leaders and laggards has never been wider. Telia Finland retains CQ for the second straight year. Nordic carriers collectively dominant across quality metrics.",
    counter:"SK Telecom at 4.2× global average is not a market success story — it's a market failure story for everyone else. The global average is only 31.5 Mbps in 2023, four years after 5G launched.",
    lens:"The 4.2× gap between SK Telecom and the global average is the structural inequality argument in one number. Countries that allowed consolidation and then regulated the consolidated entities (Korea, Finland) outperformed those that tried neither."
  },
  {
    id:"y2024apac", year:"2024", accent:"#06b6d4",
    era:"APAC Benchmark: Four leaders, zero dominant",
    source:"OpenSignal APAC Benchmark Sep 2024 — PRIMARY SOURCE (uploaded screenshots). Data: Apr–Jun 2024.",
    verified:true,
    isUploaded:true,
    note:"PRIMARY SOURCE — uploaded OpenSignal APAC screenshots. Data collection: April 1–June 30, 2024. APAC region only.",
    metrics:{
      download:[
        {rank:1,country:"🇰🇷 South Korea",value:"133.3",note:"68% faster than #2 — dominant"},
        {rank:2,country:"🇸🇬 Singapore",value:"79.4",note:"Strong consistent performer"},
        {rank:3,country:"🇹🇼 Taiwan",value:"69.7",note:"Close to Singapore"},
        {rank:4,country:"🇦🇺 Australia",value:"66.6",note:"Mature Telstra/Optus 5G"},
        {rank:5,country:"🇮🇳 India",value:"66.5",note:"Jio + Airtel 5G rollout"},
        {rank:6,country:"🇲🇾 Malaysia",value:"54.8",note:"DNB wholesale 5G model"},
        {rank:7,country:"🇳🇿 New Zealand",value:"52.1",note:"Spark/Vodafone NZ 5G"},
        {rank:8,country:"🇵🇭 Philippines",value:"38.4",note:"Globe/PLDT 5G rollout"},
        {rank:9,country:"🇻🇳 Vietnam",value:"28",note:"Viettel 5G early stage"},
        {rank:10,country:"🇹🇭 Thailand",value:"35",note:"AIS/True/DTAC 5G"},
        {rank:11,country:"🇯🇵 Japan",value:"45.9",note:"Reliability champion but slower speed"},
        {rank:12,country:"🇮🇩 Indonesia",value:"22",note:"Telkomsel 5G early"},
        {rank:13,country:"🇭🇰 Hong Kong",value:"62",note:"Compact geography advantage"},
      ],
      availability:[
        {rank:1,country:"🇮🇳 India",value:"52.1%",note:"5G availability leader — Jio mass rollout"},
        {rank:2,country:"🇸🇬 Singapore",value:"35.9%",note:"Dense city full 3.5GHz deployment"},
        {rank:3,country:"🇰🇷 South Korea",value:"34.0%",note:"Mature SA network"},
        {rank:4,country:"🇲🇾 Malaysia",value:"31.8%",note:"DNB wholesale 5G model payoff"},
        {rank:5,country:"🇹🇼 Taiwan",value:"29.7%",note:"Competitive operator market"},
        {rank:6,country:"🇦🇺 Australia",value:"19.2%",note:"Telstra/Optus 5G expanding"},
        {rank:7,country:"🇹🇭 Thailand",value:"18%",note:"AIS 5G rollout"},
        {rank:8,country:"🇵🇭 Philippines",value:"14%",note:"Globe/PLDT expanding"},
        {rank:9,country:"🇭🇰 Hong Kong",value:"12%",note:"Dense but measured"},
        {rank:10,country:"🇯🇵 Japan",value:"10.4%",note:"Cautious 5G rollout — quality focus"},
        {rank:11,country:"🇻🇳 Vietnam",value:"12%",note:"Viettel early stage"},
        {rank:12,country:"🇳🇿 New Zealand",value:"15%",note:"Spark/Vodafone NZ"},
        {rank:13,country:"🇮🇩 Indonesia",value:"8%",note:"Early 5G rollout"},
      ],
      reliability:[
        {rank:1,country:"🇯🇵 Japan",value:"913",note:"Highest reliability in APAC (100–1000 scale)"},
        {rank:2,country:"🇹🇼 Taiwan",value:"894",note:"Tied with HK and Korea"},
        {rank:3,country:"🇭🇰 Hong Kong",value:"893",note:"Compact geography advantage"},
        {rank:"3=",country:"🇰🇷 South Korea",value:"893",note:"Tied with Hong Kong"},
        {rank:5,country:"🇸🇬 Singapore",value:"890",note:"Consistent across all metrics"},
        {rank:6,country:"🇦🇺 Australia",value:"875",note:"Urban reliability strong"},
        {rank:7,country:"🇲🇾 Malaysia",value:"862",note:"DNB model quality"},
        {rank:8,country:"🇳🇿 New Zealand",value:"855",note:"Smaller market reliability"},
        {rank:9,country:"🇹🇭 Thailand",value:"840",note:"AIS network quality"},
        {rank:10,country:"🇮🇳 India",value:"820",note:"Jio reliability improving"},
        {rank:11,country:"🇵🇭 Philippines",value:"798",note:"Growing reliability"},
        {rank:12,country:"🇻🇳 Vietnam",value:"785",note:"Early stage reliability"},
        {rank:13,country:"🇮🇩 Indonesia",value:"762",note:"Telkomsel improving"},
      ],
      consistency:[
        {rank:1,country:"🇹🇼 Taiwan",value:"81.1%",note:"Best consistent quality in APAC"},
        {rank:2,country:"🇰🇷 South Korea",value:"80.2%",note:"Close second"},
        {rank:3,country:"🇯🇵 Japan",value:"78.9%",note:"High reliability + high consistency"},
        {rank:4,country:"🇦🇺 Australia",value:"77.8%",note:"Tied with Singapore"},
        {rank:"4=",country:"🇸🇬 Singapore",value:"77.8%",note:"Tied with Australia"},
        {rank:6,country:"🇭🇰 Hong Kong",value:"74.2%",note:"Dense network quality"},
        {rank:7,country:"🇲🇾 Malaysia",value:"71.5%",note:"DNB model consistency"},
        {rank:8,country:"🇳🇿 New Zealand",value:"69.8%",note:"Smaller market"},
        {rank:9,country:"🇹🇭 Thailand",value:"62.1%",note:"Growing quality"},
        {rank:10,country:"🇮🇳 India",value:"58.4%",note:"Mass market trade-off"},
        {rank:11,country:"🇵🇭 Philippines",value:"55.2%",note:"Developing quality"},
        {rank:12,country:"🇻🇳 Vietnam",value:"52.8%",note:"Early stage"},
        {rank:13,country:"🇮🇩 Indonesia",value:"48.1%",note:"Early stage"},
      ],
    },
    trend:"South Korea leads APAC download by a massive margin. India leads 5G availability at 52.1%. Japan tops reliability, Taiwan tops consistency. Four different leaders across four metrics — no single country wins everything.",
    counter:"India's 5G availability lead is structurally precarious: speeds are declining as congestion outpaces deployment. South Korea's 133.3 Mbps vs Japan's 45.9 Mbps reveals deliberate trade-offs, not failures.",
    lens:"The four-metric divergence in 2024 is the antitrust argument in data form: you cannot have a single welfare metric for a network market. A regulator who monitors only download speed will systematically misjudge the market."
  },
  {
    id:"y2025", year:"2025–2026", accent:"#f97316",
    era:"5G SA Era: T-Mobile USA surges, Korea still supreme",
    source:"OpenSignal Global Mobile Network Experience Awards Feb 2025 | Feb 2026",
    verified:true,
    note:"T-Mobile USA wins Download Speed large land-area at 152.5 Mbps (H2 2024). SK Telecom wins Download small land-area. au Japan wins quality triple crown. Norway ice wins Consistent Quality.",
    metrics:{
      download:[
        {rank:1,country:"🇺🇸 T-Mobile USA",value:"152.5–180.2",note:"Global Winner large land-area"},
        {rank:"1=",country:"🇰🇷 SK Telecom",value:"~150",note:"Global Winner small land-area"},
        {rank:3,country:"🇳🇴 Telenor Norway",value:"127",note:"European #1"},
        {rank:4,country:"🇫🇮 DNA Finland",value:"~120",note:"Global Leader all 6 categories"},
        {rank:5,country:"🇸🇬 Singtel/StarHub/M1",value:"~Top",note:"All 3 Singapore operators Global Leaders"},
        {rank:6,country:"🇩🇰 Denmark operators",value:"~115",note:"All 4 Danish operators Global Leaders"},
        {rank:7,country:"🇸🇪 Swedish operators",value:"~110",note:"Nordic cluster"},
        {rank:8,country:"🇦🇺 Telstra",value:"~90",note:"Australian 5G SA maturing"},
        {rank:9,country:"🇨🇦 Telus/Rogers",value:"~88",note:"Canadian operators strong"},
        {rank:10,country:"🇯🇵 au/NTT/SoftBank",value:"~70",note:"Japan reliability focus; lower speed"},
      ],
      availability:[
        {rank:1,country:"🇰🇷 LG U+",value:"99.8%",note:"Global Winner small land area"},
        {rank:2,country:"🇺🇸 AT&T",value:"99.3–99.6%",note:"Global Winner large land area (tied)"},
        {rank:"2=",country:"🇯🇵 Rakuten/SoftBank/au",value:"99.3–99.6%",note:"Tied Global Winners"},
        {rank:"2=",country:"🇳🇴 ice / Telia Norway",value:"99.3–99.6%",note:"Norway joins near-ceiling group"},
        {rank:5,country:"🇮🇳 Jio India",value:"~99%",note:"Global Leader large land area"},
        {rank:6,country:"🇰🇷 SK Telecom",value:"~99.5%",note:"All Korean operators near ceiling"},
        {rank:7,country:"🇸🇬 All operators",value:"~40%",note:"Dense 5G availability"},
        {rank:8,country:"🇦🇺 Telstra",value:"~35%",note:"Australian 5G expanding"},
        {rank:9,country:"🇸🇦 STC Saudi",value:"~65%",note:"MENA 5G leader"},
        {rank:10,country:"🇬🇧 EE / VMO2",value:"~50%",note:"UK 5G mature"},
      ],
      reliability:[
        {rank:1,country:"🇯🇵 au",value:"~Top",note:"Global Winner Reliability, Games, Voice App"},
        {rank:2,country:"🇰🇷 SK Telecom",value:"~Top",note:"Global Winner small land area Reliability (2026)"},
        {rank:3,country:"🇩🇰 Denmark (all 4)",value:"~Top",note:"All 4 Danish operators Global Leaders"},
        {rank:4,country:"🇫🇮 DNA/Telia/Elisa",value:"~Top",note:"All 3 Finnish operators Global Leaders"},
        {rank:5,country:"🇳🇴 ice / Telenor",value:"~Top",note:"Global Leaders Reliability"},
        {rank:6,country:"🇸🇪 Swedish operators",value:"~Top",note:"All Swedish MNOs Global Leaders"},
        {rank:7,country:"🇸🇬 Singtel/StarHub/M1",value:"~Top",note:"City-state quality"},
        {rank:8,country:"🇨🇭 Swisscom/Sunrise",value:"High",note:"Swiss reliability"},
        {rank:9,country:"🇪🇪 Telia Estonia",value:"High",note:"Baltic quality leader"},
        {rank:10,country:"🇳🇱 Netherlands",value:"High",note:"Dense European quality"},
      ],
      consistency:[
        {rank:1,country:"🇳🇴 ice Norway",value:"87.2%",note:"Sole Global Winner large land area (2025)"},
        {rank:"1=",country:"🇰🇷 SK Telecom",value:"90.8%",note:"Global Winner small land area (2026)"},
        {rank:3,country:"🇩🇰 All 4 Danish operators",value:"~High",note:"All 4 MNOs Global Leaders"},
        {rank:4,country:"🇸🇪 All 4 Swedish operators",value:"~High",note:"All 4 Swedish MNOs Global Leaders"},
        {rank:5,country:"🇯🇵 au / SoftBank",value:"~High",note:"Japan au wins quality triple crown"},
        {rank:6,country:"🇫🇮 Finnish operators",value:"~High",note:"Finland retains Nordic leadership"},
        {rank:7,country:"🇸🇬 All operators",value:"~High",note:"City-state consistency"},
        {rank:8,country:"🇨🇭 Swisscom",value:"~High",note:"Dense market quality"},
        {rank:9,country:"🇪🇪 Telia Estonia",value:"~High",note:"Baltic quality"},
        {rank:10,country:"🇳🇱 Netherlands",value:"High",note:"Dense European market"},
      ],
    },
    trend:"T-Mobile USA wins Global Download for the first time at 152.5 Mbps. SK Telecom retains small land-area supremacy. Japan's au wins the quality triple crown. Norway's ice wins Consistent Quality as a challenger operator.",
    counter:"T-Mobile's win masks AT&T and Verizon not being Global Winners. T-Mobile won by betting on mid-band spectrum its rivals shunned for mmWave theatre. The market rewarded the right call — but only after a decade of misleading consumers.",
    lens:"Norway's ice winning Consistent Quality is the final antitrust paradox: ice survived because Norway's regulator mandated infrastructure access for challengers. The market winner in consistency is a product of regulation, not market forces."
  }
];

const METRIC_KEYS = ["download","availability","reliability","consistency"];
const METRIC_LABELS = {
  download:{ label:"Download Speed", unit:"Mbps", icon:"⬇" },
  availability:{ label:"Availability", unit:"% time on 4G/5G", icon:"📶" },
  reliability:{ label:"Reliability", unit:"score / description", icon:"🔒" },
  consistency:{ label:"Consistent Quality", unit:"% / score", icon:"✅" },
};

function getBarWidth(value, metric) {
  const n = parseFloat(String(value).replace(/[^0-9.]/g,"")) || 0;
  if (metric==="download") return Math.min((n/200)*100,100);
  if (metric==="availability") return Math.min(n,100);
  if (metric==="reliability") return Math.min((n/1000)*100,100);
  if (metric==="consistency") return Math.min(n,100);
  return 0;
}

// ─── CHART DATA BUILDERS ──────────────────────────────────────────────────────
function buildLineData(selectedCountries) {
  return CHART_YEARS.map(yr => {
    const point = { year: yr };
    selectedCountries.forEach(c => {
      const val = COUNTRY_DB[c]?.speeds?.[yr];
      point[c] = val != null ? val : null;
    });
    return point;
  });
}


// ─── COUNTRY SELECTOR COMPONENT ──────────────────────────────────────────────
function CountrySelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = ALL_COUNTRIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase()) && !selected.includes(c)
  );

  return (
    <div style={{ position:"relative", display:"inline-block" }} ref={ref}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{padding:"0.28rem 0.7rem",border:"1px solid #1a1a28",background:"transparent",color:"#555",cursor:"pointer",fontSize:"0.63rem",fontFamily:"monospace",borderRadius:"2px"}}>
        + ADD COUNTRY
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:100,background:"#0d0d1a",border:"1px solid #1e1e30",minWidth:200,boxShadow:"0 8px 24px #00000088"}}>
          <input autoFocus value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search country…"
            style={{width:"100%",padding:"0.4rem 0.6rem",background:"#06060f",border:"none",borderBottom:"1px solid #1e1e30",color:"#ddd",fontSize:"0.65rem",fontFamily:"monospace",boxSizing:"border-box",outline:"none"}}/>
          <div style={{maxHeight:200,overflowY:"auto"}}>
            {filtered.length === 0 && (
              <div style={{padding:"0.5rem 0.7rem",fontSize:"0.63rem",color:"#444",fontFamily:"monospace"}}>No results</div>
            )}
            {filtered.map(c => (
              <button key={c} onClick={()=>{ onChange([...selected,c]); setSearch(""); setOpen(false); }}
                style={{display:"flex",alignItems:"center",gap:"0.4rem",width:"100%",padding:"0.38rem 0.7rem",background:"transparent",border:"none",color:"#aaa",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace",textAlign:"left"}}
                onMouseEnter={e=>e.currentTarget.style.background="#111122"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{width:8,height:8,borderRadius:"50%",background:countryColor(c),flexShrink:0,display:"inline-block"}}/>
                {COUNTRY_DB[c].flag} {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SELECTED PILLS ───────────────────────────────────────────────────────────
function CountryPills({ selected, onChange, defaults }) {
  return (
    <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",alignItems:"center",marginBottom:"0.65rem"}}>
      {selected.map(c => (
        <span key={c} style={{display:"inline-flex",alignItems:"center",gap:"0.3rem",padding:"0.2rem 0.5rem",background:`${countryColor(c)}18`,border:`1px solid ${countryColor(c)}55`,borderRadius:"2px",fontSize:"0.6rem",fontFamily:"monospace",color:countryColor(c)}}>
          {COUNTRY_DB[c]?.flag} {c}
          {!defaults.includes(c) && (
            <button onClick={()=>onChange(selected.filter(x=>x!==c))}
              style={{background:"none",border:"none",color:countryColor(c),cursor:"pointer",padding:0,marginLeft:"0.1rem",fontSize:"0.7rem",lineHeight:1}}>×</button>
          )}
        </span>
      ))}
      <CountrySelector selected={selected} onChange={onChange}/>
    </div>
  );
}

// ─── CUSTOM TOOLTIPS ──────────────────────────────────────────────────────────
const TooltipLine = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#0d0d1a",border:"1px solid #1e1e30",padding:"0.6rem 0.8rem",fontSize:"0.65rem",fontFamily:"monospace"}}>
      <div style={{color:"#666",marginBottom:"0.25rem"}}>{label}</div>
      {payload.filter(p=>p.value!=null).sort((a,b)=>b.value-a.value).map((p,i)=>(
        <div key={i} style={{color:p.color}}>{COUNTRY_DB[p.dataKey]?.flag} {p.dataKey}: <strong>{p.value} Mbps</strong></div>
      ))}
    </div>
  );
};



// ─── CHARTS SECTION ───────────────────────────────────────────────────────────
const CHART_TITLE = "Average Download Speed: The 10-Year Race";

// Build MNO scatter data — exclude Global Avg and countries with no mno value
function buildMnoData() {
  return Object.entries(COUNTRY_DB)
    .filter(([, d]) => d.mno != null)
    .map(([name, d]) => {
      // Use latest available speed
      const latestYear = Object.keys(d.speeds).filter(y => d.speeds[y] != null).sort().reverse()[0];
      return {
        country: name,
        flag: d.flag,
        mno: d.mno,
        speed: d.speeds[latestYear],
        speedYear: latestYear,
        regulated: d.regulated,
        mnoNote: d.mnoNote,
        mnoSource: d.mnoSource,
        speedSource: d.speedSource,
      };
    });
}

// Custom tooltip for MNO scatter — shows full citation
const MnoTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{background:"#0a0a14",border:"1px solid #1e2035",padding:"0.75rem 0.9rem",fontSize:"0.62rem",fontFamily:"monospace",maxWidth:320,lineHeight:1.75,boxShadow:"0 8px 32px #00000099"}}>
      <div style={{fontSize:"0.82rem",marginBottom:"0.3rem"}}>{d.flag} <strong style={{color:"#ddd8d0"}}>{d.country}</strong></div>
      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"0.15rem 0.6rem",marginBottom:"0.5rem"}}>
        <span style={{color:"#555"}}>MNOs</span><span style={{color:"#06b6d4",fontWeight:"bold"}}>{d.mno}</span>
        <span style={{color:"#555"}}>Speed</span><span style={{color:"#e94560",fontWeight:"bold"}}>{d.speed} Mbps <span style={{color:"#444",fontWeight:"normal"}}>({d.speedYear})</span></span>
        <span style={{color:"#555"}}>Regulation</span><span style={{color:d.regulated?"#10b981":"#f59e0b"}}>{d.regulated ? "✓ access-regulated" : "✗ unregulated"}</span>
      </div>
      <div style={{borderTop:"1px solid #161625",paddingTop:"0.4rem",marginBottom:"0.35rem"}}>
        <div style={{color:"#444",fontSize:"0.58rem",marginBottom:"0.15rem"}}>MARKET NOTE</div>
        <div style={{color:"#888"}}>{d.mnoNote}</div>
      </div>
      <div style={{borderTop:"1px solid #161625",paddingTop:"0.4rem",marginBottom:"0.2rem"}}>
        <div style={{color:"#444",fontSize:"0.58rem",marginBottom:"0.15rem"}}>SOURCE — MNO COUNT</div>
        <div style={{color:"#666",fontSize:"0.59rem"}}>{d.mnoSource}</div>
      </div>
      <div style={{borderTop:"1px solid #161625",paddingTop:"0.4rem"}}>
        <div style={{color:"#444",fontSize:"0.58rem",marginBottom:"0.15rem"}}>SOURCE — SPEED DATA</div>
        <div style={{color:"#666",fontSize:"0.59rem"}}>{d.speedSource}</div>
      </div>
    </div>
  );
};

function ChartsSection() {
  const [activeChart, setActiveChart] = useState(0);
  const [selected, setSelected] = useState([...DEFAULT_SELECTED]);
  const defaults = DEFAULT_SELECTED;
  const lineData = buildLineData(selected);
  const mnoData = buildMnoData();

  return (
    <div style={{marginTop:"1.5rem"}}>
      <div style={{borderTop:"1px solid #0f0f1a",paddingTop:"1.25rem",marginBottom:"1rem"}}>
        <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.3em",color:"#e94560",textTransform:"uppercase",marginBottom:"0.3rem"}}>
          ANTITRUST INSIGHT CHARTS
        </div>
        <h2 style={{margin:"0 0 0.3rem",fontSize:"1.1rem",fontWeight:"normal",color:"#ddd8d0"}}>
          Two Charts That Tell the Antitrust Story
        </h2>
      </div>

      {/* Chart tabs */}
      <div style={{display:"flex",gap:"0.3rem",marginBottom:"1rem",flexWrap:"wrap"}}>
        {[
          {id:0, icon:"📈", label: CHART_TITLE, color:"#e94560"},
          {id:1, icon:"🔬", label:"MNO Count vs Speed", color:"#06b6d4"},
        ].map(t=>(
          <button key={t.id} onClick={()=>setActiveChart(t.id)}
            style={{padding:"0.35rem 0.75rem",border:activeChart===t.id?`1px solid ${t.color}`:"1px solid #1a1a28",background:activeChart===t.id?`${t.color}15`:"transparent",color:activeChart===t.id?t.color:"#555",borderRadius:"2px",cursor:"pointer",fontSize:"0.63rem",fontFamily:"monospace",whiteSpace:"nowrap"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── CHART 0: Line — Download Speed Race ── */}
      {activeChart===0 && (<>
        <div style={{background:"#08080f",border:"1px solid #0f0f1a",padding:"0.75rem",marginBottom:"0.85rem"}}>
          <div style={{fontFamily:"monospace",fontSize:"0.52rem",letterSpacing:"0.2em",color:"#444",textTransform:"uppercase",marginBottom:"0.45rem"}}>
            SELECT COUNTRIES TO COMPARE — {ALL_COUNTRIES.length} available
          </div>
          <CountryPills selected={selected} onChange={setSelected} defaults={defaults}/>
          <div style={{fontSize:"0.58rem",color:"#333",fontFamily:"monospace"}}>
            Default countries cannot be removed · gaps = no data for that year · Vietnam &amp; Thailand appear from 2024 only
          </div>
        </div>
        <div style={{background:"#0a0a14",border:"1px solid #161625",borderTop:"2px solid #e94560",padding:"1rem"}}>
          <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:"#e94560",textTransform:"uppercase",marginBottom:"0.2rem"}}>📈 {CHART_TITLE}</div>
          <div style={{fontSize:"0.63rem",color:"#555",marginBottom:"0.85rem"}}>Average download speed across all users &amp; connections (Mbps) · OpenSignal primary data · 2016–2025 · gaps = no data published that year</div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={lineData} margin={{top:5,right:20,left:0,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f0f1a"/>
              <XAxis dataKey="year" stroke="#333" tick={{fontSize:9,fill:"#555",fontFamily:"monospace"}}/>
              <YAxis stroke="#333" tick={{fontSize:9,fill:"#555",fontFamily:"monospace"}} unit=" Mbps" width={72}/>
              <Tooltip content={<TooltipLine/>}/>
              <Legend wrapperStyle={{fontSize:"0.6rem",fontFamily:"monospace",color:"#666",paddingTop:"0.5rem"}}
                formatter={(value)=>`${COUNTRY_DB[value]?.flag || ""} ${value}`}/>
              <ReferenceLine x="2019" stroke="#222" strokeDasharray="4 4">
                <Label value="5G Launch" position="top" fill="#333" fontSize={8} fontFamily="monospace"/>
              </ReferenceLine>
              {selected.map(c => (
                <Line key={c} type="monotone" dataKey={c} stroke={countryColor(c)}
                  strokeWidth={c==="Global Avg"?1.5:2}
                  strokeDasharray={c==="Global Avg"?"5 3":undefined}
                  dot={{r:3,fill:countryColor(c)}} connectNulls={false}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{marginTop:"0.75rem",background:"#06060f",border:"1px solid #1a1a28",padding:"0.65rem",fontSize:"0.65rem",lineHeight:1.75,color:"#666"}}>
            <span style={{color:"#e94560",fontFamily:"monospace",fontSize:"0.52rem",letterSpacing:"0.1em"}}>⚖️ ANTITRUST READ — </span>
            Every number here is the <em>population-wide average</em> — not peak 5G speed, but what a typical user experienced across all their connections (2G/3G/4G/5G combined). This is the metric that matters for antitrust: it captures whether fast infrastructure actually reaches ordinary consumers. Korea held the top spot for nearly a decade under a 3-carrier regulated oligopoly, while the USA — also 3 carriers, but unregulated — lagged by 80–100 Mbps through 2022.{" "}
            <span style={{color:"#ddd8d0"}}>The gap is not carrier count. It is regulatory discipline on deployment.</span>
            <span style={{color:"#444"}}> Counterargument: The USA eventually closed the gap — not through regulation, but through T-Mobile's post-merger sprint on mid-band 5G. By 2025, T-Mobile's 152.5 Mbps (large-country winner) rivals Korea's 150 Mbps. That is the market-competition argument in its strongest form: given enough time and spectrum freedom, private incentive catches up. The question for antitrust is whether a decade of lagging service for 330 million people was an acceptable cost of that experiment.</span>
          </div>
        </div>
      </>)}

      {/* ── CHART 1: MNO Count vs Speed ── */}
      {activeChart===1 && (
        <div style={{background:"#0a0a14",border:"1px solid #161625",borderTop:"2px solid #06b6d4",padding:"1rem"}}>
          <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:"#06b6d4",textTransform:"uppercase",marginBottom:"0.2rem"}}>🔬 MNO COUNT vs DOWNLOAD SPEED</div>
          <div style={{fontSize:"0.63rem",color:"#555",marginBottom:"0.4rem"}}>
            X = number of commercially active MNOs · Y = latest available download speed · hover any dot for full source citation
          </div>
          <div style={{display:"flex",gap:"1.2rem",marginBottom:"0.75rem",fontSize:"0.59rem",fontFamily:"monospace",flexWrap:"wrap"}}>
            <span style={{color:"#10b981"}}>● access-regulated market</span>
            <span style={{color:"#f59e0b"}}>● unregulated market</span>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{top:10,right:30,left:10,bottom:30}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f0f1a"/>
              <XAxis type="number" dataKey="mno" name="MNOs" domain={[0,5]}
                stroke="#333" tick={{fontSize:9,fill:"#555",fontFamily:"monospace"}} ticks={[1,2,3,4,5]}
                label={{value:"Number of MNOs",position:"insideBottom",offset:-18,fill:"#444",fontSize:9,fontFamily:"monospace"}}/>
              <YAxis type="number" dataKey="speed" name="Speed" domain={[0,170]}
                stroke="#333" tick={{fontSize:9,fill:"#555",fontFamily:"monospace"}} unit=" Mbps" width={68}/>
              <Tooltip content={<MnoTooltip/>} cursor={{strokeDasharray:"3 3",stroke:"#333"}}/>
              <Scatter name="Access-regulated" data={mnoData.filter(d=>d.regulated)}
                shape={(props)=>{
                  const {cx,cy,payload}=props;
                  return <g><circle cx={cx} cy={cy} r={7} fill="#10b981" opacity={0.8} stroke="#10b98133" strokeWidth={1}/><text x={cx} y={cy-11} textAnchor="middle" fontSize={10} fill="#10b981" opacity={0.9} fontFamily="monospace">{payload.flag}</text></g>;
                }}/>
              <Scatter name="Unregulated" data={mnoData.filter(d=>!d.regulated)}
                shape={(props)=>{
                  const {cx,cy,payload}=props;
                  return <g><circle cx={cx} cy={cy} r={7} fill="#f59e0b" opacity={0.8} stroke="#f59e0b33" strokeWidth={1}/><text x={cx} y={cy-11} textAnchor="middle" fontSize={10} fill="#f59e0b" opacity={0.9} fontFamily="monospace">{payload.flag}</text></g>;
                }}/>
              <Legend wrapperStyle={{fontSize:"0.6rem",fontFamily:"monospace",paddingTop:"0.5rem"}}/>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{marginTop:"0.75rem",background:"#06060f",border:"1px solid #1a1a28",padding:"0.65rem",fontSize:"0.65rem",lineHeight:1.75,color:"#666"}}>
            <span style={{color:"#06b6d4",fontFamily:"monospace",fontSize:"0.52rem",letterSpacing:"0.1em"}}>⚖️ ANTITRUST READ — </span>
            There is no clean correlation between MNO count and speed. Japan has 4 MNOs and ranks near the bottom in APAC speed. Malaysia has 1 MNO (wholesale model) and outperforms both Japan and Thailand.{" "}
            <span style={{color:"#ddd8d0"}}>Thailand's drop to 2 MNOs after the True/DTAC merger (2023) is a live natural experiment — already showing lower speeds and dead MVNO sector.</span>
            <span style={{color:"#444"}}> Counterargument: USA with 3 unregulated MNOs eventually reached 152.5 Mbps. The scatter suggests the Schumpeterian argument is not dead — just slow.</span>
          </div>
          <div style={{marginTop:"0.5rem",background:"#07070f",border:"1px solid #0f0f18",padding:"0.55rem 0.7rem",fontSize:"0.59rem",color:"#333",lineHeight:1.7,fontFamily:"monospace"}}>
            <span style={{color:"#3a3a4a"}}>📋 SOURCE METHOD — </span>
            MNO counts = commercially active operators with own licensed spectrum, as of 2024. Excludes sub-brands and MVNOs.
            Speed = latest available year per country. Each dot cites its national regulator source + OpenSignal report on hover.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── POLICY EVENTS ────────────────────────────────────────────────────────────
const POLICY_EVENTS = [
  {year:"2015",event:"Norway mandates infrastructure access for challenger operators (ice network launches)",type:"regulation"},
  {year:"2017",event:"FCC votes to repeal net neutrality — U.S. light-touch deregulation peak",type:"deregulation"},
  {year:"2018",event:"U.S. begins Huawei restrictions — spectrum policy becomes national security policy",type:"geopolitics"},
  {year:"2019",event:"Korea launches world's first commercial 5G (April). FCC completes C-band auction framework.",type:"deployment"},
  {year:"2020",event:"T-Mobile merges with Sprint — U.S. goes from 4 to 3 carriers. Canada ties Korea without 5G.",type:"consolidation"},
  {year:"2021",event:"EU 5G Toolbox — member states assess vendor risk (de facto Huawei ban)",type:"regulation"},
  {year:"2022",event:"OpenSignal introduces Consistent Quality metric globally for the first time",type:"measurement"},
  {year:"2022",event:"India's Jio launches 5G — world's fastest mass-market 5G rollout begins",type:"deployment"},
  {year:"2023",event:"Malaysia's DNB: single wholesale network model — one infrastructure, multiple virtual operators",type:"regulation"},
  {year:"2024",event:"EU Gigabit Infrastructure Act — consolidated access regulation across member states",type:"regulation"},
  {year:"2025",event:"T-Mobile wins Global Download Award — first U.S. carrier ever to win OpenSignal global speed award",type:"milestone"},
];
const EVENT_COLORS = {regulation:"#10b981",deregulation:"#e94560",geopolitics:"#f59e0b",deployment:"#06b6d4",consolidation:"#7c3aed",measurement:"#3b82f6",milestone:"#f97316"};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [yr, setYr] = useState(YEARS[YEARS.length-2]);
  const [metric, setMetric] = useState("download");
  const [showC, setShowC] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const data = yr.metrics[metric];
  const acc = yr.accent;
  const top5 = data ? data.slice(0,5) : [];
  const rest = data ? data.slice(5) : [];

  return (
    <div style={{fontFamily:"Georgia,serif",background:"#06060f",minHeight:"100vh",color:"#ddd8d0"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#06060f,#100820,#060f18)",borderBottom:"1px solid #ffffff07",padding:"1.5rem 1.5rem 1rem"}}>
        <div style={{maxWidth:920,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.3em",color:"#e94560",textTransform:"uppercase",marginBottom:"0.3rem"}}>
            ANTITRUST · OPENSIGNAL PRIMARY DATA · 2016–2026
          </div>
          <h1 style={{margin:"0 0 0.3rem",fontSize:"clamp(1.1rem,3vw,1.8rem)",fontWeight:"normal",lineHeight:1.2}}>
            Mobile Speed Rankings — A 10-Year Story<br/>
          </h1>
          <p style={{margin:0,fontSize:"0.73rem",color:"#555",maxWidth:560,lineHeight:1.6}}>
            Every figure from OpenSignal primary reports · Download · Availability · Reliability · Consistent Quality
          </p>
        </div>
      </div>

      <div style={{maxWidth:920,margin:"0 auto",padding:"1rem 1.5rem"}}>

        {/* YEAR SELECTOR */}
        <div style={{marginBottom:"1rem"}}>
          <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.2em",color:"#555",textTransform:"uppercase",marginBottom:"0.4rem"}}>SELECT YEAR</div>
          <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap",alignItems:"center"}}>
            {YEARS.map(y => (
              <button key={y.id} onClick={()=>{setYr(y);setShowC(false);setShowAll(false);}}
                style={{padding:"0.3rem 0.65rem",border:yr.id===y.id?`1px solid ${y.accent}`:"1px solid #1a1a28",background:yr.id===y.id?`${y.accent}18`:"transparent",color:yr.id===y.id?y.accent:"#555",borderRadius:"2px",cursor:"pointer",fontSize:"0.67rem",fontFamily:"monospace",position:"relative",whiteSpace:"nowrap"}}>
                {y.year}
                {y.isUploaded&&<span style={{position:"absolute",top:-3,right:-3,background:"#06b6d4",borderRadius:"50%",width:5,height:5,display:"block"}}/>}
                {!y.verified&&<span style={{position:"absolute",top:-3,left:-3,background:"#f59e0b",borderRadius:"50%",width:5,height:5,display:"block"}}/>}
              </button>
            ))}
            <span style={{fontSize:"0.55rem",color:"#333",fontFamily:"monospace",marginLeft:"0.2rem"}}>● uploaded  ● estimated</span>
          </div>
        </div>

        {/* ERA HEADER */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.6rem"}}>
          <div>
            <span style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.2em",color:acc,textTransform:"uppercase"}}>{yr.year}</span>
            <h2 style={{margin:"0.1rem 0 0.05rem",fontSize:"0.95rem",fontWeight:"normal"}}>{yr.era}</h2>
          </div>
          <div style={{fontSize:"0.58rem",fontFamily:"monospace",color:yr.verified?"#10b981":"#f59e0b",background:yr.verified?"#10b98110":"#f59e0b10",border:`1px solid ${yr.verified?"#10b98125":"#f59e0b25"}`,padding:"0.28rem 0.55rem",lineHeight:1.55,maxWidth:280}}>
            {yr.verified?"✓ VERIFIED":"⚠ ESTIMATED"}<br/>
            <span style={{color:"#444",fontSize:"0.54rem"}}>{yr.source}</span>
          </div>
        </div>

        <div style={{fontSize:"0.66rem",color:"#666",background:"#0a0a14",borderLeft:`2px solid ${acc}44`,padding:"0.4rem 0.65rem",marginBottom:"0.85rem",fontStyle:"italic",lineHeight:1.5}}>{yr.note}</div>

        {/* METRIC TABS */}
        <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap",marginBottom:"0.75rem"}}>
          {METRIC_KEYS.map(k => {
            const hasData = yr.metrics[k] !== null;
            return (
              <button key={k} onClick={()=>hasData&&setMetric(k)}
                style={{padding:"0.28rem 0.7rem",fontSize:"0.63rem",fontFamily:"monospace",border:metric===k?`1px solid ${acc}`:"1px solid #1a1a28",background:metric===k?`${acc}15`:"transparent",color:metric===k?acc:hasData?"#555":"#2a2a35",cursor:hasData?"pointer":"not-allowed",borderRadius:"2px",opacity:hasData?1:0.4}}>
                {METRIC_LABELS[k].icon} {METRIC_LABELS[k].label}
                {!hasData&&<span style={{marginLeft:"0.3rem",fontSize:"0.5rem"}}>N/A</span>}
              </button>
            );
          })}
        </div>

        {/* MAIN GRID */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.85rem"}}>

          {/* RANKINGS with See More */}
          <div style={{background:"#0a0a14",border:"1px solid #161625",borderTop:`2px solid ${acc}`,padding:"0.9rem"}}>
            <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:acc,textTransform:"uppercase",marginBottom:"0.65rem"}}>
              {METRIC_LABELS[metric].icon} {METRIC_LABELS[metric].label} — {METRIC_LABELS[metric].unit}
              {data && <span style={{marginLeft:"0.5rem",color:"#333",fontSize:"0.5rem"}}>({data.length} countries)</span>}
            </div>
            {data ? (
              <>
                {/* TOP 5 */}
                {top5.map((r,i) => {
                  const w = getBarWidth(r.value, metric);
                  return (
                    <div key={i} style={{marginBottom:"0.65rem"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontSize:"0.78rem"}}>
                          <span style={{fontFamily:"monospace",color:r.rank===1||r.rank==="1="?acc:"#3a3a4a",marginRight:"0.3rem",fontSize:"0.63rem"}}>
                            {typeof r.rank==="number"?`#${r.rank}`:r.rank}
                          </span>
                          {r.country}
                        </span>
                        <span style={{fontFamily:"monospace",fontSize:"0.65rem",color:acc,marginLeft:"0.4rem"}}>{r.value}</span>
                      </div>
                      {w>0&&(
                        <div style={{height:2,background:"#161625",borderRadius:2,margin:"0.18rem 0 0.13rem"}}>
                          <div style={{height:"100%",width:`${w}%`,background:acc,borderRadius:2,opacity:0.55}}/>
                        </div>
                      )}
                      <div style={{fontSize:"0.59rem",color:"#404050"}}>{r.note}</div>
                    </div>
                  );
                })}

                {/* EXPANDED rest */}
                {showAll && rest.map((r,i) => {
                  const w = getBarWidth(r.value, metric);
                  return (
                    <div key={i} style={{marginBottom:"0.65rem",opacity:0.8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontSize:"0.75rem"}}>
                          <span style={{fontFamily:"monospace",color:"#3a3a4a",marginRight:"0.3rem",fontSize:"0.6rem"}}>
                            {typeof r.rank==="number"?`#${r.rank}`:r.rank}
                          </span>
                          {r.country}
                        </span>
                        <span style={{fontFamily:"monospace",fontSize:"0.62rem",color:"#666",marginLeft:"0.4rem"}}>{r.value}</span>
                      </div>
                      {w>0&&(
                        <div style={{height:2,background:"#161625",borderRadius:2,margin:"0.18rem 0 0.13rem"}}>
                          <div style={{height:"100%",width:`${w}%`,background:"#444",borderRadius:2,opacity:0.4}}/>
                        </div>
                      )}
                      <div style={{fontSize:"0.57rem",color:"#333"}}>{r.note}</div>
                    </div>
                  );
                })}

                {/* SEE MORE / LESS button */}
                {rest.length > 0 && (
                  <button onClick={()=>setShowAll(v=>!v)}
                    style={{marginTop:"0.3rem",padding:"0.28rem 0.6rem",background:"transparent",border:`1px solid ${acc}33`,color:acc,cursor:"pointer",fontSize:"0.58rem",fontFamily:"monospace",width:"100%",textAlign:"center",opacity:0.7}}>
                    {showAll ? `▲ SHOW LESS` : `▼ SEE MORE — ${rest.length} MORE COUNTRIES`}
                  </button>
                )}
              </>
            ) : (
              <div style={{fontSize:"0.75rem",color:"#333",fontStyle:"italic",padding:"1rem 0"}}>
                This metric was not published by OpenSignal for {yr.year}.<br/>
                <span style={{fontSize:"0.65rem",color:"#2a2a35"}}>Reliability and Consistent Quality were introduced in Global Awards starting 2022.</span>
              </div>
            )}
          </div>

          {/* ANALYSIS */}
          <div style={{display:"flex",flexDirection:"column",gap:"0.65rem"}}>
            <div style={{background:"#0a0a14",border:"1px solid #161625",borderTop:"2px solid #3b82f6",padding:"0.9rem",flex:1}}>
              <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:"#3b82f6",textTransform:"uppercase",marginBottom:"0.4rem"}}>📈 MAINSTREAM NARRATIVE</div>
              <p style={{margin:0,fontSize:"0.74rem",lineHeight:1.8,color:"#999"}}>{yr.trend}</p>
            </div>
            <button onClick={()=>setShowC(!showC)} style={{padding:"0.42rem 0.7rem",background:showC?"#150810":"transparent",border:"1px solid #e9456040",color:"#e94560",cursor:"pointer",fontSize:"0.61rem",letterSpacing:"0.1em",fontFamily:"monospace",textAlign:"left"}}>
              {showC?"▲ HIDE":"▼ BUT WAIT —"} CHALLENGE THIS
            </button>
            {showC&&(
              <div style={{background:"#110810",border:"1px solid #e9456018",padding:"0.85rem"}}>
                <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:"#e94560",textTransform:"uppercase",marginBottom:"0.35rem"}}>⚖️ COUNTERARGUMENT</div>
                <p style={{margin:"0 0 0.65rem",fontSize:"0.74rem",lineHeight:1.8,color:"#b88080"}}>{yr.counter}</p>
                <div style={{borderTop:"1px solid #2a1010",paddingTop:"0.6rem"}}>
                  <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:"#f59e0b",textTransform:"uppercase",marginBottom:"0.3rem"}}>🏛 ANTITRUST LENS</div>
                  <p style={{margin:0,fontSize:"0.72rem",lineHeight:1.8,color:"#b09060",fontStyle:"italic"}}>{yr.lens}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHARTS */}
        <ChartsSection />

        {/* ALL-YEARS QUICK COMPARE */}
        <div style={{marginTop:"1.25rem"}}>
          <button onClick={()=>setShowTimeline(!showTimeline)} style={{padding:"0.35rem 0.8rem",background:"transparent",border:"1px solid #161625",color:"#444",cursor:"pointer",fontSize:"0.61rem",letterSpacing:"0.1em",fontFamily:"monospace"}}>
            {showTimeline?"▲ HIDE":"▼ SHOW"} ALL-YEAR DOWNLOAD SPEED QUICK COMPARE
          </button>
          {showTimeline&&(
            <div style={{marginTop:"0.65rem",background:"#0a0a14",border:"1px solid #161625",padding:"0.9rem"}}>
              <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:"#3b82f6",textTransform:"uppercase",marginBottom:"0.65rem"}}>TOP DOWNLOAD SPEED WINNER BY YEAR</div>
              {YEARS.map(y=>{
                const d=y.metrics.download; const top=d?d[0]:null;
                return (
                  <div key={y.id} onClick={()=>{setYr(y);setMetric("download");setShowC(false);setShowAll(false);setShowTimeline(false);}}
                    style={{display:"flex",gap:"0.65rem",padding:"0.38rem 0",borderBottom:"1px solid #0f0f1a",cursor:"pointer",alignItems:"center",opacity:yr.id===y.id?1:0.6}}>
                    <div style={{fontFamily:"monospace",fontSize:"0.67rem",color:y.accent,minWidth:"4.5rem",fontWeight:"bold"}}>{y.year}</div>
                    <div style={{flex:1}}>
                      <div style={{height:2,background:"#161625",borderRadius:2}}>
                        <div style={{height:"100%",width:`${top?Math.min((parseFloat(top.value)/200)*100,100):0}%`,background:y.accent,borderRadius:2,opacity:0.6}}/>
                      </div>
                    </div>
                    <div style={{fontSize:"0.7rem",minWidth:"7rem"}}>{top?top.country:"—"}</div>
                    <div style={{fontFamily:"monospace",fontSize:"0.67rem",color:y.accent,minWidth:"4rem",textAlign:"right"}}>{top?`${top.value} Mbps`:"—"}</div>
                    {!y.verified&&<span style={{fontSize:"0.55rem",color:"#f59e0b",fontFamily:"monospace"}}>est.</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* POLICY TIMELINE */}
        <div style={{marginTop:"0.75rem"}}>
          <button onClick={()=>setShowPolicy(!showPolicy)} style={{padding:"0.35rem 0.8rem",background:"transparent",border:"1px solid #161625",color:"#444",cursor:"pointer",fontSize:"0.61rem",letterSpacing:"0.1em",fontFamily:"monospace"}}>
            {showPolicy?"▲ HIDE":"▼ SHOW"} POLICY & MARKET EVENTS TIMELINE
          </button>
          {showPolicy&&(
            <div style={{marginTop:"0.65rem",background:"#0a0a14",border:"1px solid #161625",padding:"0.9rem"}}>
              <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:"#f59e0b",textTransform:"uppercase",marginBottom:"0.65rem"}}>KEY REGULATORY & MARKET EVENTS 2015–2025</div>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.65rem"}}>
                {Object.entries(EVENT_COLORS).map(([type,color])=>(
                  <span key={type} style={{fontSize:"0.55rem",fontFamily:"monospace",color,background:`${color}12`,padding:"0.15rem 0.4rem",border:`1px solid ${color}25`}}>{type}</span>
                ))}
              </div>
              {POLICY_EVENTS.map((e,i)=>(
                <div key={i} style={{display:"flex",gap:"0.65rem",padding:"0.38rem 0",borderBottom:"1px solid #0f0f1a",alignItems:"flex-start"}}>
                  <div style={{fontFamily:"monospace",fontSize:"0.67rem",color:EVENT_COLORS[e.type],minWidth:"2.5rem",fontWeight:"bold"}}>{e.year}</div>
                  <div style={{width:6,height:6,background:EVENT_COLORS[e.type],borderRadius:"50%",marginTop:"0.35rem",flexShrink:0}}/>
                  <div style={{fontSize:"0.68rem",color:"#777",lineHeight:1.55}}>{e.event}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{marginTop:"1.25rem",borderTop:"1px solid #0f0f1a",paddingTop:"0.65rem",fontSize:"0.6rem",color:"#2e2e3e",lineHeight:1.7}}>
          <strong style={{color:"#404050"}}>Sources:</strong> OpenSignal Global State of Mobile Networks Aug 2016, Feb 2017, May 2019, May 2020 · Global Mobile Network Experience Awards Feb 2021–2026 · 5G Global Awards Sep 2021, Oct 2022–2023 · APAC Benchmark Sep 2024 (uploaded primary data) · All "~" = directional estimates from report text.
          <br/><em style={{color:"#e94560"}}>"The question is not only whether speeds increase. The question is who controls the architecture." — paraphrasing Lina Khan, The Amazon Antitrust Paradox</em>
        </div>
      </div>
    </div>
  );
}

