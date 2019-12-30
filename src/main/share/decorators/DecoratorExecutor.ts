import * as decorators from '#/share/decorators';

/**
 * デコレーター実行ベースクラス
 */
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
            // @ts-ignore
            const value = decorators.Format.execute(this, k, v);
            // @ts-ignore
            this[k] = decorators.CodeMapping.execute(this, k, value);
            decorators.Required.execute(this, k, v);
            decorators.ConditionRequired.execute(this, k, v);
        });
        return this;
    }
}
