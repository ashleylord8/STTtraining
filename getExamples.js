var fs = require('fs');

fs.readFile('workspace.json', function (err, data) {
    if (err) {
        return console.error(err);
    }
    workspace =  JSON.parse(data.toString());
    //console.log(workspace.intents);
    var intents = {};
    var examples = {};

    workspace.intents.forEach( function(item){
        //console.log (item.intent);
        //intents += item.intent + '\n';

        item.examples.forEach(function(item) {
            //console.log (item.text);
            examples += item.text + '\n';
        });

    });

    fs.writeFile('examples.txt', examples, function(err) {
        if (err) throw err;
        console.log('file saved');
    });
});
