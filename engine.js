import { getLevel, visibleTileFraction } from "./levels.js";

export const CAPACITY = 7;
export const NAMES = { part: "剪刀零件", glovePart: "手套零件", pear: "香梨", flower: "小花", berry: "莓果", leaf: "绿叶", mushroom: "蘑菇", butterfly: "蝴蝶", carrot: "胡萝卜", eggplant: "茄子", snail: "蜗牛", orange: "橙子", wateringCan: "浇水壶", acorn: "橡果", yellowFish: "小黄鱼" };
export const isToolPart = tile => tile.kind === "part" || tile.kind === "glovePart";
export const capacityOf = state => getLevel(state.levelId).capacity;
export const finishedUnlocking = state => state.openRegions.length === getLevel(state.levelId).pickLimit;
export const regionDiscarded = (state, id) => finishedUnlocking(state) && !state.openRegions.includes(id);

export function newGame(levelId = 1) {
  const level = getLevel(levelId);
  return {
    levelId, board: level.tiles.map(tile => ({ ...tile, coveredBy: [...tile.coveredBy] })),
    tray: [], scissors: 0, gloves: 0, held: null, stashUses: 0, returns: 0,
    openRegions: [], moves: 0, matches: 0, fish: 0, status: "playing", lossReason: null,
  };
}

export function isCovered(state, tile) {
  return tile.coveredBy.some(id => state.board.some(item => item.id === id));
}

export function visibleFraction(state, tile) {
  return visibleTileFraction(tile, state.board.filter(other => tile.coveredBy.includes(other.id)));
}

export function canCollect(state, tile) {
  return state.status === "playing" && (!tile.region || state.openRegions.includes(tile.region)) && !isCovered(state, tile);
}

export function regionReady(state, regionId) {
  const level = getLevel(state.levelId);
  const region = level.regions.find(item => item.id === regionId);
  return Boolean(region && !finishedUnlocking(state) && !state.openRegions.includes(regionId) && region.requires.every(id => state.openRegions.includes(id)));
}

function settle(state) {
  const level = getLevel(state.levelId);
  if (!state.board.length && !state.tray.length && !state.held && finishedUnlocking(state)) return { ...state, status: "won" };
  if (state.tray.length >= capacityOf(state)) return { ...state, status: "lost", lossReason: "full" };
  const canCut = state.scissors > 0 && level.regions.some(region => regionReady(state, region.id));
  if (!canCut && !state.held && !state.board.some(tile => canCollect(state, tile))) return { ...state, status: "lost", lossReason: "blocked" };
  return state;
}

function collectibleTile(state, id) {
  if (state.status !== "playing") throw new Error("本局已经结束，请重新开始。");
  const tile = state.board.find(item => item.id === id);
  if (!tile) throw new Error("这张牌已经被收取。");
  if (tile.region && !state.openRegions.includes(tile.region)) throw new Error("先用剪刀解开这片藤蔓。");
  if (isCovered(state, tile)) throw new Error("先取走盖在上面的牌。");
  return tile;
}

function putInTray(state, tile, changes) {
  if (state.tray.length >= capacityOf(state)) throw new Error("暂存槽已满。");
  const tray = [...state.tray];
  const last = tray.map(item => item.kind).lastIndexOf(tile.kind);
  const insertIndex = last < 0 ? tray.length : last + 1;
  tray.splice(insertIndex, 0, tile);
  const matching = tray.filter(item => item.kind === tile.kind);
  const matchedIds = matching.length === 3 ? matching.map(item => item.id) : [];
  const crafted = matchedIds.length > 0 && isToolPart(tile);
  const craftedTool = crafted ? tile.kind === "part" ? "scissors" : "gloves" : null;
  const next = settle({
    ...state,
    ...changes,
    tray: tray.filter(item => !matchedIds.includes(item.id)),
    scissors: state.scissors + (craftedTool === "scissors" ? 1 : 0),
    gloves: state.gloves + (craftedTool === "gloves" ? 1 : 0),
    moves: state.moves + 1,
    matches: state.matches + (matchedIds.length && !crafted ? 1 : 0),
    fish: state.fish + (matchedIds.length && tile.kind === "yellowFish" ? 1 : 0),
  });
  return { next, preview: { ...next, tray, scissors: state.scissors, gloves: state.gloves, fish: state.fish, status: "playing" }, tile, insertIndex, matchedIds, crafted, craftedTool };
}

export function collect(state, id) {
  const tile = collectibleTile(state, id);
  return putInTray(state, tile, { board: state.board.filter(item => item.id !== id) });
}

export function canStash(state, tile) {
  return state.gloves > 0 && !state.held && !isToolPart(tile) && canCollect(state, tile);
}

export function stash(state, id) {
  const tile = collectibleTile(state, id);
  if (isToolPart(tile)) throw new Error("手套只能暂存普通牌，不能暂存工具零件。");
  if (state.held) throw new Error("手套格已占用，请先取回暂存牌。");
  if (state.gloves < 1) throw new Error("需要先收集三个手套零件。");
  return settle({
    ...state, board: state.board.filter(item => item.id !== id), held: tile,
    gloves: state.gloves - 1, stashUses: state.stashUses + 1, moves: state.moves + 1,
  });
}

export function retrieve(state) {
  if (state.status !== "playing") throw new Error("本局已经结束，请重新开始。");
  if (!state.held) throw new Error("手套格里没有暂存牌。");
  return putInTray(state, state.held, { held: null, returns: state.returns + 1 });
}

export function unlock(state, regionId = getLevel(state.levelId).regions[0].id) {
  if (state.status !== "playing") throw new Error("本局已经结束。");
  const level = getLevel(state.levelId);
  const region = level.regions.find(item => item.id === regionId);
  if (!region) throw new Error("找不到这片区域。");
  if (state.openRegions.includes(regionId)) throw new Error("这片区域已经解锁。");
  if (finishedUnlocking(state)) throw new Error("本关可选择的区域已用完。");
  if (!regionReady(state, regionId)) throw new Error(`请先解锁 ${region.requires.filter(id => !state.openRegions.includes(id)).join("、")} 区。`);
  if (state.scissors < 1) throw new Error("需要先收集三个零件，合成剪刀。");
  const openRegions = [...state.openRegions, regionId];
  return settle({
    ...state,
    board: openRegions.length === level.pickLimit ? state.board.filter(tile => !tile.region || openRegions.includes(tile.region)) : state.board,
    scissors: state.scissors - 1, openRegions,
  });
}
