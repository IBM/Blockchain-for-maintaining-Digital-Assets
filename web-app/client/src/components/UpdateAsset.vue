<template>
  <div class="posts">
    <h1>Update Asset</h1>
    <div id="table">
      <table id="assetTable" v-if=$route.params.assetrecord>
        <thead>
          <tr>
            <th>Asset ID</th>
            <th>Asset Name</th>
            <th>Asset Owner</th>
            <th>Added On</th>
            <th>Last Modified By</th>
            <th>Last Modified On</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{$route.params.assetrecord.assetId}}</td>
            <td>{{$route.params.assetrecord.assetName}}</td>
            <td>{{$route.params.assetrecord.assetOwner}}</td>
            <td>{{prettyPrintDate($route.params.assetrecord.createTimestamp)}}</td>
            <td>{{$route.params.assetrecord.lastModifiedBy}}</td>
            <td>{{prettyPrintDate($route.params.assetrecord.modifiedTimestamp)}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <br>
    <form v-on:submit="updateDigitalAsset">
      <label for="digitalAsset">Choose the file to upload (replace existing file):</label>
      <input type="file" ref="file" id="file" @change="onFileChange">
      <br><br>
      <input type="submit" value="Update Digital Asset"/>
    </form>
    <br>
    <span v-if="updateAssetResponse">
      <b>{{ updateAssetResponse.data }}</b>
    </span>
    <br>
    <button v-on:click="showAllDigitalAssets()">Back</button> &nbsp;
    <br>
    <v-dialog/>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
var fs = require("fs");
var axios = require("axios");
var dateFormat = require('dateformat');
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
export default {
  name: "response",
  props: ["emailaddress"],
  data() {
    return {
      input: {},
      file:'',
      updateAssetData: {
        digitalAssetFile: null,
        digitalAssetFileName: null,
        digitalAssetFileBuffer: null
      },
      updateAssetResponse: {
        data: ""
      },
      response: null
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
    onFileChange(e) {
      console.log("onFileChange")
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.updateAssetData.digitalAssetFile = files[0];
    },
    readFileAsync(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
    },
    async updateDigitalAsset() {
      console.log("Updating asset");
      this.response = null;
      this.runSpinner();
      if(this.updateAssetData.digitalAssetFile){
        this.updateAssetData.digitalAssetId = this.$route.params.selectedasset;
        this.updateAssetData.digitalAssetFileBuffer = await this.readFileAsync(this.updateAssetData.digitalAssetFile);
        const apiResponse = await PostsService.updateDigitalAsset(this.updateAssetData.digitalAssetId, this.updateAssetData.digitalAssetFile.type, this.updateAssetData.digitalAssetFileBuffer, this.$route.params.emailaddress);
        if("pendingApproval" in apiResponse.data){
          //add message dialog
          this.$modal.show('dialog', {
            title: 'Asset update pending approval',
            text: apiResponse.data.data,
            buttons: [
              {
                title: 'Close',
                default: true
              }
            ]
          });
          if("err" in apiResponse.data){
            this.updateAssetResponse.data = apiResponse.data.err;    
          }
          else {
            this.updateAssetResponse.data = apiResponse.data.data;  
          }
        }
        else if ("data" in apiResponse.data) {
          const readResponse = await PostsService.readDigitalAsset(this.$route.params.emailaddress, this.$route.params.selectedasset);
          this.$route.params.assetrecord = readResponse.data.data;
          this.$forceUpdate();
          this.updateAssetResponse.data = apiResponse.data.data;
          
        }
        else {
          this.updateAssetResponse.data = apiResponse.data.err;
        }
      }
      else{
        this.updateAssetResponse.data = "Please choose a file and then click \"Update Digital Asset\".";
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