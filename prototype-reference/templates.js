/* ============================================================
   Templates — one render function per screen/section, composed
   into renderApp(). Mirrors the structure of the original
   dc.html template 1:1 wherever practical.
   ============================================================ */

/* ---------- Shared bits ---------- */
function announcementBar(){
  return `
  <div style="background:#02263f;color:#f6f4f0;height:38px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:0 var(--padX);overflow:hidden">
    <span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:700 11px/1 Archivo;letter-spacing:.16em;text-transform:uppercase">Arrived today: 214 pairs · 9 brands · sizes 35–46 &nbsp;&nbsp;—&nbsp;&nbsp; yesterday: 158 pairs · 6 brands</span>
    <span style="flex:0 0 auto;display:var(--utilDisplay);gap:26px;align-items:center;font:700 11px/1 Archivo;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap"><span>Free shipping over €79</span><span>30-day returns</span><span style="opacity:.6">IT / EN ✕</span></span>
  </div>`;
}

function headerRow(){
  const isCatArea = ['category','plp','pdp'].includes(state.view);
  return `
  <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--headGap);flex-wrap:var(--headWrap);padding:16px var(--padX);background:#f6f4f0;border-bottom:2px solid #02263f">
    <span class="navlink" data-action="toggleMenu" style="display:var(--burgerDisplay);flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;border:1px solid rgba(2,38,63,.4);padding:0 11px"><span style="height:2px;background:#02263f;display:block"></span><span style="height:2px;background:#02263f;display:block"></span><span style="height:2px;background:#02263f;display:block"></span></span>
    <span class="navlink" data-action="goHome"><img src="${LOGO_SRC}" alt="Stockisti Online" style="height:var(--logoH);width:auto;display:block"></span>
    <div style="display:flex;align-items:stretch;border:1px solid rgba(2,38,63,.4);flex:var(--searchFlex);max-width:var(--searchMax);order:var(--searchOrder)">
      <input value="${esc(state.searchQuery)}" data-bind="searchQuery" data-action-key="onSearchKey" placeholder="Search a brand, a style, a size…" style="font:400 13px/1 Archivo;color:#02263f;padding:12px 14px;flex:1;border:none;outline:none;background:transparent" onkeydown="if(event.key==='Enter'){actions.onSearchKey(event)}">
      <span class="btn" data-action="goSearch" style="background:#02263f;color:#f6f4f0;font:800 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;padding:0 16px;display:flex;align-items:center">Search</span>
    </div>
    <div style="display:flex;gap:20px;align-items:center;font:600 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase">
      <span class="navlink" data-action="onAccountClick">Account</span>
      <span style="display:var(--wishDisplay)">Wishlist (4)</span>
      <span class="navlink" data-action="toggleCart" style="background:#02263f;color:#f6f4f0;padding:11px 14px">Cart · <span data-role="cart-count">${state.cart.length}</span></span>
    </div>
  </div>
  <div style="display:var(--navDisplay);grid-template-columns:repeat(5,1fr);border-bottom:2px solid #02263f;background:#f6f4f0">
    <span class="navlink" data-action="goCategory" style="font:700 12.5px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;padding:14px 18px;border-right:1px solid rgba(2,38,63,.25);background:${isCatArea?'#02263f':'transparent'};color:${isCatArea?'#f6f4f0':'#02263f'}">Footwear</span>
    <span style="font:700 12.5px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;padding:14px 18px;border-right:1px solid rgba(2,38,63,.25);color:rgba(2,38,63,.4)">Clothing · soon</span>
    <span style="font:700 12.5px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;padding:14px 18px;border-right:1px solid rgba(2,38,63,.25)">Brands A–Z</span>
    <span class="navlink" data-action="goNewStock" style="font:700 12.5px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;padding:14px 18px;border-right:1px solid rgba(2,38,63,.25);color:#8a5f22">New stock</span>
    <span style="font:700 12.5px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;padding:14px 18px;color:rgba(2,38,63,.4)">Home &amp; Living · soon</span>
  </div>`;
}

function renderHeader(){
  return `<div style="position:sticky;top:0;z-index:20;background:#f6f4f0">${announcementBar()}${headerRow()}</div>`;
}

