const KINDS = { s: "part", g: "glovePart", p: "pear", f: "flower", b: "berry", l: "leaf", m: "mushroom", t: "butterfly", c: "carrot", e: "eggplant", n: "snail", d: "orange", w: "wateringCan", a: "acorn", y: "yellowFish" };

// Strings assign tile kinds from the upper to lower layers; geometry determines blockers.
const definitions = [
  {
    name: "初见花园", lesson: "合成第一把剪刀", ordinary: 6, kinds: 2,
    free: ["s","s","s"], freeCols: 3,
    regions: [{ id: "garden", label: "花园", cols: 3, piles: ["p","f","p","f","p","f"] }],
  },
  {
    name: "在牌里找零件", lesson: "取走上层普通牌，找到下面的零件", ordinary: 12, kinds: 4,
    free: ["s","ps","fs","p","p","l","b"], freeCols: 4,
    regions: [{ id: "A", cols: 3, piles: ["bf","lf","lb"] }],
  },
  {
    name: "零件也会挡路", lesson: "拿零件，也可以为普通三消开路", ordinary: 18, kinds: 5,
    free: ["s","sf","ps","f","p","b","p","b","f"],
    regions: [{ id: "A", cols: 3, piles: ["lm","mb","bl","mb","bl"] }],
  },
  {
    name: "给剪刀留个位置", lesson: "先清槽，还是先收零件", ordinary: 21, kinds: 6,
    free: ["s","s","mp","ls","p","p","f"], freeCols: 4,
    regions: [{ id: "A", cols: 4, piles: ["fb","mt","bl","bf","tm","lb","bt","b"] }],
  },
  {
    name: "剪开后还有零件", lesson: "从剪开的花园里取得下一套零件", ordinary: 18, kinds: 6,
    free: ["s","ps","fs"], freeCols: 3,
    regions: [
      { id: "A", piles: ["ps","fs","s","pb","fl","ml"] },
      { id: "B", requires: ["A"], piles: ["bm","cl","mc","bc"] },
    ],
  },
  {
    name: "整套还是补齐", lesson: "比较整套获取和跨区补齐的路径", ordinary: 27, kinds: 7,
    free: ["ps","fs","s","ms"], freeCols: 4,
    regions: [
      { id: "A", piles: ["fs","bm","tc","fp","ps"] },
      { id: "B", piles: ["fs","lp","lb","ps","lc","fs"] },
      { id: "C", cols: 4, requires: ["A","B"], piles: ["pt","fm","bc","t"] },
    ],
  },
  {
    name: "没有零件也值得剪", lesson: "清槽也能打通下一把剪刀的获取路径", ordinary: 30, kinds: 8,
    free: ["ps","fs","bs","ls","ms","ts"],
    regions: [
      { id: "A", clues: "pfb", piles: ["lb","bt","fl","tp","pm","mf"] },
      { id: "B", nudges: { "4-1": [-2,0] }, piles: ["ce","fc","ps","pp","fs","es"] },
      { id: "C", cols: 3, requires: ["A","B"], piles: ["f","c","e"] },
    ],
  },
  {
    exclusive: true, reward: true, fishReward: 1,
    name: "一把剪刀，两条路", lesson: "选择通关难度与小黄鱼奖励", ordinary: 36, kinds: 7,
    free: ["s","s","s"], freeCols: 3,
    regions: [
      { id: "A", choiceLabel: "轻松路线 · 无小黄鱼", fishReward: 0, piles: ["pl","fb","lp","fb","pb","fl"] },
      { id: "B", choiceLabel: "挑战路线 · 小黄鱼 ×1", fishReward: 1, clues: "y", piles: ["yfb","ymm","ymt","pbp","pll","ptf","lpp","tfb"] },
    ],
  },
  {
    exclusive: true, fishReward: 1,
    name: "小黄鱼进阶", lesson: "先处理少量公共牌，再选择稳妥或奖励路线", ordinary: 43, kinds: 10,
    free: ["ps","fs","s"], freeCols: 3,
    regions: [
      { id: "A", choiceLabel: "稳妥路线 · 无小黄鱼", fishReward: 0, clues: "pf", piles: ["pl","fb","pm","fl","bm","lb","m"] },
      { id: "B", choiceLabel: "挑战路线 · 小黄鱼 ×1", fishReward: 1, clues: "y", piles: ["ybp","ycm","yde","wfe","mcc","lfe","wlb","mdb","wdp","l"] },
    ],
  },
  {
    exclusive: true, fishReward: 1,
    name: "小黄鱼的挑战", lesson: "带着槽内积压比较路线，为奖励留出空间", ordinary: 51, kinds: 12,
    free: ["ps","fs","bs"], freeCols: 3,
    regions: [
      { id: "A", choiceLabel: "稳妥路线 · 无小黄鱼", fishReward: 0, clues: "pfb", piles: ["plm","flt","bmt","pl","fm","bt"] },
      {
        id: "B", choiceLabel: "挑战路线 · 小黄鱼 ×1", fishReward: 1, clues: "y",
        piles: ["yntd","ympw","ycdw","mbwl","ltle","pedt","cbne","fnfm","c"],
        layout: {
          rowStep: 80,
          clues: ["0-3","3-1","6-1","6-2","7-2"],
          offsets: {
            "0-3": [0,25], "2-2": [50,0], "2-3": [50,0],
            "3-1": [0,25], "5-2": [50,0], "5-3": [50,0],
            "6-1": [0,25], "6-2": [0,50], "6-3": [0,50],
          },
        },
      },
    ],
  },
  {
    name: "先放在旁边", lesson: "暂存挡牌，打开下层，再取回消除",
    free: ["g","g","g","p","p","fp","f","f"], freeCols: 4, freeClues: "pf",
    regions: [],
  },
  {
    name: "该暂存哪张", lesson: "选择能打开关键配组的挡牌",
    free: ["g","s","g","s","g","s"],
    regions: [{ id: "A", cols: 3, layout: { clues: ["3-2"] }, piles: ["pbf","plm","fbt","lmp","btl","mft"] }],
  },
  {
    name: "什么时候收回", lesson: "取回第一张暂存牌，才能再次开路",
    free: ["g","s","g","s","g","s"],
    regions: [{ id: "A", cols: 6, clues: "pbf", piles: ["mp","p","p","m","m","gc","gc","gc","bf","b","b","f","f"] }],
  },
  {
    name: "先合哪种工具", lesson: "两种零件共用主槽，比较工具获取顺序",
    free: ["g","s","pg","fs","fg","ps"],
    regions: [{ id: "A", cols: 3, clues: "pf", piles: ["pb","fl","bm","lt","mt","bl","mt"] }],
  },
  {
    name: "工具接力", lesson: "六格内暂存挡牌，接力剪刀，再安排取回", capacity: 6,
    free: ["g","g","g","ps","fs","bls"], freeClues: "pfbl",
    regions: [{ id: "A", cols: 3, clues: "pfbl", layout: { rowStep: 104 }, piles: ["lmt","mfp","tbf","blm","pt"] }],
  },
  {
    name: "少一格也能安排", lesson: "六格主槽，借助手套周转", capacity: 6,
    free: ["g","g","g","ps","fs","bs"], freeClues: "pfb",
    regions: [{ id: "A", cols: 3, layout: { clues: ["2-2"] }, piles: ["ltf","pmb","mbp","tlt","lmf"] }],
  },
  {
    name: "一次机会用在哪里", lesson: "现在用手套清槽，还是留给奖励路线",
    exclusive: true, fishReward: 1,
    free: ["g","g","g","ps","fs","bs"], freeClues: "pfb",
    regions: [
      { id: "A", choiceLabel: "稳妥路线 · 无小黄鱼", fishReward: 0, clues: "pfb", piles: ["plm","flt","bmt","pl","fm","bt"] },
      { id: "B", choiceLabel: "挑战路线 · 小黄鱼 ×1", fishReward: 1, clues: "y", piles: ["ypl","ybm","yct","pfc","bml","fct","mtl"] },
    ],
  },
  {
    name: "换工具还是换奖励", lesson: "六格内选择补给周转，或挑战分层的小黄鱼", capacity: 6,
    exclusive: true, fishReward: 1,
    free: ["gl","gm","gt","psm","fsl","bst"], freeClues: "pfblmt",
    regions: [
      { id: "A", choiceLabel: "补给路线 · 手套 +1", fishReward: 0, clues: "pfbl", layout: { rowStep: 104 }, piles: ["gcp","egf","blg","cme","pet","cbf"] },
      { id: "B", choiceLabel: "奖励路线 · 小黄鱼 ×1", fishReward: 1, clues: "ypfb", layout: { rowStep: 104 }, piles: ["ycp","efm","bey","cfl","pet","cyb"] },
    ],
  },
  {
    name: "六格下分配资源", lesson: "安排两种零件与暂存牌的回收时机", capacity: 6,
    free: ["pg","fs","bg","ls","mg","ts"],
    regions: [{ id: "A", cols: 3, layout: { clues: ["3-2"] }, piles: ["gpp","gbf","gmf","tbl","lmt"] }],
  },
  {
    name: "花园的总设计师", lesson: "六格内安排第二把剪刀、跨区配组与手套回收", capacity: 6, pickLimit: 2, fishReward: 2,
    free: ["sg","sg","sg","ps","fs","bs"], freeClues: "pfb",
    regions: [
      { id: "A", choiceLabel: "补给 · 手套 +1", fishReward: 0, clues: "pfb", cols: 3, piles: ["gpl","gfl","gbl"] },
      { id: "B", choiceLabel: "小黄鱼 ×1", fishReward: 1, clues: "ypfb", layout: { rowStep: 75 }, piles: ["ypt","cfl","myl","mtb","cml","tcy"] },
      { id: "C", choiceLabel: "小黄鱼 ×1", fishReward: 1, clues: "ypfb", cols: 6, piles: ["yae","wwd","bye","wda","adf","epy"] },
    ],
  },
];

