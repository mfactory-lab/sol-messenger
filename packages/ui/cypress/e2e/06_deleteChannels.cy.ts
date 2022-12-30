import { TestChannelNames } from 'cypress/interfaces'

describe('Delete channels', () => {
  before(() => {
    cy.visit('/')
    cy.contains('CONNECT WALLET').click()
    cy.contains('Phantom').click()
    window.localStorage.setItem(Cypress.env('wallet'), Cypress.env('deviceKey'))
  })

  const channels = [TestChannelNames.Public, TestChannelNames.Privat, TestChannelNames.Permissionless]

  it('', () => {
    cy.once('uncaught:exception', () => false)
    for (const ch of channels) {
      cy.get('.channels-list').contains(ch).click()
      cy.get('.chat-menu').click()
      cy.get('.chat-menu__item').contains('Delete').wait(1000).click()
      cy.contains('Channel was deleted!')
    }
  })
})