/* ---------- Landing ---------- */
function renderLanding(){
  const allVM = PRODUCTS.map(makeProductVM);
  const newTodayProducts = allVM.filter(p => p.badge === 'New today');
  const lastPairProducts = allVM.filter(p => p.badge === 'Last pair');

  const desktopGrid = allVM.map(p => `
    <div class="card navlink" data-action="selectProduct" data-id="${p.id}">
      <div style="position:relative"><div class="ph cardimg" style="height:240px"><span class="phl">${esc(p.name)}</span></div>${badgeChip(p)}</div>
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px"><span style="font:700 10px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;color:rgba(2,38,63,.55)">${esc(p.brand)}</span><span style="font:400 12.5px/1.3 Archivo">${esc(p.name)}</span><span style="font:800 14px/1 Archivo">${p.priceLabel}</span></div>
    </div>`).join('');

  const railCard = (p) => `
    <div class="card navlink" data-action="selectProduct" data-id="${p.id}" style="flex:0 0 var(--railCardW);scroll-snap-align:start">
      <div class="ph cardimg" style="height:var(--railImgH)"><span class="phl">${esc(p.name)}</span></div>
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:3px"><span style="font:700 8.5px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;color:rgba(2,38,63,.55)">${esc(p.brand)}</span><span style="font:400 11px/1.3 Archivo">${esc(p.name)}</span><span style="font:800 12.5px/1 Archivo">${p.priceLabel}</span></div>
    </div>`;

  return `
  <div>
    <div style="display:grid;grid-template-columns:var(--heroCols);grid-auto-rows:var(--heroRows);gap:2px;background:#02263f;padding-bottom:2px">
      <div class="ph" style="grid-column:span 2;grid-row:span var(--heroRowSpan);min-height:var(--heroPhotoH)"><span class="phl">photo — hero, women's shoe close crop, b&amp;w</span></div>
      <div style="grid-column:span var(--textSpan);background:#f6f4f0;padding:var(--heroPad);display:flex;flex-direction:column;justify-content:space-between;gap:20px">
        <div>
          <span style="font:700 11px/1 Archivo;letter-spacing:.2em;text-transform:uppercase;color:#8a5f22">The warehouse, open to everyone</span>
          <h1 style="font:900 var(--h1Size)/.96 Archivo;letter-spacing:-.035em;margin:14px 0 12px">New brands<br>every week.</h1>
          <p style="font:400 14px/1.6 Archivo;color:rgba(2,38,63,.72);margin:0;max-width:38ch">Twenty-six years of wholesale and retail, now online. See what landed today.</p>
        </div>
        <div style="display:flex;flex-direction:var(--heroBtnDir);align-items:var(--heroBtnAlign);gap:10px"><span class="btn" data-action="goCategory" style="background:#02263f;color:#f6f4f0;font:800 14px/1 Archivo;padding:17px 20px;text-align:center">Discover the shoes →</span><span class="btn" data-action="goNewStock" style="border:1px solid rgba(2,38,63,.4);font:800 14px/1 Archivo;padding:17px 20px;text-align:center">Arrived today (214)</span></div>
      </div>
      <div style="background:#02263f;color:#f6f4f0;padding:var(--counterPad);display:flex;flex-direction:column;justify-content:space-between;gap:14px">
        <span style="font:700 10.5px/1.3 Archivo;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,244,240,.6)">Stock counter</span>
        <div><div style="font:900 var(--counterNum)/.86 Archivo;letter-spacing:-.045em;color:#ce9c59">214</div><div style="font:400 11.5px/1.45 Archivo;color:rgba(246,244,240,.75);margin-top:8px">pairs arrived today, 9 brands.<span style="display:var(--counterNote)"><br>Updated at 14:20.</span></div></div>
      </div>
      <div style="grid-column:span var(--brandsSpan);background:#f6f4f0;padding:24px;display:flex;flex-direction:column;justify-content:space-between;gap:16px">
        <span style="font:700 10.5px/1 Archivo;letter-spacing:.2em;text-transform:uppercase;color:rgba(2,38,63,.5)">This week's brands</span>
        <div style="display:flex;flex-direction:column;gap:8px"><span style="font:800 19px/1 Archivo">Brand&nbsp;A</span><span style="font:800 19px/1 Archivo">Brand&nbsp;D</span><span style="font:600 12px/1 Archivo;color:#8a5f22;border-top:1px solid rgba(2,38,63,.25);padding-top:8px">+ 41 brands →</span></div>
      </div>
    </div>

    <div style="background:#f6f4f0;padding:34px var(--padX) 40px;border-bottom:2px solid #02263f">
      <div style="display:grid;grid-template-columns:var(--startCols);gap:26px;min-width:0">
        <div style="border:2px solid #02263f;display:flex;flex-direction:column;min-width:0;overflow:hidden">
          <div style="display:flex;align-items:var(--blockAlign);justify-content:space-between;flex-wrap:var(--blockWrap);gap:12px;padding:var(--blockPad);border-bottom:2px solid #02263f">
            <div><h2 style="font:900 var(--blockH2)/.98 Archivo;letter-spacing:-.03em;margin:0">Footwear</h2><div style="font:700 11px/1 Archivo;letter-spacing:.16em;text-transform:uppercase;color:#8a5f22;margin-top:10px">Where would you like to start</div></div>
            <span class="navlink" data-action="goCategory" style="font:600 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:#8a5f22;white-space:nowrap">Browse all footwear →</span>
          </div>
          <div class="snap-row" style="display:var(--deptDisplay);grid-template-columns:var(--deptCols);overflow-x:var(--deptOverflow);scroll-snap-type:var(--deptSnap);min-width:0;gap:2px;background:#02263f;flex:1">
            <div class="card navlink" data-action="pickWomen" style="background:#f6f4f0;flex:0 0 var(--deptCardW);scroll-snap-align:start"><div class="ph cardimg" style="height:var(--cardImgH)"><span class="phl">women</span></div><div style="padding:16px 18px;display:flex;justify-content:space-between"><span style="font:800 19px/1 Archivo">Women</span><span style="font:400 11px ui-monospace,monospace;color:rgba(2,38,63,.55)">3 styles</span></div></div>
            <div class="card navlink" data-action="pickMen" style="background:#f6f4f0;flex:0 0 var(--deptCardW);scroll-snap-align:start"><div class="ph cardimg" style="height:var(--cardImgH)"><span class="phl">men</span></div><div style="padding:16px 18px;display:flex;justify-content:space-between"><span style="font:800 19px/1 Archivo">Men</span><span style="font:400 11px ui-monospace,monospace;color:rgba(2,38,63,.55)">4 styles</span></div></div>
            <div class="card navlink" data-action="pickKids" style="background:#f6f4f0;flex:0 0 var(--deptCardW);scroll-snap-align:start"><div class="ph cardimg" style="height:var(--cardImgH)"><span class="phl">kids</span></div><div style="padding:16px 18px;display:flex;justify-content:space-between"><span style="font:800 19px/1 Archivo">Kids</span><span style="font:400 11px ui-monospace,monospace;color:rgba(2,38,63,.55)">1 style</span></div></div>
          </div>
        </div>
        <div style="border:2px solid #02263f;background:#e8e4dc;display:flex;flex-direction:column;min-width:0;overflow:hidden">
          <div style="padding:22px 20px 14px;border-bottom:2px solid #02263f"><div style="font:700 11px/1 Archivo;letter-spacing:.2em;text-transform:uppercase;color:#8a5f22">Arriving soon</div></div>
          <div style="position:relative;flex:1;min-height:200px">
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;animation:arriveCycle 10s linear infinite both"><div class="ph" style="flex:1"><span class="phl">home &amp; living</span></div><div style="padding:12px 18px 14px"><div style="font:800 17px/1 Archivo">Home &amp; Living</div><div style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.75);margin-top:6px">arriving September</div></div></div>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;animation:arriveCycle 10s 5s linear infinite both"><div class="ph" style="flex:1"><span class="phl">clothing</span></div><div style="padding:12px 18px 14px"><div style="font:800 17px/1 Archivo">Clothing</div><div style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.75);margin-top:6px">arriving Winter 2026</div></div></div>
          </div>
        </div>
      </div>
    </div>

    <div style="background:#f6f4f0;padding:34px var(--padX) 40px;border-bottom:2px solid #02263f">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:18px"><div><span style="font:700 11px/1 Archivo;letter-spacing:.2em;text-transform:uppercase;color:#8a5f22">44 brands in stock right now</span><h2 style="font:900 30px/1 Archivo;letter-spacing:-.025em;margin:10px 0 0">Brand wall</h2></div><span style="font:600 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:#8a5f22">A–Z →</span></div>
      <div style="display:grid;grid-template-columns:var(--brandCols);gap:2px;background:rgba(2,38,63,.4);border:1px solid rgba(2,38,63,.4)">
        ${['Brand A|new today','Brand B|32 styles','Brand C|11 styles','Brand D|new today','Brand E|7 styles','Brand F|58 styles','Brand G|24 styles','Brand H|new today','Brand I|16 styles','Brand L|9 styles','Brand M|41 styles','Brand N|13 styles','Brand O|22 styles','Brand P|new today','Brand Q|6 styles','Brand R|35 styles'].map(pair => {
          const [name, note] = pair.split('|');
          const isNew = note === 'new today';
          return `<div style="background:#f6f4f0;padding:18px 16px;display:flex;flex-direction:column;gap:6px"><span style="font:800 17px/1 Archivo">${name}</span><span style="font:400 10px ui-monospace,monospace;color:${isNew?'#8a5f22':'rgba(2,38,63,.55)'}">${note}</span></div>`;
        }).join('')}
        <div style="background:#02263f;color:#f6f4f0;padding:18px 16px;display:flex;flex-direction:column;gap:6px"><span style="font:800 17px/1 Archivo">+ 32</span><span style="font:400 10px ui-monospace,monospace;color:rgba(246,244,240,.7)">more brands</span></div>
        <div style="background:#e8e4dc;padding:18px 16px;display:flex;flex-direction:column;gap:6px"><span style="font:800 17px/1 Archivo;color:#8a5f22">A–Z</span><span style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.6)">full index</span></div>
      </div>
    </div>

    <div style="background:#f6f4f0;padding:34px var(--padX) 44px">
      <div style="display:flex;flex-direction:var(--secHeadDir);align-items:var(--secHeadAlign);justify-content:space-between;gap:var(--secHeadGap);margin-bottom:20px"><div><span style="font:700 11px/1 Archivo;letter-spacing:.2em;text-transform:uppercase;color:#8a5f22;white-space:nowrap">Updated today at 14:20</span><h2 style="font:900 28px/1 Archivo;letter-spacing:-.02em;margin:10px 0 0">Just arrived</h2></div><div style="display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap"><span style="border:1px solid rgba(2,38,63,.4);font:700 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;padding:11px 14px">Women</span><span style="border:1px solid rgba(2,38,63,.4);font:700 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;padding:11px 14px">Men</span><span style="border:1px solid rgba(2,38,63,.4);font:700 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;padding:11px 14px">Kids</span><span class="navlink" data-action="goNewStock" style="font:600 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:#8a5f22;margin-left:10px">See all (214) →</span></div></div>

      <div class="not-mobile-only" style="display:grid;grid-template-columns:var(--prodCols);gap:24px">${desktopGrid}</div>

      <div class="mobile-only" style="flex-direction:column;gap:24px;min-width:0">
        <div style="min-width:0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="background:#02263f;color:#f6f4f0;font:700 9px/1 Archivo;letter-spacing:.14em;text-transform:uppercase;padding:6px 8px">New today</span><span style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.5)">swipe →</span></div>
          <div class="snap-row" style="display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;min-width:0;padding-bottom:4px">${newTodayProducts.map(railCard).join('')}</div>
        </div>
        <div style="min-width:0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="background:#ce9c59;color:#02263f;font:700 9px/1 Archivo;letter-spacing:.14em;text-transform:uppercase;padding:6px 8px">Last pair</span><span style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.5)">swipe →</span></div>
          <div class="snap-row" style="display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;min-width:0;padding-bottom:4px">${lastPairProducts.map(railCard).join('')}</div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:var(--specialCols);background:#02263f;color:#f6f4f0;border-bottom:2px solid #02263f">
      <div style="padding:var(--padX);display:flex;flex-direction:column;justify-content:space-between;gap:24px">
        <div><span style="font:700 11px/1 Archivo;letter-spacing:.2em;text-transform:uppercase;color:#ce9c59">Special stock</span><h2 style="font:900 40px/.96 Archivo;letter-spacing:-.035em;margin:14px 0 12px">Single pairs,<br>one-off sizes.</h2><p class="not-mobile-only" style="font:400 13.5px/1.6 Archivo;color:rgba(246,244,240,.8);margin:0;max-width:34ch">The best lots arrive in small quantities: one or two pairs per size. Stock prices, the same quality — and once they're gone they don't come back.</p></div>
        <div class="mobile-only" style="align-items:center;gap:14px">
          <p style="flex:1;font:400 12.5px/1.5 Archivo;color:rgba(246,244,240,.8);margin:0">One or two pairs per size. Stock prices, same quality — gone for good.</p>
          <span class="btn" style="flex:none;background:#ce9c59;color:#02263f;font:800 12px/1.25 Archivo;padding:14px 15px;max-width:44%">See the special stock →</span>
        </div>
        <span class="not-mobile-only" style="background:#ce9c59;color:#02263f;font:800 14px/1 Archivo;padding:16px 20px;align-self:flex-start">See the special stock →</span>
      </div>
      <div style="display:grid;grid-template-columns:var(--specialTiles);gap:2px;background:rgba(246,244,240,.25);border-left:2px solid rgba(246,244,240,.25)">
        <div class="ph" style="order:var(--ordA);min-height:var(--tileH)"><span class="phl">photo — special stock</span></div>
        <div style="order:var(--ordB);background:#02263f;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px"><span style="font:900 36px/.9 Archivo;letter-spacing:-.04em;color:#ce9c59">96</span><span style="font:400 12px/1.5 Archivo;color:rgba(246,244,240,.75)">last pairs<br>in single sizes</span></div>
        <div class="ph" style="order:var(--ordC);min-height:var(--tileH)"><span class="phl">photo — detail</span></div>
        <div style="order:var(--ordD);background:#02263f;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px"><span style="font:900 36px/.9 Archivo;letter-spacing:-.04em;color:#ce9c59">−62%</span><span style="font:400 12px/1.5 Archivo;color:rgba(246,244,240,.75)">average discount<br>off list price</span></div>
        <div class="ph" style="order:var(--ordE);grid-column:span 2;min-height:var(--wideTileH)"><span class="phl">photo — special stock, wide crop</span></div>
      </div>
    </div>

    <div style="background:#f6f4f0;border-bottom:2px solid #02263f;display:grid;grid-template-columns:var(--storyCols)">
      <div style="padding:var(--storyPad);border-right:2px solid #02263f"><span style="font:700 11px/1 Archivo;letter-spacing:.2em;text-transform:uppercase;color:#8a5f22">Since 2000</span><div style="font:900 var(--storyNum)/.86 Archivo;letter-spacing:-.05em;margin:14px 0 10px">26 years</div><p style="font:400 13px/1.6 Archivo;color:rgba(2,38,63,.7);margin:0">of wholesale and retail in Italy. We buy stock directly, check every pair, and sell with the same care we give the shops we supply.</p></div>
      <div style="display:grid;grid-template-columns:var(--statCols, repeat(3,1fr))">
        <div style="padding:var(--statPad);border-right:1px solid rgba(2,38,63,.25)"><div style="font:900 var(--statNum)/.9 Archivo">44</div><div style="font:600 var(--statLabel)/1.4 Archivo;letter-spacing:.1em;text-transform:uppercase;color:rgba(2,38,63,.6);margin-top:8px">brands carried<br>in stock now</div></div>
        <div style="padding:var(--statPad);border-right:1px solid rgba(2,38,63,.25)"><div style="font:900 var(--statNum)/.9 Archivo">100%</div><div style="font:600 var(--statLabel)/1.4 Archivo;letter-spacing:.1em;text-transform:uppercase;color:rgba(2,38,63,.6);margin-top:8px">genuine products<br>guaranteed</div></div>
        <div style="padding:var(--statPad)"><div style="font:900 var(--statNum)/.9 Archivo">2–4 days</div><div style="font:600 var(--statLabel)/1.4 Archivo;letter-spacing:.1em;text-transform:uppercase;color:rgba(2,38,63,.6);margin-top:8px">delivery<br>in Italy</div></div>
        <div class="ph" style="grid-column:span 3;min-height:170px"><span class="phl">photo — the warehouse, black &amp; white, wide crop</span></div>
      </div>
    </div>

    <div style="background:#e8e4dc;padding:32px var(--padX) 40px;border-bottom:2px solid #02263f">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px"><div><span style="font:700 11px/1 Archivo;letter-spacing:.2em;text-transform:uppercase;color:#8a5f22">Coming soon</span><h2 style="font:900 28px/1 Archivo;letter-spacing:-.02em;margin:10px 0 0">More to discover</h2></div><span style="font:600 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:rgba(2,38,63,.6)">Notify me when it lands →</span></div>
      <div style="display:grid;grid-template-columns:var(--soonCols);gap:2px;background:rgba(2,38,63,.4);border:1px solid rgba(2,38,63,.4)">
        <div style="background:#e8e4dc;padding:22px 20px;display:flex;flex-direction:column;gap:56px"><span style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.55)">September 2026</span><span style="font:800 19px/1 Archivo">Towels</span></div>
        <div style="background:#e8e4dc;padding:22px 20px;display:flex;flex-direction:column;gap:56px"><span style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.55)">September 2026</span><span style="font:800 19px/1 Archivo">Bedding</span></div>
        <div style="background:#e8e4dc;padding:22px 20px;display:flex;flex-direction:column;gap:56px"><span style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.55)">Winter 2026</span><span style="font:800 19px/1 Archivo">Clothing</span></div>
        <div style="background:#e8e4dc;padding:22px 20px;display:flex;flex-direction:column;gap:56px"><span style="font:400 10px ui-monospace,monospace;color:rgba(2,38,63,.55)">Winter 2026</span><span style="font:800 19px/1 Archivo">Bags &amp; accessories</span></div>
      </div>
    </div>
  </div>`;
}

