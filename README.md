# Google function sample

> For the implementation doc, see the content of src/list-instances.ts

## Initial configurations

### Prerequisites:
- Node.js [(Download)](https://nodejs.org/en/download)
- Google Cloud CLI [(Dowlonad)](https://cloud.google.com/sdk/docs/install?hl=pt-br)

### Configuring Google Cloud CLI

1. Run `gcloud init`
2. Follow the instructions

### Installing required packages

1. Open the folder in a terminal
2. Run `npm install`

### Configuring the environment

1. Inside the .env file change the variables with the actual values from your account/project
2. Repeat this step for the .env.yaml file

## Running locally

1. Open the folder in a terminal
2. Run `npm start`
3. Open http://localhost:8080 in a browser

> If you want to run another function just set the function name inside the package.json file, in the "start" script (--target parameter)

## Deploying

1. Open the folder in a terminal
2. Run `npm run deploy`

> Make sure that the .env and .env.yaml files are configured correctly

## Testing

> TBD


## Stack

**Back-end:** Typescript, @google-cloud/functions-framework


## Authors

- [@igoventura](https://www.github.com/igoventura)


## License

[MIT](https://choosealicense.com/licenses/mit/)