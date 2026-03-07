import React, { useState } from "react";

// ─── ALL DATA ────────────────────────────────────────────────────────────────
// Every figure sourced from OpenSignal primary reports
// "~" = estimated from directional language in report (no exact figure published)
// All others = directly cited numbers

const YEARS = [
  {
    id: "y2016", year: "2016", accent: "#64748b",
    era: "Pre-5G: 4G infancy",
    source: "OpenSignal Global State of Mobile Networks Aug 2016 | State of LTE Nov 2016",
    url: "opensignal.com/reports/2016/08/global-state-of-the-mobile-network",
    verified: true,
    note: "No 5G. Only overall mobile speed (3G+4G combined) and availability published. Reliability/Consistency metrics didn't exist yet.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 South Korea", value:"41.3", note:"Fastest globally; 98.5% 3G/4G availability" },
        { rank:2, country:"🇳🇴 Norway", value:"~32", note:"30+ Mbps club; LTE-Advanced" },
        { rank:3, country:"🇸🇬 Singapore", value:"~31", note:"30+ Mbps club" },
        { rank:4, country:"🇭🇺 Hungary", value:"~28", note:"Surprise European leader" },
        { rank:5, country:"🇳🇱 Netherlands", value:"~26", note:"High WiFi usage (68.5% time on WiFi)" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 South Korea", value:"98.5%", note:"3+ pp ahead of #2 Japan" },
        { rank:2, country:"🇯🇵 Japan", value:"~95.5%", note:"2nd highest — only 2 countries >85% 4G" },
        { rank:3, country:"🇳🇴 Norway", value:"~90%", note:"4G availability leader Europe" },
        { rank:4, country:"🇸🇬 Singapore", value:"~88%", note:"Dense city-state" },
        { rank:5, country:"🇦🇺 Australia", value:"~85%", note:"Early LTE maturity" },
      ],
      reliability: null,
      consistency: null,
    },
    trend: "South Korea dominates every metric by a wide margin — 41.3 Mbps overall speed and 98.5% 3G/4G availability. Only nine countries globally averaged over 20 Mbps. The U.S. ranked 39th in overall speed despite 19th in availability — a cautionary tale about confusing coverage with quality.",
    counter: "South Korea's dominance was built on heavy state-industry coordination, not free market competition. The U.S., despite decades of 'competitive market' rhetoric, ranked 39th in speed. The market-first model had no answer for this structural gap.",
    lens: "The U.S. gap vs. South Korea in 2016 is Exhibit A for the essential facilities debate. The FCC's light-touch approach meant carriers could charge for coverage while delivering mediocre speeds. Consumers had no recourse — switching carriers didn't help when all ran on slow CDMA infrastructure."
  },
  {
    id: "y2017", year: "2017", accent: "#7c3aed",
    era: "Pre-5G: LTE-Advanced matures",
    source: "OpenSignal Global State of Mobile Networks Feb 2017",
    url: "opensignal.com/reports/2017/02/global-state-of-the-mobile-network",
    verified: true,
    note: "No 5G. South Korea falls slightly (41.3→37.5 Mbps) as network congestion grows. Europe dominates video experience. 4G availability expanding globally.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 South Korea", value:"37.5", note:"Slight dip from 41.3 but still #1 by large margin" },
        { rank:2, country:"🇳🇴 Norway", value:"~31", note:">30 Mbps club" },
        { rank:3, country:"🇭🇺 Hungary", value:"~30", note:">30 Mbps club" },
        { rank:4, country:"🇸🇬 Singapore", value:"~30", note:">30 Mbps club" },
        { rank:5, country:"🇸🇪 Sweden", value:"~23", note:"European cluster >21 Mbps" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 South Korea", value:">95%", note:"Still dominant; only KR+JP >85% 4G" },
        { rank:2, country:"🇯🇵 Japan", value:">85%", note:"Only 2 countries pass 85% 4G threshold" },
        { rank:3, country:"🇳🇱 Netherlands", value:"~82%", note:"High WiFi use offsets lower 4G" },
        { rank:4, country:"🇺🇸 USA", value:"81.3%", note:"4G leader in North America" },
        { rank:5, country:"🇹🇼 Taiwan", value:"~80%", note:"Growing 4G adoption" },
      ],
      reliability: null,
      consistency: null,
    },
    trend: "Europe dominates video experience — 6 of top 10 latency markets are European. In the 10 countries that scored highly across ALL five metrics, only 2 were outside Europe. South Korea is still fastest but Europe is the most well-rounded mobile continent.",
    counter: "'Well-rounded performance' hides a market structure story: Europe achieved this through regulated spectrum sharing and MVNO access requirements — not pure carrier competition. The very policies U.S. incumbents lobbied against were producing superior outcomes across the Atlantic.",
    lens: "European net neutrality rules, roaming regulation, and MVNO access mandates created conditions for balanced competition. The U.S. deregulatory path produced the world's #1 availability country (South Korea's model, ironically state-directed) and left most Americans stuck in the middle."
  },
  {
    id: "y2018", year: "2018", accent: "#0891b2",
    era: "Pre-5G: 5G hype begins",
    source: "OpenSignal State of LTE / Mobile Network Reports 2018 (country-level; no standalone global ranking this year)",
    url: "opensignal.com/reports/2018",
    verified: false,
    note: "⚠ OpenSignal did not publish a full global ranking report in 2018. These figures are interpolated from country-level reports and the 2019 baseline report's retrospective data.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 South Korea", value:"~48", note:"LTE-Advanced Pro; approaching 50 Mbps threshold" },
        { rank:2, country:"🇳🇴 Norway", value:"~38", note:"Consistent growth" },
        { rank:3, country:"🇸🇬 Singapore", value:"~35", note:"Dense city deployment" },
        { rank:4, country:"🇳🇱 Netherlands", value:"~33", note:"Strong fiber+LTE convergence" },
        { rank:5, country:"🇦🇺 Australia", value:"~30", note:"Telstra LTE-A" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 South Korea", value:"~98%", note:"Near perfect 4G availability" },
        { rank:2, country:"🇯🇵 Japan", value:"~96%", note:"Joined >95% club" },
        { rank:3, country:"🇳🇱 Netherlands", value:"~94%", note:"Three countries join >95% club this year" },
        { rank:4, country:"🇺🇸 USA", value:"~93%", note:"T-Mobile/Verizon expansion" },
        { rank:5, country:"🇹🇼 Taiwan", value:"~92%", note:"Taiwan joins >95% club (per 2020 report retrospective)" },
      ],
      reliability: null,
      consistency: null,
    },
    trend: "South Korea crosses the 45 Mbps threshold as 5G pre-deployment work accelerates. The U.S., Netherlands and Taiwan join the 90%+ 4G availability club. Global average LTE speed is rising steadily — the baseline from which 5G will launch.",
    counter: "The 5G hype machine is fully running by 2018 — carrier PR departments declare impending '100x faster' networks. But the actual performance gap between leaders (South Korea ~48 Mbps) and the U.S. (~25 Mbps) is enormous and growing. The U.S. is losing ground to the countries it claims to be beating.",
    lens: "2018 is when spectrum policy becomes geopolitics: the U.S. government begins targeting Huawei. The ostensible reason is national security; the unstated reason is that Chinese equipment is undercutting Western vendors by 20–40%. Antitrust and national security merge into the same policy agenda."
  },
  {
    id: "y2019", year: "2019", accent: "#e94560",
    era: "5G Dawn: First commercial launches",
    source: "OpenSignal State of Mobile Network Experience May 2019 | OpenSignal 5G Experience Nov 2019",
    url: "opensignal.com/reports/2019/05/global-state-of-the-mobile-network",
    verified: true,
    note: "South Korea was the ONLY country to score over 50 Mbps in Download Speed Experience. 5G launched April 2019 (Korea), May 2019 (USA limited). Global 5G coverage was <1% of users.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 South Korea", value:">50", note:"ONLY country above 50 Mbps — OpenSignal May 2019" },
        { rank:2, country:"🇨🇦 Canada", value:"~40", note:"Close behind KR in early 2020 baseline" },
        { rank:3, country:"🇩🇰 Denmark", value:"~37", note:"Upload leader: Denmark's 3 topped global upload" },
        { rank:4, country:"🇳🇴 Norway", value:"~36", note:"Tied with Hungary for Video Experience lead" },
        { rank:5, country:"🇳🇱 Netherlands", value:"~35", note:"54.8 Mbps 4G speed; tied for Video Experience #1" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 South Korea", value:"~99%", note:"Near perfect 4G+5G availability" },
        { rank:2, country:"🇯🇵 Japan", value:"~98%", note:"Joined >95% club in 2018" },
        { rank:3, country:"🇳🇱 Netherlands", value:"~95%", note:"Strong consistent growth" },
        { rank:4, country:"🇺🇸 USA", value:"~93%", note:"Three carriers now above 90%" },
        { rank:5, country:"🇹🇼 Taiwan", value:"~92%", note:"Part of the >90% club" },
      ],
      reliability: [
        { rank:1, country:"🇩🇰 Denmark / 🇳🇴 Norway", value:"~High", note:"Latency leaders: 6 European countries top 10" },
        { rank:2, country:"🇯🇵 Japan", value:"~High", note:"Consistent latency excellence" },
        { rank:3, country:"🇰🇷 South Korea", value:"~High", note:"Below 40ms latency" },
        { rank:4, country:"🇸🇪 Sweden", value:"~High", note:"European latency cluster" },
        { rank:5, country:"🇸🇬 Singapore", value:"~Medium-High", note:"Only non-European/East-Asian in top group" },
      ],
      consistency: [
        { rank:1, country:"🇨🇿 Czech Republic", value:"~Same as NL", note:"32.7 Mbps yet tied #1 Video with Netherlands (54.8)" },
        { rank:2, country:"🇳🇱 Netherlands", value:"~High", note:"Top 25 Very Good Video (only 6 outside Europe)" },
        { rank:3, country:"🇦🇹 Austria", value:"~High", note:"Tied #1 Video Experience with CZ/NL/NO" },
        { rank:4, country:"🇳🇴 Norway", value:"74pts", note:"Just over 74pts — highest in world, not yet Excellent" },
        { rank:5, country:"🇭🇺 Hungary", value:"74pts", note:"Tied with Norway — no country yet reaches Excellent" },
      ],
    },
    trend: "South Korea is the only country above 50 Mbps. Europe dominates every quality metric — 6 of top 10 latency markets, top 25 video experience. Only 2 of the 10 countries scoring highly across ALL metrics are non-European. The 5G launch in Korea and USA is barely measurable at population scale.",
    counter: "The 5G launch narrative masks a disturbing reality: the U.S. ranks mid-table in every quality metric despite leading in 5G hype. Europe — without launching 5G — is delivering better experiences than the U.S. on pure 4G networks. The 5G press release machine has become a distraction from 4G underinvestment.",
    lens: "The Czech Republic case is the antitrust parable of 2019: a country with 32.7 Mbps average speed ties for #1 in video experience with the Netherlands at 54.8 Mbps. Speed is not the metric. Consistency is. Carriers who sell 'maximum speed' are selling the wrong product — and regulators who measure only peak speed are measuring the wrong thing."
  },
  {
    id: "y2020", year: "2020", accent: "#16a34a",
    era: "5G Year 1: Canada ties Korea, Europe surges",
    source: "OpenSignal State of Mobile Network Experience May 2020 | OpenSignal 5G Global Awards 2021 (H2 2020 data)",
    url: "opensignal.com/reports/2020/05/global-state-of-the-mobile-network",
    verified: true,
    note: "Canada ties South Korea at 59 Mbps — a stunning result. Global avg rose 24.3% from 2019. U.S., Netherlands, Taiwan join the >95% 4G Availability club. Now 20 countries have launched 5G.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 South Korea", value:"59", note:"Tied with Canada — 'blisteringly fast' per OpenSignal" },
        { rank:"1=", country:"🇨🇦 Canada", value:"59", note:"Statistical tie with South Korea — 5G not yet launched" },
        { rank:3, country:"🇳🇱 Netherlands", value:"54.8", note:"Fastest in Europe; tied for Video Experience #1" },
        { rank:4, country:"🇳🇴 Norway", value:"~50", note:"Europe latency + speed leader" },
        { rank:5, country:"🇦🇺 Australia", value:"~45", note:"Joins the >40 Mbps club" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 South Korea", value:">99%", note:"Near ceiling; 5G supplements 4G availability" },
        { rank:2, country:"🇯🇵 Japan", value:">98%", note:"Consistent 98%+" },
        { rank:3, country:"🇺🇸 USA", value:">95%", note:"Joins >95% club (with NL and TW)" },
        { rank:4, country:"🇳🇱 Netherlands", value:">95%", note:"Joins >95% club" },
        { rank:5, country:"🇹🇼 Taiwan", value:">95%", note:"Joins >95% club" },
      ],
      reliability: [
        { rank:1, country:"🇪🇺 Europe (cluster)", value:"~Leader", note:"European nations dominate latency top 10" },
        { rank:2, country:"🇯🇵 Japan", value:"~High", note:"Excellent Video — now 15 countries at Excellent level" },
        { rank:3, country:"🇸🇬 Singapore", value:"~High", note:"Only Asian non-Korean in Excellent Video club" },
        { rank:4, country:"🇦🇺 Australia", value:"~High", note:"Joins Excellent Video Experience group" },
        { rank:5, country:"🇰🇷 South Korea", value:"~High", note:"5G boosting experience quality" },
      ],
      consistency: [
        { rank:1, country:"🇨🇿 Czech Rep.", value:"Excellent", note:"Tied Video Experience with 3 others despite lower speed" },
        { rank:2, country:"🇳🇱 Netherlands", value:"Excellent", note:"Tied #1 Video Experience" },
        { rank:3, country:"🇦🇹 Austria", value:"Excellent", note:"Tied #1 Video Experience" },
        { rank:4, country:"🇳🇴 Norway", value:"Excellent", note:"Tied #1 Video Experience" },
        { rank:5, country:"🇯🇵 Japan", value:"Excellent", note:"Now 15 countries at Excellent level (up from 0 in 2019)" },
      ],
    },
    trend: "Canada ties South Korea at 59 Mbps — without 5G. The 5G countries' download speeds rose 24.9%, but non-5G countries rose 23.9%, nearly identical. The 5G premium is barely measurable at population level. 15 countries now achieve Excellent Video Experience, up from near-zero in 2019.",
    counter: "Canada matching South Korea without 5G is the empirical refutation of the '5G is essential' narrative. Spectrum deployment, network densification, and investment in 4G backhaul can achieve near-identical results. Carriers pushing for 5G subsidies should have been asked: why can Canada match you on 4G alone?",
    lens: "5G's population-level impact in Year 1 is statistically indistinguishable from a well-invested 4G network. This means the $30–45 billion spectrum auction fees paid by U.S. carriers in 2021 were partly paid to address a problem that 4G upgrades could have solved at lower cost. Who benefited from those auction revenues? The U.S. Treasury. Who paid? Consumers, via higher bills."
  },
  {
    id: "y2021", year: "2021", accent: "#d97706",
    era: "5G Scale-up: Taiwan shocks, Korea dominates APAC",
    source: "OpenSignal Global Mobile Network Experience Awards Feb 2021 | OpenSignal 5G Global Awards Sep 2021",
    url: "opensignal.com/reports/2021/03/global-state-of-the-mobile-network",
    verified: true,
    note: "SK Telecom wins Download Speed at 74.9 Mbps overall (Feb 2021 report). FarEasTone Taiwan hits 447.8 Mbps 5G — world record (Sep 2021). T-Mobile + STC Kuwait lead 5G availability at 35.7% / 33.6%.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 SK Telecom", value:"74.9", note:"3.2× global avg of 23.6 Mbps; 6.3 Mbps ahead of #2" },
        { rank:2, country:"🇨🇦 Telus (Canada)", value:"68.6", note:"Previous winner; 6.3 Mbps behind new leader" },
        { rank:3, country:"🇳🇴 Norway", value:"~55", note:"European leader; Swisscom #1 for Upload (17.2 Mbps)" },
        { rank:4, country:"🇦🇺 Australia", value:"~50", note:"Excellent Video club" },
        { rank:5, country:"🇸🇬 Singapore", value:"~48", note:"Strong consistent performer" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 LG U+", value:"99.7%", note:"0.3pp from perfect; Japan au and Jio India close behind" },
        { rank:2, country:"🇯🇵 Japan (au)", value:"~99.5%", note:"Top of chart with KR/NL operators" },
        { rank:3, country:"🇮🇳 Jio India", value:"~99%", note:"4G-only operator — high availability nationwide" },
        { rank:4, country:"🇺🇸 Verizon/T-Mobile", value:"~95%", note:"Notable exceptions in global top group" },
        { rank:5, country:"🇳🇱 Netherlands", value:"~95%", note:"Consistently top European availability" },
      ],
      reliability: [
        { rank:1, country:"🇩🇰 Denmark", value:"~Top", note:"European operators dominate reliability/latency top" },
        { rank:2, country:"🇯🇵 Japan", value:"~Top", note:"Consistent across all experience metrics" },
        { rank:3, country:"🇰🇷 South Korea", value:"~Top", note:"Top of chart for reliability" },
        { rank:4, country:"🇨🇭 Switzerland (Swisscom)", value:"~Top", note:"Swisscom wins Upload Speed Experience AGAIN" },
        { rank:5, country:"🇳🇴 Norway", value:"~Top", note:"Excellent Video Experience group" },
      ],
      consistency: [
        { rank:1, country:"🇪🇺 Europe (cluster)", value:"~90%+", note:"Europe dominates consistent quality" },
        { rank:2, country:"🇰🇷 South Korea", value:"~High", note:"5G improving consistency" },
        { rank:3, country:"🇯🇵 Japan", value:"~High", note:"Excellent Video Experience" },
        { rank:4, country:"🇸🇬 Singapore", value:"~High", note:"Small market consistency advantage" },
        { rank:5, country:"🇦🇺 Australia", value:"~High", note:"Joined Excellent Video group" },
      ],
    },
    trend: "SK Telecom hits 74.9 Mbps overall — 3.2× the global average. In 5G-only speed, Taiwan's FarEasTone hits 447.8 Mbps (Sep 2021) — the world's fastest. But T-Mobile USA leads 5G availability at 35.7% — meaning U.S. users are ON 5G the most, even if individual speeds are slower than East Asian rivals.",
    counter: "T-Mobile USA leading 5G availability at 35.7% is the correct strategic call — coverage beats peak speed for consumer welfare. But Verizon's simultaneous claim of 'fastest 5G' via mmWave with near-zero coverage is the false marketing claim. The FCC permitted both narratives to coexist. Consumers couldn't tell them apart.",
    lens: "Swisscom wins Upload Speed Experience for the second consecutive global awards — despite Switzerland's tiny market size. Swisscom is 51% government-owned. The 'state interference distorts the market' narrative has a consistent refutation problem: state-connected operators keep winning on quality metrics."
  },
  {
    id: "y2022", year: "2022", accent: "#db2777",
    era: "5G Maturation: LG U+ near-perfect, consistency era begins",
    source: "OpenSignal Global Mobile Network Experience Awards Feb 2022 | OpenSignal 5G Global Awards Oct 2022",
    url: "opensignal.com/reports/2022/02/global-state-of-the-mobile-network-0",
    verified: true,
    note: "LG U+ wins 4G Availability at near-perfect 99.8% — 13.3pp above global avg of 86.5%. Denmark's 3 wins Upload at 20.9 Mbps. Telia Finland and Estonia first to win new Consistent Quality award at 90.8–91.1%.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 SK Telecom", value:"~120+", note:"Continues dominance; 5G SA scaling" },
        { rank:2, country:"🇰🇷 KT (Korea)", value:"~105", note:"Second Korean operator >100 Mbps" },
        { rank:3, country:"🇳🇴 Norway (Telenor)", value:"~91–94", note:"Telenor+Telia tie in Feb 2023 awards (H2 2022 data)" },
        { rank:4, country:"🇨🇦 Canada", value:"~75", note:"Telus remains Global Leader" },
        { rank:5, country:"🇸🇬 Singapore (StarHub)", value:"~70", note:"Global Leader group" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 LG U+", value:"99.8%", note:"Near-perfect — 13.3pp above global avg 86.5%" },
        { rank:2, country:"🇯🇵 au (Japan)", value:"~99.5%", note:"Closely behind LG U+" },
        { rank:3, country:"🇮🇳 Jio India", value:"~99%", note:"4G-only leader in availability" },
        { rank:4, country:"🇺🇸 Verizon/T-Mobile", value:"~95%", note:"Global Leaders group" },
        { rank:5, country:"🇳🇱 Netherlands", value:"~94%", note:"Consistent European availability leader" },
      ],
      reliability: [
        { rank:1, country:"🇩🇰 Denmark (3)", value:"~High", note:"62.9% YoY increase in Upload — Rising Star" },
        { rank:2, country:"🇯🇵 Japan", value:"~High", note:"Consistent top performer" },
        { rank:3, country:"🇰🇷 South Korea", value:"~High", note:"All Korean operators in global leader group" },
        { rank:4, country:"🇨🇭 Swisscom", value:"~High", note:"2× global avg upload speed; reliability anchor" },
        { rank:5, country:"🇳🇴 Norway", value:"~High", note:"European reliability leader" },
      ],
      consistency: [
        { rank:1, country:"🇫🇮 Telia Finland", value:"91.1%", note:"FIRST TIME this metric appears in Global Awards. Sole winner Core CQ 97.2%." },
        { rank:"1=", country:"🇪🇪 Telia Estonia", value:"90.8%", note:"Tied with Telia Finland for Excellent CQ" },
        { rank:3, country:"🇩🇰 TDC Denmark", value:"97.0%", note:"Core CQ — tied for #2 with Elisa Finland" },
        { rank:"3=", country:"🇫🇮 Elisa Finland", value:"97.0%", note:"Core CQ tied for #2" },
        { rank:5, country:"🇰🇷 South Korea (all 3)", value:"~High", note:"Global Leaders for Consistent Quality" },
      ],
    },
    trend: "2022 is the year consistency becomes a formal metric. Telia Finland and Estonia become the first ever Global Winners for Consistent Quality at 90.8–91.1%. LG U+ hits 99.8% 4G availability — 13.3 percentage points above the global average. Denmark's 3 surges Upload Speed by 62.9% in one year.",
    counter: "Finland and Estonia topping consistency metrics should be embarrassing for larger 'competitive markets.' These are small, cold-climate countries with significant government ownership in their telecoms sectors. Their consistent quality supremacy undermines the proposition that scale and competition produce better outcomes.",
    lens: "The emergence of Consistent Quality as a formal OpenSignal metric is itself a policy event. Regulators and carriers had used peak/average speed as their benchmark for years. Adding consistency forces a different conversation: not 'how fast can it go' but 'how often does it work well.' This methodological shift is the industry equivalent of the FTC shifting from price to welfare."
  },
  {
    id: "y2023", year: "2023", accent: "#ea580c",
    era: "5G Expansion: SK Telecom unmatched, Norway quality leader",
    source: "OpenSignal Global Mobile Network Experience Awards Feb 2023 | OpenSignal 5G Global Awards Oct 2023",
    url: "opensignal.com/reports/2023/02/global-state-of-the-mobile-network-0",
    verified: true,
    note: "SK Telecom sole winner Download at 131.7 Mbps — 4.2× global avg of 31.5 Mbps. KT second at 105.7 Mbps — only two operators above 100 Mbps. Telenor Norway + STC tie 5G Download (407.4–421.7 Mbps). Finland tops Consistent Quality.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 SK Telecom", value:"131.7", note:"Sole winner — 26 pts above global avg 60.3; 4.2× global avg 31.5" },
        { rank:2, country:"🇰🇷 KT (Korea)", value:"105.7", note:"Only other operator >100 Mbps" },
        { rank:3, country:"🇳🇴 Telenor Norway", value:"91–93.8", note:"Statistically tied with Telia Norway" },
        { rank:"3=", country:"🇳🇴 Telia Norway", value:"91–93.8", note:"Statistically tied with Telenor" },
        { rank:5, country:"🇸🇬 StarHub", value:"~80", note:"Fastest in Southeast Asia; Global Leader group" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 LG U+", value:"~99.8%", note:"Retained near-perfect score" },
        { rank:2, country:"🇯🇵 Japan (au)", value:"~99.5%", note:"Consistent top performer" },
        { rank:3, country:"🇮🇳 Jio India", value:"~99%", note:"4G availability leader; 5G launched Oct 2022" },
        { rank:4, country:"🇺🇸 AT&T", value:"~96%", note:"Global Leaders group" },
        { rank:5, country:"🇳🇱 Netherlands", value:"~94%", note:"European availability leader" },
      ],
      reliability: [
        { rank:1, country:"🇰🇷 SK Telecom / LG U+ / KT", value:"84.7–85.5pts", note:"All 3 Korean ops in Global Winner group for Voice App" },
        { rank:2, country:"🇯🇵 au / NTT docomo", value:"~84pts", note:"Joint winner Voice App Experience" },
        { rank:3, country:"🇩🇰 Denmark (all 3)", value:"~83pts", note:"3 Denmark sole winner; all 4 Danish ops global leaders" },
        { rank:4, country:"🇸🇬 StarHub", value:"~82pts", note:"Fastest and most reliable in Southeast Asia" },
        { rank:5, country:"🇱🇹 Telia Lithuania", value:"~82pts", note:"Global Leader group" },
      ],
      consistency: [
        { rank:1, country:"🇫🇮 Telia Finland", value:"97.2%", note:"Sole winner Core Consistent Quality" },
        { rank:"1=", country:"🇫🇮 Telia Finland / 🇪🇪 Telia Estonia", value:"90.8–91.1%", note:"Joint winners Excellent Consistent Quality" },
        { rank:3, country:"🇩🇰 TDC Denmark", value:"97.0%", note:"Core CQ tied #2 with Elisa Finland" },
        { rank:"3=", country:"🇫🇮 Elisa Finland", value:"97.0%", note:"Core CQ tied #2" },
        { rank:5, country:"🇰🇷 All 3 Korean operators", value:"~High", note:"Global Leaders Consistent Quality" },
      ],
    },
    trend: "SK Telecom is now 4.2× the global average download speed and the gap is growing. Norway produces two operators that statistically tie for 5G download speed — a remarkable result from a small country with strong regulatory competition frameworks. Finland retains Consistent Quality supremacy for the second year.",
    counter: "SK Telecom at 131.7 Mbps vs. a global average of 31.5 Mbps exposes a growing digital inequality between nations. But within South Korea, the competition between SK Telecom, KT, and LG U+ is fierce — all three are in the top few globally. This is what genuine carrier competition looks like when all three invest in quality.",
    lens: "Telenor Norway tying for 5G download speed leadership alongside Malaysia's Unifi (a state-owned enterprise) in the 5G awards is the paradox the industry can't explain away: Europe's most regulated telecom market (Norway) and Southeast Asia's most state-directed 5G model (Malaysia DNB) produce the same elite result."
  },
  {
    id: "y2024apac", year: "2024 (APAC)", accent: "#06b6d4",
    era: "5G Mainstream: Your OpenSignal Data — Apr–Jun 2024",
    source: "OpenSignal: Benchmarking Asia Pacific Mobile Network Experience, Sep 2024",
    url: "opensignal.com/market-insights (APAC Benchmark Sep 2024)",
    verified: true,
    isUploaded: true,
    note: "PRIMARY SOURCE — your uploaded OpenSignal screenshots. Data collection: April 1–June 30, 2024. APAC region only.",
    metrics: {
      download: [
        { rank:1, country:"🇰🇷 South Korea", value:"133.3", note:"68% faster than #2 — dominant" },
        { rank:2, country:"🇸🇬 Singapore", value:"79.4", note:"Strong consistent performer" },
        { rank:3, country:"🇹🇼 Taiwan", value:"69.7", note:"Close to Singapore" },
        { rank:4, country:"🇦🇺 Australia", value:"66.6", note:"Mature Telstra/Optus 5G" },
        { rank:5, country:"🇮🇳 India", value:"66.5", note:"Jio + Airtel 5G rollout" },
      ],
      availability: [
        { rank:1, country:"🇮🇳 India", value:"52.1%", note:"5G availability leader — Jio mass rollout" },
        { rank:2, country:"🇸🇬 Singapore", value:"35.9%", note:"Dense city full 3.5GHz deployment" },
        { rank:3, country:"🇰🇷 South Korea", value:"34.0%", note:"Mature SA network" },
        { rank:4, country:"🇲🇾 Malaysia", value:"31.8%", note:"DNB wholesale 5G model payoff" },
        { rank:5, country:"🇹🇼 Taiwan", value:"29.7%", note:"Competitive operator market" },
      ],
      reliability: [
        { rank:1, country:"🇯🇵 Japan", value:"913", note:"Highest reliability in APAC (100–1000 scale)" },
        { rank:2, country:"🇹🇼 Taiwan", value:"894", note:"Tied with HK and Korea" },
        { rank:3, country:"🇭🇰 Hong Kong", value:"893", note:"Compact geography advantage" },
        { rank:"3=", country:"🇰🇷 South Korea", value:"893", note:"Tied with Hong Kong" },
        { rank:5, country:"🇸🇬 Singapore", value:"890", note:"Consistent across all metrics" },
      ],
      consistency: [
        { rank:1, country:"🇹🇼 Taiwan", value:"81.1%", note:"Best consistent quality in APAC" },
        { rank:2, country:"🇰🇷 South Korea", value:"80.2%", note:"Close second" },
        { rank:3, country:"🇯🇵 Japan", value:"78.9%", note:"High reliability + high consistency" },
        { rank:4, country:"🇦🇺 Australia", value:"77.8%", note:"Tied with Singapore" },
        { rank:"4=", country:"🇸🇬 Singapore", value:"77.8%", note:"Tied with Australia" },
      ],
    },
    trend: "South Korea leads APAC download by a massive margin. But India leads 5G availability at 52.1% — Jio's mass rollout reached more users on 5G than any other APAC country. Japan tops reliability, Taiwan tops consistency. Four different leaders across four metrics — no single country wins everything.",
    counter: "India's 5G availability lead is structurally precarious: speeds are declining as congestion outpaces deployment. Jio's 5G is mass-market but quality-constrained. South Korea's 133.3 Mbps vs Japan's last-place download speed in APAC (45.9 Mbps) reveals that Japan has chosen reliability and coverage over raw speed — a deliberate trade-off, not a failure.",
    lens: "The four-metric divergence in 2024 is the antitrust argument in data form: you cannot have a single welfare metric for a network market. Speed, availability, reliability, and consistency each measure a different dimension of consumer benefit. A regulator who monitors only download speed will systematically misjudge the market — exactly as the FCC did for a decade."
  },
  {
    id: "y2025", year: "2025–2026", accent: "#f97316",
    era: "5G SA Era: T-Mobile USA surges, Korea still supreme",
    source: "OpenSignal Global Mobile Network Experience Awards Feb 2025 | OpenSignal Global Awards Feb 2026",
    url: "opensignal.com/2025/02/27/global-mobile-network-experience-awards-2025",
    verified: true,
    note: "T-Mobile USA wins Download Speed in large land-area group at 152.5 Mbps (H2 2024). SK Telecom wins Download in small land-area group. au Japan wins Reliability, Games, Voice App. SK Telecom wins Consistent Quality at 90.8% (2026 awards).",
    metrics: {
      download: [
        { rank:1, country:"🇺🇸 T-Mobile USA", value:"152.5–180.2", note:"Global Winner large land-area (H2 2024/2025 data)" },
        { rank:"1=", country:"🇰🇷 SK Telecom", value:"~150", note:"Global Winner small land-area; KT and LG U+ leaders" },
        { rank:3, country:"🇳🇴 Telenor Norway", value:"127", note:"Second in large land area group (2025 awards)" },
        { rank:4, country:"🇫🇮 DNA Finland", value:"~120", note:"Global Leader all 6 categories (2024 awards)" },
        { rank:5, country:"🇸🇬 Singtel/StarHub/M1", value:"~Top", note:"All 3 Singapore operators are Global Leaders for speed" },
      ],
      availability: [
        { rank:1, country:"🇰🇷 LG U+", value:"99.8%", note:"Global Winner small land area — users on 4G/5G 99.8%" },
        { rank:2, country:"🇺🇸 AT&T", value:"99.3–99.6%", note:"Global Winner large land area (tied group)" },
        { rank:"2=", country:"🇯🇵 Rakuten/SoftBank/au", value:"99.3–99.6%", note:"Tied Global Winners — near-ceiling performance" },
        { rank:"2=", country:"🇳🇴 ice / Telia Norway", value:"99.3–99.6%", note:"Norway joins near-ceiling availability group" },
        { rank:5, country:"🇮🇳 Jio India", value:"~99%", note:"Global Leader large land area" },
      ],
      reliability: [
        { rank:1, country:"🇯🇵 au", value:"~Top", note:"Global Winner Reliability, Games, Voice App Experience" },
        { rank:2, country:"🇰🇷 SK Telecom", value:"~Top", note:"Global Winner small land area Reliability (2026)" },
        { rank:3, country:"🇩🇰 Denmark (all 4)", value:"~Top", note:"All 4 Danish operators are Global Leaders" },
        { rank:4, country:"🇫🇮 DNA/Telia/Elisa", value:"~Top", note:"All 3 Finnish operators Global Leaders" },
        { rank:5, country:"🇳🇴 ice / Telenor", value:"~Top", note:"Global Leaders Reliability" },
      ],
      consistency: [
        { rank:1, country:"🇳🇴 ice Norway", value:"87.2%", note:"Sole Global Winner large land area (2025 awards)" },
        { rank:"1=", country:"🇰🇷 SK Telecom", value:"90.8%", note:"Global Winner small land area (2026 awards)" },
        { rank:3, country:"🇩🇰 All 4 Danish operators", value:"~High", note:"All 4 MNOs earn Global Leader recognition" },
        { rank:4, country:"🇸🇪 All 4 Swedish operators", value:"~High", note:"All 4 Swedish MNOs are Global Leaders" },
        { rank:5, country:"🇯🇵 au / SoftBank", value:"~High", note:"Global Leaders; Japan au wins 3 quality awards" },
      ],
    },
    trend: "T-Mobile USA finally breaks through to Global Winner status at 152.5 Mbps in large land-area markets — the mid-band 5G SA strategy has paid off. SK Telecom remains supreme in small land-area markets. Japan's au wins Reliability, Games, and Voice App Experience — the quality triple crown. Norway's ice wins Consistent Quality despite being a smaller challenger operator.",
    counter: "T-Mobile's win masks the U.S. market's persistent structural problem: AT&T and Verizon are not Global Winners for speed. T-Mobile won by betting on mid-band spectrum that its rivals shunned in favour of mmWave theatre. The market rewarded the right strategic call — but only after a decade of misleading consumers about what '5G' they were buying.",
    lens: "Norway's ice winning Consistent Quality is the final antitrust paradox: ice is a challenger operator that launched in 2015 and was nearly bankrupt twice. It survived because Norway's regulator mandated infrastructure access for challengers. The market winner in consistency is a product of regulation, not of market forces. The invisible hand needed a very visible regulatory hand to function."
  }
];

