import * as mariadb from 'mariadb';
import { ObjectUtil } from '#/share/utils/ObjectUtil';
import * as Entity from '#/share/decorators/Entity';
import { logger } from '#/logger';
import 'reflect-metadata';

/**
 * Write method response
 */
export interface WriteResponse {
    readonly affectedRows: number;
    readonly insertId: number;
    readonly warningStatus: number;
};

/**
 * Table information
 */
export interface TableInfo {
    /** table name */
    readonly tableName: string;
    /** primary key set */
    readonly primaryKeySet: Set<string>;
};

/**
 * Base repository.
 */
export class DataAccessBase {

    /**
     * SELECT.
     * @param conn mariadb.Connection
     * @param sql string
     * @param value? any
     * @returns Promise<T[]>
     */
    protected async select<C, R>(conn: mariadb.Connection, sql: string, value?: C): Promise<R[]> {
        return await conn.query({ namedPlaceholders: true, sql }, value)
            .then((rs: object[]) => rs.map(r => this.snakeObjToCamelObj(r)));
    }

    /**
     * INSERT, UPDATE, DELETE, etc...
     * @param conn mariadb.Connection
     * @param sql string
     * @param value? any
     * @returns Promise<WriteResponse>
     */
    protected async write(conn: mariadb.Connection, sql: string, value?: any): Promise<WriteResponse> {
        return await conn.query({ namedPlaceholders: true, sql }, value);
    }

    /**
     * Snake key object to camel key T.
     * @param obj object
     * @returns T
     */
    private snakeObjToCamelObj<T>(obj: object): T {
        return Object.entries(obj)
            .filter(([_, v]) => v)
            .reduce((a: object, [k, v]: [string, any]) => {
                const camelKey = ObjectUtil.snakeToCamel(k);
                Reflect.set(a, camelKey, v);
                return a;
            }, {}) as T;
    }
};

/**
 * Repository for plane entity.
 */
export class EntityRepository<T> extends DataAccessBase {

    /** Table base information */
    private readonly tableInfo: TableInfo; 

    /** Getter for tableName */
    tableName(): string {
        return this.tableInfo.tableName;
    }
    /** Getter for primaryKeySet */
    primaryKeySet(): Set<string> {
        return this.tableInfo.primaryKeySet;
    }

    /**
     * Constructor...
     * @param ctor { new(): T } T creator
     * @param option mariadb.QueryOptions
     */
    constructor(ctor: { new(): T }) {
        super();
        const entity = new ctor();
        this.tableInfo = Reflect.getMetadata(Entity.key, entity.constructor);
        Reflect.deleteMetadata(Entity.key, entity.constructor);
    }

    /**
     * Select all.
     * @param conn mariadb.Connection
     * @returns Promise<T[]>
     */
    async selectAll(conn: mariadb.Connection): Promise<T[]> {
        const sql = `SELECT * FROM ${this.tableInfo.tableName};`;
        logger.debug('Call selectAll. sql: ${sql}')
        const result = await super.select<any, T>(conn, sql);
        logger.debug(`End selectAll. result : ${result}`);
        return result;
    }

    /**
     * Select by primary key.
     * @param conn mariadb.Connection
     * @param primary P
     * @returns Promise<T>
     */
    async selectOne(conn: mariadb.Connection, primary: object): Promise<T> {
        const where = Array.from(this.tableInfo.primaryKeySet).map(p => `${ObjectUtil.camelToSnake(p)} = :${p}`).join(' AND ');
        const sql = `SELECT * FROM ${this.tableInfo.tableName} WHERE ${where};`;
        logger.debug(`Call selectOne. sql: ${sql}, value: ${JSON.stringify(primary)}`);
        const result = await super.select<object, T>(conn, sql, primary);
        logger.debug(`End selectOne. result: ${result}`);
        return result.find((_, i) => i == 0);
    }

    /**
     * Default insert.
     * @param conn mariadb.Connection
     * @param entity T
     * @returns Promise<WriteResponse>
     */
    async insert(conn: mariadb.Connection, entity: T): Promise<WriteResponse> {
        const sql = `INSERT INTO ${this.tableName()} (${Object.keys(entity).map(k => ObjectUtil.camelToSnake(k)).join(', ')}) VALUES (${Object.keys(entity).map(k => ':' + k).join(', ')})`;
        logger.debug(`Call insert. sql: ${sql}, entity: ${JSON.stringify(entity)}`);
        const result = await super.write(conn, sql, entity);
        logger.debug(`End insert. result: ${result}`);
        return result;
    }

    /**
     * Default update.
     * @param conn mariadb.Connection
     * @param entity T
     * @returns Promise<WriteResponse>
     */
    async update(conn: mariadb.Connection, entity: T): Promise<WriteResponse> {
        const noPrimary = Object.keys(entity).filter(k => !this.tableInfo.primaryKeySet.has(k));
        const updates = noPrimary.map(k => `${ObjectUtil.camelToSnake(k)} = :${k}`);
        const where = Array.from(this.tableInfo.primaryKeySet).map(p => `${ObjectUtil.camelToSnake(p)} = :${p}`);
        const sql = `UPDATE ${this.tableInfo.tableName} SET ${updates.join(', ')} WHERE ${where.join(' AND ')}`;
        logger.debug(`Call update. sql: ${sql}`);
        return await super.write(conn, sql, entity);
    }
}
