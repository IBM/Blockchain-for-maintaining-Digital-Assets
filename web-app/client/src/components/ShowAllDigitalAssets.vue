<template>

  <div class="posts">
    <button v-on:click="queryAllDigitalAssets()">Query All Digital Assets</button> &nbsp;
    <button v-on:click="queryDigitalAssetsByUser()">Query My Digital Assets</button> &nbsp;
    <button v-on:click="uploadDigitalAsset()">Upload New Asset</button> &nbsp;
    <button v-on:click="viewAssetModificationRequests()">View Asset Modification Requests</button> &nbsp;
    <h1>{{$route.params.tableheading}}</h1>
    <div id="table">
      <table id="assetTable" v-if=$route.params.apiresponse>
        <thead>
          <tr>
            <th></th>
            <th>Asset ID</th>
            <th>Asset Name</th>
            <th>Asset Owner</th>
            <th>Added On</th>
            <th>Last Modified By</th>
            <th>Last Modified On</th>
          </tr>
        </thead>
        <tbody>
          <tr v-bind:key="assetEntry.Key" v-for="assetEntry in $route.params.apiresponse">
            <td><input type="radio" id="assets" v-model="picked" v-on:change="clearError" name="picked" :value=assetEntry.Key>
            <label for="assets"></label></td>
            <td>{{assetEntry.Record.assetId}}</td>
            <td>{{assetEntry.Record.assetName}}</td>
            <td>{{assetEntry.Record.assetOwner}}</td>
            <td>{{prettyPrintDate(assetEntry.Record.createTimestamp)}}</td>
            <td>{{assetEntry.Record.lastModifiedBy}}</td>
            <td>{{prettyPrintDate(assetEntry.Record.modifiedTimestamp)}}</td>
          </tr>
        </tbody>
      </table>
      <br>
      <span v-if=picked>You have selected <b>{{picked}}</b><br><br></span>
      <span v-if=errorMsg>{{errorMsg}}<br><br></span>
    </div>
    <button v-on:click="updateDigitalAsset()">Update Digital Asset</button> &nbsp;
    <button v-on:click="changeOwnershipOfAsset()">Change Ownership of Asset</button> &nbsp;
    <button v-on:click="deleteDigitalAsset()">Delete Digital Asset</button> &nbsp;
    <button v-on:click="downloadFile(picked)">Download Digital Asset</button> &nbsp;
    <v-dialog/>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>
