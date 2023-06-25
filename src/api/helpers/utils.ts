import { PAGINATION_LIMIT } from "../../config/const";

export function dateFormater(date: Date) {
    const newDate = date.toISOString().split('.')[0].replace('T', ' ');
    return newDate;
}

export function pagination(paginationParams) {
    const page = paginationParams.page;
    if(!page || isNaN(page) || page <= 0) return { start: 0, end: PAGINATION_LIMIT};
    const paginationInfo = {
        start: PAGINATION_LIMIT * (page - 1),
        end: PAGINATION_LIMIT * page
    };
    return paginationInfo;
}

export function injectionsController(params: any[]) {
    const newParams: any = [];
    params.forEach(e => {
        if (typeof e === "string"){
            let str: any = e;
            str = str.replace(/'/g, "");
            newParams.push(str);
        } else {
            newParams.push(e);
        }
    })
    return newParams;
}
