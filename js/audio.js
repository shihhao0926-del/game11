// Web Audio API 音效合成器（免外部音效檔，離線可直接播放，v1.1 華麗魔法大招強化版）
class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playTone(freq, type = 'sine', duration = 0.15, vol = 0.15, delay = 0, slideTo = null) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
        }

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.03);
    }

    playNoiseBurst(duration = 0.25, vol = 0.18, delay = 0, filterFreq = 900) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime + delay;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(filterFreq, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    playClick() {
        this.playTone(520, 'triangle', 0.08, 0.12);
    }

    playCardSelect() {
        this.playTone(440, 'sine', 0.1, 0.12, 0);
        this.playTone(660, 'triangle', 0.15, 0.12, 0.06);
    }

    playCorrect() {
        this.playTone(523.25, 'triangle', 0.12, 0.18, 0);     // C5
        this.playTone(659.25, 'triangle', 0.12, 0.18, 0.08);  // E5
        this.playTone(783.99, 'triangle', 0.15, 0.18, 0.16);  // G5
        this.playTone(1046.50, 'sine', 0.28, 0.22, 0.24);     // C6
    }

    playWrong() {
        this.playTone(280, 'sawtooth', 0.18, 0.14, 0);
        this.playTone(210, 'sawtooth', 0.28, 0.14, 0.15);
    }

    playAttack() {
        this.playTone(320, 'sawtooth', 0.14, 0.18, 0, 110);
        this.playNoiseBurst(0.22, 0.18, 0.05, 700);
        this.playTone(140, 'square', 0.22, 0.2, 0.08, 55);
    }

    playThunder() {
        this.playTone(1100, 'sawtooth', 0.09, 0.18, 0, 260);
        this.playNoiseBurst(0.32, 0.22, 0.04, 1400);
        this.playTone(480, 'square', 0.14, 0.2, 0.06, 120);
        this.playTone(180, 'sawtooth', 0.3, 0.22, 0.14, 55);
    }

    playShield() {
        this.playTone(523.25, 'sine', 0.16, 0.15, 0);
        this.playTone(659.25, 'triangle', 0.18, 0.15, 0.07);
        this.playTone(783.99, 'sine', 0.22, 0.16, 0.14);
        this.playTone(1046.5, 'triangle', 0.3, 0.18, 0.21);
    }

    playHeal() {
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((n, i) => this.playTone(n, 'sine', 0.22, 0.15, i * 0.07));
    }

    // 專屬卡牌進階華麗音效
    playSpellByCardId(cardId) {
        if (this.muted) return;
        switch (cardId) {
            case 'spark_bolt':
                for (let i = 0; i < 5; i++) {
                    this.playTone(620 + i * 95, 'triangle', 0.11, 0.14, i * 0.065, 220);
                    this.playNoiseBurst(0.12, 0.12, 0.18 + i * 0.065, 1100);
                }
                break;
            case 'flame_slash':
                this.playTone(580, 'sawtooth', 0.18, 0.2, 0, 140);
                this.playNoiseBurst(0.32, 0.24, 0.08, 850);
                this.playTone(220, 'square', 0.26, 0.2, 0.14, 65);
                break;
            case 'chain_fireball':
                for (let i = 0; i < 3; i++) {
                    this.playTone(420 + i * 80, 'sawtooth', 0.16, 0.2, i * 0.16, 95);
                    this.playNoiseBurst(0.24, 0.22, i * 0.16 + 0.08, 680);
                }
                break;
            case 'bracket_meteor':
                this.playTone(980, 'sine', 0.35, 0.16, 0, 180);
                this.playNoiseBurst(0.45, 0.26, 0.25, 520);
                this.playTone(150, 'sawtooth', 0.42, 0.25, 0.26, 42);
                this.playTone(880, 'triangle', 0.25, 0.15, 0.32, 1320);
                break;
            case 'chrono_slash':
                // 時空靜止鐘聲 + 6連次元斬 + 空間碎裂
                this.playTone(1046.5, 'sine', 0.25, 0.18, 0);
                for (let i = 0; i < 6; i++) {
                    this.playTone(1350 - i * 90, 'sawtooth', 0.075, 0.18, 0.12 + i * 0.07, 320);
                    this.playNoiseBurst(0.09, 0.16, 0.12 + i * 0.07, 2200);
                }
                this.playNoiseBurst(0.42, 0.28, 0.58, 1500);
                this.playTone(180, 'square', 0.38, 0.24, 0.58, 48);
                break;
            case 'hyper_thunder':
                this.playTone(320, 'sawtooth', 0.15, 0.16, 0, 1480);
                this.playNoiseBurst(0.32, 0.24, 0.14, 1900);
                this.playTone(960, 'square', 0.24, 0.22, 0.14, 140);
                break;
            case 'divine_thunder':
                for (let i = 0; i < 3; i++) {
                    this.playNoiseBurst(0.34, 0.25, i * 0.15, 1600);
                    this.playTone(1280 - i * 150, 'sawtooth', 0.22, 0.22, i * 0.15, 90);
                }
                this.playTone(120, 'square', 0.45, 0.25, 0.35, 45);
                break;
            case 'prism_aegis':
            case 'perfect_parry':
                [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, idx) => {
                    this.playTone(f, 'triangle', 0.2, 0.16, idx * 0.055);
                });
                break;
            case 'mana_spring':
            case 'rainbow_heal':
                [392.0, 493.88, 587.33, 783.99, 987.77, 1174.66].forEach((f, idx) => {
                    this.playTone(f, 'sine', 0.26, 0.16, idx * 0.06);
                });
                break;
            default:
                this.playAttack();
        }
    }

    playVictory() {
        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        const times = [0, 0.12, 0.24, 0.36, 0.52, 0.66];
        const durs  = [0.1, 0.1, 0.1, 0.15, 0.12, 0.4];
        notes.forEach((n, i) => this.playTone(n, 'triangle', durs[i], 0.2, times[i]));
    }

    playDefeat() {
        const notes = [392.00, 369.99, 349.23, 329.63];
        notes.forEach((n, i) => this.playTone(n, 'sawtooth', 0.25, 0.15, i * 0.22));
    }
}

window.soundFX = new SoundManager();
