import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
require('dotenv').config();

const jsonFetch = url => fetch(url).then(res => res.json());
const ethToUSD = async () => {
  const json = await jsonFetch(
    `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.etherscanAPIKey}`
  );
  return json.result.ethusd;
};

const web3 = new Web3(window.ethereum);
const eth = web3.eth;
const utils = web3.utils;

const addresses = {
  mkr: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
  pit: "0x69076e44a9C70a67D5b79d95795Aba299083c275",
  dai: "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359",
  pip: "0x729D19f657BD0614b4985Cf1D82531c67569197B",
  pep: "0x99041F808D598B782D5a3e498681C2452A31da08",
  tub: "0x448a5065aeBB8E423F0896E6c5D525C040f59af3",
  peth: "0xf53AD2c6851052A81B42133467480961B2321C09",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
};
window.addresses = addresses;

const tokenAbi = require("./abi/token.json");
const valueAbi = require("./abi/value.json");
const tubAbi = require("./abi/tub.json");
const dai = new eth.Contract(tokenAbi, addresses.dai);
const peth = new eth.Contract(tokenAbi, addresses.peth);
const mkr = new eth.Contract(tokenAbi, addresses.mkr);
const weth = new eth.Contract(tokenAbi, addresses.weth);
const ethUsd = new eth.Contract(valueAbi, addresses.pip);
const mkrUsd = new eth.Contract(valueAbi, addresses.pep);
const tub = new eth.Contract(tubAbi, addresses.tub);
window.dai = dai;
window.weth = weth;
window.tub = tub;
window.mkr = mkr;

class App extends Component {
  state = {
    lockedWeth: 0,
    daiSupply: 0,
    ethUSD: 0
  };

  componentDidMount() {
    this.getLockedWeth();
    this.getDaiSupply();
    this.getEthToUSD();
  }

  getLockedWeth = async () => {
    let lockedWeth = await tub.methods.pie().call();
    lockedWeth = utils.fromWei(lockedWeth);
    this.setState({ lockedWeth });
  };

  getDaiSupply = async () => {
    let daiSupply = await dai.methods.totalSupply().call();
    daiSupply = utils.fromWei(daiSupply);
    this.setState({
      daiSupply
    });
  };

  getEthToUSD = async() => {
    let ethUSD = await ethToUSD();
    this.setState({ ethUSD })
  }

  calculateCollatRatio = () => {
    const { lockedWeth, ethUSD, daiSupply } = this.state;
    const lockedWethInUSD = lockedWeth * ethUSD;
    return daiSupply / lockedWethInUSD;
  }

  render() {
    if(!this.state.ethUSD || !this.state.daiSupply || !this.state.lockedWeth){
      return (
        <div className="parent d-flex justify-content-center align-items-center">
          Loading...
        </div>
      )
    }

    let daiCircleSize = this.calculateCollatRatio();
    let daiCircleSizeVH = `${daiCircleSize / 90 * 10000}vh`;
    const daiCirclePosition = `${daiCircleSize / 90 * 10000 / 2}vh`;

    const collatCircleSizeVH = `${(daiCircleSize / 90) * 10000 * 1.5}vh`;
    const collatCirclePosition = `${((daiCircleSize / 90) * 10000) / 2 * 1.5}vh`;


    const ethCircleStyle = {
      height: "90vh",
      width: "90vh",
      borderRadius: "50%",
      boxShadow: "0 20px 50px rgba(59, 43, 91, 0.7)",
      background: "blue"
    }

    const daiCircleStyle = {
      height: daiCircleSizeVH,
      width: daiCircleSizeVH,
      borderRadius: "50%",
      background: "red",
      position: "absolute",
      top: `calc(50% - ${daiCirclePosition})`,
      left: `calc(50% - ${daiCirclePosition})`,
    }

    const collatCircleStyle = {
      height: collatCircleSizeVH,
      width: collatCircleSizeVH,
      borderRadius: "50%",
      border: "1px dashed white",
      position: "absolute",
      top: `calc(50% - ${collatCirclePosition})`,
      left: `calc(50% - ${collatCirclePosition})`
    };

    return (
      <div className="parent d-flex flex-column justify-content-center align-items-center">
        <div className="position-relative">
          <div style={ethCircleStyle}/>
          <div style={daiCircleStyle}/>
          <div style={collatCircleStyle}/>
        </div>
      </div>
    );
  }
}

export default App;
