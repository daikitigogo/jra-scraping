import * as dotenv from 'dotenv';
dotenv.config();

import { mainController, close } from '#/modules';

function readArgv(argv: string[]): { year: string, month: string, day: string } {
    if (!(4 <= argv.length && argv.length <= 5)) {
        throw new Error('Invalid arguments!');
    }
    const year = process.argv[2];
    const month = process.argv[3];
    const day = process.argv.length == 5 ? process.argv[4] : null;
    const date = new Date(`${year}-${month}-${day || '01'}`);
    if (date.toString() === 'Invalid Date') {
        throw new Error('Invalid Date!');
    }
    return {
        year,
        month,
        day
    };
}

(async () => {
    try {
        const args = readArgv(process.argv);
        await mainController.run(args.year, args.month, args.day);
    } catch (e) {
        console.error(e);
    } finally {
        await close();
    }
})();
