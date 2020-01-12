import 'reflect-metadata';

/** Entity */
export class Entity {

    /** Metadata key */
    static readonly key = Symbol(Entity.name);

    /** Decorator */
    static decorator(primaryKeySet: Set<string>) {
        return (constructor: Function) => {
            Reflect.defineMetadata(Entity.key, { tableName: constructor.name, primaryKeySet: primaryKeySet }, constructor);
        }
    }
}
