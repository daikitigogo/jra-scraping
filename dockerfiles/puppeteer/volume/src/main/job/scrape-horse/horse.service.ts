import { Puppetman, ActionType, NavigateAction } from '#/share/utility/scraping.utility';
import { takeHorseList, takeDadInfo } from '#/job/scrape-horse/horse.script';
import { HorseData, ParentInfo } from './horse.dto';

export class HorseScrapingService {

    /** 共通待ち時間(ms) */
    private waitTime = 1000;
    /** プロフィールテーブルセレクタ */
    private readonly selector = 'body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(3) > tbody > tr > td > table:nth-child(4) > tbody';

    /**
     * コンストラクタ
     * @param puppetman Promise<Puppetman>
     */
    constructor(private puppetman: Promise<Puppetman>) { }

    /**
     * 馬名での検索実行までのナビゲーター
     * @param horseName string
     */
    public getNavigator(horseName: string): NavigateAction[] {
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

    /**
     * 馬名と誕生年から父名、母父名を取得する
     * @param navigator NavigateAction[]
     * @param horseName string
     * @param birthYear number
     */
    async getParentHorseInfo(navigator: NavigateAction[], horseName: string, birthYear: number): Promise<ParentInfo> {

        // スクレイピングオブジェクト
        const puppetman = await this.puppetman;
        // 検索結果ページまで遷移
        const targetHorse = await puppetman.execute(navigator, `[onclick^="return doAction('/JRADB/accessU.html'"]`, takeHorseList)
            .then(l => l.find((x: any) => x.horseName == horseName && Number(x.horseAge) == (new Date().getFullYear() - birthYear))) as HorseData;
        // 対象をクリック
        return await puppetman.execute([{ type: ActionType.Click, args: { selector: `[onclick="${targetHorse.onclick}"]` } }], this.selector, takeDadInfo)
            .then(l => l.find((_, i) => i == 0)) as ParentInfo;
    }
};