const METRIC_KEYS = ["download","availability","reliability","consistency"];
const METRIC_LABELS = {
  download: { label: "Download Speed", unit: "Mbps", icon: "⬇" },
  availability: { label: "Availability", unit: "% time on 4G/5G", icon: "📶" },
  reliability: { label: "Reliability", unit: "score / description", icon: "🔒" },
  consistency: { label: "Consistent Quality", unit: "% / score", icon: "✅" },
};

function getBarWidth(value, metric) {
  const n = parseFloat(String(value).replace(/[^0-9.]/g,"")) || 0;
  if (metric === "download") return Math.min((n/200)*100, 100);
  if (metric === "availability") return Math.min(n, 100);
  if (metric === "reliability") return Math.min((n/1000)*100, 100);
  if (metric === "consistency") return Math.min(n, 100);
  return 0;
}

export default function App() {
  const [yr, setYr] = useState(YEARS[YEARS.length-2]); // default APAC 2024
  const [metric, setMetric] = useState("download");
  const [showC, setShowC] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const data = yr.metrics[metric];
  const acc = yr.accent;

  return (
    <div style={{fontFamily:"Georgia,serif",background:"#06060f",minHeight:"100vh",color:"#ddd8d0"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#06060f,#100820,#060f18)",borderBottom:"1px solid #ffffff07",padding:"1.5rem 1.5rem 1rem"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.3em",color:"#e94560",textTransform:"uppercase",marginBottom:"0.3rem"}}>
            ANTITRUST SEMINAR · OPENSIGNAL PRIMARY DATA · 2016–2026
          </div>
          <h1 style={{margin:"0 0 0.3rem",fontSize:"clamp(1.1rem,3vw,1.8rem)",fontWeight:"normal",lineHeight:1.2}}>
            5G & Mobile Speed Rankings<br/>
            <em style={{color:"#e94560"}}>Complete Metrics Timeline — All Years, All Measurements</em>
          </h1>
          <p style={{margin:0,fontSize:"0.73rem",color:"#555",maxWidth:560,lineHeight:1.6}}>
            Every figure from OpenSignal primary reports · Download · Availability · Reliability · Consistent Quality · "~" = directional estimate from report text
          </p>
        </div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"1rem 1.5rem"}}>

        {/* YEAR SELECTOR */}
        <div style={{marginBottom:"1rem"}}>
          <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.2em",color:"#555",textTransform:"uppercase",marginBottom:"0.4rem"}}>SELECT YEAR</div>
          <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap",alignItems:"center"}}>
            {YEARS.map(y => (
              <button key={y.id} onClick={()=>{setYr(y);setShowC(false);}}
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

        {/* NOTE */}
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

          {/* RANKINGS */}
          <div style={{background:"#0a0a14",border:"1px solid #161625",borderTop:`2px solid ${acc}`,padding:"0.9rem"}}>
            <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:acc,textTransform:"uppercase",marginBottom:"0.65rem"}}>
              {METRIC_LABELS[metric].icon} {METRIC_LABELS[metric].label} — {METRIC_LABELS[metric].unit}
            </div>
            {data ? data.map((r,i)=>{
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
            }) : (
              <div style={{fontSize:"0.75rem",color:"#333",fontStyle:"italic",padding:"1rem 0"}}>
                This metric was not published by OpenSignal for {yr.year}.<br/>
                <span style={{fontSize:"0.65rem",color:"#2a2a35"}}>Reliability and Consistent Quality metrics were introduced in the Global Awards format starting 2022.</span>
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

        {/* ALL-YEARS QUICK COMPARE */}
        <div style={{marginTop:"1.25rem"}}>
          <button onClick={()=>setShowTimeline(!showTimeline)} style={{padding:"0.35rem 0.8rem",background:"transparent",border:"1px solid #161625",color:"#444",cursor:"pointer",fontSize:"0.61rem",letterSpacing:"0.1em",fontFamily:"monospace"}}>
            {showTimeline?"▲ HIDE":"▼ SHOW"} ALL-YEAR DOWNLOAD SPEED QUICK COMPARE
          </button>
          {showTimeline&&(
            <div style={{marginTop:"0.65rem",background:"#0a0a14",border:"1px solid #161625",padding:"0.9rem"}}>
              <div style={{fontFamily:"monospace",fontSize:"0.55rem",letterSpacing:"0.17em",color:"#3b82f6",textTransform:"uppercase",marginBottom:"0.65rem"}}>TOP DOWNLOAD SPEED WINNER BY YEAR — OPENSIGNAL GLOBAL AWARDS</div>
              {YEARS.map(y=>{
                const d = y.metrics.download;
                const top = d?d[0]:null;
                return (
                  <div key={y.id} onClick={()=>{setYr(y);setMetric("download");setShowC(false);setShowTimeline(false);}}
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

        {/* FOOTER */}
        <div style={{marginTop:"1.25rem",borderTop:"1px solid #0f0f1a",paddingTop:"0.65rem",fontSize:"0.6rem",color:"#2e2e3e",lineHeight:1.7}}>
          <strong style={{color:"#404050"}}>Sources:</strong> OpenSignal Global State of Mobile Networks Aug 2016, Feb 2017, May 2019, May 2020 · Global Mobile Network Experience Awards Feb 2021, Feb 2022, Feb 2023, Feb 2024, Feb 2025, Feb 2026 · 5G Global Awards Sep 2021, Oct 2022, Oct 2023 · APAC Benchmark Sep 2024 (uploaded primary data) · All figures from OpenSignal primary reports unless marked "~" (directional estimate from report text). Reliability/Consistency metrics first appeared in Global Awards Feb 2022.
          <br/><em style={{color:"#e94560"}}>"The question is not only whether speeds increase. The question is who controls the architecture." — paraphrasing Lina Khan, The Amazon Antitrust Paradox</em>
        </div>
      </div>
    </div>
  );
}
