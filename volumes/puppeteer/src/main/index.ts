import * as dotenv from 'dotenv';
dotenv.config();

import * as modules from '#/modules';
import { logger } from './logger';

/**
 * ジョブを実行する
 * @param jobName string
 * @param param string
 */
const executeJob = async (jobName: string, params: string[]) => {
    switch(jobName) {
        case 'result':
            const arg = modules.resultScrapingJob.parseArgs(params);
            for (const month of arg.months) {
                return await modules.resultScrapingJob.run(arg.year, month, arg.day);
            }
        case 'horse':
            return await modules.horseScrapingJob.run();
        default:
    }
};

/**
 * メイン
 * @param args string[]
 */
const main = async(args: string[]) => {
    if (args.length == 0) {
        await modules.close();
        throw new Error('Invalid arguments!');
    }
    try {
        const jobArgs = args.length > 1 ? args.slice(1) : [];
        await executeJob(args[0], jobArgs);
    } catch(e) {
        logger.error(e);
    } finally {
        await modules.close();
    }
};

main(process.argv.slice(2));
