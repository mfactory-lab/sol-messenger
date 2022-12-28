describe('Channel actions', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:3333/')
    cy.contains('CONNECT WALLET').click()
    cy.contains('Phantom').click()
    window.localStorage.setItem(Cypress.env('wallet'), Cypress.env('deviceKey'))
  })

  interface Member {
    name: string
    wallet: string
    deviceKey: string
  }

  const member1: Member = Cypress.env('member1')
  const member2: Member = Cypress.env('member2')

  it('Add member', () => {
    cy.once('uncaught:exception', () => false)
    cy.get('.channels-list').find('.chat-item').contains('[TEST] Privat').click().then(() => {
      for (let i = 0; i < 2; i++) {
        const _member = i === 0 ? member1 : member2
        cy.get('.chat-menu').click()
        cy.get('[data-test-id="channel-menu-addmember"]').should('be.enabled').click()
        cy.get('[data-test-id="channel-addmember-name"]').clear().type(_member.name).invoke('val').should('have.length.gte', 3).should('have.length.lessThan', 26)
        cy.get('[data-test-id="channel-addmember-wallet"]').clear().type(_member.wallet).invoke('val').should('have.length.gte', 1)
        cy.get('[data-test-id="channel-addmember-devicekey"]').clear().type(_member.deviceKey).invoke('val')
        cy.get('[data-test-id="channel-addmember-btn"]').click()
        cy.contains('Member was added')
        cy.wait(2000)
      }
    })
  })

  it('Delete member', () => {
    cy.get('.channels-list').find('.chat-item').contains('[TEST] Privat').click().then(() => {
      cy.get('.chat-menu').click()
      cy.get('[data-test-id="channel-menu-members"]').should('be.enabled').wait(1000).click()
      for (let i = 0; i < 2; i++) {
        const _member = i === 0 ? member1 : member2
        cy.get('.memberlist-item').contains(_member.name).parentsUntil('.q-list--separator').find('.memberlist-btns').click()
        cy.contains('Member was deleted')
        cy.wait(1000)
      }
    })
  })

  it('Search channels', () => {
    cy.get('[data-test-id="join-channel-join"]').click()
    cy.get('.search-block').find('input').type('[TEST] Privat')
    cy.get('.privat-channels').contains('[TEST] Privat')
  })

  it('Full screen mode', () => {
    cy.get('.size-icon').click()
    cy.get('#app').should('have.class', 'FullScreen')
    cy.wait(1000)
    cy.get('.size-icon').click()
    cy.get('#app').should('have.class', 'Compact')
  })
})