/* ---------- Category ---------- */
function renderCategory(){
  return `
  <div>
    <div class="ph" style="height:320px;position:relative"><span class="phl">photo — footwear hero, wide crop</span><div style="position:absolute;left:var(--padX);bottom:28px;color:#02263f"><h1 style="font:900 var(--h1Size)/.94 Archivo;letter-spacing:-.03em;margin:0">Footwear.</h1></div></div>
    <div style="background:#f6f4f0;padding:34px var(--padX);border-bottom:2px solid #02263f">
      <h2 style="font:900 26px/1 Archivo;letter-spacing:-.02em;margin:0 0 18px">Shop by department</h2>
      <div class="snap-row" style="display:var(--deptDisplay);grid-template-columns:var(--deptCols);overflow-x:var(--deptOverflow);scroll-snap-type:var(--deptSnap);min-width:0;gap:2px;background:#02263f">
        <div class="card navlink" data-action="pickWomen" style="background:#f6f4f0;flex:0 0 var(--deptCardW);scroll-snap-align:start"><div class="ph cardimg" style="height:220px"><span class="phl">women</span></div><div style="padding:16px 18px"><span style="font:800 20px/1 Archivo">Women</span></div></div>
        <div class="card navlink" data-action="pickMen" style="background:#f6f4f0;flex:0 0 var(--deptCardW);scroll-snap-align:start"><div class="ph cardimg" style="height:220px"><span class="phl">men</span></div><div style="padding:16px 18px"><span style="font:800 20px/1 Archivo">Men</span></div></div>
        <div class="card navlink" data-action="pickKids" style="background:#f6f4f0;flex:0 0 var(--deptCardW);scroll-snap-align:start"><div class="ph cardimg" style="height:220px"><span class="phl">kids</span></div><div style="padding:16px 18px"><span style="font:800 20px/1 Archivo">Kids</span></div></div>
      </div>
    </div>
  </div>`;
}

