/* ══════════════════════════════════════
   VERSA — SHARED DATA & UTILITIES
   ══════════════════════════════════════ */

const LISTINGS = [
  {
    id:'realt-detroit-14209',
    protocol:'RealT', assetClass:'Real Estate', sub:'Residential',
    name:'RealT Detroit', detail:'14209 Mansfield Ave',
    blockchain:'Gnosis Chain', standard:'ERC-20', legal:'LLC',
    price:42.50, nav:50.00, qty:500, minQty:50,
    discount:-15.0, yieldNav:7.20, effYield:8.47, occupancy:100,
    settle:'USDC', restriction:'KYC required', restrictionDetail:'RealT whitelist — 1 to 3 days',
    insurance:true, seller:{init:'RK',wallet:'0x4f2a...8c1d',comp:96,trades:34},
    reason:'Portfolio rebalancing', daysListed:12, geo:'Detroit, US',
    vintage:1994, totalTokens:2000, us:false,
    trending:true, newlyAdded:false, topYield:false,
  },
  {
    id:'lofty-miami-8821',
    protocol:'Lofty', assetClass:'Real Estate', sub:'Residential',
    name:'Lofty Miami', detail:'8821 NW 12th St',
    blockchain:'Algorand', standard:'ASA', legal:'DAO LLC',
    price:54.00, nav:52.50, qty:200, minQty:10,
    discount:2.9, yieldNav:11.40, effYield:11.08, occupancy:100,
    settle:'USDC', restriction:'KYC required', restrictionDetail:'Lofty account required',
    insurance:false, seller:{init:'TW',wallet:'algo1...9k2m',comp:88,trades:17},
    reason:'Need liquidity', daysListed:3, geo:'Miami, US',
    vintage:2008, totalTokens:1050, us:true,
    trending:false, newlyAdded:true, topYield:true,
  },
  {
    id:'paxg-gold-001',
    protocol:'Paxos Gold', assetClass:'Commodity', sub:'Gold',
    name:'PAX Gold', detail:'1 troy oz LBMA gold',
    blockchain:'Ethereum', standard:'ERC-20', legal:'Direct ownership',
    price:3180.00, nav:3210.00, qty:5, minQty:1,
    discount:-0.9, yieldNav:null, effYield:null, occupancy:null,
    settle:'USDC', restriction:'None', restrictionDetail:'Free ERC-20 transfer',
    insurance:true, seller:{init:'AM',wallet:'0x9d3b...1a4f',comp:100,trades:52},
    reason:'Rotating into yield assets', daysListed:1, geo:'Global',
    vintage:null, totalTokens:null, us:true,
    trending:true, newlyAdded:true, topYield:false,
  },
  {
    id:'benji-gov-002',
    protocol:'Franklin BENJI', assetClass:'Government Securities', sub:'Money Market Fund',
    name:'Franklin BENJI', detail:'US Government Money Market',
    blockchain:'Ethereum', standard:'ERC-20', legal:'SEC-registered fund',
    price:1.002, nav:1.000, qty:50000, minQty:1000,
    discount:0.2, yieldNav:4.85, effYield:4.84, occupancy:null,
    settle:'USDC', restriction:'KYC required', restrictionDetail:'Benji app account required',
    insurance:true, seller:{init:'JL',wallet:'0x7c1e...3b9a',comp:100,trades:8},
    reason:'Switching to higher yield', daysListed:5, geo:'Global',
    vintage:null, totalTokens:null, us:true,
    trending:false, newlyAdded:false, topYield:false,
  },
  {
    id:'backed-sp500-003',
    protocol:'Backed Finance', assetClass:'Equities', sub:'ETF',
    name:'bCSPX', detail:'iShares Core S&P 500 ETF',
    blockchain:'Ethereum', standard:'ERC-20', legal:'Tracker certificate',
    price:478.50, nav:491.20, qty:20, minQty:1,
    discount:-2.6, yieldNav:1.30, effYield:1.33, occupancy:null,
    settle:'USDC', restriction:'None', restrictionDetail:'Free ERC-20 transfer',
    insurance:true, seller:{init:'PV',wallet:'0x2a8f...5c7d',comp:94,trades:23},
    reason:'Rebalancing crypto/TradFi', daysListed:8, geo:'Global',
    vintage:null, totalTokens:null, us:false,
    trending:false, newlyAdded:false, topYield:false,
  },
  {
    id:'spiko-eur-004',
    protocol:'Spiko', assetClass:'Money Market', sub:'EU T-Bills',
    name:'Spiko EUR T-Bills', detail:'EU Government Money Market',
    blockchain:'Ethereum', standard:'ERC-20', legal:'AMF-regulated UCITS',
    price:1.004, nav:1.000, qty:30000, minQty:1000,
    discount:0.4, yieldNav:3.20, effYield:3.19, occupancy:null,
    settle:'USDC', restriction:'Permission required', restrictionDetail:'Spiko permission manager',
    insurance:true, seller:{init:'GR',wallet:'0x5f4a...2d1c',comp:91,trades:11},
    reason:'Switching to USD yield', daysListed:14, geo:'Europe',
    vintage:null, totalTokens:null, us:false,
    trending:true, newlyAdded:false, topYield:false,
  },
  {
    id:'kinesis-gold-005',
    protocol:'Kinesis', assetClass:'Commodity', sub:'Gold',
    name:'Kinesis Gold (KAU)', detail:'1 troy oz gold + velocity yield',
    blockchain:'Ethereum', standard:'ERC-20', legal:'Direct ownership',
    price:3140.00, nav:3210.00, qty:3, minQty:1,
    discount:-2.2, yieldNav:1.80, effYield:1.84, occupancy:null,
    settle:'USDC', restriction:'None', restrictionDetail:'Free ERC-20 transfer',
    insurance:true, seller:{init:'SB',wallet:'0x3c9d...7e2b',comp:97,trades:29},
    reason:'Consolidating positions', daysListed:6, geo:'Global',
    vintage:null, totalTokens:null, us:true,
    trending:false, newlyAdded:true, topYield:false,
  },
  {
    id:'realt-chicago-7741',
    protocol:'RealT', assetClass:'Real Estate', sub:'Residential',
    name:'RealT Chicago', detail:'7741 S Emerald Ave',
    blockchain:'Gnosis Chain', standard:'ERC-20', legal:'LLC',
    price:38.00, nav:45.00, qty:300, minQty:25,
    discount:-15.6, yieldNav:8.90, effYield:10.55, occupancy:100,
    settle:'USDC', restriction:'KYC required', restrictionDetail:'RealT whitelist — 1 to 3 days',
    insurance:true, seller:{init:'DF',wallet:'0x1b7c...4f9e',comp:83,trades:6},
    reason:'Exiting US real estate', daysListed:21, geo:'Chicago, US',
    vintage:1987, totalTokens:1800, us:false,
    trending:false, newlyAdded:false, topYield:true,
  },
  {
    id:'superstate-ustb-006',
    protocol:'Superstate', assetClass:'Government Securities', sub:'Treasury Fund',
    name:'Superstate USTB', detail:'Short Duration US Gov. Fund',
    blockchain:'Ethereum', standard:'ERC-20', legal:'SEC-registered fund',
    price:99.85, nav:100.00, qty:500, minQty:100,
    discount:-0.15, yieldNav:5.10, effYield:5.11, occupancy:null,
    settle:'USDC', restriction:'Allowlist required', restrictionDetail:'Qualified purchaser only',
    insurance:true, seller:{init:'MH',wallet:'0x8e2a...6c1d',comp:100,trades:4},
    reason:'Reducing duration risk', daysListed:9, geo:'Global',
    vintage:null, totalTokens:null, us:false,
    trending:false, newlyAdded:false, topYield:true,
  },
];

