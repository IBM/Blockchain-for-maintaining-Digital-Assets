//Import Hyperledger Fabric 1.4 programming model - fabric-network
'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const AWS = require('ibm-cos-sdk');
const nodemailer = require('nodemailer');
const uuidv1 = require('uuid/v1');
const hasha = require('hasha');

//connect to the config file
const configPathPrefix = path.join(process.cwd(), 'config');
const walletPathPrefix = path.join(process.cwd(), '_idwallet');
const configPath = path.join(configPathPrefix, 'config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
let connection_file = config.connection_file;

let gatewayDiscovery = config.gatewayDiscovery;
let appAdmin = config.appAdmin;
let orgMSPID = config.orgMSPID;
let channelName = config.channel_name;
let smartContractName = config.smart_contract_name;
let peerAddr = config.peerName;

// connect to the connection file
const ccpPath = path.join(configPathPrefix, connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

let smtpHost = config.smtpHost;
let smtpPort = config.smtpPort;
let smtpUserName = config.smtpUserName;
let smtpPassword = config.smtpPassword;
let senderEmail = config.senderEmail;

let bucketName = config.cos_bucketName;
let cos_config = {
    endpoint: config.cos_endpoint,
    apiKeyId: config.cos_apiKeyId,
    serviceInstanceId: config.cos_serviceInstanceId
};
let cos = new AWS.S3(cos_config);

//add object to COS
exports.putObject = async function(assetId, fileContents, mimetype) {
    console.log(`Creating new item in COS: ${assetId}`);
    return cos.putObject({
            Bucket: bucketName,
            Key: assetId,
            Body: fileContents,
            ContentEncoding: 'base64',
            ContentType: mimetype
        }).promise()
        .then((() => {
            let response = {};
            response.data = `Item ${assetId} created in COS.`;
            return response;
        }))
        .catch((e) => {
            let response = {};
            response.err = `ERROR - Item could not be created in COS: ${e.code} - ${e.message}\n`;
            return response;
        });
};

//move in COS
exports.moveObject = async function(sourceAssetId, destinationAssetId) {
    console.log(`Moving the object ${sourceAssetId} in COS to ${destinationAssetId}`);
    return cos.copyObject({
            Bucket: bucketName,
            CopySource: bucketName + '/' + sourceAssetId,
            Key: destinationAssetId
        }).promise()
        .then((() => {
            let response = this.deleteObject(sourceAssetId);
            return response;
        }))
        .catch((e) => {
            let response = {};
            response.err = `ERROR - Item could not be created in COS: ${e.code} - ${e.message}\n`;
            return response;
        });
};

//delete object from COS
exports.deleteObject = async function(assetId) {
    console.log(`Deleting item from COS: ${assetId}`);
    return cos.deleteObject({
            Bucket: bucketName,
            Key: assetId
        }).promise()
        .then((() => {
            let response = {};
            response.data = `Item ${assetId} deleted successfully from COS.`;
            return response;
        }))
        .catch((e) => {
            let response = {};
            response.err = `ERROR - item could not be deleted from COS: ${e.code} - ${e.message}\n`;
            return response;
        });
};

//download object from COS
exports.downloadFile = async function(assetId, assetName) {
    console.log(`Downloading item from COS: ${assetId}`);
    const params = {
        Bucket: bucketName,
        Key: assetId
    };
    return cos.getObject(params, (err, data) => {
            if (err) {
                let response = {};
                response.err = `ERROR - Item could not be created in COS: ${err.code} - ${err.message}\n`;
                return response;
            }
            // //fs.writeFileSync(assetName, data.Body.toString());
            // let regex = /^data:(.+);base64,(.*)$/;
            // let matches = (data.Body.toString()).match(regex);
            // let fileData = matches[2];
            // let response = {};
            // response.data = fileData;
            // return response;
            // Body — (Buffer, Typed Array, Blob, String, ReadableStream) Object data

            console.log(data.Body);
            if (data && data.Body) {
                return data;
            }
            // let buffer = Buffer.from(fileData, 'base64');
            // fs.writeFileSync('../client/downloads/' + assetName, buffer);
        }).promise()
        .then(((data) => {
            return data;
        }))
        .catch((e) => {
            let response = {};
            response.err = `ERROR - item could not be retrieved from COS: ${e.code} - ${e.message}\n`;
            return response;
        });
};

//connect to the blockchain network using username
exports.connectToNetwork = async function(userName) {
    const gateway = new Gateway();
    try {
        const walletPath = path.join(walletPathPrefix);
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists(userName);
        if (!userExists) {
            console.error('An identity for the user ' + userName + ' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            let response = {};
            response.err = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
            return response;
        }

        await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });

        const network = await gateway.getNetwork(channelName);
        const contract = await network.getContract(smartContractName);
        const client = gateway.getClient();
        const channel = client.getChannel(channelName);
        let event_hub = channel.newChannelEventHub(peerAddr);

        let networkObj = {
            contract: contract,
            network: network,
            gateway: gateway,
            event_hub: event_hub
        };
        return networkObj;

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.error(error.stack);
        let response = {};
        response.err = error;
        return response;
    } finally {
        console.log('Done connecting to network.');
    }
};

//create a new user object in the blockchain
exports.createUser = async function(networkObj, args) {
    try {
        args = JSON.parse(args[0]);
        let response = await networkObj.contract.submitTransaction('createUser', args.emailAddress, args.firstName, args.lastName);

        await networkObj.gateway.disconnect();

        return response;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return error;
    }
};

//get a list of all digital assets
exports.queryAllDigitalAssets = async function(networkObj, emailAddress) {
    try {

        let response = await networkObj.contract.evaluateTransaction('queryAllDigitalAssets', emailAddress);
        console.log('Transaction queryAllDigitalAssets has been submitted');

        await networkObj.gateway.disconnect();

        return response;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error;
    }
};

//get list of digital assets owned by emailAddress
exports.queryDigitalAssetsByUser = async function(networkObj, emailAddress) {
    try {
        let response = await networkObj.contract.evaluateTransaction('queryDigitalAssetsByUser', emailAddress);
        console.log('Transaction queryDigitalAssetsByUser has been submitted');

        await networkObj.gateway.disconnect();

        return response;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error;
    }
};

//get the hash of an asset
exports.getHashFromAsset = async function(asset) {
    //console.log('Calculating hash from asset');
    let hashOutput = hasha(asset);
    //console.log(`The MD5 sum of the file is: ${hashOutput}`);
    return hashOutput;
};

//read digital asset by assetId
exports.readDigitalAsset = async function(networkObj, assetId) {
    try {
        let response = await networkObj.contract.submitTransaction('readDigitalAsset', assetId);
        console.log('Transaction readDigitalAsset has been submitted');

        await networkObj.gateway.disconnect();

        return response;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error;
    }
};

//create a new digital asset object
exports.createDigitalAsset = async function(networkObj, assetName, digitalAssetFileType, digitalAssetFileBuffer, createdBy) {
    try {
        //Step 1: Get Hash
        let assetHash = await this.getHashFromAsset(digitalAssetFileBuffer);
        console.log('Transaction getHashFromAsset has been submitted.');

        //Step 2: verify that asset doesn't exist
        let existingAsset = await networkObj.contract.submitTransaction('queryDigitalAssetByHash', assetHash);

        let response = {};
        if (JSON.parse(existingAsset).length > 0) {
            response.err = 'This asset already exists in the system.';
            response.existingAsset = JSON.parse(existingAsset)[0].Record;
            console.error(response.err);
            console.error(response.existingAsset);
            return response;
        }

        console.log('No other asset with this asset\'s hash was found.');

        //Step 3: generate an assetId
        let assetId = uuidv1();
        console.log(`Asset Id ${assetId} was generated.`);

        //Step 4: Upload object to COS and obtain it's link.
        response = await this.putObject(assetId, digitalAssetFileBuffer, digitalAssetFileType);
        if (response.err) {
            return response;
        }
        // Step 4: Update blockchain
        response = await networkObj.contract.submitTransaction('createDigitalAsset', assetId, assetName, assetHash, createdBy);

        await networkObj.gateway.disconnect();

        return response;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return error;
    }
};

//get list of all pending asset modification requetss for assets owned by emailAddress.
exports.viewAssetModificationRequests = async function(networkObj, emailAddress) {
    try {
        let response = await networkObj.contract.evaluateTransaction('queryAllPendingModificationRequests', emailAddress);
        console.log('Transaction queryAllPendingModificationRequests has been submitted');

        await networkObj.gateway.disconnect();

        return response;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return error;
    }
};

//update an existing digital asset
exports.updateDigitalAsset = async function(networkObj, assetId, digitalAssetFileType, digitalAssetFileBuffer, modifiedBy) {
    try {
        //Step1: Get Hash and verify that the asset hasn't already been uploaded.
        let assetHash = await this.getHashFromAsset(digitalAssetFileBuffer);
        console.log('Transaction getHashFromAsset has been submitted');

        let existingAsset = await networkObj.contract.submitTransaction('queryDigitalAssetByHash', assetHash);
        let response = {};
        if (JSON.parse(existingAsset).length > 0) {
            response.err = 'This asset already exists in the system - assetId: ' + JSON.parse(existingAsset)[0].Record.assetId;
            console.error(response.err);
            return JSON.stringify(response);
        }
        console.log('No other asset with this asset\'s hash was found.');

        //Step 2: verify if modifier is owner/in the list of approved modifiers.
        response = await networkObj.contract.submitTransaction('readDigitalAsset', assetId);
        let JSONResponse = JSON.parse(response).data;
        let assetName = JSONResponse.assetName;
        if (modifiedBy === JSONResponse.assetOwner || (JSONResponse.approvedUsers && JSONResponse.approvedUsers.includes(modifiedBy))) {
            //can directly update existing file.
            //Upload object to COS and obtain it's link.
            console.log('Case 1 - modifier is owner or approved user.');
            response = await this.putObject(assetId, digitalAssetFileBuffer, digitalAssetFileType);

            if (response.err) {
                let apiResponse = {};
                apiResponse.err = 'File could not be uploaded to COS';
                return JSON.stringify(apiResponse);
            }
            console.log('File uploaded to COS');

            // Step 4: Update blockchain
            response = await networkObj.contract.submitTransaction('updateDigitalAsset', assetId, assetHash, modifiedBy);
            //send email to asset owner
            networkObj.event_hub.connect(true);
            let regid = networkObj.event_hub.registerChaincodeEvent(smartContractName, 'UpdateDigitalAssetEvent-' + assetId, function(event) {
                console.log(`Inside event hub code - The Digital Asset ${assetId} was successfully updated.`);
                let eventPayload = JSON.parse(event.payload.toString());
                let assetOwner = eventPayload.assetOwner;
                let modifiedTimestamp = new Date(eventPayload.modifiedTimestamp).toLocaleString();

                let transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    auth: {
                        user: smtpUserName,
                        pass: smtpPassword
                    }
                });

                let mailOptions = {
                    from: senderEmail,
                    to: assetOwner,
                    subject: 'Your digital asset was updated recently',
                    html: '<h1>Your digital asset was updated recently.</h1>' +
                        '<h2>Details:</h2>' +
                        '<p>Asset Id: ' + assetId + '<br/>' +
                        '<p>Asset Name: ' + assetName + '<br/>' +
                        'Updated By: ' + modifiedBy + '<br/>' +
                        'Update Timestamp: ' + new Date(modifiedTimestamp) + '<br/>' +
                        '</p>'
                };
                console.log('sending case 1 email now');
                transporter.sendMail(mailOptions, function(error) {
                    if (error) {
                        throw new Error(error);
                    } else {
                        console.log(`Successfully sent an email notification to the asset owner ${assetOwner}`);
                        networkObj.event_hub.unregisterChaincodeEvent(regid);
                    }
                });
            });
        } else {
            console.log('Case 2 - modifier is not an approved user.');
            //not an already approved user
            //upload file to COS with a different name i.e. <name>_<timestamp>.ext

            //Step 1: Upload file to COS with timestamp.
            let ext = path.extname(assetName);
            let temp_assetName = assetName.substring(0, assetName.indexOf(ext)) + '_' + new Date().getTime() + ext;
            response = await this.putObject(temp_assetName, digitalAssetFileBuffer, digitalAssetFileType);

            if (response.err) {
                return 'File could not be uploaded to COS';
            }
            console.log('File uploaded to COS');

            //Step 2 - update blockchain to include this entry under response.modificationsPendingApproval
            response = await networkObj.contract.submitTransaction('addPendingModificationToDigitalAsset', assetId, temp_assetName, assetHash, modifiedBy);
            console.log('added pending modification to asset');
            //send email to asset owner
            networkObj.event_hub.connect(true);
            let regid = networkObj.event_hub.registerChaincodeEvent(smartContractName, 'AddPendingModificationToDigitalAssetEvent-' + assetId, function(event) {
                console.log(`Inside event hub code - The ModificationPendingApproval was added to the Digital Asset ${assetId} successfully.`);
                let eventPayload = JSON.parse(event.payload.toString());
                let assetOwner = eventPayload.assetOwner;
                let modifiedTimestamp = new Date(eventPayload.modifiedTimestamp).toLocaleString();

                let transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    auth: {
                        user: smtpUserName,
                        pass: smtpPassword
                    }
                });

                let mailOptions = {
                    from: senderEmail,
                    to: assetOwner,
                    subject: 'Somebody has requested to update your digital asset.',
                    html: '<h1>Somebody has requested to update your digital asset.</h1>' +
                        '<h2>Details:</h2>' +
                        '<p>Asset Id: ' + assetId + '<br/>' +
                        'Updated By: ' + modifiedBy + '<br/>' +
                        'Update Timestamp: ' + new Date(modifiedTimestamp) + '<br/>' +
                        '</p>' +
                        '<b>Please visit the <a href="http://localhost:8080/?#/viewAssetModificationRequests">Digital Asset Management website</a> to approve/deny this modification.</b>'
                };
                console.log('sending case 2 email now');
                transporter.sendMail(mailOptions, function(error) {
                    if (error) {
                        throw new Error(error);
                    } else {
                        console.log(`Successfully sent an email notification to the asset owner ${assetOwner}`);
                        networkObj.event_hub.unregisterChaincodeEvent(regid);
                    }
                });
            });
        }

        await networkObj.gateway.disconnect();

        //display a dialog box that indicates that the modification is pending approval
        return response;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return error;
    }
};

