export class ObjectUtil {

    private constructor() { }

    static setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
        obj[key] = value;
    }

    static getProperty<T, K extends keyof T>(obj: T, key: K) {
        return obj[key];
    }

    static getPropertyType<T, K extends keyof T>(obj: T, key: K) {
        return typeof obj[key];
    }

    static camelToSnake(camel: string) {
        return camel.replace(/[A-Z0-9]/g, matched => '_' + matched.toLowerCase());
    }

    static snakeToCamel(snake: string) {
        return snake.replace(/(_)(.)/g, (_1, _2, p2: string) => p2.toUpperCase());
    }
};
