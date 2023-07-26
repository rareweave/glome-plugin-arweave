const Arweave = require("arweave");

module.exports = {
  id: "arweave",

  setup: async () => {
    const arweave = Arweave.init();
    return {
      async readTxById(id) {
        try {
          const getTx = await (await fetch(global.config.gateways.arweaveGateway + "/tx/" + id)).json();

          return {
            coin: "AR",
            amount: getTx.quantity,
            from: await arweave.wallets.ownerToAddress(getTx.owner),
            to: getTx.target,
          };
          
        } catch (e) {
          return null
        }
      },
    };
  },
};
