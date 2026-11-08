import { NAMES, newGame, collect, unlock, isCovered, visibleFraction, regionReady, isToolPart, stash, retrieve, canStash, finishedUnlocking, regionDiscarded } from "./engine.js";
import { LEVELS, getLevel, getNextLevel } from "./levels.js";
import { PROGRESS_KEY, emptyProgress, parseProgress, completeLevel, fishTotal } from "./progress.js";
import { art, icon, vines } from "./art.js";

const root = document.querySelector("#app");
const announcer = document.querySelector("#announcer");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const boardResizeObserver = new ResizeObserver(() => resizeBoard());
let level = getLevel(1);
let initialTiles = level.tiles;
let state = newGame();
let progress = emptyProgress();
const testing = new URLSearchParams(location.search).has("test");
let persistenceWarning = "";
let screen = "home";
let armed = false;
let gloveArmed = false;
let busy = false;
let epoch = 0;
let queue = [];
let reserved = new Set();
let sound = false;
let audio;
let noticeTimer;
let noticeNode;
let startedAt = 0;
let frozenTime = 0;
let returnFocus;
let tutorialStep = null;
let tutorialTimer;
const shownTips = new Set();

const wait = ms => new Promise(resolve => setTimeout(resolve, reduceMotion.matches ? 0 : ms));
const brand = () => `<div class="brand">${art("leaf")}<span>花园拾光</span></div>`;

function regionName(id) {
  return level.regions.length === 1 ? "花园" : ["左侧花园", "右侧花园", "下方花园"][level.regions.findIndex(region => region.id === id)];
}

function announce(message) { announcer.textContent = message; }

function saveProgress() {
  if (testing) return;
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }
  catch (error) {
    console.error("保存关卡进度失败", error);
    notice("浏览器无法保存进度，本次仍可正常游玩。");
  }
}

function setBusy(value) {
  busy = value;
  root.querySelector(".game")?.setAttribute("aria-busy", String(value));
}

function notice(message) {
  clearTimeout(noticeTimer);
  noticeNode?.remove();
  noticeNode = document.createElement("div");
  noticeNode.className = "notice";
  noticeNode.textContent = message;
  document.body.append(noticeNode);
  announce(message);
  noticeTimer = setTimeout(() => { noticeNode?.remove(); noticeNode = null; }, 2500);
}

function tone(kind = "tap") {
  if (!sound) return;
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("浏览器不支持 Web Audio");
    audio ||= new Context();
    audio.resume().catch(error => {
      console.error("音频启动失败", error);
      sound = false;
      notice("浏览器未允许声音，已切换为静音。");
      updateSoundButton();
    });
    const frequencies = kind === "win" ? [523, 659, 784, 1047] : kind === "match" ? [659, 880] : [480];
    frequencies.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const time = audio.currentTime + index * .085;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(.055, time + .01);
      gain.gain.exponentialRampToValueAtTime(.001, time + .18);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(time);
      oscillator.stop(time + .19);
    });
  } catch (error) {
    console.error("音频初始化失败", error);
    sound = false;
    updateSoundButton();
    notice("当前设备无法播放音效，仍可静音游玩。");
  }
}

function updateSoundButton() {
  const button = root.querySelector('[data-action="sound"]');
  if (!button) return;
  button.innerHTML = icon(sound ? "sound" : "mute");
  button.setAttribute("aria-label", sound ? "关闭音效" : "打开音效");
  button.setAttribute("aria-pressed", String(sound));
}

function clearRun() {
  boardResizeObserver.disconnect();
  epoch++;
  queue = [];
  reserved = new Set();
  busy = false;
  armed = false;
  gloveArmed = false;
  document.querySelectorAll(".flying,.veil").forEach(element => element.remove());
  clearTimeout(noticeTimer);
  noticeNode?.remove();
  noticeNode = null;
  clearTimeout(tutorialTimer);
  tutorialStep = null;
}

