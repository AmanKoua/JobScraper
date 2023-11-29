let HTMLParser = require("node-html-parser");

exports.getOnetJobs = async (fullStackOnetURL, zipCode, baseOnetURL, keys, jobsData) => {

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
        response = await fetch(`${fullStackOnetURL}${zipCode}&p=${pageIdx}`);

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
        let jobURL = `${baseOnetURL}${rawAttr.substring(6, rawAttr.length - 1)}`;
        jobURLs.push(jobURL);
    }

    if (jobURLs.length == 0) {
        console.error("No jobs were found!");
    }

    console.log(`${jobURLs.length} job URLs extracted!`);

    let highestMatchCount = 0;

    console.log(`getting job match count for all jobs!`);

    for (let i = 0; i < jobURLs.length; i++) {

        let jobMatch = await getOnetJobMatchCount(jobURLs[i], keys);
        highestMatchCount = Math.max(jobMatch.matchCount, highestMatchCount);
        jobsData.push(jobMatch);
    }

};

let getOnetJobMatchCount = async (jobURL, keys) => {

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

exports.getOnetJobMatchCount = getOnetJobMatchCount;