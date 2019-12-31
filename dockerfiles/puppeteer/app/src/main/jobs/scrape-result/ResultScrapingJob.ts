import { ResultScrapingService } from "#/jobs/scrape-result/ResultScrapingService";
import { ReflectDbService } from "#/share/services/ReflectDbService";
import { Converter } from "#/jobs/scrape-result/Converter";
import { logger } from "#/logger";

/**
 * 過去レース結果一覧からレース結果を取得する
 */
export class ResultScrapingJob {

    /**
     * コンストラクタ
     * @param resultScrapingService {ResultScrapingService}
     * @param reflectDbService {ReflectDbService}
     */
    constructor(
        private resultScrapingService: ResultScrapingService,
        private reflectDbService: ReflectDbService) { }

    /**
     * スクレイピングを実行、結果をDBに保存する    
     * 日付、競馬場単位でトランザクション制御。既に処理済みの場合はスキップする
     * @param year {string}
     * @param month {string}
     * @param day? {string}
     */
    async run(year: string, month: string, day?: string) {

        const turfPlaceList = await this.reflectDbService.selectAllTurfPlaceMaster();
        const converter = new Converter(turfPlaceList);
        const targets = await this.resultScrapingService.getTargetRaces(year, month, day);
        if (targets.length == 0) {
            logger.info('Target nothing!');
        }
        for (const target of targets) {
            const turfPlaceCode = turfPlaceList.find(x => target.turfPlaceName.includes(x.turfPlaceName)).turfPlaceCode;
            const date = `${year}/${target.date}`;
            const count = await this.reflectDbService.selectReflectedRaceData(date, turfPlaceCode);
            if (count > 0) {
                logger.info(`Skip raceData! ${date}, ${turfPlaceCode}`);
                continue;
            }
            logger.info(`Scraping start! target: ${JSON.stringify(target)}`);
            const targetData = await this.resultScrapingService.execute(year, month, target);
            const entitySetList = converter.convert(targetData);
            await this.reflectDbService.registAll(entitySetList);
        }
    }
}