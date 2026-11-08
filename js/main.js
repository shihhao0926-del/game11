// 《小魔女的數學魔導書》v3.1 主程式邏輯（四大種族創角系統、種族天賦技能、本機多角色紀錄檔管理、重新開始功能、五部位紙娃娃服裝系統與戰鬥同步造型）

const SAVE_KEY = 'little_witch_math_grimoire_v1';
const SAVE_SLOTS_KEY = 'little_witch_math_grimoire_v3_slots';
const ACTIVE_CHAR_KEY = 'little_witch_active_char_v3';

class GameApp {
    constructor() {
        this.saveSlots = {};
        this.needsInitialCreation = false;
        this.activeWardrobeSlot = 'all';
        this.state = this.getDefaultState();
        this.loadGame();

        // 戰鬥暫存狀態
        this.battle = null;
        // 當前微題目狀態與計時器
        this.activeQuestion = null;
        this.questionTimer = null;
        // 冥想室計時器
        this.meditationTimer = null;

        this.initUI();
        this.renderHeader();
        this.switchTab('portal');

        // 若首次進入 v3.1 尚未建立人物紀錄，自動開啟「創角與人物紀錄檔視窗」
        if (this.needsInitialCreation) {
            setTimeout(() => {
                this.openCharacterAndSaveModal(true);
            }, 180);
        }
    }

