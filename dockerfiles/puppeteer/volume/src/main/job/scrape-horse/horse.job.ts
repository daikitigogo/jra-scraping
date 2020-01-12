import { HorseScrapingService } from '#/job/scrape-horse/horse.service';
import { HorseMasterRepository } from '#/share/repository/plain.repository';
import { Pool } from "mariadb";

/**
 * 競走馬の親情報をスクレイピングで取得する
 */
export class HorseScrapingJob {

    /**
     * コンストラクタ
     * @param pool Pool
     * @param scrapingService HorseScrapingService
     * @param hmReps HorseMasterRepository
     */
    constructor(
        private pool: Pool,
        private scrapingService: HorseScrapingService,
        private hmReps: HorseMasterRepository) { }

    /**
     * スクレイピング実行
     */
    async run() {

        const conn = await this.pool.getConnection();
        try {
            // 親情報未設定の競走馬を取得
            const horseList = await this.hmReps.selectNoReflectParentInfo(conn);

            for (const entity of horseList) {
                // 競走馬検索から親情報を取得
                const navigator = this.scrapingService.getNavigator(entity.horseName);
                const result = await this.scrapingService.getParentHorseInfo(navigator, entity.horseName, entity.birthYear);
                // DB更新
                entity.dadHorseName = result.dadHorseName;
                entity.secondDadHorseName = result.secondDadHorseName;
                await this.hmReps.update(conn, entity);
            }
        } finally {
            await conn.end();
        }
    }
};
