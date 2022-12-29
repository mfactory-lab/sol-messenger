import { Keypair } from '@solana/web3.js'
import base58 from 'bs58'
import { DEVNET, PhantomWalletMock } from 'phan-wallet-mock'

const member1 = Cypress.env('member1')
const member2 = Cypress.env('member2')

export function joinUser(num: number) {
  const member = Cypress.env(`member${num}`)
  describe(`Join to channel(member ${num})`, () => {
    before(() => {
      Cypress.on('window:before:load', (win) => {
        const payer = Keypair.fromSecretKey(
          base58.decode(
            member.secretKey,
          ),
        )
        // @ts-expect-error
        win.solana = PhantomWalletMock.create(DEVNET, payer, 'confirmed')
      })
      cy.visit('/')
      cy.contains('CONNECT WALLET').click()
      cy.contains('Phantom').click()
    })

    const privatChannel = '[TEST] Privat'
    const nickname = member.name

    it('Join to channel(member 1)', () => {
      cy.once('uncaught:exception', () => false)
      cy.get('[data-test-id="join-channel-join"]').click()
      cy.get('.privat-channels').contains(privatChannel).click()
      cy.get('[data-test-id="join-channel-btn"]').click()
      cy.get('[data-test-id="join-channel-input"]').clear().type(nickname)
      cy.get('.dialog-submit-btn[data-test-id="join-channel-btn"]').click()
      cy.get('.channels-list').contains(privatChannel).then(() => {
        return true
      })
    })
  })
}

describe('Channel actions', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.contains('CONNECT WALLET').click()
    cy.contains('Phantom').click()
    window.localStorage.setItem(Cypress.env('wallet'), Cypress.env('deviceKey'))
  })

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
      cy.get('[data-test-id="channel-menu-members"]').should('be.enabled').wait(2000).click()
      for (let i = 0; i < 2; i++) {
        const _member = i === 0 ? member1 : member2
        cy.get('.memberlist-item').contains(_member.name).parentsUntil('.q-list--separator').find('.memberlist-btns').click()
        cy.contains('Member was deleted')
        cy.wait(1000)
      }
    })
  })

  it('Add device', () => {
    cy.get('.chat-item').contains('[TEST] Privat').click()
    cy.get('.chat-menu').click()
    cy.get('[data-test-id="channel-menu-devices"').click()
    cy.get('[data-test-id="channel-add-device"]').should('be.enabled').click()
    cy.get('.devices-list').contains(member1.deviceKey).should('not.exist')
    cy.get('.add-device-dialog').find('input').clear().type(member1.deviceKey).invoke('val').should('have.length.gt', 16)
    cy.get('.add-device-dialog').find('.dialog-submit-btn').click()
    cy.get('.devices-list').contains(member1.deviceKey)
  })

  it('Delete device', () => {
    cy.get('.chat-item').contains('[TEST] Privat').click()
    cy.get('.chat-menu').click()
    cy.get('[data-test-id="channel-menu-devices"').click()
    cy.get('.devices-list').contains(member1.deviceKey).parentsUntil('.devices-list').find('.delete-device-btn').click()
    cy.get('.devices-list').contains(member1.deviceKey).should('not.exist')
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

describe('Channel Authorize & Delete members', () => {
  joinUser(1)
  joinUser(2)

  describe('Approve user', () => {
    beforeEach(() => {
      Cypress.on('window:before:load', (win) => {
        const payer = Keypair.fromSecretKey(
          base58.decode(
            'pnkjmtnqAHiYGEUfAQHAQYAUZPY8NhSskFMpy6tchGEXsR47LJb5jNbcHzyys5xTgV4XRD6YorLgyYKWP5GZioV',
          ),
        )
        // @ts-expect-error
        win.solana = PhantomWalletMock.create(DEVNET, payer, 'confirmed')
      })
      cy.visit('/')
      cy.contains('CONNECT WALLET').click()
      cy.contains('Phantom').click()
      window.localStorage.setItem(Cypress.env('wallet'), Cypress.env('deviceKey'))
    })

    it('Approve from notifications', () => {
      cy.get('.panel-notifications').should('have.class', 'has-notifications').click()
      cy.get('.pending-item').eq(0).contains('Authorize').click()
      cy.contains('Member was authorized')
    })

    it('Approve from members', () => {
      cy.get('.channels-list').contains('[TEST] Privat').click()
      cy.get('.chat-menu').click()
      cy.get('[data-test-id="channel-menu-members"]').should('be.enabled').wait(2000).click()
      cy.get('.memberlist-card').contains('Authorize').click()
      cy.contains('Member was authorized')
    })
  })

  describe('Delete from members', () => {
    beforeEach(() => {
      cy.visit('/')
      cy.contains('CONNECT WALLET').click()
      cy.contains('Phantom').click()
      window.localStorage.setItem(Cypress.env('wallet'), Cypress.env('deviceKey'))
    })

    it('', () => {
      cy.get('.channels-list').contains('[TEST] Privat').click()
      cy.get('.chat-menu').click()
      cy.get('[data-test-id="channel-menu-members"]').should('be.enabled').wait(2000).click()
      for (let i = 0; i < 2; i++) {
        cy.get('.memberlist-item').contains(`test user ${i + 1}`).parentsUntil('.q-list--separator').contains('Delete').click()
        cy.contains('Member was deleted')
      }
    })
  })

  joinUser(1)

  describe('Delete from notifications', () => {
    beforeEach(() => {
      Cypress.on('window:before:load', (win) => {
        const payer = Keypair.fromSecretKey(
          base58.decode(
            'pnkjmtnqAHiYGEUfAQHAQYAUZPY8NhSskFMpy6tchGEXsR47LJb5jNbcHzyys5xTgV4XRD6YorLgyYKWP5GZioV',
          ),
        )
        // @ts-expect-error
        win.solana = PhantomWalletMock.create(DEVNET, payer, 'confirmed')
      })
      cy.visit('/')
      cy.contains('CONNECT WALLET').click()
      cy.contains('Phantom').click()
      window.localStorage.setItem(Cypress.env('wallet'), Cypress.env('deviceKey'))
    })

    it('', () => {
      cy.get('.panel-notifications').should('have.class', 'has-notifications').click()
      cy.get('.pending-item').eq(0).contains('Delete').click()
      cy.contains('Member was deleted')
    })
  })
})

describe('Approve from permissionless channel', () => {

})
