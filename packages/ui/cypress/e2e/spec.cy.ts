describe('Messenger', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:3333/')
  })

  describe('Wallet not connected', () => {
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

  describe('Wallet connected', () => {
    beforeEach(() => {
      cy.contains('CONNECT WALLET').click()
      cy.contains('Phantom').click()
    })

    it('create channel', () => {
      const channelName = 'new channel'
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
    })
  })
})
