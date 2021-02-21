# Abitia

Abitia is a playground of mine, currently revolving around the modular monolith concept.

## Directory structure

```
abitia
│   README.md <- You're here!
│
└───packages
│   └───eslint-config # common eslint config
│   │
│   └───tsconfig # common tsconfig
│   │
│   └───zod-dto # a package to make DTOs/OpenApi out of Zod schemas
│   
└───services
│   └───monolith # the monolith :)
```

## Local development

### Prerequisites
- Node.js >=14.15.1
- Rush.js (`npm install -g @microsoft/rush`)

### Install project dependencies

```shell
rush update
```
