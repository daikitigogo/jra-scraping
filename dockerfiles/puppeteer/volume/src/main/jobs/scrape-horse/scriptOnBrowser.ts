/**
 * 検索結果の競走馬名一覧を取得する
 * @param elements Element[]
 */
export const takeHorseList = (elements: Element[]) => {
    return elements.map(e => {
        return {
            horseName: e.textContent.trim().toString(),
            horseAge: e.parentNode.parentNode.children[1].textContent.trim().toString().replace(/[^0-9]/g, ''),
            onclick: e.getAttribute('onclick')
        };
    });
};

/**
 * 父・母父を抜き出す
 * @param element Element
 */
export const takeDadInfo = (element: Element) => {
    return {
        dadHorseName: element.children[1].children[1].textContent.trim(),
        secondDadHorseName: element.children[3].children[1].textContent.trim()
    };
};

