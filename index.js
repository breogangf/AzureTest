const {
  Aborter,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
  uploadFileToBlockBlob
} = require('@azure/storage-blob');

const fs = require('fs');
const path = require('path');

const checkMark = '\x1b[92m✓\x1b[0m';
const fileSystemHelper = require('./helpers/fileSystem');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

const ONE_MEGABYTE = 1024 * 1024;
const ONE_MINUTE = 60 * 1000;

async function showContainerNames(aborter, serviceURL) {
  let response;
  let marker;

  do {
    response = await serviceURL.listContainersSegment(aborter, marker);
    marker = response.marker;
    for (const container of response.containerItems) {
      console.log(` - ${container.name} ${checkMark}`);
    }
  } while (marker);
}

async function uploadLocalFile(aborter, containerURL, filePath) {
  filePath = path.resolve(filePath);

  const fileName = path.basename(filePath);
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);
  const blobOptions = {
    blobHTTPHeaders: {
      blobContentType: `image/${fileSystemHelper.getFileExtension(filePath)}`
    }
  };

  return await uploadFileToBlockBlob(aborter, filePath, blockBlobURL, blobOptions);
}

async function showBlobNames(aborter, containerURL) {
  let response;
  let marker;

  do {
    response = await containerURL.listBlobFlatSegment(aborter);
    marker = response.marker;
    for (const blob of response.segment.blobItems) {
      console.log(` - ${blob.name} ${checkMark}`);
    }
  } while (marker);
}

async function execute() {
  const containerTestName = 'test';
  const containerPrivateName = 'private';
  const containerPublicName = 'public';
  const fileName = '1fb9fb9a44ef9d32addbe42e9bb85bd7.jpg';
  const localFilePath = `./${fileName}`;

  const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
  const pipeline = StorageURL.newPipeline(credentials);
  const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);

  const containerTestURL = ContainerURL.fromServiceURL(serviceURL, containerTestName);
  const containerPrivateURL = ContainerURL.fromServiceURL(serviceURL, containerPrivateName);
  const containerPublicURL = ContainerURL.fromServiceURL(serviceURL, containerPublicName);

  const aborter = Aborter.timeout(30 * ONE_MINUTE);

  console.log('Let me list all your containers:');
  await showContainerNames(aborter, serviceURL);

  console.log(`\nLet's create a new ${containerTestName} container`);
  await containerTestURL.create(aborter);
  console.log(` - Container: "${containerTestName}" was created ${checkMark}`);

  console.log(`\nLet's remove your ${containerTestName} container`);
  await containerTestURL.delete(aborter);
  console.log(` - Container "${containerTestName}" was deleted ${checkMark}`);

  console.log(`\nLet's upload a local file: ${localFilePath} to your private container`);
  await uploadLocalFile(aborter, containerPrivateURL, localFilePath);
  console.log(` - Local file "${localFilePath}" was uploaded to your private container ${checkMark}`);

  console.log(`\nLet's list all the files in "${containerPrivateName}" container:`);
  await showBlobNames(aborter, containerPrivateURL);

  console.log(`\nLet's upload a local file: ${localFilePath} to your public container`);
  await uploadLocalFile(aborter, containerPublicURL, localFilePath);
  console.log(` - Local file "${localFilePath}" was uploaded to your public container ${checkMark}`);

  console.log(`\nLet's list all the files in "${containerPublicName}" container:`);
  await showBlobNames(aborter, containerPublicURL);

  console.log(`\nLets download "${fileName}" from your private container`);
  const picturePrivateURL = BlockBlobURL.fromContainerURL(containerPrivateURL, fileName);
  console.log(` - You \x1b[31mcan't\x1b[0m download the picture from: ${picturePrivateURL.url} ${checkMark}`);

  console.log(`\nLets download "${fileName}" from your public container`);
  const picturePublicURL = BlockBlobURL.fromContainerURL(containerPublicURL, fileName);
  console.log(` - You \x1b[92mcan\x1b[0m download the picture from: ${picturePublicURL.url} ${checkMark}`);
}

execute()
  .then(() => console.log(`\nAll tests finished ${checkMark}\n`))
  .catch((e) => {
    if (e.request.url.includes('HERE_YOUR_NAME')) {
      console.log('Error: Please fill your credentials in .env file first');
    } else {
      console.log(e);
    }
  });
