import * as Hive from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { IEncodeTransaction } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import moment from 'moment';
import { Authorities } from '../interfaces';
import { IExpiration, Initiator } from '../interfaces/transaction.interface';
import { TwoFACodes } from '../interfaces/twoFactorAuth.interface';
import AccountUtils from '../utils/hive.utils';
import { orderAlphabetically } from './account-utils';
import HiveUtils from './hive.utils';
import HiveTxUtils from './hivetx.utils';
import { notifyError } from './notify';
const defaultBot = process.env.TWOFA_BOT;

const getOptions = () => {
  return {
    apiAddress:
      process.env.API_ADDRESS || 'https://api-multisig.hive-keychain.com',
    socketAddress:
      process.env.SOCKET_ADDRESS || 'https://api-multisig.hive-keychain.com',
    clientAddress: 'https://api.deathwing.me',
  };
};

const multisig = HiveMultisig.getInstance(window, getOptions());

const getSigners = async (username: string, keyType: KeychainKeyTypes) => {
  const signers = await HiveMultisig.getSigners(username, keyType);
  return signers;
};
const checkMultisigBot = async (username: string) => {
  const metadata = await HiveUtils.getJSONMetadata(username);
  return metadata?.isMultisigBot === true ? true : false;
};

const getMultisigBots = async (username: string) => {
  const activeAuth = await HiveUtils.getAuthority(
    username,
    KeychainKeyTypes.active,
  );
  let bots = [];

  for (let i = 0; i < activeAuth.account_auths.length; i++) {
    const botName = activeAuth.account_auths[i][0];
    const isBot = await checkMultisigBot(botName);
    if (isBot) {
      bots.push([botName, botName === defaultBot ? 'default' : 'custom']);
    }
  }
  return !bots || bots.length === 0 ? undefined : bots;
};

const parseNewAuthorities = (newAuthorities: Authorities) => {
  const activeAccounts = orderAlphabetically(
    newAuthorities.active.account_auths,
  );
  const activeKeys = orderAlphabetically(newAuthorities.active.key_auths);
  const postingAccounts = orderAlphabetically(
    newAuthorities.posting.account_auths,
  );
  const postingKeys = orderAlphabetically(newAuthorities.posting.key_auths);

  const parsedAuthorities: Authorities = {
    ...newAuthorities,
    owner: undefined,
    active: {
      account_auths: activeAccounts,
      key_auths: activeKeys,
      weight_threshold: newAuthorities.active.weight_threshold,
    },
    posting: {
      account_auths: postingAccounts,
      key_auths: postingKeys,
      weight_threshold: newAuthorities.posting.weight_threshold,
    },
  };

  return parsedAuthorities;
};

const nonMultisigTxBroadcast = async (
  transaction: Hive.Transaction,
  username: string,
) => {
  return new Promise((resolve, reject) => {
    const keyType = KeychainKeyTypes.active;
    HiveUtils.requestSignTx(transaction, username, keyType)
      .then((signedTx) => {
        if (signedTx) {
          HiveUtils.broadcastTx(signedTx)
            .then(async (res) => {
              resolve(res);
            })
            .catch((e) => reject(e));
        } else {
          notifyError('Signed transaction error.');
          reject(undefined);
        }
      })
      .catch((e) => {
        notifyError(
          `Failed to sign transaction: ${
            e?.message ? String(e.message) : JSON.stringify(e)
          }`,
        );
        reject(e);
      });
  });
};

