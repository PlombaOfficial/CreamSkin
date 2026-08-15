/**
 * NEO-CLICKER ONLINE // CLAN & GUILD ALLIANCE SYSTEM
 * Clan creation, shared treasury bank, perk upgrades (click & income buffs),
 * roles (Leader, Officer, Member), and clan rankings.
 */

const CLAN_STORAGE_KEY = 'neo_clans_db_v2';

export class ClanSystem {
  constructor() {
    this.clans = new Map();
    this.loadClans();
  }

  loadClans() {
    try {
      const raw = localStorage.getItem(CLAN_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        arr.forEach(c => this.clans.set(c.id, c));
      } else {
        this.seedDefaultClans();
      }
    } catch (e) {
      this.seedDefaultClans();
    }
  }

  saveClans() {
    try {
      const arr = Array.from(this.clans.values());
      localStorage.setItem(CLAN_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  seedDefaultClans() {
    const defaults = [
      {
        id: 'clan_cyber',
        name: 'Cyber Syndicate',
        tag: 'CYBER',
        emblem: '⚡',
        desc: 'Элитный технологический альянс майнеров и магнатов.',
        level: 4,
        bank: 45000,
        trophies: 1250,
        leader: 'Alex_Pro',
        members: [
          { name: 'Alex_Pro', role: 'leader', donated: 25000 },
          { name: 'Matrix_King', role: 'officer', donated: 12000 },
          { name: 'NeoMiner', role: 'member', donated: 8000 }
        ],
        perks: {
          clickBoostLevel: 3,  // +45% click power
          incomeBoostLevel: 2  // +30% auto income
        }
      },
      {
        id: 'clan_phoenix',
        name: 'Phoenix Vanguard',
        tag: 'FIRE',
        emblem: '🔥',
        desc: 'Несокрушимый клан огненных кликеров. Первое место в ивентах!',
        level: 3,
        bank: 28000,
        trophies: 980,
        leader: 'FlameMaster',
        members: [
          { name: 'FlameMaster', role: 'leader', donated: 18000 },
          { name: 'SunGoddess', role: 'officer', donated: 10000 }
        ],
        perks: {
          clickBoostLevel: 2,
          incomeBoostLevel: 2
        }
      },
      {
        id: 'clan_crypto',
        name: 'Crypto Wolves',
        tag: 'WOLF',
        emblem: '🐺',
        desc: 'Охотники за квантовыми кристаллами и редкими реликвиями.',
        level: 2,
        bank: 12000,
        trophies: 620,
        leader: 'Alpha_Wolf',
        members: [
          { name: 'Alpha_Wolf', role: 'leader', donated: 9000 },
          { name: 'ByteHunter', role: 'member', donated: 3000 }
        ],
        perks: {
          clickBoostLevel: 1,
          incomeBoostLevel: 1
        }
      }
    ];

    defaults.forEach(c => this.clans.set(c.id, c));
    this.saveClans();
  }

  // --- CLAN ACTIONS ---

  createClan(name, tag, emblem, desc, leaderName) {
    const clanId = 'clan_' + Date.now();
    const newClan = {
      id: clanId,
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      emblem: emblem || '🛡️',
      desc: desc.trim() || 'Новый клан сервера',
      level: 1,
      bank: 0,
      trophies: 100,
      leader: leaderName,
      members: [
        { name: leaderName, role: 'leader', donated: 0 }
      ],
      perks: {
        clickBoostLevel: 0,
        incomeBoostLevel: 0
      }
    };

    this.clans.set(clanId, newClan);
    this.saveClans();
    return newClan;
  }

  joinClan(clanId, playerName) {
    const clan = this.clans.get(clanId);
    if (!clan) return false;

    // Check if already in clan
    if (clan.members.some(m => m.name === playerName)) return true;

    clan.members.push({
      name: playerName,
      role: 'member',
      donated: 0
    });
    this.saveClans();
    return true;
  }

  leaveClan(clanId, playerName) {
    const clan = this.clans.get(clanId);
    if (!clan) return false;

    clan.members = clan.members.filter(m => m.name !== playerName);
    if (clan.members.length === 0) {
      this.clans.delete(clanId);
    } else if (clan.leader === playerName) {
      // Pass leadership to next member
      clan.leader = clan.members[0].name;
      clan.members[0].role = 'leader';
    }
    this.saveClans();
    return true;
  }

  donateToBank(clanId, playerName, amount) {
    const clan = this.clans.get(clanId);
    if (!clan) return false;

    clan.bank += amount;
    const member = clan.members.find(m => m.name === playerName);
    if (member) member.donated += amount;

    // Level up clan if bank threshold reached
    const reqBank = clan.level * 20000;
    if (clan.bank >= reqBank) {
      clan.level++;
      clan.trophies += 250;
    }

    this.saveClans();
    return true;
  }

  upgradePerk(clanId, perkType) {
    const clan = this.clans.get(clanId);
    if (!clan) return false;

    const cost = 10000 * (clan.perks[perkType] + 1);
    if (clan.bank >= cost) {
      clan.bank -= cost;
      clan.perks[perkType]++;
      this.saveClans();
      return true;
    }
    return false;
  }

  getClanBonus(clanId) {
    const clan = this.clans.get(clanId);
    if (!clan) return { clickBonus: 0, incomeBonus: 0, tag: '' };

    return {
      clickBonus: (clan.perks.clickBoostLevel || 0) * 0.15,   // +15% per level
      incomeBonus: (clan.perks.incomeBoostLevel || 0) * 0.15, // +15% per level
      tag: clan.tag,
      name: clan.name,
      emblem: clan.emblem
    };
  }

  getClanByMember(playerName) {
    for (const clan of this.clans.values()) {
      if (clan.members.some(m => m.name === playerName)) {
        return clan;
      }
    }
    return null;
  }

  getAllClans() {
    return Array.from(this.clans.values()).sort((a, b) => b.bank - a.bank);
  }
}