export const TILE_SIZE = 50;
export const CLUE_VISIBLE_FRACTION = .4;

export function tileIntersection(a, b) {
  const left = Math.max(a.x, b.x), top = Math.max(a.y, b.y);
  const right = Math.min(a.x, b.x) + TILE_SIZE, bottom = Math.min(a.y, b.y) + TILE_SIZE;
  return right > left && bottom > top ? { left, top, right, bottom } : null;
}

export function visibleTileFraction(tile, blockers) {
  const covers = blockers.map(other => tileIntersection(tile, other)).filter(Boolean);
  if (!covers.length) return 1;
  // Integrate the union so overlapping blockers are not counted twice.
  const xs = [...new Set([tile.x, tile.x + TILE_SIZE, ...covers.flatMap(rect => [rect.left, rect.right])])].sort((a, b) => a - b);
  let hidden = 0;
  for (let i = 1; i < xs.length; i++) {
    const intervals = covers.filter(rect => rect.left < xs[i] && rect.right > xs[i - 1]).sort((a, b) => a.top - b.top);
    let bottom = tile.y, coveredHeight = 0;
    for (const rect of intervals) {
      coveredHeight += Math.max(0, rect.bottom - Math.max(bottom, rect.top));
      bottom = Math.max(bottom, rect.bottom);
    }
    hidden += (xs[i] - xs[i - 1]) * coveredHeight;
  }
  const visible = 1 - hidden / (TILE_SIZE * TILE_SIZE);
  return visible < 1e-8 ? 0 : Math.min(1, visible);
}

