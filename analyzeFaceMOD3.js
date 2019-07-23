const Jimp = require("jimp");
const axios = require('axios');
const azure = require('azure-storage');
const QueueMessageEncoder = azure.QueueMessageEncoder;
var qtext ;
var qresp ;
var imagePath ;


module.exports = function (context, myBlob) {
    context.log("JavaScript blob trigger function processed blob \n Name:", context.bindingData.name, "\n Blob Size:", myBlob.length, "Bytes");
    function putQueue(mesg) {
       const queueSvc = azure.createQueueService();
       queueSvc.messageEncoder = new QueueMessageEncoder.TextBase64QueueMessageEncoder();
       queueSvc.createMessage('facequeue', mesg, function(error, results, response){
           if (error) {
               context.log(error);
           } else {
               context.log("queue record written");
           }
       }) ; 
    }
    Jimp.read(myBlob).then(image => {
        image
            .cover(200, 200) 
            .quality(60)
            .getBuffer(Jimp.MIME_JPEG, (error, stream) => {
                if (error) {
                    context.done(error);
                } else {
                    context.log('calling cog svc');
                    axios.post(process.env.COMP_VISION_URL + '/analyze?visualFeatures=Description,Faces&language=en', myBlob, {
                        headers: {
                            'Ocp-Apim-Subscription-Key': process.env.COMP_VISION_KEY,
                            'Content-Type': 'application/octet-stream'
                        }
                    }).then(response => {
                        qresp = response.data ;
                        qtext = JSON.stringify(response.data, null, 2)
                        imagePath = "/images/" + context.bindingData.name ;
                        qresp["imgPath"] = imagePath ;
                        context.log(JSON.stringify(qresp, null,2 ));
                        if (response.data.faces.length > 0) (
                            context.log("Faces Found: ",response.data.faces.length)
                            
                        )
                        context.bindings.thumbnail = stream;
  //  remove these comments to implement storage queue output                      
                        if (response.data.faces.length > 0) {
                            context.log("Calling putQueue") ;
                        //    putQueue(JSON.stringify(qresp,null)) ;
                            putQueue(imagePath) ;
                        }    
                        context.done(null, {
                            id: context.bindingData.name,
                            imgPath: "/images/" + context.bindingData.name,
                            thumbnailPath: "/thumbnails/" + context.bindingData.name,
                            description: response.data.description,
                            faces: response.data.faces
                        });
                    }).catch(err => {
                        context.log(JSON.stringify(err));
                        context.done(err);
                    });                   
                }
            });
    });
    
};
