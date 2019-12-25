import * as dtos from '../scraping/dtos';
import * as entities from './entities';

/** 変換後のエンティティセット */
export interface entitySet {
    /** レースデータ */
    raceData: entities.RaceData;
    /** レース詳細リスト */
    raceDetails: {
        raceDetail: entities.RaceDetail,
        horseMaster: entities.HorseMaster
    }[];
    /** 払い戻しデータ */
    refunds: entities.Refund[];
}

export class Converter {

    /**
     * コンストラクタ
     * @param turfPlaceList {entities.TurfPlaceMaster[]} 競馬場マスタリスト
     */
    constructor(private readonly turfPlaceList: entities.TurfPlaceMaster[]) { }

    convert(targetData: dtos.TargetDataDto): entitySet[] {
        // 競馬場コードをマスタから取り出し
        const turfPlaceCode = this.turfPlaceList.find(x => targetData.turfPlaceName.includes(x.turfPlaceName)).turfPlaceCode;
        return targetData.raceDataList.map(raceData => {
            return {
                raceData: RaceDataToEntity.convert(targetData.date, turfPlaceCode, raceData),
                raceDetails: raceData.raceResult.map(r => RaceDetailToEntity.convert(targetData.date, r)),
                refunds: OddsInfoToEntity.convert(raceData.odds),
            };
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
    static convert(raceDate: string, turfPlaceCode: string, raceData: dtos.RaceDataDto): entities.RaceData {
        return {
            dateOfRace: new Date(raceDate),
            turfPlaceCode: turfPlaceCode,
            raceNumber: new Number(raceData.raceNumber).valueOf(),
            raceType: RaceDataToEntity.getRaceType(raceData),
            weather: RaceDataToEntity.getWeather(raceData),
            groundCondition: raceData.turfCondition || '0' + raceData.durtCondition || '0',
            raceDistance: new Number(raceData.raceCourse).valueOf(),
            horseAge: raceData.raceCategory,
            raceGrade: raceData.raceGrade || raceData.raceClass,
            handicap: raceData.raceWeight,
            mareOnly: raceData.raceRule == '1' ? '1' : '0',
            specialityRaceId: RaceDataToEntity.getSpecialRaceId(raceData),
        };
    }

    /**
     * レース種別を取得    
     *   ・ レース名称に「障害」が含まれていれば障害    
     *   ・ ダート馬場状態があればダート    
     *   ・ 他は芝
     */
    private static getRaceType(raceData: dtos.RaceDataDto): string {
        if (raceData.raceName.includes('障害')) return '3';
        if (raceData.durtCondition) return '2';
        return '1'
    }
    /**
     * 天候を取得    
     *   ・ 晴/曇/雨 以外はいったんその他にする(後で他に何があるか調べる)
     */
    private static getWeather(raceData: dtos.RaceDataDto): string {
        const result = raceData.weather;
        if (result == '晴' || result == '曇' || result == '雨') return result;
        return '4';
    }
    /**
     * 特別レースIDを取得    
     *   ・ 平場は−1を返す
     *   ・ 特別レースはいったん0を返しておく(実際のIDは後ほど判定)
     */
    private static getSpecialRaceId(raceData: dtos.RaceDataDto): number {
        const raceName = raceData.raceName;
        if (raceName.includes('未勝利')) return -1;
        if (raceName.includes('メイクデビュー')) return -1;
        if (raceName.includes('500万以下')) return -1;
        if (raceName.includes('1000万以下')) return -1;
        if (raceName.includes('1600万以下')) return -1;
        if (raceName.includes('1勝クラス')) return -1;
        if (raceName.includes('2勝クラス')) return -1;
        if (raceName.includes('3勝クラス')) return -1;
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
    static convert(raceDate: string, dto: dtos.ResultDetailDto): {raceDetail: entities.RaceDetail, horseMaster: entities.HorseMaster} {
        const raceDetail = {
            raceDetailId: 0,
            horseNumber: +dto.num,
            frameNumber: +dto.waku,
            horseId: 0,
            jockey: dto.jockey,
            trainer: dto.trainer,
            handicapWeight: +dto.weight,
            winPop: +dto.pop,
            horseWeight: +dto.horseWeight,
            orderOfFinish: +dto.place,
            finishTime: RaceDetailToEntity.getFinishTime(dto.time),
            margin: dto.margin,
            timeOf3F: +dto.fTime,
        };
        const horseMaster = {
            horseId: 0,
            horseName: dto.horse,
            birthYear: new Date(raceDate).getFullYear() - +dto.age.replace(/[^0-9]/g, ''),
            sex: dto.age.includes('牡') ? 'M' : dto.age.includes('牝') ? 'F' : 'S',
        };
        return {raceDetail, horseMaster};
    }

    /**
     * 走破時計を取得する(ms)
     * @param finishTime {string}
     */
    private static getFinishTime(finishTime: string): number {
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
    private static readonly mapping = {
        win: '1',
        place: '2',
        wakuren: '3',
        wide: '4',
        umaren: '5',
        umatan: '6',
        trio: '7',
        tierce: '8'
    };

    static convert(dto: dtos.OddsInfoDto): entities.Refund[] {

        return Object.entries(dto)
            .map(([k, v]: [string, dtos.OddsDetailDto[]]) => {
                const refundKind = OddsInfoToEntity.mapping[k];
                return v.map((d, i) => OddsInfoToEntity.getEntity(d, refundKind, i + 1));
            })
            .reduce((a, c) => a.concat(c), []);
    }

    private static getEntity(dto: dtos.OddsDetailDto, refundKind: string, refundSeq: number): entities.Refund {

        // 馬番をハイフン区切りで配列にしておく
        const numbers: string[] = dto.num.split('-');

        return {
            refundId: 0,
            refundKind,
            refundSeq,
            firstNumber: +numbers[0],
            refundAmount: +dto.yen,
            refundPop: +dto.pop,
        };
    }
}