    formatNowTimestamp() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    getDefaultState(customInit = {}) {
        const raceId = (customInit.race && RACES_DB[customInit.race]) ? customInit.race : 'elf';
        const raceObj = RACES_DB[raceId];
        const gender = customInit.gender === 'male' ? 'male' : 'female';
        const charName = (customInit.charName || '').trim() || (gender === 'male' ? '星辰里昂' : '星辰露娜');
        const charId = customInit.charId || (`char_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
        const nowStr = this.formatNowTimestamp();

        return {
            charId,
            charName,
            gender, // 'female' (少女) | 'male' (少年)
            race: raceId, // 'human' | 'elf' | 'divine' | 'dark'
            createdAt: customInit.createdAt || nowStr,
            lastSavedAt: nowStr,
            selectedGrade: customInit.selectedGrade || 4, // 1~6 年級自由選擇（小一為注音題目）
            baseHp: raceObj.baseHp,
            baseAtk: raceObj.baseAtk,
            baseMp: 1, // MP 開始點數為 1 點，沒用完可累積到下回合
            gold: raceObj.startGold,
            equippedWeapon: 'wood_wand',
            equippedArmor: 'apprentice_robe',
            ownedEquipment: ['wood_wand', 'apprentice_robe'],
            equippedCostume: { ...DEFAULT_COSTUME },
            ownedCostumes: [
                'head_none',
                'head_witch_hat',
                'outfit_apprentice',
                'back_none',
                'shoes_leather',
                'hands_wood_wand'
            ],
            relics: [], // ['gold_bracket', 'crystal_protractor', 'archmage_badge']
            deck: [...INITIAL_DECK],
            clearedStages: [],
            preferChoiceMode: false,
            questionTimeLimit: 20, // 答題時間限制：可調整 10, 20, 30 秒 或 0(不限時)
            stats: {
                attackCorrect: 0,
                attackTotal: 0,
                breakCorrect: 0,
                breakTotal: 0,
                defenseCorrect: 0,
                defenseTotal: 0
            }
        };
    }

    normalizeCharacterState(parsed) {
        const base = this.getDefaultState({
            charId: parsed.charId,
            charName: parsed.charName,
            gender: parsed.gender,
            race: parsed.race,
            createdAt: parsed.createdAt
        });
        const mergedDeck = Array.isArray(parsed.deck) && parsed.deck.length > 0 ? parsed.deck : [...INITIAL_DECK];
        if (!mergedDeck.includes('starlight_heal')) {
            mergedDeck.push('starlight_heal');
        }
        const mergedOwnedCostumes = Array.from(new Set([
            ...base.ownedCostumes,
            ...(Array.isArray(parsed.ownedCostumes) ? parsed.ownedCostumes : [])
        ]));

        return {
            ...base,
            ...parsed,
            race: RACES_DB[parsed.race] ? parsed.race : base.race,
            gender: parsed.gender === 'male' ? 'male' : 'female',
            charName: (parsed.charName || '').trim() || base.charName,
            baseMp: 1,
            selectedGrade: [1, 2, 3, 4, 5, 6].includes(parsed.selectedGrade) ? parsed.selectedGrade : 4,
            questionTimeLimit: [0, 10, 20, 30].includes(parsed.questionTimeLimit) ? parsed.questionTimeLimit : 20,
            deck: mergedDeck,
            equippedCostume: {
                ...DEFAULT_COSTUME,
                ...(parsed.equippedCostume || {})
            },
            ownedCostumes: mergedOwnedCostumes,
            stats: { ...base.stats, ...(parsed.stats || {}) }
        };
    }

    saveGame() {
        try {
            this.state.lastSavedAt = this.formatNowTimestamp();
            if (!this.state.charId) {
                this.state.charId = `char_${Date.now()}`;
            }
            this.saveSlots[this.state.charId] = JSON.parse(JSON.stringify(this.state));
            localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(this.saveSlots));
            localStorage.setItem(ACTIVE_CHAR_KEY, this.state.charId);
            // 同步寫入舊版相容 Key
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn('無法儲存進度至 localStorage', e);
        }
    }

    loadGame() {
        try {
            const rawSlots = localStorage.getItem(SAVE_SLOTS_KEY);
            const activeId = localStorage.getItem(ACTIVE_CHAR_KEY);
            if (rawSlots) {
                const parsedSlots = JSON.parse(rawSlots);
                if (parsedSlots && typeof parsedSlots === 'object' && Object.keys(parsedSlots).length > 0) {
                    this.saveSlots = {};
                    Object.keys(parsedSlots).forEach(cid => {
                        this.saveSlots[cid] = this.normalizeCharacterState(parsedSlots[cid]);
                    });
                    const targetId = (activeId && this.saveSlots[activeId]) ? activeId : Object.keys(this.saveSlots)[0];
                    this.state = JSON.parse(JSON.stringify(this.saveSlots[targetId]));
                    return;
                }
            }

            // 若無 v3.1 角色紀錄檔，檢查是否有舊版存檔並標記需要開啟創角視窗
            const legacyRaw = localStorage.getItem(SAVE_KEY);
            if (legacyRaw) {
                const legacyParsed = JSON.parse(legacyRaw);
                this.state = this.normalizeCharacterState({
                    ...legacyParsed,
                    charId: 'char_legacy_1',
                    charName: legacyParsed.charName || '星辰露娜',
                    gender: legacyParsed.gender || 'female',
                    race: legacyParsed.race || 'elf'
                });
                this.saveGame();
                if (!legacyParsed.charId) {
                    this.needsInitialCreation = true;
                }
            } else {
                this.state = this.getDefaultState();
                this.needsInitialCreation = true;
            }
        } catch (e) {
            console.warn('讀取存檔失敗，使用預設存檔', e);
            this.state = this.getDefaultState();
            this.needsInitialCreation = true;
        }
    }

    // 計算包含種族、裝備、紙娃娃服裝與遺物的最終屬性
    getComputedStats() {
        const raceObj = RACES_DB[this.state.race] || RACES_DB.elf;
        const weapon = EQUIP_DB.weapons.find(w => w.id === this.state.equippedWeapon) || EQUIP_DB.weapons[0];
        const armor = EQUIP_DB.armors.find(a => a.id === this.state.equippedArmor) || EQUIP_DB.armors[0];
        const hasArchmage = this.state.relics.includes('archmage_badge');
        const mpPerTurn = 1 + (hasArchmage ? 1 : 0);

        // 統計 5 大部位服裝的屬性加成
        let costumeHpBonus = 0;
        let costumeAtkBonus = 0;
        const eqCostume = this.state.equippedCostume || DEFAULT_COSTUME;
        const slotsMeta = window.COSTUME_SLOTS_META || {
            head:   { id: 'head',   name: '頭部', icon: '🎩' },
            outfit: { id: 'outfit', name: '衣服', icon: '👗' },
            back:   { id: 'back',   name: '背部', icon: '🦋' },
            shoes:  { id: 'shoes',  name: '鞋子', icon: '👢' },
            hands:  { id: 'hands',  name: '手部', icon: '🪄' }
        };
        Object.keys(slotsMeta).forEach(slotKey => {
            const itemId = eqCostume[slotKey];
            const slotList = COSTUMES_DB[slotKey] || [];
            const itemObj = slotList.find(it => it.id === itemId);
            if (itemObj) {
                costumeHpBonus += (itemObj.hpBonus || 0);
                costumeAtkBonus += (itemObj.atkBonus || 0);
            }
        });

        return {
            maxHp: this.state.baseHp + armor.hpBonus + costumeHpBonus,
            atk: this.state.baseAtk + weapon.atkBonus + costumeAtkBonus,
            mpPerTurn,
            bonusStartMp: (armor.bonusStartMp || 0) + (raceObj.bonusStartMp || 0),
            startShield: armor.startShield || 0,
            startReflect: armor.startReflect || 0,
            grazeRate: armor.grazeRate || 0.3,
            highlightPriority: !!weapon.highlightPriority,
            extraTimeSec: (weapon.extraTimeSec || 0) + (raceObj.extraTimeSec || 0),
            shieldHealBonus: weapon.shieldHealBonus || 0,
            costumeHpBonus,
            costumeAtkBonus,
            raceObj,
            weapon,
            armor
        };
    }

    initUI() {
        // 頂部導覽與功能按鈕
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                soundFX.playClick();
                this.switchTab(btn.dataset.tab);
            });
        });

        // 頂部年級切換按鈕 (小一 ～ 小六)
        document.querySelectorAll('#hdr-grade-btns .grade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const g = parseInt(btn.dataset.grade, 10);
                this.setGrade(g);
            });
        });

        document.getElementById('btn-mute').addEventListener('click', (e) => {
            const muted = soundFX.toggleMute();
            e.currentTarget.textContent = muted ? '🔇 音效：關' : '🔊 音效：開';
        });

        const timeBtn = document.getElementById('btn-time-limit');
        if (timeBtn) {
            timeBtn.addEventListener('click', () => {
                const order = [10, 20, 30, 0]; // 0 代表「不限時間」
                const curIdx = order.indexOf(this.state.questionTimeLimit);
                const nextIdx = (curIdx === -1 ? 1 : curIdx + 1) % order.length;
                this.state.questionTimeLimit = order[nextIdx];
                this.saveGame();
                this.updateTimeLimitButtonText();
                soundFX.playClick();
            });
        }

        document.getElementById('btn-input-mode').addEventListener('click', (e) => {
            this.state.preferChoiceMode = !this.state.preferChoiceMode;
            this.saveGame();
            this.updateModeButtonText();
            soundFX.playClick();
        });

        document.getElementById('btn-teacher-mode').addEventListener('click', () => {
            soundFX.playClick();
            this.openTeacherModal();
        });

        const vfxGalleryBtn = document.getElementById('btn-vfx-gallery');
        if (vfxGalleryBtn) {
            vfxGalleryBtn.addEventListener('click', () => {
                soundFX.playClick();
                this.openVfxGalleryModal();
            });
        }

        const saveMgrBtn = document.getElementById('btn-save-manager');
        if (saveMgrBtn) {
            saveMgrBtn.addEventListener('click', () => {
                soundFX.playClick();
                this.openCharacterAndSaveModal(false);
            });
        }

        const quickRestartBtn = document.getElementById('btn-quick-restart');
        if (quickRestartBtn) {
            quickRestartBtn.addEventListener('click', () => {
                soundFX.playClick();
                this.promptQuickRestart();
            });
        }

        const charIdentityEl = document.getElementById('hdr-char-identity');
        if (charIdentityEl) {
            charIdentityEl.style.cursor = 'pointer';
            charIdentityEl.title = '點擊切換／創立角色或管理紀錄檔';
            charIdentityEl.addEventListener('click', () => {
                soundFX.playClick();
                this.openCharacterAndSaveModal(false);
            });
        }

        // 📱 手機／平板觸控音效自動解鎖（首次觸控螢幕時啟動 Web Audio）
        const unlockAudioOnce = () => {
            if (window.soundFX) soundFX.init();
            window.removeEventListener('touchstart', unlockAudioOnce);
            window.removeEventListener('pointerdown', unlockAudioOnce);
        };
        window.addEventListener('touchstart', unlockAudioOnce, { passive: true });
        window.addEventListener('pointerdown', unlockAudioOnce, { passive: true });

        // ⛶ 全螢幕與橫向鎖定按鈕（手機／平板／電腦皆適用）
        const fsBtn = document.getElementById('btn-fullscreen');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                soundFX.playClick();
                this.toggleFullscreenLandscape();
            });
        }
        const overlayFsBtn = document.getElementById('btn-overlay-fullscreen');
        if (overlayFsBtn) {
            overlayFsBtn.addEventListener('click', () => {
                soundFX.playClick();
                this.toggleFullscreenLandscape();
                const ov = document.getElementById('portrait-rotate-overlay');
                if (ov) ov.classList.add('dismissed');
            });
        }
        const overlayDismissBtn = document.getElementById('btn-overlay-dismiss');
        if (overlayDismissBtn) {
            overlayDismissBtn.addEventListener('click', () => {
                soundFX.playClick();
                const ov = document.getElementById('portrait-rotate-overlay');
                if (ov) ov.classList.add('dismissed');
            });
        }
        document.addEventListener('fullscreenchange', () => this.updateFullscreenBtnText());

        // 🔼 收合／展開頂部次要工具列（讓手機橫向視野最大化）
        const toggleHdrBtn = document.getElementById('btn-toggle-header');
        const expandHdrMiniBtn = document.getElementById('btn-expand-header-mini');
        if (toggleHdrBtn) {
            toggleHdrBtn.addEventListener('click', () => {
                soundFX.playClick();
                this.toggleCompactHeader();
            });
        }
        if (expandHdrMiniBtn) {
            expandHdrMiniBtn.addEventListener('click', () => {
                soundFX.playClick();
                this.toggleCompactHeader();
            });
        }

        // ⌨️ 支援平板實體鍵盤／電腦鍵盤快速作答（0~9、Backspace退格、Enter確認、Esc取消）
        window.addEventListener('keydown', (e) => {
            if (!this.activeQuestion) return;
            const modal = document.getElementById('question-modal');
            if (!modal || modal.classList.contains('hidden')) return;
            const aq = this.activeQuestion;
            const q = aq.question;

            if (e.key === 'Escape') {
                const cancelBtn = document.getElementById('btn-cancel-cast');
                if (cancelBtn) cancelBtn.click();
                return;
            }

            if (aq.currentMode === 'choice') {
                if (['1', '2', '3'].includes(e.key)) {
                    const idx = parseInt(e.key, 10) - 1;
                    if (q.options && q.options[idx]) {
                        e.preventDefault();
                        this.submitAnswer(q.options[idx].value);
                    }
                }
            } else {
                const screenEl = document.getElementById('numpad-screen');
                if (!screenEl) return;
                if (/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    if (aq.typedValue.length < 5) {
                        aq.typedValue += e.key;
                        screenEl.textContent = aq.typedValue;
                        soundFX.playClick();
                    }
                } else if (e.key === 'Backspace') {
                    e.preventDefault();
                    aq.typedValue = aq.typedValue.slice(0, -1);
                    screenEl.textContent = aq.typedValue || (q.isBopomofo ? 'ㄑㄧㄥˇ ㄢˋ ㄕㄨˋ ㄗˋ...' : '請輸入答案...');
                    soundFX.playClick();
                } else if (e.key === 'Delete' || e.key === 'c' || e.key === 'C') {
                    e.preventDefault();
                    aq.typedValue = '';
                    screenEl.textContent = q.isBopomofo ? 'ㄑㄧㄥˇ ㄢˋ ㄕㄨˋ ㄗˋ...' : '請輸入答案...';
                    soundFX.playClick();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (aq.typedValue !== '') {
                        this.submitAnswer(Number(aq.typedValue));
                    }
                }
            }
        });

        this.updateModeButtonText();
        this.updateTimeLimitButtonText();
        this.updateGradeButtonsUI();
        this.updateHeaderToggleBtnUI();
    }

    async toggleFullscreenLandscape() {
        try {
            const docEl = document.documentElement;
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (docEl.requestFullscreen) {
                    await docEl.requestFullscreen();
                } else if (docEl.webkitRequestFullscreen) {
                    docEl.webkitRequestFullscreen();
                }
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {});
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        } catch (err) {
            console.warn('全螢幕切換提示：', err);
        }
        this.updateFullscreenBtnText();
    }

    updateFullscreenBtnText() {
        const fsBtn = document.getElementById('btn-fullscreen');
        if (!fsBtn) return;
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        fsBtn.textContent = isFs ? '🗗 退出全螢幕' : '⛶ 全螢幕橫向';
    }

    toggleCompactHeader(forceState = null) {
        const isCollapsed = forceState !== null
            ? forceState
            : !document.body.classList.contains('header-collapsed');
        document.body.classList.toggle('header-collapsed', isCollapsed);
        this.updateHeaderToggleBtnUI();
    }

    updateHeaderToggleBtnUI() {
        const isCollapsed = document.body.classList.contains('header-collapsed');
        const toggleHdrBtn = document.getElementById('btn-toggle-header');
        const expandHdrMiniBtn = document.getElementById('btn-expand-header-mini');
        if (toggleHdrBtn) {
            toggleHdrBtn.textContent = isCollapsed ? '🔽 展開頂欄' : '🔼 精簡頂欄';
        }
        if (expandHdrMiniBtn) {
            expandHdrMiniBtn.textContent = isCollapsed ? '⚙️ 展開工具列 ▾' : '⚙️ 收合工具列 ▴';
        }
    }

    setGrade(grade) {
        this.state.selectedGrade = grade;
        this.saveGame();
        soundFX.playCardSelect();
        this.updateGradeButtonsUI();
        this.renderHeader();

        // 重新渲染目前所在分頁或戰鬥頂部資訊
        const activePanel = document.querySelector('.academy-panel.active');
        if (activePanel) {
            const tabId = activePanel.id.replace('panel-', '');
            this.switchTab(tabId);
        }
        if (this.battle) {
            this.renderBattle();
        }
    }

    updateGradeButtonsUI() {
        document.querySelectorAll('#hdr-grade-btns .grade-btn').forEach(btn => {
            const g = parseInt(btn.dataset.grade, 10);
            btn.classList.toggle('active', g === this.state.selectedGrade);
        });
    }

    updateTimeLimitButtonText() {
        const btn = document.getElementById('btn-time-limit');
        const st = this.getComputedStats();
        if (btn) {
            if (this.state.questionTimeLimit === 0) {
                btn.textContent = `⏱️ 答題限時：∞ 不限時間`;
            } else {
                const extra = st.extraTimeSec > 0 ? ` (+${st.extraTimeSec}秒魔杖/種族)` : '';
                btn.textContent = `⏱️ 答題限時：${this.state.questionTimeLimit}秒${extra}`;
            }
        }
    }

    updateModeButtonText() {
        const btn = document.getElementById('btn-input-mode');
        if (btn) {
            btn.textContent = this.state.preferChoiceMode ? '🎯 作答：輕鬆 3 選 1' : '🔢 作答：數字填空 + 選擇';
        }
    }

    // 渲染上方主角狀態列
    renderHeader() {
        const st = this.getComputedStats();
        const rObj = st.raceObj;
        const brandAvatar = document.querySelector('.brand-witch-avatar');
        const raceUrl = AvatarRenderer.getRacePortraitUrl(this.state.race);
        if (brandAvatar && raceUrl) {
            brandAvatar.src = raceUrl;
        }

        const idEl = document.getElementById('hdr-char-identity');
        if (idEl) {
            const gText = this.state.gender === 'male' ? '👦魔導少年' : '👧魔導少女';
            idEl.innerHTML = `${rObj.icon} <strong>${this.state.charName}</strong> <span style="color:#e2e8f0;font-weight:normal;">(${gText}・${rObj.name}${rObj.title})</span> ｜ <span style="color:#c084fc;">種族技能${rObj.skillName}</span>`;
        }

        document.getElementById('hdr-hp').textContent = st.maxHp;
        document.getElementById('hdr-atk').textContent = st.atk;
        document.getElementById('hdr-mp').textContent = `+${st.mpPerTurn} (可累積)`;
        document.getElementById('hdr-gold').textContent = this.state.gold;
        document.getElementById('hdr-weapon').textContent = `${st.weapon.icon} ${st.weapon.name}`;
        document.getElementById('hdr-armor').textContent = `${st.armor.icon} ${st.armor.name}`;
        this.updateTimeLimitButtonText();

        // 遺物列
        const relicContainer = document.getElementById('hdr-relics');
        if (this.state.relics.length === 0) {
            relicContainer.innerHTML = `<span class="relic-empty">尚無遺物（第3、5、6關Boss掉落）</span>`;
        } else {
            relicContainer.innerHTML = this.state.relics.map(rid => {
                const r = RELICS_DB[rid];
                return `<span class="relic-badge" title="${r.desc}">${r.icon} ${r.name}</span>`;
            }).join('');
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.nav-tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tabId);
        });
        document.querySelectorAll('.academy-panel').forEach(p => {
            p.classList.toggle('active', p.id === `panel-${tabId}`);
        });

        if (tabId === 'portal') this.renderPortal();
        if (tabId === 'meditation') this.renderMeditationHome();
        if (tabId === 'shop') this.renderShop();
        if (tabId === 'wardrobe') this.renderWardrobe();
        if (tabId === 'grimoire') this.renderGrimoire();
    }

    // ==========================================
    // 🚪 設施一：傳送門（顯示目前所選年級 + 雙區域 6 關卡）
    // ==========================================
    renderPortal() {
        const container = document.getElementById('stages-container');
        const cleared = this.state.clearedStages;
        const gInfo = MathEngine.getGradeInfo(this.state.selectedGrade);

        const regions = [
            { id: 1, title: '⚙️ 區域一：齒輪鐘塔', subtitle: `目前適用【${gInfo.name}】— 運算、位值、乘除與破盾試煉` },
            { id: 2, title: '💎 區域二：水晶洞窟', subtitle: `目前適用【${gInfo.name}】— 幾何圖形、時鐘／周長／角度／面積與水晶龍試煉` }
        ];

        const gradeBanner = `
            <div class="grade-banner-box">
                <div>
                    <strong style="color:#fde047;font-size:1.1rem;">🎒 目前選擇題庫：【${gInfo.name}】</strong>
                    <p style="color:#e2e8f0;font-size:0.92rem;margin-top:3px;">📘 單元範圍：${gInfo.focus}</p>
                </div>
                <div style="font-size:0.86rem;color:#bae6fd;">💡 可隨時點擊上方「小一(注音)～小六」按鈕切換年級！</div>
            </div>
        `;

        container.innerHTML = gradeBanner + regions.map(reg => {
            const regStages = STAGES_DB.filter(s => s.region === reg.id);
            const cardsHtml = regStages.map(st => {
                const isCleared = cleared.includes(st.id);
                const isUnlocked = st.id === 1 || cleared.includes(st.id - 1);
                const relicObj = st.relicDrop ? RELICS_DB[st.relicDrop] : null;
                const hasRelic = st.relicDrop && this.state.relics.includes(st.relicDrop);

                return `
                <div class="stage-card ${isCleared ? 'cleared' : ''} ${!isUnlocked ? 'locked' : ''}">
                    <div class="stage-card-header">
                        <span class="stage-badge">${st.name}</span>
                        <span class="stage-status">
                            ${isCleared ? '✅ 已通關' : isUnlocked ? '⚔️ 可挑戰' : '🔒 需先通過前一關'}
                        </span>
                    </div>
                    <div class="stage-math-focus">📘 【${gInfo.shortName}】${gInfo.focus}</div>
                    <div class="stage-waves-preview">
                        ${st.waves.map((w, idx) => `
                            <span class="wave-pill ${w.isBoss ? 'boss-pill' : ''}">
                                ${idx + 1}. ${w.name}${w.isBoss ? ' (👑Boss)' : ''}
                            </span>
                        `).join(' → ')}
                    </div>
                    <p class="stage-boss-tip">${st.waves[st.waves.length - 1].behaviorDesc}</p>
                    <div class="stage-card-footer">
                        <div class="stage-rewards">
                            <span>💰 通關金幣：+${st.rewardGold}</span>
                            ${relicObj ? `<span class="relic-reward-tag ${hasRelic ? 'collected' : ''}">${relicObj.icon} 首通寶物：${relicObj.name} ${hasRelic ? '(已取得)' : ''}</span>` : ''}
                        </div>
                        <button class="btn-primary btn-start-stage" ${!isUnlocked ? 'disabled' : ''} data-stage="${st.id}">
                            ${isCleared ? '再次歷練' : '出發冒險 🚀'}
                        </button>
                    </div>
                </div>`;
            }).join('');

            return `
            <div class="region-block">
                <div class="region-header">
                    <h3>${reg.title}</h3>
                    <p>${reg.subtitle}</p>
                </div>
                <div class="stages-grid">${cardsHtml}</div>
            </div>`;
        }).join('');

        container.querySelectorAll('.btn-start-stage').forEach(btn => {
            btn.addEventListener('click', () => {
                const stageId = parseInt(btn.dataset.stage, 10);
                soundFX.playCardSelect();
                this.startBattle(stageId);
            });
        });
    }

    // ==========================================
    // 🧘‍♀️ 設施二：冥想修煉室（支援小一注音～小六 30秒快問快答）
    // ==========================================
    renderMeditationHome() {
        if (this.meditationTimer) {
            clearInterval(this.meditationTimer);
            this.meditationTimer = null;
        }
        const g = this.state.selectedGrade;
        const gInfo = MathEngine.getGradeInfo(g);
        const box = document.getElementById('meditation-content');

        box.innerHTML = `
            <div class="meditation-intro">
                <div class="meditation-hero-icon">🧘‍♀️✨</div>
                <h3>冥想修煉室 — 目前年級：【${gInfo.name}】</h3>
                <p>在 30 秒內快速完成數學直覺修煉！只要答對 <strong>4 題以上</strong>，即可直接<strong>永久提升小魔女的最大 HP (+5) 或 基礎攻擊力 (+1)</strong>，還能獲得修煉金幣！</p>
                <div class="meditation-mode-cards">
                    <div class="med-mode-card">
                        <div class="med-icon">📐</div>
                        <h4>${g === 1 ? 'ㄒㄧㄥˊ ㄓㄨㄤˋ ㄎㄨㄞˋ ㄕㄞ（形狀快篩）' : '幾何與角度快篩'}</h4>
                        <p>${g === 1 ? 'ㄎㄢˋ ㄊㄨˊ ㄎㄨㄞˋ ㄙㄨˋ ㄒㄩㄢˇ ㄔㄨ ㄩㄢˊ ㄒㄧㄥˊ、ㄙㄢ ㄐㄧㄠˇ ㄒㄧㄥˊ ㄏㄨㄛˋ ㄓㄥˋ ㄈㄤ ㄒㄧㄥˊ！' : '畫面上不斷出現幾何圖形與角度，快速點擊分類「銳角」、「直角」或「鈍角」！'}</p>
                        <button class="btn-primary" id="btn-med-angle">開始圖形修煉 (30秒)</button>
                    </div>
                    <div class="med-mode-card">
                        <div class="med-icon">🧮</div>
                        <h4>${g === 1 ? 'ㄏㄜˊ ㄕˊ ㄇㄛˊ ㄈㄚˇ（合十快答）' : g <= 3 ? '九九乘法閃電快答' : '四則運算先機'}</h4>
                        <p>${g === 1 ? 'ㄎㄨㄞˋ ㄙㄨˋ ㄙㄨㄢˋ ㄔㄨ ㄉㄨㄛ ㄕㄠˇ ㄐㄧㄚ 起來 ㄉㄥˇ ㄩˊ 10！' : g <= 3 ? '快速回答九九乘法算式，鍛鍊瞬間心算能力！' : '快速判斷四則混合算式「第一步應該先算哪個部分」！'}</p>
                        <button class="btn-primary" id="btn-med-order">開始計算修煉 (30秒)</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-med-angle').addEventListener('click', () => {
            soundFX.playCardSelect();
            this.startMeditationSession('angle');
        });
        document.getElementById('btn-med-order').addEventListener('click', () => {
            soundFX.playCardSelect();
            this.startMeditationSession('order');
        });
    }

    startMeditationSession(mode) {
        let timeLeft = 30;
        let score = 0;
        let total = 0;
        const g = this.state.selectedGrade;
        const box = document.getElementById('meditation-content');

        const renderNextMedQuestion = () => {
            if (mode === 'angle') {
                const q = MathEngine.generateMeditationAngleQuestion(g);
                box.innerHTML = `
                    <div class="med-arena">
                        <div class="med-topbar">
                            <span class="med-timer">⏱️ 剩餘時間：<strong id="med-time-val">${timeLeft}</strong> 秒</span>
                            <span class="med-score">✨ 答對題數：<strong>${score}</strong> 題</span>
                            <button class="btn-secondary btn-sm" id="btn-med-quit">結束修煉</button>
                        </div>
                        <div class="med-question-card">
                            <h4 class="${g === 1 ? 'bopomofo-text' : ''}">${q.title}</h4>
                            <div class="med-svg-wrap">${q.svg}</div>
                            <div class="med-options-row">
                                ${q.options.map(opt => `<button class="btn-choice med-opt-btn" data-ans="${opt}">${opt}</button>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
                box.querySelectorAll('.med-opt-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        total++;
                        if (btn.dataset.ans === q.answer) {
                            score++;
                            soundFX.playCorrect();
                        } else {
                            soundFX.playWrong();
                        }
                        renderNextMedQuestion();
                    });
                });
            } else {
                const q = MathEngine.generateMeditationOrderQuestion(g);
                const prefix = (q.isBopomofo || q.isDirectValue) ? '' : '先算 ';
                box.innerHTML = `
                    <div class="med-arena">
                        <div class="med-topbar">
                            <span class="med-timer">⏱️ 剩餘時間：<strong id="med-time-val">${timeLeft}</strong> 秒</span>
                            <span class="med-score">✨ 答對題數：<strong>${score}</strong> 題</span>
                            <button class="btn-secondary btn-sm" id="btn-med-quit">結束修煉</button>
                        </div>
                        <div class="med-question-card">
                            <h4 class="${q.isBopomofo ? 'bopomofo-text' : ''}">${q.isBopomofo ? 'ㄑㄧㄥˇ ㄒㄩㄢˇ ㄔㄨ ㄓㄥˋ ㄑㄩㄝˋ ㄉㄜ˙ ㄕㄨˋ ㄗˋ：' : q.isDirectValue ? '請快速選出正確答案：' : '請問下列算式「第一步要先算誰」？'}</h4>
                            <div class="med-expr-big">${q.expr}</div>
                            <p class="med-hint-sub">${q.rule}</p>
                            <div class="med-options-row">
                                ${q.options.map(opt => `<button class="btn-choice med-opt-btn" data-ans="${opt}">${prefix}${opt}</button>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
                box.querySelectorAll('.med-opt-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        total++;
                        if (btn.dataset.ans === q.answer) {
                            score++;
                            soundFX.playCorrect();
                        } else {
                            soundFX.playWrong();
                        }
                        renderNextMedQuestion();
                    });
                });
            }

            const quitBtn = document.getElementById('btn-med-quit');
            if (quitBtn) {
                quitBtn.addEventListener('click', () => {
                    clearInterval(this.meditationTimer);
                    this.meditationTimer = null;
                    this.finishMeditation(score, total);
                });
            }
        };

        renderNextMedQuestion();

        this.meditationTimer = setInterval(() => {
            timeLeft--;
            const el = document.getElementById('med-time-val');
            if (el) el.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(this.meditationTimer);
                this.meditationTimer = null;
                this.finishMeditation(score, total);
            }
        }, 1000);
    }

    finishMeditation(score, total) {
        const passed = score >= 4;
        const goldBonus = score * 4;
        this.state.gold += goldBonus;
        this.saveGame();
        this.renderHeader();

        if (passed) soundFX.playVictory();
        else soundFX.playHeal();

        const box = document.getElementById('meditation-content');
        box.innerHTML = `
            <div class="meditation-result">
                <h3>${passed ? '🎉 冥想修煉大成功！' : '🧘‍♀️ 冥想修煉結束'}</h3>
                <p>你在時間內共作答 ${total} 題，答對了 <strong>${score}</strong> 題！獲得修煉獎勵 <strong>💰 +${goldBonus} 金幣</strong>！</p>
                ${passed ? `
                    <div class="med-reward-choice">
                        <p>✨ 請選擇一項永久屬性提升獎勵：</p>
                        <div class="med-reward-btns">
                            <button class="btn-primary" id="btn-reward-hp">❤️ 永久最大生命 HP +5</button>
                            <button class="btn-primary" id="btn-reward-atk">⚔️ 永久基礎魔攻 ATK +1</button>
                        </div>
                    </div>
                ` : `
                    <p class="med-fail-tip">只要答對 4 題以上就能獲得永久屬性提升喔！再試一次吧！</p>
                    <button class="btn-primary" id="btn-med-back">返回修煉室</button>
                `}
            </div>
        `;

        if (passed) {
            document.getElementById('btn-reward-hp').addEventListener('click', () => {
                this.state.baseHp += 5;
                this.saveGame();
                this.renderHeader();
                soundFX.playHeal();
                this.renderMeditationHome();
            });
            document.getElementById('btn-reward-atk').addEventListener('click', () => {
                this.state.baseAtk += 1;
                this.saveGame();
                this.renderHeader();
                soundFX.playHeal();
                this.renderMeditationHome();
            });
        } else {
            document.getElementById('btn-med-back').addEventListener('click', () => {
                this.renderMeditationHome();
            });
        }
    }

    // ==========================================
    // 🛒 設施三：魔導商店（5把法杖、5件防具、7張秘傳魔導卡）
    // ==========================================
    renderShop() {
        const container = document.getElementById('shop-content');

        const weaponsHtml = EQUIP_DB.weapons.map(w => {
            const owned = this.state.ownedEquipment.includes(w.id);
            const equipped = this.state.equippedWeapon === w.id;
            return `
            <div class="shop-item-card ${equipped ? 'equipped' : ''}">
                <div class="shop-item-icon">${w.icon}</div>
                <div class="shop-item-info">
                    <h4>${w.name} ${equipped ? '<span class="tag-equipped">裝備中</span>' : ''}</h4>
                    <p>${w.desc}</p>
                </div>
                <div class="shop-item-action">
                    ${equipped ? `<button class="btn-secondary" disabled>已裝備</button>` :
                      owned ? `<button class="btn-primary btn-equip-weapon" data-id="${w.id}">裝備</button>` :
                      `<button class="btn-gold btn-buy-weapon" data-id="${w.id}" data-price="${w.price}">💰 ${w.price} 購買</button>`}
                </div>
            </div>`;
        }).join('');

        const armorsHtml = EQUIP_DB.armors.map(a => {
            const owned = this.state.ownedEquipment.includes(a.id);
            const equipped = this.state.equippedArmor === a.id;
            return `
            <div class="shop-item-card ${equipped ? 'equipped' : ''}">
                <div class="shop-item-icon">${a.icon}</div>
                <div class="shop-item-info">
                    <h4>${a.name} ${equipped ? '<span class="tag-equipped">裝備中</span>' : ''}</h4>
                    <p>${a.desc}</p>
                </div>
                <div class="shop-item-action">
                    ${equipped ? `<button class="btn-secondary" disabled>已裝備</button>` :
                      owned ? `<button class="btn-primary btn-equip-armor" data-id="${a.id}">裝備</button>` :
                      `<button class="btn-gold btn-buy-armor" data-id="${a.id}" data-price="${a.price}">💰 ${a.price} 購買</button>`}
                </div>
            </div>`;
        }).join('');

        const shopCards = Object.values(CARDS_DB).filter(c => c.shopPrice);
        const cardsHtml = shopCards.map(c => {
            const countInDeck = this.state.deck.filter(id => id === c.id).length;
            return `
            <div class="shop-item-card">
                <div class="shop-item-icon">${c.icon}</div>
                <div class="shop-item-info">
                    <h4>${c.name} <span class="card-cost-tag">💧${c.cost} MP</span> <span class="deck-count-tag">持有: ${countInDeck} 張</span></h4>
                    <p>${c.desc}</p>
                </div>
                <div class="shop-item-action">
                    <button class="btn-gold btn-buy-card" data-id="${c.id}" data-price="${c.shopPrice}" ${countInDeck >= 2 ? 'disabled' : ''}>
                        ${countInDeck >= 2 ? '已達上限(2張)' : `💰 ${c.shopPrice} 購買入牌組`}
                    </button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="shop-section">
                <h3>🪄 武器專區（5 種魔導法杖）</h3>
                <div class="shop-grid">${weaponsHtml}</div>
            </div>
            <div class="shop-section">
                <h3>🧥 防具專區（5 種魔法袍與鎧甲）</h3>
                <div class="shop-grid">${armorsHtml}</div>
            </div>
            <div class="shop-section">
                <h3>🃏 秘傳魔導卡專區（含回復卡、秘法回魔卡與 3 MP 終極大招，每種最多 2 張）</h3>
                <div class="shop-grid">${cardsHtml}</div>
            </div>
        `;

        container.querySelectorAll('.btn-buy-weapon').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const price = parseInt(btn.dataset.price, 10);
                if (this.state.gold < price) {
                    soundFX.playWrong();
                    alert('金幣不足！可以去闖關或到冥想修煉室賺取金幣喔！');
                    return;
                }
                this.state.gold -= price;
                this.state.ownedEquipment.push(id);
                this.state.equippedWeapon = id;
                soundFX.playVictory();
                this.saveGame();
                this.renderHeader();
                this.renderShop();
            });
        });

        container.querySelectorAll('.btn-equip-weapon').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.equippedWeapon = btn.dataset.id;
                soundFX.playClick();
                this.saveGame();
                this.renderHeader();
                this.renderShop();
            });
        });

        container.querySelectorAll('.btn-buy-armor').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const price = parseInt(btn.dataset.price, 10);
                if (this.state.gold < price) {
                    soundFX.playWrong();
                    alert('金幣不足！可以去闖關或到冥想修煉室賺取金幣喔！');
                    return;
                }
                this.state.gold -= price;
                this.state.ownedEquipment.push(id);
                this.state.equippedArmor = id;
                soundFX.playVictory();
                this.saveGame();
                this.renderHeader();
                this.renderShop();
            });
        });

        container.querySelectorAll('.btn-equip-armor').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.equippedArmor = btn.dataset.id;
                soundFX.playClick();
                this.saveGame();
                this.renderHeader();
                this.renderShop();
            });
        });

        container.querySelectorAll('.btn-buy-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const price = parseInt(btn.dataset.price, 10);
                if (this.state.gold < price) {
                    soundFX.playWrong();
                    alert('金幣不足！');
                    return;
                }
                this.state.gold -= price;
                this.state.deck.push(id);
                soundFX.playVictory();
                this.saveGame();
                this.renderHeader();
                this.renderShop();
            });
        });
    }

    // ==========================================
    // 👗 設施四：五部位紙娃娃服裝店（頭部、衣服、背部、鞋子、手部，同步改變戰鬥造型）
    // ==========================================
    renderWardrobe() {
        const container = document.getElementById('wardrobe-content');
        if (!container) return;

        const st = this.getComputedStats();
        const rObj = st.raceObj;
        const eq = this.state.equippedCostume || DEFAULT_COSTUME;
        const curFilter = this.activeWardrobeSlot || 'all';

        const slotKeys = Object.keys(COSTUME_SLOTS_META);
        const equippedSummaryHtml = slotKeys.map(sKey => {
            const meta = COSTUME_SLOTS_META[sKey];
            const itemId = eq[sKey];
            const itemObj = (COSTUMES_DB[sKey] || []).find(it => it.id === itemId) || COSTUMES_DB[sKey][0];
            return `
                <div class="wardrobe-eq-chip" data-filter-slot="${sKey}" title="點擊篩選【${meta.name}】部位">
                    <span class="weq-part">${meta.icon} ${meta.name}</span>
                    <strong class="weq-name">${itemObj.icon} ${itemObj.name}</strong>
                </div>
            `;
        }).join('');

        // 依目前篩選部位組合服裝清單
        let itemsToRender = [];
        if (curFilter === 'all') {
            slotKeys.forEach(sKey => {
                (COSTUMES_DB[sKey] || []).forEach(item => itemsToRender.push(item));
            });
        } else {
            itemsToRender = [...(COSTUMES_DB[curFilter] || [])];
        }

        const itemsHtml = itemsToRender.map(item => {
            const owned = this.state.ownedCostumes.includes(item.id);
            const isEquipped = eq[item.slot] === item.id;
            const slotMeta = COSTUME_SLOTS_META[item.slot];
            const bonusTags = [];
            if (item.hpBonus > 0) bonusTags.push(`❤️ HP +${item.hpBonus}`);
            if (item.atkBonus > 0) bonusTags.push(`⚔️ ATK +${item.atkBonus}`);
            const bonusText = bonusTags.length > 0 ? bonusTags.join(' ｜ ') : '純造型外觀';

            return `
            <div class="shop-item-card wardrobe-item-card ${isEquipped ? 'equipped' : ''}">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-info">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;">
                        <span class="costume-slot-badge">${slotMeta.icon} ${slotMeta.name}</span>
                        <h4>${item.name}</h4>
                        ${isEquipped ? '<span class="tag-equipped">穿戴中</span>' : owned ? '<span class="tag-owned">已擁有</span>' : ''}
                    </div>
                    <p>${item.desc}</p>
                    <div class="costume-bonus-line">✨ 加成：<strong>${bonusText}</strong></div>
                </div>
                <div class="shop-item-action">
                    ${isEquipped
                        ? `<button class="btn-secondary" disabled>✨ 穿戴中</button>`
                        : owned
                            ? `<button class="btn-primary btn-equip-costume" data-slot="${item.slot}" data-id="${item.id}">✨ 立即換裝</button>`
                            : `<button class="btn-gold btn-buy-costume" data-slot="${item.slot}" data-id="${item.id}" data-price="${item.price}">💰 ${item.price} 購買換裝</button>`
                    }
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="wardrobe-grid-layout">
                <!-- 左側：即時紙娃娃換裝預覽舞台（與戰鬥畫面 100% 同步） -->
                <div class="wardrobe-preview-card">
                    <div class="wardrobe-preview-header">
                        <span class="race-pill-tag">${rObj.icon} ${rObj.name}${rObj.title}</span>
                        <span class="gold-pill-tag">💰 持有金幣：<strong>${this.state.gold}</strong></span>
                    </div>
                    <div class="wardrobe-avatar-stage">
                        ${AvatarRenderer.getPlayerPaperDollSVG(this.state)}
                    </div>
                    <h3 class="wardrobe-char-name">${this.state.charName} <small>(${this.state.gender === 'male' ? '👦魔導少年' : '👧魔導少女'})</small></h3>
                    <p class="wardrobe-sync-tip">💡 此紙娃娃造型會<strong>即時同步對應到戰鬥畫面與大招動畫展示廳</strong>！</p>

                    <div class="wardrobe-gender-switch">
                        <span>切換體型／髮型：</span>
                        <button class="btn-secondary btn-xs ${this.state.gender === 'female' ? 'active-gender-btn' : ''}" id="btn-wardrobe-female">👧 魔導少女</button>
                        <button class="btn-secondary btn-xs ${this.state.gender === 'male' ? 'active-gender-btn' : ''}" id="btn-wardrobe-male">👦 魔導少年</button>
                    </div>

                    <div class="wardrobe-bonus-box">
                        <div>👗 服裝總屬性加成：<strong>❤️ 最大生命 +${st.costumeHpBonus}</strong> ｜ <strong>⚔️ 魔攻 +${st.costumeAtkBonus}</strong></div>
                        <div style="font-size:0.8rem;color:#fde047;margin-top:3px;">✨ 種族技能${rObj.skillName}：${rObj.skillDesc}</div>
                    </div>

                    <div class="wardrobe-equipped-grid">
                        ${equippedSummaryHtml}
                    </div>
                </div>

                <!-- 右側：五部位服裝分類與購買換裝清單 -->
                <div class="wardrobe-catalog-panel">
                    <div class="wardrobe-filter-tabs">
                        <button class="w-filter-btn ${curFilter === 'all' ? 'active' : ''}" data-slot="all">🌟 全部部位 (25件)</button>
                        ${slotKeys.map(sKey => {
                            const m = COSTUME_SLOTS_META[sKey];
                            return `<button class="w-filter-btn ${curFilter === sKey ? 'active' : ''}" data-slot="${sKey}">${m.icon} ${m.name}</button>`;
                        }).join('')}
                    </div>
                    <div class="wardrobe-items-list">
                        ${itemsHtml}
                    </div>
                </div>
            </div>
        `;

        // 切換性別與髮型按鈕
        const btnFemale = document.getElementById('btn-wardrobe-female');
        const btnMale = document.getElementById('btn-wardrobe-male');
        if (btnFemale) {
            btnFemale.onclick = () => {
                this.state.gender = 'female';
                soundFX.playClick();
                this.saveGame();
                this.renderHeader();
                this.renderWardrobe();
            };
        }
        if (btnMale) {
            btnMale.onclick = () => {
                this.state.gender = 'male';
                soundFX.playClick();
                this.saveGame();
                this.renderHeader();
                this.renderWardrobe();
            };
        }

        // 點擊部位篩選
        container.querySelectorAll('.w-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeWardrobeSlot = btn.dataset.slot;
                soundFX.playClick();
                this.renderWardrobe();
            });
        });
        container.querySelectorAll('.wardrobe-eq-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.activeWardrobeSlot = chip.dataset.filterSlot;
                soundFX.playClick();
                this.renderWardrobe();
            });
        });

        // 購買服裝並立即換裝
        container.querySelectorAll('.btn-buy-costume').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = btn.dataset.slot;
                const id = btn.dataset.id;
                const price = parseInt(btn.dataset.price, 10);
                if (this.state.gold < price) {
                    soundFX.playWrong();
                    alert('金幣不足！可以去外出冒險打怪或到冥想修煉室賺取金幣喔！');
                    return;
                }
                this.state.gold -= price;
                if (!this.state.ownedCostumes.includes(id)) {
                    this.state.ownedCostumes.push(id);
                }
                this.state.equippedCostume[slot] = id;
                soundFX.playVictory();
                this.saveGame();
                this.renderHeader();
                this.renderWardrobe();
            });
        });

        // 已擁有服裝立即換裝
        container.querySelectorAll('.btn-equip-costume').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = btn.dataset.slot;
                const id = btn.dataset.id;
                this.state.equippedCostume[slot] = id;
                soundFX.playCardSelect();
                this.saveGame();
                this.renderHeader();
                this.renderWardrobe();
            });
        });
    }

    // ==========================================
    // 📖 設施四：數學魔導圖鑑（小一至小六重點筆記與牌組檢視）
    // ==========================================
    renderGrimoire() {
        const container = document.getElementById('grimoire-content');
        const s = this.state.stats;
        const rate = (c, t) => t === 0 ? '尚無紀錄' : `${Math.round((c / t) * 100)}% (${c}/${t})`;

        const deckSummary = {};
        this.state.deck.forEach(cid => {
            if (CARDS_DB[cid]) {
                deckSummary[cid] = (deckSummary[cid] || 0) + 1;
            }
        });

        const deckHtml = Object.keys(deckSummary).map(cid => {
            const card = CARDS_DB[cid];
            return `
            <div class="grimoire-card-item">
                <span class="g-card-icon">${card.icon}</span>
                <div>
                    <strong>${card.name} × ${deckSummary[cid]}張</strong>
                    <span class="card-cost-tag">💧${card.cost} MP</span>
                    <p>${card.desc}</p>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="grimoire-grid">
                <div class="grimoire-box">
                    <h3>📊 小魔女的學習歷程統計</h3>
                    <ul class="stats-list">
                        <li>🔥 運算與四則（攻擊卡）答對率：<strong>${rate(s.attackCorrect, s.attackTotal)}</strong></li>
                        <li>⚡ 位值、乘除與數量（破甲卡）答對率：<strong>${rate(s.breakCorrect, s.breakTotal)}</strong></li>
                        <li>🛡️ 圖形、周長、角度與面積（防禦卡）答對率：<strong>${rate(s.defenseCorrect, s.defenseTotal)}</strong></li>
                    </ul>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
                        <h3 style="margin:0;">🃏 目前魔導牌組（共 ${this.state.deck.length} 張）</h3>
                        <button class="btn-gold btn-sm" id="btn-grimoire-vfx">🎬 預覽全 14 張卡牌華麗動畫 (Imagen 3.0)</button>
                    </div>
                    <div class="grimoire-deck-list">${deckHtml}</div>
                </div>
                <div class="grimoire-box">
                    <h3>📘 小一至小六核心數學魔導筆記</h3>
                    <div class="note-card">
                        <h4>🎒 小一（注音版）＆ 小二重點</h4>
                        <p>• <strong>小一（ㄅㄆㄇㄈ）</strong>：合十法（8+2=10）、幾個十和幾個一、認識圓形／三角形／正方形／長方形、看整點時鐘。<br>
                        • <strong>小二</strong>：二位數進位加與退位減、熟背九九乘法表（2~9）、1 公尺 = 100 公分。</p>
                    </div>
                    <div class="note-card">
                        <h4>🎒 小三 ＆ 小四重點</h4>
                        <p>• <strong>小三</strong>：一位數除法（餘數一定比除數小）、同分母分數加減（分母不變分子相加減）、長方形周長 = (長+寬)×2。<br>
                        • <strong>小四</strong>：四則運算「先乘除後加減，括號最優先」、量角器判讀、平角=180°、周角=360°、等腰與正三角形。</p>
                    </div>
                    <div class="note-card">
                        <h4>🎒 小五 ＆ 小六重點</h4>
                        <p>• <strong>小五</strong>：最大公因數與最小公倍數、分配律巧算、三角形面積 = 底×高÷2、三角形內角和 = 180°。<br>
                        • <strong>小六</strong>：相等的比、距離 = 速率×時間、打折百分率（打8折 = ×80%）、圓周長 = 直徑×3.14、圓面積 = 半徑×半徑×3.14。</p>
                    </div>
                </div>
            </div>
        `;

        const grimoireVfxBtn = document.getElementById('btn-grimoire-vfx');
        if (grimoireVfxBtn) {
            grimoireVfxBtn.onclick = () => {
                soundFX.playClick();
                this.openVfxGalleryModal();
            };
        }
    }

    // ==========================================
    // ⚔️ 核心回合制戰鬥系統
    // ==========================================
    startBattle(stageId) {
        const stage = STAGES_DB.find(s => s.id === stageId);
        if (!stage) return;

        const st = this.getComputedStats();

        this.battle = {
            stage,
            waveIndex: 0,
            turn: 1,
            player: {
                hp: st.maxHp,
                maxHp: st.maxHp,
                mp: st.mpPerTurn + st.bonusStartMp,
                mpPerTurn: st.mpPerTurn,
                atk: st.atk,
                shield: st.startShield,
                reflectDmg: st.startReflect,
                nextAtkBuff: 0,
                perfectParryReady: false
            },
            enemy: null,
            drawPile: [],
            discardPile: [],
            hand: [],
            log: []
        };

        this.setupWave(0);
        document.getElementById('academy-view').classList.add('hidden');
        document.getElementById('battle-view').classList.remove('hidden');
        document.body.classList.add('in-battle-mode');
        // 在手機／平板橫向進入戰鬥時，自動收合次要頂欄以最大化戰鬥視野
        if (window.innerHeight <= 620) {
            this.toggleCompactHeader(true);
        }

        document.getElementById('btn-end-turn').onclick = () => {
            soundFX.playClick();
            this.endPlayerTurn();
        };
        document.getElementById('btn-retreat').onclick = () => {
            if (confirm('確定要撤退返回魔法學院嗎？')) {
                this.exitBattleToAcademy();
            }
        };
    }

    setupWave(waveIdx) {
        const w = this.battle.stage.waves[waveIdx];
        const st = this.getComputedStats();
        this.battle.waveIndex = waveIdx;
        this.battle.turn = 1;

        this.battle.enemy = {
            name: w.name,
            title: w.title,
            isBoss: !!w.isBoss,
            mechanic: w.mechanic || null,
            hp: w.maxHp,
            maxHp: w.maxHp,
            atk: w.atk,
            shield: w.startShield || 0,
            svgType: w.svgType,
            color: w.color,
            behaviorDesc: w.behaviorDesc,
            stunned: false,
            remainderArmor: w.mechanic === 'remainder_armor',
            breathAngle: w.mechanic === 'wide_breath' ? 135 : null
        };

        this.battle.drawPile = MathEngine.shuffle([...this.state.deck]);
        this.battle.discardPile = [];
        this.battle.hand = [];

        if (waveIdx === 0) {
            this.battle.player.mp = this.battle.player.mpPerTurn + st.bonusStartMp;
        } else {
            this.battle.player.mp += this.battle.player.mpPerTurn;
        }
        this.battle.player.perfectParryReady = false;

        this.addBattleLog(`⚔️ 遭遇【${w.title}：${w.name}】（目前可用魔力：${this.battle.player.mp} 點 MP）！`);
        if (this.battle.enemy.remainderArmor) {
            this.addBattleLog(`⚙️ 【${w.name}】開啟了「餘數裝甲」！打出⚡破甲卡答對題目即可擊碎裝甲！`);
        }
        if (this.battle.enemy.breathAngle) {
            this.addBattleLog(`🐉 【${w.name}】正在蓄力「廣角吐息」！請打出🛡️防禦卡展開完美格擋！`);
        }

        this.drawCards(4);
        this.renderBattle();
    }

    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.battle.drawPile.length === 0) {
                if (this.battle.discardPile.length === 0) break;
                this.battle.drawPile = MathEngine.shuffle([...this.battle.discardPile]);
                this.battle.discardPile = [];
            }
            this.battle.hand.push(this.battle.drawPile.pop());
        }
    }

    addBattleLog(msg) {
        this.battle.log.unshift(msg);
        if (this.battle.log.length > 6) this.battle.log.pop();
    }

    renderBattle() {
        const b = this.battle;
        const p = b.player;
        const e = b.enemy;
        const st = this.getComputedStats();
        const rObj = st.raceObj;
        const gInfo = MathEngine.getGradeInfo(this.state.selectedGrade);

        document.getElementById('battle-stage-title').textContent = `${b.stage.name}（第 ${b.waveIndex + 1} / ${b.stage.waves.length} 波）`;
        document.getElementById('battle-math-focus').textContent = `🎒 目前題庫：【${gInfo.name}】— ${gInfo.focus}`;

        document.getElementById('witch-avatar-box').innerHTML = AvatarRenderer.getWitchSVG();
        const playerNameEl = document.getElementById('player-name-label');
        if (playerNameEl) {
            playerNameEl.innerHTML = `${rObj.icon} ${this.state.charName} <small style="color:#cbd5e1;">(${rObj.name}${this.state.gender === 'male' ? '少年' : '少女'})</small>`;
        }
        const raceSkillEl = document.getElementById('player-race-skill-line');
        if (raceSkillEl) {
            raceSkillEl.innerHTML = `✨ 種族技能${rObj.skillName}：${rObj.skillDesc}`;
        }

        const pHpPct = Math.max(0, Math.min(100, Math.round((p.hp / p.maxHp) * 100)));
        document.getElementById('player-hp-bar').style.width = `${pHpPct}%`;
        document.getElementById('player-hp-text').textContent = `${p.hp} / ${p.maxHp}`;
        document.getElementById('player-shield-badge').innerHTML = `🛡️ 護盾: <strong>${p.shield}</strong>`;
        document.getElementById('player-atk-badge').innerHTML = `⚔️ 魔攻: <strong>${p.atk}${p.nextAtkBuff > 0 ? ` (+${p.nextAtkBuff})` : ''}</strong>`;
        document.getElementById('player-reflect-badge').innerHTML = `🔄 反彈: <strong>${p.reflectDmg}</strong>`;

        let mpCrystals = '';
        const orbCount = Math.max(p.mp, 1);
        for (let i = 0; i < Math.min(orbCount, 10); i++) {
            mpCrystals += `<span class="mp-orb ${i < p.mp ? 'filled' : 'empty'}">💧</span>`;
        }
        document.getElementById('player-mp-display').innerHTML = `魔力 MP：${mpCrystals} <strong>${p.mp} 點</strong> <small style="color:#94a3b8;">(每回合 +${p.mpPerTurn}，沒用完可累積)</small>`;

        document.getElementById('enemy-name-label').innerHTML = `${e.isBoss ? '👑 ' : ''}${e.name} <small>(${e.title})</small>`;
        document.getElementById('enemy-avatar-box').innerHTML = AvatarRenderer.getEnemySVG(e.svgType, e.color);
        const eHpPct = Math.max(0, Math.min(100, Math.round((e.hp / e.maxHp) * 100)));
        document.getElementById('enemy-hp-bar').style.width = `${eHpPct}%`;
        document.getElementById('enemy-hp-text').textContent = `${e.hp} / ${e.maxHp}`;
        document.getElementById('enemy-shield-badge').innerHTML = `🛡️ 數字護盾: <strong>${e.shield}</strong>`;

        const statusTags = [];
        if (e.stunned) {
            statusTags.push(`<span class="status-pill stun-pill">💫 暈眩中（本回合無法行動）</span>`);
        } else if (e.breathAngle) {
            statusTags.push(`<span class="status-pill danger-pill">🐉 預告：廣角吐息（傷害 ${e.atk + 10}，請出🛡️防禦卡完美格擋！）</span>`);
        } else {
            statusTags.push(`<span class="status-pill intent-pill">⚔️ 下回合意圖：攻擊造成 ${e.atk} 點傷害</span>`);
        }
        if (e.remainderArmor) {
            statusTags.push(`<span class="status-pill armor-pill">⚙️ 餘數裝甲啟動中（減傷70%，用⚡破甲卡解除！）</span>`);
        }
        if (p.perfectParryReady) {
            statusTags.push(`<span class="status-pill parry-pill">✨ 小魔女已架好完美折射盾！</span>`);
        }
        document.getElementById('enemy-status-row').innerHTML = statusTags.join(' ');
        document.getElementById('enemy-desc-text').textContent = e.behaviorDesc;

        document.getElementById('battle-log-list').innerHTML = b.log.map(item => `<li>${item}</li>`).join('');

        const handContainer = document.getElementById('hand-cards-container');
        handContainer.innerHTML = b.hand.map((cid, idx) => {
            const card = CARDS_DB[cid];
            const canPlay = p.mp >= card.cost;
            return `
            <div class="battle-card type-${card.type} ${!canPlay ? 'disabled-card' : ''}" data-idx="${idx}">
                <div class="card-top-bar">
                    <span class="card-type-label">${card.typeName}</span>
                    <span class="card-mp-cost">💧 ${card.cost}</span>
                </div>
                <div class="card-art-icon">${card.icon}</div>
                <h4 class="card-title">${card.name}</h4>
                <p class="card-desc">${card.desc}</p>
                <div class="card-play-hint">${canPlay ? '點擊出牌詠唱 ✨' : '魔力不足（可結束回合累積）'}</div>
            </div>`;
        }).join('');

        handContainer.querySelectorAll('.battle-card').forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                const idx = parseInt(cardEl.dataset.idx, 10);
                this.onSelectCardToPlay(idx);
            });
        });
    }

    onSelectCardToPlay(handIndex) {
        const b = this.battle;
        const cardId = b.hand[handIndex];
        const card = CARDS_DB[cardId];

        if (b.player.mp < card.cost) {
            soundFX.playWrong();
            return;
        }

        soundFX.playCardSelect();

        // 依目前選擇的年級 (1~6) 與卡牌類型產生微題目
        const question = MathEngine.generateQuestion(
            this.state.selectedGrade,
            card.type,
            b.enemy,
            b.stage.id,
            card.forceParens
        );

        this.activeQuestion = {
            handIndex,
            card,
            question,
            currentMode: this.state.preferChoiceMode ? 'choice' : question.inputMode,
            typedValue: ''
        };

        this.openQuestionModal();
    }

    // ==========================================
    // 🧮 微題目互動視窗（支援小一全注音、10/20/30秒時限、魔杖加成與雙作答模式）
    // ==========================================
    clearQuestionTimer() {
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    }

    openQuestionModal() {
        const aq = this.activeQuestion;
        const q = aq.question;
        const st = this.getComputedStats();
        const modal = document.getElementById('question-modal');
        modal.classList.remove('hidden');

        const startCountdown = (baseSeconds) => {
            this.clearQuestionTimer();
            if (baseSeconds === 0) {
                aq.isUnlimited = true;
                aq.totalTime = 0;
                aq.timeLeft = 0;
                return;
            }
            aq.isUnlimited = false;
            const totalSeconds = baseSeconds + (st.extraTimeSec || 0);
            aq.totalTime = totalSeconds;
            aq.timeLeft = totalSeconds;

            this.questionTimer = setInterval(() => {
                aq.timeLeft--;
                this.updateQuestionTimerUI();

                if (aq.timeLeft > 0 && aq.timeLeft <= 3) {
                    soundFX.playClick();
                }

                if (aq.timeLeft <= 0) {
                    this.clearQuestionTimer();
                    this.handleQuestionTimeout();
                }
            }, 1000);
        };

        startCountdown(this.state.questionTimeLimit);

        // 判斷是否觸發【先乘除魔杖／六藝星辰聖杖】自動標示關鍵步驟
        const hasWandHighlight = st.highlightPriority;
        const formulaHtml = hasWandHighlight && q.hintDisplayHtml ? q.hintDisplayHtml : q.displayHtml;

        const renderModalContent = () => {
            const isChoice = aq.currentMode === 'choice';
            const isUnlim = !!aq.isUnlimited;
            const pct = isUnlim ? 100 : Math.max(0, Math.round((aq.timeLeft / aq.totalTime) * 100));
            const barClass = isUnlim ? '' : (pct <= 25 ? 'danger' : pct <= 50 ? 'warning' : '');
            const gInfo = MathEngine.getGradeInfo(this.state.selectedGrade);

            modal.innerHTML = `
                <div class="modal-card question-modal-card">
                    <div class="q-modal-header">
                        <span class="q-card-badge">${aq.card.icon} 【${aq.card.name}】</span>
                        <span class="q-unit-badge">🎒 ${gInfo.shortName}｜${q.unitName}</span>
                    </div>

                    <!-- 答題時間限制與 10秒/20秒/30秒/不限時 快速設定 -->
                    <div class="q-timer-section">
                        <div class="q-timer-top">
                            <span class="q-timer-label ${!isUnlim && aq.timeLeft <= 5 ? 'urgent' : ''}" id="q-timer-text">
                                ${isUnlim
                                    ? `⏱️ ${q.isBopomofo ? 'ㄅㄨˊ ㄒㄧㄢˋ ㄕˊ ㄐㄧㄢ（ㄎㄜˇ ㄢ ㄒㄧㄣ ㄙㄨㄢˋ）' : '作答時間：∞ 不限時間（可安心思考）'}`
                                    : `⏱️ ${q.isBopomofo ? 'ㄕㄥˋ ㄩˊ ㄕˊ ㄐㄧㄢ' : '剩餘作答時間'}：${aq.timeLeft} 秒 ${st.extraTimeSec > 0 ? `(含魔杖+${st.extraTimeSec}秒)` : ''}`}
                            </span>
                            <div class="q-time-presets">
                                <span>時限：</span>
                                ${[10, 20, 30, 0].map(sec => `
                                    <button class="time-preset-btn ${this.state.questionTimeLimit === sec ? 'active' : ''}" data-sec="${sec}">
                                        ${sec === 0 ? '∞ 不限時' : `${sec}秒`}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="q-timer-bar-outer">
                            <div class="q-timer-bar-inner ${barClass}" id="q-timer-bar" style="width:${pct}%"></div>
                        </div>
                    </div>

                    ${hasWandHighlight ? `<div class="wand-tip-banner">🌟 【${st.weapon.name}】發動：已自動標示算式關鍵步驟提示！</div>` : ''}

                    <!-- 橫向人體工學雙欄佈局：左側看題目與幾何圖形、右側大按鈕輕鬆作答 -->
                    <div class="q-landscape-body">
                        <div class="q-landscape-left">
                            <p class="q-prompt-text ${q.isBopomofo ? 'bopomofo-text' : ''}">${q.prompt}</p>
                            ${q.svgDiagram ? `<div class="q-svg-container">${q.svgDiagram}</div>` : ''}
                            <div class="q-formula-box">${formulaHtml}</div>
                        </div>

                        <div class="q-landscape-right">
                            ${q.inputMode === 'number' ? `
                                <div class="q-mode-switch-row">
                                    <button class="btn-secondary btn-xs" id="btn-toggle-q-mode">
                                        ${isChoice ? '🔢 切換為「數字鍵盤填空」' : '🎯 切換為「3 選 1 選擇題」'}
                                    </button>
                                </div>
                            ` : ''}

                            ${isChoice ? `
                                <div class="q-choices-grid">
                                    ${q.options.map((opt, i) => `
                                        <button class="btn-choice q-option-btn" data-idx="${i}">
                                            <span class="opt-num">${i + 1}</span>
                                            <span class="opt-label">${opt.label}</span>
                                        </button>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="numpad-wrapper">
                                    <div class="numpad-display" id="numpad-screen">${aq.typedValue || (q.isBopomofo ? 'ㄑㄧㄥˇ ㄢˋ ㄕㄨˋ ㄗˋ...' : '請輸入答案...')}</div>
                                    <div class="numpad-grid">
                                        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="numpad-key" data-key="${n}">${n}</button>`).join('')}
                                        <button class="numpad-key key-backspace" data-key="BS" title="倒退刪除一個數字">⌫ ${q.isBopomofo ? 'ㄊㄨㄟˋ ㄍㄜˊ' : '退格'}</button>
                                        <button class="numpad-key" data-key="0">0</button>
                                        <button class="numpad-key key-clear" data-key="C">${q.isBopomofo ? 'ㄑㄧㄥ ㄔㄨˊ' : '清除'}</button>
                                        <button class="numpad-key key-submit numpad-submit-wide" data-key="OK">${q.isBopomofo ? 'ㄑㄩㄝˋ ㄖㄣˋ ✨' : '確認詠唱 ✨'}</button>
                                    </div>
                                </div>
                            `}

                            <div class="q-modal-footer">
                                <button class="btn-secondary btn-sm" id="btn-cancel-cast">取消出牌（不耗魔力）</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            modal.querySelectorAll('.time-preset-btn').forEach(btn => {
                btn.onclick = () => {
                    const sec = parseInt(btn.dataset.sec, 10);
                    this.state.questionTimeLimit = sec;
                    this.saveGame();
                    this.updateTimeLimitButtonText();
                    soundFX.playClick();
                    startCountdown(sec);
                    renderModalContent();
                };
            });

            document.getElementById('btn-cancel-cast').onclick = () => {
                soundFX.playClick();
                this.clearQuestionTimer();
                modal.classList.add('hidden');
                this.activeQuestion = null;
            };

            const toggleBtn = document.getElementById('btn-toggle-q-mode');
            if (toggleBtn) {
                toggleBtn.onclick = () => {
                    soundFX.playClick();
                    aq.currentMode = aq.currentMode === 'choice' ? 'number' : 'choice';
                    renderModalContent();
                };
            }

            modal.querySelectorAll('.q-option-btn').forEach(btn => {
                btn.onclick = () => {
                    const optIdx = parseInt(btn.dataset.idx, 10);
                    const chosenVal = q.options[optIdx].value;
                    this.submitAnswer(chosenVal);
                };
            });

            modal.querySelectorAll('.numpad-key').forEach(btn => {
                btn.onclick = () => {
                    const key = btn.dataset.key;
                    soundFX.playClick();
                    if (key === 'C') {
                        aq.typedValue = '';
                        document.getElementById('numpad-screen').textContent = q.isBopomofo ? 'ㄑㄧㄥˇ ㄢˋ ㄕㄨˋ ㄗˋ...' : '請輸入答案...';
                    } else if (key === 'BS') {
                        aq.typedValue = aq.typedValue.slice(0, -1);
                        document.getElementById('numpad-screen').textContent = aq.typedValue || (q.isBopomofo ? 'ㄑㄧㄥˇ ㄢˋ ㄕㄨˋ ㄗˋ...' : '請輸入答案...');
                    } else if (key === 'OK') {
                        if (aq.typedValue === '') return;
                        this.submitAnswer(Number(aq.typedValue));
                    } else {
                        if (aq.typedValue.length < 5) {
                            aq.typedValue += key;
                            document.getElementById('numpad-screen').textContent = aq.typedValue;
                        }
                    }
                };
            });
        };

        renderModalContent();
    }

    updateQuestionTimerUI() {
        const aq = this.activeQuestion;
        if (!aq || aq.isUnlimited) return;
        const st = this.getComputedStats();
        const textEl = document.getElementById('q-timer-text');
        const barEl = document.getElementById('q-timer-bar');
        if (textEl) {
            textEl.textContent = `⏱️ ${aq.question.isBopomofo ? 'ㄕㄥˋ ㄩˊ ㄕˊ ㄐㄧㄢ' : '剩餘作答時間'}：${aq.timeLeft} 秒 ${st.extraTimeSec > 0 ? `(含魔杖+${st.extraTimeSec}秒)` : ''}`;
            textEl.classList.toggle('urgent', aq.timeLeft <= 5);
        }
        if (barEl) {
            const pct = Math.max(0, Math.round((aq.timeLeft / aq.totalTime) * 100));
            barEl.style.width = `${pct}%`;
            barEl.className = `q-timer-bar-inner ${pct <= 25 ? 'danger' : pct <= 50 ? 'warning' : ''}`;
        }
    }

    handleQuestionTimeout() {
        const aq = this.activeQuestion;
        if (!aq) return;
        const q = aq.question;

        if (q.category === 'attack') this.state.stats.attackTotal++;
        else if (q.category === 'break') this.state.stats.breakTotal++;
        else this.state.stats.defenseTotal++;
        this.saveGame();

        soundFX.playWrong();
        this.showExplanationBeforeResolve(q.isBopomofo ? '⏰ ㄕˊ ㄐㄧㄢ ㄉㄠˋ' : '⏰ 逾時未答', aq, true);
    }

    submitAnswer(userAns) {
        const aq = this.activeQuestion;
        if (!aq) return;
        this.clearQuestionTimer();

        const q = aq.question;
        const isCorrect = String(userAns) === String(q.answer);

        if (q.category === 'attack') {
            this.state.stats.attackTotal++;
            if (isCorrect) this.state.stats.attackCorrect++;
        } else if (q.category === 'break') {
            this.state.stats.breakTotal++;
            if (isCorrect) this.state.stats.breakCorrect++;
        } else {
            this.state.stats.defenseTotal++;
            if (isCorrect) this.state.stats.defenseCorrect++;
        }
        this.saveGame();

        if (isCorrect) {
            soundFX.playCorrect();
            document.getElementById('question-modal').classList.add('hidden');
            this.resolveCardEffect(aq.handIndex, aq.card, q, true);
            this.activeQuestion = null;
        } else {
            soundFX.playWrong();
            this.showExplanationBeforeResolve(userAns, aq, false);
        }
    }

    showExplanationBeforeResolve(userAns, aq, isTimeout = false) {
        const q = aq.question;
        const st = this.getComputedStats();
        const grazePct = Math.round(st.grazeRate * 100);
        const modal = document.getElementById('question-modal');
        modal.innerHTML = `
            <div class="modal-card explanation-modal-card">
                <div class="exp-header">
                    ${isTimeout
                        ? (q.isBopomofo ? `⏰ ㄕˊ ㄐㄧㄢ ㄉㄠˋ ㄌㄜ˙！（只造成 ${grazePct}% 效果）` : `⏰ 作答時間到！魔法詠唱逾時（只造成 ${grazePct}% 效果）`)
                        : (q.isBopomofo ? `💥 ㄉㄚˊ ㄘㄨㄛˋ ㄌㄜ˙！（只造成 ${grazePct}% 效果）` : `💥 魔法詠唱失誤（只造成 ${grazePct}% 效果）`)}
                </div>
                <p class="exp-compare">
                    ${q.isBopomofo ? 'ㄋㄧˇ ㄉㄜ˙ ㄉㄚˊ ㄢˋ' : '你的作答'}：<span class="wrong-val">${userAns}</span> ｜
                    ${q.isBopomofo ? 'ㄓㄥˋ ㄑㄩㄝˋ ㄉㄚˊ ㄢˋ' : '正確答案'}：<span class="correct-val">${q.answer}</span>
                </p>
                <div class="exp-box">
                    <h4>📖 ${q.isBopomofo ? 'ㄇㄛˊ ㄉㄠˇ ㄕㄨ ㄐㄧㄝˇ ㄕˋ：' : '魔導書步驟解析：'}</h4>
                    <p class="${q.isBopomofo ? 'bopomofo-text' : ''}">${q.explanation}</p>
                </div>
                <button class="btn-primary" id="btn-exp-continue">
                    ${q.isBopomofo ? 'ㄨㄛˇ ㄓ ㄉㄠˋ ㄌㄜ˙！ㄐㄧˋ ㄒㄩˋ 💪' : '我知道了！繼續戰鬥 💪'}
                </button>
            </div>
        `;
        document.getElementById('btn-exp-continue').onclick = () => {
            soundFX.playClick();
            modal.classList.add('hidden');
            this.resolveCardEffect(aq.handIndex, aq.card, q, false);
            this.activeQuestion = null;
        };
    }

    // ==========================================
    // ✨ 播放卡牌華麗 Google Imagen 3.0 多階段大招動畫與 60fps 粒子特效
    // ==========================================
    playCardVFX(card, isCorrect, floatText = '', floatClass = 'float-dmg') {
        const witchCard = document.querySelector('#battle-view .witch-combatant');
        const enemyCard = document.querySelector('#battle-view .enemy-combatant');
        const arena = document.querySelector('#battle-view .battle-arena');
        if (!witchCard || !enemyCard || !arena) return;

        if (window.SpellCinemaEngine) {
            SpellCinemaEngine.playCardAnimation(arena, witchCard, enemyCard, card, isCorrect, floatText, floatClass);
        }
    }

    // 結算四大類卡牌效果（🔥攻擊、⚡破甲、🛡️防禦、💖回復／秘法）
    resolveCardEffect(handIndex, card, question, isCorrect) {
        const b = this.battle;
        const p = b.player;
        const e = b.enemy;
        const st = this.getComputedStats();

        p.mp -= card.cost;
        const [removed] = b.hand.splice(handIndex, 1);
        b.discardPile.push(removed);

        if (card.type === 'attack') {
            let base = card.baseDmg;
            let bonusNotes = [];

            if (isCorrect && card.doubleOnParens && question.hasParens) {
                base *= 2;
                bonusNotes.push(`進階暴擊翻倍(${base})`);
            }

            const atkMult = card.atkMultiplier || 1;
            let rawDmg = base + (p.atk * atkMult) + p.nextAtkBuff;
            if (atkMult > 1) bonusNotes.push(`${atkMult}倍魔攻加成`);
            if (p.nextAtkBuff > 0) {
                bonusNotes.push(`增益+${p.nextAtkBuff}`);
                p.nextAtkBuff = 0;
            }

            if (isCorrect && question.hasParens && this.state.relics.includes('gold_bracket')) {
                rawDmg += 12;
                bonusNotes.push(`🏅黃金括號徽章+12`);
            }

            let finalDmg = isCorrect ? rawDmg : Math.max(1, Math.floor(rawDmg * st.grazeRate));
            if (e.remainderArmor) {
                finalDmg = Math.max(1, Math.floor(finalDmg * 0.3));
                bonusNotes.push(`敵方餘數裝甲減傷`);
            }

            soundFX.playAttack();
            this.dealDamageToEnemy(finalDmg);
            const noteStr = bonusNotes.length ? `（${bonusNotes.join('、')}）` : '';
            this.addBattleLog(isCorrect
                ? `🔥 答對！【${card.name}】造成 100% 暴擊 ${finalDmg} 點傷害${noteStr}！`
                : `💨 答錯失誤…【${card.name}】造成 ${finalDmg} 點擦傷。`);
            this.playCardVFX(card, isCorrect, isCorrect ? `🔥 -${finalDmg} 暴擊!` : `💨 -${finalDmg} 擦傷`, 'float-dmg');

        } else if (card.type === 'break') {
            let rawDmg = card.baseDmg + p.atk + p.nextAtkBuff;
            p.nextAtkBuff = 0;

            if (isCorrect) {
                soundFX.playThunder();
                let brokeMsg = '';
                if (e.remainderArmor) {
                    e.remainderArmor = false;
                    brokeMsg += '擊碎【餘數裝甲】、';
                }
                if (e.shield > 0) {
                    brokeMsg += `直接歸零 ${e.shield} 點護盾、`;
                    e.shield = 0;
                }
                if (card.stun) {
                    e.stunned = true;
                    brokeMsg += '暈眩怪物 1 回合、';
                }
                this.dealDamageToEnemy(rawDmg);
                this.addBattleLog(`⚡ 答對！【${card.name}】${brokeMsg}並造成 ${rawDmg} 點雷電貫穿傷害！`);
                this.playCardVFX(card, true, `⚡ 破盾暈眩! -${rawDmg}`, 'float-break');
            } else {
                const graze = Math.max(1, Math.floor(rawDmg * st.grazeRate));
                soundFX.playAttack();
                this.dealDamageToEnemy(graze);
                this.addBattleLog(`💨 答錯失誤…未能擊碎護盾，僅造成 ${graze} 點擦傷。`);
                this.playCardVFX(card, false, `💨 -${graze} 擦傷`, 'float-break');
            }

        } else if (card.type === 'defense') {
            if (isCorrect) {
                soundFX.playShield();
                const gainShield = card.baseShield + st.shieldHealBonus;
                p.shield += gainShield;
                p.reflectDmg += (card.reflectDmg || 0);
                p.nextAtkBuff += (card.atkBuff || 0);

                let healTotal = (card.healOnCorrect || 0) + (st.shieldHealBonus > 0 ? 4 : 0);
                if (this.state.relics.includes('crystal_protractor')) {
                    healTotal += 8;
                }
                if (healTotal > 0) {
                    p.hp = Math.min(p.maxHp, p.hp + healTotal);
                }

                if (e.breathAngle) {
                    p.perfectParryReady = true;
                    this.addBattleLog(`🛡️ 完美解答！展開 ${gainShield} 點護盾並完成【廣角吐息完美格擋】準備！`);
                    this.playCardVFX(card, true, `✨ 完美格擋準備! +${gainShield}盾`, 'float-shield');
                } else {
                    this.addBattleLog(`🛡️ 答對！獲得 ${gainShield} 護盾、反彈 +${card.reflectDmg}、下次攻擊 +${card.atkBuff}${healTotal > 0 ? `，並回復 ${healTotal} HP` : ''}！`);
                    this.playCardVFX(card, true, `🛡️ +${gainShield} 護盾!`, 'float-shield');
                }
            } else {
                const grazeShield = Math.max(1, Math.floor(card.baseShield * st.grazeRate));
                p.shield += grazeShield;
                this.addBattleLog(`💨 答錯失誤…魔法陣不穩定，僅獲得 ${grazeShield} 點護盾。`);
                this.playCardVFX(card, false, `🛡️ +${grazeShield} 護盾`, 'float-shield');
            }

        } else if (card.type === 'heal') {
            if (isCorrect) {
                soundFX.playHeal();
                const healVal = (card.healAmount || 0) + st.shieldHealBonus;
                const shieldVal = (card.baseShield || 0) + st.shieldHealBonus;
                p.hp = Math.min(p.maxHp, p.hp + healVal);
                p.shield += shieldVal;

                let extraMsg = '';
                if (card.gainMp) {
                    p.mp += card.gainMp;
                    extraMsg += `、獲得 +${card.gainMp} 點 MP`;
                }
                if (card.drawExtra) {
                    this.drawCards(card.drawExtra);
                    extraMsg += `、額外抽 ${card.drawExtra} 張牌`;
                }
                this.addBattleLog(`💖 答對！【${card.name}】回復 ${healVal} 點 HP、獲得 ${shieldVal} 護盾${extraMsg}！`);
                this.playCardVFX(card, true, card.gainMp ? `🔮 +${card.gainMp} MP / +${healVal} HP!` : `💖 +${healVal} HP / +${shieldVal}盾!`, 'float-heal');
            } else {
                const grazeHeal = Math.max(1, Math.floor((card.healAmount || 10) * st.grazeRate));
                p.hp = Math.min(p.maxHp, p.hp + grazeHeal);
                this.addBattleLog(`💨 答錯失誤…【${card.name}】僅回復 ${grazeHeal} 點 HP。`);
                this.playCardVFX(card, false, `💖 +${grazeHeal} HP`, 'float-heal');
            }
        }

        // ✨ 觸發四大種族專屬被動技能（出牌答對時自動發動）
        if (isCorrect && st.raceObj && st.raceObj.onCardCorrect) {
            const rObj = st.raceObj;
            const eff = rObj.onCardCorrect;
            const skillEffects = [];
            if (eff.shield > 0) {
                p.shield += eff.shield;
                skillEffects.push(`🛡️ 護盾 +${eff.shield}`);
            }
            if (eff.heal > 0) {
                p.hp = Math.min(p.maxHp, p.hp + eff.heal);
                skillEffects.push(`💖 恢復 HP +${eff.heal}`);
            }
            if (eff.bonusDmg > 0 && e.hp > 0) {
                this.dealDamageToEnemy(eff.bonusDmg);
                skillEffects.push(`🦇 額外真實傷害 -${eff.bonusDmg}`);
            }
            if (skillEffects.length > 0) {
                this.addBattleLog(`${rObj.icon} 種族技能${rObj.skillName}發動：額外獲得 ${skillEffects.join('、')}！`);
            }
        }

        this.checkBattleOutcome();
    }

    dealDamageToEnemy(dmg) {
        const e = this.battle.enemy;
        let rem = dmg;
        if (e.shield > 0) {
            if (e.shield >= rem) {
                e.shield -= rem;
                rem = 0;
            } else {
                rem -= e.shield;
                e.shield = 0;
            }
        }
        e.hp = Math.max(0, e.hp - rem);
    }

    checkBattleOutcome() {
        const b = this.battle;
        this.renderBattle();

        if (b.enemy.hp <= 0) {
            if (b.waveIndex + 1 < b.stage.waves.length) {
                soundFX.playVictory();
                setTimeout(() => {
                    if (this.battle) this.setupWave(b.waveIndex + 1);
                }, 900);
            } else {
                setTimeout(() => {
                    if (this.battle) this.handleStageVictory();
                }, 850);
            }
            return true;
        }
        return false;
    }

    endPlayerTurn() {
        const b = this.battle;
        const p = b.player;
        const e = b.enemy;

        b.discardPile.push(...b.hand);
        b.hand = [];

        if (e.stunned) {
            this.addBattleLog(`💫 【${e.name}】處於暈眩狀態，跳過行動回合！`);
            e.stunned = false;
        } else if (e.breathAngle) {
            if (p.perfectParryReady) {
                const counterDmg = 60 + p.reflectDmg;
                p.perfectParryReady = false;
                p.reflectDmg = 0;
                this.dealDamageToEnemy(counterDmg);
                this.addBattleLog(`✨ 【完美格擋觸發】小魔女的折射盾完美偏轉了廣角吐息，免除傷害並反擊水晶龍姬 ${counterDmg} 點巨額傷害！`);
                this.playCardVFX(
                    { id: 'perfect_parry', name: '廣角吐息・完美格擋反擊', type: 'break', cost: 3, icon: '✨' },
                    true,
                    `✨ 完美折射反擊! -${counterDmg}`,
                    'float-break'
                );
                if (this.checkBattleOutcome()) return;
            } else {
                const breathDmg = e.atk + 10;
                this.damagePlayer(breathDmg, `${e.name}的【廣角吐息】`);
            }
            e.breathAngle = MathEngine.pick([110, 120, 135, 150]);
        } else {
            this.damagePlayer(e.atk, e.name);
        }

        if (p.hp <= 0) {
            this.handleStageDefeat();
            return;
        }

        b.turn++;

        if (e.mechanic === 'remainder_armor' && b.turn % 2 === 1 && !e.remainderArmor) {
            e.remainderArmor = true;
            this.addBattleLog(`⚙️ 【${e.name}】再次啟動了「餘數裝甲」！請用⚡破甲卡解除它！`);
        }

        // 本回合沒用完的 MP 保留並累積加上新回合獲得的 MP
        p.mp += p.mpPerTurn;
        this.addBattleLog(`💧 第 ${b.turn} 回合開始：魔力補充 +${p.mpPerTurn}（目前累積 ${p.mp} 點 MP）！`);
        p.perfectParryReady = false;
        this.drawCards(4);
        this.renderBattle();
    }

    damagePlayer(incomingDmg, sourceName) {
        const p = this.battle.player;
        const e = this.battle.enemy;
        soundFX.playAttack();

        let rem = incomingDmg;
        if (p.shield > 0) {
            if (p.shield >= rem) {
                p.shield -= rem;
                rem = 0;
            } else {
                rem -= p.shield;
                p.shield = 0;
            }
        }
        p.hp = Math.max(0, p.hp - rem);
        this.addBattleLog(`👾 【${sourceName}】發動攻擊！${this.state.charName}受到 ${rem} 點傷害（護盾抵擋 ${incomingDmg - rem} 點）。`);

        if (p.reflectDmg > 0 && e.hp > 0) {
            const ref = p.reflectDmg;
            p.reflectDmg = 0;
            this.dealDamageToEnemy(ref);
            this.addBattleLog(`📐 魔法陣反彈了 ${ref} 點傷害給【${e.name}】！`);
            this.checkBattleOutcome();
        }
    }

    handleStageVictory() {
        soundFX.playVictory();
        const st = this.battle.stage;
        const comp = this.getComputedStats();
        const goldMult = (comp.raceObj && comp.raceObj.goldMultiplier) ? comp.raceObj.goldMultiplier : 1;
        const finalGold = Math.round(st.rewardGold * goldMult);
        this.state.gold += finalGold;

        if (!this.state.clearedStages.includes(st.id)) {
            this.state.clearedStages.push(st.id);
        }

        let newRelic = null;
        if (st.relicDrop && !this.state.relics.includes(st.relicDrop)) {
            this.state.relics.push(st.relicDrop);
            newRelic = RELICS_DB[st.relicDrop];
        }

        this.saveGame();
        this.renderHeader();

        const modal = document.getElementById('question-modal');
        modal.classList.remove('hidden');
        modal.innerHTML = `
            <div class="modal-card victory-modal-card">
                <div class="victory-icon">🏆✨</div>
                <h3>恭喜【${this.state.charName}】通關【${st.name}】！</h3>
                <p>成功運用數學魔法與種族天賦擊退了所有怪物！快去「👗 紙娃娃服裝店」或「🛒 魔導商店」選購新造型與裝備吧！</p>
                <div class="victory-rewards-box">
                    <div class="v-reward-item">💰 獲得冒險金幣：<strong>+${finalGold} 金幣</strong> ${goldMult > 1 ? `<small style="color:#fde047;">(含人類種族 +20% 加成)</small>` : ''}</div>
                    ${newRelic ? `
                        <div class="v-relic-item">
                            <span class="v-relic-icon">${newRelic.icon}</span>
                            <div>
                                <strong>獲得首通寶物：【${newRelic.name}】</strong>
                                <p>${newRelic.desc}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <button class="btn-primary" id="btn-victory-return">返回魔法學院 🏰</button>
            </div>
        `;

        document.getElementById('btn-victory-return').onclick = () => {
            soundFX.playClick();
            modal.classList.add('hidden');
            this.exitBattleToAcademy();
        };
    }

    handleStageDefeat() {
        soundFX.playDefeat();
        const consolationGold = 25;
        this.state.gold += consolationGold;
        this.saveGame();
        this.renderHeader();

        const modal = document.getElementById('question-modal');
        modal.classList.remove('hidden');
        modal.innerHTML = `
            <div class="modal-card defeat-modal-card">
                <div class="victory-icon">💫🧙‍♀️</div>
                <h3>挑戰失敗，【${this.state.charName}】撤回學院休息</h3>
                <p>別氣餒！你保留了所有金幣，還獲得了 <strong>💰 +${consolationGold} 歷練金幣</strong>！<br>建議先到「🧘‍♀️ 冥想修煉室」提升生命值與攻擊力，或到「👗 紙娃娃服裝店／🛒 魔導商店」強化造型與裝備再來挑戰！</p>
                <button class="btn-primary" id="btn-defeat-return">返回魔法學院強化 💪</button>
            </div>
        `;

        document.getElementById('btn-defeat-return').onclick = () => {
            soundFX.playClick();
            modal.classList.add('hidden');
            this.exitBattleToAcademy();
        };
    }

    exitBattleToAcademy() {
        this.clearQuestionTimer();
        this.battle = null;
        document.body.classList.remove('in-battle-mode');
        if (window.innerHeight > 500) {
            this.toggleCompactHeader(false);
        }
        document.getElementById('battle-view').classList.add('hidden');
        document.getElementById('academy-view').classList.remove('hidden');
        this.renderHeader();
        this.renderPortal();
    }

    // ==========================================
    // 🎬 Google Imagen 3.0 華麗卡牌動畫展示廳 (VFX Preview Theater)
    // ==========================================
    openVfxGalleryModal() {
        const modal = document.getElementById('question-modal');
        modal.classList.remove('hidden');
        const st = this.getComputedStats();
        const rObj = st.raceObj;

        const allCards = [
            ...Object.values(CARDS_DB),
            {
                id: 'perfect_parry',
                name: '廣角吐息・完美反擊',
                type: 'break',
                typeName: '✨ 終極反擊',
                cost: 3,
                icon: '✨',
                desc: '第 6 關 Boss 戰特殊演出：萬花筒稜鏡光砲全反射轟擊！'
            }
        ];

        const btnsHtml = allCards.map(c => {
            const meta = window.SpellCinemaEngine ? SpellCinemaEngine.getCardVfxMeta(c.id) : { imagenKey: 'spark_bolt' };
            const thumbUrl = window.SpriteSheetManager ? SpriteSheetManager.getImagenUrl(meta.imagenKey) : '';
            return `
            <button class="vfx-preview-card-btn" data-cid="${c.id}">
                ${thumbUrl ? `<img src="${thumbUrl}" class="vfx-preview-thumb" alt="${c.name}" />` : `<span style="font-size:1.5rem;">${c.icon}</span>`}
                <div style="overflow:hidden;">
                    <div style="font-weight:bold;color:#fde047;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.icon} ${c.name}</div>
                    <div style="font-size:0.74rem;color:#94a3b8;">${c.typeName} · 💧${c.cost} MP</div>
                </div>
            </button>`;
        }).join('');

        modal.innerHTML = `
            <div class="modal-card vfx-gallery-modal-card">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div>
                        <h3 style="color:#fde047;margin:0;">🎬 Google Imagen 3.0 華麗卡牌魔法動畫展示廳</h3>
                        <p style="font-size:0.84rem;color:#cbd5e1;margin-top:3px;">點擊下方任一張卡牌，立即在預覽決鬥場由你的角色【${this.state.charName}】施放 <strong>Google Imagen 3.0</strong> 專屬大招特效！</p>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn-gold btn-sm" id="btn-vfx-autoplay">🎆 連續展演全部 15 種大招</button>
                        <button class="btn-secondary btn-sm" id="btn-vfx-close">✖ 關閉展示廳</button>
                    </div>
                </div>

                <!-- 互動預覽決鬥場 -->
                <div class="vfx-theater-arena" id="vfx-theater-arena">
                    <div class="combatant-card witch-combatant" id="vfx-theater-witch">
                        <div class="avatar-frame">${AvatarRenderer.getWitchSVG()}</div>
                        <div class="combatant-info">
                            <h3>${rObj.icon} ${this.state.charName} <small>(${rObj.name})</small></h3>
                            <div class="hp-bar-outer"><div class="hp-bar-inner" style="width:100%"></div><div class="hp-bar-label">❤️ HP: ${st.maxHp} / ${st.maxHp}</div></div>
                            <div class="combat-badges-row">
                                <span class="c-badge">🛡️ 護盾: <strong>28</strong></span>
                                <span class="c-badge">⚔️ 魔攻: <strong>${st.atk}</strong></span>
                            </div>
                        </div>
                    </div>
                    <div class="combatant-card enemy-combatant" id="vfx-theater-enemy">
                        <div class="avatar-frame">${AvatarRenderer.getEnemySVG('dragon', '#f43f5e')}</div>
                        <div class="combatant-info">
                            <h3>👑 萬花筒水晶龍姬 <small>(特效標靶)</small></h3>
                            <div class="hp-bar-outer"><div class="hp-bar-inner" style="width:85%"></div><div class="hp-bar-label">❤️ HP: 350 / 420</div></div>
                            <div class="combat-badges-row">
                                <span class="c-badge">🛡️ 數字護盾: <strong>180</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="vfx-gallery-btns-grid" id="vfx-gallery-btns">
                    ${btnsHtml}
                </div>
            </div>
        `;

        let autoTimer = null;
        const stopAuto = () => {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        };

        const triggerPreview = (cid) => {
            const card = allCards.find(x => x.id === cid) || allCards[0];
            const tArena = document.getElementById('vfx-theater-arena');
            const tWitch = document.getElementById('vfx-theater-witch');
            const tEnemy = document.getElementById('vfx-theater-enemy');
            if (!tArena || !tWitch || !tEnemy || !window.SpellCinemaEngine) return;

            let sampleText = '🔥 -68 暴擊!';
            let sampleClass = 'float-dmg';
            if (card.type === 'break') {
                sampleText = cid === 'perfect_parry' ? '✨ 完美折射反擊! -85' : '⚡ 破盾暈眩! -72';
                sampleClass = 'float-break';
            } else if (card.type === 'defense') {
                sampleText = `🛡️ +${card.baseShield || 28} 護盾!`;
                sampleClass = 'float-shield';
            } else if (card.type === 'heal') {
                sampleText = card.gainMp ? '🔮 +2 MP / +12 HP!' : `💖 +${card.healAmount || 42} HP!`;
                sampleClass = 'float-heal';
            } else if (card.cost >= 3) {
                sampleText = '⚔️ -98 終極次元暴擊!';
            }

            SpellCinemaEngine.playCardAnimation(tArena, tWitch, tEnemy, card, true, sampleText, sampleClass);
        };

        modal.querySelectorAll('.vfx-preview-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                stopAuto();
                triggerPreview(btn.dataset.cid);
            });
        });

        document.getElementById('btn-vfx-autoplay').onclick = () => {
            stopAuto();
            let idx = 0;
            triggerPreview(allCards[idx].id);
            idx++;
            autoTimer = setInterval(() => {
                if (!document.getElementById('vfx-theater-arena') || idx >= allCards.length) {
                    stopAuto();
                    return;
                }
                triggerPreview(allCards[idx].id);
                idx++;
            }, 1350);
        };

        document.getElementById('btn-vfx-close').onclick = () => {
            stopAuto();
            soundFX.playClick();
            modal.classList.add('hidden');
        };

        // 開啟時自動示範一招【時空連擊斬】！
        setTimeout(() => triggerPreview('chrono_slash'), 180);
    }

    // ==========================================
    // 💾 創角、四大種族選擇、本機多角色紀錄檔管理與重新開始系統 (v3.1)
    // ==========================================
    openCharacterAndSaveModal(isInitialStartup = false) {
        const modal = document.getElementById('question-modal');
        modal.classList.remove('hidden');

        // 創角表單暫存狀態
        let draftName = isInitialStartup ? '星辰露娜' : '';
        let draftGender = this.state.gender || 'female';
        let draftRace = this.state.race || 'elf';

        const randomNamesFemale = ['星辰露娜', '艾莉絲', '菲歐娜', '賽蕾絲蒂', '夜月緹雅', '芙蕾雅', '愛麗絲', '星宮凜'];
        const randomNamesMale = ['星辰里昂', '亞瑟', '凱爾', '路西安', '蒼穹諾亞', '伊澤爾', '雷恩', '星宮颯'];

        const renderSaveModal = () => {
            const raceKeys = Object.keys(RACES_DB);
            const selectedRaceObj = RACES_DB[draftRace] || RACES_DB.elf;
            const previewProfile = {
                race: draftRace,
                gender: draftGender,
                equippedCostume: { ...DEFAULT_COSTUME }
            };

            const racesHtml = raceKeys.map(rk => {
                const r = RACES_DB[rk];
                const isSel = draftRace === rk;
                const portraitUrl = AvatarRenderer.getRacePortraitUrl(rk);
                return `
                <div class="race-select-card ${isSel ? 'selected' : ''}" data-race="${rk}" style="--race-color:${r.themeColor};">
                    <div class="race-card-top">
                        ${portraitUrl ? `<img src="${portraitUrl}" class="race-card-thumb" alt="${r.name}" />` : `<span style="font-size:2rem;">${r.icon}</span>`}
                        <div>
                            <div class="race-card-title">${r.icon} ${r.name} <small>${r.title}</small></div>
                            <div class="race-stats-badges">
                                <span>❤️ HP: <strong>${r.baseHp}</strong></span>
                                <span>⚔️ ATK: <strong>${r.baseAtk}</strong></span>
                                <span>💰 初始金幣: <strong>${r.startGold}</strong></span>
                            </div>
                        </div>
                    </div>
                    <div class="race-skill-box">
                        <strong>✨ 種族技能${r.skillName}：</strong>
                        <span>${r.skillDesc}</span>
                    </div>
                </div>`;
            }).join('');

            const slotIds = Object.keys(this.saveSlots);
            const slotsHtml = slotIds.length === 0
                ? `<div class="empty-slots-msg">尚無本機人物紀錄檔，請於左側創立你的第一位主角！</div>`
                : slotIds.map(cid => {
                    const ch = this.saveSlots[cid];
                    const r = RACES_DB[ch.race] || RACES_DB.elf;
                    const isCurrent = cid === this.state.charId;
                    const gIcon = ch.gender === 'male' ? '👦少年' : '👧少女';
                    return `
                    <div class="save-slot-card ${isCurrent ? 'active-slot' : ''}">
                        <div class="save-slot-avatar">
                            ${AvatarRenderer.getPlayerPaperDollSVG(ch)}
                        </div>
                        <div class="save-slot-info">
                            <div class="save-slot-title">
                                <strong>${r.icon} ${ch.charName}</strong>
                                <span class="slot-meta-tag">${gIcon}・${r.name}</span>
                                ${isCurrent ? '<span class="tag-equipped">目前遊玩中</span>' : ''}
                            </div>
                            <div class="save-slot-stats">
                                ❤️ 基礎HP ${ch.baseHp} ｜ ⚔️ 基礎ATK ${ch.baseAtk} ｜ 💰 金幣 ${ch.gold} ｜ 🏆 通關 ${ch.clearedStages.length}/6 關
                            </div>
                            <div class="save-slot-time">🕒 最後紀錄：${ch.lastSavedAt || '剛剛'}</div>
                            <div class="save-slot-actions">
                                ${!isCurrent ? `<button class="btn-primary btn-xs btn-load-char" data-cid="${cid}">▶️ 讀取此人物</button>` : `<button class="btn-secondary btn-xs" disabled>✔️ 使用中</button>`}
                                <button class="btn-secondary btn-xs btn-restart-char" data-cid="${cid}" title="保留人物姓名與種族，將進度重置重新開始">🔄 重新開始此人</button>
                                <button class="btn-secondary btn-xs btn-export-char" data-cid="${cid}" title="下載此人物的本機 .json 紀錄檔">📥 匯出檔案</button>
                                ${slotIds.length > 1 ? `<button class="btn-secondary btn-xs btn-delete-char" data-cid="${cid}" style="color:#fda4af;border-color:#f43f5e;">🗑️ 刪除</button>` : ''}
                            </div>
                        </div>
                    </div>`;
                }).join('');

            modal.innerHTML = `
                <div class="modal-card char-save-modal-card">
                    <div class="char-modal-header">
                        <div>
                            <h3 style="color:#fde047;margin:0;">🧙‍♀️ 人物創角・四大種族選擇 ＆ 本機紀錄檔管理</h3>
                            <p style="font-size:0.84rem;color:#cbd5e1;margin-top:3px;">
                                每一個人物即一個獨立的本機紀錄檔（自動儲存於本機瀏覽器，亦可匯出/匯入 <code>.json</code> 檔案或隨時重新開始）！
                            </p>
                        </div>
                        <button class="btn-secondary btn-sm" id="btn-close-char-modal">✖ 返回遊戲</button>
                    </div>

                    <div class="char-save-grid">
                        <!-- 左欄：創立新人物（取名字、選性別、選種族） -->
                        <div class="char-create-panel">
                            <h4>✨ 創立新人物（建立新紀錄檔）</h4>
                            <div class="create-top-row">
                                <div class="create-paperdoll-preview">
                                    ${AvatarRenderer.getPlayerPaperDollSVG(previewProfile)}
                                </div>
                                <div class="create-form-fields">
                                    <label class="form-label">1. 為主角取名字：</label>
                                    <div style="display:flex;gap:6px;margin-bottom:10px;">
                                        <input type="text" id="input-char-name" class="char-name-input" maxlength="12" placeholder="請輸入角色名稱..." value="${draftName || (draftGender === 'male' ? '星辰里昂' : '星辰露娜')}" />
                                        <button class="btn-secondary btn-xs" id="btn-random-name" title="隨機產生奇幻名字">🎲 隨機</button>
                                    </div>

                                    <label class="form-label">2. 選擇性別與體型：</label>
                                    <div class="gender-btn-row">
                                        <button class="gender-select-btn ${draftGender === 'female' ? 'active' : ''}" data-gender="female">👧 魔導少女</button>
                                        <button class="gender-select-btn ${draftGender === 'male' ? 'active' : ''}" data-gender="male">👦 魔導少年</button>
                                    </div>
                                </div>
                            </div>

                            <label class="form-label" style="margin-top:8px;display:block;">3. 選擇種族（4 大種族原始屬性不同，並擁有專屬種族技能）：</label>
                            <div class="race-select-grid">
                                ${racesHtml}
                            </div>

                            <button class="btn-gold btn-create-confirm" id="btn-create-new-char">
                                🚀 以【${selectedRaceObj.name}${draftGender === 'male' ? '少年' : '少女'}】創立新紀錄檔並開始冒險！
                            </button>
                        </div>

                        <!-- 右欄：本機人物紀錄檔列表（每個人物一檔 + 匯入匯出 + 清空重新開始） -->
                        <div class="char-slots-panel">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                                <h4 style="margin:0;">💾 本機人物紀錄檔列表（共 ${slotIds.length} 個角色）</h4>
                                <div style="display:flex;gap:6px;">
                                    <label class="btn-secondary btn-xs" style="cursor:pointer;display:inline-flex;align-items:center;">
                                        📤 匯入紀錄檔(.json)
                                        <input type="file" id="input-import-save" accept=".json" style="display:none;" />
                                    </label>
                                    <button class="btn-secondary btn-xs" id="btn-wipe-all-saves" style="color:#fda4af;border-color:#f43f5e;">⚠️ 清空所有紀錄重新開始</button>
                                </div>
                            </div>
                            <div class="save-slots-list">
                                ${slotsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const nameInput = document.getElementById('input-char-name');
            if (nameInput) {
                nameInput.addEventListener('input', (e) => {
                    draftName = e.target.value;
                });
            }

            document.getElementById('btn-random-name').onclick = () => {
                soundFX.playClick();
                const pool = draftGender === 'male' ? randomNamesMale : randomNamesFemale;
                draftName = MathEngine.pick(pool);
                renderSaveModal();
            };

            modal.querySelectorAll('.gender-select-btn').forEach(btn => {
                btn.onclick = () => {
                    soundFX.playClick();
                    draftGender = btn.dataset.gender;
                    if (!draftName || randomNamesFemale.includes(draftName) || randomNamesMale.includes(draftName)) {
                        draftName = draftGender === 'male' ? '星辰里昂' : '星辰露娜';
                    }
                    renderSaveModal();
                };
            });

            modal.querySelectorAll('.race-select-card').forEach(card => {
                card.onclick = () => {
                    soundFX.playCardSelect();
                    draftRace = card.dataset.race;
                    renderSaveModal();
                };
            });

            // 創立新角色並切換為當前紀錄檔
            document.getElementById('btn-create-new-char').onclick = () => {
                const finalName = (document.getElementById('input-char-name').value || '').trim() || (draftGender === 'male' ? '星辰里昂' : '星辰露娜');
                const newCharState = this.getDefaultState({
                    charName: finalName,
                    gender: draftGender,
                    race: draftRace,
                    selectedGrade: this.state.selectedGrade
                });
                this.state = newCharState;
                this.needsInitialCreation = false;
                this.saveGame();
                soundFX.playVictory();
                modal.classList.add('hidden');
                if (this.battle) {
                    this.exitBattleToAcademy();
                } else {
                    this.renderHeader();
                    const activePanel = document.querySelector('.academy-panel.active');
                    if (activePanel) this.switchTab(activePanel.id.replace('panel-', ''));
                }
            };

            // 讀取指定人物紀錄檔
            modal.querySelectorAll('.btn-load-char').forEach(btn => {
                btn.onclick = () => {
                    const cid = btn.dataset.cid;
                    if (!this.saveSlots[cid]) return;
                    this.state = JSON.parse(JSON.stringify(this.saveSlots[cid]));
                    this.saveGame();
                    soundFX.playCardSelect();
                    modal.classList.add('hidden');
                    if (this.battle) {
                        this.exitBattleToAcademy();
                    } else {
                        this.updateGradeButtonsUI();
                        this.renderHeader();
                        const activePanel = document.querySelector('.academy-panel.active');
                        if (activePanel) this.switchTab(activePanel.id.replace('panel-', ''));
                    }
                };
            });

            // 重新開始指定人物（保留名字、性別、種族，但重置關卡、金幣、裝備與服裝）
            modal.querySelectorAll('.btn-restart-char').forEach(btn => {
                btn.onclick = () => {
                    const cid = btn.dataset.cid;
                    const targetChar = this.saveSlots[cid];
                    if (!targetChar) return;
                    if (confirm(`確定要讓【${targetChar.charName}】重新開始嗎？\n（將保留人物姓名、性別與種族，並清空關卡、裝備與服裝進度回到初始狀態）`)) {
                        const resetChar = this.getDefaultState({
                            charId: targetChar.charId,
                            charName: targetChar.charName,
                            gender: targetChar.gender,
                            race: targetChar.race,
                            selectedGrade: targetChar.selectedGrade
                        });
                        this.saveSlots[cid] = resetChar;
                        if (this.state.charId === cid) {
                            this.state = JSON.parse(JSON.stringify(resetChar));
                        }
                        this.saveGame();
                        soundFX.playHeal();
                        this.renderHeader();
                        renderSaveModal();
                    }
                };
            });

            // 匯出單一人物紀錄檔 (.json)
            modal.querySelectorAll('.btn-export-char').forEach(btn => {
                btn.onclick = () => {
                    const cid = btn.dataset.cid;
                    const targetChar = this.saveSlots[cid];
                    if (!targetChar) return;
                    soundFX.playClick();
                    const blob = new Blob([JSON.stringify(targetChar, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `魔導書紀錄檔_${targetChar.charName}_${targetChar.race}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                };
            });

            // 刪除單一人物紀錄檔
            modal.querySelectorAll('.btn-delete-char').forEach(btn => {
                btn.onclick = () => {
                    const cid = btn.dataset.cid;
                    const targetChar = this.saveSlots[cid];
                    if (!targetChar) return;
                    if (confirm(`確定要永久刪除人物紀錄檔【${targetChar.charName}】嗎？`)) {
                        delete this.saveSlots[cid];
                        const remainingIds = Object.keys(this.saveSlots);
                        if (this.state.charId === cid && remainingIds.length > 0) {
                            this.state = JSON.parse(JSON.stringify(this.saveSlots[remainingIds[0]]));
                        }
                        this.saveGame();
                        soundFX.playClick();
                        this.renderHeader();
                        renderSaveModal();
                    }
                };
            });

            // 匯入本機 .json 紀錄檔
            const importInput = document.getElementById('input-import-save');
            if (importInput) {
                importInput.onchange = (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        try {
                            const parsed = JSON.parse(ev.target.result);
                            const normalized = this.normalizeCharacterState({
                                ...parsed,
                                charId: parsed.charId || `char_import_${Date.now()}`
                            });
                            this.saveSlots[normalized.charId] = normalized;
                            this.state = JSON.parse(JSON.stringify(normalized));
                            this.saveGame();
                            soundFX.playVictory();
                            this.renderHeader();
                            renderSaveModal();
                        } catch (err) {
                            alert('匯入失敗：檔案格式不是有效的魔導書人物紀錄檔 (.json)');
                        }
                    };
                    reader.readAsText(file);
                };
            }

            // 清空所有紀錄・完全重新開始
            document.getElementById('btn-wipe-all-saves').onclick = () => {
                if (confirm('⚠️ 確定要【清空本機所有人物紀錄檔】並完全重新開始嗎？')) {
                    localStorage.removeItem(SAVE_SLOTS_KEY);
                    localStorage.removeItem(ACTIVE_CHAR_KEY);
                    localStorage.removeItem(SAVE_KEY);
                    this.saveSlots = {};
                    this.state = this.getDefaultState();
                    soundFX.playHeal();
                    if (this.battle) {
                        this.exitBattleToAcademy();
                    }
                    this.openCharacterAndSaveModal(true);
                }
            };

            const closeBtn = document.getElementById('btn-close-char-modal');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    soundFX.playClick();
                    if (Object.keys(this.saveSlots).length === 0) {
                        this.needsInitialCreation = false;
                        this.saveGame();
                        this.renderHeader();
                    }
                    modal.classList.add('hidden');
                };
            }
        };

        renderSaveModal();
    }

    promptQuickRestart() {
        const modal = document.getElementById('question-modal');
        modal.classList.remove('hidden');
        const rObj = RACES_DB[this.state.race] || RACES_DB.elf;

        modal.innerHTML = `
            <div class="modal-card">
                <h3 style="color:#fde047;margin-bottom:8px;">🔄 重新開始遊戲／重置紀錄選項</h3>
                <p style="color:#cbd5e1;font-size:0.92rem;margin-bottom:16px;">
                    目前遊玩角色：<strong>${rObj.icon} ${this.state.charName}（${rObj.name}${this.state.gender === 'male' ? '少年' : '少女'}）</strong><br>
                    請選擇你要重新開始的方式：
                </p>
                <div style="display:flex;flex-direction:column;gap:10px;text-align:left;">
                    <button class="btn-primary" id="btn-qr-current" style="padding:12px 16px;">
                        🔄 <strong>僅將目前人物【${this.state.charName}】重新開始</strong><br>
                        <small style="color:#e2e8f0;font-weight:normal;">保留人物名字、性別與種族，重置金幣、裝備、服裝與關卡進度（不影響其他人物紀錄檔）</small>
                    </button>
                    <button class="btn-gold" id="btn-qr-newchar" style="padding:12px 16px;">
                        ✨ <strong>創立新人物／切換其他紀錄檔</strong><br>
                        <small style="color:#1e293b;font-weight:normal;">保留目前人物進度，前往創角視窗重新取名字、選性別與四大種族開啟新紀錄檔</small>
                    </button>
                    <button class="btn-secondary" id="btn-qr-wipeall" style="padding:12px 16px;border-color:#f43f5e;color:#fda4af;">
                        ⚠️ <strong>清空本機所有紀錄檔・完全重新開始</strong><br>
                        <small style="color:#cbd5e1;font-weight:normal;">刪除本機全部人物存檔，回到最初創角畫面重新開始玩</small>
                    </button>
                </div>
                <div style="margin-top:16px;text-align:right;">
                    <button class="btn-secondary btn-sm" id="btn-qr-cancel">取消返回</button>
                </div>
            </div>
        `;

        document.getElementById('btn-qr-current').onclick = () => {
            const resetChar = this.getDefaultState({
                charId: this.state.charId,
                charName: this.state.charName,
                gender: this.state.gender,
                race: this.state.race,
                selectedGrade: this.state.selectedGrade
            });
            this.state = resetChar;
            this.saveGame();
            soundFX.playVictory();
            modal.classList.add('hidden');
            if (this.battle) {
                this.exitBattleToAcademy();
            } else {
                this.renderHeader();
                this.switchTab('portal');
            }
        };

        document.getElementById('btn-qr-newchar').onclick = () => {
            soundFX.playClick();
            this.openCharacterAndSaveModal(false);
        };

        document.getElementById('btn-qr-wipeall').onclick = () => {
            if (confirm('確定要清空本機所有人物紀錄檔並完全重新開始嗎？')) {
                localStorage.removeItem(SAVE_SLOTS_KEY);
                localStorage.removeItem(ACTIVE_CHAR_KEY);
                localStorage.removeItem(SAVE_KEY);
                this.saveSlots = {};
                this.state = this.getDefaultState();
                soundFX.playHeal();
                if (this.battle) {
                    this.exitBattleToAcademy();
                }
                this.openCharacterAndSaveModal(true);
            }
        };

        document.getElementById('btn-qr-cancel').onclick = () => {
            soundFX.playClick();
            modal.classList.add('hidden');
        };
    }

    // ==========================================
    // 🎓 教師展示／測試工具面板 (v3.1)
    // ==========================================
    openTeacherModal() {
        const modal = document.getElementById('question-modal');
        modal.classList.remove('hidden');
        modal.innerHTML = `
            <div class="modal-card">
                <h3>🎓 教師課堂展示與測試工具 (v3.1)</h3>
                <p style="margin-bottom:14px;color:#cbd5e1;">方便老師在課堂投影教學時快速解鎖指定關卡、發放測試金幣、解鎖全套 25 件紙娃娃服裝或展示遺物效果：</p>
                <div class="teacher-actions-grid">
                    <button class="btn-primary" id="btn-t-unlock">🔓 解鎖全部 6 個關卡</button>
                    <button class="btn-gold" id="btn-t-gold">💰 獲得 +10000 測試金幣</button>
                    <button class="btn-primary" id="btn-t-costumes">👗 解鎖全部 25 件紙娃娃服裝</button>
                    <button class="btn-primary" id="btn-t-relics">👑 獲得全部 3 件 Boss 遺物</button>
                </div>
                <div style="margin-top:18px;display:flex;justify-content:space-between;align-items:center;">
                    <button class="btn-secondary btn-sm" id="btn-t-reset" style="color:#fda4af;border-color:#f43f5e;">🔄 重置目前人物進度</button>
                    <button class="btn-secondary" id="btn-t-close">關閉視窗</button>
                </div>
            </div>
        `;

        document.getElementById('btn-t-unlock').onclick = () => {
            this.state.clearedStages = [1, 2, 3, 4, 5, 6];
            this.saveGame();
            this.renderHeader();
            this.renderPortal();
            soundFX.playVictory();
            modal.classList.add('hidden');
        };
        document.getElementById('btn-t-gold').onclick = () => {
            this.state.gold += 10000;
            this.saveGame();
            this.renderHeader();
            if (document.getElementById('panel-shop').classList.contains('active')) this.renderShop();
            if (document.getElementById('panel-wardrobe').classList.contains('active')) this.renderWardrobe();
            soundFX.playVictory();
            modal.classList.add('hidden');
        };
        document.getElementById('btn-t-costumes').onclick = () => {
            const allCostumeIds = [];
            Object.keys(COSTUMES_DB).forEach(sKey => {
                COSTUMES_DB[sKey].forEach(it => allCostumeIds.push(it.id));
            });
            this.state.ownedCostumes = Array.from(new Set([...this.state.ownedCostumes, ...allCostumeIds]));
            this.saveGame();
            this.renderHeader();
            if (document.getElementById('panel-wardrobe').classList.contains('active')) this.renderWardrobe();
            soundFX.playVictory();
            modal.classList.add('hidden');
        };
        document.getElementById('btn-t-relics').onclick = () => {
            this.state.relics = ['gold_bracket', 'crystal_protractor', 'archmage_badge'];
            this.saveGame();
            this.renderHeader();
            soundFX.playVictory();
            modal.classList.add('hidden');
        };
        document.getElementById('btn-t-reset').onclick = () => {
            modal.classList.add('hidden');
            this.promptQuickRestart();
        };
        document.getElementById('btn-t-close').onclick = () => {
            modal.classList.add('hidden');
        };
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameApp();
});
