const {
    Aborter,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    SharedKeyCredential,
    StorageURL,
    uploadStreamToBlockBlob,
    uploadFileToBlockBlob
} = require('@azure/storage-blob');

const fs = require("fs");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_NAME;

const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
const ONE_MINUTE = 60 * 1000;

async function showContainerNames(aborter, serviceURL) {

    let response;
    let marker;

    do {
        response = await serviceURL.listContainersSegment(aborter, marker);
        marker = response.marker;
        for(let container of response.containerItems) {
            console.log(` - ${ container.name } ✓`);
        }
    } while (marker);
}

async function execute() {

    const containerName = "test";

    const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);

    const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
    const aborter = Aborter.timeout(30 * ONE_MINUTE);

    console.log("Kinton test just started!\n");

    console.log("Let me list all your containers:");
    await showContainerNames(aborter, serviceURL);

    console.log(`\nLet's create a new ${containerName} container`)
    await containerURL.create(aborter);
    console.log(` - Container: "${containerName}" was created ✓`);

    console.log(`\nLet's remove your ${containerName} container`);
    await containerURL.delete(aborter);
    console.log(` - Container "${containerName}" was deleted ✓`);
}

execute().then(() => console.log("\nAll done ")).catch((e) => console.log(e));
