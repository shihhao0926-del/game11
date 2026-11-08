// 《小魔女的數學魔導書》v1.1 Google Imagen 3.0 華麗卡牌魔法動畫引擎 (SpellCinemaEngine & SpriteSheetManager)
// 結合 Google Imagen 3.0 產生的 12 款純黑底高解析度奇幻魔法特效圖集 (Screen 濾色混合模式) + 60fps Canvas 粒子與多階段彈道演出

class SpriteSheetManager {
    static init() {
        this.frameSize = 160;
        this.frames = 8;
        this.sheetW = this.frameSize * this.frames;
        this.sheetH = this.frameSize;
        this.pngDataUrls = {};

        this.generateAllCanvasPngs();
        this.injectFallbackCss();
        this.upgradeWitchAvatars();
    }

    static getImagenUrl(key) {
        if (window.IMAGEN3_ASSETS && window.IMAGEN3_ASSETS[key]) {
            return window.IMAGEN3_ASSETS[key];
        }
        if (window.IMAGEN3_ATLAS_URLS && key === 'little_witch') {
            return window.IMAGEN3_ATLAS_URLS.witch;
        }
        return '';
    }

    static upgradeWitchAvatars() {
        const witchUrl = this.getImagenUrl('little_witch');
        if (!witchUrl) return;
        document.querySelectorAll('.brand-witch-avatar, .witch-img-avatar').forEach(img => {
            img.src = witchUrl;
        });
    }

