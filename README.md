# Kinton Test

Azure Storage test suite written in NodeJS

## Getting Started

```
git clone https://github.com/breogangf/AzureTest.git
```

### Prerequisites

```
NodeJs 10.14.1
npm 6.4.1
Azure blob Storage Account
Azure Storage Explorer (optional)
```

### Installing

Install all the npm dependencies:

```
npm i
```

## Running the tests
Update your .env file with your Azure Blob Storage Account name and Access Key:
```
AZURE_STORAGE_ACCOUNT_NAME=<HERE_YOUR_NAME>
AZURE_STORAGE_ACCOUNT_ACCESS_KEY=<HERE_YOUR_KEY>
```

Execute the test suite:

```
npm test
```

### Break down into end to end tests

This test suite was made with the only purpose to validate an input + delivery solution for binary files.


## Built With

* [Azure SDK](https://docs.microsoft.com/es-es/azure/storage/blobs/storage-quickstart-blobs-nodejs?toc=%2Fes-es%2Fjavascript%2Fazure%2Ftoc.json%3Fview%3Dazure-node-latest&bc=%2Fes-es%2Fjavascript%2Fazure%2Fazure_nodejs_bread%2Ftoc.json%3Fview%3Dazure-node-latest&view=azure-node-latest) - NodeJS SDKfor Azure Storage solutions

## Contributing

Please feel free to send us a PR and make this repo really happy today!

## Versioning

Initial Version (1.0.0)

## Authors

* **Breogán González Fernández** - *Base project* - [breogangf](https://github.com/breogangf)


## License

This project is licensed under the MIT License
