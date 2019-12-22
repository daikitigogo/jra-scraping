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

    /** レースナンバー */
    @Required.annotation()
    @Format.annotation({ regexp: 'レース' })
    raceNumber: string;
    /** レース名称 */
    @Required.annotation()
    raceName: string;
    /** GⅠ, GⅡ, GⅢ, リステッド */
    @Format.annotation({ regexp: 'リステッド', replace: 'OL' })
    raceGrade: string;
    /** 天候 */
    @Required.annotation()
    @Format.annotation(
        { regexp: '晴', replace: '1' },
        { regexp: '曇', replace: '2' },
        { regexp: '雨', replace: '3' })
    weather: string;
    /** 芝馬場状態 */
    @Format.annotation(
        { regexp: '良', replace: '1' },
        { regexp: '稍重', replace: '2' },
        { regexp: '重', replace: '3'},
        { regexp: '不良', replace: '4' })
    turfCondition: string;
    /** ダート馬場状態 */
    @Format.annotation(
        { regexp: '良', replace: '1' },
        { regexp: '稍重', replace: '2' },
        { regexp: '重', replace: '3'},
        { regexp: '不良', replace: '4' })
    durtCondition: string;
    /** 対象馬齢 */
    @Required.annotation()
    @Format.annotation(
        { regexp: '.*4歳以上.*', replace: '41' },
        { regexp: '.*3歳以上.*', replace: '31' },
        { regexp: '.*3歳.*', replace: '30' },
        { regexp: '.*2歳.*', replace: '20' })
    raceCategory: string;
    /** レースグレード */
    @Required.annotation()
    @Format.annotation(
        { regexp: '.*新馬.*', replace: '00' },
        { regexp: '.*未勝利.*', replace: '01' },
        { regexp: '.*1勝.*|.*500万.*', replace: '10' },
        { regexp: '.*2勝.*|.*1000万.*', replace: '20' },
        { regexp: '.*3勝.*|.*1600万.*', replace: '30' },
        { regexp: '.*オープン.*', replace: 'OP'})
    raceClass: string;
    /** 混合, 牝馬限定 */
    @Required.annotation()
    @Format.annotation({ regexp: '.*牝.*', replace: '1' })
    raceRule: string;
    /** ハンデ, 別定, 定量 */
    @Required.annotation()
    @Format.annotation(
        { regexp: '.*ハンデ.*', replace: '1' },
        { regexp: '.*別定.*', replace: '2' },
        { regexp: '.*定量.*', replace: '3' })
    raceWeight: string;
    /** 距離 */
    @Required.annotation()
    @Format.annotation({ regexp: '[^0-9]' })
    raceCourse: string;
    /** レース詳細 */
    @Required.annotation()
    raceResult: ResultDetailDto[];
    /** オッズ詳細 */
    @Required.annotation()
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
    @Format.annotation({ regexp: '除外|中止|取消', replace: '-1' })
    place: string;
    /** 枠番 */
    @Required.annotation()
    @Format.annotation({ regexp: '[^0-9]' })
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
    @Format.annotation({ regexp: '／', replace: '/' })
    margin: string;
    /** 馬体重 */
    @ConditionRequired.annotation('place', '-1', false)
    @Format.annotation({ regexp: '\\(.+\\)' })
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
            // 枠連はない場合があるので、その場合は空リストにしておく
            if (k == 'wakuren' && v.length == 1 && v.every(x => !x.num && !x.yen && !x.pop)) {
                this[k] = [];
            } else {
                this[k] = v.map(x => new OddsDetailDto(x));
            }
        });
    }

    /** 単勝 */
    win: OddsDetailDto[];
    /** 複勝 */
    place: OddsDetailDto[];
    /** 枠連 */
    wakuren: OddsDetailDto[];
    /** ワイド */
    wide: OddsDetailDto[];
    /** 馬連 */
    umaren: OddsDetailDto[];
    /** 馬単 */
    umatan: OddsDetailDto[];
    /** 三連複 */
    trio: OddsDetailDto[];
    /** 三連単 */
    tierce: OddsDetailDto[];
};

/**
 * オッズ詳細
 */
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
    /** 馬番 */
    @Required.annotation()
    num: string;
    /** 払い戻し */
    @Required.annotation()
    yen: string;
    /** 人気 */
    @Required.annotation()
    pop: string;
}
