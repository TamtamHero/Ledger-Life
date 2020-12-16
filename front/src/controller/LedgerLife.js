import Web3 from "web3";
import TruffleContract from "truffle-contract";
import LedgerLifeArtifact from "../contracts/LedgerLife.json";

class LedgerLife {
  constructor() {
    this.connected = false;
    this.busy = false;
    this.web3Provider = null;
    this.web3 = null;
    this.contracts = {};
    this.contractsInstances = {};
    this.playerID = null;
  }

  async connect() {
    if (!this.connected) {
      if (window.ethereum) {
        this.web3Provider = window.ethereum;
        try {
          // Request account access
          this.account = await this.web3Provider.request({
            method: "eth_requestAccounts",
            params: [],
          });
        } catch (error) {
          // User denied account access...
          console.error("User denied account access");
        }
        this.web3 = new Web3(this.web3Provider);
        this.connected = true;
        console.log(`connected: ${this.account} ${typeof this.account}`);
        await this.initContract();
      }
    }
  }

  async initContract() {
    this.contracts.LedgerLife = TruffleContract(LedgerLifeArtifact);
    this.contracts.LedgerLife.setProvider(this.web3Provider);
    console.log("contract initialized");
    await this.deployContract();
  }

  async deployContract() {
    this.contractsInstances.LedgerLife = await this.contracts.LedgerLife.deployed();
    this.contractDeployed = true;
    console.log("contract deployed");
  }

  async getGrid() {
    let grid = await this.contractsInstances.LedgerLife.getGrid.call();
    grid = grid.map(playerID => playerID.toString());
    return grid;
  }

  async getPlayers() {
    return await this.contractsInstances.LedgerLife.getPlayers.call();
  }

  _serializeCellsArray(cellsArray) {
    let serialized = new Web3.utils.BN(0);
    cellsArray.forEach((cell) => {
      if (cell < 0 || cell >= 32 * 32) {
        throw new Error(`cell index ${cell} is too high`);
      }
      console.log(cell);
      serialized = serialized.mul(new Web3.utils.BN(2 ** 12));
      console.log(serialized.toString(2));
      serialized = serialized.add(new Web3.utils.BN(cell));
      console.log(serialized.toString(2));
    });
    console.log(serialized.toString(2));
    console.log(serialized.toString(16));
    return "0x" + serialized.toString(16);
  }

  async _getFreeID() {
    let players = await this.getPlayers();
    for (const [index, player] of players.entries()) {
      if (index !== 0 && player[0] === "0x0000000000000000000000000000000000000000") {
        return index;
      }
    }
    throw new Error("No player slot available")
  }

  async buyCells(cells) {
    let playerID = this.playerID;
    if (playerID === null) {
      playerID = await this._getFreeID();
    }
    console.log(`playerID: ${playerID}`);
    let serializedCells = this._serializeCellsArray(cells);
    console.log(serializedCells);
    let cellCount = cells.length;
    let instance = await this.contracts.LedgerLife.deployed();
    let accounts = await this.web3.eth.getAccounts();
    console.log(`Buy ${cellCount} cells at index ${cells} as player ${playerID}`);
    await instance.buyCells(serializedCells, cellCount, playerID, {
      from: accounts[0],
    });
    this.playerID = playerID;
  }

  async life() {
    let instance = await this.contracts.LedgerLife.deployed();
    let accounts = await this.web3.eth.getAccounts();
    return await instance.life({
      from: accounts[0],
    });
  }
}

export default LedgerLife;
