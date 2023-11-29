/*

    NEW

    Usage:
        format : 
            node index.js onet {ZipCode} {KeySet} {minMatchCount (optional)}
            node index.js indeed {position} {location} {{minMatchCount (optional)}}

        examples :
            node index.js onet 82801 fullstack
            node index.js onet 82801 fullstack 15
            node index.js indeed {position} {location} {{minMatchCount (optional)}}


        -zipcode : your zip code
        -keySet: desired keyset
            Supported
                "fullstack"

*/

let HTMLParser = require("node-html-parser");
let onet = require("./onet.js");
let JobKeys = require("./jobKeys.js");

let baseOnetURL = "https://www.onetonline.org";
let fullStackOnetURL = "https://www.onetonline.org/link/localjobs/15-1254.00?zip="; // add zip at the end. "15-1254" represents the web developer job category
// let indeedCustomURL = "https://www.indeed.com/jobs"; // https://www.indeed.com/jobs?q=full++stack+developer&l=Detroit%2C+MI&from=searchOnHP&vjk=ba632b886e162fbe

let supportedSites = ["onet", "indeed"];
let zipCode = undefined;
let type = undefined;
let site = undefined;
let position = undefined;
let location = undefined;
let minArgsLength = 5;
let minMatchCount = undefined;

let keys = undefined;
let fullStackKeys = JobKeys.fullStackKeys;

let jobsData = []; // Object {matchCount, matchMap}
let sortedJobsData = [];

let main = async () => {

    if (process.argv.length < minArgsLength) {
        console.log("Please enter the appropriate number of command line arguments!");
        return;
    }

    if (!supportedSites.includes(process.argv[2])) {
        console.error(`Site ${process.argv[2]} is not supported!`);
        return;
    }
    else {
        site = process.argv[2];
    }

    switch (site) {
        case "onet":
            zipCode = process.argv[3];
            type = process.argv[4];
            break;
        case "indeed":
            position = process.argv[3];
            location = process.argv[4];
            break;
    }

    if (process.argv.length > 4) {
        minMatchCount = process.argv[5];
    }

    if (site == "onet") {
        console.log(site, zipCode, type, minMatchCount);
    }
    else if (site == "indeed") {
        console.log(site, location, position, minMatchCount);
    }

    switch (type) {
        case "fullstack":
            keys = fullStackKeys;
            break;
        default:
            console.log("Error, unsupported type!");
            return;
            break;
    }

    if (site == "onet") {
        if (minMatchCount != undefined) {
            console.log(`getting jobs for ZIP : ${zipCode} of type : ${type} with min match count: ${minMatchCount}`);
        }
        else {
            console.log(`getting jobs for ZIP : ${zipCode} of type : ${type}`);
        }
    }
    else if (site == "indeed") {
        if (minMatchCount != undefined) {
            console.log(`getting jobs for location : ${location} of type : ${type} with min match count: ${minMatchCount}`);
        }
        else {
            console.log(`getting jobs for location : ${location} of type : ${type}`);
        }
    }

    console.log("fetching data, please wait!");

    // testing

    switch (site) {
        case "onet":
            await onet.getOnetJobs(fullStackOnetURL, zipCode, baseOnetURL, keys, jobsData);
            break;
        default:
            console.error("An unknown error has occurend. Invalid site type!");
            return;
            break;
    }

    console.log(`Sorting job data by match count!`);
    sortJobsData();
    console.log(sortedJobsData);
}

let sortJobsData = () => {

    let sortMap = new Map(); // matchCount, array of jobData objects
    let highestMatchCount = 0;
    let matchCountBoundary = minMatchCount == undefined ? -1 : minMatchCount - 1;

    for (let i = 0; i < jobsData.length; i++) {

        if (minMatchCount != undefined) {
            if (jobsData[i].matchCount < minMatchCount) {
                continue;
            }
        }

        highestMatchCount = Math.max(highestMatchCount, jobsData[i].matchCount);

        if (sortMap.get(jobsData[i].matchCount) == undefined) {
            sortMap.set(jobsData[i].matchCount, [jobsData[i]]);
        }
        else {
            sortMap.get(jobsData[i].matchCount).push(jobsData[i]);
        }
    }

    for (let i = highestMatchCount; i > matchCountBoundary; i--) {

        if (sortMap.get(i) == undefined) {
            continue;
        }
        else {

            let tempArr = sortMap.get(i);

            for (let j = 0; j < tempArr.length; j++) {
                sortedJobsData.push(tempArr[j]);
            }

        }

    }

}

main();