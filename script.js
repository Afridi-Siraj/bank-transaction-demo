'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-06-08T23:36:17.929Z',
    '2021-06-06T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDay()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMovement = formatCurrency(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  // set time to 5 minutes
  let timer = 300;
  const tick = function () {
    const min = `${Math.trunc(timer / 60)}`.padStart(2, 0);
    const sec = `${timer % 60}`.padStart(2, 0);
    // in each time print remaining time
    labelTimer.textContent = `${min}:${sec}`;
    // decrease 1s

    // when time is 0 .stop timer and log out user
    if (timer === 0) {
      clearInterval(timerOn);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    timer = timer - 1;
  };
  // call timer every second
  tick();
  timerOn = setInterval(tick, 1000);
  return timerOn;
};
///////////////////////////////////////
// Event handlers
let currentAccount;
let timerOn;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // create current date and time
    const currentDate = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(currentDate);
    // const day = `${currentDate.getDay()}`.padStart(2, 0);
    // const month = `${currentDate.getMonth() + 1}`.padStart(2, 0);
    // const year = currentDate.getFullYear();
    // const hour = currentDate.getHours();
    // const min = currentDate.getMinutes();

    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // timer
    if (timerOn) clearInterval(timerOn);

    timerOn = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());

    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
    clearInterval(timerOn);
    timerOn = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);
      // add loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
    }, 4000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// console.log(0.2 + 0.1); /// returns .300000000000000004
// console.log(0.1 + 0.2 === 0.3); // returns false

// // converting to number
// console.log(Number('23'));
// console.log(+'23'); // equivalent
// //parsing
// console.log(Number.parseInt('30px', 10)); // strings with unit is converted to numbers // string should start with number .'30px' will work but 'px30' won't work;
// console.log(Number.parseInt('adf30px', 10)); // return NaN
// console.log(Number.parseInt('3rem', 10));
// console.log(Number.parseFloat('3.5rem '));

// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20'));
// console.log(Number.isNaN('20x'));
// console.log(Number.isNaN(3 / 0));
// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20x'));
// console.log(Number.isFinite(3 / 0));

// console.log(Number.isInteger(20));
// console.log(Number.isInteger(20.5));
// console.log(Number.isInteger('20'));

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2)); // equivalent
// console.log(Math.max(4, 3, 53, 54, 23, 45));
// console.log(Math.max(4, 3, '45', 54, 23, 45)); // this doesn't work
// console.log(Math.max(4, 3, 53, 54, 23, 45));
// console.log(Math.min(4, 3, 53, 54, 23, 45));
// console.log(Math.PI * Number.parseInt('20px') ** 2);
// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
// console.log(randomInt(10, 20));
// console.log(randomInt(16, 20));
// // rounding integers
// console.log(Math.round(23.3)); // 23
// console.log(Math.round(23.6)); // 24 // returns nearest integer
// console.log(Math.ceil(23.3)); // 24// rounds to the next integer
// console.log(Math.ceil(23.9)); // 24
// console.log(Math.floor(23.3)); // 23
// console.log(Math.floor('23.9')); // 23
// console.log(Math.trunc(23.3)); // returns 23 // floor and trunc simply ignores the decimal part of the number
// console.log(Math.floor(-23.3)); // 24

// console.log(Math.trunc(-23.3)); // returns 23

// // rounding decimals
// console.log((2.7).toFixed(0)); //returns 3 of string type
// console.log((2.7).toFixed(1)); //returns 2.7 of string type
// console.log((2.7).toFixed(2)); //returns 2.70 of string type
// console.log((2.7).toFixed(3)); //returns 2.700 of string type
// console.log((2.45356464).toFixed(4)); //returns 2.4535 of string type
// console.log(+(2.45356464).toFixed(4)); //returns 2.4535 of number type
// console.log(5 % 2); //returns 1

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) {
//       row.style.backgroundColor = 'orange';
//       if (i % 3 === 0) {
//         row.style.backgroundColor = 'blue';
//       }
//     }
//   });
// });
// const isEven = n => n % 2 === 0;
// console.log(isEven(5));
// console.log(isEven(8));

// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(Number.MAX_SAFE_INTEGER * 5);
// // bigInt
// console.log(4566345454548548445454545414845n); // n at the end specifies big integer
// console.log(BigInt(45663454545485));
// console.log(4874454544875846876874488787n * 7877878787864564654874544n);
// // but big int and regular number can't be mixed
// console.log(54545454548455487455485n * BigInt(45454684845468478847));
// console.log(20n > 15); // true
// console.log(20n === 20); //false cause they are of different type
// console.log(20n == 20); // true
// const huge = 454545454454544454854485484n;

// console.log(huge + 'is really big');
// // math methods like sqrt and others does not work on big int

// console.log(10n / 3n); //returns 3n which is the nearest bigInt number

// //////////// dates and time ///////////////////////

// // create a date
// const now = new Date();
// console.log(now);
// console.log(new Date('Jun 07 2021 19:47:36'));
// console.log(new Date('October 12 1997'));
// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(1998, 10, 02, 21, 45, 56)); // second argument starts from zero
// console.log(new Date(2088, 10, 31)); // returns december 01 as november ends at 30 days.javascript auto corrects
// console.log(new Date(5)); // returns a date   5 milisecons after 1970 ,01:00:00 january 01
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime()); ///returns the number of miliseconds passed after 1970 ,01:00:00 january 01 untill specified date
// console.log(date.now()); ///returns the number of miliseconds passed after 1970 ,01:00:00 january 01 untill now
// future.setFullYear(2044); // sets the year 2044 to future replacing 2037
// console.log(future);

// operations with dates
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(+future);
// const daysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
// const days = daysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
// console.log(days);
// const num = 454545.4545;
// const options = {
//   style: 'currency',
//   // unit: 'mile-per-hour // celsius',
//   currency: 'EUR',
// };
// console.log('US:      ', new Intl.NumberFormat('en-US', options).format(num));
// console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('syriya:  ', new Intl.NumberFormat('ar-SY', options).format(num));
// setTimeout
// const products = ['a', 'b'];
// const timeout = setTimeout(
//   (prod1, prod2) => console.log(`here is your product: ${prod1} and ${prod2} `),
//   3000,
//   ...products
// ); // all the arguments after time argument is passed to the first argument which is a function // here prod1 = 'a' and prod2 = 'b'
// console.log('waiting');
// if (products.includes('a')) clearTimeout(timeout);
//setInterval
// setInterval(function () {
//   const now = new Date();
//   const hour = now.getHours(now);
//   const min = now.getMinutes(now);
//   const sec = now.getSeconds(now);
//   // console.log(`${hour}:${min}:${sec}`);
// }, 1000);
