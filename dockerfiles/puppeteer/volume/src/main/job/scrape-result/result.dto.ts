import { Required, ConditionRequired } from '#/share/decorator/validate.decorator';
import { Format, CodeMapping } from '#/share/decorator/format.decorator';
import {RaceData, RaceDetail, Refund, HorseMaster, SpecialityRace } from '#/share/entity/plain.entity';

class DecoratorExecutor {

    /** Decorator execute */
    decorate() {
        Object.entries(this).forEach(([k, v]) => {
            if (v instanceof DecoratorExecutor) {
                const obj = v.decorate();
                Reflect.set(this, k, obj);
            }
            if (v instanceof Array) {
                const arr = v.map(x => (x instanceof DecoratorExecutor) && x.decorate());
                Reflect.set(this, k, arr);
            }
            const format1 = Format.format(this, k, v);
            Reflect.set(this, k, format1);
            const format2 = CodeMapping.format(this, k, format1);
            Reflect.set(this, k, format2);
            Required.validate(this, k, format2);
            ConditionRequired.validate(this, k, format2);
        });
        return this;
    }
}

export class TargetDataDto extends DecoratorExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, any]) => {
            Reflect.set(this, k, v);
        });
    }

    /** 開催日 */
    @Required.decorator()
    date: string;
    /** 開催馬場 */
    @Required.decorator()
    turfPlaceName: string;
    /** 開催日・開催場馬へのonclickリンク */
    @Required.decorator()
    onclick: string;
    /** レースリスト */
    raceDataList: RaceDataDto[];
};

export class RaceDataDto extends DecoratorExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, any]) => {
            if (k === 'raceDetails') {
                this[k] = Array.from(v).map(jsObj => new RaceDetailDto(jsObj));
            } else if (k === 'odds') {
                this[k] = new OddsInfoDto(v);
            } else {
                Reflect.set(this, k, v);
            }
        });
    }

    /** レースナンバー */
    @Required.decorator()
    @Format.decorator({ regexp: 'レース' })
    raceNumber: string;
    /** レース名称 */
    @Required.decorator()
    raceName: string;
    /** GⅠ, GⅡ, GⅢ, リステッド */
    @Format.decorator(
        { regexp: '.*リステッド.*', replace: 'OL' },
        { regexp: '.*重賞.*', replace: 'G0' },
        { regexp: '.*GⅠ.*', replace: 'G1' },
        { regexp: '.*GⅡ.*', replace: 'G2' },
        { regexp: '.*GⅢ.*', replace: 'G3' },
        { regexp: '.*JpnⅠ.*', replace: 'J1' },
        { regexp: '.*JpnⅡ.*', replace: 'J2' },
        { regexp: '.*JpnⅢ.*', replace: 'J3' },
    )
    raceGrade: string;
    /** 天候 */
    @Required.decorator()
    @CodeMapping.decorator([
        { codeId: '1', codeValue: '晴' },
        { codeId: '2', codeValue: '曇' },
        { codeId: '3', codeValue: '雨' },
        { codeId: '4', codeValue: '小雨' },
        { codeId: '5', codeValue: '雪' },
        { codeId: '6', codeValue: '小雪' },
    ])
    weather: string;
    /** 芝馬場状態 */
    @CodeMapping.decorator([
        { codeId: '1', codeValue: '良' },
        { codeId: '2', codeValue: '稍重' },
        { codeId: '3', codeValue: '重' },
        { codeId: '4', codeValue: '不良' },
    ])
    turfCondition: string;
    /** ダート馬場状態 */
    @CodeMapping.decorator([
        { codeId: '1', codeValue: '良' },
        { codeId: '2', codeValue: '稍重' },
        { codeId: '3', codeValue: '重' },
        { codeId: '4', codeValue: '不良' },
    ])
    durtCondition: string;
    /** 対象馬齢 */
    @Required.decorator()
    @Format.decorator(
        { regexp: '.*4歳以上.*', replace: '41' },
        { regexp: '.*3歳以上.*', replace: '31' },
        { regexp: '.*3歳.*', replace: '30' },
        { regexp: '.*2歳.*', replace: '20' })
    raceCategory: string;
    /** レースグレード */
    @Required.decorator()
    @Format.decorator(
        { regexp: '.*新馬.*', replace: '00' },
        { regexp: '.*未勝利.*', replace: '01' },
        { regexp: '.*1勝.*|.*500万.*', replace: '10' },
        { regexp: '.*2勝.*|.*1000万.*', replace: '20' },
        { regexp: '.*3勝.*|.*1600万.*', replace: '30' },
        { regexp: '.*オープン.*', replace: 'OP'})
    raceClass: string;
    /** 混合, 牝馬限定 */
    @Format.decorator({ regexp: '.*牝.*', replace: '1' })
    raceRule: string;
    /** ハンデ, 別定, 定量 */
    @Required.decorator()
    @Format.decorator(
        { regexp: '.*ハンデ.*', replace: '1' },
        { regexp: '.*別定.*', replace: '2' },
        { regexp: '.*定量.*', replace: '3' },
        { regexp: '.*馬齢.*', replace: '4'})
    raceWeight: string;
    /** 距離 */
    @Required.decorator()
    @Format.decorator({ regexp: '[^0-9]' })
    raceCourse: string;
    /** レース詳細 */
    @Required.decorator()
    raceDetails: RaceDetailDto[];
    /** オッズ詳細 */
    @Required.decorator()
    odds: OddsInfoDto;
};

export class RaceDetailDto extends DecoratorExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, string]) => {
            Reflect.set(this, k, v);
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
    // あまりの大差負けの場合もNULLがあるらしい...
    // @ConditionRequired.decorator({ targetProp: 'place', condFunc: (value) => value != '-1' })
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

export class OddsInfoDto extends DecoratorExecutor {
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
                const detail = v.map(x => new OddsDetailDto(x));
                Reflect.set(this, k, detail);
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

export class OddsDetailDto extends DecoratorExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, string]) => {
            Reflect.set(this, k, v);
        });
    }

    /** 馬番 */
    @Required.decorator()
    num: string;
    /** 払い戻し */
    @Required.decorator()
    @Format.decorator({ regexp: '[^0-9]' })
    yen: string;
    /** 人気 */
    @Required.decorator()
    @Format.decorator({ regexp: '[^0-9]' })
    pop: string;
}

export class EntitySetDto {
    /** レースデータ */
    raceData: RaceData;
    /** レース詳細リスト */
    raceDetails: {
        raceDetail: RaceDetail,
        horseMaster: HorseMaster
    }[];
    /** 払い戻しデータ */
    refunds: Refund[];
    /** 特別レース */
    specialityRace?: SpecialityRace;
}
