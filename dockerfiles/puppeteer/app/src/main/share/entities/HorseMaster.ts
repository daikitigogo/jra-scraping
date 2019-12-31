/**
 * horse_masterエンティティ
 */
export class HorseMaster {
    /** 馬ID */
    horseId: number;
    /** 馬名 */
    horseName: string;
    /** 誕生年 */
    birthYear: number;
    /** 性別 */
    sex: string;
    /** 父馬ID */
    dadHorseId: number;
    /** 母父ID */
    secondDadHorseId: number;
    /** 父父ID */
    thirdDadHorseId: number;
};