function showHome() {
  clearRun();
  screen = "home";
  root.innerHTML = `<main class="shell home">
    <header class="topbar">${brand()}<button class="icon-button" data-action="sound" aria-label="打开音效"></button></header>
    <div class="home-content">
      <div class="eyebrow">A LITTLE GARDEN, A LITTLE JOY</div>
      <h1>花园拾光</h1>
      <p class="subtitle">拾起小美好，解开新风景</p>
      <div class="hero" aria-hidden="true">
        <div class="hero-halo"></div><span class="spark s1">✦</span><span class="spark s2">✧</span><span class="spark s3">✦</span>
        <div class="hero-tile one">${art("pear")}</div><div class="hero-tile two">${art("berry")}</div>
        <div class="hero-tile three">${art("flower")}</div><div class="hero-tool">${art("scissors")}</div>
      </div>
    </div>
    <div class="home-bottom">
      ${fishTotal(progress) ? `<div class="fish-total" aria-label="本地已收集 ${fishTotal(progress)} 条小黄鱼">${art("yellowFish")}<span>小黄鱼 ${fishTotal(progress)}</span></div>` : ""}
      <div class="chapter-card"><div class="chapter-icon">${art(getLevel(progress.lastLevel).reward ? "star" : "leaf")}</div><div><strong>第 ${progress.lastLevel} 关 · ${getLevel(progress.lastLevel).name}</strong></div></div>
      <button class="primary" data-action="start" data-level="${progress.lastLevel}">${progress.completed.length ? "继续花园之旅" : "走进花园"} ${icon("arrow")}</button>
      <button class="secondary" data-action="start" data-level="11">体验手套 · 第 11 关</button>
      <button class="secondary level-link" data-action="levels">选择关卡 · ${progress.completed.length} / ${LEVELS.length} 已完成</button>
    </div>
  </main>`;
  updateSoundButton();
  window.scrollTo(0, 0);
}

function showLevels() {
  clearRun();
  screen = "levels";
  const chapter = progress.lastLevel <= 10 ? 1 : 2;
  root.innerHTML = `<main class="shell level-select">
    <header class="level-select-header">
      <div class="topbar"><button class="icon-button" data-action="home-direct" aria-label="返回首页">${icon("back")}</button><h1>选一片花园</h1><span class="level-total">${progress.completed.length} / ${LEVELS.length}</span></div>
      <div class="chapter-tabs" role="tablist" aria-label="选择章节">${[1,2].map(id => `<button class="chapter-tab" id="chapter-tab-${id}" role="tab" data-action="chapter" data-chapter="${id}" aria-controls="chapter-panel-${id}" aria-selected="${chapter === id}" tabindex="${chapter === id ? 0 : -1}">${id === 1 ? "1—10 关" : "11—20 关"}</button>`).join("")}</div>
    </header>
    <div class="level-pages">${[1,2].map(id => `<section class="level-list" id="chapter-panel-${id}" role="tabpanel" aria-labelledby="chapter-tab-${id}" tabindex="0" ${chapter === id ? "" : "hidden"}>${LEVELS.filter(item => Math.ceil(item.id / 10) === id).map(item => `<button class="level-card ${item.reward ? "reward" : ""} ${progress.completed.includes(item.id) ? "completed" : ""}" data-action="start" data-level="${item.id}" aria-label="第${item.id}关 ${item.name}${item.reward ? '，奖励关' : ''}${item.capacity === 6 ? '，六格挑战' : ''}${item.fishReward ? `，最多获得小黄鱼 ${item.fishReward} 条` : ''}${progress.completed.includes(item.id) ? '，已完成' : ''}">
      <span class="level-number">${String(item.id).padStart(2, "0")}</span><span class="level-details"><strong>${item.name}</strong><small>${item.capacity === 6 ? "六格挑战" : item.dualTools ? "双工具" : item.exclusive ? "小黄鱼路线选择" : `${item.regions.length} 片花园`}</small>${item.fishReward ? `<span class="level-fish">${art("yellowFish")}<span>${item.fishReward > 1 ? "最多 " : ""}小黄鱼 ×${item.fishReward}</span></span>` : ""}</span><span class="level-mark">${progress.completed.includes(item.id) ? icon("check") : item.reward ? art("star") : icon("arrow")}</span>
    </button>`).join("")}</section>`).join("")}</div>
  </main>`;
  window.scrollTo(0, 0);
  root.querySelector('[role="tab"][aria-selected="true"]').focus({ preventScroll: true });
}

