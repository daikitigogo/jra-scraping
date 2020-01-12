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