//change the ownership of an existing asset
exports.changeOwnershipOfAsset = async function(networkObj, assetId, assetModifier, newAssetOwner) {
    try {
        //Step 1: Update blockchain
        let response = await networkObj.contract.submitTransaction('changeOwnershipOfAsset', assetId, assetModifier, newAssetOwner);
        //if successful, send email to previous and new owners.
        if ('data' in JSON.parse(response)) {
            networkObj.event_hub.connect(true);
            let regid = networkObj.event_hub.registerChaincodeEvent(smartContractName, 'UpdateOwnershipOfAssetEvent-' + assetId, function(event) {
                console.log(`Inside event hub code - The owner of Digital Asset ${assetId} was successfully updated.`);

                let transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    auth: {
                        user: smtpUserName,
                        pass: smtpPassword
                    }
                });

                let mailOptions = {
                    from: senderEmail,
                    to: [assetModifier, newAssetOwner],
                    subject: 'Digital asset was updated recently',
                    html: '<h1>The following digital asset was updated recently.</h1>' +
                        '<h2>Details:</h2>' +
                        '<p>Asset Id: ' + assetId + '<br/>' +
                        'Updated By (Previous Asset Owner): ' + assetModifier + '<br/>' +
                        'New Asset Owner: ' + newAssetOwner + '<br/>' +
                        '</p>'
                };
                transporter.sendMail(mailOptions, function(error) {
                    if (error) {
                        throw new Error(error);
                    } else {
                        console.log(`Successfully sent an email notification to the previous asset owner ${assetModifier} and the new asset owner ${newAssetOwner}`);
                        networkObj.event_hub.unregisterChaincodeEvent(regid);
                    }
                });
            });
        }

        await networkObj.gateway.disconnect();
        return response;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return error;
    }
};

