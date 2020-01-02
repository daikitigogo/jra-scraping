import { BaseEntity } from "./BaseEntity";

/**
 * speciality_raceエンティティ
 */
export class SpecialityRace implements BaseEntity {

    /** テーブル名 */
    readonly tableName = 'speciality_race';
    /** 主キーセット */
    readonly primaryKeySet = new Set(['speciality_race_id']);

    /** 特別レースID */
    specialityRaceId: number = null;
    /** 特別レース名称 */
    specialityRaceName: string = null;
    /** 旧レースID */
    oldRaceId?: number = null;
};
