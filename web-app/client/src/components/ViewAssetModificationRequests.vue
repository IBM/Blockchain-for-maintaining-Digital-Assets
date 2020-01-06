<template>
  <div class="posts">
    <h1>View Asset Modification Requests</h1>
    <div>
      <button v-on:click="showAllDigitalAssets()">Back</button> &nbsp;
      <br>
      <br>
      <button :disabled="this.pickedMod === null" v-on:click="processAssetModRequest(true)">Approve</button> &nbsp;
      <button :disabled="this.pickedMod === null" v-on:click="processAssetModRequest(false)">Deny</button> &nbsp;
      <br>
      <br>
    </div>
    <div>
      <div id="table" v-if=$route.params.apiresponse>
        <table id="mainTable">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Asset Name</th>
              <th>Last Modified By</th>
              <th>Last Modified On</th>
            </tr>
          </thead>
          <tbody v-bind:key="assetEntry.Key" v-for="assetEntry in $route.params.apiresponse">
            <tr v-on:click="setPicked(assetEntry.Key)" :class="{ opened: opened === assetEntry.Key }" 
                  v-on:change="clearError" name="picked" :value=assetEntry.Key>
              <td>{{assetEntry.Record.assetId}}</td>
              <td>{{assetEntry.Record.assetName}}</td>
              <td>{{assetEntry.Record.lastModifiedBy}}</td>
              <td>{{prettyPrintDate(assetEntry.Record.modifiedTimestamp)}}</td>
            </tr>
            <tr v-if="opened === assetEntry.Key">
              <td colspan="5">
                <table id="subTable">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Asset Name</th>
                      <th>Added By</th>
                      <th>Added On</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-bind:key="modification.modFileName" v-for="modification in getModificationsForPickedAsset(opened)">
                      <td><input type="radio" id="assetMods" v-model="pickedMod" v-on:change="clearError" name="pickedMod" :value=modification.modFileName>
                      <label for="assetMods"></label></td>
                      <td>{{modification.modFileName}}</td>
                      <td>{{modification.lastModifiedBy}}</td>
                      <td>{{prettyPrintDate(modification.modifiedTimestamp)}}</td>
                      <td><a href="#" v-on:click="downloadFile(modification.modFileName)" download=modification.modFileName>Download</a></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <span v-if="response">
      <b>{{ response }}</b>
    </span>
    <v-dialog/>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
