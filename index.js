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

async function uploadLocalFile(aborter, containerURL, filePath) {

    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath);
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);

    return await uploadFileToBlockBlob(aborter, filePath, blockBlobURL);
}

async function showBlobNames(aborter, containerURL) {

    let response;
    let marker;

    do {
        response = await containerURL.listBlobFlatSegment(aborter);
        marker = response.marker;
        for(let blob of response.segment.blobItems) {
            console.log(` - ${ blob.name }`);
        }
    } while (marker);
}

async function execute() {

    const containerTestName = "test";
    const containerPrivateName = "private";
    const containerPublicName = 'public';
    const localFilePath = "./picture.jpg";

    const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);

    const containerTestURL = ContainerURL.fromServiceURL(serviceURL, containerTestName);
    const containerPrivateURL = ContainerURL.fromServiceURL(serviceURL, containerPrivateName);
    const containerPublicURL = ContainerURL.fromServiceURL(serviceURL, containerPublicName);

    const aborter = Aborter.timeout(30 * ONE_MINUTE);

    console.log("Kinton test just started!\n");

    console.log("Let me list all your containers:");
    await showContainerNames(aborter, serviceURL);

    console.log(`\nLet's create a new ${containerTestName} container`)
    await containerTestURL.create(aborter);
    console.log(` - Container: "${containerTestName}" was created ✓`);

    console.log(`\nLet's remove your ${containerTestName} container`);
    await containerTestURL.delete(aborter);
    console.log(` - Container "${containerTestName}" was deleted ✓`);

    console.log(`\nLet's upload a local file: ${localFilePath} to your private container`);
    await uploadLocalFile(aborter, containerPrivateURL, localFilePath);
    console.log(` - Local file "${localFilePath}" was uploaded to your private container ✓`);

    console.log(`\nLet's list all the files in "${containerPrivateName}" container:`);
    await showBlobNames(aborter, containerPrivateURL);

    console.log(`\nLet's upload a local file: ${localFilePath} to your public container`);
    await uploadLocalFile(aborter, containerPublicURL, localFilePath);
    console.log(` - Local file "${localFilePath}" was uploaded to your public container ✓`);

    console.log(`\nLet's list all the files in "${containerPublicName}" container:`);
    await showBlobNames(aborter, containerPublicURL);
}

execute().then(() => console.log("\nAll done ")).catch((e) => console.log(e));
