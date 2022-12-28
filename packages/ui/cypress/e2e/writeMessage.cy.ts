describe('Messages', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:3333/')
    cy.contains('CONNECT WALLET').click()
    cy.contains('Phantom').click()
    window.localStorage.setItem(Cypress.env('wallet'), Cypress.env('deviceKey'))
  })

  const message = 'Test message 2'

  it('Public channel', () => {
    cy.once('uncaught:exception', () => false)
    cy.get('.send-btn').should('be.disabled')
    cy.get('.channels-list').find('.chat-item').contains('[TEST] Public').click().then(() => {
      cy.get('.message-control').find('input').type(message).should('have.length.gt', 0)
      cy.get('.send-btn').should('be.enabled').click()
      cy.get('.messenger-messages').contains(String(message))
    })
  })

  it('Privat channel', () => {
    cy.once('uncaught:exception', () => false)
    cy.get('.send-btn').should('be.disabled')
    cy.get('.channels-list').find('.chat-item').contains('[TEST] Privat').click().then(() => {
      cy.get('.message-control').find('input').type('Test message').should('have.length.gt', 0)
      cy.get('.send-btn').should('be.enabled').click()
      cy.get('.messenger-messages').contains('Test message')
    })
  })
})

