import * as entities from '#/share/entity/plain.entity';
import * as dtos from './result.dto';

/**
 * レース名に含まれていたら特別レースではないと判断するキーワード
 */
const notSpecialRaceKeywords = [
    '未勝利',
    'メイクデビュー',
    '500万円以下',
    '1000万円以下',
    '1600万円以下',
    '1勝クラス',
    '2勝クラス',
    '3勝クラス',
    'サラ系',
];

/**
 * 走破時計を取得する(ms)
 * @param finishTime string
 */
const getFinishTime = (finishTime: string) => {
    const arr = finishTime.split(':');
    if (arr.length < 2) {
        return Number(finishTime);
    }
    return (Number(arr[0]) * 60 + Number(arr[1])) * 1000;
};

/** オッズコードマッピング */
const oddsMapping = new Map<string, string>([
    ['win', '1'],
    ['place', '2'],
    ['wakuren', '3'],
    ['umaren', '4'],
    ['umatan', '5'],
    ['wide', '6'],
    ['trio', '7'],
    ['tierce', '8'],
]);

/**
 * スクレイピング結果をエンティティのセットに変換する
 */
export class DtoToEntity {

    /**
     * 変換を実行する
     * @param dateOfRace string
     * @param turfPlaceCode string
     * @param dtoList dtos.RaceDataDto[]
     * @returns dtos.EntitySetDto[]
     */
    convert(dateOfRace: string, turfPlaceCode: string, dtoList: dtos.RaceDataDto[]): dtos.EntitySetDto[] {

        const result = dtoList.map(dto => {
            // race_dataエンティティに変換
            const entitySet = new dtos.EntitySetDto();
            entitySet.raceData = this.toRaceDataEntity(dateOfRace, turfPlaceCode, dto);
            // race_detailとhorse_masterはセットで配列に
            entitySet.raceDetails = dto.raceDetails.map(detail => {
                return {
                    raceDetail: this.toRaceDetailEntity(detail),
                    horseMaster: this.toHorseMasterEntity(dateOfRace, detail)
                };
            });
            // refundエンティティに変換
            entitySet.refunds = this.toRefundEntities(dto.odds);
            // 特別レース対象とみなされる場合のみ、speciality_raceエンティティを設定する
            if (!notSpecialRaceKeywords.some(k => dto.raceName.includes(k))) {
                const specialityRace = new entities.SpecialityRace();
                specialityRace.specialityRaceName = dto.raceName;
                entitySet.specialityRace = specialityRace;
            }
            return entitySet;
        });
        return result;
    }

    /**
     * DTOをrace_dataエンティティに変換する
     * @param dateOfRace string
     * @param turfPlaceCode string
     * @param dto dtos.RaceDataDto
     * @returns entities.RaceData
     */
    private toRaceDataEntity(dateOfRace: string, turfPlaceCode: string, dto: dtos.RaceDataDto): entities.RaceData {

        const result = new entities.RaceData();
        result.dateOfRace = dateOfRace;
        result.turfPlaceCode = turfPlaceCode;
        result.raceNumber = Number(dto.raceNumber);
        result.raceType = dto.raceName.includes('障害') ? '3' : dto.durtCondition ? '2' : '1';
        result.weather = dto.weather;
        result.groundCondition = (dto.turfCondition || '0') + (dto.durtCondition || '0');
        result.raceDistance = Number(dto.raceCourse);
        result.horseAge = dto.raceCategory;
        result.raceGrade = dto.raceGrade || dto.raceClass;
        result.handicap = dto.raceWeight;
        result.mareOnly = dto.raceRule == '1' ? '1' : '0';
        return result;
    }

    /**
     * DTOをrace_detailエンティティに変換する
     * @param dto dtos.RaceDetailDto
     * @returns entities.RaceDetail
     */
    private toRaceDetailEntity(dto: dtos.RaceDetailDto): entities.RaceDetail {

        const result = new entities.RaceDetail();
        result.horseNumber = Number(dto.num);
        result.frameNumber = Number(dto.waku);
        result.jockey = dto.jockey;
        result.trainer = dto.trainer;
        result.handicapWeight = Number(dto.weight);
        result.winPop = Number(dto.pop);
        result.horseWeight = Number(dto.horseWeight);
        result.orderOfFinish = Number(dto.place);
        result.finishTime = getFinishTime(dto.time);
        result.margin = dto.margin;
        result.timeOf3f = Number(dto.fTime);
        return result;
    }

    /**
     * DTOからhorse_masterエンティティに変換する
     * @param dateOfRace string
     * @param dto dtos.RaceDetailDto
     * @returns entities.HorseMaster
     */
    private toHorseMasterEntity(dateOfRace: string, dto: dtos.RaceDetailDto): entities.HorseMaster {

        const result = new entities.HorseMaster();
        result.horseName = dto.horse;
        result.birthYear = Number(dateOfRace.substr(0, 4)) - Number(dto.age.replace(/[^0-9]/g, ''));
        result.sex = dto.age.includes('牡') ? 'M' : dto.age.includes('牝') ? 'F' : 'S';
        return result;
    }

    /**
     * DTOをrefundエンティティリストに変換する
     * @param dto dtos.OddsInfoDto
     * @returns entities.Refund[]
     */
    private toRefundEntities(dto: dtos.OddsInfoDto): entities.Refund[] {

        return Object.entries(dto)
            .map(([k, v]: [string, dtos.OddsDetailDto[]]) => {
                const refundKind = oddsMapping.get(k);
                return v.map((d, i) => {

                    const numbers: string[] = d.num.split('-');
                    const result = new entities.Refund();
                    result.refundKind = refundKind;
                    result.refundSeq = i + 1;
                    result.firstNumber = Number(numbers[0]);
                    result.refundAmount = Number(d.yen);
                    result.refundPop = Number(d.pop);

                    if (numbers.length > 1) result.secondNumber = Number(numbers[1]);
                    if (numbers.length > 2) result.thirdNumber = Number(numbers[2]);
                    return result;
                });
            })
            .reduce((a, c) => a.concat(c), []);
    }
};