var fs = require("fs");
var dateFormat = require('dateformat');
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
export default {
  name: "response",
  props: ["emailaddress"],
  data() {
    return {
      opened: null,
      input: {},
      uploadAssetData: {
        digitalAssetFile: null,
        digitalAssetFileName: null,
        digitalAssetFileBuffer: null
      },
      uploadAssetResponse: {
        data: ""
      },
      assetDataURL: null,
      response: null,
      picked: null,
      errorMsg: null,
      pickedMod: null,
      addApprovedUser: null
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    clearError(){
      this.errorMsg = null;
    },
    prettyPrintDate(timestamp){
      if(timestamp)
        return dateFormat(new Date(timestamp), "mmm d, yyyy, h:MM:ss TT");
      else
        return null;
    },
    findElement(array, key) {
      if(array.length > 0 && array[0].Key){
        for (var i=0; i < array.length; i++)
          if (array[i].Key === key)
            return array[i];
      }
      else if(array.length > 0 && array[0].modFileName){
        for (var i=0; i < array.length; i++)
          if (array[i].modFileName === key)
            return array[i];
      }
    },
    getModificationsForPickedAsset(picked){
      let currentAsset = this.findElement(this.$route.params.apiresponse,picked);
      return currentAsset.Record.modificationsPendingApproval;
    },
    setPicked(assetId) {
    	if (this.opened != assetId){
        this.opened = assetId;
        this.picked = assetId;
			}
    },
    async downloadFile(assetId) {
      this.errorMsg = null;
      this.response = null;
      this.runSpinner();
      let allModsForThisAsset = this.getModificationsForPickedAsset(this.picked);
      let currentMod = this.findElement(allModsForThisAsset,assetId);
      const apiResponse = await PostsService.downloadDigitalAssetFile(assetId, currentMod.modFileName);
      this.$modal.show('dialog', {
        title: 'Success!',
        text: 'The asset ' + currentMod.modFileName + ' will be downloaded to the web-app/client/downloads folder.',
        buttons: [
          {
            title: 'Close',
            default: true
          }
        ]
      });
      this.pickedMod = null;
      this.$forceUpdate();
      this.hideSpinner();
    },
    async processAssetModRequest(choice) {
      //choice can be true (approve) or false (deny)
      //console.log("processing asset mod request - choice is: "+ choice);
      this.response = null;
      this.runSpinner();
      this.addApprovedUser = false;
      if(confirm('Do you really want to ' + (choice?'approve':'deny') + ` this modification to ${this.picked}?`)){
        if(choice){
          if(confirm('Would you also like to add this user as an approved modifier for this asset? \nNote: This would mean that all future modifications to this asset by this user would be directly applied.')){
            this.addApprovedUser = true;
          }
        }
        //console.log("approve = " + choice);
        //console.log("add approved user = " + this.addApprovedUser);
        //make network call to approve/deny the modification.
        const apiResponse = await PostsService.processAssetModRequest(this.picked, this.pickedMod, this.$route.params.emailaddress, choice, this.addApprovedUser);
        //refresh data for this vue
        await this.getDataForThisVue();
      }
      this.hideSpinner();
    },
    async showAllDigitalAssets() {
      console.log("Showing all digital assets");
      this.response = null;
      this.runSpinner();
      const apiResponse = await PostsService.queryAllDigitalAssets(this.$route.params.emailaddress);
      this.response = apiResponse.data;
      this.$route.params.apiresponse = apiResponse.data;
      this.$router.push({ name: 'ShowAllDigitalAssets', params: { emailaddress: this.$route.params.emailaddress, apiresponse: apiResponse.data, tableheading: "Digital Assets"}});
      this.hideSpinner();
    },
    async getDataForThisVue(){
      const apiResponse = await PostsService.queryDigitalAssetsByUser(this.$route.params.emailaddress);
      this.$route.params.apiresponse = [];
      for (var i=0; i < apiResponse.data.length; i++) {
        if (apiResponse.data[i].Record.modificationsPendingApproval.length > 0){
          this.$route.params.apiresponse.push(apiResponse.data[i]);
        }
      }
      this.$forceUpdate();
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  },
  mounted: async function() {
    //if we reached here before logging in, redirect the user to login, and when login is successful, bring them back here.
    if(!this.$route.params.emailaddress){
      this.$router.push({ name: 'Home', params: {reroute: 'ViewAssetModificationRequests'}});
    }
    await this.getDataForThisVue();
  }
};
</script>

<style>

#mainTable {
  font-family: 'Open Sans', sans-serif;
  width: 80%;
  border-collapse: collapse;
  border: 3px solid #44475C;
  margin: 0 auto;
}

#mainTable th {
  text-transform: uppercase;
  text-align: left;
  background: #44475C;
  color: #FFF;
  padding: 8px;
  min-width: 30px;
}

#mainTable td {
  text-align: left;
  padding: 8px;
  border-right: 2px solid #7D82A8;
}

#mainTable tbody tr:nth-child(2n) td {
  background: #D4D8F9;
  border: 2px solid #44475C;
}

#mainTable tbody tr:nth-child(2n+1) td {
  background: #FFFFFF;
  border: 2px solid #44475C;
}

#subTable {
  font-family: 'Open Sans', sans-serif;
  width: 80%;
  border-collapse: collapse;
  border: 3px solid #44475C;
  margin: 0 auto;
}

#subTable th {
  text-transform: uppercase;
  text-align: left;
  background: #44475C;
  color: #FFF;
  padding: 8px;
  min-width: 30px;
}

#subTable td {
  text-align: left;
  padding: 8px;
  border-right: 2px solid #7D82A8;
}
#subTable td:last-child {
  border-right: none;
}

#subTable tbody tr:nth-child(2n) td {
  background: #74EBB6;
}

#subTable tbody tr:nth-child(2n+1) td {
  background: #FFFFFF;
}

form { 
  display: inline-block; 
}

input[type=submit] {
  font-size: 2em;
  font: bold arial, sans-serif;
}

input[type=file] {
  font-size: 1em;
  font: bold arial, sans-serif;
}

button {
  font-size: 0.81em;
  font: bold, arial, sans-serif;
}
</style>