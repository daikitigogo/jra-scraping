import { Puppetman } from '#/share/utility/scraping.utility';
import { baseNavi, goalNavi } from "./result.navigator";
import { ResultDatabaseService } from "./result.service";
import { DtoToEntity } from "./result.converter";
import { scrapingAllRace, takeRaceList } from './result.script';
import * as dtos from './result.dto';
import { logger } from "#/logger";

/** 過去レース結果一覧からのスクレイピングセレクタ */
const targetRacesSelector = '#past_result > ul.past_result_line.mt20 > li > div';
/** 全レース結果表示からのスクレイピングセレクタ */
const raceListSelector = '[id^="race_result_"]';

/**
 * 過去レース結果一覧からレース結果を取得する
 */
export class ResultScrapingJob {

    /**
     * コンストラクタ
     * @param puppetman Promise<Puppetman>
     * @param reflectDbService ReflectDbService
     */
    constructor(
        private puppetman: Promise<Puppetman>,
        private databaseService: ResultDatabaseService) { }

    /**
     * 引数をパースする
     * @param json string
     */
    parseArgs(params: string[]): {year: string, months: string[], day: string} {
        if (params.length == 0) throw new Error();
        const year = params[0];
        const month = params.find((_, i) => i == 1);
        const day = params.find((_, i) => i == 2);
        return {
            year,
            day,
            months: [month] || Array.from({ length: 12 }).map((_, i) => `0${i + 1}`.slice(-2)),
        };
    }

    /**
     * スクレイピングを実行、結果をDBに保存する    
     * 日付、競馬場単位でトランザクション制御。既に処理済みの場合はスキップする
     * @param year string
     * @param month string
     * @param day? string
     */
    async run(year: string, month: string, day?: string) {

        logger.info(`ResultScrapingJob start! ${year}/${month}/${day}`);

        // 過去レース結果一覧を取得
        const puppetman = await this.puppetman;
        const base = baseNavi(year, month);
        const targetRaces = await puppetman.execute(base, targetRacesSelector, takeRaceList)
            .then((jsArr: object[]) => jsArr.map(jsObj => new dtos.TargetDataDto(jsObj).decorate()))
            .then(targets => targets.filter(t => !day || t.date == `${+month}/${+day}`));
        if (targetRaces.length == 0) {
            logger.info('Target nothing!');
            return;
        }
        // 後の競馬場判定のため、競馬場マスタを全取得しておく
        const turfPlaceList = await this.databaseService.getTurfPlaceMaster();
        // Dto→Entity変換クラスを用意
        const dtoToEntity = new DtoToEntity();

        for (const target of targetRaces) {

            // 開催日付、競馬場コードを特定する
            const dateOfRace = `${year}/${target.date}}`;
            const turfPlaceCode = turfPlaceList.find(t => target.turfPlaceName.includes(t.turfPlaceName)).turfPlaceCode;

            // 反映済みレースはスキップする
            const reflected = await this.databaseService.isReflected(dateOfRace, turfPlaceCode);
            if (reflected) {
                logger.info(`Skip raceData! ${dateOfRace}, ${turfPlaceCode}`);
                continue;
            }

            // １開催の全レースを取得する
            const raceList = await puppetman.execute(goalNavi(base, target.onclick), raceListSelector, scrapingAllRace)
                .then((jsArr: object[]) => jsArr.map(jsObj => new dtos.RaceDataDto(jsObj).decorate()));
            // エンティティリストに変換する
            const entityList = dtoToEntity.convert(dateOfRace, turfPlaceCode, raceList);

            // DB反映
            await this.databaseService.reflectAllEntity(entityList);
        }
    }
}
