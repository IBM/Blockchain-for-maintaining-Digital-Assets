<template>
  <div class="posts">
    <div id="table" v-if="this.$route.query.assetId && response.length">
      <table id="assetTable">
        <thead>
          <tr>
            <th>Key</th>
            <th>Record</th>
          </tr>
        </thead>
        <tbody>
          <tr v-bind:key="entry.Key" v-for="entry in response">
            <td>{{entry.Key}}</td>
            <td>{{entry.Record}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <span v-else-if="this.$route.query.assetId">
      No history for the asset with assetId = {{this.$route.query.assetId}}
    </span>
    <span v-else>
      Please provide assetId as a query parameter in the URL: e.g. ../getHistoryForDigitalAsset?assetId=1234
    </span>
  </div>
</template>
<script>
import PostsService from "@/services/apiService";
export default {
  name: "response",
  data() {
    return {
      response: null
    };
  },
  mounted: async function() {
    //get query param of assetId and call getHistoryForDigitalAsset and add that to response.
    this.response = null;
    if(!this.$route.query.assetId){
      this.response = "Error - please provide assetId as a query parameter";
    }
    else{
      const apiResponse = await PostsService.getHistoryForDigitalAsset(this.$route.query.assetId);
      this.response = apiResponse.data;
    }
    console.log(this.response);
    this.$forceUpdate();
  }
};
</script>