# STTtraining

## Starting locally
Git clone the project https://github.com/ashleylord8/STTtraining.

### Update the Workspace
Replace `workspace.json` with the desired Conversation workspace JSON you wish to train.
  * To grab your Conversation workspace JSON:
    - Navigate to your Bluemix console and open the Conversation service instance where you imported the workspace.
    - Click the menu icon in the upper-right corner of the workspace tile, and then select `Download as JSON`.
  * Make sure to name the desired workspace JSON as `workspace.json` within the project folder.

### Get the Intent Examples from Workspace
1. Navigate to the corect directory by using the following command within the terminal:
  
  ```bash
  cd ./STTtraining
  ```

2. Then run `getExamples.js`:
  
  ```bash
  node getExamples.js
  ```
  
3. The file `examples.txt` should be updated with current intent examples.

### Use Speech to Text Service
Copy the credentials (`username` and `password`) from your Speech to Text service into the `testSTTcustom.py` script (lines 21 and 22). Save your changes in this file.

### Train the Speech to Text Service
1. Make sure to still be in the corect directory.
  
  ```bash
  cd ./STTtraining
  ```
  
2. Then run the script:
  
  ```bash
  python testSTTcustom.py
  ```

If you get back `Training complete!` then your Speech to Text service has been trained with the Conversation workspace.