function makeZone(id, piles, cols, region, interlock, revealParts, clues = "", nudges = {}, layout = {}) {
  const rows = Math.ceil(piles.length / cols);
  const depth = Math.max(...piles.map(pile => pile.length));
  const rowY = [];
  let nextY = 4;
  for (let row = 0; row < rows; row++) {
    rowY.push(nextY);
    const rowDepth = Math.max(...piles.slice(row * cols, (row + 1) * cols).map(pile => pile.length));
    nextY += layout.rowStep ?? (interlock ? 54 : TILE_SIZE + (rowDepth > 1 ? 25 : 0) + 4);
  }
  const clueSlots = new Set(layout.clues || []);
  const positions = piles.map((pile, slot) => {
    const column = slot % cols;
    const full = slot % 3 === 0 && !(revealParts && /[sg]/.test(pile.slice(1)));
    const dx = !full && interlock && slot % 3 === 2 && column > 0 ? -25 : 0;
    const dy = full ? 0 : 25;
    // Deeper layers share the last offset instead of shrinking mobile touch targets.
    return [...pile].map((symbol, layer) => ({
      x: 4 + column * 54 + Math.min(layer, 2) * dx,
      y: rowY[Math.floor(slot / cols)] + Math.min(layer, layout.maxOffsetLayers ?? (interlock ? 2 : 1)) * dy,
      z: (depth - layer) * (piles.length + 1) + slot,
      decisionClue: symbol === "s" || symbol === "g" || clues.includes(symbol) || clueSlots.has(`${slot}-${layer}`),
    }));
  });
  const applyOffsets = offsets => {
    for (const [key, [dx, dy]] of Object.entries(offsets)) {
      const [slot, layer] = key.split("-").map(Number);
      const tile = positions[slot]?.[layer];
      if (!tile) throw new Error(`${id} 区的牌面偏移配置无效：${key}`);
      tile.x += dx;
      tile.y += dy;
    }
  };
  // Explicit layouts define blockers; later clue nudges must preserve that layout.
  applyOffsets(layout.offsets || {});
  const all = positions.flat();
  const higher = tile => all.filter(other => other.z > tile.z);
  const blockers = tile => higher(tile).filter(other => tileIntersection(tile, other)).map(other => other.z).join(",");
  const originalBlockers = all.map(blockers);
  const important = all.filter(tile => tile.decisionClue);
  // Open viewing gaps without removing blockers or changing the playable routes.
  if (interlock && important.some(tile => visibleTileFraction(tile, higher(tile)) < CLUE_VISIBLE_FRACTION)) {
    for (const tile of all) tile.y = 4 + (tile.y - 4) * 1.3;
  }
  for (const tile of important) {
    if (higher(tile).some(other => other.x === tile.x && other.y === tile.y)) tile.y += 20;
  }
  applyOffsets(nudges);
  for (const [index, tile] of all.entries()) {
    if (blockers(tile) !== originalBlockers[index]) throw new Error(`${id} 区的线索调整改变了取牌路径。`);
    if (tile.decisionClue && visibleTileFraction(tile, higher(tile)) + 1e-8 < CLUE_VISIBLE_FRACTION) {
      throw new Error(`${id} 区的关键线索露出不足。`);
    }
  }
  return {
    id, region, piles, cols, positions, x: 0, y: 0,
    width: Math.max(...positions.flat().map(position => position.x)) + TILE_SIZE + 4,
    height: Math.max(...positions.flat().map(position => position.y)) + TILE_SIZE + 4,
  };
}

