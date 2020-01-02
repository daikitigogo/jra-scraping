import 'reflect-metadata';
import { DecoratorExecutor } from './DecoratorExecutor';

/**
 * コードマッピングデコレーター引数
 */
interface CodeMappingArg {
    /** コードマッピング定義 */
    mappings: {
        /** コードID */
        codeId: string;
        /** コード文言 */
        codeValue: string;
    }[];
    /** マッピング方向(1:ID→文言, 2:文言→ID) (default=2) */
    mappingWay?: string;
}

/**
 * コードマッピングデコレーター
 */
export class CodeMapping {

    /** metadata保存キー */
    static key = Symbol(CodeMapping.name);

    /** デコレーター */
    static decorator(arg: CodeMappingArg) {
        return Reflect.metadata(CodeMapping.key, arg);
    }

    /**
     * デコレーター実行処理
     * @param target {DecoratorExecutor}
     * @param prop {string} プロパティ名称
     * @param value {any} プロパティ値
     */
    static execute(target: DecoratorExecutor, prop: string, value: any) {

        // デコレーターを取得、デコレーターが設定されていなければ何もしない
        const metadata: CodeMappingArg = Reflect.getMetadata(CodeMapping.key, target, prop);
        if (!metadata || !value) return value;

        const mappingWay = metadata.mappingWay || '2';
        const result = mappingWay == '1'
            ? metadata.mappings.find(x => x.codeId == value)
            : metadata.mappings.find(x => x.codeValue == value);
        if (!result) {
            throw new Error(`Not found! ${prop}'s code mapping. value: ${value}`);
        }
        return mappingWay == '1' ? result.codeValue : result.codeId;
    }
}