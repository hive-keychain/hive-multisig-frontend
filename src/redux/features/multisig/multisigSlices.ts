import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/multisig.interface';
import { TwoFACodes } from '../../../interfaces/twoFactorAuth.interface';
import {
  addBroadcastNotifications,
  addBroadcastedTransaction,
  addPendingSignRequest,
  addSignRequest,
  notifyBroadcastedTransaction,
  notifySignRequest,
  removeSignRequest,
  resetBroadcastNotifications,
  resetPendingSignRequest,
  setBotOtp,
  setReceiveBroadcastNotificationsOn,
  setSignRequestCount,
  setTwoFASigners,
  signerConnectActive,
  signerConnectMessageActive,
  signerConnectMessagePosting,
  signerConnectPosting,
  subscribeToBroadcastedTransactions,
  subscribeToSignRequests,
} from './multisigThunks';

const sameId = (a: unknown, b: unknown) => String(a) === String(b);

type SeedSigner = { publicKey: string; weight?: number };

const applySeededSignersToRequest = (request: any, seed?: SeedSigner[]): any => {
  if (!request) return request;
  if (!seed || seed.length === 0) return request;

  const existingSigners: any[] = Array.isArray(request.signers) ? request.signers : [];
  const existingByKey = new Set<string>();
  for (const s of existingSigners) {
    const key = s?.publicKey ? String(s.publicKey) : '';
    if (key) existingByKey.add(key);
  }

  const seedByKey: Record<string, SeedSigner> = {};
  for (const s of seed) {
    const key = s?.publicKey ? String(s.publicKey) : '';
    if (!key) continue;
    seedByKey[key] = s;
  }

  const placeholders: any[] = [];
  let placeholderId = -1;
  for (const s of seed) {
    const key = s?.publicKey ? String(s.publicKey) : '';
    if (!key || existingByKey.has(key)) continue;
    placeholders.push({
      id: placeholderId--,
      publicKey: key,
      encryptedTransaction: '',
      weight: typeof s.weight === 'number' ? s.weight : 0,
      signature: undefined,
      refused: false,
      notified: false,
    });
  }

  const merged = [...existingSigners, ...placeholders].map((signer) => {
    const key = signer?.publicKey ? String(signer.publicKey) : '';
    if (!key) return signer;
    const seeded = seedByKey[key];
    if (!seeded) return signer;
    const currentWeight = signer?.weight;
    const needsWeight = currentWeight === undefined || currentWeight === null || Number(currentWeight) === 0;
    return needsWeight && typeof seeded.weight === 'number'
      ? { ...signer, weight: seeded.weight }
      : signer;
  });

  return { ...request, signers: merged };
};

const mergeSignersByPublicKey = (existing: any, incoming: any): any[] | undefined => {
  const existingArr = Array.isArray(existing) ? (existing as any[]) : undefined;
  const incomingArr = Array.isArray(incoming) ? (incoming as any[]) : undefined;

  // If we didn't receive signers (or received an empty partial), keep what we have.
  if (!incomingArr || incomingArr.length === 0) return existingArr;
  if (!existingArr || existingArr.length === 0) return incomingArr;

  const incomingByKey: Record<string, any> = {};
  const incomingKeys: string[] = [];
  for (const s of incomingArr) {
    const key = s?.publicKey ? String(s.publicKey) : '';
    if (!key) continue;
    if (incomingByKey[key] === undefined) incomingKeys.push(key);
    incomingByKey[key] = s;
  }

  const seen: Record<string, true> = {};
  const merged: any[] = existingArr.map((s) => {
    const key = s?.publicKey ? String(s.publicKey) : '';
    if (!key) return s;
    const inc = incomingByKey[key];
    if (!inc) return s;
    seen[key] = true;
    return { ...s, ...inc };
  });

  // Append any brand-new signers we didn't have.
  for (let i = 0; i < incomingKeys.length; i++) {
    const key = incomingKeys[i];
    if (seen[key]) continue;
    merged.push(incomingByKey[key]);
  }

  return merged;
};

const mergeSignatureRequest = (existing: any, incoming: any): any => {
  const merged = {
    ...existing,
    ...incoming,
  };

  merged.createdAt = incoming?.createdAt ?? existing?.createdAt;
  merged.expirationDate = incoming?.expirationDate ?? existing?.expirationDate;
  merged.signers = mergeSignersByPublicKey(existing?.signers, incoming?.signers);
  return merged;
};

