import { ActionType, Puppetman, NavigateAction } from './puppetman';
import * as dtos from './dtos';
import { scrapingAllRace, takeRaceList } from './script-on-browser';

/**
 * Jraサイトのスクレイピング処理    
 * 過去レース結果からスクレイピング
 */
export default class JraResultScraping {

    /** 共通待ち時間 */
    private readonly waitTime = 1000;

    /**
     * コンストラクタ
     * @param year {string}
     * @param month {month}
     * @param day {day}
     */
    constructor(private readonly year: string, private readonly month: string, private readonly day?) { }

    /**
     * スクレイピング処理実行
     */
    async execute(): Promise<dtos.TargetDataDto[]> {

        // プルダウン選択＆検索実行までのナビを取得
        const navigator = this.getNavigator(this.year, this.month);
        // レース結果リストセレクタ
        const raceListSelector = '#past_result > ul.past_result_line.mt20 > li > div';

        // スクレイピングオブジェクト
        const puppetman = await Puppetman.init({ headless: new Boolean(process.env.NODE_PUPPETEER_HEADLESS).valueOf() });
        try {
            // レース結果一覧ページまで遷移
            await puppetman.navigate(navigator);
            // レース結果一覧のonclick属性を抜き出して返す
            const raceList: dtos.TargetDataDto[] = await puppetman.page.$$eval(raceListSelector, takeRaceList)
                .then((jsArr: any[]) => jsArr.map(jsObj => new dtos.TargetDataDto(jsObj).annotate()));
            // 日が指定されている場合は、対象レースに絞る
            const targetRace = this.day ? raceList.filter(r => r.date == `${this.month}/${this.day}`) : [...raceList];
            // 結果を配列に詰めていく
            const results: dtos.TargetDataDto[] = [];
            // 対象がなければ処理を終了する
            if (targetRace.length == 0) {
                return results;
            }
            // スクレイピング処理実施
            for (const target of targetRace) {
                // レース結果一覧ページまで再度遷移
                await puppetman.navigate(navigator);
                // onclick属性クリック、全レース結果表示リンククリック
                await puppetman.navigate(this.getAllRaceNavigator(target.onclick));
                const raceDataList: dtos.RaceDataDto[] = await puppetman.page.$$eval('[id^="race_result_"]', scrapingAllRace)
                    .then((jsArr: any[]) => jsArr.map(jsObj => new dtos.RaceDataDto(jsObj).annotate()));
                // 1レース分をスクレイピングして配列に詰めていく
                results.push(
                    new dtos.TargetDataDto({
                        date: `${this.year}/${target.date}`,
                        turfPlaceName: target.turfPlaceName,
                        raceDataList, 
                    })
                );
            }
            return results;
        } finally {
            await puppetman.close();    
        }
    }

    /**
     * 過去結果検索後までのナビゲーターを返す
     * @param year string
     * @param month string
     */
    private getNavigator(year: string, month: string): NavigateAction[] {
        return [
            // 初期画面遷移
            {
                type: ActionType.Goto,
                args: {
                    selector: 'http://www.jra.go.jp/',
                    waitTime: this.waitTime,
                },
            },
            // レース結果リンククリック
            {
                type: ActionType.Click,
                args: {
                    selector: '#quick_menu > div > ul > li:nth-child(4) > a',
                    waitTime: this.waitTime,
                },
            },
            // 過去レース結果リンククリック
            {
                type: ActionType.Click,
                args: {
                    selector: '#past_result > div.layout_grid.mt15 > div.cell.right > a',
                    waitTime: this.waitTime,
                }
            },
            // 年プルダウン選択
            {
                type: ActionType.Select,
                args: {
                    selector: '#kaisaiY_list',
                    value: `${year}`,
                    waitTime: this.waitTime,
                }
            },
            // 月プルダウン選択
            {
                type: ActionType.Select,
                args: {
                    selector: '#kaisaiM_list',
                    value: `${month}`,
                    waitTime :this.waitTime,
                }
            },
            // 検索実行
            {
                type: ActionType.Click,
                args: {
                    selector: '#contentsBody > div.search_setting > div > div > div.content > a',
                    waitTime: 1000,
                }
            }
        ];
    }

    /**
     * 指定開催リンク〜全てのレース結果表示リンククリック
     * @param target onclick属性
     */
    private getAllRaceNavigator(target: string): NavigateAction[] {
        return [
            // onclick属性クリック
            {
                type: ActionType.Click,
                args: {
                    selector: `[onclick="${target}"]`,
                    waitTime: this.waitTime,
                }
            },
            // 全てのレース結果リンククリック
            {
                type: ActionType.Click,
                args: {
                    selector: '#race_list > caption > div.layout_grid.mt15 > div.cell.right > a:nth-child(1)',
                    waitTime: this.waitTime,
                }
            }
        ];
    }
};
