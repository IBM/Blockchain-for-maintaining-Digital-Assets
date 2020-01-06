<template>
  <div class="posts">
    <h1>Upload An Asset</h1>
    <form v-on:submit="uploadDigitalAsset">
      <label for="digitalAsset">Choose the file to upload:</label>
      <input type="file" @change="onFileChange">
      <br><br>
      <input type="submit" value="Upload Digital Asset"/>
    </form>
    <br>
    <span v-if="uploadAssetResponse">
      <b>{{ uploadAssetResponse.data }}</b>
    </span>
    <br>
    <button v-on:click="showAllDigitalAssets()">Back</button> &nbsp;
    <br>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
var fs = require("fs");
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
export default {
  name: "response",
  props: ["emailaddress"],
  data() {
    return {
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
      response: null
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {

    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.uploadAssetData.digitalAssetFile = files[0];
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

    async uploadDigitalAsset() {
      this.runSpinner();
      if(this.uploadAssetData.digitalAssetFile){
        this.uploadAssetData.digitalAssetFileName = this.uploadAssetData.digitalAssetFile.name;
        this.uploadAssetData.digitalAssetFileBuffer = await this.readFileAsync(this.uploadAssetData.digitalAssetFile);
        const apiResponse = await PostsService.createDigitalAsset(this.uploadAssetData.digitalAssetFileName, this.uploadAssetData.digitalAssetFile.type, this.uploadAssetData.digitalAssetFileBuffer, this.$route.params.emailaddress);
        if(apiResponse.data.err){
          this.uploadAssetResponse.data = apiResponse.data.err + " See the asset with assetId = " + apiResponse.data.existingAsset.assetId;
        }
        else{
          this.uploadAssetResponse.data = apiResponse.data.data;
        }
      }
      else{
        this.uploadAssetResponse.data = "Please choose a file and then click \"Upload Digital Asset\".";
      }
      this.hideSpinner();
    },

    async showAllDigitalAssets() {
      this.runSpinner();
      const apiResponse = await PostsService.queryAllDigitalAssets(this.$route.params.emailaddress);
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
      this.$router.push({ name: 'Home', params: {reroute: 'UploadAsset'}});
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