/* ---------- PLP ---------- */
const TYPE_ICONS = {
  all: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"></path>',
  sneaker: '<path d="M2 17h19c0-2-1-3-3-4l-5-3-4-4-4 2c-2 1-3 2-3 4v5z"></path><line x1="2" y1="19" x2="21" y2="19"></line>',
  boot: '<path d="M6 3v10l-4 3v3h19c0-2-1-3-3-4l-4-2V3H6z"></path><line x1="2" y1="19" x2="21" y2="19"></line>',
  loafer: '<path d="M2 17c0-3 2-5 6-6l4-1 8 3c2 .8 3 2 3 4H2z"></path><line x1="2" y1="19" x2="21" y2="19"></line>',
  sandal: '<path d="M4 16c0-2 1-4 3-4h9c2 0 4 1 4 4"></path><line x1="2" y1="16" x2="21" y2="16"></line><line x1="8" y1="12" x2="8" y2="7"></line><line x1="14" y1="12" x2="14" y2="7"></line>',
  slipper: '<path d="M2 15c0-2 2-3 5-3h9c3 0 5 1 6 3v3H2v-3z"></path><path d="M6 12c1-2 3-3 5-3"></path>',
  heel: '<path d="M2 16h13l3-9 2 1-3 10c0 1-1 2-2 2H2z"></path>',
  formal: '<path d="M2 16c0-2 2-3 5-4l3-1 3 0 7 3c1 .4 1.5 1 1.5 2H2z"></path><line x1="2" y1="18" x2="22" y2="18"></line>',
};
function typeIconBtn(key, label, action){
  const active = state.plpSubtype === key;
  const bg = active ? '#02263f' : '#f6f4f0', fg = active ? '#f6f4f0' : '#02263f';
  return `
  <div class="navlink" data-action="${action}" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:16px">
    <span style="width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:${bg};color:${fg};border:1px solid rgba(2,38,63,.35)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${TYPE_ICONS[key]}</svg></span>
    <span style="font:700 9px/1 Archivo;letter-spacing:.05em;text-transform:uppercase;color:${fg==='#f6f4f0'?fg:fg}">${label}</span>
  </div>`;
}
function filterCheckRow(label, count){
  return `<span style="display:flex;justify-content:space-between"><span style="display:flex;align-items:center;gap:9px"><span style="width:15px;height:15px;border:1.5px solid rgba(2,38,63,.4)"></span>${label}</span><span style="color:rgba(2,38,63,.5);font:400 11px ui-monospace,monospace">${count}</span></span>`;
}
function renderPlp(){
  const allVM = PRODUCTS.map(makeProductVM);
  const catLabel = { all:'Footwear', women:'Women', men:'Men', kids:'Kids' }[state.plpCategory];
  const plpFiltered = allVM.filter(p => (state.plpCategory === 'all' || p.category === state.plpCategory) && (state.plpSubtype === 'all' || p.type === state.plpSubtype));

  const gridCard = (p) => `
    <div class="card navlink" data-action="selectProduct" data-id="${p.id}">
      <div style="position:relative"><div class="ph cardimg" style="height:250px"><span class="phl">${esc(p.name)}</span></div>${badgeChip(p,'lg')}</div>
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:5px"><span style="font:700 10.5px/1 Archivo;letter-spacing:.14em;text-transform:uppercase;color:rgba(2,38,63,.55)">${esc(p.brand)}</span><span style="font:400 13.5px/1.35 Archivo">${esc(p.name)}</span><span style="display:flex;align-items:baseline;gap:8px;margin-top:2px"><span style="font:800 16px/1 Archivo">${p.priceLabel}</span><span style="font:400 12.5px/1 Archivo;color:rgba(2,38,63,.5);text-decoration:line-through">${p.listLabel}</span><span style="font:700 10.5px/1 Archivo;color:#8a5f22">${p.discountLabel}</span></span></div>
    </div>`;
  const listCard = (p) => `
    <div class="card navlink" data-action="selectProduct" data-id="${p.id}" style="display:flex;align-items:center;gap:20px;background:#f6f4f0;padding:16px 18px">
      <div style="position:relative;flex:none"><div class="ph cardimg" style="width:96px;height:96px"><span class="phl">${esc(p.name)}</span></div>${badgeChip(p,'sm')}</div>
      <div style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font:700 10.5px/1 Archivo;letter-spacing:.14em;text-transform:uppercase;color:rgba(2,38,63,.55)">${esc(p.brand)}</span><span style="font:400 14px/1.35 Archivo">${esc(p.name)}</span></div>
      <div style="display:flex;align-items:baseline;gap:8px;flex:none"><span style="font:800 16px/1 Archivo">${p.priceLabel}</span><span style="font:400 12.5px/1 Archivo;color:rgba(2,38,63,.5);text-decoration:line-through">${p.listLabel}</span><span style="font:700 10.5px/1 Archivo;color:#8a5f22">${p.discountLabel}</span></div>
    </div>`;

  const viewIcon = (kind, active) => {
    const bg = active ? '#02263f' : '#f6f4f0', fg = active ? '#f6f4f0' : '#02263f';
    const icons = {
      list: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
      c2: '<rect x="3" y="4" width="7" height="16"/><rect x="14" y="4" width="7" height="16"/>',
      c3: '<rect x="2" y="4" width="5.5" height="16"/><rect x="9.2" y="4" width="5.5" height="16"/><rect x="16.5" y="4" width="5.5" height="16"/>',
      c4: '<rect x="2" y="4" width="4" height="16"/><rect x="7.3" y="4" width="4" height="16"/><rect x="12.6" y="4" width="4" height="16"/><rect x="17.9" y="4" width="4" height="16"/>',
    };
    return { bg, fg, icons };
  };
  const vList = viewIcon('list', state.plpView === 'list');
  const v2 = viewIcon('c2', state.plpView === 'grid' && state.plpCols === 2);
  const v3 = viewIcon('c3', state.plpView === 'grid' && state.plpCols === 3);
  const v4 = viewIcon('c4', state.plpView === 'grid' && state.plpCols === 4);

  return `
  <div style="background:#f6f4f0;padding:20px var(--padX) 0"><span style="font:600 10.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:rgba(2,38,63,.5)">Home / Footwear / </span><span style="font:600 10.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:#02263f">${catLabel}</span></div>
  <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;padding:16px var(--padX) 24px;background:#f6f4f0">
    <div><h1 style="font:900 40px/1 Archivo;letter-spacing:-.03em;margin:0">${catLabel}</h1><div style="font:400 12.5px ui-monospace,monospace;color:rgba(2,38,63,.55);margin-top:10px">${plpFiltered.length} styles in stock</div></div>
    <div style="display:flex;align-items:center;gap:14px">
      <span style="border:1px solid rgba(2,38,63,.4);font:700 11.5px/1 Archivo;letter-spacing:.08em;text-transform:uppercase;padding:13px 16px">Sort: Newest first ▾</span>
      <div style="display:flex;gap:6px">
        <span class="navlink" data-action="setPlpView" data-id="list" title="List view" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:${vList.bg};color:${vList.fg};border:1px solid rgba(2,38,63,.4)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${vList.icons.list}</svg></span>
        <span class="navlink" data-action="setPlpCols" data-id="2" title="2 per row" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:${v2.bg};color:${v2.fg};border:1px solid rgba(2,38,63,.4)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${v2.icons.c2}</svg></span>
        <span class="navlink" data-action="setPlpCols" data-id="3" title="3 per row" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:${v3.bg};color:${v3.fg};border:1px solid rgba(2,38,63,.4)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${v3.icons.c3}</svg></span>
        <span class="navlink" data-action="setPlpCols" data-id="4" title="4 per row" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:${v4.bg};color:${v4.fg};border:1px solid rgba(2,38,63,.4)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${v4.icons.c4}</svg></span>
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:center;gap:20px;padding:0 var(--padX) 22px;flex-wrap:wrap;background:#f6f4f0;border-top:1px solid rgba(2,38,63,.15);border-bottom:2px solid #02263f">
    ${typeIconBtn('all','All styles','setSubtypeAll')}
    ${typeIconBtn('sneaker','Sneakers','setSubtypeSneaker')}
    ${typeIconBtn('boot','Boots','setSubtypeBoot')}
    ${typeIconBtn('loafer','Loafers','setSubtypeLoafer')}
    ${typeIconBtn('sandal','Sandals','setSubtypeSandal')}
    ${typeIconBtn('slipper','Slippers','setSubtypeSlipper')}
    ${typeIconBtn('heel','Heels','setSubtypeHeel')}
    ${typeIconBtn('formal','Formal','setSubtypeFormal')}
  </div>
  <div class="mobile-only" style="background:#f6f4f0;padding:14px 16px;border-bottom:2px solid #02263f"><span class="btn" data-action="toggleFilters" style="display:block;text-align:center;background:#02263f;color:#f6f4f0;font:800 11.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;padding:15px">${state.filtersOpen ? 'Hide filters' : 'Filters · 2 applied'}</span></div>
  <div class="plp-layout ${state.filtersOpen ? 'filters-open' : ''}" style="display:grid;grid-template-columns:var(--plpLayout);gap:2px;background:#02263f;padding-bottom:2px">
    <div class="filters-rail" style="background:#f6f4f0;padding:24px 22px 30px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;align-items:center;justify-content:space-between"><span style="font:800 12.5px/1 Archivo;letter-spacing:.06em;text-transform:uppercase">Filter by</span><span style="font:600 10.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:#8a5f22">Clear all</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><span style="background:#02263f;color:#f6f4f0;font:700 10.5px/1 Archivo;padding:8px 10px">Sneakers ✕</span><span style="background:#02263f;color:#f6f4f0;font:700 10.5px/1 Archivo;padding:8px 10px">Size 42 ✕</span></div>
      <div style="border-top:1px solid rgba(2,38,63,.22);padding-top:16px"><div style="font:700 11px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">Category</div><div style="display:flex;flex-direction:column;gap:9px;font:400 12.5px/1 Archivo">
        <span style="display:flex;justify-content:space-between"><span style="display:flex;align-items:center;gap:9px"><span style="width:15px;height:15px;background:#02263f"></span>Sneakers</span><span style="color:rgba(2,38,63,.5);font:400 11px ui-monospace,monospace">142</span></span>
        ${filterCheckRow('Boots',54)}
        ${filterCheckRow('Loafers',38)}
        ${filterCheckRow('Sandals',72)}
        ${filterCheckRow('Formal',62)}
      </div></div>
      <div style="border-top:1px solid rgba(2,38,63,.22);padding-top:16px"><div style="font:700 11px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">Brand</div><div style="border:1px solid rgba(2,38,63,.35);margin-bottom:10px;padding:9px 11px;font:400 12px/1 Archivo;color:rgba(2,38,63,.45)">Search brand…</div><div style="display:flex;flex-direction:column;gap:9px;font:400 12.5px/1 Archivo">
        ${filterCheckRow('Brand A',32)}
        ${filterCheckRow('Brand B',28)}
        ${filterCheckRow('Brand D',19)}
        <span style="font:600 11.5px/1 Archivo;color:#8a5f22;padding-top:2px">+ 36 more brands</span>
      </div></div>
      <div style="border-top:1px solid rgba(2,38,63,.22);padding-top:16px"><div style="font:700 11px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">Size (EU)</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
        <span class="szbtn">39</span><span class="szbtn">40</span><span class="szbtn">41</span><span class="szbtn" style="background:#02263f;color:#f6f4f0">42</span><span class="szbtn">43</span><span class="szbtn">44</span><span class="szoff">45</span><span class="szbtn">46</span>
      </div></div>
      <div style="border-top:1px solid rgba(2,38,63,.22);padding-top:16px"><div style="font:700 11px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">Price</div><div style="height:4px;background:rgba(2,38,63,.15);position:relative;margin:12px 4px"><span style="position:absolute;left:18%;right:35%;top:0;bottom:0;background:#02263f"></span><span style="position:absolute;left:18%;top:-6px;width:16px;height:16px;background:#02263f"></span><span style="position:absolute;right:35%;top:-6px;width:16px;height:16px;background:#02263f"></span></div><div style="display:flex;justify-content:space-between;font:400 11.5px ui-monospace,monospace;color:rgba(2,38,63,.6)"><span>€20</span><span>€180</span></div></div>
      <div style="border-top:1px solid rgba(2,38,63,.22);padding-top:16px"><div style="font:700 11px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">Availability</div><div style="display:flex;flex-direction:column;gap:9px;font:400 12.5px/1 Archivo">
        <span style="display:flex;align-items:center;gap:9px"><span style="width:15px;height:15px;border:1.5px solid rgba(2,38,63,.4)"></span>In stock only</span>
        <span style="display:flex;align-items:center;gap:9px"><span style="width:15px;height:15px;border:1.5px solid rgba(2,38,63,.4)"></span>New today</span>
        <span style="display:flex;align-items:center;gap:9px"><span style="width:15px;height:15px;border:1.5px solid rgba(2,38,63,.4)"></span>Last pair only</span>
      </div></div>
    </div>
    <div style="background:#f6f4f0;padding:24px 28px 30px">
      ${state.plpView === 'grid'
        ? `<div class="plp-grid cols-${state.plpCols}" style="display:grid;gap:24px">${plpFiltered.map(gridCard).join('')}</div>`
        : `<div style="display:flex;flex-direction:column;gap:2px;background:rgba(2,38,63,.25)">${plpFiltered.map(listCard).join('')}</div>`}
      <div style="display:flex;justify-content:center;gap:2px;margin-top:30px"><span style="border:1px solid rgba(2,38,63,.35);padding:11px 15px;font:700 12px/1 Archivo">←</span><span style="background:#02263f;color:#f6f4f0;padding:11px 16px;font:700 12px/1 Archivo">1</span><span style="border:1px solid rgba(2,38,63,.35);padding:11px 16px;font:700 12px/1 Archivo">2</span><span style="border:1px solid rgba(2,38,63,.35);padding:11px 16px;font:700 12px/1 Archivo">3</span><span style="border:1px solid rgba(2,38,63,.35);padding:11px 15px;font:700 12px/1 Archivo">→</span></div>
    </div>
  </div>`;
}

