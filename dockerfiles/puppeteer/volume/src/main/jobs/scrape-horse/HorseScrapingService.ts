import { Puppetman, ActionType, NavigateAction } from '#/share/utils/Puppetman';
import { takeHorseList, takeDadInfo } from '#/jobs/scrape-horse/ScrapingOnBrowser';

export class HorseScrapingService {

    /** 共通待ち時間(ms) */
    private waitTime = 1000;
    /** プロフィールテーブルセレクタ */
    private readonly selector = 'body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(3) > tbody > tr > td > table:nth-child(4) > tbody';

    /**
     * コンストラクタ
     * @param puppetman {Promise<Puppetman>}
     */
    constructor(private puppetman: Promise<Puppetman>) { }

    /**
     * 馬名と誕生年から父名、母父名を取得する
     * @param horseName {string}
     * @param birthYear {number}
     */
    async execute(horseName: string, birthYear: number) {

       const navigator = this.getNavigator(horseName);
        // スクレイピングオブジェクト
        const puppetman = await this.puppetman;
        // 検索結果ページまで遷移
        await puppetman.navigate(navigator);
        // 検索結果の競走馬リストを取得
        const horseList = await puppetman.page.$$eval(`[onclick^="return doAction('/JRADB/accessU.html'"]`, takeHorseList);
        // 名前と年齢が一致する馬が検索対象
        const targetHorse = horseList.find(h => h.horseName == horseName && +h.horseAge == (new Date().getFullYear() - birthYear));
        // 対象をクリック
        await puppetman.navigate([{ type: ActionType.Click, args: { selector: `[onclick="${targetHorse.onclick}"]` } }]);
        // 父名と母父名を取得して返す
        return await puppetman.page.$eval(this.selector, takeDadInfo);
    }

    /**
     * 馬名での検索実行までのナビゲーター
     * @param horseName {string}
     */
    private getNavigator(horseName: string): NavigateAction[] {
        return [
            // 初期画面遷移
            {
                type: ActionType.Goto,
                args: {
                    selector: 'http://www.jra.go.jp/',
                    waitTime: this.waitTime,
                },
            },
            // 競走馬検索ボタンクリック
            {
                type: ActionType.Click,
                args: {
                    selector: '#horse_search',
                    waitTime: this.waitTime
                }   
            },
            // 馬名入力アクション
            {
                type: ActionType.Input,
                args: {
                    selector: '#iv_h_name',
                    value: horseName,
                    waitTime: this.waitTime
                }
            },
            // 検索実行ボタンクリック
            {
                type: ActionType.Click,
                args: {
                    selector: '[onclick="return doSearch();"]',
                    waitTime: this.waitTime
                }   
            },
        ];
    }
};