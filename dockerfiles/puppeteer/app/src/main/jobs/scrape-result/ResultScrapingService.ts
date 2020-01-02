import { ActionType, Puppetman, NavigateAction } from '#/share/utils/Puppetman';
import * as dtos from '#/share/dtos';
import { scrapingAllRace, takeRaceList } from '#/jobs/scrape-result/ScrapingOnBrowser';

// 共通待ち時間
const waitTime = 1000;

/**
 * Jraサイトのスクレイピング処理    
 * 過去レース結果からスクレイピング
 */
export class ResultScrapingService {

    /**
     * コンストラクタ
     * @param puppetman Promise<Puppetman>
     */
    constructor(private puppetman: Promise<Puppetman>) { }

    /**
     * 過去結果検索後までのナビゲーターを返す
     * @param year string
     * @param month string
     * @returns NavigateAction[]
     */
    getNavigator(year: string, month: string): NavigateAction[] {
        return [
            // 初期画面遷移
            {
                type: ActionType.Goto,
                args: {
                    selector: 'http://www.jra.go.jp/',
                    waitTime,
                },
            },
            // レース結果リンククリック
            {
                type: ActionType.Click,
                args: {
                    selector: '#quick_menu > div > ul > li:nth-child(4) > a',
                    waitTime,
                },
            },
            // 過去レース結果リンククリック
            {
                type: ActionType.Click,
                args: {
                    selector: '#past_result > div.layout_grid.mt15 > div.cell.right > a',
                    waitTime,
                }
            },
            // 年プルダウン選択
            {
                type: ActionType.Select,
                args: {
                    selector: '#kaisaiY_list',
                    value: `${year}`,
                    waitTime,
                }
            },
            // 月プルダウン選択
            {
                type: ActionType.Select,
                args: {
                    selector: '#kaisaiM_list',
                    value: `${month}`,
                    waitTime,
                }
            },
            // 検索実行
            {
                type: ActionType.Click,
                args: {
                    selector: '#contentsBody > div.search_setting > div > div > div.content > a',
                    waitTime,
                }
            }
        ];
    }

    /**
     * 指定開催リンク〜全てのレース結果表示リンククリック
     * @param target string
     */
    getAllRaceNavigator(target: string): NavigateAction[] {
        return [
            // onclick属性クリック
            {
                type: ActionType.Click,
                args: {
                    selector: `[onclick="${target}"]`,
                    waitTime,
                }
            },
            // 全てのレース結果リンククリック
            {
                type: ActionType.Click,
                args: {
                    selector: '#race_list > caption > div.layout_grid.mt15 > div.cell.right > a:nth-child(1)',
                    waitTime,
                }
            }
        ];
    }

    /**
     * 指定年月の開催レースを取得する    
     * 日が指定されている場合は更にフィルターする
     * @param navigator NavigateAction[]
     * @returns Promise<TargetDataDto[]>
     */
    async getTargetRaces(navigator: NavigateAction[]): Promise<dtos.TargetDataDto[]> {
        
        // レース結果リストセレクタ
        const raceListSelector = '#past_result > ul.past_result_line.mt20 > li > div';

        // スクレイピングオブジェクト
        const puppetman = await this.puppetman;

        // レース結果一覧ページまで遷移
        await puppetman.navigate(navigator);
        // レース結果一覧のonclick属性を抜き出して返す
        return await puppetman.page.$$eval(raceListSelector, takeRaceList)
            .then((jsArr: any[]) => jsArr.map(jsObj => new dtos.TargetDataDto(jsObj).decorate()));
    }

    /**
     * 指定されたonclickリンクをクリック、１開催の全レース情報を取得する
     * @param navigator NavigateAction[]
     * @returns Promise<RaceDataDto[]>
     */
    async getRaceList(navigator: NavigateAction[]): Promise<dtos.RaceDataDto[]> {

        // スクレイピングオブジェクト
        const puppetman = await this.puppetman;
        // レース結果一覧ページまで再度遷移、onclick属性クリック、全レース結果表示リンククリック
        await puppetman.navigate(navigator);
        // 1~12Rの情報を全て抜き出して返す
        return await puppetman.page.$$eval('[id^="race_result_"]', scrapingAllRace)
            .then((jsArr: any[]) => jsArr.map(jsObj => new dtos.RaceDataDto(jsObj).decorate()));
    }
};