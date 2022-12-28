import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  defaultCommandTimeout: 15000,
  env: {
    wallet: 'CMaZwkyBvx9z97M5Dw8tfj3jcZW4ZMD7YZjEGLdNJ6Us',
    deviceKey: '3U43rmUJpnCgNn65fQWpz8g4ZNC9C6AMzmme3E9mfbBLM2HB5reDGo65CvDjrr8gPrNEZs19GcueacpaRsY4y5XE',
    member1: {
      name: 'test user 1',
      wallet: 'AZWKKMm7bCiymbwcAoaSVvEeCSmbKx27AosJaUnDnuAJ',
      deviceKey: 'A2RWEFUn4gnW8UQnH9wnJUvd8Bq2DfmNDUpaHdguqGD9',
    },
    member2: {
      name: 'test user 2',
      wallet: 'LfuTLsypNViujoitYcJYsd3vW4sg2S4WNKTeeDmdw5R',
      deviceKey: '58sLMkrqzGdA7EcpvAgU6FSGsKDpQkbMg8XfRqAdNZkg',
    },
  },
})
