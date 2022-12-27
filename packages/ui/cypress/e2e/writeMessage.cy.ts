describe('Messenger', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:3333/')
    cy.contains('CONNECT WALLET').click()
    cy.contains('Phantom').click()
  })

  const message = 'Test message 2'

  it('Public channel', () => {
    cy.once('uncaught:exception', () => false)
    cy.get('.send-btn').should('be.disabled')
    cy.get('.channels-list').find('.chat-item').contains('[TEST] Public').click()

    cy.wait(5000)
    cy.get('.message-control').find('input').type(message)
    cy.get('.send-btn').should('be.enabled').click()
    cy.wait(3000)
    cy.get('.messenger-messages').contains(String(message))
  })

  it('Privat channel pending', () => {
    cy.once('uncaught:exception', () => false)
    cy.get('.channels-list').find('.chat-item').find('.pending-icon').click()
    cy.get('.message-control').find('input').should('be.disabled')
    cy.get('.send-btn').should('be.disabled')
  })
})

