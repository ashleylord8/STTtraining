const columnify = require('columnify');

const printWords = function(params) {
  const table = columnify(params.customizations, {
    columns: ['word', 'display_as', 'source', 'sounds_like']
  });
  console.log(table);
};

const printCustomizations = function(params) {
  const table = columnify(params.customizations, {
    columns: ['customization_id', 'name', 'status', 'base_model_name', 'created']
  });
  console.log(table);
};

const printCustomization = (customization) =>
  printCustomizations({customizations: customization});


const printBaseModels = function(params) {
  const table = columnify(params.models, {
    columns: ['name', 'rate', 'description']
  });
  console.log(table);
};

module.exports = {
  printWords,
  printBaseModels,
  printCustomizations,
  printCustomization,
};