function selectChapter(chapter) {
  for (const tab of root.querySelectorAll(".chapter-tab")) {
    const selected = Number(tab.dataset.chapter) === chapter;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    root.querySelector(`#${tab.getAttribute("aria-controls")}`).hidden = !selected;
    if (selected) tab.focus({ preventScroll: true });
  }
  root.querySelector(".level-pages").scrollTop = 0;
}

function startGame(levelId = state.levelId) {
  level = getLevel(levelId);
  clearRun();
  state = newGame(levelId);
  initialTiles = level.tiles;
  progress = { ...progress, lastLevel: levelId };
  screen = "game";
  startedAt = performance.now();
  frozenTime = 0;
  root.innerHTML = `<main class="shell game ${levelId > 1 ? "dense" : ""} ${level.reward ? "reward-game" : ""} ${level.dualTools ? "dual-tools" : ""}" data-level="${levelId}" aria-busy="false">
    <header class="topbar">
      <button class="icon-button" data-action="home" aria-label="返回首页">${icon("back")}</button>
      <div class="game-title"><strong>第 ${levelId} 关 <span>${level.reward ? "✦ " : ""}${level.name}</span></strong></div>
      <button class="icon-button" data-action="sound" aria-label="打开音效"></button>
    </header>
    <section class="tray-section" aria-label="${level.capacity}格暂存槽">
      <div class="tray" id="tray" style="--slots:${level.capacity}"></div>
    </section>
    <section class="playfield" aria-label="花园棋盘">
      <div class="board-frame"><div class="board-scene" style="width:${level.width}px;height:${level.height}px">
        ${level.zones.map(zone => `<section class="board-zone ${zone.region ? "garden locked" : "free-zone"}" ${zone.region ? `data-region-card="${zone.region}"` : ""} id="${zone.id === "free" ? "parts" : zone.id === "garden" ? "garden" : `region-${zone.id}`}" aria-label="${zone.region ? regionName(zone.region) : "开放区"}" style="left:${zone.x}px;top:${zone.y}px;width:${zone.width}px;height:${zone.height}px">
          <div class="zone-tiles" ${levelId === 1 && zone.region ? 'id="garden-grid"' : ""} data-zone-tiles="${zone.id}"></div>
          ${zone.region ? `<div class="vines">${vines(zone.width / zone.height > 3)}</div><button class="lock-action" ${levelId === 1 ? 'id="lock-action"' : ""} data-action="unlock" data-region="${zone.region}" aria-label="剪开${regionName(zone.region)}的藤蔓"></button>${level.limitedChoice ? `<span class="choice-label" hidden>${level.regions.find(region => region.id === zone.region).choiceLabel}</span>` : ""}` : ""}
        </section>`).join("")}
      </div></div>
    </section>
    <footer class="game-footer">
      ${level.fishReward ? `<div class="fish-meter" id="fish-meter">${art("yellowFish")}<span>0 / ${level.fishReward}</span></div>` : ""}
      <div class="tool-wrap">
        ${level.regions.length ? `<button class="tool" id="tool" data-action="tool" aria-label="剪刀，零把">${art("scissors")}<span class="tool-count">0</span></button>` : ""}
        ${level.dualTools ? `<button class="tool glove-tool" id="glove-tool" data-action="glove" aria-label="手套，零次">${art("gloves")}<span class="tool-count">0</span></button><button class="held-slot" id="held-slot" data-action="retrieve" aria-label="手套暂存格，空" disabled><span>暂存</span></button>` : '<span class="tool-label">工具袋</span>'}
      </div>
      <button class="icon-button" data-action="restart" aria-label="重新开始">${icon("restart")}</button>
    </footer>
    <div class="coach-tip" id="tutorial-hint" hidden></div>
  </main>`;
  renderState();
  boardResizeObserver.observe(root.querySelector(".playfield"));
  updateSoundButton();
  window.scrollTo(0, 0);
  saveProgress();
  const hint = document.querySelector("#tutorial-hint");
  announce(`第${levelId}关，${level.name}。${hint.hidden ? "" : hint.textContent}`);
}

