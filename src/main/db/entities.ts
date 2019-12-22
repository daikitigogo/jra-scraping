
/**
 * レース一覧
 */
export class RaceList {
    /** 開催日 */
    dateOfRace: Date;
    /** 競馬場コード */
    turfPlaceCode: string;
    /** 第Nレース */
    raceNumber: number;
    /** レース種別 */
    raceType: string;
    /** 天候 */
    weather: string;
    /** 馬場状態 */
    groundCondition: string;
    /** 距離 */
    raceDistance: number;
    /** 対象馬齢 */
    horseAge: string;
    /** レースグレード */
    raceGrade: string;
    /** ハンデ */
    handicap: string;
    /** 牝馬限定 */
    mareOnly: string;
    /** 特別レースID */
    specialityRaceId: number;
    /** レース詳細ID */
    raceDetailId: number;
    /** 払戻ID */
    refundId: number;
};

/**
 * 競馬場マスター
 */
export class TurfPlaceMaster {
    /** 競馬場コード */
    turfPlaceCode: string;
    /** 競馬場名称 */
    turfPlaceName: string;
    /** 右回り/左回り */
    roundType: string;
};

/**
 * 特別レース
 */
export class SpecialityRace {
    /** 特別レースID */
    specialityRaceId: number;
    /** 特別レース名称 */
    specialityRaceName: string;
};

/**
 * レース詳細
 */
export class RaceDetail {
    /** レース詳細ID */
    raceDetailId: number;
    /** 馬番 */
    horseNumber: number;
    /** 枠番 */
    frameNumber: number;
    /** 競走馬ID */
    horseId: number;
    /** 馬主 */
    owner: string;
    /** 騎手 */
    jockey: string;
    /** 調教師 */
    trainer: string;
    /** 斤量 */
    handicapWeight: number;
    /** 単勝オッズ */
    winOdds: number;
    /** 複勝オッズ */
    placeOdds: number;
    /** 馬体重 */
    horseWeight: number;
    /** 着順 */
    orderOfFinish: number;
    /** 走破時計 */
    finishTime: Date;
    /** 着差 */
    margin: string;
    /** コーナー通過順 */
    orderOfCorner: number;
    /** 上り3F */
    timeOf3F: number;
};

/**
 * 払い戻し情報
 */
export class Refund {
    /** 払戻ID */
    refundId: number;
    /** 払戻種別 */
    refundKind: string;
    /** 払戻連番 */
    refundSeq: number;
    /** 当選番号1 */
    firstNumber: number;
    /** 当選番号2 */
    secondNumber: number;
    /** 当選番号3 */
    thirdNumber: number;
    /** 払戻金額 */
    refundAmount: number;
};

/**
 * 競走馬マスタ
 */
export class HorseMaster {
    /** 馬ID */
    horseId: number = null;
    /** 馬名 */
    horseName: string = null;
    /** 誕生日 */
    birthday: Date = null;
    /** 父馬ID */
    dadHorseId: number = null;
    /** 母父ID */
    secondDadHorseId: number = null;
    /** 父父ID */
    thirdDadHorseId: number = null;
};
