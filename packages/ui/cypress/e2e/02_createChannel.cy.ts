import { TestChannelNames } from 'cypress/interfaces'

describe('Create channel', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.contains('CONNECT WALLET').click()
    cy.contains('Phantom').click()
    window.localStorage.setItem(Cypress.env('wallet'), Cypress.env('deviceKey'))
  })

  it('create public channel', () => {
    const channelName = TestChannelNames.Public
    const nickname = 'Some nickname'
    const maxmessages = '15'

    cy.get('[data-test-id="create-channel-btn"]').click()
    cy.get('.new-channel-dialog')
    cy.get('input[data-test-id="create-channel-name"]').type(channelName).invoke('val').should('have.length.gt', 2).should('have.length.below', 25)
    cy.get('input[data-test-id="create-channel-nickname"]').type(nickname).invoke('val').should('have.length.gt', 2).should('have.length.below', 25)
    cy.get('input[data-test-id="create-channel-maxmessages"]').clear().type(maxmessages).invoke('val').then(($val) => {
      const val = Number($val)
      // eslint-disable-next-line no-unused-expressions
      expect(val > 0 && val <= 20000).to.be.true
    })
    cy.get('[data-test-id="create-channel-check"]').click()
    cy.get('.toggle-approve').should('not.exist')
    cy.get('.dialog-submit-btn').click().then(() => {
      cy.contains('Channel was created!') || cy.contains('A channel with the same name already exists')
    })
  })

  it('create duplicate channel', () => {
    const channelName = TestChannelNames.Public
    const nickname = 'Some nickname'
    const maxmessages = '15'

    cy.get('[data-test-id="create-channel-btn"]').click()
    cy.get('.new-channel-dialog')
    cy.get('input[data-test-id="create-channel-name"]').type(channelName).invoke('val').should('have.length.gt', 2).should('have.length.below', 25)
    cy.get('input[data-test-id="create-channel-nickname"]').type(nickname).invoke('val').should('have.length.gt', 2).should('have.length.below', 25)
    cy.get('input[data-test-id="create-channel-maxmessages"]').clear().type(maxmessages).invoke('val').then(($val) => {
      const val = Number($val)
      // eslint-disable-next-line no-unused-expressions
      expect(val > 0 && val <= 20000).to.be.true
    })
    cy.get('[data-test-id="create-channel-check"]').click()
    cy.get('.toggle-approve').should('not.exist')
    cy.get('.dialog-submit-btn').click()
    cy.get('body').contains('A channel with the same name already exists')
  })

  it('create private channel', () => {
    const channelName = TestChannelNames.Privat
    const nickname = 'Some nickname'
    const maxmessages = '15'

    cy.get('[data-test-id="create-channel-btn"]').click()
    cy.get('.new-channel-dialog')
    cy.get('input[data-test-id="create-channel-name"]').type(channelName).invoke('val').should('have.length.gt', 2).should('have.length.below', 25)
    cy.get('input[data-test-id="create-channel-nickname"]').type(nickname).invoke('val').should('have.length.gt', 2).should('have.length.below', 25)
    cy.get('input[data-test-id="create-channel-maxmessages"]').clear().type(maxmessages).invoke('val').then(($val) => {
      const val = Number($val)
      // eslint-disable-next-line no-unused-expressions
      expect(val > 0 && val <= 20000).to.be.true
    })
    cy.get('.dialog-submit-btn').click()
    cy.get('body').contains('Channel was created!')
  })

  it('create private channel with permissionless', () => {
    const channelName = TestChannelNames.Permissionless
    const nickname = 'Some nickname'
    const maxmessages = '15'

    cy.get('[data-test-id="create-channel-btn"]').click()
    cy.get('.new-channel-dialog')
    cy.get('input[data-test-id="create-channel-name"]').type(channelName).invoke('val').should('have.length.gt', 2).should('have.length.below', 25)
    cy.get('input[data-test-id="create-channel-nickname"]').type(nickname).invoke('val').should('have.length.gt', 2).should('have.length.below', 25)
    cy.get('input[data-test-id="create-channel-maxmessages"]').clear().type(maxmessages).invoke('val').then(($val) => {
      const val = Number($val)
      // eslint-disable-next-line no-unused-expressions
      expect(val > 0 && val <= 20000).to.be.true
    })
    cy.get('[data-test-id="create-channel-permissionless"]').click()
    cy.get('.dialog-submit-btn').click().then(() => {
      cy.get('body').contains('Channel was created!')
    })
  })
})

