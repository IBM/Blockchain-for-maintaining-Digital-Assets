import Api from '@/services/api';



export default {
    registerUser(emailAddress, firstName, lastName) {
        return Api().post('registerUser', {
            emailAddress: emailAddress,
            firstName: firstName,
            lastName: lastName,
        });

    },
    validateUser(emailAddress) {
        return Api().post('validateUser', {
            emailAddress: emailAddress
        });
    },
    queryAllDigitalAssets(emailAddress) {
        return Api().post('queryAllDigitalAssets', {
            emailAddress: emailAddress
        });
    },
    queryDigitalAssetsByUser(emailAddress) {
        return Api().post('queryDigitalAssetsByUser', {
            emailAddress: emailAddress
        });
    },
    readDigitalAsset(emailAddress, assetId) {
        return Api().post('readDigitalAsset', {
            assetId: assetId,
            emailAddress: emailAddress
        });
    },
    createDigitalAsset(digitalAssetFileName, digitalAssetFileType, digitalAssetFileBuffer, emailAddress) {
        return Api().post('createDigitalAsset', {
            digitalAssetFileName: digitalAssetFileName,
            digitalAssetFileType: digitalAssetFileType,
            digitalAssetFileBuffer: digitalAssetFileBuffer,
            emailAddress: emailAddress
        });
    },
    viewAssetModificationRequests(emailAddress) {
        return Api().post('viewAssetModificationRequests', {
            emailAddress: emailAddress
        });
    },
    updateDigitalAsset(digitalAssetFileName, digitalAssetFileType, digitalAssetFileBuffer, emailAddress) {
        return Api().post('updateDigitalAsset', {
            digitalAssetFileName: digitalAssetFileName,
            digitalAssetFileType: digitalAssetFileType,
            digitalAssetFileBuffer: digitalAssetFileBuffer,
            emailAddress: emailAddress
        });
    },
    changeOwnershipOfAsset(assetId, assetModifier, newAssetOwner) {
        return Api().post('changeOwnershipOfAsset', {
            assetId: assetId,
            assetModifier: assetModifier,
            newAssetOwner: newAssetOwner
        });
    },
    processAssetModRequest(assetId, assetModId, emailAddress, approve, addApprovedUser) {
        return Api().post('processAssetModRequest', {
            assetId: assetId,
            assetModId: assetModId,
            emailAddress: emailAddress,
            approve: approve,
            addApprovedUser: addApprovedUser
        });
    },
    deleteDigitalAsset(assetId, emailAddress) {
        return Api().post('deleteDigitalAsset', {
            assetId: assetId,
            emailAddress: emailAddress
        });
    },
    downloadDigitalAssetFile(assetId, assetName) {
        return Api().post('downloadDigitalAssetFile', {
                assetId: assetId,
                assetName: assetName
            }).then(function(response) {

                console.log('barry about to write file');

                // console.log(response);
                return response.data.link;
                /*console.log(response);
                // eslint-disable-next-line no-undef
                let contentType = response.data.ContentType;
                let data = response.data.Body.data;


                const base64Image = Buffer.from(data, 'binary').toString('base64');
                const decodedImage = new Buffer.from(base64Image, 'base64').toString('utf8');

                const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
                    const byteCharacters = atob(b64Data);
                    const byteArrays = [];

                    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                        const slice = byteCharacters.slice(offset, offset + sliceSize);

                        const byteNumbers = new Array(slice.length);
                        for (let i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }

                        const byteArray = new Uint8Array(byteNumbers);
                        byteArrays.push(byteArray);
                    }

                    const blob = new Blob(byteArrays, { type: contentType });
                    return blob;
                };

                const blob = b64toBlob(decodedImage.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), contentType);
                // const blobUrl = URL.createObjectURL(blob);

                // eslint-disable-next-line no-undef
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);

                link.download = assetName;
                link.click();
                URL.revokeObjectURL(link.href);
                */
                console.log('barry returning from write file');
                //end barry hack

            })
            .catch(function(error) {
                console.log(error);
            });


    },
    getHistoryForDigitalAsset(assetId) {
        return Api().post('getHistoryForDigitalAsset', {
            assetId: assetId
        });
    }
};