import { Puppetman } from '#/share/utility/scraping.utility';
import { baseNavi, goalNavi } from '#/job/scrape-horse/horse.navigator';
import { HorseDataDto, ParentInfoDto } from './horse.dto';
import { HorseMasterRepository } from '#/share/repository/plain.repository';
import { takeHorseList, takeDadInfo } from './horse.script';
import { Pool } from "mariadb";
import { HorseMaster } from '#/share/entity/plain.entity';
import { logger } from '#/logger';

/** 検索結果一覧取得セレクタ */
const targetHorsesSelector = `[onclick^="return doAction('/JRADB/accessU.html'"]`;
/** 親情報取得セレクタ */
const parentInfoSelector = 'body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(3) > tbody > tr > td > table:nth-child(4) > tbody';

/**
 * 競走馬の親情報をスクレイピングで取得する
 */
export class HorseScrapingJob {

    /**
     * コンストラクタ
     * @param pool Pool
     * @param puppetman Promise<Puppetman>
     * @param hmReps HorseMasterRepository
     */
    constructor(
        private pool: Pool,
        private puppetman: Promise<Puppetman>,
        private hmReps: HorseMasterRepository) { }

    /**
     * スクレイピング実行
     */
    async run() {

        const conn = await this.pool.getConnection();
        try {
            // ブラウザ、ページの起動完了を待つ
            const puppetman = await this.puppetman;
            // 親情報未設定の競走馬を取得
            const horseList = await this.hmReps.selectNoReflectParentInfo(conn);

            for (const entity of horseList) {
                // 競走馬検索から親情報を取得
                const base = baseNavi(entity.horseName);
                // 検索結果ページまで遷移
                const targetHorse = await puppetman.execute(base, targetHorsesSelector, takeHorseList)
                    .then(l => l.find((x: HorseDataDto) => this.isTarget(x, entity))) as HorseDataDto;
                if (!targetHorse) {
                    logger.error(`Not found! entity: ${JSON.stringify(entity)}`);
                    continue;
                }
                // 対象をクリック
                const result = await puppetman.execute(goalNavi(targetHorse.onclick), parentInfoSelector, takeDadInfo)
                    .then(l => l.find((_, i) => i == 0)) as ParentInfoDto;
                if (!result) {
                    logger.error(`Not found! entity: ${JSON.stringify(entity)}, targetHorse: ${JSON.stringify(targetHorse)}`);
                    continue;
                }
                // DB更新
                entity.dadHorseName = result.dadHorseName;
                entity.secondDadHorseName = result.secondDadHorseName;
                await this.hmReps.update(conn, entity);
            }
        } finally {
            await conn.end();
        }
    }

    /**
     * 検索対象馬かどうかを判定する
     * @param dto HorseDataDto
     * @param entity HorseMaster
     */
    private isTarget(dto: HorseDataDto, entity: HorseMaster): boolean {
        // 馬齢は未更新の場合がある
        const horseAgeMax = new Date().getFullYear() - entity.birthYear;
        const horseAgeMin = horseAgeMax - 1;
        return dto.horseName == entity.horseName && horseAgeMin <= +dto.horseAge && +dto.horseAge <= horseAgeMax;
    }
};
