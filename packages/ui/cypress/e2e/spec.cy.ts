describe('Messenger', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Prepare', () => {
    it('Fullsize app if not connect wallet', () => {
      cy.get('.size-icon').click()
      cy.get('#app').should('not.have.class', 'FullScreen')
    })

    it('Disabled buttons', () => {
      cy.get('.chat-menu').should('be.disabled')
      cy.get('input').should('be.disabled')
      cy.get('.button-wrapper').children().click({ multiple: true })
      cy.contains('Please connect wallet')
    })
  })
})
