/**
* Copyright 2015 IBM Corp. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// load default variables for testing
//require('dotenv').config();
var assert = require('assert');
var myActions = require('../lib/actions.js');
var fs = require('fs');
var test_workspace = './test/resources/workspace.json';
var test_path = './test/examples.txt';
var correct_path = './test/resources/examples.txt';

describe('parse()', () => {
  it('should parse the workspace.json /', function() {
    var params = {
      'workspace': test_workspace,
      'examples': test_path
    }
    myActions.getExamples(params);
    var response = fs.readFileSync(test_path);
    var expected = fs.readFileSync(correct_path);
    assert.deepEqual(response, expected, 'Parse json response: ' + response + ' does not match expected json response ' + expected);
  });
});