<script>
var dateFormat = require('dateformat');
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
export default {
  name: "response",
  props: ["emailaddress", "selectedasset", "assetrecord"],
  data() {
    return {
      input: {},
      picked: null,
      response: null,
      errorMsg: null
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    prettyPrintDate(timestamp){
      if(timestamp)
        return dateFormat(new Date(timestamp), "mmm d, yyyy, h:MM:ss TT");
      else
        return null;
    },

    findElement(array, key) {
      for (var i=0; i < array.length; i++)
        if (array[i].Key === key)
          return array[i];

      // will return undefined if not found; you could return a default instead
    },
    clearError(){
      this.errorMsg = null;
    },
    async queryAllDigitalAssets() {
      this.picked = null;
      this.errorMsg = null;
      this.response = null;
      this.runSpinner();
      const apiResponse = await PostsService.queryAllDigitalAssets(this.$route.params.emailaddress);
      this.response = apiResponse.data;
      this.$route.params.apiresponse = apiResponse.data;
      this.$route.params.tableheading = "Digital Assets";
      this.$forceUpdate();
      this.hideSpinner();
    },
    async queryDigitalAssetsByUser() {
      this.picked = null;
      this.errorMsg = null;
      this.response = null;
      this.runSpinner();
      const apiResponse = await PostsService.queryDigitalAssetsByUser(this.$route.params.emailaddress);
      this.response = apiResponse.data;
      this.$route.params.apiresponse = apiResponse.data;
      this.$route.params.tableheading = "Digital Assets Owned by Me";
      this.$forceUpdate();
      this.hideSpinner();
    },
    async downloadFile(assetId) {
      this.errorMsg = null;
      this.response = null;
      this.runSpinner();
      if (this.picked === null){
        console.error('Error - no asset was selected.')
        this.errorMsg = "Please select an asset first!";
        this.$forceUpdate();
        await this.hideSpinner();
      }
      else{
        let thisEntry = this.findElement(this.$route.params.apiresponse, this.picked);
        const apiResponse = await PostsService.downloadDigitalAssetFile(assetId, thisEntry.Record.assetName);
        this.$modal.show('dialog', {
          title: 'Success!',
          // text: 'The asset ' + thisEntry.Record.assetName + ' will be downloaded to the web-app/client/downloads folder.',
          text: 'The asset ' + thisEntry.Record.assetName + ' can be downloaded from <br>' + '<a href="'+apiResponse+'">Download File</a>',
          buttons: [
            {
              title: 'Close',
              default: true
            }
          ]
        })
        this.picked = null;
        this.$forceUpdate();
        this.hideSpinner();
      }
    },
    async uploadDigitalAsset() {
      await this.runSpinner();
      this.$router.push({ name: 'UploadAsset', params: { emailaddress: this.$route.params.emailaddress}});
      this.$forceUpdate();
      await this.hideSpinner();
    },
    async viewAssetModificationRequests() {
      await this.runSpinner();
      this.$router.push({ name: 'ViewAssetModificationRequests', params: { emailaddress: this.$route.params.emailaddress}});
      this.$forceUpdate();
      await this.hideSpinner();
    },
    async updateDigitalAsset() {
      await this.runSpinner();
      this.response = null; 
      //error checking for making sure a file has been selected.
      if (this.picked === null ) {
        console.error('Error - no asset was selected.')
        this.errorMsg = "Please select an asset first!";
        this.$forceUpdate();
        await this.hideSpinner();
      }
      else{
        let thisEntry = this.findElement(this.$route.params.apiresponse, this.picked);
        if (thisEntry.Record.assetId === this.picked){
          this.$router.push({ name: 'UpdateAsset', params: { emailaddress: this.$route.params.emailaddress, selectedasset: this.picked, assetrecord: thisEntry.Record}});
        }
        this.$forceUpdate();
        await this.hideSpinner();
      }
    },
    async changeOwnershipOfAsset() {
      await this.runSpinner();
      this.response = null; 
      //error checking for making sure a file has been selected.
      if (this.picked === null ) {
        console.error('Error - no asset was selected.')
        this.errorMsg = "Please select an asset first!";
        this.$forceUpdate();
        await this.hideSpinner();
      //error checking for making sure a user has logged in.
      } else if (this.$route.params.emailaddress === undefined) {
        this.errorMsg = 'Error - no emailAddress found. Please login first.';
        console.error(this.errorMsg);
        this.$router.push({ name: 'Home'});
        this.$forceUpdate();
        await this.hideSpinner();
      //error checking to make sure user owns the asset.
      } else if (this.findElement(this.$route.params.apiresponse, this.picked).Record.assetOwner !== this.$route.params.emailaddress){
        console.error('Error - user does not own this asset.')
        this.errorMsg = "Cannot change ownership of this asset. It is not owned by the user!";
        this.$forceUpdate();
        await this.hideSpinner();
      }
      //all good - move over to changeOwnership screen.
      else {
        let entry = 0;
        for(entry in this.$route.params.apiresponse){
          if (this.$route.params.apiresponse[entry].Record.assetId === this.picked){
            this.$router.push({ name: 'ChangeOwnershipOfAsset', params: { emailaddress: this.$route.params.emailaddress, selectedasset: this.picked, assetrecord: this.$route.params.apiresponse[entry].Record}});
          }
        }
        this.$forceUpdate();
        await this.hideSpinner();
      }
    },
    async deleteDigitalAsset() {
      await this.runSpinner();
      this.response = null; 
      //error checking for making sure a file has been selected.
      if (this.picked === null ) {
        console.error('Error - no asset was selected.')
        this.errorMsg = "Please select an asset first!";
        this.$forceUpdate();
        await this.hideSpinner();
      
      } else if (this.$route.params.emailaddress === undefined) {
        this.errorMsg = 'Error - no emailAddress found.';
        console.error(this.errorMsg);
        this.$router.push({ name: 'Home'});
        this.$forceUpdate();
        await this.hideSpinner();

      } else if (this.findElement(this.$route.params.apiresponse, this.picked).Record.assetOwner !== this.$route.params.emailaddress){
        console.error('Error - user does not own this asset.')
        this.errorMsg = "Cannot delete this asset. It is not owned by the user!";
        this.$forceUpdate();
        await this.hideSpinner();
      }
      else {
        this.errorMsg = null;
        //confirm if this is the asset that the user wants to delete
        if(confirm(`Do you really want to delete ${this.picked}?`)){
          const apiResponse = await PostsService.deleteDigitalAsset(this.picked, this.$route.params.emailaddress);
          this.response = apiResponse.data;
          this.$route.params.apiresponse = apiResponse.data;
          this.$modal.show('dialog', {
            title: 'Success!',
            text: 'The asset ' + this.picked + ' was deleted successfully.',
            buttons: [
              {
                title: 'Close',
                default: true
              }
            ]
          });
          if (this.$route.params.tableheading === "Digital Assets"){
            await this.queryAllDigitalAssets();
          }
          else {
            await this.queryDigitalAssetsByUser(this.$route.params.emailaddress);
          }
          this.$forceUpdate();
          this.response = "Successfully deleted asset from COS and blockchain"
          this.picked = null;
        }
        await this.hideSpinner();
      }
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  },
  mounted: async function() {
    //if we reached here before logging in, redirect the user to login
    if(!this.$route.params.emailaddress){
      this.$router.push({ name: 'Home'});
    }
  }
};
</script>

<style>
#assetTable {
  font-family: 'Open Sans', sans-serif;
  width: 80%;
  border-collapse: collapse;
  border: 3px solid #44475C;
  margin: 0 auto;
}

#assetTable th {
  text-transform: uppercase;
  text-align: left;
  background: #44475C;
  color: #FFF;
  padding: 8px;
  min-width: 30px;
}

#assetTable td {
  text-align: left;
  padding: 8px;
  border-right: 2px solid #7D82A8;
}
#assetTable td:last-child {
  border-right: none;
}

#assetTable tbody tr:nth-child(2n) td {
  background: #D4D8F9;
}

#assetTable tbody tr:nth-child(2n+1) td {
  background: #FFFFFF;
}

form { 
  display: inline-block; 
}

input[type=submit] {
  font-size: 2em;
}

button {
  font-size: 0.81em;
}
</style>