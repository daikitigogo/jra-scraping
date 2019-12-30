import 'reflect-metadata';
import { DecoratorExecutor } from '#/share/decorators/DecoratorExecutor';

/**
 * フォーマット変換デコレーター引数
 */
interface FormatArg {
    /** 置換対象(正規表現) */
    regexp: string;
    /** 置換後の値(省略時は空文字) */
    replace?: string;
}

/**
 * フォーマット変換デコレーター
 */
export class Format {

    /** metadata保存キー */
    static key = Symbol(Format.name);

    /**
     * デコレーター
     * @param foramts {FormatArg[]}
     */
    static decorator(...formats: FormatArg[]) {
        return Reflect.metadata(Format.key, formats);
    }

    /**
     * デコレーター実行処理
     * @param target {DecoratorExecutor}
     * @param prop {string} プロパティ名称
     * @param value {any} プロパティ値
     */
    static execute(target: DecoratorExecutor, prop: string, value: any) {

        // デコレーターを取得、デコレーターが設定されていなければ何もしない
        const metadata: FormatArg[] = Reflect.getMetadata(Format.key, target, prop);
        if (!metadata) return value;

        return metadata.reduce((a, c) => {
            const regexp = new RegExp(c.regexp, 'g');
            return a.replace(regexp, c.replace || '');
        }, value);
    }
}