/* subtype action shims so typeIconBtn's data-action names resolve */
Object.assign(actions, {
  setSubtypeAll(){ actions.setSubtype('all'); },
  setSubtypeSneaker(){ actions.setSubtype('sneaker'); },
  setSubtypeBoot(){ actions.setSubtype('boot'); },
  setSubtypeLoafer(){ actions.setSubtype('loafer'); },
  setSubtypeSandal(){ actions.setSubtype('sandal'); },
  setSubtypeSlipper(){ actions.setSubtype('slipper'); },
  setSubtypeHeel(){ actions.setSubtype('heel'); },
  setSubtypeFormal(){ actions.setSubtype('formal'); },
});

/* ---------- PDP ---------- */
function renderPdp(){
  const raw = PRODUCTS.find(p => p.id === state.selectedProductId);
  if (!raw) return `<div style="padding:60px var(--padX);text-align:center">Product not found. <span class="navlink" data-action="goNewStock" style="color:#8a5f22">Back to shop</span></div>`;
  const vm = makeProductVM(raw);
  const sizesHtml = raw.sizes.map(sz => {
    const outOfStock = raw.outSizes.includes(sz);
    const isSelected = state.selectedSize === sz;
    if (outOfStock) return `<span class="szoff">${sz}</span>`;
    const bg = isSelected ? '#02263f' : 'transparent', fg = isSelected ? '#f6f4f0' : '#02263f';
    return `<span class="szbtn" data-action="pickSize" data-id="${raw.id}" data-size="${sz}" style="background:${bg};color:${fg}">${sz}</span>`;
  }).join('');
  const sizeHint = state.selectedSize ? `Size ${state.selectedSize} selected` : 'Choose a size';
  const addBtnLabel = state.selectedSize ? 'Add to cart' : 'Select a size';
  const addBtnBg = state.selectedSize ? '#02263f' : 'rgba(2,38,63,.35)';

  const relatedProducts = PRODUCTS.filter(p => p.id !== raw.id).slice(0,8).map(makeProductVM);
  const relCard = (p) => `
    <div class="card navlink" data-action="selectProduct" data-id="${p.id}">
      <div style="position:relative"><div class="ph cardimg" style="height:200px"><span class="phl">${esc(p.name)}</span></div>${badgeChip(p)}</div>
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px"><span style="font:700 10px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;color:rgba(2,38,63,.55)">${esc(p.brand)}</span><span style="font:400 12.5px/1.3 Archivo">${esc(p.name)}</span><span style="display:flex;align-items:baseline;gap:7px;margin-top:2px"><span style="font:800 14px/1 Archivo">${p.priceLabel}</span><span style="font:400 11.5px/1 Archivo;color:rgba(2,38,63,.5);text-decoration:line-through">${p.listLabel}</span></span></div>
    </div>`;

  return `
  <div style="background:#f6f4f0;padding:16px var(--padX) 0"><span class="navlink" data-action="goPlpBack" style="font:600 10.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:#8a5f22">← Back to listing</span></div>
  <div style="display:grid;grid-template-columns:var(--pdpCols);gap:2px;background:#02263f;padding:18px var(--padX) 40px;background-clip:content-box">
    <div style="position:relative"><div class="ph" style="height:var(--pdpImgH)"><span class="phl">photo — ${esc(vm.name)}</span></div>${badgeChip(vm,'lg')}</div>
    <div style="background:#f6f4f0;padding:var(--pdpInfoPad);display:flex;flex-direction:column;gap:20px">
      <div><span style="font:700 11px/1 Archivo;letter-spacing:.16em;text-transform:uppercase;color:rgba(2,38,63,.55)">${esc(vm.brand)}</span><h1 style="font:900 32px/1.05 Archivo;letter-spacing:-.025em;margin:12px 0 0">${esc(vm.name)}</h1></div>
      <div style="display:flex;align-items:baseline;gap:10px"><span style="font:800 24px/1 Archivo">${vm.priceLabel}</span><span style="font:400 14px/1 Archivo;color:rgba(2,38,63,.5);text-decoration:line-through">${vm.listLabel}</span><span style="font:700 12px/1 Archivo;color:#8a5f22">${vm.discountLabel}</span></div>
      <div>
        <div style="font:700 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px">Size (EU)</div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">${sizesHtml}</div>
        <div style="font:400 11px ui-monospace,monospace;color:#8a5f22;margin-top:10px">${sizeHint}</div>
      </div>
      <div style="display:flex;gap:10px"><span class="btn" data-action="addToCart" style="background:${addBtnBg};color:#f6f4f0;font:800 14px/1 Archivo;padding:18px 22px;flex:1;text-align:center">${addBtnLabel}</span></div>
      <p style="font:400 12.5px/1.6 Archivo;color:rgba(2,38,63,.65);margin:0">Genuine warehouse stock, single-run sizes. What you see is what's left.</p>
    </div>
  </div>
  <div style="background:#f6f4f0;padding:10px var(--padX) 50px">
    <div style="font:800 20px/1 Archivo;letter-spacing:-.01em;margin-bottom:20px">Related products</div>
    <div style="display:grid;grid-template-columns:var(--prodCols);gap:24px">${relatedProducts.map(relCard).join('')}</div>
  </div>`;
}

