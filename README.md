# database-utilities
A collection of utilities to manage the PLEIADES MongoDB database.

To run the different scripts, it is necessary to install the [Node.js environment](https://nodejs.org/).

To install the NPM package required for interacting with the MongoDB database: 

    npm install -g mongodb

## Database Generator

Generates the database, including the collections and the associated validators:

    node PleiadesDatabaseGenerator.js {MongoDB_Server_URL}


## Database Reader (TODO)

Serializes the contents of the database into a JSON file.

## Database Writer (TODO)

Deserializes the contents of a JSON file into the database.

## Database Random Data Generator (TODO)
Generates data into the database.
