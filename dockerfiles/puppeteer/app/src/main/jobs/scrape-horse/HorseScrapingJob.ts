import { HorseScrapingService } from "#/jobs/scrape-horse/HorseScrapingService";
import { Puppetman } from '#/share/utils/Puppetman';

export class HorseScrapingJob {

    constructor(private horseScrapingService: HorseScrapingService) { }

    async run() {
        const result = await this.horseScrapingService.execute('アーモンドアイ', 2015);
        console.log(result);
    }
};

(async() => {
    const puppetman = Puppetman.init({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true, dumpio: true });
    const service = new HorseScrapingService(puppetman);
    const job = new HorseScrapingJob(service);
    await job.run();
    try {
    } catch (e) {
        console.error(e);
    } finally {
        await (await puppetman).close();
    }
})();