function tileMarkup(tile, model) {
  const exists = model.board.some(item => item.id === tile.id);
  const unavailable = !exists || reserved.has(tile.id);
  const locked = Boolean(tile.region && !model.openRegions.includes(tile.region));
  const covered = isCovered(model, tile);
  const hidden = exists && visibleFraction(model, tile) === 0;
  return `<button class="tile board-tile ${!hidden && tile.kind === "part" ? "part-tile" : ""} ${!hidden && tile.kind === "glovePart" ? "glove-part-tile" : ""} ${gloveArmed && exists && canStash(model, tile) ? "stash-target" : ""} ${!hidden && tile.kind === "yellowFish" ? "fish-tile" : ""} ${covered ? "covered" : ""} ${hidden ? "fully-covered" : ""} ${!exists ? "taken" : reserved.has(tile.id) ? "queued" : ""}"
    data-tile="${tile.id}" style="left:${tile.x}px;top:${tile.y}px;z-index:${tile.z}" aria-label="${hidden ? "被完全遮挡的牌" : `${NAMES[tile.kind]}${locked ? "，藤蔓锁定" : covered ? "，被上层遮挡" : ""}`}"
    ${unavailable || locked || covered ? "disabled" : ""} ${!exists || hidden ? 'aria-hidden="true"' : ""}>${hidden ? "" : art(tile.kind)}</button>`;
}

function renderState(model = state) {
  if (screen !== "game") return;
  const tray = document.querySelector("#tray");
  tray.innerHTML = Array.from({ length: level.capacity }, (_, i) => {
    const tile = model.tray[i];
    return `<div class="slot" data-slot="${i}">${tile ? `<div class="tile" data-tray-id="${tile.id}" aria-label="${NAMES[tile.kind]}">${art(tile.kind)}</div>` : ""}</div>`;
  }).join("");
  tray.classList.toggle("warning", model.tray.length >= level.capacity - 1);
  tray.setAttribute("aria-label", `暂存槽，已占用${model.tray.length}格，共${level.capacity}格`);
  for (const zone of level.zones) {
    document.querySelector(`[data-zone-tiles="${zone.id}"]`).innerHTML = initialTiles.filter(tile => tile.zone === zone.id).map(tile => tileMarkup(tile, model)).join("");
  }
  for (const region of level.regions) {
    const garden = document.querySelector(`[data-region-card="${region.id}"]`);
    const opened = model.openRegions.includes(region.id);
    garden.hidden = regionDiscarded(model, region.id);
    const ready = regionReady(model, region.id);
    garden.classList.toggle("locked", !opened);
    garden.classList.toggle("unlocked", opened);
    garden.classList.toggle("target", armed && ready);
    garden.classList.toggle("gated", !opened && !ready);
    garden.classList.toggle("cleared", !model.board.some(tile => tile.region === region.id));
    garden.querySelector(".vines").hidden = opened;
    const lock = garden.querySelector(".lock-action");
    lock.hidden = opened;
    lock.style.display = opened ? "none" : "";
    lock.setAttribute("aria-label", !opened && !ready ? `${regionName(region.id)}，暂时无法剪开` : `使用剪刀解锁${regionName(region.id)}${level.limitedChoice ? `，${region.choiceLabel}，本关最多选择${level.pickLimit}片` : ""}`);
  }
  if (level.fishReward) {
    const possibleFish = level.regions.filter(region => !regionDiscarded(model, region.id)).reduce((total, region) => total + (region.fishReward || 0), 0);
    const targetFish = Math.min(level.fishReward, possibleFish);
    const meter = document.querySelector("#fish-meter");
    meter.hidden = possibleFish === 0;
    meter.querySelector("span").textContent = `${model.fish} / ${targetFish}`;
    meter.setAttribute("aria-label", `小黄鱼 ${model.fish} / ${targetFish}，通关后结算`);
  }
  const tool = document.querySelector("#tool");
  if (tool) {
    tool.classList.toggle("available", model.scissors > 0);
    tool.classList.toggle("selected", armed);
    tool.setAttribute("aria-label", `剪刀，${model.scissors}把${armed ? "，已选中，点击取消" : ""}`);
    tool.setAttribute("aria-pressed", String(armed));
    tool.querySelector(".tool-count").textContent = model.scissors;
  }
  if (level.dualTools) {
    const glove = document.querySelector("#glove-tool");
    glove.classList.toggle("available", model.gloves > 0 && !model.held);
    glove.classList.toggle("selected", gloveArmed);
    glove.setAttribute("aria-pressed", String(gloveArmed));
    glove.setAttribute("aria-label", `手套，${model.gloves}次${gloveArmed ? "，已选中，点击取消" : ""}`);
    glove.querySelector(".tool-count").textContent = model.gloves;
    const held = document.querySelector("#held-slot");
    held.disabled = !model.held || reserved.has("retrieve");
    held.innerHTML = model.held ? art(model.held.kind) : "<span>暂存</span>";
    held.setAttribute("aria-label", model.held ? `取回${NAMES[model.held.kind]}，放入主槽` : "手套暂存格，空");
    held.classList.toggle("occupied", Boolean(model.held));
  }
  resizeBoard();
  updateTutorial(model);
}

