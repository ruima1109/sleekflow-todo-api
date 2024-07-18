# todo-api

Backend for sleekflow-todo-demo

## How to set up the dev environment

1. pull the code
   $ git clone https://github.com/ruima1109/sleekflow-todo-api.git
2. run

```sh
$ npm install
```

3. setup your aws credentials:
   install aws cli command https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html.
   Then locally run:

```sh
$ aws configure
```

get your id and credentials from https://console.aws.amazon.com/iam/home?region=us-east-1#/users

see more instructions here: (https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

## Run the server locally

```sh
$ npm run debug
or
$ npm run start
```

## To debug in VS code, add the configuration below in the .vscode/launch.json. It supports hotloading

```sh
$ npm install -g nodemon
```

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "name": "Serverless",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "debug"],
       "outputCapture": "std"
    }
  ]
}
```

## Deployment the server in aws

To deploy the server in staging, run

```sh
npm run deploy
```