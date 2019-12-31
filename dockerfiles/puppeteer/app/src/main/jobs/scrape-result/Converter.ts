import * as dtos from '#/share/dtos';
import * as entities from '#/share/entities';

/**
 * スクレイピング結果のDTOをエンティティセットDTOに変換する
 */
export class Converter {

    /** RaceDataToEntity */
    private raceDataToEntity = new RaceDataToEntity();
    /** RaceDetailToEntity */
    private raceDetailToEntity = new RaceDetailToEntity();
    /** OddsInfoToEntity */
    private oddsInfoToEntity = new OddsInfoToEntity();

    /**
     * コンストラクタ
     * @param turfPlaceList {entities.TurfPlaceMaster[]} 競馬場マスタリスト
     */
    constructor(private turfPlaceList: entities.TurfPlaceMaster[]) { }

    /**
     * convert
     * @param targetData {dtos.TargetDataDto}
     * @returns {dtos.EntitySetDto[]}
     */
    convert(targetData: dtos.TargetDataDto): dtos.EntitySetDto[] {

        // 競馬場コードをマスタから取り出し
        const turfPlaceCode = this.turfPlaceList.find(x => targetData.turfPlaceName.includes(x.turfPlaceName)).turfPlaceCode;
        return targetData.raceDataList.map(raceData => {
            const entitySet: dtos.EntitySetDto = {
                raceData: this.raceDataToEntity.convert(targetData.date, turfPlaceCode, raceData),
                raceDetails: raceData.raceDetails.map(r => this.raceDetailToEntity.convert(targetData.date, r)),
                refunds: this.oddsInfoToEntity.convert(raceData.odds),
            };
            if (entitySet.raceData.specialityRaceId != null) {
                entitySet.specialityRace = {
                    specialityRaceId: entitySet.raceData.specialityRaceId,
                    specialityRaceName: raceData.raceName
                };
            }
            return entitySet;
        });
    }
}

/**
 * スクレイピング結果をrace_dataエンティティに変換する
 */
class RaceDataToEntity {

    /**
     * 変換を実行する
     * @param raceDate {string} レース日付
     * @param turfPlaceCode {string} 競馬場名称
     * @param raceData {dtos.RaceDataDto} レースデータ
     */
    convert(raceDate: string, turfPlaceCode: string, raceData: dtos.RaceDataDto): entities.RaceData {
        return {
            dateOfRace: raceDate,
            turfPlaceCode: turfPlaceCode,
            raceNumber: new Number(raceData.raceNumber).valueOf(),
            raceType: this.getRaceType(raceData),
            weather: this.getWeather(raceData),
            groundCondition: (raceData.turfCondition || '0') + (raceData.durtCondition || '0'),
            raceDistance: new Number(raceData.raceCourse).valueOf(),
            horseAge: raceData.raceCategory,
            raceGrade: raceData.raceGrade || raceData.raceClass,
            handicap: raceData.raceWeight,
            mareOnly: raceData.raceRule == '1' ? '1' : '0',
            specialityRaceId: this.getSpecialRaceId(raceData),
            raceDetailId: null,
            refundId: null,
        };
    }

    /**
     * レース種別を取得    
     *   ・ レース名称に「障害」が含まれていれば障害    
     *   ・ ダート馬場状態があればダート    
     *   ・ 他は芝
     */
    private getRaceType(raceData: dtos.RaceDataDto): string {
        if (raceData.raceName.includes('障害')) return '3';
        if (raceData.durtCondition) return '2';
        return '1'
    }
    /**
     * 天候を取得    
     *   ・ 晴/曇/雨 以外はいったんその他にする(後で他に何があるか調べる)
     */
    private getWeather(raceData: dtos.RaceDataDto): string {
        const result = raceData.weather;
        if (result == '1' || result == '2' || result == '3') return result;
        return '4';
    }
    /**
     * 特別レースIDを取得    
     *   ・ 平場は−1を返す
     *   ・ 特別レースはいったん0を返しておく(実際のIDは後ほど判定)
     */
    private getSpecialRaceId(raceData: dtos.RaceDataDto): number {
        const raceName = raceData.raceName;
        if (raceName.includes('未勝利')) return null;
        if (raceName.includes('メイクデビュー')) return null;
        if (raceName.includes('500万円以下')) return null;
        if (raceName.includes('1000万円以下')) return null;
        if (raceName.includes('1600万円以下')) return null;
        if (raceName.includes('1勝クラス')) return null;
        if (raceName.includes('2勝クラス')) return null;
        if (raceName.includes('3勝クラス')) return null;
        if (raceName.includes('サラ系')) return null;
        return 0;
    }
};

/**
 * レース結果詳細をrace_detailエンティティに変換する
 */
class RaceDetailToEntity {

    /**
     * 変換を実行する
     * @param dto {dtos.ResultDetailDto}
     */
    convert(raceDate: string, dto: dtos.RaceDetailDto): {raceDetail: entities.RaceDetail, horseMaster: entities.HorseMaster} {
        const raceDetail: entities.RaceDetail = {
            raceDetailId: null,
            horseNumber: +dto.num,
            frameNumber: +dto.waku,
            horseId: null,
            jockey: dto.jockey,
            trainer: dto.trainer,
            handicapWeight: +dto.weight,
            winPop: +dto.pop,
            horseWeight: +dto.horseWeight,
            orderOfFinish: +dto.place,
            finishTime: this.getFinishTime(dto.time),
            margin: dto.margin,
            timeOf3F: +dto.fTime,
        };
        const horseMaster: entities.HorseMaster = {
            horseId: null,
            horseName: dto.horse,
            birthYear: new Date(raceDate).getFullYear() - +dto.age.replace(/[^0-9]/g, ''),
            sex: dto.age.includes('牡') ? 'M' : dto.age.includes('牝') ? 'F' : 'S',
            dadHorseId: null,
            secondDadHorseId: null,
            thirdDadHorseId: null,
        };
        return {raceDetail, horseMaster};
    }

    /**
     * 走破時計を取得する(ms)
     * @param finishTime {string}
     */
    private getFinishTime(finishTime: string): number {
        const arr = finishTime.split(':');
        if (arr.length < 2) {
            return +finishTime;
        }
        return (+arr[0] * 60 + +arr[1]) * 1000;
    }
}

/**
 * 払戻情報をrefundエンティティに変換する
 */
class OddsInfoToEntity {

    /** 払戻種別のコードマッピング */
    private readonly mapping = {
        win: '1',
        place: '2',
        wakuren: '3',
        wide: '4',
        umaren: '5',
        umatan: '6',
        trio: '7',
        tierce: '8'
    };

    convert(dto: dtos.OddsInfoDto): entities.Refund[] {

        return Object.entries(dto)
            .map(([k, v]: [string, dtos.OddsDetailDto[]]) => {
                // @ts-ignore
                const refundKind = this.mapping[k];
                return v.map((d, i) => this.getEntity(d, refundKind, i + 1));
            })
            .reduce((a, c) => a.concat(c), []);
    }

    private getEntity(dto: dtos.OddsDetailDto, refundKind: string, refundSeq: number): entities.Refund {

        // 馬番をハイフン区切りで配列にしておく
        const numbers: string[] = dto.num.split('-');

        const result: entities.Refund = {
            refundId: null,
            refundKind,
            refundSeq,
            firstNumber: +numbers[0],
            secondNumber: null,
            thirdNumber: null,
            refundAmount: +dto.yen,
            refundPop: +dto.pop,
        };
        if (numbers.length > 1) result.secondNumber = +numbers[1];
        if (numbers.length > 2) result.thirdNumber = +numbers[2];
        return result;
    }
}
