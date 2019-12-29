import 'reflect-metadata';
import { logger } from '#/logger';

/**
 * 必須項目アノテーション
 */
export class Required {

    /** metadata保存キー */
    static key = Symbol(Required.name);
    /** アノテーション */
    static annotation() {
        return Reflect.metadata(Required.key, true);
    }
    /**
     * 必須バリデーション実行
     * @param target {any} this AnnotationExecutor継承インスタンス 
     * @param prop {string} プロパティ名称
     */
    static execute(target: any, prop: string, value: any) {
        if (!Reflect.getMetadata(Required.key, target, prop)) return;
        logger.debug(`required execute. property-name: ${prop}, property-value: ${JSON.stringify(value)}`);
        if (!value) throw new Error(`${prop} is required! target: ${JSON.stringify(target)}`);
    }
}
/**
 * フォーマット変換アノテーション引数
 */
interface FormatArg {
    regexp: string;
    replace?: string;
}

/**
 * フォーマット変換アノテーション
 */
export class Format {
    /** metadata保存キー */
    static key = Symbol(Format.name);
    /**
     * 正規表現で指定した対象を第２引数の値に置換する(置換値を省略した場合は除去する)
     * @param replaceTarget {string} 置換対象(正規表現)
     * @param replaceValue {string} 置換値
     */
    static annotation(...formats: FormatArg[]) {
        return Reflect.metadata(Format.key, JSON.stringify(formats));
    }
    /**
     * フォーマット変換アノテーション実行
     * @param target {any} this AnnotationExecutor継承インスタンス 
     * @param prop {string} プロパティ名称
     */
    static execute(target: any, prop: string, value: any) {
        const json: string = Reflect.getMetadata(Format.key, target, prop);
        if (!json) return value;
        const result: string = value;
        logger.debug(`format execute. property-name: ${prop}, property-value: ${JSON.stringify(result)}`);
        logger.debug(`format: ${json}`);
        const formats: FormatArg[] = JSON.parse(json);
        return formats.reduce((a, f) => {
            const regexp = new RegExp(f.regexp, 'g');
            return a.replace(regexp, f.replace || '');
        }, result);
    }
}

/**
 * 条件付き必須アノテーション
 */
export class ConditionRequired {
    /** metadata保存キー */
    static key = Symbol(ConditionRequired.name);
    /**
     * 
     * @param targetProp {string} 条件対象プロパティ名称
     * @param conditionValue {string} 比較条件
     * @param bool {boolean} 比較真偽値
     */
    static annotation(targetProp: string, conditionValue: string, bool: boolean) {
        return Reflect.metadata(ConditionRequired.key, JSON.stringify({targetProp, conditionValue, bool}));
    }
    /**
     * フォーマット変換アノテーション実行
     * @param target {any} this AnnotationExecutor継承インスタンス 
     * @param prop {string} プロパティ名称
     */
    static execute(target: any, prop: string, value: any) {
        const json: string = Reflect.getMetadata(ConditionRequired.key, target, prop);
        if (!json) return;
        logger.debug(`condition required execute. property-name: ${prop}, property-value: ${JSON.stringify(value)}`);
        logger.debug(`cond: ${json}`);
        const cond = JSON.parse(json);
        if (cond.bool) {
            if (target[cond.targetProp] == cond.conditionValue && !value) {
                throw new Error(`${prop} is condition required! ${json}`);
            }
        } else {
            if (target[cond.targetProp] != cond.conditionValue && !value) {
                throw new Error(`${prop} is condition required! ${json}`);
            }
        }
    }
}

/**
 * Validator base
 */
export class AnnotationExecutor {
    
    annotate() {
        Object.entries(this).forEach(([k, v]) => {
            if (v instanceof AnnotationExecutor) {
                v.annotate();
            }
            if (v instanceof Array) {
                v.forEach(x => (x instanceof AnnotationExecutor) && x.annotate());
            }
            // @ts-ignore
            this[k] = Format.execute(this, k, v);
            Required.execute(this, k, v);
            ConditionRequired.execute(this, k, v);
        });
        return this;
    }
}

// class Test extends AnnotationExecutor {

//     constructor(obj: any) {
//         super();
//         Object.entries(obj).forEach(([k, v]) => {
//             this[k] = v;
//         });
//     }

//     @Required.annotation()
//     @Format.annotation('[^0-9]')
//     prop1: string;
//     @Format.annotation('\\(.+\\)')
//     prop2: string;
//     @ConditionRequired.annotation('prop1', '1000', false)
//     prop3: string;
// }

// const test = {prop1: 'a10a00a', prop2: '540(+10)', prop3: ''}
// const test2 = new Test(test);
// console.log(test2);
// console.log(test2.annotate());
