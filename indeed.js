/*

    "full stack developer" will become "full+stack+developer"
   "Detroit, MI" will become "Detroit%2C+MI"


*/

let HTMLParser = require("node-html-parser");

let getIndeedJobs = async (baseIndeedURL, position, location, minMatchCount, keys) => {
    console.log("---------------");
    // console.log(baseIndeedURL, position, location, minMatchCount, keys);

    let commaIdx = undefined;
    let encodedLocation = location;
    let encodedPosition = position;
    let encodedURL = undefined;
    let payload = undefined;
    let parsedPayload = undefined;
    let jobCardClassTitle = "css-5lfssm eu4oa1w0"; // this is the class name used for job cards
    let jobURLs = [];

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

    const response = await fetch(encodedURL);

    if (!response.ok) {
        console.error("error fetching job page!");
        console.log(response)
        return;
    }

    payload = await response.text();
    parsedPayload = HTMLParser.parse(payload);
    jobURLs = parsedPayload.getElementsByTagName("a");

    console.log(jobURLs);

    // TODO : Stopped here. About to fetch indeed URL data!
}

exports.getIndeedJobs = getIndeedJobs;