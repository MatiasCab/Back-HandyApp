function statusFilter(param){
    if(param == 'resolved') return 'CLOSED';
    if(param == 'pendent') return 'OPEN';
    return 'all';
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
    if(param == 'pendent' ) return 'pendent';
    if(param == 'stranger' ) return 'stranger';
    return 'all';
}

export function generateProblemsFilters(queryFilters, actualUserId?) {
    const filtersList = new Map();
    filtersList.set('actualUserId', actualUserId);

    filtersList.set('status', statusFilter(queryFilters.status));
    filtersList.set('name', nameFilter(queryFilters.name));
    filtersList.set('skills', skillsFilter(queryFilters.skills));
    filtersList.set('creator', creatorFilter(queryFilters.creator));

    return filtersList;
}

export function generateUsersFilters(queryFilters, actualUserId?) {
    const filtersList = new Map();
    filtersList.set('actualUserId', actualUserId);

    filtersList.set('name', nameFilter(queryFilters.name));
    filtersList.set('skills', skillsFilter(queryFilters.skills));
    filtersList.set('relationship', creatorFilter(queryFilters.relationship));

    return filtersList;
}

