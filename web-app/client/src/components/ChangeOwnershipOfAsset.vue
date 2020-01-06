<template>
  <div class="posts">
    <h1>Change Ownership of Asset</h1>
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
    <form v-on:submit="changeOwnershipOfAsset">
      <input type="text" v-model="changeOwnershipData.emailAddress" placeholder="Enter Email address of new owner">
      <br><br>
      <input type="submit" value="Change Owner of Asset"/>
    </form>
    <br>
    <span v-if="changeOwnershipResponse">
      <b>{{ changeOwnershipResponse.data }}</b>
    </span>
    <br>
    <button v-on:click="showAllDigitalAssets()">Back</button> &nbsp;
    <br>
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
      input: {},
      changeOwnershipData: {
        emailAddress: null
      },
      changeOwnershipResponse: {
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

    async changeOwnershipOfAsset() {
      console.log("Changing ownership of asset");
      this.response = null;
      this.runSpinner();
      if (this.changeOwnershipData.emailAddress === null || this.changeOwnershipData.emailAddress === ""){
        this.changeOwnershipResponse.data = "Please enter the email address for the new owner.";
      }
      else {
        const apiResponse = await PostsService.changeOwnershipOfAsset(this.$route.params.assetrecord.assetId, this.$route.params.emailaddress, this.changeOwnershipData.emailAddress);
        const readResponse = await PostsService.readDigitalAsset(this.$route.params.emailaddress, this.$route.params.selectedasset);
        this.$route.params.assetrecord = readResponse.data.data;
        this.$forceUpdate();
        this.changeOwnershipResponse.data = apiResponse.data.data;
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