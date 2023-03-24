/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
import { showAlert } from './alerts';
import axios from 'axios';

export const logout = async () => {
  try {
    const res = await axios(
      {
        method: 'GET',
        // url: 'http://localhost:5000/api/v1/users/logout',
        url: '/api/v1/users/logout'
      },
      {
        withCredentials: true,
        credentials: 'include'
      }
    );

    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! Please try again');
  }
};
