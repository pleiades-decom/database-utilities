# database-utilities
A collection of utilities to manage the PLEIADES MongoDB database.

To run scripts, it is necessary to install the [Node.js environment](https://nodejs.org/).

To install the NPM package required for interacting with the MongoDB databases: 

    npm install -g mongodb

## Database Generator
Generates the database structure

    node PleiadesDatabaseGenerator.js {MongoDB_Server_URL}


## Database Reader
Serializes the contents of the database into a JSON file.

## Database Writer
Deserializes the contents of a JSON file into the database.

## Database Random Data Generator
Generates data into the database.
