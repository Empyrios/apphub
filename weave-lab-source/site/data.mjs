// Source data transcribed from the 20 October 2026 canonical Weave Archive and Balance Constants.
// This reference catalog is not a substitute for full official kit implementations.
export const SOURCES={
  combat:'https://app.notion.com/p/3e43aaec5da18139857fd8a92a25e7df',
  loom:'https://app.notion.com/p/3e43aaec5da18170923df4159d3a2f04',
  balance:'https://app.notion.com/p/3e43aaec5da1819f90f8d75ebdf1f095',
  design:'https://app.notion.com/p/3e43aaec5da1812cbda9edb2d946bcc4',
  repository:'https://github.com/Empyrios/weave',
  linear:'https://linear.app/hypweave'
};
export const ASPECTS=['Aqua','Ignis','Terra','Sky','Wild','Aether'];
export const ASPECT_COLORS=['#67cdf1','#fa9c69','#d0b987','#9fbafa','#86d89d','#c99fee'];
const art=(name,cost,ap,damageType,detail,options={})=>({name,cost,ap,damageType,detail,...options});
const form=(id,name,line,aspect,evolved,hp,attack,phy,sp,capacity,trait,arts,source,role)=>({id,name,line,aspect,evolved,hp,attack,phy,sp,capacity,trait,arts,source,role});
export const FORMS=[
form('fjordfin','Fjordfin','fjordfin','Aqua',false,120,75,95,135,7,'Fjord Runes',[
  art('Tidal Ram',3,28,'physical','Normal damage, then shifts a Loom row by one.',{loom:'row shift'}),
  art('Runic Current',5,22,'special','Places a delayed Fjord Rune. Its triggered 22 AP hit is not immediate.',{timing:'delayed',note:'Delayed 22 AP when the Rune detonates.'}),
  art('Fjordwall',7,0,'utility','30 self Shield, 14 to each living ally and one-turn Taunt.')
],'3e43aaec5da181a8afe9f101ef18ddb2','Loom control · Special tank'),
form('jormunfin','Jormunfin','fjordfin','Aqua',true,155,95,115,175,7,'Worldsea Runes',[
  art('World-Tide',3,34,'special','Normal damage and a 1-2 Strand row shift. Enhanced: line conversion.',{loom:'row/column manipulation'}),
  art('Binding Runes',5,20,'special','Delayed 20 AP whenever the marked target commits an Art.',{timing:'delayed'}),
  art('Horizon Breaker',7,30,'special','30 AP per enemy; 36 self Shield and Taunt.',{target:'allEnemies'})
],'3e43aaec5da1818cb914c11b429ca335','Loom architect · Team defender'),
form('craglet','Craglet','craglet','Terra',false,130,70,160,100,10,'Bedrock',[
  art('Stoneclub',4,32,'physical','Physical True Damage; +18 AP after retaliation trigger.',{trueDamage:true}),
  art('Brace',5,0,'utility','15% max-HP Shield; +25% defences; first-hit reduction.'),
  art('Stand Behind Me',7,0,'utility','10% max-HP Shield; one-turn Taunt.')
],'3e53aaec5da1819299e3f3241716766f','Physical tank · Retaliation'),
form('cragkyl','Cragkyl','craglet','Terra',true,165,90,200,120,10,'Fortress',[
  art('Cragbreaker',4,38,'physical','Physical True Damage; +20 AP on retaliation; Fortress boosts.',{trueDamage:true}),
  art('Citadel Stance',6,0,'utility','20% max-HP Shield, +25% defences, Taunt and first-hit reduction.'),
  art('Mountainfall',10,90,'physical','Physical True Damage; +18 AP per Fortress stack, consuming all stacks.',{trueDamage:true,special:'fortress'})
],'3e53aaec5da181f1b1d0e458a6972254','Fortress tank · Burst finisher'),
form('kilnix','Kilnix','kilnix','Ignis',false,90,105,85,65,10,'Kilnheart',[
  art('Kindle',3,24,'special','Normal hit, Burn 6 for 2 Turns; +2 Heat.',{special:'burn'}),
  art('Stoke',3,0,'utility','Strengthens existing Burn and grants 3 Heat; no direct Art hit.'),
  art('Smelt',6,30,'special','Base 30 AP, +8 AP per Heat and twice current Burn tick.',{special:'kilnix'})
],'3f13aaec5da18179866cd751ec42f73e','Burn setup · Heat spender'),
form('crucivar','Crucivar','kilnix','Ignis',true,120,135,110,70,10,'Forgeheart',[
  art('Ignite',3,32,'special','Normal hit, Burn 8 for 2 Turns; +2 Heat.',{special:'burn'}),
  art('Temper',3,0,'utility','Strengthens Burn, inflicts Special Defence Down and adds Heat.'),
  art('Rupture',7,40,'special','Base 40 AP +10 per Heat; releases remaining Burn as fixed damage.',{special:'crucivar'})
],'3f13aaec5da1819eb652f4f1e44f351a','Burn detonation · Forge burst'),
form('budwyrm','Budwyrm','budwyrm','Wild',false,85,110,70,60,8,'Thornsprout',[
  art('Hungry Bud',4,10,'physical','2 bites +1 per Bud Head, each 10 AP; 40% life leech.',{special:'bites',baseHits:2}),
  art('Latch and Tear',6,30,'physical','One hit at 30 AP +12 per Bud Head.',{special:'heads'}),
  art('Bloodbud',3,0,'utility','Sacrifice 10% max HP to gain 3 Bud Heads.')
],'3f13aaec5da181f5b7fff7189f212d7a','Leech · Growing heads'),
form('bloomdra','Bloomdra','budwyrm','Wild',true,110,140,85,65,8,'Thornsprout',[
  art('Ravenous Bloom',4,10,'physical','5 bites +1 per Bud Head, each 10 AP; 50% life leech.',{special:'bites',baseHits:5}),
  art('Rend Asunder',6,65,'physical','One hit at 65 AP +12 per Bud Head.',{special:'heads'}),
  art('Forced Growth',3,0,'utility','Sacrifice 10% max HP to gain 2 Bud Heads.')
],'3f13aaec5da181f48d0ddbe416b95892','Self-sustaining multi-hit attacker'),
form('ruklet','Ruklet','ruklet','Sky',false,90,115,80,60,8,'Killing Instinct',[
  art('Sundering Talon',3,38,'physical','Efficient normal single-target damage.'),
  art('Severance',4,34,'physical','Remove up to 18 Shield before normal damage.',{shieldRemoval:18}),
  art('Deathbound Dive',7,60,'physical','+24 AP if target is at or below half HP.',{special:'execute',executeAP:24})
],'3f23aaec5da18167921af3448a9130e5','Executioner · Shield breaker'),
form('rukhara','Rukhara','ruklet','Sky',true,120,145,100,70,8,'Executioner',[
  art('Sovereign’s Scythe',3,46,'physical','Efficient normal single-target damage.'),
  art('Royal Severance',4,42,'physical','Remove up to 28 Shield before normal damage.',{shieldRemoval:28}),
  art('Final Judgement',7,74,'physical','+32 AP if target is at or below half HP.',{special:'execute',executeAP:32})
],'3f23aaec5da1818bbb15f928ea35989f','High-attack finisher'),
form('mothrit','Mothrit','mothrit','Aether',false,80,80,45,95,10,'Lingering Dust',[
  art('Wither',3,18,'special','Applies 20% Frailty after hit.'),
  art('Siphon',4,14,'special','Hunger curse transfers up to 2 Essence after victim’s next Art.'),
  art('Unravel',4,20,'special','Ruin boosts next allied damaging Art by 25% after application.')
],'3f33aaec5da181868d00feea44f40fb0','Curse support · Frailty'),
form('maledith','Maledith','mothrit','Aether',true,105,100,55,115,10,'Lingering Malice',[
  art('Enfeeble',3,26,'special','Applies 30% Frailty after hit.'),
  art('Ravenous Hex',4,22,'special','Hunger curse transfers up to 3 Essence after victim’s next Art.'),
  art('Malediction',5,30,'special','Ruin boosts next allied damaging Art by 35% after application.')
],'3f33aaec5da181329c2edceee83634e6','Curse amplifier · Resource control')
];
export const LINES=['fjordfin','craglet','kilnix','budwyrm','ruklet','mothrit'];
export const getForm=id=>FORMS.find(f=>f.id===id);
export const getLineForms=id=>FORMS.filter(f=>f.line===id);
export const RULESETS={
 legacy:{id:'legacy',name:'Released v0.1.2',status:'Implemented in main',loomSize:7,startingMarkers:3,markerCap:4,refillThreadChance:0.125,minMarkers:0,droughtAtZero:true,threadCap:6,reweaveCost:6,movesPerTurn:2,bonusPerMove:1,decisionSeconds:30,formula:'legacy',source:'https://github.com/Empyrios/weave/blob/main/src/rules.ts',note:'Historical engine uses a single Defence stat. For damage comparisons its Defence is approximated by averaging the two current Archive defences. Not exact v0.1.2 kit damage without the legacy stat tables.'},
 canonical:{id:'canonical',name:'Approved v0.2 trial',status:'Design specification, not released engine',loomSize:7,startingMarkers:8,markerCap:14,refillThreadChance:0.35,minMarkers:6,droughtAtZero:false,threadCap:6,reweaveCost:4,movesPerTurn:2,bonusPerMove:1,decisionSeconds:30,formula:'canonical',source:SOURCES.balance,note:'Approved provisional v0.2 tuning. Not proof of a merged game implementation or a finished roster simulation.'}
};
export const QA_ITEMS=[
 {id:'HYP-61',area:'Combat migration',title:'Split Physical/Special defences',risk:'critical',status:'Tracked',detail:'Check migration of all kit stats and attack categories.'},
 {id:'HYP-43',area:'Damage',title:'Defence smoothing sensitivity 40/50/65',risk:'high',status:'Tracked',detail:'Keep the approved formula while testing the smoothing constant.'},
 {id:'HYP-46',area:'Pacing',title:'4–6 ordinary Arts and 8–10 minute matches',risk:'high',status:'Tracked',detail:'Targets need controlled playtest evidence, not hard caps.'},
 {id:'HYP-48',area:'Aqua kit',title:'Fjordfin/Jormunfin Loom and Rune triggers',risk:'high',status:'Tracked',detail:'Capture side-dependent rune attribution, shields, Taunt and chain timing.'},
 {id:'HYP-53',area:'Aether kit',title:'Frailty, Hunger and Ruin interactions',risk:'high',status:'Tracked',detail:'Check order of post-Art resource transfer and curse amplification.'},
 {id:'HYP-62',area:'Combat validation',title:'Aqua test evidence with attribution correction',risk:'high',status:'In review',detail:'Previously collected Aqua probe evidence is not 12-form Gen1 validation.'},
 {id:'HYP-20',area:'Release gate',title:'Complete first-generation gameplay acceptance',risk:'critical',status:'Todo',detail:'Six lines, 12 forms, integrated tests and owner release approval.'},
 {id:'HYP-26',area:'Playtest',title:'Repeated seeded 3v3 match evidence',risk:'high',status:'Todo',detail:'Measure lengths, Move economy, Threads, targeting and decision quality.'},
 {id:'HYP-76',area:'Coverage',title:'Map 14 approved combat design choices',risk:'medium',status:'Backlog',detail:'Owner test mapping without duplicate simulation queues.'}
];
export const SOURCE_REVISION='Archive & Balance Constants accessed 2 Nov 2026 · provisional v0.2 numbers';
