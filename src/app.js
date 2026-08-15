/**
 * NEO-CLICKER ONLINE // MASTER SOCIAL MMO CLICKER ENGINE
 * 1. Clean, High-Contrast Cyber-Fintech UI.
 * 2. 10-Tier Hardware Upgrades list.
 * 3. 3 Chat Channels: Global, Dedicated Clan HQ, and Private PMs.
 * 4. Active Online Players Panel with Player Action Inspector.
 * 5. Marketplace 2.0 with Category and Rarity filters.
 */

import { ClickerCore } from "./clicker-core.js";
import { ClanSystem } from "./clan-system.js";
import { SocialChatEngine } from "./social-chat.js";
import { TradeMarketEngine } from "./trade-market.js";
import { LeaderboardAndEventsEngine } from "./leaderboard-events.js";
import { ITEMS_DATABASE, RARITY_CONFIG } from "./items-collectibles.js";

// Global Singletons
let core, clans, chat, market, events;
let activeTab = 'clicker';
let activeMarketCategory = 'all';
let activeMarketRarity = 'all';
let selectedTradePartner = 'Alex_Pro';

function initGame() {
  core = new ClickerCore();
  clans = new ClanSystem();
  market = new TradeMarketEngine();

  chat = new SocialChatEngine((channel, msg, engineInstance) => {
    const currentActiveChannel = engineInstance ? engineInstance.activeChannel : (chat ? chat.activeChannel : 'global');
    if (channel === currentActiveChannel) {
      renderChatFeed();
    }
  });

  events = new LeaderboardAndEventsEngine((action, data) => {
    handleServerEvent(action, data);
  });

  setupNavigationTabs();
  setupClickerOrb();
  setupUpgradesTab();
  setupClansTab();
  setupMarketTab();
  setupTradeTab();
  setupLeaderboardsTab();
  setupInventoryTab();
  setupProfileTab();
  setupChatChannelTabs();
  setupOnlinePlayersList();

  // 10 FPS Loop
  setInterval(tick, 100);
  renderAll();
}

// ----------------------------------------------------------------------------
// 1. CLEAN CLICKER ORB & NUMBERS
// ----------------------------------------------------------------------------
function setupClickerOrb() {
  const orb = document.getElementById('clicker-main-orb');
  if (!orb) return;

  orb.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const clanBonus = clans.getClanBonus(core.clanId).clickBonus;
    let earned = core.performClick(clanBonus);

    if (events.activeEvent && events.activeEvent.type === 'rush_hour') {
      earned *= 5;
      core.neoCoins += earned * 4;
    }

    if (events.activeEvent && events.activeEvent.type === 'world_boss') {
      events.damageBoss(earned);
    }

    const rect = orb.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + 20;
    spawnCleanFloatingNumber(x, y, `+${formatNumber(earned)}`);

    orb.classList.add('orb-pulse');
    setTimeout(() => orb.classList.remove('orb-pulse'), 70);

    updateStatsHUD();
  });
}

function spawnCleanFloatingNumber(x, y, text) {
  const el = document.createElement('div');
  el.className = 'clean-click-number';
  el.textContent = text;
  el.style.left = `${x + (Math.random() - 0.5) * 60}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// ----------------------------------------------------------------------------
// 2. TAB NAVIGATION
// ----------------------------------------------------------------------------
function setupNavigationTabs() {
  document.querySelectorAll('.main-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.main-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.app-tab-view').forEach(v => v.classList.add('hidden'));

      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      const view = document.getElementById(`tab-view-${activeTab}`);
      if (view) view.classList.remove('hidden');

      if (activeTab === 'clicker') renderUpgrades();
      if (activeTab === 'clans') renderClans();
      if (activeTab === 'market') renderMarket();
      if (activeTab === 'leaderboard') renderLeaderboard();
      if (activeTab === 'inventory') renderInventory();
      if (activeTab === 'profile') renderProfile();
    });
  });
}

// ----------------------------------------------------------------------------
// 3. 10-TIER HARDWARE UPGRADES
// ----------------------------------------------------------------------------
function setupUpgradesTab() {
  const btnUpClick = document.getElementById('btn-upgrade-click');
  if (btnUpClick) {
    btnUpClick.addEventListener('click', () => {
      if (core.upgradeClick()) {
        renderUpgrades();
        updateStatsHUD();
      }
    });
  }

  const btnPrestige = document.getElementById('btn-do-prestige');
  if (btnPrestige) {
    btnPrestige.addEventListener('click', () => {
      if (core.canPrestige()) {
        if (confirm(`Совершить Квантовое Перерождение? Вы получите +50% постоянного дохода и ${75 * (core.prestigeLevel + 1)} Квантовых Кристаллов!`)) {
          core.doPrestige();
          chat.addSystemMessage(`👑 Игрок ${core.name} совершил Квантовое Перерождение #${core.prestigeLevel}!`);
          renderAll();
        }
      }
    });
  }
}

