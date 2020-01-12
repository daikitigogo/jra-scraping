import 'reflect-metadata';

/** Required */
export class Required {

    /** Metadata key */
    static key = Symbol(Required.name);

    /** Decorator */
    static decorator() {
        return Reflect.metadata(Required.key, true);
    }

    /**
     * Execute for Required decorator.
     * @param target Executor
     * @param prop string
     * @param value any
     */
    static validate(target: any, prop: string, value: any) {
        if (!Reflect.getMetadata(Required.key, target, prop)) return;
        if (!value) throw new Error(`${prop} is required! target: ${JSON.stringify(target)}`);
    }
}

/** ConditionRequiredArg */
interface ConditionRequiredArg {
    /** ConditionRequired target property name. */
    targetProp: string;
    /** If it's func return true, this value is required. */
    condFunc: (value: any) => boolean;
}

/** ConditionRequired */
export class ConditionRequired {

    /** Metadata key */
    static key = Symbol(ConditionRequired.name);

    /**
     * Decorator.
     * @param arg ConditionRequiredArg
     */
    static decorator(arg: ConditionRequiredArg) {
        return Reflect.metadata(ConditionRequired.key, arg);
    }

    /**
     * Execute for ConditionRequired decorator.
     * @param target Executor
     * @param prop string
     * @param value any
     */
    static validate(target: any, prop: string, value: any) {

        const metadata: ConditionRequiredArg = Reflect.getMetadata(ConditionRequired.key, target, prop);
        if (!metadata) return;

        if (!metadata.condFunc(Reflect.get(target, metadata.targetProp))) {
            return;
        }
        if (!value) {
            throw new Error(`${prop} is condition required! target: ${JSON.stringify(target, undefined, 2)}`);
        }
    }
}
