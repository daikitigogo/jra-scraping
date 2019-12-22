import { Required, Format, ConditionRequired, AnnotationExecutor } from './annotations';

/**
 * 対象レースデータ
 */
export class TargetDataDto extends AnnotationExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]) => {
            this[k] = v;
        });
    }

    /** 開催日 */
    @Required.annotation()
    date: string;
    /** 開催馬場 */
    @Required.annotation()
    turfPlaceName: string;
    /** 開催日・開催場馬へのonclickリンク */
    @Required.annotation()
    onclick: string;
    /** レースリスト */
    raceDataList: RaceDataDto[];
};

/**
 * スクレイピング結果ベース
 */
export class RaceDataDto extends AnnotationExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, any]) => {
            if (k === 'raceResult') {
                this[k] = Array.from(v).map(jsObj => new ResultDetailDto(jsObj));
            } else if (k === 'odds') {
                this[k] = new OddsInfoDto(v);
            } else {
                this[k] = v;
            }
        });
    }

    raceNumber: string;
    raceName: string;
    raceGrade: string;
    weather: string;
    turfCondition: string;
    durtCondition: string;
    raceCategory: string;
    raceClass: string;
    raceRule: string;
    raceCourse: string;
    raceResult: ResultDetailDto[];
    odds: OddsInfoDto;
};

/**
 * スクレイピング結果詳細
 */
export class ResultDetailDto extends AnnotationExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]) => {
            this[k] = v;
        });
    }

    /** 着順 */
    @Required.annotation()
    @Format.annotation('除外|中止|取消', '-1')
    place: string;
    /** 枠番 */
    @Required.annotation()
    @Format.annotation('[^0-9]')
    waku: string;
    /** 馬番 */
    @Required.annotation()
    num: string;
    /** 馬名 */
    @Required.annotation()
    horse: string;
    /** 馬齢 */
    @Required.annotation()
    age: string;
    /** 負担重量 */
    @Required.annotation()
    weight: string;
    /** 騎手 */
    @Required.annotation()
    jockey: string;
    /** タイム */
    @ConditionRequired.annotation('place', '-1', false)
    time: string;
    /** 着差 */
    @Format.annotation('／', '/')
    margin: string;
    /** 馬体重 */
    @ConditionRequired.annotation('place', '-1', false)
    @Format.annotation('\\(.+\\)')
    horseWeight: string;
    /** 調教師 */
    @Required.annotation()
    trainer: string;
    /** 単勝人気 */
    @ConditionRequired.annotation('place', '-1', false)
    pop: string;
};

/**
 * スクレイピング結果オッズ情報
 */
export class OddsInfoDto extends AnnotationExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, any[]]) => {
            this[k] = v.map(x => new OddsDetailDto(x));
        });
    }

    win: OddsDetailDto[];
    place: OddsDetailDto[];
    wakuren: OddsDetailDto[];
    wide: OddsDetailDto[];
    umaren: OddsDetailDto[];
    umatan: OddsDetailDto[];
    trio: OddsDetailDto[];
    tierce: OddsDetailDto[];
};

export class OddsDetailDto extends AnnotationExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]) => {
            this[k] = v;
        });
    }
    num: string;
    yen: string;
    pop: string;
}
