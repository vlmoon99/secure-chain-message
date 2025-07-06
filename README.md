secure-chain-message

Tutorial :

1.Intro

This tutorial will show u how to use Near Blokchain, how to build smart contracts using Golang. Also this tutorial will explain briefly about WEB3 technology, and how build on Near Blockchain.

In order to speed up our dev process u will need to install near-go CLI tool , which will provided to u 1.fast samrt contract project creation, 2.building smart contract, 3.testing smart contract , 4.deploying smart contract, 5.Call smart contract function , 6.import your near account into cli .

```bash
curl -LO https://github.com/vlmoon99/near-cli-go/releases/latest/download/install.sh && bash install.sh && rm install.sh
```
Check your instalation using near-go help cmd in the terminal.

After u installed near-go CLI - u alredy be able ro reproduce all files which is inside https://github.com/vlmoon99/secure-chain-message .


2.Smart Contract creation

For smart contract folder creation use :

```bash
near-go create -p "test1" -m "test1" -t "smart-contract-empty"
```

Where -p - project , -m - go module , -t - type of the project template.

In case of this app  our command will looks like :

```bash
near-go create -p "secure-chain-message" -m "secure-chain-message" -t "smart-contract-empty"
```

After execution we will have our samrt contract inside main.go :

```bash
secure-chain-message/contract$ ls
go.mod  go.sum  main.go
```

It's higly recomded to read main.go before u will delete all this code, inside main.go I created the template which can introduce u into Near Blockchain functiality quielcky + show how it work on the low level, this tempalte will show u how u can work with Write/Read Data , Accept Payments, Read incomming Transaction data contex (how much deposit user is attached, how much gases is used, which input user gave to u and which type , your client public key , and another helpful things).

After u read main.go - delete all code and paste this code :

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

This code wiil be store on the blockchain, all functions with "//go:export" compiler directive will be exposed to your clients. It's not recommendede to save state inside variables insdie your code , for all state which u wanna saved into blockchain it's highly recomenede to use import : "github.com/vlmoon99/near-sdk-go/collections" and all collections from there , or use low-level method using import "github.com/vlmoon99/near-sdk-go/env" and env.StorageRead/env.StorageWrite functions . All this methods will provides u an option to write data on chain, each 100kb cost 1 NEAR token (Ⓝ) ~ 2$ .

In order to handle user input/output in the easeiest way - u need to use import - contractBuilder "github.com/vlmoon99/near-sdk-go/contract" ,  using HandleClientJSONInput - u can handle user inut in json format , automaticly parse it , and get the nessesary data insdie your code , after u proceed the information read nad write data  - u can send the return data to the user using contractBuilder.ReturnValue , this function will take your output, convert it into bytes using "github.com/vlmoon99/near-sdk-go/borsh" pacakge and send it to the client.

3.Client creation 

Tell how use wallet selector from hot dao , sign and send tx .

4.Additonal thoughts , resources to read, topic to discover

Give links to the Near docs, create some type of the roadmap for interested person, give links on the sdk's,
group for the developers, for the client , etc ...
