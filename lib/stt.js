const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
module.exports = (credentials) => {
    var speech_to_text = new SpeechToTextV1({
        username: credentials.speechToText_username,
        password: credentials.speechToText_password
    });
    return {
        //Create a custom Model
        createCustomization: (params) => new Promise((resolve, reject) => {
            speech_to_text.createCustomization(params, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response.customization_id);
                }
            })
        }),

        //Add corpus to the model
        addCorpus: (params) => new Promise((resolve, reject) => {
            speech_to_text.addCorpus(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        'statusCode': body.statusCode,
                        'customization_id': params.customization_id
                    });
                }
            })
        }),

        //Get Corpora status
        getCorpora: (params) => new Promise((resolve, reject) => {
            speech_to_text.getCorpora(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var status;
                    var recordsBeingProcessed = response.corpora.filter(function(record) {
                        return record['status'] == 'being_processed';
                    });
                    if (recordsBeingProcessed.length == 0) {
                        status = 'analyzed';
                    } else {
                        status = 'being_processed';
                    }
                    resolve({
                        'status': status,
                        'customization_id': params.customization_id
                    });
                }
            })
        }),

        //Check when corpora is analyzed
        whenCorporaAnalyzed: (params) => new Promise((resolve, reject) => {
            speech_to_text.whenCorporaAnalyzed(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var status = response.corpora[0].status;
                    resolve({
                        'status': status,
                        'customization_id': params.customization_id
                    });
                }
            })
        }),

        //Get all the out of vocabulary words
        getWords: (params) => new Promise((resolve, reject) => {
            speech_to_text.getWords(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        'words': JSON.stringify(response.words, null, 2),
                        'customization_id': params.customization_id
                    });
                }
            })
        }),

        //Get customization status
        getCustomization: (params) => new Promise((resolve, reject) => {
            speech_to_text.getCustomization(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var status = response.status;
                    resolve({
                        'status': status,
                        'customization_id': params.customization_id
                    });
                }
            })
        }),

        //Check if the customization is ready
        whenCustomizationReady: (params) => new Promise((resolve, reject) => {
            speech_to_text.whenCustomizationReady(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var status = response.status;
                    resolve({
                        'status': status,
                        'customization_id': params.customization_id
                    });
                }
            })
        }),

        //Set up a training model
        trainCustomization: (params) => new Promise((resolve, reject) => {
            speech_to_text.trainCustomization(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        'status': body.statusCode,
                        'customization_id': params.customization_id
                    });
                }
            })
        }),

        //Get the model status
        getCustomizations: (params) => new Promise((resolve, reject) => {
            speech_to_text.getCustomizations(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        'customizations': JSON.stringify(response, null, 2)
                    });
                }
            })
        }),

        //Delete customization
        deleteCustomization: (params) => new Promise((resolve, reject) => {
            speech_to_text.deleteCustomization(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        'status': body.statusCode
                    });
                }
            })
        }),

        //Add a word to the corpus
        addWord: (params) => new Promise((resolve, reject) => {
            speech_to_text.addWord(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        'status': body.statusCode,
                        'customization_id': params.customization_id
                    });
                }
            })
        }),

        //Add multiple words to the corpus
        addWords: (params) => new Promise((resolve, reject) => {
            speech_to_text.addWords(params, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        'status': body.statusCode,
                        'customization_id': params.customization_id
                    });
                }
            })
        })

    };
};
