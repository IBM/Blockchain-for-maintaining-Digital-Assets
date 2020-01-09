<template>
  <div class="posts">
    <h1>Digital Asset Management</h1>
    <h3>Login below:</h3>
    <form v-on:submit="validateUser">
      <input type="text" v-model="loginData.emailAddress" placeholder="Enter Email address">
      <br>
      <input type="submit" value="Login">
      <br>
      <br>
      <span v-if="loginReponse">
        <b>{{ loginReponse.data }}</b>
      </span>
      <br>
    </form>

    <br>
    <h3>Otherwise, fill out the form below to register:</h3>
    <form v-on:submit="registerUser">
      <input type="text" v-model="registerData.emailAddress" placeholder="Enter Email address">
      <br>
      <input type="text" v-model="registerData.firstName" placeholder="Enter First name">
      <br>
      <input type="text" v-model="registerData.lastName" placeholder="Enter Last name">
      <br>
      <input type="submit" value="Register">
    </form>
    <br>
    <span v-if="registerReponse">
      <b>{{ registerReponse.data }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>
<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "response",
  props: ["emailaddress", "apiresponse", "tableheading", "reroute"],
  data() {
    return {
      loginData: {},
      registerData: {},
      registerReponse: {
        data: ""
      },
      loginReponse: {
        data: ""
      }
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    
    async registerUser() {
      this.loginReponse = null;
      await this.runSpinner();
      const apiResponse = await PostsService.registerUser(
        this.registerData.emailAddress,
        this.registerData.firstName,
        this.registerData.lastName
      );

      this.registerReponse = apiResponse;
      await this.hideSpinner();
    },
    
    async validateUser() {
      this.registerReponse = null;
      await this.runSpinner();
      if (!this.loginData.emailAddress) {
        let response = 'Please enter an Email Address';
        this.loginReponse.data = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.validateUser(
          this.loginData.emailAddress
        );
        if (apiResponse.data.err) {
          this.loginReponse.data = apiResponse.data.err;
        } 
        else if (this.$route.params.reroute){
          this.$router.push({ name: this.$route.params.reroute, params: { emailaddress: this.loginData.emailAddress}});
        }else {
          const apiResponse = await PostsService.queryAllDigitalAssets(this.loginData.emailAddress);
          this.$router.push({ name: 'ShowAllDigitalAssets', params: { emailaddress: this.loginData.emailAddress, apiresponse: apiResponse.data, tableheading: "Digital Assets"}});
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
  }
};
</script>