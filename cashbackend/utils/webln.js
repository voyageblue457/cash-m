import { NostrWebLNProvider } from '@getalby/sdk/webln';
import Info from '../models/Info.js';

let nwc = null;
let nwc2 = null;

// Helper to subscribe a provider to payment_received notification
const subscribeProviderNotifications = async (provider, providerName) => {
  try {
    if (
      provider.client &&
      typeof provider.client.subscribeNotifications === 'function'
    ) {
      await provider.client.subscribeNotifications(async (notificationEvent) => {
        if (notificationEvent.notification_type === 'payment_received') {
          const event = notificationEvent.notification;
          console.log(`[${providerName}] Invoice paid!`);
          console.log(event);
          try {
            const paymentHash = event.payment_hash;
            if (paymentHash) {
              const info = await Info.findOne({ rHash: paymentHash });
              if (info) {
                // If payment is already processed or marked as skipVerify, do nothing
                if (info.status === true || info.status === 'true' || info.skipVerify) {
                  console.log(`[${providerName}] Payment already processed or skipped for hash ${paymentHash}`);
                  return;
                }
                // Increment verify counter if toggle is ON
                try {
                  const PaymentVerify = (await import('../models/PaymentVerify.js')).default;
                  const pvSetting = await PaymentVerify.findOne();
                  if (
                    pvSetting &&
                    pvSetting.toggle &&
                    pvSetting.lastTurnedOn &&
                    info.createdAt >= pvSetting.lastTurnedOn
                  ) {
                    pvSetting.counter = (pvSetting.counter || 0) + 1;
                    if (pvSetting.counter >= pvSetting.verifyCount) {
                      pvSetting.inSkipMode = true;
                      console.log(`[PaymentVerifyToggle] (Webhook) Counter reached verifyCount (${pvSetting.verifyCount}). Switching to skip mode.`);
                    }
                    await pvSetting.save();
                    console.log(`[PaymentVerifyToggle] (Webhook) Incremented counter to ${pvSetting.counter} for verified payment ${info._id}`);
                  }
                } catch (tErr) {
                  console.error(`[${providerName}] Error updating PaymentVerify counter in webhook:`, tErr.message);
                }

                info.status = true;
                await info.save();
                console.log(
                  `[${providerName}] Database updated: payment marked as status = true for hash ${paymentHash}`
                );
              } else {
                console.log(
                  `[${providerName}] Paid invoice received but no matching Info record found for hash ${paymentHash}`
                );
              }
            }
          } catch (dbErr) {
            console.error(
              `[${providerName}] Error updating database on invoice paid event:`,
              dbErr.message
            );
          }
        }
      });
      console.log(`[${providerName}] Subscribed to notifications successfully.`);
    } else {
      console.warn(
        `[${providerName}] subscribeNotifications is not supported on this client.`
      );
    }
  } catch (subErr) {
    console.warn(
      `[${providerName}] Failed to subscribe to notifications:`,
      subErr.message
    );
  }
};

export const initNwc = async () => {
  const nwcUrl = 'nostr+walletconnect://281ad7f809cefe2b4b21f3fffacd6f8c0c419313546d44b80ff050c2f8190624?relay=wss://relay.getalby.com&relay=wss://relay2.getalby.com&secret=8ff5e1ae32b100a2f36b6e79f980a41c0c8ea811bb9e44125cc5b169f5a072f5&lud16=celebratedlake54101@getalby.com';

  if (nwcUrl) {
    try {
      nwc = new NostrWebLNProvider({
        nostrWalletConnectUrl: nwcUrl,
      });
      await nwc.enable();
      console.log('Alby NostrWebLNProvider enabled successfully.');
      await subscribeProviderNotifications(nwc, 'Alby NWC 1');
    } catch (error) {
      console.error('Failed to initialize Alby NWC 1:', error.message);
    }
  }

  const nwcUrl2 = 'nostr+walletconnect://3a6f486c4e03aee41330ea1f6826943d8e350630439d5cc6ff84447210620f6b?relay=wss://relay.getalby.com&relay=wss://relay2.getalby.com&secret=633a24fb39839734b9d377fdadb5aea1dcae121c1c62e35744474c2fab2ed860&lud16=goldenacai479786@getalby.com';
  if (nwcUrl2) {
    try {
      nwc2 = new NostrWebLNProvider({
        nostrWalletConnectUrl: nwcUrl2,
      });
      await nwc2.enable();
      console.log('Alby NostrWebLNProvider 2 enabled successfully.');
      // Notification subscription removed for nwc2 as requested
    } catch (error) {
      console.error('Failed to initialize Alby NWC 2:', error.message);
    }
  }

  return { nwc, nwc2 };
};

export const getNwc = () => {
  return nwc;
};

export const getNwc2 = () => {
  return nwc2;
};
