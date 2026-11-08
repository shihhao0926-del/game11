// 《小魔女的數學魔導書》v3.1 四大種族、五大部位紙娃娃服裝系統、卡牌、裝備、遺物與六大關卡資料定義

// ==========================================
// 🧬 四大種族資料庫（人類、精靈、神族、暗族：不同原始屬性與專屬種族技能）
// ==========================================
const RACES_DB = {
    human: {
        id: 'human',
        name: '人類',
        title: '聖輝魔導族',
        icon: '🌟',
        color: '#38bdf8',
        themeColor: '#38bdf8',
        imagenKey: 'race_human',
        baseHp: 110,
        baseAtk: 11,
        startGold: 120,
        bonusStartMp: 0,
        extraTimeSec: 0,
        goldMultiplier: 1.15,
        skillName: '【聖輝共鳴】',
        skillDesc: '每次打出卡牌並答對時，額外獲得 +6 點魔法護盾；且通關金幣獎勵額外提升 +15%！',
        onCardCorrect: { shield: 6, heal: 0, bonusDmg: 0 }
    },
    elf: {
        id: 'elf',
        name: '精靈',
        title: '森之星靈族',
        icon: '🧚',
        color: '#34d399',
        themeColor: '#34d399',
        imagenKey: 'race_elf',
        baseHp: 100,
        baseAtk: 12,
        startGold: 90,
        bonusStartMp: 0,
        extraTimeSec: 3,
        goldMultiplier: 1.0,
        skillName: '【自然生息】',
        skillDesc: '每次打出卡牌並答對時，自動恢復 +6 點生命值 (HP)；且答題限時自動延長 +3 秒！',
        onCardCorrect: { shield: 0, heal: 6, bonusDmg: 0 }
    },
    divine: {
        id: 'divine',
        name: '神族',
        title: '天界聖翼族',
        icon: '👼',
        color: '#facc15',
        themeColor: '#facc15',
        imagenKey: 'race_divine',
        baseHp: 125,
        baseAtk: 10,
        startGold: 90,
        bonusStartMp: 1,
        extraTimeSec: 0,
        goldMultiplier: 1.0,
        skillName: '【天界恩典】',
        skillDesc: '每次打出卡牌並答對時，獲得 +4 護盾與 +4 HP 恢復；且每場戰鬥第 1 回合額外 +1 點起始 MP！',
        onCardCorrect: { shield: 4, heal: 4, bonusDmg: 0 }
    },
    dark: {
        id: 'dark',
        name: '暗族',
        title: '夜月魔影族',
        icon: '🦇',
        color: '#c084fc',
        themeColor: '#c084fc',
        imagenKey: 'race_dark',
        baseHp: 90,
        baseAtk: 15,
        startGold: 90,
        bonusStartMp: 0,
        extraTimeSec: 0,
        goldMultiplier: 1.0,
        skillName: '【暗月噬魂】',
        skillDesc: '每次打出卡牌並答對時，對敵人額外造成 +8 點暗影真實傷害，並吸取恢復 +3 點生命值 (HP)！',
        onCardCorrect: { shield: 0, heal: 3, bonusDmg: 8 }
    }
};

