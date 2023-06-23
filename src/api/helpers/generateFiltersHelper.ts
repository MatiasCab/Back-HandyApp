function statusFilter(param){
    if(param == 'resolved') return 'RESOLVED';
    return 'OPEN';
}

function nameFilter(param){
    if(!param) return '';
    return param;
}

function skillsFilter(param){
    if(!param) return [];
    return param;
}

function creatorFilter(param){
    if(param == 'friends' ) return 'friends';
    return 'all';
}

export function generateFilters(queryFilters, actualUserId?, _otherUserId?) {
    const filtersList = new Map();
    filtersList.set('actualUserId', actualUserId);

    filtersList.set('status', statusFilter(queryFilters.status));
    filtersList.set('name', nameFilter(queryFilters.name));
    filtersList.set('skills', skillsFilter(queryFilters.skills));
    filtersList.set('creator', creatorFilter(queryFilters.creator));

console.log(filtersList);
    return filtersList;
}