function resizeBoard() {
  if (screen !== "game") return;
  const field = root.querySelector(".playfield");
  const frame = field.querySelector(".board-frame");
  const scale = Math.min(field.clientWidth / level.width, (field.clientHeight - 8) / level.height, 1.12);
  frame.style.width = `${level.width * scale}px`;
  frame.style.height = `${level.height * scale}px`;
  frame.querySelector(".board-scene").style.transform = `scale(${scale})`;
  positionTutorial();
}

function hideTutorial() {
  const hint = document.querySelector("#tutorial-hint");
  if (hint) hint.hidden = true;
  root.querySelectorAll(".choice-label").forEach(label => label.hidden = true);
  document.querySelectorAll(".tutorial-target").forEach(element => element.classList.remove("tutorial-target"));
}

function positionTutorial() {
  const hint = document.querySelector("#tutorial-hint");
  if (!hint || hint.hidden) return;
  const selectors = { collect: "#parts", tool: "#tool", unlock: ".garden.target", fish: ".board-tile.fish-tile:not(.taken)", choice: "#parts", gloveCraft: "#parts", glove: "#glove-tool", stash: ".stash-target", retrieve: "#held-slot", six: "#tray" };
  const target = document.querySelector(selectors[tutorialStep]);
  if (!target) return;
  const bounds = root.querySelector(".game").getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  const left = rect.left - bounds.left + rect.width / 2 - hint.offsetWidth / 2;
  hint.style.left = `${Math.max(8, Math.min(left, bounds.width - hint.offsetWidth - 8))}px`;
  hint.style.top = `${Math.max(8, rect.top - bounds.top - hint.offsetHeight - 12)}px`;
}

function updateTutorial(model) {
  const step = level.capacity === 6 && model.moves === 0 ? "six"
    : level.dualTools && model.held && !shownTips.has("retrieve") ? "retrieve"
    : gloveArmed ? "stash"
    : level.dualTools && model.gloves && !model.held && !shownTips.has("glove") ? "glove"
    : level.dualTools && model.moves === 0 && !shownTips.has("gloveCraft") ? "gloveCraft"
    : finishedUnlocking(model) ? null
    : armed ? level.limitedChoice ? "choice" : "unlock"
    : model.scissors ? "tool"
    : model.moves === 0 ? level.id === 8 ? "fish" : level.id === 1 ? "collect" : null
    : null;
  if (step === tutorialStep) return;
  clearTimeout(tutorialTimer);
  hideTutorial();
  tutorialStep = step;
  const tipKey = step === "choice" || step === "six" ? `${step}-${level.id}` : step;
  if (!step || shownTips.has(tipKey)) return;
  shownTips.add(tipKey);
  const hint = document.querySelector("#tutorial-hint");
  hint.textContent = {
    collect: "收集三个零件",
    tool: "点击剪刀",
    unlock: "选择藤蔓区域",
    choice: level.pickLimit === 2 ? "最多选两片，剩下的一片消失" : "只选一片，另一片消失",
    fish: "小黄鱼通关后结算，未来可用于提升排名或兑换道具。",
    gloveCraft: "三个蓝色零件合成手套，可暂存一张普通牌。",
    glove: "点击手套，再选择一张可取的普通牌。",
    stash: "暂存一张普通牌，先为下面的牌开路。",
    retrieve: "点击暂存牌取回主槽；清空手套格后才能再次暂存。",
    six: "本关主槽只有六格，手套仍只有一个暂存位置。",
  }[step];
  hint.hidden = false;
  if (step === "choice") {
    root.querySelectorAll(".choice-label").forEach(label => label.hidden = false);
  } else {
    const target = document.querySelector(({ gloveCraft: "#parts", glove: "#glove-tool", stash: ".stash-target", retrieve: "#held-slot", six: "#tray" })[step] || (step === "collect" ? '#parts button:not(:disabled)' : step === "tool" ? "#tool" : step === "fish" ? ".board-tile.fish-tile:not(.taken)" : ".garden.target"));
    target?.classList.add("tutorial-target");
  }
  positionTutorial();
  announce(hint.textContent);
  tutorialTimer = setTimeout(hideTutorial, ["fish","gloveCraft","retrieve","six"].includes(step) ? 5000 : 3200);
}