// ==========================================
// 👗 五大部位服裝造型系統（頭部、衣服、背部、鞋子、手部：即時改變人物與戰鬥中紙娃娃外觀）
// ==========================================
const COSTUME_SLOTS_META = {
    head:   { id: 'head',   name: '頭部', icon: '🎩' },
    outfit: { id: 'outfit', name: '衣服', icon: '👗' },
    back:   { id: 'back',   name: '背部', icon: '🦋' },
    shoes:  { id: 'shoes',  name: '鞋子', icon: '👢' },
    hands:  { id: 'hands',  name: '手部', icon: '🪄' }
};
const COSTUMES_DB = {
    head: [
        {
            id: 'head_none',
            slot: 'head',
            slotName: '🎩 頭部',
            name: '初心星辰髮飾',
            price: 0,
            hpBonus: 0,
            atkBonus: 0,
            icon: '🎀',
            desc: '魔法學院配發的星辰緞帶髮飾（基礎造型）。'
        },
        {
            id: 'head_witch_hat',
            slot: 'head',
            slotName: '🎩 頭部',
            name: '星夜魔導尖帽',
            price: 450,
            hpBonus: 12,
            atkBonus: 2,
            icon: '🎩',
            desc: '經典金星紫絨魔導高帽（最大 HP +12、魔攻 +2）。'
        },
        {
            id: 'head_flower_crown',
            slot: 'head',
            slotName: '🎩 頭部',
            name: '森之精靈花冠',
            price: 850,
            hpBonus: 28,
            atkBonus: 3,
            icon: '🌸',
            desc: '由永生櫻花與翡翠藤蔓編織的精靈花冠（最大 HP +28、魔攻 +3）。'
        },
        {
            id: 'head_valkyrie_helm',
            slot: 'head',
            slotName: '🎩 頭部',
            name: '女武神白金翼冠',
            price: 1400,
            hpBonus: 40,
            atkBonus: 6,
            icon: '👑',
            desc: '鑲嵌紅寶石的白金雙翼戰冠（最大 HP +40、魔攻 +6）。'
        },
        {
            id: 'head_astral_halo',
            slot: 'head',
            slotName: '🎩 頭部',
            name: '天界星神聖冕',
            price: 2200,
            hpBonus: 65,
            atkBonus: 10,
            icon: '✨',
            desc: '懸浮黃金天球星環的至高神冕（最大 HP +65、魔攻 +10）。'
        }
    ],
    outfit: [
        {
            id: 'outfit_apprentice',
            slot: 'outfit',
            slotName: '👗 衣服',
            name: '學院見習制服',
            price: 0,
            hpBonus: 0,
            atkBonus: 0,
            icon: '👚',
            desc: '輕便舒適的星空藍魔法學院制服（基礎造型）。'
        },
        {
            id: 'outfit_emerald_fairy',
            slot: 'outfit',
            slotName: '👗 衣服',
            name: '翡翠花仙輕紗禮服',
            price: 550,
            hpBonus: 25,
            atkBonus: 2,
            icon: '🌿',
            desc: '散發森林芬芳的翠綠櫻粉漸層精靈禮服（最大 HP +25、魔攻 +2）。'
        },
        {
            id: 'outfit_crimson_mage',
            slot: 'outfit',
            slotName: '👗 衣服',
            name: '緋紅烈焰大魔導袍',
            price: 1050,
            hpBonus: 42,
            atkBonus: 5,
            icon: '🔥',
            desc: '繡有金鳳凰火紋的華麗緋紅戰袍（最大 HP +42、魔攻 +5）。'
        },
        {
            id: 'outfit_abyss_night',
            slot: 'outfit',
            slotName: '👗 衣服',
            name: '暗夜月影皇家禮服',
            price: 1650,
            hpBonus: 58,
            atkBonus: 9,
            icon: '🌙',
            desc: '暗族貴族專屬的黑紫星雲哥德禮服（最大 HP +58、魔攻 +9）。'
        },
        {
            id: 'outfit_kaleidoscope',
            slot: 'outfit',
            slotName: '👗 衣服',
            name: '萬花筒極光星神衣',
            price: 2500,
            hpBonus: 90,
            atkBonus: 14,
            icon: '🌈',
            desc: '由彩虹龍晶與極光交織而成的神話聖衣（最大 HP +90、魔攻 +14）。'
        }
    ],
    back: [
        {
            id: 'back_none',
            slot: 'back',
            slotName: '🦋 背部',
            name: '星紋旅行短披風',
            price: 0,
            hpBonus: 0,
            atkBonus: 0,
            icon: '🧣',
            desc: '簡約俐落的見習魔導士小披風（基礎造型）。'
        },
        {
            id: 'back_fairy_wings',
            slot: 'back',
            slotName: '🦋 背部',
            name: '幻彩琉璃蝶翼',
            price: 600,
            hpBonus: 22,
            atkBonus: 3,
            icon: '🦋',
            desc: '半透明閃耀翠藍與粉紫星塵的精靈蝴蝶羽翼（最大 HP +22、魔攻 +3）。'
        },
        {
            id: 'back_gear_wings',
            slot: 'back',
            slotName: '🦋 背部',
            name: '黃金發條星時翼',
            price: 1150,
            hpBonus: 38,
            atkBonus: 6,
            icon: '⚙️',
            desc: '結合精密時鐘齒輪與玫瑰金光翼的機械飛翼（最大 HP +38、魔攻 +6）。'
        },
        {
            id: 'back_demon_wings',
            slot: 'back',
            slotName: '🦋 背部',
            name: '夜月紫晶魔龍翼',
            price: 1700,
            hpBonus: 50,
            atkBonus: 11,
            icon: '🦇',
            desc: '展開暗紫雷光與黑曜石結晶的霸氣魔翼（最大 HP +50、魔攻 +11）。'
        },
        {
            id: 'back_seraph_wings',
            slot: 'back',
            slotName: '🦋 背部',
            name: '六翼熾天使聖光羽',
            price: 2600,
            hpBonus: 85,
            atkBonus: 15,
            icon: '👼',
            desc: '背後浮現神聖光輪與三對璀璨白金聖羽（最大 HP +85、魔攻 +15）。'
        }
    ],
    shoes: [
        {
            id: 'shoes_leather',
            slot: 'shoes',
            slotName: '👢 鞋子',
            name: '學院輕便皮靴',
            price: 0,
            hpBonus: 0,
            atkBonus: 0,
            icon: '👢',
            desc: '耐穿好走的棕色魔導學徒短靴（基礎造型）。'
        },
        {
            id: 'shoes_feather',
            slot: 'shoes',
            slotName: '👢 鞋子',
            name: '疾風白羽長靴',
            price: 400,
            hpBonus: 18,
            atkBonus: 2,
            icon: '🪶',
            desc: '腳踝飾有純白風之羽翼的輕盈長靴（最大 HP +18、魔攻 +2）。'
        },
        {
            id: 'shoes_crystal',
            slot: 'shoes',
            slotName: '👢 鞋子',
            name: '極光琉璃水晶鞋',
            price: 800,
            hpBonus: 35,
            atkBonus: 4,
            icon: '💎',
            desc: '踏出冰藍水波光暈的透明琉璃戰靴（最大 HP +35、魔攻 +4）。'
        },
        {
            id: 'shoes_golden_greaves',
            slot: 'shoes',
            slotName: '👢 鞋子',
            name: '黃金聖殿騎士靴',
            price: 1350,
            hpBonus: 52,
            atkBonus: 6,
            icon: '🛡️',
            desc: '白金與黃金鍛造的華麗女武神戰靴（最大 HP +52、魔攻 +6）。'
        },
        {
            id: 'shoes_galaxy',
            slot: 'shoes',
            slotName: '👢 鞋子',
            name: '踏星銀河神靴',
            price: 2000,
            hpBonus: 75,
            atkBonus: 10,
            icon: '🌌',
            desc: '腳下環繞璀璨星雲光環的神話長靴（最大 HP +75、魔攻 +10）。'
        }
    ],
    hands: [
        {
            id: 'hands_wood_wand',
            slot: 'hands',
            slotName: '🪄 手部',
            name: '初心星木短杖',
            price: 0,
            hpBonus: 0,
            atkBonus: 0,
            icon: '🪄',
            desc: '鑲有小星星水晶的練習木杖（基礎造型）。'
        },
        {
            id: 'hands_crystal_orb',
            slot: 'hands',
            slotName: '🪄 手部',
            name: '蒼藍水靈寶珠',
            price: 500,
            hpBonus: 15,
            atkBonus: 4,
            icon: '🔮',
            desc: '懸浮於掌心的水精靈魔導寶珠與藍寶石護腕（最大 HP +15、魔攻 +4）。'
        },
        {
            id: 'hands_chrono_lance',
            slot: 'hands',
            slotName: '🪄 手部',
            name: '發條星時黃金戟',
            price: 1000,
            hpBonus: 25,
            atkBonus: 8,
            icon: '🔱',
            desc: '轉動羅馬時鐘輪盤的黃金魔導戰戟（最大 HP +25、魔攻 +8）。'
        },
        {
            id: 'hands_abyss_scythe',
            slot: 'hands',
            slotName: '🪄 手部',
            name: '暗月薔薇魔鐮',
            price: 1600,
            hpBonus: 35,
            atkBonus: 13,
            icon: '🌙',
            desc: '綻放黑紫薔薇與新月光刃的魔影巨鐮（最大 HP +35、魔攻 +13）。'
        },
        {
            id: 'hands_genesis_staff',
            slot: 'hands',
            slotName: '🪄 手部',
            name: '創世萬花筒神杖',
            price: 2400,
            hpBonus: 55,
            atkBonus: 20,
            icon: '🌟',
            desc: '展開雙翼彩虹星環的傳說創世魔導神杖（最大 HP +55、魔攻 +20）。'
        }
    ]
};

const DEFAULT_COSTUME = {
    head: 'head_witch_hat',
    outfit: 'outfit_apprentice',
    back: 'back_none',
    shoes: 'shoes_leather',
    hands: 'hands_wood_wand'
};

