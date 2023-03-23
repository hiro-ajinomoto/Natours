import { login } from './login';
import { logout } from './logout';
import { updateUser } from './updateUser';
import { bookTour } from './stripe';
// // DOM ELEMENTS
// const mapBox = document.getElementById('map');

// // DELEGATION
// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations);
//   displayMap(locations);
// }

const loginForm = document.querySelector('.form--login');

const logOutBtn = document.querySelector('.nav__el--logout');

const userDataForm = document.querySelector('.form-user-data');

const userPasswordForm = document.querySelector('.form-user-settings');

const bookBtn = document.getElementById('book-tour');

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('name', document.getElementById('name').value);

    formData.append('email', document.getElementById('email').value);

    formData.append('photo', document.getElementById('photo').files[0]);

    await updateUser(formData, 'info');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    const currentPassword = document.getElementById('password-current').value;

    const newPassword = document.getElementById('password').value;

    const passwordConfirm = document.getElementById('password-confirm').value;

    document.querySelector('.btn--save-password').textContent = 'Updating...';

    await updateUser(
      { currentPassword, newPassword, passwordConfirm },
      'password'
    );

    document.getElementById('password-current').value = '';

    document.getElementById('password').value = '';

    document.getElementById('password-confirm').value = '';

    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', async e => {
    e.target.textContent = 'Processing...';

    const { tourId } = e.target.dataset;

    await bookTour(tourId);

    e.target.textContent = 'Done';
  });
}

// if (newPhotoUpload) {
//   newPhotoUpload.addEventListener('submit', async e => {
//     e.preventDefault();

//     const data = newPhotoUpload.files;

//     console.log('data: ', data);

//     await updateUser(data, 'photo');
//   });
// }
