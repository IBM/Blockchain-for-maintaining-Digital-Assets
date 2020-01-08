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
        });
    },
    getHistoryForDigitalAsset(assetId){
        return Api().post('getHistoryForDigitalAsset', {
            assetId: assetId
        });
    }
};