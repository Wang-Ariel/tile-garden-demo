import { LEVELS, getNextLevel } from "./levels.js";

export const PROGRESS_KEY = "tile-garden-progress-v1";
export const emptyProgress = () => ({ version: 4, lastLevel: 1, completed: [], fishLevels: [], fishBest: {} });
export const fishTotal = progress => Object.values(progress.fishBest).reduce((total, count) => total + count, 0);

export function parseProgress(raw) {
  if (raw === null) return emptyProgress();
  const value = JSON.parse(raw);
  const legacy = value?.version === 1;
  const validId = id => value?.version < 4
    ? Number.isInteger(id) && ((id >= 1 && id <= (legacy ? 11 : 10)) || id === 20)
    : LEVELS.some(level => level.id === id);
  if (!value || ![1,2,3,4].includes(value.version) || !validId(value.lastLevel) || !Array.isArray(value.completed) || !value.completed.every(validId)) {
    throw new Error("本地关卡记录格式不正确。");
  }
  const fishLevels = value.fishLevels === undefined ? [] : value.fishLevels;
  const validReward = id => legacy ? id === 11 : value.version === 2 ? [8,9].includes(id) : value.version === 3 ? [8,9,10].includes(id) : LEVELS.some(level => level.id === id && level.fishReward > 0);
  if (!Array.isArray(fishLevels) || !fishLevels.every(id => value.completed.includes(id) && validReward(id))) {
    throw new Error("本地小黄鱼记录格式不正确。");
  }
  const migrate = id => legacy && id === 11 ? 8 : value.version === 2 && id === 9 ? 10 : id;
  const completed = [...new Set(value.completed.filter(id => value.version === 4 || id !== 20).map(migrate))].sort((a,b) => a-b);
  const best = value.version === 4 ? value.fishBest : Object.fromEntries(fishLevels.map(id => [migrate(id), 1]));
  if (!best || typeof best !== "object" || Array.isArray(best) || !Object.entries(best).every(([key, count]) => {
    const id = Number(key), level = LEVELS.find(level => level.id === id);
    return String(id) === key && completed.includes(id) && level && Number.isInteger(count) && count > 0 && count <= level.fishReward;
  })) throw new Error("本地小黄鱼最佳记录格式不正确。");
  const rewarded = Object.keys(best).map(Number).sort((a,b) => a-b);
  if (value.version === 4 && [...new Set(fishLevels)].sort((a,b) => a-b).join(",") !== rewarded.join(",")) throw new Error("本地小黄鱼记录不一致。");
  return {
    version: 4, lastLevel: migrate(value.lastLevel), completed,
    fishLevels: rewarded, fishBest: { ...best },
  };
}

export function completeLevel(progress, id, fish = 0) {
  const level = LEVELS.find(level => level.id === id);
  if (!level) throw new Error("无法记录未开放的关卡。");
  if (!Number.isInteger(fish) || fish < 0 || fish > level.fishReward) throw new Error("本关小黄鱼奖励数量不正确。");
  const fishBest = { ...progress.fishBest };
  if (fish) fishBest[id] = Math.max(fishBest[id] || 0, fish);
  return {
    version: 4, lastLevel: getNextLevel(id)?.id ?? id,
    completed: [...new Set([...progress.completed, id])].sort((a,b) => a-b),
    fishLevels: [...new Set([...progress.fishLevels, ...(fish ? [id] : [])])].sort((a,b) => a-b),
    fishBest,
  };
}
