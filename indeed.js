/*

   "Detroit, MI" will become "Detroit%2C%20MI"


*/

let getIndeedJobs = async (baseIndeedURL, position, location, minMatchCount, keys) => {
    console.log("---------------");
    // console.log(baseIndeedURL, position, location, minMatchCount, keys);

    let encodedLocation = encodeURI(location);

    console.log(encodedLocation);

}

exports.getIndeedJobs = getIndeedJobs;