/*

    "full stack developer" will become "full+stack+developer"
   "Detroit, MI" will become "Detroit%2C+MI"


*/

let getIndeedJobs = async (baseIndeedURL, position, location, minMatchCount, keys) => {
    console.log("---------------");
    // console.log(baseIndeedURL, position, location, minMatchCount, keys);

    let commaIdx = undefined;
    let encodedLocation = location;
    let encodedPosition = position;
    let encodedURL = undefined;

    commaIdx = encodedLocation.indexOf(",");

    if (commaIdx != -1) {
        // encodedLocation = encodedLocation.substring(0, commaIdx + 1) + " " + encodedLocation.substring(commaIdx + 1, encodedLocation.length);
    }
    else {
        console.error("Indeed location does not include a comma. Invalid location!");
        return;
    }

    encodedLocation = encodedLocation.replaceAll(",", "%2C+");
    encodedPosition = encodedPosition.replaceAll("-", "+");
    encodedURL = `${baseIndeedURL}?q=${encodedPosition}&l=${encodedLocation}`;

    console.log(encodedURL);
}

exports.getIndeedJobs = getIndeedJobs;