// ==========================================
// 🃏 卡牌資料庫 (v3.1)
// ==========================================
const CARDS_DB = {
    spark_bolt: {
        id: 'spark_bolt',
        name: '星火魔彈',
        type: 'attack',
        typeName: '🔥 攻擊卡',
        cost: 1,
        baseDmg: 12,
        forceParens: false,
        icon: '🔥',
        desc: '基礎傷害 12（+魔攻）。觸發目前年級與關卡難度的四則／加減運算題。'
    },
    flame_slash: {
        id: 'flame_slash',
        name: '烈焰魔刃',
        type: 'attack',
        typeName: '🔥 攻擊卡',
        cost: 1,
        baseDmg: 15,
        forceParens: false,
        icon: '☄️',
        desc: '基礎傷害 15（+魔攻）。觸發目前年級與關卡難度的四則／加減運算題。'
    },
    chain_fireball: {
        id: 'chain_fireball',
        name: '連珠火球',
        type: 'attack',
        typeName: '🔥 攻擊卡',
        cost: 2,
        baseDmg: 16,
        forceParens: true,
        doubleOnParens: true,
        icon: '🌋',
        desc: '基礎傷害 16，答對進階／括號運算題，基礎傷害翻倍為 32（+魔攻）！'
    },
    thunder_break: {
        id: 'thunder_break',
        name: '雷鳴破擊',
        type: 'break',
        typeName: '⚡ 破甲卡',
        cost: 2,
        baseDmg: 20,
        stun: true,
        icon: '⚡',
        desc: '答對乘除／位值／餘數題，直接歸零敵方護盾與餘數裝甲並暈眩精靈，造成 20（+魔攻）傷害。'
    },
    tri_shield: {
        id: 'tri_shield',
        name: '三角折射盾',
        type: 'defense',
        typeName: '🛡️ 防禦卡',
        cost: 1,
        baseShield: 20,
        reflectDmg: 10,
        atkBuff: 5,
        icon: '📐',
        desc: '答對圖形／角度／面積題，獲得 20 護盾、反彈 10 傷害，並提升下次攻擊 +5 傷害。'
    },
    star_barrier: {
        id: 'star_barrier',
        name: '星芒守護陣',
        type: 'defense',
        typeName: '🛡️ 防禦卡',
        cost: 1,
        baseShield: 24,
        reflectDmg: 6,
        atkBuff: 6,
        icon: '🛡️',
        desc: '答對圖形／幾何題，獲得 24 護盾、反彈 6 傷害，並提升下次攻擊 +6 傷害。'
    },
    starlight_heal: {
        id: 'starlight_heal',
        name: '星光治癒術',
        type: 'heal',
        typeName: '💖 回復卡',
        cost: 1,
        healAmount: 24,
        baseShield: 12,
        gainMp: 0,
        drawExtra: 0,
        icon: '💖',
        desc: '答對目前年級綜合題，立即回復 24 點生命值 (HP)，並獲得 12 點護盾！'
    },
    mana_spring: {
        id: 'mana_spring',
        name: '魔力湧泉陣',
        type: 'heal',
        typeName: '💖 秘法卡',
        cost: 1,
        healAmount: 10,
        baseShield: 8,
        gainMp: 2,
        drawExtra: 1,
        shopPrice: 650,
        icon: '🔮',
        desc: '【商店秘傳】答對後立即獲得 +2 點 MP（淨賺 1 MP 可累積至下回合！）、回復 10 HP 並抽 1 張牌！'
    },
    rainbow_heal: {
        id: 'rainbow_heal',
        name: '彩虹聖光頌',
        type: 'heal',
        typeName: '💖 回復卡',
        cost: 2,
        healAmount: 48,
        baseShield: 22,
        gainMp: 0,
        drawExtra: 0,
        shopPrice: 800,
        icon: '🌈',
        desc: '【商店秘傳】答對綜合題，立即回復 48 點 HP 並展開 22 點彩虹護盾！'
    },
    bracket_meteor: {
        id: 'bracket_meteor',
        name: '括號星隕術',
        type: 'attack',
        typeName: '🔥 攻擊卡',
        cost: 2,
        baseDmg: 24,
        forceParens: true,
        doubleOnParens: true,
        shopPrice: 750,
        icon: '🌠',
        desc: '【商店秘傳】基礎傷害 24，必出進階／括號題，答對時基礎傷害翻倍為 48（+魔攻）！'
    },
    hyper_thunder: {
        id: 'hyper_thunder',
        name: '超導雷神槍',
        type: 'break',
        typeName: '⚡ 破甲卡',
        cost: 1,
        baseDmg: 18,
        stun: true,
        shopPrice: 850,
        icon: '🌩️',
        desc: '【商店秘傳】僅需 1 點魔力的輕量破甲卡！答對直接擊碎護盾並暈眩敵人，造成 18（+魔攻）傷害。'
    },
    prism_aegis: {
        id: 'prism_aegis',
        name: '萬花筒稜鏡盾',
        type: 'defense',
        typeName: '🛡️ 防禦卡',
        cost: 1,
        baseShield: 32,
        reflectDmg: 18,
        atkBuff: 10,
        healOnCorrect: 8,
        shopPrice: 800,
        icon: '💎',
        desc: '【商店秘傳】答對幾何題獲得 32 護盾、反彈 18 傷害、回復 8 HP 並提升下次攻擊 +10！'
    },
    chrono_slash: {
        id: 'chrono_slash',
        name: '時空連擊斬',
        type: 'attack',
        typeName: '🔥 終極攻擊',
        cost: 3,
        baseDmg: 55,
        atkMultiplier: 2,
        forceParens: true,
        shopPrice: 1200,
        icon: '⚔️',
        desc: '【3 MP 終極大招】累積 3 點魔力施放！答對造成 55 + (2倍魔攻) 的毀滅性暴擊傷害！'
    },
    divine_thunder: {
        id: 'divine_thunder',
        name: '天罰神雷破',
        type: 'break',
        typeName: '⚡ 終極破甲',
        cost: 3,
        baseDmg: 60,
        stun: true,
        shopPrice: 1200,
        icon: '⚡',
        desc: '【3 MP 終極大招】直接擊碎敵方所有護盾與餘數裝甲、暈眩敵人 1 回合，並造成 60（+魔攻）雷擊傷害！'
    }
};

const INITIAL_DECK = [
    'spark_bolt',
    'spark_bolt',
    'flame_slash',
    'chain_fireball',
    'thunder_break',
    'thunder_break',
    'tri_shield',
    'star_barrier',
    'starlight_heal'
];

// 裝備清單（v3.1 維持 8~10 倍高難度價格）
const EQUIP_DB = {
    weapons: [
        {
            id: 'wood_wand',
            name: '學徒木杖',
            price: 0,
            atkBonus: 0,
            highlightPriority: false,
            extraTimeSec: 0,
            shieldHealBonus: 0,
            icon: '🪄',
            desc: '魔法學院配發的基礎木杖（攻擊力 +0）。'
        },
        {
            id: 'bopomofo_wand',
            name: '注音啟蒙魔杖',
            price: 550,
            atkBonus: 4,
            highlightPriority: false,
            extraTimeSec: 5,
            shieldHealBonus: 0,
            icon: '🖍️',
            desc: '攻擊力 +4，且每次卡牌答題限時自動延長 +5 秒（適合低年級或需要充裕思考時間）！'
        },
        {
            id: 'order_wand',
            name: '先乘除魔杖',
            price: 900,
            atkBonus: 7,
            highlightPriority: true,
            extraTimeSec: 0,
            shieldHealBonus: 0,
            icon: '🌟',
            desc: '攻擊力 +7，且運算題會自動幫你把「要先算的部分／關鍵提示」標上發光底色！'
        },
        {
            id: 'geometry_wand',
            name: '黃金幾何法杖',
            price: 1400,
            atkBonus: 11,
            highlightPriority: false,
            extraTimeSec: 0,
            shieldHealBonus: 10,
            icon: '📐',
            desc: '攻擊力 +11，且打出🛡️防禦卡與💖回復卡答對時，獲得的護盾與回血量額外 +10！'
        },
        {
            id: 'cosmos_wand',
            name: '六藝星辰聖杖',
            price: 2200,
            atkBonus: 20,
            highlightPriority: true,
            extraTimeSec: 5,
            shieldHealBonus: 12,
            icon: '🌌',
            desc: '【鎮店聖杖】攻擊力 +20，同時具備「步驟發光提示」、「答題時間 +5 秒」與「護盾回血 +12」！'
        }
    ],
    armors: [
        {
            id: 'apprentice_robe',
            name: '見習布袍',
            price: 0,
            hpBonus: 0,
            startShield: 0,
            startReflect: 0,
            bonusStartMp: 0,
            grazeRate: 0.3,
            icon: '👚',
            desc: '輕便的見習魔導長袍（最大 HP +0）。'
        },
        {
            id: 'table_cloak',
            name: '九九乘法斗篷',
            price: 650,
            hpBonus: 25,
            startShield: 8,
            startReflect: 0,
            bonusStartMp: 0,
            grazeRate: 0.5,
            icon: '🍀',
            desc: '最大 HP +25，開場獲得 8 點護盾，且答錯時的擦傷效果從 30% 提升至 50%！'
        },
        {
            id: 'angle_robe',
            name: '星象角度袍',
            price: 900,
            hpBonus: 40,
            startShield: 16,
            startReflect: 0,
            bonusStartMp: 0,
            grazeRate: 0.3,
            icon: '🧥',
            desc: '最大 HP +40，且每場戰鬥開始時自動獲得 16 點魔法護盾！'
        },
        {
            id: 'area_armor',
            name: '黃金面積鎧甲',
            price: 1500,
            hpBonus: 70,
            startShield: 26,
            startReflect: 10,
            bonusStartMp: 0,
            grazeRate: 0.3,
            icon: '🛡️',
            desc: '最大 HP +70，每場戰鬥開始時自動獲得 26 點護盾與 10 點反彈傷害！'
        },
        {
            id: 'archmage_dress',
            name: '時空大魔導禮服',
            price: 2400,
            hpBonus: 110,
            startShield: 35,
            startReflect: 15,
            bonusStartMp: 1,
            grazeRate: 0.5,
            icon: '👑',
            desc: '【傳說防具】最大 HP +110，開場獲得 35 護盾、15 反彈，且每場戰鬥第 1 回合額外多 +1 點起始 MP！'
        }
    ]
};

