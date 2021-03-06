import * as puppeteer from 'puppeteer';

/**
 * スクレイピングメインページまでのナビゲートアクション種別
 */
export enum ActionType {
    Goto = 'goto',
    Click = 'click',
    Select = 'select',
    Input = 'input',
};

/**
 * ナビゲートアクション引数
 */
export interface NavigateArgs {
    /** ナビゲート対象セレクタ */
    readonly selector: string;
    /** ナビゲート設定値 */
    readonly value?: string;
    /** ナビゲート待機対象セレクタ */
    readonly waitSelector?: string;
    /** ナビゲート待ち時間 */
    readonly waitTime?: number;
}

/**
 * スクレイピングメインページまでのナビゲートアクション
 */
export interface NavigateAction {
    /** ナビゲートアクション種別 */
    readonly type: ActionType;
    /** ナビゲートアクション引数 */
    readonly args: NavigateArgs;
};

/**
 * ウェブスクレイピングクラス
 */
export class Puppetman {

    /**
     * コンストラクタ    
     * asyncに出来ないので、初期化はstaticなinit関数を使う
     * @param browser puppeteer.Browser
     * @param page puppteer.Page
     */
    private constructor(private browser: puppeteer.Browser, readonly page: puppeteer.Page) { }

    /**
     * 初期化関数
     * @param url string
     * @param options puppeteer.LaunchOptions
     */
    static async init(options: puppeteer.LaunchOptions): Promise<Puppetman> {
        // ブラウザを起動し、ページオブジェクトを取得する
        const browser = await puppeteer.launch(options);
        const page = (await browser.pages())[0];
        return new Puppetman(browser, page);
    }

    /**
     * ナビゲーターの指示に従い、目的ページまで遷移する
     * @param navigator NavigateAction[]
     */
    async execute(navigator: NavigateAction[], selector: string, script: (elements: Element[]) => any): Promise<any> {
        // ナビゲーターの設定通りに目的ページまで遷移する
        for (const navi of navigator) {
            await this[navi.type](navi.args);
        }
        return await this.page.$$eval(selector, script);
    }

    /**
     * クローズ処理
     */
    async close(): Promise<void> {
        if (this.page) {
            await this.page.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }

    /**
     * ページ遷移アクション
     * @param args NavigateArgs
     */
    private async goto(args: NavigateArgs): Promise<void> {
        this.page.goto(args.selector);
        if (args.waitTime) {
            await this.page.waitFor(args.waitTime);
        }
    }

    /**
     * クリックアクション
     * @param args NavigateArgs
     */
    private async click(args: NavigateArgs): Promise<void> {
        // 対象セレクタをクリック
        await this.page.click(args.selector)
            .catch(async() => {
                await this.page.waitFor(args.waitTime);
                await this.page.click(args.selector)
            });
        // 任意引数に従って待機処理を入れる
        if (args.waitSelector) {
            await this.page.waitForSelector(args.waitSelector);
        }
        if (args.waitTime) {
            await this.page.waitFor(args.waitTime);
        }
    }

    /**
     * 選択アクション
     * @param args NavigateArgs
     */
    private async select(args: NavigateArgs): Promise<void> {
        // 対象セレクタを選択
        await this.page.select(args.selector, args.value)
            .catch(async() => {
                await this.page.waitFor(args.waitTime);
                await this.page.click(args.selector)
            });
        // 任意引数に従って待機処理を入れる
        if (args.waitTime) {
            await this.page.waitFor(args.waitTime);
        }
    }

    /**
     * 入力アクション
     * @param args {NavigateArgs}
     */
    private async input(args: NavigateArgs): Promise<void> {
        // 入力欄に入力
        await this.page.type(args.selector, args.value);
        // 任意引数に従って待機処理を入れる
        if (args.waitTime) {
            await this.page.waitFor(args.waitTime);
        }
    }
};
