import { Required, Format, CodeMapping, DecoratorExecutor } from '#/share/decorators';
import { RaceDetailDto, OddsInfoDto } from '#/share/dtos';

/**
 * スクレイピング結果ベース
 */
export class RaceDataDto extends DecoratorExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, any]) => {
            if (k === 'raceDetails') {
                this[k] = Array.from(v).map(jsObj => new RaceDetailDto(jsObj));
            } else if (k === 'odds') {
                this[k] = new OddsInfoDto(v);
            } else {
                // @ts-ignore
                this[k] = v;
            }
        });
    }

    /** レースナンバー */
    @Required.decorator()
    @Format.decorator({ regexp: 'レース' })
    raceNumber: string;
    /** レース名称 */
    @Required.decorator()
    raceName: string;
    /** GⅠ, GⅡ, GⅢ, リステッド */
    @Format.decorator(
        { regexp: '.*リステッド.*', replace: 'OL' },
        { regexp: '.*重賞.*', replace: 'G0' },
        { regexp: '.*GⅠ.*', replace: 'G1' },
        { regexp: '.*GⅡ.*', replace: 'G2' },
        { regexp: '.*GⅢ.*', replace: 'G3' },
        { regexp: '.*JpnⅠ.*', replace: 'J1' },
        { regexp: '.*JpnⅡ.*', replace: 'J2' },
        { regexp: '.*JpnⅢ.*', replace: 'J3' },
    )
    raceGrade: string;
    /** 天候 */
    @Required.decorator()
    @CodeMapping.decorator({
        mappings: [
            { codeId: '1', codeValue: '晴' },
            { codeId: '2', codeValue: '曇' },
            { codeId: '3', codeValue: '雨' },
            { codeId: '4', codeValue: '小雨' },
            { codeId: '5', codeValue: '雪' },
            { codeId: '6', codeValue: '小雪' },
        ]
    })
    weather: string;
    /** 芝馬場状態 */
    @CodeMapping.decorator({
        mappings: [
            { codeId: '1', codeValue: '良' },
            { codeId: '2', codeValue: '稍重' },
            { codeId: '3', codeValue: '重' },
            { codeId: '4', codeValue: '不良' },
        ]
    })
    turfCondition: string;
    /** ダート馬場状態 */
    @CodeMapping.decorator({
        mappings: [
            { codeId: '1', codeValue: '良' },
            { codeId: '2', codeValue: '稍重' },
            { codeId: '3', codeValue: '重' },
            { codeId: '4', codeValue: '不良' },
        ]
    })
    durtCondition: string;
    /** 対象馬齢 */
    @Required.decorator()
    @Format.decorator(
        { regexp: '.*4歳以上.*', replace: '41' },
        { regexp: '.*3歳以上.*', replace: '31' },
        { regexp: '.*3歳.*', replace: '30' },
        { regexp: '.*2歳.*', replace: '20' })
    raceCategory: string;
    /** レースグレード */
    @Required.decorator()
    @Format.decorator(
        { regexp: '.*新馬.*', replace: '00' },
        { regexp: '.*未勝利.*', replace: '01' },
        { regexp: '.*1勝.*|.*500万.*', replace: '10' },
        { regexp: '.*2勝.*|.*1000万.*', replace: '20' },
        { regexp: '.*3勝.*|.*1600万.*', replace: '30' },
        { regexp: '.*オープン.*', replace: 'OP'})
    raceClass: string;
    /** 混合, 牝馬限定 */
    @Format.decorator({ regexp: '.*牝.*', replace: '1' })
    raceRule: string;
    /** ハンデ, 別定, 定量 */
    @Required.decorator()
    @Format.decorator(
        { regexp: '.*ハンデ.*', replace: '1' },
        { regexp: '.*別定.*', replace: '2' },
        { regexp: '.*定量.*', replace: '3' },
        { regexp: '.*馬齢.*', replace: '4'})
    raceWeight: string;
    /** 距離 */
    @Required.decorator()
    @Format.decorator({ regexp: '[^0-9]' })
    raceCourse: string;
    /** レース詳細 */
    @Required.decorator()
    raceDetails: RaceDetailDto[];
    /** オッズ詳細 */
    @Required.decorator()
    odds: OddsInfoDto;
};
