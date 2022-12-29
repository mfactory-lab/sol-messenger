describe('Messenger', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.contains('CONNECT WALLET').click()
    cy.contains('Phantom').click()
  })

  const nickName = 'User'
  let joinChannelName: string

  it('Join to channel', () => {
    cy.once('uncaught:exception', () => false)

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

  it('Leave channel', () => {
    cy.once('uncaught:exception', () => false)
    cy.get('.channels-list').find('.chat-item').find('.pending-icon').click()
    cy.get('.message-control').find('input').should('be.disabled')
    cy.get('.send-btn').should('be.disabled')
    cy.get('.chat-menu').click()
    cy.get('[data-test-id="channel-menu-leave"]').should('be.enabled').wait(1000).click()
    cy.contains('Channel was abandoned!')
  })
})

