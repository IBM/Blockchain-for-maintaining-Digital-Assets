import axios from 'axios';

export default() => {
    let apiHost = process.env.VUE_APP_API_HOST;
    let apiPort = process.env.VUE_APP_API_PORT;

    if (!apiHost){
        apiHost = "localhost";
    }
    if (!apiPort) {
        apiPort = "8081";
    }
    return axios.create({
        baseURL: "http://" + apiHost + ":" + apiPort
    });
};
