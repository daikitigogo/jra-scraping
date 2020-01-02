import { BaseEntity } from "./BaseEntity";

/**
 * race_detailエンティティ
 */
export class RaceDetail implements BaseEntity {

    /** テーブル名 */
    readonly tableName = 'race_detail';
    /** 主キーセット */
    readonly primaryKeySet = new Set(['race_detail_id', 'horse_id']);

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
