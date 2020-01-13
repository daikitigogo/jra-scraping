export function camelToSnake(camel: string) {
    return camel.replace(/[A-Z0-9]/g, matched => '_' + matched.toLowerCase());
}

export function snakeToCamel(snake: string) {
    return snake.replace(/(_)(.)/g, (_1, _2, p2: string) => p2.toUpperCase());
}

export function pascalToSnake(pascal: string) {
    const camel = pascal.substr(0, 1).toLowerCase() + pascal.substr(1);
    return camelToSnake(camel);
}

/**
 * 時間文字列をmsに変換する
 * @param finishTime string
 */
export const timeStringToMilis = (finishTime: string) => {
    const arr = finishTime.split(':');
    if (arr.length < 2) {
        return Number(finishTime);
    }
    return (Number(arr[0]) * 60 + Number(arr[1])) * 1000;
};