//process an asset modification request
exports.processAssetModRequest = async function(networkObj, assetId, assetModId, emailAddress, approve, addApprovedUser) {
    try {
        //Step 1: Get the modificationPendingApproval
        let response = await networkObj.contract.submitTransaction('getModificationPendingApprovalFromAsset', assetId, assetModId);
        if ('err' in JSON.parse(response)) {
            // no modification pending approval found.
            console.error(JSON.parse(response).err);
        } else {
            //modification pending approval was found
            let modificationPendingApproval = JSON.parse(response).data;

            //Step 2: Add modifier to approvedUsers
            if (addApprovedUser) {
                await networkObj.contract.submitTransaction('addApprovedModifierToDigitalAsset', assetId, modificationPendingApproval.lastModifiedBy);
            }

            let approvalSuccess = false;
            if (approve) {
                //Step 3: Move in COS
                response = await this.moveObject(assetModId, assetId);
                if (response.data) {
                    //successfully moved in COS
                    //Step 4: Update blockchain
                    response = await networkObj.contract.submitTransaction('updateDigitalAsset', assetId, modificationPendingApproval.modFileHash, modificationPendingApproval.lastModifiedBy);
                    if ('data' in JSON.parse(response)) {
                        //successfully updated blockchain
                        approvalSuccess = true;
                    }
                }
            } else {
                //Step 3: Delete in COS
                response = await this.deleteObject(assetModId);
                if (response.err) {
                    //not successfully deleted in COS
                    console.error(response.err);
                }
            }
            //Step 5: Delete modification from list of pending mods
            if (!approve || (approve && approvalSuccess)) {
                //either no update was needed, or update was needed and was successful
                response = await networkObj.contract.submitTransaction('deleteModificationPendingApprovalFromAsset', assetId, assetModId);
                if ('data' in JSON.parse(response)) {
                    //Step 6: Once all the transactions are complete and event notification is received - send an email to both the users.
                    networkObj.event_hub.connect(true);
                    let regid = networkObj.event_hub.registerChaincodeEvent(smartContractName, 'DeleteModificationPendingApprovalFromAssetEvent-' + assetId, function(event) {
                        console.log(`Inside event hub code - The Digital Asset modification request for ${assetId} was successfully processed.`);
                        // obtain the assetModifier's email address
                        let eventPayload = JSON.parse(event.payload.toString());
                        let assetModifier = modificationPendingApproval.lastModifiedBy;
                        let modifiedTimestamp = new Date(eventPayload.modifiedTimestamp).toLocaleString();
                        let transporter = nodemailer.createTransport({
                            host: smtpHost,
                            port: smtpPort,
                            auth: {
                                user: smtpUserName,
                                pass: smtpPassword
                            }
                        });
                        //email subject/body should be according to approve and addApprovedUser values.
                        let subject = approve ? 'Digital asset modification request was approved recently' : 'Digital asset modification request was denied recently';
                        let html = '<h1>The following digital asset\'s modification was ' + (approve ? 'approved' : 'denied') + ' recently.</h1>' +
                            '<h2>Details:</h2>' +
                            '<p>Asset Id: ' + assetId + '<br/>';
                        if (approve) {
                            html += 'Approved By (Asset Owner): ' + emailAddress + '<br/>' +
                                'Updated By (Asset Modifier): ' + assetModifier + '<br/>' +
                                'Update Timestamp: ' + new Date(modifiedTimestamp) + '<br/>';
                            if (addApprovedUser) {
                                html += '</p>' + '<br/><br/>' +
                                    '<p>The asset modifier ' + assetModifier +
                                    ' has also been added to the list of approved users for this asset. ' +
                                    'As a result, all future modifications of this asset by ' + assetModifier +
                                    ' will be processed without the need for approval by the Asset Owner ' + emailAddress;
                            }
                        } else {
                            html += 'Denied By (Asset Owner): ' + emailAddress + '<br/>' +
                                'Modification Requested By (Asset Modifier): ' + assetModifier + '<br/>';
                        }
                        html += '</p>';
                        let mailOptions = {
                            from: senderEmail,
                            to: [emailAddress, assetModifier],
                            subject: subject,
                            html: html
                        };
                        transporter.sendMail(mailOptions, function(error) {
                            if (error) {
                                throw new Error(error);
                            } else {
                                console.log(`Successfully sent an email notification to the asset owner ${emailAddress} and the user that requested the modification ${assetModifier}`);
                                networkObj.event_hub.unregisterChaincodeEvent(regid);
                            }
                        });
                    });
                }
            }
        }

        await networkObj.gateway.disconnect();
        return response;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return error;
    }
};

