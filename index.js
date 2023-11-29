/*

    Usage:
        format : node index.js {ZipCode} {KeySet} {minMatchCount (optional)}
        examples :
             node index.js 48323 fullstack
            node index.js 48323 fullstack 15

        -zipcode : your zip code
        -keySet: desired keyset
            Supported
                "fullstack"

*/

var HTMLParser = require("node-html-parser")

let minArgsLength = 4;
let minMatchCount = undefined;
let jobsData = []; // Object {matchCount, matchMap}
let sortedJobsData = [];
// https://www.onetonline.org/link/localjobs/15-1254.00?zip={zipCode}&p={page}
let baseURL = "https://www.onetonline.org";
let fullStackURL = "https://www.onetonline.org/link/localjobs/15-1254.00?zip="; // add zip at the end
let keys = undefined;
let fullStackKeys = [
    "full stack",
    "full-stack",
    "web dev",
    "react",
    "mongodb",
    "jenkins",
    "html",
    "css",
    "javascript",
    "express",
    "node",
    "nodejs",
    "node js",
    "java",
    "spring",
    "spring boot",
    "REST",
    "REST API",
    "frontend",
    "backend",
    "c++",
    "python",
    "tdd",
    "test driven",
    "test-driven-development",
    "agile",
    "scrum",
    "unit",
    "integration",
    "cloud",
    "google cloud platform",
    "gcp",
    "AWS",
    "amazon web services",
    "github",
    "git",
    "UML",
    "mobile",
    "mobile dev",
    "dart",
    "flutter",
    "react native",
    "react-native",
];

let main = async () => {

    if (process.argv.length < minArgsLength) {
        console.log("Please enter the appropriate number of command line arguments!");
        return;
    }

    let zipCode;
    let type;

    zipCode = process.argv[2];
    type = process.argv[3];

    if (process.argv.length > 4) {
        minMatchCount = process.argv[4];
    }

    if (minMatchCount != undefined) {
        console.log(`getting jobs for ZIP : ${zipCode} of type : ${type} with min match count: ${minMatchCount}`);
    }
    else {
        console.log(`getting jobs for ZIP : ${zipCode} of type : ${type}`);
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

    console.log("fetching data, please wait!");

    let response = undefined;
    let payload = undefined;
    let parsedPayload = undefined;
    let tempTableRows = undefined;
    let tableRows = [];
    let isPageValid = true;
    let pageIdx = 1;
    let jobURLs = [];

    while (isPageValid) {

        console.log(`fetching page ${pageIdx} ...`);
        response = await fetch(`${fullStackURL}${zipCode}&p=${pageIdx}`);

        if (!response.ok) {
            console.error("error fetching job page!");
            return;
        }

        payload = await response.text();
        parsedPayload = HTMLParser.parse(payload);
        tempTableRows = parsedPayload.getElementsByTagName("tr");

        // console.log(tempTableRows.length, pageIdx);

        if (tempTableRows.length == 0) {
            // console.log(pageIdx + " EMPTY!");
            isPageValid = false;
            break;
        }

        for (let i = 0; i < tempTableRows.length; i++) {
            tableRows.push(tempTableRows[i]);
        }

        pageIdx++;

    }

    if (tableRows.length == 0) {
        console.error("Error getting table rows!");
        return;
    }

    for (let i = 0; i < tableRows.length; i++) {

        if (!tableRows[i] || !tableRows[i].childNodes[1] || !tableRows[i].childNodes[1].childNodes[0] || !tableRows[i].childNodes[1].childNodes[0].rawAttrs) {
            continue;
        }

        let rawAttr = tableRows[i].childNodes[1].childNodes[0].rawAttrs.split(" ")[0];
        let jobURL = `${baseURL}${rawAttr.substring(6, rawAttr.length - 1)}`;
        jobURLs.push(jobURL);
    }

    if (jobURLs.length == 0) {
        console.error("No jobs were found!");
    }

    console.log(`${jobURLs.length} job URLs extracted!`);

    let highestMatchCount = 0;

    console.log(`getting job match count for all jobs!`);

    for (let i = 0; i < jobURLs.length; i++) {

        let jobMatch = await getJobMatchCount(jobURLs[i]);
        highestMatchCount = Math.max(jobMatch.matchCount, highestMatchCount);
        jobsData.push(jobMatch);
    }

    console.log(`Sorting job data by match count!`);

    sortJobsData();
    console.log(sortedJobsData);
}

let getJobMatchCount = async (jobURL) => {

    if (!keys) {
        return;
    }

    let matchCount = 0;
    let matchMap = new Map();

    const response = await fetch(`${jobURL}`);

    if (!response.ok) {
        console.log("Error fetching specific job!");
    }

    const payload = await response.text();
    const parsedPayload = HTMLParser.parse(payload);
    const paragraphs = parsedPayload.getElementsByTagName("p");

    for (let i = 0; i < paragraphs.length; i++) {

        if (paragraphs[i].childNodes.length == 0) {
            continue;
        }

        let tempChildNodes = paragraphs[i].childNodes;

        for (let j = 0; j < tempChildNodes.length; j++) {

            if (!tempChildNodes[0]._rawText || tempChildNodes[0]._rawText.length < 8) {
                continue;
            }
            else {

                for (let k = 0; k < keys.length; k++) {
                    if (tempChildNodes[0]._rawText.toLowerCase().includes(keys[k])) {

                        let keyMatchValue = undefined;

                        if (matchMap.get(keys[k]) != undefined) {
                            keyMatchValue = matchMap.get(keys[k]);
                        }

                        if (keyMatchValue == undefined) {
                            matchMap.set(keys[k], 1);
                        }
                        else {
                            matchMap.set(keys[k], keyMatchValue + 1);
                        }

                        matchCount++;
                    }
                }

                // console.log(console.log(tempChildNodes[0]._rawText));
            }

        }

    }

    let jobData = {
        matchCount,
        matchMap,
        jobURL
    };

    return jobData;

};

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