const axios = require('axios');
const azure = require('azure-storage');
const cogsvc = require('azure-cognitiveservices-face');

var qresp ;


module.exports =  function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);

 
    var surl = { 'url' :  myQueueItem  } ;
    context.log("surl" + JSON.stringify(surl,null, 2)) ;

       function putTable(imageLoc,imageJSON) {
    	var img = imageLoc.split('/') ;
    	console.log("In putTable ",img[img.length-1],JSON.stringify(imageJSON,null, 2) );
		const tabSVC = azure.createTableService(process.env.AZURE_STORAGE_CONNECTION_STRING );
    	tabSVC.createTableIfNotExists('afResults', function(error, result, response){
    		if(error){
    		console.log(error) ;
    	}
    	var entGen = azure.TableUtilities.entityGenerator;
    	var task = {
    		PartitionKey: entGen.String('results'),
    		RowKey: entGen.String(img[img.length-1]),
    		json: entGen.String(JSON.stringify(imageJSON,null, 2)),
    	};
    	tabSVC.insertOrReplaceEntity('afResults',task, function (error, result, response) {
    		if(error){
    		console.log(error);
    	    }
        });

    });
    }

    

    context.log("Making axios POST");
    axios.post(process.env.COMP_FACE_URL + process.env.COMP_FACE_PATH , surl , {
                      headers: {
                         'Ocp-Apim-Subscription-Key': process.env.COMP_FACE_KEY,
                         'Content-Type': 'application/json'
                          }
                      }).then(response => {
                          context.log("In Response")
                          qresp = response.data ;
                          context.log(JSON.stringify(qresp,null,2)) ;
                          putTable(myQueueItem,qresp);
                          context.done();
                       }).catch(err => {
                          context.log(err);
                          context.done(err) ;
                       });    

};
