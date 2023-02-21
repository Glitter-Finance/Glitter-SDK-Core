export enum EvmError {
    CLIENT_NOT_SET = 'CLIENT HAS NOT SET',
    BRIDGE_NOT_SET = 'BRIDGE HAS NOT SET',
    INVALID_ASSET = '[EvmConnect] Can not provide address of undefined token.',
    INVALID_ASSET_ID ='[EvmConnect] Please provide token symbol.',
    ASSET_NOT_SUPPORTED ="[EvmConnect] Unsupported token symbol.",
    INVALID_DESTINATION = "[EvmConnect] Cannot transfer tokens to same chain.",
    NOT_SERIALIZABLE ="[SerializeEvmBridgeTransfer] Unable to serialize bridge transfer networks",
    NOT_DESERILIZABLE = "[DeserializeEvmBridgeTransfer] Unable to deserialize bridge transfer networks",
    INVALID_ASSET_ID_TYPE ='ASSET ID SHOULD BE string',
    UNDEFINED_TRANSACTION = 'TRANSACTION IS UNDEFINED',
    INVALID_SIGNER ='SIGNER IS REQUIRED',
    MISSING_SECRET_KEY =' SIGNER SECRET KEY IS REQUIRED',
    UNDEFINED_ACCOUNTS ='ACCOUNTS NOT DEFINED',
    TIMEOUT ='TIMEOUT WAITING FOR BALANCE',
    POLLER_NOT_SET='POLLER NOT SET',
    INVALID_MNEMONIC =' MNEMONIC INVALID OR NOT DEFINED',
    ACCOUNT_INFO ='ACCOUNT INFO NOT FOUND',
    INVALID_ACCOUNT ='ACCOUNT/ADDRESS IS UNDEFINED',
    INVALID_APP_ID ='APP ID NOT DEFINED',
    ACCOUNTS_NOT_SET ='EVM ACCOUNTS NOT SET',
    ASSETS_NOT_SET ='EVM ASSETS NOT SET',
    UNDEFINED_TOKEN_ACCOUNT ='TOKEN ACCOUNT NOT FOUND',
    UNDEFINED_ROUTING ='ROUTING NOT SET'

  }
