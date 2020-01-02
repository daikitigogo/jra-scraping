import { BaseEntity } from "./BaseEntity";

/**
 * horse_masterエンティティ
 */
export class HorseMaster implements BaseEntity {

    /** テーブル名 */
    readonly tableName: string = 'horse_master';
    /** 主キーセット */
    readonly primaryKeySet: Set<string> = new Set(['horse_id']);

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