async function fly(tile, from, insertIndex) {
  if (reduceMotion.matches) return;
  const slot = document.querySelector(`[data-slot="${insertIndex}"]`);
  const to = slot.getBoundingClientRect();
  const ghost = document.createElement("div");
  ghost.className = "tile flying";
  ghost.innerHTML = art(tile.kind);
  Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
  document.body.append(ghost);
  const destination = slot.querySelector(".tile");
  if (destination) destination.style.visibility = "hidden";
  const animation = ghost.animate([
    { transform: "translate(0,0) scale(1)", opacity: 1 },
    { transform: `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${to.width / from.width},${to.height / from.height})`, opacity: 1 },
  ], { duration: 210, easing: "cubic-bezier(.25,.65,.3,1)", fill: "forwards" });
  await animation.finished;
  ghost.remove();
  if (destination) destination.style.visibility = "";
}

function enqueueTile(button) {
  const id = button.dataset.tile;
  if (reserved.has(id) || state.status !== "playing") return;
  reserved.add(id);
  queue.push({ id, type: gloveArmed ? "stash" : "collect", rect: button.getBoundingClientRect() });
  button.disabled = true;
  button.classList.add("queued");
  if (!busy) void processQueue();
}

async function processQueue() {
  setBusy(true);
  const run = epoch;
  while (queue.length && run === epoch) {
    const item = queue.shift();
    try {
      if (item.type === "stash") {
        state = stash(state, item.id);
        gloveArmed = false;
        reserved.delete(item.id);
        renderState();
        tone();
        announce(`${NAMES[state.held.kind]}已暂存，点击暂存牌可取回。`);
        continue;
      }
      const transition = item.type === "retrieve" ? retrieve(state) : collect(state, item.id);
      renderState(transition.preview);
      tone();
      await fly(transition.tile, item.rect, transition.insertIndex);
      if (run !== epoch) return;
      if (transition.matchedIds.length) {
        transition.matchedIds.forEach(id => document.querySelector(`[data-tray-id="${id}"]`)?.classList.add("matching"));
        tone("match");
        await wait(230);
        if (run !== epoch) return;
      }
      state = transition.next;
      reserved.delete(item.id);
      renderState();
      if (transition.crafted) {
        document.querySelector(transition.craftedTool === "gloves" ? "#glove-tool" : "#tool")?.classList.add("tool-pop");
        announce(transition.craftedTool === "gloves" ? "手套合成成功！可暂存一张已开放、可取的普通牌。" : "剪刀合成成功！点击工具袋里的剪刀，再选择藤蔓区域。");
      } else if (transition.matchedIds.length) announce(`消除了三张${NAMES[transition.tile.kind]}。`);
      if (state.status !== "playing") {
        frozenTime = Math.max(1, Math.round((performance.now() - startedAt) / 1000));
        queue = [];
        await wait(350);
        if (run !== epoch) return;
        showResult();
        return;
      }
    } catch (error) {
      console.error("取牌处理失败", error);
      if (run !== epoch) return;
      reserved.delete(item.id);
      notice(error.message || "取牌失败，请重试。");
      renderState();
    }
  }
  if (run === epoch) setBusy(false);
}

