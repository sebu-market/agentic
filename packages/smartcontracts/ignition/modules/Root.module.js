const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const {network} = require("hardhat");
const settings = require("../../src/");


const deploySebuMaster = (meta) => {
  const con = meta.builder.contract("SebuMaster", [
    meta.configSettings.pitchFee,
    meta.configSettings.investmentToken,
    meta.configSettings.guardian,
    meta.configSettings.shepard
  ]);
  meta.sebu = con;
  return meta;
}

const deployPortfolio = (meta) => {
  const con = meta.builder.contract("Portfolio", [
    meta.commonConfig.lpTokenName,
    meta.commonConfig.lpTokenSymbol,
    meta.sebu
  ]);
  meta.portfolio = con;
  return meta;
}

const deployFunding = (meta) => {
  const con = meta.builder.contract("Funding", [
    meta.sebu
  ]);
  meta.funding = con;
  return meta;
}

module.exports = buildModule("RootDeploymentModule", (m) => {

  const {deployment} = settings;

  const chainId = network.config.chainId || deployment.ChainIds.LocalTestnet;
  const cfg = deployment.DeploymentSettings[chainId];
  if(!cfg) throw new Error(`No deployment settings for chainId ${chainId}`);
  let metadata = {
    builder: m,
    configSettings: cfg,
    commonConfig: deployment.DeploymentSettings.common
  }

  metadata = deploySebuMaster(metadata);
  metadata = deployPortfolio(metadata);
  metadata = deployFunding(metadata);

});
