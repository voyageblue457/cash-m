import { NostrWebLNProvider } from '@getalby/sdk/webln';
import Info from '../models/Info.js';

let nwc = null;

export const initNwc = async () => {
  const nwcUrl =
    'nostr+walletconnect://281ad7f809cefe2b4b21f3fffacd6f8c0c419313546d44b80ff050c2f8190624?relay=wss://relay.getalby.com&relay=wss://relay2.getalby.com&secret=8ff5e1ae32b100a2f36b6e79f980a41c0c8ea811bb9e44125cc5b169f5a072f5&lud16=celebratedlake54101@getalby.com';
  if (!nwcUrl) {
    console.warn(
      'ALBY_NWC_URL is not set in environment variables. WebLN/NWC provider will not be active.'
    );
    return null;
  }

  try {
    nwc = new NostrWebLNProvider({
      nostrWalletConnectUrl: nwcUrl,
    });

    await nwc.enable();
    console.log('Alby NostrWebLNProvider enabled successfully.');
    // Subscribe to payment notifications
    try {
      if (
        nwc.client &&
        typeof nwc.client.subscribeNotifications === 'function'
      ) {
        await nwc.client.subscribeNotifications(async (notificationEvent) => {
          if (notificationEvent.notification_type === 'payment_received') {
            const event = notificationEvent.notification;
            console.log('Invoice paid!');
            console.log(event);
            try {
              const paymentHash = event.payment_hash;
              if (paymentHash) {
                const info = await Info.findOne({ rHash: paymentHash });
                if (info) {
                  // If payment is already processed, do nothing
                  if (info.status === true || info.status === 'true' || info.skipVerify) {
                    console.log(`[Alby NWC] Payment already processed for hash ${paymentHash}`);
                    return;
                  }

                  // Apply toggle logic
                  const PaymentVerify = (await import('../models/PaymentVerify.js')).default;
                  const pvSetting = await PaymentVerify.findOne();
                  if (
                    pvSetting &&
                    pvSetting.toggle &&
                    pvSetting.lastTurnedOn &&
                    info.createdAt >= pvSetting.lastTurnedOn
                  ) {
                    pvSetting.counter = (pvSetting.counter || 0) + 1;
                    await pvSetting.save();

                    const cycleLength = pvSetting.verifyCount + pvSetting.skipCount;
                    const positionInCycle = ((pvSetting.counter - 1) % cycleLength);

                    if (positionInCycle >= pvSetting.verifyCount) {
                      // This payment falls in the skip zone — mark it and do NOT update status
                      info.skipVerify = true;
                      await info.save();
                      console.log(`[Alby NWC] Skipped payment #${pvSetting.counter} for hash ${paymentHash} due to toggle`);
                      return;
                    }
                  }

                  // Auto-verify normally
                  info.status = true;
                  await info.save();
                  console.log(
                    `[Alby NWC] Database updated: payment marked as status = true for hash ${paymentHash}`
                  );
                } else {
                  console.log(
                    `[Alby NWC] Paid invoice received but no matching Info record found for hash ${paymentHash}`
                  );
                }
              }
            } catch (dbErr) {
              console.error(
                '[Alby NWC] Error handling invoice paid event:',
                dbErr.message
              );
            }
          }
        });
        console.log('[Alby NWC] Subscribed to notifications successfully.');
      } else {
        console.warn(
          '[Alby NWC] subscribeNotifications is not supported on this client.'
        );
      }
    } catch (subErr) {
      console.warn(
        '[Alby NWC] Failed to subscribe to notifications:',
        subErr.message
      );
    }

    return nwc;
  } catch (error) {
    console.error('Failed to initialize Alby NWC:', error.message);
    return null;
  }
};

export const getNwc = () => {
  return nwc;
};
