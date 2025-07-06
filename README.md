# secure-chain-message

## Tutorial

### 1. Introduction

This tutorial will show you how to use the NEAR Blockchain and build smart contracts using Golang. It also briefly explains WEB3 technology and how to build on NEAR.

To speed up development, install the near-go CLI tool. This tool lets you quickly create, build, test, and deploy smart contracts, call contract functions, and import your NEAR account into the CLI.

```bash
curl -LO https://github.com/vlmoon99/near-cli-go/releases/latest/download/install.sh && bash install.sh && rm install.sh
```

Check your installation with:

```bash
near-go help
```

After installing near-go CLI, you can reproduce all files from [this repo](https://github.com/vlmoon99/secure-chain-message).

---

### 2. Smart Contract Creation

#### Step 1: Create a New Smart Contract Project

Run the following command to create a new smart contract folder:

```bash
near-go create -p "secure-chain-message" -m "secure-chain-message" -t "smart-contract-empty"
```

Where:
- `-p` is the project name
- `-m` is the Go module name
- `-t` is the project template

After running the command, your contract files will be in the `contract` directory:

```bash
secure-chain-message/contract$ ls
go.mod  go.sum  main.go
```

**Tip:**  
Before deleting or changing anything, read through `main.go`. The template introduces NEAR Blockchain features, such as working with data, payments, and transaction context.

#### Step 2: Replace the Contract Code

Replace the contents of `main.go` with the following code:

```go
package main

import (
    "sync"

    "github.com/vlmoon99/near-sdk-go/collections"
    contractBuilder "github.com/vlmoon99/near-sdk-go/contract"
    "github.com/vlmoon99/near-sdk-go/json"
)

var (
    contractInstance interface{}
    contractOnce     sync.Once
)

type SecureChainMessageState struct {
    messages *collections.UnorderedMap[string, string]
}

func NewSecureChainMessageState() *SecureChainMessageState {
    return &SecureChainMessageState{
        messages: collections.NewUnorderedMap[string, string]("secure_chain_msg"),
    }
}

type SecureChainMessageContract struct {
    state *SecureChainMessageState
}

func NewSecureChainMessageContract() *SecureChainMessageContract {
    return &SecureChainMessageContract{
        state: NewSecureChainMessageState(),
    }
}

func GetContract() interface{} {
    contractOnce.Do(func() {
        if contractInstance == nil {
            contractInstance = NewSecureChainMessageContract()
        }
    })
    return contractInstance
}

const (
    KeyInput     = "key"
    MessageInput = "msg"
)

//go:export CreateMsg
func CreateMsg() {
    contractBuilder.HandleClientJSONInput(func(input *contractBuilder.ContractInput) error {
        msg, err := input.JSON.GetString(MessageInput)
        if err != nil {
            return err
        }

        key, err := input.JSON.GetString(KeyInput)
        if err != nil {
            return err
        }

        contract := GetContract().(*SecureChainMessageContract)

        if err := contract.state.messages.Insert(key, msg); err != nil {
            return err
        }

        contractBuilder.ReturnValue("Msg was created successfully")
        return nil
    })
}

//go:export GetMsg
func GetMsg() {
    contractBuilder.HandleClientJSONInput(func(input *contractBuilder.ContractInput) error {
        key, err := input.JSON.GetString(KeyInput)
        if err != nil {
            return err
        }

        contract := GetContract().(*SecureChainMessageContract)

        msg, err := contract.state.messages.Get(key)
        if err != nil {
            msg = "Error getting message: " + err.Error()
        }

        builder := json.NewBuilder()
        builder.AddString("result", msg)

        contractBuilder.ReturnValue(builder.Build())

        return nil
    })
}
```

This contract stores encrypted messages on the blockchain, using the sender's public key as the identifier. Only someone with the correct private key can decrypt the message.  
**Note:** The contract itself does not perform encryption or decryption—this is handled on the client side.

- All functions with `//go:export` are available to call from your app.
- Always use collections from `github.com/vlmoon99/near-sdk-go/collections` or low-level storage for persistent data.
- Each 100kb of storage costs about 1 NEAR (~$2).

#### Step 3: Build the Smart Contract

To build your smart contract, run:

```bash
near-go build
```

#### Step 4: Create and Import Your NEAR Account

1. Go to [Meteor Wallet](https://wallet.meteorwallet.app/add_wallet/create_new) and create a testnet or mainnet account.
2. Import your account into the CLI:

```bash
near-go account import
```

Follow the prompts to enter your seed phrase and account details.

#### Step 5: Deploy the Smart Contract

Deploy your contract to testnet or mainnet:

```bash
near-go deploy -id "your-created-account.testnet" -n "testnet"
# or for mainnet
near-go deploy -id "your-created-account.near" -n "mainnet"
```

After deployment, you will see a transaction hash in the console.  
You can use this hash to view transaction details on [NEAR Explorer (mainnet)](https://nearblocks.io/) or [NEAR Explorer (testnet)](https://testnet.nearblocks.io/).  
These explorers show all transaction details, gas costs, and more.

---

### 3. Client Creation

The client is a React app.

#### Step 1: Install Dependencies

Install the required package:

```bash
yarn add @hot-labs/near-connect
# or
npm i @hot-labs/near-connect
```

This package lets you log in/out of NEAR, and sign/send transactions.

---

#### Step 2: Wallet Connection

Example logic for connecting a wallet:

```js
const selector = new WalletSelector({ network: "mainnet" }); 
const modal = new WalletSelectorUI(selector);

const [loading, setLoading] = useState(false);

useEffect(() => {
  selector.on("wallet:signIn", async (t) => {
    const w = await selector.wallet();
    onWalletChange(w);
    onUserChange({ accountId: t.accounts[0].accountId, isConnected: true });
  });
  selector.on("wallet:signOut", () => {
    onWalletChange(null);
    onUserChange(null);
  });
  selector.wallet().then((wallet) => {
    wallet.getAccounts().then((t) => {
      onWalletChange(wallet);
      onUserChange({ accountId: t[0].accountId, isConnected: true });
    });
  });
}, []);

const connect = async () => {
  setLoading(true);
  if (wallet) await selector.disconnect();
  else await modal.open();
  setLoading(false);
};

const disconnect = async () => {
  setLoading(true);
  await selector.disconnect();
  setLoading(false);
};
```

After connecting, you can use the wallet to interact with your smart contract.

---

#### Step 3: Creating a Secure Message

```js
const [message, setMessage] = useState('');
const [isCreating, setIsCreating] = useState(false);
const [result, setResult] = useState<{ encodedText: string; transactionHash: string } | null>(null);

const handleCreateMessage = async () => {
  if (!message.trim() || !wallet) return;
  setIsCreating(true);
  try {
    const keyPair: KeyPair = generate_keypair();
    const encrypted = encrypt_message(keyPair.public_key, message);
    const res = await wallet.signAndSendTransactions({
      transactions: [{
        receiverId: "securechainmsg.near",
        actions: [{
          type: "FunctionCall",
          params: {
            methodName: "CreateMsg",
            args: { key: keyPair.public_key, msg: encrypted },
            gas: "30000000000000",
            deposit: "1",
          },
        }],
      }],
    });
    if (res) {
      const data = JSON.stringify({ public_key: keyPair.public_key, private_key: keyPair.private_key });
      let msgEncoded = bs58.encode(new TextEncoder().encode(data));
      setResult({
        encodedText: msgEncoded,
        transactionHash: res[0].transaction.hash,
      });
    }
  } finally {
    setIsCreating(false);
  }
};
```

Here, your message is encrypted using your cryptography project, then sent to the blockchain.  
After creation, you get an encoded string containing both the public and private key.  
**Save this code**—you'll need it to read the message later or share it with others.

---

#### Step 4: Reading a Secure Message

```js
const [code, setCode] = useState('');
const [isReading, setIsReading] = useState(false);
const [result, setResult] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);

const handleReadMessage = async () => {
  if (!code.trim()) return;

  setIsReading(true);
  setError(null);
  const json = new TextDecoder().decode(bs58.decode(code));
  let { public_key, private_key } = JSON.parse(json);

  if (!public_key || !private_key) {
    setError('Invalid decryption code format');
    setIsReading(false);
    return;
  }

  try {
    const res = await wallet?.signAndSendTransactions({
      transactions: [{
        receiverId: "securechainmsg.near",
        actions: [{
          type: "FunctionCall",
          params: {
            methodName: "GetMsg",
            args: { key: public_key },
            gas: "30000000000000",
            deposit: "1",
          },
        }],
      }],
    });

    if (res) {
      let base64Msg = res[0].status.SuccessValue;
      let json = JSON.parse(atob(base64Msg));
      let decryptedResult = decrypt_message(private_key, json.result);
      setResult(decryptedResult);
    }
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setIsReading(false);
  }
};
```

**How it works:**  
1. Decode the code to get the public and private keys.
2. Use the public key to fetch the encrypted message from the blockchain.
3. Decrypt the message with the private key and display it.

---

### 4. Additional Resources

- [near-sdk-go](https://github.com/vlmoon99/near-sdk-go)
- [near-cli-go](https://github.com/vlmoon99/near-cli-go)
- [NEAR Go Smart Contracts Quickstart](https://docs.near.org/smart-contracts/quickstart?code-tabs=go)
- [NEAR Protocol Basics](https://docs.near.org/protocol/basics)
- [NEAR Account Model](https://docs.near.org/protocol/account-model)
- [NEAR Transactions](https://docs.near.org/protocol/transactions)
