/**
 * race_detailエンティティ
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
    /** 騎手 */
    jockey: string;
    /** 調教師 */
    trainer: string;
    /** 斤量 */
    handicapWeight: number;
    /** 単勝人気 */
    winPop: number;
    /** 馬体重 */
    horseWeight: number;
    /** 着順 */
    orderOfFinish: number;
    /** 走破時計 */
    finishTime: number;
    /** 着差 */
    margin: string;
    /** 上り3F */
    timeOf3F: number;
};
