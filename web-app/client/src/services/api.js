import axios from 'axios';

export default () => {
    return axios.create({
        baseURL: 'http://52.117.161.89:30002'
    });
};