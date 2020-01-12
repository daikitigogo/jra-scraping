import { Connection } from 'mariadb';
import * as fu from '#/share/utility/function.utility';

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
    protected async write(conn: Connection, sql: string, value?: any): Promise<WriteResponse> {
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
                const camelKey = fu.snakeToCamel(k);
                Reflect.set(a, camelKey, v);
                return a;
            }, {}) as T;
    }
};
