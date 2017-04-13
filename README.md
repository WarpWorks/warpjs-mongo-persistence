# MongoPersistence

MongoDB persistence for MonApp

## Install

    npm install --save https://github.com/dslama/MongoPersistence.git

## Usage

    const Persistence = require('@dslama/mongo-persistence');
    const persistence = new Persistence('some-host', 'db-name');

    persistence.documents('collection-name')
        .then(console.log)
        .finally(() => {
            persistence.close();
        });
