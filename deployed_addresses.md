# Deployed Addresses

## Rinkeby TestNet

```bash
$ truffle migrate --reset --compile-all --network rinkeby

Compiling ./contracts/ImageRegister.sol...
Compiling ./contracts/Migrations.sol...
Compiling openzeppelin-solidity/contracts/lifecycle/Destructible.sol...
Compiling openzeppelin-solidity/contracts/ownership/Ownable.sol...
Writing artifacts to ./build/contracts

Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0xb2d3cebfca0c1a2e0d271c07740112460d82ce4469ba14d7b92f9993314af50c
  Migrations: 0x4ed3265ed135a4c85669f32ca662bd2aba3e5db3
Saving successful migration to network...
  ... 0xde1d86d1efbeae9d086e0d1d170a20bbe1f570e92816d231265874f2a8afe556
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying ImageRegister...
  ... 0xcfbe99781c8c0cd77dd208eb445b2c12381704441e3827b2308a88d9c9b29079
  ImageRegister: 0x107aaa697293b44376de69ad4b87579e3b1e50d8
Saving successful migration to network...
  ... 0x46ad7dbe55f412a55c76e48bf7553603c0826a19cda92f45f319699b8eb5a203
Saving artifacts...
```