/* ---------- Search ---------- */
function renderSearch(){
  const q = state.searchQuery.trim().toLowerCase();
  const allVM = PRODUCTS.map(makeProductVM);
  const searchResults = q ? allVM.filter(p => (p.name + ' ' + p.brand).toLowerCase().includes(q)) : [];
  const trending = ['Sneakers','Ankle boots','Brand D','Loafers','Sandals'];

  const resultCard = (p) => `
    <div class="card navlink" data-action="selectProduct" data-id="${p.id}">
      <div class="ph cardimg" style="height:220px"><span class="phl">${esc(p.name)}</span></div>
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px"><span style="font:700 10px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;color:rgba(2,38,63,.55)">${esc(p.brand)}</span><span style="font:400 12.5px/1.3 Archivo">${esc(p.name)}</span><span style="font:800 14px/1 Archivo">${p.priceLabel}</span></div>
    </div>`;

  if (q) {
    return `
    <div style="background:#f6f4f0;padding:40px var(--padX) 50px;min-height:400px">
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:24px"><span style="font:400 13px/1 Archivo;color:rgba(2,38,63,.6)">${searchResults.length} results for</span><span style="font:800 16px/1 Archivo">"${esc(state.searchQuery)}"</span></div>
      <div style="display:grid;grid-template-columns:var(--prodCols);gap:24px">${searchResults.map(resultCard).join('')}</div>
      ${searchResults.length === 0 ? `<p style="font:400 13px/1.6 Archivo;color:rgba(2,38,63,.6)">No results — try "sneaker", "boot" or a brand name.</p>` : ''}
    </div>`;
  }
  return `
  <div style="background:#f6f4f0;padding:40px var(--padX) 50px;min-height:400px">
    <div style="font:700 11px/1 Archivo;letter-spacing:.14em;text-transform:uppercase;color:#8a5f22;margin-bottom:14px">Trending searches</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${trending.map(t => `<span class="btn" data-action="pickTrending" data-id="${t.toLowerCase()}" style="border:1px solid rgba(2,38,63,.4);font:700 11.5px/1 Archivo;padding:11px 15px">${t}</span>`).join('')}
    </div>
  </div>`;
}

/* ---------- Account ---------- */
function renderAccount(){
  if (!state.isLoggedIn) {
    return `
    <div style="background:#f6f4f0;padding:60px var(--padX);display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;min-height:340px;justify-content:center">
      <h1 style="font:900 28px/1 Archivo;margin:0">Sign in to see your account</h1>
      <p style="font:400 13px/1.6 Archivo;color:rgba(2,38,63,.6);margin:0">Track orders, save addresses and see your wishlist.</p>
      <span class="btn" data-action="openAuthSignin" style="background:#02263f;color:#f6f4f0;font:800 14px/1 Archivo;padding:16px 24px">Sign in</span>
    </div>`;
  }
  const tab = state.accountTab;
  const navItem = (key, label, action) => {
    const active = tab === key;
    return `<span class="navlink" data-action="${action}" style="padding:14px 20px;font:700 11.5px/1 Archivo;letter-spacing:.06em;text-transform:uppercase;border-top:${key==='orders'?'none':'1px solid rgba(2,38,63,.15)'};background:${active?'#02263f':'transparent'};color:${active?'#f6f4f0':'#02263f'}">${label}</span>`;
  };
  let panel = '';
  if (tab === 'orders') {
    panel = `
    <h1 style="font:900 26px/1 Archivo;letter-spacing:-.02em;margin:0 0 20px">Order history</h1>
    <div style="display:flex;flex-direction:column;gap:2px;background:rgba(2,38,63,.4);border:1px solid rgba(2,38,63,.4)">
      <div style="background:#f6f4f0;padding:18px 20px;display:flex;align-items:baseline;justify-content:space-between"><span style="font:800 14px/1 Archivo">#ST-20487</span><span style="font:700 9.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;padding:6px 9px;background:#02263f;color:#f6f4f0">Shipped</span><span style="font:800 14px/1 Archivo">€119.80</span></div>
      <div style="background:#f6f4f0;padding:18px 20px;display:flex;align-items:baseline;justify-content:space-between"><span style="font:800 14px/1 Archivo">#ST-20361</span><span style="font:700 9.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;padding:6px 9px;border:1px solid rgba(2,38,63,.35)">Delivered</span><span style="font:800 14px/1 Archivo">€54.90</span></div>
    </div>`;
  } else if (tab === 'addresses') {
    panel = `
    <h1 style="font:900 26px/1 Archivo;letter-spacing:-.02em;margin:0 0 20px">Saved addresses</h1>
    <div style="border:1px solid rgba(2,38,63,.4);padding:18px 20px;max-width:340px"><span style="font:800 14px/1 Archivo">Home</span><div style="font:400 12.5px/1.6 Archivo;color:rgba(2,38,63,.7);margin-top:8px">Marco Rossi<br>Via Roma 12<br>20100 Milano, Italy</div></div>`;
  } else {
    panel = `
    <h1 style="font:900 26px/1 Archivo;letter-spacing:-.02em;margin:0 0 20px">Wishlist</h1>
    <p style="font:400 13px/1.5 Archivo;color:rgba(2,38,63,.6)">Nothing saved yet — tap the ♡ on any product.</p>`;
  }
  return `
  <div style="display:grid;grid-template-columns:var(--accountCols);gap:2px;background:#02263f">
    <div style="background:#f6f4f0;display:flex;flex-direction:column">
      <div style="padding:24px 20px;border-bottom:2px solid #02263f"><div style="font:700 10px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;color:rgba(2,38,63,.5)">Welcome back</div><div style="font:800 18px/1 Archivo;margin-top:8px">Marco Rossi</div></div>
      ${navItem('orders','Orders','tabOrders')}
      ${navItem('addresses','Addresses','tabAddresses')}
      ${navItem('wishlist','Wishlist','tabWishlist')}
      <span class="navlink" data-action="signOut" style="padding:14px 20px;font:700 11.5px/1 Archivo;letter-spacing:.06em;text-transform:uppercase;border-top:1px solid rgba(2,38,63,.15);color:#8a5f22">Sign out</span>
    </div>
    <div style="background:#f6f4f0;padding:32px 36px">${panel}</div>
  </div>`;
}

