import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3333/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  retries: {
    // Configure retry attempts for `cypress run`
    // Default is 0
    runMode: 3,
    // Configure retry attempts for `cypress open`
    // Default is 0
    openMode: 0,
  },

  defaultCommandTimeout: 15000,
  env: {
    wallet: 'CMaZwkyBvx9z97M5Dw8tfj3jcZW4ZMD7YZjEGLdNJ6Us',
    deviceKey: '3U43rmUJpnCgNn65fQWpz8g4ZNC9C6AMzmme3E9mfbBLM2HB5reDGo65CvDjrr8gPrNEZs19GcueacpaRsY4y5XE',
    member1: {
      name: 'test user 1',
      wallet: 'AZWKKMm7bCiymbwcAoaSVvEeCSmbKx27AosJaUnDnuAJ',
      deviceKey: 'A2RWEFUn4gnW8UQnH9wnJUvd8Bq2DfmNDUpaHdguqGD9',
      deviceKeyEncode: 'fZPuTu5d5ihhxw19ZSmyPxMDeKLA9ZuSDvxt5f4ZixGon6DfvUCBTiWszvTKRwq8bW8EcdToshdC6tfcHXfmP79',
      secretKey: '5dV4QCXN6Sgny4ccMtfkaYUepsNe6aACQYvoruTTiXxsrtPTuqbMUedC8TsPxUCvTzMVcuL1SK1C7uAEehpzN9HU',
    },
    member2: {
      name: 'test user 2',
      wallet: 'LfuTLsypNViujoitYcJYsd3vW4sg2S4WNKTeeDmdw5R',
      deviceKey: '58sLMkrqzGdA7EcpvAgU6FSGsKDpQkbMg8XfRqAdNZkg',
      deviceKeyEncode: '4abdzqEPwGLGNRBic5kFXVrpd2nWb4jjojmjYcWD4fstGtbxi4UfBtthpfipKB6JH9w7kRsRXGPdZDydmwwTKqTz',
      secretKey: '3eYn4xaGRhbpVL5znhsxSHzTSTF7bp8KoPV6qtV7WyxvCRp1PMz7sqon71UvRYSv1DNGfkcWxdHZ6CdqrRdmYoYb',
    },
  },
})

