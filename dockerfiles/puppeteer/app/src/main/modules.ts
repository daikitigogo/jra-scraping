import { Puppetman } from '#/share/utils/Puppetman';
import { ResultScrapingService } from '#/jobs/scrape-result/ResultScrapingService';
import { ReflectDbService } from '#/share/services/ReflectDbService';
import { DbUtil } from '#/share/utils/DbUtil';
import { ResultScrapingJob } from "#/jobs/scrape-result/ResultScrapingJob";
import * as mariadb from 'mariadb';

export const puppetman = Puppetman.init({ args: [ '--no-sandbox', '--disable-setuid-sandbox' ], headless: Boolean(process.env.NODE_PUPPETEER_HEADLESS) || true });
export const jraResultScraping = new ResultScrapingService(puppetman);

export const pool = mariadb.createPool({
    host: process.env.NODE_DB_HOST,
    database: process.env.NODE_DB_DATABASE,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    connectionLimit: +process.env.NODE_DB_CONNECTION_LIMIT || 1
});
export const dbUtil = new DbUtil();
export const jraDbService = new ReflectDbService(pool, dbUtil);

export const resultScrapingJob = new ResultScrapingJob(jraResultScraping, jraDbService);

export async function close() {
    await (await puppetman).close();
    await pool.end();
};
