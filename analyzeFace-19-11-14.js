const axios = require('axios');
const azure = require('azure-storage');
const cogsvc = require('azure-cognitiveservices-face');

var qresp ;
//var COMP_FACE_URL = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceid=true&returnFaceLandmarks=true&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise' ;
//var COMP_FACE_PATH = 'detect?returnFaceid=true&returnFaceLandmarks=true&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise' ;
//var STOR_IMAGE_URL = "https://sdcinststorage.blob.core.windows.net"  ;
//var COMP_FACE_KEY = '76eba928b8324c45b029a1930c660b47' ;

module.exports =  function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);

 
    var surl = { 'url' :  process.env.STOR_IMAGE_URL + myQueueItem  } ;
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

    function addFace(faces) {
       context.log("in addFace");
       console.log("processing face: ",faces);
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
                          addFace(qresp);
                          context.done();
                       }).catch(err => {
                          context.log(err);
                          context.done(err) ;
                       });    

};