const RELICS_DB = {
    gold_bracket: {
        id: 'gold_bracket',
        name: '黃金括號徽章',
        dropStage: 3,
        icon: '🏅',
        desc: '【第 3 關 Boss 掉落】回答進階／含括號的運算題時，傷害額外 +12！'
    },
    crystal_protractor: {
        id: 'crystal_protractor',
        name: '水晶量角器',
        dropStage: 5,
        icon: '📐',
        desc: '【第 5 關掉落】打出防禦／幾何卡並答對時，額外回復 8 點生命值！'
    },
    archmage_badge: {
        id: 'archmage_badge',
        name: '大魔導師之證',
        dropStage: 6,
        icon: '👑',
        desc: '【第 6 關通關獎勵】起始與每回合獲得的魔力 +1（每回合 +2 點 MP，且可累積）！'
    }
};

// ==========================================
// 🗺️ 雙區域共 6 關（每關 6 隻少女精靈小怪 + 1 隻守關精靈 Boss = 共 7 波！）
// ==========================================
const STAGES_DB = [
    {
        id: 1,
        region: 1,
        regionName: '區域一：齒輪星時鐘塔',
        name: '第 1 關：鐘塔前哨戰（難度 ★☆☆☆☆☆）',
        mathFocus: '初階魔導試煉：基礎加減／四則入門、基本乘除位值與基礎幾何圖形',
        rewardGold: 90,
        relicDrop: null,
        waves: [
            { name: '露珠數字水精靈', title: '第 1 波精靈', maxHp: 45, atk: 18, startShield: 0, svgType: 'elf_water', color: '#38bdf8', behaviorDesc: '掌管數字露珠的可愛水精靈，善用🔥攻擊卡快速擊退她！' },
            { name: '星光花苞木精靈', title: '第 2 波精靈', maxHp: 50, atk: 19, startShield: 24, svgType: 'elf_flower_dryad', color: '#34d399', behaviorDesc: '帶有 24 點花瓣護盾的自然精靈少女。' },
            { name: '發條星時小妖精', title: '第 3 波精靈', maxHp: 55, atk: 20, startShield: 36, svgType: 'elf_pixie', color: '#f59e0b', behaviorDesc: '巡邏鐘塔外圍的發條妖精少女，帶有 36 點倍數護盾。' },
            { name: '微風音符風精靈', title: '第 4 波精靈', maxHp: 60, atk: 22, startShield: 0, svgType: 'elf_sylph', color: '#a855f7', behaviorDesc: '輕盈詠唱算式之風的精靈少女，攻擊力逐漸提升！' },
            { name: '琉璃水滴精靈使', title: '第 5 波精靈', maxHp: 65, atk: 23, startShield: 48, svgType: 'elf_water', color: '#0ea5e9', behaviorDesc: '帶有 48 點水鏡護盾，累積 2 MP 打出⚡破甲卡可一擊破盾並暈眩她！' },
            { name: '鐘塔銀翼槍妖精', title: '第 6 波精靈', maxHp: 72, atk: 25, startShield: 60, svgType: 'elf_pixie', color: '#fbbf24', behaviorDesc: '守衛Boss房門的精銳發條妖精，擁有 60 點護盾！' },
            { name: '發條女武神・芙蕾雅', title: '第 7 波 守關 Boss', isBoss: true, maxHp: 110, atk: 30, startShield: 84, svgType: 'elf_valkyrie', color: '#ef4444', behaviorDesc: '【第 1 關守關 Boss】身穿白金鎧甲的發條女武神精靈，擁有 84 點厚重護盾與 30 點高攻擊力！' }
        ]
    },
    {
        id: 2,
        region: 1,
        regionName: '區域一：齒輪星時鐘塔',
        name: '第 2 關：星盤齒輪迴廊（難度 ★★☆☆☆☆）',
        mathFocus: '進階兩步驟運算、括號優先概念與倍數護盾突破',
        rewardGold: 130,
        relicDrop: null,
        waves: [
            { name: '括號符文風精靈', title: '第 1 波精靈', maxHp: 68, atk: 24, startShield: 40, svgType: 'elf_sylph', color: '#a855f7', behaviorDesc: '身邊環繞金色括號符文的風精靈，用【連珠火球】對付最有效！' },
            { name: '湧泉結晶水精靈', title: '第 2 波精靈', maxHp: 74, atk: 26, startShield: 56, svgType: 'elf_water', color: '#06b6d4', behaviorDesc: '凝聚 56 點倍數水盾的精靈少女。' },
            { name: '黃金齒輪槍妖精', title: '第 3 波精靈', maxHp: 80, atk: 27, startShield: 72, svgType: 'elf_pixie', color: '#eab308', behaviorDesc: '擁有 72 點發條護盾，善用⚡破甲卡擊碎護盾並暈眩她！' },
            { name: '翠葉旋風木精靈', title: '第 4 波精靈', maxHp: 86, atk: 29, startShield: 0, svgType: 'elf_flower_dryad', color: '#10b981', behaviorDesc: '高血量與高攻速的森林花仙精靈。' },
            { name: '星盤詠唱風精靈', title: '第 5 波精靈', maxHp: 92, atk: 31, startShield: 84, svgType: 'elf_sylph', color: '#8b5cf6', behaviorDesc: '展開 84 點星盤符文護盾的高階風精靈！' },
            { name: '皇家發條羽翼衛', title: '第 6 波精靈', maxHp: 100, atk: 33, startShield: 96, svgType: 'elf_pixie', color: '#f97316', behaviorDesc: '帶有 96 點強化發條護盾與 33 點強勁攻擊！' },
            { name: '雙核星盤戰姬・薇薇安', title: '第 7 波 守關 Boss', isBoss: true, maxHp: 145, atk: 38, startShield: 132, svgType: 'elf_valkyrie', color: '#f97316', behaviorDesc: '【第 2 關守關 Boss】配備雙核心發條羽翼的精靈戰姬，擁有 132 點高能護盾與 38 點猛烈攻擊！' }
        ]
    },
    {
        id: 3,
        region: 1,
        regionName: '區域一：齒輪星時鐘塔',
        name: '第 3 關：時空發條女王（難度 ★★★☆☆☆）',
        mathFocus: '區域一 Boss 決戰：高難度四則括號運算與餘數裝甲破除',
        rewardGold: 190,
        relicDrop: 'gold_bracket',
        waves: [
            { name: '鐘塔星時近衛妖精', title: '第 1 波精靈', maxHp: 95, atk: 32, startShield: 72, svgType: 'elf_pixie', color: '#60a5fa', behaviorDesc: '守護女王王座廳的近衛妖精，帶有 72 點數字護盾。' },
            { name: '深淵碧波水精靈', title: '第 2 波精靈', maxHp: 102, atk: 34, startShield: 84, svgType: 'elf_water', color: '#38bdf8', behaviorDesc: '帶有 84 點深海結晶護盾與 34 點攻擊力。' },
            { name: '天球儀符文風精靈', title: '第 3 波精靈', maxHp: 110, atk: 35, startShield: 96, svgType: 'elf_sylph', color: '#c084fc', behaviorDesc: '操控天球儀進行精密運算的風精靈少女。' },
            { name: '薔薇螺旋花精靈', title: '第 4 波精靈', maxHp: 118, atk: 37, startShield: 108, svgType: 'elf_flower_dryad', color: '#f472b6', behaviorDesc: '帶有 108 點黃金薔薇護盾，記得搭配🛡️防禦卡與💖回復卡維持血量！' },
            { name: '白金女武神侍衛長', title: '第 5 波精靈', maxHp: 126, atk: 39, startShield: 120, svgType: 'elf_valkyrie', color: '#fbbf24', behaviorDesc: '女王麾下的女武神侍衛長，擁有 120 點堅不可摧的護盾！' },
            { name: '時空星盤大導師', title: '第 6 波精靈', maxHp: 135, atk: 41, startShield: 135, svgType: 'elf_sylph', color: '#f43f5e', behaviorDesc: '王座前的最後考驗！擁有 135 HP 與 135 護盾！' },
            { name: '時空發條女王・奧蘿拉', title: '第 7 波 區域一大 Boss', isBoss: true, mechanic: 'remainder_armor', maxHp: 195, atk: 46, startShield: 156, svgType: 'elf_chrono_queen', color: '#eab308', behaviorDesc: '【特殊機制：餘數裝甲】統治齒輪鐘塔的精靈女王！每兩回合開啟「餘數裝甲」（減免 70% 傷害），必須打出⚡破甲卡答對題目才能擊碎裝甲並暈眩她！' }
        ]
    },
    {
        id: 4,
        region: 2,
        regionName: '區域二：極光水晶洞窟',
        name: '第 4 關：極光折射通道（難度 ★★★★☆☆）',
        mathFocus: '進階視覺幾何、角度／周長／面積推算與高攻精靈防禦反擊',
        rewardGold: 240,
        relicDrop: null,
        waves: [
            { name: '稜鏡月蝶夜精靈', title: '第 1 波精靈', maxHp: 120, atk: 38, startShield: 80, svgType: 'elf_butterfly', color: '#c084fc', behaviorDesc: '振翅灑落稜鏡星塵的夜精靈少女，攻擊力高達 38！常出🛡️防禦卡展開護盾反擊！' },
            { name: '極光琉璃水母精靈', title: '第 2 波精靈', maxHp: 128, atk: 40, startShield: 105, svgType: 'elf_jellyfish', color: '#2dd4bf', behaviorDesc: '披著半透明極光水母頭紗的精靈少女，帶有 105 點水晶護盾。' },
            { name: '翡翠花冠木精靈', title: '第 3 波精靈', maxHp: 136, atk: 42, startShield: 120, svgType: 'elf_flower_dryad', color: '#34d399', behaviorDesc: '掌管對稱花瓣與幾何葉脈的森林精靈，帶有 120 點護盾。' },
            { name: '幻彩紫蝶夜精靈', title: '第 4 波精靈', maxHp: 144, atk: 44, startShield: 132, svgType: 'elf_butterfly', color: '#e879f9', behaviorDesc: '高攻速的紫蝶精靈，攻擊力達 44 點！' },
            { name: '深海星光水母姬', title: '第 5 波精靈', maxHp: 152, atk: 46, startShield: 144, svgType: 'elf_jellyfish', color: '#38bdf8', behaviorDesc: '帶有 144 點極光琉璃護盾，善用⚡破甲卡一舉擊潰護盾！' },
            { name: '冰晶稜鏡守護使', title: '第 6 波精靈', maxHp: 164, atk: 48, startShield: 160, svgType: 'elf_crystal_guard', color: '#60a5fa', behaviorDesc: '擁有 160 點冰晶護盾與 48 點高攻擊力的聖晶近衛！' },
            { name: '聖晶守護精靈・瑟蕾絲', title: '第 7 波 守關 Boss', isBoss: true, maxHp: 230, atk: 54, startShield: 192, svgType: 'elf_crystal_guard', color: '#38bdf8', behaviorDesc: '【第 4 關守關 Boss】操控六角冰晶結界的高階精靈少女，擁有 192 點護盾與 54 點強大魔攻！' }
        ]
    },
    {
        id: 5,
        region: 2,
        regionName: '區域二：極光水晶洞窟',
        name: '第 5 關：星光晶體迷陣（難度 ★★★★★☆）',
        mathFocus: '高階幾何圖形性質、複合角度／面積推算與多步驟四則綜合',
        rewardGold: 320,
        relicDrop: 'crystal_protractor',
        waves: [
            { name: '緋紅月蝶夜精靈', title: '第 1 波精靈', maxHp: 150, atk: 45, startShield: 120, svgType: 'elf_butterfly', color: '#f472b6', behaviorDesc: '迷陣入口的幻象月蝶精靈，帶有 120 點護盾與 45 點攻擊。' },
            { name: '黃金比例花仙子', title: '第 2 波精靈', maxHp: 160, atk: 47, startShield: 135, svgType: 'elf_flower_dryad', color: '#4ade80', behaviorDesc: '頭戴黃金螺旋光環的花仙精靈，帶有 135 點護盾。' },
            { name: '星海琉璃水母精靈', title: '第 3 波精靈', maxHp: 170, atk: 49, startShield: 150, svgType: 'elf_jellyfish', color: '#2dd4bf', behaviorDesc: '漂浮於水晶迷陣中的星海水母精靈，帶有 150 點護盾。' },
            { name: '紫晶多面體守護者', title: '第 4 波精靈', maxHp: 180, atk: 51, startShield: 168, svgType: 'elf_crystal_guard', color: '#818cf8', behaviorDesc: '帶有 168 點紫晶幾何護盾與 51 點高攻擊！' },
            { name: '星時女武神幻影', title: '第 5 波精靈', maxHp: 192, atk: 53, startShield: 180, svgType: 'elf_valkyrie', color: '#f59e0b', behaviorDesc: '水晶折射出的女武神精靈幻影，擁有 180 點護盾！' },
            { name: '迷陣祭司侍女長', title: '第 6 波精靈', maxHp: 205, atk: 56, startShield: 200, svgType: 'elf_high_priestess', color: '#d946ef', behaviorDesc: '女神官的貼身侍女長，擁有 205 HP 與 200 護盾！' },
            { name: '迷陣星光女神官・塞壬', title: '第 7 波 守關 Boss', isBoss: true, maxHp: 280, atk: 62, startShield: 240, svgType: 'elf_high_priestess', color: '#e879f9', behaviorDesc: '【第 5 關守關 Boss】手持黃金量角器魔杖的星光女神官！擊敗她可獲得傳說遺物【水晶量角器】！' }
        ]
    },
    {
        id: 6,
        region: 2,
        regionName: '區域二：極光水晶洞窟',
        name: '第 6 關：萬花筒水晶龍姬（難度 ★★★★★★）',
        mathFocus: '全學年最高難度總決戰：打出🛡️防禦卡完美格擋水晶龍姬的廣角吐息！',
        rewardGold: 500,
        relicDrop: 'archmage_badge',
        waves: [
            { name: '龍宮月蝶雙子精靈', title: '第 1 波精靈', maxHp: 185, atk: 52, startShield: 150, svgType: 'elf_butterfly', color: '#fb7185', behaviorDesc: '水晶龍宮的迎賓月蝶精靈，擁有 185 HP 與 150 護盾。' },
            { name: '龍宮極光水母仙子', title: '第 2 波精靈', maxHp: 198, atk: 55, startShield: 175, svgType: 'elf_jellyfish', color: '#2dd4bf', behaviorDesc: '閃耀彩虹極光的水母精靈，攻擊力高達 55 點！' },
            { name: '天界花冠木精靈王女', title: '第 3 波精靈', maxHp: 210, atk: 57, startShield: 195, svgType: 'elf_flower_dryad', color: '#34d399', behaviorDesc: '擁有 210 HP 與 195 護盾的精靈王女。' },
            { name: '皇家聖晶守護騎士', title: '第 4 波精靈', maxHp: 225, atk: 60, startShield: 216, svgType: 'elf_crystal_guard', color: '#38bdf8', behaviorDesc: '守護龍姬聖殿的聖晶精靈騎士，帶有 216 點晶體護盾！' },
            { name: '時空星光大祭司', title: '第 5 波精靈', maxHp: 240, atk: 63, startShield: 240, svgType: 'elf_high_priestess', color: '#c084fc', behaviorDesc: '同時精通時空算式與幾何結界的大祭司精靈！' },
            { name: '破曉發條神聖女武神', title: '第 6 波精靈', maxHp: 255, atk: 66, startShield: 260, svgType: 'elf_valkyrie', color: '#facc15', behaviorDesc: '最終Boss前的最強守門人！擁有 255 HP、260 護盾與 66 點超高攻擊力！' },
            { name: '萬花筒水晶龍姬・蒂亞瑪特', title: '第 7 波 最終大 Boss', isBoss: true, mechanic: 'wide_breath', maxHp: 360, atk: 72, startShield: 300, svgType: 'elf_dragon_princess', color: '#f43f5e', behaviorDesc: '【特殊機制：廣角吐息】展翅閃耀萬花筒極光的水晶龍族精靈公主！蓄力預告吐息時，打出🛡️防禦卡並答對幾何／角度題，即可觸發「完美格擋」免傷並反擊 60 點巨額傷害！' }
        ]
    }
];

