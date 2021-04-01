const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: "<access_key>",
  secretAccessKey: "<secret_key>",
  region: "eu-west-3",
});

exports.handler = async (event) => {
    if (event.requestContext.http.method == 'POST') {
        const body = JSON.parse(event.body);
        const {name, image} = body;
        const params = {
            Bucket: "sapir-final-project",
            Key: name,
            Body: image,
            ACL:'public-read'
        };
    
        // Uploading files to the bucket
        const res = await new Promise((resolve, reject) => {
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log(err);
                  resolve({
                    statusCode: 400,
                    body: JSON.stringify("Error uploading file"),
                  });
                } else {
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify({ 'url': data.Location }),
                    });
                }
            });
        })
        return res;
    } else {
        const response = {
            statusCode: 403,
            body: JSON.stringify("Method not allowed"),
         };
         return response;
    }
};