/* ---------- Checkout ---------- */
function renderCheckout(){
  const step = state.checkoutStep;
  const stepColor = (n) => step === n ? '#02263f' : (step > n ? '#8a5f22' : 'rgba(2,38,63,.4)');
  const stepBg = (n) => step === n ? '#02263f' : (step > n ? '#8a5f22' : 'transparent');
  const stepFg = (n) => step >= n ? '#f6f4f0' : 'rgba(2,38,63,.4)';
  const stepBorder = (n) => step >= n ? 'none' : '1.5px solid rgba(2,38,63,.3)';
  const stepPill = (n, label) => `<span style="font:700 11px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;gap:8px;color:${stepColor(n)}"><span style="width:24px;height:24px;background:${stepBg(n)};color:${stepFg(n)};display:flex;align-items:center;justify-content:center;font:800 12px/1 Archivo;border:${stepBorder(n)}">${n}</span>${label}</span>`;

  const cartVM = state.cart.map(ci => { const p = PRODUCTS.find(x => x.id === ci.productId); return { ...ci, p }; });
  const subtotal = cartVM.reduce((sum, ci) => sum + (ci.p ? ci.p.price : 0), 0);

  const stepsBar = `
  <div style="background:#f6f4f0;padding:20px var(--padX);border-bottom:2px solid #02263f;display:flex;flex-wrap:wrap;justify-content:center;gap:var(--stepGap)">
    ${stepPill(1,'Shipping')}${stepPill(2,'Delivery')}${stepPill(3,'Payment')}${stepPill(4,'Confirm')}
  </div>`;

  if (step === 4) {
    return stepsBar + `
    <div style="padding:70px var(--padX) 90px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:18px;background:#f6f4f0">
      <span style="width:56px;height:56px;background:#ce9c59;color:#02263f;font:900 26px/1 Archivo;display:flex;align-items:center;justify-content:center">✓</span>
      <h1 style="font:900 34px/1 Archivo;letter-spacing:-.02em;margin:0">Order confirmed</h1>
      <p style="font:400 14px/1.6 Archivo;color:rgba(2,38,63,.7);margin:0;max-width:42ch">Thank you, Marco. Order <strong>#ST-${state.orderNumber}</strong> is being prepared.</p>
      <span class="btn" data-action="goHome" style="background:#02263f;color:#f6f4f0;font:800 14px/1 Archivo;padding:17px 24px;margin-top:10px">Continue shopping</span>
    </div>`;
  }

  let stepContent = '';
  if (step === 1) {
    stepContent = `
    <h1 style="font:900 28px/1 Archivo;letter-spacing:-.02em;margin:0 0 22px">Shipping address</h1>
    <div style="display:flex;flex-direction:column;gap:14px;max-width:440px">
      <input placeholder="Email" value="marco.rossi@email.it" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><input placeholder="First name" value="Marco" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none"><input placeholder="Last name" value="Rossi" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none"></div>
      <input placeholder="Address" value="Via Roma 12" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none">
    </div>
    <span class="btn" data-action="goStep2" style="background:#02263f;color:#f6f4f0;font:800 14px/1 Archivo;padding:17px 26px;display:inline-block;margin-top:26px">Continue to delivery →</span>`;
  } else if (step === 2) {
    stepContent = `
    <h1 style="font:900 28px/1 Archivo;letter-spacing:-.02em;margin:0 0 22px">Delivery method</h1>
    <div style="display:flex;flex-direction:column;gap:2px;background:rgba(2,38,63,.4);border:1px solid rgba(2,38,63,.4);max-width:500px">
      <div style="background:#f6f4f0;padding:18px 20px;display:flex;justify-content:space-between"><span style="font:700 13px/1 Archivo">Standard delivery — 2–4 days</span><span style="font:800 13px/1 Archivo;color:#8a5f22">Free</span></div>
      <div style="background:#f6f4f0;padding:18px 20px;display:flex;justify-content:space-between"><span style="font:700 13px/1 Archivo">Express — next day</span><span style="font:800 13px/1 Archivo">€9.90</span></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:26px"><span class="btn" data-action="goStep1" style="border:1px solid rgba(2,38,63,.4);font:800 13px/1 Archivo;padding:16px 22px">← Back</span><span class="btn" data-action="goStep3" style="background:#02263f;color:#f6f4f0;font:800 14px/1 Archivo;padding:17px 26px">Continue to payment →</span></div>`;
  } else if (step === 3) {
    stepContent = `
    <h1 style="font:900 28px/1 Archivo;letter-spacing:-.02em;margin:0 0 22px">Payment</h1>
    <div style="display:flex;flex-direction:column;gap:14px;max-width:440px">
      <input placeholder="Card number" value="4242 4242 4242 4242" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><input placeholder="Expiry" value="08/29" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none"><input placeholder="CVC" value="123" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none"></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:26px"><span class="btn" data-action="goStep2" style="border:1px solid rgba(2,38,63,.4);font:800 13px/1 Archivo;padding:16px 22px">← Back</span><span class="btn" data-action="placeOrder" style="background:#02263f;color:#f6f4f0;font:800 14px/1 Archivo;padding:17px 26px">Place order · ${fmt(subtotal)}</span></div>`;
  }

  return stepsBar + `
  <div style="display:grid;grid-template-columns:var(--checkoutCols);gap:2px;background:#02263f">
    <div style="background:#f6f4f0;padding:40px var(--padX)">${stepContent}</div>
    <div style="background:#e8e4dc;padding:32px 26px;display:flex;flex-direction:column;gap:16px">
      <span style="font:800 13px/1 Archivo;letter-spacing:.06em;text-transform:uppercase">Order summary</span>
      ${cartVM.map(ci => ci.p ? `<div style="display:flex;gap:12px"><div class="ph" style="width:56px;height:68px;flex:none"><span class="phl">img</span></div><div><span style="font:400 12px/1.3 Archivo">${esc(ci.p.name)}</span><div style="font:400 10.5px ui-monospace,monospace;color:rgba(2,38,63,.55);margin-top:4px">Size ${ci.size}</div><div style="font:800 13px/1 Archivo;margin-top:4px">${fmt(ci.p.price)}</div></div></div>` : '').join('')}
      <div style="border-top:1px solid rgba(2,38,63,.3);padding-top:14px;display:flex;justify-content:space-between;font:800 16px/1 Archivo"><span>Total</span><span>${fmt(subtotal)}</span></div>
    </div>
  </div>`;
}

/* ---------- View dispatcher ---------- */
function renderView(){
  switch (state.view) {
    case 'landing': return renderLanding();
    case 'category': return renderCategory();
    case 'plp': return renderPlp();
    case 'pdp': return renderPdp();
    case 'search': return renderSearch();
    case 'account': return renderAccount();
    case 'checkout': return renderCheckout();
    default: return renderLanding();
  }
}

/* ---------- Newsletter + footer (shown on every screen) ---------- */
function renderNewsletterFooter(){
  return `
  <div style="background:#ce9c59;color:#02263f;padding:52px var(--padX);display:grid;grid-template-columns:var(--newsCols);gap:40px;align-items:end;border-bottom:2px solid #02263f">
    <div><span style="font:700 11px/1 Archivo;letter-spacing:.2em;text-transform:uppercase">One email a week, new stock only</span><h2 style="font:900 var(--newsH2)/.94 Archivo;letter-spacing:-.038em;margin:16px 0 0">Know what lands<br>before anyone else.</h2></div>
    <div style="display:flex;flex-direction:column;gap:12px"><div style="display:flex;border:1px solid #02263f;background:#f6f4f0"><span style="font:400 13.5px/1 Archivo;color:rgba(2,38,63,.55);padding:17px;flex:1">Your email</span><span style="background:#02263f;color:#f6f4f0;font:800 12px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;padding:0 20px;display:flex;align-items:center">Sign me up</span></div><span style="font:400 11.5px/1.5 Archivo;color:rgba(2,38,63,.75)">No ads: just the brands that landed in the warehouse. Unsubscribe in one click.</span></div>
  </div>
  <div style="background:#02263f;color:#f6f4f0;padding:40px var(--padX) 28px;margin-top:auto">
    <div style="display:grid;grid-template-columns:var(--footCols);gap:30px;padding-bottom:28px;border-bottom:1px solid rgba(246,244,240,.25)">
      <div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start"><span style="background:#f6f4f0;padding:7px 9px;display:inline-flex"><img src="${LOGO_SRC}" alt="Stockisti Online" style="height:70px;width:auto;display:block"></span><span style="font:400 12px/1.6 Archivo;color:rgba(246,244,240,.75);max-width:32ch">Wholesale and retail since 2000. Genuine branded stock, selected in Italy.</span></div>
      <div style="display:flex;flex-direction:column;gap:10px;font:400 12px/1 Archivo;color:rgba(246,244,240,.78)"><span style="font:700 10px/1 Archivo;letter-spacing:.16em;text-transform:uppercase;color:#ce9c59;margin-bottom:4px">Shop</span><span>Women</span><span>Men</span><span>Kids</span><span>Brands A–Z</span></div>
      <div style="display:flex;flex-direction:column;gap:10px;font:400 12px/1 Archivo;color:rgba(246,244,240,.78)"><span style="font:700 10px/1 Archivo;letter-spacing:.16em;text-transform:uppercase;color:#ce9c59;margin-bottom:4px">Help</span><span>Shipping &amp; returns</span><span>Size guide</span><span>Contact</span></div>
      <div style="display:flex;flex-direction:column;gap:10px;font:400 12px/1 Archivo;color:rgba(246,244,240,.78)"><span style="font:700 10px/1 Archivo;letter-spacing:.16em;text-transform:uppercase;color:#ce9c59;margin-bottom:4px">Company</span><span>About us</span><span>Wholesale</span><span>Privacy</span></div>
    </div>
    <div style="display:flex;justify-content:space-between;padding-top:18px;font:400 11px/1 Archivo;color:rgba(246,244,240,.6)"><span>© 2026 Stockisti Online</span><span>Clickable prototype — not every link is wired</span></div>
  </div>`;
}

/* ---------- Mobile bottom bar / menu / drawers ---------- */
function renderMobileBottomBar(){
  return `
  <div class="mobile-bottom-bar" style="position:sticky;bottom:0;width:100%;background:#f6f4f0;border-top:2px solid #02263f;grid-template-columns:repeat(4,1fr);z-index:50">
    <span class="navlink" data-action="goHome" style="min-height:56px;display:flex;align-items:center;justify-content:center;font:700 10px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;border-right:1px solid rgba(2,38,63,.2)">Home</span>
    <span class="navlink" data-action="goCategory" style="min-height:56px;display:flex;align-items:center;justify-content:center;font:700 10px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;border-right:1px solid rgba(2,38,63,.2)">Shop</span>
    <span class="navlink" data-action="goSearch" style="min-height:56px;display:flex;align-items:center;justify-content:center;font:700 10px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;border-right:1px solid rgba(2,38,63,.2)">Search</span>
    <span class="navlink" data-action="toggleCart" style="min-height:56px;display:flex;align-items:center;justify-content:center;font:700 10px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;background:#02263f;color:#f6f4f0">Cart ${state.cart.length}</span>
  </div>`;
}

