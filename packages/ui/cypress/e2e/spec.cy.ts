describe('empty spec', () => {
  it('passes', () => {
    cy.visit('https://cgram.one/')
    cy.get('.app-header__wallet-btn').contains('CONNECT WALLET').click()
    
  })

})