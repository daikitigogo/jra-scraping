/**
 * race_dataエンティティ
 */
export class RaceData {
    /** 開催日 */
    dateOfRace: string;
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