function renderMobileMenu(){
  const open = state.menuOpen;
  return `
  <div class="mobile-menu-overlay ${open?'open':''}" data-action="closeMenu" style="position:fixed;inset:0;background:rgba(2,38,63,.45);z-index:44"></div>
  <div class="mobile-menu-panel ${open?'open':''}" style="position:fixed;top:0;left:0;bottom:0;width:330px;max-width:88%;background:#f6f4f0;border-right:2px solid #02263f;z-index:45;flex-direction:column;overflow:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:2px solid #02263f">
      <span style="font:800 13px/1 Archivo;letter-spacing:.1em;text-transform:uppercase">Menu</span>
      <span class="btn" data-action="closeMenu" style="border:1px solid rgba(2,38,63,.4);padding:11px 13px;font:700 12px/1 Archivo">✕</span>
    </div>
    <div style="display:flex;flex-direction:column">
      <span class="navlink" data-action="goCategory" style="padding:17px 20px;font:800 13px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(2,38,63,.18)">Footwear</span>
      <span class="navlink" data-action="pickWomen" style="padding:15px 20px 15px 34px;font:400 13px/1 Archivo;border-bottom:1px solid rgba(2,38,63,.12)">Women</span>
      <span class="navlink" data-action="pickMen" style="padding:15px 20px 15px 34px;font:400 13px/1 Archivo;border-bottom:1px solid rgba(2,38,63,.12)">Men</span>
      <span class="navlink" data-action="pickKids" style="padding:15px 20px 15px 34px;font:400 13px/1 Archivo;border-bottom:1px solid rgba(2,38,63,.18)">Kids</span>
      <span class="navlink" data-action="goNewStock" style="padding:17px 20px;font:800 13px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;color:#8a5f22;border-bottom:1px solid rgba(2,38,63,.18)">New stock · 214</span>
      <span style="padding:17px 20px;font:800 13px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(2,38,63,.18)">Brands A–Z</span>
      <span style="padding:17px 20px;font:800 13px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;color:rgba(2,38,63,.4);border-bottom:1px solid rgba(2,38,63,.18)">Clothing · soon</span>
      <span style="padding:17px 20px;font:800 13px/1 Archivo;letter-spacing:.07em;text-transform:uppercase;color:rgba(2,38,63,.4);border-bottom:2px solid #02263f">Home &amp; Living · soon</span>
      <span class="navlink" data-action="onAccountClick" style="padding:16px 20px;font:600 11.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid rgba(2,38,63,.18)">Account</span>
      <span style="padding:16px 20px;font:600 11.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid rgba(2,38,63,.18)">Wishlist (4)</span>
      <span class="navlink" data-action="toggleCart" style="padding:16px 20px;font:600 11.5px/1 Archivo;letter-spacing:.1em;text-transform:uppercase;border-bottom:2px solid #02263f">Cart · ${state.cart.length}</span>
    </div>
    <div style="padding:20px;display:flex;flex-direction:column;gap:8px;font:700 10px/1.5 Archivo;letter-spacing:.14em;text-transform:uppercase;color:rgba(2,38,63,.6)">
      <span>Free shipping over €79</span><span>30-day returns</span><span>IT / EN</span>
    </div>
  </div>`;
}

function renderCartDrawer(){
  if (!state.cartOpen) return '';
  const cartVM = state.cart.map((ci,i) => { const p = PRODUCTS.find(x => x.id === ci.productId); return { ...ci, p, index:i }; });
  const subtotal = cartVM.reduce((sum, ci) => sum + (ci.p ? ci.p.price : 0), 0);
  return `
  <div data-action="closeCart" style="position:fixed;inset:0;background:rgba(2,38,63,.45);z-index:40"></div>
  <div style="position:fixed;top:0;right:0;bottom:0;width:var(--drawerW);background:#f6f4f0;border-left:2px solid #02263f;z-index:41;display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:2px solid #02263f"><span style="font:800 15px/1 Archivo;letter-spacing:.04em;text-transform:uppercase">Your cart · ${state.cart.length}</span><span class="btn" data-action="closeCart" style="border:1px solid rgba(2,38,63,.4);padding:10px 12px;font:700 12px/1 Archivo">✕</span></div>
    <div style="flex:1;overflow:auto">
      ${cartVM.filter(ci=>ci.p).map(ci => `
        <div style="display:flex;gap:14px;padding:18px 24px;border-bottom:1px solid rgba(2,38,63,.2)">
          <div class="ph" style="width:70px;height:84px;flex:none"><span class="phl">img</span></div>
          <div style="flex:1"><span style="font:700 10px/1 Archivo;letter-spacing:.12em;text-transform:uppercase;color:rgba(2,38,63,.55)">${esc(ci.p.brand)}</span><div style="font:400 13px/1.3 Archivo;margin-top:4px">${esc(ci.p.name)}</div><div style="font:400 10.5px ui-monospace,monospace;color:rgba(2,38,63,.55);margin-top:4px">Size ${ci.size}</div><div style="font:800 14px/1 Archivo;margin-top:4px">${fmt(ci.p.price)}</div></div>
          <span class="navlink" data-action="removeFromCart" data-id="${ci.index}" style="font:600 10.5px/1 Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8a5f22;align-self:flex-start">Remove</span>
        </div>`).join('')}
      ${cartVM.length === 0 ? `<p style="padding:24px;font:400 13px/1.5 Archivo;color:rgba(2,38,63,.6)">Your cart is empty.</p>` : ''}
    </div>
    <div style="padding:20px 24px;border-top:2px solid #02263f;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;justify-content:space-between;font:800 16px/1 Archivo"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <span class="btn" data-action="proceedToCheckout" style="background:${state.cart.length ? '#02263f' : 'rgba(2,38,63,.3)'};color:#f6f4f0;font:800 14px/1 Archivo;padding:17px;text-align:center">Checkout</span>
    </div>
  </div>`;
}

function renderAuthDrawer(){
  if (!state.authOpen) return '';
  const isSignin = state.authTab === 'signin';
  return `
  <div data-action="closeAuth" style="position:fixed;inset:0;background:rgba(2,38,63,.45);z-index:40"></div>
  <div style="position:fixed;top:0;right:0;bottom:0;width:var(--drawerW);background:#f6f4f0;border-left:2px solid #02263f;z-index:41;display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:2px solid #02263f"><span style="font:800 15px/1 Archivo;letter-spacing:.04em;text-transform:uppercase">Your account</span><span class="btn" data-action="closeAuth" style="border:1px solid rgba(2,38,63,.4);padding:10px 12px;font:700 12px/1 Archivo">✕</span></div>
    <div style="display:flex;border-bottom:2px solid #02263f">
      <span class="navlink" data-action="authTabSignin" style="flex:1;text-align:center;padding:16px;font:800 12px/1 Archivo;letter-spacing:.06em;text-transform:uppercase;background:${isSignin?'#02263f':'transparent'};color:${isSignin?'#f6f4f0':'#02263f'}">Sign in</span>
      <span class="navlink" data-action="authTabSignup" style="flex:1;text-align:center;padding:16px;font:800 12px/1 Archivo;letter-spacing:.06em;text-transform:uppercase;background:${!isSignin?'#02263f':'transparent'};color:${!isSignin?'#f6f4f0':'#02263f'}">Create account</span>
    </div>
    <div style="flex:1;padding:26px 26px 0;display:flex;flex-direction:column;gap:14px">
      ${isSignin ? `
        <input placeholder="Email" value="marco.rossi@email.it" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none">
        <input type="password" placeholder="Password" value="••••••••" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none">
        <span class="btn" data-action="signIn" style="background:#02263f;color:#f6f4f0;font:800 14px/1 Archivo;padding:17px;text-align:center">Sign in</span>` : `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><input placeholder="First name" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none"><input placeholder="Last name" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none"></div>
        <input placeholder="Email" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none">
        <input type="password" placeholder="Password" style="border:1px solid rgba(2,38,63,.4);padding:14px;font:400 13px/1 Archivo;outline:none">
        <span class="btn" data-action="signUp" style="background:#02263f;color:#f6f4f0;font:800 14px/1 Archivo;padding:17px;text-align:center">Create account</span>`}
    </div>
  </div>`;
}

/* ---------- Top-level render ---------- */
function renderApp(){
  return `
  ${renderHeader()}
  <div id="main-content" style="flex:1;display:flex;flex-direction:column">${renderView()}</div>
  ${renderNewsletterFooter()}
  ${renderMobileBottomBar()}
  ${renderMobileMenu()}
  ${renderCartDrawer()}
  ${renderAuthDrawer()}
  `;
}

function render(){
  document.getElementById('app').innerHTML = renderApp();
}
