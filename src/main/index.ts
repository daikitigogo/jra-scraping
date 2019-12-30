import * as dotenv from 'dotenv';
dotenv.config();

import { resultScrapingJob, close } from '#/modules';

function readArgv(argv: string[]): { year: string, month: string, day: string } {
    if (argv.length < 3) {
        throw new Error('Invalid arguments!');
    }
    const year = argv[2];
    const month = argv.length > 3 ? process.argv[3] : null;
    const day = argv.length > 4 ? argv[4] : null;
    const date = new Date(`${year}-${month || '01'}-${day || '01'}`);
    if (date.toString() === 'Invalid Date') {
        throw new Error('Invalid Date!');
    }
    return {
        year,
        month,
        day
    };
}

// const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const months = ['09', '10', '11', '12'];

(async () => {
    try {
        const args = readArgv(process.argv);
        if (args.month) {
            await resultScrapingJob.run(args.year, args.month, args.day);
        } else {
            for (const month of months) {
                await resultScrapingJob.run(args.year, month, null);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await close();
    }
})();
