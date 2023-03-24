/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios(
      {
        // no need to import axios right here, we import by cdn, we use parcel then we use npm
        method: 'POST',
        // url: 'http://localhost:5000/api/v1/users/login', // this has been saved the jwt in cookies -> localhost:5000 != http://127.1.0.0
        url: '/api/v1/users/login', // this work as in pug
        data: {
          email,
          password
        }
      },
      {
        withCredentials: true,
        credentials: 'include'
      }
    );

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data);
  }
};
