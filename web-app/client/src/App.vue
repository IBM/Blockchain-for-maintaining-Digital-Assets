<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">    
      <h4 v-if=$route.params.emailaddress>Logged in as {{$route.params.emailaddress}}.
      <router-link to="/">Logout?</router-link>&nbsp;</h4>
      <router-view></router-view>
    </div>
</template>

<script>
export default {
  name: 'app'  
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.chart-wrapper {
  width: 100%;
  height: 700px;
}
#loader {
  position:fixed;
  padding-top: 250px;
}
.chart-wrapper {
  position:fixed;
  padding-left:32%;
}
</style>
