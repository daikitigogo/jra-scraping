import { Puppetman } from '#/share/utility/scraping.utility';
import { ResultDatabaseService } from '#/job/scrape-result/result.service';
import { ResultScrapingJob } from "#/job/scrape-result/result.job";
import * as mariadb from 'mariadb';
import {
    HorseMasterRepository,
    RaceDataRepository,
    RaceDetailRepository,
    RefundRepository,
    SpecialityRaceRepository,
    TurfPlaceMasterRepository
 } from "#/share/repository/plain.repository";
import { HorseScrapingJob } from './job/scrape-horse/horse.job';

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
    puppetman,
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
    puppetman,
    horseMasterRepository
);

export const close = async() => {
    await (await puppetman).close();
    await pool.end();
};
