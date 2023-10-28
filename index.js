const Arweave = require("arweave");
const crypto = require("crypto");

module.exports = {
  id: "arweave",

  setup: async () => {
    const arweave = Arweave.init();
    return {
      async verifySignature(signerPublickey, message, signature) {
        const dataToVerify = new TextEncoder().encode(message);
        const binarySignature = b64UrlToBuffer(signature);
        const hash = await crypto.subtle.digest("SHA-256", dataToVerify);

        const publicJWK = {
          e: "AQAB",
          ext: true,
          kty: "RSA",
          n: signerPublickey,
        };

        const cryptoKey = await crypto.subtle.importKey(
          "jwk",
          publicJWK,
          {
            name: "RSA-PSS",
            hash: "SHA-256",
          },
          false,
          ["verify"]
        );

        const result = await crypto.subtle.verify(
          { name: "RSA-PSS", saltLength: 32 },
          cryptoKey,
          binarySignature,
          hash
        );

        return result;
      },
      async readTxById(id) {
        try {
          const getTx = await (
            await fetch(global.config.gateways.arweaveGateway + "/tx/" + id)
          ).json();

          return {
            coin: "AR",
            amount: getTx.quantity,
            from: await arweave.wallets.ownerToAddress(getTx.owner),
            to: getTx.target,
          };
        } catch (e) {
          return null;
        }
      },
    };
  },
};

const b64UrlToBuffer = (b64Url) =>
  new Uint8Array(
    atob(b64Url.replace(/-/g, "+").replace(/_/g, "/"))
      .split("")
      .map((c) => c.charCodeAt(0))
  ).buffer;
