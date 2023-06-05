export function transformSearchInfo(searchInfo) {
    if (!searchInfo) return undefined;;
    return searchInfo.trim().replace(/ /g, '|');
}

export function dateFormater(date: Date) {
    const newDate = date.toISOString().split('.')[0].replace('T', ' ');
    return newDate;
}