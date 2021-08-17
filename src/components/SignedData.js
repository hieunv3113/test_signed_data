import { useState, useEffect } from "react";
import { Container, Button, FormControl } from "@material-ui/core";
import Web3 from "web3";
import { splitSignature } from "@ethersproject/bytes";
import { useWeb3React } from "@web3-react/core";
import { ABI_CRAFTING, ABI_DELIVERY } from "../abi";

const DELIVERY_ADDRESS = "0x707560C300197636F91DB136a044C76E542d37E3";
const CRAFTING_ADDRESS = "0x5e1E8ef483F6f6a5BfD30D627060f4De319A5723";
const KAWAIICORE_ADDRESS = "0x727370737F5fE7869180999bc6e792a9899DB15F";

const name = "KawaiiCrafting";
const CHAIN_ID = 97;
const RPC_URL_97 = "https://data-seed-prebsc-1-s2.binance.org:8545";
const account = "0x08aB6eA3951650F973dF9dF4ABA1a3a7bB18660E";
const privateKey =
  "55f5f2ee49da244087d94642dce9bf4341ec17e1d8c5dd590ca8c847329f0fa7";

const SignedData = () => {
  const [adminSignedData, setAdminSignedData] = useState("");
  const [adminSignedDataDelivery, setAdminSignedDataDelivery] = useState("");
  const { library } = useWeb3React();

  const read = async (method, address, abi, params) => {
    const web3 = new Web3(RPC_URL_97);
    const contract = new web3.eth.Contract(abi, address);
    const res = await contract.methods[method](...params).call();
    return res;
  };

  const write = async (
    method,
    provider,
    address,
    abi,
    account,
    params,
    callback,
    value = 0
  ) => {
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(abi, address);
    let response, sendObj;
    if (value > 0) sendObj = { from: account, value: value };
    else sendObj = { from: account };
    await contract.methods[method](...params)
      .send(sendObj)
      .on("transactionHash", (hash) => {
        if (callback) {
          callback(hash);
        }
      })
      .on("receipt", (receipt) => {
        response = receipt;
      });
    return response;
  };

  const handleAdminSignedCrafting = async () => {
    const callFunctionId = "0x8e6ac8f6";
    const web3 = new Web3(RPC_URL_97);
    let encodehash = await web3.utils.soliditySha3(
      await web3.eth.abi.encodeParameters(
        [
          "address",
          "bytes4",
          "address",
          "uint256[]",
          "uint256[]",
          "uint256",
          "uint256",
        ],
        [
          CRAFTING_ADDRESS,
          callFunctionId,
          KAWAIICORE_ADDRESS,
          ["1"],
          [5],
          web3.utils.toWei("800000", "ether"),
          5,
        ]
      )
    );

    const sign = await web3.eth.accounts.sign(encodehash, privateKey);

    const res = await web3.eth.abi.encodeParameters(
      ["uint8", "bytes32", "bytes32"],
      [sign.v, sign.r, sign.s]
    );
    console.log(res);
    setAdminSignedData(res);
  };

  const handleUserSignedCrafting = async () => {
    const nonce = await read("nonces", CRAFTING_ADDRESS, ABI_CRAFTING, [
      account,
    ]);
    const web3 = new Web3(RPC_URL_97);
    const msgParams = JSON.stringify({
      domain: {
        chainId: CHAIN_ID,
        name,
        verifyingContract: CRAFTING_ADDRESS,
        version: "1",
      },
      message: {
        adminSignedData,
        nonce,
      },
      primaryType: "Data",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Data: [
          { name: "adminSignedData", type: "bytes" },
          { name: "nonce", type: "uint256" },
        ],
      },
    });

    var params = [account, msgParams];
    var method = "eth_signTypedData_v4";

    const res = await library.provider.send(method, params);
    const sign = splitSignature(res.result);
    await write(
      "craftingItem",
      library.provider,
      CRAFTING_ADDRESS,
      ABI_CRAFTING,
      account,
      [
        KAWAIICORE_ADDRESS,
        ["1"],
        [5],
        web3.utils.toWei("800000", "ether"),
        5,
        account,
        adminSignedData,
        sign.v,
        sign.r,
        sign.s,
      ],
      (hash) => console.log(hash)
    );
  };

  const handleAdminSignedDelivery = async () => {
    let callFunctionId = "0x95ad16cf";

    const web3 = new Web3(RPC_URL_97);

    let encodehash = await web3.utils.soliditySha3(
      await web3.eth.abi.encodeParameters(
        [
          "address",
          "bytes4",
          "address",
          "uint256[]",
          "uint256[]",
          "uint256[]",
          "uint256",
        ],
        [
          DELIVERY_ADDRESS,
          callFunctionId,
          KAWAIICORE_ADDRESS,
          ["1"],
          [10],
          [1000],
          5,
        ]
      )
    );

    const sign = await web3.eth.accounts.sign(encodehash, privateKey);

    const res = await web3.eth.abi.encodeParameters(
      ["uint8", "bytes32", "bytes32"],
      [sign.v, sign.r, sign.s]
    );
    setAdminSignedDataDelivery(res);
  };

  const handleUserSignedDelivery = async () => {
    const nonce = await read("nonces", DELIVERY_ADDRESS, ABI_DELIVERY, [
      account,
    ]);
    const web3 = new Web3(RPC_URL_97);
    const msgParams = JSON.stringify({
      domain: {
        chainId: CHAIN_ID,
        name: "KawaiiDelivery",
        verifyingContract: DELIVERY_ADDRESS,
        version: "1",
      },
      message: {
        adminSignedData: adminSignedDataDelivery,
        nonce,
      },
      primaryType: "Data",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Data: [
          { name: "adminSignedData", type: "bytes" },
          { name: "nonce", type: "uint256" },
        ],
      },
    });

    var params = [account, msgParams];
    var method = "eth_signTypedData_v4";

    const res = await library.provider.send(method, params);
    const sign = splitSignature(res.result);
    await write(
      "delivery",
      library.provider,
      DELIVERY_ADDRESS,
      ABI_DELIVERY,
      account,
      [
        KAWAIICORE_ADDRESS,
        ["1"],
        [10],
        [1000],
        5,
        account,
        adminSignedDataDelivery,
        sign.v,
        sign.r,
        sign.s,
      ],
      (hash) => console.log(hash)
    );
  };

  return (
    <div>
      <div>
        <div style={{ marginBottom: 50 }}>Crafting</div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdminSignedCrafting}
        >
          Admin signed
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUserSignedCrafting}
          style={{ marginLeft: 50 }}
        >
          Signed and Crafting Item
        </Button>
      </div>
      <div style={{ marginTop: 50 }}>
        <div style={{ marginBottom: 50 }}>Delivery</div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdminSignedDelivery}
        >
          Admin signed
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUserSignedDelivery}
          style={{ marginLeft: 50 }}
        >
          Signed and Delivery
        </Button>
      </div>
    </div>
  );
};

export default SignedData;