function buildLevel(definition, index) {
  const id = definition.id ?? index + 1;
  const dualTools = id >= 11;
  const defaults = dualTools ? { maxOffsetLayers: 2 } : {};
  const free = makeZone("free", definition.free, definition.freeCols || 6, null, false, id <= 7 || dualTools, definition.freeClues, {}, defaults);
  const regions = definition.regions.map(region => ({
    ...region, label: region.label || `${region.id} 区`, requires: region.requires || [],
  }));
  const gardens = regions.map(region => makeZone(region.id, region.piles, region.cols || 3, region.id, id >= 3 && !definition.trial && !dualTools, id <= 7 || dualTools, region.clues, region.nudges, { ...defaults, ...region.layout }));
  const paired = gardens.length > 1;
  const width = Math.max(free.width, paired ? gardens[0].width + 4 + gardens[1].width : gardens[0]?.width || 0, ...gardens.map(zone => zone.width));
  free.x = (width - free.width) / 2;
  free.y = definition.exclusive ? 26 : 0;
  let height = free.y + free.height + (definition.exclusive ? 28 : index === 0 ? 32 : 14);
  if (paired) {
    gardens[0].x = (width - gardens[0].width - gardens[1].width - 4) / 2;
    gardens[1].x = gardens[0].x + gardens[0].width + 4;
    for (const zone of gardens.slice(0, 2)) zone.y = height;
    height += Math.max(gardens[0].height, gardens[1].height);
    if (gardens[2]) {
      gardens[2].x = (width - gardens[2].width) / 2;
      gardens[2].y = height + 14;
      height = gardens[2].y + gardens[2].height;
    }
  } else if (gardens.length) {
    gardens[0].x = (width - gardens[0].width) / 2;
    gardens[0].y = height;
    height += gardens[0].height;
  }
  const zones = [free, ...gardens];
  const tiles = [];
  for (const zone of zones) {
    const zoneTiles = [];
    zone.piles.forEach((pile, slot) => {
      const ids = [...pile].map((_, layer) => index === 0
        ? zone.region ? `garden-${slot}` : `part-${slot}`
        : `${zone.id}-${slot}-${layer}`);
      [...pile].forEach((symbol, layer) => {
        if (!KINDS[symbol]) throw new Error(`Unknown tile symbol: ${symbol}`);
        zoneTiles.push({
          id: ids[layer], kind: KINDS[symbol], region: zone.region, zone: zone.id,
          ...zone.positions[slot][layer],
          layer, depth: pile.length, coveredBy: [],
        });
      });
    });
    for (const tile of zoneTiles) {
      tile.coveredBy = zoneTiles.filter(other => other.z > tile.z && tileIntersection(tile, other)).map(other => other.id);
    }
    tiles.push(...zoneTiles);
  }
  return {
    id, name: definition.name, lesson: definition.lesson,
    trial: Boolean(definition.trial),
    exclusive: Boolean(definition.exclusive), fishReward: definition.fishReward || 0,
    reward: Boolean(definition.reward),
    ordinary: definition.ordinary ?? tiles.filter(tile => !["part","glovePart"].includes(tile.kind)).length,
    kinds: definition.kinds ?? new Set(tiles.filter(tile => !["part","glovePart"].includes(tile.kind)).map(tile => tile.kind)).size,
    capacity: definition.capacity || 7, dualTools,
    pickLimit: definition.pickLimit ?? (definition.exclusive ? 1 : regions.length),
    limitedChoice: Boolean(definition.exclusive || definition.pickLimit),
    regions, zones, tiles, width, height,
  };
}

export const LEVELS = definitions.map(buildLevel);

export function getLevel(id) {
  const level = LEVELS.find(item => item.id === id);
  if (!level) throw new Error(`关卡 ${id} 尚未开放。`);
  return level;
}

export function getNextLevel(id) {
  return LEVELS.find(level => level.id === id + 1);
}
