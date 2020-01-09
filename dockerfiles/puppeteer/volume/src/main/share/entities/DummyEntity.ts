import { BaseEntity } from './BaseEntity';

/**
 * Dummy Entity
 */
export class DummyEntity implements BaseEntity {
    readonly tableName: string = null;
    readonly primaryKeySet: Set<string> = null;
}