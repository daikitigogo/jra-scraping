import { ActionType, NavigateAction } from '#/share/utility/scraping.utility';

// 共通待ち時間
const waitTime = 1000;

export class Navi {

    private constructor() { }

    static base(year: string, month: string): NavigateAction[] {
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

    static goal(base: NavigateAction[], target: string): NavigateAction[] {
        return [
            ...base,
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
};