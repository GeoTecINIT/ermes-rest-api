# ERMES REST API
Ermes REST API offers several backend services to support ERMES browser and mobile applications.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [PostgreSQL](https://www.postgresql.org/) 

Create a copy of **config/environment.scheme.js** and rename it to **environment.js**. Fill DB connection details.

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`

## Running / Development

* Ensure that PostgreSQL DB server is running
* Execute `node server.js` to run the server
* The server will be running at [http://localhost:3000](http://localhost:3000)

You can change the default port at anytime modifying the default setting in the file **config/environment.js**