// ==========================================
// 🎨 v3.1 紙娃娃服裝造型與 Google Imagen 3.0 精靈立繪合成渲染器
// ==========================================
class AvatarRenderer {
    // 根據玩家當前狀態（種族、性別、五部位服裝）即時渲染紙娃娃角色造型，同步應用於換裝間、頂部狀態與戰鬥畫面！
    static getWitchSVG(customProfile = null) {
        const st = customProfile || (window.gameApp && window.gameApp.state) || {};
        return this.getPlayerPaperDollSVG(st);
    }

    static getRacePortraitUrl(raceId = 'elf') {
        const r = RACES_DB[raceId] || RACES_DB.elf;
        return (window.IMAGEN3_ASSETS && window.IMAGEN3_ASSETS[r.imagenKey])
            || (window.IMAGEN3_ASSETS && window.IMAGEN3_ASSETS.little_witch)
            || 'assets/little_witch.svg';
    }

    static getPlayerPaperDollSVG(profile = {}) {
        const raceId = profile.race || 'elf';
        const gender = profile.gender || 'female';
        const costume = { ...DEFAULT_COSTUME, ...(profile.equippedCostume || {}) };
        const raceObj = RACES_DB[raceId] || RACES_DB.elf;
        const portraitUrl = this.getRacePortraitUrl(raceId);

        // 種族配色與特徵（膚色、髮色、瞳色、耳朵與種族光環）
        const raceStyles = {
            human:  { skin: '#ffe4d6', hair: '#d97706', hairHi: '#fbbf24', eye: '#f59e0b', aura: '#38bdf8' },
            elf:    { skin: '#fff1e6', hair: '#10b981', hairHi: '#a7f3d0', eye: '#059669', aura: '#34d399' },
            divine: { skin: '#fff7ed', hair: '#fde047', hairHi: '#ffffff', eye: '#38bdf8', aura: '#facc15' },
            dark:   { skin: '#f3e8ff', hair: '#9333ea', hairHi: '#e9d5ff', eye: '#e11d48', aura: '#c084fc' }
        };
        const rs = raceStyles[raceId] || raceStyles.elf;

        // 1. 背部 (Back Wings / Cape)
        let backSvg = '';
        if (costume.back === 'back_fairy_wings') {
            backSvg = `
                <g class="pd-layer-back">
                    <path d="M 105 120 C 35 55, 12 105, 55 148 C 25 168, 45 205, 102 162 Z" fill="rgba(52,211,153,0.48)" stroke="#a7f3d0" stroke-width="2.5"/>
                    <path d="M 115 120 C 185 55, 208 105, 165 148 C 195 168, 175 205, 118 162 Z" fill="rgba(244,114,182,0.48)" stroke="#fbcfe8" stroke-width="2.5"/>
                    <circle cx="58" cy="115" r="5" fill="#fef08a"/>
                    <circle cx="162" cy="115" r="5" fill="#fef08a"/>
                </g>`;
        } else if (costume.back === 'back_gear_wings') {
            backSvg = `
                <g class="pd-layer-back">
                    <circle cx="110" cy="130" r="62" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="10 6" opacity="0.85"/>
                    <polygon points="102,125 22,82 38,118 18,142 95,152" fill="#fbbf24" stroke="#fef08a" stroke-width="2"/>
                    <polygon points="118,125 198,82 182,118 202,142 125,152" fill="#fbbf24" stroke="#fef08a" stroke-width="2"/>
                </g>`;
        } else if (costume.back === 'back_demon_wings') {
            backSvg = `
                <g class="pd-layer-back">
                    <path d="M 102 122 L 18 70 L 32 132 L 15 170 L 62 155 L 98 168 Z" fill="#4c1d95" stroke="#c084fc" stroke-width="2.5"/>
                    <path d="M 118 122 L 202 70 L 188 132 L 205 170 L 158 155 L 122 168 Z" fill="#4c1d95" stroke="#c084fc" stroke-width="2.5"/>
                </g>`;
        } else if (costume.back === 'back_seraph_wings') {
            backSvg = `
                <g class="pd-layer-back">
                    <circle cx="110" cy="118" r="68" fill="none" stroke="#fde047" stroke-width="3" opacity="0.8"/>
                    <path d="M 102 110 C 30 45, 10 85, 65 125 C 15 125, 18 160, 75 152 C 32 175, 48 202, 102 168 Z" fill="#fffbeb" stroke="#facc15" stroke-width="2.2"/>
                    <path d="M 118 110 C 190 45, 210 85, 155 125 C 205 125, 202 160, 145 152 C 188 175, 172 202, 118 168 Z" fill="#fffbeb" stroke="#facc15" stroke-width="2.2"/>
                </g>`;
        } else {
            backSvg = `
                <g class="pd-layer-back">
                    <path d="M 82 118 L 58 205 L 162 205 L 138 118 Z" fill="#1e1b4b" stroke="${rs.aura}" stroke-width="2" opacity="0.85"/>
                </g>`;
        }

        // 2. 鞋子 (Shoes / Boots)
        let shoesSvg = '';
        if (costume.shoes === 'shoes_feather') {
            shoesSvg = `
                <g class="pd-layer-shoes">
                    <rect x="86" y="206" width="16" height="34" rx="6" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/>
                    <rect x="118" y="206" width="16" height="34" rx="6" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/>
                    <path d="M 84 218 L 68 208 L 74 226 Z" fill="#fff"/>
                    <path d="M 136 218 L 152 208 L 146 226 Z" fill="#fff"/>
                </g>`;
        } else if (costume.shoes === 'shoes_crystal') {
            shoesSvg = `
                <g class="pd-layer-shoes">
                    <ellipse cx="110" cy="240" rx="48" ry="8" fill="rgba(56,189,248,0.3)" stroke="#38bdf8" stroke-width="1.5"/>
                    <rect x="86" y="206" width="16" height="34" rx="6" fill="#67e8f9" stroke="#fff" stroke-width="2"/>
                    <rect x="118" y="206" width="16" height="34" rx="6" fill="#67e8f9" stroke="#fff" stroke-width="2"/>
                </g>`;
        } else if (costume.shoes === 'shoes_golden_greaves') {
            shoesSvg = `
                <g class="pd-layer-shoes">
                    <rect x="85" y="204" width="18" height="36" rx="5" fill="#eab308" stroke="#fef08a" stroke-width="2.2"/>
                    <rect x="117" y="204" width="18" height="36" rx="5" fill="#eab308" stroke="#fef08a" stroke-width="2.2"/>
                </g>`;
        } else if (costume.shoes === 'shoes_galaxy') {
            shoesSvg = `
                <g class="pd-layer-shoes">
                    <ellipse cx="110" cy="240" rx="56" ry="10" fill="rgba(168,85,247,0.38)" stroke="#fde047" stroke-width="2" stroke-dasharray="6 4"/>
                    <rect x="85" y="204" width="18" height="36" rx="6" fill="#581c87" stroke="#fde047" stroke-width="2"/>
                    <rect x="117" y="204" width="18" height="36" rx="6" fill="#581c87" stroke="#fde047" stroke-width="2"/>
                </g>`;
        } else {
            shoesSvg = `
                <g class="pd-layer-shoes">
                    <rect x="87" y="210" width="15" height="28" rx="5" fill="#78350f" stroke="#fcd34d" stroke-width="1.5"/>
                    <rect x="118" y="210" width="15" height="28" rx="5" fill="#78350f" stroke="#fcd34d" stroke-width="1.5"/>
                </g>`;
        }

        // 3. 衣服 (Outfit / Dress / Tunic)
        const outfitColors = {
            outfit_apprentice:    { main: '#3b82f6', sub: '#1d4ed8', trim: '#fde047' },
            outfit_emerald_fairy: { main: '#10b981', sub: '#ec4899', trim: '#fef08a' },
            outfit_crimson_mage:  { main: '#e11d48', sub: '#9f1239', trim: '#fbbf24' },
            outfit_abyss_night:   { main: '#4c1d95', sub: '#0f172a', trim: '#c084fc' },
            outfit_kaleidoscope:  { main: '#ec4899', sub: '#38bdf8', trim: '#fde047' }
        };
        const oc = outfitColors[costume.outfit] || outfitColors.outfit_apprentice;
        const outfitSvg = gender === 'male'
            ? `<g class="pd-layer-outfit">
                <!-- 少年魔導禮服與長褲 -->
                <rect x="88" y="176" width="16" height="36" rx="4" fill="${oc.sub}" stroke="${oc.trim}" stroke-width="1.5"/>
                <rect x="116" y="176" width="16" height="36" rx="4" fill="${oc.sub}" stroke="${oc.trim}" stroke-width="1.5"/>
                <polygon points="82,118 138,118 148,186 72,186" fill="${oc.main}" stroke="${oc.trim}" stroke-width="2.5"/>
                <line x1="110" y1="118" x2="110" y2="186" stroke="${oc.trim}" stroke-width="2.5"/>
                <circle cx="110" cy="134" r="6" fill="${oc.trim}"/>
               </g>`
            : `<g class="pd-layer-outfit">
                <!-- 少女魔導蓬蓬禮服裙 -->
                <path d="M 84 118 L 136 118 L 160 206 Q 110 218 60 206 Z" fill="${oc.main}" stroke="${oc.trim}" stroke-width="2.5"/>
                <path d="M 92 120 L 128 120 L 140 204 Q 110 212 80 204 Z" fill="${oc.sub}" opacity="0.65"/>
                <polygon points="110,126 120,136 110,146 100,136" fill="${oc.trim}"/>
               </g>`;

        // 4. 臉部、耳朵與種族髮型
        const earsSvg = (raceId === 'elf' || raceId === 'dark')
            ? `<polygon points="75,82 50,72 74,95" fill="${rs.skin}" stroke="#d97706" stroke-width="1.5"/>
               <polygon points="145,82 170,72 146,95" fill="${rs.skin}" stroke="#d97706" stroke-width="1.5"/>`
            : '';
        const raceHornsOrHalo = raceId === 'dark'
            ? `<path d="M 88 55 Q 72 32 84 26 Q 90 42 96 52" fill="#3b0764" stroke="#c084fc" stroke-width="2"/>
               <path d="M 132 55 Q 148 32 136 26 Q 130 42 124 52" fill="#3b0764" stroke="#c084fc" stroke-width="2"/>`
            : raceId === 'divine'
            ? `<ellipse cx="110" cy="36" rx="28" ry="6" fill="none" stroke="#fde047" stroke-width="3.5"/>`
            : '';

        const hairBackSvg = gender === 'female'
            ? `<path d="M 74 72 Q 46 115 58 175 Q 72 165 78 125 Z" fill="${rs.hair}" stroke="${rs.hairHi}" stroke-width="1.5"/>
               <path d="M 146 72 Q 174 115 162 175 Q 148 165 142 125 Z" fill="${rs.hair}" stroke="${rs.hairHi}" stroke-width="1.5"/>`
            : '';

        const headBaseSvg = `
            <g class="pd-layer-body">
                ${hairBackSvg}
                ${earsSvg}
                <circle cx="110" cy="82" r="32" fill="${rs.skin}" stroke="#f59e0b" stroke-width="1.5"/>
                <!-- 髮瀏海 -->
                <path d="M 76 78 C 76 44, 144 44, 144 78 C 132 62, 120 72, 110 60 C 100 72, 88 62, 76 78 Z" fill="${rs.hair}" stroke="${rs.hairHi}" stroke-width="1.5"/>
                <!-- 眼睛與微笑 -->
                <ellipse cx="97" cy="85" rx="5.5" ry="6.5" fill="${rs.eye}"/>
                <ellipse cx="123" cy="85" rx="5.5" ry="6.5" fill="${rs.eye}"/>
                <circle cx="95" cy="83" r="2" fill="#fff"/>
                <circle cx="121" cy="83" r="2" fill="#fff"/>
                <path d="M 103 99 Q 110 105 117 99" fill="none" stroke="#e11d48" stroke-width="2.2" stroke-linecap="round"/>
                ${raceHornsOrHalo}
            </g>`;

        // 5. 頭部服裝 (Headgear)
        let headgearSvg = '';
        if (costume.head === 'head_witch_hat') {
            headgearSvg = `
                <g class="pd-layer-head">
                    <ellipse cx="110" cy="54" rx="52" ry="11" fill="#3b0764" stroke="#fde047" stroke-width="2.2"/>
                    <polygon points="78,52 112,6 132,16 142,52" fill="#4c1d95" stroke="#fde047" stroke-width="2.2"/>
                    <circle cx="116" cy="36" r="5" fill="#fde047"/>
                </g>`;
        } else if (costume.head === 'head_flower_crown') {
            headgearSvg = `
                <g class="pd-layer-head">
                    <path d="M 78 56 Q 110 42 142 56" fill="none" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
                    <circle cx="90" cy="52" r="7" fill="#f472b6" stroke="#fff" stroke-width="1.5"/>
                    <circle cx="110" cy="48" r="8" fill="#fbbf24" stroke="#fff" stroke-width="1.5"/>
                    <circle cx="130" cy="52" r="7" fill="#f472b6" stroke="#fff" stroke-width="1.5"/>
                </g>`;
        } else if (costume.head === 'head_valkyrie_helm') {
            headgearSvg = `
                <g class="pd-layer-head">
                    <polygon points="82,56 110,32 138,56" fill="#f8fafc" stroke="#eab308" stroke-width="2.5"/>
                    <polygon points="82,54 56,28 68,58" fill="#fef08a" stroke="#eab308" stroke-width="2"/>
                    <polygon points="138,54 164,28 152,58" fill="#fef08a" stroke="#eab308" stroke-width="2"/>
                    <circle cx="110" cy="48" r="5" fill="#e11d48"/>
                </g>`;
        } else if (costume.head === 'head_astral_halo') {
            headgearSvg = `
                <g class="pd-layer-head">
                    <ellipse cx="110" cy="24" rx="42" ry="9" fill="none" stroke="#fde047" stroke-width="3" stroke-dasharray="8 4"/>
                    <polygon points="86,54 96,34 110,46 124,34 134,54" fill="#fde047" stroke="#fff" stroke-width="2"/>
                    <circle cx="110" cy="32" r="5" fill="#38bdf8"/>
                </g>`;
        } else {
            headgearSvg = `
                <g class="pd-layer-head">
                    <circle cx="84" cy="58" r="6" fill="#fde047" stroke="#fff" stroke-width="1.5"/>
                </g>`;
        }

        // 6. 手部服裝與武器 (Hands / Held Item)
        let handsSvg = '';
        if (costume.hands === 'hands_crystal_orb') {
            handsSvg = `
                <g class="pd-layer-hands">
                    <circle cx="174" cy="132" r="18" fill="rgba(56,189,248,0.65)" stroke="#bae6fd" stroke-width="2.5"/>
                    <circle cx="170" cy="127" r="6" fill="#fff"/>
                </g>`;
        } else if (costume.hands === 'hands_chrono_lance') {
            handsSvg = `
                <g class="pd-layer-hands">
                    <line x1="168" y1="228" x2="182" y2="52" stroke="#eab308" stroke-width="5" stroke-linecap="round"/>
                    <circle cx="180" cy="78" r="14" fill="none" stroke="#fde047" stroke-width="3"/>
                    <polygon points="182,22 168,68 194,68" fill="#38bdf8" stroke="#fff" stroke-width="2"/>
                </g>`;
        } else if (costume.hands === 'hands_abyss_scythe') {
            handsSvg = `
                <g class="pd-layer-hands">
                    <line x1="168" y1="228" x2="178" y2="48" stroke="#581c87" stroke-width="5" stroke-linecap="round"/>
                    <path d="M 178 52 C 135 28, 118 58, 145 86 C 145 66, 162 58, 178 64 Z" fill="#c084fc" stroke="#fff" stroke-width="2"/>
                </g>`;
        } else if (costume.hands === 'hands_genesis_staff') {
            handsSvg = `
                <g class="pd-layer-hands">
                    <line x1="168" y1="228" x2="180" y2="48" stroke="#fde047" stroke-width="5.5" stroke-linecap="round"/>
                    <circle cx="180" cy="54" r="18" fill="rgba(244,114,182,0.35)" stroke="#fde047" stroke-width="2.5"/>
                    <polygon points="180,30 192,54 180,78 168,54" fill="#38bdf8" stroke="#fff" stroke-width="2"/>
                </g>`;
        } else {
            handsSvg = `
                <g class="pd-layer-hands">
                    <line x1="160" y1="185" x2="184" y2="92" stroke="#b45309" stroke-width="4.5" stroke-linecap="round"/>
                    <circle cx="184" cy="90" r="9" fill="#fde047" stroke="#fff" stroke-width="2"/>
                </g>`;
        }

        return `
        <div class="paperdoll-stage" title="${raceObj.name}・${gender === 'male' ? '少年' : '少女'}紙娃娃造型">
            <img src="${portraitUrl}" class="paperdoll-bg-portrait" alt="${raceObj.name}" />
            <svg viewBox="0 0 220 250" class="character-svg paperdoll-svg">
                ${backSvg}
                ${shoesSvg}
                ${outfitSvg}
                ${headBaseSvg}
                ${headgearSvg}
                ${handsSvg}
            </svg>
        </div>`;
    }

