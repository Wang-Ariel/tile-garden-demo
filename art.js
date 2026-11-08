const symbols = {
  leaf: `<path d="M22 66C10 35 33 12 70 17C78 48 55 73 22 66Z" fill="#83ac64" stroke="#416c4d" stroke-width="3"/><path d="M17 76L57 31M33 59L31 41M42 49L60 49" fill="none" stroke="#416c4d" stroke-width="3" stroke-linecap="round"/>`,
  pear: `<path d="M45 24Q43 14 51 9" fill="none" stroke="#795338" stroke-width="5" stroke-linecap="round"/><path d="M49 22Q58 4 72 15Q62 29 49 22" fill="#74a55a" stroke="#416c4d" stroke-width="2"/><path d="M44 24C30 24 34 39 22 49C4 68 23 84 46 83C70 84 84 66 66 49C54 38 59 23 44 24Z" fill="#f3c957" stroke="#bb8738" stroke-width="3"/><path d="M34 38Q30 49 23 56" fill="none" stroke="#ffe8a0" stroke-width="6" stroke-linecap="round"/><circle cx="56" cy="68" r="2" fill="#dca740"/>`,
  flower: `<path d="M46 81V48M46 69Q18 70 22 54Q40 52 46 69M47 75Q70 74 70 60Q55 57 47 75" fill="#82aa67" stroke="#426d50" stroke-width="3" stroke-linejoin="round"/><g fill="#f6b6a9" stroke="#ce7b75" stroke-width="2.5"><ellipse cx="46" cy="24" rx="12" ry="17"/><ellipse cx="64" cy="37" rx="17" ry="12" transform="rotate(-25 64 37)"/><ellipse cx="58" cy="56" rx="12" ry="17" transform="rotate(-30 58 56)"/><ellipse cx="34" cy="56" rx="12" ry="17" transform="rotate(30 34 56)"/><ellipse cx="27" cy="37" rx="17" ry="12" transform="rotate(25 27 37)"/></g><circle cx="46" cy="41" r="12" fill="#f8d46f" stroke="#c99446" stroke-width="2"/><circle cx="43" cy="38" r="3" fill="#ffedb6"/>`,
  berry: `<path d="M45 28Q41 13 51 9M46 25Q60 7 73 18Q63 30 46 25" fill="#83ac64" stroke="#416c4d" stroke-width="3" stroke-linecap="round"/><g fill="#ce6b85" stroke="#984961" stroke-width="2.5"><circle cx="34" cy="39" r="14"/><circle cx="58" cy="39" r="14"/><circle cx="25" cy="58" r="14"/><circle cx="46" cy="57" r="15"/><circle cx="67" cy="58" r="14"/><circle cx="35" cy="74" r="12"/><circle cx="57" cy="74" r="12"/></g><path d="M29 34L34 31M53 34L58 31M20 53L25 50" stroke="#f4b0ba" stroke-width="4" stroke-linecap="round"/>`,
  mushroom: `<path d="M35 42 29 77Q46 88 64 77L57 42" fill="#f3deb1" stroke="#99734a" stroke-width="3"/><path d="M10 48C12 3 78 3 82 48Q48 62 10 48Z" fill="#d98762" stroke="#a45b46" stroke-width="3"/><g fill="#fff2cf"><circle cx="33" cy="28" r="7"/><circle cx="60" cy="34" r="8"/><circle cx="43" cy="46" r="5"/></g><path d="M41 65v10" stroke="#d7bb8b" stroke-width="4" stroke-linecap="round"/>`,
  butterfly: `<g stroke="#8268a3" stroke-width="3"><path d="M44 46C9 2 2 26 19 52C1 85 34 85 44 55Z" fill="#b9a2df"/><path d="M48 46C83 2 90 26 73 52C91 85 58 85 48 55Z" fill="#c6b6eb"/></g><g fill="#f7e5b3"><ellipse cx="27" cy="37" rx="8" ry="12" transform="rotate(-30 27 37)"/><ellipse cx="65" cy="37" rx="8" ry="12" transform="rotate(30 65 37)"/><circle cx="29" cy="65" r="5"/><circle cx="63" cy="65" r="5"/></g><path d="M46 65V35m0 1-8-13m8 13 8-13" fill="none" stroke="#695a69" stroke-width="4" stroke-linecap="round"/>`,
  carrot: `<path d="M52 32Q39 9 53 9L62 28Q62 4 75 13L67 31Q87 13 85 29L68 40" fill="#7cac62" stroke="#47734c" stroke-width="3" stroke-linejoin="round"/><path d="M50 28Q70 24 74 45Q67 65 15 83Q11 79 24 49Q35 30 50 28Z" fill="#efa24e" stroke="#b97638" stroke-width="3"/><path d="m32 47 10 6m5-18 9 7M24 64l9 5" stroke="#cf843d" stroke-width="3" stroke-linecap="round"/><path d="M31 53Q40 35 51 35" fill="none" stroke="#ffcd84" stroke-width="5" stroke-linecap="round"/>`,
  eggplant: `<path d="M61 27C92 54 68 86 31 79C5 74 10 59 28 54Q46 48 46 32Z" fill="#9c72bd" stroke="#684886" stroke-width="3"/><path d="M44 31 40 22 52 24Q52 10 65 9L61 24 73 24 65 34 58 30 54 40Z" fill="#8caf65" stroke="#527747" stroke-width="3" stroke-linejoin="round"/><path d="M60 43Q72 64 44 70" fill="none" stroke="#c7a6df" stroke-width="6" stroke-linecap="round"/>`,
  snail: `<path d="M10 73Q25 59 59 63L66 45Q76 40 82 48L78 72Q55 85 13 81Z" fill="#9ac8c2" stroke="#517b77" stroke-width="3"/><path d="m69 47-5-14m13 14 6-14" stroke="#517b77" stroke-width="3" stroke-linecap="round"/><circle cx="63" cy="31" r="4" fill="#4a6660"/><circle cx="83" cy="31" r="4" fill="#4a6660"/><circle cx="40" cy="48" r="28" fill="#edc379" stroke="#b2854e" stroke-width="3"/><path d="M58 54C67 29 29 22 24 45C18 65 48 72 51 52C54 39 34 37 34 48Q34 57 42 53" fill="none" stroke="#b2854e" stroke-width="4" stroke-linecap="round"/><path d="M70 61q4 4 8-1" fill="none" stroke="#517b77" stroke-width="2"/>`,
  orange: `<path d="M46 28Q43 17 51 9" fill="none" stroke="#795338" stroke-width="4" stroke-linecap="round"/><path d="M49 22Q58 4 76 16Q66 31 49 22Z" fill="#83ad62" stroke="#496f43" stroke-width="3"/><circle cx="45" cy="53" r="31" fill="#f3a347" stroke="#b87732" stroke-width="3"/><path d="M25 42Q28 30 39 29" fill="none" stroke="#ffd28a" stroke-width="6" stroke-linecap="round"/><g fill="#d88431"><circle cx="32" cy="65" r="2"/><circle cx="53" cy="72" r="2"/><circle cx="65" cy="54" r="2"/></g>`,
  yellowFish: `<path d="M29 43 9 25Q4 47 10 69L30 54" fill="#efb43e" stroke="#b98228" stroke-width="3" stroke-linejoin="round"/><path d="M39 29Q44 13 59 20L65 32M39 62Q43 80 61 72L64 61" fill="#e9a43c" stroke="#b98228" stroke-width="3" stroke-linejoin="round"/><ellipse cx="52" cy="47" rx="30" ry="24" fill="#f8d45e" stroke="#b98228" stroke-width="3"/><path d="M45 37Q37 47 46 58L57 47Z" fill="#edb044" stroke="#c58e31" stroke-width="2"/><circle cx="68" cy="39" r="5" fill="#fff9df"/><circle cx="69" cy="39" r="2.7" fill="#4c5d53"/><path d="M74 53q-5 5-9 0" fill="none" stroke="#a16f28" stroke-width="2.5" stroke-linecap="round"/><path d="M34 34q11-8 22-4" fill="none" stroke="#fff0a5" stroke-width="4" stroke-linecap="round"/>`,
  wateringCan: `<path d="M58 35C88 14 94 66 64 64" fill="none" stroke="#52858c" stroke-width="9"/><path d="M58 35C88 14 94 66 64 64" fill="none" stroke="#a2cacf" stroke-width="4"/><path d="M32 46 13 25 6 33 27 66" fill="#88bac3" stroke="#52858c" stroke-width="3" stroke-linejoin="round"/><path d="M30 35Q45 28 63 35L67 75Q46 86 25 75Z" fill="#8dc4cd" stroke="#52858c" stroke-width="3"/><ellipse cx="46" cy="35" rx="17" ry="6" fill="#c6e0d9" stroke="#52858c" stroke-width="3"/><path d="M34 47v20" stroke="#c9e6df" stroke-width="5" stroke-linecap="round"/><path d="m8 25 7-5 5 8-8 5Z" fill="#bedbd6" stroke="#52858c" stroke-width="2"/>`,
  acorn: `<path d="M23 39H70Q75 72 47 85Q19 73 23 39Z" fill="#ca9658" stroke="#946c40" stroke-width="3"/><path d="M46 19Q43 10 53 7" fill="none" stroke="#795b3b" stroke-width="5" stroke-linecap="round"/><path d="M15 42Q17 16 46 17Q76 16 79 42Q45 54 15 42Z" fill="#9c8155" stroke="#6b6543" stroke-width="3"/><path d="m28 25 7 11 9-14 9 14 9-11M24 35l8 9 12-10 12 11 13-9" fill="none" stroke="#c4ab76" stroke-width="2" stroke-linejoin="round"/><path d="M31 55q0 11 10 18" fill="none" stroke="#eac18a" stroke-width="5" stroke-linecap="round"/>`,
  part: `<path d="M34 56L66 13Q75 29 59 46L44 65" fill="#b9c9c4" stroke="#56716c" stroke-width="3" stroke-linejoin="round"/><path d="M48 43L63 26" stroke="#eef5ef" stroke-width="3" stroke-linecap="round"/><circle cx="44" cy="53" r="7" fill="#ecc776" stroke="#9c7d43" stroke-width="2"/><circle cx="28" cy="70" r="15" fill="#f0bd73" stroke="#ae7743" stroke-width="4"/><circle cx="28" cy="70" r="7" fill="#fff9ed"/><path d="M68 58v13M62 64h12" stroke="#d7ae5b" stroke-width="3" stroke-linecap="round"/>`,
  scissors: `<path d="M34 62L69 12Q78 30 57 50L43 66M58 62L23 12Q14 30 35 50L49 66" fill="#bbccc5" stroke="#506b62" stroke-width="3" stroke-linejoin="round"/><circle cx="46" cy="49" r="6" fill="#edce81" stroke="#9b7c42" stroke-width="2"/><g fill="#eabb72" stroke="#9d7042" stroke-width="4"><circle cx="28" cy="72" r="14"/><circle cx="64" cy="72" r="14"/></g><g fill="#fff5df"><circle cx="28" cy="72" r="6"/><circle cx="64" cy="72" r="6"/></g>`,
  glovePart: `<path d="M27 67 22 42Q22 34 29 34L34 44V19Q34 10 41 13Q45 14 45 21V42L56 32Q64 28 68 35Q71 39 66 44L56 56V70Z" fill="#96c7d7" stroke="#46768c" stroke-width="3" stroke-linejoin="round"/><path d="M27 64h30v17H27Z" fill="#e1c49a" stroke="#96764d" stroke-width="3"/><path d="m60 14 7 6 11-2M70 56v15m-7-8h14" fill="none" stroke="#679bae" stroke-width="3" stroke-linecap="round"/>`,
  gloves: `<path d="M24 64 16 43Q13 35 20 32Q25 30 29 38L34 46V19Q34 10 41 12Q45 13 45 20V37L48 13Q50 7 56 10Q60 12 58 20L56 38 62 20Q65 14 71 18Q74 20 71 27L65 44 73 32Q78 27 82 32Q85 35 81 41L65 64V74H29Z" fill="#9ccfdc" stroke="#46768c" stroke-width="3" stroke-linejoin="round"/><path d="M28 66h38v17H28Z" fill="#e4caa2" stroke="#96764d" stroke-width="3"/><path d="M39 71v7m9-7v7m9-7v7" stroke="#b6956d" stroke-width="2"/>`,
  lock: `<path d="M30 43V31a16 16 0 0 1 32 0v12" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><rect x="22" y="40" width="48" height="39" rx="11" fill="currentColor"/><circle cx="46" cy="55" r="5" fill="#f9edcd"/><path d="M46 58v8" stroke="#f9edcd" stroke-width="4"/>`,
  star: `<path d="m46 9 11 23 26 4-19 18 5 26-23-12-23 12 5-26L9 36l26-4Z" fill="#e9b957" stroke="#bd8c3d" stroke-width="3" stroke-linejoin="round"/>`,
};

