import { Connection } from 'mariadb';
import { logger } from '../../logger';
import * as fu from '../utility/function.utility';

/**
 * Write method response
 */
export interface WriteResponse {
    readonly affectedRows: number;
    readonly insertId: number;
    readonly warningStatus: number;
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
    protected async select<C, R>(conn: Connection, sql: string, value?: C): Promise<R[]> {
        logger.debug(`sql: ${sql}, value: ${JSON.stringify(value)}`);
        const result = await conn.query({ namedPlaceholders: true, sql }, value)
            .then((rs: object[]) => rs.map(r => this.snakeObjToCamelObj<R>(r)));
        logger.debug(`result: ${JSON.stringify(result)}`);
        return result;
    }

    /**
     * INSERT, UPDATE, DELETE, etc...
     * @param conn mariadb.Connection
     * @param sql string
     * @param value? any
     * @returns Promise<WriteResponse>
     */
    protected async write(conn: Connection, sql: string, value?: any): Promise<WriteResponse> {
        logger.debug(`sql: ${sql}, value: ${JSON.stringify(value)}`);
        const result = await conn.query({ namedPlaceholders: true, sql }, value);
        logger.debug(`result: ${JSON.stringify(result)}`);
        return result;
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
                const camelKey = fu.snakeToCamel(k);
                Reflect.set(a, camelKey, v);
                return a;
            }, {}) as T;
    }
};
