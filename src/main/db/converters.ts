import * as dtos from '../scraping/dtos';
import * as entities from './entities';

/**
 * スクレイピング結果をrace_listエンティティに変換する
 */
export class RaceDataToEntity {

    /**
     * コンストラクタ
     * @param raceData {dtos.RaceDataDto}
     */
    constructor(private readonly raceData: dtos.RaceDataDto) { }

    /**
     * 変換を実行する
     * @param raceDate {string} レース日付
     * @param turfPlaceCode {string} 競馬場名称
     */
    execute(raceDate: string, turfPlaceCode: string): entities.RaceData {
        const result = new entities.RaceData();
        result.dateOfRace = new Date(raceDate);
        result.turfPlaceCode = turfPlaceCode;
        result.raceNumber = new Number(this.raceData.raceNumber).valueOf();
        result.raceType = this.getRaceType();
        result.weather = this.getWeather();
        result.groundCondition = this.raceData.turfCondition || '0' + this.raceData.durtCondition || '0';
        result.raceDistance = new Number(this.raceData.raceCourse).valueOf();
        result.horseAge = this.raceData.raceCategory;
        result.raceGrade = this.raceData.raceGrade || this.raceData.raceClass;
        result.handicap = this.raceData.raceWeight;
        result.mareOnly = this.raceData.raceRule == '1' ? '1' : '0';
        result.specialityRaceId = this.getSpecialRaceId();
        return result;
    }

    /**
     * レース種別を取得    
     *   ・ レース名称に「障害」が含まれていれば障害    
     *   ・ ダート馬場状態があればダート    
     *   ・ 他は芝
     */
    private getRaceType(): string {
        if (this.raceData.raceName.includes('障害')) return '3';
        if (this.raceData.durtCondition) return '2';
        return '1'
    }
    /**
     * 天候を取得    
     *   ・ 晴/曇/雨 以外はいったんその他にする(後で他に何があるか調べる)
     */
    private getWeather(): string {
        const result = this.raceData.weather;
        if (result == '晴' || result == '曇' || result == '雨') return result;
        return '4';
    }
    /**
     * 特別レースIDを取得    
     *   ・ 平場は−1を返す
     *   ・ 特別レースはいったん0を返しておく(実際のIDは後ほど判定)
     */
    private getSpecialRaceId(): number {
        const raceName = this.raceData.raceName;
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

