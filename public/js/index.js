/* eslint-disable */
import '@babel/polyfill'
import { login, logout } from './login';
import { updateSettings } from './updateSettings';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// VALUES


if (loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        // console.log(email, password);
        login(email, password);
    });
  
if(logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm)
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form  = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        console.log(form);
        updateSettings(form, 'data');
    });

if(userPasswordForm)
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        console.log(passwordCurrent, password, passwordConfirm);
        updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
    });