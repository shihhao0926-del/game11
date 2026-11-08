// 《小魔女的數學魔導書》v2.1 小一至小六全學年擴充題庫、隨關卡(1~6)動態遞增難度與動態 SVG 幾何引擎

class MathEngine {
    static randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static shuffle(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    static makeOptions(correctAns, spread = 10, count = 3, minVal = 0, suffix = '') {
        const set = new Set([correctAns]);
        const offsets = [-spread, spread, -1, 1, -2, 2, -5, 5, -10, 10, -4, 4, -8, 8, -3, 3, -12, 12];
        let tries = 0;
        while (set.size < count && tries < 60) {
            tries++;
            const delta = this.pick(offsets) + this.randInt(-2, 2);
            const cand = Number((correctAns + delta).toFixed(2));
            if (cand >= minVal && cand !== correctAns) {
                set.add(cand);
            }
        }
        while (set.size < count) {
            const fallback = Number((correctAns + set.size * 2).toFixed(2));
            set.add(fallback);
        }
        return this.shuffle(Array.from(set)).map(v => ({
            label: `${v}${suffix}`,
            value: v
        }));
    }

    // 依關卡編號 (1~6) 轉換為難度階級 (1: 初階[第1-2關], 2: 中階[第3-4關], 3: 高階[第5-6關])
    static getStageTier(stageId = 1) {
        const s = Math.max(1, Math.min(6, parseInt(stageId, 10) || 1));
        if (s <= 2) return 1;
        if (s <= 4) return 2;
        return 3;
    }

    static getDifficultyTag(stageId = 1, isBopomofo = false) {
        const s = Math.max(1, Math.min(6, parseInt(stageId, 10) || 1));
        if (isBopomofo) {
            const bopoTags = ['★ ㄔㄨ ㄐㄧㄝ', '★★ ㄐㄧㄣˋ ㄐㄧㄝ', '★★★ ㄊㄧㄠˇ ㄓㄢˋ', '★★★★ ㄍㄠ ㄕㄡˇ', '★★★★★ ㄉㄚˋ ㄕ', '★★★★★★ ㄇㄛˊ ㄉㄠˇ ㄨㄤˊ'];
            return bopoTags[s - 1];
        }
        const tags = ['★ 初階', '★★ 進階', '★★★ 精熟', '★★★★ 高手', '★★★★★ 大師', '★★★★★★ 魔導王'];
        return `第${s}關・${tags[s - 1]}`;
    }

    // 取得各年級名稱與課程大綱說明
    static getGradeInfo(grade) {
        const info = {
            1: {
                name: '小一數學（注音版）',
                shortName: '小一 (注音)',
                focus: '加減與合十法、連加連減、未知數填空、100以內位值與錢幣、基本圖形與整點/半點時鐘（全注音題目，隨關卡加深）'
            },
            2: {
                name: '小二數學',
                shortName: '小二',
                focus: '二/三位數進退位加減、兩步驟混合、九九乘法與乘加乘減、平分概念、公尺公分與時鐘刻度（隨關卡加深）'
            },
            3: {
                name: '小三數學',
                shortName: '小三',
                focus: '三/四位數加減、乘加乘減與括號運算、除法與餘數、分數與小數加減、周長與面積反推（隨關卡加深）'
            },
            4: {
                name: '小四數學',
                shortName: '小四',
                focus: '多步驟四則混合運算(含雙括號)、多位數乘除與餘數、假分數帶分數、量角器/補角与等腰三角形角度推算（隨關卡加深）'
            },
            5: {
                name: '小五數學',
                shortName: '小五',
                focus: '公因數與公倍數、分配律與結合律巧算、未知數x求解、異分母分數、三角形/平行四邊形/梯形面積與多邊形內角和（隨關卡加深）'
            },
            6: {
                name: '小六數學',
                shortName: '小六',
                focus: '比與按比例分配、速率追趕問題、百分率打折與濃度、圓周長/圓面積/扇形與柱體體積、縮放圖面積比（隨關卡加深）'
            }
        };
        return info[grade] || info[4];
    }

    // ==========================================
    // 總入口：依年級 (1~6)、卡牌類別与關卡 (1~6) 產生隨關卡變難的豐富題目
    // ==========================================
    static generateQuestion(grade, category, enemy = null, stageId = 1, forceParens = false) {
        const g = parseInt(grade, 10) || 4;
        const sId = Math.max(1, Math.min(6, parseInt(stageId, 10) || 1));
        const actualCat = category === 'heal'
            ? this.pick(['attack', 'break', 'defense'])
            : category;

        let q;
        if (g === 1) q = this.generateGrade1(actualCat, enemy, sId, forceParens);
        else if (g === 2) q = this.generateGrade2(actualCat, enemy, sId, forceParens);
        else if (g === 3) q = this.generateGrade3(actualCat, enemy, sId, forceParens);
        else if (g === 4) q = this.generateGrade4(actualCat, enemy, sId, forceParens);
        else if (g === 5) q = this.generateGrade5(actualCat, enemy, sId, forceParens);
        else q = this.generateGrade6(actualCat, enemy, sId, forceParens);

        q.category = category;
        q.grade = g;
        q.stageId = sId;
        q.isBopomofo = (g === 1);
        const diffTag = this.getDifficultyTag(sId, q.isBopomofo);
        if (q.unitName && !q.unitName.includes('★')) {
            q.unitName = `${q.unitName}（${diffTag}）`;
        }
        return q;
    }

    // ==========================================
    // 🎒 小學一年級題庫（全注音敘述！隨關卡 1~6 遞增難度與題型）
    // ==========================================
    static generateGrade1(category, enemy = null, stageId = 1, forceParens = false) {
        const tier = this.getStageTier(stageId); // 1(關卡1-2), 2(關卡3-4), 3(關卡5-6)

        if (category === 'attack') {
            // 依據關卡難度開放更多題型：1:加法, 2:減法, 3:合十連加, 4:加減混合(中高階), 5:未知加數填空(高階), 6:買東西應用題
            const pool = tier === 1 ? [1, 2, 3] : tier === 2 ? [1, 2, 3, 4, 6] : [3, 4, 5, 6];
            const type = forceParens ? this.pick([3, 4, 5]) : this.pick(pool);

            if (type === 1) {
                const a = tier === 1 ? this.randInt(4, 9) : tier === 2 ? this.randInt(8, 16) : this.randInt(14, 25);
                const b = tier === 1 ? this.randInt(3, 8) : tier === 2 ? this.randInt(6, 12) : this.randInt(8, 15);
                const ans = a + b;
                const toTen = 10 - (a % 10);
                return {
                    unitName: 'ㄐㄧㄣˋ ㄨㄟˋ ㄐㄧㄚ ㄈㄚˇ',
                    hasParens: false,
                    prompt: 'ㄑㄧㄥˇ ㄙㄨㄢˋ ㄔㄨ ㄐㄧㄚ ㄈㄚˇ ㄉㄜ˙ ㄉㄚˊ ㄢˋ：',
                    displayHtml: `${a} + ${b} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} + ${b}</span> = ? ${toTen > 0 && b >= toTen ? `（先湊成十更好算喔！）` : ''}`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 4, 3, 1),
                    explanation: `${a} ㄐㄧㄚ ${b} ㄉㄥˇ ㄩˊ ${ans} ㄛ！`
                };
            } else if (type === 2) {
                const ans = tier === 1 ? this.randInt(3, 9) : tier === 2 ? this.randInt(6, 15) : this.randInt(11, 22);
                const b = tier === 1 ? this.randInt(2, 7) : tier === 2 ? this.randInt(5, 9) : this.randInt(7, 14);
                const a = ans + b;
                return {
                    unitName: 'ㄊㄨㄟˋ ㄨㄟˋ ㄐㄧㄢˇ ㄈㄚˇ',
                    hasParens: false,
                    prompt: 'ㄑㄧㄥˇ ㄙㄨㄢˋ ㄔㄨ ㄐㄧㄢˇ ㄈㄚˇ ㄉㄜ˙ ㄉㄚˊ ㄢˋ：',
                    displayHtml: `${a} - ${b} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} - ${b}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 4, 3, 0),
                    explanation: `${a} ㄐㄧㄢˇ ㄉㄧㄠˋ ${b}，ㄕㄥˋ ㄒㄧㄚˋ ${ans} ㄛ！`
                };
            } else if (type === 3) {
                // 湊十連加或湊二十連加
                const targetSum = tier >= 3 ? 20 : 10;
                const a = tier >= 3 ? this.randInt(11, 17) : this.randInt(3, 8);
                const b = targetSum - a;
                const c = this.randInt(3, 9 + stageId);
                const ans = targetSum + c;
                return {
                    unitName: 'ㄏㄜˊ ㄕˊ ㄌㄧㄢˊ ㄐㄧㄚ',
                    hasParens: true,
                    prompt: `ㄒㄧㄢ ㄙㄨㄢˋ ㄏㄜˊ ㄑㄧˇ ㄌㄞˊ ㄕˋ ${targetSum} ㄉㄜ˙ ㄕㄨˋ：`,
                    displayHtml: `${a} + ${b} + ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} + ${b}</span> + ${c} = ? （${a}+${b}=${targetSum}）`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 4, 3, 5),
                    explanation: `ㄒㄧㄢ ㄙㄨㄢˋ ${a} + ${b} = ${targetSum}，ㄗㄞˋ ㄐㄧㄚ ${c} ㄉㄥˇ ㄩˊ ${ans}！`
                };
            } else if (type === 4) {
                // 兩步驟加減混合
                const a = this.randInt(12, 16 + stageId * 2);
                const b = this.randInt(4, 9);
                const c = this.randInt(3, 9);
                const ans = a - b + c;
                return {
                    unitName: 'ㄐㄧㄚ ㄐㄧㄢˇ ㄏㄨㄣˋ ㄏㄜˊ',
                    hasParens: true,
                    prompt: 'ㄧㄡˊ ㄗㄨㄛˇ ㄉㄠˋ ㄧㄡˋ，ㄧ ㄒㄩˋ ㄙㄨㄢˋ ㄔㄨ ㄉㄚˊ ㄢˋ：',
                    displayHtml: `${a} - ${b} + ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} - ${b} = ${a - b}</span>，ㄗㄞˋ + ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 4, 3, 2),
                    explanation: `ㄒㄧㄢ ㄙㄨㄢˋ ${a} - ${b} = ${a - b}，ㄗㄞˋ ㄙㄨㄢˋ ${a - b} + ${c} = ${ans}！`
                };
            } else if (type === 5) {
                // 未知數填空 a + [ ? ] = c
                const a = this.randInt(6, 12 + stageId);
                const ans = this.randInt(5, 9 + stageId);
                const total = a + ans;
                return {
                    unitName: 'ㄕㄜˊ ㄇㄜ˙ ㄕㄨˋ ㄊㄧㄢˊ ㄎㄨㄥˋ',
                    hasParens: true,
                    prompt: `ㄒㄧㄤˇ ㄧ ㄒㄧㄤˇ，？ ㄌㄧˇ ㄇㄧㄢˋ ㄧㄠˋ ㄊㄧㄢˊ ㄉㄨㄛ ㄕㄠˇ？`,
                    displayHtml: `${a} + [ ? ] = ${total}`,
                    hintDisplayHtml: `用減法想：<span class="priority-highlight">${total} - ${a}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 3, 3, 1),
                    explanation: `ㄧㄣ ㄨㄟˋ ${total} - ${a} = ${ans}，ㄙㄨㄛˇ ㄧˇ ${a} + ${ans} = ${total}！`
                };
            } else {
                // 注音生活情境買東西題
                const p1 = this.randInt(6, 10 + stageId);
                const p2 = this.randInt(5, 9 + stageId);
                const ans = p1 + p2;
                return {
                    unitName: 'ㄇㄞˇ ㄉㄨㄥ ㄒㄧ ㄧㄥˋ ㄩㄥˋ ㄊㄧˊ',
                    hasParens: false,
                    prompt: `ㄇㄞˇ ㄇㄛˊ ㄈㄚˇ ㄑㄧㄢ ㄅㄧˇ ${p1} ㄩㄢˊ，ㄏㄜˊ ㄒㄧㄤ ㄆㄧˊ ㄘㄚ ${p2} ㄩㄢˊ，ㄧ ㄍㄨㄥˋ ㄧㄠˋ ㄐㄧˇ ㄩㄢˊ？`,
                    displayHtml: `${p1} ㄩㄢˊ + ${p2} ㄩㄢˊ = ? ㄩㄢˊ`,
                    hintDisplayHtml: `<span class="priority-highlight">${p1} + ${p2}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 4, 3, 5),
                    explanation: `ㄅㄚˇ ㄌㄧㄤˇ ㄍㄜ˙ ㄐㄧㄚˋ ㄑㄧㄢˊ ㄐㄧㄚ ㄑㄧˇ ㄌㄞˊ：${p1} + ${p2} = ${ans} ㄩㄢˊ！`
                };
            }
        } else if (category === 'break') {
            // 小一破甲：位值、數列、比大小、錢幣換算、平分餘數
            if (enemy && enemy.remainderArmor) {
                const half = this.randInt(3, 6 + stageId);
                const rem = 1;
                const total = half * 2 + rem;
                return {
                    unitName: 'ㄆㄧㄥˊ ㄈㄣ ㄊㄤˊ ㄍㄨㄛˇ',
                    hasParens: false,
                    prompt: `⚙️ ${total} ㄎㄜ ㄊㄤˊ ㄍㄨㄛˇ，ㄇㄟˇ 2 ㄎㄜ ㄓㄨㄤ ㄧ ㄉㄞˋ，ㄗㄨㄟˋ ㄏㄡˋ ㄏㄞˊ ㄕㄥˋ ㄒㄧㄚˋ ㄐㄧˇ ㄎㄜ？`,
                    displayHtml: `${total} = ${half * 2} + [ ? ]`,
                    hintDisplayHtml: `<span class="priority-highlight">${total} - ${half * 2}</span> = ?`,
                    answer: rem,
                    inputMode: 'number',
                    options: [
                        { label: '1', value: 1 },
                        { label: '2', value: 2 },
                        { label: '3', value: 3 }
                    ],
                    explanation: `${total} ㄕˋ ㄉㄢ ㄕㄨˋ，ㄇㄟˇ 2 ㄎㄜ ㄧ ㄉㄞˋ ㄏㄨㄟˋ ㄕㄥˋ ㄒㄧㄚˋ 1 ㄎㄜ ㄛ！`
                };
            }

            const type = this.randInt(1, 4);
            if (type === 1) {
                const tens = this.randInt(tier, 3 + stageId);
                const ones = this.randInt(1, 9);
                const ans = tens * 10 + ones;
                return {
                    unitName: 'ㄐㄧˇ ㄍㄜ˙ ㄕˊ ㄏㄜˊ ㄐㄧˇ ㄍㄜ˙ ㄧ',
                    hasParens: false,
                    prompt: `「${tens} ㄍㄜ˙ ㄕˊ」ㄏㄜˊ「${ones} ㄍㄜ˙ ㄧ」ㄏㄜˊ ㄑㄧˇ ㄌㄞˊ ㄕˋ ㄉㄨㄛ ㄕㄠˇ？`,
                    displayHtml: `${tens} ㄍㄜ˙ 10 + ${ones} ㄍㄜ˙ 1 = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${tens * 10} + ${ones}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 10),
                    explanation: `${tens} ㄍㄜ˙ ㄕˊ ㄕˋ ${tens * 10}，ㄐㄧㄚ ㄕㄤˋ ${ones} ㄍㄜ˙ ㄧ，ㄕˋ ${ans}！`
                };
            } else if (type === 2) {
                const step = tier === 1 ? this.pick([2, 5, 10]) : this.pick([5, 10, 3]);
                const start = step * this.randInt(1, 3 + stageId);
                const ans = start + step * 2;
                return {
                    unitName: 'ㄢˋ ㄕㄨㄣˋ ㄒㄩˋ ㄕㄨˇ ㄧ ㄕㄨˇ',
                    hasParens: false,
                    prompt: `ㄇㄟˇ ㄘˋ ㄉㄨㄛ ${step}，？ ㄌㄧˇ ㄇㄧㄢˋ ㄕˋ ㄕㄜˊ ㄇㄜ˙ ㄕㄨˋ ㄗˋ？`,
                    displayHtml: `${start} ➔ ${start + step} ➔ [ ? ] ➔ ${start + step * 3}`,
                    hintDisplayHtml: `${start + step} ㄗㄞˋ ㄐㄧㄚ <span class="priority-highlight">${step}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, step, 3, 2),
                    explanation: `ㄇㄟˇ ㄘˋ ㄉㄨㄛ ${step}，ㄙㄨㄛˇ ㄧˇ ${start + step} + ${step} = ${ans}！`
                };
            } else if (type === 3) {
                const askMin = tier >= 2 && Math.random() < 0.5;
                const n1 = this.randInt(12, 35);
                const n2 = this.randInt(38, 68);
                const n3 = this.randInt(70, 99);
                const ans = askMin ? n1 : n3;
                const opts = this.shuffle([n1, n2, n3]).map(v => ({ label: `${v}`, value: v }));
                return {
                    unitName: '100 ㄧˇ ㄋㄟˋ ㄅㄧˇ ㄉㄚˋ ㄒㄧㄠˇ',
                    hasParens: false,
                    prompt: `ㄅㄧˇ ㄧ ㄅㄧˇ，ㄋㄚˇ ㄧ ㄍㄜ˙ ㄕㄨˋ ㄗˋ「${askMin ? 'ㄗㄨㄟˋ ㄒㄧㄠˇ' : 'ㄗㄨㄟˋ ㄉㄚˋ'}」？`,
                    displayHtml: `${opts[0].value} 、 ${opts[1].value} 、 ${opts[2].value}`,
                    hintDisplayHtml: `ㄒㄧㄢ ㄎㄢˋ ㄕˊ ㄨㄟˋ ㄕㄨˋ 誰 ${askMin ? 'ㄗㄨㄟˋ ㄒㄧㄠˇ' : 'ㄗㄨㄟˋ ㄉㄚˋ'} ㄛ！`,
                    answer: ans,
                    inputMode: 'choice',
                    options: opts,
                    explanation: `${ans} ㄉㄜ˙ ㄕˊ ㄨㄟˋ ㄕㄨˋ ${askMin ? 'ㄗㄨㄟˋ ㄒㄧㄠˇ' : 'ㄗㄨㄟˋ ㄉㄚˋ'}，ㄙㄨㄛˇ ㄧˇ ㄉㄚˊ ㄢˋ ㄕˋ ${ans}！`
                };
            } else {
                // 10元、5元與1元錢幣計算
                const tenCoins = this.randInt(1, 3 + stageId);
                const fiveCoins = tier >= 2 ? 1 : 0;
                const oneCoins = this.randInt(1, 4);
                const ans = tenCoins * 10 + fiveCoins * 5 + oneCoins;
                return {
                    unitName: 'ㄕㄨˇ ㄑㄧㄢˊ ㄅㄧˋ',
                    hasParens: false,
                    prompt: `ㄧㄡˇ ${tenCoins} ㄍㄜ˙ 10 ㄩㄢˊ${fiveCoins ? '、1 ㄍㄜ˙ 5 ㄩㄢˊ' : ''} ㄏㄜˊ ${oneCoins} ㄍㄜ˙ 1 ㄩㄢˊ，ㄏㄜˊ ㄑㄧˇ ㄌㄞˊ ㄕˋ ㄐㄧˇ ㄩㄢˊ？`,
                    displayHtml: `${tenCoins * 10}${fiveCoins ? ' + 5' : ''} + ${oneCoins} = ? ㄩㄢˊ`,
                    hintDisplayHtml: `<span class="priority-highlight">${tenCoins * 10 + fiveCoins * 5} + ${oneCoins}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 5, 3, 10),
                    explanation: `${tenCoins} ㄍㄜ˙ 10 ㄩㄢˊ ㄕˋ ${tenCoins * 10} ㄩㄢˊ，全部合起來是 ${ans} ㄩㄢˊ！`
                };
            }
        } else {
            // 小一防禦／幾何：1.認識形狀、2.整點時鐘、3.半點時鐘(中高階)、4.數邊與角
            const pool = tier === 1 ? [1, 2, 4] : [1, 2, 3, 4];
            const type = this.pick(pool);
            if (type === 1) {
                const shapes = [
                    { id: 'ㄩㄢˊ ㄒㄧㄥˊ', svg: this.renderBasicShapeSVG('circle'), exp: 'ㄩㄢˊ ㄩㄢˊ ㄉㄜ˙ ㄇㄟˊ ㄧㄡˇ ㄐㄧㄢ ㄐㄧㄠˇ，ㄕˋ「ㄩㄢˊ ㄒㄧㄥˊ」ㄛ！' },
                    { id: 'ㄙㄢ ㄐㄧㄠˇ ㄒㄧㄥˊ', svg: this.renderBasicShapeSVG('triangle'), exp: 'ㄧㄡˇ 3 ㄍㄜ˙ ㄐㄧㄢ ㄐㄧㄢ ㄉㄜ˙ ㄐㄧㄠˇ，ㄕˋ「ㄙㄢ ㄐㄧㄠˇ ㄒㄧㄥˊ」ㄛ！' },
                    { id: 'ㄓㄥˋ ㄈㄤ ㄒㄧㄥˊ', svg: this.renderBasicShapeSVG('square'), exp: '4 ㄊㄧㄠˊ ㄅㄧㄢ ㄧ ㄧㄤˋ ㄔㄤˊ ㄉㄜ˙ ㄈㄤ ㄒㄧㄥˊ，ㄕˋ「ㄓㄥˋ ㄈㄤ ㄒㄧㄥˊ」！' },
                    { id: 'ㄔㄤˊ ㄈㄤ ㄒㄧㄥˊ', svg: this.renderBasicShapeSVG('rectangle'), exp: 'ㄔㄤˊ ㄔㄤˊ ㄉㄜ˙ ㄈㄤ ㄒㄧㄥˊ，ㄕˋ「ㄔㄤˊ ㄈㄤ ㄒㄧㄥˊ」！' }
                ];
                const chosen = this.pick(shapes);
                const wrong = this.shuffle(shapes.filter(s => s.id !== chosen.id)).slice(0, 2).map(s => s.id);
                const opts = this.shuffle([chosen.id, ...wrong]).map(v => ({ label: v, value: v }));
                return {
                    unitName: 'ㄖㄣˋ ㄕˋ ㄒㄧㄥˊ ㄓㄨㄤˋ',
                    hasParens: false,
                    prompt: 'ㄎㄢˋ ㄧ ㄎㄢˋ，ㄊㄨˊ ㄌㄧˇ ㄇㄧㄢˋ ㄕˋ ㄕㄜˊ ㄇㄜ˙ ㄒㄧㄥˊ ㄓㄨㄤˋ？',
                    displayHtml: 'ㄓㄜˋ ㄕˋ ㄕㄜˊ ㄇㄜ˙ ㄒㄧㄥˊ ㄓㄨㄤˋ？',
                    hintDisplayHtml: 'ㄕㄨˇ ㄧ ㄕㄨˇ ㄧㄡˇ ㄐㄧˇ ㄊㄧㄠˊ ㄅㄧㄢ！',
                    svgDiagram: chosen.svg,
                    answer: chosen.id,
                    inputMode: 'choice',
                    options: opts,
                    explanation: chosen.exp
                };
            } else if (type === 2) {
                const hour = this.randInt(1, 11);
                return {
                    unitName: 'ㄎㄢˋ ㄕˊ ㄓㄨㄥ（ㄓㄥˇ ㄉㄧㄢˇ）',
                    hasParens: false,
                    prompt: 'ㄔㄤˊ ㄓㄣ ㄓˇ 著 12，ㄉㄨㄢˇ ㄓㄣ ㄓˇ 著 ㄐㄧˇ，ㄒㄧㄢˋ ㄗㄞˋ ㄕˋ ㄐㄧˇ ㄉㄧㄢˇ ㄓㄨㄥ？',
                    displayHtml: `ㄒㄧㄢˋ ㄗㄞˋ ㄕˋ [ ? ] ㄉㄧㄢˇ ㄓㄨㄥ`,
                    hintDisplayHtml: `ㄎㄢˋ 紅 色 ㄉㄨㄢˇ ㄓㄣ ㄓˇ 著 ㄕㄨˋ ㄗˋ ${hour}！`,
                    svgDiagram: this.renderClockSVG(hour, 0),
                    answer: hour,
                    inputMode: 'choice',
                    options: this.makeOptions(hour, 2, 3, 1, ' ㄉㄧㄢˇ'),
                    explanation: `ㄔㄤˊ ㄓㄣ ㄓˇ 12，ㄉㄨㄢˇ ㄓㄣ ㄓˇ ${hour}，ㄒㄧㄢˋ ㄗㄞˋ ㄕˋ ${hour} ㄉㄧㄢˇ ㄓㄨㄥ！`
                };
            } else if (type === 3) {
                // 半點時鐘判讀
                const hour = this.randInt(1, 10);
                const ansLabel = `${hour} ㄉㄧㄢˇ ㄅㄢˋ`;
                const w1 = `${hour + 1} ㄉㄧㄢˇ ㄅㄢˋ`;
                const w2 = `${hour} ㄉㄧㄢˇ`;
                return {
                    unitName: 'ㄎㄢˋ ㄕˊ ㄓㄨㄥ（ㄅㄢˋ ㄉㄧㄢˇ）',
                    hasParens: false,
                    prompt: 'ㄔㄤˊ ㄓㄣ ㄓˇ 著 6 ㄕˋ「ㄅㄢˋ」，請問時鐘上是幾點半？',
                    displayHtml: `ㄒㄧㄢˋ ㄗㄞˋ ㄕˋ [ ? ]`,
                    hintDisplayHtml: `ㄉㄨㄢˇ ㄓㄣ ㄗㄡˇ 過 ${hour}，ㄔㄤˊ ㄓㄣ ㄓˇ 6 ㄕˋ ${hour} ㄉㄧㄢˇ ㄅㄢˋ！`,
                    svgDiagram: this.renderClockSVG(hour, 30),
                    answer: ansLabel,
                    inputMode: 'choice',
                    options: this.shuffle([
                        { label: ansLabel, value: ansLabel },
                        { label: w1, value: w1 },
                        { label: w2, value: w2 }
                    ]),
                    explanation: `ㄔㄤˊ ㄓㄣ ㄓˇ 6 ㄉㄞˋ ㄅㄧㄠˇ ㄅㄢˋ ㄉㄧㄢˇ，ㄉㄨㄢˇ ㄓㄣ ㄗㄞˋ ${hour} ㄏㄜˊ ${hour + 1} ㄓ ㄐㄧㄢ，ㄕˋ ${ansLabel}！`
                };
            } else {
                const isTri = Math.random() < 0.5;
                const ans = isTri ? 3 : 4;
                return {
                    unitName: 'ㄕㄨˇ ㄧ ㄕㄨˇ ㄅㄧㄢ ㄏㄜˊ ㄐㄧㄠˇ',
                    hasParens: false,
                    prompt: isTri
                        ? 'ㄑㄧㄥˇ ㄨㄣˋ ㄒㄧㄚˋ ㄇㄧㄢˋ ㄉㄜ˙「ㄙㄢ ㄐㄧㄠˇ ㄒㄧㄥˊ」ㄧㄡˇ ㄐㄧˇ ㄍㄜ˙ ㄐㄧㄠˇ？'
                        : 'ㄑㄧㄥˇ ㄨㄣˋ ㄒㄧㄚˋ ㄇㄧㄢˋ ㄉㄜ˙「ㄓㄥˋ ㄈㄤ ㄒㄧㄥˊ」ㄧㄡˇ ㄐㄧˇ ㄊㄧㄠˊ ㄅㄧㄢ？',
                    displayHtml: `ㄧ ㄍㄨㄥˋ ㄧㄡˇ [ ? ] ${isTri ? 'ㄍㄜ˙ ㄐㄧㄠˇ' : 'ㄊㄧㄠˊ ㄅㄧㄢ'}`,
                    hintDisplayHtml: `ㄕㄨˇ ㄧ ㄕㄨˇ ㄊㄨˊ ㄒㄧㄥˊ ㄕㄤˋ ㄉㄜ˙ ${isTri ? 'ㄐㄧㄢ ㄐㄧㄠˇ' : 'ㄅㄧㄢ'}！`,
                    svgDiagram: this.renderBasicShapeSVG(isTri ? 'triangle' : 'square'),
                    answer: ans,
                    inputMode: 'choice',
                    options: [
                        { label: '3', value: 3 },
                        { label: '4', value: 4 },
                        { label: '5', value: 5 }
                    ],
                    explanation: isTri ? 'ㄙㄢ ㄐㄧㄠˇ ㄒㄧㄥˊ ㄧㄡˇ 3 ㄊㄧㄠˊ ㄅㄧㄢ ㄏㄜˊ 3 ㄍㄜ˙ ㄐㄧㄠˇ！' : 'ㄓㄥˋ ㄈㄤ ㄒㄧㄥˊ ㄧㄡˇ 4 ㄊㄧㄠˊ ㄧ ㄧㄤˋ ㄔㄤˊ ㄉㄜ˙ ㄅㄧㄢ！'
                };
            }
        }
    }

    // ==========================================
    // 🎒 小學二年級題庫（隨關卡 1~6 遞增難度與題型）
    // ==========================================
    static generateGrade2(category, enemy = null, stageId = 1, forceParens = false) {
        const tier = this.getStageTier(stageId);

        if (category === 'attack') {
            const pool = tier === 1 ? [1, 2, 3] : tier === 2 ? [1, 2, 3, 4] : [2, 3, 4, 5];
            const type = forceParens ? this.pick([3, 4, 5]) : this.pick(pool);

            if (type === 1) {
                const a = this.randInt(15 + stageId * 6, 42 + stageId * 10);
                const b = this.randInt(14 + stageId * 4, 35 + stageId * 8);
                const ans = a + b;
                return {
                    unitName: '二/三位數進位加法',
                    hasParens: false,
                    prompt: '請算出加法的答案：',
                    displayHtml: `${a} + ${b} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">個位 ${a % 10}+${b % 10}=${(a % 10) + (b % 10)}</span>，再加十位 ${Math.floor(a / 10) * 10}+${Math.floor(b / 10) * 10}`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 10),
                    explanation: `${a} + ${b} = ${ans}。`
                };
            } else if (type === 2) {
                const ans = this.randInt(14 + stageId * 5, 38 + stageId * 8);
                const b = this.randInt(15 + stageId * 3, 29 + stageId * 6);
                const a = ans + b;
                return {
                    unitName: '二位數退位減法',
                    hasParens: false,
                    prompt: '請算出減法的答案：',
                    displayHtml: `${a} - ${b} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} - ${b}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 5),
                    explanation: `${a} 減去 ${b} 等於 ${ans}。`
                };
            } else if (type === 3) {
                const a = this.randInt(30 + stageId * 5, 55 + stageId * 8);
                const b = this.randInt(12, 24 + stageId * 2);
                const c = this.randInt(9, 18 + stageId * 3);
                const ans = a - b + c;
                return {
                    unitName: '兩步驟加減混合',
                    hasParens: true,
                    prompt: '由左而右依序算出答案：',
                    displayHtml: `${a} - ${b} + ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} - ${b} = ${a - b}</span>，再 + ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 8, 3, 5),
                    explanation: `先算 ${a} - ${b} = ${a - b}，再算 ${a - b} + ${c} = ${ans}。`
                };
            } else if (type === 4) {
                // 求未知數 [ ? ] - b = c
                const b = this.randInt(16, 28 + stageId * 3);
                const c = this.randInt(18, 32 + stageId * 4);
                const ans = b + c;
                return {
                    unitName: '加減關係與未知數',
                    hasParens: true,
                    prompt: '請問 [ ? ] 裡面應該填入什麼數字？',
                    displayHtml: `[ ? ] - ${b} = ${c}`,
                    hintDisplayHtml: `把減掉的加回來：<span class="priority-highlight">${c} + ${b}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 15),
                    explanation: `因為被減數 = 差 + 減數，所以 ${c} + ${b} = ${ans}！`
                };
            } else {
                // 帶括號先加再減（買兩樣東西找錢）
                const p1 = this.randInt(18, 28 + stageId * 2);
                const p2 = this.randInt(12, 22 + stageId * 2);
                const paid = 100;
                const ans = paid - (p1 + p2);
                return {
                    unitName: '購物找零兩步驟應用',
                    hasParens: true,
                    prompt: `小魔女帶了 100 元，買了 ${p1} 元的藥水和 ${p2} 元的卷軸，請問還剩下幾元？`,
                    displayHtml: `100 - (${p1} + ${p2}) = ?`,
                    hintDisplayHtml: `先算總共花掉 <span class="priority-highlight">${p1} + ${p2} = ${p1 + p2}</span>，再用 100 去減！`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 8, 3, 5),
                    explanation: `先算共花掉 ${p1} + ${p2} = ${p1 + p2} 元，再算 100 - ${p1 + p2} = ${ans} 元！`
                };
            }
        } else if (category === 'break') {
            if (enemy && enemy.remainderArmor) {
                const d = this.randInt(3, 6);
                const q = this.randInt(3, 6);
                const r = this.randInt(1, d - 1);
                const total = d * q + r;
                return {
                    unitName: '九九乘法與平分餘數',
                    hasParens: false,
                    prompt: `⚙️ 把 ${total} 顆魔力石每 ${d} 顆裝一盒，裝滿 ${q} 盒後，還剩下幾顆？`,
                    displayHtml: `${d} × ${q} = ${d * q}，${total} - ${d * q} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${total} - ${d * q}</span> = ?`,
                    answer: r,
                    inputMode: 'number',
                    options: this.makeOptions(r, 2, 3, 1),
                    explanation: `${d} × ${q} = ${d * q}，用 ${total} - ${d * q} = 剩下 ${r} 顆！`
                };
            }

            const pool = tier === 1 ? [1, 2, 4] : [1, 2, 3, 4];
            const type = this.pick(pool);
            if (type === 1) {
                const a = tier === 1 ? this.randInt(2, 6) : this.randInt(4, 9);
                const b = tier === 1 ? this.randInt(2, 8) : this.randInt(6, 9);
                const prod = a * b;
                return {
                    unitName: '九九乘法表',
                    hasParens: false,
                    prompt: '請算出九九乘法的答案：',
                    displayHtml: `${a} × ${b} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} 的 ${b} 倍</span>是多少？`,
                    answer: prod,
                    inputMode: 'number',
                    options: this.makeOptions(prod, a, 3, 4),
                    explanation: `${a} × ${b} = ${prod}！`
                };
            } else if (type === 2) {
                const a = this.randInt(3, 9);
                const b = this.randInt(3, 9);
                const prod = a * b;
                return {
                    unitName: '九九乘法逆推',
                    hasParens: false,
                    prompt: `想一想，${a} 乘以多少會等於 ${prod}？`,
                    displayHtml: `${a} × [ ? ] = ${prod}`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} × ? = ${prod}</span>`,
                    answer: b,
                    inputMode: 'number',
                    options: this.makeOptions(b, 2, 3, 1),
                    explanation: `因為 ${a} × ${b} = ${prod}，所以空格是 ${b}！`
                };
            } else if (type === 3) {
                // 乘加或乘減兩步驟
                const a = this.randInt(3, 8);
                const b = this.randInt(4, 8);
                const c = this.randInt(5, 18);
                const ans = a * b + c;
                return {
                    unitName: '乘加兩步驟計算',
                    hasParens: true,
                    prompt: '先算出乘法的積，再加上後面的數：',
                    displayHtml: `${a} × ${b} + ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} × ${b} = ${a * b}</span>，再 + ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 6, 3, 10),
                    explanation: `先算 ${a} × ${b} = ${a * b}，再算 ${a * b} + ${c} = ${ans}！`
                };
            } else {
                // 三位數位值（幾個百、幾個十、幾個一）
                const h = this.randInt(1, 3 + stageId);
                const t = this.randInt(0, 9);
                const o = this.randInt(1, 9);
                const ans = h * 100 + t * 10 + o;
                return {
                    unitName: '三位數的位值合成',
                    hasParens: false,
                    prompt: `「${h} 個百、${t} 個十和 ${o} 個一」合起來是多少？`,
                    displayHtml: `${h * 100} + ${t * 10} + ${o} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">百位${h}、十位${t}、個位${o}</span>`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 100),
                    explanation: `${h} 個百是 ${h * 100}，加上 ${t} 個十和 ${o} 個一，合起來是 ${ans}！`
                };
            }
        } else {
            // 小二幾何：1.平面邊角頂點、2.公尺與公分、3.時鐘幾點幾分、4.正方體頂點與邊(高階)
            const pool = tier === 1 ? [1, 2] : [1, 2, 3, 4];
            const type = this.pick(pool);
            if (type === 1) {
                const items = [
                    { q: '請問一個「三角形」有幾個頂點、幾條邊？', svg: this.renderBasicShapeSVG('triangle'), ans: 3, exp: '三角形有 3 條邊、3 個角和 3 個頂點！' },
                    { q: '請問一個「正方形」有幾條一樣長的邊？', svg: this.renderBasicShapeSVG('square'), ans: 4, exp: '正方形有 4 條一樣長的邊、4 個角和 4 個頂點！' }
                ];
                const chosen = this.pick(items);
                return {
                    unitName: '平面圖形的邊、角、頂點',
                    hasParens: false,
                    prompt: chosen.q,
                    displayHtml: '請選出正確的數量：',
                    hintDisplayHtml: '數一數圖形的邊或尖尖的頂點！',
                    svgDiagram: chosen.svg,
                    answer: chosen.ans,
                    inputMode: 'choice',
                    options: [
                        { label: '3 個', value: 3 },
                        { label: '4 個', value: 4 },
                        { label: '5 個', value: 5 }
                    ],
                    explanation: chosen.exp
                };
            } else if (type === 2) {
                const m = this.randInt(1, 3 + stageId);
                const cm = this.randInt(8, 92);
                const ans = m * 100 + cm;
                return {
                    unitName: '公尺與公分的換算',
                    hasParens: false,
                    prompt: `已知 1 公尺 = 100 公分，請問「${m} 公尺 ${cm} 公分」合起來是幾公分？`,
                    displayHtml: `${m} 公尺 ${cm} 公分 = ? 公分`,
                    hintDisplayHtml: `<span class="priority-highlight">${m * 100} + ${cm}</span> = ? 公分`,
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 50, 3, 100, ' 公分'),
                    explanation: `${m} 公尺是 ${m * 100} 公分，加上 ${cm} 公分 = ${ans} 公分！`
                };
            } else if (type === 3) {
                // 時鐘判讀（5分一數）
                const hour = this.randInt(1, 11);
                const fiveStep = this.randInt(1, 11);
                const minute = fiveStep * 5;
                return {
                    unitName: '認識幾點幾分（時鐘刻度）',
                    hasParens: false,
                    prompt: `長針走一大格是 5 分鐘！現在長針指在數字 ${fiveStep}，請問是 ${hour} 點幾分？`,
                    displayHtml: `${hour} 點 [ ? ] 分 （5 × ${fiveStep} = ?）`,
                    hintDisplayHtml: `<span class="priority-highlight">5 × ${fiveStep}</span> = ? 分`,
                    svgDiagram: this.renderClockSVG(hour, minute),
                    answer: minute,
                    inputMode: 'choice',
                    options: this.makeOptions(minute, 5, 3, 5, ' 分'),
                    explanation: `長針指在 ${fiveStep}，代表走了 ${fiveStep} 大格：5 × ${fiveStep} = ${minute} 分！`
                };
            } else {
                // 正方體的面與頂點
                const askFaces = Math.random() < 0.5;
                const ans = askFaces ? 6 : 8;
                return {
                    unitName: '正方體與長方體的認識',
                    hasParens: false,
                    prompt: askFaces
                        ? '像骰子一樣的「正方體」魔導方塊，總共有幾個正方形的「面」？'
                        : '一個「正方體」魔導方塊，上下兩層加起來總共有幾個「頂點」？',
                    displayHtml: `正方體共有 [ ? ] 個${askFaces ? '面' : '頂點'}`,
                    hintDisplayHtml: askFaces ? '上下 2 個面 + 前後左右 4 個面 = ?' : '上面 4 個角 + 下面 4 個角 = ?',
                    svgDiagram: this.renderBasicShapeSVG('square'),
                    answer: ans,
                    inputMode: 'choice',
                    options: [
                        { label: '6 個', value: 6 },
                        { label: '8 個', value: 8 },
                        { label: '12 個', value: 12 }
                    ],
                    explanation: `正方體有 6 個面、8 個頂點和 12 條邊！`
                };
            }
        }
    }

    // ==========================================
    // 🎒 小學三年級題庫（隨關卡 1~6 遞增難度與題型）
    // ==========================================
    static generateGrade3(category, enemy = null, stageId = 1, forceParens = false) {
        const tier = this.getStageTier(stageId);

        if (category === 'attack') {
            const pool = tier === 1 ? [1, 2] : tier === 2 ? [1, 2, 3, 4] : [2, 3, 4, 5];
            const type = forceParens ? this.pick([2, 3, 4]) : this.pick(pool);

            if (type === 1) {
                const a = this.randInt(120 + stageId * 40, 350 + stageId * 60);
                const b = this.randInt(85 + stageId * 25, 240 + stageId * 40);
                const isAdd = Math.random() < 0.5;
                const ans = isAdd ? a + b : a - b;
                return {
                    unitName: '三位數加減計算',
                    hasParens: false,
                    prompt: '請算出下列三位數算式的答案：',
                    displayHtml: `${a} ${isAdd ? '+' : '-'} ${b} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} ${isAdd ? '+' : '-'} ${b}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 20, 3, 10),
                    explanation: `${a} ${isAdd ? '+' : '-'} ${b} = ${ans}。`
                };
            } else if (type === 2) {
                const a = this.randInt(4, 8 + Math.floor(stageId / 2));
                const b = this.randInt(4, 9);
                const c = this.randInt(12, 25 + stageId * 6);
                const ans = a * b + c;
                return {
                    unitName: '乘加兩步驟計算',
                    hasParens: true,
                    prompt: '請先算乘法，再加上後面的數：',
                    displayHtml: `${a} × ${b} + ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} × ${b} = ${a * b}</span>，再 + ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 8, 3, 10),
                    explanation: `先算 ${a} × ${b} = ${a * b}，再算 ${a * b} + ${c} = ${ans}。`
                };
            } else if (type === 3) {
                const b = this.randInt(4, 9);
                const c = this.randInt(4, 9);
                const prod = b * c;
                const ans = this.randInt(12, 30 + stageId * 5);
                const a = prod + ans;
                return {
                    unitName: '先乘後減兩步驟',
                    hasParens: true,
                    prompt: '請先算乘法部分，再用前面的數減去它：',
                    displayHtml: `${a} - ${b} × ${c} = ?`,
                    hintDisplayHtml: `${a} - <span class="priority-highlight">${b} × ${c} (${prod})</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 8, 3, 5),
                    explanation: `先算 ${b} × ${c} = ${prod}，再算 ${a} - ${prod} = ${ans}！`
                };
            } else if (type === 4) {
                // 含括號兩步驟
                const a = this.randInt(6, 12 + stageId);
                const b = this.randInt(4, 9);
                const c = this.randInt(3, 6);
                const ans = (a + b) * c;
                return {
                    unitName: '括號先算兩步驟',
                    hasParens: true,
                    prompt: '算式裡有括號 () 時，請先算括號裡面的加法：',
                    displayHtml: `(${a} + ${b}) × ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a} + ${b} = ${a + b})</span> × ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 10),
                    explanation: `先算括號內 (${a} + ${b}) = ${a + b}，再算 ${a + b} × ${c} = ${ans}！`
                };
            } else {
                // 連乘巧算
                const a = this.pick([2, 4, 5]);
                const c = a === 4 ? 5 : a === 5 ? 2 : 5;
                const b = this.randInt(4, 9 + stageId);
                const ans = a * b * c;
                return {
                    unitName: '連乘兩步驟巧算',
                    hasParens: true,
                    prompt: '連乘算式可以先算好算的兩個數！請算出答案：',
                    displayHtml: `${a} × ${b} × ${c} = ?`,
                    hintDisplayHtml: `先算 <span class="priority-highlight">${a} × ${c} = ${a * c}</span>，再乘以 ${b} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 10),
                    explanation: `先算 ${a} × ${c} = ${a * c}，再算 ${a * c} × ${b} = ${ans}！`
                };
            }
        } else if (category === 'break') {
            if (enemy && enemy.remainderArmor) {
                const d = this.randInt(4, 7 + Math.floor(stageId / 2));
                const q = this.randInt(5, 9 + stageId);
                const r = this.randInt(1, d - 1);
                const total = d * q + r;
                return {
                    unitName: '除法與餘數（解除餘數裝甲）',
                    hasParens: false,
                    prompt: `⚙️ 敵人開啟了【餘數裝甲】！請算出 ${total} ÷ ${d} 的「餘數」來擊碎裝甲：`,
                    displayHtml: `${total} ÷ ${d} = ${q} ⋯ ?`,
                    hintDisplayHtml: `${d} × ${q} = ${d * q}，<span class="priority-highlight">${total} - ${d * q}</span> = ?`,
                    answer: r,
                    inputMode: 'number',
                    options: this.makeOptions(r, 2, 3, 1),
                    explanation: `因為 ${d} × ${q} = ${d * q}，${total} - ${d * q} = ${r}，所以餘數是 ${r}！`
                };
            }

            const pool = tier === 1 ? [1, 2, 3] : [1, 2, 3, 4, 5];
            const type = this.pick(pool);
            if (type === 1) {
                const d = this.randInt(3, 8);
                const q = this.randInt(4, 8 + stageId);
                const r = this.randInt(1, d - 1);
                const total = d * q + r;
                return {
                    unitName: '一位數除法與餘數',
                    hasParens: false,
                    prompt: `請算出 ${total} 除以 ${d} 的「餘數」是多少？`,
                    displayHtml: `${total} ÷ ${d} = ${q} ⋯ ?`,
                    hintDisplayHtml: `${d} × ${q} = ${d * q}，<span class="priority-highlight">${total} - ${d * q}</span> = ?`,
                    answer: r,
                    inputMode: 'number',
                    options: this.makeOptions(r, 2, 3, 1),
                    explanation: `因為 ${d} × ${q} = ${d * q}，${total} - ${d * q} = ${r}，所以餘數是 ${r}！`
                };
            } else if (type === 2) {
                const a = this.randInt(12 + stageId * 3, 25 + stageId * 6);
                const b = this.randInt(3, 6 + Math.floor(stageId / 2));
                const ans = a * b;
                return {
                    unitName: '二位數乘以一位數',
                    hasParens: false,
                    prompt: '請算出二位數乘以一位數的積：',
                    displayHtml: `${a} × ${b} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${Math.floor(a / 10) * 10}×${b} + ${a % 10}×${b}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 20),
                    explanation: `${a} × ${b} = ${ans}！`
                };
            } else if (type === 3) {
                const denom = this.pick([7, 8, 9, 10, 12, 15]);
                const n1 = this.randInt(1, Math.floor(denom / 2));
                const n2 = this.randInt(2, denom - n1);
                const ans = n1 + n2;
                return {
                    unitName: '同分母分數加法',
                    hasParens: false,
                    prompt: `同分母分數相加，分母不變，分子相加！請問答案的「分子」是多少？`,
                    displayHtml: `${n1}/${denom} + ${n2}/${denom} = [ ? ]/${denom}`,
                    hintDisplayHtml: `分子相加：<span class="priority-highlight">${n1} + ${n2}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 2, 3, 1),
                    explanation: `分母都是 ${denom}，只要把分子相加：${n1} + ${n2} = ${ans}，答案是 ${ans}/${denom}。`
                };
            } else if (type === 4) {
                // 一位小數加法（以選項或整數題呈現）
                const a = this.randInt(12, 38 + stageId * 5) / 10;
                const b = this.randInt(11, 29 + stageId * 4) / 10;
                const ans = Number((a + b).toFixed(1));
                return {
                    unitName: '一位小數的加法',
                    hasParens: false,
                    prompt: '對齊小數點，算出小數加法的答案：',
                    displayHtml: `${a.toFixed(1)} + ${b.toFixed(1)} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a.toFixed(1)} + ${b.toFixed(1)}</span> = ?`,
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 1.2, 3, 0.5),
                    explanation: `小數點對齊相加：${a.toFixed(1)} + ${b.toFixed(1)} = ${ans}！`
                };
            } else {
                // 公斤與公克換算
                const kg = this.randInt(1, 4 + stageId);
                const g = this.randInt(120, 850);
                const ans = kg * 1000 + g;
                return {
                    unitName: '公斤與公克的換算',
                    hasParens: false,
                    prompt: `已知 1 公斤 = 1000 公克，請問「${kg} 公斤 ${g} 公克」合起來是幾公克？`,
                    displayHtml: `${kg} kg ${g} g = ? g`,
                    hintDisplayHtml: `<span class="priority-highlight">${kg * 1000} + ${g}</span> = ? g`,
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 200, 3, 1000, ' g'),
                    explanation: `${kg} 公斤 = ${kg * 1000} 公克，加上 ${g} 公克 = ${ans} 公克！`
                };
            }
        } else {
            // 小三幾何：1.正方形周長、2.長方形周長、3.已知正方形周長反求邊長(中高階)、4.圓的半徑與直徑
            const pool = tier === 1 ? [1, 2] : [1, 2, 3, 4];
            const type = this.pick(pool);
            if (type === 1) {
                const side = this.randInt(5 + stageId, 14 + stageId * 2);
                const ans = side * 4;
                return {
                    unitName: '正方形的周長',
                    hasParens: false,
                    prompt: `下圖是一個邊長 ${side} 公分的正方形，請問它的「周長」是幾公分？`,
                    displayHtml: `正方形周長 = ${side} × 4 = ? cm`,
                    hintDisplayHtml: `<span class="priority-highlight">${side} × 4</span> = ? cm`,
                    svgDiagram: this.renderRectPerimeterSVG(side, side, true),
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 8, 3, 12, ' cm'),
                    explanation: `正方形有 4 條等長的邊，周長 = ${side} × 4 = ${ans} 公分！`
                };
            } else if (type === 2) {
                const w = this.randInt(6 + stageId, 14 + stageId * 2);
                const h = this.randInt(3 + Math.floor(stageId / 2), w - 1);
                const ans = (w + h) * 2;
                return {
                    unitName: '長方形的周長',
                    hasParens: false,
                    prompt: `下圖長方形的長是 ${w} 公分、寬是 ${h} 公分，請問它的「周長」是幾公分？`,
                    displayHtml: `(${w} + ${h}) × 2 = ? cm`,
                    hintDisplayHtml: `<span class="priority-highlight">(${w} + ${h}) × 2</span> = ? cm`,
                    svgDiagram: this.renderRectPerimeterSVG(w, h, false),
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 6, 3, 10, ' cm'),
                    explanation: `長方形周長 = (長 + 寬) × 2 = (${w} + ${h}) × 2 = ${ans} 公分！`
                };
            } else if (type === 3) {
                const side = this.randInt(6, 15 + stageId * 2);
                const perim = side * 4;
                return {
                    unitName: '已知正方形周長反求邊長',
                    hasParens: false,
                    prompt: `一個正方形魔法陣的「周長總共是 ${perim} 公分」，請問它的一條「邊長」是幾公分？`,
                    displayHtml: `${perim} ÷ 4 = ? cm`,
                    hintDisplayHtml: `正方形4條邊一樣長：<span class="priority-highlight">${perim} ÷ 4</span> = ?`,
                    svgDiagram: this.renderRectPerimeterSVG('?', '?', true),
                    answer: side,
                    inputMode: 'choice',
                    options: this.makeOptions(side, 4, 3, 2, ' cm'),
                    explanation: `正方形周長 ÷ 4 = 邊長，所以 ${perim} ÷ 4 = ${side} 公分！`
                };
            } else {
                const r = this.randInt(5, 14 + stageId * 2);
                const d = r * 2;
                return {
                    unitName: '圓心、半徑與直徑',
                    hasParens: false,
                    prompt: `下圖魔法圓的「半徑 r 是 ${r} 公分」，請問通過圓心的「直徑」是幾公分？（直徑 = 半徑 × 2）`,
                    displayHtml: `直徑 = ${r} × 2 = ? cm`,
                    hintDisplayHtml: `<span class="priority-highlight">${r} × 2</span> = ? cm`,
                    svgDiagram: this.renderCircleRadiusSVG(r),
                    answer: d,
                    inputMode: 'choice',
                    options: this.makeOptions(d, 6, 3, 6, ' cm'),
                    explanation: `同一個圓的直徑是半徑的 2 倍：${r} × 2 = ${d} 公分！`
                };
            }
        }
    }

    // ==========================================
    // 🎒 小學四年級題庫（隨關卡 1~6 遞增難度與題型）
    // ==========================================
    static generateGrade4(category, enemy = null, stageId = 1, forceParens = false) {
        if (category === 'attack') return this.generateGrade4Attack(stageId, forceParens);
        if (category === 'break') return this.generateGrade4Break(enemy, stageId);
        return this.generateGrade4Defense(enemy, stageId);
    }

    static generateGrade4Attack(stageId = 1, forceParens = false) {
        const tier = this.getStageTier(stageId);
        const useParens = forceParens || stageId >= 2;

        // 高階關卡（第 4~6 關）加入三步驟四則運算與雙括號四則運算！
        if (tier >= 2 && Math.random() < (tier === 3 ? 0.65 : 0.4)) {
            const advPattern = this.randInt(1, 3);
            if (advPattern === 1) {
                // (a + b) × c - d
                const a = this.randInt(6, 12 + stageId);
                const b = this.randInt(4, 10 + stageId);
                const c = this.randInt(3, 6);
                const prod = (a + b) * c;
                const d = this.randInt(8, prod - 10);
                const ans = prod - d;
                return {
                    unitName: '三步驟四則混合運算',
                    hasParens: true,
                    prompt: '請依「括號先算 ➔ 先乘除後加減」算出三步驟算式答案：',
                    displayHtml: `(${a} + ${b}) × ${c} - ${d} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a} + ${b} = ${a + b})</span> × ${c} - ${d} = ${prod} - ${d} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 5),
                    explanation: `第一步算括號 (${a}+${b})=${a + b}，第二步算乘法 ${a + b}×${c}=${prod}，第三步算 ${prod}-${d}=${ans}！`
                };
            } else if (advPattern === 2) {
                // 双括號 (a + b) × (c - d)
                const a = this.randInt(4, 9 + stageId);
                const b = this.randInt(3, 8);
                const d = this.randInt(5, 14);
                const diff = this.randInt(3, 7);
                const c = d + diff;
                const ans = (a + b) * diff;
                return {
                    unitName: '雙括號四則混合運算',
                    hasParens: true,
                    prompt: '含有兩個括號的算式，請分別算出兩個括號內的數再相乘：',
                    displayHtml: `(${a} + ${b}) × (${c} - ${d}) = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a + b}) × (${diff})</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 12, 3, 6),
                    explanation: `左邊括號 (${a}+${b})=${a + b}，右邊括號 (${c}-${d})=${diff}，相乘得 ${a + b} × ${diff} = ${ans}！`
                };
            } else {
                // a + (b - c) ÷ d
                const d = this.randInt(3, 8);
                const q = this.randInt(4, 9 + stageId);
                const diff = d * q;
                const c = this.randInt(6, 18);
                const b = diff + c;
                const a = this.randInt(12, 25 + stageId * 3);
                const ans = a + q;
                return {
                    unitName: '三步驟括號與除法混合',
                    hasParens: true,
                    prompt: '請先算括號內減法，再算除法，最後算加法：',
                    displayHtml: `${a} + (${b} - ${c}) ÷ ${d} = ?`,
                    hintDisplayHtml: `${a} + <span class="priority-highlight">${diff} ÷ ${d} (${q})</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 6, 3, 5),
                    explanation: `先算括號 (${b}-${c})=${diff}，再算除法 ${diff}÷${d}=${q}，最後 ${a}+${q}=${ans}！`
                };
            }
        }

        if (!useParens) {
            const pattern = this.randInt(1, 4);
            if (pattern === 1) {
                const a = this.randInt(8, 25 + stageId * 4), b = this.randInt(3, 8 + stageId), c = this.randInt(3, 8);
                const step1 = b * c, ans = a + step1;
                return {
                    unitName: '四則混合運算（先乘除後加減）',
                    hasParens: false,
                    prompt: '請算出下列算式的答案：',
                    displayHtml: `${a} + ${b} × ${c} = ?`,
                    hintDisplayHtml: `${a} + <span class="priority-highlight">${b} × ${c}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 8, 3, 1),
                    explanation: `口訣「先乘除，後加減」：先算 ${b} × ${c} = ${step1}，再算 ${a} + ${step1} = ${ans}。`
                };
            } else if (pattern === 2) {
                const b = this.randInt(3, 9), c = this.randInt(3, 8), step1 = b * c, ans = this.randInt(5, 25 + stageId * 3), a = step1 + ans;
                return {
                    unitName: '四則混合運算（先乘除後加減）',
                    hasParens: false,
                    prompt: '請算出下列算式的答案：',
                    displayHtml: `${a} - ${b} × ${c} = ?`,
                    hintDisplayHtml: `${a} - <span class="priority-highlight">${b} × ${c}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 8, 3, 1),
                    explanation: `先算 ${b} × ${c} = ${step1}，再算 ${a} - ${step1} = ${ans}。`
                };
            } else if (pattern === 3) {
                const c = this.randInt(3, 9), step1 = this.randInt(3, 10 + stageId), b = c * step1, a = this.randInt(10, 35), ans = a + step1;
                return {
                    unitName: '四則混合運算（先乘除後加減）',
                    hasParens: false,
                    prompt: '請算出下列算式的答案：',
                    displayHtml: `${a} + ${b} ÷ ${c} = ?`,
                    hintDisplayHtml: `${a} + <span class="priority-highlight">${b} ÷ ${c}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 6, 3, 1),
                    explanation: `先算除法 ${b} ÷ ${c} = ${step1}，再算 ${a} + ${step1} = ${ans}。`
                };
            } else {
                const a = this.randInt(6, 12 + stageId), b = this.randInt(4, 9), step1 = a * b, c = this.randInt(8, step1 - 5), ans = step1 - c;
                return {
                    unitName: '四則混合運算（先乘除後加減）',
                    hasParens: false,
                    prompt: '請算出下列算式的答案：',
                    displayHtml: `${a} × ${b} - ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${a} × ${b}</span> - ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 8, 3, 1),
                    explanation: `先算乘法 ${a} × ${b} = ${step1}，再算 ${step1} - ${c} = ${ans}。`
                };
            }
        } else {
            const pattern = this.randInt(1, 4);
            if (pattern === 1) {
                const b = this.randInt(4, 15 + stageId * 2), diff = this.randInt(4, 12 + stageId), a = b + diff, c = this.randInt(3, 8), ans = diff * c;
                return {
                    unitName: '四則混合運算（括號優先算）',
                    hasParens: true,
                    prompt: '含有括號 () 的算式，請算出答案：',
                    displayHtml: `(${a} - ${b}) × ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a} - ${b})</span> × ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 1),
                    explanation: `有括號要先算括號內：(${a} - ${b}) = ${diff}，再算 ${diff} × ${c} = ${ans}。`
                };
            } else if (pattern === 2) {
                const a = this.randInt(5, 14 + stageId * 2), b = this.randInt(4, 12 + stageId), sum = a + b, c = this.randInt(3, 7), ans = sum * c;
                return {
                    unitName: '四則混合運算（括號優先算）',
                    hasParens: true,
                    prompt: '含有括號 () 的算式，請算出答案：',
                    displayHtml: `(${a} + ${b}) × ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a} + ${b})</span> × ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 10, 3, 1),
                    explanation: `先算括號內：(${a} + ${b}) = ${sum}，再算 ${sum} × ${c} = ${ans}。`
                };
            } else if (pattern === 3) {
                const c = this.randInt(4, 9), ans = this.randInt(5, 12 + stageId * 2), total = c * ans, a = this.randInt(10, total - 6), b = total - a;
                return {
                    unitName: '四則混合運算（括號優先算）',
                    hasParens: true,
                    prompt: '含有括號 () 的算式，請算出答案：',
                    displayHtml: `(${a} + ${b}) ÷ ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a} + ${b})</span> ÷ ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 4, 3, 1),
                    explanation: `先算括號內：(${a} + ${b}) = ${total}，再算 ${total} ÷ ${c} = ${ans}。`
                };
            } else {
                const a = this.randInt(5, 11 + stageId), c = this.randInt(6, 18), diff = this.randInt(3, 9), b = c + diff, ans = a * diff;
                return {
                    unitName: '四則混合運算（括號優先算）',
                    hasParens: true,
                    prompt: '含有括號 () 的算式，請算出答案：',
                    displayHtml: `${a} × (${b} - ${c}) = ?`,
                    hintDisplayHtml: `${a} × <span class="priority-highlight">(${b} - ${c})</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 8, 3, 1),
                    explanation: `先算括號內：(${b} - ${c}) = ${diff}，再算 ${a} × ${diff} = ${ans}。`
                };
            }
        }
    }

    static generateGrade4Break(enemy = null, stageId = 1) {
        const tier = this.getStageTier(stageId);

        if (enemy && enemy.remainderArmor) {
            const divisor = this.randInt(6 + tier, 11 + stageId);
            const quotient = this.randInt(6 + tier, 12 + stageId);
            const remainder = this.randInt(1, divisor - 1);
            const dividend = divisor * quotient + remainder;
            return {
                unitName: '有餘數的除法（解除餘數裝甲）',
                hasParens: false,
                prompt: `⚙️ 敵人開啟了【餘數裝甲】！請算出除法算式的「餘數」來擊碎裝甲：`,
                displayHtml: `${dividend} ÷ ${divisor} = ${quotient} ⋯ ?`,
                hintDisplayHtml: `${dividend} ÷ ${divisor} = ${quotient} ⋯ <span class="priority-highlight">? (提示：${divisor}×${quotient}=${divisor * quotient})</span>`,
                answer: remainder,
                inputMode: 'number',
                options: this.makeOptions(remainder, 3, 3, 1),
                explanation: `因為 ${divisor} × ${quotient} = ${divisor * quotient}，再用 ${dividend} - ${divisor * quotient} = ${remainder}，所以餘數是 ${remainder}！`
            };
        }

        if (enemy && enemy.shield > 0 && Math.random() < 0.55) {
            const shieldVal = enemy.shield;
            const factors = [];
            for (let f = 2; f <= Math.min(30, Math.floor(shieldVal / 2)); f++) {
                if (shieldVal % f === 0) factors.push(f);
            }
            if (factors.length > 0) {
                const divisor = this.pick(factors);
                const ans = shieldVal / divisor;
                return {
                    unitName: '多位數除法（護盾破除）',
                    hasParens: false,
                    prompt: `⚡ 精靈擁有 ${shieldVal} 點數字護盾！請算出正確的商擊碎護盾：`,
                    displayHtml: `${shieldVal} ÷ ${divisor} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${shieldVal} ÷ ${divisor}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 5, 3, 1),
                    explanation: `因為 ${divisor} × ${ans} = ${shieldVal}，所以 ${shieldVal} ÷ ${divisor} = ${ans}！`
                };
            }
        }

        const type = this.randInt(1, 3);
        if (type === 1) {
            const a = this.randInt(12 + stageId * 4, 28 + stageId * 7);
            const b = tier >= 3 ? this.randInt(11, 15) : this.randInt(4, 9);
            const ans = a * b;
            return {
                unitName: '多位數乘法（雷電貫穿）',
                hasParens: false,
                prompt: '請算出多位數乘法的答案：',
                displayHtml: `${a} × ${b} = ?`,
                hintDisplayHtml: `<span class="priority-highlight">${Math.floor(a / 10) * 10}×${b} + ${a % 10}×${b}</span> = ?`,
                answer: ans,
                inputMode: 'number',
                options: this.makeOptions(ans, 12, 3, 10),
                explanation: `${a} × ${b} = ${ans}。`
            };
        } else if (type === 2) {
            // 假分數換帶分數
            const denom = this.pick([4, 5, 6, 7, 8, 9]);
            const whole = this.randInt(2, 4 + Math.floor(stageId / 2));
            const num = this.randInt(1, denom - 1);
            const imp = whole * denom + num;
            return {
                unitName: '假分數與帶分數互換',
                hasParens: false,
                prompt: `將假分數 ${imp}/${denom} 換成帶分數「${whole} 又 [ ? ]/${denom}」時，請問分子 [ ? ] 是多少？`,
                displayHtml: `${imp}/${denom} = ${whole} 又 [ ? ]/${denom}`,
                hintDisplayHtml: `${imp} ÷ ${denom} = ${whole} 餘 <span class="priority-highlight">${num}</span>`,
                answer: num,
                inputMode: 'number',
                options: this.makeOptions(num, 2, 3, 1),
                explanation: `因為 ${imp} ÷ ${denom} = ${whole} ⋯ ${num}，所以 ${imp}/${denom} = ${whole} 又 ${num}/${denom}！`
            };
        } else {
            // 公里與公尺換算
            const km = this.randInt(2, 5 + stageId);
            const m = this.randInt(50, 950);
            const ans = km * 1000 + m;
            return {
                unitName: '公里與公尺的換算',
                hasParens: false,
                prompt: `已知 1 公里 = 1000 公尺，請問「${km} 公里 ${m} 公尺」合起來是幾公尺？`,
                displayHtml: `${km} km ${m} m = ? m`,
                hintDisplayHtml: `<span class="priority-highlight">${km * 1000} + ${m}</span> = ? m`,
                answer: ans,
                inputMode: 'choice',
                options: this.makeOptions(ans, 200, 3, 1000, ' m'),
                explanation: `${km} 公里是 ${km * 1000} 公尺，加上 ${m} 公尺 = ${ans} 公尺！`
            };
        }
    }

    static generateGrade4Defense(enemy = null, stageId = 1) {
        const tier = this.getStageTier(stageId);

        if (enemy && enemy.breathAngle) {
            const breath = enemy.breathAngle;
            const supp = 180 - breath;
            return {
                unitName: '平角與補角（格擋廣角吐息）',
                hasParens: false,
                prompt: `🐉 水晶龍姬發動【${breath}° 廣角吐息】！平角是 180°，請算出還差幾度才能湊成 180° 平角折射盾？`,
                displayHtml: `180° - ${breath}° = ?°`,
                hintDisplayHtml: `<span class="priority-highlight">180° - ${breath}°</span> = ?°`,
                svgDiagram: this.renderSupplementaryAngleSVG(breath),
                answer: supp,
                inputMode: 'choice',
                options: this.makeOptions(supp, 15, 3, 10, '°'),
                explanation: `平角是 180°，扣除 ${breath}° 後，180° - ${breath}° = ${supp}°！`
            };
        }

        const pool = tier === 1 ? [1, 2, 3, 4] : [1, 3, 4, 5, 6];
        const qType = this.pick(pool);
        if (qType === 1) {
            const angles = [30, 45, 60, 75, 90, 105, 120, 135, 150];
            const deg = this.pick(angles);
            const wrongMirror = 180 - deg !== deg ? 180 - deg : deg + 30;
            const opts = this.shuffle([
                { label: `${deg}°`, value: deg },
                { label: `${wrongMirror}°`, value: wrongMirror },
                { label: `${deg === 90 ? 60 : 90}°`, value: deg === 90 ? 60 : 90 }
            ]);
            return {
                unitName: '量角器刻度判讀',
                hasParens: false,
                prompt: '請觀察量角器，兩條魔法射線張開的角度是幾度？',
                displayHtml: '量角器上的角 = ?°',
                hintDisplayHtml: '對齊右邊 0° 基線，讀取內圈刻度！',
                svgDiagram: this.renderProtractorSVG(deg),
                answer: deg,
                inputMode: 'choice',
                options: opts,
                explanation: `底邊對齊右邊 0° 刻度線，張開的射線指在 ${deg}°！`
            };
        } else if (qType === 2) {
            const items = [
                { deg: 45, ans: '銳角', desc: '小於 90° 的角稱為「銳角」' },
                { deg: 90, ans: '直角', desc: '剛好等於 90° 的角稱為「直角」' },
                { deg: 130, ans: '鈍角', desc: '大於 90° 且小於 180° 的角稱為「鈍角」' }
            ];
            const chosen = this.pick(items);
            return {
                unitName: '認識銳角、直角與鈍角',
                hasParens: false,
                prompt: `圖中張開 ${chosen.deg}° 的魔法角，屬於哪一種角？`,
                displayHtml: `${chosen.deg}° 是什麼角？`,
                hintDisplayHtml: `小於90°是銳角、等於90°是直角、大於90°是鈍角`,
                svgDiagram: this.renderSimpleAngleSVG(chosen.deg, true),
                answer: chosen.ans,
                inputMode: 'choice',
                options: [
                    { label: '銳角（< 90°）', value: '銳角' },
                    { label: '直角（= 90°）', value: '直角' },
                    { label: '鈍角（90°~180°）', value: '鈍角' }
                ],
                explanation: `${chosen.desc}！`
            };
        } else if (qType === 3) {
            const triTypes = [
                { id: '直角三角形', title: '請觀察下方的魔法結晶，它是哪一種三角形？', svg: this.renderTriangleSVG('right'), exp: '有一個角是 90° 直角的三角形，稱為「直角三角形」。' },
                { id: '鈍角三角形', title: '有一個角是 120° 鈍角的三角形稱為？', svg: this.renderTriangleSVG('obtuse'), exp: '有一個角大於 90° 的三角形，稱為「鈍角三角形」。' },
                { id: '等腰三角形', title: '左右兩條邊一樣長（10 cm）、兩底角相等的三角形稱為？', svg: this.renderTriangleSVG('isosceles'), exp: '兩條腰等長的三角形稱為「等腰三角形」。' },
                { id: '正三角形', title: '三條邊都一樣長（8 cm）、三個角都是 60° 的三角形稱為？', svg: this.renderTriangleSVG('equilateral'), exp: '三邊等長、三角皆為 60° 的三角形稱為「正三角形」。' }
            ];
            const chosen = this.pick(triTypes);
            const allLabels = ['直角三角形', '鈍角三角形', '等腰三角形', '正三角形'];
            const wrongChoices = this.shuffle(allLabels.filter(l => l !== chosen.id)).slice(0, 2);
            const opts = this.shuffle([chosen.id, ...wrongChoices]).map(l => ({ label: l, value: l }));
            return {
                unitName: '三角形的分類與性質',
                hasParens: false,
                prompt: chosen.title,
                displayHtml: '請選出正確的三角形名稱',
                hintDisplayHtml: '觀察邊長記號與角度大小！',
                svgDiagram: chosen.svg,
                answer: chosen.id,
                inputMode: 'choice',
                options: opts,
                explanation: chosen.exp
            };
        } else if (qType === 4) {
            const known = this.pick([45, 55, 65, 70, 115, 125, 135]);
            const ans = 180 - known;
            return {
                unitName: '平角（180°）與角度推算',
                hasParens: false,
                prompt: `平角是 180°，已知其中一角是 ${known}°，請問 ∠1 是幾度？`,
                displayHtml: `∠1 = 180° - ${known}° = ?°`,
                hintDisplayHtml: `<span class="priority-highlight">180° - ${known}°</span> = ?°`,
                svgDiagram: this.renderSupplementaryAngleSVG(known),
                answer: ans,
                inputMode: 'choice',
                options: this.makeOptions(ans, 10, 3, 15, '°'),
                explanation: `平角是 180°，所以 ∠1 = 180° - ${known}° = ${ans}°。`
            };
        } else if (qType === 5) {
            // 等腰三角形底角與頂角推算（中高階）
            const baseAngle = this.pick([50, 55, 65, 70, 75]);
            const topAngle = 180 - baseAngle * 2;
            return {
                unitName: '等腰三角形的角度推算',
                hasParens: false,
                prompt: `等腰三角形的兩個底角相等！已知頂角是 ${topAngle}°，且三角形內角和是 180°，請問一個「底角」是幾度？`,
                displayHtml: `(180° - ${topAngle}°) ÷ 2 = ?°`,
                hintDisplayHtml: `<span class="priority-highlight">${180 - topAngle}° ÷ 2</span> = ?°`,
                svgDiagram: this.renderTriangleSVG('isosceles'),
                answer: baseAngle,
                inputMode: 'choice',
                options: this.makeOptions(baseAngle, 10, 3, 25, '°'),
                explanation: `兩個底角和 = 180° - ${topAngle}° = ${180 - topAngle}°，因為兩底角相等，除以 2 得到 ${baseAngle}°！`
            };
        } else {
            // 長方形面積與周長進階
            const w = this.randInt(8, 15 + stageId);
            const h = this.randInt(5, 10 + stageId);
            const ans = w * h;
            return {
                unitName: '長方形與正方形的面積',
                hasParens: false,
                prompt: `下圖長方形魔法陣的長是 ${w} 公尺、寬是 ${h} 公尺，請問它的「面積」是多少平方公尺？（長 × 寬）`,
                displayHtml: `面積 = ${w} × ${h} = ? m²`,
                hintDisplayHtml: `<span class="priority-highlight">${w} × ${h}</span> = ? m²`,
                svgDiagram: this.renderRectPerimeterSVG(w, h, false),
                answer: ans,
                inputMode: 'choice',
                options: this.makeOptions(ans, 12, 3, 20, ' m²'),
                explanation: `長方形面積 = 長 × 寬 = ${w} × ${h} = ${ans} 平方公尺！`
            };
        }
    }

    // ==========================================
    // 🎒 小學五年級題庫（隨關卡 1~6 遞增難度與題型）
    // ==========================================
    static generateGrade5(category, enemy = null, stageId = 1, forceParens = false) {
        const tier = this.getStageTier(stageId);

        if (category === 'attack') {
            const pool = tier === 1 ? [1, 2, 3] : [1, 2, 3, 4, 5];
            const type = this.pick(pool);

            if (type === 1) {
                const targetSum = this.pick([30, 50, 100]);
                const c = this.randInt(6, 12 + stageId * 2);
                const a = this.randInt(Math.floor(targetSum * 0.3), Math.floor(targetSum * 0.7));
                const b = targetSum - a;
                const ans = targetSum * c;
                return {
                    unitName: '乘法對加法的分配律巧算',
                    hasParens: true,
                    prompt: '運用分配律把共同乘數提出來，快速算出答案：',
                    displayHtml: `${a} × ${c} + ${b} × ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a} + ${b})</span> × ${c} = ${targetSum} × ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 30, 3, 30),
                    explanation: `利用分配律：${a}×${c} + ${b}×${c} = (${a}+${b}) × ${c} = ${targetSum} × ${c} = ${ans}！`
                };
            } else if (type === 2) {
                // 乘法對減法的分配律
                const diff = this.pick([10, 20, 30]);
                const b = this.randInt(12, 35);
                const a = b + diff;
                const c = this.randInt(7, 15 + stageId);
                const ans = diff * c;
                return {
                    unitName: '乘法對減法的分配律',
                    hasParens: true,
                    prompt: '運用分配律先算括號內的差，再乘以共同乘數：',
                    displayHtml: `${a} × ${c} - ${b} × ${c} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a} - ${b})</span> × ${c} = ${diff} × ${c} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 20, 3, 20),
                    explanation: `利用分配律：(${a} - ${b}) × ${c} = ${diff} × ${c} = ${ans}！`
                };
            } else if (type === 3) {
                // 25×4=100 或 125×8=1000 結合律巧算
                const use125 = tier >= 2 && Math.random() < 0.5;
                const m = this.randInt(3, 9 + stageId);
                const ans = use125 ? m * 1000 : m * 100;
                return {
                    unitName: '連乘交換律與結合律巧算',
                    hasParens: true,
                    prompt: '先將能湊成 100 或 1000 的兩個數相乘，快速算出答案：',
                    displayHtml: use125 ? `125 × ${m} × 8 = ?` : `25 × ${m} × 4 = ?`,
                    hintDisplayHtml: use125
                        ? `<span class="priority-highlight">(125 × 8 = 1000)</span> × ${m} = ?`
                        : `<span class="priority-highlight">(25 × 4 = 100)</span> × ${m} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 100, 3, 100),
                    explanation: use125
                        ? `先算 125 × 8 = 1000，再乘以 ${m} = ${ans}！`
                        : `先算 25 × 4 = 100，再乘以 ${m} = ${ans}！`
                };
            } else if (type === 4) {
                // 等差數列高斯配對求和（高階）
                const n = this.pick([6, 8, 10]);
                const ans = (1 + n) * (n / 2);
                return {
                    unitName: '規律與高斯配對求和',
                    hasParens: true,
                    prompt: `請利用頭尾配對巧算，算出從 1 連續加到 ${n} 的總和：`,
                    displayHtml: `1 + 2 + 3 + ⋯ + ${n} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">(1 + ${n}) × ${n / 2} 組</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 5, 3, 10),
                    explanation: `(首項 1 + 末項 ${n}) × ${n} ÷ 2 = ${1 + n} × ${n / 2} = ${ans}！`
                };
            } else {
                // 小數乘以整數
                const unit = this.pick([1.5, 2.5, 1.2, 3.5, 4.5]);
                const count = this.pick([4, 6, 8, 10, 12]);
                const ans = unit * count;
                return {
                    unitName: '小數乘以整數',
                    hasParens: false,
                    prompt: `每瓶星光魔藥容量是 ${unit} 公升，${count} 瓶總共是多少公升？`,
                    displayHtml: `${unit} × ${count} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${unit} × ${count}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 3, 3, 2),
                    explanation: `${unit} × ${count} = ${ans} 公升！`
                };
            }
        } else if (category === 'break') {
            const pool = [1, 2, 3, 4];
            const type = this.pick(pool);
            if (type === 1) {
                const pairs = [
                    { a: 12, b: 18, gcd: 6, lcm: 36 },
                    { a: 8, b: 12, gcd: 4, lcm: 24 },
                    { a: 15, b: 20, gcd: 5, lcm: 60 },
                    { a: 14, b: 21, gcd: 7, lcm: 42 },
                    { a: 9, b: 15, gcd: 3, lcm: 45 },
                    { a: 16, b: 24, gcd: 8, lcm: 48 },
                    { a: 18, b: 27, gcd: 9, lcm: 54 },
                    { a: 20, b: 30, gcd: 10, lcm: 60 }
                ];
                const p = this.pick(pairs);
                const askGcd = Math.random() < 0.5;
                const ans = askGcd ? p.gcd : p.lcm;
                return {
                    unitName: askGcd ? '最大公因數 (GCD)' : '最小公倍數 (LCM)',
                    hasParens: false,
                    prompt: `請找出 ${p.a} 和 ${p.b} 的「${askGcd ? '最大公因數' : '最小公倍數'}」：`,
                    displayHtml: `${p.a} 與 ${p.b} 的${askGcd ? '最大公因數' : '最小公倍數'} = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${p.a} = ${p.gcd}×${p.a / p.gcd}，${p.b} = ${p.gcd}×${p.b / p.gcd}</span>`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 4, 3, 2),
                    explanation: `${p.a} 和 ${p.b} 的最大公因數是 ${p.gcd}，最小公倍數是 ${p.lcm}！`
                };
            } else if (type === 2) {
                const a = this.randInt(3, 7 + Math.floor(stageId / 2));
                const x = this.randInt(4, 11 + stageId);
                const b = this.randInt(5, 22);
                const total = a * x + b;
                return {
                    unitName: '怎樣解題（未知數 x）',
                    hasParens: false,
                    prompt: '請利用逆運算求出算式中的未知數 x 是多少：',
                    displayHtml: `${a} × x + ${b} = ${total}，x = ?`,
                    hintDisplayHtml: `先算 <span class="priority-highlight">${total} - ${b} = ${a * x}</span>，再除以 ${a}`,
                    answer: x,
                    inputMode: 'number',
                    options: this.makeOptions(x, 3, 3, 1),
                    explanation: `先將 ${total} - ${b} = ${a * x}，再算 ${a * x} ÷ ${a} = ${x}，所以 x = ${x}！`
                };
            } else if (type === 3) {
                const pairs = [
                    { a: 2, b: 3, lcd: 6, num: 5 },
                    { a: 3, b: 4, lcd: 12, num: 7 },
                    { a: 2, b: 5, lcd: 10, num: 7 },
                    { a: 4, b: 5, lcd: 20, num: 9 },
                    { a: 3, b: 5, lcd: 15, num: 8 },
                    { a: 2, b: 7, lcd: 14, num: 9 }
                ];
                const p = this.pick(pairs);
                return {
                    unitName: '異分母分數通分相加',
                    hasParens: false,
                    prompt: `將 1/${p.a} + 1/${p.b} 通分成以 ${p.lcd} 為分母的分數後，請問答案的「分子」是多少？`,
                    displayHtml: `1/${p.a} + 1/${p.b} = [ ? ] / ${p.lcd}`,
                    hintDisplayHtml: `<span class="priority-highlight">${p.b}/${p.lcd} + ${p.a}/${p.lcd}</span> = ? / ${p.lcd}`,
                    answer: p.num,
                    inputMode: 'number',
                    options: this.makeOptions(p.num, 2, 3, 2),
                    explanation: `通分後變成 ${p.b}/${p.lcd} + ${p.a}/${p.lcd} = ${p.num}/${p.lcd}，所以分子是 ${p.num}！`
                };
            } else {
                // 含括號未知數求解 (x + a) × b = total
                const a = this.randInt(4, 12);
                const x = this.randInt(5, 14 + stageId);
                const b = this.randInt(3, 8);
                const total = (x + a) * b;
                return {
                    unitName: '括號未知數逆運算',
                    hasParens: true,
                    prompt: '請先除以括號外的乘數，再減去已知數求出 x：',
                    displayHtml: `(x + ${a}) × ${b} = ${total}，x = ?`,
                    hintDisplayHtml: `先算 <span class="priority-highlight">${total} ÷ ${b} = ${x + a}</span>，再減 ${a}`,
                    answer: x,
                    inputMode: 'number',
                    options: this.makeOptions(x, 3, 3, 1),
                    explanation: `先算 x + ${a} = ${total} ÷ ${b} = ${x + a}，再算 x = ${x + a} - ${a} = ${x}！`
                };
            }
        } else {
            // 小五幾何：1.三角形/平行四邊形面積、2.梯形面積(新增SVG!)、3.三角形與多邊形內角和、4.扇形圓心角
            if (enemy && enemy.breathAngle) {
                const breath = enemy.breathAngle;
                const supp = 180 - breath;
                return {
                    unitName: '平角補角與廣角吐息格擋',
                    hasParens: false,
                    prompt: `🐉 水晶龍姬發動【${breath}° 廣角吐息】！請算出平角 180° 的補角來展開完美折射盾：`,
                    displayHtml: `180° - ${breath}° = ?°`,
                    hintDisplayHtml: `<span class="priority-highlight">180° - ${breath}°</span> = ?°`,
                    svgDiagram: this.renderSupplementaryAngleSVG(breath),
                    answer: supp,
                    inputMode: 'choice',
                    options: this.makeOptions(supp, 15, 3, 10, '°'),
                    explanation: `180° - ${breath}° = ${supp}°！`
                };
            }

            const pool = tier === 1 ? [1, 2, 3] : [1, 2, 3, 4];
            const type = this.pick(pool);
            if (type === 1) {
                const base = this.pick([8, 10, 12, 14, 16, 18]);
                const height = this.randInt(5 + Math.floor(stageId / 2), 12 + stageId);
                const isTri = Math.random() < 0.6;
                const ans = isTri ? (base * height) / 2 : base * height;
                return {
                    unitName: isTri ? '三角形面積計算' : '平行四邊形面積計算',
                    hasParens: false,
                    prompt: isTri
                        ? `下圖三角形的底是 ${base} cm、高是 ${height} cm，請問面積是多少平方公分？（底 × 高 ÷ 2）`
                        : `下圖平行四邊形的底是 ${base} cm、高是 ${height} cm，請問面積是多少平方公分？（底 × 高）`,
                    displayHtml: isTri ? `${base} × ${height} ÷ 2 = ? cm²` : `${base} × ${height} = ? cm²`,
                    hintDisplayHtml: `<span class="priority-highlight">${isTri ? `${base} × ${height} ÷ 2` : `${base} × ${height}`}</span> = ?`,
                    svgDiagram: this.renderAreaDiagramSVG(base, height, isTri),
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 10, 3, 10, ' cm²'),
                    explanation: isTri
                        ? `三角形面積 = 底 × 高 ÷ 2 = ${base} × ${height} ÷ 2 = ${ans} cm²！`
                        : `平行四邊形面積 = 底 × 高 = ${base} × ${height} = ${ans} cm²！`
                };
            } else if (type === 2) {
                // 梯形面積 (上底 + 下底) × 高 ÷ 2
                const topB = this.randInt(4, 10);
                const botB = topB + this.pick([4, 6, 8, 10]);
                const h = this.pick([4, 6, 8, 10]);
                const ans = ((topB + botB) * h) / 2;
                return {
                    unitName: '梯形面積計算',
                    hasParens: true,
                    prompt: `下圖梯形的上底是 ${topB} cm、下底是 ${botB} cm、高是 ${h} cm，請問梯形面積是多少平方公分？`,
                    displayHtml: `(${topB} + ${botB}) × ${h} ÷ 2 = ? cm²`,
                    hintDisplayHtml: `<span class="priority-highlight">(${topB + botB}) × ${h} ÷ 2</span> = ? cm²`,
                    svgDiagram: this.renderTrapezoidSVG(topB, botB, h),
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 12, 3, 12, ' cm²'),
                    explanation: `梯形面積 = (上底 + 下底) × 高 ÷ 2 = (${topB} + ${botB}) × ${h} ÷ 2 = ${ans} cm²！`
                };
            } else if (type === 3) {
                const a1 = this.randInt(45, 75);
                const a2 = this.randInt(40, 65);
                const ans = 180 - a1 - a2;
                return {
                    unitName: '三角形內角和（180°）',
                    hasParens: false,
                    prompt: `任意三角形的內角和都是 180°！已知其中兩個角是 ${a1}° 和 ${a2}°，請問第三個角 ∠C 是幾度？`,
                    displayHtml: `180° - ${a1}° - ${a2}° = ?°`,
                    hintDisplayHtml: `<span class="priority-highlight">180° - (${a1}° + ${a2}°)</span> = ?°`,
                    svgDiagram: this.renderTriangleSVG('obtuse'),
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 10, 3, 20, '°'),
                    explanation: `三角形三個內角合起來一定是 180°，180° - ${a1}° - ${a2}° = ${ans}°！`
                };
            } else {
                // 幾分之幾圓的扇形圓心角
                const items = [
                    { frac: '1/4', deg: 90 },
                    { frac: '1/6', deg: 60 },
                    { frac: '1/8', deg: 45 },
                    { frac: '1/3', deg: 120 },
                    { frac: '3/8', deg: 135 },
                    { frac: '2/3', deg: 240 }
                ];
                const it = this.pick(items);
                return {
                    unitName: '扇形與圓心角（周角360°）',
                    hasParens: false,
                    prompt: `一個完整的圓周角是 360°，請問「${it.frac} 圓」的扇形，它的圓心角是幾度？`,
                    displayHtml: `360° × ${it.frac} = ?°`,
                    hintDisplayHtml: `<span class="priority-highlight">360° × ${it.frac}</span> = ?°`,
                    svgDiagram: this.renderSimpleAngleSVG(Math.min(160, it.deg), false),
                    answer: it.deg,
                    inputMode: 'choice',
                    options: this.makeOptions(it.deg, 15, 3, 30, '°'),
                    explanation: `周角是 360°，所以 ${it.frac} 圓的圓心角 = 360° × ${it.frac} = ${it.deg}°！`
                };
            }
        }
    }

    // ==========================================
    // 🎒 小學六年級題庫（隨關卡 1~6 遞增難度與題型）
    // ==========================================
    static generateGrade6(category, enemy = null, stageId = 1, forceParens = false) {
        const tier = this.getStageTier(stageId);

        if (category === 'attack') {
            const pool = tier === 1 ? [1, 2] : [1, 2, 3, 4];
            const type = this.pick(pool);

            if (type === 1) {
                const a = this.randInt(2, 7);
                const b = this.randInt(3, 9);
                const mult = this.randInt(3, 6 + stageId);
                const c = a * mult;
                const ans = b * mult;
                return {
                    unitName: '相等的比與比例式',
                    hasParens: true,
                    prompt: '請利用相等的比（前後項同乘一數），算出 ？ 的數值：',
                    displayHtml: `${a} : ${b} = ${c} : [ ? ]`,
                    hintDisplayHtml: `前項放大了 <span class="priority-highlight">${c} ÷ ${a} = ${mult} 倍</span>，後項 ${b} × ${mult} = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 5, 3, 6),
                    explanation: `前項從 ${a} 變成 ${c} 放大了 ${mult} 倍，所以後項也要乘以 ${mult}：${b} × ${mult} = ${ans}！`
                };
            } else if (type === 2) {
                // 按比例分配
                const r1 = this.randInt(2, 5);
                const r2 = this.randInt(3, 7);
                const unitVal = this.randInt(10, 20 + stageId * 5);
                const total = (r1 + r2) * unitVal;
                const ans = r1 * unitVal;
                return {
                    unitName: '按比例分配問題',
                    hasParens: true,
                    prompt: `將 ${total} 毫升的星辰魔藥依「${r1} : ${r2}」分成紅、藍兩瓶，請問第一瓶（佔 ${r1} 份）有多少毫升？`,
                    displayHtml: `${total} ÷ (${r1} + ${r2}) × ${r1} = ?`,
                    hintDisplayHtml: `每份 = <span class="priority-highlight">${total} ÷ ${r1 + r2} = ${unitVal}</span>，再乘以 ${r1} 份`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 20, 3, 20),
                    explanation: `總共分成 ${r1}+${r2}=${r1 + r2} 份，每份是 ${total}÷${r1 + r2}=${unitVal} 毫升，第一瓶有 ${unitVal}×${r1}=${ans} 毫升！`
                };
            } else if (type === 3) {
                // 基準量與比較量（母子和）
                const base = this.pick([40, 50, 60, 80, 100]);
                const ratio = this.pick([1.5, 2, 2.5, 3]);
                const ans = base * (1 + ratio);
                return {
                    unitName: '基準量與比較量（母子和）',
                    hasParens: true,
                    prompt: `小魔女的基礎魔力是 ${base} 點，精靈女王的魔力是小魔女的 ${ratio} 倍，請問兩人的魔力「合起來」共幾點？`,
                    displayHtml: `${base} × (1 + ${ratio}) = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${base} + ${base * ratio}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 20, 3, 40),
                    explanation: `兩人合起來是基準量的 (1 + ${ratio}) 倍：${base} × ${1 + ratio} = ${ans} 點！`
                };
            } else {
                // 等量公理與一元一次方程式進階
                const x = this.randInt(4, 12 + stageId);
                const a = this.randInt(5, 9);
                const c = this.randInt(2, a - 2);
                const diff = (a - c) * x;
                const b = this.randInt(6, 20);
                const d = diff + b;
                return {
                    unitName: '等量公理與未知數求解',
                    hasParens: true,
                    prompt: '請利用等量公理移項，求出方程式中的 x 是多少：',
                    displayHtml: `${a}x - ${b} = ${c}x + ${d - b * 0} (提示：${a - c}x = ${diff})`,
                    hintDisplayHtml: `<span class="priority-highlight">(${a} - ${c})x = ${diff}</span> ➔ x = ${diff} ÷ ${a - c}`,
                    answer: x,
                    inputMode: 'number',
                    options: this.makeOptions(x, 3, 3, 1),
                    explanation: `兩邊同減 ${c}x 並整理得 ${a - c}x = ${diff}，所以 x = ${diff} ÷ ${a - c} = ${x}！`
                };
            }
        } else if (category === 'break') {
            const pool = tier === 1 ? [1, 2, 3] : [1, 2, 3, 4];
            const type = this.pick(pool);
            if (type === 1) {
                const speed = this.pick([45, 50, 60, 75, 80, 90, 110]);
                const time = this.randInt(2, 5 + Math.floor(stageId / 2));
                const dist = speed * time;
                return {
                    unitName: '速率、時間與距離',
                    hasParens: false,
                    prompt: `魔導列車以時速 ${speed} 公里行駛了 ${time} 小時，請問總共行駛了幾公里？（距離 = 速率 × 時間）`,
                    displayHtml: `${speed} km/h × ${time} h = ? km`,
                    hintDisplayHtml: `<span class="priority-highlight">${speed} × ${time}</span> = ? km`,
                    answer: dist,
                    inputMode: 'number',
                    options: this.makeOptions(dist, 40, 3, 50),
                    explanation: `距離 = 速率 × 時間 = ${speed} × ${time} = ${dist} 公里！`
                };
            } else if (type === 2) {
                const price = this.pick([200, 300, 400, 500, 600, 800, 1200]);
                const discount = this.pick([6, 7, 8, 9]);
                const ans = (price * discount) / 10;
                return {
                    unitName: '百分率與折扣應用',
                    hasParens: false,
                    prompt: `魔導法袍定價 ${price} 金幣，商店週年慶打「${discount} 折」（即 ${discount * 10}%），請問打折後售價是多少金幣？`,
                    displayHtml: `${price} × ${discount * 10}% = ?`,
                    hintDisplayHtml: `<span class="priority-highlight">${price} × 0.${discount}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 30, 3, 50),
                    explanation: `打 ${discount} 折就是原價乘以 ${discount * 10}%（0.${discount}），${price} × 0.${discount} = ${ans} 金幣！`
                };
            } else if (type === 3) {
                // 分數除法（除以單位分數）
                const whole = this.randInt(4, 12 + stageId);
                const denom = this.pick([2, 3, 4, 5, 6]);
                const ans = whole * denom;
                return {
                    unitName: '分數除法（乘以倒數）',
                    hasParens: false,
                    prompt: `有 ${whole} 公升的精靈泉水，每 1/${denom} 公升裝成一瓶，請問總共可以裝滿幾瓶？`,
                    displayHtml: `${whole} ÷ (1/${denom}) = ?`,
                    hintDisplayHtml: `除以 1/${denom} 等於 <span class="priority-highlight">${whole} × ${denom}</span> = ?`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 5, 3, 4),
                    explanation: `除以分數等於乘以它的倒數：${whole} ÷ 1/${denom} = ${whole} × ${denom} = ${ans} 瓶！`
                };
            } else {
                // 相向而行相遇問題（高階）
                const v1 = this.randInt(40, 65);
                const v2 = this.randInt(35, 60);
                const hours = this.randInt(2, 4);
                const ans = (v1 + v2) * hours;
                return {
                    unitName: '速率進階：相向而行問題',
                    hasParens: true,
                    prompt: `兩位飛行精靈分別以時速 ${v1} 公里與 ${v2} 公里同時同地反方向飛出，請問 ${hours} 小時後兩人相距幾公里？`,
                    displayHtml: `(${v1} + ${v2}) × ${hours} = ? km`,
                    hintDisplayHtml: `每小時共拉開 <span class="priority-highlight">${v1} + ${v2} = ${v1 + v2} km</span>，再乘以 ${hours} 小時`,
                    answer: ans,
                    inputMode: 'number',
                    options: this.makeOptions(ans, 30, 3, 50),
                    explanation: `(時速 ${v1} + 時速 ${v2}) × ${hours} 小時 = ${v1 + v2} × ${hours} = ${ans} 公里！`
                };
            }
        } else {
            // 小六幾何：1.圓周長與圓面積、2.角柱與圓柱體積、3.放大圖面積倍率(高階)、4.扇形面積
            if (enemy && enemy.breathAngle) {
                const breath = enemy.breathAngle;
                const supp = 180 - breath;
                return {
                    unitName: '平角補角與廣角吐息格擋',
                    hasParens: false,
                    prompt: `🐉 水晶龍姬發動【${breath}° 廣角吐息】！請算出平角 180° 的補角展開完美格擋：`,
                    displayHtml: `180° - ${breath}° = ?°`,
                    hintDisplayHtml: `<span class="priority-highlight">180° - ${breath}°</span> = ?°`,
                    svgDiagram: this.renderSupplementaryAngleSVG(breath),
                    answer: supp,
                    inputMode: 'choice',
                    options: this.makeOptions(supp, 15, 3, 10, '°'),
                    explanation: `180° - ${breath}° = ${supp}°！`
                };
            }

            const pool = tier === 1 ? [1, 2] : [1, 2, 3];
            const type = this.pick(pool);
            if (type === 1) {
                const r = this.pick([5, 10, 20]);
                const isArea = Math.random() < 0.5;
                const ans = isArea ? Number((r * r * 3.14).toFixed(2)) : Number((r * 2 * 3.14).toFixed(2));
                return {
                    unitName: isArea ? '圓面積計算 (π=3.14)' : '圓周長計算 (π=3.14)',
                    hasParens: false,
                    prompt: isArea
                        ? `下圖魔法圓陣的半徑是 ${r} 公分（圓周率以 3.14 計算），請問「圓面積」是多少平方公分？（半徑 × 半徑 × 3.14）`
                        : `下圖魔法圓陣的半徑是 ${r} 公分、直徑 ${r * 2} 公分（圓周率以 3.14 計算），請問「圓周長」是多少公分？（直徑 × 3.14）`,
                    displayHtml: isArea ? `${r} × ${r} × 3.14 = ? cm²` : `${r * 2} × 3.14 = ? cm`,
                    hintDisplayHtml: `<span class="priority-highlight">${isArea ? `${r * r} × 3.14` : `${r * 2} × 3.14`}</span> = ?`,
                    svgDiagram: this.renderCircleRadiusSVG(r),
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 20, 3, 10, isArea ? ' cm²' : ' cm'),
                    explanation: isArea
                        ? `圓面積 = 半徑 × 半徑 × 3.14 = ${r} × ${r} × 3.14 = ${ans} 平方公分！`
                        : `圓周長 = 直徑 × 3.14 = ${r * 2} × 3.14 = ${ans} 公分！`
                };
            } else if (type === 2) {
                const baseArea = this.pick([15, 20, 25, 30, 40, 50]);
                const h = this.randInt(4, 10 + stageId);
                const ans = baseArea * h;
                return {
                    unitName: '角柱與圓柱的體積',
                    hasParens: false,
                    prompt: `魔導水晶柱的「底面積」是 ${baseArea} 平方公分、「柱高」是 ${h} 公分，請問柱體體積是多少立方公分？（底面積 × 高）`,
                    displayHtml: `${baseArea} × ${h} = ? cm³`,
                    hintDisplayHtml: `<span class="priority-highlight">底面積 ${baseArea} × 高 ${h}</span> = ?`,
                    svgDiagram: this.renderCircleRadiusSVG(baseArea),
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 25, 3, 30, ' cm³'),
                    explanation: `柱體體積 = 底面積 × 柱高 = ${baseArea} × ${h} = ${ans} 立方公分！`
                };
            } else {
                // 放大圖與縮圖的面積比（邊長 k 倍 -> 面積 k² 倍）
                const k = this.pick([2, 3, 4, 5]);
                const origArea = this.randInt(4, 12);
                const ans = origArea * k * k;
                return {
                    unitName: '放大圖與面積平方倍關係',
                    hasParens: false,
                    prompt: `一個面積為 ${origArea} cm² 的魔法陣，將它的邊長放大為原來的「${k} 倍」後，放大圖的面積會變成幾平方公分？（提示：面積會變成 ${k}×${k}=${k * k} 倍）`,
                    displayHtml: `${origArea} × (${k} × ${k}) = ? cm²`,
                    hintDisplayHtml: `<span class="priority-highlight">${origArea} × ${k * k}</span> = ? cm²`,
                    svgDiagram: this.renderBasicShapeSVG('square'),
                    answer: ans,
                    inputMode: 'choice',
                    options: this.makeOptions(ans, 12, 3, 8, ' cm²'),
                    explanation: `邊長放大 ${k} 倍，面積會放大 ${k} × ${k} = ${k * k} 倍，所以新面積 = ${origArea} × ${k * k} = ${ans} cm²！`
                };
            }
        }
    }

    // ==========================================
    // 🧘‍♀️ 冥想修煉室：支援小一～小六（小一全注音！）
    // ==========================================
    static generateMeditationAngleQuestion(grade = 4) {
        if (grade === 1) {
            const shapes = [
                { id: 'ㄩㄢˊ ㄒㄧㄥˊ', svg: this.renderBasicShapeSVG('circle') },
                { id: 'ㄙㄢ ㄐㄧㄠˇ ㄒㄧㄥˊ', svg: this.renderBasicShapeSVG('triangle') },
                { id: 'ㄓㄥˋ ㄈㄤ ㄒㄧㄥˊ', svg: this.renderBasicShapeSVG('square') }
            ];
            const chosen = this.pick(shapes);
            return {
                svg: chosen.svg,
                title: 'ㄓㄜˋ ㄕˋ ㄕㄜˊ ㄇㄜ˙ ㄒㄧㄥˊ ㄓㄨㄤˋ？',
                answer: chosen.id,
                options: ['ㄩㄢˊ ㄒㄧㄥˊ', 'ㄙㄢ ㄐㄧㄠˇ ㄒㄧㄥˊ', 'ㄓㄥˋ ㄈㄤ ㄒㄧㄥˊ']
            };
        }
        const type = this.pick(['銳角', '直角', '鈍角']);
        let deg = 90;
        if (type === '銳角') deg = this.randInt(25, 75);
        if (type === '鈍角') deg = this.randInt(105, 160);
        return {
            svg: this.renderSimpleAngleSVG(deg, true),
            title: `張開 ${deg}° 的角是？`,
            answer: type,
            options: ['銳角', '直角', '鈍角']
        };
    }

    static generateMeditationOrderQuestion(grade = 4) {
        if (grade === 1) {
            const a = this.randInt(2, 9);
            const b = 10 - a;
            const wr1 = b === 5 ? 3 : 5;
            const wr2 = b === 2 ? 4 : 2;
            return {
                expr: `${a} + [ ? ] = 10`,
                answer: `${b}`,
                options: this.shuffle([`${b}`, `${wr1}`, `${wr2}`]),
                rule: 'ㄏㄜˊ ㄕˊ ㄇㄛˊ ㄈㄚˇ（湊成 10）',
                isBopomofo: true
            };
        }
        if (grade === 2 || grade === 3) {
            const a = this.randInt(2, 9), b = this.randInt(2, 9), ans = a * b;
            const opts = this.makeOptions(ans, a, 3, 4).map(o => `${o.value}`);
            return {
                expr: `${a} × ${b} = ?`,
                answer: `${ans}`,
                options: opts,
                rule: '九九乘法閃電快答',
                isDirectValue: true
            };
        }
        const a = this.randInt(10, 30), b = this.randInt(3, 9), c = this.randInt(3, 8);
        if (Math.random() < 0.5) {
            return {
                expr: `${a} + ${b} × ${c}`,
                answer: `${b} × ${c}`,
                options: this.shuffle([`${b} × ${c}`, `${a} + ${b}`, `${a} × ${c}`]),
                rule: '先乘除後加減'
            };
        } else {
            return {
                expr: `(${a} - ${b}) × ${c}`,
                answer: `${a} - ${b}`,
                options: this.shuffle([`${a} - ${b}`, `${b} × ${c}`, `${a} × ${c}`]),
                rule: '有括號先算括號內'
            };
        }
    }

    // ==========================================
    // 🎨 動態 SVG 圖形渲染器
    // ==========================================
    static renderBasicShapeSVG(shape) {
        if (shape === 'circle') {
            return `<svg viewBox="0 0 260 130" class="math-svg">
                <circle cx="130" cy="65" r="46" fill="rgba(244,63,94,0.28)" stroke="#f43f5e" stroke-width="4"/>
            </svg>`;
        } else if (shape === 'triangle') {
            return `<svg viewBox="0 0 260 130" class="math-svg">
                <polygon points="130,15 75,112 185,112" fill="rgba(250,204,21,0.28)" stroke="#facc15" stroke-width="4" stroke-linejoin="round"/>
            </svg>`;
        } else if (shape === 'square') {
            return `<svg viewBox="0 0 260 130" class="math-svg">
                <rect x="84" y="19" width="92" height="92" fill="rgba(56,189,248,0.28)" stroke="#38bdf8" stroke-width="4"/>
            </svg>`;
        } else {
            return `<svg viewBox="0 0 260 130" class="math-svg">
                <rect x="55" y="30" width="150" height="70" fill="rgba(16,185,129,0.28)" stroke="#10b981" stroke-width="4"/>
            </svg>`;
        }
    }

    static renderClockSVG(hour, minute = 0) {
        const cx = 130, cy = 68, r = 54;
        const hAngle = ((hour % 12) * 30 + minute * 0.5 - 90) * (Math.PI / 180);
        const mAngle = (minute * 6 - 90) * (Math.PI / 180);
        const hx = cx + 28 * Math.cos(hAngle);
        const hy = cy + 28 * Math.sin(hAngle);
        const mx = cx + 42 * Math.cos(mAngle);
        const my = cy + 42 * Math.sin(mAngle);

        let nums = '';
        for (let n = 1; n <= 12; n++) {
            const ang = (n * 30 - 90) * (Math.PI / 180);
            const nx = cx + (r - 12) * Math.cos(ang);
            const ny = cy + (r - 12) * Math.sin(ang) + 4;
            nums += `<text x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" fill="#e2e8f0" font-size="10" font-weight="bold" text-anchor="middle">${n}</text>`;
        }
        return `<svg viewBox="0 0 260 136" class="math-svg">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0f172a" stroke="#38bdf8" stroke-width="3.5"/>
            ${nums}
            <line x1="${cx}" y1="${cy}" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
            <line x1="${cx}" y1="${cy}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#f43f5e" stroke-width="4.5" stroke-linecap="round"/>
            <circle cx="${cx}" cy="${cy}" r="4" fill="#fde047"/>
        </svg>`;
    }

    static renderRectPerimeterSVG(w, h, isSquare) {
        const rw = isSquare ? 88 : 136;
        const rh = isSquare ? 88 : 74;
        const x = (260 - rw) / 2;
        const y = (135 - rh) / 2;
        return `<svg viewBox="0 0 260 135" class="math-svg">
            <rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="3.5"/>
            <text x="130" y="${y - 6}" fill="#fde047" font-size="13" font-weight="bold" text-anchor="middle">${w} cm</text>
            <text x="${x + rw + 28}" y="72" fill="#fde047" font-size="13" font-weight="bold" text-anchor="middle">${h} cm</text>
        </svg>`;
    }

    static renderAreaDiagramSVG(base, height, isTri) {
        if (isTri) {
            return `<svg viewBox="0 0 280 140" class="math-svg">
                <polygon points="135,20 65,115 215,115" fill="rgba(16,185,129,0.22)" stroke="#10b981" stroke-width="3.5"/>
                <line x1="135" y1="20" x2="135" y2="115" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4 3"/>
                <text x="140" y="132" fill="#fde047" font-size="13" font-weight="bold" text-anchor="middle">底 = ${base} cm</text>
                <text x="165" y="75" fill="#fde047" font-size="13" font-weight="bold">高 = ${height} cm</text>
            </svg>`;
        } else {
            return `<svg viewBox="0 0 280 140" class="math-svg">
                <polygon points="85,25 220,25 195,115 60,115" fill="rgba(168,85,247,0.22)" stroke="#c084fc" stroke-width="3.5"/>
                <line x1="85" y1="25" x2="85" y2="115" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4 3"/>
                <text x="135" y="132" fill="#fde047" font-size="13" font-weight="bold" text-anchor="middle">底 = ${base} cm</text>
                <text x="122" y="75" fill="#fde047" font-size="13" font-weight="bold">高 = ${height} cm</text>
            </svg>`;
        }
    }

    static renderTrapezoidSVG(topB, botB, height) {
        return `<svg viewBox="0 0 280 145" class="math-svg">
            <polygon points="95,30 185,30 220,115 60,115" fill="rgba(244,114,182,0.22)" stroke="#f472b6" stroke-width="3.5"/>
            <line x1="95" y1="30" x2="95" y2="115" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4 3"/>
            <text x="140" y="22" fill="#fde047" font-size="12" font-weight="bold" text-anchor="middle">上底 = ${topB} cm</text>
            <text x="140" y="134" fill="#fde047" font-size="12" font-weight="bold" text-anchor="middle">下底 = ${botB} cm</text>
            <text x="132" y="78" fill="#fde047" font-size="12" font-weight="bold">高 = ${height} cm</text>
        </svg>`;
    }

    static renderCircleRadiusSVG(rVal) {
        return `<svg viewBox="0 0 260 135" class="math-svg">
            <circle cx="130" cy="68" r="48" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="3.5"/>
            <line x1="130" y1="68" x2="178" y2="68" stroke="#f43f5e" stroke-width="3"/>
            <circle cx="130" cy="68" r="4" fill="#fde047"/>
            <text x="154" y="60" fill="#fde047" font-size="12" font-weight="bold" text-anchor="middle">r=${rVal}</text>
        </svg>`;
    }

    static renderProtractorSVG(deg) {
        const cx = 150, cy = 130, r = 105;
        const rad = (deg * Math.PI) / 180;
        const x2 = cx + r * Math.cos(rad);
        const y2 = cy - r * Math.sin(rad);

        let ticks = '';
        for (let d = 0; d <= 180; d += 10) {
            const tr = (d * Math.PI) / 180;
            const innerR = d % 30 === 0 ? r - 14 : r - 7;
            const tx1 = cx + innerR * Math.cos(tr);
            const ty1 = cy - innerR * Math.sin(tr);
            const tx2 = cx + r * Math.cos(tr);
            const ty2 = cy - r * Math.sin(tr);
            ticks += `<line x1="${tx1.toFixed(1)}" y1="${ty1.toFixed(1)}" x2="${tx2.toFixed(1)}" y2="${ty2.toFixed(1)}" stroke="#94a3b8" stroke-width="${d % 30 === 0 ? 2 : 1}"/>`;

            if (d % 30 === 0) {
                const lr = r - 25;
                const lx = cx + lr * Math.cos(tr);
                const ly = cy - lr * Math.sin(tr);
                ticks += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" fill="#e2e8f0" font-size="11" font-weight="bold" text-anchor="middle">${d}°</text>`;
            }
        }

        const arcR = 38;
        const ax = cx + arcR * Math.cos(rad);
        const ay = cy - arcR * Math.sin(rad);

        return `
        <svg viewBox="0 0 300 150" class="math-svg">
            <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="rgba(30, 41, 59, 0.85)" stroke="#60a5fa" stroke-width="2.5"/>
            ${ticks}
            <path d="M ${cx} ${cy} L ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 0 0 ${ax.toFixed(1)} ${ay.toFixed(1)} Z" fill="rgba(251, 191, 36, 0.35)" stroke="#fbbf24" stroke-width="2"/>
            <line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#f43f5e" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="${cx}" cy="${cy}" r="4.5" fill="#fbbf24"/>
            <text x="${cx + 22}" y="${cy - 12}" fill="#fde047" font-size="13" font-weight="bold">?°</text>
        </svg>`;
    }

    static renderSimpleAngleSVG(deg, showDegree = true) {
        const cx = 130, cy = 115, r = 85;
        const rad = (deg * Math.PI) / 180;
        const x2 = cx + r * Math.cos(rad);
        const y2 = cy - r * Math.sin(rad);
        const arcR = 32;
        const ax = cx + arcR * Math.cos(rad);
        const ay = cy - arcR * Math.sin(rad);

        const rightAngleMark = deg === 90
            ? `<polyline points="${cx + 22},${cy} ${cx + 22},${cy - 22} ${cx},${cy - 22}" fill="none" stroke="#fbbf24" stroke-width="2.5"/>`
            : `<path d="M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 0 0 ${ax.toFixed(1)} ${ay.toFixed(1)}" fill="none" stroke="#fbbf24" stroke-width="2.5"/>`;

        return `
        <svg viewBox="0 0 280 140" class="math-svg">
            ${rightAngleMark}
            <line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
            <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>
            <circle cx="${cx}" cy="${cy}" r="4.5" fill="#fbbf24"/>
            ${showDegree ? `<text x="${cx + 26}" y="${cy - 26}" fill="#fde047" font-size="16" font-weight="bold">${deg}°</text>` : ''}
        </svg>`;
    }

    static renderSupplementaryAngleSVG(knownDeg) {
        const cx = 150, cy = 120, r = 95;
        const rad = (knownDeg * Math.PI) / 180;
        const x2 = cx + r * Math.cos(rad);
        const y2 = cy - r * Math.sin(rad);
        const arc1 = 36;
        const ax1 = cx + arc1 * Math.cos(rad);
        const ay1 = cy - arc1 * Math.sin(rad);

        return `
        <svg viewBox="0 0 300 145" class="math-svg">
            <line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
            <path d="M ${cx + arc1} ${cy} A ${arc1} ${arc1} 0 0 0 ${ax1.toFixed(1)} ${ay1.toFixed(1)}" fill="rgba(244,63,94,0.25)" stroke="#f43f5e" stroke-width="2.5"/>
            <path d="M ${ax1.toFixed(1)} ${ay1.toFixed(1)} A ${arc1} ${arc1} 0 0 0 ${cx - arc1} ${cy}" fill="rgba(250,204,21,0.25)" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4 2"/>
            <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#f43f5e" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="${cx}" cy="${cy}" r="4.5" fill="#fff"/>
            <text x="${cx + 35}" y="${cy - 18}" fill="#fda4af" font-size="15" font-weight="bold">${knownDeg}°</text>
            <text x="${cx - 52}" y="${cy - 18}" fill="#fde047" font-size="15" font-weight="bold">∠1 = ?°</text>
            <text x="${cx}" y="${cy + 20}" fill="#94a3b8" font-size="12" text-anchor="middle">平角 = 180°</text>
        </svg>`;
    }

    static renderTriangleSVG(type) {
        if (type === 'right') {
            return `
            <svg viewBox="0 0 280 145" class="math-svg">
                <polygon points="85,25 85,120 210,120" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="3.5" stroke-linejoin="round"/>
                <polyline points="85,102 103,102 103,120" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
                <text x="108" y="112" fill="#fde047" font-size="13" font-weight="bold">90°</text>
            </svg>`;
        } else if (type === 'obtuse') {
            return `
            <svg viewBox="0 0 280 145" class="math-svg">
                <polygon points="45,30 115,120 235,120" fill="rgba(168,85,247,0.2)" stroke="#c084fc" stroke-width="3.5" stroke-linejoin="round"/>
                <text x="115" y="105" fill="#fde047" font-size="14" font-weight="bold">120°</text>
            </svg>`;
        } else if (type === 'isosceles') {
            return `
            <svg viewBox="0 0 280 145" class="math-svg">
                <polygon points="140,20 85,125 195,125" fill="rgba(244,114,182,0.2)" stroke="#f472b6" stroke-width="3.5" stroke-linejoin="round"/>
                <text x="90" y="75" fill="#fbcfe8" font-size="13" font-weight="bold">10 cm</text>
                <text x="162" y="75" fill="#fbcfe8" font-size="13" font-weight="bold">10 cm</text>
                <text x="140" y="140" fill="#94a3b8" font-size="12" text-anchor="middle">6 cm</text>
            </svg>`;
        } else {
            return `
            <svg viewBox="0 0 280 145" class="math-svg">
                <polygon points="140,22 82,122 198,122" fill="rgba(52,211,153,0.2)" stroke="#34d399" stroke-width="3.5" stroke-linejoin="round"/>
                <text x="85" y="72" fill="#a7f3d0" font-size="13" font-weight="bold">8 cm</text>
                <text x="165" y="72" fill="#a7f3d0" font-size="13" font-weight="bold">8 cm</text>
                <text x="140" y="138" fill="#a7f3d0" font-size="13" font-weight="bold" text-anchor="middle">8 cm</text>
                <text x="140" y="52" fill="#fde047" font-size="12" text-anchor="middle">60°</text>
            </svg>`;
        }
    }
}

window.MathEngine = MathEngine;
