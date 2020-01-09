import 'reflect-metadata';

export abstract class DecoratorExecutor {
    
    /**
     * デコレーター実行処理
     */
    decorate() {
        Object.entries(this).forEach(([k, v]) => {
            if (v instanceof DecoratorExecutor) {
                v.decorate();
            }
            if (v instanceof Array) {
                v.forEach(x => (x instanceof DecoratorExecutor) && x.decorate());
            }
            const value = Format.execute(this, k, v);
            Reflect.set(this, k, CodeMapping.execute(this, k, value));
            Required.execute(this, k, v);
            ConditionRequired.execute(this, k, v);
        });
        return this;
    }
}

export class Required {

    /** metadata保存キー */
    static key = Symbol(Required.name);

    /** デコレーター */
    static decorator() {
        return Reflect.metadata(Required.key, true);
    }

    /**
     * デコレーター実行処理
     * @param target {DecoratorExecutor}
     * @param prop {string} プロパティ名称
     * @param value {any} プロパティ値
     */
    static execute(target: DecoratorExecutor, prop: string, value: any) {
        if (!Reflect.getMetadata(Required.key, target, prop)) return;
        if (!value) throw new Error(`${prop} is required! target: ${JSON.stringify(target)}`);
    }
}

interface ConditionRequiredArg {
    /** 必須条件対象プロパティ */
    targetProp: string;
    /** 必須条件 */
    condFunc: (value: any) => boolean;
}

/**
 * 条件付き必須デコレーター
 */
export class ConditionRequired {

    /** metadata保存キー */
    static key = Symbol(ConditionRequired.name);

    /**
     * デコレーター
     * @param targetProp {string} 条件対象プロパティ名称
     * @param conditionValue {string} 比較条件
     * @param bool {boolean} 比較真偽値
     */
    static decorator(arg: ConditionRequiredArg) {
        return Reflect.metadata(ConditionRequired.key, arg);
    }

    /**
     * デコレーター実行処理
     * @param target {DecoratorExecutor}
     * @param prop {string} プロパティ名称
     * @param value {any} プロパティ値
     */
    static execute(target: DecoratorExecutor, prop: string, value: any) {

        // メタデータを取得
        const metadata: ConditionRequiredArg = Reflect.getMetadata(ConditionRequired.key, target, prop);
        if (!metadata) return;

        // @ts-ignore
        if (!metadata.condFunc(target[metadata.targetProp])) {
            return;
        }
        if (!value) {
            throw new Error(`${prop} is condition required! target: ${JSON.stringify(target, undefined, 2)}`);
        }
    }
}

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

interface CodeMappingArg {
    /** コードID */
    codeId: string;
    /** コード文言 */
    codeValue: string;
}

/**
 * コードマッピングデコレーター
 */
export class CodeMapping {

    /** metadata保存キー */
    static key = Symbol(CodeMapping.name);

    /** デコレーター */
    static decorator(args: CodeMappingArg[]) {
        return Reflect.metadata(CodeMapping.key, args);
    }

    /**
     * デコレーター実行処理
     * @param target {DecoratorExecutor}
     * @param prop {string} プロパティ名称
     * @param value {any} プロパティ値
     */
    static execute(target: DecoratorExecutor, prop: string, value: any) {

        // デコレーターを取得、デコレーターが設定されていなければ何もしない
        const metadata: CodeMappingArg[] = Reflect.getMetadata(CodeMapping.key, target, prop);
        if (!metadata || !value) return value;

        const result = metadata.find(x => x.codeId == value);
        if (!result) {
            throw new Error(`Not found! ${prop}'s code mapping. value: ${value}`);
        }
        return result;
    }
}
