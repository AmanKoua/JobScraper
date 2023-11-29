/*

    Usage:
        "node index.js {ZipCode} {KeySet}"

        -zipcode : your zip code
        keySet: desired keyset
            Supported
                "fullstack"

*/

var HTMLParser = require("node-html-parser")

let minArgsLength = 4;
let jobsData = []; // Object {matchCount, matchMap}
let sortedJobsData = [];
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

    console.log(`getting jobs for ZIP : ${zipCode} of type : ${type}`);

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

    const response = await fetch(`${fullStackURL}${zipCode}`);
    const payload = await response.text();
    const parsedPayload = HTMLParser.parse(payload);
    const tableRows = parsedPayload.getElementsByTagName("tr");
    let jobURLs = [];

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

    let highestMatchCount = 0;

    for (let i = 0; i < jobURLs.length; i++) {

        let jobMatch = await getJobMatchCount(jobURLs[i]);

        highestMatchCount = Math.max(jobMatch.matchCount, highestMatchCount);

        jobsData.push(jobMatch);
    }

    // console.log(jobsData);
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

            if (!tempChildNodes[0]._rawText) {
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

    for (let i = 0; i < jobsData.length; i++) {
        highestMatchCount = Math.max(highestMatchCount, jobsData[i].matchCount);

        if (sortMap.get(jobsData[i].matchCount) == undefined) {
            sortMap.set(jobsData[i].matchCount, [jobsData[i]]);
        }
        else {
            sortMap.get(jobsData[i].matchCount).push(jobsData[i]);
        }
    }

    for (let i = highestMatchCount; i > -1; i--) {

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