    static createSheetCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.sheetW;
        canvas.height = this.sheetH;
        return canvas;
    }

    static drawStar(ctx, cx, cy, outerR, innerR, points, rot = 0, fillStyle = '#fde047', strokeStyle = null, lineWidth = 2) {
        ctx.save();
        ctx.beginPath();
        const step = Math.PI / points;
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const a = i * step - Math.PI / 2 + rot;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
        ctx.restore();
    }

    static generateAllCanvasPngs() {
        // 1. 🔥 火系元素魔法精靈圖
        const cFire = this.createSheetCanvas();
        const gFire = cFire.getContext('2d');
        for (let f = 0; f < 8; f++) {
            const cx = f * 160 + 80, cy = 80;
            const alpha = f < 6 ? 0.95 : Math.max(0.1, 0.95 * (1 - (f - 5) * 0.34));
            const rOuter = 22 + f * 7.5;

            const grad = gFire.createRadialGradient(cx, cy, 4, cx, cy, rOuter);
            grad.addColorStop(0, `rgba(255, 255, 210, ${alpha})`);
            grad.addColorStop(0.45, `rgba(255, 120, 20, ${alpha})`);
            grad.addColorStop(1, 'rgba(255, 30, 0, 0)');
            gFire.fillStyle = grad;
            gFire.beginPath();
            gFire.arc(cx, cy, rOuter, 0, Math.PI * 2);
            gFire.fill();

            this.drawStar(gFire, cx, cy, rOuter * 0.85, rOuter * 0.42, 8, f * 0.35, `rgba(255, 180, 20, ${alpha * 0.85})`);

            for (let p = 0; p < 6; p++) {
                const ang = p * 1.047 + f * 0.28;
                const dist = 14 + f * 7.2;
                this.drawStar(
                    gFire,
                    cx + Math.cos(ang) * dist,
                    cy + Math.sin(ang) * dist,
                    Math.max(3, 9 - f * 0.6),
                    Math.max(1.5, 4 - f * 0.3),
                    4,
                    f * 0.4,
                    `rgba(254, 240, 138, ${alpha})`
                );
            }
        }
        this.pngDataUrls.fire = cFire.toDataURL('image/png');

        // 2. 🌠 星隕與時空斬擊精靈圖
        const cMeteor = this.createSheetCanvas();
        const gMeteor = cMeteor.getContext('2d');
        for (let f = 0; f < 8; f++) {
            const cx = f * 160 + 80, cy = 80;
            const alpha = f < 6 ? 0.96 : Math.max(0.1, 0.96 * (1 - (f - 5) * 0.34));
            const rAura = 26 + f * 7;

            const grad = gMeteor.createRadialGradient(cx, cy, 4, cx, cy, rAura);
            grad.addColorStop(0, `rgba(255, 240, 255, ${alpha})`);
            grad.addColorStop(0.5, `rgba(192, 132, 252, ${alpha * 0.85})`);
            grad.addColorStop(1, 'rgba(88, 28, 135, 0)');
            gMeteor.fillStyle = grad;
            gMeteor.beginPath();
            gMeteor.arc(cx, cy, rAura, 0, Math.PI * 2);
            gMeteor.fill();

            const slashLen = 28 + f * 6.5;
            this.drawStar(gMeteor, cx, cy, slashLen, slashLen * 0.22, 4, f * 0.25, `rgba(244, 114, 182, ${alpha})`);
            this.drawStar(gMeteor, cx, cy, slashLen * 0.72, slashLen * 0.16, 4, f * 0.25 + 0.785, `rgba(254, 240, 138, ${alpha})`);
        }
        this.pngDataUrls.meteor = cMeteor.toDataURL('image/png');

        // 3. ⚡ 雷電破甲精靈圖
        const cThunder = this.createSheetCanvas();
        const gThunder = cThunder.getContext('2d');
        for (let f = 0; f < 8; f++) {
            const cx = f * 160 + 80, cy = 80;
            const alpha = f < 6 ? 0.98 : Math.max(0.1, 0.98 * (1 - (f - 5) * 0.34));
            const rGlow = 24 + f * 6.8;

            const grad = gThunder.createRadialGradient(cx, cy, 4, cx, cy, rGlow);
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            grad.addColorStop(0.5, `rgba(56, 189, 248, ${alpha * 0.85})`);
            grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
            gThunder.fillStyle = grad;
            gThunder.beginPath();
            gThunder.arc(cx, cy, rGlow, 0, Math.PI * 2);
            gThunder.fill();

            const jitter = (f % 2) * 8 - 4;
            gThunder.save();
            gThunder.beginPath();
            gThunder.moveTo(cx - 10 + jitter, 14);
            gThunder.lineTo(cx + 14 - jitter, 54);
            gThunder.lineTo(cx - 6 + jitter, 68);
            gThunder.lineTo(cx + 18 - jitter, 112);
            gThunder.lineTo(cx - 4 + jitter, 146);
            gThunder.strokeStyle = `rgba(250, 204, 21, ${alpha})`;
            gThunder.lineWidth = 7;
            gThunder.stroke();
            gThunder.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            gThunder.lineWidth = 3;
            gThunder.stroke();
            gThunder.restore();

            this.drawStar(gThunder, cx, cy, 20 + f * 6, 10 + f * 2.5, 10, f * 0.2, null, `rgba(254, 240, 138, ${alpha})`, 2.5);
        }
        this.pngDataUrls.thunder = cThunder.toDataURL('image/png');

        // 4. 🛡️ 幾何護盾魔法陣精靈圖
        const cShield = this.createSheetCanvas();
        const gShield = cShield.getContext('2d');
        for (let f = 0; f < 8; f++) {
            const cx = f * 160 + 80, cy = 80;
            const alpha = f < 6 ? 0.92 : Math.max(0.1, 0.92 * (1 - (f - 5) * 0.32));
            const r = 26 + Math.min(f, 5) * 7.5;

            const grad = gShield.createRadialGradient(cx, cy, 6, cx, cy, r * 1.15);
            grad.addColorStop(0, `rgba(56, 189, 248, ${alpha * 0.55})`);
            grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
            gShield.fillStyle = grad;
            gShield.beginPath();
            gShield.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
            gShield.fill();

            gShield.beginPath();
            gShield.arc(cx, cy, r, 0, Math.PI * 2);
            gShield.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
            gShield.lineWidth = 3.5;
            gShield.stroke();

            this.drawStar(gShield, cx, cy, r, r * 0.5, 3, f * 0.26, null, `rgba(250, 204, 21, ${alpha})`, 3);
            this.drawStar(gShield, cx, cy, r, r * 0.5, 3, -f * 0.26 + 1.047, null, `rgba(244, 114, 182, ${alpha})`, 2.5);
        }
        this.pngDataUrls.shield = cShield.toDataURL('image/png');

        // 5. 💖 星光治癒與魔力湧泉精靈圖
        const cHeal = this.createSheetCanvas();
        const gHeal = cHeal.getContext('2d');
        for (let f = 0; f < 8; f++) {
            const cx = f * 160 + 80, cy = 80;
            const alpha = f < 6 ? 0.94 : Math.max(0.1, 0.94 * (1 - (f - 5) * 0.32));
            const r = 25 + f * 6.5;

            const grad = gHeal.createRadialGradient(cx, cy, 4, cx, cy, r);
            grad.addColorStop(0, `rgba(167, 243, 208, ${alpha * 0.85})`);
            grad.addColorStop(0.6, `rgba(52, 211, 153, ${alpha * 0.55})`);
            grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
            gHeal.fillStyle = grad;
            gHeal.beginPath();
            gHeal.arc(cx, cy, r, 0, Math.PI * 2);
            gHeal.fill();

            for (let i = 0; i < 5; i++) {
                const sx = cx + (i - 2) * 20;
                const sy = cy + 30 - f * 9 - (i % 2) * 14;
                this.drawStar(gHeal, sx, sy, 11, 4.5, 4, f * 0.3, `rgba(254, 240, 138, ${alpha})`);
            }
        }
        this.pngDataUrls.heal = cHeal.toDataURL('image/png');
    }

    static injectFallbackCss() {
        const style = document.createElement('style');
        style.textContent = `
            .vfx-sprite-player.vfx-fire {
                background-image: url("assets/fx_fire_sprite.png"), url("${this.pngDataUrls.fire}");
            }
            .vfx-sprite-player.vfx-meteor {
                background-image: url("assets/fx_meteor_sprite.png"), url("${this.pngDataUrls.meteor}");
            }
            .vfx-sprite-player.vfx-thunder {
                background-image: url("assets/fx_thunder_sprite.png"), url("${this.pngDataUrls.thunder}");
            }
            .vfx-sprite-player.vfx-shield {
                background-image: url("assets/fx_shield_sprite.png"), url("${this.pngDataUrls.shield}");
            }
            .vfx-sprite-player.vfx-heal {
                background-image: url("assets/fx_heal_sprite.png"), url("${this.pngDataUrls.heal}");
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================================================
// 🎬 Google Imagen 3.0 華麗卡牌大招動畫劇場引擎 (SpellCinemaEngine)
// 針對全部 14 張卡牌 + 廣角吐息完美格擋反擊，提供獨立的多階段視覺特效與 60fps 粒子系統
// ============================================================================
class SpellCinemaEngine {
    static getCardVfxMeta(cardId) {
        const metaMap = {
            spark_bolt: {
                imagenKey: 'spark_bolt',
                subImagenKey: 'flame_slash',
                spriteClass: 'vfx-fire',
                bannerTitle: '🔥 魔導連射：【星火魔彈】！',
                bannerSub: 'Google Imagen 3.0 五連星火彗星魔彈齊發',
                primaryColor: '#fb923c',
                secondaryColor: '#fde047',
                glowColor: 'rgba(251, 146, 60, 0.75)',
                deliveryType: 'star_barrage',
                particleShape: 'star'
            },
            flame_slash: {
                imagenKey: 'flame_slash',
                subImagenKey: 'spark_bolt',
                spriteClass: 'vfx-fire',
                bannerTitle: '☄️ 紅蓮劍技：【烈焰魔刃】！',
                bannerSub: 'Google Imagen 3.0 鳳凰紅蓮火柱 × 烈焰弧光斬',
                primaryColor: '#ef4444',
                secondaryColor: '#facc15',
                glowColor: 'rgba(239, 68, 68, 0.8)',
                deliveryType: 'phoenix_slash',
                particleShape: 'ember'
            },
            chain_fireball: {
                imagenKey: 'chain_fireball',
                subImagenKey: 'flame_slash',
                spriteClass: 'vfx-fire',
                bannerTitle: '🌋 雙倍爆炎：【連珠火球】！',
                bannerSub: 'Google Imagen 3.0 三連珠熔岩火龍漩渦連環爆破',
                primaryColor: '#f97316',
                secondaryColor: '#fef08a',
                glowColor: 'rgba(249, 115, 22, 0.85)',
                deliveryType: 'triple_fireball',
                particleShape: 'ember'
            },
            bracket_meteor: {
                imagenKey: 'bracket_meteor',
                subImagenKey: 'prism_burst',
                spriteClass: 'vfx-meteor',
                bannerTitle: '🌠 星辰奧義：【括號星隕術】！',
                bannerSub: 'Google Imagen 3.0 銀河星環隕石群天際墜落',
                primaryColor: '#c084fc',
                secondaryColor: '#f472b6',
                glowColor: 'rgba(192, 132, 252, 0.85)',
                deliveryType: 'cosmic_meteor',
                particleShape: 'star'
            },
            chrono_slash: {
                imagenKey: 'chrono_slash',
                subImagenKey: 'bracket_meteor',
                spriteClass: 'vfx-meteor',
                bannerTitle: '⚔️ 3MP 終極禁咒：【時空連擊斬】！',
                bannerSub: 'Google Imagen 3.0 時空羅馬鐘陣 × 六連次元空間碎裂斬',
                primaryColor: '#38bdf8',
                secondaryColor: '#d946ef',
                glowColor: 'rgba(217, 70, 239, 0.9)',
                deliveryType: 'chrono_dimension',
                particleShape: 'shard'
            },
            thunder_break: {
                imagenKey: 'divine_thunder',
                subImagenKey: 'hyper_thunder',
                spriteClass: 'vfx-thunder',
                bannerTitle: '⚡ 貫穿雷鳴：【雷鳴破擊】！',
                bannerSub: 'Google Imagen 3.0 轟雷落柱擊碎敵方數字護盾',
                primaryColor: '#38bdf8',
                secondaryColor: '#facc15',
                glowColor: 'rgba(56, 189, 248, 0.85)',
                deliveryType: 'lightning_strike',
                particleShape: 'spark'
            },
            hyper_thunder: {
                imagenKey: 'hyper_thunder',
                subImagenKey: 'divine_thunder',
                spriteClass: 'vfx-thunder',
                bannerTitle: '🌩️ 電磁極速：【超導雷神槍】！',
                bannerSub: 'Google Imagen 3.0 超導電磁雷鳴長槍音爆貫穿',
                primaryColor: '#22d3ee',
                secondaryColor: '#fde047',
                glowColor: 'rgba(34, 211, 238, 0.85)',
                deliveryType: 'railgun_spear',
                particleShape: 'spark'
            },
            divine_thunder: {
                imagenKey: 'divine_thunder',
                subImagenKey: 'prism_burst',
                spriteClass: 'vfx-thunder',
                bannerTitle: '⚡ 3MP 終極神罰：【天罰神雷破】！',
                bannerSub: 'Google Imagen 3.0 三重天罰神雷巨柱 × 晶盾徹底粉碎',
                primaryColor: '#facc15',
                secondaryColor: '#38bdf8',
                glowColor: 'rgba(250, 204, 21, 0.92)',
                deliveryType: 'heaven_judgment',
                particleShape: 'spark'
            },
            tri_shield: {
                imagenKey: 'tri_shield',
                subImagenKey: 'prism_burst',
                spriteClass: 'vfx-shield',
                bannerTitle: '📐 幾何防禦：【三角折射盾】！',
                bannerSub: 'Google Imagen 3.0 神聖三角量角器稜鏡折射結界',
                primaryColor: '#38bdf8',
                secondaryColor: '#fde047',
                glowColor: 'rgba(56, 189, 248, 0.8)',
                deliveryType: 'triangle_prism',
                particleShape: 'shard'
            },
            star_barrier: {
                imagenKey: 'star_barrier',
                subImagenKey: 'tri_shield',
                spriteClass: 'vfx-shield',
                bannerTitle: '🛡️ 星象結界：【星芒守護陣】！',
                bannerSub: 'Google Imagen 3.0 六芒星星座聖域與水晶光羽',
                primaryColor: '#c084fc',
                secondaryColor: '#fde047',
                glowColor: 'rgba(192, 132, 252, 0.8)',
                deliveryType: 'hexagram_sanctuary',
                particleShape: 'feather'
            },
            prism_aegis: {
                imagenKey: 'tri_shield',
                subImagenKey: 'prism_burst',
                spriteClass: 'vfx-shield',
                bannerTitle: '💎 秘傳聖盾：【萬花筒稜鏡盾】！',
                bannerSub: 'Google Imagen 3.0 全息鑽石稜鏡光罩 × 七彩反射星芒',
                primaryColor: '#ec4899',
                secondaryColor: '#22d3ee',
                glowColor: 'rgba(236, 72, 153, 0.85)',
                deliveryType: 'kaleidoscope_dome',
                particleShape: 'shard'
            },
            starlight_heal: {
                imagenKey: 'starlight_heal',
                subImagenKey: 'star_barrier',
                spriteClass: 'vfx-heal',
                bannerTitle: '💖 星櫻恩典：【星光治癒術】！',
                bannerSub: 'Google Imagen 3.0 翠綠粉櫻星光漩渦與水晶愛心湧現',
                primaryColor: '#34d399',
                secondaryColor: '#f472b6',
                glowColor: 'rgba(52, 211, 153, 0.8)',
                deliveryType: 'fairy_fountain',
                particleShape: 'heart'
            },
            mana_spring: {
                imagenKey: 'mana_spring',
                subImagenKey: 'starlight_heal',
                spriteClass: 'vfx-heal',
                bannerTitle: '🔮 秘法回魔：【魔力湧泉陣】！',
                bannerSub: 'Google Imagen 3.0 蔚藍魔力漩渦湧泉 × 魔力水晶注入',
                primaryColor: '#38bdf8',
                secondaryColor: '#a855f7',
                glowColor: 'rgba(56, 189, 248, 0.85)',
                deliveryType: 'mana_vortex',
                particleShape: 'orb'
            },
            rainbow_heal: {
                imagenKey: 'mana_spring',
                subImagenKey: 'prism_burst',
                spriteClass: 'vfx-heal',
                bannerTitle: '🌈 聖光奇蹟：【彩虹聖光頌】！',
                bannerSub: 'Google Imagen 3.0 黃金天使光翼 × 七彩極光聖詠祝福',
                primaryColor: '#facc15',
                secondaryColor: '#34d399',
                glowColor: 'rgba(250, 204, 21, 0.85)',
                deliveryType: 'rainbow_aurora',
                particleShape: 'feather'
            },
            perfect_parry: {
                imagenKey: 'prism_burst',
                subImagenKey: 'tri_shield',
                spriteClass: 'vfx-thunder',
                bannerTitle: '✨ 幾何奧義：【廣角吐息・完美格擋反擊】！',
                bannerSub: 'Google Imagen 3.0 萬花筒稜鏡折射光砲全反射轟擊',
                primaryColor: '#fde047',
                secondaryColor: '#ec4899',
                glowColor: 'rgba(253, 224, 71, 0.95)',
                deliveryType: 'parry_counter_beam',
                particleShape: 'shard'
            }
        };
        return metaMap[cardId] || metaMap.spark_bolt;
    }

    static playCardAnimation(arena, witchCard, enemyCard, card, isCorrect = true, floatText = '', floatClass = 'float-dmg') {
        if (!arena || !witchCard || !enemyCard) return;

        const cardId = card.id || 'spark_bolt';
        const meta = this.getCardVfxMeta(cardId);
        const isOffensive = (card.type === 'attack' || card.type === 'break' || cardId === 'perfect_parry');
        const targetEl = isOffensive ? enemyCard : witchCard;
        const isUltimate = (card.cost >= 3 || cardId === 'bracket_meteor' || cardId === 'chain_fireball' || cardId === 'perfect_parry');

        // 播放對應卡牌的強化合成音效
        if (window.soundFX && window.soundFX.playSpellByCardId) {
            window.soundFX.playSpellByCardId(cardId);
        }

        // 1. 小魔女詠唱出招動作 + 腳下專屬幾何詠唱魔法陣
        witchCard.classList.remove('cast-lunge');
        void witchCard.offsetWidth;
        witchCard.classList.add('cast-lunge');
        this.spawnCasterMagicCircle(witchCard, meta);

        // 2. 頂部華麗魔導詠唱橫幅 (Spell Cut-in Banner)
        if (isCorrect) {
            this.spawnSpellBanner(arena, card, meta, isUltimate);
        }

        // 3. 建立全決鬥場特效覆蓋層 (Overlay Stage + 60fps Particle Canvas)
        const stageOverlay = document.createElement('div');
        stageOverlay.className = `vfx-cinema-stage ${isUltimate && isCorrect ? 'vfx-cinema-dim' : ''}`;
        arena.appendChild(stageOverlay);

        const arenaRect = arena.getBoundingClientRect();
        const witchRect = witchCard.getBoundingClientRect();
        const enemyRect = enemyCard.getBoundingClientRect();

        const startX = (witchRect.left - arenaRect.left) + witchRect.width * 0.62;
        const startY = (witchRect.top - arenaRect.top) + witchRect.height * 0.48;
        const endX = (enemyRect.left - arenaRect.left) + enemyRect.width * 0.42;
        const endY = (enemyRect.top - arenaRect.top) + enemyRect.height * 0.48;
        const targetCenterX = isOffensive ? endX : (witchRect.left - arenaRect.left) + witchRect.width * 0.48;
        const targetCenterY = isOffensive ? endY : (witchRect.top - arenaRect.top) + witchRect.height * 0.48;

        // 若答錯（擦傷），播放輕量版特效
        if (!isCorrect) {
            this.spawnImpactImagenLayer(targetEl, meta, false, false, floatText, floatClass);
            setTimeout(() => stageOverlay.remove(), 800);
            return;
        }

        // 4. 根據 15 種卡牌專屬彈道類型執行第 2 階段 (Delivery) 與第 3 階段 (Imagen 3.0 爆發 + 60fps 粒子)
        const triggerMainImpact = (extraScale = 1) => {
            if (isOffensive) {
                targetEl.classList.remove('hit-shake');
                void targetEl.offsetWidth;
                targetEl.classList.add('hit-shake');
                if (isUltimate) {
                    arena.classList.remove('arena-ult-shake');
                    void arena.offsetWidth;
                    arena.classList.add('arena-ult-shake');
                }
            }
            this.spawnImpactImagenLayer(targetEl, meta, true, isUltimate, floatText, floatClass, extraScale);
            this.runCanvasParticleBurst(stageOverlay, targetCenterX, targetCenterY, meta, isUltimate ? 85 : 52);
        };

        switch (meta.deliveryType) {
            case 'star_barrage': {
                // 🔥 星火魔彈：5 發 Google Imagen 3.0 星火彗星彈扇形連射
                const imgUrl = SpriteSheetManager.getImagenUrl('spark_bolt');
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const orb = document.createElement('div');
                        orb.className = 'vfx-imagen-projectile';
                        orb.style.left = `${startX}px`;
                        orb.style.top = `${startY + (i - 2) * 18}px`;
                        orb.style.setProperty('--tx', `${endX - startX + (i - 2) * 14}px`);
                        orb.style.setProperty('--ty', `${endY - startY + (i - 2) * 12}px`);
                        if (imgUrl) {
                            orb.style.backgroundImage = `url("${imgUrl}")`;
                        }
                        stageOverlay.appendChild(orb);
                    }, i * 65);
                }
                setTimeout(() => triggerMainImpact(1.05), 320);
                break;
            }

            case 'phoenix_slash': {
                // ☄️ 烈焰魔刃：巨型紅蓮火刃橫掃 + 鳳凰火柱爆發
                const crescent = document.createElement('div');
                crescent.className = 'vfx-crescent-wave';
                crescent.style.left = `${startX}px`;
                crescent.style.top = `${startY - 70}px`;
                crescent.style.setProperty('--tx', `${endX - startX}px`);
                stageOverlay.appendChild(crescent);

                setTimeout(() => {
                    this.spawnSlashLine(targetEl, -35, '#fde047', '#ef4444');
                    triggerMainImpact(1.18);
                }, 220);
                break;
            }

            case 'triple_fireball': {
                // 🌋 連珠火球：3 發巨型 Google Imagen 3.0 熔岩火球接連轟炸 (HIT x1, x2, x3)
                const imgUrl = SpriteSheetManager.getImagenUrl('chain_fireball');
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const fb = document.createElement('div');
                        fb.className = 'vfx-imagen-projectile vfx-proj-lg';
                        fb.style.left = `${startX}px`;
                        fb.style.top = `${startY + (i - 1) * 24}px`;
                        fb.style.setProperty('--tx', `${endX - startX}px`);
                        fb.style.setProperty('--ty', `${endY - startY}px`);
                        if (imgUrl) fb.style.backgroundImage = `url("${imgUrl}")`;
                        stageOverlay.appendChild(fb);

                        setTimeout(() => {
                            this.spawnComboBadge(targetEl, `🔥 連珠 HIT ×${i + 1}!`, i);
                            if (i < 2) {
                                this.runCanvasParticleBurst(stageOverlay, endX, endY, meta, 28);
                            } else {
                                triggerMainImpact(1.28);
                            }
                        }, 230);
                    }, i * 165);
                }
                break;
            }

            case 'cosmic_meteor': {
                // 🌠 括號星隕術：天際召喚巨型 Google Imagen 3.0 銀河星雲隕石斜墜轟擊
                const imgUrl = SpriteSheetManager.getImagenUrl('bracket_meteor');
                for (let i = 0; i < 4; i++) {
                    const meteor = document.createElement('div');
                    meteor.className = i === 0 ? 'vfx-sky-meteor vfx-meteor-main' : 'vfx-sky-meteor vfx-meteor-mini';
                    meteor.style.left = `${endX - 220 + (i - 1) * 45}px`;
                    meteor.style.top = `-120px`;
                    meteor.style.setProperty('--mx', `220px`);
                    meteor.style.setProperty('--my', `${endY + 110}px`);
                    meteor.style.animationDelay = `${i * 70}ms`;
                    if (imgUrl) meteor.style.backgroundImage = `url("${imgUrl}")`;
                    stageOverlay.appendChild(meteor);
                }
                setTimeout(() => triggerMainImpact(1.38), 360);
                break;
            }

            case 'chrono_dimension': {
                // ⚔️ 時空連擊斬 (3 MP 終極大招)：羅馬時鐘結界 + 6 道次元劍光連斬 + 空間碎裂
                const clockEl = document.createElement('div');
                clockEl.className = 'vfx-imagen-clock-domain';
                const clockUrl = SpriteSheetManager.getImagenUrl('chrono_slash');
                if (clockUrl) clockEl.style.backgroundImage = `url("${clockUrl}")`;
                targetEl.appendChild(clockEl);
                setTimeout(() => clockEl.remove(), 1450);

                const angles = [-42, 42, -15, 75, -72, 12];
                angles.forEach((ang, idx) => {
                    setTimeout(() => {
                        this.spawnSlashLine(targetEl, ang, '#ffffff', idx % 2 === 0 ? '#38bdf8' : '#e879f9');
                        this.spawnComboBadge(targetEl, `⚔️ 時空斬 ×${idx + 1}`, idx % 3);
                    }, 90 + idx * 75);
                });

                setTimeout(() => {
                    triggerMainImpact(1.45);
                }, 540);
                break;
            }

            case 'lightning_strike': {
                // ⚡ 雷鳴破擊：垂直落雷光柱 + 護盾碎裂
                this.spawnLightningBoltSVG(stageOverlay, endX, 0, endX, endY, '#38bdf8', '#fde047');
                setTimeout(() => triggerMainImpact(1.2), 160);
                break;
            }

            case 'railgun_spear': {
                // 🌩️ 超導雷神槍：3 道黃金音爆環 + Google Imagen 3.0 超導雷神長槍高速貫穿
                for (let r = 0; r < 3; r++) {
                    const ring = document.createElement('div');
                    ring.className = 'vfx-railgun-ring';
                    ring.style.left = `${startX + 45 + r * ((endX - startX - 60) / 3)}px`;
                    ring.style.top = `${startY}px`;
                    ring.style.animationDelay = `${r * 55}ms`;
                    stageOverlay.appendChild(ring);
                }
                const spear = document.createElement('div');
                spear.className = 'vfx-imagen-railgun-spear';
                spear.style.left = `${startX}px`;
                spear.style.top = `${startY - 75}px`;
                spear.style.setProperty('--tx', `${endX - startX + 40}px`);
                const spearUrl = SpriteSheetManager.getImagenUrl('hyper_thunder');
                if (spearUrl) spear.style.backgroundImage = `url("${spearUrl}")`;
                stageOverlay.appendChild(spear);

                setTimeout(() => triggerMainImpact(1.22), 210);
                break;
            }

            case 'heaven_judgment': {
                // ⚡ 天罰神雷破 (3 MP 終極大招)：三重天罰神雷巨柱轟擊全場
                const offsets = [-45, 45, 0];
                offsets.forEach((ox, idx) => {
                    setTimeout(() => {
                        this.spawnLightningBoltSVG(stageOverlay, endX + ox, -20, endX + ox * 0.4, endY, '#fde047', '#38bdf8', true);
                        this.spawnComboBadge(targetEl, `⚡ 神雷天罰 ×${idx + 1}!`, idx);
                        if (idx === 2) {
                            triggerMainImpact(1.48);
                        } else {
                            this.runCanvasParticleBurst(stageOverlay, endX + ox * 0.4, endY, meta, 35);
                        }
                    }, idx * 145);
                });
                break;
            }

            case 'parry_counter_beam': {
                // ✨ 廣角吐息・完美格擋反擊：先在小魔女身前展開三角稜鏡盾，再發射七彩萬花筒反擊光砲貫穿水晶龍！
                this.spawnImpactImagenLayer(witchCard, this.getCardVfxMeta('tri_shield'), true, false, '🛡️ 完美折射!', 'float-shield', 1.15);
                const beam = document.createElement('div');
                beam.className = 'vfx-rainbow-laser-beam';
                beam.style.left = `${startX}px`;
                beam.style.top = `${startY - 28}px`;
                beam.style.width = `${Math.max(180, endX - startX)}px`;
                stageOverlay.appendChild(beam);

                setTimeout(() => triggerMainImpact(1.42), 240);
                break;
            }

            case 'mana_vortex': {
                // 🔮 魔力湧泉陣：Google Imagen 3.0 蔚藍湧泉 + 魔力水滴飛向魔力列
                triggerMainImpact(1.22);
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => {
                        const drop = document.createElement('div');
                        drop.className = 'vfx-mana-orb-fly';
                        drop.textContent = '💧';
                        drop.style.left = `${targetCenterX + (i - 1.5) * 28}px`;
                        drop.style.top = `${targetCenterY}px`;
                        stageOverlay.appendChild(drop);
                    }, 120 + i * 70);
                }
                break;
            }

            case 'triangle_prism':
            case 'hexagram_sanctuary':
            case 'kaleidoscope_dome':
            case 'fairy_fountain':
            case 'rainbow_aurora':
            default: {
                // 🛡️ 防禦結界與 💖 聖光治癒系列：直接於小魔女身上展開雙層 Google Imagen 3.0 聖域光陣與 60fps 粒子雨
                triggerMainImpact(card.cost >= 2 || cardId === 'prism_aegis' ? 1.32 : 1.18);
                break;
            }
        }

        setTimeout(() => {
            stageOverlay.remove();
            arena.classList.remove('arena-ult-shake');
        }, isUltimate ? 1650 : 1250);
    }

    static spawnCasterMagicCircle(witchCard, meta) {
        const ring = document.createElement('div');
        ring.className = 'vfx-caster-rune-ring';
        ring.style.borderColor = meta.primaryColor;
        ring.style.boxShadow = `0 0 24px ${meta.glowColor}, inset 0 0 18px ${meta.glowColor}`;
        witchCard.appendChild(ring);
        setTimeout(() => ring.remove(), 950);
    }

    static spawnSpellBanner(arena, card, meta, isUltimate) {
        const old = arena.querySelector('.vfx-spell-cutin-banner');
        if (old) old.remove();

        const banner = document.createElement('div');
        banner.className = `vfx-spell-cutin-banner ${isUltimate ? 'ult-banner' : ''}`;
        banner.style.borderColor = meta.primaryColor;
        banner.style.boxShadow = `0 8px 30px ${meta.glowColor}`;

        const witchUrl = SpriteSheetManager.getImagenUrl('little_witch');
        const spellUrl = SpriteSheetManager.getImagenUrl(meta.imagenKey);

        banner.innerHTML = `
            ${witchUrl ? `<img src="${witchUrl}" class="cutin-witch-thumb" alt="小魔女" />` : `<span class="cutin-icon">${card.icon || '✨'}</span>`}
            <div class="cutin-text-wrap">
                <div class="cutin-main-title">${meta.bannerTitle}</div>
                <div class="cutin-sub-title">${meta.bannerSub}</div>
            </div>
            ${spellUrl ? `<img src="${spellUrl}" class="cutin-spell-thumb" alt="特效" />` : ''}
        `;
        arena.appendChild(banner);
        setTimeout(() => banner.remove(), isUltimate ? 1450 : 1050);
    }

    static spawnImpactImagenLayer(targetEl, meta, isCorrect, isUltimate, floatText, floatClass, extraScale = 1) {
        // 1. Google Imagen 3.0 主視覺特效層 (Screen 濾色混合模式，純黑背景自動 100% 透明發光！)
        const mainUrl = SpriteSheetManager.getImagenUrl(meta.imagenKey);
        if (mainUrl) {
            const imgBurst = document.createElement('div');
            imgBurst.className = `vfx-imagen-burst ${!isCorrect ? 'vfx-graze' : ''} ${isUltimate ? 'vfx-imagen-ult' : ''}`;
            imgBurst.style.backgroundImage = `url("${mainUrl}")`;
            imgBurst.style.setProperty('--vfx-scale', extraScale);
            targetEl.appendChild(imgBurst);
            setTimeout(() => imgBurst.remove(), isUltimate ? 1250 : 950);
        }

        // 2. 進階卡牌／大招疊加第二層 Google Imagen 3.0 副視覺特效層（營造複合魔法層次感）
        const subUrl = SpriteSheetManager.getImagenUrl(meta.subImagenKey);
        if (isCorrect && subUrl && (isUltimate || meta.deliveryType === 'kaleidoscope_dome' || meta.deliveryType === 'rainbow_aurora')) {
            const subBurst = document.createElement('div');
            subBurst.className = 'vfx-imagen-burst vfx-imagen-sublayer';
            subBurst.style.backgroundImage = `url("${subUrl}")`;
            targetEl.appendChild(subBurst);
            setTimeout(() => subBurst.remove(), 1100);
        }

        // 3. 擴散能量震波光環 (Shockwave Ring)
        if (isCorrect) {
            const wave = document.createElement('div');
            wave.className = 'vfx-shockwave-ring';
            wave.style.borderColor = meta.secondaryColor;
            wave.style.boxShadow = `0 0 22px ${meta.primaryColor}, inset 0 0 16px ${meta.primaryColor}`;
            targetEl.appendChild(wave);
            setTimeout(() => wave.remove(), 750);
        }

        // 4. 8 格連續序列幀精靈圖疊加層
        const spriteEl = document.createElement('div');
        const scaleClass = !isCorrect ? 'vfx-graze' : (isUltimate ? 'vfx-scale-lg' : '');
        spriteEl.className = `vfx-sprite-player ${meta.spriteClass} ${scaleClass}`;
        targetEl.appendChild(spriteEl);
        setTimeout(() => spriteEl.remove(), 720);

        // 5. 飄浮傷害／護盾／回血跳字
        if (floatText) {
            const txtEl = document.createElement('div');
            txtEl.className = `vfx-floating-text ${floatClass} ${isUltimate && isCorrect ? 'float-ult' : ''}`;
            txtEl.textContent = floatText;
            targetEl.appendChild(txtEl);
            setTimeout(() => txtEl.remove(), 1250);
        }
    }

    static spawnSlashLine(targetEl, deg, coreColor, glowColor) {
        const slash = document.createElement('div');
        slash.className = 'vfx-dimensional-slash';
        slash.style.setProperty('--slash-deg', `${deg}deg`);
        slash.style.background = `linear-gradient(90deg, transparent, ${glowColor}, ${coreColor}, ${glowColor}, transparent)`;
        slash.style.boxShadow = `0 0 18px ${glowColor}, 0 0 32px ${coreColor}`;
        targetEl.appendChild(slash);
        setTimeout(() => slash.remove(), 420);
    }

    static spawnComboBadge(targetEl, text, index = 0) {
        const badge = document.createElement('div');
        badge.className = 'vfx-combo-hit-badge';
        badge.style.top = `${18 + index * 24}%`;
        badge.textContent = text;
        targetEl.appendChild(badge);
        setTimeout(() => badge.remove(), 550);
    }

    static spawnLightningBoltSVG(container, x1, y1, x2, y2, color1, color2, isThick = false) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'vfx-lightning-svg');
        svg.style.position = 'absolute';
        svg.style.inset = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.overflow = 'visible';

        const steps = 7;
        let pts = `${x1},${y1} `;
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const px = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 48;
            const py = y1 + (y2 - y1) * t;
            pts += `${px.toFixed(1)},${py.toFixed(1)} `;
        }
        pts += `${x2},${y2}`;

        const outer = document.createElementNS(svgNS, 'polyline');
        outer.setAttribute('points', pts);
        outer.setAttribute('fill', 'none');
        outer.setAttribute('stroke', color1);
        outer.setAttribute('stroke-width', isThick ? '16' : '10');
        outer.setAttribute('stroke-linecap', 'round');
        outer.setAttribute('stroke-linejoin', 'round');
        outer.style.filter = `drop-shadow(0 0 14px ${color1}) drop-shadow(0 0 24px ${color2})`;

        const inner = document.createElementNS(svgNS, 'polyline');
        inner.setAttribute('points', pts);
        inner.setAttribute('fill', 'none');
        inner.setAttribute('stroke', '#ffffff');
        inner.setAttribute('stroke-width', isThick ? '6' : '3.5');
        inner.setAttribute('stroke-linecap', 'round');

        svg.appendChild(outer);
        svg.appendChild(inner);
        container.appendChild(svg);
        setTimeout(() => svg.remove(), 340);
    }

    static runCanvasParticleBurst(container, cx, cy, meta, count = 55) {
        const canvas = document.createElement('canvas');
        const rect = container.getBoundingClientRect();
        canvas.width = Math.max(400, rect.width || 800);
        canvas.height = Math.max(260, rect.height || 340);
        canvas.className = 'vfx-particle-canvas';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const palette = [meta.primaryColor, meta.secondaryColor, '#ffffff', '#fde047', '#f472b6', '#38bdf8'];
        const particles = [];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.2 + Math.random() * 7.8;
            particles.push({
                x: cx + (Math.random() - 0.5) * 24,
                y: cy + (Math.random() - 0.5) * 24,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (meta.particleShape === 'heart' || meta.particleShape === 'feather' ? 1.8 : 0.4),
                size: 4 + Math.random() * 7,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.22,
                color: palette[i % palette.length],
                alpha: 1,
                decay: 0.018 + Math.random() * 0.016,
                shape: meta.particleShape
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            for (const p of particles) {
                if (p.alpha <= 0) continue;
                alive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy = p.vy * 0.96 + (p.shape === 'heart' || p.shape === 'orb' ? -0.08 : 0.12);
                p.rot += p.vRot;
                p.alpha -= p.decay;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.fillStyle = p.color;

                if (p.shape === 'shard') {
                    // 幾何菱形／稜鏡碎片
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size * 1.3);
                    ctx.lineTo(p.size * 0.75, 0);
                    ctx.lineTo(0, p.size * 1.3);
                    ctx.lineTo(-p.size * 0.75, 0);
                    ctx.closePath();
                    ctx.fill();
                } else if (p.shape === 'heart') {
                    // 星光愛心／花瓣
                    ctx.beginPath();
                    ctx.arc(-p.size * 0.35, -p.size * 0.2, p.size * 0.45, 0, Math.PI * 2);
                    ctx.arc(p.size * 0.35, -p.size * 0.2, p.size * 0.45, 0, Math.PI * 2);
                    ctx.lineTo(0, p.size * 0.85);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // 十字星芒粒子
                    SpriteSheetManager.drawStar(ctx, 0, 0, p.size, p.size * 0.38, 4, 0, p.color);
                }
                ctx.restore();
            }

            if (alive) {
                requestAnimationFrame(animate);
            } else {
                canvas.remove();
            }
        };

        requestAnimationFrame(animate);
    }
}

window.SpellCinemaEngine = SpellCinemaEngine;

window.addEventListener('DOMContentLoaded', () => {
    SpriteSheetManager.init();
});