const multisigTxBroadcast = async (
  transaction: Hive.Transaction,
  initiator: Initiator,
  twoFACodes?: TwoFACodes,
  onRequestCreated?: (
    signatureRequestId: string,
    seedSigners: Array<{ publicKey: string; weight?: number }>,
  ) => void,
) => {
  return new Promise((resolve, reject) => {
    const keyType = KeychainKeyTypes.active;
    const multisig = HiveMultisig.getInstance(
      window,
      MultisigUtils.getOptions(),
    );

    const txExpirationDate = (() => {
      const raw = (transaction as any)?.expiration;
      if (!raw) return undefined;

      if (raw instanceof Date) {
        return Number.isNaN(raw.getTime()) ? undefined : raw;
      }

      if (typeof raw === 'string') {
        const s = raw.trim();
        if (!s) return undefined;

        // If it's an ISO string without timezone info, treat it as UTC.
        // Example from HiveTx: "2026-01-11T02:27:18"
        const hasTimezone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s);
        const isoNoTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(s);
        const toParse = !hasTimezone && isoNoTimezone ? `${s}Z` : s;
        const d = new Date(toParse);
        return Number.isNaN(d.getTime()) ? undefined : d;
      }

      // Fallback for other input types.
      try {
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? undefined : d;
      } catch {
        return undefined;
      }
    })();

    const txToEncode: IEncodeTransaction = {
      transaction: { ...transaction },
      method: keyType,
      // Keep the signature-request expiration aligned with the underlying
      // blockchain transaction expiration (e.g. 24h if user selected 24h).
      expirationDate: txExpirationDate ?? moment().add(24, 'h').toDate(),
      initiator,
    };

    try {
      multisig.utils
        .encodeTransaction(txToEncode, twoFACodes)
        .then((encodedTxObj) => {
          const debugOn = (() => {
            try {
              return window.localStorage.getItem('multisig:debugSigners') === '1';
            } catch {
              return false;
            }
          })();

          const extractSignatureRequestId = (res: unknown): string | undefined => {
            if (typeof res === 'number' && Number.isFinite(res)) return String(res);
            if (typeof res === 'string') {
              const trimmed = res.trim();
              if (/^\d+$/.test(trimmed)) return trimmed;

              // Try parsing JSON payloads (common in socket acks)
              try {
                const parsed = JSON.parse(trimmed);
                if (typeof parsed === 'number' && Number.isFinite(parsed)) return String(parsed);
                if (typeof parsed === 'string' && /^\d+$/.test(parsed.trim())) return parsed.trim();
                if (parsed && typeof parsed === 'object') {
                  const id = (parsed as any).id ?? (parsed as any).signatureRequestId;
                  if (id !== undefined && id !== null) {
                    const s = String(id).trim();
                    if (s.length > 0) return s;
                  }
                }
              } catch {
                // ignore
              }

              // Fallback: extract first run of digits
              const match = trimmed.match(/(\d{1,})/);
              if (match && match[1]) return match[1];
            }

            if (res && typeof res === 'object') {
              const id = (res as any).id ?? (res as any).signatureRequestId;
              if (id !== undefined && id !== null) {
                const s = String(id).trim();
                if (s.length > 0) return s;
              }
            }
            return undefined;
          };

          // IMPORTANT: SDK's signatureRequest.signers is the "potential signers"
          // list and intentionally excludes the initiator.
          const seedSigners: Array<{ publicKey: string; weight?: number }> = (
            ((encodedTxObj as any)?.signatureRequest?.signers ?? []) as any[]
          )
            .map((s: any) => ({
              publicKey: String(s?.publicKey ?? ''),
              weight:
                typeof s?.weight === 'number'
                  ? s.weight
                  : typeof s?.weight === 'string'
                    ? Number(s.weight)
                    : undefined,
            }))
            .filter((s) => !!s.publicKey);

          multisig.wss.requestSignatures(encodedTxObj).then(async (res) => {
            try {
              const extractedId = extractSignatureRequestId(res);
              if (debugOn) {
                // eslint-disable-next-line no-console
                console.log('[multisig debug] requestSignatures ack', {
                  raw: res,
                  extractedId,
                  seedSigners: seedSigners.length,
                });
              }
              if (extractedId) {
                onRequestCreated?.(extractedId, seedSigners);
              } else {
                // Backend ack doesn't always include request id; store a short-lived
                // seed so the next signature-request fetch can attach it to the
                // created request once the id is known.
                try {
                  window.localStorage.setItem(
                    'multisig:pendingSignerSeed',
                    JSON.stringify({
                      createdAtMs: Date.now(),
                      initiator: String(initiator?.username ?? ''),
                      keyType,
                      expirationDateIso: txToEncode.expirationDate
                        ? (() => {
                            const d =
                              txToEncode.expirationDate instanceof Date
                                ? txToEncode.expirationDate
                                : new Date(txToEncode.expirationDate);
                            return Number.isNaN(d.getTime())
                              ? undefined
                              : d.toISOString();
                          })()
                        : undefined,
                      seedSigners,
                    }),
                  );
                } catch {
                  // ignore
                }
              }
            } catch {
              // ignore seeding callback errors
            }
            resolve(res);
          });
        })
        .catch((e) => {
          notifyError(e?.message ? String(e.message) : String(e));
          reject(e);
        });
    } catch (error) {
      notifyError(error?.message ? String(error.message) : String(error));
      reject(error);
    }
  });
};

const accountUpdateWithActiveAuthority = async (
  username: string,
  initiator: Initiator,
  activeAuthority: Hive.AuthorityType,
  newAuthorities: Authorities,
  twoFACodes?: TwoFACodes,
) => {
  return new Promise(async (resolve, reject) => {
    //construct transaction for account_update
    const updatedAuthorities: Authorities = parseNewAuthorities(newAuthorities);
    const op = ['account_update', updatedAuthorities];
    const transaction = await HiveTxUtils.createTx([op], {
      date: undefined,
      minutes: 60,
    } as IExpiration);

    const opName = 'Account Update';

    //non multisig transaction
    if (initiator.weight >= activeAuthority.weight_threshold) {
      nonMultisigTxBroadcast(transaction, username).then(async (res) => {
        if (res) {
          resolve(`${opName} transaction has been broadcasted!`);
        } else {
          reject(`Failed to broadcast non-multisig ${opName}`);
        }
      });
    } //multisig transaction
    else {
      multisigTxBroadcast(transaction, initiator, twoFACodes).then(
        async (res) => {
          if (res) {
            resolve(
              `${opName} transaction has been submitted to multisig signers! You may check the status of the transaction in the Sign Requests page.`,
            );
          } else {
            reject(`Failed to broadcast multisig ${opName}`);
          }
        },
      );
    }
  });
};