function toggleTool() {
  if (busy) { notice("正在收好牌，稍等一下。"); return; }
  if (!state.scissors) {
    notice(finishedUnlocking(state) ? "剪刀已使用，继续收集花园里的牌吧。" : "先收集三个零件，合成一把剪刀。");
    return;
  }
  armed = !armed;
  gloveArmed = false;
  renderState();
  const hint = document.querySelector("#tutorial-hint");
  announce(armed ? hint.hidden ? "剪刀已选中，点击高亮的藤蔓区域使用。" : `剪刀已选中。${hint.textContent}` : "已取消选择剪刀。");
}

function toggleGlove() {
  if (busy) { notice("正在收好牌，稍等一下。"); return; }
  if (state.held) { notice("手套格已占用，请先点击暂存牌取回。"); return; }
  if (!state.gloves) { notice("先收集三个手套零件。"); return; }
  gloveArmed = !gloveArmed;
  armed = false;
  renderState();
  announce(gloveArmed ? "手套已选中，请点一张高亮普通牌。" : "已取消选择手套。");
}

function retrieveHeld(button) {
  if (busy) { notice("正在收好牌，稍等一下。"); return; }
  if (!state.held || reserved.has("retrieve")) return;
  gloveArmed = false;
  armed = false;
  reserved.add("retrieve");
  queue.push({ type: "retrieve", id: "retrieve", rect: button.getBoundingClientRect() });
  button.disabled = true;
  void processQueue();
}

async function cutVines(regionId) {
  if (busy) { notice("正在收好牌，稍等一下。"); return; }
  const region = level.regions.find(item => item.id === regionId);
  if (!regionReady(state, regionId)) {
    notice("这片藤蔓暂时无法剪开。");
    return;
  }
  if (!armed) { notice(state.scissors ? "先点击工具袋里的剪刀，再选择藤蔓。" : "藤蔓挡住了花园，先收集三个剪刀零件。"); return; }
  setBusy(true);
  const run = epoch;
  state = unlock(state, regionId);
  armed = false;
  clearTimeout(tutorialTimer);
  hideTutorial();
  const garden = document.querySelector(`[data-region-card="${regionId}"]`);
  garden.classList.add("opening");
  if (level.limitedChoice && finishedUnlocking(state)) {
    for (const other of root.querySelectorAll(".garden")) {
      if (!state.openRegions.includes(other.dataset.regionCard)) other.classList.add("discarding");
    }
  }
  tone("match");
  await wait(430);
  if (run !== epoch) return;
  garden.classList.remove("opening");
  setBusy(false);
  renderState();
  announce(`${regionName(region.id)}藤蔓已剪开，剪刀消耗一把。${level.limitedChoice && finishedUnlocking(state) ? "未选择的花园已消失。" : ""}`);
  if (queue.length) void processQueue();
}

function showResult() {
  const won = state.status === "won";
  const fishClaimed = progress.fishBest[level.id] || 0;
  const fishAwarded = won ? Math.max(0, state.fish - fishClaimed) : 0;
  clearRun();
  screen = "result";
  if (won) progress = completeLevel(progress, level.id, state.fish);
  const nextLevel = getNextLevel(level.id);
  const last = !nextLevel;
  const nextId = nextLevel?.id ?? level.id;
  const lossText = state.lossReason === "blocked" ? "当前没有可取的牌，也没有可用剪刀。" : "暂存槽装满了。";
  root.innerHTML = `<main class="shell result">
    ${brand()}
    <div class="result-content">
      <div class="result-summary">
      <div class="medallion">${art(won ? state.fish ? "yellowFish" : level.reward ? "star" : "scissors" : "leaf")}</div>
      <div class="eyebrow">${won ? level.reward ? "A LITTLE HARVEST FOR YOU" : "ANOTHER GARDEN IS OPEN" : "TAKE A BREATH, TRY AGAIN"}</div>
      <h1>${won ? "挑战成功" : "挑战失败"}</h1>
      <p class="result-level">第 ${level.id} 关 · ${level.name}</p>
      ${won ? "" : `<p class="result-sub">${lossText}</p>`}
      ${won && level.fishReward ? `<div class="fish-reward" data-fish-awarded="${fishAwarded}">${art("yellowFish")}<span>${fishAwarded ? `小黄鱼 +${fishAwarded}` : state.fish ? "小黄鱼已领取" : "本次未获得小黄鱼"}</span></div>` : ""}
      <div class="result-stats"><div><strong>${state.matches}</strong><span>完成配对</span></div><div><strong>${frozenTime}<small style="font-size:12px"> 秒</small></strong><span>用时</span></div></div>
      </div>
    </div>
    <footer class="result-actions">
      <button class="primary" data-action="${won && last ? "levels" : "start"}" data-level="${won ? nextId : level.id}">${won ? last ? "返回花园地图" : "下一关" : "重新挑战"}${icon(won ? "arrow" : "restart")}</button>
      <div class="result-secondary">
        ${won ? `<button class="secondary" data-action="start" data-level="${level.id}">重玩本关</button>` : ""}
        <button class="secondary" data-action="home-direct">返回首页</button>
      </div>
      <p class="footnote">${won && last ? "二十关已开放 · 可自由选择重玩" : `已完成 ${progress.completed.length} / ${LEVELS.length} 关`}</p>
    </footer>
  </main>`;
  tone(won ? "win" : "tap");
  window.scrollTo(0, 0);
  if (won) saveProgress();
  announce(won ? `第${level.id}关挑战成功。` : "挑战失败，可以重新挑战。");
  root.querySelector(".primary").focus({ preventScroll: true });
}

