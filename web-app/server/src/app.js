'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');

let network = require('./fabric/network.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

const host = process.env.Host || 'http://52.117.161.89';
const port = process.env.PORT || 30006;

const url = host + ':' + port;

//get user info, create user object, and update state with their emailAddress
app.post('/registerUser', async(req, res) => {
    //first create the identity for the user and add to wallet
    let response = await network.registerUser(req.body.emailAddress, req.body.firstName, req.body.lastName);
    if (response.err) {
        res.send(response.err);
    } else {
        //connect to the network as the newly registered user
        let networkObj = await network.connectToNetwork(req.body.emailAddress);

        if (networkObj.err) {
            res.send(networkObj.err);
        }

        let json_req_body = JSON.stringify(req.body);
        let args = [json_req_body];

        //update the ledger with the emailAddress and name of the user
        let invokeResponse = await network.createUser(networkObj, args);

        if (invokeResponse.err) {
            res.send(invokeResponse.err);
        } else {
            let registerResponse = JSON.parse(invokeResponse).data + ' Use emailAddress to login above.';
            res.send(registerResponse);
        }
    }
});

app.post('/validateUser', async(req, res) => {
    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    if (networkObj.err) {
        res.send(networkObj);
    }
    let invokeResponse = await network.queryAllDigitalAssets(networkObj, req.body.emailAddress);
    if (invokeResponse.err) {
        res.send(invokeResponse);
    } else {
        let parsedResponse = await JSON.parse(invokeResponse);
        res.send(parsedResponse);
    }
});

//get all assets in world state
app.post('/queryAllDigitalAssets', async(req, res) => {

    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    let response = await network.queryAllDigitalAssets(networkObj, req.body.emailAddress);
    let parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);

});

//get all assets owned by a particular user
app.post('/queryDigitalAssetsByUser', async(req, res) => {

    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    let response = await network.queryDigitalAssetsByUser(networkObj, req.body.emailAddress);
    let parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);

});

//get asset by assetId
app.post('/readDigitalAsset', async(req, res) => {

    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    let response = await network.readDigitalAsset(networkObj, req.body.assetId);
    let parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);

});

//create/upload a new asset
app.post('/createDigitalAsset', async(req, res) => {
    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    let response = await network.createDigitalAsset(networkObj, req.body.digitalAssetFileName, req.body.digitalAssetFileType, req.body.digitalAssetFileBuffer, req.body.emailAddress);
    res.send(response);

});

//view all pending asset modification requests
app.post('/viewAssetModificationRequests', async(req, res) => {
    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    let response = await network.viewAssetModificationRequests(networkObj, req.body.emailAddress);
    res.send(response.toString());
});

//download an asset from COS
app.post('/downloadDigitalAssetFile', async(req, res) => {
    let response = await network.downloadDigitalAssetFile(req.body.assetId, req.body.assetName);

    let buffer = Buffer.from(response.Body).toString();

    let base64Data = buffer.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
    let dir = __dirname + '/files/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    const file = __dirname + '/files/' + req.body.assetName;
    require('fs').writeFile(file, base64Data, 'base64', function(err) {
        console.log(err);
    });

    let link = req.body.assetName;
    let finalRes = {};
    finalRes.link = `${url}/download/${link}`;

    // res.setHeader('Content-disposition', `attachment; filename=${req.body.assetName}`);
    // res.setHeader('Content-type', 'image/jpeg');
    res.send(finalRes);
    // res.send(response);
});

app.get('/download/:id', async(req, res) => {
    const id = req.params.id;
    const file = `${__dirname}/files/${id}`;
    res.download(file);
});

//delete an asset (from COS + ledger)
app.post('/deleteDigitalAsset', async(req, res) => {
    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    let response = await network.deleteDigitalAsset(networkObj, req.body.assetId, req.body.emailAddress);
    res.send(response);
});

//update an existing asset (replacing the file)
app.post('/updateDigitalAsset', async(req, res) => {
    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    let response = await network.updateDigitalAsset(networkObj, req.body.digitalAssetFileName, req.body.digitalAssetFileType, req.body.digitalAssetFileBuffer, req.body.emailAddress);
    res.send(response.toString());
});

//change ownership of an asset
app.post('/changeOwnershipOfAsset', async(req, res) => {
    let networkObj = await network.connectToNetwork(req.body.assetModifier);
    let response = await network.changeOwnershipOfAsset(networkObj, req.body.assetId, req.body.assetModifier, req.body.newAssetOwner);
    res.send(response.toString());
});

//process asset modification request
app.post('/processAssetModRequest', async(req, res) => {
    let networkObj = await network.connectToNetwork(req.body.emailAddress);
    let response = await network.processAssetModRequest(networkObj, req.body.assetId, req.body.assetModId, req.body.emailAddress, req.body.approve, req.body.addApprovedUser);
    res.send(response.toString());
});

app.post('/getHistoryForDigitalAsset', async(req, res) => {
    let response = await network.getHistoryForDigitalAsset(req.body.assetId);
    res.send(response.toString());
});

app.get('/health', async (req, res) => {
    console.log("@ /health");
    res.json({
        name: "Digital Asset Server",
        status: "UP",
      });    
});

app.get('/', async (req, res) => {
    console.log("@ /");
    res.json({
        name: "Digital Asset Server",
        status: "UP",
      });    
});

app.listen(process.env.PORT || 8081);

