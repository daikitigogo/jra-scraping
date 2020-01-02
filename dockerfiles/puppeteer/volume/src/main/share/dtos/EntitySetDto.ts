import * as entities from '#/share/entities';

/** 変換後のエンティティセット */
export class EntitySetDto {
    /** レースデータ */
    raceData: entities.RaceData;
    /** レース詳細リスト */
    raceDetails: {
        raceDetail: entities.RaceDetail,
        horseMaster: entities.HorseMaster
    }[];
    /** 払い戻しデータ */
    refunds: entities.Refund[];
    /** 特別レース */
    specialityRace?: entities.SpecialityRace;
}
