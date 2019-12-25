/**
 * エレメント配列から日付と開催場名、onclickリンクを取得する
 * @param elements Element[]
 */
export const takeRaceList = (elements: Element[]) => {
    /**
     * NULL対策<br>
     * brawser実行部分で落ちると原因特定が困難なので
     * @param node Element
     */
    const safetyRead = (node: Element) => {
        return node || {
            textContent: '',
            getAttribute: () => {
                return {alt: '', onclick: ''}
            },
            firstChild: {
                textContent: ''
            }
        };
    };
    // 開催日のエレメントリストから開催日付とonclick属性を抜き出す
    return elements.map(e => {
        // 開催日付の抜き出し
        const date = safetyRead(e.querySelector('h3.sub_header')).firstChild.textContent.trim();
        // onclick属性の抜き出し
        const onclicks = e.querySelectorAll('div.cell.kaisai > ul > li > a');
        // フォーマットを整える
        return Array.from(onclicks)
            .map(a => {
                return {
                    date: date.replace('月', '/').replace('日', '').toString(),
                    turfPlaceName: safetyRead(a).textContent.trim().toString(),
                    onclick: safetyRead(a).getAttribute('onclick').toString(),
                };
            });
    })
    // フラットな配列にして返す
    .reduce((accum, cur) => accum.concat(cur), []);
};

/**
 * エレメント配列からレース結果を抜き出す
 * @param elements Element[] #race_result${N}R
 */
export const scrapingAllRace = (elements: Element[]) => {
    /**
     * NULL対策<br>
     * brawser実行部分で落ちると原因特定が困難なので
     * @param node Element
     */
    const safetyRead = (node: Element) => {
        return node || {
            textContent: '',
            getAttribute: () => {
                return {alt: '', onclick: ''}
            },
            firstChild: {
                textContent: ''
            }
        };
    };
    /**
     * 指定したオッズ情報を抜き出す
     * @param node any
     * @param target string
     */
    const getOdds = (node: Element, target: string) => {
        const odds = node.querySelectorAll(`.refund_unit ${target} .line`);
        return Array.from(odds)
            .map((line) => {
                return {
                    num: safetyRead(line.querySelector('.num')).textContent.trim().toString(),
                    yen: safetyRead(line.querySelector('.yen')).textContent.trim().toString(),
                    pop: safetyRead(line.querySelector('.pop')).textContent.trim().toString(),
                };
            });
    };

    // 全レース分を抜き出して返却
    return elements.map(e => {
        return {
            // 基本情報の抜き出し
            raceNumber: safetyRead(e.querySelector('.race_number > img')).getAttribute('alt').toString(),
            raceName: safetyRead(e.querySelector('.race_name')).textContent.trim().toString(),
            raceGrade: safetyRead(e.querySelector('.race_name > span > img')).getAttribute('alt').toString(),
            weather: safetyRead(e.querySelector('.weather .txt')).textContent.trim().toString(),
            turfCondition: safetyRead(e.querySelector('.turf .txt')).textContent.trim().toString(),
            durtCondition: safetyRead(e.querySelector('.durt .txt')).textContent.trim().toString(),
            raceCategory: safetyRead(e.querySelector('.cell.category')).textContent.trim().toString(),
            raceClass: safetyRead(e.querySelector('.cell.class')).textContent.trim().toString(),
            raceRule: safetyRead(e.querySelector('.cell.rule')).textContent.trim().toString(),
            raceWeight: safetyRead(e.querySelector('.cell.weight')).textContent.trim().toString(),
            raceCourse: safetyRead(e.querySelector('.cell.course')).textContent.trim().toString(),
            // レース結果の抜き出し
            raceResult: Array.from(e.querySelector('table').querySelectorAll('tbody > tr'))
                .map(row => {
                    return {
                        place: safetyRead(row.querySelector('.place')).textContent.trim().toString(),
                        waku: safetyRead(row.querySelector('.waku > img')).getAttribute('alt').toString(),
                        num: safetyRead(row.querySelector('.num')).textContent.trim().toString(),
                        horse: safetyRead(row.querySelector('.horse')).textContent.trim().toString(),
                        age: safetyRead(row.querySelector('.age')).textContent.trim().toString(),
                        weight: safetyRead(row.querySelector('.weight')).textContent.trim().toString(),
                        jockey: safetyRead(row.querySelector('.jockey')).textContent.trim().toString(),
                        time: safetyRead(row.querySelector('.time')).textContent.trim().toString(),
                        margin: safetyRead(row.querySelector('.margin')).textContent.trim().toString(),
                        fTime: safetyRead(row.querySelector('.f_time')).textContent.trim().toString(),
                        horseWeight: safetyRead(row.querySelector('.h_weight')).textContent.trim().toString(),
                        trainer: safetyRead(row.querySelector('.trainer')).textContent.trim().toString(),
                        pop: safetyRead(row.querySelector('.pop')).textContent.trim().toString(),
                    };
                }),
            // オッズ情報の抜き出し
            odds: {
                win: getOdds(e, '.win'),
                place: getOdds(e, '.place'),
                wakuren: getOdds(e, '.wakuren'),
                wide: getOdds(e, '.wide'),
                umaren: getOdds(e, '.umaren'),
                umatan: getOdds(e, '.umatan'),
                trio: getOdds(e, '.trio'),
                tierce: getOdds(e, '.tierce'),
            },
        };
    });
};
