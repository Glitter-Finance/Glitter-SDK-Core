// import * as web3 from '@solana/web3.js'
// import { PhantomAdapter } from '../src/lib/chains/solana/wallet/adapters/phantomAdapter'


// describe('Test PhantomManager after Solana mock', () => {
//   it('should throws on mnemonic not present', async () => {
//     try {

//       const connection = new web3.Connection("mainnet-beta");
//       const result = new PhantomAdapter(connection)
//     } catch (error) {
//       expect(error).toBeInstanceOf(Error)
//       expect(error).toHaveProperty(
//         'message',
//         "MNEMONIC_NOT_PRESENT",
//       )
//     }
//   })
// })

// describe('PhantomAdapter after Solana mock', () => {
//   beforeAll(() => {
//     Object.defineProperty(window, 'solana', {
//       configurable: true,
//       value: true,
//     })
//   })

//   afterAll(() => {
//     Object.defineProperty(window, 'solana', {
//       configurable: true,
//       value: {},
//     })
//   })

//   it('should fail to initialize wallet', async () => {
//     // Reason for failing: value should have (isPhantom: true) rather than just true in window.solana
//     try {
//     const connection = new web3.Connection("mainnet-beta");
//       const result = new PhantomAdapter(connection)
//       result.initWallet()
//       expect(result).toBe(123)
//     } catch (error) {
//       expect(error).toBeInstanceOf(Error)
//       expect(error).toHaveProperty(
//         'message',
//         "MNEMONIC_NOT_PRESENT",
//       )
//     }
//   })

//   it('expected to fail to initialize wallet', async () => {
//     // Reason for failing: related to non-existence of isPhantom on window.solana
//     try {
//       const connection = new web3.Connection("mainnet-beta");
//       const constructor = new PhantomAdapter(connection)
//       const keypair = web3.Keypair.generate()
//       const result = constructor.getAccountBalance(keypair.publicKey)
//       expect(result).toBe(123)
//     } catch (error) {
//       expect(error).toBeInstanceOf(Error)
//       expect(error).toHaveProperty(
//         'message',
//          "MNEMONIC_NOT_PRESENT",
//       )
//     }
//   })
// })
