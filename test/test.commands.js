
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

const pkg = require('../package.json');
const Commands = require('../lib/commands');

if (process.env.SPEECH_TO_TEXT_USERNAME) {
  const cmd = new Commands({
    username: process.env.SPEECH_TO_TEXT_USERNAME,
    password: process.env.SPEECH_TO_TEXT_PASSWORD,
  });

  describe('commands()', function() {
    this.slow(1000);

    it('listModels()', () => cmd.listModels());

    it('authenticate()', () =>
      cmd.authenticate()
    );

    it('listCustomizations()', () => cmd.listCustomizations());

    it('getCustomization()', () =>
      cmd.getCustomization({
        customization_id: process.env.CUSTOMIZATION_ID,
      })
    );

    it('listCustomizationWords()', () =>
      cmd.listCustomizationWords({
        customization_id: process.env.CUSTOMIZATION_ID,
      })
    );

    it('listCorpora()', () =>
      cmd.listCorpora({
        customization_id: process.env.CUSTOMIZATION_ID,
      })
    );

    it('createCustomization()', () => {
      this.timeout(50000);
      return cmd.createCustomization({
        workspace: path.join(__dirname, './resources/workspace.json'),
        customization_name: `${pkg.name}-it`,
        customization_description: 'it test',
        base_model_name: 'en-US_NarrowbandModel',
      }).then(newCustomization => cmd.deleteCustomization(newCustomization));
    });

    // it('createAndTrainCustomization()', () => {
    //   this.timeout(50000);
    //   return cmd.createAndTrainCustomization({
    //     workspace: path.join(__dirname, './resources/workspace.json'),
    //     customization_name: `${pkg.name}-it`,
    //     customization_description: 'it test',
    //     base_model_name: 'en-US_NarrowbandModel',
    //   }).then(newCustomization => cmd.deleteCustomization(newCustomization));
    // });
  });
}
else {
  console.log('Skipping integration test. SPEECH_TO_TEXT_USERNAME is null or empty');
}