//delete a digital asset
exports.deleteDigitalAsset = async function(networkObj, assetId, assetDeleter) {
    try {
        //Step 1: Get all pending modifications and delete them from COS
        let response = await networkObj.contract.submitTransaction('readDigitalAsset', assetId);
        let JSONResponse = JSON.parse(response).data;
        let modificationsPendingApproval = JSONResponse.modificationsPendingApproval;
        let index = null;
        for (index in modificationsPendingApproval) {
            console.log('Deleting ' + modificationsPendingApproval[index].modFileName + 'from COS.');
            let COS_response = await this.deleteObject(modificationsPendingApproval[index].modFileName);
            if (COS_response.err) {
                console.error(COS_response.err);
            }
        }
        console.log('Deleted all pending modifications for asset ' + assetId);

        //Step 2: Delete from ledger
        response = await networkObj.contract.submitTransaction('deleteDigitalAsset', assetId, assetDeleter);
        if (response.err) {
            console.error(response.err);
            return response;
        }
        await networkObj.gateway.disconnect();

        // Step 3: Delete from COS (actually delete file from COS)
        let COS_response = await this.deleteObject(assetId);
        if (COS_response.err) {
            console.error(COS_response.err);
            return response;
        }
        return response;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return error;
    }
};

exports.downloadDigitalAssetFile = async function(assetId, assetName) {
    let data = {};
    try {
        data = await this.downloadFile(assetId, assetName);
        // console.log(`Data ${JSON.stringify(data)}`);
        return data;
    } catch (e) {
        console.log(e);
    }
    // console.log(`downloadDigitalAssetFile ==>> ${JSON.stringify(data)}`);
    return;
};

