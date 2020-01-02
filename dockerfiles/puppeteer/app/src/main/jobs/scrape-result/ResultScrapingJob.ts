import { ResultScrapingService } from "#/jobs/scrape-result/ResultScrapingService";
import { ResultDatabaseService } from "#/jobs/scrape-result/ResultDatabaseService";
import { DtoToEntity } from "#/jobs/scrape-result/DtoToEntity";
import { logger } from "#/logger";

/**
 * 過去レース結果一覧からレース結果を取得する
 */
export class ResultScrapingJob {

    /**
     * コンストラクタ
     * @param resultScrapingService ResultScrapingService
     * @param reflectDbService ReflectDbService
     */
    constructor(
        private scrapingService: ResultScrapingService,
        private databaseService: ResultDatabaseService) { }

    /**
     * スクレイピングを実行、結果をDBに保存する    
     * 日付、競馬場単位でトランザクション制御。既に処理済みの場合はスキップする
     * @param year string
     * @param month string
     * @param day? string
     */
    async run(year: string, month: string, day?: string) {

        logger.info(`ResultScrapingJob start! ${year}/${month}/${day}`);

        // 指定年月で検索するまでのナビゲーターを取得
        const baseNavigator = this.scrapingService.getNavigator(year, month);
        // 指定年月内での全開催リンクを抜き出し、日が指定されている場合は、更に日付で絞り込む
        const targetRaces = await this.scrapingService.getTargetRaces(baseNavigator)
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

            // onclickリンククリックまでのナビゲーターを取得
            const allRaceNavigator = this.scrapingService.getAllRaceNavigator(target.onclick);
            // １開催の全レースを取得する
            const raceList = await this.scrapingService.getRaceList([...baseNavigator, ...allRaceNavigator]);
            // エンティティリストに変換する
            const entityList = dtoToEntity.convert(dateOfRace, turfPlaceCode, raceList);

            // DB反映
            await this.databaseService.reflectAllEntity(entityList);
        }
    }
}
