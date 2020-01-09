import 'reflect-metadata';

/** metadata key */
export const key = Symbol(decorator.name);

/**
 * decorator
 * @param primaryKeySet Set<string>
 */
export function decorator(value: { tableName: string, primaryKeySet: Set<string> }) {

    return (constructor: Function) => {
        // コンストラクタを実行し、インスタンスを取得
        let instance = {};
        constructor.apply(instance);
        console.log(instance);

        // メタデータを定義する
        Reflect.defineMetadata(key, { tableName: value.tableName, primaryKeySet: value.primaryKeySet }, constructor);
    }
}
