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

export const puppetman = Puppetman.init({ args: [ '--no-sandbox', '--disable-setuid-sandbox' ], headless: Boolean(process.env.NODE_PUPPETEER_HEADLESS) || true });
export const scrapingService = new ResultScrapingService(puppetman);

export const pool = mariadb.createPool({
    host: process.env.NODE_DB_HOST,
    database: process.env.NODE_DB_DATABASE,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    connectionLimit: Number(process.env.NODE_DB_CONNECTION_LIMIT) || 1
});
export const databaseService = new ResultDatabaseService(
    pool,
    new HorseMasterRepository(),
    new RaceDataRepository(),
    new RaceDetailRepository(),
    new RefundRepository(),
    new SpecialityRaceRepository(),
    new TurfPlaceMasterRepository());

export const resultScrapingJob = new ResultScrapingJob(scrapingService, databaseService);

export async function close() {
    await (await puppetman).close();
    await pool.end();
};
