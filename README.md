# Speech to Text CLI


## Getting Started

```
npm watson-speech-to-text-utils
```

## Usage

```
watson-speech-to-text-utils create-and-train -f workspace.json
```

## License

This sample code is licensed under Apache 2.0.

## Contributing

See [CONTRIBUTING](.github/CONTRIBUTING.md).

## Open Source @ IBM
Find more open source projects on the [IBM Github Page](http://ibm.github.io/)


### How to get the workspace.json file
  - Navigate to your Bluemix console and open the Conversation service instance where you imported the workspace.
  - Click the menu icon in the upper-right corner of the workspace tile, and then select `Download as JSON`.

---

### TODO: UPDATE THIS

### Running the code
Navigate to the correct directory by using the following command within the terminal:

  ```bash
  cd ./STTtraining
  ```
Copy the credentials (`username` and `password`) from your Speech to Text service into the `utils.js` script (lines 56 and 57). Save your changes in this file.

1. To `create` and `train` a custom speech to text (STT) model, run the following command :

  ```bash
  node testSTTcustom.js --action=create_and_train
  ```
If you get back `Model creation returns: 201` and `Model customization_id:  customID`, then your custom model has been created successfully. Please note down the *customID* as you may be needing it to test/run some of the other commands.
If you get back `Training complete!` then your Speech to Text service has been trained.

2. To `list` all STT customization models, run the following command :

  ```bash
  node testSTTcustom.js --action=list
  ```
3. To `delete` a STT customization model whose customization id is *custom_id*, run the following command :

  ```bash
  node testSTTcustom.js --action=delete --id=custom_id
  ```
Please be sure to replace *custom_id* with the appropriate id in the above command.
If you get back `Model deletion returns:200` then your STT custom model has been deleted

4. To list all out of vocabulary words (`OOVs`) for a STT custom model whose customization id is *custom_id*, run the following command :

  ```bash
  node testSTTcustom.js --action=OOVs --id=custom_id
  ```
Please be sure to replace *custom_id* with the appropriate id in the above command.

5. To `add multiple words, OOVs and their pronunciations` to the STT custom model whose customization id is *custom_id*, you first have to create a JSON file. Following is the sample JSON that you can look at to create your own file.

  ```json
  {"words": [
     {
        "display_as": "could",
        "sounds_like": ["could"],
        "word": "culd"
     },
     {
        "display_as": "closeby",
        "sounds_like": ["closeby"],
        "word": "closeby"
     },
     {
        "display_as": "cya",
        "sounds_like": ["cya", "see ya"],
        "word": "cya"
     }
   ]
 }
 ```
`word` refers to the word that is to be added. `sounds_like` refers to the pronunciation for the word. You can also add multiple pronunciations for a single word [ Notice *sounds_like* for the word `cya` in the above example]. `displays_as` refers to the way added word is to be displayed. Also, note the fields *displays_as* and *sounds_like* are optional. You can choose to add/not add them to the JSON.

 If you'd just like to add pronunciations for OOVs, then you can simply copy the list of OOVs you get in Step 4 and paste them into a separate JSON file. You can then go ahead and modify the pronunciations.

 Once you've created the JSON file, use the following command to add words and their pronunciations

 ```bash
 node testSTTcustom.js --action=add_words --id=custom_id --file=yourFilePath/fileName.json
 ```
Please be sure to replace *custom_id* with the appropriate id and *yourFilePath/fileName.json* with the appropriate path in the above command.

6. To `add a single word, OOV and its pronunciation` to the STT custom model whose customization id is *custom_id*, run the following command :

 ```bash
 node testSTTcustom.js --action=add_word --id=custom_id --word=theWordToBeAdded --soundsLike='pronunciation' --displays_as=displayWordAs
 ```
`word` refers to the word that is to be added. `sounds_like` refers to the pronunciation for the word. You can also add multiple pronunciations for a single word. `displays_as` refers to the way added word is to be displayed.

 Please be sure to replace *custom_id* with the appropriate id, *theWordToBeAdded* with the word that is to be added, *pronunciation* with appropriate pronunciation(s) and *displaysWordAs* with the word you'd like to be displayed.
You can add multiple pronunciations by separating them with a `comma` i.e *--soundsLike='pronunciation1, pronunciation2'*

 Also, note the fields *--displaysAs* and *--soundsLike* are optional. You can choose to add/not add them to the command.

7. To see the `status of corpus` (.e. whether the added corpus has been analyzed or not) of the STT custom model whose customization id is *custom_id*, run the following command:

 ```bash
 node testSTTcustom.js --action=corpus_status --id=custom_id
 ```
Please be sure to replace *custom_id* with the appropriate id in the above command.

8. To see the `status of model`(i.e. whether the added corpus has been trained or is ready to be trained) of the STT custom model whose customization id is *custom_id*, run the following command:

 ```bash
 node testSTTcustom.js --action=model_status --id=custom_id
 ```
Please be sure to replace *custom_id* with the appropriate id in the above command.
