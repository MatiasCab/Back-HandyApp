
export function generateProblemsOrder(queryOrder) {
    if(!queryOrder.order) return;

    if(queryOrder.order == 'newest') return queryOrder.order;
    if(queryOrder.order == 'lastest') return queryOrder.order;
    if(queryOrder.order == 'nearby') return queryOrder.order;
    return;
}