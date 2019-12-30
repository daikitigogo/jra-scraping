import { Required, Format, ConditionRequired, DecoratorExecutor } from "#/share/decorators";

/**
 * スクレイピング結果詳細
 */
export class RaceDetailDto extends DecoratorExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, string]) => {
            // @ts-ignore
            this[k] = v;
        });
    }

    /** 着順 */
    @Required.decorator()
    @Format.decorator({ regexp: '除外|中止|取消', replace: '-1' })
    place: string;
    /** 枠番 */
    @Required.decorator()
    @Format.decorator({ regexp: '[^0-9]' })
    waku: string;
    /** 馬番 */
    @Required.decorator()
    num: string;
    /** 馬名 */
    @Required.decorator()
    horse: string;
    /** 馬齢 */
    @Required.decorator()
    age: string;
    /** 負担重量 */
    @Required.decorator()
    weight: string;
    /** 騎手 */
    @Required.decorator()
    @Format.decorator({ regexp: '▲|△|☆' })
    jockey: string;
    /** タイム */
    @ConditionRequired.decorator({ targetProp: 'place', condFunc: (value) => value != '-1' })
    time: string;
    /** 着差 */
    @Format.decorator({ regexp: '／', replace: '/' })
    margin: string;
    /** 推定上がり3F */
    @ConditionRequired.decorator({ targetProp: 'place', condFunc: (value) => value != '-1' })
    fTime: string;
    /** 馬体重 */
    @ConditionRequired.decorator({ targetProp: 'place', condFunc: (value) => value != '-1' })
    @Format.decorator(
        { regexp: '\\(.+\\)' },
        { regexp: '[^0-9]' })
    horseWeight: string;
    /** 調教師 */
    @Required.decorator()
    trainer: string;
    /** 単勝人気 */
    @ConditionRequired.decorator({ targetProp: 'place', condFunc: (value) => value != '-1' })
    pop: string;
};
