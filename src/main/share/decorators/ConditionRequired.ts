import 'reflect-metadata';
import { DecoratorExecutor } from '#/share/decorators/DecoratorExecutor';

/**
 * 条件付き必須デコレーター引数
 */
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
