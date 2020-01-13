import { Entity } from '../decorator/table.decorator';

/** 競走馬マスタ */
@Entity.decorator(new Set<string>(['horseId']))
export class HorseMaster {
    /** 馬ID */
    horseId: number = null;
    /** 馬名 */
    horseName: string = null;
    /** 誕生年 */
    birthYear: number = null;
    /** 性別 */
    sex: string = null;
    /** 父馬名 */
    dadHorseName: string = null;
    /** 母父名 */
    secondDadHorseName: string = null;
};

/** レースデータ */
@Entity.decorator(new Set<string>(['dateOfRace', 'turfPlaceCode', 'raceNumber']))
export class RaceData {
    /** 開催日 */
    dateOfRace: string = null;
    /** 競馬場コード */
    turfPlaceCode: string = null;
    /** 第Nレース */
    raceNumber: number = null;
    /** レース種別 */
    raceType: string = null;
    /** 天候 */
    weather: string = null;
    /** 馬場状態 */
    groundCondition: string = null;
    /** 距離 */
    raceDistance: number = null;
    /** 対象馬齢 */
    horseAge: string = null;
    /** レースグレード */
    raceGrade: string = null;
    /** ハンデ */
    handicap: string = null;
    /** 牝馬限定 */
    mareOnly: string = null;
    /** 特別レースID */
    specialityRaceId: number = null;
    /** レース詳細ID */
    raceDetailId: number = null;
    /** 払戻ID */
    refundId: number = null;
};

/** レース詳細データ */
@Entity.decorator(new Set<string>(['raceDetailId']))
export class RaceDetail {
    /** レース詳細ID */
    raceDetailId: number = null;
    /** 競走馬ID */
    horseId: number = null;
    /** 馬番 */
    horseNumber: number = null;
    /** 枠番 */
    frameNumber: number = null;
    /** 騎手 */
    jockey: string = null;
    /** 調教師 */
    trainer: string = null;
    /** 斤量 */
    handicapWeight: number = null;
    /** 単勝人気 */
    winPop: number = null;
    /** 馬体重 */
    horseWeight: number = null;
    /** 着順 */
    orderOfFinish: number = null;
    /** 走破時計 */
    finishTime: number = null;
    /** 着差 */
    margin: string = null;
    /** 上り3F */
    timeOf3f: number = null;
};

/** 払戻情報 */
@Entity.decorator(new Set<string>(['refundId']))
 export class Refund {
    /** 払戻ID */
    refundId: number = null;
    /** 払戻種別 */
    refundKind: string = null;
    /** 払戻連番 */
    refundSeq: number = null;
    /** 当選番号1 */
    firstNumber: number = null;
    /** 当選番号2 */
    secondNumber: number = null;
    /** 当選番号3 */
    thirdNumber: number = null;
    /** 払戻金額 */
    refundAmount: number = null;
    /** 払戻人気 */
    refundPop: number = null;
};

/** 特別レースマスタ */
@Entity.decorator(new Set<string>(['specialityRaceId']))
export class SpecialityRace {
    /** 特別レースID */
    specialityRaceId: number = null;
    /** 特別レース名称 */
    specialityRaceName: string = null;
    /** 旧レースID */
    oldRaceId?: number = null;
};

/** 競馬場マスタ */
@Entity.decorator(new Set<string>(['turfPlaceCode']))
export class TurfPlaceMaster {
    /** 競馬場コード */
    turfPlaceCode: string = null;
    /** 競馬場名称 */
    turfPlaceName: string = null;
    /** 右回り/左回り */
    roundType: string = null;
};
