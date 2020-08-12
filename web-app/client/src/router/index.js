import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home';
import ShowAllDigitalAssets from '@/components/ShowAllDigitalAssets';
import UploadAsset from '@/components/UploadAsset';
import ViewAssetModificationRequests from '@/components/ViewAssetModificationRequests';
import UpdateAsset from '@/components/UpdateAsset';
import ChangeOwnershipOfAsset from '@/components/ChangeOwnershipOfAsset';
import GetHistoryForDigitalAsset from '@/components/GetHistoryForDigitalAsset';
import Health from '@/components/Health';
Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/showAllDigitalAssets',
            name: 'ShowAllDigitalAssets',
            component: ShowAllDigitalAssets,
            props: true
        },
        {
            path: '/uploadAsset',
            name: 'UploadAsset',
            component: UploadAsset,
            props: true
        },
        {
            path: '/viewAssetModificationRequests',
            name: 'ViewAssetModificationRequests',
            component: ViewAssetModificationRequests,
            props: true
        },
        {
            path: '/updateAsset',
            name: 'UpdateAsset',
            component: UpdateAsset,
            props: true
        },
        {
            path: '/changeOwnershipOfAsset',
            name: 'ChangeOwnershipOfAsset',
            component: ChangeOwnershipOfAsset,
            props: true
        },
        {
            path: '/getHistoryForDigitalAsset',
            name: 'GetHistoryForDigitalAsset',
            component: GetHistoryForDigitalAsset,
            props: true
        },
        {
            path: '/health',
            name: 'Health',
            component: Health
        }
    ]
});