/* ── FORMATTERS ─────────────────────── */
function fPrice(v,dec=2){
  if(v===null||v===undefined)return'N/A';
  if(v>=1000)return'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  return'$'+v.toFixed(dec);
}
function fDisc(v){
  if(v===null||v===undefined)return'N/A';
  return(v>=0?'+':'')+v.toFixed(1)+'%';
}
function fYield(v){
  if(v===null||v===undefined)return'N/A';
  return v.toFixed(2)+'%';
}

/* ── RENDER LISTING CARD ────────────── */
function renderCard(l){
  const dc=l.discount<0?'neg':'pos';
  const yDisp=l.yieldNav!==null?fYield(l.yieldNav):'N/A';
  const col4Label=l.occupancy!==null?'Occupancy':'Eff. yield';
  const col4Val=l.occupancy!==null?l.occupancy+'%':(l.effYield!==null?fYield(l.effYield):'N/A');
  const col4Class=l.occupancy!==null?'green':'blue';
  return`<div class="listing-card" onclick="location.href='listing.html?id=${l.id}'">
  <div class="lc-head">
    <div>
      <div class="lc-proto-badge"><span class="lc-proto-dot"></span>${l.protocol}</div>
      <div class="lc-name">${l.name}</div>
      <div class="lc-sub">${l.detail} · ${l.sub}</div>
    </div>
    <div class="lc-disc">
      <span class="lc-disc-val ${dc}">${fDisc(l.discount)}</span>
      <span class="lc-disc-label">vs NAV</span>
    </div>
  </div>
  <div class="lc-metrics">
    <div><div class="lm-label">Asking price</div><div class="lm-val">${fPrice(l.price)}</div></div>
    <div><div class="lm-label">NAV</div><div class="lm-val">${fPrice(l.nav)}</div></div>
    <div><div class="lm-label">Yield at NAV</div><div class="lm-val ${l.yieldNav?'green':''}">${yDisp}</div></div>
    <div><div class="lm-label">${col4Label}</div><div class="lm-val ${col4Class}">${col4Val}</div></div>
  </div>
  <div class="lc-foot">
    <div class="lc-seller">
      <div class="lc-av">${l.seller.init}</div>
      <div>
        <div class="lc-seller-name">${l.seller.wallet}</div>
        <div class="lc-seller-score">${l.seller.comp}% · ${l.seller.trades} trades</div>
      </div>
    </div>
    <div class="lc-actions">
      <button class="v-btn-ghost" onclick="event.stopPropagation();alert('Added to watchlist.')" style="padding:5px 13px;font-size:12px;">Watchlist</button>
      <button class="v-btn" onclick="event.stopPropagation();location.href='listing.html?id=${l.id}'" style="padding:5px 13px;font-size:12px;">View</button>
    </div>
  </div>
</div>`;
}

/* ── INTERSECTION OBSERVER REVEAL ───── */
function initReveal(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
  },{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}
document.addEventListener('DOMContentLoaded',initReveal);
