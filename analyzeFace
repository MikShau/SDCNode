const axios = require('axios');
const azure = require('azure-storage');
var qresp ;
var COMP_FACE_URL = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceid=true&returnFaceLandmarks=true&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise' ;
var imagePath = "https://sdcinststorage.blob.core.windows.net"  ;

module.exports =  function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);
    context.log("Making axios POST");
 //   context.log(imagePath) ;
 var bod =  imagePath + myQueueItem ;
 var surl = { 'url' :  bod  } ;
    context.log("surl" + surl) ;

    axios.post(COMP_FACE_URL , surl , {
                      headers: {
                         'Ocp-Apim-Subscription-Key': '76eba928b8324c45b029a1930c660b47',
                         'Content-Type': 'application/json'
                          }
                      }).then(response => {
                          context.log("In Response")
                          qresp = response.data ;
                          context.log(JSON.stringify(qresp,null,2)) ;
                          context.done();
                       }).catch(err => {
                          context.log(err);
                          context.done(err) ;
                       });    

};
