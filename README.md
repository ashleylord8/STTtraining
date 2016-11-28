# STTtraining

## Starting locally
Git clone the project https://github.com/ashleylord8/STTtraining.

### Update the Workspace
Replace `workspace.json` with the desired Conversation workspace JSON you wish to train.
  * To grab your Conversation workspace JSON:
    - Navigate to your Bluemix console and open the Conversation service instance where you imported the workspace.
    - Click the menu icon in the upper-right corner of the workspace tile, and then select `Download as JSON`.
  * Make sure to name the desired workspace JSON as `workspace.json` within the project folder.

### Running the code
1. Navigate to the correct directory by using the following command within the terminal:

  ```bash
  cd ./STTtraining
  ```
2. Copy the credentials (`username` and `password`) from your Speech to Text service into the `utils.js` script (lines 56 and 57). Save your changes in this file. 

3. To `train` the speech to text (STT) service, run the following command :

  ```bash
  node testSTTcustom.js train
  ```
If you get back `Training complete!` then your Speech to Text service has been trained.

4. To `list` all STT customization models, run the following command :

  ```bash
  node testSTTcustom.js list
  ```
5. To `delete` a STT customization model whose customization id is *custom_id*, run the following command :

  ```bash
  node testSTTcustom.js delete custom_id
  ```
Please be sure to replace *custom_id* with the appropriate id in the above command.
If you get back `Model deletion returns:200` then your STT custom model has been deleted
