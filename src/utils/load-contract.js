import contract from "@truffle/contract";

export const loadContract = async (name, provider) => {
  const Artifact = await getContractArtifact(name);
  let deployedContract = null;

  if (Artifact) {
    const _contract = contract(Artifact);
    _contract.setProvider(provider);

    try {
      deployedContract = await _contract.deployed();
    } catch (error) {
      console.warn("Yoe are connected to the wrong network");
    }
  }
  return deployedContract;
};

const getContractArtifact = async (name) => {
  let Artifact = null;

  try {
    const res = await fetch(`/contracts/${name}.json`);
    Artifact = await res.json();
  } catch (error) {
    console.warn("There is no such contract");
  }

  return Artifact;
};
