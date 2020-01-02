import { BaseEntity } from "./BaseEntity";

/**
 * race_dataエンティティ
 */
export class RaceData implements BaseEntity {

    /** テーブル名 */
    readonly tableName = 'race_data';
    /** 主キーセット */
    readonly primaryKeySet = new Set(['date_of_race', 'turf_place_code', 'race_number']);

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
