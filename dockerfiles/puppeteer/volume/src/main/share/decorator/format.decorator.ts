import 'reflect-metadata';

/** FormatArg */
interface FormatArg {
    /** Regexp for replace target. */
    regexp: string;
    /** Replace value. */
    replace?: string;
}

/** Format */
export class Format {

    /** Metadata key */
    static key = Symbol(Format.name);

    /**
     * Decorator
     * @param foramts FormatArg[]
     */
    static decorator(...formats: FormatArg[]) {
        return Reflect.metadata(Format.key, formats);
    }

    /**
     * Execute for Format decorator.
     * @param target DecoratorExecutor
     * @param prop string
     * @param value any
     */
    static format(target: any, prop: string, value: any) {

        const metadata: FormatArg[] = Reflect.getMetadata(Format.key, target, prop);
        if (!metadata) return value;

        return metadata.reduce((a, c) => {
            const regexp = new RegExp(c.regexp, 'g');
            return a.replace(regexp, c.replace || '');
        }, value);
    }
}

/** CodeMappingArg */
interface CodeMappingArg {
    codeId: string;
    codeValue: string;
}

/** CodeMapping */
export class CodeMapping {

    /** Metadata key */
    static key = Symbol(CodeMapping.name);

    /**
     * Decorator
     * @param args CodeMappingArg[]
     */
    static decorator(args: CodeMappingArg[]) {
        return Reflect.metadata(CodeMapping.key, args);
    }

    /**
     * Execute for CodeMapping decorator.
     * @param target DecoratorExecutor
     * @param prop string
     * @param value any
     */
    static format(target: any, prop: string, value: any) {

        const metadata: CodeMappingArg[] = Reflect.getMetadata(CodeMapping.key, target, prop);
        if (!metadata || !value) return value;

        const result = metadata.find(x => x.codeId == value);
        if (!result) {
            throw new Error(`Not found! ${prop}'s code mapping. value: ${value}`);
        }
        return result;
    }
}