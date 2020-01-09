import * as Entity from '../decorators/Entity';

/**
 * horse_masterエンティティ
 */
@Entity.decorator({ tableName: 'horse_master',  primaryKeySet: new Set<string>(['horseId']) })
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
