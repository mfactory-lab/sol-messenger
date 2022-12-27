describe('Messenger', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:3333/')
    cy.contains('CONNECT WALLET').click()
    cy.contains('Phantom').click()
  })

  const nickName = 'User'
  let joinChannelName: string

  it('Join to channel', () => {
    cy.get('.control-button[data-test-id="join-channel-join"]').click()
    cy.get('.privat-channels').children('.privat-channels-item').filter((k, el) => {
      return !el.children[3]
    }).should('have.length.gt', 0).eq(0).click().then(($el) => {
      joinChannelName = $el.find('.channel-info')[0].innerText
    })
    cy.get('.control-button[data-test-id="join-channel-btn"]').click()
    cy.get('input[data-test-id="join-channel-input"]').type(nickName).invoke('val').should(($val) => {
      expect(String($val).length).to.gt(3)
    })
    cy.get('.dialog-submit-btn[data-test-id="join-channel-btn"]').click().then(() => {
      cy.get('.channels-list').contains(String(joinChannelName))
    })
  })
})