function confirmAction(action) {
  if (document.querySelector(".veil")) return;
  returnFocus = document.activeElement;
  const veil = document.createElement("div");
  veil.className = "veil";
  veil.innerHTML = `<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
    <h2 id="dialog-title">${action === "restart" ? "重新整理这片花园？" : "先离开花园？"}</h2>
    <p id="dialog-description">本关进度将重置。<br>也可以留下来，慢慢完成这一关。</p>
    <button class="primary" data-confirm="${action}">${action === "restart" ? "重新开始" : "返回首页"}</button>
    <button class="secondary" data-action="cancel">继续游玩</button>
  </section>`;
  document.body.append(veil);
  veil.querySelector('[data-action="cancel"]').focus();
}

function dismissDialog() {
  document.querySelector(".veil")?.remove();
  if (returnFocus?.isConnected) returnFocus.focus();
}

document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button || button.disabled) {
    if ((armed || gloveArmed) && !busy && !event.target.closest(".garden,.tool-wrap,.veil")) { armed = false; gloveArmed = false; renderState(); }
    return;
  }
  if (button.dataset.confirm) {
    button.dataset.confirm === "restart" ? startGame() : showHome();
    return;
  }
  if (button.dataset.tile) { enqueueTile(button); return; }
  const action = button.dataset.action;
  if (action === "start") startGame(Number(button.dataset.level || state.levelId));
  else if (action === "home-direct") showHome();
  else if (action === "levels") showLevels();
  else if (action === "chapter") selectChapter(Number(button.dataset.chapter));
  else if (action === "home" || action === "restart") confirmAction(action);
  else if (action === "cancel") dismissDialog();
  else if (action === "sound") { sound = !sound; updateSoundButton(); if (sound) tone("match"); }
  else if (action === "tool") toggleTool();
  else if (action === "glove") toggleGlove();
  else if (action === "retrieve") retrieveHeld(button);
  else if (action === "unlock") void cutVines(button.dataset.region);
});

document.addEventListener("keydown", event => {
  const tab = event.target.closest('.chapter-tab');
  if (tab && ["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) {
    event.preventDefault();
    selectChapter(event.key === "Home" ? 1 : event.key === "End" ? 2 : Number(tab.dataset.chapter) === 1 ? 2 : 1);
    return;
  }
  const dialog = document.querySelector(".veil");
  if (event.key === "Escape") {
    if (dialog) dismissDialog();
    else if (armed || gloveArmed) { armed = false; gloveArmed = false; renderState(); }
  }
  if (event.key === "Tab" && dialog) {
    const buttons = [...dialog.querySelectorAll("button")];
    const first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

window.addEventListener("resize", resizeBoard);
if (!testing) {
  try { progress = parseProgress(localStorage.getItem(PROGRESS_KEY)); }
  catch (error) {
    console.error("读取关卡进度失败", error);
    persistenceWarning = "本地进度无法读取，本次从第一关开始；仍可自由选关。";
  }
}
showHome();
if (persistenceWarning) notice(persistenceWarning);
