import { Puppetman } from '#/share/utils/Puppetman';
import { ResultScrapingService } from '#/jobs/scrape-result/ResultScrapingService';
import { ResultDatabaseService } from '#/jobs/scrape-result/ResultDatabaseService';
import { ResultScrapingJob } from "#/jobs/scrape-result/ResultScrapingJob";
import * as mariadb from 'mariadb';
import { HorseMasterRepository } from './share/repositories/HorseMasterRepository';
import { RaceDataRepository } from './share/repositories/RaceDataRepository';
import { RaceDetailRepository } from './share/repositories/RaceDetailRepository';
import { SpecialityRaceRepository } from './share/repositories/SpecialityRaceRepository';
import { TurfPlaceMasterRepository } from './share/repositories/TurfPlaceMasterRepository';
import { RefundRepository } from './share/repositories/RefundRepository';
import { HorseScrapingJob } from './jobs/scrape-horse/HorseScrapingJob';
import { HorseScrapingService } from './jobs/scrape-horse/HorseScrapingService';

// 共通部品
const puppetman = Puppetman.init({ args: [ '--no-sandbox', '--disable-setuid-sandbox' ], headless: Boolean(process.env.NODE_PUPPETEER_HEADLESS) || true });
const pool = mariadb.createPool({
    host: process.env.NODE_DB_HOST,
    database: process.env.NODE_DB_DATABASE,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    connectionLimit: Number(process.env.NODE_DB_CONNECTION_LIMIT) || 1
});
const horseMasterRepository = new HorseMasterRepository();
const raceDataRepository = new RaceDataRepository();
const raceDetailRepository = new RaceDetailRepository();
const refundRepository = new RefundRepository();
const specialityRaceRepository = new SpecialityRaceRepository();
const turfPlaceMasterRepository = new TurfPlaceMasterRepository();

// レース結果ジョブ
export const resultScrapingJob = new ResultScrapingJob(
    new ResultScrapingService(puppetman),
    new ResultDatabaseService(
        pool,
        horseMasterRepository,
        raceDataRepository,
        raceDetailRepository,
        refundRepository,
        specialityRaceRepository,
        turfPlaceMasterRepository
    )
);

// 競走馬親情報取得ジョブ
export const horseScrapingJob = new HorseScrapingJob(
    pool,
    new HorseScrapingService(puppetman),
    horseMasterRepository
);

export const close = async() => {
    await (await puppetman).close();
    await pool.end();
};
