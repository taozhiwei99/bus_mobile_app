//import all needed resources
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json( {limit: '10mb'} )); //For axios
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cors());


//aws configuration
AWS.config.update({
  accessKeyId: process.env.ACCESSKEY,
  secretAccessKey: process.env.ACCESS_SECRET,
  region: process.env.REGION,
});

//creating s3 instance
const s3 = new AWS.S3();
const bucketName = process.env.BUCKET;


//  AWS - UPLOAD API  //
app.post("/api/s3/uploadfile", (req, res) => {
  const base64String = req.body.file;
  const filename = req.body.name ;
  const folderName = req.body.folderName;
  const ctype = req.body.type;
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const day = date.getDate();
  const hour = date.getHours();
  const min = date.getMinutes();
  const second = date.getSeconds();
  const mili = date.getMilliseconds();
  const timestamp = year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + second + "-" + mili;
  const newFileName = timestamp + filename;
  
  // Remove data URL header and obtain the base64 data
  const base64Data = base64String.split(';base64,').pop();

  // Convert base64 string to buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  //bucket URL, which will be constant
  const rootURL = 'https://schoolpickup.s3.ap-southeast-1.amazonaws.com';
  const userBucket = bucketName  + folderName
  const key = `${newFileName}`;
  const params = {
    Bucket: userBucket,
    Key:key,
    Body:buffer,
    ContentType:ctype,
    
  }
  //s3 put object to bucket
  s3.putObject(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error saving the file.");
    } else {
      const imageURL = rootURL + folderName+ "/"+ newFileName;
      res.json(({imageURL}));
    }
  }); 
})

//api to list files in a folder
app.get("/api/s3/list/:folder", async (req, res) => {
  try{
    const folderName = req.params.folder;

    if(!folderName) {
      return res.status(400).send("Folder name needed!");
    }

    const folderPrefix = `${folderName}/`;
      let listing = await s3.listObjectsV2({ Bucket: bucketName, Prefix: folderPrefix}).promise();
      let listFile = listing.Contents.map(item => item.Key).filter(key =>key !==folderPrefix);
      res.json(listFile);
    }
    catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error")
    }
});


//api to download file
app.get("/api/s3/download/:folder/:filename", async (req, res) => {
  try {
    const folderName = req.params.folder;
    const fileName = req.params.filename;

    if (!folderName || !fileName) {
      return res.status(400).send("Folder name and filename are required.");
    }

    const fileKey = `${folderName}/${fileName}`;

    let fileObject = await s3.getObject({ Bucket: bucketName, Key: fileKey }).promise();
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(fileObject.Body);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//api request to delete a file, by accepting the user folder and the file name
app.delete("/api/s3/delete/:folder/:filename", async (req, res) => {
  try {
    const folder = req.params.folder;
    const filename = req.params.filename;
    const key = `${folder}/${filename}`;
    await s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
    res.send("File Deleted Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports.handler = serverless(app);