    static getEnemySVG(type, color = '#38bdf8') {
        const keyMap = {
            slime: 'elf_water',
            soldier: 'elf_pixie',
            gear: 'elf_sylph',
            knight: 'elf_valkyrie',
            colossus: 'elf_chrono_queen',
            bat: 'elf_butterfly',
            jelly: 'elf_jellyfish',
            golem: 'elf_crystal_guard',
            flora: 'elf_flower_dryad',
            muse: 'elf_high_priestess',
            dragon: 'elf_dragon_princess',
            elf_water: 'elf_water',
            elf_pixie: 'elf_pixie',
            elf_sylph: 'elf_sylph',
            elf_valkyrie: 'elf_valkyrie',
            elf_chrono_queen: 'elf_chrono_queen',
            elf_butterfly: 'elf_butterfly',
            elf_jellyfish: 'elf_jellyfish',
            elf_crystal_guard: 'elf_crystal_guard',
            elf_flower_dryad: 'elf_flower_dryad',
            elf_high_priestess: 'elf_high_priestess',
            elf_dragon_princess: 'elf_dragon_princess'
        };

        const assetKey = keyMap[type] || 'elf_water';
        const imgUrl = (window.IMAGEN3_ASSETS && window.IMAGEN3_ASSETS[assetKey])
            || (window.SpriteSheetManager && SpriteSheetManager.getImagenUrl(assetKey));

        if (imgUrl) {
            return `
            <div class="elf-avatar-wrapper" style="--elf-glow:${color};">
                <img src="${imgUrl}" alt="${assetKey}" class="character-svg witch-img-avatar elf-enemy-avatar" style="border-color:${color};box-shadow:0 0 18px ${color}88;" />
            </div>`;
        }

        return `
        <svg viewBox="0 0 140 140" class="character-svg">
            <circle cx="70" cy="70" r="52" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-width="3"/>
            <text x="70" y="76" fill="#fff" font-size="16" font-weight="bold" text-anchor="middle">✨精靈</text>
        </svg>`;
    }
}

window.RACES_DB = RACES_DB;
window.COSTUME_SLOTS_META = COSTUME_SLOTS_META;
window.COSTUMES_DB = COSTUMES_DB;
window.DEFAULT_COSTUME = DEFAULT_COSTUME;
window.CARDS_DB = CARDS_DB;
window.INITIAL_DECK = INITIAL_DECK;
window.EQUIP_DB = EQUIP_DB;
window.RELICS_DB = RELICS_DB;
window.STAGES_DB = STAGES_DB;
window.AvatarRenderer = AvatarRenderer;