exports.getHistoryForDigitalAsset = async function(assetId) {
    let response = {};
    if (!assetId) {
        console.error('Error - no assetId found');
        response.err = 'Error - no assetId found';
    } else {
        let networkObj = await this.connectToNetwork(appAdmin);
        response = await networkObj.contract.submitTransaction('getHistoryForDigitalAsset', assetId);
    }
    return response;
};

exports.registerUser = async function(emailAddress, firstName, lastName) {

    if (!emailAddress || !firstName || !lastName) {
        let response = {};
        response.err = 'Error! You need to fill all fields before you can register!';
        return response;
    }

    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(walletPathPrefix);
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(emailAddress);
        if (userExists) {
            let response = {};
            console.error(`An identity for the user ${emailAddress} already exists in the wallet`);
            response.err = `Error! An identity for the user ${emailAddress} already exists in the wallet.`;
            return response;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(appAdmin);
        if (!adminExists) {
            console.error(`An identity for the admin user ${appAdmin} does not exist in the wallet`);
            console.log('Run the enrollAdmin.js application before retrying');
            let response = {};
            response.err = `An identity for the admin user ${appAdmin} does not exist in the wallet. 
              Run the enrollAdmin.js application before retrying`;
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ enrollmentID: emailAddress, role: 'client' }, adminIdentity);

        const enrollment = await ca.enroll({ enrollmentID: emailAddress, enrollmentSecret: secret });
        const userIdentity = await X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(emailAddress, userIdentity);
        console.log(`Successfully registered user ${firstName} ${lastName}. Use userName ${emailAddress} to login above.`);
        let response = `Successfully registered user ${firstName} ${lastName}. Use userName ${emailAddress} to login above.`;
        return response;
    } catch (error) {
        console.error(`Failed to register user + ${emailAddress} + : ${error}`);
        let response = {};
        response.err = error;
        return response;
    }
};