function renderUpgrades() {
  const clickCostEl = document.getElementById('cost-upgrade-click');
  if (clickCostEl) clickCostEl.textContent = `$${formatNumber(core.getClickUpgradeCost())} NC`;

  const clickLvlEl = document.getElementById('lvl-upgrade-click');
  if (clickLvlEl) clickLvlEl.textContent = `Ур. ${core.clickLevel}`;

  const hardwareList = document.getElementById('hardware-tiers-list');
  if (hardwareList) {
    hardwareList.innerHTML = '';
    const hardItems = ITEMS_DATABASE.filter(i => i.type === 'hardware');

    hardItems.forEach(h => {
      const count = core.hardwareTiers[h.id] || 0;
      const cost = core.getHardwareCost(h.id);
      const canAfford = core.neoCoins >= cost;

      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="upgrade-card-icon">${h.icon}</div>
        <div class="upgrade-card-info">
          <div class="upgrade-name">${h.name}</div>
          <div class="upgrade-desc">${h.desc}</div>
          <div class="upgrade-level">Куплено: <b>${count} шт.</b> (+${formatNumber(count * (h.bonus.autoIncome || 0))} NC/сек)</div>
        </div>
        <button class="btn-action-upgrade buy-hw-btn" ${!canAfford ? 'disabled' : ''}>
          <span>КУПИТЬ</span>
          <b>$${formatNumber(cost)} NC</b>
        </button>
      `;

      card.querySelector('.buy-hw-btn').addEventListener('click', () => {
        if (core.buyHardwareTier(h.id)) {
          renderUpgrades();
          updateStatsHUD();
        }
      });

      hardwareList.appendChild(card);
    });
  }

  const prestigeBtn = document.getElementById('btn-do-prestige');
  const prestigeCostEl = document.getElementById('cost-prestige');
  if (prestigeBtn && prestigeCostEl) {
    prestigeCostEl.textContent = `$${formatNumber(core.getPrestigeCost())} NC`;
    prestigeBtn.disabled = !core.canPrestige();
  }
}

// ----------------------------------------------------------------------------
// 4. CLANS TAB
// ----------------------------------------------------------------------------
function setupClansTab() {
  const btnCreateClan = document.getElementById('btn-open-create-clan');
  if (btnCreateClan) {
    btnCreateClan.addEventListener('click', () => {
      const name = prompt('Введите название вашего Клана:');
      if (!name) return;
      const tag = prompt('Введите тег клана (3-5 букв, например CYBER):');
      if (!tag) return;

      if (core.neoCoins < 2000) return alert('Создание клана стоит 2,000 NC!');
      core.neoCoins -= 2000;

      const newClan = clans.createClan(name, tag, '🛡️', 'Гильдия сервера', core.name);
      core.clanId = newClan.id;
      core.saveToStorage();
      chat.addSystemMessage(`🛡️ Создан новый клан [${newClan.tag}] "${newClan.name}"!`);
      renderClans();
      updateStatsHUD();
    });
  }

  const btnDonate = document.getElementById('btn-clan-donate');
  if (btnDonate) {
    btnDonate.addEventListener('click', () => {
      const clan = clans.clans.get(core.clanId);
      if (!clan) return;
      const amount = prompt(`Сколько внести в казну клана? (У вас: $${formatNumber(core.neoCoins)} NC):`, '1000');
      const val = parseInt(amount, 10);
      if (val > 0 && core.neoCoins >= val) {
        core.neoCoins -= val;
        clans.donateToBank(clan.id, core.name, val);
        chat.addChatMessage('clan', core.name, clan.tag, core.equippedTitle, `Внёс в казну клана $${formatNumber(val)} NC! 💰`);
        renderClans();
        updateStatsHUD();
      }
    });
  }

  const btnUpgradeClickPerk = document.getElementById('btn-clan-upgrade-click');
  if (btnUpgradeClickPerk) {
    btnUpgradeClickPerk.addEventListener('click', () => {
      if (clans.upgradePerk(core.clanId, 'clickBoostLevel')) {
        renderClans();
      } else {
        alert('Недостаточно средств в казне клана!');
      }
    });
  }
}

function renderClans() {
  const myClan = clans.clans.get(core.clanId);
  const myClanPanel = document.getElementById('my-clan-info-panel');
  const noClanPanel = document.getElementById('no-clan-panel');

  if (myClan) {
    if (myClanPanel) myClanPanel.classList.remove('hidden');
    if (noClanPanel) noClanPanel.classList.add('hidden');

    document.getElementById('clan-view-name').textContent = `[${myClan.tag}] ${myClan.name}`;
    document.getElementById('clan-view-bank').textContent = `$${formatNumber(myClan.bank)} NC`;
    document.getElementById('clan-view-level').textContent = `Уровень: ${myClan.level} (Трофеи: 🏆 ${myClan.trophies})`;
    document.getElementById('clan-click-boost-val').textContent = `+${(myClan.perks.clickBoostLevel || 0) * 15}% к клику`;
    document.getElementById('clan-income-boost-val').textContent = `+${(myClan.perks.incomeBoostLevel || 0) * 15}% к авто-доходу`;

    const membersList = document.getElementById('clan-members-list');
    if (membersList) {
      membersList.innerHTML = '';
      myClan.members.forEach(m => {
        const row = document.createElement('div');
        row.className = 'clan-member-row';
        row.innerHTML = `<span><b>${m.name}</b> (${m.role})</span> <span>Вклад: $${formatNumber(m.donated)}</span>`;
        membersList.appendChild(row);
      });
    }
  } else {
    if (myClanPanel) myClanPanel.classList.add('hidden');
    if (noClanPanel) noClanPanel.classList.remove('hidden');
  }

  const allList = document.getElementById('all-clans-list');
  if (allList) {
    allList.innerHTML = '';
    clans.getAllClans().forEach(c => {
      const card = document.createElement('div');
      card.className = 'clan-card-item';
      card.innerHTML = `
        <div class="clan-card-head">
          <b>${c.emblem} [${c.tag}] ${c.name}</b>
          <span class="badge-tag">Ур. ${c.level}</span>
        </div>
        <div class="clan-card-desc">${c.desc}</div>
        <div class="clan-card-footer">
          <span>Участников: ${c.members.length} • Казна: $${formatNumber(c.bank)}</span>
          ${!core.clanId ? `<button class="btn-primary-sm join-clan-btn" data-id="${c.id}">ВСТУПИТЬ</button>` : ''}
        </div>
      `;
      if (!core.clanId) {
        card.querySelector('.join-clan-btn').addEventListener('click', () => {
          clans.joinClan(c.id, core.name);
          core.clanId = c.id;
          core.saveToStorage();
          chat.addSystemMessage(`🤝 Игрок ${core.name} вступил в клан [${c.tag}]!`);
          renderClans();
          updateStatsHUD();
        });
      }
      allList.appendChild(card);
    });
  }
}

// ----------------------------------------------------------------------------
// 5. MARKETPLACE 2.0 & FILTERS
// ----------------------------------------------------------------------------
function setupMarketTab() {
  document.querySelectorAll('.market-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.market-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMarketCategory = btn.dataset.cat;
      renderMarket();
    });
  });

  const btnSell = document.getElementById('btn-market-list-item');
  if (btnSell) {
    btnSell.addEventListener('click', () => {
      if (core.inventory.length === 0) return alert('У вас нет предметов в инвентаре для продажи!');
      const itemNames = core.inventory.map((id, idx) => `${idx + 1}. ${ITEMS_DATABASE.find(i => i.id === id)?.name || id}`).join('\n');
      const pick = prompt(`Выберите номер предмета для продажи:\n${itemNames}`);
      const num = parseInt(pick, 10);
      if (num >= 1 && num <= core.inventory.length) {
        const itemId = core.inventory[num - 1];
        const priceStr = prompt('Введите цену в Нео-Коинах (NC):', '1000');
        const price = parseInt(priceStr, 10);
        if (price > 0) {
          core.removeItem(itemId);
          market.createListing(core.name, itemId, price);
          chat.addSystemMessage(`🏪 ${core.name} выставил на рынок "${ITEMS_DATABASE.find(i => i.id === itemId)?.name}" за $${formatNumber(price)} NC!`);
          renderMarket();
          renderInventory();
        }
      }
    });
  }
}

function renderMarket() {
  const list = document.getElementById('market-listings-grid');
  if (!list) return;
  list.innerHTML = '';

  let filtered = market.marketListings;
  if (activeMarketCategory !== 'all') {
    filtered = filtered.filter(l => {
      const it = ITEMS_DATABASE.find(i => i.id === l.itemId);
      return it && it.type === activeMarketCategory;
    });
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-msg">Нет товаров в этой категории. Выставьте свой предмет на продажу!</div>';
    return;
  }

  filtered.forEach(l => {
    const item = ITEMS_DATABASE.find(i => i.id === l.itemId);
    if (!item) return;

    const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
    const card = document.createElement('div');
    card.className = 'market-item-card';
    card.style.borderColor = rarity.color;
    card.innerHTML = `
      <div class="market-card-icon">${item.icon}</div>
      <div class="market-card-name" style="color: ${rarity.color}">${item.name}</div>
      <div class="market-card-rarity" style="color: ${rarity.color}">${rarity.name}</div>
      <div class="market-card-desc">${item.desc}</div>
      <div class="market-card-seller">Продавец: <b>${l.seller}</b></div>
      <div class="market-card-buy-row">
        <span class="market-price">$${formatNumber(l.price)} NC</span>
        <button class="btn-primary-sm buy-listing-btn" ${core.neoCoins < l.price ? 'disabled' : ''}>КУПИТЬ</button>
      </div>
    `;

    card.querySelector('.buy-listing-btn').addEventListener('click', () => {
      const res = market.buyListing(l.id, core);
      if (res.success) {
        chat.addSystemMessage(`💸 ${core.name} купил "${item.name}" у ${l.seller} за $${formatNumber(l.price)} NC!`);
        renderMarket();
        renderInventory();
        updateStatsHUD();
      } else {
        alert(res.msg);
      }
    });

    list.appendChild(card);
  });
}

// ----------------------------------------------------------------------------
// 6. MULTI-CHANNEL CHAT & CLAN HQ CHAT
// ----------------------------------------------------------------------------
function setupChatChannelTabs() {
  document.querySelectorAll('.chat-channel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chat-channel-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chat.activeChannel = btn.dataset.channel;

      const input = document.getElementById('chat-input-text');
      if (chat.activeChannel === 'clan') {
        input.placeholder = core.clanId ? 'Написать в клановый чат гильдии...' : 'Вы не состоите в клане!';
        input.disabled = !core.clanId;
      } else if (chat.activeChannel === 'pm') {
        input.placeholder = `Написать личное сообщение ${chat.activePMTarget}...`;
        input.disabled = false;
      } else {
        input.placeholder = 'Написать в общий чат (клик по нику для @тега)...';
        input.disabled = false;
      }

      renderChatFeed();
    });
  });

  const form = document.getElementById('chat-send-form');
  const input = document.getElementById('chat-input-text');
  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const clan = clans.clans.get(core.clanId);
      const clanTag = clan ? clan.tag : null;
      const titleItem = core.equippedTitle ? ITEMS_DATABASE.find(i => i.id === core.equippedTitle) : null;
      const titleText = titleItem ? titleItem.tagText : null;

      if (chat.activeChannel === 'pm') {
        chat.sendPrivateMessage(core.name, chat.activePMTarget, text);
      } else {
        chat.addChatMessage(chat.activeChannel, core.name, clanTag, titleText, text);
      }
      renderChatFeed();
    });
  }
}

function renderChatFeed() {
  const feed = document.getElementById('global-chat-feed');
  if (!feed || !chat) return;
  feed.innerHTML = '';

  const messages = chat.getMessages(chat.activeChannel, core.clanId);
  messages.forEach(msg => {
    const el = document.createElement('div');
    el.className = `chat-row ${msg.isSystem ? 'system-msg' : ''}`;

    if (msg.isSystem) {
      el.innerHTML = `<span class="chat-sys-icon">⚡</span> <span class="chat-sys-text">${msg.text}</span>`;
    } else {
      el.innerHTML = `
        <span class="chat-time">${msg.time}</span>
        ${msg.clanTag ? `<span class="chat-clan-badge">[${msg.clanTag}]</span>` : ''}
        ${msg.title ? `<span class="chat-title-badge">[${msg.title}]</span>` : ''}
        <b class="chat-author" style="color: #00d2ff">${msg.sender}:</b>
        <span class="chat-body">${msg.text}</span>
      `;

      el.querySelector('.chat-author').addEventListener('click', () => {
        openPlayerInspector(msg.sender);
      });
    }

    feed.appendChild(el);
  });

  feed.scrollTop = feed.scrollHeight;
}

// ----------------------------------------------------------------------------
// 7. ACTIVE ONLINE PLAYERS LIST & INSPECTOR
// ----------------------------------------------------------------------------
function setupOnlinePlayersList() {
  const list = document.getElementById('online-players-scroll');
  if (!list || !chat) return;
  list.innerHTML = '';

  chat.onlinePlayers.forEach(p => {
    const item = document.createElement('div');
    item.className = 'online-player-card';
    item.innerHTML = `
      <div class="online-p-head">
        <span class="online-p-dot">●</span>
        ${p.clan ? `<span class="clan-tag">[${p.clan}]</span>` : ''}
        <b>${p.name}</b>
        <span class="online-p-lvl">Ур. ${p.level}</span>
      </div>
      <div class="online-p-status">${p.status}</div>
    `;

    item.addEventListener('click', () => {
      openPlayerInspector(p.name);
    });

    list.appendChild(item);
  });
}

function openPlayerInspector(playerName) {
  if (playerName === core.name) return;

  const action = prompt(`Игрок: ${playerName}\n\n1. 💬 Написать в ЛС\n2. 🤝 Предложить Трейд\n3. 🛡️ Пригласить в Клан\n\nВведите номер действия (1-3):`, '1');
  if (action === '1') {
    chat.activePMTarget = playerName;
    const pmTab = document.querySelector('[data-channel="pm"]');
    if (pmTab) pmTab.click();
  } else if (action === '2') {
    selectedTradePartner = playerName;
    const tradeTab = document.querySelector('[data-tab="trades"]');
    if (tradeTab) tradeTab.click();
    startTradeSession();
  } else if (action === '3') {
    if (!core.clanId) return alert('Вы должны состоять в клане, чтобы приглашать игроков!');
    alert(`Приглашение в клан отправлено игроку ${playerName}!`);
  }
}

// ----------------------------------------------------------------------------
// 8. TRADES, LEADERBOARDS, INVENTORY & PROFILE
// ----------------------------------------------------------------------------
function setupTradeTab() {
  const partnerSelect = document.getElementById('trade-partner-select');
  if (partnerSelect) {
    partnerSelect.addEventListener('change', (e) => {
      selectedTradePartner = e.target.value;
      startTradeSession();
    });
  }

  const btnTradeReady = document.getElementById('btn-trade-ready');
  if (btnTradeReady) {
    btnTradeReady.addEventListener('click', () => {
      market.setReady(true);
      renderTradeWindow();
    });
  }

  const btnTradeConfirm = document.getElementById('btn-trade-confirm');
  if (btnTradeConfirm) {
    btnTradeConfirm.addEventListener('click', () => {
      if (market.confirmTrade(true, core)) {
        chat.addSystemMessage(`🤝 Трейд между ${core.name} и ${selectedTradePartner} успешно завершен!`);
        alert('🎉 Сделка успешно состоялась! Предметы и валюта получены.');
        renderTradeWindow();
        renderInventory();
        updateStatsHUD();
      }
    });
  }

  startTradeSession();
}

function startTradeSession() {
  market.startTrade(core.name, selectedTradePartner);
  market.setOffer(false, 2500, ['gpu_rtx', 'chip_v1']);
  market.activeTrade.partyB.ready = true;
  renderTradeWindow();
}

function renderTradeWindow() {
  const trade = market.activeTrade;
  if (!trade) return;

  document.getElementById('trade-party-a-name').textContent = `${core.name} (Вы)`;
  document.getElementById('trade-party-b-name').textContent = selectedTradePartner;

  const readyA = document.getElementById('trade-status-a');
  if (readyA) {
    readyA.textContent = trade.partyA.ready ? '✔ ГОТОВ' : '⏳ ВЫБОР...';
    readyA.className = trade.partyA.ready ? 'badge-ready' : 'badge-wait';
  }

  const readyB = document.getElementById('trade-status-b');
  if (readyB) {
    readyB.textContent = trade.partyB.ready ? '✔ ГОТОВ' : '⏳ ВЫБОР...';
    readyB.className = trade.partyB.ready ? 'badge-ready' : 'badge-wait';
  }

  const listB = document.getElementById('trade-items-b');
  if (listB) {
    listB.innerHTML = `<div>💵 Предложение: $${formatNumber(trade.partyB.coins)} NC</div>`;
    trade.partyB.items.forEach(itId => {
      const it = ITEMS_DATABASE.find(i => i.id === itId);
      if (it) listB.innerHTML += `<div class="trade-chip">${it.icon} ${it.name}</div>`;
    });
  }

  const btnConfirm = document.getElementById('btn-trade-confirm');
  if (btnConfirm) {
    btnConfirm.disabled = !(trade.partyA.ready && trade.partyB.ready);
  }
}

function setupLeaderboardsTab() {
  document.querySelectorAll('.lb-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lb-category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLeaderboard(btn.dataset.cat);
    });
  });
}

function renderLeaderboard(cat = 'coins') {
  const list = document.getElementById('leaderboard-rows-container');
  if (!list) return;
  list.innerHTML = '';

  const ranks = events.getRankings(cat, core);
  ranks.forEach((r, idx) => {
    const row = document.createElement('div');
    row.className = `lb-row ${r.isLocal ? 'local-player' : ''}`;
    let valStr = `$${formatNumber(r.coins)} NC`;
    if (cat === 'clicks') valStr = `${formatNumber(r.clicks)} кликов`;
    if (cat === 'prestige') valStr = `Престиж Ур. ${r.prestige}`;

    row.innerHTML = `
      <div class="lb-rank">#${idx + 1}</div>
      <div class="lb-name">
        ${r.clan ? `<span class="clan-tag">[${r.clan}]</span>` : ''}
        ${r.title ? `<span class="title-tag">[${r.title}]</span>` : ''}
        <b>${r.name}</b>
      </div>
      <div class="lb-val">${valStr}</div>
    `;
    list.appendChild(row);
  });
}

function setupInventoryTab() {}

function renderInventory() {
  const grid = document.getElementById('inventory-items-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (core.inventory.length === 0) {
    grid.innerHTML = '<div class="empty-msg">Инвентарь пуст. Покупайте чипы и реликвии на рынке!</div>';
    return;
  }

  core.inventory.forEach(itemId => {
    const item = ITEMS_DATABASE.find(i => i.id === itemId);
    if (!item) return;

    const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
    const isEquipped = (core.equippedAura === itemId || core.equippedFrame === itemId || core.equippedTitle === itemId);

    const card = document.createElement('div');
    card.className = `inv-card ${isEquipped ? 'equipped' : ''}`;
    card.style.borderColor = rarity.color;
    card.innerHTML = `
      <div class="inv-card-icon">${item.icon}</div>
      <div class="inv-card-name" style="color: ${rarity.color}">${item.name}</div>
      <div class="inv-card-desc">${item.desc}</div>
      ${['aura', 'frame', 'title'].includes(item.type) ? `<button class="btn-primary-sm equip-btn">${isEquipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>` : ''}
    `;

    if (card.querySelector('.equip-btn')) {
      card.querySelector('.equip-btn').addEventListener('click', () => {
        core.equipCosmetic(itemId);
        renderInventory();
        renderProfile();
      });
    }

    grid.appendChild(card);
  });
}

function setupProfileTab() {
  const btnName = document.getElementById('btn-change-name');
  if (btnName) {
    btnName.addEventListener('click', () => {
      const n = prompt('Введите новый никнейм:', core.name);
      if (n && n.trim()) {
        core.name = n.trim();
        core.saveToStorage();
        renderProfile();
        updateStatsHUD();
      }
    });
  }

  const btnExport = document.getElementById('btn-export-save');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const str = core.exportSaveString();
      prompt('Ваш код сохранения (скопируйте и сохраните в надежное место):', str);
    });
  }

  const btnImport = document.getElementById('btn-import-save');
  if (btnImport) {
    btnImport.addEventListener('click', () => {
      const str = prompt('Вставьте ваш код сохранения:');
      if (str && core.importSaveString(str)) {
        alert('Данные успешно восстановлены!');
        renderAll();
      } else {
        alert('Неверный код сохранения!');
      }
    });
  }
}

function renderProfile() {
  document.getElementById('prof-name').textContent = core.name;
  document.getElementById('prof-total-earned').textContent = `$${formatNumber(core.totalEarned)} NC`;
  document.getElementById('prof-total-clicks').textContent = formatNumber(core.totalClicks);
  document.getElementById('prof-prestige').textContent = `Уровень ${core.prestigeLevel} (x${core.prestigeMultiplier} Multiplier)`;
  document.getElementById('prof-crystals').textContent = `${core.quantumCrystals} QC`;

  const avatar = document.getElementById('prof-avatar-orb');
  if (avatar) {
    avatar.style.boxShadow = 'none';
    if (core.equippedAura) {
      const aura = ITEMS_DATABASE.find(i => i.id === core.equippedAura);
      if (aura && aura.cssGlow) avatar.style.boxShadow = aura.cssGlow;
    }
  }
}

// ----------------------------------------------------------------------------
// 9. LIVE SERVER EVENTS
// ----------------------------------------------------------------------------
function handleServerEvent(type, data) {
  const banner = document.getElementById('server-event-banner');
  if (!banner) return;

  if (type === 'start' && data.type === 'rush_hour') {
    banner.textContent = data.title;
    banner.classList.add('visible', 'rush-active');
  } else if (type === 'end') {
    banner.classList.remove('visible', 'rush-active');
  } else if (type === 'meteor') {
    spawnMeteorDrop(data.reward);
  } else if (type === 'boss_spawn') {
    banner.textContent = `${data.title} (Кликайте для атаки!)`;
    banner.classList.add('visible', 'boss-active');
  } else if (type === 'boss_defeat') {
    core.neoCoins += data.reward;
    banner.textContent = `🎉 МИРОВОЙ БОСС ПОВЕРЖЕН! ВСЕМ ВЫДАНА НАГРАДА +$${formatNumber(data.reward)} NC!`;
    setTimeout(() => banner.classList.remove('visible', 'boss-active'), 5000);
  }
}

function spawnMeteorDrop(reward) {
  const met = document.createElement('div');
  met.className = 'golden-meteor-drop';
  met.textContent = '☄️';
  met.style.left = `${10 + Math.random() * 80}vw`;
  met.style.top = `${15 + Math.random() * 65}vh`;
  document.body.appendChild(met);

  met.addEventListener('click', () => {
    core.neoCoins += reward;
    chat.addSystemMessage(`☄️ ${core.name} поймал Золотой Метеор и получил $${formatNumber(reward)} NC!`);
    met.remove();
    updateStatsHUD();
  });

  setTimeout(() => met.remove(), 7000);
}

// ----------------------------------------------------------------------------
// 10. MASTER TICK & UI UPDATE
// ----------------------------------------------------------------------------
function tick() {
  const clanBonus = clans.getClanBonus(core.clanId).incomeBonus;
  core.update(clanBonus);
  updateStatsHUD();
}

function updateStatsHUD() {
  const clanBonus = clans.getClanBonus(core.clanId);

  document.getElementById('hud-balance-nc').textContent = `$${formatNumber(core.neoCoins)}`;
  document.getElementById('hud-balance-qc').textContent = `${core.quantumCrystals} QC`;
  document.getElementById('hud-click-power').textContent = `+${formatNumber(core.getClickPower(clanBonus.clickBonus))} / клик`;
  document.getElementById('hud-auto-income').textContent = `+$${formatNumber(core.getAutoIncomePerSec(clanBonus.incomeBonus))} / сек`;
}

function renderAll() {
  updateStatsHUD();
  renderUpgrades();
  renderClans();
  renderMarket();
  renderLeaderboard();
  renderInventory();
  renderProfile();
  renderChatFeed();
}

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.round(num).toLocaleString();
}

window.addEventListener('DOMContentLoaded', initGame);
