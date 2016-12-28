
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

const Commands = require('../lib/commands');

if (process.env.SPEECH_TO_TEXT_USERNAME) {
  const cmd = new Commands({
    username: process.env.SPEECH_TO_TEXT_USERNAME,
    password: process.env.SPEECH_TO_TEXT_PASSWORD,
  });

  describe('commands()', () => {
    it('should list the base models', () => cmd.listModels());

    it('should validate credentials when using the authenticate method', () =>
      cmd.authenticate()
    );

    it('should list the customizations', () => cmd.listCustomizations());

    it('should get a customization by id', () =>
      cmd.getCustomization({
        customizationId: process.env.CUSTOMIZATION_ID,
      })
    );
  });
}
else {
  console.log('Skipping integration test. SPEECH_TO_TEXT_USERNAME is null or empty');
}
