import {deriveKeyFromMnemonic, deriveEth2ValidatorKeys} from "@chainsafe/bls-keygen";
import bls from "@chainsafe/bls/herumi"; // <- browser-compatible signer 
import {ssz, phase0} from "@lodestar/types";
import {DOMAIN_DEPOSIT, MAX_EFFECTIVE_BALANCE} from "@lodestar/params";
import {config} from "@lodestar/config/default"; // <- mainnet chain config
import {ZERO_HASH, computeDomain, computeSigningRoot} from "@lodestar/state-transition";

/// generate secret keys

// secret key from mnemonic and optional EIP-2334 path
const masterSecretKey = deriveKeyFromMnemonic(
  "impact exit example acquire drastic cement usage float mesh source private bulb twenty guitar neglect"
);

// create multiple eth2 validator keys from a master secret key
const keys0 = deriveEth2ValidatorKeys(masterSecretKey, 0); // second arg here used to derive sibling hd keys

const {signing, withdrawal} = keys0;

/// create signer

const secretKey = bls.SecretKey.fromBytes(signing);
const pubkey = secretKey.toPublicKey().toBytes();

/// create and sign deposit

const msg: phase0.DepositMessage = {
  pubkey,
  withdrawalCredentials: new Uint8Array(32), // TODO make this real
  amount: MAX_EFFECTIVE_BALANCE,
};

// domain relies on the chain config, make sure to load the proper one
const domain = computeDomain(DOMAIN_DEPOSIT, config.GENESIS_FORK_VERSION, ZERO_HASH);
const signingRoot = computeSigningRoot(ssz.phase0.DepositMessage, msg, domain);

const data: phase0.DepositData = {
  ...msg,
  signature: secretKey.sign(signingRoot).toBytes(),
}

console.log(ssz.phase0.DepositData.toJson(data));
