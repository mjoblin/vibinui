import { Draft } from "immer";
import get from "lodash/get";
import set from "lodash/set";

type ComparablePayloadChunk = Draft<{ [key: number | string]: string }> | Map<any, any>;

/**
 * Compare the provided Draft object o1 with the provided o2. Return true if they appear to be
 * identical.
 *
 * Warning: This uses JSON.stringify() on the two inputs to determine equivalence, which can in
 * some situations return false negatives (say if the object key order has changed).
 */
export const quickObjectMatch = (o1: ComparablePayloadChunk, o2: ComparablePayloadChunk): boolean =>
    JSON.stringify(o1) === JSON.stringify(o2);

/**
 * Only update the given Redux state if the newPayload is different from what's already in the
 * current state (under the stateKey key).
 *
 * Note: It's OK to update the provided Redux state because RTK has wrapped it with immer:
 *  https://redux-toolkit.js.org/usage/immer-reducers#redux-toolkit-and-immer
 *
 * ------------------------------------------------------------------------------------------------
 * Why this function exists:
 *
 * This function exists for use by the reducers handling actions resulting from websocket messages
 * received from the back-end.
 *
 * Normally a Redux action is expected to update state with its payload. However, the Vibin UI
 * receives a lot of websocket messages from the back-end which contain unchanged information.
 * Since these websocket messages are used to update Redux state via actions (see
 * app/services/vibinWebsocket.ts), the action reducers want to check that their action payloads
 * are actually new/different before updating state. That check is performed by this function.
 *
 * This check ensures that the Redux state will only be updated when a true data change is received
 * from the back-end, which in turn minimizes redundant component renders.
 * ------------------------------------------------------------------------------------------------
 *
 * @param state Redux state (note: this is assumed to be wrapped by Immer)
 * @param stateKey The key to update (e.g. "someKey" or "parent.someKey")
 * @param newPayload The new payload to compare and (possibly) use to update state
 */
export const updateIfDifferent = (state: any, stateKey: any, newPayload: any) =>
    !quickObjectMatch(get(state, stateKey), newPayload) && set(state, stateKey, newPayload);