const dedupeByIdPreserveOrder = <T extends { id: unknown }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const initialState: State = {
  signerConnectMessageActive: undefined,
  signerConnectMessagePosting: undefined,
  signerConnectActive: undefined,
  signerConnectPosting: undefined,
  userPendingSignatureRequest: [],
  signRequests: [],
  userNotifications: [],
  broadcastedTransactions: [],
  twoFASigners: {},
  subscribeToSignRequest: false,
  subscribeToBroadcast: false,
  signRequestNotification: false,
  broadcastNotification: false,
  signRequestCount: 0,
  newSignRequestCount: 0,
  success: false,
  error: undefined,
  receiveBroadcastNotificationsOn: true,
  seededSignersByRequestId: {},
};

const multisigSlice = createSlice({
  name: 'multisig',
  initialState,
  reducers: {
    resetState: () => initialState,
    seedSignatureRequestSigners: (
      state,
      action: PayloadAction<{
        signatureRequestId: string | number;
        signers: SeedSigner[];
      }>,
    ) => {
      const id = String(action.payload.signatureRequestId);
      if (!state.seededSignersByRequestId) state.seededSignersByRequestId = {};

      const existing = state.seededSignersByRequestId[id] ?? [];
      const mergedByKey: Record<string, SeedSigner> = {};
      for (const s of existing) {
        const key = s?.publicKey ? String(s.publicKey) : '';
        if (!key) continue;
        mergedByKey[key] = s;
      }
      for (const s of action.payload.signers ?? []) {
        const key = s?.publicKey ? String(s.publicKey) : '';
        if (!key) continue;
        mergedByKey[key] = { ...mergedByKey[key], ...s, publicKey: key };
      }
      state.seededSignersByRequestId[id] = Object.values(mergedByKey);

      const seed = state.seededSignersByRequestId[id];
      state.signRequests = state.signRequests.map((sr: any) =>
        sameId(sr.id, id) ? applySeededSignersToRequest(sr, seed) : sr,
      );
      state.userPendingSignatureRequest = state.userPendingSignatureRequest.map(
        (sr: any) => (sameId(sr.id, id) ? applySeededSignersToRequest(sr, seed) : sr),
      );
      state.broadcastedTransactions = state.broadcastedTransactions.map(
        (sr: any) => (sameId(sr.id, id) ? applySeededSignersToRequest(sr, seed) : sr),
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signerConnectActive.pending, (state) => {
      state.signerConnectActive = undefined;
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(signerConnectActive.fulfilled, (state, action) => {
      state.signerConnectActive = action.payload.signerConnectActive;
      state.success = true;
    });
    builder.addCase(signerConnectActive.rejected, (state, action) => {
      state.success = false;
      state.error =
        'Error during signer connect active. ' + JSON.stringify(action.error);
    });

    builder.addCase(signerConnectPosting.pending, (state) => {
      state.signerConnectPosting = undefined;
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(signerConnectPosting.fulfilled, (state, action) => {
      state.signerConnectPosting = action.payload.signerConnectPosting;
      state.success = true;
    });
    builder.addCase(signerConnectPosting.rejected, (state, action) => {
      state.signerConnectPosting = undefined;
      state.success = false;
      state.error = 'Error during signer connect active.';
    });

    builder.addCase(signerConnectMessageActive.fulfilled, (state, action) => {
      state.signerConnectMessageActive = {
        ...action.payload.signerConnectMessageActive,
      };
    });
    builder.addCase(signerConnectMessagePosting.fulfilled, (state, action) => {
      state.signerConnectMessagePosting = {
        ...action.payload.signerConnectMessagePosting,
      };
    });

    builder.addCase(subscribeToSignRequests.pending, (state) => {
      state.subscribeToSignRequest = undefined;
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(subscribeToSignRequests.fulfilled, (state, action) => {
      state.subscribeToSignRequest = action.payload;
      state.success = true;
    });
    builder.addCase(subscribeToSignRequests.rejected, (state, action) => {
      state.subscribeToSignRequest = false;
      state.success = false;
      state.error = JSON.stringify(action.error);
    });

    builder.addCase(
      subscribeToBroadcastedTransactions.fulfilled,
      (state, action) => {
        state.subscribeToBroadcast = action.payload;
      },
    );
    builder.addCase(addBroadcastedTransaction.fulfilled, (state, action) => {
      if (action.payload) {
        action.payload.forEach((broadcasted) => {
          const seed = state.seededSignersByRequestId?.[String(broadcasted.id)];
          const broadcastedWithSeed = applySeededSignersToRequest(broadcasted as any, seed);
          const index = state.signRequests.findIndex(
            (sr) => sameId(sr.id, broadcasted.id),
          );
          if (index !== -1) {
            state.signRequests = [
              ...state.signRequests.slice(0, index),
              {
                ...(broadcastedWithSeed as any),
              },
              ...state.signRequests.slice(index + 1),
            ];
          }
        });

        const sortedSignRequests = [...state.signRequests].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        state.signRequests = dedupeByIdPreserveOrder(sortedSignRequests);
      }
    });
    builder.addCase(addSignRequest.fulfilled, (state, action) => {
      if (action.payload) {
        action.payload.forEach((newSignRequest) => {
          const seed = state.seededSignersByRequestId?.[String(newSignRequest.id)];
          const index = state.signRequests.findIndex(
            (sr) => sameId(sr.id, newSignRequest.id),
          );

          if (index !== -1) {
            // Important: websocket updates may include richer fields (signers,
            // signatures, expirationDate, etc). Merge the full object so UI
            // reflects the latest server state without requiring a relogin.
            state.signRequests = state.signRequests.map((sr, i) => {
              if (i !== index) return sr;
              return applySeededSignersToRequest(
                mergeSignatureRequest(sr as any, newSignRequest as any),
                seed,
              );
            });
          } else {
            state.signRequests.push(
              applySeededSignersToRequest(newSignRequest as any, seed),
            );
          }
          const sortedSignRequests = [...state.signRequests].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          state.signRequests = dedupeByIdPreserveOrder(sortedSignRequests);
        });
      }
    });

    builder.addCase(addPendingSignRequest.fulfilled, (state, action) => {
      if (action.payload) {
        action.payload.forEach((newReq) => {
          const existing = state.userPendingSignatureRequest.find(
            (existingReq) => sameId(existingReq.id, newReq.id),
          );

          if (!existing) {
            state.userPendingSignatureRequest = [
              ...state.userPendingSignatureRequest,
              newReq,
            ];
          }
        });
      }
    });
    builder.addCase(resetPendingSignRequest.fulfilled, (state, action) => {
      state.userPendingSignatureRequest = [...action.payload];
    });
    builder.addCase(addBroadcastNotifications.fulfilled, (state, action) => {
      if (action.payload) {
        action.payload.forEach((notif) => {
          const exsisting = state.userNotifications.find(
            (exsistingNotif) =>
              sameId(exsistingNotif.signatureRequest.id, notif.signatureRequest.id),
          );
          if (!exsisting) {
            state.userNotifications = [...state.userNotifications, notif];
          }
        });
      }
    });

    builder.addCase(resetBroadcastNotifications.fulfilled, (state, action) => {
      state.userNotifications = [...action.payload];
    });

    builder.addCase(removeSignRequest.fulfilled, (state, action) => {
      state.signRequests = state.signRequests.filter(
        (item) => !sameId(item.id, action.payload),
      );
      if (state.seededSignersByRequestId) {
        delete state.seededSignersByRequestId[String(action.payload)];
      }
      state.signRequestCount = state.signRequests.length;
      state.success = true;
    });

    builder.addCase(notifySignRequest.fulfilled, (state, action) => {
      state.signRequestNotification = action.payload;
      state.success = action.payload;
    });
    builder.addCase(notifyBroadcastedTransaction.fulfilled, (state, action) => {
      state.broadcastNotification = action.payload;
      state.success = action.payload;
    });

    builder.addCase(setSignRequestCount.fulfilled, (state, action) => {
      state.signRequestCount += action.payload;
      state.newSignRequestCount = action.payload;
      state.success = true;
    });
    builder.addCase(setSignRequestCount.rejected, (state) => {
      state.signRequestCount = 0;
      state.success = false;
    });
    builder.addCase(setTwoFASigners.fulfilled, (state, action) => {
      state.twoFASigners = action.payload;
    });

    builder.addCase(setBotOtp.fulfilled, (state, action) => {
      let twoFASigners: TwoFACodes = state.twoFASigners
        ? { ...state.twoFASigners }
        : {};

      Object.keys(action.payload).forEach((botName) => {
        twoFASigners[botName] = action.payload[botName];
      });
      state.twoFASigners = { ...twoFASigners };
    });
    builder.addCase(
      setReceiveBroadcastNotificationsOn.fulfilled,
      (state, action) => {
        state.receiveBroadcastNotificationsOn = action.payload;
      },
    );
    builder.addCase(multisigSlice.actions.resetState, () => initialState);
  },
});

export const multisigReducer = multisigSlice.reducer;
export const multisigActions = multisigSlice.actions;