export function art(name, className = "") {
  return `<svg class="art ${className}" viewBox="0 0 92 92" aria-hidden="true">${symbols[name] || symbols.leaf}</svg>`;
}

export function icon(name) {
  const paths = {
    back: `<path d="m14 6-6 6 6 6M8 12h12"/>`,
    restart: `<path d="M5 8a8 8 0 1 1-1 7M5 3v6h6"/>`,
    sound: `<path d="M11 5 6 9H3v6h3l5 4ZM15 8q5 4 0 8M18 5q8 7 0 14"/>`,
    mute: `<path d="M11 5 6 9H3v6h3l5 4ZM16 9l6 6m0-6-6 6"/>`,
    arrow: `<path d="M4 12h15m-5-5 5 5-5 5"/>`,
    check: `<path d="m5 12 4 4L19 6"/>`,
    close: `<path d="m6 6 12 12M6 18 18 6"/>`,
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
}

export function vines(wide = false) {
  const path = "M3 28C0 10 10 2 28 3S70 1 85 3Q98 4 97 20C99 40 95 65 97 82Q97 97 81 97C62 99 35 95 18 97Q2 98 3 82C1 65 5 45 3 28Z";
  return `<svg class="vines-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${path}" stroke="#34573b" stroke-width="${wide ? 1.4 : 2}"/>
      <path d="${path}" stroke="#7d9e53" stroke-width="${wide ? .7 : 1}"/>
    </g>
    <g fill="#8caf62" stroke="#426d3f" stroke-width=".5">
      <ellipse cx="3" cy="24" rx="2" ry="4"/><ellipse cx="3" cy="72" rx="2" ry="4"/>
      <ellipse cx="97" cy="35" rx="2" ry="4"/><ellipse cx="97" cy="80" rx="2" ry="4"/>
      <ellipse cx="25" cy="3" rx="4" ry="2"/><ellipse cx="73" cy="3" rx="4" ry="2"/>
      <ellipse cx="36" cy="97" rx="4" ry="2"/><ellipse cx="78" cy="97" rx="4" ry="2"/>
    </g>
  </svg>`;
}
