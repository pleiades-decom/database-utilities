/******************************************************************************
 * Generates the PLEIADES database from the JSON Schema.
 * @author: Mikel Salazar
 *****************************************************************************/

// ----------------------------------------------------------- GLOBAL VARIABLES

// To handle the data I/O
let fs = require("fs"),
	readline = require('readline'),
	text = {encoding: "utf8"},
	folderPath = __dirname + "/",
	jsonSchemaPath = "./schema/pleiades.schema.json",
	jsonSchema = {};

// To handle the database connection
let mongoServerUrl = "mongodb://localhost:27017/";
let mongoClient = require('mongodb').MongoClient;
let databaseName = "PLEIADES";

// To handle the different tasks
let currentTask;


// ---------------------------------------------------------- UTILITY FUNCTIONS

/** Logs a message on console.
 * @param msg The message text. */
function log(msg) { process.stdout.clearLine(); process.stdout.write(msg); }

/** Ask a question to the user.
 * @param questionText The question text.
 * @param defaultAnswer the default answer.
 * @returns A promise with the answer. */
function ask(questionText, defaultAnswer) {
	let readlineInterface = readline.createInterface(
		{input: process.stdin, output: process.stdout});
	return new Promise((resolve, reject) => {
		readlineInterface.question(
			questionText + (defaultAnswer?' ['+defaultAnswer+']':'') + ':', 
			(input) => { 
				if (defaultAnswer && (!input || input.length == 0)) 
					input = defaultAnswer;
				readlineInterface.close(); resolve(input);
			}
		);
	});
}
 
/** Begins a task.
 * @param t The task text. */
function beginTask(t) { currentTask = t; log("\t" + currentTask + "... \r"); }

/** Updates a task.
 * @param u The task update text. */
function updateTask (u) { log("\t" + currentTask + "... " + u + "\r"); }

/** Ends a task. */
function endTask() { log("\t"+ currentTask +"... DONE\n"); currentTask = null; }



// ---------------------------------------------------------- UTILITY FUNCTIONS

/** Generates the MongoDB database and the collections. */
async function generateDatabase() {

	// Connect to the server and create/access the database
	let client, database;
	try { client = await mongoClient.connect(mongoServerUrl); }
	catch (error) { console.error('ERROR: Unable to connect to MongoDB server' +
		' at "' +	mongoServerUrl + '".');	process.exit(-1); }
	try { database = client.db(databaseName); }
	catch (error) { console.error('ERROR: Unable to create database: "' +
		+ databaseName +'".');	process.exit(-1); }

	// Delete previous collections
	let collections = await database.listCollections().toArray(),
		cleanRequired = collections.length > 0
	if (cleanRequired) {
		beginTask("Cleaning the database");
		for (let collection of collections)
			await database.dropCollection(collection.name);
		endTask();
	}
	
	// Generate the new collections from the JSON schema
	beginTask("Generating Collections");
	let classIndex = 0, classCount = Object.keys(jsonSchema.definitions).length;
	for (let className in jsonSchema.definitions) {
		let classDefinition = jsonSchema.definitions[className];
		updateTask(className + "["+ ++classIndex +  "/" + classCount + "]");

		// Create the validator
		let validator = { $jsonSchema: {}};
		let validatorClass = validator.$jsonSchema;
		validatorClass.bsonType = "object";

		// Create the validator properties 
		let validatorProperties = validatorClass.properties = {
			_id: { bsonType: "objectId" }
		};
		for (let propertyName in classDefinition.properties) {

			let propertyDefinition = classDefinition.properties[propertyName];
			let validatorProperty = {};
			validatorProperty.title = propertyDefinition.title || propertyName;
			validatorProperty.description = propertyDefinition.description || "";
			validatorProperty.bsonType = propertyDefinition.type || "object";

			// Check that BSON type is valid
			// See: https://docs.mongodb.com/manual/reference/bson-types/
			if (propertyDefinition.$ref) validatorProperty.bsonType ="objectId";
			else if ((!validatorProperty.bsonType) ||
				(typeof validatorProperty.bsonType !== "string")) 
				validatorProperty.bsonType = "object";
			else switch (validatorProperty.bsonType) {
				case "integer": validatorProperty.bsonType = "int"; break;
			}


			// Save the validator property
			validatorProperties[propertyName] = validatorProperty;
		}

		// Create the new collection
		await database.createCollection(className, {validator: validator});
	}
	endTask();

	// Close the connection with the
	await client.close();
}


// ---------------------------------------------------------------- ENTRY POINT

/** The entry point of the script. */
(async function (){

	// Validate the command line arguments
	let arguments = process.argv.splice(2);
	if (arguments.length > 0) mongoServerUrl = arguments[0];
	else mongoServerUrl = await ask('MongoDB Server URL', mongoServerUrl);

	// Show a message on console to indicate the start of the process
	log("\nGENERATING PLEIADES DATABASE...\n");

	// Read the JSON Schema
	beginTask("Reading the PLEIADES JSON Schema file");
	jsonSchema = JSON.parse(fs.readFileSync(folderPath + jsonSchemaPath, text));
	endTask();

	// Generate the database
	await generateDatabase();

	// Show a message on console and end the process  
	log("ALL DONE\n"); process.exit(0);
})();