const twoFAConfigBroadcast = async (
  username: string,
  bot: [string | Hive.PublicKey, number],
  twoFASecret: string,
  initiator: Initiator,
  newAuthorities: Authorities,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const customJsonOp = await getCustomJsonOp(username, bot, twoFASecret);
      const updateAccountOp = await getUpdateAccountOp(newAuthorities);
      const transaction = await HiveTxUtils.createTx(
        [customJsonOp, updateAccountOp],
        {
          date: undefined,
          minutes: 60,
        } as IExpiration,
      );
      broadcastTransaction(transaction, username, initiator)
        .then((res) => resolve(res))
        .catch((reason) => reject(reason));
    } catch (e) {
      reject(e);
    }
  });
};

const broadcastTransaction = async (
  transaction: Hive.Transaction,
  username: string,
  initiator: Initiator,
  twoFACodes?: TwoFACodes,
  onRequestCreated?: (
    signatureRequestId: string,
    seedSigners: Array<{ publicKey: string; weight?: number }>,
  ) => void,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const auth = await AccountUtils.getActiveAuthorities(username);
      const signer_weight =
        initiator.username === username
          ? auth.active.key_auths[0][1]
          : auth.active.account_auths.find(
              (a) => a[0] === initiator.username,
            )[1];
      if (signer_weight >= auth.active.weight_threshold) {
        //non multisig transaction
        nonMultisigTxBroadcast(transaction, username)
          .then(async (res) => {
            const operationNames = transaction.operations.map((op) => {
              return op[0]
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            });

            resolve(
              `${
                operationNames.length > 1
                  ? operationNames.join(', ')
                  : operationNames[0]
              } transaction has been broadcasted!`,
            );
          })
          .catch((e) => {
            reject(e);
          });
      } else {
        //multisig transaction
        multisigTxBroadcast(transaction, initiator, twoFACodes, onRequestCreated)
          .then(async (res) => {
            const operationNames = transaction.operations.map((op) => {
              return op[0]
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            });
            resolve(
              `${
                operationNames.length > 1
                  ? operationNames.join(', ')
                  : operationNames[0]
              } transaction has been submitted to multisig signers! You may check the status of the transaction in the Sign Requests page.`,
            );
          })
          .catch((e) => {
            reject(e);
          });
      }
    } catch (e) {
      reject(e);
    }
  });
};
const getCustomJsonOp = async (
  username: string,
  bot: [string | Hive.PublicKey, number],
  twoFASecret: string,
) => {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const isValid = await MultisigUtils.checkMultisigBot(bot[0].toString());
      const auth = await AccountUtils.getActiveAuthorities(username);
      if (isValid) {
        //get bot's memo key
        const botMemoKey = await AccountUtils.getAccountMemoKey(
          bot[0].toString(),
        );
        const signer_weight = auth.active.key_auths[0][1];
        let encodingResult = undefined;
        const isNonMultisig = signer_weight >= auth.active.weight_threshold;
        if (isNonMultisig) {
          //non multisig
          encodingResult = await HiveUtils.encodeMessage(
            username,
            bot[0].toString(),
            `${twoFASecret}`,
            KeychainKeyTypes.memo,
          );
        } else {
          //multisig
          encodingResult = await HiveUtils.encodeMessageWithKeys(
            username,
            [botMemoKey],
            `${twoFASecret}`,
            KeychainKeyTypes.memo,
          );
        }
        if (encodingResult.success) {
          const encodedMessage = isNonMultisig
            ? encodingResult.result
            : encodingResult.result[botMemoKey.toString()];
          const customJsonOp = {
            required_auths: [username],
            required_posting_auths: [] as string[],
            id: 'setTwoFaId',
            json: JSON.stringify({
              botName: bot[0],
              twoFaId: encodedMessage,
            }),
          };
          const op = ['custom_json', customJsonOp];

          resolve(op);
        }
      }
      reject(`${username} is not configured as a 2FA bot`);
    } catch (e) {
      reject(e);
    }
  });
};

const getUpdateAccountOp = async (newAuthorities: Authorities) => {
  const updatedAuthorities: Authorities = parseNewAuthorities(newAuthorities);
  const op = ['account_update', updatedAuthorities];
  return op;
};
export const MultisigUtils = {
  getSigners,
  getOptions,
  checkMultisigBot,
  parseNewAuthorities,
  nonMultisigTxBroadcast,
  multisigTxBroadcast,
  accountUpdateWithActiveAuthority,
  broadcastTransaction,
  twoFAConfigBroadcast,
  getMultisigBots,
  getUpdateAccountOp,
};
