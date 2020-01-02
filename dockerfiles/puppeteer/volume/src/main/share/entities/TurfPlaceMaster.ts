import { BaseEntity } from "./BaseEntity";

/**
 * turf_place_masterエンティティ
 */
export class TurfPlaceMaster implements BaseEntity {

    /** テーブル名 */
    readonly tableName = 'turf_place_master';
    /** 主キーセット */
    readonly primaryKeySet = new Set(['turf_place_code']);

    /** 競馬場コード */
    turfPlaceCode: string = null;
    /** 競馬場名称 */
    turfPlaceName: string = null;
    /** 右回り/左回り */
    roundType: string = null;
};
