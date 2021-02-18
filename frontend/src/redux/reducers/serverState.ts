// this reducer will read in all posts and gets to server
// and will also look at any add or modify request to store
// and mark status as dirty

// initial statuses: INITIAL && login=false

// login succeeded with store changes ? SYNCED && set login to true
// login failed or logout ? set login to false
// info request failed ? FETCH_ERROR
// during some fetch request from store ? FETCHING
// update request fail ? UPDATE_ERROR
// during some update request to store ? UPDATING
// an action has changed store values and server hasn't been updated ? NOT_SYNCED

export {};