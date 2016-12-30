const columnify = require('columnify');

const printWords = function(params) {
  const table = columnify(params.words, {
    columns: ['word', 'display_as', 'sounds_like', 'source', 'count', 'error']
  });
  console.log(table);
};

const printCorpus = corpus => console.log(columnify(corpus));

const printCorpora = function(params) {
  const table = columnify(params.corpora, {
    columns: ['name', 'total_words', 'out_of_vocabulary_words', 'status', 'error']
  });
  console.log(table);
};

const printCustomizations = function(params) {
  const table = columnify(params.customizations, {
    columns: ['customization_id', 'name', 'status','progress', 'base_model_name', 'created', 'warnings']
  });
  console.log(table);
};

const printCustomization = (customization) => console.log(columnify(customization));


const printBaseModels = function(params) {
  const table = columnify(params.models, {
    columns: ['name', 'rate', 'description']
  });
  console.log(table);
};

module.exports = {
  printWords,
  printBaseModels,
  printCorpus,
  printCorpora,
  printCustomizations,
  printCustomization,
};
