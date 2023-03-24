import axios from 'axios';
import { showAlert } from './alerts';

export const updateUser = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.status === 200 && type === 'password') {
      showAlert('success', `Changed ${type} successfully!`);
    } else {
      showAlert('success', `Changed ${type} successfully!`);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
