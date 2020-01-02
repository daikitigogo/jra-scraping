import 'reflect-metadata';
import { DecoratorExecutor } from '#/share/decorators/DecoratorExecutor';

/**
 * 必須項目デコレーター
 */
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
