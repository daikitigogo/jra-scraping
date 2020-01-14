import { ActionType, NavigateAction } from '../../share/utility/scraping.utility';

/** 共通待ち時間 */
const waitTime = 1000;

/**
 * 競走馬検索実行までのナビゲーション
 * @param horseName string
 */
export function baseNavi(horseName: string): NavigateAction[] {
    return [
        // 初期画面遷移
        {
            type: ActionType.Goto,
            args: {
                selector: 'http://www.jra.go.jp/',
                waitTime,
            },
        },
        // 競走馬検索ボタンクリック
        {
            type: ActionType.Click,
            args: {
                selector: '#horse_search',
                waitTime,
            }   
        },
        // 馬名入力アクション
        {
            type: ActionType.Input,
            args: {
                selector: '#iv_h_name',
                value: horseName,
                waitTime,
            }
        },
        // 検索実行ボタンクリック
        {
            type: ActionType.Click,
            args: {
                selector: '[onclick="return doSearch();"]',
                waitTime,
            }   
        },
    ];
};

/**
 * 競走馬詳細画面をクリックする
 * @param onclick string
 */
export function goalNavi(onclick: string): NavigateAction[] {
    return [
        {
            type: ActionType.Click,
            args: {
                selector: `[onclick="${onclick}"]`,
                waitTime,
            }
        }
    ];
}